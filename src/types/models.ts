export type Variant = { id: string; name: string; options: string[] };
export type Product = {
  id: string; slug: string; name: string; subtitle?: string; price: number; currency: "MAD";
  images: string[]; // placeholder URLs
  variants?: Variant[]; // e.g., Size, Scent
  description: string; specs?: string[];
  tags: string[]; volume?: string; inStock: boolean;
};
export type CartItem = { productId: string; variantSelections?: Record<string, string>; qty: number; unitPrice: number };
export type Order = { id: string; code: string; phone: string; status: "received"|"packed"|"shipped"|"out_for_delivery"|"delivered"; items: CartItem[]; totals: { subtotal: number; shipping: number; tax: number; total: number } };
