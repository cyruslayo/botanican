import { getSupabase } from './supabase';
import type { OrderItem, ShippingAddress } from './types';

const RECEIPT_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'application/pdf']);
const TRANSIENT_NETWORK_ERROR = /load failed|failed to fetch|network request failed|network connection was lost/i;

function isTransientNetworkError(error: unknown): boolean {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'object' && error !== null && 'message' in error
        ? String((error as { message?: unknown }).message ?? '')
        : String(error ?? '');

  return TRANSIENT_NETWORK_ERROR.test(message);
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function secureRandomId(): string {
  const cryptoApi = globalThis.crypto;

  if (typeof cryptoApi?.randomUUID === 'function') {
    return cryptoApi.randomUUID();
  }

  if (typeof cryptoApi?.getRandomValues === 'function') {
    const randomBytes = new Uint8Array(16);
    cryptoApi.getRandomValues(randomBytes);
    return Array.from(randomBytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  }

  throw new Error('Secure receipt upload is unavailable in this browser.');
}

export async function createOrder(payload: {
  items: OrderItem[];
  total: number;
  shippingAddress: ShippingAddress;
  receiptUrl: string;
}) {
  const supabase = getSupabase();
  const { data, error } = await supabase.rpc('create_member_order', {
    p_instagram_handle: payload.shippingAddress.instagramHandle,
    p_phone: payload.shippingAddress.phone,
    p_items: payload.items,
    p_total: payload.total,
    p_shipping_address: payload.shippingAddress,
    p_receipt_url: payload.receiptUrl,
  });

  if (error) {
    throw error;
  }

  if (!data) throw new Error('Order creation returned no order ID.');
  return data as string;
}

export async function uploadReceipt(file: File): Promise<string> {
  if (!RECEIPT_MIME_TYPES.has(file.type)) {
    throw new Error('Receipt must be a JPEG, PNG, or PDF file.');
  }

  const extensionMatch = file.name.match(/\.([a-z0-9]{1,5})$/i);
  const extension = extensionMatch && ['jpg', 'jpeg', 'png', 'pdf'].includes(extensionMatch[1].toLowerCase())
    ? `.${extensionMatch[1].toLowerCase()}`
    : file.type === 'application/pdf'
      ? '.pdf'
      : file.type === 'image/png'
        ? '.png'
        : '.jpg';

  const supabase = getSupabase();
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const path = `receipts/${secureRandomId()}${extension}`;
    const { error } = await supabase.storage.from('receipts').upload(path, file, {
      contentType: file.type,
      cacheControl: '3600',
      upsert: false,
    });

    if (!error) {
      // A failed order RPC can leave this receipt orphaned. Cleanup remains deferred.
      return path;
    }

    if (!isTransientNetworkError(error) || attempt === maxAttempts) {
      throw error;
    }

    await wait(350 * attempt);
  }

  throw new Error('Receipt upload failed.');
}
