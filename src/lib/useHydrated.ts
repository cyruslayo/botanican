'use client';
import { useSyncExternalStore } from 'react';

function subscribe() {
  return () => {};
}

/**
 * Returns true only on the client after initial hydration is complete.
 * Server snapshot is always false, ensuring initial client render matches SSR HTML.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}
