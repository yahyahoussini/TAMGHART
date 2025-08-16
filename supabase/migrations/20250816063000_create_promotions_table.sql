-- Create a new type for promotion types
CREATE TYPE promotion_type AS ENUM ('percent', 'fixed', 'freeship');

-- Create promotions table
CREATE TABLE public.promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  type promotion_type NOT NULL,
  value DECIMAL(10, 2) NOT NULL DEFAULT 0,
  min_purchase_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

-- Create a trigger for the updated_at column
CREATE TRIGGER update_promotions_updated_at
  BEFORE UPDATE ON public.promotions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
