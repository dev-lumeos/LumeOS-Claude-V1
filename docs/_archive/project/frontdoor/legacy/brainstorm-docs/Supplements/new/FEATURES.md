# Supplements Module — Features

## Implementierte Features

### 1. Supplement Catalog

Kuratierte, evidence-graded Standard-Supplement-Datenbank.

- Evidence Grades: S / A / B / C / D / F (ISSN/Examine.com basiert)
- Kategorien: Vitamins, Minerals, Performance, Recovery, Adaptogens, Sleep, Gut Health, Longevity, Amino Acids
- nutrients_provided JSONB mit BLS-Nährstoff-Codes
- 3-sprachig (DE/EN/TH), pg_trgm Suche
- Sortierung nach Evidence Grade (S zuerst)

Code: `routes/catalog.ts` · `supplements.supplement_catalog` · `CatalogView.tsx` · `useCatalogSearch.ts`

---

### 2. Enhanced Substances Catalog

~85 kuratierte PED-Compounds in 10 Kategorien.

- Kategorien: AAS (Testosterone Esters, Oral, Injectable), SARMs, Peptides, GH, GLP-1, PCT, AI, Support
- Felder: hepatotoxicity_level, cardiovascular_risk, androgenic/anabolic_rating, requires_pct/ai/serm, aromatization, detection_time_days, legal_status JSONB
- Aliases für Handelsnamen + Slang
- Nur sichtbar wenn Enhanced Mode aktiviert (RLS Policy)
- Bloodwork Panel: 30+ Pflicht-Marker Pre/Mid/Post Cycle

Code: `routes/enhanced.ts` · `supplements.enhanced_substances` · `EnhancedCatalog.tsx`

---

### 3. Stack Management

- Beliebig viele Stacks pro User
- CONSTRAINT: Nur 1 Stack gleichzeitig aktiv (DB EXCLUDE)
- Aktivierung deaktiviert automatisch alle anderen
- Quellen: user / coach / marketplace / template
- Trigger: `trg_update_stack_count` aktualisiert item_count

Code: `routes/stacks.ts` · `supplements.user_stacks` · `StackView.tsx` · `useStacks.ts`

---

### 4. Stack Items

- Beliebige Dosis, Timing, Frequenz, Custom-Name pro Item
- Timing: morning / midday / evening / pre_workout / post_workout / bedtime
- Frequenz: daily / weekdays / training_days / cycling
- Cycling: JSONB {on_weeks, off_weeks, start_date}
- DB CONSTRAINT: genau eines von supplement_id oder enhanced_substance_id gesetzt

Code: `routes/items.ts` · `supplements.stack_items` · `StackItemRow.tsx`

---

### 5. Daily Intake Logging

- Tages-Generierung: IntakeLogs für aktiven Stack (Cron / App-Open, idempotent)
- Status: pending → taken / skipped / snoozed
- UNIQUE (user_id, stack_item_id, date)
- Cycling-Check: heute "off" → kein IntakeLog erstellt
- Compliance-Berechnung: taken / (taken + skipped + pending)

Code: `routes/intake.ts` · `supplements.intake_logs` · `TodayView.tsx` · `useTodayIntake.ts`

---

### 6. Interaction Checker

Regelbasiert, deterministisch. Läuft bei: Item hinzufügen, Stack aktivieren.

- Findet alle Interactions wo BEIDE Supplements im Stack sind
- Severity: info / caution / warning / critical
- critical + blocks_intake=true → Einnahme gesperrt in UI
- Synergien positiv markiert (z.B. Vitamin D + K2)

Kern-Interactions: Calcium+Iron (warning, separate_2h), Vitamin D+K2 (synergy), St.John's Wort+SSRIs (critical, BLOCK), Blood Thinners+Omega-3 (critical, BLOCK)

Code: `routes/interactions.ts` · `supplements.supplement_interactions` · `InteractionList.tsx`

---

### 7. Intelligence Engine (USP)

**Gap Analysis:** Food Log → 138 BLS-Mikros → RDA Comparison → fehlende Nährstoffe + Stack-Coverage
**Redundancy Detection:** nutrients_provided JSONB → Ingredient Overlap → >150% RDA → Warnung
**Training-Aware Timing:** Workout-Typ → Pre/Post Stack empfehlen / Rest Day: Pre weglassen
**Meal-Based Timing:** Mahlzeit-Schedule → "Vitamin D mit Mittagessen (Fett nötig)"
**Cost Tracking:** Monatliche Stack-Kosten + Einsparpotential durch Redundancy-Removal

Code: `routes/intelligence.ts` · `InsightsView.tsx` · `useGapAnalysis.ts` · `useRedundancies.ts`

---

### 8. Inventory Management

- Bestand in Kapseln/g/ml/servings
- Low-Stock Alert (konfigurierbar, default: 7 Tage)
- Verbrauchsrate: current_stock / daily_consumption (Tage bis leer)
- Ablaufdatum-Alert 30 Tage vor Ablauf

Code: `routes/inventory.ts` · `supplements.user_inventory` · `InventoryView.tsx`

---

### 9. Enhanced Mode Security

- Opt-In: Explizite Einwilligung + Age Verification + Timestamp in DB
- Separater UI-Bereich (nie in Standard-Flows)
- RLS: `enhanced_mode = true` in `user_supplement_settings`
- Enhanced Intake Logs getrennt (mode='enhanced')
- Interaction-Checker extended auf Enhanced+Standard

Code: `routes/enhanced.ts` · `supplements.user_supplement_settings` · `EnhancedGate.tsx`

---

### 10. Compliance Score

Evidence-gewichtet: Creatine (S) vergessen → mehr Malus als Glutamin (D).
```
weighted_compliance = Σ (EVIDENCE_WEIGHT[grade] wenn taken) / Σ EVIDENCE_WEIGHT aller entschiedenen Items
```

Code: `packages/scoring/src/supplements.ts` · `routes/analytics.ts`

---

### 11. Stack Templates

5 System-Templates: Muscle Building / Daily Health / Fat Loss / Recovery & Sleep / Longevity
Coach-Templates: via Human Coach Modul mit `source: 'coach'`

Code: `supplements.stack_templates` + `stack_template_items` · `TemplateSelector.tsx`

---

### 12. i18n

350+ Übersetzungs-Keys in DE/EN/TH. TH initial NULL.

---

## Geplante Features

### Höchste Priorität

| Feature | Beschreibung |
|---|---|
| Barcode-Scanner für Inventory | Produkt einscannen → Inventory-Eintrag |
| Supplement-Food Interactions | Eisen + Kaffee, Vitamin D + Milch |
| Marketplace Integration | Supplement-Produkte direkt kaufen |

### Mittlere Priorität

| Feature | Beschreibung |
|---|---|
| Ablaufdatum-Tracking | Erinnerung vor Ablauf |
| Effectiveness Tracking | Medical Bloodwork → Supplement-Wirksamkeit über Zeit |
| Supplement Brand DB | Spezifische Produkte mit COA |

### Niedrige Priorität

| Feature | Beschreibung |
|---|---|
| Community Stack-Sharing | Stacks teilen |
| AI Supplement Advisor | Smart Empfehlungen via Buddy |
