# Marketplace Module — API

## Base URL
`http://marketplace:5700`

## Auth
JWT via `Authorization: Bearer <token>`
Creator-Endpoints: Require `creator_id` in JWT

---

## 1. Products

### `GET /api/marketplace/products`
**Query:** `q`, `type`, `category`, `goal`, `difficulty`, `price_min`, `price_max`, `rating_min`, `sort=score|price|rating|newest`, `limit=20`, `offset=0`

```json
{
  "products": [
    {
      "id": "uuid",
      "product_type": "bundle",
      "title": "12-Week Lean Bulk Bundle",
      "short_description": "Training + Meal Plan + Supplement Stack — alles in einem",
      "price_cents": 4900,
      "pricing_model": "one_time",
      "avg_rating": 4.8,
      "review_count": 234,
      "purchase_count": 1847,
      "difficulty": "intermediate",
      "duration_weeks": 12,
      "goal_alignments": ["muscle_gain", "strength"],
      "creator": { "display_name": "Coach Alex", "is_verified": true },
      "is_promoted": true,
      "preview_url": "...",
      "user_has_license": false
    }
  ],
  "total": 142
}
```

### `GET /api/marketplace/products/:id`
Detail + Reviews Übersicht + Similar Products

### `GET /api/marketplace/products/:id/similar`
**Query:** `limit=5`

### `GET /api/marketplace/recommendations`
**Query:** `context=home|supplement_gap|training|goal_phase`
Personalisierte Empfehlungen basierend auf User-Daten.

```json
{
  "sections": [
    {
      "title": "Für dein aktuelles Ziel: Lean Bulk",
      "context": "goal_phase",
      "products": [...]
    },
    {
      "title": "Trending diese Woche",
      "products": [...]
    }
  ]
}
```

---

## 2. Bundles

### `GET /api/marketplace/products/:id/bundle-components`
Alle Komponenten eines Bundles.

```json
{
  "bundle_id": "uuid",
  "title": "12-Week Lean Bulk Bundle",
  "components": [
    { "type": "training_program", "title": "PPL Hypertrophy", "duration_weeks": 12 },
    { "type": "meal_plan", "title": "Lean Bulk Meal Plan 2800 kcal", "duration_weeks": 12 },
    { "type": "supplement_protocol", "title": "Beginner Bulk Stack" }
  ],
  "total_individual_cents": 7700,
  "bundle_price_cents": 4900,
  "savings_cents": 2800
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
  "total_spent_cents": 18900,
  "total_earned_cents": 15200
}
```

### `GET /api/marketplace/wallet/transactions`
**Query:** `type`, `limit=20`, `before` (cursor)

### `POST /api/marketplace/wallet/topup`
```json
{ "amount_cents": 2500, "payment_method": "stripe", "stripe_token": "tok_..." }
```

### `POST /api/marketplace/wallet/payout`
Creator/B2B only: Revenue Wallet auszahlen.
```json
{ "amount_cents": 5000 }
```

---

## 4. Orders / Checkout

### `POST /api/marketplace/orders/checkout`
```json
{
  "product_id": "uuid",
  "payment_source": "wallet_voucher"
}
```

**Response:**
```json
{
  "order_id": "uuid",
  "status": "completed",
  "amount_charged_cents": 4900,
  "new_voucher_balance_cents": 3600,
  "license": { "id": "uuid", "product_id": "uuid", "license_type": "lifetime" },
  "delivery": {
    "status": "delivered",
    "training_routine_id": "uuid",
    "meal_plan_id": "uuid",
    "supplement_stack_id": "uuid"
  }
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
Alle Käufe des Users mit Zugangs-Status.

```json
{
  "licenses": [
    {
      "product_id": "uuid",
      "product_title": "12-Week Lean Bulk Bundle",
      "license_type": "lifetime",
      "purchased_at": "2026-02-01",
      "delivery_status": "delivered",
      "is_active": true
    }
  ]
}
```

### `POST /api/marketplace/licenses/:id/reactivate`
Wenn Delivery fehlgeschlagen war: Content-Delivery nochmal anstoßen.

---

## 6. Reviews

### `GET /api/marketplace/products/:id/reviews`
**Query:** `sort=helpful|newest`, `limit=10`

```json
{
  "avg_rating": 4.8,
  "total_reviews": 234,
  "distribution": { "5": 180, "4": 40, "3": 10, "2": 3, "1": 1 },
  "reviews": [
    {
      "id": "uuid",
      "reviewer_name": "Max M.",
      "rating": 5,
      "title": "Genau was ich gesucht habe",
      "content": "Tolles Programm, klare Struktur...",
      "helpful_votes": 47,
      "is_verified": true,
      "created_at": "2026-03-15",
      "creator_response": null
    }
  ]
}
```

### `POST /api/marketplace/reviews`
```json
{
  "product_id": "uuid",
  "order_id": "uuid",
  "rating": 5,
  "title": "Sehr empfehlenswert",
  "content": "..."
}
```

### `POST /api/marketplace/reviews/:id/helpful`
Toggle Helpful Vote.

---

## 7. Creators

### `GET /api/marketplace/creators/:id`
Creator-Profil + Top-Produkte

### Creator Dashboard (erfordert Creator Auth)

| Method | Route | Beschreibung |
|---|---|---|
| GET | `/api/marketplace/creator/dashboard` | Revenue, Sales, Top Products |
| GET | `/api/marketplace/creator/products` | Eigene Produkte |
| POST | `/api/marketplace/creator/products` | Neues Produkt erstellen |
| PUT | `/api/marketplace/creator/products/:id` | Updaten |
| GET | `/api/marketplace/creator/analytics` | Detaillierte Analytics |

---

## 8. Promotions

### `GET /api/marketplace/promotions/available`
Verfügbare Boost-Slots.

### `POST /api/marketplace/promotions/boost`
```json
{
  "product_id": "uuid",
  "slot_type": "weekly_boost",
  "category": "training_program"
}
```

---

## 9. For Buddy (Transaction Gateway)

### `GET /api/marketplace/for-buddy`
Produkt-Empfehlungen mit Kaufoption für Buddy.

**Query:** `context=supplement_gap|goal_phase|general`, `limit=3`

```json
{
  "recommendations": [
    {
      "product_id": "uuid",
      "title": "Lean Bulk Bundle",
      "price_cents": 4900,
      "why": "Passend zu deinem Lean Bulk Goal",
      "action": { "type": "checkout_url", "url": "/checkout/uuid" }
    }
  ],
  "user_wallet_cents": 3500
}
```
