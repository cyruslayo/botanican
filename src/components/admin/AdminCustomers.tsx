'use client';
import { useState, useEffect, useCallback } from 'react';
import { getAccessRequests } from '@/lib/referrals';
import type { AccessRequest } from '@/lib/types';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setCustomers(await getAccessRequests('approved'));
    } catch (error) {
      console.error('Error fetching customers: ', error);
      setCustomers([]);
      setError('Member records could not be loaded from Supabase.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const [searchQuery, setSearchQuery] = useState('');

  const filteredCustomers = customers.filter((c) =>
    c.instagram_handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-headline-md text-xl sm:text-headline-md text-on-surface">Customers</h2>
          <p className="font-body-sm text-xs sm:text-sm text-on-surface-variant">
            Approved access requests are the member/customer source for this storefront.
          </p>
        </div>
        <div className="text-xs font-mono text-on-surface-variant bg-surface px-3 py-1.5 rounded-xl border border-outline-variant/60 w-fit">
          Total Users: <span className="font-bold text-primary">{customers.length}</span>
        </div>
      </div>

      {error && <div role="alert" className="p-4 rounded-xl border border-error/30 bg-error/10 text-error text-sm">{error}</div>}

      {/* Search Bar */}
      <div className="bg-surface p-3.5 sm:p-4 rounded-2xl border border-outline-variant/60 botanical-shadow">
        <input
          type="text"
          placeholder="Search members by handle, phone, or status..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/60 focus:outline-none focus:border-primary text-primary"
        />
      </div>

      {/* Mobile Card List (< md screens) */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="p-8 text-center text-on-surface-variant text-sm bg-surface rounded-2xl border border-outline-variant">
            Loading customers...
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-8 text-center text-on-surface-variant text-sm bg-surface rounded-2xl border border-outline-variant">
            No customers found.
          </div>
        ) : (
          filteredCustomers.map((customer) => (
            <div
              key={customer.id}
              className="bg-surface rounded-2xl border border-outline-variant/70 p-4 botanical-shadow space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-primary break-all">
                  {customer.instagram_handle}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    customer.status === 'approved'
                      ? 'bg-secondary-container text-on-secondary-container'
                      : customer.status === 'rejected'
                      ? 'bg-error/10 text-error'
                      : 'bg-surface-container-high text-on-surface-variant'
                  }`}
                >
                  {customer.status}
                </span>
              </div>
              <div className="flex justify-between text-xs text-on-surface-variant pt-1 border-t border-outline-variant/40">
                <span>Approved Date:</span>
                <span className="font-mono">
                  {customer.reviewed_at ? new Date(customer.reviewed_at).toLocaleDateString() : 'Pending review'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table (>= md screens) */}
      <div className="hidden md:block bg-surface rounded-2xl border border-outline-variant overflow-hidden botanical-shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low">
              <tr className="border-b border-outline-variant">
                <th className="p-4 font-label-sm text-xs text-on-surface-variant uppercase tracking-wider">Instagram Handle</th>
                <th className="p-4 font-label-sm text-xs text-on-surface-variant uppercase tracking-wider">Phone</th>
                <th className="p-4 font-label-sm text-xs text-on-surface-variant uppercase tracking-wider">Status / Approval Date</th>
              </tr>
            </thead>
            <tbody className="font-body-md text-sm text-on-surface divide-y divide-outline-variant/50">
              {loading ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-on-surface-variant">Loading customers...</td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-on-surface-variant">No customers found.</td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="p-4 font-medium text-primary font-mono text-xs">{customer.instagram_handle}</td>
                    <td className="p-4">
                      <span className="font-mono text-xs">{customer.phone}</span>
                    </td>
                    <td className="p-4 text-on-surface-variant font-mono text-xs">
                      <span className="block uppercase">{customer.status}</span>
                      {customer.reviewed_at ? new Date(customer.reviewed_at).toLocaleDateString() : 'Pending review'}
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
