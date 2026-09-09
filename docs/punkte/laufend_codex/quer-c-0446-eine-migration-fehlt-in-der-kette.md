---
nr: C-446
typ: befund
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-445
entscheidung: null
agent: codex
beauftragt: 2026-09-08
beruehrt:
  tabellen: [medical.injection_sites]
zahlen:
  gemessen: 2026-09-08
  fehlend: 1
---

# C-446 — eine Migration fehlt in der Kette

## Befund

Aus C-445, Codex, 2026-09-08, Nebenbefund:

> *,,Live ist `injection_body_measurement_context` bereits
> qualifiziert. Die Korrekturmigration 20260902070454 fehlt jedoch
> in der Aufbaukette; ein frischer Aufbau enthaelt damit weiterhin
> die mehrdeutige C-385-Fassung."*

`[cmd]` **Nachgemessen:**

    Datei          20260902070454_c385_qualify_body_
                   measurement_context.sql   existiert
    in kette.json  0 Treffer

`[read]` **`dev` und die Kette laufen auseinander** ? **und
niemand merkt es, solange niemand frisch aufbaut.**

## Warum das schwerer wiegt als der Einzelfall

`[read]` **Die Kette ist die Wahrheit ueber den Aufbau** ?
**`supabase/README.md` sagt es.**

`[read]` **Eine Migration, die live ist und nicht in der Kette
steht, macht `dev` zu einem Zustand, den niemand herstellen
kann.**

`[cmd]` **Die Vollkette meldet `SCHEMA VOLLSTAENDIG`** ? **also
prueft der Sollstand diese Mehrdeutigkeit nicht.**

## Auftrag

**Beauftragt am 2026-09-08.**

### 1 · Die eine Migration

`[read]` **Nachtragen, an die richtige Stelle** ? **nach C-385,
vor allem, was darauf aufbaut.**

`[read]` **Und pruefen, ob sie zweimal laeuft** ? **auf `dev` ist
sie schon angewandt.**

### 2 · Wie viele weitere?

`[cmd]` **Das ist die eigentliche Frage.**

`[read]` **Miss ALLE Dateien in `supabase/migrations/` gegen
`kette.json`** ? **welche stehen dort nicht?**

`[read]` **Und je fehlender: ist sie live?**

    in Kette, live         gut
    in Kette, nicht live   noch nicht eingespielt
    nicht in Kette, live   DAS PROBLEM
    nicht in Kette, tot    Altlast, kann weg

`[cmd]` **`supabase_migrations.schema_migrations` sagt, was
angewandt wurde.**

### 3 · Ein Waechter

`[read]` **Wenn es mehr als eine ist, braucht es einen.**

`[cmd]` **Nach dem Muster von `ssot-alter-pruefen.mjs`:** **eine
Datei in `migrations/`, die keinen Kettenschritt hat, ist ein
Befund.**

`[read]` **Miss zuerst, wie viele es sind** ? **wenn der Waechter
vom ersten Tag an rot waere, gehoert er nicht ins Gate**
(G-390, A4).

### Abnahmebedingungen

    A1  die eine Migration in der Kette. Vollkette gruen.
    A2  frischer Aufbau: measurement_context qualifiziert.
        Belegt.
    A3  wie viele Migrationen fehlen? Zahl, je mit Live-Stand.
    A4  ein Waechter, oder der Grund, warum nicht.
    A5  Punktelauf gruen.

### Was nicht zu tun ist

**Keine Migration loeschen** ? **melden, wenn eine tot ist.**
`apps/` nicht anfassen ? **Claude Code arbeitet an G-392.**
**Den Dev-Server nicht anfassen.**
Nicht committen, nicht stagen, nicht pushen.

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
