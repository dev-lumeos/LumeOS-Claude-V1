# Marketplace Module — Core Entities
> Spec Phase 2 | Datenmodell

---

## Entity-Übersicht

```
WALLET SYSTEM
──────────────────────────────────────────────────
Wallet (1 pro User/Creator/B2B)
  └── WalletTransaction (alle Flüsse, append-only)
SubscriptionPlan
UserSubscription

COMMERCE
──────────────────────────────────────────────────
Creator
Product
  └── ProductBundle (Komponenten-Links)
Order
  └── OrderItem
  └── ProductLicense (Zugang + Delivery)
  └── WalletTransaction (Zahlung)
ProductReview

PROMOTION
──────────────────────────────────────────────────
PromotionSlot
```

---

## 1. Wallet

```
id                      UUID PK
owner_id                UUID NOT NULL UNIQUE
owner_type              TEXT   user | creator | gym | vendor | brand

voucher_balance_cents   INTEGER DEFAULT 0   CHECK >= 0
  → Goodwill (Abo + Bonus), NICHT auszahlbar
revenue_balance_cents   INTEGER DEFAULT 0   CHECK >= 0
  → Einnahmen, AUSZAHLBAR via Stripe Connect

total_spent_cents       INTEGER DEFAULT 0
total_earned_cents      INTEGER DEFAULT 0

currency                TEXT DEFAULT 'EUR'
can_payout              BOOLEAN DEFAULT false  (nur Creator/B2B)
auto_topup_enabled      BOOLEAN DEFAULT false
auto_topup_threshold_cents INTEGER
auto_topup_amount_cents    INTEGER
```

---

## 2. WalletTransaction (append-only)

```
id                 UUID PK
from_wallet_id     UUID FK → Wallet   (NULL bei Stripe-Einzahlung)
to_wallet_id       UUID FK → Wallet   (NULL bei Auszahlung)

gross_amount_cents  INTEGER NOT NULL
fee_cents           INTEGER NOT NULL DEFAULT 0
net_amount_cents    INTEGER NOT NULL

from_balance_type   TEXT   voucher | revenue
to_balance_type     TEXT   voucher | revenue

type               TEXT NOT NULL
  subscription_credit | topup | purchase | payout | bonus |
  refund | ai_usage | promotion_payment | revenue_credit

reference_type     TEXT   product | session | subscription | ai_feature | promotion
reference_id       UUID

stripe_payment_id  TEXT
description        TEXT   "12-Week Lean Bulk Bundle"

created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
```

---

## 3. SubscriptionPlan

```
id                    UUID PK
name                  TEXT NOT NULL
price_cents           INTEGER NOT NULL
wallet_credit_cents   INTEGER NOT NULL   = price_cents (1:1)
billing_interval      TEXT   month | year
features              JSONB
ai_credits_included   INTEGER DEFAULT 0
stripe_price_id       TEXT
is_active             BOOLEAN DEFAULT true
```

---

## 4. Creator

```
id               UUID PK
user_id          UUID NOT NULL UNIQUE
creator_type     TEXT   coach | influencer | brand | nutritionist | gym

display_name     TEXT NOT NULL
bio              TEXT
avatar_url       TEXT
certifications   TEXT[]
specializations  TEXT[]

is_verified      BOOLEAN DEFAULT false
verification_level TEXT   pending | basic | verified | premium

total_sales             INTEGER DEFAULT 0
total_revenue_cents     INTEGER DEFAULT 0
avg_product_rating      NUMERIC(3,2)

revenue_share_pct       INTEGER DEFAULT 80
  (90 wenn Coach bringt seinen eigenen Client)
  (80 Standard für Discovery Traffic)
  (75 für Promoted Products)

stripe_account_id       TEXT   (Stripe Connect)
can_create_bundles      BOOLEAN DEFAULT false
```

---

## 5. Product

```
id               UUID PK
creator_id       UUID FK → Creator

product_type     TEXT NOT NULL
  training_program | meal_plan | supplement_protocol |
  recovery_protocol | bundle | ai_persona |
  equipment | digital | session

title            TEXT NOT NULL
description      TEXT
short_description TEXT

price_cents      INTEGER NOT NULL CHECK >= 0
compare_price_cents INTEGER   (Durchgestrichener Preis)
pricing_model    TEXT   one_time | subscription | free

category         TEXT
tags             TEXT[]
goal_alignments  TEXT[]   ['muscle_gain', 'fat_loss', ...]
difficulty       TEXT     beginner | intermediate | advanced
duration_weeks   INTEGER
equipment_required TEXT[]

media_urls       TEXT[]
preview_url      TEXT

is_active        BOOLEAN DEFAULT true
is_verified      BOOLEAN DEFAULT false
is_featured      BOOLEAN DEFAULT false
is_free          BOOLEAN DEFAULT false

-- Aggregiert (täglich via Cron aktualisiert)
avg_rating       NUMERIC(3,2) DEFAULT 0
review_count     INTEGER DEFAULT 0
purchase_count   INTEGER DEFAULT 0
view_count       INTEGER DEFAULT 0
search_score     NUMERIC(8,4) DEFAULT 0

-- Content (Produktinhalt für Delivery)
content          JSONB DEFAULT '{}'
  training_program: {routine-schema}
  meal_plan:        {meal-plan-schema}
  supplement_protocol: {stack-schema}
```

---

## 6. ProductBundle

```
id             UUID PK
bundle_id      UUID FK → Product CASCADE
component_id   UUID FK → Product
component_type TEXT   training_program | meal_plan | supplement_protocol | recovery_protocol
sort_order     INTEGER DEFAULT 0
UNIQUE (bundle_id, component_id)
```

---

## 7. Order

```
id               UUID PK
buyer_id         UUID NOT NULL
creator_id       UUID FK → Creator

total_cents              INTEGER NOT NULL
fee_cents                INTEGER NOT NULL DEFAULT 0
creator_revenue_cents    INTEGER NOT NULL DEFAULT 0

status           TEXT DEFAULT 'pending'
  pending | completed | refunded | disputed | cancelled
payment_method   TEXT DEFAULT 'wallet_voucher'
  wallet_voucher | wallet_revenue | stripe

purchased_at     TIMESTAMPTZ
refunded_at      TIMESTAMPTZ
refund_reason    TEXT
```

---

## 8. ProductLicense

```
id               UUID PK
order_id         UUID FK → Order
user_id          UUID NOT NULL
product_id       UUID FK → Product

license_type     TEXT   lifetime | subscription
valid_from       TIMESTAMPTZ NOT NULL DEFAULT now()
valid_until      TIMESTAMPTZ   (NULL für Lifetime)
is_active        BOOLEAN DEFAULT true

delivery_status  TEXT DEFAULT 'pending'
  pending | delivered | failed | partial
delivered_at     TIMESTAMPTZ

-- Delivery-Ergebnisse (welche IDs wurden angelegt)
delivery_results JSONB DEFAULT '{}'

UNIQUE (user_id, product_id)
```

---

## 9. ProductReview

```
id               UUID PK
product_id       UUID FK → Product
reviewer_id      UUID NOT NULL
order_id         UUID FK → Order   (nur Verified Purchases)

rating           INTEGER NOT NULL   CHECK (1–5)
title            TEXT
content          TEXT

helpful_votes    INTEGER DEFAULT 0
unhelpful_votes  INTEGER DEFAULT 0

creator_response     TEXT
creator_responded_at TIMESTAMPTZ

is_verified      BOOLEAN DEFAULT true
is_visible       BOOLEAN DEFAULT true
created_at       TIMESTAMPTZ DEFAULT now()

UNIQUE (product_id, reviewer_id)
```

---

## 10. PromotionSlot

```
id           UUID PK
product_id   UUID FK → Product
creator_id   UUID FK → Creator

slot_type    TEXT   daily_boost | weekly_boost | category_feature | homepage
category     TEXT

starts_at    TIMESTAMPTZ NOT NULL
ends_at      TIMESTAMPTZ NOT NULL
cost_cents   INTEGER NOT NULL

impressions  INTEGER DEFAULT 0
clicks       INTEGER DEFAULT 0
conversions  INTEGER DEFAULT 0

is_active    BOOLEAN DEFAULT true
```
