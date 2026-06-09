# Goals Module — Offene Punkte, Bugs & Geplante Features

## Status: Vollständig implementiert (2026-04-14)

---

## 🔴 Kritische Bugs / Ausstehend

### Bug 1: TDEE Adaptive — Cross-Schema Daten
**Problem:** Adaptive TDEE benötigt wöchentliche Nutrition-Daten (Kalorien) + Gewichtsdaten.
Gewicht kommt aus `nutrition.weight_logs`, Kalorien aus `nutrition.daily_nutrition_summary`.
**Fix:** Wöchentliche Batch-Berechnung via Cron (Sonntag 23:59) die beide Schemas abfragt.

### Bug 2: Contribution Score Aggregation — Timing
**Problem:** Wenn Modules ihre Contributions zu unterschiedlichen Zeiten des Tages posten,
kann der Goals-Progress für den Tag inkonsistent sein.
**Fix:** Contribution Aggregation immer auf Tagesbasis — nicht live, sondern 1× täglich oder beim Abruf.

---

## 🟡 Mittlere Priorität

### Feature: Scenario Modeling UI
**Beschreibung:** Interaktive "Was-wenn"-Szenarien: "Wenn ich Schlaf auf 7.5h erhöhe..."
**Was fehlt:** Frontend UI + Prediction-Algorithmus mit Multi-Variable Input

### Feature: Goal Templates Library
**Beschreibung:** Vorgefertigte Templates für häufige Ziele (z.B. "10kg abnehmen in 16 Wochen")
mit vorkonfigurierten Phasen und Macro-Targets

### Feature: Contest Prep Checklist
**Beschreibung:** Peak Week Protokoll-Assistent mit täglichen Tasks

### Feature: Photo Session Improve
**Beschreibung:** Automatische Beleuchtungs-Bewertung, Distanz-Hinweise, Zeitstempel-Overlay

---

## 🟢 Niedrige Priorität

### Feature: Social Goals
**Beschreibung:** Ziele mit Coach oder Trainingspartner teilen (geteilte Accountability)

### Feature: Timelapse Generator
**Beschreibung:** Automatischer Fortschritts-Film aus Fotos (gleiche Pose, verschiedene Daten)

### Feature: Wearable TDEE Sync
**Beschreibung:** Apple Health Steps/Kalorien verbessern TDEE-Kalibrierung

### Feature: Annual Plan Expert Mode vollständig
**Beschreibung:** EXPERT_BB_ANNUAL mit vollständiger Auto-Transition UI

---

## Offene Design-Fragen

| Frage | Empfehlung |
|---|---|
| Wie viele aktive Goals gleichzeitig? | Max. 3 aktive Goals (1 Primary + 2 Secondary) |
| Phase-Wechsel ohne Ziel? | Ja — Phase ist unabhängig vom konkreten Ziel wählbar |
| TDEE-Override durch User? | Ja — User kann adaptiven Wert manuell überschreiben |
| Contribution Scores rückwirkend änderbar? | NEIN — append-only (historische Integrität) |
| Visual AI Analyse Frequency? | Max. 1 Analyse/Session — Kosten (Claude Vision API) |
| Body Comp Photos — private by default? | JA — is_private = true, explizites Sharing nötig |

---

## Bekannte Technische Schulden

| Schuld | Beschreibung |
|---|---|
| `user_goal_dashboard` Materialized View | Braucht Refresh nach Contribution-Update |
| `body_measurements.muscle_mass_kg` Generated Column | PostgreSQL GENERATED STORED — erfordert body_fat_pct |
| TDEE Formula Woche 1 | Harris-Benedict erfordert age/height aus User-Profil (cross-schema) |
| Phase Transitions | Nur manuell via API — kein automatischer Guard-Trigger in DB |
| Photo Storage | URLs in DB, Dateien in Supabase Storage — kein CDN-Setup dokumentiert |
