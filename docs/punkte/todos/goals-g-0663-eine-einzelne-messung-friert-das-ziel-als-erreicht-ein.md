---
nr: G-663
typ: befund
modul: goals
schwere: hoch
angelegt: 2026-10-17

braucht: []
kind_von: G-611

quellen:
  - supabase/_pipeline/11_goals/611_goal_freeze_archive_delete.sql

beruehrt:
  tabellen:
    - goals.body_measurements
  dateien:
    - supabase/_pipeline/11_goals/611_goal_freeze_archive_delete.sql
---
# Eine einzelne Messung friert das Steuerziel als "erreicht" ein

## Befund

`[cmd]` dev hat am 17.10. eine Messung mit 88,00 kg. Merkmale: measurement_source manual, ohne source_detail, angelegt um 07:13:48 UTC, also 14:13 Ortszeit. Daneben steht die Tageszeile mit 84,64 kg.
Im selben Moment (07:13:48) wurden die 4 Messziele aktualisiert.
`[read]` Claude Code (17.10.): Seitdem ist "Lean Bulk auf 88 kg" als "erreicht" eingefroren. Die Steuerung und die Phase Engine haben keine laufende Phase mehr. Claude Code hat auf dev nichts geschrieben.
`[annahme]` Wer die Zeile geschrieben hat, ist nicht belegt. Möglich sind eine Eingabe von Tom über die App oder eine Probe eines Agenten.

Zwei Teile:
1. Datenbereinigung: Wenn die Zeile nicht von Tom stammt, wird sie entfernt. Das Einfrieren wird berechnet und hebt sich danach von selbst auf.
2. Fehler im Produkt: Ein einzelner Ausreisser (+3,4 kg an einem Tag) reicht, um das Ziel zu erreichen. Die Karte führt aber den **Trend** als massgeblichen Wert ("Trend 84,8 kg"). "Erreicht" muss am Trendgewicht hängen, nicht am letzten Rohwert, sonst wiederholt sich das bei jedem Tippfehler.

## Was zu tun ist (Codex)

- Teil 2: `goal_state_at` bzw. die Erreicht-Prüfung für Gewichtsziele mit Trendgewicht (`trendgewicht_am`). Für Messziele ohne Trend bleibt der Rohwert, das wird benannt.
- Probe: Ein einzelner Ausreisser friert nicht ein, ein erreichter Trend friert ein, Sabotage wird rot.
- Teil 1 erst nach Toms Antwort.

## Antwort Tom - 2026-10-18 07:23

`[read]` Tom hat die 88-kg-Messung selbst eingetragen, als er Tobias gezeigt hat, wie man Meilensteine setzt. Dabei hat die App verlangt, dass ein Gewicht eingegeben wird. Die Zeile kann gelöscht werden (Teil 1 freigegeben).
Folgebefund G-665: Beim Setzen eines Meilensteins schreibt die App eine Körpermessung.

