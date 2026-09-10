---
nr: G-410
typ: feature
modul: coach
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-409
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  dateien:
    - apps/coach/src/components/draft/ansicht-akte.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-410 — der Kalender und das Athletendetail

## Auftrag — es ist eine KOPIE

Tom, 2026-09-08:

> ich verstehe es einfach nicht. es gibt eine vorlage und man
> erfindet irgendeinen scheiss selber. wir machen einen mockup, wir
> binden nichts an. und man ist nicht faehig eine kopie dieses
> mockup zu machen ? fuer was brauche ich da noch ki?

**Beauftragt am 2026-09-08.**

`[read]` **Dreimal wurde etwas anderes gebaut als die Vorlage
zeigt** ? **G-405, G-407, G-409.**

`[read]` **Das hoert hier auf.**

## Die Regel

`[read]` **Kopieren, nicht uebersetzen.**

    die Vorlage zeigt vier Kennzahlen
      -> vier Kennzahlen, dieselben Zahlen,
         dieselben Beschriftungen

    die Vorlage zeigt einen Balken 218/220 g
      -> ein Balken 218/220 g

    die Vorlage zeigt den Satz
      "Saturday 200 kcal over, agreed refeed"
      -> genau dieser Satz

    die Vorlage zeigt ein Monatsraster
      -> ein Monatsraster

`[read]` **KEINE Datenbank.** `[read]` **KEINE Abfrage.**

`[read]` **Deutsch ist erlaubt** ? **aber *Calories today 2.180*
wird zu *Kalorien heute 2.180*, nicht zu `kcal_schnitt`.**

`[cmd]` **Die Zahlen stehen in der Vorlage** ? `CAL_EVENTS`,
`FCR_CLIENT`, `FCR_MODULES`, `ASSIST_*`.

`[read]` **Sie werden uebernommen, Wort fuer Wort.**

## Was das fuer die angebundenen Stellen heisst

`[cmd]` **Heute ziehen zehn Unterpunkte echte Daten.**

`[read]` **Die bleiben** ? **aber sie zeigen die FORM der Vorlage,
nicht die Form einer Abfrage.**

`[read]` **Wenn die Vorlage vier Kacheln zeigt und die Datenbank
sieben Felder liefert: vier Kacheln.**

`[read]` **Und wenn die Datenbank ein Feld nicht hat: die Zahl der
Vorlage, mit Vermerk.**

## Die zwei Stellen

### Kalender

`[cmd]` **`module-coach-portal-tools.jsx:30`,
`window.PortalCalendar`.**

`[read]` **Die Datei ist 129 Zeilen lang fuer den Kalender.**
`[read]` **Bau sie nach, Zeile fuer Zeile.**

`[cmd]` **Zwei Spalten 1.5fr / 1fr, Monatsraster mit 7 Spalten,
`minHeight: 62`, drei Farbstreifen je Zelle, Legende mit fuenf
Arten, Tagesspalte, Upcoming mit sieben Zeilen.**

`[cmd]` **`CAL_EVENTS` uebernehmen** ? **neun Tage, vierzehn
Termine, mit Namen und Uhrzeiten.**

### Athletendetail

`[cmd]` **`module-coach-client-record.jsx`.**

`[cmd]` **Toms Bild zeigt den Reiter Nutrition:**

    vier Kennzahlen:
      Calories today 2.180 / Protein 218 g /
      Adherence 7d 97 % / Water 4,2 L

    drei Kacheln:
      Today's macros    Protein 218/220 g
                        Carbs   180/190 g
                        Fat      52/55 g
      This week         Wochenbalken, Sat hervorgehoben
                        "Saturday 200 kcal over, agreed
                         refeed. Protein never below 208 g."
      Micronutrient gaps  Vitamin D 62 %, Omega-3 71 %,
                        Magnesium 84 %
                        "Vitamin D is supplemented; the gap
                         is dietary intake only."

`[read]` **Und ebenso die anderen sieben Reiter** ? **Overview,
Training, Recovery, Supplements, Body, Medical, Timeline.**

`[read]` **Was heute dort steht** (`kcal_schnitt`,
`tage_mit_eintrag`, `fat_g_schnitt`) ? **faellt weg.**

## Abnahmebedingungen

    A1  der Kalender: Zeile fuer Zeile wie PortalCalendar.
        Bildschirmfoto neben dem Vorlagenbild.
    A2  je der acht Reiter des Athletendetails: die Kacheln
        der Vorlage, dieselben Zahlen, dieselben Saetze.
        Acht Bildschirmfotos neben den Vorlagenbildern.
    A3  KEIN Spaltenname am Schirm. Gegenprobe: `_schnitt`,
        `_g_`, `tage_mit`, `letzter_eintrag` finden nichts
        im gerenderten Text.
    A4  je Kachel: Zahl der Vorlage / Zahl im Bau. Wenn
        sie abweicht, mit Grund.
    A5  apps/coach 61/61 oder mehr, apps/web 1545.

## Der Satz, um den es geht

Tom, 2026-09-08:

> es soll so aussehen wie ich es will und nicht wie du oder der
> agent es will. ich diskutiere den ganzen tag ueber denselben
> scheiss und komme keinen centimeter weiter.

`[read]` **Die Vorlage IST, wie er es will.**

`[read]` **Jede Abweichung davon ist eine Entscheidung, die dem
Agenten nicht zusteht** ? **auch eine, die technisch besser
waere.**

`[read]` **Wenn etwas nicht baubar ist: melden, nicht ersetzen.**

## Was nicht zu tun ist

**NICHTS ERFINDEN.** `[read]` **Wo die Vorlage etwas zeigt, wird
es kopiert.**
**KEINE eigene Bauform** ? **auch wenn sie besser waere.**
**Deutsch ist erlaubt** ? **Tom: *,,es darf ja deutsch sein, das
interessiert mich nicht."***

`[read]` **Die SPRACHE ist frei, die FORM nicht.**
**Keine Abfrage bauen** ? **es wird nichts angebunden.**
**`?bereich=` NICHT anfassen.**
Nicht committen, nicht stagen, nicht pushen.

## Der Dev-Server

`[cmd]` **Port 3220 laeuft.**
`[cmd]` **NIE `start`, `neustart`, `aufraeumen`.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
