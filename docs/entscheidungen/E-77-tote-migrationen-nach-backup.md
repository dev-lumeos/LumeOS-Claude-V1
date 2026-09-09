---
nr: E-77
getroffen: 2026-09-08
von: Tom
status: gueltig
loest_ab: null
abgeloest_durch: null
betrifft: [C-448, C-447, C-446]
modul: quer
---

# E-77 — tote Migrationen nach `backup/`

## Entscheidung

Tom, 2026-09-08:

> ja weg mit den toten migrationen in das backupverzeichnis, ich
> move heute abend

## Was gilt

`[cmd]` **Acht Dateien liegen in
`backup/tote-migrationen/`** ? **per `git mv`, die Geschichte
bleibt.**

`[read]` **Nicht geloescht** ? **wer in einem Jahr nachliest, soll
sehen, dass die Frage gestellt wurde.**

`[cmd]` **Und in `backup/` loescht niemand ausser Tom** ? **die
Regel steht in `CLAUDE.md`.**

## Was daraus folgt

`[cmd]` **`KNOWN_NON_CHAIN_MIGRATIONS` faellt von 8 auf 0.**

`[read]` **Der Waechter braucht keine Ausnahme mehr** ? **jede
Migrationsdatei ohne Kettenschritt macht das Gate rot.**

`[read]` **Das war das Ziel von C-446** ? **erreicht, nicht
verwaltet.**

## Warum es zaehlte

`[cmd]` **C-447 hat je Datei einzeln geprueft:** **search_events in
Pipeline 057, C-283 in 283, drei bytegleich, zwei als Superset,
und C-381 strenger in der Pipeline als in der Migration.**

`[read]` **Keine war vergessen** ? **sonst waere sie in die Kette
gegangen, nicht ins Backup.**
