# Marketplace Module — Wallet Economics (Spec)
> Spec Phase 5 | Wallet-Architektur, Fees, Flows

---

## 1. Wallet-Architektur (vollständig)

```
┌─────────────────────────────────────────────────────────────┐
│                      LUMEOS WALLET                           │
├──────────────────────────┬──────────────────────────────────┤
│   VOUCHER BALANCE        │   REVENUE BALANCE                 │
│   (Goodwill)             │   (Einnahmen)                     │
├──────────────────────────┤                                   │
│ EINGANG:                 │ EINGANG:                          │
│ · Abo-Zahlung            │ · Marketplace-Verkäufe            │
│   → Lumeos Goodwill      │ · Coach-Session-Payments          │
│ · Top-up via Stripe      │ · B2B-Transaktionen               │
│ · Bonus Vouchers         │                                   │
│ · Gift Vouchers          │ AUSGANG:                          │
│                          │ · Stripe Connect Payout           │
│ AUSGANG:                 │ · Reinvestition (Marketplace)     │
│ · Alle Käufe             │ · Paid Boost Slots                │
│ · AI Micro-Transactions  │                                   │
│ · Gym-Transaktionen      │ REGEL:                            │
│                          │ Nur Creator/B2B. Auszahlbar.      │
│ REGEL:                   │                                   │
│ Nicht auszahlbar.        │                                   │
│ Verfällt bei Kündigung.  │                                   │
└──────────────────────────┴──────────────────────────────────┘

AUSGABEN-REIHENFOLGE: Voucher ZUERST, dann Revenue.
```

---

## 2. Wallet Owner Types

| owner_type | Voucher | Revenue | Payout | Beschreibung |
|---|---|---|---|---|
| user | ✅ (Abo + Bonus) | ❌ | ❌ | Normaler User |
| creator | ✅ (Abo + Bonus) | ✅ | ✅ | Coach / Influencer / Creator |
| gym | ❌ | ✅ | ✅ | B2B — Gym |
| vendor | ❌ | ✅ | ✅ | B2B — Supplement Brand |
| brand | ❌ | ✅ | ✅ | B2B — Brand Partner |

---

## 3. Transaction Types

| type | from_balance | to_balance | Beschreibung |
|---|---|---|---|
| `subscription_credit` | — | voucher | Monatliches Abo → Goodwill Voucher |
| `topup` | — (Stripe) | voucher | Manueller Top-up |
| `purchase` | voucher/revenue | revenue | Produktkauf |
| `payout` | revenue | — (Stripe) | Auszahlung Creator/B2B |
| `bonus` | — | voucher | Achievement Bonus |
| `refund` | — | voucher | Rückerstattung als Voucher |
| `ai_usage` | voucher | — | AI Micro-Transaction |
| `promotion_payment` | revenue | — | Paid Boost Slot Bezahlung |
| `revenue_credit` | — | revenue | Creator Einnahme-Gutschrift |

---

## 4. Fee-Raten

```typescript
const FEE_RATES = {
  // Digital Products (Training, Meal Plan, Supplement Protocol, Bundle)
  digital: {
    discovery:   0.20,   // 20% — User findet über Lumeos Discovery
    coach:       0.10,   // 10% — User kommt über Coach-Referral
    promoted:    0.25,   // 25% — Promoted Product (Basis + 5% Boost-Aufschlag)
  },
  // Physical Products / Affiliate
  physical: {
    discovery:   0.15,
    coach:       0.08,
  },
  // Services (Coach Sessions, Consultations)
  session: {
    discovery:   0.20,
    coach:       0.10,
  },
};
```

---

## 5. Promotion Slot Preise

| Slot Type | Preis | Dauer | Platzierung |
|---|---|---|---|
| `daily_boost` | €9.99 | 24h | Top-10 in Kategorie |
| `weekly_boost` | €49.99 | 7 Tage | Top-10 in Kategorie |
| `category_feature` | €99.99/Woche | 7 Tage | Exklusiver Category Banner |
| `homepage` | €249.99/Woche | 7 Tage | Homepage Featured Section |

---

## 6. Subscription Plans

```typescript
const SUBSCRIPTION_PLANS = [
  {
    name: 'Lumeos Basic',
    price_cents: 999,         // €9.99/mo
    wallet_credit_cents: 999, // €9.99 Goodwill Voucher
    ai_credits_included: 20,  // 20 MealCam Scans/mo inklusive
    features: ['core_modules', 'basic_ai'],
  },
  {
    name: 'Lumeos Plus',
    price_cents: 1999,         // €19.99/mo
    wallet_credit_cents: 1999, // €19.99 Goodwill Voucher
    ai_credits_included: 50,
    features: ['all_modules', 'full_ai', 'advanced_goals'],
  },
  {
    name: 'Lumeos Pro',
    price_cents: 2999,         // €29.99/mo
    wallet_credit_cents: 2999, // €29.99 Goodwill Voucher
    ai_credits_included: 150,
    features: ['all_modules', 'full_ai', 'advanced_goals', 'human_coach', 'expert_plans'],
  },
];
```

---

## 7. AI Micro-Transactions

| Feature | Kosten Lumeos | Wallet-Belastung |
|---|---|---|
| MealCam Scan | ~€0.01 | €0.02/Scan |
| AI Coach Anfrage | ~€0.005–€0.02 | €0.03/Anfrage |
| AI Workout Generation | ~€0.01 | €0.02/Generierung |
| Bloodwork OCR Import | ~€0.02 | €0.05/Upload |
| Knowledge Search | ~€0.002 | Im Abo inklusive |

*Falls Abo-Credits verbraucht: Wallet wird automatisch belastet.*

---

## 8. Typische Wallet-Flows

### Flow A: User kauft Bundle (€49)
```
Wallet: Voucher €52.50, Revenue €0

1. Checkout: €49.00 vom Voucher
2. Wallet nach Kauf: Voucher €3.50, Revenue €0

WalletTransaction:
  from: User (voucher, -€49.00)
  to:   Creator (revenue, +€39.20)  [Fee 20% = €9.80]
  fee:  Lumeos €9.80
```

### Flow B: Creator hat €840 Revenue, zieht €500 ab
```
Wallet: Revenue €840.50

1. Payout Request: €500
2. Stripe Connect Transfer: €500 → Bankkonto
3. Wallet nach Payout: Revenue €340.50

WalletTransaction:
  from: Creator (revenue, -€500)
  to:   null (Stripe)
  type: payout
```

### Flow C: Monatliche Abo-Verlängerung
```
1. Stripe Charge: €19.99 → Lumeos
2. Cron: subscription_credit +€19.99 ins Voucher
3. AI Credits: Reset auf 50 Scans

WalletTransaction:
  from: null (Stripe)
  to:   User (voucher, +€19.99)
  type: subscription_credit
```

---

## 9. Refund Policy

```
14 Tage Refund-Fenster für digitale Produkte.

Refund = Wallet-Kredit (nicht Cash-Rückzahlung):
  → Ursprünglich aus Voucher gezahlt → Refund als Voucher
  → Voucher-Refund ist bewusst: kein Cash-Anspruch

Automatischer Refund wenn:
  · Kauf < 14 Tage
  · Erste Rückerstattung (kein Missbrauch-History)

Manuelle Prüfung wenn:
  · Kauf > 14 Tage
  · Wiederholter Refund (Missbrauchs-Pattern)

Creator-Revenue wird bei Refund zurückgebucht:
  Refund → Creator Revenue Wallet -Betrag + Fee zurück
```

---

## 10. Wallet-Validierungsregeln (DB-Level)

```sql
-- Voucher-Balance kann NICHT negativ werden
CHECK (voucher_balance_cents >= 0)

-- Revenue-Balance kann NICHT negativ werden
CHECK (revenue_balance_cents >= 0)

-- Payout nur wenn revenue_balance > 0
-- (Enforced via API-Layer, nicht DB)

-- Nur B2B/Creator können revenue_balance haben (can_payout = true)
-- User: can_payout = false immer
```
