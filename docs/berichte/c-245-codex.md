# C-245 Codex-Bericht

Stand: 2026-08-23

## Ausgangspunkt

Nach C-243 hatte `test-user@lumeos.local` im aktiven Stack `Nachweis-Stack` vier Positionen:

| Position | Art | Einnahmen |
|---|---|---:|
| Creatin Monohydrat | `custom_name` | 12 |
| Creatine monohydrate | `supplement_id = sub_9f9bb8c160` | 0 |
| Vitamin D3 | `custom_name` | 12 |
| Omega-3 (EPA/DHA) | `supplement_id = sub_4480fcfa86` | 0 |

Nachweis vorher:

- `backup/c245/vor-zweiter-lauf.log`
- Dublettenabfrage fand `creatine_monohydrate` mit 2 Positionen und 12 Einnahmen.

## Umsetzung

Geaendert wurde der bestehende Kettenschritt:

- `supabase/_pipeline/13_supplements/138_supplements_stack_umhaengen.sql`

Die bestehende `custom_name`-Zeile `Creatin Monohydrat` wird jetzt auf `supplements.supplements.slug = sub_9f9bb8c160` umgehaengt. Die deterministische C-243-Zusatzzeile `c243:test-user:creatine` wird geloescht, sofern keine Einnahmen an ihr haengen.

Omega-3 wird nur angelegt, wenn im Stack noch keine Position mit `sub_4480fcfa86` existiert.

Vitamin D3 bleibt `custom_name`, weil die Formentscheidung C-244 ist.

## Live-Eingriff

Vollsicherung vor dem Live-Eingriff:

- `backup/vollsicherung/20260823_161228_c245_vor_live_lumeos_voll.dump`
- `backup/vollsicherung/20260823_161228_c245_vor_live_lumeos_voll.sql`

Erster Lauf zeigte einen Fehler in der Faltung der Nachweisregel: Grossbuchstaben wurden vor `lower()` entfernt. Deshalb traf `Creatin Monohydrat` nicht. Der Schritt wurde korrigiert und erneut eingespielt.

Finaler Live-Lauf:

- Log: `backup/c245/live-apply-138-zweiter-lauf.log`
- `UPDATE 1`: alte Kreatin-Zeile umgehaengt
- `DELETE 1`: neue C-243-Kreatin-Zeile entfernt
- `INSERT 0 0`: keine neue Kreatin-/Omega-Zeile noetig

## Nachweis nachher

Nachweisdatei:

- `backup/c245/nach-zweiter-lauf.log`

`test-user@lumeos.local`, Stack `Nachweis-Stack`:

| Position | Art | Einnahmen |
|---|---|---:|
| Creatine monohydrate | `supplement_id = sub_9f9bb8c160` | 12 |
| Omega-3 (EPA/DHA) | `supplement_id = sub_4480fcfa86` | 0 |
| Vitamin D3 | `custom_name` | 12 |

Erwartung erfuellt:

| Messpunkt | Zahl |
|---|---:|
| Positionen im Nachweis-Stack | 3 |
| mit `supplement_id` | 2 |
| mit `custom_name` | 1 |
| Kreatin-Einnahmen | 12 |
| Vitamin-D3-Einnahmen | 12 |
| `supplements.intake_logs` gesamt | 744 |

Gesamtbestand nachher:

- `backup/c245/live-final-overall-counts.log`
- `supplements.stack_items`: 11
- davon mit `supplement_id`: 6
- davon mit `custom_name`: 5
- `supplements.intake_logs`: 744

## Negativprobe

Nachweisdatei:

- `backup/c245/negative_duplicate.sql`
- `backup/c245/negative_duplicate.log`

Die Probe fuegt in einer Transaktion absichtlich eine zweite Kreatin-Zeile in den aktiven Test-Stack ein. Die Dublettenpruefung wird rot:

`C-245 Negativprobe rot: 1 doppelte Keys gefunden`

Die Transaktion bricht ab; die Kontrollmessung danach blieb unveraendert.

## Validierung

Finaler Kettenlauf:

- `backup/c246/kette-final.log`
- `SCHEMA VOLLSTAENDIG`
- `KETTE OK: 165.5s`

Live-Testdaten:

- `backup/c246/live-testdaten-final.log`
- `OK: C-82 Testdaten stimmen.`

Nicht committet, nicht gestaged.
