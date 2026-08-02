# Marketplace Database Schema

## Core Product Management Tables

### marketplace_products
Main product catalog with comprehensive metadata.

```sql
CREATE TABLE marketplace_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES marketplace_creators(id) ON DELETE CASCADE,
  
  -- Product identification
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(250) UNIQUE NOT NULL, -- URL-friendly identifier
  description TEXT,
  detailed_description TEXT, -- Rich text/markdown content
  
  -- Product classification
  type VARCHAR(50) NOT NULL, -- plan, supplement, equipment, course, consultation
  category_id UUID REFERENCES marketplace_categories(id),
  subcategory_id UUID REFERENCES marketplace_subcategories(id),
  
  -- Targeting and goals
  goals TEXT[] NOT NULL, -- muscle_gain, weight_loss, endurance, strength
  difficulty VARCHAR(20), -- beginner, intermediate, advanced, expert
  target_audience VARCHAR(100), -- beginners, athletes, bodybuilders
  
  -- Pricing and availability
  price NUMERIC(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  original_price NUMERIC(10,2), -- For displaying discounts
  is_free BOOLEAN DEFAULT false,
  pricing_model VARCHAR(30) DEFAULT 'one_time', -- one_time, subscription, tier_based
  
  -- Content and delivery
  content_type VARCHAR(30), -- digital, physical, hybrid, service
  delivery_method VARCHAR(30), -- download, streaming, shipping, consultation
  file_urls JSONB, -- Download links, streaming URLs
  file_sizes JSONB, -- File sizes for download estimation
  access_duration_days INTEGER, -- NULL = lifetime access
  
  -- Media and presentation
  thumbnail_url TEXT,
  gallery_urls TEXT[], -- Additional product images/videos
  preview_url TEXT, -- Sample content URL
  demo_video_url TEXT,
  
  -- Metadata and tags
  tags TEXT[], -- Searchable keywords
  language VARCHAR(5) DEFAULT 'en',
  duration_minutes INTEGER, -- For courses/consultations
  skill_level_required TEXT[], -- Prerequisites
  equipment_required TEXT[], -- Required equipment/tools
  
  -- Engagement metrics
  views INTEGER DEFAULT 0,
  purchases INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  rating NUMERIC(3,2) DEFAULT 0, -- Average rating 0.00-5.00
  
  -- Product status and visibility
  status VARCHAR(20) DEFAULT 'draft', -- draft, pending, published, archived
  featured BOOLEAN DEFAULT false,
  promoted BOOLEAN DEFAULT false,
  visibility VARCHAR(20) DEFAULT 'public', -- public, unlisted, private
  
  -- SEO and searchability
  meta_title VARCHAR(160),
  meta_description VARCHAR(320),
  search_keywords TEXT[], -- Additional search terms
  search_weight NUMERIC(3,2) DEFAULT 1.0, -- Search ranking weight
  
  -- Timestamps and versioning
  published_at TIMESTAMPTZ,
  version INTEGER DEFAULT 1,
  last_updated_by UUID REFERENCES users(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_price CHECK (price >= 0),
  CONSTRAINT valid_rating CHECK (rating >= 0 AND rating <= 5),
  CONSTRAINT valid_status CHECK (status IN ('draft', 'pending', 'published', 'archived'))
);
```

**Indexes:**
- `idx_marketplace_products_creator` on `creator_id`
- `idx_marketplace_products_status` on `status`
- `idx_marketplace_products_category` on `category_id`
- `idx_marketplace_products_type_difficulty` on `(type, difficulty)`
- `idx_marketplace_products_goals` on `goals` (GIN index)
- `idx_marketplace_products_tags` on `tags` (GIN index)
- `idx_marketplace_products_price` on `price`
- `idx_marketplace_products_rating` on `rating DESC`
- `idx_marketplace_products_purchases` on `purchases DESC`
- `idx_marketplace_products_search` on `(title, description)` using GIN(to_tsvector('english', title || ' ' || description))

### marketplace_creators
Creator profiles and business information.

```sql
CREATE TABLE marketplace_creators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Public profile information
  display_name VARCHAR(100) NOT NULL,
  slug VARCHAR(120) UNIQUE NOT NULL, -- URL-friendly profile identifier
  bio TEXT,
  avatar_url TEXT,
  cover_image_url TEXT,
  
  -- Professional credentials
  credentials TEXT[], -- Certifications, degrees, titles
  specialties TEXT[], -- Areas of expertise
  experience_years INTEGER,
  languages_spoken TEXT[] DEFAULT ARRAY['en'],
  
  -- Contact and social information
  website_url TEXT,
  social_links JSONB, -- Instagram, YouTube, Twitter, etc.
  contact_email TEXT,
  location VARCHAR(100),
  timezone VARCHAR(50),
  
  -- Business information
  business_name VARCHAR(200),
  business_type VARCHAR(50), -- individual, llc, corporation, partnership
  tax_id VARCHAR(50),
  business_address JSONB,
  
  -- Creator status and verification
  verification_status VARCHAR(20) DEFAULT 'pending', -- pending, verified, rejected
  verification_documents JSONB, -- Uploaded verification files
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES users(id),
  
  -- Performance metrics
  total_products INTEGER DEFAULT 0,
  total_sales INTEGER DEFAULT 0,
  total_revenue NUMERIC(12,2) DEFAULT 0,
  rating NUMERIC(3,2) DEFAULT 0, -- Average creator rating
  review_count INTEGER DEFAULT 0,
  follower_count INTEGER DEFAULT 0,
  
  -- Creator settings
  public_profile BOOLEAN DEFAULT true,
  allow_direct_messages BOOLEAN DEFAULT true,
  auto_accept_collaboration BOOLEAN DEFAULT false,
  commission_rate NUMERIC(5,4) DEFAULT 0.7000, -- Creator's share (70%)
  
  -- Response and service metrics
  avg_response_time_hours NUMERIC(5,2),
  response_rate NUMERIC(5,4), -- 0.0000-1.0000
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Account status
  status VARCHAR(20) DEFAULT 'active', -- active, suspended, banned, inactive
  suspension_reason TEXT,
  suspension_expires_at TIMESTAMPTZ,
  
  -- Onboarding progress
  onboarding_completed BOOLEAN DEFAULT false,
  onboarding_step VARCHAR(50), -- profile, verification, first_product, payout_setup
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_commission_rate CHECK (commission_rate >= 0 AND commission_rate <= 1),
  CONSTRAINT valid_rating CHECK (rating >= 0 AND rating <= 5)
);
```

**Indexes:**
- `idx_marketplace_creators_user` on `user_id`
- `idx_marketplace_creators_status` on `status`
- `idx_marketplace_creators_verification` on `verification_status`
- `idx_marketplace_creators_rating` on `rating DESC`
- `idx_marketplace_creators_specialties` on `specialties` (GIN index)
- `idx_marketplace_creators_revenue` on `total_revenue DESC`

## Transaction and Purchase Management

### marketplace_purchases
Complete purchase transaction records.

```sql
CREATE TABLE marketplace_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES marketplace_products(id) ON DELETE RESTRICT,
  creator_id UUID NOT NULL REFERENCES marketplace_creators(id) ON DELETE RESTRICT,
  
  -- Purchase identification
  order_number VARCHAR(50) UNIQUE NOT NULL, -- Human-readable order ID
  transaction_id UUID, -- Payment processor transaction ID
  
  -- Pricing details
  list_price NUMERIC(10,2) NOT NULL, -- Original product price
  sale_price NUMERIC(10,2) NOT NULL, -- Final price paid
  discount_amount NUMERIC(10,2) DEFAULT 0,
  tax_amount NUMERIC(10,2) DEFAULT 0,
  total_amount NUMERIC(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  
  -- Discount and promotion tracking
  discount_code VARCHAR(50),
  discount_percentage NUMERIC(5,2),
  promotion_id UUID REFERENCES marketplace_promotions(id),
  
  -- Payment information
  payment_method VARCHAR(30), -- lumeos_wallet, stripe, paypal, apple_pay
  payment_processor VARCHAR(30),
  payment_processor_fee NUMERIC(10,2),
  net_amount NUMERIC(10,2), -- Amount after fees
  
  -- Purchase metadata
  purchase_type VARCHAR(30) DEFAULT 'individual', -- individual, bundle, subscription
  bundle_id UUID, -- If part of a bundle purchase
  gift_purchase BOOLEAN DEFAULT false,
  gift_recipient_id UUID REFERENCES users(id),
  gift_message TEXT,
  
  -- Status and fulfillment
  status VARCHAR(20) DEFAULT 'pending', -- pending, completed, failed, refunded, disputed
  fulfillment_status VARCHAR(20) DEFAULT 'pending', -- pending, fulfilled, failed
  
  -- Access control
  access_granted BOOLEAN DEFAULT false,
  access_granted_at TIMESTAMPTZ,
  access_expires_at TIMESTAMPTZ, -- NULL = lifetime access
  download_count INTEGER DEFAULT 0,
  download_limit INTEGER, -- NULL = unlimited
  
  -- Digital delivery
  download_urls JSONB, -- Secure download links
  download_urls_generated_at TIMESTAMPTZ,
  download_urls_expire_at TIMESTAMPTZ,
  
  -- Refund and dispute handling
  refund_requested_at TIMESTAMPTZ,
  refund_reason TEXT,
  refund_amount NUMERIC(10,2),
  refunded_at TIMESTAMPTZ,
  dispute_opened_at TIMESTAMPTZ,
  dispute_resolved_at TIMESTAMPTZ,
  
  -- Revenue sharing
  creator_earnings NUMERIC(10,2), -- Creator's share of net amount
  platform_fee NUMERIC(10,2), -- Lumeos platform fee
  earnings_paid_out BOOLEAN DEFAULT false,
  payout_date TIMESTAMPTZ,
  
  -- Usage tracking
  first_accessed_at TIMESTAMPTZ,
  last_accessed_at TIMESTAMPTZ,
  total_usage_minutes INTEGER DEFAULT 0,
  completion_percentage NUMERIC(5,2) DEFAULT 0,
  
  -- Customer satisfaction
  satisfaction_rating INTEGER, -- 1-5 purchase satisfaction
  satisfaction_feedback TEXT,
  would_recommend BOOLEAN,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_amounts CHECK (
    list_price >= 0 AND 
    sale_price >= 0 AND 
    total_amount >= 0 AND
    discount_amount >= 0
  ),
  CONSTRAINT valid_satisfaction CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5)
);
```

**Indexes:**
- `idx_marketplace_purchases_user` on `user_id`
- `idx_marketplace_purchases_product` on `product_id`
- `idx_marketplace_purchases_creator` on `creator_id`
- `idx_marketplace_purchases_status` on `status`
- `idx_marketplace_purchases_date` on `created_at DESC`
- `idx_marketplace_purchases_order_number` on `order_number`
- `idx_marketplace_purchases_earnings` on `(creator_id, earnings_paid_out)`

### marketplace_wallet_transactions
Detailed wallet transaction log for marketplace operations.

```sql
CREATE TABLE marketplace_wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  purchase_id UUID REFERENCES marketplace_purchases(id),
  
  -- Transaction classification
  transaction_type VARCHAR(30) NOT NULL, -- purchase, refund, top_up, withdrawal, fee, bonus
  transaction_category VARCHAR(30), -- product_purchase, subscription_renewal, gift_card
  
  -- Amount and currency
  amount NUMERIC(12,2) NOT NULL, -- Positive for credits, negative for debits
  currency VARCHAR(3) DEFAULT 'USD',
  exchange_rate NUMERIC(10,6), -- If currency conversion involved
  original_amount NUMERIC(12,2), -- Pre-conversion amount
  original_currency VARCHAR(3),
  
  -- Balance tracking
  balance_before NUMERIC(12,2) NOT NULL,
  balance_after NUMERIC(12,2) NOT NULL,
  
  -- Transaction details
  description TEXT NOT NULL,
  reference_id VARCHAR(100), -- External payment processor reference
  metadata JSONB, -- Additional transaction-specific data
  
  -- Processing information
  payment_method VARCHAR(30),
  payment_processor VARCHAR(30),
  processor_transaction_id VARCHAR(100),
  processor_fee NUMERIC(10,2),
  
  -- Status and timing
  status VARCHAR(20) DEFAULT 'pending', -- pending, completed, failed, cancelled
  processed_at TIMESTAMPTZ,
  failed_reason TEXT,
  retry_count INTEGER DEFAULT 0,
  
  -- Fraud and security
  risk_score NUMERIC(3,2), -- 0.00-1.00 fraud risk assessment
  fraud_check_status VARCHAR(20), -- passed, failed, manual_review
  ip_address INET,
  user_agent TEXT,
  
  -- Reconciliation
  reconciled BOOLEAN DEFAULT false,
  reconciled_at TIMESTAMPTZ,
  batch_id VARCHAR(100), -- For batch processing
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_balance_calculation CHECK (
    balance_after = balance_before + amount
  )
);
```

**Indexes:**
- `idx_wallet_transactions_user_date` on `(user_id, created_at DESC)`
- `idx_wallet_transactions_type` on `transaction_type`
- `idx_wallet_transactions_status` on `status`
- `idx_wallet_transactions_purchase` on `purchase_id`
- `idx_wallet_transactions_reconciliation` on `(reconciled, created_at)`

## Product Organization and Discovery

### marketplace_categories
Hierarchical product categorization system.

```sql
CREATE TABLE marketplace_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES marketplace_categories(id),
  
  -- Category identification
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(120) UNIQUE NOT NULL,
  description TEXT,
  
  -- Category metadata
  icon_url TEXT,
  cover_image_url TEXT,
  color_hex VARCHAR(7), -- Brand color for category
  
  -- Hierarchy and ordering
  level INTEGER NOT NULL DEFAULT 0, -- 0 = top level, 1 = subcategory, etc.
  sort_order INTEGER DEFAULT 0,
  path TEXT, -- Materialized path for efficient queries
  
  -- Category metrics
  product_count INTEGER DEFAULT 0,
  active_product_count INTEGER DEFAULT 0, -- Only published products
  total_sales INTEGER DEFAULT 0,
  
  -- Category settings
  is_active BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  requires_verification BOOLEAN DEFAULT false, -- Products need extra verification
  
  -- SEO optimization
  meta_title VARCHAR(160),
  meta_description VARCHAR(320),
  search_keywords TEXT[],
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
- `idx_marketplace_categories_parent` on `parent_id`
- `idx_marketplace_categories_level` on `level`
- `idx_marketplace_categories_path` on `path`
- `idx_marketplace_categories_active` on `(is_active, sort_order)`

### marketplace_product_variants
Product variations (sizes, colors, versions, etc.).

```sql
CREATE TABLE marketplace_product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES marketplace_products(id) ON DELETE CASCADE,
  
  -- Variant identification
  name VARCHAR(100) NOT NULL,
  sku VARCHAR(100) UNIQUE,
  
  -- Variant attributes
  attributes JSONB, -- size, color, version, format, etc.
  
  -- Pricing variations
  price_adjustment NUMERIC(10,2) DEFAULT 0, -- +/- from base price
  price_override NUMERIC(10,2), -- Explicit price for this variant
  
  -- Availability
  in_stock BOOLEAN DEFAULT true,
  stock_quantity INTEGER, -- NULL = unlimited/digital
  max_order_quantity INTEGER,
  
  -- Physical properties (for shipping)
  weight_kg NUMERIC(8,3),
  dimensions_cm JSONB, -- {width, height, depth}
  shipping_required BOOLEAN DEFAULT false,
  
  -- Digital properties
  file_urls JSONB, -- Variant-specific files
  file_sizes JSONB,
  
  -- Variant status
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(product_id, sku)
);
```

## Review and Rating System

### marketplace_reviews
Comprehensive product and creator review system.

```sql
CREATE TABLE marketplace_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES marketplace_products(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES marketplace_creators(id) ON DELETE CASCADE,
  purchase_id UUID REFERENCES marketplace_purchases(id) ON DELETE SET NULL,
  
  -- Review content
  title VARCHAR(200),
  comment TEXT,
  rating INTEGER NOT NULL, -- 1-5 stars
  
  -- Detailed ratings (for products)
  quality_rating INTEGER, -- 1-5
  value_rating INTEGER, -- 1-5
  ease_of_use_rating INTEGER, -- 1-5
  accuracy_rating INTEGER, -- 1-5
  
  -- Creator-specific ratings
  expertise_rating INTEGER, -- 1-5
  communication_rating INTEGER, -- 1-5
  responsiveness_rating INTEGER, -- 1-5
  
  -- Review metadata
  verified_purchase BOOLEAN DEFAULT false,
  anonymous_review BOOLEAN DEFAULT false,
  language VARCHAR(5) DEFAULT 'en',
  
  -- Media attachments
  image_urls TEXT[],
  video_urls TEXT[],
  
  -- Review engagement
  helpful_votes INTEGER DEFAULT 0,
  not_helpful_votes INTEGER DEFAULT 0,
  total_votes INTEGER DEFAULT 0,
  flagged_count INTEGER DEFAULT 0,
  
  -- Review status and moderation
  status VARCHAR(20) DEFAULT 'published', -- published, pending, rejected, hidden
  moderation_reason TEXT,
  moderated_at TIMESTAMPTZ,
  moderated_by UUID REFERENCES users(id),
  
  -- Creator response
  creator_response TEXT,
  creator_responded_at TIMESTAMPTZ,
  
  -- Review timing
  reviewed_at TIMESTAMPTZ DEFAULT NOW(),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_ratings CHECK (
    rating >= 1 AND rating <= 5 AND
    (quality_rating IS NULL OR (quality_rating >= 1 AND quality_rating <= 5)) AND
    (value_rating IS NULL OR (value_rating >= 1 AND value_rating <= 5))
  ),
  CONSTRAINT review_target_check CHECK (
    (product_id IS NOT NULL AND creator_id IS NULL) OR 
    (product_id IS NULL AND creator_id IS NOT NULL)
  )
);
```

**Indexes:**
- `idx_marketplace_reviews_product` on `product_id`
- `idx_marketplace_reviews_creator` on `creator_id`
- `idx_marketplace_reviews_user` on `user_id`
- `idx_marketplace_reviews_rating` on `rating DESC`
- `idx_marketplace_reviews_verified` on `verified_purchase`
- `idx_marketplace_reviews_status` on `status`

### marketplace_review_votes
User voting on review helpfulness.

```sql
CREATE TABLE marketplace_review_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES marketplace_reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Vote information
  vote_type VARCHAR(20) NOT NULL, -- helpful, not_helpful
  
  -- Metadata
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(review_id, user_id),
  CONSTRAINT valid_vote_type CHECK (vote_type IN ('helpful', 'not_helpful'))
);
```

## Promotions and Marketing

### marketplace_promotions
Flexible promotion and discount system.

```sql
CREATE TABLE marketplace_promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES marketplace_creators(id),
  
  -- Promotion identification
  name VARCHAR(200) NOT NULL,
  description TEXT,
  promo_code VARCHAR(50) UNIQUE,
  
  -- Promotion type and mechanics
  promotion_type VARCHAR(30) NOT NULL, -- percentage, fixed_amount, buy_x_get_y, bundle
  discount_percentage NUMERIC(5,2), -- For percentage discounts
  discount_amount NUMERIC(10,2), -- For fixed amount discounts
  minimum_purchase_amount NUMERIC(10,2),
  maximum_discount_amount NUMERIC(10,2),
  
  -- Promotion scope
  applicable_products UUID[], -- Specific products (empty = all creator's products)
  applicable_categories UUID[], -- Category restrictions
  applicable_user_segments TEXT[], -- new_users, premium_subscribers, etc.
  
  -- Usage limitations
  usage_limit_total INTEGER, -- Total number of uses across all users
  usage_limit_per_user INTEGER DEFAULT 1,
  uses_count INTEGER DEFAULT 0,
  
  -- Timing constraints
  valid_from TIMESTAMPTZ NOT NULL,
  valid_until TIMESTAMPTZ NOT NULL,
  timezone VARCHAR(50) DEFAULT 'UTC',
  
  -- Promotion status
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  auto_apply BOOLEAN DEFAULT false, -- Apply without code for eligible users
  
  -- Marketing information
  marketing_message TEXT,
  terms_and_conditions TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_promotion_dates CHECK (valid_until > valid_from),
  CONSTRAINT valid_discount_percentage CHECK (
    discount_percentage IS NULL OR (discount_percentage >= 0 AND discount_percentage <= 100)
  )
);
```

### marketplace_promotion_usage
Track individual promotion usage instances.

```sql
CREATE TABLE marketplace_promotion_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promotion_id UUID NOT NULL REFERENCES marketplace_promotions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  purchase_id UUID REFERENCES marketplace_purchases(id),
  
  -- Usage details
  discount_applied NUMERIC(10,2) NOT NULL,
  original_amount NUMERIC(10,2) NOT NULL,
  final_amount NUMERIC(10,2) NOT NULL,
  
  -- Usage metadata
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Analytics and Insights Tables

### marketplace_product_analytics
Daily aggregated product performance metrics.

```sql
CREATE TABLE marketplace_product_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES marketplace_products(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- View metrics
  page_views INTEGER DEFAULT 0,
  unique_viewers INTEGER DEFAULT 0,
  preview_views INTEGER DEFAULT 0,
  detail_page_views INTEGER DEFAULT 0,
  
  -- Engagement metrics
  likes INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  wishlist_adds INTEGER DEFAULT 0,
  cart_adds INTEGER DEFAULT 0,
  
  -- Conversion metrics
  purchase_conversions INTEGER DEFAULT 0,
  conversion_rate NUMERIC(5,4), -- purchases / unique_viewers
  revenue NUMERIC(12,2) DEFAULT 0,
  
  -- Search and discovery
  search_impressions INTEGER DEFAULT 0,
  search_clicks INTEGER DEFAULT 0,
  recommendation_impressions INTEGER DEFAULT 0,
  recommendation_clicks INTEGER DEFAULT 0,
  
  -- Geographic data
  top_countries JSONB, -- Country code -> view count
  top_regions JSONB, -- Region -> view count
  
  -- Traffic sources
  traffic_sources JSONB, -- Source -> visitor count
  
  -- User segments
  new_user_views INTEGER DEFAULT 0,
  returning_user_views INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(product_id, date)
);
```

**Indexes:**
- `idx_product_analytics_product_date` on `(product_id, date DESC)`
- `idx_product_analytics_date` on `date DESC`
- `idx_product_analytics_revenue` on `revenue DESC`

### marketplace_search_analytics
Search behavior and performance tracking.

```sql
CREATE TABLE marketplace_search_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Search query information
  search_query TEXT NOT NULL,
  normalized_query TEXT, -- Cleaned, lowercased version
  query_hash VARCHAR(64), -- Hash for efficient grouping
  
  -- Search metadata
  user_id UUID REFERENCES users(id),
  session_id VARCHAR(100),
  search_filters JSONB, -- Applied filters during search
  
  -- Results and interaction
  results_count INTEGER DEFAULT 0,
  clicked_products UUID[], -- Products clicked from search results
  purchased_products UUID[], -- Products purchased from search
  
  -- Performance metrics
  search_duration_ms INTEGER, -- Time to return results
  first_click_position INTEGER, -- Position of first clicked result
  
  -- Context and timing
  search_timestamp TIMESTAMPTZ DEFAULT NOW(),
  user_location VARCHAR(100),
  device_type VARCHAR(30), -- mobile, desktop, tablet
  
  -- Search outcome
  result_satisfaction VARCHAR(20), -- satisfied, no_results, refined_search
  subsequent_search_query TEXT, -- If user refined their search
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Performance Optimizations

### Materialized Views for Analytics

```sql
-- Product performance summary
CREATE MATERIALIZED VIEW marketplace_product_performance AS
SELECT 
  p.id,
  p.title,
  p.creator_id,
  p.price,
  p.purchases,
  p.rating,
  p.review_count,
  
  -- Revenue metrics
  COALESCE(SUM(pu.total_amount), 0) as total_revenue,
  COALESCE(SUM(pu.creator_earnings), 0) as creator_earnings,
  
  -- Engagement metrics
  COALESCE(AVG(r.rating), 0) as avg_review_rating,
  COUNT(DISTINCT r.user_id) as unique_reviewers,
  
  -- Recent performance (last 30 days)
  COUNT(CASE WHEN pu.created_at > NOW() - INTERVAL '30 days' THEN 1 END) as recent_purchases,
  SUM(CASE WHEN pu.created_at > NOW() - INTERVAL '30 days' THEN pu.total_amount ELSE 0 END) as recent_revenue

FROM marketplace_products p
LEFT JOIN marketplace_purchases pu ON p.id = pu.product_id AND pu.status = 'completed'
LEFT JOIN marketplace_reviews r ON p.id = r.product_id AND r.status = 'published'
WHERE p.status = 'published'
GROUP BY p.id, p.title, p.creator_id, p.price, p.purchases, p.rating, p.review_count;

-- Refresh daily
CREATE INDEX ON marketplace_product_performance(total_revenue DESC);
CREATE INDEX ON marketplace_product_performance(recent_purchases DESC);
```

### Search Optimization

```sql
-- Full-text search index
CREATE INDEX marketplace_products_search_idx 
ON marketplace_products 
USING GIN(to_tsvector('english', title || ' ' || description || ' ' || array_to_string(tags, ' ')));

-- Search ranking function
CREATE OR REPLACE FUNCTION marketplace_search_rank(
  product_row marketplace_products,
  search_query TEXT
) RETURNS NUMERIC AS $$
BEGIN
  RETURN (
    ts_rank(
      to_tsvector('english', product_row.title || ' ' || product_row.description || ' ' || array_to_string(product_row.tags, ' ')),
      plainto_tsquery('english', search_query)
    ) * 1000 -- Base relevance score
    + (product_row.purchases * 0.1) -- Purchase popularity
    + (product_row.rating * 20) -- Rating influence
    + (CASE WHEN product_row.featured THEN 100 ELSE 0 END) -- Featured boost
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

### Database Partitioning for Scale

```sql
-- Partition analytics tables by month
CREATE TABLE marketplace_product_analytics_2026_01 
PARTITION OF marketplace_product_analytics
FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');

CREATE TABLE marketplace_product_analytics_2026_02
PARTITION OF marketplace_product_analytics  
FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');

-- Automatic partition creation function
CREATE OR REPLACE FUNCTION create_monthly_partition(table_name TEXT, start_date DATE)
RETURNS VOID AS $$
DECLARE
  partition_name TEXT;
  end_date DATE;
BEGIN
  end_date := start_date + INTERVAL '1 month';
  partition_name := table_name || '_' || to_char(start_date, 'YYYY_MM');
  
  EXECUTE format('CREATE TABLE %I PARTITION OF %I FOR VALUES FROM (%L) TO (%L)',
    partition_name, table_name, start_date, end_date);
END;
$$ LANGUAGE plpgsql;
```

## Row Level Security

```sql
-- Users can only access their own purchases and wallet data
ALTER TABLE marketplace_purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY marketplace_purchases_policy ON marketplace_purchases
FOR ALL TO authenticated
USING (user_id = auth.uid());

ALTER TABLE marketplace_wallet_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY wallet_transactions_policy ON marketplace_wallet_transactions
FOR ALL TO authenticated  
USING (user_id = auth.uid());

-- Creators can only manage their own products
ALTER TABLE marketplace_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY products_creator_policy ON marketplace_products
FOR ALL TO authenticated
USING (
  creator_id IN (
    SELECT id FROM marketplace_creators WHERE user_id = auth.uid()
  )
);

-- Public read access to published products
CREATE POLICY products_public_read_policy ON marketplace_products
FOR SELECT TO authenticated
USING (status = 'published' AND visibility = 'public');
```

## Automated Maintenance

### Cleanup and Archival
```sql
-- Archive old search analytics (keep 6 months)
CREATE OR REPLACE FUNCTION archive_old_search_analytics()
RETURNS INTEGER AS $$
DECLARE
  rows_archived INTEGER;
BEGIN
  WITH archived_searches AS (
    DELETE FROM marketplace_search_analytics 
    WHERE search_timestamp < NOW() - INTERVAL '6 months'
    RETURNING *
  )
  INSERT INTO marketplace_search_analytics_archive 
  SELECT * FROM archived_searches;
  
  GET DIAGNOSTICS rows_archived = ROW_COUNT;
  RETURN rows_archived;
END;
$$ LANGUAGE plpgsql;

-- Update product metrics nightly
CREATE OR REPLACE FUNCTION update_product_metrics()
RETURNS VOID AS $$
BEGIN
  UPDATE marketplace_products 
  SET 
    purchases = (
      SELECT COUNT(*) FROM marketplace_purchases 
      WHERE product_id = marketplace_products.id 
      AND status = 'completed'
    ),
    rating = (
      SELECT AVG(rating)::NUMERIC(3,2) FROM marketplace_reviews 
      WHERE product_id = marketplace_products.id 
      AND status = 'published'
    ),
    review_count = (
      SELECT COUNT(*) FROM marketplace_reviews 
      WHERE product_id = marketplace_products.id 
      AND status = 'published'
    );
    
  UPDATE marketplace_creators
  SET 
    total_products = (
      SELECT COUNT(*) FROM marketplace_products 
      WHERE creator_id = marketplace_creators.id 
      AND status = 'published'
    ),
    total_sales = (
      SELECT COUNT(*) FROM marketplace_purchases 
      WHERE creator_id = marketplace_creators.id 
      AND status = 'completed'
    ),
    total_revenue = (
      SELECT COALESCE(SUM(creator_earnings), 0) FROM marketplace_purchases 
      WHERE creator_id = marketplace_creators.id 
      AND status = 'completed'
    );
END;
$$ LANGUAGE plpgsql;
```

### Data Quality Monitoring
```sql
-- Check for data consistency issues
CREATE OR REPLACE FUNCTION marketplace_data_quality_check()
RETURNS TABLE(check_name TEXT, issue_count INTEGER, severity TEXT) AS $$
BEGIN
  -- Orphaned purchases
  RETURN QUERY
  SELECT 
    'Orphaned Purchases'::TEXT,
    COUNT(*)::INTEGER,
    'HIGH'::TEXT
  FROM marketplace_purchases p
  LEFT JOIN marketplace_products pr ON p.product_id = pr.id
  WHERE pr.id IS NULL;
  
  -- Products without creators
  RETURN QUERY
  SELECT 
    'Products Without Creators'::TEXT,
    COUNT(*)::INTEGER, 
    'HIGH'::TEXT
  FROM marketplace_products p
  LEFT JOIN marketplace_creators c ON p.creator_id = c.id
  WHERE c.id IS NULL;
  
  -- Negative wallet balances
  RETURN QUERY
  SELECT 
    'Negative Wallet Balances'::TEXT,
    COUNT(DISTINCT user_id)::INTEGER,
    'CRITICAL'::TEXT
  FROM marketplace_wallet_transactions
  WHERE balance_after < 0;
END;
$$ LANGUAGE plpgsql;
```