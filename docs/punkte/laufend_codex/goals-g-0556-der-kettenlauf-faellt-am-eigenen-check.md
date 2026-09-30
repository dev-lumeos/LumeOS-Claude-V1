---
nr: G-556
typ: fehler
modul: goals
schwere: hoch
angelegt: 2026-09-30
agent: codex
beauftragt: 2026-09-30

braucht: []
kind_von: G-538

quellen:
  - docs/punkte/00-INDEX.md

beruehrt:
  tabellen:
    - goals.goal_phases
    - goals.user_goals
  dateien:
    - supabase/_pipeline/11_goals/538_goal_phase_targeting_data.sql
    - backup/_manifests/kettenlauf-status.json

zahlen:
  gemessen: 2026-09-30
  exit_code: 1
  dauer_sekunden: 1125
  dauer_letzter_gruener_lauf: 1271
  phasen_in_der_wegwerf_db: 0
---

# Der Kettenlauf faellt, und er blockiert jeden Commit im Repo

`[cmd]` **`backup/_manifests/kettenlauf-status.json`:**

    status        failed
    database      lumeos_tageskette_20260929
    started_at    2026-09-29T21:00:02Z
    finished_at   2026-09-29T21:18:47Z
    duration      1125,4 s
    exit_code     1

`[read]` **Der Waechter `kettenlauf` macht `punkte-pruefen` rot, und damit das
ganze Gate.** Solange das so ist, kann niemand committen — nicht in `docs/`,
nicht in `apps/`, nicht in `supabase/`. **Das ist der dringendste Punkt im
Repo.**

## Wo er abbrach — gemessen, nicht vermutet

`[cmd]` **Die Wegwerf-Datenbank steht noch**, und ihr Inhalt sagt, wie weit
der Lauf kam:

    Objekt                              wegwerf    live
    goals.goal_strategies (Zeilen)          17       17
    goals.user_goals (Zeilen)                0       11
    goals.goal_phases (Zeilen)               0        5
    goals-Tabellen                          12       12
    goal_phases.strategie_code              da       da
    user_goals.linked_modules               da       da

`[read]` **Struktur und Katalog sind vollstaendig, die Testdaten fehlen
ganz.** Der Lauf ist also durch G-533, G-536 und G-538 hindurchgekommen —
inklusive aller neuen Spalten — und **am Einspielen der Goals-Testdaten
gescheitert.**

`[cmd]` Dazu passt die Dauer: der letzte gruene Lauf brauchte 1.271 s, dieser
brach nach 1.125 s ab — **bei 88 Prozent, nicht am Anfang.**

## Der Verdacht, und er ist pruefbar

`[annahme]` **Der CHECK aus G-538 greift gegen den eigenen Seed.**

G-538 hat eingefuehrt:

    CHECK (actual_end_date IS NOT NULL OR goal_id IS NULL... )
    -> eine LAUFENDE Phase braucht ein Ziel

`[cmd]` **Und live traegt genau eine Zeile `goal_id IS NULL`:** Max'
`maintenance`-Phase. Sie wurde am 2026-09-29 **beendet** (G-538 A1, auf
Anweisung des Orchestrators) — **live**. `[read]` **Der Kettenschritt, der sie
erzeugt, legt sie weiterhin als offen an.** In der Kette gibt es kein
Beenden; dort wird neu gebaut.

**Damit faellt der Seed an dem CHECK, den derselbe Auftrag eingefuehrt hat.**

`[read]` **Das ist die Fehlerklasse „live repariert, Quelle nicht".** Der
Bestandsnachzug (`538_goal_phase_targeting_data.sql`) hat die vorhandene
Zeile korrigiert; der Schritt, der die Zeile ueberhaupt anlegt, kennt die
neue Regel nicht.

**Zu pruefen, nicht zu glauben:** der Verdacht erklaert die Zahlen, aber
belegt ist nur, dass die Testdaten fehlen. Der Lauf hat ein Log; dort steht
die Zeile.

## Auftrag

**A1 — den Abbruch belegen.** Das Log des Laufs, oder den Schritt einzeln
gegen eine frische Wegwerf-DB. **Die Zeilennummer und die Fehlermeldung
woertlich in den Bericht** — nicht die Vermutung oben.

**A2 — die Quelle korrigieren, nicht den Bestand.** Wenn es Max' Phase ist:
der Seed legt sie entweder **mit** `goal_id` an oder **beendet** an. `[read]`
**Und die Entscheidung ist schon getroffen** (G-538 A1): die Phase gehoert
nicht an sein Performance-Ziel, sie wird beendet. **Der Seed muss dasselbe
tun, was der Bestandsnachzug getan hat** — sonst laufen Kette und
Live-Datenbank auseinander.

**A3 — die Gegenprobe, die es vorher nicht gab.** Ein Kettenschritt, der
gegen einen CHECK eines spaeteren Schritts faellt, ist nur im vollen Lauf
sichtbar. `[read]` **Wer eine Regel einfuehrt, prueft sie gegen den Seed** —
nicht nur gegen den Bestand. Im Bericht: welche weiteren CHECKs aus G-533,
G-536 und G-538 gegen Testdaten laufen koennten, und ob sie es tun.

**A4 — die Wegwerf-DB `lumeos_tageskette_20260929` verwerfen**, nachdem das
Log gelesen ist. `[cmd]` 116 Wegwerf-Datenbanken stehen noch (A-80).

## Zu belegen

- der Abbruch woertlich: Schritt, Zeile, Fehlermeldung
- ein voller Kettenlauf **gruen**, mit Dauer und Zeilenzahlen fuer
  `user_goals`, `goal_phases`, `goal_strategies` — sie muessen zur
  Live-Datenbank passen (11 / 5 / 17)
- `backup/_manifests/kettenlauf-status.json` auf `ok`
- die Gegenprobe aus A3
- kein `db push`, nichts committen

`[read]` **Reihenfolge: VOR G-543.** Dieser Punkt blockiert jeden Commit im
ganzen Repo — auch die Abnahmen, die auf ihn warten.
