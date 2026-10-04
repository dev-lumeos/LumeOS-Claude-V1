---
nr: G-604
typ: fehler
modul: goals
schwere: hoch
angelegt: 2026-10-04
agent: codex
beauftragt: 2026-10-04

braucht: [C-560]
kind_von: C-560

quellen:
  - docs/punkte/erledigt/quer-c-0560-der-testdatenpruefer-wird-gruen.md
  - docs/punkte/todos/quer-c-0561-zwei-testproben-beschreiben-den-bestand-nicht-das-soll.md
  - docs/ssot/97-ziele-und-phasen.md
  - supabase/_pipeline/daten/zielvokabular.json

beruehrt:
  tabellen:
    - goals.user_goals
    - goals.nutrition_targets
  dateien:
    - supabase/_pipeline/11_goals/111_goals_ziele_phasen.sql
    - supabase/_pipeline/_testdaten/testdaten-einspielen.ts
    - supabase/_pipeline/_validierung/testdaten-pruefen.ts
---

# Hoechstens ein aktives Kalorienziel

## Auftrag - Kopf

    AUFTRAG FUER Codex - G-604: hoechstens ein aktives Ziel mit Kalorienrichtung
    Bereich: supabase/_pipeline/
    Fremd:   apps/, packages/, tools/. docs/ gehoert dem Orchestrator.
    Stand:   2026-10-04

## Die Fachregel - Tom, 2026-10-04

**Aufbau und Abbau gleichzeitig aktiv ist logisch unmoeglich.** Daraus:

- Je Nutzer **hoechstens ein aktives Ziel mit Kalorienrichtung**
  (Abbau, Aufbau, Halten, Recomp).
- Weitere solche Ziele duerfen **geplant** sein (Phase Engine plant sie
  nacheinander) - nur nicht gleichzeitig aktiv.
- Ziele **ohne** Kalorienrichtung laufen parallel, wie bisher in den
  drei Prioplaetzen.
- **,primaer" ist das aktive Kalorienziel**, nicht Platz 1 der
  Reihenfolge. Ein Klick auf ▲/▼ (G-591) darf die Kalorienrichtung nie
  umschalten.

## Der Befund

`[cmd]` Die Datenbank erzwingt heute nur: aktive Ziele auf Plaetzen 1-3
(`user_goals_check1`, `uq_user_goals_active_slot`) und ein `is_primary`
(`uq_user_goals_one_primary`). **Nichts verhindert zwei aktive Ziele mit
entgegengesetzter Richtung.** `[cmd]` test-user hat seit A-95 genau das:
`fat_loss` und `lean_bulk` aktiv, daraus 0 Zielwerte (C-560).

## Was zu tun ist

1. **Messen und im Bericht nennen:** alle Zieltypen bzw. `nutrition_goal`-
   Werte und ihre Kalorienrichtung - Quelle `daten/zielvokabular.json`,
   nicht neu erfinden. Wo ist die Richtung pro Ziel ablesbar? Bestand:
   wie viele Nutzer haben heute mehr als ein aktives Kalorienziel, in der
   Kette und **lesend** live.
2. **Regel in die Datenbank**, so dass jeder Schreibweg sie trifft
   (Index oder Trigger, deine Wahl, begruenden). Fehlermeldung so, dass
   die Oberflaeche sie dem Nutzer zeigen kann.
3. **,primaer" an das Kalorienziel binden** - oder begruenden, warum die
   bestehende Spalte das schon traegt.
4. **Seed von test-user korrigieren:** ein aktives Kalorienziel, das
   andere geplant. Danach muessen aus dem aktiven Ziel Zielwerte
   entstehen.
5. **C-561 mitnehmen:** Omega-3-Probe zurueck auf das Goals-Ziel, sofern
   jetzt Zielwerte da sind; Mangel-Szenario 17 -> 7: Ursache messen,
   Soll begruenden oder Bestand reparieren.
6. Kette gruen, `testdaten-pruefen` 0 Befunde, Sabotage in beide
   Richtungen (zweites aktives Kalorienziel -> rot).

## Harte Regeln

Nie gegen Live schreiben. Live nur lesend messen. Wegwerf-Datenbanken
danach loeschen, Anzahl nennen. Kein Commit. Live-Einspielen nur mit
Toms Freigabe, nach dem Muster G-602/G-603. Trifft die Regel live
bestehende Daten: **melden, nicht anpassen.**
