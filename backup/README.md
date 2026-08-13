# backup/

Sicherungen vor strukturellen Änderungen an der Datenbank.

## Regel

**Schemasicherungen sind `--schema-only`** und gehören nach
`backup/schema/`. `[cmd]` Die 18 Dateien dort sind 0,02 bis 0,6 MB.

```
docker exec <container> pg_dump -U postgres -d postgres \
  -n nutrition --schema-only --no-owner > backup/schema/JJJJ-MM-TT_....sql
```

**Datensicherungen** — wenn wirklich der Inhalt gebraucht wird — nehmen das
komprimierte Format nach `backup/data/`:

```
docker exec <container> pg_dump -U postgres -d postgres -Fc -n nutrition \
  > backup/data/JJJJ-MM-TT_....dump
```

`[cmd]` Dort liegen drei Abzüge à 5,5 MB. Dasselbe als Text wären über
50 MB — das Format war da, es wurde nur nicht benutzt.

## Warum es diese Regel gibt

`[cmd]` Am 2026-08-14 warnte GitHub beim Push über zwei Dateien:

| | |
|---|---|
| `live-nutrition-2026-08-14/nutrition-vor-023-072-073.sql` | 52,6 MB |
| `live-nutrition-2026-08-13/nutrition-vor-022-071.sql` | 51,8 MB |

Beide waren vollständige Datenabzüge mit `COPY`-Blöcken über alle
Tabellen — 749.572 Zeilen —, obwohl eine Schemasicherung gemeint war.
GitHub empfiehlt höchstens 50 MB und sperrt bei 100.

**Dreimal passiert:** Block 28, Block 29, und ein dritter Fall am
2026-08-14, der vor dem Commit auffiel (96 MB statt 0,2 MB). Kein
Einzelfall, sondern ein Muster — deshalb die Regel und die Gate-Prüfung.

## Was mit den beiden Dateien geschah

Aus dem Arbeitsbaum entfernt, **in der Historie belassen**. Ein
`git filter-repo` hätte sie getilgt, aber alle Commit-Hashes geändert —
und die Übergabedokumente unter `docs/sessions/` sowie `docs/todo/TODO.md`
verweisen auf Hashes als Anker. Die wären danach ins Leere gelaufen.

Erreichbar bleiben sie über:
```
git show <commit>:backup/live-nutrition-2026-08-13/nutrition-vor-022-071.sql
```

## Was hier sonst liegt

| Ordner | |
|---|---|
| `schema/` | Schemasicherungen, klein, getrackt |
| `data/` | komprimierte Datenabzüge (`-Fc`) |
| `live-*/` | Sicherungen je Kettenschritt, schema-only |
| `legacy-v2/` | Export der Vorgängerinstanz, plus das Bundle mit deren Historie |

`[cmd]` `legacy-v2/lumeos-2026-komplett.bundle` (48 MB) ist von git
ausgenommen — 56 Refs mit 27 Branches und 22 Stashes des Vorgängerrepos,
die es nirgends sonst gibt. Siehe `referenz/README.md`.
