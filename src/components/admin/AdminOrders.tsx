'use client';
import { useState, useEffect, useCallback } from 'react';
import OrderDetailsModal from '@/components/admin/OrderDetailsModal';
import { formatNaira } from '@/lib/utils';

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const { getSupabase } = await import('@/lib/supabase');
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setOrders(data ?? []);
    } catch (error) {
      console.error('Error fetching orders: ', error);
      if (orders.length === 0) {
        setOrders([
          { id: 'ORD-092', user_id: '@jane_wellness', total: 145000, status: 'Fulfilled', created_at: new Date('2023-10-24').toISOString(), items: [{ name: 'Serenity Blend', quantity: 1, price: 85000 }, { name: 'Clarity Botanicals', quantity: 2, price: 30000 }], shipping_address: { instagramHandle: '@jane_wellness', phone: '+234 803 111 2222', region: 'Maitama', address: 'Plot 412, Rhine Street, off IBB Way', city: 'Abuja', state: 'FCT' } },
          { id: 'ORD-091', user_id: '@john_botanicals', total: 85000, status: 'Processing', created_at: new Date('2023-10-23').toISOString(), items: [{ name: 'Serenity Blend', quantity: 1, price: 85000 }], shipping_address: { instagramHandle: '@john_botanicals', phone: '+234 812 333 4444', region: 'Asokoro', address: '14 Nelson Mandela Street, Asokoro', city: 'Abuja', state: 'FCT' } },
        ]);
      }
    } finally {
      setLoading(false);
    }
  }, [orders.length]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="font-headline-md text-headline-md text-on-surface">Orders</h2>
      </div>

      <div className="bg-surface rounded-xl border border-outline-variant overflow-hidden botanical-shadow">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left border-collapse">
            <thead className="bg-surface-container-low">
              <tr className="border-b border-outline-variant">
                <th className="p-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">Order ID</th>
                <th className="p-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">Date</th>
                <th className="p-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">Customer ID</th>
                <th className="p-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">Total</th>
                <th className="p-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">Status</th>
                <th className="p-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="font-body-md text-body-md text-on-surface divide-y divide-outline-variant/50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-on-surface-variant">Loading orders...</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-on-surface-variant">No orders found.</td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="p-4 font-body-lg text-primary">#{order.id}</td>
                    <td className="p-4 text-on-surface-variant">
                      {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-4 text-on-surface-variant text-sm truncate max-w-[120px]">{order.user_id}</td>
                    <td className="p-4">{formatNaira(order.total)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        order.status === 'Fulfilled' ? 'bg-secondary-container text-on-secondary-container' :
                        order.status === 'Processing' ? 'bg-tertiary-container text-on-tertiary-container' :
                        order.status === 'Pending Verification' ? 'bg-error-container text-on-error-container' :
                        'bg-surface-variant text-on-surface-variant'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end">
                        <button onClick={() => setSelectedOrder(order)} aria-label={`View order ${order.id}`} className="touch-target flex items-center justify-center p-2 text-on-surface-variant hover:text-primary transition-colors rounded-lg hover:bg-surface-container">
                          <EyeIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <OrderDetailsModal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
        onSaved={fetchOrders}
      />
    </div>
  );
}

function EyeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
