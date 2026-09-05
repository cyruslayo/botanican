import type { Article, ArticleCallout } from '@/lib/types';
export type { Article, ArticleCallout };

export const ARTICLES: Article[] = [
  {
    slug: 'circadian-tincture-chronobiology',
    title: 'Why Timing Matters More Than Chasing Strength',
    subtitle: 'Building a patient evening routine around consistent delivery and deliberate timing.',
    category: 'Culture & Routine',
    volume: 'Vol. IV',
    issue: 'Issue 01',
    date: 'Autumn 2026',
    readTime: '5 min read',
    author: {
      name: 'Botanica Editorial',
      role: 'Apothecary Journal',
    },
    featured: true,
    excerpt: 'Many adults look for a higher number on the bottle when what they really need is a more thoughtful routine. Introducing a consistent visual draw during an unhurried wind-down gives the evening time to develop naturally.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD1Yy6GMbIqi-iQxCvqjcLUfqwsZwkrt1RwcRWsq9LWTMGM2sWHofVCipqrnFTdmiNqF0BxZgRzurPlmSZ0H1_qHIX2EgXTqNjfQcjcuK2s4Xx3yAuJ-_QBo1i06XVliNJMJBxYP_gbqKVPVCFSA6bkTv1oLOQxIQM0Zh-klcrUdkcId8u87rBkqu2lUURTMk0qQO_X5KlbGWgQSN8rdjfBuXHAz2pzalmlqS1j13ztnc0aRaHdnK8OxA',
    thesis: 'A repeatable evening routine depends on consistent timing and unhurried observation, not chasing higher potency.',
    content: [
      'Standard retail logic encourages consumers to equate higher numbers with a better experience. We are conditioned to look for raw volume rather than paying attention to the setting, route, and timing.',
      'A deliberate evening begins well before reaching for a dropper. Dimming lights, putting work screens aside, and establishing quiet cues create an unhurried environment where an experience can be understood.',
      'When you keep the visual draw and route consistent, patience makes it easier to compare one experience with another.',
      'The takeaway is practical: keeping your routine, timing, and visual draw steady is far more informative than continuously adjusting strength.'
    ],
    keyTakeaways: [
      'Establishing a consistent evening wind-down sets the stage for deliberate use.',
      'Keeping the visual draw and administration route steady allows meaningful comparison.',
      'Allowing adequate time before assessing an experience prevents unnecessary adjustments.'
    ],
    relatedProductSlug: 'eucalyptus-balance-tincture',
    relatedProductName: 'Eucalyptus Balance Tincture',
    callout: {
      enabled: true,
      type: 'product',
      badge: 'Featured Botanical Formulation',
      title: 'Eucalyptus Balance Tincture',
      description: 'Tasmanian blue eucalyptus infused into pure coconut MCT oil. Formulated for deliberate evening routines.',
      productSlug: 'eucalyptus-balance-tincture',
      ctaText: 'View Apothecary Batch',
      ctaUrl: '/product/eucalyptus-balance-tincture'
    }
  },
  {
    slug: 'from-edibles-to-drops',
    title: 'From Edibles to Drops: What Actually Changes?',
    subtitle: 'A practical introduction to the tincture format for people who already understand gummies and brownies.',
    category: 'Format & Method',
    volume: 'Vol. IV',
    issue: 'Issue 02',
    date: 'Autumn 2026',
    readTime: '5 min read',
    author: {
      name: 'Botanica Editorial',
      role: 'Apothecary Journal',
    },
    featured: false,
    excerpt: 'Gummies and brownies offer a familiar fixed portion, but a tincture introduces an adjustable liquid format. Understanding the dropper, routes, and timing differences makes the transition straightforward.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBoSHUT8V8JvKKelG1Oc-mBK735DZvZGftkufgqbRYa9UpVmIu-DeKkjpp_B5C_VtWTTySsW3JxbPKsk0TR7l-kLLYVpOsUIsFkn-s317dsJ-j3zoqHsz3Imi0n_ArtGx_6T_J7bB6wKw-TqEAHtxnKbutmCXJHf02jvaRPX-CSlJkCW_c6plXN7OEj5zEOy7cuEXL8fUoElj-6UmS9sV762gaxVnq1Ar4RNov77DwrwD9XY-tqsj3-Yg',
    thesis: 'The biggest change is not cannabis itself. It is moving from a familiar edible portion to a liquid format with a visible draw.',
    content: [
      'Most adults who explore cannabis tinctures are already familiar with edibles. A gummy or pastille provides a fixed, pre-portioned piece that is chewed and swallowed. You take the piece, and digestion handles the rest.',
      'A tincture changes the physical format entirely: it is a liquid extract carried in coconut MCT oil. Instead of taking a fixed confection, you draw liquid into a small dropper bottle.',
      'Because the dropper is unmarked, you rely on simple visual reference states—such as a quarter or half fill height—to maintain consistency. This visual reference gives you flexible, observable control that a solid edible cannot match.',
      'How you take the tincture also introduces choice. Holding the drops under your tongue allows absorption through oral tissue, which can feel sooner than swallowing the liquid directly into digestion.',
      'Timing can vary based on your chosen route, recent food, and personal metabolism. Giving each experience adequate time before adjusting anything is the key to building a predictable routine.'
    ],
    keyTakeaways: [
      'Fixed edible pieces differ fundamentally from an adjustable liquid format.',
      'Visual fill height provides a clear, repeatable reference point.',
      'Holding liquid under the tongue versus swallowing creates different timing experiences.',
      'Allowing time for the experience to develop avoids premature adjustments.'
    ]
  },
  {
    slug: 'cannabis-after-the-day-is-done',
    title: 'Cannabis After the Day Is Done',
    subtitle: 'Why a deliberate routine starts with separating work from the evening.',
    category: 'Culture & Routine',
    volume: 'Vol. IV',
    issue: 'Issue 03',
    date: 'Autumn 2026',
    readTime: '4 min read',
    author: {
      name: 'Botanica Editorial',
      role: 'Apothecary Journal',
    },
    featured: false,
    excerpt: 'Cannabis is not meant to help anyone perform at work. Creating a clear, deliberate boundary between professional responsibilities and personal evening hours allows the experience to be appreciated on its own terms.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB6KYoMlMURvm17nCxK41HXzRuKdBcC2Det8Yax_tc9aRW1bptic26i0aK8O7LE6jCZd13SHZ_BvCDU2kfS8waEloqtdu_1I1JEPY5AtaezQ6XTubWtsVUw0FTDJbPArCFcFyE5HuRXQe6sLcm9LHlhwMo6fLE_U1D10f_L_ZaPw6K5T69KAcFGL_Y_cxu0gPcJuhwR_cmZkeFNAIdse_MnJ_g5MdFRv6dbOjxvwyxiL3E3E9b1n3zthQ',
    thesis: 'A clear boundary between work and personal time creates a better setting for deliberate cannabis use.',
    content: [
      'For busy professionals, the boundary between daytime obligations and evening rest often blurs. Urgent notifications, open browser tabs, and unresolved tasks carry into personal hours.',
      'A deliberate approach to cannabis starts by drawing a firm line. Finishing work completely, putting professional screens away, and stepping out of work mode ensures that cannabis is never used as a workplace performance tool.',
      'Reducing ambient stimulation—dimming overhead lights and stepping into an unhurried setting—creates the space for an evening routine to settle. The environment signals the transition long before you reach for a dropper.',
      'When taken in a calm setting with a steady routine, you can observe the experience quietly for what it is, rather than constantly chasing stronger effects or quick results.'
    ],
    keyTakeaways: [
      'Drawing a distinct line between work and personal time grounds the evening.',
      'Cannabis belongs in private, off-duty routines, never in the workplace.',
      'Lowering environmental stimulation allows the routine to unfold naturally.',
      'Observing consistent conditions provides clarity across evenings.'
    ]
  }
];

export async function getAllArticles(): Promise<Article[]> {
  try {
    const { getSupabase } = await import('@/lib/supabase');
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data.map((row: any) => ({
        id: row.id,
        slug: row.slug,
        title: row.title,
        subtitle: row.subtitle,
        category: row.category,
        volume: row.volume || 'Vol. IV',
        issue: row.issue || 'Issue 01',
        date: row.date || '2026',
        readTime: row.read_time || '5 min read',
        author: {
          name: row.author_name || 'Botanica Editorial',
          role: row.author_role || 'Apothecary Journal',
        },
        featured: Boolean(row.is_featured),
        excerpt: row.excerpt,
        image: row.image_url || ARTICLES[0].image,
        thesis: row.thesis || '',
        content: Array.isArray(row.content) ? row.content : [row.content || ''],
        keyTakeaways: Array.isArray(row.key_takeaways) ? row.key_takeaways : [],
        relatedProductSlug: row.related_product_slug,
        relatedProductName: row.related_product_name,
        callout: row.callout || (row.related_product_slug ? {
          enabled: true,
          type: 'product',
          badge: 'Featured Botanical Formulation',
          title: row.related_product_name || 'Apothecary Formulation',
          description: 'A small-batch Botanica formulation featured alongside this journal entry.',
          productSlug: row.related_product_slug,
          ctaText: 'View Apothecary Batch',
          ctaUrl: `/product/${row.related_product_slug}`
        } : undefined),
        status: row.status || 'published',
        created_at: row.created_at,
        updated_at: row.updated_at,
      }));
    }
  } catch {}

  return ARTICLES;
}

export function getFeaturedArticle(articles: Article[] = ARTICLES): Article {
  return articles.find((a) => a.featured) || articles[0];
}

export function getArticleBySlug(slug: string, articles: Article[] = ARTICLES): Article | undefined {
  return articles.find((a) => a.slug === slug);
}
