'use client';

import Image from 'next/image';
import { useState, useEffect, useMemo } from 'react';
import Navbar from '../components/Navbar';
// 만약 utils 파일에서 가져오는 것이 계속 에러가 난다면, 
// 아래에 직접 정의된 함수를 사용하게 됩니다.
import { getItemCategory, isValidItem } from '../../utils/itemHelpers';
import { ITEM_DESCRIPTIONS } from '../../utils/itemDescriptions';

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

        // [추가] 찬란한 아이템 이름을 기반으로 일반 아이템 이름 목록 생성
        // 예: "찬란한 피바라기" -> "피바라기"
        const radiantNames = new Set();
        itemsArray.forEach(item => {
          if (getItemCategory(item) === 'radiant') {
            radiantNames.add(item.name.replace('찬란한 ', ''));
          }
        });

        // [디버깅] 필터링 결과 로그 출력
        const validList = [];
        const invalidList = [];
        itemsArray.forEach(item => {
          if (isValidItem(item, currentSet, radiantNames)) {
            validList.push(`[O] ${item.name} (${item.apiName})`);
          } else {
            invalidList.push(`[X] ${item.name} (${item.apiName})`);
          }
        });
        console.log('=== Item Filter Debug ===');
        console.log(`Total: ${itemsArray.length}, Valid: ${validList.length}, Invalid: ${invalidList.length}`);
        console.log('Valid Samples:', validList.slice(0, 10));
        console.log('Invalid Samples:', invalidList.slice(0, 10));
    
        const processedItems = itemsArray
          .filter(item => isValidItem(item, currentSet, radiantNames)) // 이름 목록 전달
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
              cdnImageUrl: `https://ddragon.leagueoflegends.com/cdn/16.1.1/img/tft-item/${item.image?.full || item.id + '.png'}`
            };
          })
          // 최신 세트 우선 정렬 (ID가 클수록 최신) 후 이름 중복 제거
          .sort((a, b) => (parseInt(b.id) || 0) - (parseInt(a.id) || 0))
          .filter((item, index, self) => 
            index === self.findIndex((t) => t.name === item.name)
          );

        // [디버그] 현재 페이지에 표시되는 아이템 목록 출력
        console.log("=== 표시되는 아이템 목록 ===");
        console.log(processedItems.map(item => `${item.name} (${item.apiName || item.id}) - ${item.category}`).join('\n'));
    
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

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      // 승률, Top 4%는 높은 것이 좋으므로 내림차순 기본
      setSortDirection(['winRate', 'top4Rate'].includes(column) ? 'desc' : 'asc');
    }
  };

  const SortIcon = ({ column }) => sortColumn === column ? (sortDirection === 'asc' ? ' ▲' : ' ▼') : null;

  // 아이템 설명 파싱 함수 (변수 치환 및 태그 정리)
  const parseItemDesc = (item) => {
    // 로컬 설명이 있으면 우선 사용, 없으면 API 데이터 사용
    const localDesc = ITEM_DESCRIPTIONS[item.apiName] || ITEM_DESCRIPTIONS[item.id];
    const desc = localDesc || item.desc || item.description || '';
    if (!desc) {
      console.log(`[DEBUG] 설명 데이터 없음: ${item.name} (${item.apiName})`, item);
      return '<span class="text-gray-500">설명 없음</span>';
    }
    
    let result = desc;
    const effects = item.effects || {};

    // 1. 변수 치환 (@Variable@ -> 값)
    Object.entries(effects).forEach(([key, val]) => {
      if (val === undefined || val === null) return;
      result = result.replace(new RegExp(`@${key}(\\*100)?@`, 'gi'), `<strong class="text-white">${val}</strong>`);
    });

    // 2. 태그 스타일링 및 정리
    result = result.replace(/<br\s*\/?>/gi, '<br/>');
    result = result.replace(/\n/g, '<br/>');
    result = result.replace(/<tftitemrules>/gi, '<div class="mt-2 text-[11px] text-gray-400 leading-tight pt-2 border-t border-gray-700">');
    result = result.replace(/<\/tftitemrules>/gi, '</div>');
    
    // 기타 태그 (예: <scaleAD>, <magicDamage>) -> 스타일 적용
    result = result.replace(/<([a-zA-Z]+)[^>]*>(.*?)<\/\1>/g, '<span class="text-blue-300">$2</span>');
    
    // [추가] 아이콘 태그 치환 (%i:scaleType% -> 이미지)
    // public/img/stats 폴더에 해당 이름의 png 파일이 있어야 합니다.
    const iconMap = {
      'scaleAD': 'ad',
      'scaleAP': 'ap',
      'scaleArmor': 'armor',
      'scaleMR': 'mr',
      'scaleHealth': 'health',
      'scaleMana': 'mana',
      'scaleAttackSpeed': 'attackspeed',
      'scaleCrit': 'crit',
      'scaleSV': 'vamp',
    };

    result = result.replace(/%i:([^%]+)%/g, (match, type) => {
      const iconName = iconMap[type];
      return iconName ? `<img src="/img/stats/${iconName}.png" alt="${type}" class="inline-block w-3.5 h-3.5 mr-0.5 align-middle opacity-90" />` : '';
    });

    return result;
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

        <div className="bg-gray-800/30 rounded-2xl border border-gray-700 backdrop-blur-sm overflow-visible shadow-2xl">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-700 bg-gray-800/50 text-gray-400 text-[11px] font-bold uppercase tracking-widest">
                <th className="p-5 cursor-pointer hover:text-white" onClick={() => handleSort('name')}>아이템<SortIcon column="name" /></th>
                <th className="p-5 cursor-pointer hover:text-white" onClick={() => handleSort('tier')}>티어<SortIcon column="tier" /></th>
                <th className="p-5 cursor-pointer hover:text-white" onClick={() => handleSort('averagePlacement')}>평균 등수<SortIcon column="averagePlacement" /></th>
                <th className="p-5 cursor-pointer hover:text-white" onClick={() => handleSort('winRate')}>승률<SortIcon column="winRate" /></th>
                <th className="p-5 cursor-pointer hover:text-white" onClick={() => handleSort('top4Rate')}>Top 4%<SortIcon column="top4Rate" /></th>
                <th className="p-5">조합식</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                <tr><td colSpan="6" className="p-20 text-center text-blue-500 animate-pulse font-bold">데이터를 로딩 중입니다...</td></tr>
              ) : sortedAndFilteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-blue-600/10 transition-colors group">
                  <td className="p-4 flex items-center gap-4">
                    <div className="relative group/item">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-600 shadow-md group-hover:border-blue-500 transition-all">
                        <Image 
                          src={item.cdnImageUrl || `/img/items/${item.id}.png`} 
                          alt={item.name} 
                          fill 
                          className="object-cover" 
                          unoptimized
                        />
                      </div>
                      <div className="absolute z-[9999] bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900/95 backdrop-blur-sm border border-gray-500 rounded-xl shadow-2xl hidden group-hover/item:block pointer-events-none">
                        <h4 className="font-bold text-blue-400 mb-1 text-sm">{item.name}</h4>
                        <div className="text-xs text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: parseItemDesc(item) }}></div>
                      </div>
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
