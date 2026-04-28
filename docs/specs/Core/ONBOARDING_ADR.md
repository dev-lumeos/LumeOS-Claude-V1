# Onboarding — Architecture Decision Record

**Datum:** April 2026
**Status:** Final

---

## Entscheidung

**Option C: 7-Step Kern-Onboarding + Post-Onboarding Setup-Cards**

### Kern-Onboarding (7 Steps, beim ersten Login)

| Step | Inhalt | Ziel-Module |
|---|---|---|
| 1 | Name, Sprache, Einheitensystem | Auth / User Profile |
| 2 | Körper: Geschlecht, Geburtstag, Größe, Gewicht, KFA | Goals (TDEE-Basis) |
| 3 | Experience Level: beginner / intermediate / advanced / elite | Goals, Nutrition Score, Training |
| 4 | Primärziel: 12 Goal-Typen (lean_bulk, moderate_cut, contest_prep...) | Goals → TDEE + Makro-Splits |
| 5 | Training: Frequenz, Dauer, Equipment, Routine-Vorschlag | Training |
| 6 | Nutrition: Diättyp, Allergien, Mahlzeiten/Tag, Likes/Dislikes | Nutrition (FoodPreferences, MealSchedule) |
| 7 | Summary + Abschliessen | Auth → alle Module via API |

**Beim Abschliessen:** `calculateTDEE()` → Goals-Targets setzen → alle Modul-Einstellungen initialisieren.

### Post-Onboarding Setup-Cards (in jedem Modul)

Nach dem Onboarding erscheinen in noch nicht konfigurierten Modulen **Setup-Cards**:

```
💊 Supplements
┌─────────────────────────────────────────────────────┐
│ 🟡 Dein Supplement-Stack ist noch leer              │
│ Füge deine aktuellen Supplements hinzu — dauert     │
│ nur 2 Minuten.                                      │
│                                          [Einrichten] │
└─────────────────────────────────────────────────────┘

😴 Recovery
┌─────────────────────────────────────────────────────┐
│ 🟡 Schlafziele noch nicht konfiguriert              │
│ Hast du ein Wearable? Verbinde es jetzt.            │
│                                          [Einrichten] │
└─────────────────────────────────────────────────────┘
```

Setup-Cards verschwinden sobald das Modul konfiguriert ist.
Sie erscheinen nur einmal pro Modul — kein permanenter Nag.

---

## Settings in jedem Modul (Universelles Pattern)

**Jedes Modul hat einen eigenen Settings-Tab** in der Tab-Navigation.

| Modul | Settings-Inhalt |
|---|---|
| 🍽️ Nutrition | Mahlzeiten-Zeitplan, Diättyp, Allergien, Likes/Dislikes, Mikro-Tier, MealCam-Schwelle |
| 🏋️ Training | Equipment, Trainings-Split, Progression-Methode, Einheiten, Volumen-Schwellen |
| 🤖 Coach | Autonomie-Level, Persona, Notification-Zeiten, Watcher-Regeln |
| 🎯 Goals | TDEE-Methode, Makro-Splits, Ziel-Phasen, Messmethoden |
| 💊 Supplements | Stack-Konfiguration, Reminder-Zeiten, Evidenz-Anzeige-Level |
| 😴 Recovery | Schlaf-Ziele, Wearable-Integration, Checkin-Frequenz |
| 🩺 Medical | Einheiten (mmol vs. mg/dl), Referenz-Bereiche, Arzt-Notizen |
| 🧠 Intelligence | Korrelations-Zeiträume, Alert-Schwellen, Anzeige-Präferenzen |
| 📈 Analytics | Daten-Export, Retention-Einstellungen |
| 🛒 Marketplace | Installierte Apps, API-Keys, Sync-Häufigkeit |
| ⚙️ Admin | User-Management, 2FA, API-Keys (nur für Owner/Coach) |

### Tab-Reihenfolge (universell)
```
[Haupt-Tabs des Moduls...] | ⚙️ Einstellungen
```

Settings ist immer der **letzte Tab** — kein primärer Tab, aber immer erreichbar.

### Beziehung Onboarding ↔ Modul-Settings

```
Onboarding Step 6 (Nutrition)
  → setzt: dietaryPreference, allergies, mealsPerDay, snacksPerDay
  → Nutrition Settings zeigt alle diese Werte und erlaubt detaillierte Anpassung

Onboarding Step 5 (Training)
  → setzt: trainingFrequency, equipment, suggestRoutine
  → Training Settings zeigt alle Werte + weitere Optionen (Progression, Split-Details)
```

Onboarding = **Quick-Start-Defaults**
Modul-Settings = **Volle Konfiguration**

---

## Was fehlt noch im Onboarding (für V1.1)

- `mealTimes: string[]` — Uhrzeiten pro Mahlzeit (Feld in types.ts, aber UI fehlt in Step6)
- Budget / Kochskill — aus Nutrition FoodPreference, aber nicht im Onboarding
- Supplements-Schnell-Setup — "Nimmst du bereits Supplements?" Step
- Recovery-Schnell-Setup — "Hast du ein Wearable / Schlaftracker?"

Diese kommen via **Setup-Cards** nach dem Onboarding, nicht in die 7 Kern-Steps.

---

## Technische Implikation

Onboarding bleibt **eigenes Modul** (`modules/onboarding/`).
POST `PUT /api/auth/onboarding` sammelt alles und verteilt an:
- `auth` → user profile (name, language, unitSystem, gender, birthDate, height, weight)
- `goals` → initial targets (via calculateTDEE + goal modifier)
- `nutrition` → food_preferences + meal_schedule
- `training` → training_profile (frequency, equipment)
