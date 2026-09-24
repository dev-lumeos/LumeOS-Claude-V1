---
nr: C-540
typ: feature
modul: nutrition
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-539
entscheidung: C-539
agent: codex
beauftragt: 2026-09-08
beruehrt:
  tabellen: [nutrition.foods]
zahlen:
  gemessen: 2026-09-08
  mit_tiername: 1449
---

# C-540 - die Tierarten kurieren

## Toms Entscheidung

Tom, 2026-09-08:

> C-539 kurieren, und mealcam kann trotzdem noch fragen bei
> unstimmigkeiten

`[read]` **Zwei Sachen: der Katalog bekommt die Art, UND die
Rueckfrage bleibt.**

## Was C-539 gemessen hat

    20 Testgerichte   17 richtig
                       2 falsche Tierart auf Rang 1
                       1 ganz andere Speise

    Haehnchenbrust / gegrillte Huehnerbrust   0,4242
    Haehnchenbrust / Putenbrust gegrillt      0,5172

`[cmd]` **Eine hoehere Schwelle behebt nichts: bei 0,5 fallen
6 von 20 Eingaben ganz heraus.**

`[cmd]` **Und die Kategorie *,,Haehnchenbrust & Filet"*
enthaelt Huhn, Pute UND Ente.**

## Der Umfang

`[cmd]` **Selbst gemessen:**

    7.140 Foods gesamt
    1.449 tragen einen Tiernamen
      212 davon Gefluegel
       53 tragen ZWEI Tierarten, eines drei

`[read]` **Nicht 7.140, sondern 1.449** ? **und die Arten
selbst sind eine kurze Liste.**

## Codex eigene Empfehlung (C-539)

> *,,Kuratierte MEHRWERTIGE Food-Arten-Relation mit kanonischen
Codes und Synonymen; Art VOR dem Trigramm-Ranking einschraenken,
bei unsicherer Art KEINE automatische Auswahl."*

`[read]` **Mehrwertig, weil die 53 zwei Arten tragen.**

## Zu bauen

    1  eine Artenrelation: kanonischer Code, Name,
       Synonyme
    2  eine mehrwertige Zuordnung Food -> Art
    3  die Zuordnung, wo sie aus dem Namen sicher ist
    4  wo unsicher: KEINE Zuordnung, gemeldet

`[cmd]` **Der Name traegt sie meist: *Haehnchen*, *Pute*,
*Rind*** ? **MISS, wie weit das reicht, und melde die Reste.**

`[read]` **Die Synonyme sind der Kern: *Huhn*, *Haehnchen*,
*Poulet*, *chicken* meinen dasselbe Tier.**

## Was NICHT Teil ist

`[read]` **Die Zuordnung im Suchweg** ? **erst der Katalog,
dann das Ranking.**

Tom: *,,mealcam kann trotzdem noch fragen bei
unstimmigkeiten"* ? **die Rueckfrage bleibt, auch wenn die Art
sicher ist.**

`[read]` **Und C-538 speichert weiter Bild, Ergebnis und
Deklaration** ? **unveraendert.**

## Abnahmebedingungen

    A1  eine Artenrelation mit Synonymen. Zahl.
    A2  die mehrwertige Zuordnung -- die 53 mit zwei
        Arten tragen beide. Belegt.
    A3  wie viele der 1.449 sind sicher zugeordnet?
        Zahl.
    A4  die Reste GEMELDET, nicht geraten.
    A5  Gegenprobe: Pute und Huhn sind zwei Arten,
        Poulet und Huhn eine.
    A6  KEINE Aenderung am Suchweg.
    A7  Sicherung, Vollkette, ALLE Waechter.

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_

