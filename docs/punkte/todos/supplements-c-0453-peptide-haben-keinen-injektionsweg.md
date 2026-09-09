---
nr: C-453
typ: befund
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-445
entscheidung: null
beruehrt:
  tabellen: [supplements.supplements]
zahlen:
  gemessen: 2026-09-08
  supplements: 596
  injizierbar: 18
---

# C-453 — Peptide haben keinen Injektionsweg

## Befund

Tom, 2026-09-08: *,,dann fehlen noch ein paar punkte fuer peptides
? das sind auch supplement injektionen."*

`[read]` **Er hat recht, und die Spec sagt es ausdruecklich.**

`[cmd]` **`Injection Planner - Spec Change Request.md:21`:**

> *,,For any user on injectable protocols (TRT, HCG, peptides, GH,
> GLP-1 agonists) this is the highest-value missing feature."*

`[cmd]` **Und die sechs SubQ-Stellen sind genau dafuer da,
Zeile 65-74:**

    abd_l/r        Abdomen       1.0 ml  3 d  29G x 0.5"
                   ~2 cm lateral vom Nabel, pinch
    sq_delt_l/r    SubQ Deltoid  0.5 ml  3 d  29G x 0.5"
                   Posterior upper-arm fat
    thigh_sq_l/r   SubQ Thigh    1.0 ml  3 d  29G x 0.5"
                   Anterolateral fat pad

`[read]` **Die Karte zeigt sie heute nicht** ? **das ist G-396.**

## Was in der Datenbank fehlt

`[cmd]` **`supplements.supplements`: 596 Zeilen.**

`[cmd]` **Peptide im Katalog: `Semaglutid`, `Tirzepatid`** ?
**beide mit `form = NULL`.**

`[cmd]` **`supplement_pharmacology.route`:**

    oral                       250
    intramuscular               10
    intranasal,subcutaneous      7
    intravenous,subcutaneous     1

`[read]` **18 von 596 haben ueberhaupt einen injizierbaren Weg.**

`[read]` **Und die Werte sind kommaseparierte Zeichenketten, keine
Liste** ? **`intranasal,subcutaneous` ist EIN Feld.**

## Was die Spec verlangt

`[cmd]` **Zeile 16:**

    route TEXT NOT NULL
      -- oral | injection_im | injection_subq | topical | nasal

`[cmd]` **Zeile 36:** *,,`route` TEXT: `im` | `subq` ? must match
`enhanced_substances.route` family."*

`[cmd]` **Und `enhanced_substances` GIBT ES NICHT** ? **weder in
`supplements` noch anderswo.**

`[read]` **Die Spec verweist auf eine Tabelle, die nie gebaut
wurde** ? **`00-SPEC-ABGLEICH.md` fuehrt sie unter *,,Spec nennt,
Schema hat nicht"*.**

## Die drei Luecken

**1** ? **Kein `route` an der Substanz.** `[cmd]`
**`supplements.form` traegt *root extract*, *plant protein
isolate*** ? **das ist die Darreichungsform, nicht der Weg.**

**2** ? **`supplement_pharmacology.route` ist eine Zeichenkette.**
`[read]` **`intranasal,subcutaneous` laesst sich nicht abfragen,
ohne zu zerlegen.**

**3** ? **Zeile 109 der Spec:** *,,Computed on read from active
stack items where `route IN ('injection_im','injection_subq')"*.

`[read]` **Der Injektionsplaner soll die Stellen aus dem AKTIVEN
STACK ableiten** ? **wer kein injizierbares Mittel nimmt, sieht
keine Karte.**

`[cmd]` **Das geht heute nicht** ? **es gibt keinen Weg von einem
Stack-Eintrag zu *,,das wird injiziert"*.**

## Was zu messen ist

`[read]` **Wie viele Peptide der Katalog ueberhaupt fuehrt** ?
**zwei gefundene bei einer Namenssuche ist wenig.**

`[cmd]` **`docs/kimi_research/supplement_performance_database/`
koennte mehr haben.**

`[read]` **Und was das Altrepo dazu sagt** ?
`referenz/lumeos-2026/research/enhanced-supplements/`, **13
Dateien, 95 KB.**
