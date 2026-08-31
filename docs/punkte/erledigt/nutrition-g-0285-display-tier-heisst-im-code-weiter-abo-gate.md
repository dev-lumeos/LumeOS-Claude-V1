---
nr: G-285
typ: befund
modul: nutrition
schwere: niedrig
angelegt: 2026-08-31
braucht: []
kind_von: G-226
entscheidung: null
agent: claudecode
beauftragt: 2026-08-31
erledigt: 2026-08-31
commit: 33a526a3
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/page.tsx
zahlen: null
---

# G-285 — `display_tier` heisst im Code weiter *Abo-Gate*

## Befund

Aus G-226, Claude Code, 2026-08-31.

`[cmd]` **`page.tsx:46` nennt `display_tier` *,,das Abo-Gate"*.**

`[cmd]` **Es ist eine Anzeigetiefe:** Stufe 1 traegt Kalorien und
Calcium, Stufe 3 Aminosaeuren und Carotinoide.

`[read]` **Dieselbe Verwechslung haben G-140 und G-239 bereits
geklaert** — **zweimal.** `[cmd]` **Und G-235 zum dritten Mal.**

`[read]` **Ein Kommentar, der dreimal berichtigt wurde und wieder
dasteht, ist A-62 in seiner haesslichsten Form:** **nicht gekippt,
sondern nie mitkorrigiert.**

## Was zu tun ist

`[read]` **Berichtigen und sichern.** `[cmd]` **G-173 hat gezeigt,
dass eine Korrektur ohne Waechter still zurueckkippt.**

## Auftrag

**Vorbereitet mit G-283 am 2026-08-31.** Der Auftragstext
und der Bericht stehen dort.

## Bericht — erledigt

**Claude Code, 2026-08-31.** Mitbeauftragt mit G-283. **Der vollstaendige Bericht steht in [G-283](nutrition-g-0283-ein-pro-profil-faellt-still-auf-090.md#bericht).**

`[cmd]` **`page.tsx:46` nannte `display_tier` weiter *„das
Abo-Gate"*** — nach G-140, G-239 und G-235.

`[cmd]` **G-235 hat es am 2026-08-31 gemessen:**

    Stufe 1   31 Codes   ALC, CA, CHO, CHORL, ENERCC
    Stufe 2   47 Codes   AAE9, ASH, BIOT, CARTB, CHOCAL
    Stufe 3   60 Codes   ACEAC, ALA, ARG, ASP, CAROTPAXB

`[read]` **Stufe 1 sind Alltagswerte, Stufe 3 Aminosaeuren und
Carotinoide** — das ist Anzeigetiefe. `[cmd]` **Ein Abo-Tier gibt es
im Schema `nutrition` nicht.**

**Berichtigt mit der Messung, und ein Waechter haelt die Stelle**
(G-173: eine Korrektur ohne Waechter kippt still zurueck).

`[cmd]` **Ein eigener Fehler dabei, von der Sabotageprobe gefangen:**
der Waechter suchte `/das Abo-Gate/` — **und die Berichtigung ZITIERT
den alten Wortlaut.** `[read]` **G-186 zum vierten Mal.** Behoben: er
prueft jetzt die BEHAUPTUNG (`display_tier ist das Abo-Gate`), nicht
die Zeichen.

## Abnahme

**2026-08-31, mit G-283 abgenommen:** berichtigt und gesichert, mit G-235s Messung statt der Behauptung.
