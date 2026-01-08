'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';

export default function ChampionsPage() {
  const [champions, setChampions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [costFilter, setCostFilter] = useState('all');
  const [sortColumn, setSortColumn] = useState('averagePlacement');
  const [sortDirection, setSortDirection] = useState('asc');

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
          const id = c.character_id || c.id; // character_id가 없으면 id 사용
          if (id) {
            const prefix = id.split('_')[0];
            setCounts[prefix] = (setCounts[prefix] || 0) + 1;
          }
        });
        const currentSetPrefix = Object.keys(setCounts).reduce((a, b) => setCounts[a] > setCounts[b] ? a : b, '');
        
        if (currentSetPrefix) {
          champsArray = champsArray.filter(c => (c.character_id || c.id).startsWith(currentSetPrefix));
        }

        // 가상 데이터 생성 (평균 등수, 승률, 빈도) 및 상태 저장
        champsArray = champsArray.map(champ => {
          const averagePlacement = 4.0 + (champ.name.length % 20) / 10;
          const winRate = 10 + (champ.name.length % 15);
          const frequency = 5000 + (champ.name.length * 1500);
          return { ...champ, averagePlacement, winRate, frequency };
        });

        setChampions(champsArray);
      } catch (error) {
        console.error('Failed to fetch champions:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchChampions();
  }, []);

  const getTier = (avg) => {
    if (avg <= 4.2) return 'S';
    if (avg <= 4.4) return 'A';
    if (avg <= 4.6) return 'B';
    if (avg <= 4.8) return 'C';
    return 'D';
  };

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      if (column === 'winRate' || column === 'frequency') {
        setSortDirection('desc');
      } else {
        setSortDirection('asc');
      }
    }
  };

  const tierOrder = { S: 0, A: 1, B: 2, C: 3, D: 4 };

  const filteredChampions = champions
    .filter(champ => {
      if (costFilter === 'all') return true;
      if (costFilter === '5+') return champ.cost >= 5;
      return champ.cost === parseInt(costFilter);
    })
    .sort((a, b) => {
      const order = sortDirection === 'asc' ? 1 : -1;

      if (sortColumn === 'tier') {
        const aTier = getTier(a.averagePlacement);
        const bTier = getTier(b.averagePlacement);
        const tierComparison = tierOrder[aTier] - tierOrder[bTier];
        
        if (tierComparison !== 0) {
          return tierComparison * order;
        }
        
        const avgPlacementComparison = a.averagePlacement - b.averagePlacement;
        if (avgPlacementComparison !== 0) {
          return avgPlacementComparison;
        }

        return a.name.localeCompare(b.name);
      }
      
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      if (aValue === undefined || bValue === undefined) return 0;

      if (sortColumn === 'name') {
        return a.name.localeCompare(b.name) * order;
      }

      if (typeof aValue === 'string') {
        return aValue.localeCompare(bValue) * order;
      }
      return (aValue - bValue) * order;
    });

  const getTierColor = (tier) => {
    switch (tier) {
      case 'S': return 'text-yellow-400';
      case 'A': return 'text-blue-400';
      case 'B': return 'text-green-400';
      case 'C': return 'text-gray-400';
      default: return 'text-gray-500';
    }
  };

  const getCostColor = (cost) => {
    switch (cost) {
      case 1: return 'border-gray-500';
      case 2: return 'border-green-500';
      case 3: return 'border-blue-500';
      case 4: return 'border-purple-500';
      case 5: return 'border-yellow-500';
      case 7: return 'border-orange-500'; // 특수 코스트 예시
      default: return 'border-gray-700';
    }
  };

  const SortArrow = ({ direction }) => {
    if (!direction) return null;
    return <span className="ml-1">{direction === 'asc' ? '▲' : '▼'}</span>;
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
                <th className="p-4 font-semibold border-b border-gray-600 cursor-pointer" onClick={() => handleSort('name')}>
                  챔피언
                  <SortArrow direction={sortColumn === 'name' ? sortDirection : null} />
                </th>
                <th className="p-4 font-semibold border-b border-gray-600 cursor-pointer" onClick={() => handleSort('tier')}>
                  티어
                  <SortArrow direction={sortColumn === 'tier' ? sortDirection : null} />
                </th>
                <th className="p-4 font-semibold border-b border-gray-600 cursor-pointer" onClick={() => handleSort('averagePlacement')}>
                  평균 등수
                  <SortArrow direction={sortColumn === 'averagePlacement' ? sortDirection : null} />
                </th>
                <th className="p-4 font-semibold border-b border-gray-600 cursor-pointer" onClick={() => handleSort('winRate')}>
                  승률
                  <SortArrow direction={sortColumn === 'winRate' ? sortDirection : null} />
                </th>
                <th className="p-4 font-semibold border-b border-gray-600 cursor-pointer" onClick={() => handleSort('frequency')}>
                  빈도
                  <SortArrow direction={sortColumn === 'frequency' ? sortDirection : null} />
                </th>
                <th className="p-4 font-semibold border-b border-gray-600">인기 아이템</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading ? (
                <tr><td colSpan="7" className="p-8 text-center text-gray-400">데이터 로딩 중...</td></tr>
              ) : filteredChampions.map((champ) => (
                <tr key={champ.id} className="hover:bg-gray-700/50 transition-colors">
                  <td className="p-4">
                    <div className={`w-10 h-10 rounded border-2 overflow-hidden ${getCostColor(champ.cost)}`}>
                      <Image 
                        src={`/img/champions/${(champ.character_id || champ.id)}.png`} 
                        alt={champ.name} 
                        width={40} 
                        height={40} 
                        className="w-full h-full object-cover" 
                        unoptimized
                      />
                    </div>
                  </td>
                  <td className="p-4 font-bold text-white">{champ.name}</td>
                  <td className={`p-4 font-bold ${getTierColor(getTier(champ.averagePlacement))}`}>{getTier(champ.averagePlacement)}</td>
                  <td className="p-4 text-sm text-gray-300">#{champ.averagePlacement.toFixed(2)}</td>
                  <td className="p-4 text-sm text-gray-300">{champ.winRate.toFixed(1)}%</td>
                  <td className="p-4 text-sm text-gray-300">{champ.frequency.toLocaleString()}</td>
                  <td className="p-4 text-sm text-gray-300">
                    <div className="flex gap-1">
                      <div className="w-8 h-8 bg-gray-700 rounded border border-gray-600" title="아이템 1"></div>
                      <div className="w-8 h-8 bg-gray-700 rounded border border-gray-600" title="아이템 2"></div>
                      <div className="w-8 h-8 bg-gray-700 rounded border border-gray-600" title="아이템 3"></div>
                    </div>
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
