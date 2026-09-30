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

erledigt: 2026-09-30
commit: 89e71386
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

## Abnahme 2026-09-30 — `89e71386`

`[cmd]` **Der Kettenlauf ist gruen.** `backup/_manifests/kettenlauf-status.json`
selbst gelesen: `"status": "passed"`, `"exit_code": 0`, 1401 s,
Datenbank `lumeos_tageskette_20260930_g556`. Damit ist `punkte-pruefen`
wieder gruen und das Repo committierbar — drei Commits sind seither
durchgelaufen.

`[cmd]` **Die Regel wurde nicht geschwaecht, um gruen zu werden.** Das
war die Frage, mit der ich die Datei gelesen habe. `538_goal_phase_targeting_data.sql`
macht nur die Bestandspruefung bedingt (`IF EXISTS ... AND NOT EXISTS`),
waehrend die zweite Pruefung — *keine offene Phase ohne Ziel* —
unbedingt bleibt und im leeren Neuaufbau genauso greift. Die
Invariante ist ungebrochen; nur die Erwartung an eine einzelne
Bestandszeile ist an den Neuaufbau angepasst.

`[cmd]` **Live nachgezaehlt**, nicht dem Bericht abgelesen:
5 Phasen, 4 davon mit `goal_id`, genau **eine** offene, alle **5** mit
`strategie_code`. Die eine ohne Ziel ist Max' beendete Seedphase — vom
CHECK erlaubt, weil beendet. Ziele je Konto: dev 5, tom.seed 5,
max.seed 1 = 11.

## Was diese Abnahme mitnimmt

`[cmd]` **Die Ursache lag bei mir**, nicht bei Codex: mein Auftrag
G-538/A1 verlangte den Nachzug des Bestands und nicht den Schritt, der
die Zeile *erzeugt*. Fehlerklasse **,,live repariert, Quelle nicht"** —
sie ist in `docs/ssot/00-LEHREN.md` einzutragen, falls sie dort noch
fehlt.

`[cmd]` **A3 ist beantwortet, aber die Antwort taugt weniger als sie
klingt:** die genannten Gegenproben liegen in
`supabase/_pipeline/_validierung/` — und **dieses Verzeichnis laeuft in
keinem Gate.** Gemessen: keine `package.json` im Repo nennt
`_validierung` oder `LUMEOS_G536_DATABASE`; die Kette ruft genau ein
Skript daraus auf (`kette-ausfuehren.ts:30`,
`schema-vollstaendigkeit-pruefen.ts`). `goals-g536-goal-strategies.test.ts:7`
wirft ohne Umgebungsvariable, kann also gar nicht im Gate liegen.
**Das ist die Ursache dafuer, dass zwei G-536-Rechnungstests die
Semantik vor G-543 erwarten und trotzdem nichts rot wurde.** Derselbe
Befund wie A-77, nur am zweiten Ort — dort nachgetragen, kein neuer
Punkt.

`[offen]` Der veraltete kontenuebergreifende Kopierlauf
(`eigenes-konto-fuellen.sql`, Medical/Nutrition) bleibt als Befund
stehen und wird ein eigener Punkt, sobald jemand ihn braucht.
