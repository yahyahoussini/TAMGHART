import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Category {
  id: string;
  name: string;
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*');

      if (error) throw error;

      setCategories(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  async function addCategory(name: string) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([{ name }])
        .select();
      if (error) throw error;
      if (data) {
        setCategories([...categories, ...data]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while adding category');
    }
  }

  async function updateCategory(id: string, name: string) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update({ name })
        .eq('id', id)
        .select();
      if (error) throw error;
      if (data) {
        setCategories(categories.map(c => c.id === id ? data[0] : c));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while updating category');
    }
  }

  async function deleteCategory(id: string) {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setCategories(categories.filter(c => c.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while deleting category');
    }
  }

  return { categories, loading, error, refetch: fetchCategories, addCategory, updateCategory, deleteCategory };
}
