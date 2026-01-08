/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['ddragon.leagueoflegends.com'], // 외부 이미지 호스트 등록
  },
};

module.exports = nextConfig;
