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

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
