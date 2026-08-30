# C-291 - Datenlogik-Waechter

Datum: 2026-08-27  
Auftrag: `docs/auftraege/c-291-codex.md`

## Ausgangsvermutungen und Messung

| Pruefung | Ausgangsvermutung | Eigene Messung vor der Aenderung | Ergebnis |
|---|---:|---:|---|
| erkannte echte Datenlogik-Proben | 1 von 5 | 1 von 5 | keine Abweichung |
| `INSERT` | rot | rot, 1 Meldung | richtig |
| `DO $$ BEGIN INSERT ... END $$` | gruen | gruen, 0 Meldungen | falsch |
| `DELETE` | gruen | gruen, 0 Meldungen | falsch |
| `TRUNCATE` | gruen | gruen, 0 Meldungen | falsch |
| `MERGE` | gruen | gruen, 0 Meldungen | falsch |
| `ALTER TABLE` | gruen | gruen, 0 Meldungen | richtig |
| Pruefer in `scripts.gate` | nicht enthalten | nicht enthalten | keine Abweichung |
| andere Pruefungen vor Turbo | 10 | 10 | keine Abweichung |

Die Ursache des Dollar-Block-Fehlers war bestaetigt:
`ohneKommentareUndStrings()` entfernte Dollar-quotierte Bloecke vollstaendig.
Der bisherige Schalter `--negative` pruefte zudem nur eine Zeichenkette, keine
Migrationsdatei.

## Umsetzung

- `tools/migration-datenlogik-pruefen.mjs` erkennt nun `INSERT`, `UPDATE`,
  `COPY`, `DELETE`, `TRUNCATE` und `MERGE` sowohl auf oberster Ebene als auch
  in Dollar-quotierten Bloecken.
- Kommentare und Zeichenketten in Dollar-Bloecken werden weiterhin ignoriert.
- Die Ausnahme ist eng und benannt: ausschliesslich
  `public.handle_new_user()` in
  `20260805120000_baseline_structure.sql` darf genau
  `INSERT INTO public.profiles (id)` enthalten. Sie erzeugt das Profil des
  neu angelegten Auth-Benutzers; sie ist kein Katalog-Backfill. Jede Abweichung
  in Datei, Funktion, Befehl oder SQL-Inhalt wird gemeldet.
- `--self-test` ersetzt `--negative`. Er schreibt je eine temporaere
  Migrationsdatei, misst deren Befund und entfernt sie im `finally`-Block.
- Der Pruefer ist in `pnpm gate` zwischen `nummern-pruefen` und
  `i18n-pruefen` eingehangen.
- `supabase/README.md` beschreibt die sechs verbotenen Befehle, die benannte
  Ausnahme und die Gate-Anbindung.

## Nachweis nach der Aenderung

`node --check tools/migration-datenlogik-pruefen.mjs` war gruen.

`node tools/migration-datenlogik-pruefen.mjs` war gruen und meldete die
benannte Baseline-Ausnahme. Der reale Selbsttest meldete jede Zeile einzeln:

| temporaere Probe | Erwartung | Messung |
|---|---:|---:|
| `INSERT` | 1 rote Meldung | 1 |
| `UPDATE` | 1 rote Meldung | 1 |
| `COPY` | 1 rote Meldung | 1 |
| `DELETE` | 1 rote Meldung | 1 |
| `TRUNCATE` | 1 rote Meldung | 1 |
| `MERGE` | 1 rote Meldung | 1 |
| `DO $$ BEGIN INSERT ... END $$` | 1 rote Meldung | 1 |
| `ALTER TABLE` | 0 Meldungen, gruen | 0 |

Die Selbstprobe endete mit `Selbstprobe erfolgreich; temporaere Migrationen
entfernt.` Anschliessend war im Migrationsverzeichnis kein C-291-Proberest.
Bestehende Migrationen wurden weder geaendert noch geloescht.

`pnpm gate` lief anschliessend vollstaendig gruen in 90,6 Sekunden. Die
ausgefuehrte Gate-Kette enthielt
`node tools/migration-datenlogik-pruefen.mjs`; der Pruefer meldete erfolgreich
die benannte Ausnahme. Turbo meldete 11 erfolgreiche Aufgaben.

## Abgrenzung

Keine Datei unter `apps/` und keine `user_medications`-Schreiblogik wurden
angefasst. Es gab keinen Commit, kein Staging und keinen Push.
