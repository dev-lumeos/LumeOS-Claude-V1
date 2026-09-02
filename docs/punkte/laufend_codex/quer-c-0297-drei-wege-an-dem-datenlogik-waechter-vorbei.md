---
nr: C-297
typ: messung
modul: quer
schwere: mittel
angelegt: 2026-08-27
braucht: []
kind_von: C-291
kinder: []
entscheidung: null
agent: codex
beauftragt: 2026-09-02
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# C-297 - drei Wege, an dem Datenlogik-Waechter vorbei

## Befund

(neu
  2026-08-27). Aus der Pruefung von C-291.

  `[cmd]` **Dreizehn echte Probemigrationen gelegt und wieder
  entfernt. Zehn urteilen richtig, drei nicht:**

      DO $outer$ EXECUTE $q$INSERT ...$q$ $outer$   gruen  FALSCH
      CREATE TABLE x AS SELECT * FROM y             gruen  FALSCH
      SELECT * INTO x FROM y                        gruen  FALSCH

  `[read]` **Der geschachtelte Dollar-Block** entsteht, weil
  `ohneKommentareUndStrings()` den inneren `$q$`-Block entfernt, bevor
  der aeussere geprueft wird. **`CREATE TABLE AS` und `SELECT INTO`
  schreiben Daten, ohne einen der sechs Befehle zu nennen.**

  `[read]` **Alle drei sind exotischer als die vier aus C-291** — ein
  Backfill ueber `EXECUTE` ist unwahrscheinlich, `CTAS` in einer
  Migration nicht. **Aber die Aufzaehlung ist jetzt eine
  Aufzaehlung**, und wer eine Aufzaehlung umgeht, tut es an ihrem
  Rand.

## Auftrag — der Datenlogik-Waechter, und was E-45 verlangt

**Mitbeauftragt: C-298, C-382.** Bericht in diese Datei.

**Beauftragt am 2026-09-02.**

### Warum jetzt

`[cmd]` **Der Waechter war heute rot** — **drei Migrationen aus
C-385/C-393 trugen `DELETE` und `INSERT`** (C-395).

`[read]` **Er hat funktioniert.** `[read]` **Aber C-297 sagt, es gibt
drei Wege daran vorbei, und C-298 sagt, er meldet zwei harmlose
Muster rot.**

`[read]` **Beides schwaecht ihn:** **wer Umgehungen kennt, nutzt sie;
wer Fehlalarme kennt, sieht weg.**

### 1 · C-297 — drei Wege vorbei

`[read]` **Lies den Punkt und miss, ob die drei noch bestehen.**

`[read]` **Und pruefe in beide Richtungen:** **baue je einen Fall ein
und zeige, dass der Waechter ihn nicht faengt.**

### 2 · C-298 — zwei harmlose Muster

`[cmd]` **Wenn er bei Harmlosem rot wird, gewoehnt man sich an
Rot.**

`[read]` **Miss, welche zwei es sind, und ob sie sich unterscheiden
lassen** — **oder ob eine Ausnahmeliste noetig ist.**

`[cmd]` **Eine benannte Ausnahme gibt es schon:**
`20260805120000_baseline_structure.sql`.

### 3 · C-382 — E-45 ist entschieden, das Schema fehlt

`[cmd]` **E-45, Tom, 2026-09-02:**

    coach_created   editierbar, aber der Coach wird benachrichtigt
    buddy           editierbar, von Hand oder per Anweisung
    marketplace     editierbar, aber nie weiterverkaeuflich --
                    Original wie Kopie

`[read]` **Der dritte Punkt braucht mehr als `darf_weiterverkaufen`:**
`[cmd]` **ein `boolean` ueberlebt keinen neuen Plan, in den jemand
den Inhalt kopiert.**

`[read]` **E-45 schlaegt `stammt_aus_kauf uuid` vor** — **eine
Kennung, die mitwandert und nie geloescht wird.**

`[read]` **Und der Coachfall braucht einen Meldeweg.** `[cmd]`
**`coach.action_log` steht seit C-381, mit `SECURITY DEFINER`.**
`[read]` **Zu klaeren ist die Koernung: je Position oder je Plan und
Tag?** **Vorschlagen, nicht entscheiden.**

### Was nicht zu tun ist

**Keine Datenlogik in `migrations/`** — der Befund von heute.
**Keinen Marktplatz bauen** — E-37.
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `neustart`, kein `start`, kein `aufraeumen`.**

### Nachweis

    drei Wege      bestehen sie, je einer eingebaut und gezeigt
    zwei Muster    welche, unterscheidbar oder Ausnahme
    stammt_aus_kauf   wandert mit der Kopie, belegt
    Meldeweg       Koernung vorgeschlagen, nicht entschieden

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
