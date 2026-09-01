import { atom, computed } from 'nanostores';

export type AccessStatus = 'unknown' | 'guest' | 'pending' | 'approved' | 'rejected';

export interface AccessStoreState {
  instagramHandle: string | null;
  phone: string | null;
  status: AccessStatus;
  referralCode?: string | null;
}

const ACCESS_STORAGE_KEY = 'botanica_access_state';
const CELEBRATION_STORAGE_KEY = 'botanica_approval_celebrated';

function getInitialAccess(): AccessStoreState {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(ACCESS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
  }
  return {
    instagramHandle: null,
    phone: null,
    status: 'unknown',
    referralCode: null,
  };
}

export const accessState = atom<AccessStoreState>(getInitialAccess());
export const hasApprovalCelebration = atom<boolean>(false);

if (typeof window !== 'undefined') {
  // Sync state to localStorage on write
  accessState.subscribe((state) => {
    try {
      localStorage.setItem(ACCESS_STORAGE_KEY, JSON.stringify(state));
    } catch {}
  });

  // Cross-tab synchronization via storage event listener
  window.addEventListener('storage', (e) => {
    if (e.key === ACCESS_STORAGE_KEY && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        const current = accessState.get();
        if (parsed.status !== current.status || parsed.instagramHandle !== current.instagramHandle) {
          if (current.status === 'pending' && parsed.status === 'approved') {
            hasApprovalCelebration.set(true);
          }
          accessState.set(parsed);
        }
      } catch {}
    }
  });
}

export const isApproved = computed(accessState, (s) => s.status === 'approved');
export const isPending = computed(accessState, (s) => s.status === 'pending');
export const isRejected = computed(accessState, (s) => s.status === 'rejected');
export const accessHandle = computed(accessState, (s) => s.instagramHandle);
export const accessPhone = computed(accessState, (s) => s.phone);

export function setApprovedAccess(instagramHandle: string, phone?: string, referralCode?: string, isNewlyApproved: boolean = false) {
  const current = accessState.get();
  if (isNewlyApproved || current.status === 'pending') {
    hasApprovalCelebration.set(true);
  }
  accessState.set({
    instagramHandle,
    phone: phone || current.phone || null,
    status: 'approved',
    referralCode: referralCode || current.referralCode || null,
  });
}

export function setPendingAccess(instagramHandle: string, phone?: string) {
  hasApprovalCelebration.set(false);
  accessState.set({
    instagramHandle,
    phone: phone || null,
    status: 'pending',
    referralCode: null,
  });
}

export function clearAccess() {
  hasApprovalCelebration.set(false);
  accessState.set({
    instagramHandle: null,
    phone: null,
    status: 'guest',
    referralCode: null,
  });
}

export function dismissApprovalCelebration() {
  hasApprovalCelebration.set(false);
}
