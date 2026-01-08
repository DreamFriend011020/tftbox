import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request, { params }) {
  const { name } = await params;
  try {
    const versionsRes = await axios.get('https://ddragon.leagueoflegends.com/api/versions.json');
    const version = versionsRes.data[0];
    // .png 확장자가 없으면 붙여줌
    let cleanName = name.endsWith('.png') ? name.slice(0, -4) : name;

    // TFT ID(예: TFT16_Tristana)에서 접두사 제거 -> Tristana
    if (cleanName.startsWith('TFT')) {
      const parts = cleanName.split('_');
      if (parts.length > 1) {
        cleanName = parts[1];
      }
    }

    const imageUrl = `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${encodeURIComponent(cleanName)}.png`;

    // 이미지 프록시: 리다이렉트(307) 대신 서버가 이미지를 받아와서 직접 반환(200)
    const imageRes = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(imageRes.data);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400', // 하루 동안 캐시
      },
    });
  } catch (e) {
    return new Response('Not found', { status: 404 });
  }
}
