import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { api, formatMoney } from '../api';
import FightResultModal from '../components/FightResultModal';
import PlayerLink from '../components/PlayerLink';

const STAMINA_COST = 1;

export default function FightPage() {
  const { state, action, showMessage, gameGet } = useGame();
  const location = useLocation();
  const [targets, setTargets] = useState([]);
  const [revenge, setRevenge] = useState([]);
  const [history, setHistory] = useState([]);
  const [busy, setBusy] = useState(null);
  const [tab, setTab] = useState('rivals');
  const [fightResult, setFightResult] = useState(null);
  const [resultOpponent, setResultOpponent] = useState('');
  const [resultOpponentId, setResultOpponentId] = useState(null);
  const [resultPerspective, setResultPerspective] = useState('attacker');

  const loadLists = useCallback(() => {
    api('/game/fight-list').then(setTargets).catch(() => {});
    api('/game/combat-history').then(setHistory).catch(() => {});
    gameGet('/revenge').then((d) => setRevenge(Array.isArray(d) ? d : d.players || [])).catch(() => {});
  }, [gameGet]);

  useEffect(() => {
    if (!state) return;
    loadLists();
  }, [state?.user_id, loadLists]);

  useEffect(() => {
    if (location.state?.targetId) setTab('rivals');
  }, [location.state]);

  const fight = async (targetId, name) => {
    if (state.health <= 0) {
      showMessage('You need hospital treatment before you can fight!', 'error');
      return;
    }
    setBusy(targetId);
    try {
      const result = await action('/fight', { targetId });
      if (result?.fightReport) {
        setFightResult(result.fightReport);
        setResultOpponent(name);
        setResultOpponentId(targetId);
        setResultPerspective('attacker');
      } else {
        showMessage(
          result?.attackerWon ? `Victory vs ${name}! +${formatMoney(result.moneyStolen)}` : `Defeated by ${name}`,
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
      setResultOpponentId(entry.opponent_id || entry.fightReport?.defenderId);
      setResultPerspective(entry.isAttacker ? 'attacker' : 'defender');
    }
  };

  if (!state) return null;

  const playerHospitalized = state.health <= 0;
  const bracket = state.mob_bracket;

  const renderTarget = (t) => {
    const targetHospitalized = (t.health ?? 100) <= 0;
    const canAttack = !playerHospitalized && !targetHospitalized && state.stamina >= STAMINA_COST;

    return (
      <div key={t.user_id} className="card flex items-center gap-3">
        <Link to={`/player/${t.user_id}`} className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-mob-border bg-mob-bg">
          <img
            src={t.avatar_url || '/assets/avatars/default_01.svg'}
            alt=""
            className="w-full h-full object-cover"
          />
        </Link>
        <div className="flex-1 min-w-0">
          <PlayerLink userId={t.user_id} name={t.display_name} className="font-semibold text-sm" />
          <p className="text-xs text-gray-400">Lv.{t.level} · {t.respect || 0} respect · Mob {t.effective_mob || t.mob_size}</p>
          <p className={`text-xs ${targetHospitalized ? 'text-red-500 font-bold' : 'text-red-400'}`}>
            {targetHospitalized ? '🏥 Hospitalized' : `HP ${t.health}/${t.max_health || 100}`}
          </p>
        </div>
        <button
          type="button"
          className="btn-danger text-xs px-3 flex-shrink-0"
          disabled={!canAttack || busy === t.user_id}
          onClick={() => fight(t.user_id, t.display_name)}
        >
          {busy === t.user_id ? '...' : playerHospitalized ? 'Hospitalized' : 'Attack'}
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {playerHospitalized && (
        <div className="imob-warning border-red-800/60">
          <p className="text-red-400 font-bold text-sm">You are hospitalized!</p>
          <p className="text-xs text-gray-300 mt-1">Heal at the hospital before attacking rivals.</p>
          <Link to="/hospital" className="btn-primary text-xs mt-2 w-full block text-center">Go to Hospital</Link>
        </div>
      )}

      {fightResult && (
        <FightResultModal
          report={fightResult}
          perspective={resultPerspective}
          opponentName={resultOpponent}
          opponentId={resultOpponentId || fightResult.defenderId}
          onClose={() => { setFightResult(null); setResultOpponentId(null); }}
          onAttackAgain={resultPerspective === 'attacker' && resultOpponentId ? () => {
            const id = resultOpponentId;
            const name = resultOpponent;
            setFightResult(null);
            fight(id, name);
          } : undefined}
        />
      )}

      <div className="flex gap-2 mb-2">
        <span className="flex-1 imob-btn-primary py-2 text-sm pointer-events-none">Attack Rival Mob</span>
        <Link to="/hitlist" className="imob-btn-secondary px-4 py-2 text-xs flex items-center">Hitlist</Link>
      </div>

      {bracket && (
        <p className="text-[10px] text-center text-gray-500">
          Mob bracket {bracket.min}–{bracket.max} · Usable in fight: {state.usable_mob_in_fight}
        </p>
      )}

      <div className="flex gap-1 flex-wrap">
        {[
          { id: 'rivals', label: 'Rivals' },
          { id: 'revenge', label: 'Revenge' },
          { id: 'history', label: 'History' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex-1 min-w-[80px] py-2 rounded-lg text-xs border ${tab === t.id ? 'border-mob-gold bg-mob-gold/10 text-mob-gold' : 'border-mob-border'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'rivals' && (
        <div className="space-y-2">
          {targets.length === 0 && (
            <p className="text-gray-500 text-sm text-center">
              No rivals in your bracket right now — check back soon or grow your mob for more matchups.
            </p>
          )}
          {targets.map((t) => renderTarget(t))}
        </div>
      )}

      {tab === 'revenge' && (
        <div className="space-y-2">
          {revenge.length === 0 && <p className="text-gray-500 text-sm text-center">Nobody to revenge</p>}
          {revenge.map((t) => renderTarget({ ...t, max_health: t.max_health || 100 }))}
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
                <p className={`${h.playerWon ? 'text-green-400' : 'text-red-400'} flex items-center gap-1 flex-wrap`}>
                  <span>{h.playerWon ? 'Won' : 'Lost'} vs</span>
                  <PlayerLink userId={h.opponent_id} name={h.opponent_name || 'Unknown'} className="font-semibold" />
                </p>
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
