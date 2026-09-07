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
  const path = `receipts/${Date.now()}_${file.name}`;
  const { error } = await supabase.storage.from('receipts').upload(path, file);

  if (error) throw error;

  const { data } = supabase.storage.from('receipts').getPublicUrl(path);
  return data.publicUrl;
}
