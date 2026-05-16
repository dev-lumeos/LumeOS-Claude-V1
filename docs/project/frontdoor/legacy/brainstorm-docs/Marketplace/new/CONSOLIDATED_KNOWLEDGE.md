# Marketplace Module — Konsolidiertes Wissen
> Konsolidiert aus 13 Alt-Dokumenten | 2026-04-17
> Quellen: 10_MODULE_MARKETPLACE.md, lumeos-marketplace-strategy.md,
> marketplace-economics.md, wallet-and-monetization.md,
> marketplace_DATABASE.md, marketplace_FEATURES.md, marketplace_API.md,
> marketplace_COMPONENTS.md, marketplace_README.md, marketplace_RESEARCH.md,
> marketplace_MIGRATION.md, mktmod_PRD.md, mktmod_TODO.md

---

## 1. Zweck & Status

**Port 5700. E-Commerce-Hub und Monetarisierungs-Rückgrat von LumeOS.**

Verbindet User, Coaches, Supplement-Hersteller und Content-Creator über ein internes Wallet-System. Alle Plattform-Transaktionen laufen intern über Wallets — Lumeos verdient an jeder Transaktion.

**Status (2026-04-14):** ✅ Implementiert (Details ausstehend)

---

## 2. Wallet-System (Kern-Konzept)

### Zwei-Schichten-Modell

```
EXTERNE PAYMENTS (Stripe):
  ├── Wallet Top-up (User kauft Credits mit Kreditkarte)
  ├── Subscription Payments (Monatlich)
  └── Seller Payouts (Coach/Creator → Bankkonto)

INTERNE PAYMENTS (Wallet ↔ Wallet):
  ├── Alle Marketplace-Käufe
  ├── Coach-Session-Payments
  ├── Gym-Transaktionen
  └── AI Feature Micro-Transactions
```

### Abo = Voucher (Kernprinzip)

```
User zahlt €X/mo Abo
  → Abo-Geld ist WEG (gehört Lumeos)
  → Lumeos gibt Goodwill-Voucher über €X ins Wallet
  → Voucher = Geschenk (nicht User's Geld)
  → Kündigung → Voucher verfällt
```

Vergleich: Airline Miles, Cashback-Programme, Gym-Getränke-Flat.
**Kein E-Geld** — braucht keine E-Geld-Lizenz.

### Wallet-Salden (Zwei Typen)
- **voucher_balance:** Goodwill (Abo + Kickback + Bonus), NICHT auszahlbar
- **revenue_balance:** Einnahmen von Verkäufen (Coach/Creator/B2B), AUSZAHLBAR via Stripe Connect

### Ausgaben-Reihenfolge
Voucher wird ZUERST belastet, dann Revenue.

---

## 3. Produkt-Typen

| Typ | Beschreibung | Creator |
|---|---|---|
| Training Program | 4–16 Wochen Workout-Programme | Coach, Creator |
| Meal Plan | Ernährungspläne mit Rezepten | Coach, Nutritionist |
| Supplement Protocol | Stack-Empfehlungen mit Timing | Coach, Brand |
| Recovery Protocol | Sleep/Deload/Stretching Protokolle | Coach |
| **Bundle (Cross-Module)** | Training + Nutrition + Supplements + Recovery | Coach, Lumeos |
| AI Coach Persona | Coach's Methode als 24/7 AI | Coach |
| Equipment | Trainingsgeräte (Affiliate) | Brand |
| Digital Content | E-Books, Video-Kurse, Templates | Creator |
| Coach Session | 1:1 Coaching-Pakete | Coach |

**USP: Cross-Module Bundles** — kein Competitor bietet das. LIVE in der App (kein PDF).

---

## 4. Revenue-Shares

| Traffic-Quelle | Creator | Lumeos |
|---|---|---|
| Coach Traffic (Client kommt über Coach) | 90% | 10% |
| Discovery Traffic (User findet über Lumeos) | 80% | 20% |
| Lumeos-curated Bundles | — | 100% |
| Brand Partnerships | — | 100% |

---

## 5. Ranking-Modell (Paid Boost)

```
PROMOTED (zahlt Push-Kosten + höhere Marge)  → TOP
TOP RATED (hohe Bewertungen + Verkäufe)      → ZWEITE REIHE
STANDARD (organisch, Basis-Marge)            → MITTE
NEW (frisch eingestellt)                      → DISCOVERY
```

---

## 6. Datenbank-Kern

| Tabelle | Beschreibung |
|---|---|
| `marketplace.wallets` | Voucher + Revenue Balance pro Owner |
| `marketplace.wallet_transactions` | Alle Wallet-Flüsse (Kern) |
| `marketplace.products` | Produkt-Katalog |
| `marketplace.product_bundles` | Bundle-Komponenten |
| `marketplace.orders` | Käufe + Status |
| `marketplace.product_licenses` | Zugang nach Kauf |
| `marketplace.product_reviews` | Bewertungen (nur Verified) |
| `marketplace.creators` | Creator-Profile + Verifizierung |
| `marketplace.subscriptions` | Abo-Pläne |
| `marketplace.promotion_slots` | Paid Boost Slots |

---

## 7. Cross-Module Integration

| Modul | Integration |
|---|---|
| Training | Gekaufte Programme → direkt als Routine im Training Modul |
| Nutrition | Meal Plans → direkt als Meal Plan im Nutrition Modul |
| Supplements | Supplement Protocols → direkt als Stack im Supplements Modul |
| Human Coach | Coach-Sessions buchen, Payments über Wallet |
| Buddy (AI) | Buddy empfiehlt Produkte kontextuell + Transaction Gateway |
| Goals | Goal-Alignment-Filter für Produktsuche |

---

## 8. Buddy als Transaction Gateway (Tom's Vision)

```
User → Buddy: "Ich brauche neues Protein"
Buddy: "Empfehle [Produkt X], Bewertung 4.8, 2.400 Credits"
User: "Kauf es"
Buddy: → Checkout → User bestätigt → Wallet Debit → Delivery
```

---

## 9. Brand Partnership Revenue (B2B)

```
In-Context Placement:
  "Dein Stack fehlt Creatine → [Brand] Creatine Monohydrat, €24.99"
  
CPA $5–15 (vs. Instagram: $20–30)
Placement-Gebühr für Featured Position in Kategorie
```
