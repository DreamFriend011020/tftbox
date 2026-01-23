'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import Navbar from '../../components/Navbar';
import { ITEM_DESCRIPTIONS } from '../../../utils/itemDescriptions';

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

export default function ItemDetailPage() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [recipeItems, setRecipeItems] = useState([]);
  const [recommendedChampions, setRecommendedChampions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. 아이템 데이터 가져오기
        let itemRes = await fetch('/api/ddragon/data/ko_KR/tft-item.json');
        if (!itemRes.ok) {
          itemRes = await fetch('https://ddragon.leagueoflegends.com/cdn/16.1.1/data/ko_KR/tft-item.json');
        }
        const itemData = await itemRes.json();
        const allItems = itemData.data;
        
        // ID로 아이템 찾기 (키값이 ID인 경우와 객체 내부 id 속성이 ID인 경우 모두 고려)
        let foundItem = allItems[id];
        if (!foundItem) {
             foundItem = Object.values(allItems).find(i => String(i.id) === String(id) || i.apiName === id);
        }

        if (foundItem) {
          foundItem.cdnImageUrl = `https://ddragon.leagueoflegends.com/cdn/16.1.1/img/tft-item/${foundItem.image?.full || foundItem.id + '.png'}`;
          setItem(foundItem);

          // 조합식 아이템 찾기
          if (foundItem.from && foundItem.from.length > 0) {
             const recipes = foundItem.from.map(recipeId => {
                 let rItem = Object.values(allItems).find(i => String(i.id) === String(recipeId));
                 if (rItem) {
                     return {
                         ...rItem,
                         cdnImageUrl: `https://ddragon.leagueoflegends.com/cdn/16.1.1/img/tft-item/${rItem.image?.full || rItem.id + '.png'}`
                     };
                 }
                 return null;
             }).filter(Boolean);
             setRecipeItems(recipes);
          }
        }

        // 2. 챔피언 데이터 가져오기 (추천 챔피언용)
        let champRes = await fetch('/api/ddragon/data/ko_KR/tft-champion.json');
        if (!champRes.ok) {
          champRes = await fetch('https://ddragon.leagueoflegends.com/cdn/16.1.1/data/ko_KR/tft-champion.json');
        }
        const champData = await champRes.json();
        const champsArray = Object.values(champData.data).filter(c => c.tier !== undefined);
        
        // 가상 추천 챔피언 로직: 아이템 ID를 시드로 사용하여 일관된 랜덤 챔피언 선택
        if (foundItem) {
          const seed = (foundItem.name || "").length + (parseInt(foundItem.id) || 0);
          const recommended = [
            champsArray[seed % champsArray.length],
            champsArray[(seed * 2) % champsArray.length],
            champsArray[(seed * 3) % champsArray.length],
            champsArray[(seed * 5) % champsArray.length]
          ].filter(Boolean).map(champ => ({
            ...champ,
            cdnImageUrl: `https://ddragon.leagueoflegends.com/cdn/16.1.1/img/tft-champion/${champ.image?.full || champ.id + '.png'}`
          }));
          
          // 중복 제거
          const uniqueRecommended = Array.from(new Set(recommended.map(c => c.id)))
            .map(id => recommended.find(c => c.id === id));
            
          setRecommendedChampions(uniqueRecommended);
        }

      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  // 아이템 설명 파싱 (items/page.js 로직 재사용)
  const parseItemDesc = (item) => {
    if (!item) return '';
    const localDesc = ITEM_DESCRIPTIONS[item.apiName] || ITEM_DESCRIPTIONS[item.id];
    const desc = localDesc || item.desc || item.description || '';
    
    let result = desc;
    const effects = item.effects || {};

    Object.entries(effects).forEach(([key, val]) => {
      if (val === undefined || val === null) return;
      result = result.replace(new RegExp(`@${key}(\\*100)?@`, 'gi'), `<strong class="text-white">${val}</strong>`);
    });

    result = result.replace(/<br\s*\/?>/gi, '<br/>').replace(/\n/g, '<br/>');
    result = result.replace(/<tftitemrules>/gi, '<div class="mt-2 text-sm text-gray-400 leading-tight pt-2 border-t border-gray-700">').replace(/<\/tftitemrules>/gi, '</div>');
    result = result.replace(/<([a-zA-Z]+)[^>]*>(.*?)<\/\1>/g, '<span class="text-blue-300">$2</span>');
    
    const iconMap = { 'scaleAD': 'ad', 'scaleAP': 'ap', 'scaleArmor': 'armor', 'scaleMR': 'mr', 'scaleHealth': 'health', 'scaleMana': 'mana', 'scaleManaRe': 'manaregeneration', 'scaleAttackSpeed': 'attackspeed', 'scaleCrit': 'crit', 'scaleSV': 'vamp', 'scaleDamage': 'damage', 'scaleDuration': 'durability' };
    result = result.replace(/%i:([^%]+)%/g, (match, type) => iconMap[type] ? `<img src="/img/stats/${iconMap[type]}.png" alt="${type}" class="inline-block w-4 h-4 mr-1 align-middle opacity-90" />` : '');

    return result;
  };

  if (loading) return <div className="min-h-screen bg-[#0f111a] text-gray-100 font-sans"><Navbar /><div className="flex justify-center items-center h-[80vh]"><div className="text-2xl text-blue-500 animate-pulse font-bold">아이템 정보를 불러오는 중...</div></div></div>;
  if (!item) return <div className="min-h-screen bg-[#0f111a] text-gray-100 font-sans"><Navbar /><div className="flex justify-center items-center h-[80vh]"><div className="text-2xl text-red-500 font-bold">아이템을 찾을 수 없습니다.</div></div></div>;

  return (
    <div className="min-h-screen bg-[#0f111a] text-gray-100 font-sans">
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row gap-8 mb-12 items-start">
          <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden border-2 border-gray-600 shadow-2xl shrink-0">
            <FallbackImage src={`/img/items/${item.id}.png`} fallbackSrc={item.cdnImageUrl} alt={item.name} fill className="object-cover" unoptimized />
          </div>
          <div className="flex flex-col gap-4 flex-1">
            <h1 className="text-4xl font-extrabold text-white tracking-tight">{item.name}</h1>
            <div className="text-gray-300 leading-relaxed text-base bg-gray-800/50 p-5 rounded-xl border border-gray-700/50" dangerouslySetInnerHTML={{ __html: parseItemDesc(item) }} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gray-800/40 border border-gray-700 rounded-2xl p-6 shadow-lg backdrop-blur-sm">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><span className="text-green-400">⚒️</span> 조합식</h2>
            {recipeItems.length > 0 ? (
              <div className="flex items-center gap-4 justify-center bg-gray-900/50 p-6 rounded-xl">
                {recipeItems.map((rItem, idx) => (
                    <div key={idx} className="flex items-center">
                        <div className="flex flex-col items-center gap-2 group">
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-600 group-hover:border-green-400 transition-colors">
                                <FallbackImage src={`/img/items/${rItem.id}.png`} fallbackSrc={rItem.cdnImageUrl} alt={rItem.name} fill className="object-cover" unoptimized />
                            </div>
                            <span className="text-xs text-gray-400 group-hover:text-white transition-colors">{rItem.name}</span>
                        </div>
                        {idx < recipeItems.length - 1 && <span className="text-2xl text-gray-500 mx-4 font-bold">+</span>}
                    </div>
                ))}
              </div>
            ) : <p className="text-gray-500 text-center py-8">조합식이 없는 아이템입니다.</p>}
          </div>

          <div className="bg-gray-800/40 border border-gray-700 rounded-2xl p-6 shadow-lg backdrop-blur-sm">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><span className="text-yellow-400">★</span> 잘 어울리는 챔피언</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recommendedChampions.map((champ, idx) => (
                <div key={idx} className="flex items-center gap-4 bg-gray-900/50 p-3 rounded-xl border border-gray-700/50 hover:border-yellow-500/50 transition-colors">
                  <div className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 shrink-0 ${champ.cost === 7 ? 'border-orange-500' : champ.cost === 5 ? 'border-yellow-500' : champ.cost === 4 ? 'border-purple-500' : champ.cost === 3 ? 'border-blue-500' : champ.cost === 2 ? 'border-green-500' : 'border-gray-500'}`}>
                    <FallbackImage src={`/img/champions/${champ.character_id || champ.id}.png`} fallbackSrc={champ.cdnImageUrl} alt={champ.name} fill className="object-cover" unoptimized />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-gray-200">{champ.name}</div>
                    <div className="text-xs text-gray-500">{champ.traits?.join(', ')}</div>
                  </div>
                </div>
              ))}
              {recommendedChampions.length === 0 && <p className="text-gray-500 text-sm">추천 챔피언 정보를 불러올 수 없습니다.</p>}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
