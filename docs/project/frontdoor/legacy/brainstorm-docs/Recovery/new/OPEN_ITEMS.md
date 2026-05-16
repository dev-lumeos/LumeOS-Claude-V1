# Recovery Module — Offene Punkte, Bugs & Geplante Features

## 🔴 Kritische Bugs / Ausstehend

### Bug 1: Trigger Score-Berechnung — Cross-Schema Calls
**Problem:** Der `trg_compute_recovery_score` Trigger kann nicht direkt auf `nutrition.*` zugreifen für Nutrition Compliance.
**Workaround:** Trigger setzt `nutrition_compliance = 70` (neutral) als Fallback. Echter Wert wird via API beim Score-Endpoint-Aufruf ergänzt.
**Fix:** API-Layer holt Nutrition Compliance nach und aktualisiert `recovery_scores.nutrition_compliance_used`.

### Bug 2: Phone Camera HRV — scaffolded, nicht fertig
**Status:** Code-Rahmen existiert, PPG-Algorithmus fehlt.
**Was fehlt:** PPG Signal Extraktion aus Camera Frames, R-R Intervall Berechnung, RMSSD Algorithmus.

---

## 🟡 Mittlere Priorität

### Feature: Phone Camera HRV vollständig implementieren
**Beschreibung:** 60s Messung, Finger auf Kamera + Flashlight, RMSSD berechnen
**Referenz:** HRV4Training Paper (r=0.98 vs. Chest Strap)

### Feature: WHOOP Direct API (Tier 2)
**Beschreibung:** Detailliertere Recovery + Strain + Sleep Daten als via HealthKit
**Dokumentation:** https://developer.whoop.com

### Feature: Oura Direct API (Tier 2)
**Beschreibung:** Detailliertere Sleep Stages + Readiness als via HealthKit

### Feature: Coach-Access zu Recovery-Daten
**Beschreibung:** Human Coach sieht Recovery-Trends seiner Clients
**Abhängigkeit:** Human Coach Modul (5600)

### Feature: Garmin Body Battery Sync
**Beschreibung:** Tier 2 Direktintegration

---

## 🟢 Niedrige Priorität

### Feature: Erweiterte Protocol Template Library
**Status:** 5 Protokolle vorhanden
**Geplant:** Mehr spezifische Protokolle (Overreach nach Wettkampf, Post-Verletzung spezifisch, etc.)

### Feature: Community Recovery Insights (anonymisiert)
**Beschreibung:** "User mit ähnlichem Trainingsvolumen haben im Ø X Score"

### Feature: Apple Watch Standalone Recovery Check-in
**Beschreibung:** Morning Check-in direkt von Watch ohne Handy

### Feature: Smart Alarm
**Beschreibung:** Weckt User am optimalen Zeitpunkt im Schlafzyklus (via Wearable oder Mic)

---

## Offene Design-Fragen

| Frage | Empfehlung |
|---|---|
| Muscle Recovery Map ohne Training-Daten? | 100% für alle Gruppen (konservative Annahme) |
| Multiple HRV-Messungen pro Tag? | Nur Morgen-Messung als Baseline, weitere als optionale Zusatzdaten |
| Schlafqualität — Wearable vs. subjektiv wenn Widerspruch? | Wearable preferred wenn confidence > 0.8, sonst Durchschnitt |
| Recovery Protokoll — kann Coach zuweisen? | Ja, via Human Coach Modul |
| Übertraining Alert — kann User deaktivieren? | Nein — Sicherheits-Feature |

---

## Bekannte Technische Schulden

| Schuld | Beschreibung |
|---|---|
| `nutrition_compliance` im Trigger | Fallback = 70, echter Wert kommt via API nach |
| `muscle_readiness` VIEW | Holt direkt aus `training_load_logs` statt via API-Call — ok für jetzt |
| `weekly_recovery_stats` Materialized View | Braucht manuelle/Cron-basierte Refresh-Strategie |
| Checkin Draft Store | Bei App-Crash verloren — sollte in localStorage persistiert werden |
