---
nr: E-51
getroffen: 2026-09-02
von: Tom
status: gueltig
loest_ab: null
abgeloest_durch: null
betrifft: [G-227, E-19, E-43]
modul: nutrition
---

# E-51 — der Barcode gehoert zu Custom Foods

## Entscheidung

Tom, 2026-09-02, zu G-227:

> barcodescan bedingt customfoods und das haben wir zurueckgestellt.
> es wird keinen barcode fuer blsdaten geben. die idee ist der user
> erfasst seine sachen selber wie zb seinen im 711 gekauften
> proteinmilchshake und fuettert die daten selber ab inkl barcode.

## Der Widerspruch, den es aufloest

`[cmd]` **`SPEC_03` Flow 6 nennt Barcode-Scan als Einstieg fuer
*Custom Food erstellen*.** `[cmd]` **`SPEC_04` Feature 4 fuehrt ihn
als V1.** `[cmd]` **`ADR_MEALCAM_V1` und
`NUTRITION_NEXT_SPEC_DECISIONS` sagen Phase 2.**

`[read]` **Die Aufloesung ist keine Frage der Phase, sondern der
Zuordnung:** **der Barcode gehoert nicht zur Suche, sondern zum
Anlegen.**

## Warum es keinen Barcode fuer BLS-Daten gibt

`[cmd]` **E-43: BLS 4.0 ist die einzige Lebensmittelquelle** —
7.140 Lebensmittel, keine Handelsprodukte.

`[read]` **Der BLS fuehrt *Haehnchenbrust, roh* — nicht *Protein-
Shake von Marke X*.** `[read]` **Ein Barcode zeigt auf ein Produkt im
Regal, der BLS beschreibt ein Lebensmittel.** **Beide treffen sich
nicht.**

`[cmd]` **Ein Scan gegen den BLS waere immer ergebnislos** — **und
genau das steht in Flow 6 als Einstieg.**

## Was gilt

    Barcode-Scan gegen BLS        gibt es nicht, wird es nie geben
    Barcode am Custom Food        der Nutzer erfasst sein Produkt
                                  selbst, inklusive Barcode
    Wann                          mit Custom Foods, zurueckgestellt

`[read]` **Und der Zweck ist das Wiederfinden, nicht das
Nachschlagen:** **wer seinen Shake einmal erfasst hat, scannt ihn
beim naechsten Mal und findet seinen eigenen Eintrag.**

## Und die Spalte gibt es schon

`[cmd]` **Nachgemessen: `foods_custom.barcode text`** — **direkt
neben `brand`.**

`[read]` **Das Schema hat es richtig eingeordnet, die Spec nicht.**

`[cmd]` **`foods_custom` traegt 45 Spalten und 0 Zeilen** (C-355) —
**alles vorbereitet, nichts gefuellt, kein Weg hinein.**

`[read]` **Damit ist E-50 auch hier eingetreten:** die Struktur steht
vor dem Erzeuger. **Nur die Spec zieht nicht mit.**

## Was zu tun ist

`[cmd]` **`SPEC_03` Flow 6 berichtigen** — der Barcode ist ein Feld
am Custom Food, kein Einstieg.

`[cmd]` **`SPEC_04` Feature 4 nennt ihn als V1** — **das faellt mit
Custom Foods zusammen zurueck.**
