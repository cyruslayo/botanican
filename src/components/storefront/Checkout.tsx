'use client';
import { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { cartItems, cartTotal, clearCart } from '@/store/cart';
import { isApproved, isPending, accessState } from '@/store/access';
import { formatNaira } from '@/lib/utils';
import { getSiteSettings, fetchLiveSiteSettings, SITE_SETTINGS_EVENT, type SiteSettings, DEFAULT_SITE_SETTINGS } from '@/lib/siteSettings';
import { useHydrated } from '@/lib/useHydrated';

export default function Checkout() {
  const isHydrated = useHydrated();
  const rawItems = useStore(cartItems);
  const rawTotal = useStore(cartTotal);
  const rawApproved = useStore(isApproved);
  const rawPending = useStore(isPending);
  const access = useStore(accessState);

  const approved = isHydrated && rawApproved;
  const pending = isHydrated && rawPending;
  const items = isHydrated ? rawItems : [];
  const total = isHydrated ? rawTotal : 0;

  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);

  useEffect(() => {
    setSiteSettings(getSiteSettings());
    fetchLiveSiteSettings().then(setSiteSettings);

    const onUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<SiteSettings>;
      if (customEvent.detail) setSiteSettings(customEvent.detail);
      else setSiteSettings(getSiteSettings());
    };
    window.addEventListener(SITE_SETTINGS_EVENT, onUpdate);
    return () => window.removeEventListener(SITE_SETTINGS_EVENT, onUpdate);
  }, []);

  const [formData, setFormData] = useState({
    instagramHandle: access.instagramHandle || '',
    phone: access.phone || '',
    region: 'Maitama',
    address: '',
    city: 'Abuja',
    state: 'FCT',
  });

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      instagramHandle: access.instagramHandle || prev.instagramHandle,
      phone: access.phone || prev.phone,
    }));
  }, [access]);

  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      setReceiptFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const submitOrder = async () => {
    if (items.length === 0) {
      setError('Your cart is empty');
      return;
    }
    if (!formData.instagramHandle.trim()) {
      setError('Please provide your Instagram handle');
      return;
    }
    if (!formData.phone.trim()) {
      setError('Please provide your phone number');
      return;
    }
    if (!formData.address.trim()) {
      setError('Please provide your full delivery address in Abuja');
      return;
    }
    if (!receiptFile) {
      setError('Please upload your payment receipt');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Lazily load Supabase only when the user actually submits an order.
      const { uploadReceipt, createOrder } = await import('@/lib/orders');
      const receiptUrl = await uploadReceipt(receiptFile);

      await createOrder({
        items,
        total,
        shippingAddress: {
          ...formData,
          instagramHandle: formData.instagramHandle.trim().startsWith('@')
            ? formData.instagramHandle.trim().toLowerCase()
            : `@${formData.instagramHandle.trim().toLowerCase()}`,
        },
        receiptUrl,
      });

      setSuccess(true);
      clearCart();
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError('Failed to process order. Please try again. ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <main className="max-w-2xl mx-auto px-4 pt-32 pb-24 text-center">
        <div className="bg-surface-container rounded-2xl p-8 botanical-shadow flex flex-col items-center">
          <CheckIcon />
          <h1 className="font-headline-md text-headline-md text-primary mb-4">Order Placed Successfully!</h1>
          <p className="font-body-lg text-on-surface-variant mb-8">
            Thank you for your purchase. We have received your order and payment receipt.
            Our team in Abuja will verify the transfer and prepare your dispatch shortly.
          </p>
          <a href="/" className="px-6 py-3 bg-primary text-on-primary rounded-full font-label-lg hover:bg-primary/90 transition-colors">
            Return to Store
          </a>
        </div>
      </main>
    );
  }

  if (!approved) {
    return (
      <main className="max-w-2xl mx-auto px-margin-mobile md:px-margin-desktop pt-32 pb-24 text-center">
        <div className="bg-surface-container-low rounded-2xl p-8 botanical-shadow border border-secondary/20 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h1 className="font-headline-md text-headline-md text-primary mb-3">
            {pending ? 'Membership Pending Approval' : 'Members-Only Checkout'}
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-8 max-w-md">
            {pending
              ? 'Your membership application is currently in the review queue. Once approved by our team, your checkout will be unlocked.'
              : 'Botanica is an invite-only apothecary. You must be invited by an approved member to place orders.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="/invite"
              className="px-6 py-3 bg-primary text-on-primary rounded-full font-label-sm text-label-sm uppercase tracking-widest hover:bg-primary/90 transition-colors"
            >
              {pending ? 'Check Application Status' : 'Enter Referral Code'}
            </a>
            <a
              href="/"
              className="px-6 py-3 border border-outline text-primary rounded-full font-label-sm text-label-sm uppercase tracking-widest hover:bg-surface-container transition-colors"
            >
              Explore Products
            </a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop pt-24 md:pt-32 pb-32">
      <h1 className="font-headline-lg text-headline-lg text-primary mb-stack-lg">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        <div className="lg:col-span-8 space-y-8">
          <section className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <h2 className="font-headline-sm text-headline-sm text-on-surface">Abuja Delivery Details</h2>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-label-sm uppercase tracking-wider bg-secondary/15 text-secondary font-medium w-fit">
                Abuja Shipping Only
              </span>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="instagramHandle" className="font-label-sm text-on-surface-variant block">
                    Instagram Handle <span className="text-error">*</span>
                  </label>
                  <input
                    required
                    id="instagramHandle"
                    type="text"
                    name="instagramHandle"
                    autoComplete="username"
                    placeholder="@your_handle"
                    value={formData.instagramHandle}
                    onChange={handleChange}
                    className="w-full min-h-11 p-3 bg-surface border border-outline rounded-lg font-mono text-primary placeholder:text-on-surface-variant/40"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="phone" className="font-label-sm text-on-surface-variant block">
                    Phone Number <span className="text-error">*</span>
                  </label>
                  <input
                    required
                    id="phone"
                    type="tel"
                    name="phone"
                    autoComplete="tel"
                    placeholder="+234 800 000 0000"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full min-h-11 p-3 bg-surface border border-outline rounded-lg font-mono text-primary placeholder:text-on-surface-variant/40"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="region" className="font-label-sm text-on-surface-variant block">
                  Abuja District / Region <span className="text-error">*</span>
                </label>
                <select
                  required
                  id="region"
                  name="region"
                  value={formData.region}
                  onChange={handleChange}
                  className="w-full min-h-11 p-3 bg-surface border border-outline rounded-lg text-primary appearance-none cursor-pointer"
                >
                  <option value="Asokoro">Asokoro</option>
                  <option value="Maitama">Maitama</option>
                  <option value="Wuse">Wuse / Wuse II</option>
                  <option value="Garki">Garki / Garki II</option>
                  <option value="Jabi">Jabi</option>
                  <option value="Guzape">Guzape</option>
                  <option value="Utako">Utako</option>
                  <option value="Central Business District">Central Business District (CBD)</option>
                  <option value="Katampe / Mabushi">Katampe / Mabushi</option>
                  <option value="Other Abuja District">Other Abuja District</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="address" className="font-label-sm text-on-surface-variant block">
                  Full Street Address & Delivery Notes <span className="text-error">*</span>
                </label>
                <textarea
                  required
                  id="address"
                  name="address"
                  autoComplete="street-address"
                  rows={3}
                  placeholder="House/Plot number, street name, building/estate name, landmark, or specific delivery instructions..."
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full p-3 bg-surface border border-outline rounded-lg text-primary placeholder:text-on-surface-variant/40 font-body-md"
                />
              </div>

              <div className="pt-1 flex items-center gap-2 text-xs text-on-surface-variant">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-secondary flex-shrink-0">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4" />
                  <path d="M12 8h.01" />
                </svg>
                <span>{siteSettings.bank.dispatchNote}</span>
              </div>
            </div>
          </section>

          <section className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/30">
            <h2 className="font-headline-sm text-headline-sm text-on-surface mb-6">Payment Instructions (Bank Transfer)</h2>

            <div className="bg-secondary-container/30 border border-secondary/20 p-6 rounded-lg mb-6">
              <p className="font-body-md text-on-surface-variant mb-4">
                Please transfer the exact total amount (<strong>{formatNaira(total)}</strong>) to the following Nigerian bank account.
              </p>

              <div className="space-y-2 font-body-lg text-on-surface bg-surface p-4 rounded-lg border border-outline-variant">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant font-label-md">Bank Name:</span>
                  <span className="font-medium">{siteSettings.bank.bankName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant font-label-md">Account Name:</span>
                  <span className="font-medium">{siteSettings.bank.accountName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant font-label-md">Account Number:</span>
                  <span className="font-headline-sm text-primary">{siteSettings.bank.accountNumber}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label htmlFor="receipt" className="font-label-md text-on-surface font-medium block">Upload Payment Receipt</label>

              <label
                htmlFor="receipt"
                className="block border-2 border-dashed border-primary/30 rounded-xl p-8 text-center cursor-pointer hover:bg-primary/5 transition-colors"
              >
                {previewUrl ? (
                  <span className="flex flex-col items-center">
                    <img src={previewUrl} alt="Receipt preview" className="max-h-48 rounded shadow-sm mb-4" />
                    <span className="font-label-sm text-primary">Click to change file</span>
                  </span>
                ) : (
                  <span className="flex flex-col items-center text-on-surface-variant">
                    <UploadIcon />
                    <span className="font-body-md mb-1">Click to upload your bank transfer receipt</span>
                    <span className="font-body-sm opacity-70">Supports JPG, PNG, PDF (Max 5MB)</span>
                  </span>
                )}
                <input
                  id="receipt"
                  name="receipt"
                  aria-label="Upload payment receipt"
                  type="file"
                  accept="image/*,.pdf"
                  className="sr-only"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </section>
        </div>

        <div className="lg:col-span-4">
          <div className="bg-surface-container rounded-xl p-6 border border-outline-variant/30 sticky top-24">
            <h2 className="font-headline-sm text-on-surface mb-6">Order Summary</h2>

            <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-16 h-16 bg-surface rounded-lg relative overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-surface-container-highest"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-label-sm text-on-surface line-clamp-1">{item.name}</p>
                    <p className="font-body-sm text-on-surface-variant">Qty: {item.quantity}</p>
                    {(item.strength_mg != null || item.bottle_size_ml != null || item.strain_name || item.batch_code) && (
                      <div className="font-label-sm text-label-sm text-on-surface-variant space-y-0.5">
                        {(item.strength_mg != null || item.bottle_size_ml != null) && <p>{item.strength_mg != null ? `${item.strength_mg} mg` : null}{item.strength_mg != null && item.bottle_size_ml != null ? ' / ' : null}{item.bottle_size_ml != null ? `${item.bottle_size_ml} ml` : null}</p>}
                        {item.strain_name && <p>{item.strain_name}</p>}
                        {item.batch_code && <p>{item.batch_code}</p>}
                      </div>
                    )}
                    <p className="font-label-md text-primary">{formatNaira(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-outline-variant pt-4 space-y-3 mb-6">
              <div className="flex justify-between font-body-md text-on-surface-variant">
                <span>Subtotal</span>
                <span>{formatNaira(total)}</span>
              </div>
              <div className="flex justify-between font-body-md text-on-surface-variant">
                <span>Shipping</span>
                <span>Calculated manually</span>
              </div>
              <div className="flex justify-between font-headline-sm text-on-surface pt-2">
                <span>Total</span>
                <span>{formatNaira(total)}</span>
              </div>
            </div>

            {error && (
              <div className="p-4 mb-4 bg-error/10 text-error rounded-lg font-body-sm flex gap-2 items-start">
                <AlertIcon />
                <p>{error}</p>
              </div>
            )}

            <button
              onClick={submitOrder}
              disabled={isSubmitting || items.length === 0}
              className="w-full py-4 bg-primary text-on-primary rounded-full font-label-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Processing Order...' : 'Submit Order & Receipt'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary mb-6">
      <path d="M21.801 10A10 10 0 1 1 17 3.335" />
      <path d="m9 11 3 3L22 4" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-3 text-primary/60">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" x2="12" y1="3" y2="15" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  );
}
