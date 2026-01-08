'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';

export default function ItemsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortColumn, setSortColumn] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch('/api/ddragon/data/ko_KR/tft-item.json');
        const data = await res.json();
        let itemsArray = Object.values(data.data);

        // 가상 데이터 생성 (픽률, 승률) 및 상태 저장
        itemsArray = itemsArray.map(item => {
          const pickRate = 10 + (item.name.length % 15);
          const winRate = 50 + (item.name.length % 10);
          return { ...item, pickRate, winRate, type: item.description.includes('조합 아이템') ? 'component' : 'completed' };
        });

        setItems(itemsArray);
      } catch (error) {
        console.error('Failed to fetch items:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      if (column === 'winRate' || column === 'pickRate') {
        setSortDirection('desc');
      } else {
        setSortDirection('asc');
      }
    }
  };

  const sortedItems = [...items].sort((a, b) => {
    if (a[sortColumn] === undefined || b[sortColumn] === undefined) return 0;
    const order = sortDirection === 'asc' ? 1 : -1;

    if (typeof a[sortColumn] === 'string') {
      return a[sortColumn].localeCompare(b[sortColumn]) * order;
    }
    return (a[sortColumn] - b[sortColumn]) * order;
  });
  
  const SortArrow = ({ direction }) => {
    if (!direction) return null;
    return <span className="ml-1">{direction === 'asc' ? '▲' : '▼'}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">아이템 분석</h1>

        <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 shadow-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-700 text-gray-300 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold border-b border-gray-600">아이템</th>
                <th className="p-4 font-semibold border-b border-gray-600 cursor-pointer" onClick={() => handleSort('type')}>
                  종류
                  <SortArrow direction={sortColumn === 'type' ? sortDirection : null} />
                </th>
                <th className="p-4 font-semibold border-b border-gray-600 cursor-pointer" onClick={() => handleSort('pickRate')}>
                  픽률
                  <SortArrow direction={sortColumn === 'pickRate' ? sortDirection : null} />
                </th>
                <th className="p-4 font-semibold border-b border-gray-600 cursor-pointer" onClick={() => handleSort('winRate')}>
                  승률
                  <SortArrow direction={sortColumn === 'winRate' ? sortDirection : null} />
                </th>
                <th className="p-4 font-semibold border-b border-gray-600">설명</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-400">데이터 로딩 중...</td></tr>
              ) : sortedItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-700/50 transition-colors">
                  <td className="p-4 flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-900 rounded">
                      <Image 
                        src={`/img/items/${item.id}.png`}
                        alt={item.name} 
                        width={40} 
                        height={40} 
                        className="w-full h-full object-cover" 
                        unoptimized
                      />
                    </div>
                    <span className="font-bold text-white">{item.name}</span>
                  </td>
                  <td className="p-4 text-sm text-gray-300">{item.type === 'component' ? '조합' : '완성'}</td>
                  <td className="p-4 text-sm text-gray-300">{item.pickRate.toFixed(1)}%</td>
                  <td className="p-4 text-sm text-gray-300">{item.winRate.toFixed(1)}%</td>
                  <td className="p-4 text-sm text-gray-400" dangerouslySetInnerHTML={{ __html: item.description }}></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
