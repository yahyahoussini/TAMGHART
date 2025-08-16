import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Product, Variant } from '@/types/models';
import type { Json } from '@/integrations/supabase/types';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('in_stock', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform database format to match our Product type
      const transformedProducts = (data || []).map(item => ({
        id: item.id,
        slug: item.slug,
        name: item.name,
        subtitle: item.subtitle || undefined,
        price: parseFloat(item.price as string),
        currency: "MAD" as const,
        images: item.images || [],
        variants: item.variants as Variant[] | undefined,
        description: item.description,
        specs: item.specs || [],
        tags: item.tags || [],
        volume: item.volume || undefined,
        inStock: item.in_stock || false,
      }));

      setProducts(transformedProducts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  return { products, loading, error, refetch: fetchProducts };
}

export function useProduct(slug: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchProduct(slug);
    }
  }, [slug]);

  async function fetchProduct(productSlug: string) {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', productSlug)
        .single();

      if (error) throw error;

      // Transform database format to match our Product type
      const transformedProduct = {
        id: data.id,
        slug: data.slug,
        name: data.name,
        subtitle: data.subtitle || undefined,
        price: parseFloat(data.price as string),
        currency: "MAD" as const,
        images: data.images || [],
        variants: data.variants as Variant[] | undefined,
        description: data.description,
        specs: data.specs || [],
        tags: data.tags || [],
        volume: data.volume || undefined,
        inStock: data.in_stock || false,
      };

      setProduct(transformedProduct);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  return { product, loading, error };
}