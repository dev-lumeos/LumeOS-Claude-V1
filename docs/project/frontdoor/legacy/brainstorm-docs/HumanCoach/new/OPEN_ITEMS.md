# Human Coach Module — Offene Punkte, Bugs & Geplante Features

## Status: 95% MVP komplett (2026-04-14)

---

## 🔴 Kritische Bugs / Ausstehend

### Bug 1: Permission Check bei Cross-Schema Reads
**Problem:** Coach Dashboard liest Daten aus anderen Modul-Schemata (Nutrition, Training etc.).
Muss sicherstellen dass Permission Check IMMER vor jedem Datenabruf steht.
**Fix:** Permission-Middleware in allen Client-Data-Endpoints. Kein Bypass möglich.

### Bug 2: Alert Rule Cooldown Race Condition
**Problem:** Bei gleichzeitiger Auswertung mehrerer Clients könnte eine Regel mehrfach feuern.
**Fix:** DB-Level Locking auf `coach_rules.last_triggered_at` beim Update.

---

## 🟡 Mittlere Priorität

### Feature: Voice Notes im Chat
**Beschreibung:** Audio-Nachrichten (30–120s) im In-App Chat

### Feature: Video Call Integration
**Beschreibung:** Zoom/Google Meet Link + Session Notes in Client-Timeline

### Feature: Auto-Reminders für Check-ins
**Beschreibung:** Push Notification wenn wöchentlicher Check-in fehlt (Autonomy-abhängig)

### Feature: AI Clone Engine
**Beschreibung:** Coach uploaded Methodology → Fine-tuned LLM antwortet als Coach
**Abhängigkeit:** AI/Buddy Modul (5500), Premium Add-on

### Feature: Multi-Coach / Team Support
**Beschreibung:** Studio mit mehreren Coaches — Clients zwischen Coaches übergeben

### Feature: Client Onboarding Wizard
**Beschreibung:** Geführter Onboarding-Flow für neue Clients (Ziele, Verletzungen, Diät, Supplements)

---

## 🟢 Niedrige Priorität

### Feature: Coach Branding
**Beschreibung:** Eigenes Logo, Farbschema, Domain

### Feature: Coach Directory
**Beschreibung:** Öffentliches Profil für Neukunden (Coach suchen)

### Feature: Compliance Leaderboard
**Beschreibung:** Anonymisierter Vergleich der Clients untereinander

### Feature: White-Label
**Beschreibung:** Enterprise: Eigenes Branding der gesamten App

### Feature: AI-Based Adherence Predictions
**Beschreibung:** ML-Vorhersage wann Adherence-Drop droht → proaktive Intervention

---

## Offene Design-Fragen

| Frage | Empfehlung |
|---|---|
| Kann Coach direkt in User-Daten schreiben? | NEIN — Read-only. Coach schlägt vor, Client bestätigt/übernimmt. |
| Medical Permission default? | none — muss explizit vom Client freigegeben werden |
| AI Clone antwortet mit Lumeos-Daten des Clients? | Ja, wenn Client Permission erteilt hat |
| Enhanced Mode Bloodwork — Coach sieht das? | Nur wenn medical: full Permission + Enhanced Mode bestätigt |
| Kann Coach Goals ändern? | Nein — kann Goal-Adjustments vorschlagen, Client bestätigt |

---

## Bekannte Technische Schulden

| Schuld | Beschreibung |
|---|---|
| `coach_dashboard_cache` Materialized View | Braucht automatischen Refresh (alle 5 Min via Cron) |
| `current_client_count` in coach_profiles | Wird via Trigger oder Cron aktualisiert — Trigger fehlt noch |
| Permission API | Aktuell werden Permissions manuell geprüft — sollte Middleware werden |
| Adherence Berechnung | Aktuell täglich via Cron — sollte event-driven nach Check-in sein |
