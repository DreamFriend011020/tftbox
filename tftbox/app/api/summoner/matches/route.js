import { NextResponse } from 'next/server';
import axios from 'axios';

const RIOT_KEY = process.env.RIOT_API_KEY;
const REGION = 'asia';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const puuid = searchParams.get('puuid');
  const count = searchParams.get('count') || 20;
  
  if (!puuid) return NextResponse.json({ error: 'puuid required' }, { status: 400 });

  try {
    const url = `https://${REGION}.api.riotgames.com/tft/match/v1/matches/by-puuid/${puuid}/ids?count=${count}`;
    const response = await axios.get(url, { headers: { 'X-Riot-Token': RIOT_KEY } });
    return NextResponse.json({ matchIds: response.data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch matches' }, { status: error.response?.status || 500 });
  }
}
