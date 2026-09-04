'use client';
import { useStore } from '@nanostores/react';
import { cartItems, removeItem, updateQuantity, cartTotal, cartCount } from '@/store/cart';
import { formatNaira } from '@/lib/utils';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/FadeIn';
import { useHydrated } from '@/lib/useHydrated';

export default function Cart() {
  const isHydrated = useHydrated();
  const rawItems = useStore(cartItems);
  const rawTotal = useStore(cartTotal);
  const rawCount = useStore(cartCount);

  const items = isHydrated ? rawItems : [];
  const total = isHydrated ? rawTotal : 0;
  const count = isHydrated ? rawCount : 0;

  return (
    <main className="flex-1 w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop pt-24 md:pt-32 pb-32">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter lg:gap-margin-desktop">
        <div className="lg:col-span-7 flex flex-col gap-stack-lg">
          <FadeIn>
            <div className="flex items-baseline justify-between mb-stack-sm border-b border-surface-variant pb-stack-sm">
              <h2 className="font-headline-sm text-headline-sm text-on-surface">Your Bag ({count} items)</h2>
            </div>
          </FadeIn>

          {items.length === 0 ? (
            <FadeIn delay={0.1}>
              <p className="font-body-md text-on-surface-variant py-8">Your bag is empty.</p>
            </FadeIn>
          ) : (
            <StaggerContainer>
              {items.map((item) => (
                <StaggerItem key={item.id} className="flex gap-stack-md py-stack-md relative group">
                  <div className="w-24 md:w-32 aspect-[3/4] shrink-0 bg-surface-container rounded-lg overflow-hidden relative">
                    <img src={item.image} alt={item.name} referrerPolicy="no-referrer" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                  </div>

                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="font-body-lg text-body-lg text-on-surface pr-4">{item.name}</h3>
                        <button onClick={() => removeItem(item.id)} aria-label={`Remove ${item.name} from bag`} className="touch-target flex items-center justify-center text-on-surface-variant hover:text-error transition-colors p-1 -mt-1 -mr-1">
                          <XIcon />
                        </button>
                      </div>
                      <p className="font-body-md text-body-md text-on-surface-variant mt-1">{item.variant}</p>
                      <p className="font-headline-sm text-headline-sm text-on-surface mt-2">{formatNaira(item.price)}</p>
                    </div>

                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center border border-outline-variant rounded-full px-3 py-1">
                        <button onClick={() => updateQuantity(item.id, -1)} aria-label={`Decrease quantity of ${item.name}`} className="touch-target flex items-center justify-center text-on-surface-variant hover:text-primary p-1">
                          <MinusIcon />
                        </button>
                        <span className="font-body-md text-body-md text-on-surface w-8 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} aria-label={`Increase quantity of ${item.name}`} className="touch-target flex items-center justify-center text-on-surface-variant hover:text-primary p-1">
                          <PlusIcon />
                        </button>
                      </div>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}

          <FadeIn delay={0.2}>
            <div className="mt-stack-lg bg-surface-container-low rounded-xl p-stack-md flex items-center justify-between border border-surface-variant">
              <div className="flex items-center gap-3">
                <GiftIcon />
                <p className="font-body-md text-body-md text-on-surface">You qualify for 2 complimentary samples.</p>
              </div>
              <button className="font-label-sm text-label-sm text-secondary uppercase hover:opacity-70 transition-opacity">Select</button>
            </div>
          </FadeIn>
        </div>

        <div className="lg:col-span-5 relative mt-section-gap lg:mt-0">
          <div className="sticky top-24">
            <FadeIn delay={0.1}>
              <div className="bg-surface-container-low rounded-xl p-stack-lg border border-surface-variant">
                <h2 className="font-headline-sm text-headline-sm text-on-surface mb-stack-lg border-b border-outline-variant pb-stack-sm">Order Summary</h2>
                <div className="flex flex-col gap-stack-sm font-body-md text-body-md text-on-surface-variant mb-stack-lg">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-on-surface">{formatNaira(total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping estimate</span>
                    <span className="text-on-surface">Calculated at checkout</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax estimate</span>
                    <span className="text-on-surface">{formatNaira(0)}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center mb-stack-lg border-t border-outline-variant pt-stack-md">
                  <span className="font-headline-sm text-headline-sm text-on-surface">Total</span>
                  <span className="font-headline-sm text-headline-sm text-on-surface">{formatNaira(total)}</span>
                </div>
                <a href="/checkout" className="w-full bg-primary text-on-primary py-4 rounded-full font-label-sm text-label-sm uppercase tracking-widest hover:scale-102 active:scale-98 transition-transform duration-300 flex items-center justify-center gap-2">
                  Checkout
                  <ArrowRightIcon />
                </a>
                <div className="mt-stack-md flex items-center justify-center gap-2 text-on-surface-variant opacity-70">
                  <LockIcon />
                  <span className="font-label-sm text-label-sm">Secure Checkout</span>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </main>
  );
}

function XIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

function GiftIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-secondary">
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <path d="M12 8v13" />
      <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
      <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
