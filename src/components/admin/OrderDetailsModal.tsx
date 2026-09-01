'use client';
import { useState } from 'react';
import { X } from 'lucide-react';
import { formatNaira } from '@/lib/utils';

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  onSaved: () => void;
}

export default function OrderDetailsModal({ isOpen, onClose, order, onSaved }: OrderDetailsModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState(order?.status || 'Processing');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !order) return null;

  const handleUpdateStatus = async () => {
    setError(null);
    setIsSaving(true);
    try {
      if (order.id.startsWith('ORD-')) {
        // Mock fallback order, ignore db write
      } else {
        const { getSupabase } = await import('@/lib/supabase');
        const supabase = getSupabase();
        const { error } = await supabase.from('orders').update({ status }).eq('id', order.id);
        if (error) throw error;
      }
      onSaved();
      onClose();
    } catch (err: any) {
      console.error("Error updating order: ", err);
      setError(err.message || "Failed to update order.");
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    if (date instanceof Date) return date.toLocaleDateString();
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-surface rounded-2xl border border-outline-variant botanical-shadow max-w-xl w-full flex flex-col max-h-[90dvh] animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-6 border-b border-outline-variant">
          <h3 className="font-headline-sm text-headline-sm text-on-surface">Order Details</h3>
          <button onClick={onClose} aria-label="Close" className="touch-target flex items-center justify-center p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-8">
          {error && (
            <div className="p-4 bg-error/10 text-error rounded-lg font-body-md text-body-md">
              {error}
            </div>
          )}

          <div className="flex justify-between items-start">
            <div>
              <p className="font-label-md text-label-md text-on-surface-variant mb-1">Order ID</p>
              <p className="font-body-lg text-on-surface">{order.id}</p>
            </div>
            <div className="text-right">
              <p className="font-label-md text-label-md text-on-surface-variant mb-1">Date</p>
              <p className="font-body-lg text-on-surface">{formatDate(order.created_at)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-outline-variant">
            <div>
              <p className="font-label-md text-label-md text-on-surface-variant mb-2">Customer / User ID</p>
              <p className="font-body-md text-on-surface">{order.user_id}</p>
            </div>

            {order.shipping_address && (
              <div>
                <p className="font-label-md text-label-md text-on-surface-variant mb-2">Delivery Details</p>
                <div className="font-body-md text-on-surface space-y-1">
                  {order.shipping_address.instagramHandle && (
                    <p className="font-medium text-primary font-mono">{order.shipping_address.instagramHandle}</p>
                  )}
                  {order.shipping_address.phone && (
                    <p className="text-on-surface-variant text-sm font-mono">{order.shipping_address.phone}</p>
                  )}
                  {order.shipping_address.region && (
                    <p className="inline-block mt-1 px-2.5 py-0.5 rounded text-xs bg-secondary/15 text-secondary font-medium">
                      {order.shipping_address.region}, Abuja
                    </p>
                  )}
                  {order.shipping_address.address && (
                    <p className="mt-1 whitespace-pre-wrap">{order.shipping_address.address}</p>
                  )}

                  {/* Fallback for legacy orders */}
                  {!order.shipping_address.region && !order.shipping_address.address && (
                    <>
                      {order.shipping_address.fullName && <p>{order.shipping_address.fullName}</p>}
                      {order.shipping_address.address1 && <p>{order.shipping_address.address1}</p>}
                      {order.shipping_address.address2 && <p>{order.shipping_address.address2}</p>}
                      <p>{order.shipping_address.city || 'Abuja'}, {order.shipping_address.state || 'FCT'} {order.shipping_address.zip || ''}</p>
                      <p>{order.shipping_address.country || 'Nigeria'}</p>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {order.items && order.items.length > 0 && (
            <div className="pt-6 border-t border-outline-variant">
              <p className="font-label-md text-label-md text-on-surface-variant mb-4">Items</p>
              <ul className="space-y-4">
                {order.items.map((item: any, i: number) => (
                  <li key={i} className="flex justify-between items-center bg-surface-container-low p-4 rounded-lg border border-outline-variant">
                    <div className="flex gap-4 items-center">
                      <div className="w-12 h-12 bg-surface-container rounded flex items-center justify-center font-label-sm text-on-surface-variant overflow-hidden">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : 'Img'}
                      </div>
                      <div>
                        <p className="font-body-md text-on-surface font-medium">{item.name}</p>
                        <p className="font-body-sm text-on-surface-variant">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-body-md text-on-surface">{formatNaira(item.price * item.quantity)}</p>
                  </li>
                ))}
              </ul>
              <div className="flex justify-end pt-4 mt-4 border-t border-outline-variant">
                <p className="font-label-lg text-label-lg text-on-surface">Total: <span className="font-headline-sm ml-2">{formatNaira(order.total)}</span></p>
              </div>
            </div>
          )}

          {order.receipt_url && (
            <div className="pt-6 border-t border-outline-variant">
              <p className="font-label-md text-label-md text-on-surface-variant mb-4">Payment Receipt</p>
              <div className="bg-surface-container-low border border-outline-variant rounded-lg p-4 flex flex-col items-center">
                <img src={order.receipt_url} alt="Bank Transfer Receipt" className="max-w-full max-h-64 object-contain rounded mb-4" />
                <a href={order.receipt_url} target="_blank" rel="noreferrer" className="text-primary font-label-sm hover:underline">
                  View Full Image
                </a>
              </div>
            </div>
          )}

          <div className="pt-6 border-t border-outline-variant space-y-4">
            <p className="font-label-md text-label-md text-on-surface-variant">Update Status</p>
            <div className="flex flex-wrap gap-3">
              {['Pending Verification', 'Processing', 'Shipped', 'Fulfilled', 'Cancelled'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`px-4 py-2 rounded-lg font-label-sm border transition-colors ${
                    status === s
                      ? 'bg-primary text-on-primary border-primary'
                      : 'bg-surface border-outline-variant text-on-surface hover:bg-surface-container-low'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

        </div>

        <div className="p-6 border-t border-outline-variant flex justify-end gap-3 bg-surface-container-low rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-lg font-label-lg text-label-lg text-on-surface-variant hover:bg-surface-container transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdateStatus}
            disabled={isSaving || status === order.status}
            className="px-6 py-2.5 rounded-lg font-label-lg text-label-lg bg-primary text-on-primary hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving ? 'Updating...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
