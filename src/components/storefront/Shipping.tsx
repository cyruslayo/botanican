'use client';
import { StaggerContainer, StaggerItem } from '@/components/FadeIn';

export default function Shipping() {
  const handleContinue = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    window.location.href = '/checkout/confirmation';
  };

  return (
    <main className="flex-grow pt-24 px-margin-mobile md:px-margin-desktop max-w-2xl mx-auto w-full pb-24 md:pb-32">
      <StaggerContainer>
        <StaggerItem className="flex justify-center items-center mb-stack-lg space-x-4">
          <div className="flex items-center">
            <div className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-sm text-label-sm">
              <CheckIcon />
            </div>
            <span className="ml-2 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">Cart</span>
          </div>
          <div className="w-8 h-[1px] bg-outline-variant"></div>
          <div className="flex items-center">
            <div className="w-6 h-6 rounded-full border-2 border-primary text-primary flex items-center justify-center font-label-sm text-label-sm">
              2
            </div>
            <span className="ml-2 font-label-sm text-label-sm text-primary uppercase tracking-widest font-bold">Shipping</span>
          </div>
          <div className="w-8 h-[1px] bg-outline-variant"></div>
          <div className="flex items-center opacity-50">
            <div className="w-6 h-6 rounded-full border border-outline-variant text-on-surface-variant flex items-center justify-center font-label-sm text-label-sm">
              3
            </div>
            <span className="ml-2 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">Payment</span>
          </div>
        </StaggerItem>

        <StaggerItem className="mb-stack-lg text-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-label-sm uppercase tracking-wider bg-secondary/15 text-secondary font-medium mb-3">
            Abuja Delivery Only
          </div>
          <h2 className="font-headline-sm text-headline-sm text-primary mb-stack-sm">Where should we send your ritual?</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Please provide your Abuja delivery information.</p>
        </StaggerItem>

        <StaggerItem>
          <form onSubmit={handleContinue} className="space-y-stack-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
              <div className="relative">
                <input type="text" id="instagramHandle" name="instagramHandle" required placeholder=" " className="input-underline w-full min-h-11 pt-4 pb-2 peer font-mono text-body-lg text-primary placeholder-transparent" />
                <label htmlFor="instagramHandle" className="absolute left-0 top-0 text-on-surface-variant font-body-md text-body-md transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-body-lg peer-focus:top-0 peer-focus:text-body-md peer-focus:text-primary">Instagram Handle (@handle)</label>
              </div>

              <div className="relative">
                <input type="tel" id="phone" name="phone" required placeholder=" " autoComplete="tel" className="input-underline w-full min-h-11 pt-4 pb-2 peer font-mono text-body-lg text-primary placeholder-transparent" />
                <label htmlFor="phone" className="absolute left-0 top-0 text-on-surface-variant font-body-md text-body-md transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-body-lg peer-focus:top-0 peer-focus:text-body-md peer-focus:text-primary">Phone Number</label>
              </div>
            </div>

            <div className="relative">
              <select id="region" name="region" required aria-label="Abuja District" className="input-underline w-full min-h-11 pt-4 pb-2 font-body-lg text-body-lg text-primary appearance-none cursor-pointer" defaultValue={'Maitama'}>
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
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pt-2 text-on-surface-variant">
                <ChevronIcon />
              </div>
            </div>

            <div className="relative">
              <input type="text" id="address" name="address" required placeholder=" " autoComplete="street-address" className="input-underline w-full min-h-11 pt-4 pb-2 peer font-body-lg text-body-lg text-primary placeholder-transparent" />
              <label htmlFor="address" className="absolute left-0 top-0 text-on-surface-variant font-body-md text-body-md transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-body-lg peer-focus:top-0 peer-focus:text-body-md peer-focus:text-primary">Full Address & Landmark (Abuja)</label>
            </div>

            <div className="pt-section-gap pb-stack-lg">
              <button type="submit" className="w-full bg-primary text-on-primary py-4 px-6 rounded-full font-label-sm text-label-sm uppercase tracking-widest hover:bg-primary-container hover:scale-[1.02] transition-all duration-300">
                Continue to Payment
              </button>
            </div>
          </form>
        </StaggerItem>
      </StaggerContainer>
    </main>
  );
}

function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
