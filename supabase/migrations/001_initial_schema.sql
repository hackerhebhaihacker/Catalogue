-- ─────────────────────────────────────────────────────────────────────────────
--  NEXUS COMMERCE – Initial Database Schema
--  Run this entire script in: Supabase Dashboard → SQL Editor → New Query
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── PROFILES ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT NOT NULL CHECK (char_length(full_name) BETWEEN 2 AND 100),
  email         TEXT NOT NULL UNIQUE,
  mobile_number TEXT,
  role          TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles (email);
CREATE INDEX IF NOT EXISTS profiles_role_idx  ON public.profiles (role);

-- ── CATEGORIES ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.categories (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_name TEXT NOT NULL UNIQUE CHECK (char_length(category_name) BETWEEN 2 AND 100),
  description   TEXT,
  slug          TEXT NOT NULL UNIQUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── PRODUCTS ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.products (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_name  TEXT NOT NULL CHECK (char_length(product_name) BETWEEN 2 AND 200),
  description   TEXT NOT NULL,
  category_id   UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  image_url     TEXT,
  price         NUMERIC(10, 2) CHECK (price IS NULL OR price >= 0),
  is_featured   BOOLEAN NOT NULL DEFAULT false,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS products_category_idx   ON public.products (category_id);
CREATE INDEX IF NOT EXISTS products_is_active_idx  ON public.products (is_active);
CREATE INDEX IF NOT EXISTS products_is_featured_idx ON public.products (is_featured);

-- ── AUTO-UPDATE updated_at ────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS products_updated_at ON public.products;
CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ── AUTO-CREATE PROFILE ON SIGNUP ────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── ROW LEVEL SECURITY ───────────────────────────────────────────────────────
ALTER TABLE public.profiles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products   ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- CATEGORIES (public read; admin write)
CREATE POLICY "Anyone can read categories"
  ON public.categories FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage categories"
  ON public.categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- PRODUCTS (authenticated read active; admin all)
CREATE POLICY "Authenticated users can read active products"
  ON public.products FOR SELECT
  USING (is_active = true AND auth.role() = 'authenticated');

CREATE POLICY "Admins can manage all products"
  ON public.products FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- ── SEED: SAMPLE CATEGORIES ───────────────────────────────────────────────────
INSERT INTO public.categories (category_name, description, slug) VALUES
  ('Electronics',   'Gadgets, devices and tech accessories',         'electronics'),
  ('Furniture',     'Office and home furniture',                     'furniture'),
  ('Lighting',      'Smart and decorative lighting solutions',       'lighting'),
  ('Software',      'Productivity and business software',            'software'),
  ('Accessories',   'Peripherals and workspace accessories',         'accessories')
ON CONFLICT (category_name) DO NOTHING;

-- ── SEED: SAMPLE PRODUCTS ────────────────────────────────────────────────────
INSERT INTO public.products (product_name, description, category_id, image_url, price, is_featured, is_active)
SELECT
  p.name, p.description,
  (SELECT id FROM public.categories WHERE category_name = p.cat LIMIT 1),
  p.image, p.price::NUMERIC, p.featured, true
FROM (VALUES
  ('Professional HD Webcam',         '4K webcam with noise-cancelling mic and auto-focus. Ideal for video calls, streaming and content creation.',
   'Electronics', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80', '129.99', true),
  ('Ergonomic Office Chair',         'Lumbar-support mesh chair with adjustable armrests, headrest and breathable back. Built for all-day comfort.',
   'Furniture',   'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=600&q=80', '449.00', true),
  ('Wireless Noise-Cancelling Headphones', '30-hour battery life, adaptive noise cancellation and studio-quality audio with a premium leather build.',
   'Electronics', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80', '279.95', true),
  ('Standing Desk Converter',        'Gas-spring mechanism for smooth height adjustment. Fits desks up to 80 cm wide. Cable management included.',
   'Furniture',   'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=80', '189.00', true),
  ('Smart LED Desk Lamp',            'Touch-sensitive lamp with 5 colour temperatures, USB-C charging port and automatic dimming.',
   'Lighting',    'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=600&q=80', '79.99', true),
  ('Mechanical Keyboard',            'Tactile brown switches, RGB per-key lighting, aluminium frame and dual-layer silencing foam.',
   'Electronics', 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=600&q=80', '159.00', true),
  ('USB-C Docking Station',          '12-in-1 USB-C hub with dual 4K HDMI, Gigabit Ethernet, SD card reader and 100W PD charging.',
   'Electronics', 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&q=80', '119.00', false),
  ('Monitor Arm Mount',              'Fully adjustable single monitor arm supporting screens up to 32" and 8 kg. Cable management included.',
   'Accessories', 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&q=80', '89.00', false),
  ('Wireless Charging Pad',          '15W fast wireless charging pad compatible with all Qi-enabled devices. Slim profile and LED indicator.',
   'Electronics', 'https://images.unsplash.com/photo-1572435555646-7ad9a149ad91?w=600&q=80', '39.99', false),
  ('Executive Wooden Desk',          'Solid oak executive desk with built-in cable management, lockable drawers and 180 cm width.',
   'Furniture',   'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', '899.00', false),
  ('Portable SSD 1TB',               'Ultra-fast USB 3.2 Gen 2 portable SSD with 1050 MB/s read speed in a rugged, compact design.',
   'Electronics', 'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=600&q=80', '99.00', false),
  ('Cable Management Kit',           'Complete kit with cable trays, velcro ties, desk grommets and a 2 m cable sleeve for a tidy workspace.',
   'Accessories', 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&q=80', '24.99', false)
) AS p(name, description, cat, image, price, featured)
ON CONFLICT DO NOTHING;

-- ── GRANT PERMISSIONS ─────────────────────────────────────────────────────────
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT SELECT ON public.products   TO authenticated;
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
