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

/** Landing FAQ: four simple questions about the product and private access. */
export const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'What is Botanica?',
    answer:
      'Botanica is an invite-only brand offering small-batch cannabis tinctures in a dropper format. The public site explains the format; approved members enter the private store.',
  },
  {
    question: 'How do invites work?',
    answer:
      'A current member shares an invite. You apply with the valid code, and the Botanica team reviews your request before private store access is approved.',
  },
  {
    question: 'What do I do with my invite code?',
    answer:
      'Go to the invite page, enter the valid code you received, and complete the short application. Do not share your code publicly.',
  },
  {
    question: 'Where can I learn how to use the dropper?',
    answer:
      'Visit the visual dropper guide at /how-to-use to see approximate reference levels. It is a visual aid, not a calibrated measurement or medical instruction.',
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
