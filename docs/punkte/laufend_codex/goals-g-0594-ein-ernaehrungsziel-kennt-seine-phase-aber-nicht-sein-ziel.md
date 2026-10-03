---
nr: G-594
typ: fehler
modul: goals
schwere: hoch
angelegt: 2026-10-03
agent: codex
beauftragt: 2026-10-03

braucht: [G-563, A-95]
kind_von: A-95

quellen:
  - docs/punkte/erledigt/goals-g-0563-berechne-zielwerte-waehlt-selbst-eine-phase.md
  - docs/punkte/erledigt/goals-g-0559-phase-am-deckelt-auf-eine-phase.md

beruehrt:
  tabellen:
    - goals.nutrition_targets
    - goals.goal_phases
  dateien:
    - supabase/_pipeline/11_goals/563_target_scoped_calculation.sql
    - supabase/_pipeline/11_goals/559_phase_at_scope.sql
---

# Ein Ernaehrungsziel kennt seine Phase, aber nicht sein Ziel

## Auftrag — Kopf

    AUFTRAG FUER Codex - G-594: der Trigger darf die genannte Phase
                               benutzen
    Bereich: supabase/_pipeline/11_goals/
    Fremd:   apps/ und packages/ gehoeren Claude Code. docs/ gehoert
             dem Orchestrator, auch diese Punktdatei.
    Stand:   2026-10-03

## Entschieden — Form 2, von Tom am 03.10.

**Der Trigger nimmt `NEW.phase_id`, wenn er gegeben ist.** Keine neue
Spalte, kein Backfill, kein zweiter Schluessel.

`[read]` **Die frueher in dieser Datei empfohlene Form 1** — eine
`goal_id`-Spalte auf `nutrition_targets` — **ist verworfen**, und der
Einwand von damals gegen Form 2 (*„sie laesst die Tabelle ohne
Zielbezug"*) traegt nicht: `goals.goal_phases` traegt `goal_id`
(`111_goals_ziele_phasen.sql:93`). Der Zielbezug steht einen Join
entfernt und kann nicht auseinanderlaufen. Eine zweite Spalte fuer eine
ableitbare Tatsache ist der Anfang des Auseinanderlaufens, und der
Primaerschluessel `(user_id, gueltig_ab)` bliebe sofort fraglich.

## Der Befund — der Ausweg steckt schon in der Signatur

`[read]` **`563_target_scoped_calculation.sql:315-337`, Funktion
`goals.nutrition_target_assign_phase()`:**

    SELECT max(p.phase_id::text)::uuid,
           max(p.goal_id::text)::uuid,
           count(*)::integer
      INTO v_phase_id, v_goal_id, v_phase_count
      FROM goals.phase_am(NEW.user_id, NEW.gueltig_ab) p;    -- (1)

    IF v_phase_count = 0 THEN  RAISE ... 23514;  END IF;
    IF v_phase_count > 1 THEN  RAISE ... 23514;  END IF;     -- (2)

    IF NEW.phase_id IS NOT NULL AND NEW.phase_id <> v_phase_id THEN
      RAISE ... 23514;                                       -- (3)
    END IF;
    NEW.phase_id := v_phase_id;

`[read]` **Die Aufloesung laeuft immer ueber das Datum (1), und (2)
wirft, bevor (3) `NEW.phase_id` ueberhaupt ansieht.** Wer die Phase
nennt, faellt trotzdem an der Mengenpruefung. `NEW.phase_id` wird heute
nur gelesen, um einen Widerspruch abzuweisen — nie, um das Ziel zu
bestimmen. **Der Ausweg ist gebaut und unerreichbar.**

`[read]` **`559_phase_at_scope.sql:96-98` benennt die Luecke selbst:**

    -- Der Zielwert-Schreibweg besitzt noch keinen goal_id-Vertrag.
    -- Solange er keinen eindeutigen Zielbezug bekommt, darf er bei
    -- mehreren Phasen nicht still die erste Zeile nehmen.

**Das bleibt richtig.** Es aendert sich nur, was „eindeutiger Zielbezug"
heisst: ab jetzt genuegt eine genannte Phase.

### Warum es jetzt zaehlt

`[cmd]` **`test-user@lumeos.local` hat seit A-95 zwei offene Phasen** an
zwei Zielen — `goals.phase_am(test-user, heute)` gibt **2**. Jeder
Schreibvorgang auf `nutrition_targets` mit `herkunft = 'formel'` faellt
fuer diesen Nutzer mit `23514`. **Und test-user ist der Nutzer, auf dem
laut Projektregel jeder Nachweis zu fuehren ist.** Das blockiert jede
Oberflaeche, die Ernaehrungsziele schreibt.

`[cmd]` **Gegenprobe:** `tom.seed@example.com` hat eine offene Phase →
`phase_am` gibt 1, der Trigger laeuft.

## Was zu tun ist

### A1 — die genannte Phase aufloesen, statt sie nur zu pruefen

In `goals.nutrition_target_assign_phase()`:

**Wenn `NEW.phase_id IS NOT NULL`:** Phase und Ziel **aus dieser Phase**
holen, die Mengenpruefung ueberspringen. Eine Zeile aus derselben
Quelle, nicht aus einer neuen:

    SELECT p.phase_id, p.goal_id
      INTO v_phase_id, v_goal_id
      FROM goals.phase_am(NEW.user_id, NEW.gueltig_ab) p
     WHERE p.phase_id = NEW.phase_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'nutrition_targets: genannte phase_id ist am
        Gueltigkeitstag keine aktive Phase dieses Nutzers'
        USING ERRCODE = '23514';
    END IF;

**Das prueft drei Dinge auf einmal:** die Phase gehoert dem Nutzer, sie
ist am Gueltigkeitstag aktiv, und sie nennt ihr Ziel. **Kein neues
Hilfsmittel** — `phase_am` bleibt die einzige Quelle, `search_path = ''`
und `SECURITY INVOKER` bleiben wie sie sind.

**Wenn `NEW.phase_id IS NULL`:** alles bleibt wie heute. 0 → `23514`,
mehr als 1 → `23514`, genau 1 → nehmen. **Die Mengenpruefung
verschwindet nicht, sie wird nur nicht mehr zur Wand fuer den, der sein
Ziel kennt.**

`[read]` **Die Uebergabe an `berechne_zielwerte(NEW.user_id, v_goal_id,
NEW.gueltig_ab)` in Zeile 341 bleibt unveraendert** — sie bekommt nur
jetzt ein Ziel, das aus der genannten Phase stammt.

### A2 — die doppelte Fassung aufloesen, messend

`[read]` **`goals.nutrition_target_assign_phase()` wird zweimal
definiert:** `559_phase_at_scope.sql:99` und
`563_target_scoped_calculation.sql:303`. Der spaetere Schritt gewinnt.

**Messen, nicht annehmen:** schreibt irgendein Kettenschritt **zwischen
559 und 563** in `goals.nutrition_targets`?

- **Nein** → nur 563 traegt die Fassung; 559 bekommt an der Stelle einen
  Zeiger auf 563 statt einer eigenen Definition.
- **Ja** → beide tragen dieselbe Fassung, wortgleich.

**Das ist kein Nebenschauplatz.** Genau diese Art Widerspruch — ein
spaeterer Schritt, der einen frueheren still umwirft — hat heute
Vormittag Goals umgelegt (A-95, G-595).

### A3 — melden, nicht aendern

`[read]` **Nicht gemessen:** ob `nutrition_targets.phase_id` einen
Fremdschluessel auf `goal_phases` traegt und was dort bei `ON DELETE`
steht. **Nachsehen und im Bericht nennen.** Wenn eine geloeschte Phase
die `phase_id` auf NULL setzt, verliert eine alte Zielzeile ihren
Zielbezug — das ist ein eigener Punkt, keine Aenderung in diesem.

## Nachweise — alle gegen eine Wegwerf-Datenbank

**Nie gegen die laufende Datenbank.** Wegwerf-Datenbank aus der Kette,
danach verwerfen, im Bericht die Anzahl nennen.

1. **Zwei offene Phasen, Phase genannt** → Zeile wird geschrieben,
   `phase_id` und die vier Zahlen stehen drin, `23514` faellt nicht.
2. **Zwei offene Phasen, Phase nicht genannt** → weiterhin `23514` mit
   dem alten Text. **Diese Pruefung darf nicht verschwinden.**
3. **Phase genannt, die dem Nutzer nicht gehoert** → `23514`.
4. **Phase genannt, die am Gueltigkeitstag nicht aktiv ist** → `23514`.
5. **Eine offene Phase, Phase nicht genannt** → laeuft wie bisher
   (Gegenprobe gegen eine Regression).
6. **Sabotage in beide Richtungen:** mit einem eingebauten Fehler muss
   jeder der fuenf Nachweise rot werden. Sonst misst er nichts.

**Tests:** die Behauptung gehoert in die bestehende
`_validierung/goals-g563-target-calculation.test.ts`, **keine neue
Datei**. `goals-g511-phase-calories.test.ts` und
`_validierung/testdaten-pruefen.ts` muessen gruen bleiben.

## Harte Regeln

- **Kein `supabase db push`.** Kein Zugriff auf die laufende Datenbank.
- **Kein Commit, kein Push.** Der Bericht geht an Tom.
- **Nur `supabase/_pipeline/`.** `apps/` und `packages/` sind fremd —
  der Schreibweg, der die Phase nennt, ist G-591 und gehoert Claude
  Code.
- **Zahlen im Bericht sind gemessen**, mit Stichtag, nicht aus diesem
  Auftrag uebernommen.

**Nicht Teil:** die Oberflaeche fuer Ernaehrungsziele (G-591) · eine
`goal_id`-Spalte (verworfen) · G-532/A2, das auf `goal_contributions`
wartet · die Frage, ob ein Nutzer mehrere offene Phasen haben darf
(beantwortet: ja, G-559 und G-563 sind darauf gebaut).
