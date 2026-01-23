'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import Navbar from '../../components/Navbar';

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

export default function ChampionDetailPage() {
  const { id } = useParams();
  const [champion, setChampion] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. 챔피언 데이터 가져오기
        let champRes = await fetch('/api/ddragon/data/ko_KR/tft-champion.json');
        if (!champRes.ok) {
          champRes = await fetch('https://ddragon.leagueoflegends.com/cdn/16.1.1/data/ko_KR/tft-champion.json');
        }
        const champData = await champRes.json();
        
        // ID로 챔피언 찾기 (API 데이터 구조에 따라 키값 또는 id 필드 확인)
        const champ = Object.values(champData.data).find(c => (c.character_id || c.id) === id);

        if (champ) {
          // CDN 이미지 URL 추가
          champ.cdnImageUrl = `https://ddragon.leagueoflegends.com/cdn/16.1.1/img/tft-champion/${champ.image?.full || champ.id + '.png'}`;
          setChampion(champ);
        }

        // 2. 아이템 데이터 가져오기 (추천 아이템용)
        let itemRes = await fetch('/api/ddragon/data/ko_KR/tft-item.json');
        if (!itemRes.ok) {
          itemRes = await fetch('https://ddragon.leagueoflegends.com/cdn/16.1.1/data/ko_KR/tft-item.json');
        }
        const itemData = await itemRes.json();
        const itemsArray = Object.values(itemData.data).filter(item => 
          !item.isElusive && item.id > 9 // 기본 재료 아이템 제외 및 완성 아이템 위주
        );
        
        // 가상 추천 아이템 로직: 챔피언 이름 길이를 시드로 사용하여 일관된 랜덤 아이템 선택
        if (champ) {
          const seed = champ.name.length;
          const recommendedItems = [
            itemsArray[seed % itemsArray.length],
            itemsArray[(seed * 2) % itemsArray.length],
            itemsArray[(seed * 3) % itemsArray.length]
          ].filter(Boolean).map(item => ({
            ...item,
            cdnImageUrl: `https://ddragon.leagueoflegends.com/cdn/16.1.1/img/tft-item/${item.image?.full || item.id + '.png'}`
          }));
          setItems(recommendedItems);
        }

      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  const parseSkillDesc = (desc) => {
    if (!desc) return '';
    return desc
      .replace(/<br\s*\/?>/gi, '<br/>')
      .replace(/<[^>]+>/g, (match) => `<span class="text-blue-400 font-semibold">${match}</span>`)
      .replace(/@([^@]+)@/g, '<span class="text-white font-bold">$1</span>'); // 변수 강조
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f111a] text-gray-100 font-sans">
        <Navbar />
        <div className="flex justify-center items-center h-[80vh]">
          <div className="text-2xl text-blue-500 animate-pulse font-bold">챔피언 정보를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  if (!champion) {
    return (
      <div className="min-h-screen bg-[#0f111a] text-gray-100 font-sans">
        <Navbar />
        <div className="flex justify-center items-center h-[80vh]">
          <div className="text-2xl text-red-500 font-bold">챔피언을 찾을 수 없습니다.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f111a] text-gray-100 font-sans">
      <Navbar />
      
      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* 헤더 섹션 */}
        <div className="flex flex-col md:flex-row gap-8 mb-12">
          <div className={`relative w-40 h-40 md:w-56 md:h-56 rounded-2xl overflow-hidden border-4 shadow-2xl shrink-0 ${getCostColor(champion.cost).split(' ')[0]}`}>
            <FallbackImage 
              src={`/img/champions/${champion.character_id || champion.id}.png`} 
              fallbackSrc={champion.cdnImageUrl}
              alt={champion.name} 
              fill 
              className="object-cover" 
              unoptimized
            />
            <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-sm py-1 text-center font-bold text-white">
              {champion.cost} 코스트
            </div>
          </div>

          <div className="flex flex-col justify-center gap-4">
            <h1 className="text-5xl font-extrabold text-white tracking-tight">{champion.name}</h1>
            <div className="flex flex-wrap gap-2">
              {champion.traits?.map((trait, idx) => (
                <span key={idx} className="px-3 py-1 bg-gray-800 border border-gray-600 rounded-full text-sm font-medium text-gray-300">
                  {trait}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2 text-sm text-gray-400 bg-gray-800/50 p-4 rounded-xl border border-gray-700/50">
              <div>체력: <span className="text-white font-bold">{champion.stats?.hp || '-'}</span></div>
              <div>마나: <span className="text-white font-bold">{champion.stats?.initialMana}/{champion.stats?.mana || '-'}</span></div>
              <div>공격력: <span className="text-white font-bold">{champion.stats?.damage || '-'}</span></div>
              <div>공격속도: <span className="text-white font-bold">{champion.stats?.attackSpeed || '-'}</span></div>
              <div>방어력: <span className="text-white font-bold">{champion.stats?.armor || '-'}</span></div>
              <div>마법저항: <span className="text-white font-bold">{champion.stats?.magicResist || '-'}</span></div>
              <div>사거리: <span className="text-white font-bold">{champion.stats?.range || '-'}</span></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 스킬 정보 섹션 */}
          <div className="lg:col-span-2 bg-gray-800/40 border border-gray-700 rounded-2xl p-6 shadow-lg backdrop-blur-sm">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span className="text-blue-400">✦</span> 스킬 정보
            </h2>
            {champion.ability ? (
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="relative w-20 h-20 shrink-0 rounded-xl overflow-hidden border-2 border-blue-500/50 shadow-lg bg-gray-900">
                  <Image 
                    src={`https://ddragon.leagueoflegends.com/cdn/16.1.1/img/tft-ability/${champion.ability.icon}`}
                    alt={champion.ability.name}
                    fill
                    className="object-cover"
                    onError={(e) => e.target.style.display = 'none'} // 스킬 아이콘 없을 시 숨김
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">{champion.ability.name}</h3>
                  <div 
                    className="text-gray-300 leading-relaxed text-sm space-y-2"
                    dangerouslySetInnerHTML={{ __html: parseSkillDesc(champion.ability.desc) }}
                  />
                </div>
              </div>
            ) : (
              <p className="text-gray-500">스킬 정보가 없습니다.</p>
            )}
          </div>

          {/* 추천 아이템 섹션 */}
          <div className="bg-gray-800/40 border border-gray-700 rounded-2xl p-6 shadow-lg backdrop-blur-sm">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span className="text-yellow-400">★</span> 추천 아이템
            </h2>
            <div className="space-y-4">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 bg-gray-900/50 p-3 rounded-xl border border-gray-700/50 hover:border-yellow-500/50 transition-colors">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-600 shrink-0">
                    <FallbackImage 
                      src={`/img/items/${item.id}.png`}
                      fallbackSrc={item.cdnImageUrl}
                      alt={item.name} 
                      fill 
                      className="object-cover" 
                      unoptimized
                    />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-gray-200">{item.name}</div>
                    <div className="text-xs text-gray-500 truncate w-40">{item.desc ? item.desc.replace(/<[^>]+>/g, '') : '설명 없음'}</div>
                  </div>
                </div>
              ))}
              {items.length === 0 && <p className="text-gray-500 text-sm">추천 아이템 정보를 불러올 수 없습니다.</p>}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
