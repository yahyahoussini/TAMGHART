export type Variant = { id: string; name: string; options: string[] };
export type Product = {
  id: string; slug: string; name: string; subtitle?: string; price: number; currency: "MAD";
  images: string[]; // placeholder URLs
  variants?: Variant[]; // e.g., Size, Scent
  description: string; specs?: string[];
  tags: string[]; volume?: string; inStock: boolean; quantity: number;
};
export type CartItem = { productId: string; variantSelections?: Record<string, string>; qty: number; unitPrice: number };
export type Order = { id: string; code: string; phone: string; status: "received"|"packed"|"shipped"|"out_for_delivery"|"delivered"; items: CartItem[]; totals: { subtotal: number; shipping: number; tax: number; total: number } };
export type Promo = {
  id: string;
  code: string;
  type: 'percent' | 'fixed' | 'freeship';
  value: number;
  min_purchase_amount: number;
  is_active: boolean;
};
export type Customer = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  created_at: string;
};
