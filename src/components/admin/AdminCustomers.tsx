'use client';
import { useState, useEffect, useCallback } from 'react';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const { getSupabase } = await import('@/lib/supabase');
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, role, created_at')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setCustomers(data ?? []);
    } catch (error) {
      console.error('Error fetching customers: ', error);
      if (customers.length === 0) {
        setCustomers([
          { id: 'cust-1', email: 'jane@example.com', role: 'customer', created_at: new Date('2023-10-24').toISOString() },
          { id: 'cust-2', email: 'john@example.com', role: 'customer', created_at: new Date('2023-10-23').toISOString() },
        ]);
      }
    } finally {
      setLoading(false);
    }
  }, [customers.length]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="font-headline-md text-headline-md text-on-surface">Customers</h2>
      </div>

      <div className="bg-surface rounded-xl border border-outline-variant overflow-hidden botanical-shadow">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-left border-collapse">
            <thead className="bg-surface-container-low">
              <tr className="border-b border-outline-variant">
                <th className="p-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">Email</th>
                <th className="p-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">Role</th>
                <th className="p-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">Joined</th>
              </tr>
            </thead>
            <tbody className="font-body-md text-body-md text-on-surface divide-y divide-outline-variant/50">
              {loading ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-on-surface-variant">Loading customers...</td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-on-surface-variant">No customers found.</td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="p-4 font-body-lg text-primary">{customer.email}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${customer.role === 'admin' ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container-high text-on-surface-variant'}`}>
                        {customer.role}
                      </span>
                    </td>
                    <td className="p-4 text-on-surface-variant">
                      {customer.created_at ? new Date(customer.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
