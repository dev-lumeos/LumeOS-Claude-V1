# Marketplace Module — Product Requirements Document

**Date:** 2026-02-24
**Status:** PRD Complete → Build Started
**Module:** Marketplace 🏪
**Research:** `research/marketplace/` (3 files, 844 lines)

---

## Vision

> **"Der einzige Fitness-Marketplace wo Training, Nutrition, Supplements und Recovery als integriertes Paket kommen — LIVE in der App, nicht als PDF."**

---

## Scope — MVP (Sprint 1)

### Was wir bauen:
1. **Storefront** — Browse/Search/Filter Marketplace Products
2. **Product Types** — Programs, Meal Plans, Supplement Stacks, Bundles
3. **Product Detail** — Preview, Pricing, Reviews, Creator Info
4. **Creator Hub** — Coach/Creator can list products
5. **Purchase Flow** — Buy → activate in app (Wallet-based)
6. **My Library** — Purchased products
7. **Categories & Discovery** — Goal-based, trending, recommended

### Was NICHT in MVP:
- Stripe Connect / Real payments (wallet mock)
- AI Recommendations engine
- Video content hosting
- Brand partnerships / sponsored listings

---

## Database Schema

### Migration 013: marketplace

```sql
-- Marketplace creators (coaches + content creators)
CREATE TABLE IF NOT EXISTS marketplace_creators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  display_name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  specialties TEXT[],
  verified BOOLEAN DEFAULT false,
  tier TEXT DEFAULT 'starter', -- starter, pro, featured
  total_sales INTEGER DEFAULT 0,
  total_revenue DECIMAL(10,2) DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Marketplace products
CREATE TABLE IF NOT EXISTS marketplace_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES marketplace_creators(id),
  type TEXT NOT NULL, -- training_program, meal_plan, supplement_stack, recovery_protocol, bundle
  title TEXT NOT NULL,
  description TEXT,
  short_description TEXT,
  cover_image TEXT,
  preview_images TEXT[],
  
  -- Commerce
  pricing_model TEXT DEFAULT 'one_time', -- one_time, subscription, free
  price DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  trial_days INTEGER DEFAULT 0,
  
  -- Metadata
  difficulty TEXT, -- beginner, intermediate, advanced, elite
  duration_weeks INTEGER,
  equipment TEXT[],
  goals TEXT[], -- muscle_gain, fat_loss, recomp, strength, endurance
  tags TEXT[],
  language TEXT DEFAULT 'de',
  
  -- Content (JSONB for flexible product types)
  content JSONB DEFAULT '{}',
  
  -- Bundle components (only for type=bundle)
  bundle_components JSONB DEFAULT '[]', -- [{type, product_id, title}]
  
  -- Stats
  purchases INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'draft', -- draft, published, archived
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Purchases / Library
CREATE TABLE IF NOT EXISTS marketplace_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES marketplace_products(id),
  price_paid DECIMAL(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'active', -- active, expired, refunded
  activated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews
CREATE TABLE IF NOT EXISTS marketplace_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES marketplace_products(id),
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT,
  verified_purchase BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories
CREATE TABLE IF NOT EXISTS marketplace_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  description TEXT,
  parent_id UUID REFERENCES marketplace_categories(id),
  sort_order INTEGER DEFAULT 0
);

CREATE INDEX idx_mp_products_type ON marketplace_products(type);
CREATE INDEX idx_mp_products_status ON marketplace_products(status);
CREATE INDEX idx_mp_products_goals ON marketplace_products USING GIN(goals);
CREATE INDEX idx_mp_products_creator ON marketplace_products(creator_id);
CREATE INDEX idx_mp_purchases_user ON marketplace_purchases(user_id);
CREATE INDEX idx_mp_reviews_product ON marketplace_reviews(product_id);
```

---

## API Endpoints (Port 5700)

### Products
- `GET /api/marketplace/products` — Browse (filters: type, goal, difficulty, price range, sort)
- `GET /api/marketplace/products/:id` — Product detail with creator + reviews
- `GET /api/marketplace/products/featured` — Featured/trending products
- `GET /api/marketplace/products/search?q=` — Full-text search

### Categories
- `GET /api/marketplace/categories` — All categories with product counts

### Creators
- `GET /api/marketplace/creators` — Browse creators
- `GET /api/marketplace/creators/:id` — Creator profile + products
- `GET /api/marketplace/creators/me` — Current user's creator profile
- `PUT /api/marketplace/creators/me` — Update creator profile
- `POST /api/marketplace/creators/products` — Create product listing
- `PUT /api/marketplace/creators/products/:id` — Update product
- `DELETE /api/marketplace/creators/products/:id` — Archive product

### Purchases
- `POST /api/marketplace/purchase/:productId` — Buy product (wallet deduction)
- `GET /api/marketplace/library` — User's purchased products
- `GET /api/marketplace/library/:id` — Purchased product detail (with content)

### Reviews
- `POST /api/marketplace/reviews/:productId` — Add review
- `GET /api/marketplace/reviews/:productId` — Get reviews for product

### Analytics (Creator)
- `GET /api/marketplace/creators/analytics` — Sales, revenue, views

---

## UI Components

### MarketplaceView.tsx — Main marketplace page
- Header with search bar
- Category pills (horizontal scroll)
- Featured banner/carousel
- Product grid (cards)
- Filter sidebar/modal

### ProductCard.tsx — Product card in grid
- Cover image
- Title, creator name
- Price badge (or "Kostenlos")
- Rating stars + review count
- Goal/difficulty tags
- Purchase count ("1.2K gekauft")

### ProductDetail.tsx — Full product page
- Cover image + gallery
- Title, description, creator
- Price + Buy button
- Features list
- Content preview
- Reviews section
- Similar products

### CreatorHub.tsx — Creator dashboard
- Sales overview
- Product list (draft/published)
- Create product form
- Analytics

### MyLibrary.tsx — User's purchases
- Grid of purchased products
- Active/expired filter
- "Aktivieren" button (load into app)

### CategoryBrowser.tsx — Category page
- Products filtered by category
- Sort options

---

## Acceptance Criteria

- AC1: User can browse marketplace products filtered by type/goal/difficulty
- AC2: User can view full product detail with description, creator, reviews
- AC3: User can "purchase" a product (mock wallet deduction)
- AC4: Purchased products appear in "Meine Bibliothek"
- AC5: Creator can list a new product with title, description, type, price
- AC6: Reviews can be added to products with 1-5 star rating
- AC7: Search returns relevant products by title/description
- AC8: Featured products displayed on marketplace home
- AC9: Product cards show rating, purchases, price, difficulty
- AC10: Categories with product counts displayed
- AC11: Creator analytics show total sales and revenue
- AC12: All UI in German with i18n keys (DE/EN/TH)
