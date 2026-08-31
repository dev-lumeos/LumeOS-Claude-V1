---
nr: G-287
typ: feature
modul: nutrition
schwere: hoch
angelegt: 2026-08-31
braucht: []
kind_von: null
entscheidung: null
agent: claudecode
beauftragt: 2026-08-31
erledigt: 2026-08-31
commit: OFFEN
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/tab-plans.tsx
zahlen: null
---

# G-287 — MealPlanCard — die Plan-Liste ist nicht anklickbar

## Befund

`[cmd]` **`SPEC_10` nennt zwei Komponenten:** `MealPlanList`
(*,,Liste aller Plaene mit Source-Badge"*) und `MealPlanCard`
(*,,Name, Quelle, Status, Tage, kcal/Tag"*).

`[cmd]` **Gebaut ist die Liste ohne die Karte** — drei Textzeilen,
nicht anklickbar, kein Detail dahinter.

`[read]` **Tom, 2026-08-31:** *,,irgend eine auflistung die gar nichts
sagt, nichtmal anschaubar ist oder editierbar."*

## Was zu bauen ist

**Je Plan eine Karte, die aufs Detail fuehrt.**

`[cmd]` **Die Quelle steht seit dem 30.08.:** `plan_origin` mit
`self_created`, `coach_created`, `marketplace` — **das ist das
Source-Badge aus der Spec.**

`[cmd]` **Und der Status auch:** `status` und `lifecycle_type` am
Plan.

`[read]` **Die zwei Bestandsplaene tragen `plan_origin = NULL`** —
**das gehoert gezeigt, nicht gefuellt.**

## Auftrag

**Mitbeauftragt mit G-286 am 2026-08-31.** Der Auftragstext
und der Bericht stehen dort.

## Bericht — erledigt

**Claude Code, 2026-08-31.** Mitbeauftragt mit G-286. **Der vollstaendige Bericht steht in [G-286](nutrition-g-0286-mealplandetail-das-tages-akkordeon-fehlt.md#bericht).**

### Vorher / nachher

`[cmd]` **Vorher:** `PlanBibliothekEcht` — je Woche eine Textzeile,
nicht anklickbar, kein Detail dahinter.

`[cmd]` **Jetzt, am Schirm:**

    Aufbau-Wochenplan · [Herkunft nicht hinterlegt] · [active]
    21 Tage · 56 Einträge · ø 1960 kcal/Tag
    [Zuklappen] [Laufzeit ändern]

**Die Karte traegt, was SPEC_10 nennt:** Name, Quelle, Status, Tage,
kcal/Tag — **und sie fuehrt aufs Tages-Akkordeon (G-286).**

### Die fehlende Herkunft wird gezeigt, nicht gefuellt

`[cmd]` **`plan_origin = NULL`** beim Bestandsplan. Die Karte zeigt
*„Herkunft nicht hinterlegt"* und den Grund darunter. `[cmd]` **Ein
Waechter verbietet ein `?? 'self_created'`** — die Herkunft waere
sonst erfunden.

`[cmd]` **Gegenprobe im Schreibweg:** ein neu angelegter Plan bekommt
`self_created` und zeigt *„selbst erstellt"*.

### A-59

`[cmd]` **`PlanBibliothekEcht` hatte danach null Aufrufer** —
geloescht, nicht auskommentiert. Ein Waechter haelt es fest.

### Ein Hinweis zur Zahl

`[cmd]` **Der Auftrag nennt „112 Eintraege" — das ist die Summe ueber
zwei Nutzer.** `[cmd]` **dev sieht 21 Tage und 56 Eintraege;** der
zweite Plan gehoert `tom.seed@example.com` und faellt per RLS heraus.

## Abnahme

**2026-08-31, mit G-286 abgenommen:** gebaut: Karte mit Herkunft, Status, Tagen und ø kcal; oeffnet
das Detail. `plan_origin = NULL` wird gezeigt, nicht gefuellt.
