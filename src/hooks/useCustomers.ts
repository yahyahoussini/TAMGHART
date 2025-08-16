import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Customer, Order } from '@/types/models';

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  return { customers, loading, error, refetch: fetchCustomers };
}

export function useCustomer(customerId: string) {
  const [customer, setCustomer] = useState<(Customer & { orders: Order[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomer = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('customers')
        .select('*, orders(*)')
        .eq('id', customerId)
        .single();

      if (error) throw error;
      setCustomer(data as Customer & { orders: Order[] });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    if (customerId) {
      fetchCustomer();
    }
  }, [customerId, fetchCustomer]);

  return { customer, loading, error, refetch: fetchCustomer };
}
