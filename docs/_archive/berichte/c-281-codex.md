# C-281 + C-282 Codex Bericht

## Ausgangsmessung

Live vor dem Lauf, Angaben an Unterformen:

| Tabelle | Kind-Zeilen |
|---|---:|
| `supplement_dosing` | 101 |
| `supplement_lab_effects` | 48 |
| `supplement_user_texts` | 35 |
| `supplement_wada` | 32 |

`supplement_user_texts` wurde nicht vererbt. Das ist C-266s Entscheidung: Sammeltexte brauchen eigene Belege.

WADA: 18 Sammelnamen hatten Kind-WADA-Zeilen, 0 hatten eine eigene WADA-Zeile. Davon waren 17 einheitlich. Koffein war uneinheitlich:

| Sammelname | Form | WADA |
|---|---|---|
| Caffeine | Caffeine (anhydrous) | `monitored` |
| Caffeine | Caffeine (fat-loss context cross-ref) | `not_prohibited` |

Vorab-Erwartung fuer den Lauf:

| Bereich | Erwartung |
|---|---:|
| Dosis-Eltern mit mindestens einem einheitlichen Feld | 22 |
| Dosisfelder, die einheitlich hochgereicht werden | 109 |
| Laboreffekt-Gruppen einheitlich | 46 |
| Laboreffekt-Gruppen uneinheitlich | 1 |
| WADA-Sammelnamen einheitlich | 17 |
| WADA-Sammelnamen uneinheitlich | 1 |
| WADA status/category-Widersprueche | 2 |
| Rueckrichtung `not_prohibited` mit Verbotskategorie | 0 |

Die frische Kette erzeugt bei Dosis 71 Eltern-Gruppen, Live hatte 68. Der Unterschied betrifft drei Gruppen ohne vererbbares Feld. Die pruefende Erwartung ist deshalb die fachliche Zahl: 22 Eltern und 109 Felder.

## Umsetzung C-281

Neuer Kettenschritt:

- `supabase/_pipeline/13_supplements/281_supplement_wissen_hochreichen.sql`

Regel:

- einheitlich je Sammelname und Feld -> hochreichen
- uneinheitlich -> unten lassen und melden
- User-Texte -> nicht vererben

Vermerk:

- Dosis: `source = 'c281:inherited_from_children'`, `provenance_note`, `integration_note`, `sources.child_supplement_ids`, `sources.child_names`
- Laborwirkung: `source = 'c281:inherited_from_children'`, `enrichment_raw.child_supplement_ids`, `enrichment_raw.child_names`
- WADA: `source = 'c281:inherited_from_children'`, `raw.child_supplement_ids`, `raw.child_names`, `sources.child_sources`

Live nach dem Lauf:

| Tabelle | Gesamt | davon C-281 |
|---|---:|---:|
| `supplement_dosing` | 596 | 22 |
| `supplement_lab_effects` | 271 | 46 |
| `supplement_wada` | 337 | 17 |

Gegenproben:

- Koffein hat zwei Formen mit `monitored` und `not_prohibited`; der Sammelname erbt keine WADA-Zeile: 0.
- Magnesium behaelt unterscheidbare Dosisfelder: `dose_unit` und `duration_studied_en` bleiben am Sammelnamen leer; die Herkunft nennt alle acht Kindzeilen.
- Ein einzelnes Kind reicht unstrittig hoch, z. B. `Collagen` aus `Collagen peptides (hydrolyzed collagen)`.

Negativprobe:

Auf der Wegwerf-DB wurde ein Calcium-Kind absichtlich auf einen abweichenden WADA-Status gesetzt. Danach brach Schritt 281 ab:

```text
C-281 WADA-Erwartung verletzt: uniform 16, uneinheitlich 2, eingefuegt 16 statt 17/1/17
```

## Umsetzung C-282

Neuer Kettenschritt:

- `supabase/_pipeline/13_supplements/282_wada_status_kategorie_konflikte.sql`

Die beiden selbstwiderspruechlichen WADA-Zeilen wurden nicht korrigiert, sondern als Konflikt-Records festgehalten:

| Substanz | current_value | Kategorie |
|---|---|---|
| Phenibut | `{"wada_status": "prohibited", "wada_category": "not on WADA list (not prohibited)"}` | `VALUE_CONFLICT` |
| Tianeptine ('gas station heroin') | `{"wada_status": "prohibited", "wada_category": "not prohibited"}` | `VALUE_CONFLICT` |

Kimis WADA-Dateien tragen denselben Widerspruch: der Status sagt `prohibited`, die Kategorie/Notiz sagt sinngemaess `not prohibited`. Darum wurde kein Wert still ueberschrieben.

Rueckrichtung:

- `not_prohibited` mit Verbotskategorie: 0.

## Nachweis

Kette:

- `KETTE OK`
- `SCHEMA VOLLSTAENDIG`
- `OK C-281: Dosis 22 Eltern/109 Felder, Lab 46 geerbt/1 gemeldet, WADA 17 geerbt/1 gemeldet`
- `OK C-282: WADA-Selbstwidersprueche 2 als Konflikt-Records, Rueckrichtung 0`

Live:

- Vollsicherung vorher: `backup/vollsicherung/*_c281_vor_live.dump` und `.sql`
- `SCHEMA VOLLSTAENDIG`: Exit 0
- Schemafreigabe: gruen
- `testdaten-pruefen.ts`: Exit 0
- `im_katalog`: 412 Top-Level, 0 sichtbare Unterformen

Wegwerf-Datenbank wurde danach verworfen.

Nachweise:

- `backup/c281/messung-vorher.out`
- `backup/c281/simulation-vorher.out`
- `backup/c281/kettenlauf-probe.out`
- `backup/c281/probe-direkt.out`
- `backup/c281/negativprobe.out`
- `backup/c281/live-einspielen.out`
- `backup/c281/live-direkt.out`
- `backup/c281/live-schema-vollstaendigkeit-retry.out`
- `backup/c281/live-testdaten-pruefen.out`
