---
nr: G-684
typ: befund
modul: goals
schwere: mittel
angelegt: 2026-10-19

braucht: []
kind_von: G-675

quellen:
  - supabase/_pipeline/11_goals/675_controlling_edit_preview.sql

beruehrt:
  tabellen:
    - goals.user_goals
  dateien:
    - supabase/_pipeline/11_goals
---
# Der Tageswert auf dev nennt das abgeschlossene Ziel, und die Vorschau sperrt das aktive Ziel

## Befund

`[read]` Codex meldet bei G-675 (19.10.) zwei Bestandsbefunde:
1. Der Tageswert auf dev liefert die ID des abgeschlossenen Frühjahrs-Cuts. Aktiv ist aber "Lean Bulk auf 88 kg" (`dc5f4d6f-…`). Die Kalorien stimmen trotzdem (2.714,0 kcal). Ein Leser, der über die gelieferte ID weiterliest, landet aber beim falschen Ziel.
2. Die neue Vorschau meldet für das aktive Lean Bulk mit dem heutigen Zieldatum die Sperre `vorgehen_zu_langsam`. Würde Tom das Ziel unverändert bearbeiten, wäre Speichern gesperrt.

## Was zu tun ist (Codex)

- Zu 1: Belegen, welcher Leser die ID liefert und woher er sie nimmt. Korrigieren und den Bestand nach A-105 bereinigen.
- Zu 2: Klären, was `vorgehen_zu_langsam` hier bedeutet und ob die Sperre für ein bestehendes Ziel richtig ist. Es darf nicht sein, dass ein bestehendes Ziel sich nicht mehr speichern lässt, ohne dass die Seite den Grund und einen Ausweg zeigt.
