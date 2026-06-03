import { useState } from 'react';
import { Link } from 'react-router-dom';
import ItemImage from './ItemImage';
import { formatMoney } from '../api';
import { useGame } from '../context/GameContext';

function MobGearIcons({ side, label }) {
  if (!side) return null;
  const allItems = [
    ...(side.weapons || []).map((i) => ({ ...i, kind: 'weapon' })),
    ...(side.armor || []).map((i) => ({ ...i, kind: 'armor' })),
    ...(side.vehicles || []).map((i) => ({ ...i, kind: 'vehicle' })),
  ].slice(0, side.usableMob || 4);

  return (
    <div className="mt-3">
      <p className="text-xs text-gray-300">
        {label} mob of {side.usableMob || side.effectiveMob || 1} used:
      </p>
      <div className="flex flex-wrap gap-2 mt-2">
        {allItems.length === 0 && <span className="text-[10px] text-gray-500">Bare fists</span>}
        {allItems.map((item) => (
          <div key={`${item.id}-${item.kind}`} className="text-center">
            <ItemImage src={item.thumbnail} alt={item.name} size="list" eager />
            <p className="text-[9px] text-gray-500">x{item.qtyUsed || 1}</p>
          </div>
        ))}
        {(side.weapons?.length + side.armor?.length + side.vehicles?.length || 0) > allItems.length && (
          <Link to="#" className="text-[10px] text-red-400 self-center" onClick={(e) => e.preventDefault()}>more</Link>
        )}
      </div>
    </div>
  );
}

export default function FightResultModal({
  report,
  perspective = 'attacker',
  opponentName,
  opponentId,
  onClose,
  onAttackAgain,
}) {
  const { action } = useGame();
  const [comment, setComment] = useState('');
  const [commentSent, setCommentSent] = useState(false);

  if (!report) return null;

  const won = perspective === 'attacker' ? report.attackerWon : !report.attackerWon;
  const defName = opponentName || report.defenderName || 'rival';
  const defId = opponentId || report.defenderId;
  const dmgDealt = perspective === 'attacker'
    ? (report.defenderDamageTaken || 0)
    : (report.attackerDamageTaken || 0);
  const dmgTaken = perspective === 'attacker'
    ? (report.attackerDamageTaken || 0)
    : (report.defenderDamageTaken || 0);
  const xp = report.xpGained || 0;
  const money = report.moneyStolen || 0;

  const headline = won ? 'Eccellente!' : 'You lost!';

  const postComment = async () => {
    if (!defId || comment.trim().length < 2) return;
    try {
      await action(`/player/${defId}/comments`, { body: comment.trim() }, 'Comment posted!');
      setCommentSent(true);
      setComment('');
    } catch { /* handled */ }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 p-0 sm:p-4">
      <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto imob-fight-result animate-fade-up">
        <div className="p-4 border-b border-white/20">
          <h2 className={`font-display text-xl ${won ? 'text-green-400' : 'text-red-400'}`}>{headline}</h2>
          <p className="text-sm text-gray-200 mt-2 leading-relaxed">
            {won ? (
              <>
                You won the fight, taking {dmgTaken} damage while dealing {dmgDealt} damage to{' '}
                {defId ? <Link to={`/player/${defId}`} className="text-red-400 underline">{defName}</Link> : defName}.
                {' '}You took {formatMoney(money)} and gained {xp} experience points.
              </>
            ) : (
              <>
                You lost the fight, taking {dmgTaken} damage while dealing {dmgDealt} damage to{' '}
                {defId ? <Link to={`/player/${defId}`} className="text-red-400 underline">{defName}</Link> : defName}.
              </>
            )}
          </p>
          {report.bountyClaimed > 0 && (
            <p className="text-xs text-green-400 mt-1">+ Hitlist bonus {formatMoney(report.bountyClaimed)}</p>
          )}
        </div>

        <div className="p-4 space-y-1">
          <MobGearIcons side={report.attacker} label="Your" />
          <MobGearIcons side={report.defender} label={`${defName}'s`} />
        </div>

        <div className="p-4 space-y-2 border-t border-white/10">
          {!commentSent && defId && perspective === 'attacker' && (
            <div className="flex gap-2 mb-2">
              <input
                className="flex-1 px-3 py-2 rounded bg-black border border-red-950 text-sm"
                placeholder="Leave a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={500}
              />
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            {defId && perspective === 'attacker' && !commentSent && (
              <button type="button" className="imob-btn-secondary py-3" onClick={postComment} disabled={comment.trim().length < 2}>
                Leave Comment
              </button>
            )}
            {commentSent && (
              <p className="col-span-2 text-xs text-green-400 text-center">Comment posted!</p>
            )}
            {onAttackAgain && perspective === 'attacker' && (
              <button type="button" className="imob-btn-secondary py-3" onClick={onAttackAgain}>
                Attack Again
              </button>
            )}
            <button
              type="button"
              className={`imob-btn-secondary py-3 ${(!onAttackAgain || perspective !== 'attacker') ? 'col-span-2' : ''}`}
              onClick={onClose}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
