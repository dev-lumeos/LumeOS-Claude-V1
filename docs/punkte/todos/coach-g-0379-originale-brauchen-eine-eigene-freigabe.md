---
nr: G-379
typ: entscheidung
modul: coach
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: C-136
entscheidung: E-74
beruehrt:
  tabellen: [coach.client_permissions]
zahlen:
  gemessen: 2026-09-08
---

# G-379 — brauchen Originale eine eigene Freigabe?

## Die Frage

Codex, C-136, 2026-09-08:

> *,,Originaldateien nicht implizit mit `medical_visibility='full'`
> teilen. Falls Tom das will, separate explizite
> `medical_originals_visibility`-Freigabe in `client_permissions`;
> bis dahin bleiben Bytes privat."*

## Warum es zaehlt

`[cmd]` **`medical_visibility='full'` gibt heute Medikamente und
Conditions frei.**

`[read]` **Ein Original ist etwas anderes:** **der Scan traegt
Briefkopf, Unterschrift, oft die Versichertennummer** ? **und
alles, was auf demselben Blatt stand.**

`[read]` **Wer seinem Coach die Werte zeigt, hat nicht das
Dokument gezeigt.**

## Der Stand

`[cmd]` **`medical-originals` ist Owner-only** ? **auch ein Coach
mit `full` kommt nicht an die Bytes** (C-136).

`[read]` **Das ist die sichere Vorgabe, und sie steht bereits.**

## Die Entscheidung

**a** ? **So lassen.** `[read]` **Ein Coach sieht Werte und
Ereignisse, nie das Original.**

**b** ? **Eigene Freigabe.** `[cmd]`
**`medical_originals_visibility` in `client_permissions`,
DEFAULT `none`.**

`[read]` **Dann kann ein Nutzer bewusst ein Dokument teilen** ?
**und es einzeln wieder zuruecknehmen.**

`[read]` **Die Machart steht schon:** **`medical_visibility` hat
Ablaufzeit und Aenderungsprotokoll.**
