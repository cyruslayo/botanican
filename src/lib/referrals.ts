import { getSupabase } from './supabase';
import { fetchLiveSiteSettings, saveSiteSettings } from './siteSettings';
import type { ReferralCode, AccessRequest } from './types';

export interface PublicReferralCode {
  code: string;
  owner_handle: string;
  is_active: boolean;
}

export function normalizeHandle(handle: string): string {
  const trimmed = handle.trim().toLowerCase();
  if (!trimmed) return '';
  return trimmed.startsWith('@') ? trimmed : `@${trimmed}`;
}

export function normalizePhone(phone: string): string {
  return phone.trim();
}

function getRpcRow<T>(data: T | T[] | null): T | null {
  if (!data) return null;
  return Array.isArray(data) ? data[0] || null : data;
}

export function generateCode(): string {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  let code = '';
  for (let i = 0; i < 8; i += 1) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export async function validateReferralCode(code: string): Promise<PublicReferralCode | null> {
  const cleanCode = code.trim().toLowerCase();
  if (!cleanCode) return null;
  const { data, error } = await getSupabase().rpc('validate_referral_code', { p_code: cleanCode });
  if (error) throw error;
  return getRpcRow(data as PublicReferralCode | PublicReferralCode[] | null);
}

export async function submitAccessRequest(payload: {
  instagramHandle: string;
  phone: string;
  referralCode: string;
}): Promise<{ success: boolean; error?: string }> {
  const cleanHandle = normalizeHandle(payload.instagramHandle);
  const cleanPhone = normalizePhone(payload.phone);
  const cleanCode = payload.referralCode.trim().toLowerCase();

  if (!cleanHandle || cleanHandle.length < 2) return { success: false, error: 'Please enter a valid Instagram handle.' };
  if (!cleanPhone || cleanPhone.length < 5) return { success: false, error: 'Please enter a valid phone number.' };

  const { data, error } = await getSupabase().rpc('submit_access_request', {
    p_instagram_handle: cleanHandle,
    p_phone: cleanPhone,
    p_referral_code: cleanCode,
  });
  if (error) {
    if (error.code === '23505') return { success: false, error: 'This Instagram handle is already registered.' };
    console.error('Error submitting access request:', error);
    return { success: false, error: 'We could not submit your application. Please try again.' };
  }
  if (data) return { success: true };
  return { success: false, error: 'The application was not confirmed by Supabase.' };
}

export async function checkAccess(
  instagramHandle: string,
  phone: string,
): Promise<{ status: 'approved' | 'pending' | 'rejected' | 'none'; instagramHandle?: string; referralCode?: string }> {
  const cleanHandle = normalizeHandle(instagramHandle);
  const cleanPhone = normalizePhone(phone);
  if (!cleanHandle || !cleanPhone) return { status: 'none' };

  const { data, error } = await getSupabase().rpc('check_access_status', {
    p_instagram_handle: cleanHandle,
    p_phone: cleanPhone,
  });
  if (error) throw error;
  const row = getRpcRow(data as Array<{
    status: 'approved' | 'pending' | 'rejected';
    instagram_handle: string;
    referral_code: string | null;
  }> | null);
  if (!row) return { status: 'none' };
  return {
    status: row.status,
    instagramHandle: row.instagram_handle,
    referralCode: row.status === 'approved' ? row.referral_code || undefined : undefined,
  };
}

export async function getAccessRequests(status?: string): Promise<AccessRequest[]> {
  let query = getSupabase().from('access_requests').select('*').order('created_at', { ascending: false });
  if (status && status !== 'all') query = query.eq('status', status);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as AccessRequest[];
}

export async function updateAccessRequest(id: string, status: 'approved' | 'rejected'): Promise<AccessRequest> {
  const { data, error } = await getSupabase().rpc('review_access_request', {
    p_request_id: id,
    p_new_status: status,
  });
  if (error) throw error;
  const updated = getRpcRow(data as AccessRequest | AccessRequest[] | null);
  if (!updated) throw new Error('The access request review returned no updated request.');
  return updated;
}

export async function getLandingInviteCode(): Promise<string | null> {
  const settings = await fetchLiveSiteSettings();
  const code = settings.landingInviteCode?.trim().toLowerCase();
  if (!code) return null;
  const referral = await validateReferralCode(code);
  return referral?.is_active ? referral.code : null;
}

export async function setLandingInviteCode(code: string): Promise<void> {
  const referral = await validateReferralCode(code.trim().toLowerCase());
  if (!referral?.is_active) throw new Error('Landing invitation code must reference an active referral code.');
  await saveSiteSettings({ landingInviteCode: referral.code });
}

export async function createReferralCode(ownerHandle: string, customCode?: string): Promise<ReferralCode> {
  const cleanHandle = normalizeHandle(ownerHandle);
  if (!cleanHandle) throw new Error('A valid member Instagram handle is required.');
  const code = customCode?.trim() ? customCode.trim().toLowerCase() : generateCode();
  const { data, error } = await getSupabase().from('referral_codes').insert({
    code,
    owner_handle: cleanHandle,
    is_active: true,
  }).select().single();
  if (error) {
    if (error.code === '23505') throw new Error(`Referral code "${code}" already exists.`);
    throw error;
  }
  if (!data) throw new Error('Referral code creation returned no row.');
  return data as ReferralCode;
}

export async function getReferralCodes(): Promise<ReferralCode[]> {
  const { data, error } = await getSupabase().from('referral_codes').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as ReferralCode[];
}
