import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { api, formatMoney } from '../api';

export default function PlayerProfilePage() {
  const { userId } = useParams();
  const { state, action, showMessage } = useGame();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [bounty, setBounty] = useState(5000);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadComments = () => {
    api(`/game/player/${userId}/comments`).then((d) => setComments(d.comments || [])).catch(() => {});
  };

  useEffect(() => {
    setLoading(true);
    api(`/game/player/${userId}`)
      .then(setProfile)
      .catch((e) => showMessage(e.message || 'Player not found', 'error'))
      .finally(() => setLoading(false));
    loadComments();
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

  const postComment = async () => {
    await action(`/player/${userId}/comments`, { body: commentText }, 'Comment posted!');
    setCommentText('');
    loadComments();
  };

  const placeHit = async () => {
    await action('/hitlist', { targetId: userId, bounty: Number(bounty) }, 'Hit placed!');
  };

  const fightPlayer = () => navigate('/fight', { state: { targetId: profile.user_id } });

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
        <h3 className="font-semibold text-sm mb-2">Profile Comments</h3>
        {!isSelf && (
          <div className="flex gap-2 mb-3">
            <input
              className="flex-1 px-3 py-2 rounded-lg bg-mob-bg border border-mob-border text-sm"
              placeholder="Leave a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              maxLength={500}
            />
            <button type="button" className="btn-primary text-xs" disabled={commentText.trim().length < 2} onClick={postComment}>Post</button>
          </div>
        )}
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {comments.length === 0 && <p className="text-xs text-gray-500">No comments yet</p>}
          {comments.map((c) => (
            <div key={c.id} className="p-2 bg-mob-bg/50 rounded-lg text-sm">
              <Link to={`/player/${c.author_id}`} className="text-mob-gold text-xs font-semibold hover:underline">{c.author_name}</Link>
              <p className="text-gray-300 mt-1">{c.body}</p>
              <p className="text-[10px] text-gray-600 mt-1">{new Date(c.created_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>

      {!isSelf && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" className="btn-secondary text-sm" onClick={() => navigate('/chat', { state: { pmTo: profile.display_name } })}>Message</button>
            <button type="button" className="btn-danger text-sm" onClick={fightPlayer}>Attack</button>
          </div>

          <div className="card">
            <h3 className="font-semibold text-sm mb-2">Place Hit</h3>
            <input
              type="number"
              min={1000}
              className="w-full px-3 py-2 rounded-lg bg-mob-bg border border-mob-border mb-2 text-sm"
              value={bounty}
              onChange={(e) => setBounty(e.target.value)}
            />
            <button type="button" className="btn-danger w-full text-xs" onClick={placeHit}>
              Hitlist — {formatMoney(Number(bounty))} + fee
            </button>
          </div>
        </>
      )}

      {profile.referral_code && (
        <div className="card">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Mob Code</p>
          <div className="flex justify-between items-center gap-2">
            <p className="font-mono text-mob-gold font-bold tracking-widest">{profile.referral_code}</p>
            <button type="button" className="btn-secondary text-xs" onClick={copyCode}>{copied ? 'Copied!' : 'Copy'}</button>
          </div>
        </div>
      )}

      {isSelf && <Link to="/profile" className="btn-primary w-full text-sm text-center block">Edit My Profile</Link>}
      <button type="button" className="btn-secondary w-full text-sm" onClick={() => navigate(-1)}>← Back</button>
    </div>
  );
}
