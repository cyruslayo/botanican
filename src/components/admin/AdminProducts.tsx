'use client';
import { useState, useEffect, useCallback } from 'react';
import ProductFormModal from '@/components/admin/ProductFormModal';
import { formatNaira } from '@/lib/utils';

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [productToDelete, setProductToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<any | null>(null);

  async function handleDeleteConfirm() {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      const { getSupabase } = await import('@/lib/supabase');
      const supabase = getSupabase();
      if (productToDelete.id.length > 5) {
        await supabase.from('products').delete().eq('id', productToDelete.id);
      }
      setProducts(products.filter((p) => p.id !== productToDelete.id));
      setProductToDelete(null);
    } catch (error) {
      console.error('Error deleting product: ', error);
    } finally {
      setIsDeleting(false);
    }
  }

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { getSupabase } = await import('@/lib/supabase');
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setProducts(data ?? []);
    } catch (error) {
      console.error('Error fetching products: ', error);
      if (products.length === 0) {
        setProducts([
          { id: '1', name: 'Serenity Blend', price: 85, inventory: 42, category: 'Oils', is_active: true, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-3s_o68S_zqMLDFeSVxP8yYFlOFrllegbfXu664mRsdOn0AiGXTZq1RS8C60jQFk6sxB7u-syYxpLtzgiAH9j_QjPdV2G8Edg719sJVbKwfCbqiqe49BFwaSIWGk3R4zEat0wAdVALra14ADiFwRpP7n5yLgUp93ixxEpkiGpnq6EPSGO5fmfZNJgtcSaIxGluQ_4B__B4xOvdBaiWLq5QdJUBxr8jWMuEjBKZ1f5pb5_KuXhsi7VpQ' },
          { id: '2', name: 'Clarity Botanicals', price: 45, inventory: 15, category: 'Edibles', is_active: true, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBTtuuE38Ca7mYUBQK7cjCWX1_u1NkshBm9t_rJk0js6XtH2EtoYEyhRxwp2lrgcfpCOe3E-mHLmQRjFHSgxtobWe4r9eZkF6xdtAkHXpCPxFwBV8Jv2fKaeltne2CY3xMI3umzmGnTKIqKE7UUagAPIg5SFMjNUYW33TgUVWUB8jDeBvc36wLgJ8CxON1tR6DKjAQHbnI_pURDKAtP0jBnfYY5g00TfETJjNhRdH0vbK3B9fjG4Gulkg' }
        ]);
      }
    } finally {
      setLoading(false);
    }
  }, [products.length]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleAddClick = () => {
    setProductToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleEditClick = (product: any) => {
    setProductToEdit(product);
    setIsFormModalOpen(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="font-headline-md text-headline-md text-on-surface">Products</h2>
        <button onClick={handleAddClick} className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg font-label-sm text-label-sm hover:bg-primary/90 transition-colors">
          <PlusIcon />
          Add Product
        </button>
      </div>

      <div className="bg-surface rounded-xl border border-outline-variant overflow-hidden botanical-shadow">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left border-collapse">
            <thead className="bg-surface-container-low">
              <tr className="border-b border-outline-variant">
                <th className="p-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">Product</th>
                <th className="p-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">Category</th>
                <th className="p-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">Price</th>
                <th className="p-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">Inventory</th>
                <th className="p-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">Status</th>
                <th className="p-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="font-body-md text-body-md text-on-surface divide-y divide-outline-variant/50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-on-surface-variant">Loading products...</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-on-surface-variant">No products found.</td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="relative w-12 h-12 rounded bg-surface-container overflow-hidden">
                          {product.image ? (
                            <img src={product.image} alt={product.name} referrerPolicy="no-referrer" className="absolute inset-0 h-full w-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-surface-container-highest text-on-surface-variant font-label-sm">No Img</div>
                          )}
                        </div>
                        <span className="font-body-lg text-primary">{product.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-on-surface-variant">{product.category}</td>
                    <td className="p-4">{formatNaira(product.price)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${product.inventory < 10 ? 'bg-error/10 text-error' : 'bg-surface-container-high'}`}>
                        {product.inventory} in stock
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${product.is_active ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-variant text-on-surface-variant'}`}>
                        {product.is_active ? 'Active' : 'Draft'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEditClick(product)} aria-label={`Edit ${product.name}`} className="touch-target flex items-center justify-center p-2 text-on-surface-variant hover:text-primary transition-colors rounded-lg hover:bg-surface-container">
                          <EditIcon />
                        </button>
                        <button
                          onClick={() => setProductToDelete(product)}
                          aria-label={`Delete ${product.name}`}
                          className="touch-target flex items-center justify-center p-2 text-on-surface-variant hover:text-error transition-colors rounded-lg hover:bg-error/10"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-surface p-6 rounded-xl border border-outline-variant botanical-shadow max-w-md w-full animate-in fade-in zoom-in duration-200">
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">Delete Product</h3>
            <p className="font-body-md text-body-md text-on-surface-variant mb-6">
              Are you sure you want to delete <strong>{productToDelete.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setProductToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg font-label-sm text-label-sm text-on-surface-variant hover:bg-surface-container transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg font-label-sm text-label-sm bg-error text-on-error hover:bg-error/90 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isFormModalOpen && (
        <ProductFormModal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          product={productToEdit}
          onSaved={fetchProducts}
        />
      )}
    </div>
  );
}

function PlusIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}
