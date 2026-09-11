---
nr: G-425
typ: befund
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-424
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  dateien:
    - packages/ui/src/koerperkarte-pfade.ts
zahlen:
  gemessen: 2026-09-08
  pfade: 6
---

# G-425 — die sechs Pfade einzeln sehen

## Toms Frage

Tom, 2026-09-08:

> ich sehe die einzelnen muskeln und ich bin mir sicher, die sind
> einzeln ansteuerbar.

> wieso sollte jemand so ein tool bauen, wo man einzelne muskeln
> sieht, und dann in unlogische gruppen unterteilt mit nicht
> anatomischen namen?

## Was gemessen ist

`[cmd]` **`packages/ui/src/koerperkarte-pfade.ts:129`,
`'upper-back'`, `side: 'back'`, SECHS Pfade.**

`[cmd]` **Je Pfad der absolute Startpunkt:**

    1   x  987  y 381    227 Zeichen
    2   x 1018  y 405    192
    3   x 1017  y 583    472
    4   x 1141  y 398    264
    5   x 1150  y 405    260
    6   x 1161  y 420    505

`[cmd]` **Die Figur ist bei `x ~ 1064` mittig** ? **`trapezius`
`paths_back` beginnt bei 1071 und 1164.**

`[read]` **Also drei Paare, links und rechts:**

    1 / 4    aussen oben
    2 / 5    innen oben
    3 / 6    unten

`[cmd]` **Und Pfad 3 beginnt bei `y=583`** ? **178 Punkte tiefer
als die anderen, mit 472 Zeichen einer der laengsten.**

`[read]` **Der Latissimus zieht vom Ruecken bis zur Taille** ?
**die Lage passt.**

## Was die SSOT bisher sagt

`[cmd]` **`docs/ssot/104-muskelkarte.md:283`:**

> *,,`lat_*` braucht keine Sammelgruppe. Der Latissimus hat keine
> eigene Flaeche ? er steckt in `upper-back`, das mit sechs
> Pfaden den ganzen oberen Ruecken zeichnet."*

`[read]` **Das wurde geschrieben, ohne die sechs Pfade einzeln
anzusehen.**

`[cmd]` **Und `muskel-ebenen.ts:55-60` wirft SECHS Muskeln auf
dieselbe Flaeche:**

    Back, Upper Back, Mid Back,
    Rhomboids, Teres Major, latissimus dorsi

## Der Auftrag

**Faerbe jeden der sechs Pfade EINZELN ein und fotografiere ihn.**

`[read]` **Sechs Bilder, je ein Pfad in Akzentfarbe, die anderen
fuenf grau.**

`[read]` **Dann ist zu sehen, welcher Muskel welcher ist.**

`[cmd]` **Dasselbe fuer `lower-back` (2 Pfade) und `trapezius`
(`paths_back`, 2 Pfade)** ? **damit die Nachbarschaft klar
ist.**

## Und dann die Frage beantworten

`[read]` **Ist die Gruppierung anatomisch, oder ist sie
willkuerlich?**

`[cmd]` **Messen, ob dasselbe Muster anderswo auftritt:**

    trapezius   'both', paths_front UND paths_back
    triceps     'both'
    gluteal     'back'

`[read]` **Wie viele Flaechen haben mehrere Pfade, und ist die
Zusammenfassung dort anatomisch begruendet?**

`[cmd]` **`104-muskelkarte.md:526` fuehrt eine Pfadzahl je
Flaeche** ? **lies sie.**

## Abnahmebedingungen

    A1  sechs Bilder, je ein Pfad von `upper-back` allein
        eingefaerbt. DUNKEL.
    A2  dazu `lower-back` (2) und `trapezius` `paths_back` (2).
    A3  je Pfad: welcher Muskel ist das? Benannt, mit
        Begruendung aus dem Bild.
    A4  wie viele Flaechen haben mehrere Pfade, und wie
        viele davon sind anatomisch zusammengehoerig?
        Tabelle.
    A5  ein Vorschlag: welche der 21 Flaechen sollten
        aufgeteilt werden, welche nicht.
    A6  apps/web 1600 unveraendert.

## Was nicht zu tun ist

**`koerperkarte-pfade.ts` NICHT aendern** ? **das ist der
naechste Auftrag, wenn Tom entschieden hat.**

**Keine Pfade neu zeichnen.**

**Nichts in `supabase/`.**

Nicht committen, nicht stagen, nicht pushen.

## Der Dev-Server

`[cmd]` **3200 und 3220 laufen.**
`[cmd]` **NIE `start`, `neustart`, `aufraeumen`.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
