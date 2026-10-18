---
nr: G-665
typ: befund
modul: goals
schwere: hoch
angelegt: 2026-10-18
agent: claudecode
beauftragt: 2026-10-18
erledigt: 2026-10-18
commit: 6337154d

braucht: []
kind_von: G-663

quellen:
  - apps/web/src/lib/goals/koerpermass-write.ts

beruehrt:
  tabellen:
    - goals.body_measurements
  dateien:
    - apps/web/src/lib/goals/koerpermass-write.ts
---
# Meilenstein setzen verlangt ein Gewicht und schreibt es als Messung

## Befund

`[read]` Tom (18.10.): Er hat Tobias auf dev gezeigt, wie man einen Meilenstein setzt. Dabei hat die App ein Gewicht verlangt. Eingegeben hat er 88 kg.
`[cmd]` Ergebnis in `goals.body_measurements`: eine Zeile vom 17.10. mit 88,00 kg, measurement_source manual, ohne source_detail, 07:13:48 UTC. Daneben steht die Tageszeile mit 84,64 kg. Das Steuerziel ist daraufhin als "erreicht" eingefroren (G-663).
`[annahme]` Der Weg, den Tom gegangen ist, ist noch nicht nachgestellt. Möglich ist, dass ein Meilenstein-Dialog die Zielmarke als heutige Messung speichert. Ebenso möglich ist, dass ein Messdialog vor dem Meilenstein Pflicht ist.

## Was zu tun ist (Claude Code)

- Den Weg "Meilenstein setzen" auf test-user nachstellen und belegen, welche Schreibstelle die Messung anlegt.
- Ein Meilenstein ist eine Marke am Ziel und keine Messung. Er darf keine Zeile in `body_measurements` erzeugen und kein aktuelles Gewicht verlangen.
- Wie der Meilenstein-Dialog aussieht, steht im Entwurf (Main.dc.html). Abweichungen werden gemeldet.
- Gegenprobe: Ein Meilenstein setzen ändert die Zahl der Messungen nicht.

## Auftrag - Kopf

    AUFTRAG FUER claudecode - G-665 Meilenstein darf keine Messung schreiben
    Bereich: siehe Auftrag vom 18.10.
    Fremd:   docs/ gehoert dem Orchestrator.
    Stand:   2026-10-18, HEAD b2594c1f

## Erledigt - 2026-10-18, Commit `6337154d`

`[read]` Claude Code: Einen Dialog "Meilenstein setzen" gibt es weder in der App noch im Entwurf. Tom war in Ziel setzen → A1. `ladeMessungen` hat die ältesten 120 von 152 Messungen gelesen. Deshalb sah A1 keine Messung der letzten 14 Tage und verlangte "Gewicht heute". Dort wurde 88 als heutige Messung gespeichert.
Behoben: Es werden jetzt die jüngsten 120 gelesen. Probe auf test-user: alter Weg 153 → 154, neuer Weg 153 → 153. Zurückgebaut.
Offen:
- Manuelle Meilensteine (Frage an Tom)
- A1 soll laut Entwurf den Trend zeigen und kein Jahr ("84,66 kg am 08.10. – Trend 84,7 kg"). Das geht an Claude Code.

