---
nr: A-101
typ: fehler
modul: quer
schwere: mittel
angelegt: 2026-10-05
agent: codex
beauftragt: 2026-10-05

braucht: []
kind_von: G-604

quellen:
  - docs/punkte/erledigt/goals-g-0604-hoechstens-ein-aktives-kalorienziel.md

beruehrt:
  tabellen: []
  dateien:
    - supabase/_pipeline/kette.json
---

# Der Kurzlauf der Kette ist in Schritt 027 rot

## Befund

`[read]` Codex, Bericht G-604 (2026-10-05): der dump-beschleunigte
Kurzlauf ueber `kette.json` bricht **schon vor G-604** in Schritt 027 ab,
Ursache eine Inkonsistenz zwischen A-90 und C-38. Die Vollkette
(`kette-voll.json`) ist davon nicht betroffen: Nachtlauf 05.10. gruen,
762 s, Dump `grunddaten-20261004T211241Z.dump`.

`[annahme]` Wer den Kurzlauf als schnellen Nachweis nimmt, sieht rot und
kann den Fehler einer eigenen Aenderung zuschreiben.

## Was zu tun ist

Schritt 027 und die Inkonsistenz messen und benennen (welche Datei, welcher
Commit), dann den Kurzlauf wieder gruen. Gegenprobe: Kurzlauf und Vollkette
liefern dasselbe Schema.

## Auftrag - Kopf

    AUFTRAG FUER Codex - A-101: der Kurzlauf der Kette wird wieder gruen
    Bereich: supabase/_pipeline/
    Fremd:   apps/, packages/, tools/. docs/ gehoert dem Orchestrator.
    Stand:   2026-10-05

Nachweise: Kurzlauf (`kette.json`, dump-beschleunigt) gruen, Vollkette
(`kette-voll.json`) gruen, beide liefern dasselbe Schema (Vergleich
nennen). Nie gegen Live, kein Commit, Wegwerf-DBs loeschen und zaehlen.
