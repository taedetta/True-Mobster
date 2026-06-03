import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { uiAsset } from '../utils/assets';

const TABS = [
  { id: 'world', label: 'World', asset: 'chat-world' },
  { id: 'crew', label: 'Mob Chat', asset: 'chat-mob' },
  { id: 'pm', label: 'Messages', asset: 'chat-messages' },
];

export default function ChatPage() {
  const { state, gameGet, action, socketRef, showMessage } = useGame();
  const location = useLocation();
  const [tab, setTab] = useState('world');
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [pms, setPms] = useState({ inbox: [], sent: [] });
  const [pmForm, setPmForm] = useState({ toUsername: '', subject: '', body: '' });
  const bottomRef = useRef(null);

  useEffect(() => {
    if (location.state?.pmTo) {
      setTab('pm');
      setPmForm((f) => ({ ...f, toUsername: location.state.pmTo }));
    }
  }, [location.state]);

  const loadChat = (channel) => {
    if (channel === 'pm') {
      gameGet('/pm').then(setPms).catch(() => {});
      return;
    }
    gameGet(`/chat/${channel}`).then((d) => setMessages(d.messages || [])).catch(() => {});
  };

  useEffect(() => {
    loadChat(tab);
    socketRef.current?.emit('chat:join');
  }, [tab, state?.crew?.id]);

  useEffect(() => {
    const s = socketRef.current;
    if (!s) return;
    const onMsg = (msg) => {
      if (tab === 'world' && msg.channel === 'world') setMessages((prev) => [...prev, msg].slice(-100));
      if (tab === 'crew' && msg.channel === 'crew') setMessages((prev) => [...prev, msg].slice(-100));
    };
    const onErr = (e) => showMessage(e.error, 'error');
    s.on('chat:message', onMsg);
    s.on('chat:error', onErr);
    return () => { s.off('chat:message', onMsg); s.off('chat:error', onErr); };
  }, [tab, socketRef, showMessage]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendChat = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const msg = text.trim();
    setText('');
    try {
      socketRef.current?.emit('chat:send', { channel: tab, message: msg });
      if (!socketRef.current?.connected) {
        await action('/chat/send', { channel: tab, message: msg });
        loadChat(tab);
      }
    } catch { /* handled */ }
  };

  const sendPm = async (e) => {
    e.preventDefault();
    await action('/pm/send', pmForm, 'Message sent!');
    setPmForm({ toUsername: '', subject: '', body: '' });
    loadChat('pm');
  };

  if (!state) return null;

  return (
    <div className="space-y-4 flex flex-col" style={{ minHeight: '60vh' }}>
      <h2 className="font-display text-lg text-mob-gold">Chat</h2>

      <div className="flex gap-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2 rounded-lg text-xs border flex flex-col items-center gap-1 ${tab === t.id ? 'border-mob-gold bg-mob-gold/10 text-mob-gold' : 'border-mob-border'}`}
          >
            <img src={uiAsset(t.asset)} alt="" className="w-8 h-8 object-contain" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'pm' ? (
        <>
          <form onSubmit={sendPm} className="card space-y-2">
            <h3 className="font-semibold text-sm">Send Private Message</h3>
            <input className="w-full px-3 py-2 rounded-lg bg-mob-bg border border-mob-border text-sm" placeholder="Username" value={pmForm.toUsername} onChange={(e) => setPmForm({ ...pmForm, toUsername: e.target.value })} required />
            <input className="w-full px-3 py-2 rounded-lg bg-mob-bg border border-mob-border text-sm" placeholder="Subject (optional)" value={pmForm.subject} onChange={(e) => setPmForm({ ...pmForm, subject: e.target.value })} />
            <textarea className="w-full px-3 py-2 rounded-lg bg-mob-bg border border-mob-border text-sm min-h-[80px]" placeholder="Message..." value={pmForm.body} onChange={(e) => setPmForm({ ...pmForm, body: e.target.value })} required />
            <button type="submit" className="btn-primary w-full text-sm">Send</button>
          </form>
          <div className="space-y-2 flex-1 overflow-y-auto max-h-64">
            <h3 className="font-semibold text-sm">Inbox</h3>
            {pms.inbox?.map((m) => (
              <div key={m.id} className={`card text-sm ${!m.read_status ? 'border-mob-gold/30' : ''}`}>
                <Link to={`/player/${m.sender_id || ''}`} className="text-mob-gold text-xs font-semibold hover:underline">{m.other_name}</Link>
                <p className="font-semibold">{m.subject || '(no subject)'}</p>
                <p className="text-gray-300 mt-1">{m.body}</p>
              </div>
            ))}
            {!pms.inbox?.length && <p className="text-gray-500 text-sm text-center">No messages</p>}
          </div>
        </>
      ) : (
        <>
          {tab === 'crew' && !state.crew && (
            <p className="text-amber-400 text-sm text-center">Join a crew to use mob chat</p>
          )}
          <div className="flex-1 overflow-y-auto max-h-80 space-y-2 card min-h-[200px]">
            {messages.map((m) => (
              <div key={m.id} className={`text-sm ${m.user_id === state.user_id ? 'text-right' : ''}`}>
                <Link to={`/player/${m.user_id}`} className="text-mob-gold text-xs font-semibold hover:underline">{m.display_name}</Link>
                <p className="text-gray-200 bg-mob-bg/50 rounded-lg px-2 py-1 inline-block mt-0.5">{m.message}</p>
              </div>
            ))}
            {!messages.length && <p className="text-gray-500 text-sm text-center py-8">No messages yet. Say hello!</p>}
            <div ref={bottomRef} />
          </div>
          <form onSubmit={sendChat} className="flex gap-2">
            <input
              className="flex-1 px-3 py-2 rounded-lg bg-mob-bg border border-mob-border text-sm"
              placeholder={tab === 'crew' && !state.crew ? 'Join a crew first' : 'Type a message...'}
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={tab === 'crew' && !state.crew}
              maxLength={500}
            />
            <button type="submit" className="btn-primary px-4" disabled={tab === 'crew' && !state.crew}>Send</button>
          </form>
        </>
      )}
    </div>
  );
}
