import { getSupabase } from './supabase';
import type { ReferralCode, AccessRequest } from './types';
import { MOCK_REFERRAL_CODES, MOCK_ACCESS_REQUESTS } from './mockData';

const LOCAL_REFERRAL_CODES_KEY = 'botanica_referral_codes';
const LOCAL_ACCESS_REQUESTS_KEY = 'botanica_access_requests';

export function normalizeHandle(handle: string): string {
  const trimmed = handle.trim().toLowerCase();
  if (!trimmed) return '';
  return trimmed.startsWith('@') ? trimmed : `@${trimmed}`;
}

export function normalizePhone(phone: string): string {
  return phone.trim();
}

function isSupabaseConfigured(): boolean {
  try {
    const url = import.meta.env.PUBLIC_SUPABASE_URL;
    const anonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anonKey) return false;
    if (url.includes('your-project') || url.includes('placeholder') || anonKey === 'your-anon-key') {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

function getLocalReferralCodes(): ReferralCode[] {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(LOCAL_REFERRAL_CODES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.map((c: any) => ({
          ...c,
          owner_handle: c.owner_handle || (c.owner_email ? `@${c.owner_email.split('@')[0]}` : '@member'),
        }));
      }
    } catch {}
  }
  return [...MOCK_REFERRAL_CODES];
}

function saveLocalReferralCodes(codes: ReferralCode[]) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_REFERRAL_CODES_KEY, JSON.stringify(codes));
    } catch {}
  }
}

function getLocalAccessRequests(): AccessRequest[] {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(LOCAL_ACCESS_REQUESTS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.map((item: any) => ({
          ...item,
          instagram_handle: item.instagram_handle || (item.email ? `@${item.email.split('@')[0]}` : '@applicant'),
          phone: item.phone || '+234 800 000 0000',
        }));
      }
    } catch {}
  }
  return [...MOCK_ACCESS_REQUESTS];
}

function saveLocalAccessRequests(requests: AccessRequest[]) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_ACCESS_REQUESTS_KEY, JSON.stringify(requests));
    } catch {}
  }
}

function withTimeout<T = any>(promiseLike: any, timeoutMs: number = 2000): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Timeout'));
    }, timeoutMs);

    Promise.resolve(promiseLike)
      .then((val) => {
        clearTimeout(timer);
        resolve(val);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

/** Generate a random 8-character clean alphanumeric code */
export function generateCode(): string {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/** Validate that a referral code exists and is active */
export async function validateReferralCode(code: string): Promise<ReferralCode | null> {
  const cleanCode = code.trim().toLowerCase();
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabase();
      const { data, error } = await withTimeout(
        supabase
          .from('referral_codes')
          .select('*')
          .ilike('code', cleanCode)
          .eq('is_active', true)
          .maybeSingle()
      );

      if (!error && data) {
        return data as ReferralCode;
      }
    } catch {}
  }

  // Fallback to local / mock dataset
  const localCodes = getLocalReferralCodes();
  const match = localCodes.find(
    (c) => c.code.toLowerCase() === cleanCode && c.is_active
  );
  return match || null;
}

/** Submit a new access request with Instagram handle & Phone only */
export async function submitAccessRequest(payload: {
  instagramHandle: string;
  phone: string;
  referralCode: string;
  referredBy: string;
}): Promise<{ success: boolean; error?: string }> {
  const cleanHandle = normalizeHandle(payload.instagramHandle);
  const cleanPhone = normalizePhone(payload.phone);
  const cleanCode = payload.referralCode.trim().toLowerCase();
  const cleanReferredBy = normalizeHandle(payload.referredBy) || payload.referredBy.trim();

  if (!cleanHandle || cleanHandle.length < 2) {
    return { success: false, error: 'Please enter a valid Instagram handle.' };
  }
  if (!cleanPhone || cleanPhone.length < 5) {
    return { success: false, error: 'Please enter a valid phone number.' };
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabase();
      const { error } = await withTimeout(
        supabase.from('access_requests').insert({
          instagram_handle: cleanHandle,
          phone: cleanPhone,
          referral_code: cleanCode,
          referred_by: cleanReferredBy,
          status: 'pending',
        })
      );

      if (!error) {
        return { success: true };
      }
      if (error.code === '23505') {
        return { success: false, error: 'This Instagram handle is already registered.' };
      }
    } catch {}
  }

  // Fallback to local storage
  const requests = getLocalAccessRequests();
  const existing = requests.find(
    (r) =>
      (r.instagram_handle && r.instagram_handle.toLowerCase() === cleanHandle.toLowerCase()) ||
      (r.phone && cleanPhone && r.phone.replace(/\D/g, '') === cleanPhone.replace(/\D/g, ''))
  );
  if (existing) {
    return { success: false, error: 'This Instagram handle or phone number has already applied.' };
  }

  const newRequest: AccessRequest = {
    id: `ar-${Date.now()}`,
    instagram_handle: cleanHandle,
    phone: cleanPhone,
    referral_code: cleanCode,
    referred_by: cleanReferredBy,
    status: 'pending',
    created_at: new Date().toISOString(),
  };

  requests.unshift(newRequest);
  saveLocalAccessRequests(requests);
  return { success: true };
}

/** Check if a given Instagram handle or phone has approved access */
export async function checkAccess(query: string): Promise<{
  status: 'approved' | 'pending' | 'rejected' | 'none';
  instagramHandle?: string;
  phone?: string;
  referralCode?: string;
}> {
  const cleanQuery = query.trim().toLowerCase();
  const cleanHandle = normalizeHandle(cleanQuery);
  const digitsOnly = cleanQuery.replace(/\D/g, '');

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabase();
      const { data, error } = await withTimeout(
        supabase
          .from('access_requests')
          .select('*')
          .or(`instagram_handle.ilike.${cleanHandle},phone.ilike.%${digitsOnly}%`)
          .maybeSingle()
      );

      if (!error && data) {
        let codeStr: string | undefined;
        if (data.status === 'approved') {
          const { data: codeData } = await withTimeout(
            supabase
              .from('referral_codes')
              .select('code')
              .ilike('owner_handle', data.instagram_handle)
              .eq('is_active', true)
              .maybeSingle()
          );
          if (codeData?.code) {
            codeStr = codeData.code;
          }
        }

        return {
          status: data.status as any,
          instagramHandle: data.instagram_handle,
          phone: data.phone,
          referralCode: codeStr,
        };
      }
    } catch {}
  }

  // Local fallback
  const requests = getLocalAccessRequests();
  const found = requests.find(
    (r) =>
      (r.instagram_handle && r.instagram_handle.toLowerCase() === cleanHandle) ||
      (digitsOnly.length > 5 && r.phone && r.phone.replace(/\D/g, '').includes(digitsOnly))
  );

  if (found) {
    let codeStr: string | undefined;
    if (found.status === 'approved') {
      const codes = getLocalReferralCodes();
      const codeMatch = codes.find(
        (c) => c.owner_handle?.toLowerCase() === found.instagram_handle.toLowerCase() && c.is_active
      );
      codeStr = codeMatch?.code || 'botanica1';
    }

    return {
      status: found.status,
      instagramHandle: found.instagram_handle,
      phone: found.phone,
      referralCode: codeStr,
    };
  }

  // Pre-approved demo accounts
  if (
    cleanHandle === '@admin' ||
    cleanHandle === '@jane_wellness' ||
    cleanHandle === '@john_botanicals' ||
    cleanQuery === 'admin@botanica.com'
  ) {
    return {
      status: 'approved',
      instagramHandle: cleanHandle.startsWith('@') ? cleanHandle : `@${cleanQuery.split('@')[0]}`,
      referralCode: 'botanica1',
    };
  }

  return { status: 'none' };
}

/** Admin: fetch all access requests, optionally filtered by status */
export async function getAccessRequests(status?: string): Promise<AccessRequest[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabase();
      let query = supabase
        .from('access_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      const { data, error } = await withTimeout(query);
      if (!error && data && data.length > 0) {
        return data as AccessRequest[];
      }
    } catch {}
  }

  const requests = getLocalAccessRequests();
  if (status && status !== 'all') {
    return requests.filter((r) => r.status === status);
  }
  return requests;
}

/** Admin: approve or reject an access request */
export async function updateAccessRequest(
  id: string,
  status: 'approved' | 'rejected',
  adminEmail: string = 'admin@botanica.com'
): Promise<void> {
  const reviewedAt = new Date().toISOString();
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabase();
      const { error } = await withTimeout(
        supabase
          .from('access_requests')
          .update({
            status,
            reviewed_at: reviewedAt,
            reviewed_by: adminEmail,
          })
          .eq('id', id)
      );

      if (!error) return;
    } catch {}
  }

  const requests = getLocalAccessRequests();
  const index = requests.findIndex((r) => r.id === id);
  if (index !== -1) {
    requests[index] = {
      ...requests[index],
      status,
      reviewed_at: reviewedAt,
      reviewed_by: adminEmail,
    };
    saveLocalAccessRequests(requests);

    // If approved, automatically create a referral code for this new member if none exists
    if (status === 'approved') {
      await createReferralCode(requests[index].instagram_handle);
    }
  }
}

const LOCAL_LANDING_CODE_KEY = 'botanica_landing_invite_code';
const DEFAULT_LANDING_CODE = 'botanica1';

export function getLandingInviteCode(): string {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(LOCAL_LANDING_CODE_KEY);
      if (stored && stored.trim()) {
        return stored.trim();
      }
    } catch {}
  }
  return DEFAULT_LANDING_CODE;
}

export function setLandingInviteCode(code: string): void {
  const clean = code.trim().toLowerCase();
  if (typeof window !== 'undefined' && clean) {
    try {
      localStorage.setItem(LOCAL_LANDING_CODE_KEY, clean);
    } catch {}
  }
}

/** Admin: create a referral code for an approved member or custom code */
export async function createReferralCode(ownerHandle: string, customCode?: string): Promise<ReferralCode> {
  const cleanHandle = normalizeHandle(ownerHandle);
  const code = (customCode && customCode.trim()) ? customCode.trim().toLowerCase() : generateCode();

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabase();
      const { data, error } = await withTimeout(
        supabase
          .from('referral_codes')
          .insert({
            code,
            owner_handle: cleanHandle,
            is_active: true,
          })
          .select()
          .single()
      );

      if (!error && data) {
        return data as ReferralCode;
      }
    } catch {}
  }

  const codes = getLocalReferralCodes();
  // If custom code is supplied, check if code or handle already exists
  const existingByCode = codes.find(
    (c) => c.code.toLowerCase() === code.toLowerCase()
  );
  if (existingByCode) {
    // If it exists but disabled, re-enable
    existingByCode.is_active = true;
    saveLocalReferralCodes(codes);
    return existingByCode;
  }

  const newCode: ReferralCode = {
    id: `ref-${Date.now()}`,
    code,
    owner_handle: cleanHandle,
    is_active: true,
    created_at: new Date().toISOString(),
  };

  codes.unshift(newCode);
  saveLocalReferralCodes(codes);
  return newCode;
}

/** Admin: list all referral codes */
export async function getReferralCodes(): Promise<ReferralCode[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabase();
      const { data, error } = await withTimeout(
        supabase
          .from('referral_codes')
          .select('*')
          .order('created_at', { ascending: false })
      );

      if (!error && data && data.length > 0) {
        return data as ReferralCode[];
      }
    } catch {}
  }

  return getLocalReferralCodes();
}
