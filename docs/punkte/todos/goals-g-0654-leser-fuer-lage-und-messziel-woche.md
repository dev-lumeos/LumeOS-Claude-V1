---
nr: G-654
typ: aufgabe
modul: goals
schwere: hoch
angelegt: 2026-10-16

braucht: []
kind_von: G-650

quellen:
  - docs/spezifikation/goals-ziel-setzen/entwurf/Main.dc.html

beruehrt:
  tabellen: []
  dateien:
    - supabase/_pipeline/11_goals
---
# Leser für die Lage des Steuerziels und die Wochenwerte der Messziele

## Befund

`[read]` Claude Code (16.10.) zeigt diese Werte als "kommt (offen)", weil die Kette sie nicht liefert:
1. Lage-Pille des Steuerziels (Entwurf: "hinterher" / "im Plan" / "voraus")
2. Wochenbewegung je Messziel in "Diese Woche" (Entwurf: Kniebeuge +2,5 kg, Körperfett −0,3 %), dazu das Soll der Woche als grauen Balken
3. Kennzahlen in der Messziel-Kachel: "Tempo" und "voraussichtlich"

## Was zu tun ist (Codex)

- **Lage Steuerziel:** Trend gegen die Soll-Linie des Plans. Die Toleranz geht aus dem Plan hervor oder wird benannt, nicht geraten. Ohne Trend gibt es keine Lage.
- **Wochenbewegung je Messziel:** Δ diese Woche und Soll Δ für diese Woche, gerechnet aus Frist und Restweg. Ohne Frist gibt es kein Soll.
- **Tempo und voraussichtlich:** aus dem Verlauf. Ist das Tempo ≤ 0 oder fehlt der Verlauf: "nicht absehbar", kein Datum.
- Je Wert eine Quelle angeben.
- Proben mit Sabotage. Live auf dev nach A-105.
