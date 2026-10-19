---
nr: G-676
typ: aufgabe
modul: plattform
schwere: hoch
angelegt: 2026-10-18
agent: codex
beauftragt: 2026-10-18

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

## Entschieden (Tom, 18.10. 13:23)

- In den Papierkorb kommen nur Objekte mit eigenem Namen oder Verlauf: Ziele, Plaene, Programme, Rezepte, Stacks, Einheiten, Befunde und Aehnliches.
- Einzelbuchungen (Mahlzeit-Eintrag, Wasser, Satz, Einnahme-Haken) bekommen kein Papierkorb-Eintrag. Statt dessen gibt es direkt nach dem Loeschen ein "Rueckgaengig" in der Meldung.
- "Konto loeschen" entfernt auch den Papierkorb restlos.

## Was zu tun ist

1. Codex: das Inventar und ein Vorschlag für die Mechanik, ohne Änderung an Live oder Kette.
2. Orchestrator: die zentrale Papierkorb-Seite im Entwurf, danach Aufträge je Modul.
3. Goals und die Phase Engine setzt G-675 als ersten Fall um. Die Mechanik muss für alle Module taugen.

## Auftrag - Kopf

    AUFTRAG FUER codex - G-676 Papierkorb: Inventar und Mechanik
    Bereich: supabase/_pipeline (nur lesen), apps/web/src (nur lesen)
    Fremd:   docs/ gehoert dem Orchestrator.
    Stand:   2026-10-18, HEAD 5815dba3

## Ergebnis Codex - 2026-10-19 (Inventar und Mechanik, nur gelesen)

- `[cmd]` nachgemessen: 17 Aufrufe von .delete() in 15 App-Dateien. Die Punktdatei nannte 16, die 17 enthalten Ersetzen und Rueckbau. 34 SQL-Dateien enthalten DELETE FROM: 9 Laufzeit, 19 Katalogpflege, 6 Testdaten.
- Echte Loeschwege fuer Nutzer:
  - Papierkorb: Goals Ziel, Plan, Termin; Supplements Stack-Position (mit Namen oder Verlauf); Medical Befund-Anhang mit Storage-Datei.
  - Rueckgaengig: Mahlzeit-Position, Wasser, Plan-Eintrag, Einkaufsposten, Allergie, Vorliebe, Einnahme-Haken, Injektionsflaeche, geplante Plan-Position.
  - Kein Loeschen heute, nur Status: Einkaufsliste archivieren, Trainingssitzung verwerfen, Einladung oder Stack-Vorlage zurueckziehen.
- `[read]` Befund: Wird eine Stack-Position hart geloescht, verlieren Einnahmen und Injektionslogs ihren Bezug (SET NULL). Wird ein Befund-Original entfernt, ist die Storage-Datei sofort weg.
- Mechanik, vom Orchestrator uebernommen:
  - deleted_at, deleted_by und der vorige Status am jeweiligen Wurzelobjekt.
  - Kinder werden ueber den Elterndatensatz ausgeblendet.
  - Restriktive SELECT-Policy mit deleted_at IS NULL. SECURITY DEFINER-Funktionen, Views und App-Abfragen filtern gleich.
  - Ein Katalog-Waechter ueber alle Papierkorbtabellen und ihre Leser, dazu Proben je Leseweg.
  - Endgueltig loeschen ist eine eigene bestaetigte Funktion. Kein automatischer Ablauf.
- Wiederherstellen:
  - Ein Ziel kommt pausiert zurueck, ein Plan als Entwurf. Liegt das Ziel ebenfalls im Papierkorb, kommt es mit.
  - Ist ein Name, Slot oder Zeitfenster inzwischen belegt, meldet das System einen Konflikt und der Nutzer entscheidet.
- `[cmd]` nachgemessen: Ein Weg "Konto loeschen" existiert in apps/web/src nicht (0 Treffer). `[read]` 30 Tabellen mit user_id haben keinen FK auf auth.users. Bei einigen Tabellen steht RESTRICT. storage.objects hat keinen FK. Daraus wird G-680.
