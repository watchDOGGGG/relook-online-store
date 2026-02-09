
-- Add shipping_fee column to products table (null = free shipping, 0 = free shipping, >0 = shipping fee amount)
ALTER TABLE public.products ADD COLUMN shipping_fee integer DEFAULT NULL;
