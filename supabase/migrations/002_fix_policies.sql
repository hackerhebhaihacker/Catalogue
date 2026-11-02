-- ─────────────────────────────────────────────────────────────────────────────
--  FIX MIGRATION — Drop and recreate all RLS policies cleanly
--  Run this in: Supabase Dashboard → SQL Editor → New Query
-- ─────────────────────────────────────────────────────────────────────────────

-- ── DROP ALL EXISTING POLICIES ────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can read own profile"        ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile"      ON public.profiles;
DROP POLICY IF EXISTS "Admins can read all profiles"      ON public.profiles;
DROP POLICY IF EXISTS "Anyone can read categories"        ON public.categories;
DROP POLICY IF EXISTS "Admins can manage categories"      ON public.categories;
DROP POLICY IF EXISTS "Authenticated users can read active products" ON public.products;
DROP POLICY IF EXISTS "Admins can manage all products"    ON public.products;

-- ── ENSURE RLS IS ENABLED ─────────────────────────────────────────────────────
ALTER TABLE public.profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products   ENABLE ROW LEVEL SECURITY;

-- ── PROFILES POLICIES ─────────────────────────────────────────────────────────
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

CREATE POLICY "Service role bypass"
  ON public.profiles FOR ALL
  USING (auth.role() = 'service_role');

-- ── CATEGORIES POLICIES ───────────────────────────────────────────────────────
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

-- ── PRODUCTS POLICIES ─────────────────────────────────────────────────────────
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

-- ── ENSURE SEED DATA EXISTS ───────────────────────────────────────────────────
INSERT INTO public.categories (category_name, description, slug) VALUES
  ('Electronics',   'Gadgets, devices and tech accessories',         'electronics'),
  ('Furniture',     'Office and home furniture',                     'furniture'),
  ('Lighting',      'Smart and decorative lighting solutions',       'lighting'),
  ('Software',      'Productivity and business software',            'software'),
  ('Accessories',   'Peripherals and workspace accessories',         'accessories')
ON CONFLICT (category_name) DO NOTHING;

INSERT INTO public.products (product_name, description, category_id, image_url, price, is_featured, is_active)
SELECT
  p.name, p.description,
  (SELECT id FROM public.categories WHERE category_name = p.cat LIMIT 1),
  p.image, p.price::NUMERIC, p.featured, true
FROM (VALUES
  ('Professional HD Webcam',
   '4K webcam with noise-cancelling mic and auto-focus. Ideal for video calls, streaming and content creation.',
   'Electronics', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80', '129.99', true),
  ('Ergonomic Office Chair',
   'Lumbar-support mesh chair with adjustable armrests, headrest and breathable back. Built for all-day comfort.',
   'Furniture', 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=600&q=80', '449.00', true),
  ('Wireless Noise-Cancelling Headphones',
   '30-hour battery life, adaptive noise cancellation and studio-quality audio with a premium leather build.',
   'Electronics', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80', '279.95', true),
  ('Standing Desk Converter',
   'Gas-spring mechanism for smooth height adjustment. Fits desks up to 80 cm wide. Cable management included.',
   'Furniture', 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=80', '189.00', true),
  ('Smart LED Desk Lamp',
   'Touch-sensitive lamp with 5 colour temperatures, USB-C charging port and automatic dimming.',
   'Lighting', 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=600&q=80', '79.99', true),
  ('Mechanical Keyboard',
   'Tactile brown switches, RGB per-key lighting, aluminium frame and dual-layer silencing foam.',
   'Electronics', 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=600&q=80', '159.00', true),
  ('USB-C Docking Station',
   '12-in-1 USB-C hub with dual 4K HDMI, Gigabit Ethernet, SD card reader and 100W PD charging.',
   'Electronics', 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&q=80', '119.00', false),
  ('Monitor Arm Mount',
   'Fully adjustable single monitor arm supporting screens up to 32" and 8 kg. Cable management included.',
   'Accessories', 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&q=80', '89.00', false),
  ('Wireless Charging Pad',
   '15W fast wireless charging pad compatible with all Qi-enabled devices. Slim profile and LED indicator.',
   'Electronics', 'https://images.unsplash.com/photo-1572435555646-7ad9a149ad91?w=600&q=80', '39.99', false),
  ('Executive Wooden Desk',
   'Solid oak executive desk with built-in cable management, lockable drawers and 180 cm width.',
   'Furniture', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', '899.00', false),
  ('Portable SSD 1TB',
   'Ultra-fast USB 3.2 Gen 2 portable SSD with 1050 MB/s read speed in a rugged, compact design.',
   'Electronics', 'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=600&q=80', '99.00', false),
  ('Cable Management Kit',
   'Complete kit with cable trays, velcro ties, desk grommets and a 2 m cable sleeve for a tidy workspace.',
   'Accessories', 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&q=80', '24.99', false)
) AS p(name, description, cat, image, price, featured)
ON CONFLICT DO NOTHING;

-- ── GRANTS ────────────────────────────────────────────────────────────────────
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT SELECT ON public.products   TO authenticated;
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
