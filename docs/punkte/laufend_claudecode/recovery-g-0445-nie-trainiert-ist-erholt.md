---
nr: G-445
typ: fehler
modul: recovery
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-440
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  dateien:
    - apps/web/src/app/v2/recovery/tab-messwerte.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-445 — ein nie trainierter Muskel ist ERHOLT, nicht unbekannt

## Toms Befund

Tom, 2026-09-08:

> selbst wenn es nur 6 uebungen sind, wo liegt die logik, dass
> dann nur die muskeln der uebungen gruen gezeigt werden? dann
> sollten alle nicht verwendeten muskeln zumindest sicher mal
> gruen sein und die gebrauchten anhand der daten

`[read]` **Er hat recht. Das ist ein Denkfehler in der Rechnung,
kein Datenproblem.**

## Die Logik

`[read]` **Ein Muskel, der nie trainiert wurde, ist
VOLLSTAENDIG ERHOLT.**

`[read]` **Nicht *,,unbekannt"*, nicht grau** ? **100 %,
gruen.**

`[cmd]` **Die Erholungsformel sagt es selbst:**

    base(hours)   Stunden seit der letzten Belastung
                  -> nie belastet = unendlich
                  -> vollstaendig erholt

`[read]` **Die Rechnung behandelt *,,nie trainiert"* wie
*,,keine Daten"*** ? **das sind zwei verschiedene Sachen.**

## Was gemessen ist

`[cmd]` **6 Uebungen im Seed, 132 Saetze.**

`[cmd]` **Sie treffen 11 Muskeln, davon haben 3 eine
Kartenflaeche.**

`[read]` **Die anderen 40 Flaechen sind nicht *,,unbekannt"* ?
sie sind UNBELASTET.**

## Die drei Zustaende, berichtigt

    heute                     richtig
    ----------------------    ----------------------
    Wert (gemessen)           Wert (gemessen)
    "kein Volumen zugeordnet" ERHOLT, 100 %
    "nicht gezeichnet"        (bleibt)

`[read]` **Der mittlere Zustand faellt weg** ? **er war nie ein
Zustand, er war eine fehlende Antwort.**

### Wo die Grenze bleibt

`[read]` **Ein Muskel, den KEINE Uebung anspricht, ist etwas
anderes als einer, den dieser Nutzer nie trainiert hat.**

`[cmd]` **`exercise_muscles` hat 6.744 Zuordnungen auf 90
Muskelgruppen** ? **wer dort nicht vorkommt, kann nie trainiert
werden.**

`[read]` **Das gehoert weiter benannt** ? **aber es ist ein
KATALOGbefund, kein Erholungswert.**

    im Katalog, nie trainiert    -> 100 %, gruen
    nicht im Katalog             -> gemeldet, eigene Marke

## Und die Karte

`[cmd]` **43 Flaechen, heute 3 mit Wert.**

`[read]` **Nachher: 43 Flaechen, 3 mit gerechnetem Wert,
40 gruen.**

`[read]` **Das ist das Bild, das Tom erwartet** ? **und es ist
auch das RICHTIGE: wer sechs Uebungen macht, hat den Rest des
Koerpers frisch.**

## Was NICHT zu tun ist

**KEINEN Wert erfinden** ? **100 % ist kein erfundener Wert, es
ist die Antwort der Formel auf *,,nie belastet"*.**

**Die Unterscheidung NICHT verlieren** ? **wer im Detail
nachsieht, muss erkennen, ob ein Muskel gerechnet oder
unbelastet ist.**

`[read]` **Ein Hinweis wie *,,unbelastet"* neben den 100 %.**

## Abnahmebedingungen

    A1  ein nie trainierter Muskel zeigt 100 %, gruen.
        Foto Karte, Foto Liste.
    A2  der Zustand "kein Volumen zugeordnet" ist weg.
    A3  im Detail steht, ob gerechnet oder unbelastet.
    A4  ein Muskel, den KEINE Uebung anspricht: eigene
        Marke, gemeldet. Zahl.
    A5  die 3 gerechneten Werte sind unveraendert.
        Gemessen vorher/nachher.
    A6  Gegenprobe: ein Muskel mit Saetzen zeigt NICHT
        100 % -> faellt sie?
    A7  vier Module unveraendert.
    A8  apps/web 1707 oder mehr, apps/coach 65.

## Der Dev-Server

`[cmd]` **3200 und 3220 laufen.**
`[cmd]` **NIE `start`, `neustart`, `aufraeumen`.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_

