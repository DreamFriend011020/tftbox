import { NextResponse } from 'next/server';
import axios from 'axios';

const RIOT_KEY = process.env.RIOT_API_KEY;
const REGION = 'asia';

export async function GET(request, { params }) {
  const { matchId } = await params;

  try {
    const url = `https://${REGION}.api.riotgames.com/tft/match/v1/matches/${matchId}`;
    const response = await axios.get(url, { headers: { 'X-Riot-Token': RIOT_KEY } });
    return NextResponse.json(response.data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch match detail' }, { status: error.response?.status || 500 });
  }
}
