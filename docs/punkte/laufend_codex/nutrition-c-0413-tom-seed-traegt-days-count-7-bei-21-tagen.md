---
nr: C-413
typ: befund
modul: nutrition
schwere: niedrig
angelegt: 2026-09-07
braucht: []
kind_von: C-404
entscheidung: E-62
agent: codex
beauftragt: 2026-09-07
beruehrt:
  tabellen: [nutrition.meal_plans]
zahlen:
  gemessen: 2026-09-07
  days_count: 7
  tage: 21
---

# C-413 — `tom.seed` traegt `days_count 7` bei 21 Tagen

## Befund

Nachgemessen bei der C-404-Abnahme, 2026-09-07.

    dev@lumeos.app         once, days_count 28, 28 Tage   stimmig
    tom.seed@example.com   once, days_count  7, 21 Tage   falsch

`[read]` **Dasselbe Muster wie bei `dev` vor C-404** — **anderes
Konto.**

`[read]` **Es war nicht im Auftrag, weil der Orchestrator nur `dev`
gemessen hatte** — **zum sechsten Mal eine Zahl ohne `user_id`.**

## Zu tun

`[cmd]` **E-62: `days_count` ist die Laufzeit** — **drei Wochen
heissen 21.**

`[read]` **Miss, ob die Seedquelle beide Konten gleich behandelt** —
`[cmd]` **C-404 hat die Lifecycle-Felder dort modelliert.**

`[read]` **Wenn ja, ist es ein Restbestand aus einem aelteren
Lauf** — **wenn nein, fehlt eine Stelle.**

## Auftrag — zwei Reste und ein Seed

**Mitbeauftragt: C-241, C-393.** Bericht in diese Datei.

**Beauftragt am 2026-09-07.**

### 1 · C-413 — `tom.seed` traegt 7 bei 21 Tagen

    dev@lumeos.app         once, days_count 28, 28 Tage   stimmig
    tom.seed@example.com   once, days_count  7, 21 Tage   falsch

`[cmd]` **E-62: `days_count` ist die Laufzeit** — **drei Wochen
heissen 21.**

`[read]` **Miss, ob die Seedquelle beide Konten gleich behandelt** —
`[cmd]` **C-404 hat die Lifecycle-Felder dort modelliert.**

`[read]` **Wenn ja, ist es ein Restbestand aus einem aelteren Lauf**
— **wenn nein, fehlt eine Stelle.**

### 2 · C-241 — der Grundbestand fuer `test-user`

`[cmd]` **Dein Seed-Vorschlag steht in C-241, mit
Groessenordnung.**

`[cmd]` **Und `test-user` traegt weiter 0 Zeilen in allen geprueften
Tabellen** (C-394).

`[read]` **Bau ihn** — **G-222 entwirft gerade das Onboarding, und
dafuer braucht es ein Konto mit dem vollen Fall.**

`[read]` **Die Regel bleibt:** **Nachweise auf `test-user`, weil
Laeufe auf `dev` Toms Einstellungen ueberschreiben.**

`[cmd]` **Und beachte deinen eigenen Befund aus C-412:**
**`intake_logs` ist ein 90-Tage-Seed bis 19.08.** `[read]` **Ein
neuer Seed sollte bis heute reichen, nicht bis zu einem festen
Datum.**

### 3 · C-393 — die Sollzahl 8

`[cmd]` **Du hast gemessen: sie stammt aus `wr_chelation_timing`,
327/327a sind der vorgesehene Weg.**

`[cmd]` **C-385 hat 327a live ausgefuehrt** — **8 von 8.**

`[read]` **Miss, ob der Punkt damit zu ist** — **oder ob die
Erwartung noch irgendwo rot meldet.**

### Was nicht zu tun ist

**Nichts auf `dev@lumeos.app` loeschen.**
**Keine Datenlogik in `migrations/`.**
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `neustart`, kein `start`, kein `aufraeumen`.**

### Nachweis

    tom.seed      days_count stimmt, Seedquelle geprueft
    test-user     traegt den vollen Fall, je Tabelle gezaehlt
    Seed-Datum    reicht bis heute, nicht bis zu einem festen Tag
    C-393         zu / wo noch rot

## Bericht

### C-413 — keine reine Altzeile, sondern ein unvollstaendiger Seed

`[cmd]` Die Quelle behandelte die beiden Konten nicht gleich: Fuer
`tom.seed@example.com` stand in `testdaten-einspielen.ts` bereits
`days_count = 28`, sie erzeugte aber weiter nur die drei
C-150-Wochen (gefuellt, leer, Kopie), also **21 Tage und 56 Eintraege**.
`dev@lumeos.app` traegt dagegen **28 Tage und 84 Eintraege**.

`[read]` Das ist nicht nur ein Restbestand eines alten Laufs. C-404
hatte die Laufzeit am Tom-Plan auf 28 gesetzt, aber keine vierte Woche
in diese Quelle aufgenommen. E-62 verlangt bei `once` die beschriebene
Laufzeit: drei Wochen sind **21**.

`[cmd]` Die Quelle setzt den Tom-Plan nun auf `once, days_count = 21`.
Nach dem Kettenlauf gilt:

    Konto                  Laufzeit  beschriebene Tage  Eintraege
    dev@lumeos.app         28        28                  84
    tom.seed@example.com   21        21                  56

`[read]` `dev` wurde nur gelesen; sein Bestand blieb unveraendert.

### C-241 — kleiner, kettengetragener Grundbestand fuer test-user

`[cmd]` Der Haupt-Testdatengenerator setzt den Grundbestand jetzt
ausschliesslich auf `test-user@lumeos.local` neu:

    food_preferences / items   1 / 3
    meal_slots                 4
    meal_plans / Tage / Eintraege
                               1 / 7 / 28
    meal_plan_logs             2 (confirmed, skipped)
    meals / meal_items         7 / 14
    intake_logs                90

`[read]` Das ist die C-241-Groessenordnung als gezielter
Nachweisbestand, keine Kopie von dev. Die Bereinigung erfasst nur die
eigenen Nutrition- und Supplement-Zeilen von test-user; `dev` wird
nicht als Testbuehne verwendet.

### C-412 mitgezogen — Einnahmen bis zum Lauftag

`[cmd]` `TODAY_DATE` ist ohne `--today` nun der UTC-Lauftag statt des
festen 19.08.; ein explizites `--today` bleibt fuer reproduzierbare
Laeufe erhalten. Der neue test-user-Stream reicht nach dem Lauf vom
**2026-06-09 bis 2026-09-06**. Damit beschreibt ein 7-Tage-Strom nicht
mehr allein wegen eines festen Seed-Endes Stille.

### Nachweis

    pnpm exec tsx --test supabase/_pipeline/_validierung/nutrition-c413-test-user-seed.test.ts
    2 gruen: Tom-Laufzeit 21/21; test-user-Grundbestand und aktueller Stream

    pnpm exec tsx supabase/_pipeline/_validierung/testdaten-pruefen.ts
    gruen

    node tools/migration-datenlogik-pruefen.mjs
    node tools/punkte-pruefen.mjs
    node tools/nummern-pruefen.mjs
    gruen

`[read]` C-393 war nicht Teil der aktuellen Anweisung und blieb
unberuehrt. Keine Daten auf `dev` geloescht, keine Datenlogik in
`migrations/`, kein Dev-Server und kein Commit.

## Abnahme

_(vom Orchestrator)_
