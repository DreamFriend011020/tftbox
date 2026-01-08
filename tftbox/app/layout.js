import './globals.css';

export const metadata = {
  title: 'TFTBOX.GG',
  description: 'TFT 전적 검색 및 공략',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body className="bg-gray-900 text-gray-100 antialiased">
        {children}
      </body>
    </html>
  );
}
