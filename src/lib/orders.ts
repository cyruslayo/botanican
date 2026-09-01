import { getSupabase } from './supabase';
import type { OrderItem, ShippingAddress } from './types';

export async function createOrder(payload: {
  items: OrderItem[];
  total: number;
  shippingAddress: ShippingAddress;
  receiptUrl: string;
}) {
  const supabase = getSupabase();
  const customerId =
    payload.shippingAddress.instagramHandle ||
    payload.shippingAddress.email ||
    payload.shippingAddress.phone ||
    'Guest';

  const { data, error } = await supabase.from('orders').insert({
    user_id: customerId,
    items: payload.items,
    total: payload.total,
    status: 'Pending Verification',
    shipping_address: payload.shippingAddress,
    receipt_url: payload.receiptUrl,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function uploadReceipt(file: File): Promise<string> {
  const supabase = getSupabase();
  const path = `receipts/${Date.now()}_${file.name}`;
  const { error } = await supabase.storage.from('receipts').upload(path, file);

  if (error) {
    // Preserve the original Firebase behavior: fall back to base64 when storage
    // rules or network conditions block the upload.
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  const { data } = supabase.storage.from('receipts').getPublicUrl(path);
  return data.publicUrl;
}
