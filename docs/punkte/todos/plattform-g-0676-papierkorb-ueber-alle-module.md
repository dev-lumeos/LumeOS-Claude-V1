---
nr: G-676
typ: aufgabe
modul: plattform
schwere: hoch
angelegt: 2026-10-18

braucht: []
kind_von: G-673

quellen:
  - docs/spezifikation/goals-ziel-setzen/entwurf/Main.dc.html
  - docs/spezifikation/goals-ziel-setzen/entwurf/PhaseEngine.dc.html

beruehrt:
  tabellen: []
  dateien:
    - supabase/_pipeline
---
# Papierkorb über alle Module

## Befund

`[read]` Tom hat am 18.10. entschieden: Gelöschtes landet in einem Papierkorb und lässt sich zurückholen. Das gilt in allen Modulen.
Nichts wird automatisch entfernt. Weg ist ein Eintrag erst, wenn der Nutzer im Papierkorb "Endgültig löschen" wählt.

`[read]` Für Goals und die Phase Engine legt der Entwurf das Verhalten fest (Version 57):
- Löschen heißt überall "In den Papierkorb".
- Unten auf der Seite steht ein Papierkorb-Bereich mit "Wiederherstellen" und "Endgültig löschen". Endgültig löschen hat eine eigene Rückfrage.
- Ein Gewichtsziel kommt pausiert zurück, ein Plan, der aktiv war, als Entwurf. Alles andere kommt an seinen alten Platz.
- Der zentrale Papierkorb unter Einstellungen zeigt alles Gelöschte aus allen Modulen.

`[cmd]` Bestand am 18.10.: In `apps/web/src` gibt es 16 Aufrufe von `.delete()` in 15 Dateien (nutrition, supplements, medical, goals, allergien).
In `supabase/_pipeline` enthalten 34 SQL-Dateien `DELETE FROM`. Darin sind Seeds, Wartung und Tests mitgezählt. Welche davon Löschpfade für Nutzer sind, ist nicht gemessen.

## Offen (Tom)

- Einzelbuchungen wie Mahlzeit-Eintrag, Wasser, Satz oder Einnahme-Haken: Kommen auch sie in den Papierkorb, oder reicht dort ein "Rückgängig" direkt nach dem Löschen? Der Orchestrator empfiehlt "Rückgängig".

## Was zu tun ist

1. Codex: das Inventar und ein Vorschlag für die Mechanik, ohne Änderung an Live oder Kette.
2. Orchestrator: die zentrale Papierkorb-Seite im Entwurf, danach Aufträge je Modul.
3. Goals und die Phase Engine setzt G-675 als ersten Fall um. Die Mechanik muss für alle Module taugen.

## Auftrag - Kopf

    AUFTRAG FUER codex - G-676 Papierkorb: Inventar und Mechanik
    Bereich: supabase/_pipeline (nur lesen), apps/web/src (nur lesen)
    Fremd:   docs/ gehoert dem Orchestrator.
    Stand:   2026-10-18, HEAD 5815dba3
