# Sitzung 2026-08-03 — public bereinigt

**Ankerhash bei Start:** 71ccf52
**Ziel:** Die vier Governance-Tabellen aus dem Schema `public` entfernen,
nachdem der Cluster nach `_archive/governance/` verschoben wurde.

---

## Vorprüfung

`[cmd]` Vor dem Eingriff geprüft:

- **keine Fremdschlüssel** von oder nach `public`
- **`nutrition` verweist nirgends auf `public`**
- `public.update_updated_at` hängt an genau einem Trigger,
  `workorders_updated_at` auf `public.workorders`
- die übrigen 31 Funktionen in `public` gehören zur Erweiterung `pg_trgm`
  und bleiben unberührt
- 3 Enums: `wo_type`, `wo_state`, `wo_phase`

Der Bestand war: 4 Tabellen, davon `workorders` mit 37 Spalten und 4 Zeilen
aus April-Testläufen.

## Sicherung

`[cmd]` `backup/schema/2026-08-03_public_vor_drop.sql` (17.168 B)
`[cmd]` `backup/data/2026-08-03_public_vor_drop.dump` (26.419 B)

## Kettenschritt 080

Neu: `supabase/_pipeline/08_bereinigung/080_public_bereinigen.sql`
Prüfung: `supabase/_pipeline/_validierung/v080_public_bereinigen.sql`

`[cmd]` In einer Wegwerf-Datenbank aus der Sicherung wiederhergestellt und
**zweimal angewendet** — beide Läufe fehlerfrei, Ergebnis identisch.
Ausgangszustand 4 Tabellen und 3 Enums, danach je 0. Testdatenbank verworfen.

## Anwendung

`[cmd]` Fehlerfrei mit `ON_ERROR_STOP=1`, Transaktion committet.
PostgREST-Schema-Cache neu geladen.

`[cmd]` `v080`, fünf Prüfungen:

| Prüfung | Ist | Soll | |
|---|---|---|---|
| Tabellen in `public` | 0 | 0 | ✓ |
| `wo_`-Enums | 0 | 0 | ✓ |
| Nicht-Extension-Funktionen | 0 | 0 | ✓ |
| `nutrition`-Tabellen unberührt | 11 | 11 | ✓ |
| `foods`-Zeilen unberührt | 7.140 | 7.140 | ✓ |

## Endstand

| Schema | Tabellen |
|---|---|
| `auth` | 20 |
| `nutrition` | 11 |
| `storage` | 10 |
| `public` | **0** |

`public` ist damit frei für Produktschemata. Relevant für TODO C-03: der
Diary-Entwurf in `db/schema/nutrition.sql` schreibt `[cmd]` unqualifiziert
und damit nach `public` — dort steht ihm jetzt nichts mehr im Weg, das
Schema-Präfix bleibt trotzdem die richtige Lösung.

## Offen

Der Web-Dev-Server lief zum Zeitpunkt der Prüfung nicht; er wurde beim
Archivierungslauf beendet. Ein Funktionstest der App nach diesem Eingriff
steht aus — erwartet wird keine Auswirkung, da `apps/web` ausschliesslich
`nutrition` liest.
