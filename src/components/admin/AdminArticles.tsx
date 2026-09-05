'use client';
import { useState, useEffect, useCallback } from 'react';
import type { Article, Product } from '@/lib/types';
import { getAllArticles } from '@/data/journal';
import { getGazetteSettings, saveGazetteSettings, type GazetteSettings, DEFAULT_GAZETTE_SETTINGS } from '@/lib/gazetteSettings';
import ArticleFormModal from './ArticleFormModal';
import { BookOpen, Plus, Sparkles, ExternalLink, Edit2, Trash2, CheckCircle2, Sliders, Check } from 'lucide-react';

export default function AdminArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [articleToEdit, setArticleToEdit] = useState<Article | null>(null);

  // Masthead / Gazette Edition settings state
  const [gazetteSettings, setGazetteSettings] = useState<GazetteSettings>(DEFAULT_GAZETTE_SETTINGS);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);


  const fetchArticlesAndProducts = useCallback(async () => {
    setLoading(true);
    try {
      const liveArticles = await getAllArticles();
      setArticles(liveArticles);

      // Also fetch products for the related product selector
      const { getSupabase } = await import('@/lib/supabase');
      const supabase = getSupabase();
      const { data } = await supabase.from('products').select('*');
      if (data) setProducts(data);
    } catch {
      // Fallback
      const liveArticles = await getAllArticles();
      setArticles(liveArticles);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArticlesAndProducts();
    setGazetteSettings(getGazetteSettings());
  }, [fetchArticlesAndProducts]);

  const handleSaveGazetteSettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveGazetteSettings(gazetteSettings);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  };

  const handleSaveArticle = async (articleData: Partial<Article>) => {
    try {
      const { getSupabase } = await import('@/lib/supabase');
      const supabase = getSupabase();

      // If this article is marked featured, unfeature all others first
      if (articleData.featured) {
        await supabase
          .from('articles')
          .update({ is_featured: false })
          .neq('id', articleToEdit?.id || '00000000-0000-0000-0000-000000000000');
      }

      const rowPayload = {
        slug: articleData.slug,
        title: articleData.title,
        subtitle: articleData.subtitle,
        category: articleData.category,
        volume: articleData.volume,
        issue: articleData.issue,
        date: articleData.date,
        read_time: articleData.readTime,
        author_name: articleData.author?.name,
        author_role: articleData.author?.role,
        image_url: articleData.image,
        thesis: articleData.thesis,
        excerpt: articleData.excerpt,
        content: articleData.content,
        key_takeaways: articleData.keyTakeaways,
        is_featured: articleData.featured,
        status: articleData.status,
        related_product_slug: articleData.relatedProductSlug,
        related_product_name: articleData.relatedProductName,
        callout: articleData.callout,
        updated_at: new Date().toISOString(),
      };

      if (articleToEdit?.id) {
        await supabase.from('articles').update(rowPayload).eq('id', articleToEdit.id);
      } else {
        await supabase.from('articles').insert([{ ...rowPayload, created_at: new Date().toISOString() }]);
      }

      await fetchArticlesAndProducts();
    } catch {
      // Local state fallback for previewing
      if (articleToEdit) {
        setArticles(articles.map(a => a.slug === articleToEdit.slug ? { ...a, ...articleData } as Article : a));
      } else {
        setArticles([{ ...articleData, slug: articleData.slug || 'temp-slug' } as Article, ...articles]);
      }
    }
  };

  const handleToggleFeatured = async (targetArticle: Article) => {
    try {
      const { getSupabase } = await import('@/lib/supabase');
      const supabase = getSupabase();

      if (targetArticle.id) {
        await supabase.from('articles').update({ is_featured: false }).neq('id', targetArticle.id);
        await supabase.from('articles').update({ is_featured: !targetArticle.featured }).eq('id', targetArticle.id);
        await fetchArticlesAndProducts();
      } else {
        setArticles(articles.map(a => ({
          ...a,
          featured: a.slug === targetArticle.slug ? !a.featured : false,
        })));
      }
    } catch {}
  };

  const handleDelete = async (targetArticle: Article) => {
    if (!confirm(`Are you sure you want to remove "${targetArticle.title}"?`)) return;

    try {
      const { getSupabase } = await import('@/lib/supabase');
      const supabase = getSupabase();
      if (targetArticle.id) {
        await supabase.from('articles').delete().eq('id', targetArticle.id);
      }
      setArticles(articles.filter(a => a.slug !== targetArticle.slug));
    } catch {}
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="font-label-sm text-[10px] sm:text-xs font-bold uppercase tracking-widest text-secondary block">
            Digital Publication &bull; Editorial CMS
          </span>
          <h2 className="font-headline-lg text-xl sm:text-headline-lg text-primary mt-0.5">
            The Botanical Gazette Articles
          </h2>
          <p className="font-body-sm text-xs sm:text-sm text-on-surface-variant">
            Author and publish editorial monographs, format guides, and frontpage cover stories.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 border rounded-xl font-label-sm text-xs uppercase tracking-wider font-bold transition-all cursor-pointer ${
              showSettingsDrawer
                ? 'bg-primary text-on-primary border-primary'
                : 'border-outline-variant/70 text-primary hover:bg-surface-container-high'
            }`}
          >
            <Sliders className="w-4 h-4" /> <span>Masthead Settings</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setArticleToEdit(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 bg-primary text-on-primary font-label-sm text-xs uppercase tracking-wider font-bold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all shadow-xs shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> <span>New Article</span>
          </button>
        </div>
      </div>

      {showSettingsDrawer && (
        <div className="bg-surface rounded-2xl border border-secondary/30 p-6 sm:p-8 botanical-shadow space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <span className="font-label-sm text-xs font-bold uppercase tracking-widest text-secondary block">
                Landing Page &amp; Gazette Header
              </span>
              <h3 className="font-headline-md text-headline-md text-primary mt-1">
                Masthead &amp; Volume Settings
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                Configure the Volume edition, seasonal circulation, harvest metadata, and accreditation/verification badge shown at the top of the landing page and journal.
              </p>
            </div>
            {settingsSaved && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container text-secondary text-xs font-bold font-mono">
                <Check className="w-3.5 h-3.5" /> Saved Live
              </span>
            )}
          </div>

          <form onSubmit={handleSaveGazetteSettings} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="font-label-sm text-xs uppercase tracking-wider text-primary font-bold">
                  Publication Name
                </label>
                <input
                  type="text"
                  value={gazetteSettings.publicationName}
                  onChange={(e) => setGazetteSettings({ ...gazetteSettings, publicationName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline rounded-xl font-body-sm text-primary focus:border-secondary focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-label-sm text-xs uppercase tracking-wider text-primary font-bold">
                  Volume Index
                </label>
                <input
                  type="text"
                  placeholder="e.g. Vol. I"
                  value={gazetteSettings.volume}
                  onChange={(e) => setGazetteSettings({ ...gazetteSettings, volume: e.target.value })}
                  className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline rounded-xl font-body-sm text-primary focus:border-secondary focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-label-sm text-xs uppercase tracking-wider text-primary font-bold">
                  Edition / Season
                </label>
                <input
                  type="text"
                  placeholder="e.g. Autumn Edition"
                  value={gazetteSettings.edition}
                  onChange={(e) => setGazetteSettings({ ...gazetteSettings, edition: e.target.value })}
                  className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline rounded-xl font-body-sm text-primary focus:border-secondary focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="font-label-sm text-xs uppercase tracking-wider text-primary font-bold">
                  Circulation Tier
                </label>
                <input
                  type="text"
                  placeholder="e.g. Private Circulation"
                  value={gazetteSettings.circulation}
                  onChange={(e) => setGazetteSettings({ ...gazetteSettings, circulation: e.target.value })}
                  className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline rounded-xl font-body-sm text-primary focus:border-secondary focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-label-sm text-xs uppercase tracking-wider text-primary font-bold">
                  Harvest Batch Line
                </label>
                <input
                  type="text"
                  placeholder="e.g. Botanical Harvest BT-2481"
                  value={gazetteSettings.harvestLabel}
                  onChange={(e) => setGazetteSettings({ ...gazetteSettings, harvestLabel: e.target.value })}
                  className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline rounded-xl font-body-sm text-primary focus:border-secondary focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-label-sm text-xs uppercase tracking-wider text-primary font-bold">
                  Edition &amp; Quality Badge
                </label>
                <input
                  type="text"
                  placeholder="e.g. Small-Batch Botanical Edition"
                  value={gazetteSettings.qualityBadge}
                  onChange={(e) => setGazetteSettings({ ...gazetteSettings, qualityBadge: e.target.value })}
                  className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline rounded-xl font-body-sm text-primary focus:border-secondary focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-outline-variant/30">
              <button
                type="button"
                onClick={() => setGazetteSettings(getGazetteSettings())}
                className="px-5 py-2.5 border border-outline text-primary font-label-sm text-xs uppercase tracking-wider rounded-xl hover:bg-surface-container-high transition-colors"
              >
                Reset
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-primary text-on-primary font-label-sm text-xs uppercase tracking-wider font-bold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all"
              >
                Save Masthead Settings
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Mobile Article Cards (< md screens) */}
      <div className="md:hidden space-y-3">
        {articles.map((article) => (
          <div
            key={article.slug}
            className="bg-surface rounded-2xl border border-outline-variant/70 p-4 botanical-shadow space-y-3"
          >
            <div className="flex items-start gap-3">
              <div className="w-14 h-14 rounded-xl bg-surface-container overflow-hidden shrink-0">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-surface-container text-secondary font-bold">
                    {article.category}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggleFeatured(article)}
                    className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                      article.featured
                        ? 'bg-secondary text-primary'
                        : 'bg-surface-container text-on-surface-variant'
                    }`}
                  >
                    {article.featured ? '★ Cover' : 'Standard'}
                  </button>
                </div>

                <a
                  href={`/journal/${article.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-primary text-sm hover:text-secondary flex items-center gap-1 mt-1 line-clamp-2"
                >
                  <span>{article.title}</span>
                  <ExternalLink className="w-3 h-3 shrink-0 opacity-60" />
                </a>

                <p className="font-mono text-[11px] text-on-surface-variant mt-1">
                  {article.volume} &bull; {article.readTime}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-outline-variant/40">
              <div className="text-xs text-on-surface-variant">
                By <span className="font-medium text-primary">{article.author.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setArticleToEdit(article);
                    setIsModalOpen(true);
                  }}
                  className="p-2 text-primary hover:bg-surface-container rounded-lg transition-colors cursor-pointer"
                  aria-label="Edit article"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(article)}
                  className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors cursor-pointer"
                  aria-label="Delete article"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Article Table (>= md screens) */}
      <div className="hidden md:block bg-surface rounded-2xl border border-outline-variant botanical-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container-low/40">
                <th className="p-4 font-label-sm text-xs uppercase text-on-surface-variant">Article / Headline</th>
                <th className="p-4 font-label-sm text-xs uppercase text-on-surface-variant">Category</th>
                <th className="p-4 font-label-sm text-xs uppercase text-on-surface-variant">Byline</th>
                <th className="p-4 font-label-sm text-xs uppercase text-on-surface-variant text-center">Lead Story</th>
                <th className="p-4 font-label-sm text-xs uppercase text-on-surface-variant">Status</th>
                <th className="p-4 font-label-sm text-xs uppercase text-on-surface-variant text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/40 font-body-sm text-body-sm">
              {articles.map((article) => (
                <tr key={article.slug} className="hover:bg-surface-container-low/60 transition-colors">
                  <td className="p-4 max-w-sm">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-lg bg-surface-container overflow-hidden shrink-0">
                        <img
                          src={article.image}
                          alt={article.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <a
                          href={`/journal/${article.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-bold text-primary hover:text-secondary flex items-center gap-1.5 transition-colors line-clamp-1"
                        >
                          {article.title} <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                        </a>
                        <p className="font-mono text-[11px] text-on-surface-variant mt-0.5 flex items-center gap-2">
                          <span>{article.volume} &bull; {article.readTime}</span>
                          {article.callout && article.callout.enabled !== false && (
                            <span className="px-1.5 py-0.2 bg-secondary/15 text-secondary text-[9px] uppercase font-bold rounded">
                              {article.callout.type === 'product' ? '🛍️ Product' : article.callout.type === 'deal' ? '🏷️ Deal' : '📢 Notice'}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full bg-surface-container text-xs font-mono text-primary font-bold">
                      {article.category}
                    </span>
                  </td>

                  <td className="p-4">
                    <p className="font-bold text-primary">{article.author.name}</p>
                    <p className="text-[11px] text-on-surface-variant">{article.author.role}</p>
                  </td>

                  <td className="p-4 text-center">
                    <button
                      type="button"
                      onClick={() => handleToggleFeatured(article)}
                      className={`px-3 py-1 rounded-full font-label-sm text-[11px] uppercase tracking-wider font-bold transition-all cursor-pointer ${
                        article.featured
                          ? 'bg-secondary text-primary shadow-sm'
                          : 'bg-surface-container hover:bg-secondary-container/60 text-on-surface-variant'
                      }`}
                      title="Click to toggle Lead Cover Story status"
                    >
                      {article.featured ? '★ Cover Story' : 'Standard'}
                    </button>
                  </td>

                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono uppercase tracking-wider ${
                        article.status === 'draft'
                          ? 'bg-outline-variant/30 text-on-surface-variant'
                          : 'bg-secondary-container/60 text-secondary font-bold'
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      {article.status || 'published'}
                    </span>
                  </td>

                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setArticleToEdit(article);
                          setIsModalOpen(true);
                        }}
                        className="p-2 rounded-lg text-primary hover:bg-surface-container-high transition-colors"
                        title="Edit Article"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(article)}
                        className="p-2 rounded-lg text-error hover:bg-error/10 transition-colors"
                        title="Delete Article"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ArticleFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveArticle}
        articleToEdit={articleToEdit}
        existingProducts={products.map((p) => ({ slug: p.slug, name: p.name }))}
      />
    </div>
  );
}
