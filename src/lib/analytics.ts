export type AnalyticsEvent =
  | { name: "add_to_cart"; payload: { productId: string; qty: number; variants?: Record<string, string> } }
  | { name: "buy_now_opened"; payload: { productId: string } }
  | { name: "cod_submit"; payload: { productId: string; orderCode: string } }
  | { name: "whatsapp_click"; payload: { productId: string; qty: number } }
  | { name: "variant_select"; payload: { productId: string; group: string; option: string } }
  | { name: "review_submit"; payload: { productId: string } }
  | { name: "cart_view"; payload: {} }
  | { name: "qty_change"; payload: { productId: string; qty: number } }
  | { name: "remove_item"; payload: { productId: string } }
  | { name: "promo_apply"; payload: { code: string } }
  | { name: "checkout_click"; payload: { method: "cod" | "whatsapp" } }
  | { name: "cod_submit_success"; payload: { orderCode: string; itemsCount: number; total: number } };

export function track(event: AnalyticsEvent) {
  try {
    console.log("analytics:event", event.name, event.payload);
    window.dispatchEvent(new CustomEvent("analytics", { detail: event }));
  } catch (e) {
    // noop
  }
}
