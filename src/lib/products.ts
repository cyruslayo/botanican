import { getSupabase } from "./supabase";
import type { MemberCatalogProduct, MemberProduct } from "./types";

const MEMBER_CATALOG_AUTHORIZATION_MESSAGE =
  "Member catalog access is not available";

function getRpcRow<T>(data: T | T[] | null): T | null {
  if (!data) return null;
  return Array.isArray(data) ? data[0] || null : data;
}

export function isMemberCatalogAuthorizationError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { code?: unknown; message?: unknown };
  return (
    candidate.code === "42501" &&
    candidate.message === MEMBER_CATALOG_AUTHORIZATION_MESSAGE
  );
}

export async function getMemberCatalog(
  instagramHandle: string,
  phone: string,
  category: string,
): Promise<MemberCatalogProduct[]> {
  const { data, error } = await getSupabase().rpc("get_member_catalog", {
    p_instagram_handle: instagramHandle,
    p_phone: phone,
    p_category: category,
  });
  if (error) throw error;
  return (data ?? []) as MemberCatalogProduct[];
}

export async function getMemberProduct(
  instagramHandle: string,
  phone: string,
  slug: string,
): Promise<MemberProduct | null> {
  const { data, error } = await getSupabase().rpc("get_member_product", {
    p_instagram_handle: instagramHandle,
    p_phone: phone,
    p_slug: slug,
  });
  if (error) throw error;
  return getRpcRow(data as MemberProduct | MemberProduct[] | null);
}
