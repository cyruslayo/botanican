import type { Article, ArticleCallout } from '@/lib/types';
export type { Article, ArticleCallout };

export const ARTICLES: Article[] = [
  {
    slug: 'circadian-tincture-chronobiology',
    title: 'The Circadian Tincture: Why Chronobiology Outranks Potency',
    subtitle: 'Matching botanical delivery to the biphasic rhythm of the nervous system.',
    category: 'Circadian Science',
    volume: 'Vol. IV',
    issue: 'Issue 01',
    date: 'Autumn 2026',
    readTime: '6 min read',
    author: {
      name: 'Dr. Evelyn Vance',
      role: 'Head of Botanical Formulation',
    },
    featured: true,
    excerpt: 'High-potency botanical supplements often fail not from lack of active compounds, but from mistimed receptor engagement. When administered 90 minutes prior to deep slow-wave sleep, sublingual cannabinoids synchronize with natural core body temperature decline.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD1Yy6GMbIqi-iQxCvqjcLUfqwsZwkrt1RwcRWsq9LWTMGM2sWHofVCipqrnFTdmiNqF0BxZgRzurPlmSZ0H1_qHIX2EgXTqNjfQcjcuK2s4Xx3yAuJ-_QBo1i06XVliNJMJBxYP_gbqKVPVCFSA6bkTv1oLOQxIQM0Zh-klcrUdkcId8u87rBkqu2lUURTMk0qQO_X5KlbGWgQSN8rdjfBuXHAz2pzalmlqS1j13ztnc0aRaHdnK8OxA',
    thesis: 'The therapeutic window of lipid-soluble phytocannabinoids is governed primarily by circadian receptor density, not raw milligram volume.',
    content: [
      'The modern functional consumer has been conditioned to look for a single metric: milligrams per bottle. We are trained by standard retail logic to equate higher numbers with superior efficacy. In human chronobiology, however, receptor affinity fluctuates on a precise 24-hour oscillary rhythm.',
      'Cannabinoid Type 1 (CB1) and Type 2 (CB2) receptors throughout the central nervous system do not express with static sensitivity throughout the day. Between 8:00 PM and 10:30 PM, parasympathetic tone rises as peripheral blood vessels dilate to disperse heat. When phytocannabinoids are introduced during this descent, they work in concert with endogenous signaling cascades.',
      'Administered sublingually, the compounds permeate the rich sublingual vascular network within 15 to 30 minutes, bypassing the extensive hepatic first-pass degradation that converts orally ingested compounds into erratic second-generation metabolites. The result is a smooth, reproducible glide rather than an overwhelming, unmoored peak.',
      'The takeaway is practical and profound: half the dose administered at the precise biological inflection point achieves double the functional restorative depth.'
    ],
    keyTakeaways: [
      'CB1 receptor tone peaks during early evening parasympathetic wind-down.',
      'Sublingual administration prevents unpredictable first-pass liver metabolite spikes.',
      'Timing the dose 60 to 90 minutes before sleep yields deeper slow-wave progression with zero next-day fog.'
    ],
    relatedProductSlug: 'eucalyptus-balance-tincture',
    relatedProductName: 'Eucalyptus Balance Tincture 50mg',
    callout: {
      enabled: true,
      type: 'product',
      badge: 'Mentioned Apothecary Formulation',
      title: 'Eucalyptus Balance Tincture 50mg',
      description: 'CO2-extracted Tasmanian blue eucalyptus and cold-pressed MCT oil. Micro-batched with verified independent chromatography.',
      productSlug: 'eucalyptus-balance-tincture',
      ctaText: 'View Apothecary Batch',
      ctaUrl: '/product/eucalyptus-balance-tincture'
    }
  },
  {
    slug: 'supercritical-co2-terpene-integrity',
    title: 'Supercritical CO2 vs Solvent Extraction: Preserving the Delicate Terpene Spectrum',
    subtitle: 'A technical dissection of botanical volatile preservation at low temperatures.',
    category: 'Extraction & Lab',
    volume: 'Vol. IV',
    issue: 'Issue 02',
    date: 'Autumn 2026',
    readTime: '5 min read',
    author: {
      name: 'Marcus H. Keller',
      role: 'Senior Extraction Chemist',
    },
    featured: false,
    excerpt: 'Traditional ethanol and hydrocarbon washes degrade delicate monoterpenes like myrcene and linalool through heat and solvent polarity. Supercritical fluid extraction preserves the plant’s living biochemical footprint.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBoSHUT8V8JvKKelG1Oc-mBK735DZvZGftkufgqbRYa9UpVmIu-DeKkjpp_B5C_VtWTTySsW3JxbPKsk0TR7l-kLLYVpOsUIsFkn-s317dsJ-j3zoqHsz3Imi0n_ArtGx_6T_J7bB6wKw-TqEAHtxnKbutmCXJHf02jvaRPX-CSlJkCW_c6plXN7OEj5zEOy7cuEXL8fUoElj-6UmS9sV762gaxVnq1Ar4RNov77DwrwD9XY-tqsj3-Yg',
    thesis: 'Supercritical carbon dioxide allows sub-zero fractionation of aromatic terpenes before cannabinoid extraction, safeguarding the holistic entourage matrix.',
    content: [
      'In high-throughput botanical extraction, speed frequently compromises nuance. Standard industrial procedures submerge biomass into high-proof ethanol or volatile hydrocarbons under thermal pressure. While efficient at stripping bulk active compounds, this process permanently shears off delicate volatile monoterpenes.',
      'Botanica employs closed-loop Supercritical CO2 fractionation. Carbon dioxide is pressurized past its critical point (1,071 psi at 31.1°C), where it behaves simultaneously as a dense liquid and a penetrating gas.',
      'By tuning pressure in distinct stages, we first separate the fragrant, sub-volatile aroma fractions—linalool, beta-caryophyllene, and humulene—without exposing them to thermal degradation. Only then is the heavier resin extracted and recombined in certified ratios.',
      'This guarantees that what lands under your tongue reflects the exact botanical fingerprint of the harvest, free of petrochemical traces.'
    ],
    keyTakeaways: [
      'Monoterpenes volatilize and evaporate at temperatures as low as 21°C.',
      'Multi-stage CO2 fractionation enables cold extraction without petrochemical solvents.',
      'Third-party analytical chromatography verifies zero residual solvent parts-per-billion.'
    ]
  },
  {
    slug: 'evening-architecture-habit-stacking',
    title: 'The Evening Architecture: Designing Sensory Wind-Down Protocols',
    subtitle: 'Why lighting, sensory anchors, and the botanical mocktail prepare the brain for restorative stillness.',
    category: 'Protocol & Ritual',
    volume: 'Vol. IV',
    issue: 'Issue 03',
    date: 'Autumn 2026',
    readTime: '4 min read',
    author: {
      name: 'Claire Moreau',
      role: 'Circadian Design Contributor',
    },
    featured: false,
    excerpt: 'A tincture should never be expected to outmuscle a barrage of blue photons and high-cortisol stimuli. How habit stacking creates an environmental runway for botanical absorption.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB6KYoMlMURvm17nCxK41HXzRuKdBcC2Det8Yax_tc9aRW1bptic26i0aK8O7LE6jCZd13SHZ_BvCDU2kfS8waEloqtdu_1I1JEPY5AtaezQ6XTubWtsVUw0FTDJbPArCFcFyE5HuRXQe6sLcm9LHlhwMo6fLE_U1D10f_L_ZaPw6K5T69KAcFGL_Y_cxu0gPcJuhwR_cmZkeFNAIdse_MnJ_g5MdFRv6dbOjxvwyxiL3E3E9b1n3zthQ',
    thesis: 'Habit stacking an evening botanical dose onto an established tactile routine reduces sleep latency by over 40% compared to isolated consumption.',
    content: [
      'Taking a tincture while answering midnight urgent emails from a glowing laptop screen creates neurological friction. The body receives conflicting chemical and sensory instructions: melatonin suppression from overhead photons versus sedative tone from botanical agonists.',
      'Effective restorative protocols leverage habit stacking. By chaining your botanical intake to an existing ritual—brewing a cup of loose-leaf chamomile, dimming ambient lumination below eye level, and putting phone screens to rest—the nervous system prepares for deceleration.',
      'Our members frequently practice the Botanical Mocktail ritual: mineral water poured over cold stone, two dashes of aromatic bitters, fresh citrus peel, and a precise quarter-pipette of tincture. It preserves the sensory satisfaction of an evening digestif with zero alcohol, zero sleep architecture disruption, and zero next-day fog.'
    ],
    keyTakeaways: [
      'Sensory cues (amber lighting, cold glassware) trigger conditioned parasympathetic release.',
      'Replacing evening alcohol with botanical mocktails protects REM sleep architecture.',
      'A simple 4-line evening log creates an empirical personal titration record.'
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
          name: row.author_name || 'Botanica Research',
          role: row.author_role || 'Apothecary Editorial',
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
          badge: 'Mentioned Apothecary Formulation',
          title: row.related_product_name || 'Apothecary Formulation',
          description: 'CO2-extracted, micro-batched with verified independent analytical chromatography.',
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
