---
nr: G-173
typ: befund
modul: training
schwere: mittel
angelegt: 2026-08-23
braucht: []
kind_von: G-160
kinder: []
entscheidung: null
agent: claudecode
beauftragt: 2026-08-30
erledigt: 2026-08-30
commit: OFFEN
beruehrt:
  dateien:
    - apps/web/src/lib/recovery/scores-read.ts
zahlen: null
---

# G-173 - Ein falscher Punktverweis in `scores-read.ts`

## Befund

(neu
  2026-08-23). Aus G-160. Eine Zeile.

  `[cmd]` `scores-read.ts:42` sagt *„C-195 hat die Spalte entfernt"* —
  **es war C-215.** C-195 war der Substanzkatalog.

  `[read]` Kleinigkeit, aber ein falscher Verweis fuehrt beim naechsten
  Suchen in die Irre — dasselbe Muster wie `training.sessions` gegen
  `workout_sessions`.

## Auftrag

**Mitbeauftragt mit A-29 am 2026-08-30.** Der Auftragstext
und der Bericht stehen dort.

## Bericht

**Claude Code, 2026-08-30.** Mitbeauftragt mit A-29. **Der
vollstaendige Bericht steht in [A-29](quer-a-0029-der-attrappen-test-koennte-die-gerenderte-seite-zaehlen.md#bericht).**

### Der Verweis war noch falsch

`[cmd]` **`scores-read.ts:42` sagte weiterhin *„C-195 hat die Spalte
entfernt"*.** Die Datei ist seit C-143 mehrfach angefasst worden, die
Zeile blieb.

`[cmd]` **Beleg fuer C-215:**
`supabase/_pipeline/12_recovery/121_recovery_scores_modalities.sql:142-144`
— **dasselbe `ALTER TABLE`** setzt `algorithm_version` auf
`manual_v2_c215` **und** wirft `acwr_used` weg. C-195 ist der
Substanzkatalog; C-215 heisst *„ACWR rechnet in der Datenbank
weiter"*.

**Berichtigt, mit dem alten Wortlaut als Zitat.**

`[cmd]` **Und die Sabotageprobe hat gezeigt, was sonst durchgegangen
waere:** die Berichtigung **ueberlebte** eine Ruecksetzung auf C-195
— **ein Kommentar hat keinen Waechter und kippt still zurueck.**
Deshalb steht die Zeile jetzt in
`apps/web/src/lib/__tests__/attrappen-zaehlweise.test.ts`; im zweiten
Lauf faellt die Sabotage.

## Abnahme

**2026-08-30, mit A-29 abgenommen:** berichtigt auf C-215 und gesichert; die Sabotageprobe zeigte,
dass ein Kommentar ohne Waechter still zurueckkippt.
