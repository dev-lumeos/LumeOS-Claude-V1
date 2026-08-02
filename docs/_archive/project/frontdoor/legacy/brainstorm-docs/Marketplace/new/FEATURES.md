# Marketplace Module — Features

## Implementierte Features

### 1. Lumeos Wallet System

**Voucher Balance (User):**
- Abo-Zahlung → Goodwill-Voucher (nicht auszahlbar)
- Manuelle Top-ups via Stripe ($5/$10/$25/$50/$100)
- Bonus Vouchers (Performance-Achievements, Promotions)
- Auto Top-up (Automatisch aufladen wenn unter Schwellwert)
- Budget Alerts (Warnung bei niedrigem Balance)
- Gift Vouchers (für Freunde kaufen)
- Expiration Policies konfigurierbar

**Revenue Balance (Creator/B2B):**
- Verkaufs-Einnahmen landen automatisch im Revenue Wallet
- Auszahlung via Stripe Connect auf Bankkonto
- Revenue kann im Marketplace reinvestiert werden
- Oder: für Paid Boost Slots nutzen

Code: `routes/wallet.ts` · `marketplace.wallets` · `WalletView.tsx`

---

### 2. Product Catalog

6 Kernprodukt-Typen + Bundles.

**Smart Search:**
- TF-IDF + Semantic Matching auf title + description + tags
- Popularity Boost (Kaufzahlen × 0.3)
- Rating Weight (Ø Rating × 0.2)
- Recency Factor (Neuere Produkte leicht bevorzugt)
- Personalized Boost (User Goal-Match × 0.3)
- Difficulty Match (User Level ↔ Produkt-Difficulty)

**Filter-System:**
- Price Range, Category, Goal Alignment
- Difficulty Level, Creator Verification Status
- User Ratings, Equipment Required, Duration (Wochen)
- Product Type (Training/Nutrition/Supplements/Bundle/etc.)

Code: `routes/products.ts` · `marketplace.products` · `ProductCatalog.tsx`

---

### 3. Cross-Module Bundles (Killer Feature)

Bundles kombinieren Komponenten aus mehreren Modulen in einem Paket.

- **Komponenten:** Training Program + Meal Plan + Supplement Protocol + Recovery Protocol (beliebig kombiniert)
- **LIVE Integration:** Kauf → alle Komponenten sofort in den jeweiligen Modulen aktiv
- **Bundle-Discount:** Günstiger als Einzelkauf der Komponenten
- **Goal Alignment:** Bundle-Tags werden aus allen Komponenten aggregiert
- **Creator-Bundle vs. Lumeos-Bundle:** Coaches erstellen eigene Bundles; Lumeos erstellt kuratierte Bundles

Code: `routes/bundles.ts` · `marketplace.product_bundles` · `BundleView.tsx`

---

### 4. Checkout + Order Management

**Checkout Flow:**
1. Wallet Balance Check (Voucher first, dann Revenue)
2. Wallet Debit (atomar)
3. Content Delivery (sofort nach Kauf)
4. Order bestätigt + License erstellt
5. Revenue Credit an Creator (abzüglich Marge)

**Refund-Policy:**
- Digitale Produkte: 14 Tage Refund-Fenster
- Refund = Wallet-Kredit (nicht Cash-Back)
- Bei Missbrauch: Refund-Sperre

Code: `routes/orders.ts` · `marketplace.orders` · `CheckoutModal.tsx`

---

### 5. Content Delivery + Licensing

- **Lifetime License** (Standard für Einmalkauf)
- **Subscription License** (für monatliche Produkte)
- Automatische Delivery nach Kauf → Modul-APIs werden aufgerufen
- License-Check bei Zugriff

**Delivery Flows:**
- Training Program → POST /api/training/routines (source: 'marketplace')
- Meal Plan → POST /api/nutrition/meal-plans (source: 'marketplace')
- Supplement Protocol → POST /api/supplements/stacks (source: 'marketplace')
- Bundle → alle oben gleichzeitig

Code: `routes/licensing.ts` · `marketplace.product_licenses` · `useProductAccess.ts`

---

### 6. Reviews + Ratings

- 1–5 Sterne Bewertung
- Nur Verified Purchases können bewerten (Anti-Fraud)
- Helpful Votes (User können Bewertungen als hilfreich markieren)
- Creator Response Feature (Creator antwortet auf Review)
- Rating Aggregation: Ø Rating + Count
- Automatische Sortierung: Helpful zuerst, dann Neueste

Code: `routes/reviews.ts` · `marketplace.product_reviews` · `ReviewSection.tsx`

---

### 7. Creator Economy Platform

**Creator Onboarding:**
- Multi-Step Verifikation (Identität + Credentials + Expertise)
- Portfolio Review (Qualitätsprüfung durch Lumeos)
- Specializations + Certifications

**Creator Dashboard:**
- Sales Analytics (Verkäufe, Revenue, Conversion Rate)
- Product Performance (Views, Purchases, Rating)
- Revenue Wallet Status
- Buyer Communication

**Product Builder:**
- Inhalte hochladen (Training Routines, Meal Plans, etc.)
- Pricing Control (Preis setzen)
- Preview Assets (Screenshots, Demo-Videos)
- Goal Alignment Tags setzen

Code: `routes/creators.ts` · `marketplace.creators` · `CreatorDashboard.tsx`

---

### 8. AI-Powered Recommendations

- **Collaborative Filtering:** "User die X kauften, kauften auch Y"
- **Content-Based Filtering:** Ähnliche Produkte nach Goal + Difficulty
- **Cross-Module Context:** "Du bist im Lean Bulk → empfehle Hypertrophie-Bundles"
- **Buddy Gateway:** Buddy recommends → direkt kaufbar in einem Klick

Code: `routes/products.ts` (recommendations endpoint) · `useRecommendations.ts`

---

### 9. Paid Boost / Promotion System

- **Tages-Boost:** Top-Platzierung für 24h
- **Wochen-Boost:** Top-Platzierung für 7 Tage
- **Kategorie-Feature:** Exklusive Kategorie-Top-Position
- Bezahlung aus Revenue Wallet (Creator) oder Brand Budget
- Boost-Kosten + höhere Margenprozentsatz auf geförderte Verkäufe

Code: `routes/promotions.ts` · `marketplace.promotion_slots`

---

### 10. Brand Partnership (B2B)

- **In-Context Recommendations:** "Dein Stack fehlt Creatine → [Brand] Creatine"
- **Featured Product Slots:** Branded Kacheln in Kategorie
- **Bundle Collaborations:** Brand + Coach Collaboration Bundle
- **Affiliate Dashboard:** ROI Tracking, Click-Through-Rate, CPA

Code: `routes/creators.ts` (brand endpoints) · `marketplace.brand_partnerships`

---

## Geplante Features

### Hoch Priorität

| Feature | Beschreibung |
|---|---|
| Creator Onboarding Flow | Vollständiger Verifikations-Wizard |
| Stripe Integration | Top-up + Payout vollständig implementieren |
| Subscription-based Content | Monatliche Programme mit Renewal |

### Mittlere Priorität

| Feature | Beschreibung |
|---|---|
| Affiliate Produkte (Equipment) | Physische Produkte als Affiliate Links |
| Advanced Creator Analytics | Completion Rate, Wiederkäufe, Cohort Analysis |
| Free Tier Programmes | Boostcamp-Strategie: hochwertige gratis Inhalte |
| Bundle Builder (Creator) | Creator erstellt eigene Cross-Module Bundles |

### Niedrige Priorität

| Feature | Beschreibung |
|---|---|
| Crypto Payment Option | Wallet Top-up mit Crypto |
| Gift-Marketplace | Programme als Geschenk kaufen |
