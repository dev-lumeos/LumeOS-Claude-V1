---
nr: G-330
typ: feature
modul: nutrition
schwere: mittel
angelegt: 2026-09-02
braucht: []
kind_von: null
entscheidung: null
agent: claudecode
beauftragt: 2026-09-02
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/mahlzeiten.tsx
zahlen:
  gemessen: 2026-09-02
---

# G-330 — die Kopfzeile zeigt zwei von vier Werten

## Befund

Tom, 2026-09-02:

> normale eintraege sind auch noch nicht vollstaendig: Totale im
> header fuer alle werte und beschriftung darunter, dann zaehlt die
> auch fuer den inhalt

`[cmd]` **Die Kopfzeile einer Mahlzeit zeigt heute:**

    07:30  Breakfast · 3 items        413 kcal · 23g P

`[cmd]` **Die Zeilen darunter zeigen vier Werte:**

    Vollkornbrot   81 g   170 kcal   6 g   31 g   1 g

`[read]` **Der Kopf summiert zwei, die Zeilen zeigen vier.**

## Was zu bauen ist

**Alle vier Werte im Kopf, mit Beschriftung darunter.**

`[read]` **Und Toms Begruendung ist der eigentliche Punkt:**
*,,dann zaehlt die auch fuer den inhalt"* — **die Spaltenbeschriftung
im Kopf gilt fuer die Zeilen darunter.**

`[read]` **Heute steht ueber den Zahlen nichts** — **wer *6 g 31 g
1 g* liest, muss raten, was welche ist.**

`[cmd]` **Die Reihenfolge ist heute kcal, P, C, F** —
`mahlzeiten.tsx:799` bestaetigt es fuer die Detailzeile.

## Auftrag

**Mitbeauftragt mit G-329 am 2026-09-02.** Der Auftragstext
und der Bericht stehen dort.
