require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const RIOT_KEY = process.env.RIOT_API_KEY;

if (!RIOT_KEY) {
  console.error('RIOT_API_KEY가 설정되어 있지 않습니다. 환경변수에 키를 넣어주세요.');
  process.exit(1);
}

// 간단한 보안: 허용되는 플랫폼/엔드포인트 패턴만 프록시
// TFT API는 지역(Region)과 플랫폼(Platform) 라우팅을 사용합니다.
// 한국 기준: Platform = kr, Region = asia
const REGION = 'asia';
const PLATFORM = 'kr';

// 간단한 인메모리 캐시 (Key: URL, Value: { data, timestamp })
const requestCache = new Map();
const CACHE_DURATION = 60 * 1000; // 1분 캐시

// 헬스체크
// 정적 파일 제공 (HTML, CSS, JS, IMG 등)
const staticPath = path.join(__dirname, 'tft-workspace/src');
app.use(express.static(staticPath));

// 이미지 폴더 명시적 제공 (확실한 경로 매핑)
app.use('/img', express.static(path.join(staticPath, 'img')));

// 루트 경로 접속 시 메인 페이지 반환
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'tft-workspace/src/tft_main.html')));

// Riot API 요청 헬퍼 함수
async function riotApiRequest(url, params = {}) {
  const cacheKey = `${url}:${JSON.stringify(params)}`;
  
  if (requestCache.has(cacheKey)) {
    const { data, timestamp } = requestCache.get(cacheKey);
    if (Date.now() - timestamp < CACHE_DURATION) {
      return data;
    }
    requestCache.delete(cacheKey);
  }

  try {
    console.log(`[RIOT API] ${url}`);
    const response = await axios.get(url, {
      headers: { 'X-Riot-Token': RIOT_KEY },
      params
    });
    requestCache.set(cacheKey, { data: response.data, timestamp: Date.now() });
    return response.data;
  } catch (error) {
    console.error(`[RIOT API ERROR] ${url}`, error.response?.status, error.response?.data);
    throw error;
  }
}

// 1. 소환사 검색 (Riot ID -> PUUID -> Summoner Info)
app.get('/api/summoner', async (req, res) => {
  const { name, tag } = req.query;
  if (!name || !tag) return res.status(400).json({ error: 'name and tag required' });

  try {
    // 1-1. Account V1: Riot ID로 PUUID 조회 (Region: asia)
    const accountUrl = `https://${REGION}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`;
    const accountData = await riotApiRequest(accountUrl);
    const { puuid, gameName, tagLine } = accountData;

    // 1-2. TFT Summoner V1: PUUID로 소환사 정보 조회 (Platform: kr)
    const summonerUrl = `https://${PLATFORM}.api.riotgames.com/tft/summoner/v1/summoners/by-puuid/${puuid}`;
    const summonerData = await riotApiRequest(summonerUrl);

    res.json({
      ...summonerData,
      name: gameName,
      tag: tagLine,
      puuid // 명시적으로 포함
    });
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: 'Summoner not found or API error' });
  }
});

// 2. 매치 리스트 조회 (by PUUID)
app.get('/api/summoner/matches', async (req, res) => {
  const { puuid, count = 20, start = 0 } = req.query;
  if (!puuid) return res.status(400).json({ error: 'puuid required' });

  try {
    // TFT Match V1: 매치 ID 목록 조회 (Region: asia)
    const url = `https://${REGION}.api.riotgames.com/tft/match/v1/matches/by-puuid/${puuid}/ids`;
    const matchIds = await riotApiRequest(url, { count, start });
    res.json({ matchIds });
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: 'Failed to fetch matches' });
  }
});

// 3. 매치 상세 정보 조회
app.get('/api/match/:matchId', async (req, res) => {
  const { matchId } = req.params;
  if (!matchId) return res.status(400).json({ error: 'matchId required' });

  try {
    // TFT Match V1: 매치 상세 조회 (Region: asia)
    const url = `https://${REGION}.api.riotgames.com/tft/match/v1/matches/${matchId}`;
    const matchData = await riotApiRequest(url);
    res.json(matchData);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: 'Failed to fetch match detail' });
  }
});

app.listen(PORT, () => {
  console.log(`Riot proxy running on http://localhost:${PORT}`);
  console.log(`Static files served from: ${staticPath}`);
});
