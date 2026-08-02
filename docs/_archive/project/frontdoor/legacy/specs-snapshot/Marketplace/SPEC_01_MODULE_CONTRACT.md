# Marketplace Module — Module Contract
> Spec Phase 1 | Final

---

## 1. Zweck

Der Marketplace ist der E-Commerce-Hub und das Monetarisierungs-Rückgrat von LumeOS. Alle Plattform-Transaktionen laufen über das interne Wallet-System. Lumeos verdient an jeder Transaktion (Transaction Fee).

---

## 2. Wallet-Kernprinzipien (unveränderlich)

```
1. Abo-Zahlung = Goodwill-Voucher (KEIN E-Geld, kein Auszahlungsanspruch)
2. Voucher-Balance: nicht auszahlbar, verfällt bei Kündigung
3. Revenue-Balance: nur Creator/B2B, auszahlbar via Stripe Connect
4. Ausgaben-Reihenfolge: Voucher zuerst, dann Revenue
5. Alle Transaktionen sind atomar (DB-Transaktion)
6. Keine negativen Balances
```

---

## 3. Produkt-Delivery (LIVE in App)

Alle gekauften Inhalte werden direkt in den jeweiligen Modul-APIs angelegt — **kein PDF**.

```typescript
// Nach Kauf → Content Delivery
training_program   → POST /api/training/routines
meal_plan          → POST /api/nutrition/meal-plans
supplement_protocol → POST /api/supplements/stacks (requires_confirmation: true)
bundle             → alle oben gleichzeitig
```

---

## 4. Revenue Share

| Traffic-Quelle | Creator | Lumeos |
|---|---|---|
| Discovery Traffic | 80% | 20% |
| Coach Traffic | 90% | 10% |
| Promoted Product | 75% | 25% |
| Lumeos-curated | 0% | 100% |

---

## 5. Modul-Grenzen

### Marketplace BESITZT:
- Wallet-System (Voucher + Revenue Balances)
- Subscription Plans + Credit-Processing
- Product Catalog
- Orders + Licensing
- Reviews
- Creator-Profile
- Promotion Slots
- Content Delivery (via Modul-API-Calls)

### Marketplace BESITZT NICHT:
- Training Routines (delivert via Training API)
- Meal Plans (delivert via Nutrition API)
- Supplement Stacks (delivert via Supplements API)
- Coach-Kommunikation (Human Coach Modul)
- Stripe-Verwaltung direkt (über Payment Service)

---

## 6. API-Übersicht

```
http://marketplace:5700
  /api/marketplace/products      Catalog + Search + Recommendations
  /api/marketplace/bundles       Bundle-Komponenten
  /api/marketplace/wallet        Balance, Transactions, Topup, Payout
  /api/marketplace/orders        Checkout, History, Refund
  /api/marketplace/licenses      Käufe + Delivery-Status
  /api/marketplace/reviews       Bewertungen
  /api/marketplace/creators      Creator-Profil + Dashboard
  /api/marketplace/promotions    Paid Boost Slots
  /api/marketplace/subscriptions Abo-Pläne
  /api/marketplace/for-buddy     Buddy Transaction Gateway
```

---

## 7. Cross-Module Flows

### Kauf-Flow (Checkout)
```
User bestätigt Kauf
  → wallet.ts: Atomic Debit (Voucher first)
  → orders.ts: Order + License erstellen
  → licensing.ts: Content Delivery
       → Training API: Routine hinzufügen
       → Nutrition API: Meal Plan hinzufügen
       → Supplements API: Stack vorschlagen
  → wallet.ts: Creator Revenue Credit
  → Notification: "Inhalte wurden hinzugefügt"
```

### Subscription-Flow (Cron, monatlich)
```
Stripe Charge → Goodwill Voucher ins Wallet → AI Credits Reset
```

### Buddy Transaction Gateway
```
Buddy empfiehlt Produkt → User klickt "Kaufen"
  → /api/marketplace/orders/checkout (One-Click)
  → Delivery läuft im Hintergrund
```
