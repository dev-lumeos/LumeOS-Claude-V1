---
nr: G-228
typ: entscheidung
modul: nutrition
schwere: mittel
angelegt: 2026-08-28
braucht: []
kind_von: null
entscheidung: null
agent: claudecode
beauftragt: 2026-08-30
beruehrt:
  dateien: [docs/specs/Nutrition/05_reviews/OPUS_REVIEW_NUTRITION_03_UI_FLOWS_READINESS.md]
zahlen: null
---

# G-228 — Score Level Multiplier inkonsistent zwischen SPEC_04 und SPEC_07

## Befund

**Aus `OPUS_REVIEW_NUTRITION_03_UI_FLOWS_READINESS.md`, IMP-6.**
`[read]` **Wortlaut der Review, nicht vom Orchestrator formuliert.**

`SPEC_04_FEATURES.md §Feature 11 (Nutrition Score)`:
> level_multiplier: beginner 0.75 | intermediate 0.90 | advanced 1.00 | **elite 1.10**

`SPEC_07_API.md §8 Score Response`:
```json
{
  "level_multiplier": 0.90,
  "user_level": "intermediate"
}
```

Vier Level in SPEC_04 (beginner/intermediate/advanced/elite). SPEC_07-Response zeigt nur `intermediate` als Beispiel. Es ist nicht spezifiziert, woher `user_level` kommt — User-Profil-Feld? Wo gepflegt? Settings-UI? Nicht belegt.

`SPEC_10` `NutritionScoreCard` zeigt Score 0–100 + Status, aber keine UI für Level-Multiplier-Erklärung oder -Auswahl.

**Konsequenz:** Score-Berechnung hat externen Input (`user_level`), dessen UI-/API-Pfad nicht spezifiziert ist. Workorder ist blockiert bis das geklärt ist.

## Stand

`[read]` **Die Review stammt aus der Spec-Phase und ist nicht gegen
den heutigen Stand geprueft.** `[cmd]` **Sie kennt die Entscheidungen
vom 27./28.08. nicht** — was sie fordert, kann inzwischen entschieden
oder erledigt sein.

## Gegen den heutigen Stand gemessen, 2026-08-30

`[read]` **Dieser Punkt stammt aus
`OPUS_REVIEW_NUTRITION_03_UI_FLOWS_READINESS.md`** — **einer
Spec-Review von vor dem `/v2/`-Umbau.** `[cmd]` **Acht Punkte kommen
aus derselben Datei.**

`[cmd]` **Zu messen: gilt die Inkonsistenz noch?** `[cmd]`
**`SPEC_04_FEATURES.md` liegt unter `docs/specs/Recovery/`** — und
Recovery hat seit C-143/C-218 einen eigenen offenen Punkt zur
Normierung.

## Auftrag

**Mitbeauftragt mit G-226 am 2026-08-30.** Der Auftragstext
und der Bericht stehen dort.
