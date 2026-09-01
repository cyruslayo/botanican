import { getSupabase } from './supabase';

const DEMO_ADMIN_EMAIL = 'admin@botanica.com';

export async function signInWithPassword(email: string, password: string) {
  try {
    const supabase = getSupabase();
    const res = await supabase.auth.signInWithPassword({ email, password });
    if (!res.error) return res;
  } catch {
    // Supabase unconfigured
  }

  if (email.toLowerCase() === DEMO_ADMIN_EMAIL) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('botanica_demo_admin', 'true');
    }
    return { data: { user: { id: 'demo-admin-id', email } }, error: null } as any;
  }

  return { data: null, error: { code: 'invalid_credentials', message: 'Invalid credentials' } } as any;
}

export async function signOut() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('botanica_demo_admin');
  }
  try {
    const supabase = getSupabase();
    return await supabase.auth.signOut();
  } catch {
    return { error: null } as any;
  }
}

export async function getSession() {
  try {
    const supabase = getSupabase();
    return await supabase.auth.getSession();
  } catch {
    return { data: { session: null }, error: null } as any;
  }
}

export async function isAdmin() {
  if (typeof window !== 'undefined' && localStorage.getItem('botanica_demo_admin') === 'true') {
    return true;
  }

  try {
    const supabase = getSupabase();
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session?.user?.id) {
      return false;
    }

    const userId = sessionData.session.user.id;
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle();

    if (error || !data) {
      return false;
    }
    return data.role === 'admin';
  } catch {
    return false;
  }
}

// Maps a Supabase AuthApiError to a human-readable message with an
// actionable hint. Sign-in failures return a generic "Invalid login
// credentials" message, so the error code is needed to tell the real
// cause apart (unconfirmed email vs wrong password).
export function describeAuthError(err: unknown): string {
  const e = err as { code?: string; message?: string };
  switch (e?.code) {
    case 'email_not_confirmed':
      return 'This email has not been confirmed. Confirm the user in Supabase (Authentication → Users → Confirm user), or click the confirmation link sent by email.';
    case 'invalid_credentials':
      return 'Invalid email or password. Check the credentials under Supabase Authentication → Users.';
    default:
      return e?.message ? `Sign-in failed: ${e.message}` : 'Sign-in failed.';
  }
}
