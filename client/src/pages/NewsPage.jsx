import { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';

export default function NewsPage() {
  const { gameGet } = useGame();
  const [news, setNews] = useState([]);

  useEffect(() => {
    gameGet('/news').then((d) => setNews(d.news || d || [])).catch(() => {});
  }, [gameGet]);

  return (
    <div className="space-y-4">
      <h2 className="font-display text-lg text-mob-gold">City News</h2>
      <p className="text-xs text-gray-400">Latest happenings in the underworld</p>

      <div className="space-y-3">
        {news.map((n) => (
          <div key={n.id} className="card">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-sm">{n.title}</h3>
              <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                {n.created_at && new Date(n.created_at).toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm text-gray-300 mt-2">{n.body || n.content}</p>
            {n.author && <p className="text-xs text-gray-500 mt-2">— {n.author}</p>}
          </div>
        ))}
        {news.length === 0 && (
          <div className="card text-center text-gray-500 text-sm py-8">
            No news at the moment. Check back later.
          </div>
        )}
      </div>
    </div>
  );
}
