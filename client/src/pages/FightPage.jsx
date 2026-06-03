import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { api, formatMoney } from '../api';
import { uiAsset } from '../utils/assets';
import FightResultModal from '../components/FightResultModal';

const FIGHT_TYPES = [
  { id: 'slap', label: 'Slap', asset: 'fight-slap', stamina: 1, desc: 'Light hit, low risk' },
  { id: 'fight', label: 'Fight', asset: 'fight-fight', stamina: 1, desc: 'Standard brawl' },
  { id: 'execute', label: 'Execute', asset: 'fight-execute', stamina: 2, desc: 'High stakes, kill chance' },
];

export default function FightPage() {
  const { state, action, showMessage, gameGet } = useGame();
  const location = useLocation();
  const navigate = useNavigate();
  const [targets, setTargets] = useState([]);
  const [revenge, setRevenge] = useState([]);
  const [history, setHistory] = useState([]);
  const [busy, setBusy] = useState(null);
  const [tab, setTab] = useState('rivals');
  const [fightType, setFightType] = useState('fight');
  const [fightResult, setFightResult] = useState(null);
  const [resultOpponent, setResultOpponent] = useState('');
  const [resultPerspective, setResultPerspective] = useState('attacker');

  const loadLists = useCallback(() => {
    api('/game/fight-list').then(setTargets).catch(() => {});
    api('/game/combat-history').then(setHistory).catch(() => {});
    gameGet('/revenge').then((d) => setRevenge(d.players || d || [])).catch(() => {});
  }, [gameGet]);

  useEffect(() => {
    if (!state) return;
    loadLists();
  }, [state?.user_id, loadLists]);

  useEffect(() => {
    if (location.state?.targetId && targets.length) setTab('rivals');
  }, [location.state, targets]);

  const fight = async (targetId, name) => {
    setBusy(targetId);
    try {
      const result = await action('/fight', { targetId, fightType });
      if (result?.fightReport) {
        setFightResult(result.fightReport);
        setResultOpponent(name);
        setResultPerspective('attacker');
      } else {
        const typeLabel = FIGHT_TYPES.find((f) => f.id === fightType)?.label || 'Fight';
        showMessage(
          result?.attackerWon ? `${typeLabel} victory vs ${name}! +${formatMoney(result.moneyStolen)}` : `Defeated by ${name}`,
          result?.attackerWon ? 'success' : 'error',
        );
      }
      loadLists();
    } catch { /* handled */ }
    setBusy(null);
  };

  const openHistoryReport = (entry) => {
    if (entry.fightReport) {
      setFightResult(entry.fightReport);
      setResultOpponent(entry.opponent_name || 'Unknown');
      setResultPerspective(entry.isAttacker ? 'attacker' : 'defender');
    }
  };

  if (!state) return null;

  const selectedType = FIGHT_TYPES.find((f) => f.id === fightType);
  const staminaCost = selectedType?.stamina || 1;

  const renderTarget = (t) => (
    <div key={t.user_id} className="card flex items-center gap-3">
      <Link to={`/player/${t.user_id}`} className="w-10 h-10 rounded-full bg-gradient-to-br from-mob-crimson to-mob-bg flex items-center justify-center overflow-hidden flex-shrink-0">
        <span className="text-lg">{t.is_bot ? '🤖' : '👤'}</span>
      </Link>
      <div className="flex-1 min-w-0">
        <Link to={`/player/${t.user_id}`} className="font-semibold text-sm hover:text-mob-gold">{t.display_name}</Link>
        {t.is_bot && <span className="text-xs text-gray-500"> (Bot)</span>}
        <p className="text-xs text-gray-400">Lv.{t.level} · {t.respect} respect · Mob {t.effective_mob || t.mob_size}</p>
        <p className="text-xs text-red-400">HP {t.health}/{t.max_health}</p>
      </div>
      <button
        className="btn-danger text-xs px-3 flex-shrink-0"
        disabled={state.stamina < staminaCost || busy === t.user_id || t.health <= 0}
        onClick={() => fight(t.user_id, t.display_name)}
      >
        {busy === t.user_id ? '...' : selectedType?.label || 'Attack'}
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      {fightResult && (
        <FightResultModal
          report={fightResult}
          perspective={resultPerspective}
          opponentName={resultOpponent}
          onClose={() => setFightResult(null)}
        />
      )}

      <div className="card">
        <h3 className="font-semibold text-sm mb-2">Fight Type</h3>
        <div className="grid grid-cols-3 gap-2">
          {FIGHT_TYPES.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFightType(f.id)}
              className={`py-2 rounded-lg text-xs text-center border ${fightType === f.id ? 'border-mob-gold bg-mob-gold/10 text-mob-gold' : 'border-mob-border'}`}
            >
              <img src={uiAsset(f.asset)} alt="" className="w-10 h-10 object-contain mx-auto mb-1" loading="eager" decoding="async" />
              {f.label}
              <span className="block text-gray-500">💪{f.stamina}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">{selectedType?.desc}</p>
        <p className="text-[10px] text-gray-600 mt-1">Each mob member uses 1 weapon, armor & vehicle — losers may lose gear used.</p>
      </div>

      <div className="flex gap-1">
        {[
          { id: 'rivals', label: 'Rivals' },
          { id: 'revenge', label: 'Revenge' },
          { id: 'history', label: 'History' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2 rounded-lg text-xs border ${tab === t.id ? 'border-mob-gold bg-mob-gold/10 text-mob-gold' : 'border-mob-border'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'rivals' && (
        <div className="space-y-2">
          {targets.length === 0 && <p className="text-gray-500 text-sm text-center">No rivals in your bracket</p>}
          {targets.map(renderTarget)}
        </div>
      )}

      {tab === 'revenge' && (
        <div className="space-y-2">
          {revenge.length === 0 && <p className="text-gray-500 text-sm text-center">Nobody to revenge</p>}
          {revenge.map((t) => renderTarget({ ...t, user_id: t.user_id, display_name: t.display_name, level: t.level, respect: t.respect || 0, wins: t.wins || 0, losses: t.losses || 0, health: t.health || 100, max_health: t.max_health || 100 }))}
        </div>
      )}

      {tab === 'history' && (
        <div className="space-y-2">
          {history.length === 0 && <p className="text-gray-500 text-sm text-center">No combat history</p>}
          {history.map((h) => (
            <button
              key={h.id}
              type="button"
              className="card text-sm w-full text-left hover:border-mob-gold/30"
              onClick={() => openHistoryReport(h)}
            >
              <div className="flex justify-between items-start gap-2">
                <p className={h.playerWon ? 'text-green-400' : 'text-red-400'}>
                  {h.playerWon ? 'Won' : 'Lost'} vs {h.opponent_name || 'Unknown'}
                </p>
                <span className="text-[10px] text-gray-500 uppercase">{h.fight_type || 'fight'}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{new Date(h.created_at).toLocaleString()}</p>
              {h.money_stolen > 0 && h.isAttacker && h.attacker_won && (
                <p className="text-xs text-green-400 mt-1">+{formatMoney(h.money_stolen)}</p>
              )}
              {h.fightReport && <p className="text-[10px] text-mob-gold mt-1">Tap for full fight report →</p>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
