import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Promo } from '@/types/models';

export function usePromos() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPromos();
  }, []);

  async function fetchPromos() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPromos(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  async function createPromo(promoData: Omit<Promo, 'id'>) {
    const { data, error } = await supabase
      .from('promotions')
      .insert([promoData])
      .select();
    if (error) throw error;
    return data;
  }

  async function updatePromo(promoId: string, promoData: Partial<Promo>) {
    const { data, error } = await supabase
      .from('promotions')
      .update(promoData)
      .eq('id', promoId)
      .select();
    if (error) throw error;
    return data;
  }

  async function deletePromo(promoId: string) {
    const { error } = await supabase
      .from('promotions')
      .delete()
      .eq('id', promoId);
    if (error) throw error;
    setPromos(promos.filter(p => p.id !== promoId));
  }

  return { promos, loading, error, refetch: fetchPromos, createPromo, updatePromo, deletePromo };
}
