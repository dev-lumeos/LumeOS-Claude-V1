---
nr: G-222
typ: befund
modul: nutrition
schwere: hoch
angelegt: 2026-08-28
braucht: []
kind_von: null
entscheidung: null
beruehrt:
  dateien: [docs/specs/Nutrition/05_reviews/OPUS_REVIEW_NUTRITION_03_UI_FLOWS_READINESS.md]
zahlen: null
---

# G-222 — Onboarding Flow für Nutrition Preferences fehlt in SPEC_03

## Befund

**Aus `OPUS_REVIEW_NUTRITION_03_UI_FLOWS_READINESS.md`, CRIT-3.**
`[read]` **Wortlaut der Review, nicht vom Orchestrator formuliert.**

`NUTRITION_NEXT_SPEC_DECISIONS.md §6` und `ADR_NUTRITION_PREFERENCES_V1.md` fordern einen Onboarding-Flow für:
- Allergien (Hard)
- Unverträglichkeiten (Strong)
- Ernährungsform / Diät-Stil
- Religiöse/kulturelle Einschränkungen (Hard wenn User so setzt)
- No-Go-Lebensmittel
- Likes / Dislikes
- Bevorzugte Küchen
- Meal-Slots
- Zielrichtung

`SPEC_10_PASS2_PATCH.md` definiert dafür:
- 9 Components (`OnboardingPreferencesStep`, `DietTypeSelector`, `AllergenSelector`, `IntoleranceSelector`, `ReligiousDietarySelector`, `FoodLikesInput`, `FoodDislikesInput`, `MealSlotEditor`, `CuisinePreferenceSelector`)
- 4 Onboarding-Steps (Diät+Allergien+Unverträglichkeiten → Religiös → Likes/Dislikes → Meal-Slots+Ziel)

`SPEC_03_USER_FLOWS.md` enthält **keinen** dedizierten Onboarding-Flow:
- Flow 9 "Food Preferences setzen" beschreibt **Settings-Pflege**, nicht erstmaliges Onboarding.
- Kein Trigger-Event spezifiziert (z. B. "nach Sign-up", "vor erstem Diary-Tag").
- Kein Abbruch-/Skip-Verhalten dokumentiert.
- Kein Übergang spezifiziert (Onboarding → Diary, oder Onboarding → Goals → Diary?).
- Validierung pro Step (Pflicht- vs. Optional-Felder) nicht dokumentiert.
- Wiederaufnahme bei Abbruch (`onboarding_complete = false`) nicht beschrieben.

**Konsequenz:** Workorders für Onboarding-Components sind ohne Flow nicht klar abgrenzbar. UX-Entscheidungen (Step-Reihenfolge, Skippability, Wiederaufnahme) sind offen.

---

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

`[cmd]` **Gemessen 2026-08-30: keine Spalte `onboarding` im
ganzen Schema, `food_preferences` hat 2 Zeilen.**
`[read]` **Tom, 2026-08-30:** *,,wir bauen ein initiales komplettes
onboarding fuer jeden user wenn er nach der registrierung sich
einloggt."* **Damit ist das Ob entschieden.**
`[cmd]` **Und die Spec traegt es:** `SPEC_03_USER_FLOWS.md` der
Buddy-Spec zeigt vier Schritte, `SPEC_10_PASS2_PATCH.md` neun
Komponenten.

## Auftrag

**Mitbeauftragt mit G-226 am 2026-08-30.** Der Auftragstext
und der Bericht stehen dort.

## Bericht — Urteil: **Entscheidung**, enger gefasst

**Claude Code, 2026-08-31.** Mitbeauftragt mit G-226. **Der vollstaendige Bericht steht in [G-226](nutrition-g-0226-v1-status-marker-fehlen-fuer-recipes-shopping-mealplans-co.md#bericht).**

`[cmd]` **Das Ob ist entschieden** (Tom, 2026-08-30). `[cmd]`
**Gebaut ist nichts:** keine `onboarding`-Spalte im ganzen Schema,
**und keine der neun Komponenten existiert im Code** — sie stehen nur
in `SPEC_10_PASS2_PATCH.md`.

`[read]` **Was die Review vermisst, fehlt weiterhin** — und es ist
kein Bauteil, sondern ein Ablauf: Ausloeser, Abbruch, Wiederaufnahme,
Uebergang, Pflichtfelder je Schritt.

**Die eine Frage:** *darf das Onboarding uebersprungen werden?*

`[read]` **Daran haengt alles Uebrige.** Ist es Pflicht, braucht es
keinen Wiederaufnahmezustand und keinen Abbruchweg. **Ist es
ueberspringbar, braucht es eine Spalte fuer den Fortschritt und eine
Regel, wann erneut gefragt wird.**

`[read]` **Die Inhalte sind ausdruecklich NICHT die Frage** — Tom
legt sie spaeter fest, wenn ein repraesentativer Datenbestand
vorliegt.

## Geprueft am 2026-08-31

**Urteil aus G-226:** Entscheidung: darf das Onboarding uebersprungen werden?
Alles Weitere folgt daraus.

`[read]` **Die Messung steht in der G-226-Datei.**
