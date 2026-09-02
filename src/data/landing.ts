/**
 * Shared content + constants for the public landing page.
 * Keep all visible copy compliance-safe: botanical support framing,
 * no medical claims, no dosing prescriptions.
 */

export const HERO_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuB6KYoMlMURvm17nCxK41HXzRuKdBcC2Det8Yax_tc9aRW1bptic26i0aK8O7LE6jCZd13SHZ_BvCDU2kfS8waEloqtdu_1I1JEPY5AtaezQ6XTubWtsVUw0FTDJbPArCFcFyE5HuRXQe6sLcm9LHlhwMo6fLE_U1D10f_L_ZaPw6K5T69KAcFGL_Y_cxu0gPcJuhwR_cmZkeFNAIdse_MnJ_g5MdFRv6dbOjxvwyxiL3E3E9b1n3zthQ';

export const OILS_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuD1Yy6GMbIqi-iQxCvqjcLUfqwsZwkrt1RwcRWsq9LWTMGM2sWHofVCipqrnFTdmiNqF0BxZgRzurPlmSZ0H1_qHIX2EgXTqNjfQcjcuK2s4Xx3yAuJ-_QBo1i06XVliNJMJBxYP_gbqKVPVCFSA6bkTv1oLOQxIQM0Zh-klcrUdkcId8u87rBkqu2lUURTMk0qQO_X5KlbGWgQSN8rdjfBuXHAz2pzalmlqS1j13ztnc0aRaHdnK8OxA';

export const EDIBLES_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBoSHUT8V8JvKKelG1Oc-mBK735DZvZGftkufgqbRYa9UpVmIu-DeKkjpp_B5C_VtWTTySsW3JxbPKsk0TR7l-kLLYVpOsUIsFkn-s317dsJ-j3zoqHsz3Imi0n_ArtGx_6T_J7bB6wKw-TqEAHtxnKbutmCXJHf02jvaRPX-CSlJkCW_c6plXN7OEj5zEOy7cuEXL8fUoElj-6UmS9sV762gaxVnq1Ar4RNov77DwrwD9XY-tqsj3-Yg';

/** Dropper calculator: 30 ml bottles in the current catalog, ~20 drops per ml. */
export const DROPS_PER_ML = 20;
export const BOTTLE_SIZE_ML = 30;

export interface BottleOption {
  id: string;
  label: string;
  totalMg: number;
}

export const BOTTLE_OPTIONS: BottleOption[] = [
  { id: '500', label: '500 mg / 30 ml', totalMg: 500 },
  { id: '750', label: '750 mg / 30 ml', totalMg: 750 },
  { id: '1000', label: '1,000 mg / 30 ml', totalMg: 1000 },
];

export interface DrawOption {
  id: string;
  label: string;
  ml: number;
}

export const DRAW_OPTIONS: DrawOption[] = [
  { id: 'quarter', label: '¼ pipette', ml: 0.25 },
  { id: 'half', label: '½ pipette', ml: 0.5 },
  { id: 'three-quarter', label: '¾ pipette', ml: 0.75 },
  { id: 'full', label: 'Full pipette', ml: 1 },
];

export interface FaqItem {
  question: string;
  answer: string;
}

/** Landing FAQ: bedtime timing, grogginess, redose patience, routine, tracking, spectrum. */
export const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'How late is too late for a bedtime dose?',
    answer:
      'Count back 90 minutes from lights-out for a swallowed dose, or 30 minutes for one held under the tongue. Taken too close to bedtime, the onset can arrive while you are still awake and waiting, which is how nights get long.',
  },
  {
    question: 'Why do I sometimes wake up groggy?',
    answer:
      'Next-morning grogginess usually traces to timing and amount, not the botanical itself. A larger amount taken later in the evening keeps working through the deepest sleep stages. An earlier, smaller dose in a cool, dark room is the adjustment most people need.',
  },
  {
    question: 'I feel nothing after 30 minutes. Should I take more?',
    answer:
      'Not yet. Check the clock against your route: a dose held under the tongue lands within 15 to 30 minutes, while a swallowed one takes 60 to 90. Redosing inside the window stacks two amounts into a single evening.',
  },
  {
    question: 'How do I build a repeatable routine?',
    answer:
      'Fix three things: the same amount, the same time, the same setting. Hold them steady for three evenings before changing anything, then adjust one variable at a time so you can read what each change actually does.',
  },
  {
    question: 'What should I write in my wellness log?',
    answer:
      'Four lines is enough: the amount in milligrams, the time taken, your mood before bed, and how you woke. Within a fortnight the patterns in your own data become the most reliable dosing guidance you own.',
  },
  {
    question: 'Full-spectrum, broad-spectrum, or isolate: which fits me?',
    answer:
      'Full-spectrum keeps the whole plant, including trace THC. Broad-spectrum removes the THC and keeps the rest of the plant. Isolate is a single compound alone. If you want depth with zero THC, broad-spectrum is the usual answer.',
  },
];

export function buildFaqJsonLd(faqItems: FaqItem[] = FAQ_ITEMS) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}
