import { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { useNavigate } from 'react-router-dom';

export default function MailPage() {
  const { action, gameGet } = useGame();
  const [mail, setMail] = useState([]);
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  const load = () => gameGet('/mail').then((d) => setMail(d.mail || d || [])).catch(() => {});

  useEffect(() => { load(); }, []);

  const read = async (mailId) => {
    await action('/mail/read', { mailId });
    load();
  };

  const readAll = async () => {
    await action('/mail/read-all', {}, 'All mail marked read');
    load();
  };

  const unread = mail.filter((m) => !m.read_status && !m.read).length;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-display text-lg text-mob-gold">Mail</h2>
        {unread > 0 && (
          <button className="btn-secondary text-xs" onClick={readAll}>Mark all read</button>
        )}
      </div>

      {selected ? (
        <div className="card">
          <button className="text-xs text-gray-500 mb-2" onClick={() => setSelected(null)}>← Back</button>
          <h3 className="font-semibold">{selected.subject || selected.title || 'Message'}</h3>
          <p className="text-xs text-gray-500 mt-1">{selected.created_at && new Date(selected.created_at).toLocaleString()}</p>
          <p className="text-sm text-gray-300 mt-3 whitespace-pre-wrap">{selected.body || selected.message}</p>
          {!selected.read_status && !selected.read && (
            <button className="btn-primary text-xs mt-3" onClick={() => { read(selected.id); setSelected({ ...selected, read_status: true }); }}>Mark read</button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {mail.map((m) => (
            <div
              key={m.id}
              className={`card cursor-pointer ${!m.read_status && !m.read ? 'border-mob-gold/40' : ''}`}
              onClick={() => {
                setSelected(m);
                if (!m.read_status && !m.read) read(m.id);
              }}
            >
              <div className="flex justify-between">
                <p className={`font-semibold text-sm ${!m.read_status && !m.read ? 'text-mob-gold' : ''}`}>
                  {!m.read_status && !m.read && '● '}{m.subject || m.title || m.mail_type}
                </p>
                <span className="text-xs text-gray-500">{m.created_at && new Date(m.created_at).toLocaleDateString()}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1 truncate">{(m.body || m.message || '').slice(0, 80)}</p>
            </div>
          ))}
          {mail.length === 0 && <p className="text-gray-500 text-sm text-center py-8">No mail</p>}
        </div>
      )}

      <button className="btn-secondary w-full text-sm" onClick={() => navigate('/')}>Back to Home</button>
    </div>
  );
}
