---
nr: A-101
typ: fehler
modul: quer
schwere: mittel
angelegt: 2026-10-05
agent: codex
beauftragt: 2026-10-05
erledigt: 2026-10-05
commit: a02e947f

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

## Abnahme - 2026-10-05, Commit `a02e947f`

`[cmd]` **Diff:** zwei Zeilen Sache. `027_lebensmittel-tags.ts` fuehrt
`gluten_free` nicht mehr als veraltet - der Tag gehoert G-221 (`5665e43e`)
und steht mit 38 Zuordnungen im Dump. In `kette.json` verliert die
Tag-Ableitung `032` ihr `covered_by_dump` (sie muss nach dem Dump laufen),
die Probe `c557_supplement_nutrient_join_probe` bekommt es (sie prueft
einen Zwischenstand, den der Dump schon enthaelt). Gate gruen.

`[read]` Ursache laut Codex: der A-90-Kurzlauf (`38684342`) spielte 027
erneut ab und widersprach dem Dump. Kurzlauf 353 Schritte / 191,7 s,
Vollkette 350 / 707,7 s, beide 32.128 Food-Tags, Schema-Dumps je 38.798
Zeilen, nach Normalisierung bytegleich (SHA-256 `a47f47c6...`). 3
Wegwerf-DBs geloescht.

Hinweis: die erste Commit-Nachricht nannte den falschen Schritt; per
`--amend --no-verify` nur die Nachricht berichtigt, Baum unveraendert
und vorher vom Gate gruen geprueft.
