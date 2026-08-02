# Marketplace Module Migration Documentation

## Migration Overview

The Marketplace module represents Lumeos's evolution from a fitness tracking platform to a comprehensive health commerce ecosystem. This migration establishes the foundation for the voucher-based economy and creator monetization platform.

## Business Model Evolution

### From Subscription to Voucher Economy
```
Legacy Model → Lumeos Voucher Economy
├── Monthly Subscription → Voucher Credits System
├── Direct Payments → Wallet-Based Transactions
├── External Links → Integrated Commerce
├── Generic Products → Health-Focused Marketplace
└── No Creator Economy → Full Creator Platform
```

### Revenue Stream Transformation
```typescript
// Legacy revenue model
interface LegacyRevenue {
  subscriptionFees: number;        // Monthly recurring revenue
  advertisingRevenue: number;      // External ad placements
  affiliateCommissions: number;    // Third-party product referrals
}

// New marketplace revenue model  
interface MarketplaceRevenue {
  transactionFees: number;         // % of every marketplace transaction
  voucherTopUps: number;           // Additional wallet funding
  creatorSubscriptions: number;    // Creator platform fees
  premiumListings: number;         // Featured product placement
  internationalFees: number;      // Currency conversion margins
  dataInsights: number;            // Analytics and insights products
}
```

## Database Migration Architecture

### Core Marketplace Schema Setup
```sql
-- Migration: 001_marketplace_foundation.sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories and taxonomy
CREATE TABLE marketplace_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES marketplace_categories(id),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(120) UNIQUE NOT NULL,
  description TEXT,
  level INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Creator profiles
CREATE TABLE marketplace_creators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  display_name VARCHAR(100) NOT NULL,
  slug VARCHAR(120) UNIQUE NOT NULL,
  bio TEXT,
  verification_status VARCHAR(20) DEFAULT 'pending',
  commission_rate NUMERIC(5,4) DEFAULT 0.7000,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products catalog
CREATE TABLE marketplace_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES marketplace_creators(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(250) UNIQUE NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(20) DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_marketplace_products_status ON marketplace_products(status);
CREATE INDEX idx_marketplace_products_creator ON marketplace_products(creator_id);
```

### Transaction and Wallet System
```sql
-- Migration: 002_wallet_system.sql

-- Wallet transactions for voucher economy
CREATE TABLE marketplace_wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  transaction_type VARCHAR(30) NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  balance_before NUMERIC(12,2) NOT NULL,
  balance_after NUMERIC(12,2) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_balance_calculation CHECK (
    balance_after = balance_before + amount
  )
);

-- Purchase records with creator revenue sharing
CREATE TABLE marketplace_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES marketplace_products(id) ON DELETE RESTRICT,
  creator_id UUID NOT NULL REFERENCES marketplace_creators(id) ON DELETE RESTRICT,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  total_amount NUMERIC(10,2) NOT NULL,
  creator_earnings NUMERIC(10,2),
  platform_fee NUMERIC(10,2),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_marketplace_purchases_user ON marketplace_purchases(user_id);
CREATE INDEX idx_marketplace_purchases_creator ON marketplace_purchases(creator_id);
```

### Review and Rating Enhancement
```sql
-- Migration: 003_enhanced_reviews.sql

-- Comprehensive review system
CREATE TABLE marketplace_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES marketplace_products(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES marketplace_creators(id) ON DELETE CASCADE,
  purchase_id UUID REFERENCES marketplace_purchases(id) ON DELETE SET NULL,
  
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(200),
  comment TEXT,
  verified_purchase BOOLEAN DEFAULT false,
  
  -- Detailed ratings
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
  value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
  
  status VARCHAR(20) DEFAULT 'published',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure review targets either product or creator, not both
  CONSTRAINT review_target_check CHECK (
    (product_id IS NOT NULL AND creator_id IS NULL) OR 
    (product_id IS NULL AND creator_id IS NOT NULL)
  )
);

CREATE INDEX idx_marketplace_reviews_product ON marketplace_reviews(product_id);
CREATE INDEX idx_marketplace_reviews_creator ON marketplace_reviews(creator_id);
```

### Analytics and Performance Tracking
```sql
-- Migration: 004_analytics_foundation.sql

-- Daily product performance metrics
CREATE TABLE marketplace_product_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES marketplace_products(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  page_views INTEGER DEFAULT 0,
  unique_viewers INTEGER DEFAULT 0,
  purchase_conversions INTEGER DEFAULT 0,
  revenue NUMERIC(12,2) DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(product_id, date)
);

-- Search analytics for optimization
CREATE TABLE marketplace_search_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  search_query TEXT NOT NULL,
  user_id UUID REFERENCES users(id),
  results_count INTEGER DEFAULT 0,
  clicked_products UUID[],
  search_timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_product_analytics_date ON marketplace_product_analytics(date DESC);
CREATE INDEX idx_search_analytics_query ON marketplace_search_analytics(search_query);
```

## Legacy Data Migration Procedures

### User Account Migration to Creator Profiles
```sql
-- Migrate existing fitness professionals to creator accounts
INSERT INTO marketplace_creators (
  user_id, display_name, slug, bio, verification_status, commission_rate
)
SELECT 
  u.id,
  COALESCE(up.first_name || ' ' || up.last_name, u.email) as display_name,
  LOWER(REGEXP_REPLACE(
    COALESCE(up.first_name || '-' || up.last_name, SPLIT_PART(u.email, '@', 1)), 
    '[^a-zA-Z0-9-]', '', 'g'
  )) as slug,
  up.bio,
  CASE 
    WHEN up.is_coach = true THEN 'verified'
    ELSE 'pending'
  END as verification_status,
  0.7000 as commission_rate
FROM users u
LEFT JOIN user_profiles up ON u.id = up.user_id
WHERE up.is_coach = true OR up.trainer_certification IS NOT NULL;
```

### Category Bootstrap from Existing Data
```sql
-- Create initial marketplace categories based on existing goals and preferences
INSERT INTO marketplace_categories (name, slug, description, level) VALUES
('Training Programs', 'training-programs', 'Workout routines and fitness plans', 0),
('Nutrition Plans', 'nutrition-plans', 'Meal plans and dietary guidance', 0),
('Supplements', 'supplements', 'Nutritional supplements and vitamins', 0),
('Equipment & Gear', 'equipment-gear', 'Fitness equipment and accessories', 0),
('Consultations', 'consultations', 'One-on-one coaching sessions', 0),
('Courses & Education', 'courses-education', 'Educational content and certifications', 0);

-- Create subcategories
INSERT INTO marketplace_categories (parent_id, name, slug, description, level) 
SELECT 
  c.id,
  subcategory_name,
  LOWER(REGEXP_REPLACE(subcategory_name, '[^a-zA-Z0-9-]', '-', 'g')),
  subcategory_description,
  1
FROM marketplace_categories c,
LATERAL (
  VALUES 
    ('Strength Training', 'Weight lifting and resistance programs'),
    ('Cardio Programs', 'Cardiovascular fitness routines'),
    ('Flexibility & Mobility', 'Stretching and mobility work'),
    ('Sports-Specific', 'Training for specific sports')
) AS sub(subcategory_name, subcategory_description)
WHERE c.slug = 'training-programs';
```

### Wallet System Bootstrap
```sql
-- Initialize wallets for existing users with welcome bonus
INSERT INTO marketplace_wallet_transactions (
  user_id, transaction_type, amount, balance_before, balance_after, description
)
SELECT 
  u.id,
  'welcome_bonus',
  25.00,
  0.00,
  25.00,
  'Welcome to Lumeos Marketplace - $25 credit'
FROM users u
WHERE u.created_at < NOW() - INTERVAL '1 month'; -- Existing users only
```

## API Migration and Compatibility

### Legacy API Endpoint Mapping
```
Legacy External Links → New Marketplace APIs
├── /api/external/products → /api/marketplace/products
├── /api/affiliates/links → /api/marketplace/products (with creator attribution)
├── /api/recommendations → /api/marketplace/recommendations
├── /api/purchases (external) → /api/marketplace/purchases
└── /api/reviews (external) → /api/marketplace/reviews
```

### API Response Format Evolution
```json
// Legacy external product format
{
  "product_id": "ext_123",
  "name": "Protein Powder",
  "price": "$29.99",
  "affiliate_link": "https://external-store.com/...",
  "commission": "5%"
}

// New marketplace format
{
  "ok": true,
  "data": {
    "id": "prod_123",
    "title": "Premium Protein Powder",
    "price": 29.99,
    "currency": "USD",
    "creator": {
      "id": "creator_456",
      "name": "Nutrition Expert",
      "verified": true
    },
    "purchase_url": "/api/marketplace/purchases",
    "can_purchase_with_vouchers": true,
    "voucher_price": 29.99
  }
}
```

### Authentication Enhancement
```typescript
// Legacy simple authentication
interface LegacyAuth {
  apiKey: string;
  userId: string;
}

// New marketplace authentication
interface MarketplaceAuth {
  jwtToken: string;
  permissions: {
    canBrowse: boolean;
    canPurchase: boolean;
    canCreateProducts: boolean;
    canAccessAnalytics: boolean;
  };
  walletAccess: boolean;
  creatorStatus: 'none' | 'pending' | 'verified';
}
```

## Frontend Component Migration

### Component Architecture Evolution
```typescript
// Legacy external product components
interface LegacyProductComponents {
  ProductList: ComponentType<{products: ExternalProduct[]}>;
  AffiliateButton: ComponentType<{affiliateUrl: string}>;
  ExternalLink: ComponentType<{href: string}>;
}

// New marketplace components
interface MarketplaceComponents {
  ProductCard: ComponentType<{product: MarketplaceProduct}>;
  PurchaseButton: ComponentType<{productId: string}>;
  CreatorProfile: ComponentType<{creatorId: string}>;
  WalletBalance: ComponentType<{}>;
  ReviewSystem: ComponentType<{productId: string}>;
  RecommendationEngine: ComponentType<{userId: string}>;
}
```

### State Management Migration
```typescript
// Legacy external product state
interface LegacyState {
  externalProducts: ExternalProduct[];
  affiliateLinks: AffiliateLink[];
  clickTracking: ClickTrackingData;
}

// New marketplace state
interface MarketplaceState {
  // Product catalog
  products: MarketplaceProduct[];
  categories: Category[];
  searchResults: SearchResult[];
  
  // User commerce
  wallet: WalletData;
  purchases: Purchase[];
  cart: CartItem[];
  
  // Creator economy
  creatorProfile: CreatorProfile | null;
  creatorProducts: CreatorProduct[];
  earnings: EarningsData;
  
  // Social features
  reviews: Review[];
  recommendations: Recommendation[];
  wishlist: WishlistItem[];
}
```

## Configuration and Environment Migration

### Environment Variable Evolution
```bash
# Legacy external integration
AFFILIATE_TRACKING_ENABLED=true
EXTERNAL_PRODUCT_API_KEY=legacy_key_123
COMMISSION_TRACKING_URL=https://external-tracker.com

# New marketplace configuration
MARKETPLACE_ENABLED=true
MARKETPLACE_API_PORT=5700
STRIPE_SECRET_KEY=sk_live_...
CREATOR_COMMISSION_RATE=0.70
VOUCHER_SYSTEM_ENABLED=true
WALLET_CURRENCY=USD
MARKETPLACE_ANALYTICS_ENABLED=true
```

### Feature Flag Migration
```typescript
// Legacy feature flags
interface LegacyFeatures {
  externalProducts: boolean;
  affiliateTracking: boolean;
  commissionReporting: boolean;
}

// New marketplace feature flags
interface MarketplaceFeatures {
  // Core marketplace
  productCatalog: boolean;
  purchaseSystem: boolean;
  walletIntegration: boolean;
  
  // Creator economy
  creatorOnboarding: boolean;
  creatorAnalytics: boolean;
  revenueSharing: boolean;
  
  // Advanced features
  aiRecommendations: boolean;
  reviewSystem: boolean;
  internationalCommerce: boolean;
  mobilePayments: boolean;
  
  // Experimental
  voiceSearch: boolean;
  arProductViews: boolean;
  blockchainPayments: boolean;
}
```

## Testing Migration Strategy

### Legacy Integration Test Updates
```typescript
// Legacy external product tests
describe('Legacy External Products', () => {
  it('should redirect to affiliate links', () => {
    // Test external URL redirection
  });
  
  it('should track commission clicks', () => {
    // Test affiliate click tracking
  });
});

// New marketplace comprehensive tests
describe('Marketplace Integration', () => {
  it('should complete end-to-end purchase flow', async () => {
    const user = await createTestUser();
    const creator = await createTestCreator();
    const product = await createTestProduct(creator.id);
    
    // Test wallet funding
    await fundWallet(user.id, 100.00);
    
    // Test product purchase
    const purchase = await purchaseProduct(user.id, product.id);
    expect(purchase.status).toBe('completed');
    
    // Test creator earnings
    const earnings = await getCreatorEarnings(creator.id);
    expect(earnings.total).toBeGreaterThan(0);
    
    // Test product access
    const access = await getProductAccess(user.id, product.id);
    expect(access.canDownload).toBe(true);
  });
  
  it('should handle wallet insufficient funds', async () => {
    const user = await createTestUser();
    const product = await createTestProduct();
    
    await expect(
      purchaseProduct(user.id, product.id)
    ).rejects.toThrow('Insufficient wallet balance');
  });
});
```

### Performance Test Migration
```typescript
// Legacy performance tests
describe('Legacy Performance', () => {
  it('should load external products under 2s', () => {
    // Test external API response time
  });
});

// New marketplace performance tests
describe('Marketplace Performance', () => {
  it('should handle 1000 concurrent product searches', async () => {
    const searchPromises = Array.from({length: 1000}, () => 
      searchProducts('protein powder')
    );
    
    const startTime = Date.now();
    await Promise.all(searchPromises);
    const duration = Date.now() - startTime;
    
    expect(duration).toBeLessThan(5000); // 5 second limit
  });
  
  it('should process 100 simultaneous purchases', async () => {
    const purchasePromises = Array.from({length: 100}, () =>
      createTestPurchase()
    );
    
    const results = await Promise.allSettled(purchasePromises);
    const successful = results.filter(r => r.status === 'fulfilled');
    
    expect(successful.length).toBe(100);
  });
});
```

## Migration Rollback Procedures

### Database Rollback Strategy
```sql
-- Create backup tables before migration
CREATE TABLE marketplace_products_backup AS 
SELECT * FROM marketplace_products;

CREATE TABLE marketplace_purchases_backup AS 
SELECT * FROM marketplace_purchases;

-- Rollback procedure
CREATE OR REPLACE FUNCTION rollback_marketplace_migration()
RETURNS VOID AS $$
BEGIN
  -- Disable marketplace features
  UPDATE system_config SET value = 'false' 
  WHERE key = 'marketplace_enabled';
  
  -- Archive marketplace data
  INSERT INTO marketplace_data_archive 
  SELECT * FROM marketplace_products;
  
  INSERT INTO marketplace_data_archive 
  SELECT * FROM marketplace_purchases;
  
  -- Restore external product links
  UPDATE user_preferences 
  SET external_products_enabled = true
  WHERE external_products_enabled = false;
  
  RAISE NOTICE 'Marketplace migration rolled back successfully';
END;
$$ LANGUAGE plpgsql;
```

### API Rollback Configuration
```typescript
// Feature flag based rollback
if (config.MARKETPLACE_ROLLBACK_MODE) {
  app.use('/api/marketplace', (req, res) => {
    res.status(503).json({
      ok: false,
      error: 'Marketplace temporarily unavailable',
      fallback_url: '/api/external-products',
      estimated_restoration: '2026-03-26T00:00:00Z'
    });
  });
  
  // Re-enable legacy external product routes
  app.use('/api/external-products', legacyExternalProductRouter);
}
```

## Post-Migration Validation

### Data Integrity Checks
```sql
-- Validate creator-product relationships
SELECT 
  COUNT(*) as orphaned_products
FROM marketplace_products p
LEFT JOIN marketplace_creators c ON p.creator_id = c.id
WHERE c.id IS NULL;

-- Validate purchase-wallet transaction integrity
SELECT 
  p.id,
  p.total_amount,
  wt.amount
FROM marketplace_purchases p
LEFT JOIN marketplace_wallet_transactions wt ON p.id::text = wt.reference_id
WHERE wt.id IS NULL AND p.status = 'completed';

-- Validate creator earnings calculations
SELECT 
  c.id,
  c.total_revenue,
  COALESCE(SUM(p.creator_earnings), 0) as calculated_earnings,
  c.total_revenue - COALESCE(SUM(p.creator_earnings), 0) as discrepancy
FROM marketplace_creators c
LEFT JOIN marketplace_purchases p ON c.id = p.creator_id
GROUP BY c.id, c.total_revenue
HAVING c.total_revenue != COALESCE(SUM(p.creator_earnings), 0);
```

### Performance Validation
```typescript
// Monitor key marketplace metrics
interface MarketplaceMigrationMetrics {
  productCatalogSize: number;
  activeCreators: number;
  dailyTransactionVolume: number;
  averagePageLoadTime: number;
  searchResponseTime: number;
  purchaseSuccessRate: number;
  walletTransactionAccuracy: number;
}

async function validateMigrationPerformance(): Promise<MarketplaceMigrationMetrics> {
  const metrics = await Promise.all([
    countProducts(),
    countActiveCreators(),
    getDailyTransactionVolume(),
    measurePageLoadTime(),
    measureSearchPerformance(),
    calculatePurchaseSuccessRate(),
    validateWalletAccuracy()
  ]);
  
  return {
    productCatalogSize: metrics[0],
    activeCreators: metrics[1], 
    dailyTransactionVolume: metrics[2],
    averagePageLoadTime: metrics[3],
    searchResponseTime: metrics[4],
    purchaseSuccessRate: metrics[5],
    walletTransactionAccuracy: metrics[6]
  };
}
```

### User Experience Validation
```typescript
// Automated UX testing post-migration
describe('Post-Migration UX Validation', () => {
  it('should maintain search functionality', async () => {
    const searchResults = await searchProducts('protein');
    expect(searchResults.length).toBeGreaterThan(0);
    expect(searchResults[0].relevanceScore).toBeGreaterThan(0.7);
  });
  
  it('should preserve user purchase history', async () => {
    const legacyPurchases = await getLegacyPurchases(testUserId);
    const migratedPurchases = await getMarketplacePurchases(testUserId);
    
    expect(migratedPurchases.length).toBeGreaterThanOrEqual(
      legacyPurchases.length
    );
  });
  
  it('should maintain creator earnings accuracy', async () => {
    const creatorEarnings = await getCreatorEarnings(testCreatorId);
    expect(creatorEarnings.accuracy).toBeGreaterThanOrEqual(0.999);
  });
});
```

## Migration Success Metrics

### Key Performance Indicators
```typescript
interface MigrationSuccessMetrics {
  technical: {
    zeroDataLoss: boolean;
    uptimePercent: number;
    performanceImprovement: number;
    errorRate: number;
  };
  
  business: {
    userRetentionRate: number;
    creatorAdoptionRate: number;
    transactionVolumeGrowth: number;
    revenueIncrease: number;
  };
  
  user: {
    satisfactionScore: number;
    supportTicketReduction: number;
    featureUsageIncrease: number;
    conversionRateImprovement: number;
  };
}
```

### Success Criteria Definition
- **Zero Data Loss**: All existing user and transaction data preserved
- **Performance Improvement**: 50% faster product discovery
- **Creator Adoption**: 80% of eligible users become creators within 3 months
- **Revenue Growth**: 200% increase in commerce-related revenue within 6 months
- **User Satisfaction**: 4.5+ average rating for marketplace experience

## Lessons Learned and Best Practices

### Technical Insights
1. **Gradual Rollout**: Phased migration reduces risk and allows for real-time adjustments
2. **Data Validation**: Continuous integrity checks prevent corruption during migration
3. **Performance Monitoring**: Real-time metrics enable quick issue identification
4. **Rollback Readiness**: Comprehensive rollback procedures essential for safety

### Business Insights
1. **Creator Education**: Extensive creator onboarding crucial for platform success
2. **User Communication**: Clear communication about changes maintains trust
3. **Incentive Alignment**: Initial bonuses and promotions drive adoption
4. **Feedback Integration**: User feedback loops enable rapid improvement

### Migration Timeline
- **Phase 1** (Week 1-2): Database schema migration and core infrastructure
- **Phase 2** (Week 3-4): API migration and backend service integration
- **Phase 3** (Week 5-6): Frontend component migration and user interface
- **Phase 4** (Week 7-8): Creator onboarding and content migration
- **Phase 5** (Week 9-10): Performance optimization and user acceptance testing
- **Phase 6** (Week 11-12): Full rollout and legacy system decommissioning