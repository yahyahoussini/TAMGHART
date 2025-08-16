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

    const { code, subtotal } = await req.json();

    if (!code || typeof subtotal === 'undefined') {
      throw new Error("Promo code and subtotal are required.");
    }

    const { data: promo, error } = await supabase
      .from("promotions")
      .select("*")
      .eq("code", code.toUpperCase())
      .single();

    if (error || !promo) {
      throw new Error("Invalid promo code.");
    }

    if (!promo.is_active) {
      throw new Error("This promo code is no longer active.");
    }

    if (subtotal < promo.min_purchase_amount) {
      throw new Error(`A minimum purchase of ${promo.min_purchase_amount} MAD is required.`);
    }

    let discount = 0;
    if (promo.type === 'fixed') {
      discount = promo.value;
    } else if (promo.type === 'percent') {
      discount = (subtotal * promo.value) / 100;
    }

    return new Response(JSON.stringify({
      promo,
      discount
    }), {
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
