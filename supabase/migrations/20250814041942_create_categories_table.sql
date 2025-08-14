-- Create categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Policies for categories
CREATE POLICY "Public can view all categories"
ON public.categories FOR SELECT
USING (true);

CREATE POLICY "Admins can insert categories"
ON public.categories FOR INSERT
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update categories"
ON public.categories FOR UPDATE
USING (public.is_admin());

CREATE POLICY "Admins can delete categories"
ON public.categories FOR DELETE
USING (public.is_admin());
