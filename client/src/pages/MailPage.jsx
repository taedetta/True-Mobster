import { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { useNavigate } from 'react-router-dom';
import FightResultModal from '../components/FightResultModal';

export default function MailPage() {
  const { action, gameGet } = useGame();
  const [mail, setMail] = useState([]);
  const [selected, setSelected] = useState(null);
  const [fightReport, setFightReport] = useState(null);
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

  const openMail = (m) => {
    setSelected(m);
    if (!m.read_status && !m.read) read(m.id);
    if (m.data?.fightReport) setFightReport(m.data.fightReport);
  };

  const unread = mail.filter((m) => !m.read_status && !m.read).length;

  return (
    <div className="space-y-4">
      {fightReport && (
        <FightResultModal
          report={fightReport}
          perspective={selected?.data?.role || 'defender'}
          opponentName={
            fightReport.attacker?.name && selected?.data?.role === 'defender'
              ? fightReport.attacker.name
              : fightReport.defender?.name
          }
          onClose={() => setFightReport(null)}
        />
      )}

      <div className="flex justify-between items-center">
        <h2 className="font-display text-lg text-mob-gold">Mail</h2>
        {unread > 0 && (
          <button className="btn-secondary text-xs" onClick={readAll}>Mark all read ({unread})</button>
        )}
      </div>

      <p className="text-[10px] text-gray-500">Offline attacks appear here with full mob & gear reports — just like iMobsters.</p>

      {selected ? (
        <div className="card">
          <button type="button" className="text-xs text-gray-500 mb-2" onClick={() => setSelected(null)}>← Back</button>
          <h3 className="font-semibold">{selected.subject || selected.title || 'Message'}</h3>
          <p className="text-xs text-gray-500 mt-1">{selected.created_at && new Date(selected.created_at).toLocaleString()}</p>
          <p className="text-sm text-gray-300 mt-3 whitespace-pre-wrap">{selected.body || selected.message}</p>
          {selected.data?.fightReport && (
            <button type="button" className="btn-primary text-xs mt-3 w-full" onClick={() => setFightReport(selected.data.fightReport)}>
              View Full Fight Report
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {mail.map((m) => (
            <div
              key={m.id}
              className={`card cursor-pointer ${!m.read_status && !m.read ? 'border-mob-gold/40' : ''} ${m.mail_type === 'combat' ? 'border-red-900/30' : ''}`}
              onClick={() => openMail(m)}
            >
              <div className="flex justify-between gap-2">
                <p className={`font-semibold text-sm ${!m.read_status && !m.read ? 'text-mob-gold' : ''}`}>
                  {!m.read_status && !m.read && '● '}
                  {m.mail_type === 'combat' && '⚔ '}
                  {m.subject || m.title || m.mail_type}
                </p>
                <span className="text-xs text-gray-500 flex-shrink-0">{m.created_at && new Date(m.created_at).toLocaleDateString()}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1 truncate">{(m.body || m.message || '').slice(0, 80)}</p>
              {m.data?.fightReport && <p className="text-[10px] text-mob-gold mt-1">Full fight report available</p>}
            </div>
          ))}
          {mail.length === 0 && <p className="text-gray-500 text-sm text-center py-8">No mail</p>}
        </div>
      )}

      <button type="button" className="btn-secondary w-full text-sm" onClick={() => navigate('/')}>Back to Home</button>
    </div>
  );
}
