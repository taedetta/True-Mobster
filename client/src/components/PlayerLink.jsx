import { Link } from 'react-router-dom';

/** iMobsters-style clickable player name (and optional avatar). */
export default function PlayerLink({ userId, name, avatarUrl, className = '', avatarClassName = 'w-6 h-6' }) {
  if (!userId || !name) return <span className={className}>{name || 'Unknown'}</span>;
  return (
    <Link to={`/player/${userId}`} className={`inline-flex items-center gap-1.5 hover:text-mob-gold hover:underline ${className}`}>
      {avatarUrl && (
        <img
          src={avatarUrl}
          alt=""
          className={`rounded-full object-cover bg-mob-bg border border-mob-border flex-shrink-0 ${avatarClassName}`}
        />
      )}
      <span className="truncate">{name}</span>
    </Link>
  );
}
