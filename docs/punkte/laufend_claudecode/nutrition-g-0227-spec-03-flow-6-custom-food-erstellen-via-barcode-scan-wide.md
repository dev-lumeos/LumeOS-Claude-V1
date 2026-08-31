---
nr: G-227
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

# G-227 — SPEC_03 §Flow 6 Custom Food erstellen via Barcode-Scan widerspricht Phase-2-Status

## Befund

**Aus `OPUS_REVIEW_NUTRITION_03_UI_FLOWS_READINESS.md`, IMP-5.**
`[read]` **Wortlaut der Review, nicht vom Orchestrator formuliert.**

`NUTRITION_NEXT_SPEC_DECISIONS.md §1` und `§23`: Barcode Scanner ist Phase 2.
`ADR_MEALCAM_V1.md`: Barcode Scanner ist Phase 2.

`SPEC_03_USER_FLOWS.md §Flow 6 (Custom Food erstellen)`:
> 1. Aus Food Search: kein Ergebnis → "Selbst anlegen"
>    ODER: **Barcode-Scan** → nicht gefunden → "Custom erstellen"
>    ODER: direkt über "+ Eigenes Food" Button

`SPEC_04_FEATURES.md §Feature 4 (Custom Foods)` listet Barcode-Scanning als V1-Feature ("Erstellungs-Wege: 2. Barcode-Scan"). Bezieht sich auf `ADR_IMPROVEMENTS_PACKAGE.md #19` (außerhalb dieses Review-Scopes, aber in Review 1 als Phase-2-konfliktig markiert).

**Konsequenz:** UI-Komponenten könnten Barcode-Scan-Einstieg implementieren, was Phase 2 ist.

## Stand

`[read]` **Die Review stammt aus der Spec-Phase und ist nicht gegen
den heutigen Stand geprueft.** `[cmd]` **Sie kennt die Entscheidungen
vom 27./28.08. nicht** — was sie fordert, kann inzwischen entschieden
oder erledigt sein.

**Verwandter Punkt:** E-19 (Cam ist Endausbau); Tom 27.08.: Barcode/QR "kommt aber spaeter". `[read]` **Nicht zusammengelegt** — ob es
derselbe Befund ist, gehoert geprueft, nicht angenommen.

## Gegen den heutigen Stand gemessen, 2026-08-30

`[read]` **Dieser Punkt stammt aus
`OPUS_REVIEW_NUTRITION_03_UI_FLOWS_READINESS.md`** — **einer
Spec-Review von vor dem `/v2/`-Umbau.** `[cmd]` **Acht Punkte kommen
aus derselben Datei.**

`[cmd]` **Gemessen 2026-08-30: `nutrition.foods_custom.barcode`
existiert.** `[read]` **Die Spalte ist da, der Flow nicht** —
`foods_custom` hat 0 Zeilen (C-355).

## Auftrag

**Mitbeauftragt mit G-226 am 2026-08-30.** Der Auftragstext
und der Bericht stehen dort.

## Bericht — Urteil: **offen**

**Claude Code, 2026-08-31.** Mitbeauftragt mit G-226. **Der vollstaendige Bericht steht in [G-226](nutrition-g-0226-v1-status-marker-fehlen-fuer-recipes-shopping-mealplans-co.md#bericht).**

`[cmd]` **`foods_custom.barcode` existiert, `foods_custom` hat 0
Zeilen, und kein Barcode-Einstieg ist gebaut.**

`[read]` **Die befuerchtete Folge ist nicht eingetreten** — niemand
hat den Phase-2-Weg gebaut. **Die Spalte allein ist keine
Verpflichtung.**

`[read]` **Warum trotzdem offen:** `SPEC_03 Flow 6` und `SPEC_04
Feature 4` fuehren den Barcode-Scan weiter als V1-Weg, zwei ADRs
setzen ihn auf Phase 2. **Der Widerspruch in der Spec besteht
unveraendert** — er hat nur noch keinen Schaden angerichtet.
