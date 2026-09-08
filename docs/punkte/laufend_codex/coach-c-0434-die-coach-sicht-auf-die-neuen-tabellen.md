---
nr: C-434
typ: feature
modul: coach
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: C-136
entscheidung: E-74
agent: codex
beauftragt: 2026-09-08
beruehrt:
  tabellen: [coach.client_permissions]
zahlen:
  gemessen: 2026-09-08
  freigaben: 4
  auf_none: 4
---

# C-434 — die Coach-Sicht auf die neuen Tabellen

## Befund

Aus C-136, Codex, 2026-09-08.

`[cmd]` **`coach.client_permissions` traegt `medical_visibility`
mit `none | summary | full`, DEFAULT `none`, Ablaufzeit und
Aenderungsprotokoll.**

`[cmd]` **Live: 4 von 4 aktiven Freigaben auf `none`, null
`summary`, null `full`.**

`[cmd]` **Und `appointments` sowie `health_events` haben KEINE
Coach-Policy** ? **ein Coach sieht sie auch mit `full` nicht.**

`[cmd]` **`health_timeline` ist `security_invoker`:** **bei `full`
zeigt sie Laborbefunde, Ereignisse bleiben unsichtbar.**

## Auftrag

**Beauftragt am 2026-09-08.**

### 1 · Die zwei fehlenden Policies

`[cmd]` **Dein Vorschlag 1:** **Full-SELECT ueber
`coach.hat_sicht(..., 'medical', 'full')` fuer `appointments` und
`health_events`.**

`[read]` **Die Zeitachse folgt dann ihrer Quelltabelle** ? **ohne
eigene Policy.**

`[read]` **Bau sie.**

### 2 · Die Herkunft nachziehen

`[cmd]` **Dein Vorschlag 2:** **`health_events` und die Zeitachse
tragen `source_kind`, `source_actor`, `source_recorded_at`,
`source_lab_report_id`.**

`[cmd]` **`user_medications` und `user_conditions` haben nur
`measurement_source` und `source_detail`.** `[cmd]`
**`appointments` weitgehend nichts.**

`[read]` **E-74 verlangt die Herkunft ueberall** ? **sonst wird aus
einem Zitat eine Behauptung.**

`[read]` **Zieh die vier Felder nach** ? **und miss, ob die
bestehenden Zeilen sie fuellen koennen oder leer bleiben muessen.**

### 3 · Die Originale bleiben privat

`[cmd]` **Dein Vorschlag 3, und er ist der wichtigste:**

> *,,Originaldateien nicht implizit mit `medical_visibility='full'`
> teilen."*

`[read]` **Wer eine Zusammenfassung freigibt, hat nicht den Scan
freigegeben.**

**Entschieden am 2026-09-08, E-76:** Tom: *,,die werte reichen
einem coach, dann muss er nichts suchen."*

`[cmd]` **Keine `medical_originals_visibility`.** `[cmd]`
**`medical-originals` bleibt Owner-only, dauerhaft.**

`[read]` **Nichts bauen** ? **A5 bleibt trotzdem als Nachweis:
ein Coach mit `full` kommt nicht an die Bytes.**

### Abnahmebedingungen

    A1  appointments und health_events: ein Coach mit full sieht
        sie, einer mit summary nicht. Zahl je Fall.
    A2  health_timeline folgt automatisch. Belegt.
    A3  die vier Herkunftsfelder in user_medications,
        user_conditions, appointments. Zahl: Spalten vorher/nachher.
    A4  bestehende Zeilen: gefuellt oder leer? Zahl je Tabelle.
    A5  medical-originals: ein Coach mit full kommt NICHT an die
        Bytes. Belegt.
    A6  Vollkette laeuft durch. Schritte und Sekunden.

### Was nicht zu tun ist

**Keine Freigabe fuer Originale** ? **das ist Toms Entscheidung.**
**Nie gegen die laufende Datenbank testen.**
`apps/` nicht anfassen ? **Claude Code arbeitet an G-378.**
**Den Dev-Server nicht anfassen** ? **Tom haelt ihn selbst.**
Nicht committen, nicht stagen, nicht pushen.

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_

## Sitzung abgebrochen, 2026-09-08

`[cmd]` **Codex arbeitete 52 Minuten und brach ohne Bericht ab.**

`[cmd]` **Der Fehler in der Ausgabe:** `psql : Die Benennung
"psql" wurde nicht als Name eines Cmdlet ... erkannt.`

`[read]` **`psql` liegt nicht im Pfad** ? **der Weg ist
`from lauf import psql`, das ruft
`docker exec supabase_db_LumeOS-Claude-V1 psql`.**

`[cmd]` **Und er hat `$env:PGDATABASE` gesetzt** ? **das wirkt auf
ein `psql`, das es nicht gibt.**

## Was im Baum liegt

    supabase/migrations/20260908140000_c434_coach_medical_provenan...
    supabase/_pipeline/kette.json
    supabase/_pipeline/daten/schema-sollstand.json
    supabase/_pipeline/_testdaten/  (zwei Dateien)
    supabase/_pipeline/_validierung/medical-c429-...test.ts
    supabase/_pipeline/_validierung/coach-c434-...test.ts

`[cmd]` **Fuenf Wegwerf-Datenbanken stehen noch:**
`lumeos_c434_red`, `_legacy`, `_final`, `_final2`, `_final3`.

`[read]` **Nicht abgenommen, nicht committet** ? **der naechste
Lauf setzt hier an.**
