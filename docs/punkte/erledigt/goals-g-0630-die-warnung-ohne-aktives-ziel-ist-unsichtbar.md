---
nr: G-630
typ: fehler
modul: goals
schwere: hoch
angelegt: 2026-10-08
agent: claudecode
beauftragt: 2026-10-08
erledigt: 2026-10-08
commit: 113fbfae

braucht: [G-622]
kind_von: G-622

quellen:
  - docs/punkte/erledigt/goals-g-0622-ohne-aktives-ziel-gibt-es-keine-tagesziele.md
  - docs/spezifikation/goals-ziel-setzen/README.md

beruehrt:
  tabellen: []
  dateien:
    - apps/web/src/lib/profile/zielwerte-read.ts
---

# Die Warnung ohne aktives Ziel ist unsichtbar

## Befund

`[read]` Codex, G-622: `apps/web/src/lib/profile/zielwerte-read.ts:194` macht aus der neuen Herkunft `formel` und reicht das Hindernis (`kein_aktives_ziel`, `erhaltung_nicht_berechenbar`) nicht durch. Die Datenbank kennzeichnet Erhaltung ohne Ziel, die Oberfläche zeigt es nicht.

## Entschieden - 2026-10-08 08:18, Tom

„erhaltung aktiv aber klare warnung dass kein goal aktiv ist, der user muss wissen dass er planlos laeuft“

## Was zu tun ist (Claude Code)

Herkunft und Hindernis durchreichen; sichtbare Warnung überall, wo Tagesziele stehen (Today, Nutrition, Goals-Steuerungskarte wie im Entwurf `entwurf/Main.dc.html` Zustand „kein Ziel“), mit Weg zu „Ziel setzen“ bzw. Fortsetzen. Schirmnachweis erst nach G-622 live.


## Auftrag - Kopf

    AUFTRAG FUER Claude Code - G-630: Warnung ohne aktives Ziel sichtbar machen
    Bereich: apps/web/src/lib/profile, apps/web/src/app/v2 (Today, Nutrition, Goals)
    Fremd:   supabase/_pipeline/ (Codex). docs/ gehoert dem Orchestrator.
    Stand:   2026-10-08, HEAD aa28c51d


## Erledigt - 2026-10-08, Commit `113fbfae`

`[cmd]` 12 Dateien nur apps/web: kein-ziel-warnung.tsx und steuerung-ohne-ziel.tsx neu, zielwerte-read/-hindernis/-write, zielhinweis (Nutrition), dashboard-echt + lesen (Today), ziel-regeln (abandoned = "beendet"; einziger übriger Treffer "abgebrochen" ist ein Kommentar). Gate grün, web 2783. test-user nachgemessen: Abbauziel active Prio 1 primär, Aufbauziel on_hold.

`[read]` Claude Code: Warnung am Schirm 0 → 1 → 0 je Modul (Today, Nutrition, Goals), Text "Kein aktives Ziel – du läufst auf Erhaltung. Tagesziel 2.754 kcal … · 163 g Protein. „G-559 Abbauziel“ ruht." Rückbau über den neuen Knopf "Fortsetzen", nichts per SQL. g630-kein-ziel 12 Tests, Gegenprobe 7/7 rot. Fotos backup/g630-*.png (14).

Folgefund: Goals-Kopf zählt Phasen eines pausierten Ziels als laufend → G-636.