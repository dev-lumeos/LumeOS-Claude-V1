---
nr: C-471
typ: fehler
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-468
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  tabellen: [public.koerperflaechen]
zahlen:
  gemessen: 2026-09-08
---

# C-471 — die Struktur gehoert nach migrations/

## Die Regel steht schon

`[cmd]` **`supabase/README.md`, D-17, Weg B, seit 2026-08-05:**

    migrations/   Deploybare Struktur. Schemas, Tabellen,
                  Constraints, Indizes, Funktionen, Trigger,
                  Policies, Grants. KEINE Daten.

    _pipeline/    Lokale Aufbaukette und lokale Wahrheit.
                  Katalog-Seeds, CSV-Import, Ableitungen.
                  Wird NICHT deployt.

`[cmd]` **Und die harte Grenze:**

> *,,Eine Migration darf Tabellen, Spalten, Constraints, Indizes,
> Funktionen, Trigger, RLS, Policies und Grants definieren. Sie
> darf KEINE Katalogdaten schreiben."*

## Was falsch liegt

`[cmd]` **C-468 hat `public.koerperflaechen` in
`_pipeline/00_querschnitt/` angelegt** ? **Struktur UND Daten.**

`[read]` **Die Tabelle mit RLS und Grants gehoert nach
`migrations/`.**

`[read]` **Die 59 Zeilen sind Stammdaten** ? **sie bleiben im
Kettenschritt.**

`[cmd]` **Claude Code hat den Hook NICHT umgangen und gefragt** ?
**richtig.**

`[read]` **Die Antwort haette der Orchestrator geben muessen,
nicht Tom.**

## Was zu tun ist

**1** ? **Die Struktur nach `migrations/`.**

    CREATE TABLE public.koerperflaechen
    die CHECKs auf ebene, art, seite
    der Fremdschluessel auf sich selbst (parent_id)
    der Fremdschluessel auf training.muscle_groups
    die Indizes
    ALTER TABLE ... ENABLE ROW LEVEL SECURITY
    die Policy
    REVOKE ALL ... dann GRANT SELECT

`[cmd]` **Das `REVOKE ALL` MUSS mit** ? **C-470: `pg_default_acl`
vergibt in `public` sonst alles.**

**2** ? **Die 59 Zeilen bleiben in `_pipeline/`.**

`[read]` **Der Kettenschritt schreibt sie, die Migration legt die
Tabelle an.**

**3** ? **Der Hook.**

`[cmd]` **`supabase/migrations/` ist schreibgeschuetzt.**

`[read]` **Miss, wie andere Migrationen dort hingekommen sind** ?
**es muss einen Weg geben, sonst waere seit dem 05.08. keine
entstanden.**

`[cmd]` **`node tools/migration-datenlogik-pruefen.mjs` prueft die
Grenze** ? **er muss gruen bleiben.**

## Abnahmebedingungen

    A1  die Struktur in migrations/, die Daten in _pipeline/.
        Beide Dateien benannt.
    A2  REVOKE ALL ist dabei. Gemessen: authenticated hat
        nach einem Frischaufbau nur SELECT.
    A3  migration-datenlogik-pruefen.mjs gruen.
    A4  die 59 Zeilen stehen nach dem Kettenlauf.
    A5  wie der Hook umgangen wird: benannt, nicht
        heimlich.
    A6  Vollkette, Punktelauf.

## Was nicht zu tun ist

**Keine Daten in die Migration** ? **kein `INSERT`, kein `COPY`.**
**Den Hook nicht aushebeln** ? **wenn es keinen Weg gibt, melden.**
Nicht committen, nicht stagen, nicht pushen.

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
