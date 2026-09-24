export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  inventory: number;
  category: string;
  image?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  strength_mg?: number | null;
  bottle_size_ml?: number | null;
  strain_name?: string | null;
  batch_code?: string | null;
}

export type StockStatus = "available" | "low_stock" | "unavailable";

export interface MemberCatalogProduct {
  id: string;
  slug: string;
  name: string;
  price: number;
  category: string;
  image: string | null;
  is_available: boolean;
  stock_status: StockStatus;
  strength_mg: number | null;
  bottle_size_ml: number | null;
  strain_name: string | null;
  batch_code: string | null;
}

export interface MemberProduct extends MemberCatalogProduct {
  description: string | null;
}

export interface ProductOrderItem {
  line_type?: "product";
  id: string;
  name: string;
  variant: string;
  price: number;
  quantity: number;
  image: string;
  strength_mg?: number | null;
  bottle_size_ml?: number | null;
  strain_name?: string | null;
  batch_code?: string | null;
}

export interface PromotionComponentSnapshot {
  product_id: string;
  slug: string;
  name: string;
  quantity_per_bundle: number;
  strength_mg?: number | null;
  bottle_size_ml?: number | null;
}

export interface PromotionOrderItem {
  line_type: "promotion";
  id?: string;
  name: string;
  variant?: string;
  price: number;
  quantity: number;
  image?: string;
  promotion_id: string;
  promotion_slug: string;
  promotion_name: string;
  line_total?: number;
  components: PromotionComponentSnapshot[];
  strength_mg?: number | null;
  bottle_size_ml?: number | null;
  strain_name?: string | null;
  batch_code?: string | null;
}

export type OrderItem = ProductOrderItem | PromotionOrderItem;

export interface PromotionItemSummary {
  product_id: string;
  slug: string;
  name: string;
  quantity: number;
  strength_mg: number | null;
  bottle_size_ml: number | null;
}

export interface Promotion {
  id: string;
  name: string;
  slug: string;
  promotion_type: "fixed_bundle";
  fixed_price: number;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  show_on_landing: boolean;
  show_in_store: boolean;
  public_badge: string | null;
  public_headline: string | null;
  public_description: string | null;
  member_headline: string | null;
  member_description: string | null;
  created_at?: string;
  updated_at?: string;
  items: PromotionItemSummary[];
}

export interface PromotionMerchandising {
  id: string;
  slug: string;
  name: string;
  badge: string | null;
  headline: string | null;
  description: string | null;
  fixed_price: number;
  regular_total: number;
  is_available: boolean;
  items: PromotionItemSummary[];
}

export interface ShippingAddress {
  instagramHandle: string;
  phone: string;
  region: string; // e.g. 'Asokoro' | 'Wuse' | 'Maitama' | 'Garki' | 'Jabi' | 'Guzape'
  address: string; // Full delivery address & landmarks
  city?: string; // e.g. 'Abuja'
  state?: string; // e.g. 'FCT'
  // Legacy optional fields for backward compatibility
  fullName?: string;
  email?: string;
  address1?: string;
  address2?: string;
  zip?: string;
  country?: string;
}

export interface Order {
  id: string;
  user_id: string;
  items: OrderItem[];
  total: number;
  shipping_fee?: number;
  status: string;
  shipping_address: ShippingAddress;
  receipt_url: string;
  created_at: string;
}

export interface MemberOrder {
  id: string;
  items: OrderItem[];
  total: number;
  status: string;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  role: "admin" | "customer";
}

export interface ReferralCode {
  id: string;
  code: string;
  owner_handle: string; // e.g. "@member_handle"
  owner_email?: string;
  owner_id?: string;
  is_active: boolean;
  created_at: string;
}

export interface AccessRequest {
  id: string;
  instagram_handle: string; // e.g. "@elena_walker"
  phone: string;
  referral_code: string;
  referred_by: string; // Referring Instagram handle or code owner
  status: "pending" | "approved" | "rejected";
  email?: string;
  full_name?: string;
  user_id?: string;
  reviewed_at?: string;
  reviewed_by?: string;
  created_at: string;
}

export interface ArticleCallout {
  enabled?: boolean;
  type: "product" | "deal" | "announcement";
  badge?: string;
  title: string;
  description: string;
  productSlug?: string;
  ctaText?: string;
  ctaUrl?: string;
  discountCode?: string;
}

export interface Article {
  id?: string;
  slug: string;
  title: string;
  subtitle: string;
  category:
    | "Monograph"
    | "Circadian Science"
    | "Extraction & Lab"
    | "Protocol & Ritual"
    | "Format & Method"
    | "Culture & Routine";
  volume: string;
  issue: string;
  date: string;
  readTime: string;
  author: {
    name: string;
    role: string;
  };
  featured: boolean;
  excerpt: string;
  image: string;
  thesis: string;
  content: string[];
  keyTakeaways: string[];
  relatedProductSlug?: string;
  relatedProductName?: string;
  callout?: ArticleCallout;
  status?: "draft" | "published";
  created_at?: string;
  updated_at?: string;
}
