---
nr: G-288
typ: feature
modul: nutrition
schwere: hoch
angelegt: 2026-08-31
braucht: []
kind_von: null
entscheidung: null
agent: claudecode
beauftragt: 2026-08-31
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/tab-plans.tsx
zahlen: null
---

# G-288 — Die Einkaufsliste ist eine leere Kachel

## Befund

`[cmd]` **`SPEC_10` nennt drei Komponenten:** `ShoppingListView`,
`ShoppingListDetail` (*,,Liste mit Abhak-Items, Fortschrittsbalken (X
von N)"*), `ShoppingListItem`.

`[cmd]` **Gebaut ist eine Kachel mit dem Satz *,,Noch keine
Einkaufsliste angelegt"*.**

`[read]` **Tom, 2026-08-31:** *,,noch der groessere schwachsinn."*

## Was da ist

`[cmd]` **`nutrition.shopping_lists` traegt eine Zeile mit sechs
Positionen** — **sie gehoert `test-user@lumeos.local`.**

`[read]` **Die Kachel ist also nicht falsch, sie ist unfertig:** es
gibt keinen Weg, eine Liste anzulegen, keine Detailansicht, keine
Abhakfunktion.

`[cmd]` **`SPEC_10` sagt dazu: *,,Schema-only V1 — Full UI Phase 2
wenn Zeit knapp"* (ADR_RECIPES_SCHEMA_ONLY).** `[read]` **Das war
eine Entscheidung, und sie steht der Sache heute im Weg.**

## Zu klaeren

`[read]` **Gilt *Schema-only* noch?** **Wenn ja, gehoert es an die
Kachel geschrieben — wenn nein, sind es drei Komponenten.**

## Auftrag

**Mitbeauftragt mit G-300 am 2026-08-31.** Der Auftragstext
und der Bericht stehen dort.
