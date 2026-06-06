import { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { formatMoney } from '../api';
import PlayerLink from '../components/PlayerLink';

export default function MobPage() {
  const { state, action, gameGet, showMessage } = useGame();
  const [info, setInfo] = useState(null);
  const [allies, setAllies] = useState([]);
  const [amount, setAmount] = useState(1);
  const [allyCode, setAllyCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [broadcastMsg, setBroadcastMsg] = useState('');

  const refresh = () => {
    gameGet('/mob/info').then(setInfo).catch(() => {});
    gameGet('/mob/allies').then((d) => setAllies(d.allies || [])).catch(() => {});
  };

  useEffect(() => { refresh(); }, [state, gameGet]);

  if (!state) return null;

  const recruit = async () => {
    setBusy(true);
    try {
      await action('/mob/recruit', { amount: Number(amount) }, `Recruited ${amount} mobsters!`);
      refresh();
    } catch { /* handled */ }
    setBusy(false);
  };

  const addAlly = async () => {
    if (!allyCode.trim()) return;
    await action('/mob/ally/add', { referralCode: allyCode.trim().toUpperCase() }, 'Mob ally added!');
    setAllyCode('');
    refresh();
  };

  const removeAlly = async (allyId) => {
    await action('/mob/ally/remove', { allyId }, 'Ally removed');
    refresh();
  };

  const copyCode = () => {
    const code = info?.referralCode || state.referralCode;
    navigator.clipboard.writeText(code);
    setCopied(true);
    showMessage('Invite code copied!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const mobSize = info?.mob_size ?? state.mob_size ?? 0;
  const effective = info?.effective_mob_size ?? state.effective_mob_size ?? mobSize;
  const maxSize = info?.max_mob ?? 500;
  const bonus = info?.bonus ?? state.combat?.mobBonus ?? 0;
  const cost = info?.nextCost ?? info?.recruitCost;
  const myCode = info?.referralCode || state.referralCode;
  const bracket = state.mob_bracket;

  const sendBroadcast = async () => {
    if (!broadcastMsg.trim()) return;
    await action('/mob/broadcast', { message: broadcastMsg.trim() }, 'Broadcast sent to mob allies!');
    setBroadcastMsg('');
  };

  return (
    <div className="space-y-4">
      <div className="card bg-gradient-to-br from-red-950/30 to-mob-card">
        <h2 className="font-display text-lg text-mob-gold mb-2">Your Mob</h2>
        <p className="text-3xl font-bold">{mobSize} <span className="text-sm text-gray-400 font-normal">recruited</span></p>
        <p className="text-lg text-mob-gold mt-1">{effective} <span className="text-sm text-gray-400 font-normal">effective (with allies)</span></p>
        <p className="text-sm text-gray-400 mt-2">+{Math.round((bonus || 0) * 100)}% combat bonus</p>
        {bracket && (
          <p className="text-xs text-mob-gold mt-2">Fight bracket: {bracket.min}–{bracket.max} mob · Usable in fight: {state.usable_mob_in_fight}</p>
        )}
      </div>

      <div className="card">
        <h3 className="font-semibold text-sm mb-2">Broadcast to Mob</h3>
        <p className="text-[10px] text-gray-500 mb-2">Send a message to all your mob allies (appears in News & Mail)</p>
        <textarea
          className="w-full px-3 py-2 rounded-lg bg-mob-bg border border-mob-border text-sm mb-2 min-h-[60px]"
          placeholder="Request backup, share codes..."
          maxLength={280}
          value={broadcastMsg}
          onChange={(e) => setBroadcastMsg(e.target.value)}
        />
        <button type="button" className="btn-primary w-full text-sm" disabled={broadcastMsg.trim().length < 3} onClick={sendBroadcast}>
          Broadcast
        </button>
      </div>

      <div className="card">
        <h3 className="font-semibold text-sm mb-2">Your Invite Code</h3>
        <div className="flex gap-2">
          <code className="flex-1 text-center text-mob-gold font-bold tracking-widest bg-mob-bg py-2 rounded-lg">{myCode}</code>
          <button type="button" className="btn-primary text-xs" onClick={copyCode}>{copied ? 'Copied!' : 'Copy'}</button>
        </div>
        <p className="text-[10px] text-gray-500 mt-2">Others add your code to boost their mob — you both benefit in fights</p>
      </div>

      <div className="card">
        <h3 className="font-semibold mb-3">Add Mob Ally</h3>
        <p className="text-xs text-gray-400 mb-2">Enter a player&apos;s invite code to add their mob to yours</p>
        <div className="flex gap-2">
          <input
            className="flex-1 px-3 py-2 rounded-lg bg-mob-bg border border-mob-border text-sm font-mono uppercase"
            placeholder="INVITE CODE"
            value={allyCode}
            onChange={(e) => setAllyCode(e.target.value)}
          />
          <button type="button" className="btn-primary text-xs" onClick={addAlly}>Add</button>
        </div>
      </div>

      {allies.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-sm mb-2">Mob Allies ({allies.length})</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {allies.map((a) => (
              <div key={a.user_id} className="flex justify-between items-center text-sm border-b border-mob-border py-2 gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <img src={a.avatar_url || '/assets/avatars/default_01.svg'} alt="" className="w-8 h-8 rounded-full object-cover border border-mob-border bg-mob-bg flex-shrink-0" />
                  <div className="min-w-0">
                  <PlayerLink userId={a.user_id} name={a.display_name} className="font-semibold text-sm" />
                  <p className="text-xs text-gray-400">Mob {a.mob_size} · Lv.{a.level}</p>
                  </div>
                </div>
                <button type="button" className="btn-secondary text-xs text-red-400" onClick={() => removeAlly(a.user_id)}>Remove</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <h3 className="font-semibold mb-3">Recruit Mobsters</h3>
        {cost != null && <p className="text-xs text-gray-400 mb-2">Cost per recruit: {formatMoney(cost)}</p>}
        <input
          type="number"
          min={1}
          max={50}
          className="w-full px-3 py-2 rounded-lg bg-mob-bg border border-mob-border mb-3 text-sm"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button type="button" className="btn-primary w-full" onClick={recruit} disabled={busy || mobSize >= maxSize}>
          {busy ? 'Recruiting...' : `Recruit ${amount}`}
        </button>
      </div>
    </div>
  );
}
