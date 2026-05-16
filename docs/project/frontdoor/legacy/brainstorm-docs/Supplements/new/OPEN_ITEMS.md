# Supplements Module — Offene Punkte, Bugs & Geplante Features

## 🔴 Kritische Bugs / Ausstehend

### Bug 1: Intake-Generierung Cycling-Check fehlt
**Problem:** `POST /intake/generate` erstellt IntakeLogs auch für Cycling-Off-Tage.
**Fix:** `isCyclingOnDay()` vor INSERT prüfen — wenn Off-Tag → kein Log erstellen.

### Bug 2: Stack-Aktivierung race condition
**Problem:** Bei schnellen doppelten Klicks könnten theoretisch 2 Stacks aktiv sein.
**Fix:** EXCLUDE Constraint ist in DB vorhanden — sicherstellen dass `onConflict` korrekt gehandelt wird.

---

## 🟡 Mittlere Priorität

### Feature: Barcode-Scanner für Inventory
**Beschreibung:** Produkt einscannen (EAN/UPC) → automatisch Inventory-Eintrag anlegen
**Lookup-Flow:** eigene DB → Open Food Facts → manual entry

### Feature: Supplement-Food Interactions
**Beschreibung:** Eisen + Kaffee, Vitamin D + Milch, Kalzium + Antibiotika
**Was fehlt:** Neue `interaction_type = 'food_interaction'` in supplement_interactions + UI

### Feature: Marketplace Integration (Affiliate)
**Beschreibung:** Supplement-Produkte direkt kaufen, Affiliate-Links
**Abhängigkeit:** Marketplace-Modul (5700)

### Feature: Ablaufdatum-Tracking
**Beschreibung:** Erinnerung 30 Tage vor Ablauf
**Was fehlt:** Push-Notification oder Pending-Action wenn expiry_date < now + 30d

---

## 🟢 Niedrige Priorität

### Feature: Effectiveness Tracking
**Beschreibung:** Supplement-Logs + Medical Bloodwork → "Vitamin D: 18 → 52 ng/mL in 3 Monaten ✅"
**Abhängigkeit:** Medical Modul (5800) vollständig

### Feature: Supplement Brand DB
**Beschreibung:** Spezifische Produkte mit COA (Certificate of Analysis), z.B. "Now Foods D3 2000IU"

### Feature: Community Stack-Sharing
**Beschreibung:** `is_public = true` auf user_stacks → Discovery Feed

### Feature: AI Supplement Advisor via Buddy
**Beschreibung:** Komplexe Empfehlungen basierend auf Profil, Bloodwork, Zielen

---

## Offene Design-Fragen

| Frage | Empfehlung |
|---|---|
| Evidence Grades — wer pflegt die Datenbank? | Internes Curation Team, quartalsweise Review |
| Enhanced Mode age verification — wie robust? | Checkbox + Bestätigung, kein echtes KYC |
| Interaction DB — automatisches Update aus PubMed? | Mittelfristig via Semantic Scholar API |
| Stack-Templates von Coach — wie zuweisen? | Via Human Coach Modul (5600) |
| Compliance-Score — enhanced Items einschließen? | Ja, mit separater Berechnung |

---

## Bekannte Technische Schulden

| Schuld | Beschreibung |
|---|---|
| `nutrient_to_supplement` Mapping | Aktuell hardcoded in TypeScript — sollte in DB oder Config |
| Gap Analysis RDA-Werte | Hardcoded — sollte aus `user_nutrition_goals` kommen |
| Enhanced Mode RLS | Muss sicherstellen dass `user_supplement_settings` existiert vor dem ersten Enhanced-Zugriff |
| Materialized View für Compliance | Für Performance bei vielen Users: intake_compliance als Materialized View |
