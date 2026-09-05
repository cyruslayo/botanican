import type { ReferralCode, AccessRequest } from './types';

/* Referral and access-request fixtures remain local-only and are unrelated to catalog data. */
export const MOCK_REFERRAL_CODES: ReferralCode[] = [
  {
    id: 'ref-1',
    code: 'botanica1',
    owner_handle: '@jane_wellness',
    owner_email: 'jane@example.com',
    is_active: true,
    created_at: new Date('2023-10-20').toISOString(),
  },
  {
    id: 'ref-2',
    code: 'wellness2',
    owner_handle: '@john_botanicals',
    owner_email: 'john@example.com',
    is_active: true,
    created_at: new Date('2023-10-21').toISOString(),
  },
];

export const MOCK_ACCESS_REQUESTS: AccessRequest[] = [
  {
    id: 'ar-1',
    instagram_handle: '@alice_herbal',
    phone: '+234 802 333 4444',
    referral_code: 'botanica1',
    referred_by: '@jane_wellness',
    status: 'pending',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'ar-2',
    instagram_handle: '@bob_rituals',
    phone: '+234 811 555 6666',
    referral_code: 'wellness2',
    referred_by: '@john_botanicals',
    status: 'approved',
    reviewed_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    reviewed_by: 'admin@botanica.com',
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
];


