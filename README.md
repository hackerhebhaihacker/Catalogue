# Nexus Commerce — Business Product Catalogue Website

A complete, production-ready **Business Product Catalogue Website with User Authentication** built as a college assignment for Organisational Behaviour. The project demonstrates a real-world full-stack web application using modern technologies.

---

## Table of Contents

1. [Project Introduction](#1-project-introduction)
2. [Project Objectives](#2-project-objectives)
3. [Technology Stack](#3-technology-stack)
4. [Features](#4-features)
5. [How the Website Works](#5-how-the-website-works)
6. [Folder Structure](#6-folder-structure)
7. [Prerequisites](#7-prerequisites)
8. [Installation Instructions](#8-installation-instructions)
9. [Environment Variable Configuration](#9-environment-variable-configuration)
10. [Supabase Setup](#10-supabase-setup)
11. [Database Schema & SQL Migration](#11-database-schema--sql-migration)
12. [Resend Email Configuration](#12-resend-email-configuration)
13. [Local Development](#13-local-development)
14. [Deployment to Vercel](#14-deployment-to-vercel)
15. [Pages & Routes Reference](#15-pages--routes-reference)
16. [Security Implementation](#16-security-implementation)
17. [Customisation Guide](#17-customisation-guide)
18. [Testing Checklist](#18-testing-checklist)

---

## 1. Project Introduction

**Nexus Commerce** is a professional business product catalogue website. Visitors can browse the company homepage, learn about the business, see featured products and contact the team. To access the **full product catalogue**, users must create a free account and sign in.

The website is **not an e-commerce store** — there is no shopping cart, checkout or payment processing. The primary goals are business promotion and product showcasing.

---

## 2. Project Objectives

- Advertise products to potential customers with a premium-looking website
- Collect user information through a secure registration system
- Provide authenticated access to a complete product catalogue
- Send automated email notifications on key events (registration, password reset)
- Give administrators full control over products, categories and users
- Demonstrate modern full-stack development practices for a college assignment

---

## 3. Technology Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.x |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| UI Components | Custom Shadcn-style (Radix UI) | Latest |
| Icons | Lucide React | 0.511 |
| Database | Supabase PostgreSQL | Latest |
| Authentication | Supabase Auth | Latest |
| Email | Resend | 4.x |
| Form Validation | React Hook Form + Zod | 7.x / 3.x |
| Hosting | Vercel | Free tier |

---

## 4. Features

### Public (no login required)
- ✅ Responsive homepage with hero, about, featured products, why choose us, and contact sections
- ✅ Contact form (sends email to admin via Resend)
- ✅ User registration with full validation
- ✅ User login with remember me and forgot password
- ✅ Password reset via email link
- ✅ SEO-optimised pages with Open Graph metadata
- ✅ Auto-generated sitemap.xml and robots.txt
- ✅ Privacy Policy and Terms of Service pages

### Authenticated Users
- ✅ Full product catalogue with search, category filter and sort
- ✅ Individual product detail pages
- ✅ Personal dashboard showing account details

### Admin Users
- ✅ Admin dashboard with statistics overview
- ✅ Product management: create, edit, delete, toggle active/featured
- ✅ Category management: create and list categories
- ✅ User management: view all registered users with details
- ✅ Role-based access control (server-side + RLS)

### Email Notifications
- ✅ Welcome email sent to user on registration
- ✅ Admin alert email sent when a new user registers
- ✅ Password reset email with secure link
- ✅ Contact form enquiry forwarded to admin

---

## 5. How the Website Works

### User Journey

```
Visitor arrives at homepage
    │
    ├── Browses hero, about, featured products, contact
    │
    ├── Clicks "Register Now" ──► Registration form
    │       │
    │       ├── Fills full name, email, mobile, password
    │       ├── Accepts terms & conditions
    │       ├── Account created in Supabase Auth
    │       ├── Profile saved to profiles table
    │       ├── Welcome email sent to user   (Resend)
    │       ├── Alert email sent to admin    (Resend)
    │       └── Redirected to Login page
    │
    └── Clicks "Login" ──► Login form
            │
            ├── Enters email + password
            ├── Supabase Auth verifies credentials
            └── Redirected to Product Catalogue (/products)
                    │
                    ├── Search / filter / sort products
                    ├── Click "View Details" ──► Product detail page
                    └── Access personal dashboard (/dashboard)
```

### Admin Journey

```
Admin logs in ──► Redirected to /products
    │
    └── Navigates to /admin (role-checked server-side + middleware)
            │
            ├── Overview tab  ── statistics, recent products/users
            ├── Products tab  ── create, edit, delete products
            ├── Categories tab ── create and view categories
            └── Users tab     ── view all registered users
```

### Authentication Flow

1. User submits login → Supabase validates credentials
2. Supabase sets a secure HttpOnly cookie via `@supabase/ssr`
3. Next.js middleware reads the cookie on every request
4. Protected routes (`/products`, `/dashboard`, `/admin`) redirect to `/login` if no valid session
5. Admin routes additionally check the `role` field in the `profiles` table
6. Row Level Security (RLS) on Supabase enforces access at the database level

---

## 6. Folder Structure

```
catalogue-app/
├── public/                         # Static assets (favicon, og-image)
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql  # Complete database schema + seed data
├── src/
│   ├── app/                        # Next.js App Router pages
│   │   ├── layout.tsx              # Root layout (Navbar, Footer, Toaster)
│   │   ├── page.tsx                # Homepage
│   │   ├── not-found.tsx           # 404 page
│   │   ├── sitemap.ts              # Auto-generated sitemap
│   │   ├── robots.ts               # robots.txt
│   │   ├── globals.css             # Global styles + CSS variables
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── dashboard/page.tsx      # User dashboard (protected)
│   │   ├── admin/page.tsx          # Admin dashboard (admin only)
│   │   ├── products/
│   │   │   ├── page.tsx            # Product catalogue (protected)
│   │   │   └── [id]/page.tsx       # Product detail (protected)
│   │   ├── auth/
│   │   │   ├── callback/route.ts   # OAuth/magic-link callback
│   │   │   └── reset-password/     # Password reset page
│   │   ├── privacy/page.tsx
│   │   ├── terms/page.tsx
│   │   └── api/
│   │       ├── auth/register/route.ts   # POST: create account
│   │       ├── contact/route.ts         # POST: contact form
│   │       └── admin/
│   │           ├── products/route.ts          # POST: create product
│   │           ├── products/[id]/route.ts     # PATCH/DELETE product
│   │           ├── categories/route.ts        # POST: create category
│   │           └── users/route.ts             # GET: list users
│   ├── components/
│   │   ├── ui/                     # Base UI components (Button, Input, Card…)
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   └── Footer.tsx
│   │   ├── home/
│   │   │   ├── HeroSection.tsx
│   │   │   ├── AboutSection.tsx
│   │   │   ├── FeaturedProducts.tsx
│   │   │   ├── WhyChooseUs.tsx
│   │   │   └── ContactSection.tsx
│   │   ├── auth/
│   │   │   ├── RegisterForm.tsx
│   │   │   └── LoginForm.tsx
│   │   ├── products/
│   │   │   └── ProductCatalogue.tsx
│   │   ├── dashboard/
│   │   │   └── UserDashboard.tsx
│   │   └── admin/
│   │       └── AdminDashboard.tsx
│   ├── hooks/
│   │   └── use-toast.ts            # Toast notification hook
│   ├── lib/
│   │   ├── site-config.ts          # ★ Edit this to customise business details
│   │   ├── utils.ts                # cn(), formatPrice(), formatDate()
│   │   ├── email.ts                # Resend email templates
│   │   └── supabase/
│   │       ├── client.ts           # Browser client
│   │       ├── server.ts           # Server + Admin client
│   │       └── admin-guard.ts      # requireAdmin() helper
│   ├── middleware.ts               # Route protection + role check
│   └── types/
│       └── database.ts             # Full TypeScript types for all tables
├── .env.example                    # Environment variable template
├── next.config.ts
├── tsconfig.json
└── package.json
```

---

## 7. Prerequisites

Before you begin, ensure you have:

- **Node.js** 18.17 or later — [nodejs.org](https://nodejs.org)
- **npm** 9+ (comes with Node.js)
- A **Supabase** account — [supabase.com](https://supabase.com) (free tier)
- A **Resend** account — [resend.com](https://resend.com) (free tier, 3,000 emails/month)
- A **Vercel** account — [vercel.com](https://vercel.com) (free tier, for deployment)

---

## 8. Installation Instructions

### Step 1 — Clone or download the project

```bash
# If using git
git clone <your-repo-url>
cd catalogue-app

# Or just open the catalogue-app folder in your terminal
cd "C:\Users\devya\OneDrive\Desktop\Project\catalogue-app"
```

### Step 2 — Install dependencies

```bash
npm install
```

### Step 3 — Create your environment file

```bash
# Windows
copy .env.example .env.local

# Mac / Linux
cp .env.example .env.local
```

Then fill in the values (see Section 9).

### Step 4 — Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 9. Environment Variable Configuration

Open `.env.local` and fill in every value:

```env
# ── Supabase ──────────────────────────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# ── Resend ────────────────────────────────────────────────────────────────────
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
RESEND_DOMAIN=yourdomain.com          # or use resend.dev for testing

# ── Admin ────────────────────────────────────────────────────────────────────
ADMIN_EMAIL=admin@yourdomain.com

# ── App ──────────────────────────────────────────────────────────────────────
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_CONTACT_EMAIL=contact@yourdomain.com
```

> ⚠️ **Never commit `.env.local` to git.** It is already listed in `.gitignore`.
>
> ⚠️ `SUPABASE_SERVICE_ROLE_KEY` is only used server-side in API routes. It is **never** exposed to the browser.

---

## 10. Supabase Setup

### Step 1 — Create a project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **New Project**
3. Choose a name (e.g. `nexus-commerce`), set a strong database password, select a region
4. Wait ~2 minutes for the project to be ready

### Step 2 — Get your API keys

1. Go to **Project Settings → API**
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role / secret key** → `SUPABASE_SERVICE_ROLE_KEY`

### Step 3 — Run the SQL migration

1. In the Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Open the file `supabase/migrations/001_initial_schema.sql` from this project
4. **Select All** and paste the entire contents into the SQL editor
5. Click **Run**

This creates all tables, indexes, RLS policies, triggers and seeds 12 sample products across 5 categories.

### Step 4 — Configure authentication

1. Go to **Authentication → Settings**
2. Under **Email**, make sure **Enable Email Provider** is turned on
3. Under **URL Configuration**, set:
   - **Site URL**: `http://localhost:3000` (change to your production URL later)
   - **Redirect URLs**: add `http://localhost:3000/auth/callback`

### Step 5 — Create your admin account

1. Register normally at `http://localhost:3000/register`
2. Go to Supabase dashboard → **Table Editor → profiles**
3. Find your profile row and change `role` from `user` to `admin`
4. Save — you now have admin access

---

## 11. Database Schema & SQL Migration

### Tables

#### `profiles`
Stores user profile data linked to Supabase Auth.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | References `auth.users(id)` |
| `full_name` | TEXT | 2–100 characters |
| `email` | TEXT | Unique |
| `mobile_number` | TEXT | Optional |
| `role` | TEXT | `'user'` or `'admin'` |
| `avatar_url` | TEXT | Optional |
| `created_at` | TIMESTAMPTZ | Auto-set |
| `updated_at` | TIMESTAMPTZ | Auto-updated via trigger |

#### `categories`
Product categories.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | Auto-generated |
| `category_name` | TEXT | Unique |
| `description` | TEXT | Optional |
| `slug` | TEXT | URL-friendly, unique |
| `created_at` | TIMESTAMPTZ | Auto-set |

#### `products`
The main product catalogue.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | Auto-generated |
| `product_name` | TEXT | 2–200 characters |
| `description` | TEXT | Full description |
| `category_id` | UUID (FK) | References `categories(id)` |
| `image_url` | TEXT | Unsplash or any HTTPS URL |
| `price` | NUMERIC(10,2) | Optional; NULL = "price on request" |
| `is_featured` | BOOLEAN | Shown on homepage |
| `is_active` | BOOLEAN | Hidden if false |
| `created_at` | TIMESTAMPTZ | Auto-set |
| `updated_at` | TIMESTAMPTZ | Auto-updated via trigger |

### Row Level Security

| Table | Policy | Who |
|---|---|---|
| `profiles` | SELECT own row | Authenticated user (own id) |
| `profiles` | UPDATE own row | Authenticated user (own id) |
| `profiles` | SELECT all rows | Admin only |
| `categories` | SELECT | Everyone (public) |
| `categories` | ALL (insert/update/delete) | Admin only |
| `products` | SELECT active | Authenticated users |
| `products` | ALL | Admin only |

---

## 12. Resend Email Configuration

### Step 1 — Create a Resend account

1. Go to [resend.com](https://resend.com) and sign up for free
2. The free tier allows **3,000 emails/month** — more than enough

### Step 2 — Get your API key

1. Go to **API Keys** → **Create API Key**
2. Copy the key → `RESEND_API_KEY` in `.env.local`

### Step 3 — Domain setup (for production)

For local development you can use `resend.dev` test addresses. For production:

1. Go to **Domains** → **Add Domain**
2. Add your domain (e.g. `nexuscommerce.com`)
3. Add the DNS records Resend provides to your domain registrar
4. Once verified, set `RESEND_DOMAIN=nexuscommerce.com`

> **Testing without a domain**: Set `RESEND_DOMAIN=resend.dev` and emails are sent from `noreply@resend.dev`. You can only send to your own verified email address on the free plan without a domain.

### Emails sent by this application

| Trigger | To | Subject |
|---|---|---|
| User registers | New user | Welcome to Nexus Commerce! |
| User registers | Admin | New User Registration – {name} |
| User submits contact form | Admin | Contact Form: {subject} |
| User requests password reset | User | (Supabase built-in reset email) |

---

## 13. Local Development

```bash
# Start the dev server with Turbopack
npm run dev

# Type-check only (no build)
npx tsc --noEmit

# Production build (requires env vars)
npm run build

# Start production server locally
npm start
```

The development server runs at **http://localhost:3000**.

### Useful development tips

- **Change business name/contact**: Edit `src/lib/site-config.ts` — all pages pick up the changes automatically
- **Add a product**: Log in as admin → `/admin` → Products tab → Add Product
- **Check emails**: Use [Resend's dashboard](https://resend.com/emails) to see sent emails
- **View database**: Use the Supabase dashboard → Table Editor

---

## 14. Deployment to Vercel

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/nexus-commerce.git
git push -u origin main
```

### Step 2 — Import to Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repository
3. Vercel auto-detects Next.js — no build settings needed

### Step 3 — Add environment variables

In Vercel project settings → **Environment Variables**, add all variables from `.env.example`:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
RESEND_API_KEY
RESEND_DOMAIN
ADMIN_EMAIL
NEXT_PUBLIC_SITE_URL        ← Set to your Vercel URL, e.g. https://nexus-commerce.vercel.app
NEXT_PUBLIC_CONTACT_EMAIL
```

### Step 4 — Update Supabase redirect URLs

1. Supabase dashboard → **Authentication → Settings → URL Configuration**
2. Update **Site URL** to your Vercel URL
3. Add your Vercel URL to **Redirect URLs**: `https://your-app.vercel.app/auth/callback`

### Step 5 — Deploy

Click **Deploy** in Vercel. The build takes ~1–2 minutes. Your site is live!

---

## 15. Pages & Routes Reference

| Route | Access | Description |
|---|---|---|
| `/` | Public | Homepage |
| `/register` | Public | User registration |
| `/login` | Public | User login |
| `/auth/reset-password` | Public | Password reset form |
| `/auth/callback` | Public | Auth callback handler |
| `/products` | **Login required** | Full product catalogue |
| `/products/[id]` | **Login required** | Product detail page |
| `/dashboard` | **Login required** | User account dashboard |
| `/admin` | **Admin only** | Admin dashboard |
| `/privacy` | Public | Privacy policy |
| `/terms` | Public | Terms of service |
| `/sitemap.xml` | Public | SEO sitemap |
| `/robots.txt` | Public | Crawler instructions |

### API Routes

| Route | Method | Description |
|---|---|---|
| `/api/auth/register` | POST | Create new user account |
| `/api/contact` | POST | Send contact form email |
| `/api/admin/products` | POST | Create product (admin) |
| `/api/admin/products/[id]` | PATCH | Update product (admin) |
| `/api/admin/products/[id]` | DELETE | Delete product (admin) |
| `/api/admin/categories` | POST | Create category (admin) |
| `/api/admin/users` | GET | List all users (admin) |

---

## 16. Security Implementation

| Measure | Implementation |
|---|---|
| Password hashing | Supabase Auth (bcrypt) — never stored in plain text |
| Session management | Supabase SSR cookies (HttpOnly, Secure) |
| Route protection | `src/middleware.ts` — redirects unauthenticated users |
| Admin verification | Server-side role check in every admin page + API route |
| API authorisation | `requireAdmin()` helper checks role before every admin API call |
| Database RLS | Row Level Security policies on all tables |
| Input validation | Zod schemas on all API routes + React Hook Form on all forms |
| Environment secrets | Service role key and Resend key never exposed to browser |
| HTTPS | Enforced automatically by Vercel and Supabase |
| XSS protection | React's built-in JSX escaping; no `dangerouslySetInnerHTML` |

---

## 17. Customisation Guide

### Change business name and contact details

Edit **`src/lib/site-config.ts`**:

```ts
export const siteConfig = {
  name: "Your Business Name",
  tagline: "Your Tagline Here",
  email: "contact@yourbusiness.com",
  phone: "+1 (555) 000-0000",
  address: "Your Business Address",
  // ...
};
```

All pages, emails and the footer update automatically.

### Change the colour scheme

Edit **`src/app/globals.css`** — update the `--primary` hex value:

```css
:root {
  --primary: #16a34a;  /* change to any hex colour */
}
```

### Add more product categories

Log in as admin → `/admin` → Categories tab → Add Category.

Or add them directly to the SQL seed in `supabase/migrations/001_initial_schema.sql`.

### Replace hero image

In `src/components/home/HeroSection.tsx`, change the Unsplash URL in the `<Image>` component.

---

## 18. Testing Checklist

Use this checklist to verify the application before submission:

### Registration
- [ ] Register with valid details → account created, welcome email received
- [ ] Register with existing email → error "account already exists"
- [ ] Register with invalid email format → validation error shown
- [ ] Register with weak password → validation error shown
- [ ] Register without accepting terms → validation error shown

### Login
- [ ] Login with correct credentials → redirected to `/products`
- [ ] Login with wrong password → error message shown
- [ ] Login with non-existent email → error message shown
- [ ] Click "Forgot password?" → reset email received
- [ ] Follow reset link → set new password successfully

### Product Catalogue
- [ ] Visit `/products` without login → redirected to `/login`
- [ ] Visit `/products` after login → full catalogue shown
- [ ] Search by product name → results filtered
- [ ] Filter by category → results filtered
- [ ] Sort A–Z / Z–A / price → order changes
- [ ] Click "View Details" → product detail page loads

### Admin Dashboard
- [ ] Visit `/admin` as a regular user → redirected to homepage
- [ ] Visit `/admin` as admin → dashboard loads
- [ ] Add a new product → appears in table
- [ ] Edit a product → changes saved
- [ ] Delete a product → removed from table
- [ ] Add a category → appears in category list
- [ ] View users tab → all registered users shown

### General
- [ ] Logout → session cleared, redirected to homepage
- [ ] Mobile view → all pages responsive at 375px width
- [ ] Contact form → submission sends email to admin
- [ ] `/sitemap.xml` → accessible
- [ ] `/robots.txt` → accessible

---

## Estimated Development Cost

| Service | Cost |
|---|---|
| Next.js | Free |
| Supabase (free tier) | Free |
| Vercel (free tier) | Free |
| Resend (free tier) | Free |
| Custom domain | Optional (~$10–15/year) |
| **Total** | **$0** |

---

## License

This project was created for academic purposes as a college assignment in Organisational Behaviour.

---

*Built with Next.js 16, TypeScript, Tailwind CSS, Supabase and Resend.*
