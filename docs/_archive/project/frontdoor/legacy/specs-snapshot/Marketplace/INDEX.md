# Marketplace Module — Spec Index
> LumeOS | Vollständige Spezifikation

---

## Dokument-Index

| Spec | Datei | Inhalt |
|---|---|---|
| — | `CONSOLIDATED_KNOWLEDGE.md` | Alle 13 Alt-Dokumente destilliert |
| 01 | `SPEC_01_MODULE_CONTRACT.md` | Zweck, Wallet-Prinzipien, Delivery Flows, Revenue Shares |
| 02 | `SPEC_02_ENTITIES.md` | 10 Core Entities (Wallet, Product, Order, License, ...) |
| 03 | `SPEC_03_USER_FLOWS.md` | 11 User Flows (Discovery, Checkout, Creator, Buddy, Refund, ...) |
| 04 | `SPEC_04_FEATURES.md` | 7 Features mit vollständigem TypeScript-Code |
| 05 | `SPEC_05_WALLET_ECONOMICS.md` | Wallet-Architektur, Fee-Raten, Promotion-Preise, AI-Micro-Transactions |
| 06 | `SPEC_06_DATABASE_SCHEMA.md` | Vollständiges SQL (11 Tabellen, RLS, Triggers) |
| 07 | `SPEC_07_API.md` | Alle Endpoints mit Request/Response inkl. Buddy-Gateway |
| 08 | `SPEC_08_IMPORT_PIPELINE.md` | Seed, Onboarding, Cron Jobs, Content Delivery URLs |
| 09 | `SPEC_09_SCORING.md` | Search Score, Goal Match, Fee Calc, Wallet Debit, Tests |
| 10 | `SPEC_10_COMPONENTS.md` | Frontend: 40+ Components, 16 Hooks, 2 Stores, i18n |

---

## Wallet-Kernprinzipien (unveränderlich)

| Prinzip | Regel |
|---|---|
| Abo = Goodwill | Abo-Geld → Lumeos. Voucher = Geschenk zurück. |
| Kein E-Geld | Voucher ist Goodwill, kein Kundengeld. Keine E-Geld-Lizenz nötig. |
| Voucher nicht auszahlbar | Nur Revenue Balance ist auszahlbar. |
| Voucher zuerst | Bei Käufen: Voucher wird vor Revenue belastet. |
| Atomare Transaktionen | Keine Teilzahlungen. DB-Transaktion für alle Wallet-Operationen. |
| Kein negatives Balance | DB-Level CHECK constraint. |

---

## Revenue Share Übersicht

| Szenario | Creator | Lumeos |
|---|---|---|
| Discovery Traffic + Digital | 80% | 20% |
| Coach Traffic + Digital | 90% | 10% |
| Promoted Product | 75% | 25% |
| Lumeos Curated Bundles | 0% | 100% |
| Brand Partnerships | 0% | 100% |

---

## Promotion Slot Preise

| Slot | Preis | Dauer |
|---|---|---|
| Daily Boost | €9.99 | 24h |
| Weekly Boost | €49.99 | 7 Tage |
| Category Feature | €99.99 | 7 Tage |
| Homepage | €249.99 | 7 Tage |

---

## Content Delivery APIs

| Produkt-Typ | API-Call |
|---|---|
| `training_program` | POST http://training:5200/api/training/routines |
| `meal_plan` | POST http://nutrition:5100/api/nutrition/meal-plans |
| `supplement_protocol` | POST http://supplements:5300/api/supplements/stacks (requires_confirmation: true) |
| `bundle` | Alle relevanten Calls gleichzeitig |

---

## Cron Jobs

| Job | Schedule | Beschreibung |
|---|---|---|
| `update-search-scores` | Täglich 02:00 | Search Score aller aktiven Produkte |
| `cleanup-promotions` | Täglich 03:00 | Abgelaufene Boost Slots deaktivieren |
| `subscription-credits` | 1. des Monats 00:00 | Stripe Charge + Wallet Voucher Credit |
| `retry-failed-deliveries` | Täglich 04:00 | Failed License Delivery nochmal versuchen |

---

## Kompetitiver Vorteil

| Kriterium | Boostcamp | TrainHeroic | Gumroad | Eat This Much | **LumeOS** |
|---|:---:|:---:|:---:|:---:|:---:|
| Training Programs | ✅ | ✅ | 🟡 PDF | ❌ | **✅** |
| Meal Plans | ❌ | ❌ | 🟡 PDF | ✅ | **✅** |
| Supplement Protocols | ❌ | ❌ | 🟡 PDF | ❌ | **✅** |
| Cross-Module Bundles | ❌ | ❌ | ❌ | ❌ | **✅ UNIQUE** |
| In-App Integration (kein PDF) | ✅ | ✅ | ❌ | 🟡 | **✅** |
| Brand Partnerships | ❌ | ❌ | ❌ | ❌ | **✅** |
| Wallet-System | ❌ | ❌ | ❌ | ❌ | **✅** |
| Revenue Share | ? | 70/30 | 90/10 | — | **80/20** |

---

## Offene Punkte

| # | Beschreibung | Priorität |
|---|---|---|
| 1 | Creator Onboarding Flow vollständig | 🔴 |
| 2 | Stripe Integration (Top-up + Payouts) | 🔴 |
| 3 | Subscription-based Content Access | 🟡 |
| 4 | Affiliate/Physical Products | 🟡 |
| 5 | Advanced Creator Analytics | 🟡 |
| 6 | Tom's Entscheidung: Start-Zeitpunkt | 🔴 |

---

## Technologie-Stack

| Layer | Tech |
|---|---|
| API | Hono.js, Port 5700, TypeScript |
| Database | Supabase PostgreSQL, Schema `marketplace` |
| Marketplace App | Next.js 15 (apps/marketplace/, Port 8503) |
| Embedded | In apps/app/modules/marketplace/ |
| Payments | Stripe Connect (Top-up + Payout) |
| Search | PostgreSQL Full-Text + Search Score |
| Media | Supabase Storage |
| Scoring | packages/scoring/src/marketplace.ts |
| Contracts | packages/contracts/src/marketplace/ |
| i18n | DE/EN/TH (260+ Keys) |
