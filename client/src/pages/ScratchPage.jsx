import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { formatMoney } from '../api';

export default function ScratchPage() {
  const { state, action } = useGame();
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  const scratch = async () => {
    setBusy(true);
    setResult(null);
    try {
      const data = await action('/meta/scratch', {}, 'Scratch card played!');
      setResult(data.prize || data.result || data);
    } catch { /* handled */ }
    setBusy(false);
  };

  if (!state) return null;

  return (
    <div className="space-y-4">
      <h2 className="font-display text-lg text-mob-gold">Scratch Cards</h2>
      <div className="card text-center py-8 bg-gradient-to-br from-amber-900/20 to-mob-card">
        <div className="text-6xl mb-4">🎫</div>
        <p className="text-sm text-gray-400 mb-4">Try your luck — cost {formatMoney(1000)}</p>
        <button className="btn-primary" onClick={scratch} disabled={busy || state.money < 1000}>
          {busy ? 'Scratching...' : 'Buy & Scratch'}
        </button>
      </div>

      {result && (
        <div className="card border-mob-gold/50 text-center animate-pulse">
          <h3 className="font-display text-xl text-mob-gold">{result.label || 'You won!'}</h3>
          {result.money && <p className="text-green-400 mt-2">{formatMoney(result.money)}</p>}
          {result.gold && <p className="text-amber-400 mt-1">{result.gold} gold</p>}
          {result.energy && <p className="text-blue-400 mt-1">+{result.energy} energy</p>}
          {result.jackpot && <p className="text-xs text-mob-gold mt-2">🎰 JACKPOT!</p>}
        </div>
      )}
    </div>
  );
}
