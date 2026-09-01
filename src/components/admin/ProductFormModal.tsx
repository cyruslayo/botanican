'use client';
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: any;
  onSaved: () => void;
}

export default function ProductFormModal({ isOpen, onClose, product, onSaved }: ProductFormModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: 0,
    inventory: 0,
    category: 'Oils',
    image: '',
    is_active: true,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        slug: product.slug || '',
        description: product.description || '',
        price: product.price || 0,
        inventory: product.inventory || 0,
        category: product.category || 'Oils',
        image: product.image || '',
        is_active: product.is_active ?? true,
      });
    }
  }, [product]);

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      name,
      slug: prev.slug === generateSlug(prev.name) || prev.slug === '' ? generateSlug(name) : prev.slug
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const save = async () => {
    setError(null);
    setIsSaving(true);

    try {
      if (!formData.name || !formData.slug) {
        throw new Error("Name and Slug are required.");
      }

      const payload = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        price: Number(formData.price),
        inventory: Number(formData.inventory),
        category: formData.category,
        image: formData.image,
        is_active: formData.is_active,
      };

      const { getSupabase } = await import('@/lib/supabase');
      const supabase = getSupabase();

      if (product?.id) {
        // Update
        const { error } = await supabase.from('products').update(payload).eq('id', product.id);
        if (error) throw error;
      } else {
        // Create
        const { error } = await supabase.from('products').insert(payload);
        if (error) throw error;
      }

      onSaved();
      onClose();
    } catch (err: any) {
      console.error("Error saving product: ", err);
      setError(err.message || "Failed to save product.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-surface rounded-2xl border border-outline-variant botanical-shadow max-w-2xl w-full flex flex-col max-h-[90dvh] animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-6 border-b border-outline-variant">
          <h3 className="font-headline-sm text-headline-sm text-on-surface">
            {product ? 'Edit Product' : 'Add New Product'}
          </h3>
          <button onClick={onClose} aria-label="Close" className="touch-target flex items-center justify-center p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); save(); }} className="p-6 overflow-y-auto flex-1 space-y-6">
          {error && (
            <div className="p-4 bg-error/10 text-error rounded-lg font-body-md text-body-md">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="font-label-md text-label-md text-on-surface-variant">Name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleNameChange}
                className="w-full p-3 bg-surface border border-outline rounded-lg text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="font-label-md text-label-md text-on-surface-variant">Slug (URL)</label>
              <input
                type="text"
                name="slug"
                required
                value={formData.slug}
                onChange={handleChange}
                className="w-full p-3 bg-surface border border-outline rounded-lg text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="font-label-md text-label-md text-on-surface-variant">Description</label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="w-full p-3 bg-surface border border-outline rounded-lg text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="font-label-md text-label-md text-on-surface-variant">Price (₦)</label>
              <input
                type="number"
                name="price"
                step="0.01"
                min="0"
                required
                value={formData.price}
                onChange={handleChange}
                className="w-full p-3 bg-surface border border-outline rounded-lg text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="font-label-md text-label-md text-on-surface-variant">Inventory Count</label>
              <input
                type="number"
                name="inventory"
                min="0"
                required
                value={formData.inventory}
                onChange={handleChange}
                className="w-full p-3 bg-surface border border-outline rounded-lg text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="font-label-md text-label-md text-on-surface-variant">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full p-3 bg-surface border border-outline rounded-lg text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none"
              >
                <option value="Oils">Oils</option>
                <option value="Edibles">Edibles</option>
                <option value="Topicals">Topicals</option>
                <option value="Accessories">Accessories</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="font-label-md text-label-md text-on-surface-variant">Image URL</label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full p-3 bg-surface border border-outline rounded-lg text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-2 md:col-span-2 pt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleCheckboxChange}
                  className="w-5 h-5 rounded border-outline text-primary focus:ring-primary"
                />
                <span className="font-body-md text-on-surface">Product is Active (Visible on store)</span>
              </label>
            </div>
          </div>
        </form>

        <div className="p-6 border-t border-outline-variant flex justify-end gap-3 bg-surface-container-low rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-lg font-label-lg text-label-lg text-on-surface-variant hover:bg-surface-container transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-lg font-label-lg text-label-lg bg-primary text-on-primary hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </div>
    </div>
  );
}
