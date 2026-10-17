---
nr: G-658
typ: befund
modul: goals
schwere: mittel
angelegt: 2026-10-17
agent: codex
beauftragt: 2026-10-17

braucht: []
kind_von: G-625

quellen:
  - backup/_manifests/kettenlauf-lumeos_tageskette_20261017.log
  - supabase/_pipeline/_validierung/goals-g625-plans.test.ts

beruehrt:
  tabellen: []
  dateien:
    - supabase/_pipeline/_validierung/goals-g625-plans.test.ts
---
# Tageskettenlauf vom 17.10. rot in der G-625-Probe

## Befund

`[cmd]` Der tägliche Kettenlauf vom 17.10. bricht in `goals-g625-plans.test.ts` ab mit `G625_ZIEL_GESCHUETZT:G626_BLOCK:vorgehen_zu_langsam,zielrichtung`. Die Wegwerf-Datenbank `lumeos_tageskette_20261017` ist erhalten geblieben.
`[annahme]` Wie bei G-651 hängt die Probe am Datum: Testdaten oder Grenzen wachsen mit `--today` mit.

## Was zu tun ist (Codex)

- Die Ursache belegen.
- Die Probe mit festem Stichtag rechnen.
- Gegenprobe: Mit verschobenem Datum bleibt die Probe grün, mit eingebautem Fehler wird sie rot.
- Danach die Wegwerf-Datenbank verwerfen.
- Prüfen, ob weitere Goals-Proben am heutigen Datum hängen.

## Auftrag - Kopf

    AUFTRAG FUER codex - G-658 Tageskettenlauf rot in G-625 (nach G-655/G-522 live)
    Bereich: supabase/_pipeline/_validierung/
    Fremd:   docs/ gehoert dem Orchestrator.
    Stand:   2026-10-17, HEAD 52b3f1bf

