---
nr: C-420
typ: befund
modul: quer
schwere: hoch
angelegt: 2026-09-07
braucht: []
kind_von: C-418
entscheidung: E-70
agent: codex
beauftragt: 2026-09-07
beruehrt:
  dateien:
    - tools/mockup-deckung.mjs
zahlen:
  gemessen: 2026-09-07
  gemeldet: 170
  wirklich: 11
  faktor: 15
---

# C-420 — der Waechter kennt keine Uebersetzung

## Befund

Aus C-418, Claude Code, 2026-09-07.

`[cmd]` **In `recovery`: 170 gemeldet, 11 wirklich weg.**

    18   wortgleich vorhanden
    10   unter deutschen Namen
    11   wirklich weg

`[read]` **Faktor 15 daneben.**

## Die Ursache

`[cmd]` **Die App ist mehrsprachig** (DE/EN/TH), **das Mockup ist
englisch.**

`[cmd]` **`Muscle readiness` im Mockup gegen `Muskelbereitschaft` im
Code** — **derselbe Schirm, andere Sprache.**

`[read]` **Ein Vergleich, der das nicht kennt, meldet jede
Uebersetzung als Verlust.**

`[read]` **Und der Orchestrator hat den Waechter gebaut, ohne die
Mehrsprachigkeit zu bedenken** — **obwohl sie in den
Projektanweisungen steht.**

## Was zu bauen ist

`[read]` **Der Vergleich braucht die Uebersetzungsdateien.**

`[cmd]` **Wo sie liegen, ist zu messen** — **`packages/` oder
`apps/web/src/i18n`.**

`[read]` **Ein Mockup-Titel gilt als vorhanden, wenn er selbst oder
seine Uebersetzung im Code steht.**

`[read]` **Und Titel gegen Titel, nicht Zeichenkette gegen
Dateiinhalt** — **das ist Claude Codes zweite Berichtigung.**

## Bis dahin

`[cmd]` **Der Waechter laeuft im Gate und meldet 1.343.**

`[read]` **Die Zahl ist falsch, aber die Richtung stimmt:** **er
meldet, wenn etwas verschwindet.**

`[read]` **Erst wenn die Zaehlung stimmt, darf sie als Massstab
gelten.**

## Auftrag

**Mitbeauftragt mit C-419 am 2026-09-07.** Der Auftragstext
und der Bericht stehen dort.
