---
nr: G-616
typ: fehler
modul: goals
schwere: mittel
angelegt: 2026-10-07

braucht: []
kind_von: G-614

quellen:
  - docs/punkte/erledigt/goals-g-0614-der-strategiekatalog-kennt-karte-und-mindestgrad.md

beruehrt:
  tabellen:
    - goals.goal_strategies
  dateien:
    - supabase/_pipeline/_validierung/goals-g536-goal-strategies.test.ts
---

# Der G-536-Test ist rot und steht nicht in der Kette

## Befund

`[read]` Codex, G-614: `goals-g536-goal-strategies.test.ts` separat gestartet
besteht nur 6/8; die zwei Rechentests scheitern an der G-563-Mehrphasenregel.
Der Test ist kein Schritt der Kette - also laeuft er nie, und niemand sieht,
dass er rot ist (dieselbe Klasse wie A-102).

## Was zu tun ist

Messen, welche Pruefdateien unter `_validierung/` in keinem Kettenschritt
stehen. Je Datei: in die Kette (und gruen machen) oder begruendet loeschen.
Ein Waechter, der eine Pruefdatei ohne Kettenschritt meldet.
