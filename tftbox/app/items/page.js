'use client';

import Image from 'next/image';
import { useState, useEffect, useMemo } from 'react';
import Navbar from '../components/Navbar';
// 만약 utils 파일에서 가져오는 것이 계속 에러가 난다면, 
// 아래에 직접 정의된 함수를 사용하게 됩니다.
import { getItemCategory, isValidItem } from '../../utils/itemHelpers';

export default function ItemsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortColumn, setSortColumn] = useState('averagePlacement');
  const [sortDirection, setSortDirection] = useState('asc');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchItems = async () => {
      try {
        // 1. 로컬 API 시도 -> 실패 시 공식 라이엇 CDN으로 Fallback
        let res = await fetch('/api/ddragon/data/ko_KR/tft-item.json');
        if (!res.ok) {
          res = await fetch('https://ddragon.leagueoflegends.com/cdn/16.1.1/data/ko_KR/tft-item.json');
        }
        
        const data = await res.json();
        // 데이터 구조 보정: id가 없는 경우 키값을 id로 사용
        let itemsArray = Object.entries(data.data).map(([key, value]) => ({ ...value, id: value.id || key }));

        // 현재 시즌(세트) 자동 감지: 가장 높은 세트 번호를 찾음
        let currentSet = 0;
        itemsArray.forEach(item => {
          const identifier = item.apiName || String(item.id || "");
          const match = identifier.match(/^TFT(\d+)_/);
          if (match) {
            currentSet = Math.max(currentSet, parseInt(match[1]));
          }
        });
        console.log('Detected Set:', currentSet);
    
        const processedItems = itemsArray
          .filter(item => isValidItem(item, currentSet)) // 현재 세트 정보를 전달하여 필터링
          .map(item => {
            const name = item.name;
            const category = getItemCategory(item); // 유틸리티 함수 사용
    
            // 가상 데이터 생성 (ID와 이름 기반으로 고정값 생성)
            const seed = name.length + (parseInt(item.id) || 0);
            return { 
              ...item, 
              category,
              averagePlacement: 4.1 + (seed % 10) / 15,
              winRate: 11.0 + (seed % 20) / 2,
              top4Rate: 48.0 + (seed % 30) / 2,
              frequency: 50000 + (seed * 1500),
              // 로컬 이미지가 없을 경우를 대비해 CDN 이미지 경로도 저장
              cdnImageUrl: `https://ddragon.leagueoflegends.com/cdn/16.1.1/img/tft-item/${item.image.full}`
            };
          })
          // 최신 세트 우선 정렬 (ID가 클수록 최신) 후 이름 중복 제거
          .sort((a, b) => (parseInt(b.id) || 0) - (parseInt(a.id) || 0))
          .filter((item, index, self) => 
            index === self.findIndex((t) => t.name === item.name)
          );
    
        setItems(processedItems);
      } catch (error) {
        console.error('Failed to fetch items:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const sortedAndFilteredItems = useMemo(() => {
    const tierOrder = { S: 0, A: 1, B: 2, C: 3, D: 4 };
    const getTier = (avg) => {
      if (avg <= 4.25) return 'S';
      if (avg <= 4.45) return 'A';
      if (avg <= 4.65) return 'B';
      if (avg <= 4.85) return 'C';
      return 'D';
    };

    return items
      .filter(item => {
        const matchesType = typeFilter === 'all' || item.category === typeFilter;
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesType && matchesSearch;
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
  }, [items, typeFilter, searchQuery, sortColumn, sortDirection]);

  const getTierColor = (avg) => {
    if (avg <= 4.25) return 'text-orange-400';
    if (avg <= 4.45) return 'text-purple-400';
    if (avg <= 4.65) return 'text-blue-400';
    return 'text-gray-400';
  };

  return (
    <div className="min-h-screen bg-[#0f111a] text-gray-100 font-sans">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 py-10">
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight">아이템 티어 리스트</h1>
          <p className="text-gray-400 mt-2 text-lg">MetaTFT 스타일의 정교한 필터링으로 최신 메타를 확인하세요.</p>
        </header>

        {/* 필터 섹션 */}
        <div className="flex flex-col lg:flex-row justify-between gap-6 mb-8">
          <div className="flex flex-wrap gap-2 bg-gray-800/50 p-1.5 rounded-xl border border-gray-700">
            {[
              { id: 'all', label: '전체' },
              { id: 'completed', label: '일반' },
              { id: 'component', label: '재료' },
              { id: 'artifact', label: '유물' },
              { id: 'radiant', label: '찬란한' },
              { id: 'emblem', label: '상징' },
              { id: 'trait', label: '특성' } // Bilgewater 등 포함
            ].map(type => (
              <button
                key={type.id}
                onClick={() => setTypeFilter(type.id)}
                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                  typeFilter === type.id ? 'bg-blue-600 shadow-lg text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
          
          <div className="relative group">
            <input
              type="text"
              placeholder="아이템 명으로 검색..."
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
                <th className="p-5">아이템</th>
                <th className="p-5 cursor-pointer hover:text-white" onClick={() => setSortColumn('tier')}>티어</th>
                <th className="p-5 cursor-pointer hover:text-white" onClick={() => setSortColumn('averagePlacement')}>평균 등수</th>
                <th className="p-5 cursor-pointer hover:text-white" onClick={() => setSortColumn('winRate')}>승률</th>
                <th className="p-5 cursor-pointer hover:text-white" onClick={() => setSortColumn('top4Rate')}>Top 4%</th>
                <th className="p-5">조합식</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                <tr><td colSpan="6" className="p-20 text-center text-blue-500 animate-pulse font-bold">데이터를 로딩 중입니다...</td></tr>
              ) : sortedAndFilteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-blue-600/10 transition-colors group">
                  <td className="p-4 flex items-center gap-4">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-600 shadow-md group-hover:border-blue-500 transition-all">
                      <Image 
                        src={item.cdnImageUrl || `/img/items/${item.id}.png`} 
                        alt={item.name} 
                        fill 
                        className="object-cover" 
                        unoptimized
                      />
                    </div>
                    <span className="font-bold text-gray-200 group-hover:text-blue-400 transition-colors">{item.name}</span>
                  </td>
                  <td className="p-4">
                    <span className={`text-xl font-black ${getTierColor(item.averagePlacement)}`}>
                      {item.averagePlacement <= 4.25 ? 'S' : item.averagePlacement <= 4.45 ? 'A' : 'B'}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-gray-300">#{item.averagePlacement.toFixed(2)}</td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1 w-24">
                      <span className="text-[11px] text-gray-400 font-bold">{item.winRate.toFixed(1)}%</span>
                      <div className="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full shadow-[0_0_8px_#3b82f6]" style={{ width: `${item.winRate * 3}%` }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-300 font-semibold">{item.top4Rate.toFixed(1)}%</td>
                  <td className="p-4">
                    <div className="flex gap-1.5">
                      {item.from?.map((cid, i) => (
                        <div key={i} className="w-8 h-8 rounded border border-gray-700 bg-black/40 p-0.5 hover:border-gray-400 transition-all">
                          <Image src={`https://ddragon.leagueoflegends.com/cdn/16.1.1/img/tft-item/${cid}.png`} alt="recipe" width={32} height={32} unoptimized />
                        </div>
                      )) || <span className="text-gray-500 text-xs">-</span>}
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
