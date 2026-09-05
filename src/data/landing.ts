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

export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'What is a cannabis tincture?',
    answer:
      'A cannabis tincture is a liquid cannabis format dispensed with a dropper. Botanica uses this format for discreet, deliberate routines.',
  },
  {
    question: 'How is this different from a gummy?',
    answer:
      'A gummy is a fixed edible portion that must pass entirely through digestion. A tincture uses a liquid draw you can adjust visually and take either under the tongue or swallowed.',
  },
  {
    question: 'What does a quarter or half draw mean?',
    answer:
      'They are visual references on our guide. The physical dropper is unmarked, so these labels describe approximate fill positions, not calibrated measurements.',
  },
  {
    question: 'Why is the current dropper unmarked?',
    answer:
      'The current physical droppers do not have printed measurement marks. Visual draw levels serve as approximate guides for repeatable routines rather than calibrated volume markings.',
  },
  {
    question: 'Does holding it under the tongue change anything?',
    answer:
      'Holding the tincture under the tongue allows contact with oral tissue, which can feel sooner than swallowing, where the extract must pass through digestion.',
  },
  {
    question: 'Why can the same draw feel different on another day?',
    answer:
      'Timing and experience are personal. Factors like whether you take it under the tongue or swallow it, recent food, your individual biology, and previous experience can all influence how it develops.',
  },
  {
    question: 'Can I use Botanica during work?',
    answer:
      'Botanica is not marketed for workplace performance. THC can impair attention and judgment. Always follow workplace rules and local law.',
  },
  {
    question: 'How should I compare one experience with another?',
    answer:
      'Compare your own experiences under similar conditions instead of copying someone else’s routine. Keep the visual draw level and route consistent, and change only one thing at a time.',
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
