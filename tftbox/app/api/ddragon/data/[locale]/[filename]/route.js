import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request, { params }) {
  const { locale, filename } = await params;
  try {
    // 최신 버전 조회
    const versionsRes = await axios.get('https://ddragon.leagueoflegends.com/api/versions.json');
    const version = versionsRes.data[0];
    
    const url = `https://ddragon.leagueoflegends.com/cdn/${version}/data/${locale}/${filename}`;
    const response = await axios.get(url);
    return NextResponse.json(response.data);
  } catch (error) {
    // 최신 버전에 파일이 없으면 안정화 버전(13.21.1)으로 재시도 (server.js 로직 유지)
    try {
      const fallbackUrl = `https://ddragon.leagueoflegends.com/cdn/13.21.1/data/${locale}/${filename}`;
      const fallbackRes = await axios.get(fallbackUrl);
      return NextResponse.json(fallbackRes.data);
    } catch (e) {
      return NextResponse.json({ error: 'Data not found' }, { status: 404 });
    }
  }
}
