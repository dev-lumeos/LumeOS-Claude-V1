---
nr: G-488
typ: fehler
modul: nutrition
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: null
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/plan-eintraege.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-488 - drei Zahlen zum Plan, keine zwei passen

## Befund

`[cmd]` **Auf einem Schirm gemessen, 2026-09-08:**

    Flaeche oben:    "Tag 3 von 35"
    Flaeche unten:   "Dauer 28 Tage"
    meal_plans:      days_count 28
    meal_plan_days:  63 Tage, 2026-06-18 bis 2026-10-23

`[cmd]` **Und *,,Laeuft bis 23.10."*** ? **19.09. + 28 Tage =
17.10.**

## Abnahmebedingungen

    A1  "Tag 3 von 35" gegen "28 Tage": welche stimmt?
        Berichtigt.
    A2  63 Tage in meal_plan_days gegen 28 im Plan:
        GEMELDET, wenn es ein Datenfehler ist.
    A3  "Laeuft bis": gerechnet oder gelesen?
    A4  vier Module unveraendert.

## Bericht

**Zwei der drei Zahlen stimmten. Falsch war die dritte — und der
Auftrag nennt eine vierte, die ich berichtigen muss.**

    A1  "Tag x von 35" gegen "28 Tage"     erfuellt
    A2  die Abweichung GEMELDET            erfuellt
    A3  "Laeuft bis": gerechnet oder       gelesen
        gelesen?
    A4  vier Module unveraendert           erfuellt

`[cmd]` **`supabase/` unberuehrt** — die dortigen Aenderungen sind
Codex' C-531.

### Zuerst: die 63 Tage gibt es nicht

`[cmd]` **Der Auftrag nennt:** *„meal_plan_days: 63 Tage,
2026-06-18 bis 2026-10-23"*.

`[cmd]` **Gemessen 2026-09-23 am AKTIVEN Plan** (`Aufbau-Wochenplan`,
`0aef80dd`):

    Woche       von         bis         Tage  kopiert
    2026-09-19  19.09.      25.09.        7   nein
    2026-09-26  26.09.      02.10.        7   ja
    2026-10-03  03.10.      09.10.        7   nein
    2026-10-10  10.10.      16.10.        7   ja
    2026-10-17  17.10.      23.10.        7   ja
                                        ----
                                         35

`[read]` **Fuenf Wochen, 35 Tage, vom 19.09. bis 23.10.** — **nicht
63, und nicht ab Juni.**

`[cmd]` **Ueber ALLE fuenf Plaene gezaehlt:**

    Plan                status      days_count   gezaehlt
    Aufbau-Wochenplan   active          28          35
    Lean bulk 3100      assigned        84          84
    test                assigned        28          28
    Cut 4-Meal 2200     paused          28          28
    Buddy auto-plan     paused           7           7

`[read]` **Nur EIN Plan weicht ab** — die anderen vier stimmen genau.
`[read]` **Die 63 aus dem Auftrag stammt vermutlich aus einer
Zaehlung ueber mehrere Plaene**; als Befund ueber diesen Plan haelt
sie nicht.

### A1 — welche Zahl stimmt: die 35

`[cmd]` **Gemessen auf Toms Schirm, vor der Aenderung:**

    "Tag 5 von 35"        aus den Tageszeilen
    "Dauer 28 Tage"       aus meal_plans.days_count
    "Laeuft bis 23.10."   aus dem letzten plan_date

`[read]` **Zwei von dreien kommen aus denselben Tageszeilen und
stimmen ueberein** — 35 Tage, letzter Tag der 23.10.

`[cmd]` **19.09. + 35 Tage = 23.10.** `[read]` **Die Rechnung geht
auf.** `[cmd]` **Mit 28 Tagen waere es der 17.10.** — **genau Toms
Befund.**

`[read]` **Also war „Dauer" die falsche Zahl**, nicht die beiden
anderen.

`[cmd]` **Berichtigt:** die Zeile zeigt jetzt die GEZAEHLTEN Tage.
`[read]` **Dieselbe Regel, die zwei Zeilen weiter oben schon galt** —
„Days count" nutzt `p?.days_count ?? z.tage`, „Laeuft bis" die
`plan_date`.

`[cmd]` **Gemessen nach der Aenderung:**

    "Tag 5 von 35"  ·  "Dauer 35 Tage"  ·  "Laeuft bis 23.10.2026"

### A2 — der Datenfehler, gemeldet und nicht geglaettet

`[cmd]` **Die Ursache steht in `plan-write.ts`, `ablaufKlaeren`,
Weg `neu_starten`:**

    status        -> active
    start_date    -> das neue Startdatum
    rollover_count -> +1
    danach: wochenAufStartdatumSchieben(...)

`[cmd]` **`days_count` wird NICHT angefasst.**

`[read]` **Ein Plan, der beim Neustart eine Woche dazubekommt,
behaelt seine alte Laenge in der Spalte.** `[cmd]` **`rollover_count
= 1` passt genau zu den 7 Tagen Unterschied** (28 -> 35).

`[read]` **Ich habe die Spalte NICHT angepasst** — das waere ein
Schreibweg in Daten, und der Auftrag sagt: melden. `[cmd]`
**Stattdessen steht die Abweichung auf dem Schirm:**

> *„Gezählt sind 35 Tage in 5 Wochen. Der Plan ist mit 28 Tagen
> angelegt — ein Neustart verschiebt die Wochen, ohne diese Zahl
> nachzuziehen."*

`[read]` **Ein stiller Austausch verbaerge, dass die Spalte
veraltet** — und der naechste Leser hielte 35 fuer gespeichert.

**Was zu entscheiden bleibt** (nicht von mir):

`[read]` **Entweder zieht `ablaufKlaeren` `days_count` mit** — dann
ist die Spalte wieder die Wahrheit. `[read]` **Oder die Spalte
bedeutet ausdruecklich *„so lang war er beim Anlegen"*** — dann ist
nichts kaputt, und der Hinweis erklaert sie. `[cmd]` **Beides ist
ein Schreibweg oder eine Entscheidung, keine Anzeigefrage.**

### A3 — „Laeuft bis" ist GELESEN

`[cmd]` **`plans-echt.tsx:349`:**

    const laufzeit = laufzeitVon(
      d.wochen.flatMap(w => w.tage.map(x => x.plan_date)), heuteIso())

`[read]` **Aus den Tageszeilen, nicht aus `start_date + days_count`.**
`[cmd]` **Deshalb stand dort 23.10. und nicht 17.10.** — **die Zeile
war nie falsch.**

`[cmd]` **Der Waechter sichert die Gegenrichtung:** wer sie auf
`days_count` umstellt, macht ihn rot. `[read]` **Sonst waere die
naechste „Berichtigung" ein Rueckschritt.**

### Der Waechter

`[cmd]` **`g488-drei-zahlen-zum-plan.test.ts`, 3 Faelle.** `[cmd]`
**`_g488-sabotage.mjs`: 7 Schaeden plus Kontrolle — 8/8 im ERSTEN
Lauf.**

`[read]` **Zwei Faelle pruefen die Richtung, zwei die Gegenrichtung**
— „Dauer" darf nicht zurueck auf `days_count`, und „Laeuft bis"
darf nicht dorthin wandern.

### Die Fotos

    x-g488-drei-zahlen.png   alle drei Zahlen auf einem Schirm,
                             dazu der Hinweis

### Neustart noetig?

`[read]` **Nein** — nur `apps/web/src`.

## Abnahme

_(vom Orchestrator)_
