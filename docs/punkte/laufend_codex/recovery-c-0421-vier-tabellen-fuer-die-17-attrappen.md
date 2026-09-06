---
nr: C-421
typ: feature
modul: recovery
schwere: hoch
angelegt: 2026-09-07
braucht: []
kind_von: G-365
entscheidung: null
agent: codex
beauftragt: 2026-09-07
beruehrt:
  tabellen: [recovery.checkins]
zahlen:
  gemessen: 2026-09-07
  attrappen: 17
  vorhandene_tabellen: 3
---

# C-421 — vier Tabellen fuer die 17 Attrappen

## Befund

Aus G-365, Claude Code, 2026-09-07.

`[cmd]` **`recovery` traegt drei Tabellen:** `checkins`,
`modality_log`, `scores`.

`[cmd]` **17 Kacheln sind ehrlich als Attrappe markiert** — **kein
Leseweg, weil kein Schema.**

**Was fehlt:**

    Overtraining-Signale     acht Signale, vier Schwellen
    Protokolltabelle         Erholungsprotokolle
    Stresstabelle
    Score-Beitraege je Modul

`[cmd]` **Und `module-recovery-engine.jsx` traegt die Rechenwerke
schon** — `MODALITY_BONUS` (elf Modalitaeten),
`OVERTRAINING_SIGNALS` (vier Schwellen), `ACWR_DATA`,
`HRV_BASELINE` (`00-QUELLEN.md`).

`[read]` **Die Fachlogik ist entworfen, das Schema fehlt.**

## Zu lesen

`[cmd]` **`docs/specs/Recovery/`, 11 Dateien, 3.654 Zeilen** —
**`SPEC_06_DATABASE_SCHEMA.md` sagt vermutlich, was zu bauen ist.**

`[cmd]` **Und `00-QUELLEN.md` nennt fuenf Recovery-Mockups.**

## Auftrag — vier Tabellen fuer Recovery

**Mitbeauftragt: G-367.** Bericht in diese Datei.

**Beauftragt am 2026-09-07.**

### Lies zuerst

`[cmd]` **`docs/spezifikation/00-QUELLEN.md`, Abschnitt Recovery.**
`[cmd]` **Dann `docs/specs/Recovery/`, 11 Dateien** —
**`SPEC_06_DATABASE_SCHEMA.md` sagt, was zu bauen ist.**

`[read]` **Der Orchestrator hat heute zweimal behauptet, eine Spec
existiere nicht, ohne das Verzeichnis zu oeffnen.**

### 1 · C-421 — was 17 Attrappen blockiert

`[cmd]` **`recovery` traegt drei Tabellen:** `checkins`,
`modality_log`, `scores`.

`[cmd]` **17 Kacheln sind ehrlich markiert** — **kein Leseweg, weil
kein Schema.**

**Was fehlt:**

    Overtraining-Signale     acht Signale, vier Schwellen
    Protokolltabelle         Erholungsprotokolle
    Stresstabelle
    Score-Beitraege je Modul

`[cmd]` **Und `module-recovery-engine.jsx` traegt die Rechenwerke
schon:** `MODALITY_BONUS` (elf Modalitaeten),
`OVERTRAINING_SIGNALS` (vier Schwellen), `ACWR_DATA`,
`HRV_BASELINE`.

`[read]` **Die Fachlogik ist entworfen, das Schema fehlt.**

### 2 · G-367 — Stunden und Saetze je Muskel

`[cmd]` **Die Muskelkacheln lesen echt** (G-364) — **aber `HOURS`
und `SETS` je Muskel kommen aus dem Entwurf.**

`[cmd]` **`training.workout_sessions` und
`training.exercise_muscles` (6.588 Zeilen) tragen die Daten.**

`[read]` **Eine Sicht ueber die Modulgrenze** — `[cmd]`
**`public.activity_stream` ist der Praezedenzfall** (C-414):
**sechs Module in `public`, nicht im Fachschema.**

### E-72 gilt

Tom, 2026-09-07: *,,wenn wir was anbinden sollen auch daten dafuer
da sein."*

`[read]` **Eine Tabelle ohne Zeilen laesst die Kachel leer** —
**und leer sieht aus wie ein Ergebnis.**

`[cmd]` **Der Seed gehoert dazu** — `[cmd]` **C-413 hat ihn so
umgestellt, dass er bis zum Lauftag reicht.**

### Abnahmebedingungen

**Miss jede einzeln, schreib die Zahl in den Bericht.**

    A1  jede neue Tabelle: Zeilen auf test-user > 0
        Zahl je Tabelle.

    A2  RLS je Tabelle in beide Richtungen belegt
        eigener Nutzer sieht, fremder nicht.

    A3  Vollkette laeuft durch, auf Wegwerf-Datenbank
        Schrittzahl und Sekunden nennen.

    A4  je Kachel aus den 17: welche kann jetzt lesen
        Zahl: 17 / davon anbindbar / davon weiter blockiert.

    A5  G-367: HOURS und SETS je Muskel aus echten Daten
        eine Zahl je Muskelgruppe, gegen den Entwurf verglichen.

### Was nicht zu tun ist

**Keine Oberflaeche** — das ist ein UI-Auftrag.
**Nie gegen die laufende Datenbank testen.**
`apps/` nicht anfassen — **Claude Code arbeitet dort an G-365.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `neustart`, kein `start`, kein `aufraeumen`.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
