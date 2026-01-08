'use client';

import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';

export default function ChampionsPage() {
  const [champions, setChampions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [costFilter, setCostFilter] = useState('all');

  useEffect(() => {
    const fetchChampions = async () => {
      try {
        const res = await fetch('/api/ddragon/data/ko_KR/tft-champion.json');
        const data = await res.json();
        let champsArray = Object.values(data.data).filter(c => c.tier !== undefined); // 티어 정보 있는 것만

        // 최근 세트 자동 감지 및 필터링
        // 챔피언 ID(예: TFT13_Jinx)의 접두사를 카운트하여 가장 많은 세트를 현재 세트로 간주
        const setCounts = {};
        champsArray.forEach(c => {
          const prefix = c.character_id.split('_')[0];
          setCounts[prefix] = (setCounts[prefix] || 0) + 1;
        });
        const currentSetPrefix = Object.keys(setCounts).reduce((a, b) => setCounts[a] > setCounts[b] ? a : b, '');
        
        if (currentSetPrefix) {
          champsArray = champsArray.filter(c => c.character_id.startsWith(currentSetPrefix));
        }

        setChampions(champsArray);
      } catch (error) {
        console.error('Failed to fetch champions:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchChampions();
  }, []);

  const filteredChampions = champions.filter(champ => {
    if (costFilter === 'all') return true;
    if (costFilter === '5+') return champ.cost >= 5;
    return champ.cost === parseInt(costFilter);
  });

  const getCostColor = (cost) => {
    switch (cost) {
      case 1: return 'text-gray-400';
      case 2: return 'text-green-400';
      case 3: return 'text-blue-400';
      case 4: return 'text-purple-400';
      case 5: return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">챔피언 분석</h1>

        <div className="flex flex-wrap gap-2 mb-6">
          {['all', '1', '2', '3', '4', '5+'].map(cost => (
            <button
              key={cost}
              onClick={() => setCostFilter(cost)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                costFilter === cost ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {cost === 'all' ? '전체' : `${cost} 코스트`}
            </button>
          ))}
        </div>

        <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 shadow-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-700 text-gray-300 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold border-b border-gray-600 w-16">#</th>
                <th className="p-4 font-semibold border-b border-gray-600">챔피언</th>
                <th className="p-4 font-semibold border-b border-gray-600">비용</th>
                <th className="p-4 font-semibold border-b border-gray-600">특성</th>
                <th className="p-4 font-semibold border-b border-gray-600">스탯 (체력/마나/공격)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-400">데이터 로딩 중...</td></tr>
              ) : filteredChampions.map((champ) => (
                <tr key={champ.id} className="hover:bg-gray-700/50 transition-colors">
                  <td className="p-4">
                    <div className={`w-10 h-10 rounded border overflow-hidden ${
                      champ.cost === 5 ? 'border-yellow-500' : 'border-gray-600'
                    }`}>
                      <img src={`/api/ddragon/champion/${champ.id}`} alt={champ.name} className="w-full h-full object-cover" />
                    </div>
                  </td>
                  <td className="p-4 font-bold text-white">{champ.name}</td>
                  <td className={`p-4 font-bold ${getCostColor(champ.cost)}`}>{champ.cost}</td>
                  <td className="p-4 text-sm text-gray-300">
                    {champ.traits ? champ.traits.join(', ') : '-'}
                  </td>
                  <td className="p-4 text-sm text-gray-400">
                    HP: {champ.stats?.hp} / MP: {champ.stats?.mana} / AD: {champ.stats?.damage}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
