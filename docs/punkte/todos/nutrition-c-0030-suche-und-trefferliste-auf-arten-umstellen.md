---
nr: C-30
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-08-14
braucht: []
kind_von: null
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# C-30 - Suche und Trefferliste auf Arten umstellen

## Befund

(neu
  2026-08-14). Setzt C-29 und C-36 voraus. `[cmd]` C-28 und C-33 sind
  beide gemessen und gefallen; die Rangfolge kommt aus der kuratierten
  Zuordnung, nicht aus einer Artengruppierung.

  Die Trefferliste zeigt Arten mit ihrem Vertreter, die Zubereitungs-
  varianten hängen darunter. Damit wird die Rangfolge eine Frage
  zwischen **Arten**, nicht mehr zwischen 132 Zeilen.

  **Was dabei strukturell mitfällt, ohne eigene Regel:**
  - **C-20** (Treffer in der Wortmitte): Ein Treffer im Gattungsnamen
    schlägt einen Treffer im Qualifikator. `Kürbiskern` ist eine andere
    Art als `Kürbis`.
  - **C-24** (Halbfertigprodukte): `Kartoffelpüree Instantpulver` ist
    eine eigene Art, nicht die Kartoffel.
  - **C-19/C-21** sind über denselben Weg bereits erledigt (Block 32) —
    das ist der Beleg, dass Eingriffe auf der Bestandsseite mehr tragen
    als weitere Wortlisten auf der Anfrageseite.

  **Abnahme: 34 von 37 im MealCam-Maßstab** (heute 31). Nicht 37 —
  `[cmd]` mindestens zwei der sechs Restfälle sind keine Suchprobleme:
  `milch` → Vollmilch 3,5 % ist eine Produktentscheidung, `erdnussbutter`
  → Erdnussmus eine Bedeutungsfrage. Beide gehören in einen Override,
  nicht in eine Sortierregel.

  **C-17 (Laufzeit) gehört hierher**, nicht davor: wenn die Bedingung
  ohnehin umgebaut wird, wird der Ausdrucks-Index in demselben Zug
  passend gelegt.

## Auftrag

**Mitbeauftragt mit C-384 am 2026-09-02.** Der Auftragstext
und der Bericht stehen dort.

## Gemessen am 2026-09-02: gilt weiter

`[cmd]` **`nutrition.foods` hat keine Arten- oder Vertreterspalte.**
`[cmd]` **`food_search` liefert eine flache Liste** — die
Aprikosenprobe ergibt **24 von 24 Zeilen**, nicht eine Art mit
Varianten.

`[cmd]` **Und `food_search` fuehrt keinen `match_reason`** —
`[read]` **der Orchestrator hatte G-281 als Beleg genannt, das
betrifft den Supplement-Katalog.**

`[cmd]` **Der Herkunftsfilter aus C-355 unterscheidet nur `bls` und
`custom`** — kein Artenmodell.

`[read]` **Die Vorbedingung ist erfuellt:** die kuratierten
Anzeigenamen stehen (C-29). **Der Punkt bleibt ein eigener
Bauauftrag.**
