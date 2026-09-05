import { getSupabase } from './supabase';
import type { Product } from './types';

export async function getActiveProducts(): Promise<Product[]> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (!error) return (data ?? []) as Product[];
  } catch {
    // An unavailable catalog is treated as empty.
  }

  return [];
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

    if (!error) return (data ?? []) as Product[];
  } catch {
    // An unavailable catalog is treated as empty.
  }

  return [];
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

    if (!error) return data ? (data as Product) : null;
  } catch {
    // An unavailable product is treated as missing.
  }

  return null;
}
