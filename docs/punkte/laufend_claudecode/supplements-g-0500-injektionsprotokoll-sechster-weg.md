---
nr: G-500
typ: fehler
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-499
entscheidung: E-88
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  dateien:
    - apps/web/src/app/v2/supplements/injektion-daten.ts
zahlen:
  gemessen: 2026-09-08
---

# G-500 - das Injektionsprotokoll ist der sechste Weg

## Der Befund

Aus G-499, Claude Code, 2026-09-08:

> *,,Der sechste Weg existiert. Einzige Restquelle ist
`injektion-daten.ts`. Der Injektionsreiter steht NICHT hinter
der Gradpruefung und hat sein eigenes Mockup ? ihn
umzuschreiben waere eine Entscheidung, also gemeldet statt
getan."*

`[read]` **Richtig gemeldet** ? **E-88 hat die Entscheidung
aber schon getroffen.**

## Was drinsteht, selbst gemessen

    compound: "Testosterone Cypionate", ml: 0.6, mg: 150,
      route: "im", needle: "23G x 1.5\""
    compound: "HCG", ml: 0.3, route: "subq",
      needle: "29G x 0.5\"", notes: "500 IU"

`[read]` **Das ist kein Katalog** ? **das ist ein
nachgestelltes Injektionsprotokoll mit Dosis, Weg und
Nadelstaerke.**

`[cmd]` **8,0 KB, 19 `compound`-Eintraege, und die 16 Namen
darin sind EINSTICHSTELLEN: Abdomen, Deltoid, Gluteus, Quad,
SubQ Thigh.**

## Die Entscheidung (E-88, uebertragen)

`[read]` **Die Referenz zeigt Extended-Inhalt, also folgt sie
Extendeds Regel** ? **das galt fuer `mockup-referenz.tsx`, es
gilt hier genauso.**

`[read]` **Der REITER bleibt** ? **es gibt Injektionen ohne
PED (B12, Vitamin D).** **Seine Attrappendaten gehen hinter
die Pruefung.**

## Und die Lehre aus der Nacharbeit gilt

> *,,Nach FELDERN messen, nicht nach Namen."*

`[cmd]` **`compound`, `route`, `needle`, `ml`, `mg` sind die
Felder** ? **suche danach, nicht nach *,,HCG"*.**

## Abnahmebedingungen

    A1  vorher/nachher nach FELDERN gemessen, nicht
        nach Namen.
    A2  compound, route, needle: 0 Chunks im Manifest.
    A3  mit Grad: der Reiter steht wie bisher. Foto.
    A4  ohne Grad: der Reiter bleibt bedienbar, die
        Attrappendaten fehlen mit einer Erklaerung. Foto.
    A5  ein siebter Weg? Das GANZE Manifest nach
        compound/route/needle/dose/mg durchsucht.
    A6  der Waechter deckt injektion-daten mit ab.
        Sabotageprobe.
    A7  apps/web 1995 oder mehr, apps/coach 65.

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_

