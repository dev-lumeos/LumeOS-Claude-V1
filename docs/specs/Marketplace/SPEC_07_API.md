# Marketplace Module — API Specification (Spec)
> Spec Phase 7 | Alle Endpoints mit Request/Response

---

## Übersicht

**Base URL:** `http://marketplace:5700`
**Auth:** JWT via `Authorization: Bearer <token>`
**Format:** `{ ok: boolean, data?: T, error?: string }`

---

## 1. Products

### `GET /api/marketplace/products`
**Query:** `q`, `type`, `category`, `goal`, `difficulty`, `min_price`, `max_price`, `min_rating`, `sort=score|price|rating|newest|popular`, `limit=20`, `offset=0`

```json
{
  "products": [...],
  "total": 142,
  "filters_applied": { "goal": "muscle_gain", "difficulty": "intermediate" }
}
```

### `GET /api/marketplace/products/:id`
```json
{
  "id": "uuid",
  "product_type": "bundle",
  "title": "12-Week Lean Bulk Bundle",
  "description": "...",
  "price_cents": 4900,
  "compare_price_cents": 7700,
  "pricing_model": "one_time",
  "avg_rating": 4.8,
  "review_count": 234,
  "purchase_count": 1847,
  "difficulty": "intermediate",
  "duration_weeks": 12,
  "goal_alignments": ["muscle_gain", "strength"],
  "equipment_required": ["barbell", "dumbbell"],
  "creator": {
    "id": "uuid",
    "display_name": "Coach Alex",
    "verification_level": "verified",
    "avg_product_rating": 4.7
  },
  "bundle_components": [...],
  "user_has_license": false,
  "is_promoted": true
}
```

### `GET /api/marketplace/products/:id/similar`
`?limit=5`

### `GET /api/marketplace/recommendations`
`?context=home|supplement_gap|goal_phase|after_purchase&limit=5`

```json
{
  "sections": [
    {
      "id": "goal_based",
      "title": "Für dein Lean Bulk Goal",
      "context": "goal_phase",
      "products": [...]
    },
    {
      "id": "trending",
      "title": "Trending diese Woche",
      "products": [...]
    },
    {
      "id": "bundles",
      "title": "Cross-Module Bundles",
      "products": [...]
    }
  ]
}
```

---

## 2. Bundles

### `GET /api/marketplace/products/:id/components`
```json
{
  "bundle_id": "uuid",
  "title": "12-Week Lean Bulk Bundle",
  "components": [
    {
      "id": "uuid",
      "type": "training_program",
      "title": "PPL Hypertrophy",
      "duration_weeks": 12,
      "preview_url": "..."
    },
    {
      "id": "uuid",
      "type": "meal_plan",
      "title": "Lean Bulk Meal Plan 2800 kcal",
      "duration_weeks": 12
    },
    {
      "id": "uuid",
      "type": "supplement_protocol",
      "title": "Beginner Bulk Stack"
    }
  ],
  "individual_total_cents": 7700,
  "bundle_price_cents": 4900,
  "savings_cents": 2800,
  "savings_pct": 36
}
```

---

## 3. Wallet

### `GET /api/marketplace/wallet`
```json
{
  "voucher_balance_cents": 3500,
  "revenue_balance_cents": 15200,
  "currency": "EUR",
  "can_payout": true,
  "auto_topup_enabled": false,
  "total_spent_cents": 18900,
  "total_earned_cents": 63200
}
```

### `GET /api/marketplace/wallet/transactions`
**Query:** `type`, `limit=20`, `before` (ISO timestamp cursor)
```json
{
  "transactions": [
    {
      "id": "uuid",
      "type": "purchase",
      "amount_cents": -4900,
      "balance_type": "voucher",
      "description": "12-Week Lean Bulk Bundle",
      "reference_type": "product",
      "created_at": "2026-04-17T14:22:00Z"
    },
    {
      "id": "uuid",
      "type": "subscription_credit",
      "amount_cents": 1999,
      "balance_type": "voucher",
      "description": "Monatliches Membership Goodwill (Lumeos Plus)",
      "created_at": "2026-04-01T00:00:00Z"
    }
  ],
  "has_more": true
}
```

### `POST /api/marketplace/wallet/topup`
```json
{ "amount_cents": 5000, "stripe_payment_intent_id": "pi_..." }
```

### `POST /api/marketplace/wallet/payout` — Creator only
```json
{ "amount_cents": 50000 }
```
**Response:**
```json
{ "ok": true, "stripe_transfer_id": "tr_...", "new_revenue_balance_cents": 15200 }
```

---

## 4. Checkout

### `POST /api/marketplace/orders/checkout`
```json
{
  "product_id": "uuid",
  "payment_source": "wallet_voucher"
}
```

**Response (success):**
```json
{
  "ok": true,
  "order_id": "uuid",
  "status": "completed",
  "amount_charged_cents": 4900,
  "new_voucher_balance_cents": 3600,
  "license_id": "uuid",
  "delivery": {
    "status": "delivered",
    "results": {
      "training_program": "routine_uuid",
      "meal_plan": "plan_uuid",
      "supplement_protocol": "stack_uuid"
    }
  }
}
```

**Response (insufficient funds):**
```json
{
  "ok": false,
  "error": "insufficient_funds",
  "missing_cents": 1400,
  "topup_suggestions": [1500, 2500, 5000]
}
```

### `GET /api/marketplace/orders`
**Query:** `status`, `limit=20`

### `POST /api/marketplace/orders/:id/refund`
```json
{ "reason": "Programm nicht wie beschrieben" }
```

---

## 5. Licenses

### `GET /api/marketplace/licenses`
```json
{
  "licenses": [
    {
      "product_id": "uuid",
      "product_title": "12-Week Lean Bulk Bundle",
      "product_type": "bundle",
      "license_type": "lifetime",
      "purchased_at": "2026-02-01",
      "delivery_status": "delivered",
      "delivery_results": { "training_program": "uuid", "meal_plan": "uuid" },
      "is_active": true
    }
  ]
}
```

### `POST /api/marketplace/licenses/:id/reactivate`
Delivery erneut anstoßen bei `delivery_status = 'failed'`.

---

## 6. Reviews

### `GET /api/marketplace/products/:id/reviews`
**Query:** `sort=helpful|newest|rating_asc|rating_desc`, `limit=10`, `offset=0`

```json
{
  "avg_rating": 4.8,
  "total_reviews": 234,
  "distribution": { "5": 180, "4": 40, "3": 10, "2": 3, "1": 1 },
  "user_can_review": false,
  "reviews": [
    {
      "id": "uuid",
      "reviewer_name": "Max M.",
      "rating": 5,
      "title": "Genau was ich gesucht habe",
      "content": "Tolles Programm...",
      "helpful_votes": 47,
      "is_verified": true,
      "creator_response": null,
      "created_at": "2026-03-15"
    }
  ]
}
```

### `POST /api/marketplace/reviews`
```json
{ "product_id": "uuid", "rating": 5, "title": "...", "content": "..." }
```

### `POST /api/marketplace/reviews/:id/vote`
```json
{ "helpful": true }
```

### `POST /api/marketplace/reviews/:id/creator-response` — Creator only
```json
{ "response": "Danke für dein Feedback!" }
```

---

## 7. Creator API

### `GET /api/marketplace/creators/:id`
Public Creator-Profil + Top-Produkte

### Creator Dashboard — erfordert Creator-Auth

| Method | Route | Beschreibung |
|---|---|---|
| GET | `/api/marketplace/creator/dashboard` | Revenue, Sales, Top-Produkte |
| GET | `/api/marketplace/creator/products` | Eigene Produkte |
| POST | `/api/marketplace/creator/products` | Neues Produkt |
| PUT | `/api/marketplace/creator/products/:id` | Updaten |
| DELETE | `/api/marketplace/creator/products/:id` | Deaktivieren |
| GET | `/api/marketplace/creator/analytics` | Detaillierte Analytics |
| GET | `/api/marketplace/creator/revenue` | Revenue-Übersicht |

**Dashboard Response:**
```json
{
  "revenue_30d_cents": 184000,
  "sales_30d": 42,
  "top_products": [
    { "title": "12-Week Lean Bulk", "sales_30d": 28, "revenue_30d_cents": 110000 }
  ],
  "avg_rating": 4.7,
  "pending_payout_cents": 84000
}
```

---

## 8. Promotions

### `GET /api/marketplace/promotions/slots`
Verfügbare Slot-Typen + Preise

### `POST /api/marketplace/promotions/boost`
```json
{
  "product_id": "uuid",
  "slot_type": "weekly_boost"
}
```

---

## 9. Subscriptions

### `GET /api/marketplace/subscriptions/plans`
Alle aktiven Abo-Pläne

### `POST /api/marketplace/subscriptions/subscribe`
```json
{ "plan_id": "uuid", "stripe_payment_method_id": "pm_..." }
```

### `DELETE /api/marketplace/subscriptions/cancel`
Abo kündigen (läuft bis Periodenende, Voucher verfällt dann).

---

## 10. For Buddy

### `GET /api/marketplace/for-buddy`
**Query:** `context=supplement_gap|goal_phase|general`, `limit=3`

```json
{
  "user_wallet_cents": 3500,
  "recommendations": [
    {
      "product_id": "uuid",
      "title": "12-Week Lean Bulk Bundle",
      "short_description": "Training + Meal Plan + Supplement Stack",
      "price_cents": 4900,
      "avg_rating": 4.8,
      "why_recommended": "Passend zu deinem Lean Bulk Goal",
      "user_can_afford": true,
      "checkout_url": "/checkout/uuid"
    }
  ]
}
```
