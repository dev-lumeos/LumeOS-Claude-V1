---
nr: G-466
typ: fehler
modul: supplements
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: C-485
entscheidung: null
erledigt: 2026-09-08
commit: 8ec84645
beruehrt:
  tabellen: [supplements.product_contents]
zahlen:
  gemessen: 2026-09-08
---

# G-466 - amount_qualifier wird nicht gelesen

## Befund

Aus G-464, Claude Code, 2026-09-08:

> *,,`amount_qualifier` traegt `per_serving` und
`per_container`. Mein Auftrag sagte, die Portionsspalte fehle.
Der Wert ist da ? und der ZWEITE Wert ist nicht *die zweite
Portionsgroesse*, sondern das, was IN DER PACKUNG steckt."*

`[cmd]` **`Total Fat 19 g` je Portion, `4 g` je Behaelter** ?
**oder umgekehrt.**

## Meine Fehldiagnose

`[cmd]` **C-485 hat gemeldet, `product_contents` habe keine
Portionsspalte** ? **und ich habe es in G-452, G-453, G-464
weitergereicht.**

`[read]` **Sie fehlt nicht. Sie wird nicht gelesen.**

## Was zu tun ist

`[read]` **Die Tafel zeigt beide Werte untereinander, ohne zu
sagen, welcher was ist.**

`[cmd]` **MISS, welche Werte `amount_qualifier` traegt und wie
viele Zeilen je Wert.**

`[read]` **Dann: je Portion als Vorgabe, je Behaelter
daneben** ? **oder ein Umschalter.**

## Und die Naehrwertsicht

`[cmd]` **`supplier_product_nutrients` rechnet je Portion
(C-496)** ? **miss, ob sie den `qualifier` beruecksichtigt oder
beide Werte mittelt.**

`[read]` **Wenn sie mittelt, sind die Naehrwerte falsch.**

## Abnahmebedingungen

    A1  welche Werte traegt amount_qualifier? Zahl je
        Wert.
    A2  die Tafel sagt, welcher Wert was ist. Foto.
    A3  supplier_product_nutrients: rechnet sie richtig?
        Gemessen an einem Produkt mit beiden Werten.
    A4  Gegenprobe: ein Produkt mit nur einem Wert.

## Bericht

**Befund berichtigt, keine sichere Datenkorrektur moeglich.** Die
Spalte ist kein Portionsbezug: Der Constraint erlaubt nur `exact`,
`less_than`, `greater_than`, `not_stated`.

| `amount_qualifier` | Zeilen |
|---|---:|
| `not_stated` | 1.591.063 |
| `exact` | 1.394.584 |
| `less_than` | 14.598 |
| `greater_than` | 737 |

`per_serving` und `per_container` kommen nicht vor; eine
Container-Menge ist auch in keiner eigenen Spalte gespeichert.
`supplier_product_nutrients` mittelt daher nichts und liest den
Qualifier nicht. Es summiert die vorhandenen `amount_per_serving`-
Werte.

Gegenbeleg: Produkt `2cd2e70b-6428-49d0-80b4-0fda3eca8243` (*Vegan
Liquid Iron Berry*) hat fuer dieselbe Produkt-ID Calories `10, 10,
15, 20` und Iron `6, 6, 12, 18`, alle `exact`. Die Sicht liefert
folglich `enercc = 55`, `fe_mg = 42`: kein Mittelwert, aber ohne
Provenienz auch keine sichere Wahl zwischen mehreren Etikettwerten.
Die vermeintliche Portion/Packung-Semantik ist in der Importquelle
nicht belegt; eine Umdeutung waere Raten.

A2 bleibt ausserhalb dieses Auftrags: `apps/` war gesperrt und es
gibt keinen gespeicherten Wert, den die Tafel als Packungswert zeigen
koennte. Der Befund ist damit eine Datenluecke, keine UI-Umsetzung.

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

`[cmd]` **`amount_qualifier`, alle Werte:**

    not_stated      1.591.063
    exact           1.394.584
    less_than          14.598
    greater_than          737

`[read]` **KEIN Portions- oder Packungsbezug.**

### Zwei falsche Deutungen, meine und seine

`[cmd]` **C-485 meldete, die Portionsspalte FEHLE** ? **ich
habe es weitergereicht.**

`[cmd]` **Claude Code meldete in G-464, sie sei `amount_qualifier`
** ? **auch falsch.**

`[read]` **Codex hat beide widerlegt** ? **die Spalte sagt, wie
GENAU eine Menge ist, nicht WORAUF sie sich bezieht.**

### Und der echte Befund ist schlimmer

> *,,C-496 mittelt nicht, SUMMIERT aber mehrfache Etikettzeilen;
bei Vegan Liquid Iron Berry entstehen so 55 kcal und 42 mg
Eisen."*

`[read]` **Zwei Etikettspalten werden addiert** ? **das Produkt
hat die doppelten Werte.**

> *,,Ohne Herkunft je Wert ist keine sichere Korrektur
moeglich."*

`[cmd]` **Als C-512** ? **die Zeilen brauchen eine Herkunft,
bevor gerechnet werden kann.**

**Abgenommen, der Befund bleibt offen.**
