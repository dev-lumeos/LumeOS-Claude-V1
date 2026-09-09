# Tote Migrationen

**Verschoben am 2026-09-08, C-448.** Tom: *,,ja weg mit den toten
migrationen in das backupverzeichnis."*

`[cmd]` **Alle acht sind in C-447 einzeln geprueft** ? **keine ist
registriert, keine steht in der Kette, alle sind von der Pipeline
abgedeckt:**

    search_events   bereits in Pipeline 057
    C-283           Katalogfelder in Pipeline 283
    C-286           bytegleich zur Pipeline
    C-293           bytegleich
    G-107           bytegleich
    C-371           Pipeline-Superset
    C-362           Pipeline-Superset
    C-381           Pipeline 381 traegt die Revokes UND die
                    sicheren RPCs

`[read]` **`C-381` war die einzige, die nach einer Sicherung
klang.** `[cmd]` **Geprueft: keine Update-Policy, keine
`authenticated`-Schreibrechte auf `action_log`** ? **die Pipeline
ist strenger.**

## Warum hier und nicht geloescht

`[read]` **Wer in einem Jahr nachliest, soll sehen, dass die Frage
gestellt wurde** ? **nicht nur, dass eine Datei fehlt.**

`[cmd]` **In `backup/` loescht niemand ausser Tom** ? **die Regel
steht in `CLAUDE.md`.**

## Was daraus folgt

`[cmd]` **`KNOWN_NON_CHAIN_MIGRATIONS` in
`tools/migration-kette-pruefen.mjs` faellt von 8 auf 0** ? **eine
Liste, die es nicht gibt, kann nicht veralten.**
