---
nr: C-177
typ: messung
modul: nutrition
schwere: hoch
angelegt: 2026-08-20
braucht: []
kind_von: C-165
kinder: []
entscheidung: E-36
agent: claudecode
beauftragt: 2026-08-30
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# C-177 - Thai-Aliase fehlen bewusst

## Befund

(neu 2026-08-20). Rest aus
  C-165.

  `[cmd]` **0 Thai-Zeilen** — *„ohne Sprecher oder Quelle waere jede
  Zeile erfunden."*

  `[read]` **Richtig entschieden.** `[cmd]` **Die 138 `name_th` sind
  da**, die Umgangsnamen nicht. **Tom lebt in Thailand** — er kann sie
  liefern oder pruefen.

## Auftrag

**Mitbeauftragt mit C-120 am 2026-08-30.** Der Auftragstext
und der Bericht stehen dort.

Weiter offen: [C-120 - Messbericht](nutrition-c-0120-drei-sperren-in-food-search.md#2026-08-30---c-120-c-191-c-27-und-c-177-nachgemessen).
E-16 betrifft keine Thai-Abschaltung; die laufende Sprachwahl enthaelt TH,
waehrend die Datenbank weiter 0 Thai-Aliase hat.

## Neu gemessen, 2026-08-30

**Aus C-120, Codex.**

`[cmd]` **E-16 betrifft Thai nicht** — die Entscheidung galt einer
anderen Sache.

`[cmd]` **TH ist im heutigen UI auswaehlbar. Die Datenbank hat 0
Thai-Aliase**, bei 32.845 Aliassen insgesamt.

`[read]` **Damit ist *bewusst fehlend* keine gueltige Beschreibung
mehr.** **Die Sprache laesst sich waehlen, und die Suche findet
nichts** — **das ist eine Zusage ohne Deckung.**

## Zwei Wege

`[read]` **Thai in der Sprachwahl abschalten, bis Aliase da sind.**
**Oder Aliase beschaffen.**

`[cmd]` **BLS 4.0 ist die einzige Lebensmittelquelle (E-03)** und
fuehrt keine thailaendischen Namen. `[read]` **Woher sie kaemen, ist
offen** — und das ist die eigentliche Frage.

`[read]` **Tom sitzt in Thailand, und TH ist eine der drei
Zielsprachen.** **Deshalb `schwere: hoch` statt `mittel`.**

## Auftrag — der Hinweis fuer noch nicht Gebautes

**Entschieden in `docs/entscheidungen/E-36`.** `[read]` **Vorbereitet
am 2026-08-30.**

### Die Entscheidung

Tom, 2026-08-30: *,,lassen wir die sprachauswahl aber setzen ein modal
darueber wenn es gewaehlt wird mit *noch nicht entwickelt* oder
sowas"*.

**Die Sprachauswahl bleibt. Wer TH waehlt, bekommt einen Hinweis.**

### Der Baustein existiert bereits

`[cmd]` **`packages/ui/src/in-entwicklung.tsx`, genutzt in 39
Dateien** quer durch alle v2-Module.

    <InEntwicklung titel grund? onClose />

`[cmd]` **Und `grund` ist optional** — *,,Woran es haengt. Ohne
Angabe bleibt es beim allgemeinen Satz."*

`[read]` **Damit ist nichts zu bauen. Nur ein weiterer Aufrufer.**

`[read]` **Ich hatte im Auftrag geschrieben, es gebe die Bauform
nicht.** `[cmd]` **Falsch** — ich habe nach *,,noch nicht
entwickelt"* gesucht, **der Baustein schreibt *,,in Entwicklung"*.**

### Was der `grund` sagen muss

`[cmd]` **Bei Thai: die Aliase fehlen, und woher sie kaemen ist
offen** — BLS 4.0 fuehrt keine thailaendischen Namen (E-03).

`[read]` **Das ist etwas anderes als *,,noch nicht gebaut"*** — **es
ist eine Datenfrage, keine Bauzeitfrage.** **Der Satz sollte das
tragen.**

### Was nicht zu tun ist

**Die Sprachauswahl nicht entfernen.**
**Den alten Routenbaum nicht anfassen.**
**Keine Thai-Aliase erfinden.**
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    TH waehlbar               unveraendert
    Hinweis erscheint         Bildschirmfoto
    DE und EN                 unveraendert - belegt
    Bauform                   an einem zweiten Ort einsetzbar?
                              gezeigt oder begruendet
    Attrappen                 am Schirm, vorher / nachher

`[read]` **Die vorletzte Zeile entscheidet, ob es eine Bauform ist
oder ein Sonderfall.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
