-- ─────────────────────────────────────────────────────────────────────────────
--  RUN THIS in Supabase → SQL Editor → New Query
--  Fixes: "policy already exists" errors from partial migration runs
-- ─────────────────────────────────────────────────────────────────────────────

-- ── DROP ALL EXISTING ORDER POLICIES ─────────────────────────────────────────
DO $$
DECLARE pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('orders', 'order_items')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
  END LOOP;
END; $$;

-- ── ENSURE TABLES EXIST (idempotent) ─────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE public.order_status AS ENUM (
    'pending','confirmed','processing','dispatched','delivered','cancelled'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END; $$;

CREATE TABLE IF NOT EXISTS public.orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number    TEXT NOT NULL UNIQUE,
  customer_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  customer_name   TEXT NOT NULL,
  customer_email  TEXT NOT NULL,
  customer_phone  TEXT,
  status          public.order_status NOT NULL DEFAULT 'pending',
  subtotal        NUMERIC(12,2) NOT NULL DEFAULT 0,
  notes           TEXT,
  admin_notes     TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id   UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  category     TEXT,
  price        NUMERIC(10,2),
  quantity     INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  line_total   NUMERIC(12,2) GENERATED ALWAYS AS (COALESCE(price, 0) * quantity) STORED
);

CREATE INDEX IF NOT EXISTS orders_customer_idx ON public.orders (customer_id);
CREATE INDEX IF NOT EXISTS orders_status_idx   ON public.orders (status);
CREATE INDEX IF NOT EXISTS orders_created_idx  ON public.orders (created_at DESC);
CREATE INDEX IF NOT EXISTS order_items_order_idx ON public.order_items (order_id);

-- ── TRIGGERS ─────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.orders_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS orders_updated_at ON public.orders;
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.orders_updated_at();

CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  today_str TEXT := to_char(now(), 'YYYYMMDD');
  seq_num   INT;
BEGIN
  SELECT COUNT(*) + 1 INTO seq_num
  FROM public.orders
  WHERE created_at::date = now()::date;
  NEW.order_number := 'ORD-' || today_str || '-' || lpad(seq_num::text, 4, '0');
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS orders_order_number ON public.orders;
CREATE TRIGGER orders_order_number
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  WHEN (NEW.order_number IS NULL OR NEW.order_number = '')
  EXECUTE FUNCTION public.generate_order_number();

-- ── ENABLE RLS ────────────────────────────────────────────────────────────────
ALTER TABLE public.orders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- ── FRESH POLICIES ────────────────────────────────────────────────────────────

-- Service role — full access (used by API routes)
CREATE POLICY "service_role_orders"
  ON public.orders FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "service_role_order_items"
  ON public.order_items FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Customer — read own orders only
CREATE POLICY "customer_own_orders"
  ON public.orders FOR SELECT TO authenticated
  USING (customer_id = auth.uid());

CREATE POLICY "customer_own_order_items"
  ON public.order_items FOR SELECT TO authenticated
  USING (
    order_id IN (SELECT id FROM public.orders WHERE customer_id = auth.uid())
  );

-- Admin — full access to all orders
CREATE POLICY "admin_all_orders"
  ON public.orders FOR ALL TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "admin_all_order_items"
  ON public.order_items FOR ALL TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- ── GRANTS ────────────────────────────────────────────────────────────────────
GRANT ALL ON public.orders      TO service_role;
GRANT ALL ON public.order_items TO service_role;
GRANT SELECT ON public.orders      TO authenticated;
GRANT SELECT ON public.order_items TO authenticated;

-- ── VERIFY ────────────────────────────────────────────────────────────────────
SELECT 'orders table OK' AS status, count(*) AS rows FROM public.orders
UNION ALL
SELECT 'order_items table OK', count(*) FROM public.order_items;
