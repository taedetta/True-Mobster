import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { api } from '../api';

export default function PlayerProfilePage() {
  const { userId } = useParams();
  const { state, showMessage } = useGame();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api(`/game/player/${userId}`)
      .then(setProfile)
      .catch((e) => showMessage(e.message || 'Player not found', 'error'))
      .finally(() => setLoading(false));
  }, [userId, showMessage]);

  if (loading) return <p className="text-gray-500 text-center py-8">Loading profile...</p>;
  if (!profile) return <p className="text-gray-500 text-center py-8">Player not found</p>;

  const isSelf = state?.user_id === profile.user_id;

  const copyCode = () => {
    if (profile.referral_code) {
      navigator.clipboard.writeText(profile.referral_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const sendMessage = () => {
    navigate('/chat', { state: { pmTo: profile.display_name } });
  };

  const fightPlayer = () => {
    navigate('/fight', { state: { targetId: profile.user_id } });
  };

  return (
    <div className="space-y-4">
      <div className="card-premium flex gap-4 items-start">
        <img
          src={profile.avatar_url || '/assets/avatars/default_01.svg'}
          alt=""
          className="w-20 h-20 rounded-full border-2 border-mob-gold object-cover bg-mob-bg"
        />
        <div className="flex-1 min-w-0">
          <h2 className="font-display text-xl text-mob-gold truncate">{profile.display_name}</h2>
          <p className="text-sm text-gray-400">Level {profile.level} · {profile.respect?.toLocaleString()} Respect</p>
          <p className="text-xs text-gray-500 mt-1">Mob {profile.mob_size} · {profile.wins}W / {profile.losses}L · {profile.kills} kills</p>
          {profile.crew_role && <p className="text-xs text-purple-400 mt-1 capitalize">{profile.crew_role}</p>}
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold text-sm mb-2">Combat</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <span className="text-gray-400">Attack</span><span className="text-right text-mob-gold">{profile.combat?.attack || 0}</span>
          <span className="text-gray-400">Defense</span><span className="text-right text-mob-gold">{profile.combat?.defense || 0}</span>
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold text-sm mb-2">Equipped</h3>
        <div className="space-y-1 text-sm text-gray-300">
          <p>⚔️ {profile.equipped?.weapon || 'None'}</p>
          <p>🛡 {profile.equipped?.armor || 'None'}</p>
          <p>🚗 {profile.equipped?.vehicle || 'None'}</p>
        </div>
      </div>

      {profile.referral_code && (
        <div className="card">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Mob Code</p>
          <div className="flex justify-between items-center gap-2">
            <p className="font-mono text-mob-gold font-bold tracking-widest">{profile.referral_code}</p>
            <button type="button" className="btn-secondary text-xs" onClick={copyCode}>{copied ? 'Copied!' : 'Copy'}</button>
          </div>
        </div>
      )}

      {!isSelf && (
        <div className="grid grid-cols-2 gap-2">
          <button type="button" className="btn-secondary text-sm" onClick={sendMessage}>Send Message</button>
          <button type="button" className="btn-danger text-sm" onClick={fightPlayer}>Fight</button>
        </div>
      )}

      {isSelf && (
        <Link to="/profile" className="btn-primary w-full text-sm text-center block">Edit My Profile</Link>
      )}

      <button type="button" className="btn-secondary w-full text-sm" onClick={() => navigate(-1)}>← Back</button>
    </div>
  );
}
