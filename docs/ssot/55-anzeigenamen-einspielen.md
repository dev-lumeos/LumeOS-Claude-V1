# Anzeigenamen einspielen

`[cmd]` Eingabedatei vor dem Einbau geprüft:
`supabase/_pipeline/daten/anzeigenamen.jsonl` enthält 5.775 Zeilen,
33 davon mit `sicher: false`, 576 mit nicht-leeren `nebennamen`.

---

## Ziel

Die kuratierten Anzeigenamen aus der versionierten JSONL-Datei sollen den
Kettenlauf überleben. `name_de` und `name_en` bleiben der amtliche BLS-Wortlaut;
die Kuration landet nur in `name_display_de` und `name_display_en`.

---

## Commit 1: Spalte umbenannt

`[cmd]` Commit `6ef3ebe` benennt die deutsche Anzeigename-Spalte in den
lebenden Ketten-, Baseline-, Lese- und App-Dateien von `name_display` nach
`name_display_de` um.

`[cmd]` Nach dem Commit lief `pnpm gate` mit 8 von 8 Tasks erfolgreich.

---

## Commit 2: Anzeigenamen als Kettenschritt

`[read]` `022_alias_ableitung.sql` liest `name_de`, nicht den Anzeigenamen.
Die Reihenfolge des Anzeigenamen-Schritts gegen `022` ist deshalb fachlich
unkritisch. In der README steht er nach `024`, weil er keine Grundlage für
Aliasableitung oder Suchsynonyme ist.

**Entscheidung:** Der Schritt ist TypeScript unter
`supabase/_pipeline/_ableitung/anzeigenamen-einspielen.ts`, kein SQL.

`[read]` Grund: Die JSONL-Datei liegt im Repo auf dem Host. Ein SQL-Schritt im
DB-Container kann diese Datei nicht robust lesen, ohne sie vorher in den
Container zu kopieren oder den Inhalt in SQL zu duplizieren. Der TS-Schritt
liest die Datei zur Laufzeit, verlangt exakt 5.775 Zeilen und streamt die JSONL
per `docker exec -i ... psql` in eine temporäre Tabelle.

`[read]` Die 33 Zeilen mit `sicher: false` werden wie alle übrigen
eingespielt. Der Schritt zählt sie und gibt die Zahl aus, damit die offene
manuelle Prüfliste sichtbar bleibt.

`[read]` `name_display_th` bleibt unberührt.

---

## Was dieser Schritt nicht tut

- Er macht die Namen noch nicht editierbar. Das bleibt C-29/C-31.
- Er verändert `name_de` und `name_en` nicht.
- Er baut keine Override-Tabelle.
- Er schreibt keine Nebennamen in `food_aliases`; das ist der dritte Commit.
