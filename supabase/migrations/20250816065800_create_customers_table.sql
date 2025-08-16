-- Create customers table
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS for customers table
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Add customer_id to orders table
ALTER TABLE public.orders
ADD COLUMN customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL;

-- Create an index on the new foreign key
CREATE INDEX idx_orders_customer_id ON public.orders(customer_id);

-- Create a trigger for the updated_at column on customers
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
