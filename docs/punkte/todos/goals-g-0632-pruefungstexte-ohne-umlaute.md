---
nr: G-632
typ: fehler
modul: goals
schwere: niedrig
angelegt: 2026-10-08

braucht: []
kind_von: G-626

quellen:
  - supabase/_pipeline/11_goals/626_experience_goal_limits.sql

beruehrt:
  tabellen: []
  dateien:
    - supabase/_pipeline/11_goals/626_experience_goal_limits.sql
    - supabase/_pipeline/11_goals/626_controlling_goal_write_guard.sql
---

# Prüfungstexte ohne Umlaute

## Befund

`[cmd]` `626_experience_goal_limits.sql`, Zeilen 276–315: Die Hinweistexte, die `ziel_grenzen_pruefen` liefert, stehen ohne Umlaute, z. B. `'Diaet ueber %s Wochen am Stueck ist fuer %s gesperrt.'` und `'Zielgewicht und Groesse fehlen fuer die BMI-Pruefung.'`.

`[read]` Claude Code, G-628 Teil 2: Die Oberfläche zeigt diese Texte unverändert an. Der Nutzer sieht also „Diaet“ und „Groesse“.

## Was zu tun ist (Codex)

Die Texte für den Nutzer in echtem UTF-8 (ä ö ü ß) schreiben. Schlüssel und Bezeichner bleiben ASCII. Den Nachweis per Hex-Dump führen, nicht über die Konsole. Am besten vor dem Live-Paket, damit nicht zweimal eingespielt wird.
