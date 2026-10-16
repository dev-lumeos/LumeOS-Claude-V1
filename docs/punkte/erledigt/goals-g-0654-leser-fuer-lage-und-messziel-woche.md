---
nr: G-654
typ: aufgabe
modul: goals
schwere: hoch
angelegt: 2026-10-16
agent: codex
beauftragt: 2026-10-16
erledigt: 2026-10-16
commit: fca2b3f0

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

## Auftrag - Kopf

    AUFTRAG FUER codex - G-654 Leser Lage + Messziel-Woche, danach G-644 Teil 2
    Bereich: supabase/_pipeline/ (Kette), Live auf dev nach A-105
    Fremd:   apps/, packages/, tools/. docs/ gehoert dem Orchestrator.
    Stand:   2026-10-16, HEAD 8550adf7

## Erledigt - 2026-10-16, Commit `fca2b3f0` (live)

`[read]` Codex, dev:
- Lage "hinterher": 84,824 gegen 88,000 kg, Toleranz 0,300 kg (10 % des Zielwegs, wie G-643)
- Kniebeuge: Δ +3, Soll-Δ +0,942, Tempo +3,92/Wo, voraussichtlich 21.11.2026
- Körperfett: Δ +0,93 Punkte, Soll-Δ −0,062, nicht absehbar
- Kreuzheben: +5, ohne Frist, 30.10.2026
- Training: −1, nicht absehbar

Kette 418 grün, Proben 3/3, Sabotage rot. Sicherung: `backup/a105-g654-g644-*`.
`[cmd]` Gate grün beim Commit.
Folgebefund G-655: Die Werte stammen aus Testdaten, die nicht zum Entwurf passen (Körperfett steigt um 0,93 Punkte pro Woche). Eine Gewohnheit bekommt Tempo und Prognose.
