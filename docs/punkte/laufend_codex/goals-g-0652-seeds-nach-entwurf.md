---
nr: G-652
typ: aufgabe
modul: goals
schwere: hoch
angelegt: 2026-10-16
agent: codex
beauftragt: 2026-10-16

braucht: []
kind_von: G-648

quellen:
  - docs/spezifikation/goals-ziel-setzen/entwurf/Main.dc.html
  - docs/spezifikation/goals-ziel-setzen/entwurf/PhaseEngine.dc.html
  - supabase/_pipeline/_testdaten/testdaten-einspielen.ts

beruehrt:
  tabellen: []
  dateien:
    - supabase/_pipeline/_testdaten/testdaten-einspielen.ts
---
# Testdaten nach Entwurf: Messziele, Pläne, Termine, Umlaute

## Befund

`[read]` Tom hat am 16.10. um 15:32 gesagt: Goals und Phase Engine sind fast leer. Man sieht nicht, wie es mit Material aussieht.
`[read]` Ist auf dev:
- 0 Messziele
- 1 Plan
- leere Module (G-522)
- Testdaten ohne Umlaute ("Fruehjahrs-Cut", "Bankdruecken"; testdaten-einspielen.ts Z. 1069)

## Was zu tun ist (Codex)

Die Testdaten folgen den Entwurfsdaten.

Messziele aus Main.dc.html:
- Kniebeuge 1RM 160 kg bis 31.03.2027, aktuell 140
- Kreuzheben 150 kg × 5 ohne Frist
- Körperfett 14 % bis 01.03.2027, aktuell 16,2
- Gewohnheit Training 4× pro Woche, mit Wochenserie

Dazu die Historie, aus der diese Werte entstehen:
- Kraftsätze
- Navy-Messungen
- Trainings

Pläne aus PhaseEngine.dc.html Z. 259-264:
- "Contest Prep 2027": Entwurf aus Vorlage prep, Termine NPC Classic Bangkok (A 04.02.2027), Samui Open (B) und Urlaub (S)
- "Off-Season 2027": Entwurf aus annual, mit einer Position aus eigenen Werten
- abgeschlossen: "Frühjahrs-Cut 2026" (erreicht) und "Contest Prep 2025" (Termin gehalten)

Allgemein:
- Alle Texte mit echten Umlauten
- Nur über vorhandene Kettenfunktionen anlegen, keine Abkürzung an den Wächtern vorbei

Live auf dev nach Muster A-105. Tom hat am 16.10. zugestimmt.

## Auftrag - Kopf

    AUFTRAG FUER codex - G-652 Testdaten nach Entwurf
    Bereich: supabase/_pipeline/ (Kette, Testdaten), Live auf dev nach A-105
    Fremd:   apps/, packages/, tools/. docs/ gehoert dem Orchestrator.
    Stand:   2026-10-16, HEAD 7f83d0b2

