import { getSupabase } from './supabase';
import type { OrderItem, ShippingAddress } from './types';

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
  const supabase = getSupabase();
  const extensionMatch = file.name.match(/\.([a-z0-9]{1,5})$/i);
  const extension = extensionMatch && ['jpg', 'jpeg', 'png', 'webp', 'gif', 'pdf'].includes(extensionMatch[1].toLowerCase())
    ? `.${extensionMatch[1].toLowerCase()}`
    : '';
  const randomId = typeof globalThis.crypto?.randomUUID === 'function'
    ? globalThis.crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  const path = `receipts/${randomId}${extension}`;
  const { error } = await supabase.storage.from('receipts').upload(path, file);

  if (error) throw error;
  // The upload can become orphaned if the subsequent order RPC fails. Cleanup
  // is intentionally deferred to a separate cancellation/retention workflow.
  return path;
}
