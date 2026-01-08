import { NextResponse } from 'next/server';
import axios from 'axios';

const RIOT_KEY = process.env.RIOT_API_KEY;
const REGION = 'asia';
const PLATFORM = 'kr';

// 간단한 인메모리 캐시
const requestCache = new Map();
const CACHE_DURATION = 60 * 1000; // 1분

async function riotApiRequest(url, params = {}, skipCache = false) {
  const cacheKey = `${url}:${JSON.stringify(params)}`;
  if (!skipCache && requestCache.has(cacheKey)) {
    const { data, timestamp } = requestCache.get(cacheKey);
    if (Date.now() - timestamp < CACHE_DURATION) {
      return data;
    }
  }

  try {
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

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');
  const tag = searchParams.get('tag');

  if (!name || !tag) {
    return NextResponse.json({ error: 'name and tag required' }, { status: 400 });
  }

  try {
    // 1. Riot ID로 PUUID 조회
    const accountUrl = `https://${REGION}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`;
    const accountData = await riotApiRequest(accountUrl);
    const { puuid, gameName, tagLine } = accountData;

    // 2. PUUID로 소환사 정보 조회 (TFT -> LoL 순서로 Fallback)
    let summonerData = null;
    try {
      const tftSummonerUrl = `https://${PLATFORM}.api.riotgames.com/tft/summoner/v1/summoners/by-puuid/${puuid}`;
      summonerData = await riotApiRequest(tftSummonerUrl);
    } catch (e) {
      // TFT 정보가 없으면 LoL 정보로 대체 시도
      const lolSummonerUrl = `https://${PLATFORM}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`;
      summonerData = await riotApiRequest(lolSummonerUrl);
    }

    // 3. ID가 없는 경우 매치 기록에서 역추적 (server.js 로직과 동일)
    if (!summonerData || !summonerData.id) {
        const matchesUrl = `https://${REGION}.api.riotgames.com/tft/match/v1/matches/by-puuid/${puuid}/ids?count=1`;
        const matchIds = await riotApiRequest(matchesUrl);
        if (matchIds && matchIds.length > 0) {
          const matchUrl = `https://${REGION}.api.riotgames.com/tft/match/v1/matches/${matchIds[0]}`;
          const matchData = await riotApiRequest(matchUrl);
          const participant = matchData.info.participants.find(p => p.puuid === puuid);
          if (participant && participant.summoner_id) {
            summonerData = { ...(summonerData || {}), id: participant.summoner_id };
          }
        }
    }

    return NextResponse.json({
      id: summonerData ? summonerData.id : null,
      ...summonerData,
      name: gameName,
      tag: tagLine,
      puuid,
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Summoner not found or API error' },
      { status: error.response?.status || 500 }
    );
  }
}
