import { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { formatMoney } from '../api';

const GIFT_TYPES = [
  { id: 'money', label: 'Cash', icon: '💵' },
  { id: 'energy', label: 'Energy', icon: '⚡' },
  { id: 'stamina', label: 'Stamina', icon: '💪' },
];

export default function SocialPage() {
  const { action, gameGet } = useGame();
  const [tab, setTab] = useState('friends');
  const [friends, setFriends] = useState([]);
  const [gifts, setGifts] = useState([]);
  const [username, setUsername] = useState('');
  const [giftForm, setGiftForm] = useState({ friendId: '', giftType: 'money', amount: 1000 });

  const loadFriends = () => gameGet('/social/friends').then((d) => setFriends(d.friends || d || [])).catch(() => {});
  const loadGifts = () => gameGet('/social/gifts').then((d) => setGifts(d.gifts || d || [])).catch(() => {});

  useEffect(() => {
    loadFriends();
    loadGifts();
  }, []);

  const addFriend = async () => {
    await action('/social/friend/add', { friendUsername: username }, 'Friend request sent!');
    setUsername('');
    loadFriends();
  };

  const removeFriend = async (friendId) => {
    await action('/social/friend/remove', { friendId }, 'Friend removed');
    loadFriends();
  };

  const claimAllGifts = async () => {
    await action('/social/gift/claim', {}, 'Gifts claimed!');
    loadGifts();
  };
  const sendGift = async () => {
    await action('/social/gift/send', giftForm, 'Gift sent!');
    loadGifts();
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button className={`flex-1 py-2 rounded-lg text-sm ${tab === 'friends' ? 'bg-mob-gold text-black font-semibold' : 'bg-mob-card border border-mob-border'}`} onClick={() => setTab('friends')}>Friends</button>
        <button className={`flex-1 py-2 rounded-lg text-sm ${tab === 'gifts' ? 'bg-mob-gold text-black font-semibold' : 'bg-mob-card border border-mob-border'}`} onClick={() => setTab('gifts')}>Gifts</button>
      </div>

      {tab === 'friends' && (
        <>
          <div className="card">
            <h3 className="font-semibold mb-2">Add Friend</h3>
            <div className="flex gap-2">
              <input className="flex-1 px-3 py-2 rounded-lg bg-mob-bg border border-mob-border text-sm" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
              <button className="btn-primary text-xs" onClick={addFriend} disabled={username.length < 2}>Add</button>
            </div>
          </div>
          <div className="space-y-2">
            {friends.map((f) => (
              <div key={f.id || f.user_id} className="card flex justify-between items-center">
                <div>
                  <p className="font-semibold text-sm">{f.display_name}</p>
                  <p className="text-xs text-gray-400">Lv.{f.level} · {f.respect} respect</p>
                </div>
                <button className="btn-secondary text-xs" onClick={() => removeFriend(f.id || f.friend_id || f.user_id)}>Remove</button>
              </div>
            ))}
            {friends.length === 0 && <p className="text-gray-500 text-sm text-center">No friends yet</p>}
          </div>
        </>
      )}

      {tab === 'gifts' && (
        <>
          <div className="card">
            <h3 className="font-semibold mb-2">Send Gift</h3>
            <select className="w-full px-3 py-2 rounded-lg bg-mob-bg border border-mob-border mb-2 text-sm" value={giftForm.friendId} onChange={(e) => setGiftForm({ ...giftForm, friendId: e.target.value })}>
              <option value="">Select friend</option>
              {friends.map((f) => (
                <option key={f.user_id} value={f.user_id}>{f.display_name}</option>
              ))}
            </select>
            <div className="flex gap-2 mb-2">
              {GIFT_TYPES.map((g) => (
                <button key={g.id} className={`flex-1 py-2 rounded-lg text-xs border ${giftForm.giftType === g.id ? 'border-mob-gold bg-mob-gold/10' : 'border-mob-border'}`} onClick={() => setGiftForm({ ...giftForm, giftType: g.id })}>
                  {g.icon} {g.label}
                </button>
              ))}
            </div>
            <input type="number" className="w-full px-3 py-2 rounded-lg bg-mob-bg border border-mob-border mb-2 text-sm" value={giftForm.amount} onChange={(e) => setGiftForm({ ...giftForm, amount: Number(e.target.value) })} />
            <button className="btn-primary w-full text-sm" onClick={sendGift} disabled={!giftForm.friendId}>Send Gift</button>
          </div>
          <h3 className="font-semibold text-sm flex justify-between items-center">
            Received Gifts
            {gifts.length > 0 && (
              <button type="button" className="btn-primary text-xs" onClick={claimAllGifts}>Claim All</button>
            )}
          </h3>
          <div className="space-y-2">
            {gifts.map((g) => (
              <div key={g.id} className="card text-sm">
                <p>From <span className="text-mob-gold">{g.from_name || g.sender_name}</span></p>
                <p className="text-xs text-gray-400">{g.gift_type}: {g.amount}</p>
              </div>
            ))}
            {gifts.length === 0 && <p className="text-gray-500 text-sm text-center">No gifts</p>}
          </div>
        </>
      )}
    </div>
  );
}
