'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from './components/Navbar';

export default function Home() {
  const [input, setInput] = useState('');
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    if (!input.includes('#')) {
      alert('소환사명#태그 형식을 입력해주세요. (예: Hide on bush#KR1)');
      return;
    }
    const [name, tag] = input.split('#');
    router.push(`/summoner?name=${encodeURIComponent(name)}&tag=${encodeURIComponent(tag)}`);
  };

  // 비용별 색상 헬퍼
  const getCostColor = (cost) => {
    switch (cost) {
      case 1: return 'border-gray-500 text-gray-300';
      case 2: return 'border-green-500 text-green-400';
      case 3: return 'border-blue-500 text-blue-400';
      case 4: return 'border-purple-500 text-purple-400';
      case 5: return 'border-yellow-500 text-yellow-400';
      default: return 'border-gray-600 text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <header>
        <Navbar />
        {/* Hero Section */}
        <div className="text-center py-16 bg-gradient-to-b from-gray-800 to-gray-900 px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            승리를 위한 완벽한 전략
          </h1>
          <div className="max-w-xl mx-auto">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                placeholder="소환사명#태그 입력 (예: Hide on bush#KR1)"
                className="flex-1 px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:border-blue-500 transition-colors"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold transition-colors text-white"
              >
                검색
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12 space-y-16">
        {/* Tier Section */}
        <section>
          <h2 className="text-2xl font-bold mb-6 border-l-4 border-blue-500 pl-4">실시간 추천 메타 (S-Tier)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Deck Card 1 */}
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <span className="bg-yellow-500 text-gray-900 text-xs font-bold px-2 py-1 rounded mr-3">S</span>
                <h3 className="text-xl font-bold">슈리마 라이즈</h3>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {[
                  { name: '뽀삐', cost: 2 }, { name: '신짜오', cost: 2 }, { name: '케넨', cost: 3 },
                  { name: '가렌', cost: 4 }, { name: '나서스', cost: 4 }, { name: '타릭', cost: 4 },
                  { name: '세트', cost: 5 }, { name: '아지르', cost: 5 }, { name: '라이즈', cost: 5 }
                ].map((unit, idx) => (
                  <div key={idx} className={`w-12 h-12 flex items-center justify-center rounded border-2 bg-gray-700 text-xs font-medium ${getCostColor(unit.cost)}`}>
                    {unit.name}
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-400 font-mono">승률: <span className="text-blue-400">15.2%</span> | Top 4: <span className="text-blue-400">52.4%</span></p>
            </div>

            {/* Deck Card 2 */}
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <span className="bg-yellow-500 text-gray-900 text-xs font-bold px-2 py-1 rounded mr-3">S</span>
                <h3 className="text-xl font-bold">고밸류 빌지워터</h3>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {[
                  { name: '카사딘', cost: 2 }, { name: '라이즈', cost: 3 }, { name: '타릭', cost: 4 },
                  { name: '노라', cost: 5 }, { name: '유미', cost: 5 }, { name: '나미', cost: 4 },
                  { name: '벡스', cost: 4 }, { name: '밀리오', cost: 5 }, { name: '제라스', cost: 5 }
                ].map((unit, idx) => (
                  <div key={idx} className={`w-12 h-12 flex items-center justify-center rounded border-2 bg-gray-700 text-xs font-medium ${getCostColor(unit.cost)}`}>
                    {unit.name}
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-400 font-mono">승률: <span className="text-blue-400">14.8%</span> | Top 4: <span className="text-blue-400">51.1%</span></p>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 py-8 text-center text-gray-500 text-sm border-t border-gray-700 mt-12">
        <p>&copy; 2026 TFT Meta Helper. 이 사이트는 라이엇 게임즈와 관련이 없습니다.</p>
      </footer>
    </div>
  );
}
