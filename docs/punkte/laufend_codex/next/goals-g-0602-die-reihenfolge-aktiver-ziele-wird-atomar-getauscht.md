---
nr: G-602
typ: fehler
modul: goals
schwere: mittel
angelegt: 2026-10-04

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

    AUFTRAG FUER Codex - G-602: goals.ziel_reihenfolge_setzen, atomar
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

**Als Kettenschritt, mit Probe.** Nie gegen Live. Kein Commit.
