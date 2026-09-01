'use client';
import { useState, useEffect, type ReactNode } from 'react';
import { signInWithPassword, signOut, isAdmin, describeAuthError } from '@/lib/auth';

export default function AdminGate({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    isAdmin().then(setAdmin).finally(() => setLoading(false));
  }, []);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    try {
      const { error: signInError } = await signInWithPassword(email, password);
      if (signInError) {
        setError(describeAuthError(signInError));
        return;
      }
      const ok = await isAdmin();
      if (!ok) {
        setError(
          'This account does not have admin access. Check the browser console for details, then add a profiles row with role = \'admin\' for this user (see supabase/schema.sql).'
        );
        await signOut();
      }
      setAdmin(ok);
    } catch (err: any) {
      setError(describeAuthError(err));
    }
  };

  if (loading) {
    return <div className="p-8 text-center font-body-md text-on-surface-variant">Checking access...</div>;
  }

  if (!admin) {
    return (
      <div className="max-w-md mx-auto mt-16 bg-surface p-8 rounded-xl border border-outline-variant botanical-shadow">
        <h2 className="font-headline-sm text-headline-sm text-on-surface mb-6">Admin Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="font-label-sm text-on-surface-variant">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-surface border border-outline rounded-lg text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="space-y-2">
            <label className="font-label-sm text-on-surface-variant">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-surface border border-outline rounded-lg text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          {error && <p role="alert" className="text-error font-body-sm">{error}</p>}
          <button type="submit" className="w-full bg-primary text-on-primary py-3 rounded-full font-label-sm uppercase tracking-widest hover:bg-primary/90 transition-colors">
            Sign In
          </button>
        </form>
      </div>
    );
  }

  return <>{children}</>;
}
