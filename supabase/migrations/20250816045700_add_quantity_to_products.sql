-- Add a quantity column to the products table to track stock levels
ALTER TABLE public.products
ADD COLUMN quantity INTEGER NOT NULL DEFAULT 10;
