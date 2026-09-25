---
nr: G-508
typ: befund
modul: training
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: G-25
entscheidung: null
beruehrt:
  dateien:
    - apps/web/src/app/v2/training/tabs-spec.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-508 - die Volumengrenzen haben keine belegte Quelle

## Die Kacheln

`[cmd]` **`training/landmarks`, sieben Marken UEBER der
Linie** - **der Reiter mit den meisten.** Darunter:

    Volume landmarks - sets per week (MEV bis MRV)
    Feedback loop - wie sich die Grenzen anpassen
    Post-workout feedback

## Der Grund, gemessen

`[cmd]` **Keine Spalte im ganzen Repo nennt MEV, MAV oder
MRV** - Suche ueber `information_schema.columns` nach
`%mev%`, `%mrv%`, `%landmark%`: **ein Treffer, und der ist
`medical.injection_sites.landmark_note`** (anatomische
Landmarke, etwas voellig anderes).

`[read]` **Der Grund steht schon woertlich im Modul**, in
`ansicht.tsx:544`: *,,diese Sollwerte sind dieselbe Klasse wie
MEV/MAV/MRV - Schwellen aus der Literatur, fuer die im Repo
keine belegte Quelle liegt."*

## Warum das kein Schemapunkt ist

`[read]` **Eine Tabelle zu bauen loest es nicht.** `[read]`
**Die Frage ist, WOHER die Zahlen kommen** - welche Studie,
welche Ausgabe, je Muskelgruppe. **Ohne Beleg waere eine
Tabelle nur ein Ort fuer erfundene Zahlen.**

`[cmd]` **Dieselbe Klasse wie die Naehrstoffreferenzen**
(`nutrition.nutrient_reference_values` mit `source`,
`source_version`, `source_url`) - **dort steht je Zeile, wer
sie behauptet.**

## Was daneben SCHON echt ist

`[cmd]` **Die Saetze je Muskelgruppe stehen angebunden auf
`today`** (`ansicht.tsx:548`, aus `volumenJeMuskel()`).
`[read]` **Gezeigt werden die Saetze, nicht ein Soll** - genau
weil das Soll keine Quelle hat.

## Abnahmebedingungen

    A1  eine belegte Quelle je Grenzwert, mit
        Fundstelle - oder die Entscheidung, dass
        LumeOS keine fuehrt.
    A2  bei einer Quelle: Tabelle mit source,
        source_version, source_url.
    A3  keine Zahl ohne Beleg.
