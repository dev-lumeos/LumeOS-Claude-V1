---
nr: G-648
typ: fehler
modul: goals
schwere: hoch
angelegt: 2026-10-16
agent: claudecode
beauftragt: 2026-10-16
erledigt: 2026-10-18
commit: d19da5b5

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
## Auftrag - Kopf

    AUFTRAG FUER claudecode - G-648 + G-649: Goals und Phase Engine 1:1 nach Entwurf
    Bereich: siehe Auftrag im Chat 16.10.
    Fremd:   siehe Auftrag. docs/ gehoert dem Orchestrator.
    Stand:   2026-10-16, HEAD 19435919

## Nachtrag Tom 16.10. 15:32 - Kopf, Aktionen, Lücken

`[read]` Ich habe die Bilder `g648-soll-seite.png` und `g648-ist-dev-seite.png` nebeneinander gelegt.

**Kopf und Aktionen (Tom: "nicht wirklich logisch"):**
- Soll: Eyebrow "GOALS & BODY", Titel "Ziele", rechts genau ein Knopf "+ Ziel setzen". "+ Messziel" steht nur am Abschnitt Messziele.
- Ist: Statuschips, Phasen-Pille, Stand-Zeile, Datumsleiste und vier Knöpfe (Log weight, Measurements, + Messziel, Ziel setzen). "+ Messziel" ist doppelt.
- Regel ab jetzt: Der Kopf zeigt nur die Hauptaktion des offenen Reiters.
  - Goals: "+ Ziel setzen"
  - Phase engine: "+ Neuer Plan" (Entwurf)
  - Body metrics: "Gewicht eintragen"
  - Measurements: "Messung eintragen"
  - Sonst kein Knopf
- Chips, Phasen-Pille und Stand-Zeile fallen weg, die Karte zeigt das bereits.

**Weitere Lücken am Bild:**
- Das Tagesziel "2.714 kcal · 170 g P" bricht um.
- "Diese Woche": Training ohne Soll-Balken und ohne "x / 4".
- Abgeschlossen: Die Knöpfe brechen bei 810 px um. Im Entwurf stehen Chip und Knöpfe in einer Zeile.
- Die Zahl am Reiter "Goals 5" gibt es im Entwurf nicht.
- In Texten der App fehlen Umlaute ("Koerpermessungen").
- Die Kontextleiste rechts (Buddy-Attrappe) nimmt 340 px weg. Ein eigener Punkt wäre nötig, falls Tom das will.

## Stand 16.10. 16:45, Commit `62cf1bfb` (Gate grün, nicht abgenommen)

`[cmd]` Bildschirm dev (`.git/o-goals.png`) nach G-652:
- "Tagesziel 2.714 kcal · 170 g P" läuft in die Spalte Phase hinein ("PWoche 1 von 15"). Der Umbruch ist also nicht behoben.
- "Plan endet vor dem Ziel" bricht über zwei Zeilen um, in Monospace.
- Die Reiterleiste ist abgeschnitten ("Phy…").
- Messziel-Titel in "Diese Woche" brechen um.

`[read]` Was noch fehlt, weil die Kette es nicht liefert:
- Lage-Pille des Steuerziels
- Wochenbewegung je Messziel
- Tempo und "voraussichtlich" der Messziele

Das geht an Codex (G-654). Die Modulbeiträge gehören zu G-522.

## Feinschliff - 2026-10-16, Commit `0a960089` (Gate grün)

`[cmd]` Bild dev nach dem Commit (`.git/o-goals2.png`):
- Die Kennzahlen überlappen nicht mehr.
- Die Reiterleiste bricht in zwei Zeilen um.
- Die Prognose steht auf einer Zeile.
- Die Phase rutscht in eine zweite Zeile.
- Die Messziel-Titel enden auf "…".

Grundursache für beides: Die Inhaltsfläche ist etwa 810 px breit, im Entwurf 1.240 px. Die Kontextleiste rechts (Buddy-Attrappe) belegt 340 px. Entscheidung bei Tom.
Noch "kommt (offen)": Diese Woche je Messziel, Lage-Pille, Messziel-Kennzahlen. Der Leser ist jetzt live (G-654), die Anbindung folgt.

## Stand 2026-10-17, Commit `64733c92`

`[cmd]` Bild dev:
- Lage-Pille "hinterher" ist da.
- Diese Woche: Kniebeuge +2,0 kg, Kreuzheben +5,0 kg (ohne Frist, kein Soll), Körperfett +0,1 %, Training 3/4.
- Prognose: "Plan endet vor dem Ziel", bei deinem Tempo 03.01.2028.

Offen:
- Modul-Kacheln "kommt (offen)", bis G-522 live ist
- Körperfett "hinterher", bis das Testziel neu angelegt ist (G-655)
- 1 Konsolenfehler laut schuss.mjs

## Abnahme - 2026-10-18, Commit `d19da5b5`

`[read]` Claude Code hat 19 Ist-Bilder (`backup/abnahme4-*`) gegen g648/g649-soll gelegt und 14 Abweichungen behoben.
Die übrigen Abweichungen stehen als eigene Punkte:
- G-667: Kraftpunkte je Satz statt je Einheit
- G-668: Planlinie und Soll Δ widersprechen sich
- G-669: "Als nächstes" ohne Datum, Dauer und Grund
- G-670: Testdaten (Planlücke, linked_modules, Gewohnheitsserie)
- G-671: Reste der Mockup-Referenz unter der Phase Engine

Bei Tom liegen noch: die Vorschau "neue Rechnung" (G-628), vergangene Phasen bearbeiten, Löschen beim aktiven Plan, Link vom Datenpunkt zur Einheit, Coach-Freigabe.
`[cmd]` Gate grün beim Commit. Der Punkt ist mit dieser Abnahme geschlossen.
