import { getSupabase } from './supabase';
import type { Product } from './types';
import { MOCK_PRODUCTS } from './mockData';

export async function getActiveProducts(): Promise<Product[]> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data as Product[];
    }
  } catch {
    // Fallback to mock catalog when Supabase is not yet seeded or configured
  }

  return MOCK_PRODUCTS.filter((p) => p.is_active);
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .eq('category', category)
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data as Product[];
    }
  } catch {
    // Fallback to mock catalog
  }

  return MOCK_PRODUCTS.filter((p) => p.is_active && p.category.toLowerCase() === category.toLowerCase());
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .eq('slug', slug)
      .maybeSingle();

    if (!error && data) {
      return data as Product;
    }
  } catch {
    // Fallback to mock catalog
  }

  return MOCK_PRODUCTS.find((p) => p.slug === slug && p.is_active) ?? null;
}

