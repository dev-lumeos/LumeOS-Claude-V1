---
nr: A-102
typ: fehler
modul: quer
schwere: niedrig
angelegt: 2026-10-05
agent: claudecode
beauftragt: 2026-10-05

braucht: []
kind_von: G-592

quellen:
  - docs/punkte/erledigt/nutrition-g-0592-die-hydration-zusammenfassung-hat-keinen-leser.md

beruehrt:
  tabellen: []
  dateien:
    - tools/verdrahtung-pruefen.mjs
---

# verdrahtung-pruefen ist rot und steht nicht im Gate

## Befund

`[read]` Claude Code, Bericht G-592: `tools/verdrahtung-pruefen.mjs`
meldet 26 Namen ohne Test, **auch in der HEAD-Fassung vor G-592**.
Das Werkzeug steht nicht im Gate - ein Waechter, der seit unbekannt
langer Zeit rot ist und den niemand sieht. Bestandsliste nach G-592: 53.

## Was zu tun ist

Die 26 Namen messen und je einordnen (Test fehlt, Name tot, Liste
veraltet). Danach entscheiden: ins Gate mit eingefrorenem Sollstand
(wie `punkte-pruefen`) oder loeschen. Ein roter Waechter ausserhalb des
Gates misst nichts.

## Auftrag - Kopf

    AUFTRAG FUER Claude Code - A-102: verdrahtung-pruefen gruen und im Gate
    Bereich: tools/, apps/, packages/
    Fremd:   supabase/_pipeline/ (Codex). docs/ gehoert dem Orchestrator.
    Stand:   2026-10-05

1. Die 26 Namen messen, je Zeile: Name, Datei, Einordnung (Test fehlt /
   Name tot / Liste veraltet).
2. Tote Namen entfernen, veraltete Listeneintraege berichtigen. Fehlende
   Tests NICHT nachschreiben - als Restbestand einfrieren.
3. Ins Gate mit eingefrorenem Sollstand (Muster `punkte-pruefen`): ein
   neuer Name ohne Test macht das Gate rot.
4. Sabotage in beide Richtungen, Gate gruen. Kein Commit.
