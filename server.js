require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;
const RIOT_KEY = process.env.RIOT_API_KEY;

if (!RIOT_KEY) {
  console.error('RIOT_API_KEY가 설정되어 있지 않습니다. 환경변수에 키를 넣어주세요.');
  process.exit(1);
}

// 간단한 보안: 허용되는 플랫폼/엔드포인트 패턴만 프록시
const ALLOWED_PLATFORMS = ['kr', 'na1', 'euw1', 'eun1', 'asia', 'americas', 'europe'];

// 간단한 인메모리 캐시 (Key: URL, Value: { data, timestamp })
const requestCache = new Map();
const CACHE_DURATION = 60 * 1000; // 1분 캐시 (필요에 따라 조정)

// 헬스체크
app.get('/', (req, res) => res.send('ok'));

// 기존 문제 라우트 대신 prefix 방식 사용
app.use('/api/riot/:platform', async (req, res) => {
  try {
    const platform = req.params.platform;
    if (!ALLOWED_PLATFORMS.includes(platform)) return res.status(400).json({ error: 'invalid platform' });

    // 원본 요청 URL에서 프리픽스 뒤의 나머지 경로를 추출
    const prefix = `/api/riot/${platform}/`;
    const original = req.originalUrl || req.url;
    const path = original.startsWith(prefix) ? original.slice(prefix.length) : '';
    if (!path) return res.status(400).json({ error: 'missing path' });

    // 캐시 키 생성 (쿼리 파라미터 포함)
    const cacheKey = `${platform}:${path}:${JSON.stringify(req.query)}`;

    // 1. 캐시 확인
    if (requestCache.has(cacheKey)) {
      const { data, timestamp } = requestCache.get(cacheKey);
      if (Date.now() - timestamp < CACHE_DURATION) {
        console.log(`[CACHE HIT] ${platform} ${path}`);
        return res.json(data);
      } else {
        requestCache.delete(cacheKey); // 만료된 캐시 삭제
      }
    }

    console.log(`[API REQ] ${platform} ${path}`);
    const url = `https://${platform}.api.riotgames.com/${encodeURI(path)}`;
    const resp = await axios.get(url, {
      headers: { 'X-Riot-Token': RIOT_KEY },
      params: req.query,
      timeout: 10000
    });

    // 2. 응답 캐싱
    requestCache.set(cacheKey, { data: resp.data, timestamp: Date.now() });

    res.status(resp.status).json(resp.data);
  } catch (err) {
    console.error(`[ERROR] ${req.originalUrl}:`, err.message);
    if (err && err.response) {
      res.status(err.response.status).json({ error: err.response.data });
    } else {
      res.status(500).json({ error: 'proxy error' });
    }
  }
});

app.listen(PORT, () => console.log(`Riot proxy running on http://localhost:${PORT}`));
