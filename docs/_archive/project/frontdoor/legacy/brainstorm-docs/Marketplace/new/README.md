# Marketplace Module — Übersicht

Das Marketplace-Modul ist der E-Commerce-Hub und das Monetarisierungs-Rückgrat von LumeOS. Es verbindet User, Coaches, Supplement-Hersteller und Content-Creator über ein internes Wallet-System.

**Kern-Innovation:** Alle gekauften Inhalte sind LIVE in der App (kein PDF) — Training Programme laden direkt ins Training Modul, Meal Plans ins Nutrition Modul, etc.

---

## Architektur

```
Frontend
  apps/marketplace/ (Port 8503) — dediziertes Marketplace-App
  apps/app/modules/marketplace/ — Eingebettete Kaufflows im User-App

API Layer (Hono, Port 5700)
  src/api/marketplace/
    └── routes/
        ├── products.ts       (Catalog, Search, Recommendations)
        ├── bundles.ts        (Cross-Module Bundle Management)
        ├── wallet.ts         (Balance, Transactions, Top-up)
        ├── orders.ts         (Checkout, Order Management, Refunds)
        ├── creators.ts       (Creator Dashboard, Onboarding)
        ├── reviews.ts        (Rating System, Helpful Votes)
        ├── licensing.ts      (Content Access, Delivery)
        ├── promotions.ts     (Paid Boost, Featured Slots)
        ├── subscriptions.ts  (Abo-Pläne, Wallet Credits)
        └── for-buddy.ts      (Buddy Transaction Gateway)

Database (PostgreSQL / Supabase)
  Schema: marketplace.*
  Tabellen: 12 Core-Tabellen
  VIEWs: product_search_view, creator_revenue_summary
```

---

## Tech Stack

| Layer | Technologie |
|---|---|
| Frontend | Next.js 15, React, Zustand, TailwindCSS, TanStack Query |
| API | Hono (TypeScript), Port 5700 |
| Datenbank | PostgreSQL (Supabase), Schema `marketplace` |
| Payments | Stripe Connect (Top-up + Payouts), Wallet-intern für Käufe |
| Search | PostgreSQL Full-Text + Scoring |
| Media | Supabase Storage (Product Images, Previews) |
| i18n | DE/EN/TH (260+ Keys) |

---

## Wallet-System (Kern)

```
VOUCHER (voucher_balance):
  IN:  Abo-Zahlung → Lumeos-Goodwill-Voucher
       Manuelle Top-ups (Stripe)
       Bonus Vouchers (Achievements, Promotions)
  OUT: Alle Käufe (Marketplace, AI Features, Gym)
  REGEL: Nicht auszahlbar. Verfällt bei Kündigung.

REVENUE (revenue_balance):
  IN:  Verkaufs-Einnahmen (Coach/Creator/Brand)
  OUT: Auszahlung via Stripe Connect
       Reinvestieren im Marketplace
  REGEL: Nur für B2B-Partner / Creator. Auszahlbar.

REIHENFOLGE: Voucher wird ZUERST belastet, dann Revenue.
```

---

## Verbindungen zu anderen Modulen

| Modul | Was Marketplace liefert | Was Marketplace erhält |
|---|---|---|
| **Training** | Gekaufte Routines → direkt als Routine | — |
| **Nutrition** | Meal Plans → direkt als Meal Plan | — |
| **Supplements** | Supplement Protocols → als Stack-Vorschlag | — |
| **Human Coach** | Coach-Sessions buchbar | Coach-Umsatz → Revenue Wallet |
| **Buddy (AI)** | Produkt-Recommendations | — |
| **Goals** | Goal-Alignment für Discovery | Goal Phase für Personalisierung |

---

## Dokumentations-Index

| Datei | Inhalt |
|---|---|
| `FEATURES.md` | Alle Features mit Status |
| `DATABASE.md` | Vollständiges DB-Schema |
| `API.md` | Alle API-Endpoints |
| `COMPONENTS.md` | Frontend: Components, Hooks, Stores |
| `SCORING.md` | Search Scoring, Ranking, Wallet Flows |
| `STRATEGY.md` | Marktanalyse, Personas, USPs, Business Model |
| `OPEN_ITEMS.md` | Bugs, geplante Features, offene Fragen |
