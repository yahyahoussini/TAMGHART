import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Category } from '@/types/models';
import type { TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      setCategories(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const addCategory = async (category: TablesInsert<'categories'>) => {
    const { error } = await supabase.from('categories').insert(category);
    if (error) throw error;
    await fetchCategories(); // Refetch after adding
  };

  const updateCategory = async (id: string, category: TablesUpdate<'categories'>) => {
    const { error } = await supabase.from('categories').update(category).eq('id', id);
    if (error) throw error;
    await fetchCategories(); // Refetch after updating
  };

  const deleteCategory = async (id: string) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
    await fetchCategories(); // Refetch after deleting
  };

  return { categories, loading, error, addCategory, updateCategory, deleteCategory };
}
