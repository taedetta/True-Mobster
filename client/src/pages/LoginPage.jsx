import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, register, loading } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', email: '', password: '', displayName: '', referralCode: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (mode === 'login') {
        await login(form.username, form.password);
      } else {
        await register(form.username, form.email, form.password, form.displayName || form.username, form.referralCode || undefined);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4 drop-shadow-glow">🎩</div>
        <h1 className="font-display text-4xl text-mob-gold tracking-wide">True Mobsters</h1>
        <p className="text-gray-500 mt-2">by VisionIt Studio</p>
        <p className="text-gray-600 text-sm mt-1 max-w-xs">Build your criminal empire. Fight rivals. Rule the streets.</p>
      </div>

      <form onSubmit={handleSubmit} className="card w-full max-w-sm space-y-4">
        <div className="flex gap-2 mb-2">
          <button type="button" className={`flex-1 py-2 rounded-lg text-sm font-semibold ${mode === 'login' ? 'bg-mob-gold text-black' : 'bg-mob-border text-gray-400'}`} onClick={() => setMode('login')}>Login</button>
          <button type="button" className={`flex-1 py-2 rounded-lg text-sm font-semibold ${mode === 'register' ? 'bg-mob-gold text-black' : 'bg-mob-border text-gray-400'}`} onClick={() => setMode('register')}>Register</button>
        </div>

        <input className="w-full px-4 py-3 rounded-lg bg-mob-bg border border-mob-border focus:border-mob-gold outline-none" placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
        {mode === 'register' && (
          <>
            <input className="w-full px-4 py-3 rounded-lg bg-mob-bg border border-mob-border focus:border-mob-gold outline-none" placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <input className="w-full px-4 py-3 rounded-lg bg-mob-bg border border-mob-border focus:border-mob-gold outline-none" placeholder="Display Name (optional)" value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} />
            <input className="w-full px-4 py-3 rounded-lg bg-mob-bg border border-mob-border focus:border-mob-gold outline-none font-mono uppercase" placeholder="Friend's Invite Code (optional)" value={form.referralCode} onChange={(e) => setForm({ ...form, referralCode: e.target.value.toUpperCase() })} />
          </>
        )}
        <input className="w-full px-4 py-3 rounded-lg bg-mob-bg border border-mob-border focus:border-mob-gold outline-none" placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

        <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
          {loading ? 'Loading...' : mode === 'login' ? 'Enter the Underworld' : 'Join the Family'}
        </button>
      </form>

      <p className="text-xs text-gray-600 mt-6 text-center max-w-sm">
        Server-authoritative gameplay. All stats, combat, and economy are validated on the server.
      </p>
    </div>
  );
}
