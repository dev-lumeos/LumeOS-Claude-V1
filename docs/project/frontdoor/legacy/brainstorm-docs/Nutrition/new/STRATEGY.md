# Nutrition Module — Strategie & Markt

## Markt-Landscape

**6 Major Players:** MyFitnessPal (200M registriert), YAZIO (100M+), Lifesum (60M+), Lose It! (50M+), FatSecret (12.9M aktiv), Cronometer (10M+)

**3 Kategorien:**
- Mass Market: MFP, YAZIO, Lifesum
- Budget: FatSecret, Lose It!
- Precision: Cronometer

**Preisrange:** $6.99/Jahr (FatSecret) bis $99.99/Jahr (MFP Premium+)

---

## Kritische Markt-Lücken

1. **Mikronährstoff-Tracking ist miserabel** — nur Cronometer trackt 138 Nährstoffe (BLS), alle anderen zeigen max. 5–10
2. **Keine echte Training-Integration** — alle Apps tracken Kalorienbedarf, aber KEINE passt Macros/Micros an Trainingsart an
3. **KI-Logging ist neu und schlecht** — MFP Meal Scan, Lifesum Photo → alle ungenau, kein Kontext-Verständnis
4. **Onboarding = Copy-Paste** — alle nutzen denselben Goal→Stats→Paywall-Flow
5. **Kein Cross-Module-Wissen** — Supplements, Bloodwork, Recovery haben KEINEN Einfluss auf Nutrition-Empfehlungen

---

## Competitor-Analyse

| | MFP | YAZIO | Cronometer | Lifesum | FatSecret | **Lumeos** |
|---|---|---|---|---|---|---|
| Food DB | ✅ 14M | ✅ | ❌ klein | 🟡 | ✅ 1.9M verifiziert | ✅ BLS-Basis |
| Mikronährstoffe | ❌ 5–10 | ❌ | ✅ 138 | ❌ | ❌ | ✅ 138 (3-Tier) |
| Training-Sync | ❌ Kalorien only | ❌ | ❌ | ❌ | ❌ | ✅ Deep |
| Supplement-Sync | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ Native |
| Bloodwork | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ Native |
| KI-Logging | 🟡 Basic | 🟡 | ❌ | 🟡 | 🟡 | ✅ Multi-Modal |
| UX/Design | 🟡 Legacy | ✅ Modern | ❌ Ugly | ✅ Best | ❌ | ✅ Modern |
| Free Barcode | ❌ Paywall | ✅ | ✅ | ❌ | ✅ | ✅ |
| Preis/Jahr | $99.99 | $44.99 | $49.99 | $45 | $6.99 | ~$59.99 |

---

## User Personas

### Lisa — Casual Dieter (60% der User)
- **Profil:** 28J, weiblich, will 5kg abnehmen
- **Pain:** Calorie Counting ist nervig, will schnelles Logging
- **Needs:** Barcode Scanner, KI-Scan, einfaches Dashboard, Meal Plans
- **Zahlungsbereitschaft:** Free, evtl. $4.99/mo nach 2 Wochen
- **Churn-Risiko:** Hoch — gibt nach 2–4 Wochen auf wenn zu komplex

### Max — Gym Bro (25% der User)
- **Profil:** 24J, männlich, Lean Bulk, 180g Protein/Tag
- **Pain:** Will Macros tracken ohne Mikro-Overhead, schnelles Logging zwischen Sets
- **Needs:** Quick-Add Macros, Meal Prep Templates, Training×Nutrition Sync
- **Zahlungsbereitschaft:** $9.99/mo wenn Training-Integration gut ist
- **Churn-Risiko:** Mittel — bleibt solange Gains kommen

### Dr. Sarah — Health Optimizer (10% der User)
- **Profil:** 42J, weiblich, Ärztin, will 138 Mikros tracken
- **Pain:** Cronometer ist hässlich, MFP zeigt keine Mikros
- **Needs:** Full Micronutrient Dashboard, Bloodwork Import, Custom Biometrics, Export
- **Zahlungsbereitschaft:** $19.99/mo — Preis irrelevant wenn Datenqualität stimmt
- **Churn-Risiko:** Niedrig — Power User, bleibt jahrelang

### Coach Mike — Fitness Coach (5% der User)
- **Profil:** 35J, männlich, Online-Coach, 30+ Clients
- **Pain:** Braucht Multi-Client Dashboard, kann nicht für jeden Client eine App haben
- **Needs:** Coach Dashboard, Client Nutrition Overview, Template Meal Plans, Bulk Assign
- **Zahlungsbereitschaft:** $29.99/mo Pro Plan
- **Churn-Risiko:** Sehr niedrig — Business-Tool

---

## Lumeos USPs

### Primary USP: "The Only Nutrition App That Knows Your Whole Health Picture"

Kein Competitor verbindet:
- **Was du isst** (Food Log, 138 BLS-Mikros)
- **Wie du trainierst** (Auto Calorie Adjustment, Protein Timing)
- **Was du supplementierst** (Redundancy Detection, Gap Analysis)
- **Was dein Blut sagt** (Deficiency Alerts, Optimal Ranges)
- **Wie du recovert** (Sleep → Nutrition Timing)
- **Was dein Ziel ist** (Adaptive TDEE, Phase-aware Macros)

**Kein Competitor hat mehr als 1 davon.**

### Secondary USPs

1. **Medical-Grade Mikros für Normalos** — Cronometer-Tiefe mit Lifesum-UX, 138 Nährstoffe mit progressivem Disclosure
2. **Barcode Scanner kostenlos** — MFPs größter Fehler war Barcode hinter Paywall. Sofortige Differenzierung.
3. **KI-First Logging** — Photo Scan + Voice + Smart Suggestions basierend auf Gewohnheiten
4. **Nutrition-Aware Supplements** — "Du supplementierst C aber isst 150% RDA → spare $15/mo"
5. **Training-Aware Nutrition** — "Leg Day: +400 kcal, +30g Protein, Magnesium abends"

---

## Monetisierung

> **Hinweis:** Das Monetarisierungskonzept wurde auf Wallet-basiertes System umgestellt. Abo = Wallet-Guthaben, Revenue = Transaktionsgebühren. Details: `system/wallet-and-monetization.md`. Die unten stehenden Tiers sind als Feature-Referenz gültig, Preise müssen angepasst werden.

### Feature-Tiers

| Tier | Kernfeatures | Ziel-Persona |
|---|---|---|
| **Free** | Food Logging (unbegrenzt), Barcode Scanner, Macro Dashboard, Water, Basis-Rezepte | Lisa |
| **Plus** | KI Photo Scan (MealCam), Micro Dashboard (Tier 1+2), Meal Plans, Training×Nutrition Sync, Ad-free | Lisa + Max |
| **Pro** | Full 138 Mikros (Tier 3), Bloodwork Integration, Custom Biometrics, API Export | Dr. Sarah |
| **Coach** | Multi-Client Dashboard, Template Builder, Client Reports, White-Label Reports | Coach Mike |

### Conversion-Trigger

- **Free → Plus:** Mikronährstoff-Teaser ("Du trackst nur 4 von 138 Nährstoffen") + KI-Photo-Scan nach 3 Trial-Tagen
- **Plus → Pro:** Bloodwork Import Prompt ("Lade deinen Bluttest hoch → personalisierte Empfehlungen")
- **Retention:** Weekly Nutrition Report, Streak System, Personal Bests

### Revenue Streams
1. Subscriptions (~80%) — Core Revenue
2. Data Licensing (~5%) — Lumeos Food-DB API für Drittanbieter
3. Affiliate Meal Delivery (~5%) — HelloFresh, Factor75
4. Supplement Recommendations (~5%) — Cross-sell zu Supplement-Modul
5. Coach Marketplace Commission (~5%) — Meal Plan Verkäufe

---

## Key Design-Entscheidungen

| Entscheidung | Rationale |
|---|---|
| BLS 4.0 statt USDA als Primärquelle | 138 Nährstoffe (3× USDA), Lab-Grade, kostenlos (CC BY 4.0), DACH-optimiert |
| Barcode im Free Tier | MFPs größter Fehler war Paywall — sofortige Differenzierung |
| 3-Tier Mikronährstoffe | Cronometer zeigt alles (overwhelming), MFP nichts (nutzlos) → Progressive Disclosure |
| Cross-Module als Core Architecture | DAS ist der USP — muss von Tag 1 native sein, nicht als Plugin |
| MealCam als Plus-Feature | ~$0.01/Scan × 1M Free User = $10K/mo. 3 kostenlose Scans als Trial |
| Eigene Food-DB statt API-First | Eigene DB = eigene Felder (Confidence, Allergen, Portions, i18n), kein Vendor-Lock |
| Hono statt Express | Kleinerer Footprint, bessere TS-Integration, Edge-kompatibel |
| nutrients_full JSONB + direkte Spalten | JSONB für alle 98 Nährstoffe; Spalten für 46 wichtigste → schnelle Aggregation |
| Separates nutrition Schema | Domain-Isolation, klare Ownership, Backward-Compat via Views |
