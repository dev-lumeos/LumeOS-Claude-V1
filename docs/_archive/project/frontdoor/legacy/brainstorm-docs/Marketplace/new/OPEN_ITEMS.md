# Marketplace Module — Offene Punkte, Bugs & Geplante Features

## Status: Implementiert (Details ausstehend, 2026-04-14)

---

## 🔴 Kritische Bugs / Ausstehend

### Feature: Creator Onboarding Flow
**Status:** Konzept definiert, nicht implementiert
**Was fehlt:** Multi-Step Verifizierung, Portfolio Review, Stripe Connect Onboarding

### Feature: Stripe Integration vollständig
**Status:** Scaffolded
**Was fehlt:** Top-up via Stripe Checkout, Payouts via Stripe Connect, Webhook-Handling

---

## 🟡 Mittlere Priorität

### Feature: Subscription-based Content Access
**Beschreibung:** Monatliche Programme mit automatischer Renewal (z.B. AI Coach Persona $15/mo)

### Feature: Affiliate/Physical Products
**Beschreibung:** Supplement-Produkte als Affiliate Links mit Bestand-Tracking

### Feature: Advanced Creator Analytics
**Beschreibung:** Completion Rate, Wiederkäufer, Cohort Analysis, Earnings Forecast

### Feature: Free Tier Programmes (Boostcamp-Strategie)
**Beschreibung:** Hochwertige gratis Inhalte als User-Akquisition-Funnel

### Feature: Creator Bundle Builder
**Beschreibung:** Creator kann eigene Cross-Module Bundles zusammenstellen

### Feature: Tom's Entscheidung: Marketplace Start-Zeitpunkt
**Status:** Ausstehend — Marketplace startet nach Human Coach Approval?

---

## 🟢 Niedrige Priorität

### Feature: Crypto Payment Option
**Beschreibung:** Wallet Top-up mit Crypto (USDC etc.)

### Feature: Gift Marketplace
**Beschreibung:** Programme als Geschenk für Freunde kaufen

### Feature: Referral System
**Beschreibung:** User wirbt User → Bonus Voucher für beide

---

## Offene Design-Fragen

| Frage | Empfehlung / Status |
|---|---|
| Transaktionsgebühren in % (TBD) | Konzept definiert, Zahlen ausstehend |
| Abo-Preise User-Tiers | TBD — Konzept: Voucher = Abo-Betrag |
| AI Micro-Transaction Preise | TBD — z.B. MealCam: €0.02/Scan |
| Free vs. Premium Feature Split | TBD pro Modul |
| Mobile IAP (Apple 30%) | Strategie: Nudge zu Web Purchase, oder 30% absorbieren |
| Wallet Min Balance | Kann Wallet negativ werden? Empfehlung: Nein |
| Mehrwährungen | EUR only für Phase 1, Multi-Currency Phase 2 |
| B2B Auszahlungs-Zyklen | Weekly / Monthly / On-Demand (nur B2B) |
| Rechtliche Prüfung Voucher-Modell | Goodwill Voucher vs. E-Geld-Richtlinie DE/EU/TH |

---

## Bekannte Technische Schulden

| Schuld | Beschreibung |
|---|---|
| `product_search_score` | Täglich via Cron berechnen — kein Live-Update |
| `purchase_count` / `avg_rating` in `products` | Denormalized — muss bei Reviews/Orders aktuell gehalten werden via Trigger |
| Wallet Transaktionen atomicity | DB-Transaktion ist kritisch — kein Partial-Update erlaubt |
| Content Delivery Retry | Bei failed Delivery kein automatischer Retry implementiert |
| Mobile IAP | Kein Apple/Google IAP Integration geplant — Web-Kaufflow als Workaround |
