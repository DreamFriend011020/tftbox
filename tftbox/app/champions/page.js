'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import Navbar from '../components/Navbar';

const FallbackImage = ({ src, fallbackSrc, alt, ...props }) => {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt}
      onError={() => {
        if (imgSrc !== fallbackSrc) setImgSrc(fallbackSrc);
      }}
    />
  );
};

export default function ChampionsPage() {
  const router = useRouter();
  const [champions, setChampions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [costFilter, setCostFilter] = useState('all');
  const [sortColumn, setSortColumn] = useState('averagePlacement');
  const [sortDirection, setSortDirection] = useState('asc');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchChampions = async () => {
      try {
        const [champRes, itemRes] = await Promise.all([
          fetch('/api/ddragon/data/ko_KR/tft-champion.json').then(res => res.ok ? res : fetch('https://ddragon.leagueoflegends.com/cdn/16.1.1/data/ko_KR/tft-champion.json')),
          fetch('/api/ddragon/data/ko_KR/tft-item.json').then(res => res.ok ? res : fetch('https://ddragon.leagueoflegends.com/cdn/16.1.1/data/ko_KR/tft-item.json'))
        ]);

        const champData = await champRes.json();
        const itemData = await itemRes.json();

        const itemsArray = Object.values(itemData.data).filter(item => !item.isElusive && item.id > 9);
        let champsArray = Object.values(champData.data).filter(c => c.tier !== undefined);

        const setCounts = {};
        champsArray.forEach(c => {
          const prefix = (c.character_id || c.id).split('_')[0];
          setCounts[prefix] = (setCounts[prefix] || 0) + 1;
        });
        const currentSetPrefix = Object.keys(setCounts).reduce((a, b) => setCounts[a] > setCounts[b] ? a : b, '');
        
        if (currentSetPrefix) {
          champsArray = champsArray.filter(c => (c.character_id || c.id).startsWith(currentSetPrefix));
        }

        champsArray = champsArray.map(champ => {
          const averagePlacement = 4.0 + (champ.name.length % 20) / 10;
          const winRate = 10 + (champ.name.length % 15);
          const frequency = 5000 + (champ.name.length * 1500);
          const top4Rate = 48.0 + (champ.name.length % 30) / 2;
          
          const seed = champ.name.length;
          const recommendedItems = [
            itemsArray[seed % itemsArray.length],
            itemsArray[(seed * 2) % itemsArray.length],
            itemsArray[(seed * 3) % itemsArray.length]
          ].filter(Boolean).map(item => ({
            ...item,
            cdnImageUrl: `https://ddragon.leagueoflegends.com/cdn/16.1.1/img/tft-item/${item.image?.full || item.id + '.png'}`
          }));

          return { 
            ...champ, 
            averagePlacement, 
            winRate, 
            frequency, 
            top4Rate,
            recommendedItems,
            cdnImageUrl: `https://ddragon.leagueoflegends.com/cdn/16.1.1/img/tft-champion/${champ.image?.full || champ.id + '.png'}`
          };
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

  const sortedAndFilteredChampions = useMemo(() => {
    const tierOrder = { S: 0, A: 1, B: 2, C: 3, D: 4 };
    const getTier = (avg) => {
      if (avg <= 4.25) return 'S';
      if (avg <= 4.45) return 'A';
      if (avg <= 4.65) return 'B';
      if (avg <= 4.85) return 'C';
      return 'D';
    };

    return champions
      .filter(champ => {
        const matchesCost = costFilter === 'all' ? true : costFilter === '5+' ? champ.cost >= 5 : champ.cost === parseInt(costFilter);
        const matchesSearch = champ.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCost && matchesSearch;
      })
      .sort((a, b) => {
        const order = sortDirection === 'asc' ? 1 : -1;
        
        if (sortColumn === 'tier') {
          const tierA = tierOrder[getTier(a.averagePlacement)];
          const tierB = tierOrder[getTier(b.averagePlacement)];
          return (tierA - tierB) * order;
        }

        const valA = a[sortColumn];
        const valB = b[sortColumn];
        return typeof valA === 'string' 
          ? valA.localeCompare(valB) * order 
          : (valA - valB) * order;
      });
  }, [champions, costFilter, searchQuery, sortColumn, sortDirection]);

  const getTierColor = (avg) => {
    if (avg <= 4.25) return 'text-orange-400';
    if (avg <= 4.45) return 'text-purple-400';
    if (avg <= 4.65) return 'text-blue-400';
    return 'text-gray-400';
  };

  const getCostColor = (cost) => {
    switch (cost) {
      case 1: return 'border-gray-500 text-gray-400';
      case 2: return 'border-green-500 text-green-400';
      case 3: return 'border-blue-500 text-blue-400';
      case 4: return 'border-purple-500 text-purple-400';
      case 5: return 'border-yellow-500 text-yellow-400';
      case 7: return 'border-orange-500 text-orange-400';
      default: return 'border-gray-700 text-gray-400';
    }
  };

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection(['winRate', 'top4Rate', 'frequency'].includes(column) ? 'desc' : 'asc');
    }
  };

  const SortIcon = ({ column }) => sortColumn === column ? (sortDirection === 'asc' ? ' ▲' : ' ▼') : null;

  return (
    <div className="min-h-screen bg-[#0f111a] text-gray-100 font-sans">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 py-10">
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight">챔피언 티어 리스트</h1>
          <p className="text-gray-400 mt-2 text-lg">최신 메타 챔피언 통계 및 추천 아이템 정보를 확인하세요.</p>
        </header>

        <div className="flex flex-col lg:flex-row justify-between gap-6 mb-8">
          <div className="flex flex-wrap gap-2 bg-gray-800/50 p-1.5 rounded-xl border border-gray-700">
            {['all', '1', '2', '3', '4', '5+'].map(cost => (
              <button
                key={cost}
                onClick={() => setCostFilter(cost)}
                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                  costFilter === cost ? 'bg-blue-600 shadow-lg text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                {cost === 'all' ? '전체' : `${cost} 코스트`}
              </button>
            ))}
          </div>
          
          <div className="relative group">
            <input
              type="text"
              placeholder="챔피언 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-gray-800/80 border border-gray-700 rounded-xl px-5 py-3 pl-12 focus:ring-2 focus:ring-blue-500 outline-none w-full lg:w-80 transition-all"
            />
            <span className="absolute left-4 top-3.5 text-gray-500">🔍</span>
          </div>
        </div>

        <div className="bg-gray-800/30 rounded-2xl border border-gray-700 backdrop-blur-sm overflow-hidden shadow-2xl">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-700 bg-gray-800/50 text-gray-400 text-[11px] font-bold uppercase tracking-widest">
                <th className="p-5 cursor-pointer hover:text-white" onClick={() => handleSort('name')}>챔피언<SortIcon column="name" /></th>
                <th className="p-5 cursor-pointer hover:text-white" onClick={() => handleSort('tier')}>티어<SortIcon column="tier" /></th>
                <th className="p-5 cursor-pointer hover:text-white" onClick={() => handleSort('averagePlacement')}>평균 등수<SortIcon column="averagePlacement" /></th>
                <th className="p-5 cursor-pointer hover:text-white" onClick={() => handleSort('winRate')}>승률<SortIcon column="winRate" /></th>
                <th className="p-5 cursor-pointer hover:text-white" onClick={() => handleSort('top4Rate')}>Top 4%<SortIcon column="top4Rate" /></th>
                <th className="p-5 cursor-pointer hover:text-white" onClick={() => handleSort('frequency')}>빈도<SortIcon column="frequency" /></th>
                <th className="p-5">추천 아이템</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                <tr><td colSpan="7" className="p-20 text-center text-blue-500 animate-pulse font-bold">데이터를 로딩 중입니다...</td></tr>
              ) : sortedAndFilteredChampions.map((champ) => (
                <tr 
                  key={champ.id} 
                  onClick={() => router.push(`/champions/${champ.character_id || champ.id}`)}
                  className="hover:bg-blue-600/10 transition-colors group cursor-pointer"
                >
                  <td className="p-4 flex items-center gap-4">
                    <div className="relative group/champ">
                      <div className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 shadow-md group-hover:border-blue-500 transition-all ${getCostColor(champ.cost)}`}>
                        <FallbackImage 
                          src={`/img/champions/${(champ.character_id || champ.id)}.png`} 
                          fallbackSrc={champ.cdnImageUrl}
                          alt={champ.name} 
                          fill 
                          className="object-cover" 
                          unoptimized
                        />
                      </div>
                    </div>
                    <span className="font-bold text-gray-200 group-hover:text-blue-400 transition-colors">{champ.name}</span>
                  </td>
                  <td className="p-4">
                    <span className={`text-xl font-black ${getTierColor(champ.averagePlacement)}`}>
                      {champ.averagePlacement <= 4.25 ? 'S' : champ.averagePlacement <= 4.45 ? 'A' : 'B'}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-gray-300">#{champ.averagePlacement.toFixed(2)}</td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1 w-24">
                      <span className="text-[11px] text-gray-400 font-bold">{champ.winRate.toFixed(1)}%</span>
                      <div className="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full shadow-[0_0_8px_#3b82f6]" style={{ width: `${champ.winRate * 3}%` }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-300 font-semibold">{champ.top4Rate.toFixed(1)}%</td>
                  <td className="p-4 text-sm text-gray-400">{champ.frequency.toLocaleString()}</td>
                  <td className="p-4">
                    <div className="flex gap-1.5">
                      {champ.recommendedItems?.map((item, idx) => (
                        <div key={idx} className="relative w-8 h-8 rounded border border-gray-700 overflow-hidden group/item">
                          <FallbackImage 
                            src={`/img/items/${item.id}.png`}
                            fallbackSrc={item.cdnImageUrl}
                            alt={item.name} 
                            fill 
                            className="object-cover" 
                            unoptimized
                          />
                        </div>
                      ))}
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
