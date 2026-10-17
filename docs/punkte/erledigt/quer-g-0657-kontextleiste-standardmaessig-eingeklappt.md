---
nr: G-657
typ: aufgabe
modul: quer
schwere: mittel
angelegt: 2026-10-16
agent: claudecode
beauftragt: 2026-10-16
erledigt: 2026-10-17
commit: 64733c92

braucht: []
kind_von: G-648

quellen:
  - docs/spezifikation/goals-ziel-setzen/entwurf/Main.dc.html

beruehrt:
  tabellen: []
  dateien:
    - apps/web/src/components/shell
---
# Kontextleiste (Buddy) standardmäßig eingeklappt

## Befund

`[cmd]` Auf dev ist die Inhaltsfläche etwa 810 px breit, im Entwurf 1.240 px. Die Kontextleiste rechts belegt 340 px und zeigt eine Attrappe ("Buddy ist in G-02 eine Attrappe").
Folgen in Goals:
- Kennzahlen brechen um.
- Messziel-Titel enden auf "…".
- Messziel-Kacheln stehen einspaltig.

## Entscheidung

`[read]` Tom hat am 16.10. um 19:18 entschieden: Die Leiste ist standardmäßig eingeklappt, in der ganzen App.

## Was zu tun ist (Claude Code)

- Eingeklappt als Grundzustand. Ein schmaler Griff oder Knopf klappt sie auf.
- Merkt sich die Wahl je Nutzer, wenn es dafür schon einen Ort gibt. Sonst nur für die Sitzung, und das wird gemeldet.
- Nachweis mit Bildpaaren Goals und Phase Engine bei 1.440 px: Die Kennzahlen stehen in einer Zeile wie im Entwurf, die Titel sind ungekürzt.

## Auftrag - Kopf

    AUFTRAG FUER claudecode - G-657 Kontextleiste standardmaessig eingeklappt
    Bereich: apps/web (Shell)
    Fremd:   supabase/, docs/
    Stand:   2026-10-16, HEAD 9509ecc2

## Erledigt - 2026-10-17, Commit `64733c92`

`[read]` Claude Code:
- Die Wahl wird in `public.user_display_preferences` gespeichert (shell.kontextleiste).
- Auf dev bei 1.440 px ist die Inhaltsfläche 1.200 px breit.
- Auf test-user übersteht die Wahl Neuladen und Modulwechsel.
- Die Coach-App ist unverändert.
- Gegenproben rot.

`[cmd]` Gate grün beim Commit. Mein Bild von dev (`.git/o-goals3.png`) zeigt die Kontextleiste eingeklappt, die Kennzahlen in einer Zeile, die Messziel-Titel ungekürzt und 0 Attrappen.
