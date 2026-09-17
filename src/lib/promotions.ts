import { getSupabase } from "@/lib/supabase";
import type { Promotion, PromotionMerchandising } from "@/lib/types";

const MEMBER_PROMOTION_AUTHORIZATION_MESSAGE =
  "Member catalog access is not available";

export function isMemberPromotionAuthorizationError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { code?: unknown; message?: unknown };
  return (
    candidate.code === "42501" &&
    candidate.message === MEMBER_PROMOTION_AUTHORIZATION_MESSAGE
  );
}

export async function getPublicPromotions(): Promise<PromotionMerchandising[]> {
  const { data, error } = await getSupabase().rpc("get_public_promotions");
  if (error) throw error;
  return (data ?? []) as PromotionMerchandising[];
}

export async function getMemberPromotions(
  instagramHandle: string,
  phone: string,
): Promise<PromotionMerchandising[]> {
  const { data, error } = await getSupabase().rpc("get_member_promotions", {
    p_instagram_handle: instagramHandle,
    p_phone: phone,
  });
  if (error) throw error;
  return (data ?? []) as PromotionMerchandising[];
}

export type AdminPromotion = Promotion & {
  promotion_items: Array<{ product_id: string; quantity: number }>;
};
