import { NextResponse } from 'next/server';
import axios from 'axios';

const RIOT_KEY = process.env.RIOT_API_KEY;
const PLATFORM = 'kr';

export async function GET(request, { params }) {
  const { summonerId } = params;
  if (!summonerId) return NextResponse.json({ error: 'summonerId required' }, { status: 400 });

  try {
    const url = `https://${PLATFORM}.api.riotgames.com/tft/league/v1/entries/by-summoner/${summonerId}`;
    const response = await axios.get(url, { headers: { 'X-Riot-Token': RIOT_KEY } });
    return NextResponse.json(response.data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch league info' }, { status: error.response?.status || 500 });
  }
}
