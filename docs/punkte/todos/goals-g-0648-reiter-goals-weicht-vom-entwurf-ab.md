---
nr: G-648
typ: fehler
modul: goals
schwere: hoch
angelegt: 2026-10-16

braucht: []
kind_von: G-618

quellen:
  - docs/spezifikation/goals-ziel-setzen/entwurf/Main.dc.html
  - docs/spezifikation/goals-ziel-setzen/dossier.html

beruehrt:
  tabellen: []
  dateien:
    - apps/web/src/app/v2/goals
---
# Reiter Goals weicht vom freigegebenen Entwurf ab

## Befund

`[read]` Tom 2026-10-16: "reiter goals ist noch weit weg von der entwurfsvorlage".

`[cmd]` Vergleich `entwurf/Main.dc.html` mit `backup/orch-stand-goals.png` (dev, 10.10.). In der App fehlen auf der Steuerungskarte:
- Trend (Start · Trend · Ziel)
- Fortschritt in %
- Prognose "nach Plan erreicht am …" und "bei deinem Tempo …"
- Module als Zeile in der Karte
- Details mit Verlauf-Grafik (Soll gegen Trend), Kennzahlen (Veränderung gesamt, Tempo 4 Wochen, Soll, verbleibend), Wochentabelle (Woche, Trend, Soll Δ, Ø kcal, Anpassung) und Meilensteinen
- Bearbeiten in der Karte (Titel, Zielgewicht, Zieldatum, Programm; Pausieren, Beenden, Löschen mit Rückfrage)
- "Fortsetzen" mit zwei Wegen

Messziel-Kacheln: Lage, Datenpunkte-Tabelle und Bearbeiten in der Kachel fehlen oder sehen anders aus. Unter dem Reiter stehen noch Mockup-Referenz und alte Bauteile.

Ursache: Der Orchestrator hat Berichte nach Funktion abgenommen und nie Bildschirmfoto gegen Entwurf verglichen.

## Was zu tun ist

Claude Code baut den Reiter Abschnitt für Abschnitt nach `Main.dc.html` (Aufbau, Reihenfolge, Texte, Tokens). Abnahme je Abschnitt mit Bildpaar: Entwurf gerendert neben der App. Fehlende Daten werden sichtbar mit "kommt" markiert und G-650 zugeordnet.