---
nr: G-228
typ: feature
modul: nutrition
schwere: mittel
angelegt: 2026-08-28
braucht: []
kind_von: null
entscheidung: E-46
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

## Bericht — Urteil: **Entscheidung**

**Claude Code, 2026-08-31.** Mitbeauftragt mit G-226. **Der vollstaendige Bericht steht in [G-226](nutrition-g-0226-v1-status-marker-fehlen-fuer-recipes-shopping-mealplans-co.md#bericht).**

### Die Messung im Punkt war falsch

`[cmd]` **`SPEC_04_FEATURES.md` gibt es in acht Modulen.** Die mit
`level_multiplier` ist **Nutrition**, nicht Recovery:
`docs/specs/Nutrition/01_current_specs/SPEC_04_FEATURES.md:336`.
`[read]` **Der Recovery-Umweg (C-143/C-218) fuehrt in die Irre.**

### Und die Inkonsistenz wirkt heute

`[cmd]` **Gemessen 2026-08-31:**

    SPEC_04:336                beginner | intermediate | advanced | elite
    profiles.experience_level  beginner | advanced | pro | elite  (CHECK)
    live                       2x 'pro', 5x NULL (7 Profile)
    diary-entwurf.tsx:31       die vier Namen der Spec, `?? 0.90`

`[read]` **Die Spec kennt `intermediate`, die Datenbank kennt `pro`.**
`[cmd]` **Ein `pro`-Profil faellt heute stillschweigend auf 0,90** —
den Wert fuer `intermediate`.

**Die Frage:** *welche vier Stufen gelten, und welchen Faktor traegt
die vierte?* `[read]` Die Namen sind austauschbar, der Faktor nicht.

`[read]` **Zusammenhang zu E-25:** NRF9.3 kennt keinen Stufenfaktor.
**Die Stufen gehoeren zum Entwurfsscore, nicht zum entschiedenen.**

## Geprueft am 2026-08-31 — und der Befund wirkt

`[cmd]` **Meine Messung im Punkt war falsch:** `SPEC_04_FEATURES.md`
gibt es in acht Modulen, **die mit `level_multiplier` ist Nutrition.**

`[cmd]` **Die Spec kennt `intermediate`, die Datenbank kennt `pro`** —
**ein `pro`-Profil faellt still auf 0,90.**

`[read]` **Der wirkende Teil ist als G-283 herausgeloest.** **Hier
bleibt die Entscheidung: welche vier Stufennamen gelten, und welchen
Faktor traegt die vierte?**

## Entschieden: E-46, 2026-09-02

Tom: *,,maximale aufsplittung des Erfahrungsgrad, je mehr stufen wir
haben umso genauer koennen wir die multiplikatoren nutzen."*

`[read]` **Die Luecke wird nicht durch Angleichen geloest, sondern
durch Ausbauen.**

`[read]` **Zwei Sachen sind vorher zu klaeren:** `[cmd]` **wie viele
Stufen**, und **woran der Multiplikator fachlich haengt** —
Trainingsjahre, Koerperzusammensetzung, etwas anderes.

`[cmd]` **Und die 0,90 fuer `intermediate` steht in `SPEC_04` ohne
Quelle.** `[read]` **Nach C-109 gilt: eine Zahl ohne Beleg ist ein
*conservative default*, kein Ergebnis.**
