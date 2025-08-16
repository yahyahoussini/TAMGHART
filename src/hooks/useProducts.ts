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
        quantity: item.quantity || 0,
        inStock: (item.quantity || 0) > 0,
      }));

      setProducts(transformedProducts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  async function createProduct(productData: Omit<Product, 'id' | 'currency'>) {
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select();
    if (error) throw error;
    return data;
  }

  async function updateProduct(productId: string, productData: Partial<Product>) {
    const { data, error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', productId)
      .select();
    if (error) throw error;
    return data;
  }

  async function deleteProduct(productId: string) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);
    if (error) throw error;
    setProducts(products.filter(p => p.id !== productId));
  }

  return { products, loading, error, refetch: fetchProducts, createProduct, updateProduct, deleteProduct };
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
        quantity: data.quantity || 0,
        inStock: (data.quantity || 0) > 0,
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