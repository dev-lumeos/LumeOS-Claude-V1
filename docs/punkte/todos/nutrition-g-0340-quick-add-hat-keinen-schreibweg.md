---
nr: G-340
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-09-02
braucht: [G-339]
kind_von: G-232
entscheidung: null
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/kopfknoepfe.tsx
zahlen:
  gemessen: 2026-09-02
---

# G-340 — Quick-Add hat keinen Schreibweg

## Befund

Aus G-294, Claude Code, 2026-09-02.

`[cmd]` **Die Komponente ist gebaut, der Schreibweg fehlt.**

`[read]` **Und die Spec hat eine Luecke an derselben Stelle** —
**der Punkt G-232 beschrieb das Fehlen falsch.**

## Zu klaeren

`[read]` **Was soll Quick-Add schreiben?** `[cmd]` **Seit G-320 gibt
es `FoodSuchModal` mit Live-Vorschau, seit G-336 das
Mahlzeiten-Modal.**

`[read]` **Vielleicht ist Quick-Add ueberfluessig geworden** —
**oder es ist der Weg fuer den Fall ohne Suche: eine Zahl, kein
Lebensmittel.**

`[read]` **Das gehoert entschieden, bevor der Schreibweg entsteht.**

## Auftrag

**Mitbeauftragt mit G-341 am 2026-09-02.** Der Auftragstext
und der Bericht stehen dort.

## Gemessen am 2026-09-02: nicht ueberfluessig

`[cmd]` **Quick-Add ist der einzige Zugang zu
`food_source = 'manual'`.**

`[cmd]` **Das Schema sieht den Wert ausdruecklich vor** — **und kein
Weg bedient ihn.**

`[read]` **Der Orchestrator hatte gefragt, ob es seit G-320 und
G-336 ueberholt sei.** `[read]` **Es hat einen Zweck, den kein
anderer Weg erfuellt: eine Zahl ohne Lebensmittel.**

**Bauen oder begruenden, warum nicht** — **die Entscheidung gehoert
Tom.**
