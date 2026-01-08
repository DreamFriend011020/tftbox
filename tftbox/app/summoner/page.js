'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '../components/Navbar';

export default function SummonerPage() {
  const searchParams = useSearchParams();
  const nameParam = searchParams.get('name');
  const tagParam = searchParams.get('tag');

  const [summoner, setSummoner] = useState(null);
  const [league, setLeague] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!nameParam || !tagParam) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        // 1. 소환사 정보
        const summonerRes = await fetch(`/api/summoner?name=${encodeURIComponent(nameParam)}&tag=${encodeURIComponent(tagParam)}`);
        if (!summonerRes.ok) throw new Error('소환사를 찾을 수 없습니다.');
        const summonerData = await summonerRes.json();
        setSummoner(summonerData);

        // 2. 랭크 및 매치 정보 병렬 요청
        const [leagueRes, matchesRes] = await Promise.all([
          summonerData.id ? fetch(`/api/summoner/league/${summonerData.id}`) : Promise.resolve({ ok: false }),
          fetch(`/api/summoner/matches?puuid=${summonerData.puuid}&count=10`)
        ]);

        if (leagueRes.ok) {
          const leagueData = await leagueRes.json();
          setLeague(leagueData);
        }

        if (matchesRes.ok) {
          const { matchIds } = await matchesRes.json();
          // 매치 상세 정보 조회
          const matchesData = await Promise.all(
            matchIds.map(id => fetch(`/api/match/${id}`).then(res => res.json()))
          );
          setMatches(matchesData);
        }
      } catch (err) {
        console.error(err);
        setError(err.message || '데이터 로딩 실패');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [nameParam, tagParam]);

  // 필터링된 매치
  const filteredMatches = matches.filter(match => {
    if (filter === 'all') return true;
    const isRanked = match.info.tft_game_type === 'standard';
    return filter === 'ranked' ? isRanked : !isRanked;
  });

  const getPlacementColor = (placement) => {
    if (placement === 1) return 'border-l-4 border-yellow-400 bg-yellow-900/20';
    if (placement <= 4) return 'border-l-4 border-blue-400 bg-blue-900/20';
    return 'border-l-4 border-gray-600 bg-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        {loading && <div className="text-center py-20 text-xl">데이터를 불러오는 중...</div>}
        {error && <div className="text-center py-20 text-red-400 text-xl">{error}</div>}

        {!loading && !error && summoner && (
          <>
            <section className="bg-gray-800 rounded-xl p-6 mb-8 shadow-lg flex flex-col md:flex-row items-center gap-6 border border-gray-700">
              <div className="relative">
                <Image 
                  src={`https://ddragon.leagueoflegends.com/cdn/13.21.1/img/profileicon/${summoner.profileIconId}.png`} 
                  alt="Profile" 
                  width={96}
                  height={96}
                  className="rounded-full border-4 border-gray-700"
                />
                <span className="absolute -bottom-2 -right-2 bg-gray-900 text-sm px-2 py-1 rounded-full border border-gray-600">
                  Lv.{summoner.summonerLevel}
                </span>
              </div>
              <div className="text-center md:text-left">
                <h2 className="text-3xl font-bold text-white">
                  {summoner.name} <span className="text-gray-500 text-xl">#{summoner.tag}</span>
                </h2>
                <div className="mt-2 text-yellow-400 font-medium text-lg">
                  {league && league.length > 0 
                    ? `${league[0].tier} ${league[0].rank} - ${league[0].leaguePoints} LP` 
                    : 'Unranked'}
                </div>
              </div>
            </section>

            <section>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">최근 매치</h2>
                <div className="flex gap-2 bg-gray-800 p-1 rounded-lg">
                  {['all', 'ranked', 'normal'].map(f => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-4 py-1.5 rounded text-sm transition-colors ${filter === f ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                      {f === 'all' ? '전체' : f === 'ranked' ? '랭크' : '일반'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {filteredMatches.map((match) => {
                  const me = match.info.participants.find(p => p.puuid === summoner.puuid);
                  if (!me) return null;
                  
                  return (
                    <div key={match.metadata.matchId} className={`rounded-lg p-4 flex flex-col md:flex-row items-center justify-between gap-4 transition-all hover:bg-gray-700/50 ${getPlacementColor(me.placement)}`}>
                      <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="text-center min-w-[3rem]">
                          <span className={`text-2xl font-bold ${me.placement === 1 ? 'text-yellow-400' : 'text-white'}`}>#{me.placement}</span>
                          <div className="text-xs text-gray-400">등</div>
                        </div>
                        <div className="text-sm text-gray-300">
                          <div className="font-bold text-white">{match.info.tft_game_type === 'standard' ? '랭크' : '일반'}</div>
                          <div>{(match.info.game_length / 60).toFixed(0)}분</div>
                        </div>
                      </div>

                      <div className="flex flex-wrap justify-center gap-1">
                        {me.units.map((unit, idx) => (
                          <div key={idx} className="relative group w-10 h-10 bg-gray-800 rounded border border-gray-600 overflow-hidden">
                            <img 
                                src={`/api/ddragon/champion/${unit.character_id.split('_').pop()}`}
                                alt={unit.character_id}
                                className="w-full h-full object-cover"
                                onError={(e) => {e.target.style.display='none'}}
                            />
                            <div className="absolute bottom-0 right-0 bg-black/70 text-[10px] px-1 text-white">{unit.tier}★</div>
                          </div>
                        ))}
                      </div>

                      <div className="text-right text-sm text-gray-400 min-w-[4rem]">
                        <div>Lv.{me.level}</div>
                        <div>{me.gold_left} G</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
