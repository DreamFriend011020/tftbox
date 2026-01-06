// 간단한 Express 서버: 정적 파일 제공 + /api/summoner 엔드포인트 (RIOT_API_KEY 필요)
const path = require('path');
const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.RIOT_API_KEY;
let REGION_RAW = (process.env.REGION || 'kr').toLowerCase().trim();

// normalize region input and map common aliases to platform region codes
function normalizePlatformRegion(r) {
  if (!r) return 'kr';
  r = r.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (r === 'na' || r === 'na1') return 'na1';
  if (r === 'euw' || r === 'euw1') return 'euw1';
  if (r === 'eune' || r === 'eun1' || r === 'eun') return 'eun1';
  if (r === 'kr' || r === 'kr1') return 'kr';
  if (r === 'jp' || r === 'jp1') return 'jp1';
  if (r === 'br' || r === 'br1') return 'br1';
  if (r === 'la' || r === 'la1') return 'la1';
  if (r === 'la2') return 'la2';
  if (r === 'oc' || r === 'oc1') return 'oc1';
  if (r === 'tr' || r === 'tr1') return 'tr1';
  if (r === 'ru') return 'ru';
  return r; // fallback
}

const PLATFORM_REGION = normalizePlatformRegion(REGION_RAW);

// platform host (used for summoner/v4 etc)
const PLATFORM_HOSTS = {
  kr: 'https://kr.api.riotgames.com',
  na1: 'https://na1.api.riotgames.com',
  euw1: 'https://euw1.api.riotgames.com',
  eun1: 'https://eun1.api.riotgames.com',
  jp1: 'https://jp1.api.riotgames.com',
  br1: 'https://br1.api.riotgames.com',
  la1: 'https://la1.api.riotgames.com',
  la2: 'https://la2.api.riotgames.com',
  oc1: 'https://oc1.api.riotgames.com',
  tr1: 'https://tr1.api.riotgames.com',
  ru: 'https://ru.api.riotgames.com'
};

const PLATFORM_HOST = PLATFORM_HOSTS[PLATFORM_REGION] || PLATFORM_HOSTS['kr'];

// match-v5 uses regional routing: americas / asia / europe
function platformToRegional(platformRegion) {
  const asia = new Set(['kr', 'kr1', 'jp1', 'jp', 'oc1']);
  const americas = new Set(['na1', 'na', 'br1', 'la1', 'la2', 'oc1']);
  const europe = new Set(['euw1', 'eun1', 'euw', 'eun', 'tr1', 'ru']);

  if (asia.has(platformRegion)) return 'https://asia.api.riotgames.com';
  if (europe.has(platformRegion)) return 'https://europe.api.riotgames.com';
  return 'https://americas.api.riotgames.com';
}

const MATCH_REGION_HOST = platformToRegional(PLATFORM_REGION);

if (!API_KEY) {
  console.warn('경고: RIOT_API_KEY 환경변수가 설정되어 있지 않습니다. .env에 RIOT_API_KEY를 입력하세요.');
}

// 매우 간단한 메모리 캐시 (TTL)
const cache = new Map();
const CACHE_TTL_MS = 60 * 1000;
function getCached(key) {
  const e = cache.get(key);
  if (!e) return null;
  if (Date.now() > e.expiresAt) {
    cache.delete(key);
    return null;
  }
  return e.data;
}
function setCached(key, data, ttl = CACHE_TTL_MS) {
  cache.set(key, { data, expiresAt: Date.now() + ttl });
}

// 정적 파일 제공 (프론트엔드가 있는 경로)
app.use(express.static(path.join(__dirname, '..', 'tft-workspace', 'src')));

// 요청 로깅 (응답 시간 및 상태 코드 포함)
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        const statusColor = res.statusCode >= 400 ? '\x1b[31m' : '\x1b[32m'; // Red or Green
        const resetColor = '\x1b[0m';
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${statusColor}${res.statusCode}${resetColor} - ${duration}ms`);
    });
    next();
});

// 루트 접근 시 tft_main.html 반환
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'tft-workspace', 'src', 'tft_main.html'));
});

// 공통 axios config
function riotAxiosInstance() {
  if (!API_KEY) throw new Error('RIOT_API_KEY 미설정');
  return axios.create({
    headers: { 'X-Riot-Token': API_KEY },
    timeout: 7000
  });
}

// 헬퍼: 안전하게 Riot 에러를 JSON으로 변환
function handleRiotError(err, res) {
  const errorMsg = err.response ? JSON.stringify(err.response.data) : err.message;
  console.error(`[RiotAPI Error] ${errorMsg}`);
  if (err.response) {
    const status = err.response.status;
    const data = err.response.data || { message: err.response.statusText };
    return res.status(status).json({ error: data });
  }
  return res.status(502).json({ error: 'Riot API 호출 실패 (Network/Server)', message: err.message });
}

// /api/summoner?name=이름&tag=태그
app.get('/api/summoner', async (req, res) => {
  const nameRaw = (req.query.name || '').trim();
  if (!nameRaw) return res.status(400).json({ error: 'name 쿼리 필요' });
  const tag = (req.query.tag || '').trim();
  const cacheKey = `${PLATFORM_REGION}|summoner|${nameRaw.toLowerCase()}`;

  const cached = getCached(cacheKey);
  if (cached) return res.json({ ...cached, cached: true });

  try {
    const ax = riotAxiosInstance();
    const url = `${PLATFORM_HOST}/lol/summoner/v4/summoners/by-name/${encodeURIComponent(nameRaw)}`;
    const r = await ax.get(url);
    const body = r.data;
    const result = {
      name: body.name,
      id: body.id,
      puuid: body.puuid,
      summonerLevel: body.summonerLevel,
      revisionDate: body.revisionDate,
      tag: tag || null
    };
    setCached(cacheKey, result);
    return res.json(result);
  } catch (err) {
    return handleRiotError(err, res);
  }
});

// match 관련 헬퍼
async function fetchMatchIdsByPuuid(puuid, count = 10, start = 0) {
  if (!API_KEY) throw new Error('RIOT_API_KEY 미설정');
  const url = `${MATCH_REGION_HOST}/lol/match/v5/matches/by-puuid/${encodeURIComponent(puuid)}/ids?start=${start}&count=${count}`;
  const ax = riotAxiosInstance();
  const r = await ax.get(url);
  return r.data;
}

app.get('/api/matches', async (req, res) => {
  const puuid = (req.query.puuid || '').trim();
  if (!puuid) return res.status(400).json({ error: 'puuid 쿼리 필요' });
  const count = Math.min(Math.max(parseInt(req.query.count || '10', 10), 1), 100);
  const start = parseInt(req.query.start || '0', 10);
  const cacheKey = `${PLATFORM_REGION}|matches|${puuid}|${count}|${start}`;
  const cached = getCached(cacheKey);
  if (cached) return res.json({ matchIds: cached, cached: true });

  try {
    const ids = await fetchMatchIdsByPuuid(puuid, count, start);
    setCached(cacheKey, ids);
    return res.json({ matchIds: ids });
  } catch (err) {
    return handleRiotError(err, res);
  }
});

app.get('/api/match/:matchId', async (req, res) => {
  const matchId = req.params.matchId;
  if (!matchId) return res.status(400).json({ error: 'matchId 필요' });
  const cacheKey = `${PLATFORM_REGION}|match|${matchId}`;
  const cached = getCached(cacheKey);
  if (cached) return res.json({ ...cached, cached: true });

  try {
    const ax = riotAxiosInstance();
    const url = `${MATCH_REGION_HOST}/lol/match/v5/matches/${encodeURIComponent(matchId)}`;
    const r = await ax.get(url);
    setCached(cacheKey, r.data);
    return res.json(r.data);
  } catch (err) {
    return handleRiotError(err, res);
  }
});

// 편의 엔드포인트: /api/summoner/matches?name=이름&count=10
app.get('/api/summoner/matches', async (req, res) => {
  const nameRaw = (req.query.name || '').trim();
  if (!nameRaw) return res.status(400).json({ error: 'name 쿼리 필요' });
  const count = Math.min(Math.max(parseInt(req.query.count || '10', 10), 1), 100);
  const start = parseInt(req.query.start || '0', 10);
  const cacheKey = `${PLATFORM_REGION}|summonerMatches|${nameRaw.toLowerCase()}|${count}|${start}`;
  const cached = getCached(cacheKey);
  if (cached) return res.json({ ...cached, cached: true });

  try {
    const ax = riotAxiosInstance();
    const summonerUrl = `${PLATFORM_HOST}/lol/summoner/v4/summoners/by-name/${encodeURIComponent(nameRaw)}`;
    const summonerRes = await ax.get(summonerUrl);
    const puuid = summonerRes.data.puuid;
    const ids = await fetchMatchIdsByPuuid(puuid, count, start);
    const out = { name: summonerRes.data.name, puuid, matchIds: ids };
    setCached(cacheKey, out);
    return res.json(out);
  } catch (err) {
    return handleRiotError(err, res);
  }
});

// 기존 getDdragonDataFile 함수 대체 및 locale 지원 엔드포인트 추가
const DDRAGON_VERSIONS_URL = 'https://ddragon.leagueoflegends.com/api/versions.json';
const DDRAGON_CDN_BASE = 'https://ddragon.leagueoflegends.com/cdn';
const DDRAGON_DATA_BASE = 'https://ddragon.leagueoflegends.com/cdn';

const ddcache = new Map();
const DD_CACHE_TTL = 1000 * 60 * 60; // 1시간

async function getLatestDdragonVersion() {
  const key = 'dd_versions';
  const cached = ddcache.get(key);
  if (cached && Date.now() < cached.expiresAt) return cached.data[0];
  const resp = await axios.get(DDRAGON_VERSIONS_URL, { timeout: 7000 });
  const versions = resp.data;
  ddcache.set(key, { data: versions, expiresAt: Date.now() + DD_CACHE_TTL });
  return versions[0];
}

// locale (ex: 'en_US', 'ko_KR') 지원. filename 예: 'item.json', 'champion.json'
async function getDdragonDataFile(filename, locale = 'en_US') {
  const key = `dd_data_${locale}_${filename}`;
  const cached = ddcache.get(key);
  if (cached && Date.now() < cached.expiresAt) return cached.data;
  const version = await getLatestDdragonVersion();
  const url = `${DDRAGON_DATA_BASE}/${version}/data/${locale}/${filename}`;
  const r = await axios.get(url, { timeout: 10000 });
  ddcache.set(key, { data: r.data, expiresAt: Date.now() + DD_CACHE_TTL });
  return r.data;
}

// GET /api/ddragon/version
app.get('/api/ddragon/version', async (req, res) => {
  try {
    const v = await getLatestDdragonVersion();
    return res.json({ version: v });
  } catch (err) {
    return res.status(502).json({ error: 'ddragon version fetch failed', message: err.message });
  }
});

// GET /api/ddragon/data/:locale/:file  (예: /api/ddragon/data/ko_KR/item.json)
app.get('/api/ddragon/data/:locale/:file', async (req, res) => {
  try {
    const locale = req.params.locale;
    const file = req.params.file;
    const allowedFiles = ['champion.json', 'item.json', 'runesReforged.json', 'tft-augments.json'];
    const allowedLocales = ['en_US', 'ko_KR'];
    if (!allowedLocales.includes(locale)) return res.status(400).json({ error: 'unsupported locale' });
    if (!allowedFiles.includes(file)) return res.status(400).json({ error: 'unsupported file' });
    const data = await getDdragonDataFile(file, locale);
    return res.json(data);
  } catch (err) {
    return res.status(502).json({ error: 'ddragon data fetch failed', message: err.message });
  }
});

// GET /api/ddragon/champion/:name -> { url, version }
app.get('/api/ddragon/champion/:name', async (req, res) => {
  try {
    const name = req.params.name;
    const version = await getLatestDdragonVersion();
    const imgUrl = `${DDRAGON_CDN_BASE}/${version}/img/champion/${encodeURIComponent(name)}.png`;
    return res.json({ url: imgUrl, version });
  } catch (err) {
    return res.status(502).json({ error: 'ddragon champion image error', message: err.message });
  }
});

// GET /api/ddragon/item/:id -> { url, version }
app.get('/api/ddragon/item/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const version = await getLatestDdragonVersion();
    const imgUrl = `${DDRAGON_CDN_BASE}/${version}/img/item/${encodeURIComponent(id)}.png`;
    return res.json({ url: imgUrl, version });
  } catch (err) {
    return res.status(502).json({ error: 'ddragon item image error', message: err.message });
  }
});

// 내부 검증 라우트: API 키 상태 및 설정 확인
app.get('/internal/validate-riot-key', async (req, res) => {
  const hasKey = !!API_KEY;
  const check = req.query.check === 'true';
  let apiStatus = 'unchecked';
  let apiMessage = 'Use ?check=true to perform a real API call.';

  if (check && hasKey) {
    try {
      // 더미 호출로 키 유효성 검사 (존재하지 않는 소환사 조회 -> 404면 키는 유효함)
      const ax = riotAxiosInstance();
      await ax.get(`${PLATFORM_HOST}/lol/summoner/v4/summoners/by-name/dummy_check_key_validity_xyz`);
      apiStatus = 'valid'; 
    } catch (err) {
      if (err.response) {
        if (err.response.status === 404) {
            apiStatus = 'valid'; // 404는 키가 정상 작동함을 의미
            apiMessage = 'API Key is valid (Resource not found as expected).';
        } else if (err.response.status === 403) {
            apiStatus = 'invalid';
            apiMessage = 'API Key is invalid or expired (403).';
        } else {
            apiStatus = `error_${err.response.status}`;
            apiMessage = `Riot API returned status ${err.response.status}`;
        }
      } else {
        apiStatus = 'network_error';
        apiMessage = err.message;
      }
    }
  }

  res.json({
    region: PLATFORM_REGION,
    hasKey,
    apiStatus,
    message: apiMessage,
    timestamp: new Date().toISOString()
  });
});

// 404 핸들러 (API 경로가 아닌 경우)
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found', path: req.originalUrl });
});

// 시작
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT} (platform=${PLATFORM_REGION})`);
  console.log(`Match regional host: ${MATCH_REGION_HOST}`);
  console.log(`프론트엔드: http://localhost:${PORT}/tft_main.html`);
});
