---
nr: G-665
typ: befund
modul: goals
schwere: hoch
angelegt: 2026-10-18

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
