import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: { headers: { Authorization: req.headers.get("Authorization")! } },
      }
    );

    const { orderData } = await req.json();

    // 1. Find or create a customer
    let customerId;
    const { data: existingCustomer } = await supabase
      .from("customers")
      .select("id")
      .or(`email.eq.${orderData.email},phone.eq.${orderData.phone}`)
      .single();

    if (existingCustomer) {
      customerId = existingCustomer.id;
    } else {
      const { data: newCustomer, error: customerError } = await supabase
        .from("customers")
        .insert({
          full_name: orderData.customerName,
          email: orderData.email,
          phone: orderData.phone,
        })
        .select("id")
        .single();

      if (customerError) throw customerError;
      customerId = newCustomer.id;
    }

    // 2. Create the order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_id: customerId,
        phone: orderData.phone,
        email: orderData.email,
        customer_name: orderData.customerName,
        address: orderData.address,
        subtotal: orderData.totals.subtotal,
        shipping: orderData.totals.shipping,
        tax: orderData.totals.tax,
        total: orderData.totals.total,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // 2. Create order items
    const orderItems = orderData.items.map((item: {
      productId: string;
      productName: string;
      variantSelections: Record<string, string>;
      qty: number;
      unitPrice: number;
    }) => ({
      order_id: order.id,
      product_id: item.productId,
      product_name: item.productName,
      variant_selections: item.variantSelections || {},
      quantity: item.qty,
      unit_price: item.unitPrice,
      total_price: item.unitPrice * item.qty,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) throw itemsError;

    // 3. Decrement stock for each product
    for (const item of orderData.items) {
      const { data: product, error: productError } = await supabase
        .from("products")
        .select("quantity")
        .eq("id", item.productId)
        .single();

      if (productError) throw productError;

      const newQuantity = product.quantity - item.qty;
      if (newQuantity < 0) {
        throw new Error(`Not enough stock for product ${item.productName}`);
      }

      const { error: updateError } = await supabase
        .from("products")
        .update({ quantity: newQuantity })
        .eq("id", item.productId);

      if (updateError) throw updateError;
    }

    return new Response(JSON.stringify({ orderCode: order.code }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
