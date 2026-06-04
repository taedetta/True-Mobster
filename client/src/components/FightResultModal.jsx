import { useState } from 'react';
import { Link } from 'react-router-dom';
import ItemImage from './ItemImage';
import { formatMoney } from '../api';
import { useGame } from '../context/GameContext';
import { t } from '../../../shared/uiStrings.js';

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
            <p className="text-[9px] text-gray-500 truncate max-w-[72px]">{item.name}</p>
            <p className="text-[9px] text-gray-500">
              {(item.attack > 0 || item.defense > 0)
                ? `${item.attack ? `${item.attack}A` : ''}${item.attack && item.defense ? '/' : ''}${item.defense ? `${item.defense}D` : ''}`
                : `x${item.qtyUsed || 1}`}
            </p>
            <p className="text-[9px] text-gray-600">×{item.qtyUsed || 1} mob</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ItemsLostRow({ side, label }) {
  const lost = side?.itemsLost || [];
  if (lost.length === 0) return null;
  return (
    <div className="mt-2 p-2 rounded bg-red-950/40 border border-red-900/50">
      <p className="text-[10px] text-red-300 font-semibold uppercase tracking-wide">{label} lost:</p>
      <div className="flex flex-wrap gap-2 mt-1">
        {lost.map((item) => (
          <div key={`lost-${item.id}-${item.category}`} className="text-center opacity-80">
            <ItemImage src={item.thumbnail} alt={item.name} size="list" eager />
            <p className="text-[9px] text-red-400">-{item.qtyLost}x {item.name}</p>
          </div>
        ))}
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
  const { action, state } = useGame();
  const [comment, setComment] = useState('');
  const [commentSent, setCommentSent] = useState(false);

  if (!report) return null;

  const won = perspective === 'attacker' ? report.attackerWon : !report.attackerWon;
  const youSide = perspective === 'attacker' ? report.attacker : report.defender;
  const themSide = perspective === 'attacker' ? report.defender : report.attacker;
  const youLabel = perspective === 'attacker' ? 'Your' : 'Your';
  const themLabel = perspective === 'attacker'
    ? `${opponentName || report.defenderName || 'Rival'}'s`
    : `${opponentName || report.attacker?.name || 'Rival'}'s`;
  const defName = opponentName || report.defenderName || 'rival';
  const defId = perspective === 'attacker' ? (opponentId || report.defenderId) : report.attacker?.userId;
  const dmgDealt = perspective === 'attacker'
    ? (report.defenderDamageTaken || 0)
    : (report.attackerDamageTaken || 0);
  const dmgTaken = perspective === 'attacker'
    ? (report.attackerDamageTaken || 0)
    : (report.defenderDamageTaken || 0);
  const xp = report.xpGained || 0;
  const money = perspective === 'attacker' && report.attackerWon ? (report.moneyStolen || 0) : 0;
  const cashLost = perspective === 'attacker' && !report.attackerWon ? (report.moneyLost || 0) : 0;
  const atkPower = report.attackerPower ?? report.attacker?.fightAttack ?? report.attacker?.attack;
  const defPower = report.defenderPower ?? report.defender?.fightDefense ?? report.defender?.defense;
  const youLost = youSide?.itemsLost || [];
  const themLost = themSide?.itemsLost || [];

  const locale = state?.locale || 'en';
  const headline = won ? t('fightVictory', locale) : t('fightLost', locale);

  const postComment = async () => {
    if (!defId || comment.trim().length < 2) return;
    try {
      await action(`/player/${defId}/comments`, { body: comment.trim() }, 'Comment posted!');
      setCommentSent(true);
      setComment('');
    } catch { /* handled */ }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/85 p-0 sm:p-4">
      <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto imob-fight-result animate-fade-up">
        <div className="p-4 border-b border-yellow-900/40">
          <h2 className={`font-display text-2xl text-center ${won ? 'text-green-400' : 'text-red-400'}`}>{headline}</h2>
          <p className="text-sm text-gray-200 mt-3 leading-relaxed">
            {won ? (
              <>
                You won the fight, taking {dmgTaken} damage while dealing {dmgDealt} damage to{' '}
                {defId && perspective === 'attacker' ? (
                  <Link to={`/player/${defId}`} className="text-yellow-400 underline">{defName}</Link>
                ) : defName}.
                {money > 0 ? <> You took {formatMoney(money)}.</> : null}
                {report.respectGained > 0 ? <> +{report.respectGained} respect.</> : null}
                {' '}You gained {xp} experience points.
              </>
            ) : (
              <>
                You lost the fight, taking {dmgTaken} damage while dealing {dmgDealt} damage to{' '}
                {defId && perspective === 'attacker' ? (
                  <Link to={`/player/${defId}`} className="text-yellow-400 underline">{defName}</Link>
                ) : defName}.
                {cashLost > 0 ? <> You lost {formatMoney(cashLost)}.</> : null}
                {' '}You gained {xp} experience points.
              </>
            )}
          </p>
          {atkPower != null && defPower != null && (
            <p className="text-[11px] text-gray-400 mt-2 text-center">
              Your attack power {atkPower} vs their defense {defPower}
              {report.winChance != null ? ` · ${report.winChance}% estimated odds` : ''}
            </p>
          )}
          {report.bountyClaimed > 0 && won && (
            <p className="text-xs text-green-400 mt-2 text-center">+ Hitlist bonus {formatMoney(report.bountyClaimed)}</p>
          )}
        </div>

        <div className="p-4 space-y-1 bg-black/40">
          <MobGearIcons side={youSide} label={youLabel} />
          <ItemsLostRow side={youSide} label={youLabel} />
          <MobGearIcons side={themSide} label={themLabel} />
          <ItemsLostRow side={themSide} label={themLabel} />
          {youLost.length === 0 && themLost.length === 0 && (
            <p className="text-[10px] text-gray-500 text-center pt-2">No equipment lost this fight</p>
          )}
        </div>

        <div className="p-4 space-y-2 border-t border-yellow-900/30">
          {!commentSent && defId && perspective === 'attacker' && (
            <input
              className="w-full px-3 py-2 rounded bg-black border border-yellow-950 text-sm mb-2"
              placeholder="Leave a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={500}
            />
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
              <button type="button" className="imob-btn-primary py-3" onClick={onAttackAgain}>
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
