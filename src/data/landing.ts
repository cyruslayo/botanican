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

/** Dropper calculator: 10 ml bottles in the current catalog, ~20 drops per ml. */
export const DROPS_PER_ML = 20;
export const BOTTLE_SIZE_ML = 10;

export interface BottleOption {
  id: string;
  label: string;
  totalMg: number;
}

export const BOTTLE_OPTIONS: BottleOption[] = [
  { id: '25', label: '25 mg / 10 ml', totalMg: 25 },
  { id: '50', label: '50 mg / 10 ml', totalMg: 50 },
];

export interface DrawOption {
  id: string;
  label: string;
  ratio: number;
  ml: number;
}

export const DRAW_OPTIONS: DrawOption[] = [
  { id: 'quarter', label: '¼ draw', ratio: 0.25, ml: 0.25 },
  { id: 'half', label: '½ draw', ratio: 0.5, ml: 0.5 },
  { id: 'three-quarter', label: '¾ draw', ratio: 0.75, ml: 0.75 },
  { id: 'full', label: 'Full draw', ratio: 1, ml: 1 },
];

export interface FaqItem {
  question: string;
  answer: string;
}

/** Landing FAQ: 8 core questions covering tincture format, routines, and deliberate use. */
export const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'What is a cannabis tincture?',
    answer:
      'A cannabis tincture is a liquid extract infused into a carrier oil such as coconut MCT. It is taken using a dropper bottle, either held under the tongue or swallowed.',
  },
  {
    question: 'How is this different from a gummy?',
    answer:
      'A gummy comes as a fixed confectionery piece that is chewed and swallowed through digestion. A tincture is a liquid format that can be taken under the tongue or swallowed, and can be adjusted visually using the dropper.',
  },
  {
    question: 'What does a quarter or half draw mean?',
    answer:
      'Because the current dropper is unmarked, a quarter or half draw refers to the visible fill height of liquid in the glass chamber relative to a full squeeze.',
  },
  {
    question: 'Why is the current dropper unmarked?',
    answer:
      'Botanica currently uses clean, unmarked apothecary glass droppers. Visual reference levels offer a practical way to recognize a similar fill level without relying on printed measurement lines.',
  },
  {
    question: 'Does holding it under the tongue change anything?',
    answer:
      'Yes. Holding the liquid against tissue beneath the tongue allows it to absorb through local oral tissue before swallowing, which can feel sooner than swallowing directly through digestion.',
  },
  {
    question: 'Why can the same draw feel different on another day?',
    answer:
      'Differences in your administration route, recent meals, personal physiology, and frequency of use all influence how an experience develops from one day to the next.',
  },
  {
    question: 'Can I use Botanica during work?',
    answer:
      'Botanica is not marketed for workplace performance. THC can impair attention and judgment. Follow workplace rules and local law.',
  },
  {
    question: 'How should I compare one experience with another?',
    answer:
      'Keep the conditions steady. Use the same visual reference draw, the same administration route, and a similar evening setting so you have a consistent baseline for comparison.',
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
