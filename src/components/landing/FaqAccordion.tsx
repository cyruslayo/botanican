'use client';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { FaqItem } from '@/data/landing';

export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="divide-y divide-outline-variant/40 border-y border-outline-variant/40">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const panelId = `faq-panel-${index}`;
        const buttonId = `faq-button-${index}`;
        return (
          <div key={item.question}>
            <button
              type="button"
              id={buttonId}
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="w-full flex items-center justify-between gap-6 py-5 text-left group"
            >
              <span className="font-headline-sm text-headline-sm text-primary group-hover:opacity-80 transition-opacity">
                {item.question}
              </span>
              <ChevronDown
                size={20}
                strokeWidth={1.5}
                aria-hidden="true"
                className={`shrink-0 text-secondary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className="grid transition-[grid-template-rows] duration-300 ease-out"
              style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
            >
              <div className="overflow-hidden">
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed pb-6 pr-10 max-w-[65ch]">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
