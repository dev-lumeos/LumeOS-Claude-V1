---
nr: G-235
typ: entscheidung
modul: nutrition
schwere: niedrig
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

# G-235 — `MicroDashboard` Tier-System (Tier 1/2/3) und Subscription-Gates ungeklärt

## Befund

**Aus `OPUS_REVIEW_NUTRITION_03_UI_FLOWS_READINESS.md`, MIN-6.**
`[read]` **Wortlaut der Review, nicht vom Orchestrator formuliert.**

`SPEC_04 §Feature 10`:
> V1: Alle Tiers sind ohne Einschränkung sichtbar.
> Subscription-Gates werden erst implementiert wenn Monetarisierung steht.
> `show_micros_tier` Setting ist frei konfigurierbar.

`SPEC_10` MicroDashboard zeigt Tier-System ohne Gating-Hinweis. UI-Verhalten bei `show_micros_tier = 1`: nicht spezifiziert.

## Stand

`[read]` **Die Review stammt aus der Spec-Phase und ist nicht gegen
den heutigen Stand geprueft.** `[cmd]` **Sie kennt die Entscheidungen
vom 27./28.08. nicht** — was sie fordert, kann inzwischen entschieden
oder erledigt sein.

**Verwandter Punkt:** G-140 (`display_tier` ist ein Abo-Tier, keine Baumebene). `[read]` **Nicht zusammengelegt** — ob es
derselbe Befund ist, gehoert geprueft, nicht angenommen.

## Gegen den heutigen Stand gemessen, 2026-08-30

`[read]` **Dieser Punkt stammt aus
`OPUS_REVIEW_NUTRITION_03_UI_FLOWS_READINESS.md`** — **einer
Spec-Review von vor dem `/v2/`-Umbau.** `[cmd]` **Acht Punkte kommen
aus derselben Datei.**

`[cmd]` **Gemessen 2026-08-30: `display_tier` steht in
`nutrient_defs`** — **aber das ist die Anzeigestufe je Naehrstoff,
nicht ein Abo-Tier.** `[cmd]` **Ein Abo-Tier gibt es im Schema
nicht.**
`[read]` **G-140 fuehrt denselben Verdacht von der anderen Seite.**

## Auftrag

**Mitbeauftragt mit G-226 am 2026-08-30.** Der Auftragstext
und der Bericht stehen dort.

## Bericht — Urteil: **ueberholt**

**Claude Code, 2026-08-31.** Mitbeauftragt mit G-226. **Der vollstaendige Bericht steht in [G-226](nutrition-g-0226-v1-status-marker-fehlen-fuer-recipes-shopping-mealplans-co.md#bericht).**

`[cmd]` **Ein Abo-Tier gibt es im Schema `nutrition` nicht.** Die
Suche nach `%micros_tier%`, `%subscription%`, `%abo%`, `tier` findet
dort nichts.

`[cmd]` **`display_tier` ist eine Anzeigetiefe** — belegt an der
Verteilung:

    Stufe 1   31 Codes   ALC, CA, CHO, CHORL, ENERCC
    Stufe 2   47 Codes   AAE9, ASH, BIOT, CARTB, CHOCAL
    Stufe 3   60 Codes   ACEAC, ALA, ARG, ASP, CAROTPAXB

`[read]` **Stufe 1 sind Alltagswerte, Stufe 3 Aminosaeuren und
Carotinoide. Das ist Tiefe, keine Bezahlschranke.**

`[cmd]` **Nebenbefund:** `apps/web/src/app/v2/nutrition/page.tsx:46`
nennt `display_tier` *„das Abo-Gate"* — **dieselbe Verwechslung, die
G-140 und G-239 zweimal aufgeraeumt haben.** Als eigener Punkt
anzulegen.
