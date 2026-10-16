---
nr: G-650
typ: aufgabe
modul: goals
schwere: hoch
angelegt: 2026-10-16

braucht: []
kind_von: G-618

quellen:
  - docs/spezifikation/goals-ziel-setzen/entwurf/Main.dc.html
  - docs/spezifikation/goals-ziel-setzen/dossier.html

beruehrt:
  tabellen: []
  dateien:
    - supabase/_pipeline/11_goals
---
# Leser für Verlauf, Prognose und Wochenwerte des steuernden Ziels

## Befund

`[read]` Die Steuerungskarte im Entwurf zeigt:
- eine Verlaufskurve (Trend gegen Soll)
- eine Prognose ("nach Plan erreicht am …" und "bei deinem Tempo …")
- Kennzahlen (Tempo 4 Wochen, Soll/Woche, verbleibend, Fortschritt %)
- eine Wochentabelle (Trend Δ, Soll Δ, Ø kcal, Logtage, Anpassung)

Die Kette liefert davon heute nur `trendgewicht_am`, und zwar je Tag.

## Was zu tun ist (Codex)

Eine Lesefunktion je steuerndem Ziel:
- Wochenserie mit Trend am Wochenende, Soll-Linie, Ø kcal und Logtagen
- Kennzahlen
- Prognose bei aktuellem Tempo (Datum oder "nicht absehbar")

Die Anpassung kommt aus G-627, solange sie fehlt: `NULL`. Alles nur aus vorhandenen Daten, keine Schätzung ohne Kennzeichnung.