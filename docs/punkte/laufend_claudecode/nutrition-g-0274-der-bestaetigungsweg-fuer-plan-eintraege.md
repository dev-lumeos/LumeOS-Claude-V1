---
nr: G-274
typ: feature
modul: nutrition
schwere: hoch
angelegt: 2026-08-30
braucht: []
kind_von: G-270
entscheidung: null
beruehrt:
  tabellen: [nutrition.meal_plan_logs, nutrition.meal_plan_entries, nutrition.meals]
  dateien: [apps/web/src/app/v2/nutrition/tab-plans.tsx]
zahlen:
  gemessen: 2026-08-30
  plan_eintraege: 112
  plan_tage: 42
  logs: 0
agent: claudecode
beauftragt: 2026-08-30
---

# G-274 — der Bestaetigungsweg fuer Plan-Eintraege

## Befund

`[cmd]` **112 Plan-Eintraege ueber 42 Tage, ein aktiver Plan — und
0 Zeilen in `meal_plan_logs`.**

`[read]` **Das ist die Ursache aller drei Attrappen aus G-270.** Ghost
Entries, Lifecycle und Compliance lesen aus dem Log, **und niemand
schreibt hinein.**

`[cmd]` **Das Schema steht seit dem 30.08. vollstaendig:**
`plan_id`, `plan_entry_id`, `execution_date`, `status`,
`actual_meal_id`, `confirmation_mode`, `deviation_kcal`,
`deviation_pct`, `confirmed_at`, `skipped_at`.

## Auftrag

**Der Knopf *Confirm as planned* schreibt.** Dazu *Skip* und
*Log deviation*.

### Was der Bildschirm heute zeigt

`[cmd]` **Toms Bildschirmfoto vom 28.08.:** fuenf Eintraege mit
`confirmed`, `deviated`, `pending` — **und drei Knoepfe je Zeile:**
*Confirm as planned*, *MealCam*, *Log deviation*, *Skip*.

`[read]` **Die Gestalt steht. Was fehlt, ist der Schreibweg.**

### Die vier Zustaende kommen aus dem Flow

`[cmd]` **`SPEC_03_USER_FLOWS` Flow 4 beschreibt das Bestaetigen in
vier Faellen, einschliesslich rueckwirkend.** `[read]` **Lies ihn
zuerst** — Codex hat den Status daraus entworfen, nicht aus der
Vorlage.

### Was *Confirm as planned* bedeutet

`[read]` **Ein bestaetigter Eintrag ist eine gegessene Mahlzeit.**
`[cmd]` **`actual_meal_id` verweist auf `nutrition.meals`** — **also
entsteht beim Bestaetigen auch ein Eintrag im Tagebuch.**

`[read]` **Miss, ob das gemeint ist.** **Wenn ja, nutz den Schreibweg
aus G-272** — `createMeal` und `addMealItem` stehen und sind belegt.
**Kein zweiter Weg.**

`[read]` **Wenn nein: sag es, bevor du baust.** **Ein Log ohne
Tagebucheintrag ist eine Zusage, die die Bilanz nicht kennt.**

### *Log deviation*

`[cmd]` **`deviation_kcal` und `deviation_pct` stehen im Schema.**
`[read]` **Eine Abweichung ist eine andere Mahlzeit als die
geplante** — **nicht keine.**

`[cmd]` **Toms Bildschirmfoto zeigt es:** *,,Mandeln → Walnuesse"*.

### Was nicht zu tun ist

**Kein Schema aendern** — es steht vollstaendig.
**Keine zweite Ansicht, keinen zweiten Schreibweg.**
**Nichts auf `dev@lumeos.app`** — `test-user@lumeos.local` mit
Rueckbau, wie in G-272 und G-267.
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    Confirm schreibt        Log-Zeile, belegt mit Rueckbau
    Tagebucheintrag         entsteht er? gewollt?
    Skip schreibt           Log-Zeile mit `skipped_at`
    Abweichung              Log-Zeile mit `deviation_*`
    Ghost Entries           echte Zeilen statt Leerzustand
    7-day compliance        rechnet aus dem Log
    rueckwirkend            Flow 4 kennt den Fall - geht er?
    Attrappen               vorher / nachher, am Schirm
    Ladezeit                ms, kalt und warm

`[read]` **Die drei mittleren Zeilen sind das Ergebnis:** **nach
diesem Auftrag zeigt der Reiter echte Zahlen, keine ehrlichen
Leerzustaende mehr.**

### Regeln

`tools/lauf.py`, keine Konsolenfenster.
`[cmd]` **A-30, A-59, A-60.**
`[cmd]` **A-62:** ein Waechter, der eine Abwesenheit sichert, kippt
still, wenn die Sache kommt. **Deine eigenen aus G-270 betreffen
genau dieses Log.**

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
