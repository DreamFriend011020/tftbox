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

// [추가] 파비콘 요청 무시 (404 에러 방지)
app.get('/favicon.ico', (req, res) => res.status(204).end());

// 루트 경로 접속 시 메인 페이지 반환
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'tft-workspace/src/tft_main.html')));

// Riot API 요청 헬퍼 함수
async function riotApiRequest(url, params = {}, skipCache = false) {
  const cacheKey = `${url}:${JSON.stringify(params)}`;
  
  if (!skipCache && requestCache.has(cacheKey)) {
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
  const { name, tag, refresh } = req.query;
  if (!name || !tag) return res.status(400).json({ error: 'name and tag required' });
  const skipCache = refresh === 'true';

  try {
    // 1-1. Account V1: Riot ID로 PUUID 조회 (Region: asia)
    const accountUrl = `https://${REGION}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`;
    const accountData = await riotApiRequest(accountUrl, {}, skipCache);
    const { puuid, gameName, tagLine } = accountData;

    // 1-2. TFT Summoner V1: PUUID로 소환사 정보 조회 (Platform: kr)
    let summonerData = null;
    try {
      const summonerUrl = `https://${PLATFORM}.api.riotgames.com/tft/summoner/v1/summoners/by-puuid/${puuid}`;
      summonerData = await riotApiRequest(summonerUrl, {}, skipCache);
    } catch (e) {
      console.warn('[API INFO] TFT Summoner endpoint failed, trying LoL endpoint...');
    }

    // [Fallback] TFT 엔드포인트에서 ID가 누락된 경우 LoL 엔드포인트 시도 (ID 확보용)
    if (!summonerData || !summonerData.id) {
      console.warn('[API WARNING] TFT endpoint missing ID, trying LoL endpoint...');
      try {
        const summonerUrl = `https://${PLATFORM}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`;
        summonerData = await riotApiRequest(summonerUrl, {}, skipCache);
      } catch (e) {
        console.error('[API ERROR] LoL Summoner endpoint also failed');
      }
    }

    // [Fallback 2] 여전히 ID가 없다면, 최근 매치 기록에서 ID 역추적 시도
    if (!summonerData || !summonerData.id) {
      console.warn('[API WARNING] Summoner endpoints failed to provide ID. Trying Match History fallback...');
      try {
        // 1. 최근 매치 ID 1개 조회
        const matchesUrl = `https://${REGION}.api.riotgames.com/tft/match/v1/matches/by-puuid/${puuid}/ids?count=1`;
        const matchIds = await riotApiRequest(matchesUrl, {}, skipCache);
        
        if (matchIds && matchIds.length > 0) {
          // 2. 매치 상세 정보 조회
          const matchUrl = `https://${REGION}.api.riotgames.com/tft/match/v1/matches/${matchIds[0]}`;
          const matchData = await riotApiRequest(matchUrl, {}, skipCache);
          
          // 3. 내 PUUID와 일치하는 참가자 찾기
          const participant = matchData.info.participants.find(p => p.puuid === puuid);
          if (participant && participant.summoner_id) {
            console.log('[API INFO] Found ID from Match History:', participant.summoner_id);
            // 기존 summonerData에 id 병합 (없으면 생성)
            summonerData = { ...(summonerData || {}), id: participant.summoner_id };
          }
        }
      } catch (e) {
        console.error('[API ERROR] Match History fallback failed:', e.message);
      }
    }

    if (!summonerData || !summonerData.id) {
      console.warn('[API WARN] summonerData does not contain id (Rank info unavailable):', puuid);
    }

    res.json({
      id: summonerData ? summonerData.id : null,
      ...(summonerData || {}),
      name: gameName,
      tag: tagLine,
      puuid // 명시적으로 포함
    });
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: 'Summoner not found or API error' });
  }
});

// 5. 소환사 리그 정보 조회 (Tier, Rank, LP 등)
app.get('/api/summoner/league/:summonerId', async (req, res) => {
  const { summonerId } = req.params;
  if (!summonerId || summonerId === 'undefined') return res.status(400).json({ error: 'summonerId required' });

  try {
    // TFT League V1: 소환사 리그 정보 조회 (Platform: kr)
    const url = `https://${PLATFORM}.api.riotgames.com/tft/league/v1/entries/by-summoner/${summonerId}`;
    const leagueData = await riotApiRequest(url);
    res.json(leagueData);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: 'Failed to fetch league info' });
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

// [추가] Data Dragon 프록시 라우트
// 1. 버전 정보 조회
app.get('/api/ddragon/version', async (req, res) => {
  try {
    const versions = await riotApiRequest('https://ddragon.leagueoflegends.com/api/versions.json');
    res.json({ version: versions[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch version' });
  }
});

// 2. 데이터 파일 조회 (champion.json, item.json, tft-augments.json 등)
app.get('/api/ddragon/data/:locale/:filename', async (req, res) => {
  const { locale, filename } = req.params;
  try {
    const versions = await riotApiRequest('https://ddragon.leagueoflegends.com/api/versions.json');
    const version = versions[0];
    const url = `https://ddragon.leagueoflegends.com/cdn/${version}/data/${locale}/${filename}`;
    const data = await riotApiRequest(url);
    res.json(data);
  } catch (error) {
    // [Fallback] 최신 버전에 파일이 없으면 안정화 버전(13.21.1)에서 시도
    // 특히 tft-item.json 등은 최신 버전에 누락되는 경우가 많음
    try {
        const fallbackUrl = `https://ddragon.leagueoflegends.com/cdn/13.21.1/data/${locale}/${filename}`;
        const data = await riotApiRequest(fallbackUrl);
        res.json(data);
    } catch (fallbackError) {
        res.status(404).json({ error: 'Data not found' });
    }
  }
});

// 3. 챔피언 이미지 URL 반환 (ddragon.js 지원용)
app.get('/api/ddragon/champion/:name', async (req, res) => {
  const { name } = req.params;
  try {
    const versions = await riotApiRequest('https://ddragon.leagueoflegends.com/api/versions.json');
    const version = versions[0];
    const url = `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${encodeURIComponent(name)}.png`;
    res.json({ url });
  } catch (e) {
    res.status(404).json({ error: 'Not found' });
  }
});

// 4. 아이템 이미지 URL 반환 (ddragon.js 지원용)
app.get('/api/ddragon/item/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const versions = await riotApiRequest('https://ddragon.leagueoflegends.com/api/versions.json');
    const version = versions[0];
    const url = `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${encodeURIComponent(id)}.png`;
    res.json({ url });
  } catch (e) {
    res.status(404).json({ error: 'Not found' });
  }
});

app.listen(PORT, () => {
  console.log(`Riot proxy running on http://localhost:${PORT}`);
  console.log(`Static files served from: ${staticPath}`);
});
