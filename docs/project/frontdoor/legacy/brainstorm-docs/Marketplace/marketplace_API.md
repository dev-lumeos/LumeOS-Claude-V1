# Marketplace API Documentation

## Base URL
`http://localhost:5700`

## Architecture Overview

The Marketplace API powers Lumeos's integrated shopping platform, featuring:
- **Product Discovery** - Advanced search, filtering, and recommendation engine
- **Creator Economy** - Tools for coaches and experts to sell products/services
- **Wallet Integration** - Seamless transactions with Lumeos voucher system
- **Intelligent Recommendations** - AI-powered product matching based on user goals
- **B2B & B2C Support** - Both individual consumers and business accounts

## Core Product API

### Products Listing & Discovery

#### `GET /products`
Get paginated list of marketplace products with advanced filtering.

**Query Parameters:**
- `type` (string): Product type (plan, supplement, equipment, course)
- `goal` (string): Fitness goal filter (muscle_gain, weight_loss, endurance)
- `difficulty` (string): beginner, intermediate, advanced
- `min_price` (number): Minimum price filter
- `max_price` (number): Maximum price filter
- `sort` (string): popular, newest, price_asc, price_desc, rating
- `limit` (number): Results per page (default: 20, max: 100)
- `offset` (number): Pagination offset

**Response:**
```json
{
  "ok": true,
  "data": [
    {
      "id": "prod_123",
      "title": "Advanced Muscle Building Plan",
      "description": "12-week comprehensive muscle building program...",
      "type": "plan",
      "price": 89.99,
      "currency": "USD",
      "goals": ["muscle_gain", "strength"],
      "difficulty": "intermediate",
      "rating": 4.8,
      "purchases": 1250,
      "views": 5670,
      "featured": true,
      "tags": ["bodybuilding", "strength", "progressive_overload"],
      "creator_name": "Dr. Mike Thompson",
      "creator_verified": true,
      "creator_avatar": "https://...",
      "created_at": "2026-03-01T00:00:00Z",
      "updated_at": "2026-03-20T00:00:00Z"
    }
  ]
}
```

#### `GET /products/featured`
Get featured products (maximum 6 products).

**Response:**
```json
{
  "ok": true,
  "data": [
    {
      "id": "prod_456",
      "title": "Complete Nutrition Guide",
      "featured": true,
      "creator_verified": true,
      "purchases": 2100
    }
  ]
}
```

#### `GET /products/trending`
Get trending products based on algorithmic score.

**Algorithm:** `(purchases * 10) + (review_count * 5) + (new_bonus * 50)`

**Response:**
```json
{
  "ok": true,
  "data": [
    {
      "id": "prod_789",
      "title": "Quick Home Workouts",
      "trending_score": 3250,
      "creator_name": "Sarah Fitness",
      "purchases": 180,
      "review_count": 45,
      "created_at": "2026-03-18T00:00:00Z"
    }
  ]
}
```

### Product Search & Discovery

#### `GET /products/search`
Advanced product search with text and goal filtering.

**Query Parameters:**
- `q` (string): Search query (searches title, description, tags)
- `goal` (string): Additional goal filter
- Uses ILIKE for case-insensitive partial matching

**Response:**
```json
{
  "ok": true,
  "data": [
    {
      "id": "prod_321",
      "title": "Protein Optimization Guide",
      "description": "Master protein timing and selection...",
      "tags": ["protein", "nutrition", "muscle_gain"],
      "goals": ["muscle_gain"],
      "creator_name": "Nutrition Pro"
    }
  ]
}
```

#### `GET /products/:id/similar`
Get similar products based on shared goals.

**Algorithm:** Products with overlapping goals, ranked by purchase count

**Response:**
```json
{
  "ok": true,
  "data": [
    {
      "id": "prod_654",
      "title": "Related Muscle Building Program",
      "goals": ["muscle_gain", "strength"],
      "purchases": 890
    }
  ]
}
```

### Individual Product Details

#### `GET /products/:id`
Get detailed product information including reviews.

**Response:**
```json
{
  "ok": true,
  "data": {
    "id": "prod_123",
    "title": "Advanced Muscle Building Plan",
    "description": "Detailed program description...",
    "content": "Full program content...",
    "price": 89.99,
    "goals": ["muscle_gain"],
    "difficulty": "intermediate",
    "creator_name": "Dr. Mike Thompson",
    "creator_verified": true,
    "creator_bio": "20+ years experience in strength training",
    "creator_rating": 4.9,
    "reviews": [
      {
        "id": "rev_001",
        "user_id": "user_456",
        "rating": 5,
        "comment": "Excellent program with clear instructions",
        "created_at": "2026-03-20T00:00:00Z"
      }
    ],
    "avg_rating": 4.85,
    "total_reviews": 127,
    "views": 5671
  }
}
```

**Side Effects:** Increments view counter by 1

## Creator Management API

### Creator Discovery

#### `GET /creators`
Get list of marketplace creators with filtering.

**Query Parameters:**
- `verified_only` (boolean): Show only verified creators
- `specialty` (string): Creator specialty area
- `min_rating` (number): Minimum creator rating
- `sort` (string): rating, followers, products, newest

**Response:**
```json
{
  "ok": true,
  "data": [
    {
      "id": "creator_123",
      "display_name": "Dr. Mike Thompson",
      "bio": "Certified strength coach with 20+ years experience",
      "avatar_url": "https://...",
      "verified": true,
      "rating": 4.9,
      "total_products": 12,
      "total_sales": 15600,
      "follower_count": 8500,
      "specialties": ["strength", "bodybuilding", "powerlifting"],
      "joined_date": "2025-08-15T00:00:00Z"
    }
  ]
}
```

#### `GET /creators/:id`
Get detailed creator profile with product portfolio.

**Response:**
```json
{
  "ok": true,
  "data": {
    "id": "creator_123",
    "display_name": "Dr. Mike Thompson",
    "bio": "Comprehensive bio...",
    "credentials": ["PhD Exercise Science", "NSCA-CPT"],
    "social_links": {
      "instagram": "@drmikethompson",
      "youtube": "MikeThompsonFitness"
    },
    "products": [
      {
        "id": "prod_123",
        "title": "Muscle Building Plan",
        "price": 89.99,
        "purchases": 1250
      }
    ],
    "stats": {
      "total_revenue": 125000,
      "avg_rating": 4.9,
      "response_time_hours": 2.5
    }
  }
}
```

### Creator Registration & Management

#### `POST /creators/register`
Register as a marketplace creator (authenticated users only).

**Body:**
```json
{
  "display_name": "Your Professional Name",
  "bio": "Professional background and expertise",
  "specialties": ["nutrition", "strength_training"],
  "credentials": ["Certified Nutritionist", "NASM-CPT"],
  "social_links": {
    "instagram": "@yourhandle",
    "website": "https://yoursite.com"
  },
  "business_info": {
    "tax_id": "123456789",
    "business_name": "Your Business LLC",
    "contact_email": "business@example.com"
  }
}
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "creator_id": "creator_789",
    "status": "pending_review",
    "estimated_review_time": "3-5 business days",
    "next_steps": [
      "Submit verification documents",
      "Complete tax information",
      "Await approval"
    ]
  }
}
```

## Purchase & Transaction API

### Purchase Process

#### `POST /purchases`
Initiate product purchase using Lumeos wallet.

**Body:**
```json
{
  "product_id": "prod_123",
  "payment_method": "lumeos_wallet",
  "apply_discount_code": "NEWUSER10"
}
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "purchase_id": "pur_456",
    "product_id": "prod_123",
    "amount_charged": 80.99,
    "discount_applied": 9.00,
    "wallet_balance_remaining": 419.01,
    "access_granted": true,
    "download_links": [
      "https://secure.lumeos.app/downloads/prod_123_main.pdf"
    ],
    "access_expires": null,
    "transaction_id": "tx_789"
  }
}
```

#### `GET /purchases/my`
Get user's purchase history.

**Query Parameters:**
- `status` (string): completed, pending, refunded
- `type` (string): Product type filter
- `limit` (number): Results per page
- `offset` (number): Pagination

**Response:**
```json
{
  "ok": true,
  "data": [
    {
      "purchase_id": "pur_456",
      "product": {
        "id": "prod_123",
        "title": "Advanced Muscle Building Plan",
        "creator_name": "Dr. Mike Thompson"
      },
      "amount_paid": 80.99,
      "purchased_at": "2026-03-20T10:30:00Z",
      "status": "completed",
      "access_status": "active",
      "download_count": 2,
      "last_accessed": "2026-03-22T14:15:00Z"
    }
  ],
  "pagination": {
    "total": 5,
    "limit": 20,
    "offset": 0,
    "has_more": false
  }
}
```

#### `GET /purchases/:id/access`
Get access details and download links for purchased product.

**Response:**
```json
{
  "ok": true,
  "data": {
    "purchase_id": "pur_456",
    "access_status": "active",
    "download_links": [
      {
        "type": "pdf",
        "title": "Main Program Guide",
        "url": "https://secure.lumeos.app/downloads/...",
        "expires_at": "2026-03-27T10:30:00Z"
      }
    ],
    "streaming_content": [
      {
        "type": "video",
        "title": "Week 1 Training Demo",
        "stream_url": "https://stream.lumeos.app/..."
      }
    ],
    "access_expires": null,
    "download_limit": 5,
    "downloads_used": 2
  }
}
```

### Wallet Integration

#### `GET /wallet`
Get user's marketplace wallet status and transaction history.

**Response:**
```json
{
  "ok": true,
  "data": {
    "wallet_id": "wallet_123",
    "balance": 500.00,
    "currency": "USD",
    "wallet_type": "lumeos_voucher",
    "last_top_up": "2026-03-15T00:00:00Z",
    "pending_transactions": [
      {
        "transaction_id": "tx_pending_001",
        "type": "purchase",
        "amount": -89.99,
        "description": "Pending: Advanced Nutrition Course",
        "estimated_completion": "2026-03-25T12:00:00Z"
      }
    ],
    "recent_transactions": [
      {
        "transaction_id": "tx_789",
        "type": "purchase",
        "amount": -80.99,
        "description": "Advanced Muscle Building Plan",
        "timestamp": "2026-03-20T10:30:00Z",
        "status": "completed"
      },
      {
        "transaction_id": "tx_788",
        "type": "top_up",
        "amount": 200.00,
        "description": "Monthly subscription voucher",
        "timestamp": "2026-03-15T00:00:00Z",
        "status": "completed"
      }
    ]
  }
}
```

#### `POST /wallet/activate`
Activate wallet for marketplace purchases (first-time setup).

**Body:**
```json
{
  "terms_accepted": true,
  "marketing_consent": false,
  "preferred_currency": "USD"
}
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "wallet_id": "wallet_456",
    "status": "active",
    "initial_balance": 0.00,
    "welcome_bonus": 25.00,
    "total_balance": 25.00
  }
}
```

## Review & Rating System

### Product Reviews

#### `POST /products/:id/reviews`
Submit review for purchased product.

**Body:**
```json
{
  "rating": 5,
  "title": "Excellent program!",
  "comment": "Clear instructions and great results after 8 weeks",
  "recommend": true,
  "verified_purchase": true
}
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "review_id": "rev_123",
    "status": "published",
    "contributed_to_creator_rating": true
  }
}
```

#### `GET /products/:id/reviews`
Get paginated reviews for a product.

**Query Parameters:**
- `sort` (string): newest, oldest, rating_high, rating_low, helpful
- `rating_filter` (number): Filter by specific rating (1-5)
- `verified_only` (boolean): Show only verified purchase reviews

**Response:**
```json
{
  "ok": true,
  "data": {
    "reviews": [
      {
        "id": "rev_123",
        "user_id": "user_456",
        "user_name": "Anonymous User",
        "rating": 5,
        "title": "Excellent program!",
        "comment": "Clear instructions...",
        "recommend": true,
        "verified_purchase": true,
        "helpful_votes": 12,
        "created_at": "2026-03-20T00:00:00Z"
      }
    ],
    "summary": {
      "avg_rating": 4.8,
      "total_reviews": 127,
      "rating_distribution": {
        "5": 89,
        "4": 25,
        "3": 8,
        "2": 3,
        "1": 2
      }
    }
  }
}
```

### Creator Reviews

#### `POST /creators/:id/reviews`
Review a creator (must have purchased from them).

**Body:**
```json
{
  "rating": 5,
  "comment": "Very knowledgeable and responsive to questions",
  "categories": {
    "expertise": 5,
    "communication": 5,
    "value": 4,
    "support": 5
  }
}
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "review_id": "creator_rev_456",
    "impact_on_creator_rating": 0.02
  }
}
```

## Categories & Tags System

### Product Categories

#### `GET /categories`
Get hierarchical product categories.

**Response:**
```json
{
  "ok": true,
  "data": [
    {
      "id": "training",
      "name": "Training Programs",
      "description": "Workout plans and training systems",
      "subcategories": [
        {
          "id": "strength",
          "name": "Strength Training",
          "product_count": 245
        },
        {
          "id": "cardio",
          "name": "Cardio Programs", 
          "product_count": 128
        }
      ]
    },
    {
      "id": "nutrition",
      "name": "Nutrition Plans",
      "subcategories": [
        {
          "id": "meal_plans",
          "name": "Meal Plans",
          "product_count": 156
        }
      ]
    }
  ]
}
```

#### `GET /categories/:id/products`
Get products within a specific category.

**Query Parameters:** Same as `/products` endpoint

### Tags and Search

#### `GET /tags`
Get popular tags with product counts.

**Response:**
```json
{
  "ok": true,
  "data": [
    {
      "tag": "muscle_gain",
      "product_count": 189,
      "trending": true
    },
    {
      "tag": "weight_loss",
      "product_count": 156,
      "trending": false
    }
  ]
}
```

## AI Recommendations API

### Personalized Recommendations

#### `GET /recommendations/for-me`
Get AI-powered product recommendations based on user profile and goals.

**Response:**
```json
{
  "ok": true,
  "data": {
    "personalized_picks": [
      {
        "product": {
          "id": "prod_456",
          "title": "Beginner Strength Program"
        },
        "match_score": 0.92,
        "reasons": [
          "Matches your muscle gain goal",
          "Appropriate for beginner level",
          "Highly rated by similar users"
        ],
        "urgency": "high"
      }
    ],
    "similar_users_bought": [
      {
        "product": {
          "id": "prod_789",
          "title": "Nutrition Fundamentals"
        },
        "purchased_by_similar_users": 68,
        "similarity_score": 0.85
      }
    ],
    "trending_in_goals": [
      {
        "product": {
          "id": "prod_321", 
          "title": "Quick HIIT Workouts"
        },
        "goal": "weight_loss",
        "trend_velocity": 2.3
      }
    ]
  }
}
```

#### `GET /recommendations/bundle-suggestions`
Get intelligent product bundle recommendations.

**Query Parameters:**
- `product_id` (string): Base product for bundle suggestions

**Response:**
```json
{
  "ok": true,
  "data": {
    "bundles": [
      {
        "bundle_id": "bundle_123",
        "name": "Complete Muscle Gain Package",
        "products": [
          {
            "id": "prod_123",
            "title": "Training Program",
            "individual_price": 89.99
          },
          {
            "id": "prod_456", 
            "title": "Nutrition Guide",
            "individual_price": 49.99
          }
        ],
        "individual_total": 139.98,
        "bundle_price": 119.99,
        "savings": 19.99,
        "savings_percentage": 14.3,
        "synergy_score": 0.94
      }
    ]
  }
}
```

## Analytics and Insights API

### Creator Analytics (Creator Access Only)

#### `GET /analytics/creator/dashboard`
Get creator performance dashboard data.

**Response:**
```json
{
  "ok": true,
  "data": {
    "period": "last_30_days",
    "revenue": {
      "total": 15650.00,
      "change_vs_previous": 23.5
    },
    "products": {
      "total_sales": 234,
      "top_performing": {
        "id": "prod_123",
        "title": "Advanced Muscle Building",
        "sales": 89,
        "revenue": 7911.00
      }
    },
    "customers": {
      "new_customers": 67,
      "repeat_customers": 23,
      "customer_lifetime_value": 127.50
    },
    "ratings": {
      "average_rating": 4.8,
      "new_reviews": 34
    }
  }
}
```

### Marketplace Analytics (Admin Only)

#### `GET /analytics/marketplace/overview`
Get marketplace-wide analytics overview.

**Response:**
```json
{
  "ok": true,
  "data": {
    "total_products": 1567,
    "active_creators": 289,
    "monthly_gmv": 245600.00,
    "top_categories": [
      {
        "category": "training_programs", 
        "sales": 456,
        "revenue": 98750.00
      }
    ],
    "conversion_metrics": {
      "browse_to_view": 0.23,
      "view_to_purchase": 0.087,
      "overall_conversion": 0.02
    }
  }
}
```

## Error Handling

### Standard Error Format
```json
{
  "ok": false,
  "error": "Product not found",
  "code": "PRODUCT_NOT_FOUND",
  "details": {
    "product_id": "prod_123",
    "suggested_action": "Check product ID or browse available products"
  }
}
```

### Error Codes
- `PRODUCT_NOT_FOUND`: Requested product does not exist
- `INSUFFICIENT_WALLET_BALANCE`: Not enough funds in wallet
- `PURCHASE_ALREADY_EXISTS`: User already owns this product
- `CREATOR_NOT_VERIFIED`: Creator account not yet verified
- `REVIEW_ALREADY_SUBMITTED`: User already reviewed this product
- `ACCESS_DENIED`: Insufficient permissions for operation

## Authentication & Authorization
All endpoints require JWT authentication:
```
Authorization: Bearer <jwt-token>
```

### Permission Levels
- **Consumer**: Browse, purchase, review
- **Creator**: All consumer permissions + creator analytics, product management
- **Admin**: All permissions + marketplace analytics, user management

## Rate Limiting
- **Browse/Search**: 60 requests per minute
- **Purchase operations**: 10 requests per minute  
- **Review submissions**: 5 requests per minute
- **Analytics**: 30 requests per minute

## Integration Points
- **Goals Module**: Recommendation targeting based on user goals
- **Nutrition/Training Modules**: Cross-sell relevant products
- **Coach Module**: AI coach can recommend marketplace products
- **Human Coach Module**: Coaches can recommend products to clients
- **Wallet System**: Integrated payment processing with voucher system