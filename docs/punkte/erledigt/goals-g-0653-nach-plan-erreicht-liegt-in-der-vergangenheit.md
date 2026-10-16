---
nr: G-653
typ: befund
modul: goals
schwere: hoch
angelegt: 2026-10-16
agent: codex
beauftragt: 2026-10-16
erledigt: 2026-10-16
commit: 8efe2be9

braucht: []
kind_von: G-650

quellen:
  - supabase/_pipeline/11_goals/650_plan_position_outlook.sql
  - docs/spezifikation/goals-ziel-setzen/entwurf/Main.dc.html

beruehrt:
  tabellen: []
  dateien:
    - supabase/_pipeline/11_goals
---
# "Nach Plan erreicht" zeigt ein vergangenes Datum

## Befund

`[read]` Codex hat live auf dev gemessen: "nach Plan erreicht" ist der 01.09.2026, heute ist der 16.10.2026. Der Trend steht bei 84,8 kg, das Ziel bei 88 kg.
`[read]` `plan_zieldatum` sucht den ersten Tag, an dem die Planlinie das Ziel erreicht. Die Linie läuft vom Startwert des Ziels (85,0 kg, Mai) über alle Positionen. Weil der Nutzer hinter dem Plan liegt, ist dieser Tag schon vorbei.
`[read]` Im Entwurf ist "nach Plan erreicht" eine Vorschau in die Zukunft, sie steht neben "bei deinem Tempo".

## Was zu tun ist (Codex)

**"Nach Plan erreicht"** ist der Tag, an dem der Nutzer das Ziel erreicht:
- ab heute,
- ausgehend vom heutigen Trendgewicht,
- mit den Raten der laufenden und der folgenden Positionen.

Erreicht der Plan das Ziel nicht vor seinem Ende, wird das ausgewiesen ("nicht im Plan"). Es wird kein Datum geraten.

**Die Soll-Linie** im Verlauf und die Lage (hinterher/voraus) bleiben an der bisherigen Linie verankert.

**Erwartung für dev** `[annahme]`: 3,2 kg bei 0,212 kg/Wo sind ungefähr 15 Wochen, also Ende Januar 2027. Die Probe soll diesen Wert prüfen und rot werden, wenn ein vergangenes Datum herauskommt.

## Auftrag - Kopf

    AUFTRAG FUER codex - G-653 Nach Plan erreicht vorwaerts ab heute
    Bereich: supabase/_pipeline/ (Kette, Testdaten), Live auf dev nach A-105
    Fremd:   apps/, packages/, tools/. docs/ gehoert dem Orchestrator.
    Stand:   2026-10-16, HEAD 7f83d0b2

## Erledigt - 2026-10-16, Commit `8efe2be9` (live)

`[read]` Codex auf dev: Ergebnis ist `nicht_im_plan`, ohne Datum. Der Plan endet am 17.01.2027, bevor seine Linie 88 kg erreicht. Meine Erwartung "Ende Januar" war eine Annahme und ist damit widerlegt.
`[read]` Kette 413 grün, die Gegenprobe mit der alten Rechnung wird rot. Sicherungen: `backup/a105-g653-*`.
`[cmd]` Gate grün beim Commit.
`[cmd]` Der Bildschirm zeigt "Plan endet vor dem Ziel".
