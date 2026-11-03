-- ─────────────────────────────────────────────────────────────────────────────
--  ADMIN ACCOUNT SETUP
--  Run this in: Supabase Dashboard → SQL Editor → New Query
--
--  This promotes an existing user to admin role.
--  Replace the email below with YOUR registered account email.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── OPTION A: Promote an existing registered user to admin ────────────────────
-- Change the email to whichever account you want as admin.
UPDATE public.profiles
SET role = 'admin', updated_at = now()
WHERE email = 'testingphasefor@gmail.com';

-- ── Verify the change ─────────────────────────────────────────────────────────
SELECT id, full_name, email, role, created_at
FROM public.profiles
WHERE role = 'admin';

-- ─────────────────────────────────────────────────────────────────────────────
--  OPTION B (alternative): Create a brand new admin user via Supabase Auth
--  Only use this if you want a SEPARATE admin account.
--  Fill in your desired admin email and a strong password.
-- ─────────────────────────────────────────────────────────────────────────────
-- NOTE: Run this block separately if needed.
-- The password must meet: 8+ chars, uppercase, lowercase, number, symbol.
--
-- Step 1 — Create auth user (do this in Supabase Dashboard → Authentication → Users → Add User)
--   Email:    admin@nexuscommerce.com
--   Password: Admin@1234
--
-- Step 2 — Then run this to set the profile and role:
/*
INSERT INTO public.profiles (id, full_name, email, mobile_number, role, created_at, updated_at)
SELECT
  u.id,
  'Administrator',
  u.email,
  NULL,
  'admin',
  now(),
  now()
FROM auth.users u
WHERE u.email = 'admin@nexuscommerce.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin', updated_at = now();
*/

-- ─────────────────────────────────────────────────────────────────────────────
--  Also update INR prices on seed products (were stored in USD)
-- ─────────────────────────────────────────────────────────────────────────────
UPDATE public.products SET price = CASE
  WHEN product_name = 'Professional HD Webcam'              THEN 10999
  WHEN product_name = 'Ergonomic Office Chair'              THEN 37999
  WHEN product_name = 'Wireless Noise-Cancelling Headphones'THEN 23499
  WHEN product_name = 'Standing Desk Converter'             THEN 15999
  WHEN product_name = 'Smart LED Desk Lamp'                 THEN 6799
  WHEN product_name = 'Mechanical Keyboard'                 THEN 13299
  WHEN product_name = 'USB-C Docking Station'               THEN 9999
  WHEN product_name = 'Monitor Arm Mount'                   THEN 7499
  WHEN product_name = 'Wireless Charging Pad'               THEN 3399
  WHEN product_name = 'Executive Wooden Desk'               THEN 74999
  WHEN product_name = 'Portable SSD 1TB'                    THEN 8299
  WHEN product_name = 'Cable Management Kit'                THEN 1999
  ELSE price
END,
updated_at = now();

-- ── Verify products have INR prices ──────────────────────────────────────────
SELECT product_name, price FROM public.products ORDER BY price DESC;
