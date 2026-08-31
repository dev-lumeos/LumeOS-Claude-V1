---
nr: G-291
typ: feature
modul: nutrition
schwere: hoch
angelegt: 2026-08-31
braucht: []
kind_von: null
entscheidung: null
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/insights-echt.tsx
zahlen: null
---

# G-291 — TrendChart fehlt im Insights-Reiter

## Befund

`[cmd]` **`SPEC_10`, *Insights Components (6)*, nennt `TrendChart`:**
*,,Linien-Chart (7d/14d/30d): Kalorien, Protein, Score"*.

`[cmd]` **Gebaut ist er nicht.** `[cmd]` **Der Reiter zeigt zwei
Kacheln: Kalorienbilanz und Makroverteilung.**

`[read]` **Tom, 2026-08-31:** *,,kann nicht sein dass wir da nur 2
kacheln haben."*

## Die Daten stehen

`[cmd]` **181 Tage mit Mahlzeiten fuer `dev`.** `[cmd]` **Die
Tagesbilanz liefert Kalorien und Makros je Tag.**

`[cmd]` **Der Score kommt mit C-324** — **bis dahin zwei Linien statt
drei.**

`[read]` **Und die Zeitraeume gibt es schon:** der Nutrients-Reiter
traegt 1/7/30/90, **die Spec nennt 7/14/30.** **Eine Auswahl, nicht
zwei.**

## Auftrag — der Insights-Reiter wird vollstaendig

**Mitbeauftragt: G-292, G-293, G-295.** Bericht in diese Datei.

`[read]` **Vorbereitet am 2026-08-31.**

### Das Ergebnis

`[cmd]` **`SPEC_10` nennt sechs Insights-Komponenten. Gebaut sind
zwei.**

    TrendChart           fehlt   -> G-291
    NutrientHeatmap      entfernt -> G-295
    MacroDetail          fehlt   -> G-293
    DeficitSuggestions   siehe unten
    CrossModuleInsights  wartet auf C-324 -> G-294
    MicroFlagsList       fehlt   -> G-292

`[read]` **Tom, 2026-08-31:** *,,kann nicht sein dass wir da nur 2
kacheln haben."*

### Die Daten stehen alle

`[cmd]` **181 Tage mit Mahlzeiten. 74 Tage mit vollstaendiger Bilanz
in 30 Tagen. `FASAT`, `FAMS`, `FAPU`, `FAPUN3`, `FAPUN6` gefuellt.**
`[cmd]` **Die Flag-Funktion ist seit dem 30.08. live: 9 / 11 / 10
Flags bei 7 / 30 / 90 Tagen.**

`[read]` **Es fehlt nirgends eine Datengrundlage** — **es fehlen die
Anzeigen.**

### Die Vorlagen stehen an drei Stellen

`[cmd]` **CLAUDE.md: das Vorgaengerrepo — Struktur ja, Code nie.**

    referenz/.../nutrition/components/TrendAnalysis.tsx
      339 Zeilen. Score-Farbe, Makro-Maximum, Zeitraumwahl.

    mockup-zwischenwurf/features/nutrition/TrendsView.js
      116 Zeilen. Kalorien-Trend 30 Tage, Protein-Streak-Kalender,
      7x7-Heatmap, Makro-Qualitaet.

    mockup-zwischenwurf/features/nutrition/HeatmapView.js
      69 Zeilen. 7x5-Kalendergitter mit Farbintensitaet.

    mockup-zwischenwurf/features/nutrition/InsightsView.js
      210 Zeilen. Sagt selbst: *,,Mirrors InsightsView + MacroDetail
      + NutritionScoreCard + TrendAnalysis + SPEC_09_SCORING"*.

`[read]` **Die letzte ist die wichtigste** — **sie ist gegen die Spec
gebaut und zeigt, wie die vier Kacheln zusammen aussehen.**

`[cmd]` **Und sie traegt eine Score-Aufschluesselung mit Gewichten**
— **das ist C-324, das gerade bei Codex laeuft.** `[read]` **Nicht
uebernehmen; die Formel ist in E-25 entschieden.**

`[read]` **Lies alle vier, bevor du baust.** `[read]` **Und wenn eine
Vorlage etwas zeigt, das die Spec nicht nennt: melden, nicht
weglassen.**

### Zu G-295 — meine Abnahme war falsch

`[cmd]` **Ich habe der Entfernung der Heatmap am 30.08.
zugestimmt**, mit der Begruendung, der Nutrients-Reiter zeige
dasselbe.

`[read]` **Das war falsch.** `[cmd]` **`HeatmapView.js` ist genau diese Kachel: 7x5-Gitter,
Farbintensitaet je Tag.**

**Die Sparkline zeigt einen Naehrstoff
ueber die Zeit; die Heatmap zeigt einen Tag je Feld, ueber alle
Naehrstoffe.** **Nicht *,,wie lief Vitamin C"*, sondern *,,welche
Tage waren gut"*.**

`[read]` **Die entfernte Attrappe war richtig entfernt — sie war
erfunden.** **Die Kachel gehoert echt gebaut.**

### DeficitSuggestions — melden, nicht bauen

`[cmd]` **`SPEC_10` nennt sie: *,,Food-Empfehlungen basierend auf
aktuellen Defiziten"*.**

`[cmd]` **Und C-108/F-02 sagt: nennen ja, bewerten nein.** `[read]`
**Eine Empfehlung ist eine Bewertung.**

`[read]` **Das ist ein Widerspruch zwischen Spec und Entscheidung.**
**Miss ihn und melde ihn — bau sie nicht.**

### Was nicht zu tun ist

**Nichts erfinden, wo Daten fehlen.**
**Keine Bewertung ausgeben.**
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen.** **Codex fasst ihn nicht
an.**

### Nachweis

    je Kachel               echte Zahlen, Bildschirmfoto
    Zeitraeume              welche, und passen sie zum
                            Nutrients-Reiter
    Heatmap                 28 Tage, Farbe je Tag
    Fetthierarchie          aufklappbar, aus den Daten
    Warnungen               sortiert nach Schwere, welche
    DeficitSuggestions      Widerspruch benannt, nicht gebaut
    Attrappen               am Schirm, vorher / nachher
    Ladezeit                ms, kalt und warm

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
