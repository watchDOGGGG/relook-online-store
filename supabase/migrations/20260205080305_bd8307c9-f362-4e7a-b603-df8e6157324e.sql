-- Tighten order ownership so users can always see their purchase history
-- (orders must be linked to a logged-in user)

-- Orders: only allow creating orders for yourself (no anonymous/null user_id)
DROP POLICY IF EXISTS "Users can create orders" ON public.orders;
CREATE POLICY "Users can create orders"
ON public.orders
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Order items: only allow inserting items for orders you own (no null-owned orders)
DROP POLICY IF EXISTS "Users can insert order items for their orders" ON public.order_items;
CREATE POLICY "Users can insert order items for their orders"
ON public.order_items
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.orders
    WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
  )
);
