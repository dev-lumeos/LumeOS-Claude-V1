---
nr: E-38
getroffen: 2026-08-31
von: Orchestrator, belegt
status: gueltig
loest_ab: null
abgeloest_durch: null
betrifft: [C-360, C-345, C-343, C-324]
modul: nutrition
---

# E-38 — zensierte Messwerte zaehlen nach Lower Bound

## Die Frage

`[cmd]` **Von 98 fehlenden VITC-Posten sind 0 logische Nullen, 86
`<LOD`/`<LOQ` und 12 echte Luecken** (C-345, Codex, 2026-08-31).

`[read]` **Damit ist meine Begruendung widerlegt:** ich hatte gesagt,
Ei, Kabeljau und weisser Reis enthielten *,,tatsaechlich keins"*.
**Die Quelle sagt etwas anderes: gemessen, aber unterhalb der
Nachweis- oder Bestimmungsgrenze.**

## Die Antwort ist ein Standard

**EFSA und WHO/IPCS fuehren fuer diesen Fall eine
Substitutionsmethode.** Werte unterhalb der Grenze heissen
*left-censored data*:

    Lower Bound   <LOD / <LOQ -> 0
    Middle Bound  <LOD -> LOD/2,  <LOQ -> LOQ/2
    Upper Bound   <LOD -> LOD,    <LOQ -> LOQ

**Und die Leitlinie nennt unseren Fall ausdruecklich:** der LB/UB-
Ansatz soll fuer Stoffe verwendet werden, die im Lebensmittel
wahrscheinlich vorkommen — **natuerlich vorhandene Kontaminanten und
Naehrstoffe.**

## Entscheidung

**Zensierte Werte (`<LOD`, `<LOQ`) zaehlen als 0. Echte Luecken (`-`)
bleiben unvollstaendig.**

## Warum Lower Bound und nicht Middle Bound

`[read]` **Der Unterschied ist hier winzig:** es geht um Vitamin C in
Ei, Reis und Fisch — **Werte unterhalb der Bestimmungsgrenze.**

`[cmd]` **Und der BLS liefert die Grenze nicht mit.** `[read]` **MB
und UB brauchen den LOD- oder LOQ-Wert; wir haben nur die Angabe,
dass unterschritten wurde.** **LB ist der einzige Weg, der ohne eine
erfundene Zahl auskommt.**

`[read]` **C-48 Regel 1 bleibt gewahrt:** eine echte Luecke wird
weiter nicht zur Null. `[cmd]` **Die zwoelf Ziegenfleisch-Posten
bleiben unvollstaendig.**

## Was daraus folgt

`[cmd]` **Damit wird der Vitamin-C-Tag rechenbar, sobald der Import
die Herkunft mitfuehrt** — **C-345 ist die Voraussetzung, nicht die
Antwort.**

`[read]` **Und die Anzeige muss es sagen koennen:** ein Tag, der auf
zensierten Werten beruht, ist nicht dasselbe wie einer aus lauter
Messungen. `[cmd]` **Das Muster dafuer steht: der `teilweise`-Zustand
aus C-177.**

## Quellen

EFSA, *Management of left-censored data in dietary exposure
assessment of chemical substances*, 2010.
WHO/IPCS, *Principles and Methods for the Risk Assessment of
Chemicals in Food*, 2009, Substitutionsmethode.
EFSA-Glossar, *lower bound estimate*.
