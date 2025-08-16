import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { CartItem } from '@/types/models';

interface OrderItemData extends CartItem {
  productName: string;
}

interface OrderData {
  phone: string;
  email?: string;
  customerName?: string;
  address?: string;
  items: OrderItemData[];
  totals: {
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
  };
}

export function useOrders() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createOrder(orderData: OrderData) {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke("create-order", {
        body: { orderData },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      return { success: true, orderCode: data.orderCode };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }

  async function getOrderByCode(code: string) {
    try {
      setLoading(true);
      setError(null);

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            product_name,
            variant_selections,
            quantity,
            unit_price,
            total_price
          )
        `)
        .eq('code', code)
        .single();

      if (orderError) throw orderError;

      return { success: true, order };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Order not found';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }

  return { createOrder, getOrderByCode, loading, error };
}