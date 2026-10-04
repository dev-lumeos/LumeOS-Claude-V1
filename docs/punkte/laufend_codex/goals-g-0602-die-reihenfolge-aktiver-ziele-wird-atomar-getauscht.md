---
nr: G-602
typ: fehler
modul: goals
schwere: mittel
angelegt: 2026-10-04
agent: codex
beauftragt: 2026-10-04

braucht: [G-591]
kind_von: G-591

quellen:
  - docs/punkte/laufend_claudecode/goals-g-0591-zwei-goals-aktionen-ohne-aufrufer.md

beruehrt:
  tabellen:
    - goals.user_goals
  dateien: []
---

# Die Reihenfolge aktiver Ziele wird atomar getauscht

## Auftrag — Kopf

    AUFTRAG FUER Codex - G-602: goals.ziel_reihenfolge_setzen, atomar,
                               Snapshot, und live einspielen
    Bereich: supabase/_pipeline/
    Fremd:   apps/, packages/, tools/. docs/ gehoert dem Orchestrator,
             auch diese Punktdatei.
    Stand:   2026-10-04

## Der Befund — von Claude Code gemessen (G-591)

`[cmd]` `uq_user_goals_active_slot` ist ein eindeutiger, **nicht
aufschiebbarer** Teilindex `(user_id, priority) WHERE active`, und
`user_goals_check1` erlaubt fuer aktive Ziele nur Prioritaet 1 bis 3.
`[cmd]` **Der heutige `reihenfolgeSetzen` schreibt eine Zeile nach der
anderen und scheitert bei jedem Tausch an `23505`.** Bei drei aktiven
Zielen gibt es keinen freien Platz zum Umparken.

## Was zu bauen ist — der Vertrag steht fest, Claude Code baut dagegen

    goals.ziel_reihenfolge_setzen(p_reihenfolge jsonb) RETURNS void
      p_reihenfolge: [{ "goal_id": uuid, "priority": int }, ...]

- **Eine Transaktion, atomar.** Entweder alle Plaetze neu, oder keiner.
- **`SECURITY INVOKER`, `search_path = ''`**, Nutzer aus `auth.uid()` —
  RLS bleibt die Grenze.
- **Pruefungen, jede mit eigenem Fehler:**
  - jede `goal_id` gehoert dem Nutzer und ist aktiv → sonst `42501`
  - die Prioritaeten sind genau eine Umordnung der heutigen Plaetze der
    genannten Ziele (keine Luecke, keine Dublette, nur 1-3) → sonst `23514`
  - **alle** aktiven Ziele des Nutzers sind genannt → sonst `23514`
- **Wie die Funktion den Index umgeht, entscheidest du** — Parken innerhalb
  der Transaktion, oder der Index wird zu einer aufschiebbaren
  `EXCLUDE`-Bedingung. **Die Regel „hoechstens ein aktives Ziel je Platz"
  muss danach weiter von der Datenbank erzwungen werden** — nicht nur von
  der Funktion. Begruendung der Wahl in den Bericht.
- `GRANT EXECUTE` an `authenticated`, nicht an `anon`.

## Nachweise — Wegwerf-Datenbank

1. Drei aktive Ziele, Tausch 1↔2, und Ringtausch 1→2→3→1 → gelingt.
2. Ungueltige Menge (Dublette, Luecke, Platz 4, fremdes Ziel, nicht alle
   genannt) → je der benannte Fehler, **und kein Platz hat sich geaendert.**
3. Ein direktes zweites aktives Ziel auf belegtem Platz ausserhalb der
   Funktion → weiterhin abgewiesen.
4. Sabotage in beide Richtungen.

**Als Kettenschritt, mit Probe.** Kein Commit.

## A2 — Groessen-Snapshot bei Datumsaenderung (Tom, 04.10.: ja)

`[cmd]` Von Claude Code gemessen (G-591): `body_measurements_fill_snapshot`
(`11_goals/112_body_measurements.sql`, BEFORE INSERT OR UPDATE) fuellt
`height_cm_snapshot` nur, wenn die Spalte NULL ist — 0 von 363 Zeilen.
`bmi`, `ffmi`, `lean_mass_kg`, `fat_mass_kg` sind GENERATED ALWAYS.

**Regel:** Aendert ein UPDATE `measurement_date`, holt der Trigger den
Snapshot neu — die Groesse, die zum NEUEN Datum gilt, auf demselben Weg wie
beim Anlegen. **Jede andere Aenderung laesst ihn stehen.** Probe: Datum
geaendert → neuer Snapshot; nur Gewicht geaendert → Snapshot unveraendert;
Sabotage in beide Richtungen.

## A3 — Live einspielen (Tom, 04.10.: ja)

**Freigegeben ist genau das Folgende, nichts darueber hinaus:**

| Objekt | aus |
|---|---|
| `goals.nutrition_target_assign_phase()` | G-594, `563_target_scoped_calculation.sql` |
| `uq_recovery_protocols_one_active` | G-597, `12_recovery/597_one_active_protocol.sql` |
| `goals.ziel_reihenfolge_setzen(jsonb)` | G-602 (A1) |
| `body_measurements_fill_snapshot` | G-602 (A2) |

**Ablauf, in dieser Reihenfolge:**

1. **Erst wenn A1 und A2 in der Wegwerf-Kette gruen sind.**
2. **Vorher lesend pruefen:** fuer den Index 0 Nutzer mit zwei aktiven
   Protokollen (am 04.10. gemessen: 1 aktiv gesamt).
3. **Sicherung** nach `backup/g602-vorher.sql` (`pg_dump --schema-only` der
   Schemata `goals` und `recovery`).
4. **Einspielen** — nur diese vier Objekte, aus den Kettendateien, nicht
   abgeschrieben. **Kein Seed, keine Datenzeile.**
5. `NOTIFY pgrst, 'reload schema';`
6. **Nachweis live:** je Objekt `pg_proc`/`pg_indexes`/`pg_trigger` 1×, und
   `goals.berechne_zielwerte` weiter in BEIDEN Signaturen (G-595).
7. **Sicherung nachher** nach `backup/g602-nachher.sql`.

**Am Bildschirm belegt Claude Code** (G-591), nicht du. Melde, wenn live
steht — ich gebe ihm dann Bescheid.
