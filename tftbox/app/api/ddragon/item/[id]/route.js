import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request, { params }) {
  const { id } = params;
  try {
    const versionsRes = await axios.get('https://ddragon.leagueoflegends.com/api/versions.json');
    const version = versionsRes.data[0];
    // .png 확장자가 없으면 붙여줌
    const imageName = id.endsWith('.png') ? id : `${id}.png`;
    return NextResponse.redirect(`https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${encodeURIComponent(imageName)}`);
  } catch (e) {
    return new Response('Not found', { status: 404 });
  }
}
