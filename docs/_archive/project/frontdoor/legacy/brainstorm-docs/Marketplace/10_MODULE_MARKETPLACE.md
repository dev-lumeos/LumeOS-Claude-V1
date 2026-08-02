# LUMEOS — Modul: Marketplace
> Konsolidiert | 2026-04-14
> API Port: 5700 | Status: ✅ Implementiert (Details ausstehend)

---

## 1. Zweck

Das Marketplace-Modul ist der E-Commerce-Hub von Lumeos und das Monetarisierungs-Rückgrat der Plattform. Es verbindet User, Coaches, Supplement-Hersteller und Content-Creator über ein internes Wallet-System. Alle Plattform-Transaktionen laufen intern über Wallets — Lumeos verdient an jeder Transaktion.

---

## 2. Architektur

```
Frontend
  apps/marketplace/ (Port 8503) — dediziertes Marketplace-App
  apps/app/modules/marketplace/  — Eingebettete Kaufflows im User-App

API Layer (Hono, Port 5700)
  src/api/marketplace/
    ├── routes/
    │   ├── products.ts           (Catalog, Search, Recommendations)
    │   ├── wallet.ts             (Balance, Transactions)
    │   ├── orders.ts             (Checkout, Order Management)
    │   ├── creators.ts           (Creator/Vendor Management)
    │   ├── reviews.ts            (Rating System)
    │   └── licensing.ts         (Content Access Management)
```

---

## 3. Payment-Architektur

### Zwei-Schichten-Modell
```
EXTERNE PAYMENTS (Stripe):
  ├── Wallet Top-up (User kauft Credits mit Kreditkarte)
  ├── Subscription Payments (Monatlich)
  └── Seller Payouts (Coach/Creator bekommt Geld ausgezahlt)

INTERNE PAYMENTS (Wallet ↔ Wallet):
  ├── Supplement-Käufe
  ├── Training Program-Käufe
  ├── Coach-Session-Payments
  ├── Digital Content (Meal Plans, Rezepte)
  └── Alle anderen Plattform-Transaktionen
```

### Lumeos Revenue Model
- **Transaction Fee** auf jede Wallet ↔ Wallet Transaktion
- **Subscription Revenue** direkt
- **B2B Coach Revenue** (Platform-Fee auf Coach-Payments)
- Stripe ist nur für externe Ein-/Auszahlungen

---

## 4. Features

### 4.1 Lumeos Wallet System
- **Voucher Balance:** Interne Credits (nicht direkt auszahlbar)
- **Subscription Credits:** Monatliche Voucher-Zuweisung aus Subscription
- **Bonus Vouchers:** Performance-basierte Belohnungen + Achievements
- **Gift Vouchers:** Für Freunde kaufen
- **Promotional Vouchers:** Marketing + Creator-Incentives
- **Expiration Policies:** Konfigurierbar pro Voucher-Typ
- **Auto Top-up:** Automatisch aufladen wenn unter Schwellwert
- **Budget Alerts:** Warnung bei niedrigem Balance

### 4.2 Product Catalog

**Produkt-Typen:**
| Typ | Beschreibung |
|---|---|
| Supplements | Supplement-Produkte von Herstellern |
| Training Programs | Workout-Programme von Coaches/Creators |
| Meal Plans | Ernährungspläne mit Rezepten |
| Equipment | Trainingsgeräte (Affiliate) |
| Coach Sessions | 1:1 Coaching-Pakete |
| Digital Content | E-Books, Video-Kurse, Templates |

**Smart Search:**
- TF-IDF + Semantic Matching
- Popularity Boost (Kaufzahlen)
- Rating Weight (Review-Qualität)
- Recentness Decay (Neuere Produkte bevorzugt)
- Personalized Boost (User-Verhalten)

**Filter-System:**
- Price Range, Category, Goal Alignment
- Difficulty Level, Creator Verification
- User Ratings, Tags

### 4.3 AI-Powered Recommendations
- **Collaborative Filtering:** "Nutzer die X kauften, kauften auch Y"
- **Content-Based Filtering:** Ähnliche Produkte nach Goals + Attributen
- **Cross-Module Integration:** Empfehlungen basieren auf Nutrition/Training-Daten
- **Real-Time Personalization:** Dynamisch je nach aktuellem Session-Kontext

### 4.4 Creator Economy Platform

**Creator Onboarding:**
- Multi-Step-Verifizierung (Identität, Credentials, Expertise)
- Portfolio Review (Qualitätsprüfung)
- Creator Dashboard (Sales Analytics, Revenue, Reviews)

**Revenue Sharing:**
```
Produkt-Kauf 100 Credits:
  ├── Creator: 70 Credits → Revenue Wallet
  ├── Lumeos: 30 Credits → Platform Revenue
  └── Creator kann Revenue Wallet via Stripe auszahlen
```

**Creator Tools:**
- Product Builder (Inhalte hochladen)
- Pricing Control
- Analytics Dashboard
- Buyer Communication

### 4.5 Order Management
- Checkout Flow (Wallet Balance Check → Debit → Deliver)
- Order History
- Content Delivery (automatisch nach Kauf)
- Refund Processing (automatisiert)
- Dispute Resolution

### 4.6 Licensing + Content Access
- Einmaliger Kauf → lebenslanger Zugriff (Standard)
- Subscription-based Access (Premium Content)
- License Transfers (geplant)
- Content Delivery: automatisch nach Kauf in User-App verfügbar

### 4.7 Reviews + Ratings
- User Reviews mit Bewertung (1-5 Sterne)
- Verified Purchase Badge
- Helpful Votes
- Creator Response Feature
- Anti-Fraud (nur echte Käufer können bewerten)

### 4.8 Intelligent Transaction Processing
- **Fraud Detection:** AI-powered Risk Assessment
- **Tax Calculation:** Automatisch nach User-Standort (MWST DE, VAT EU, etc.)
- **Currency Conversion:** Interne Credits = keine Wechselkurs-Probleme
- **Refund Management:** Automatisiert nach Policy

---

## 5. Datenbank-Schema

### `products`
```sql
id              UUID PK
creator_id      UUID FK
product_type    VARCHAR           -- supplement, program, meal_plan, equipment, session, digital
title           VARCHAR NOT NULL
description     TEXT
price_credits   INTEGER NOT NULL  -- Preis in Lumeos Credits
currency_price  DECIMAL           -- Echter Preis (für Stripe-Käufe)
category        VARCHAR
tags            TEXT[]
goal_alignments TEXT[]            -- body_composition, performance, health...
difficulty      VARCHAR
media_urls      TEXT[]            -- Bilder, Videos, Previews
is_active       BOOLEAN DEFAULT true
is_verified     BOOLEAN DEFAULT false
created_at      TIMESTAMPTZ
```

### `user_wallet`
```sql
user_id         UUID PK (FK)
voucher_balance INTEGER DEFAULT 0    -- Interne Credits
revenue_balance INTEGER DEFAULT 0    -- Creator Revenue (auszahlbar)
total_earned    INTEGER DEFAULT 0    -- Lifetime Earned
total_spent     INTEGER DEFAULT 0    -- Lifetime Spent
updated_at      TIMESTAMPTZ
```

### `wallet_transactions`
```sql
id              UUID PK
user_id         UUID FK
transaction_type VARCHAR           -- credit, debit, top_up, payout, bonus, refund
amount          INTEGER
balance_before  INTEGER
balance_after   INTEGER
reference_id    UUID               -- Produkt/Order/Subscription
reference_type  VARCHAR
description     TEXT
created_at      TIMESTAMPTZ
```

### `orders`
```sql
id              UUID PK
buyer_id        UUID FK
product_id      UUID FK
amount_credits  INTEGER
status          VARCHAR            -- pending, completed, refunded, disputed
purchased_at    TIMESTAMPTZ
refunded_at     TIMESTAMPTZ
refund_reason   TEXT
```

### `product_licenses`
```sql
id              UUID PK
order_id        UUID FK
user_id         UUID FK
product_id      UUID FK
license_type    VARCHAR            -- lifetime, subscription
valid_from      TIMESTAMPTZ
valid_until     TIMESTAMPTZ        -- NULL für Lifetime
is_active       BOOLEAN DEFAULT true
```

### `product_reviews`
```sql
id              UUID PK
product_id      UUID FK
reviewer_id     UUID FK
order_id        UUID FK            -- Nur verified purchases
rating          INTEGER            -- 1-5
title           VARCHAR
content         TEXT
helpful_votes   INTEGER DEFAULT 0
created_at      TIMESTAMPTZ
```

---

## 6. API-Endpunkte

| Route | Hauptendpunkte |
|---|---|
| `products.ts` | `GET /products` (search/filter), `GET /products/:id`, `GET /products/:id/similar` |
| `wallet.ts` | `GET /wallet/balance`, `GET /wallet/transactions`, `POST /wallet/top-up` |
| `orders.ts` | `POST /orders/checkout`, `GET /orders/history`, `POST /orders/:id/refund` |
| `creators.ts` | `GET /creators/:id`, Creator Dashboard Endpoints |
| `reviews.ts` | `GET /products/:id/reviews`, `POST /reviews`, `POST /reviews/:id/helpful` |
| `licensing.ts` | `GET /licenses` (User's Content), `GET /licenses/:id/access` |

---

## 7. Buddy Integration im Marketplace

Buddy als Transaction Gateway (Tom's Vision):
```
User zu Buddy: "Ich brauche neues Protein"
→ Buddy: "Auf Basis deiner Stack-Analyse empfehle ich X (Bewertung 4.8, 2.400 Credits)"
→ User: "Kauf es"
→ Buddy: Leitet zu Checkout — User bestätigt
→ Transaktion läuft über Wallet ↔ Wallet

User zu Buddy: "Zeig mir Workout-Programme für Hypertrophie"
→ Buddy: Filtert Marketplace nach Goal + User-Level
→ Zeigt Top 3 mit persönlichem Kommentar
```

---

## 8. Verbindungen zu anderen Modulen

| Modul | Verbindung |
|---|---|
| **Supplements** | Supplement-Produkte direkt kaufen aus Supplement-Modul |
| **Training** | Training Programs kaufen, direkt in Training-Modul importieren |
| **Nutrition** | Meal Plans kaufen, als Meal Plan in Nutrition-Modul verfügbar |
| **Human Coach** | Coach-Sessions buchen, Payments über Wallet |
| **Coach (AI)** | Buddy empfiehlt Produkte kontextuell |
| **Auth** | Wallet an User-Account gebunden |

---

## 9. Offene Punkte

| # | Typ | Beschreibung | Priorität |
|---|---|---|---|
| TODO | 🔴 | Creator Onboarding Flow komplett | 🔴 HOCH |
| TODO | 🔴 | Stripe Integration für Top-up + Payouts | 🔴 HOCH |
| TODO | 🟡 | Subscription-based Content Access | 🟡 MITTEL |
| TODO | 🟡 | Affiliate/Physical Products (Geräte) | 🟡 MITTEL |
| TODO | 🟡 | Advanced Analytics für Creators | 🟡 MITTEL |
| TODO | 🟢 | Crypto Payment Option | 🟢 NIEDRIG |

**Tom's Entscheidung ausstehend:** Marketplace start nach Human Coach Approval?
