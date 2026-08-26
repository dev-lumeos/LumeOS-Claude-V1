# C-280 Codex Bericht

## Auftrag

`wissen` bleibt service-role-only und wird nicht in `supabase/config.toml` freigegeben. Fuer den Community-Reiter gibt es stattdessen eine Sicht im Fachschema:

- `supplements.community_anzeige`
- Quelle: `wissen.community_records`
- Grenze: nur erlaubte Datensaetze und nur erlaubte Felder

## Umsetzung

Angelegt wurde der Kettenschritt:

- `supabase/_pipeline/16_wissen/280_community_anzeige.sql`
- in `supabase/_pipeline/kette.json` hinter `273h`

Der Sollstand wurde erweitert:

- `supabase/_pipeline/daten/schema-sollstand.json`
- `supabase/_pipeline/_validierung/schema-vollstaendigkeit-pruefen.ts`

Die Sicht ist mit `security_barrier = true` angelegt. `security_invoker` wurde bewusst nicht gesetzt, weil `wissen` nicht ueber PostgREST freigegeben wird und die Sicht die fachliche Grenze bildet.

## Messung der Zuordnung

Der Auftrag sagte: Nebenwirkungen tragen `substance_class`, nicht `substance_id`.

Gemessen wurde: die 37 Nebenwirkungsmuster tragen beides:

- `substance_class` fuer die fachliche Klasse
- `substance_ids` fuer konkrete Substanzen

Die Sicht nutzt die konkreten `sub_%`-IDs fuer die Anzeige und gibt `substance_class` als sichtbares Kontextfeld mit. Nicht-Supplement-IDs wie `drug_*` werden nicht in `substance_ids` uebernommen.

Gegenproben:

- `sub_77b68a4df6` Nandrolone bekommt den Nebenwirkungsfall `Deca dick`: 1 Treffer
- `sub_a407e3597e` SARM bekommt das JAMA-52-Prozent-Qualitaetssignal: 1 Treffer
- Vitamin D3 bekommt keine Community-Zeile: 0 Treffer

## Sichtinhalt

Live nach Einspielen:

| Dataset | Zeilen |
|---|---:|
| `community_product_quality_signals` | 40 |
| `community_science_delta` | 30 |
| `community_side_effect_patterns` | 37 |
| `community_stack_patterns` | 31 |
| `community_terminology_terms` | 71 |
| `community_usage_concepts` | 3 |
| **Summe** | **212** |

Spalten: 28.

Nicht vorhanden:

- `raw`: 0
- `reported_mitigations`: 0
- `components`: 0
- `reported_reason_for_combination`: 0
- `why_these_doses`: 0

Auch in der Viewdefinition kommen die vier Anleitungsfelder nicht vor.

## Negativprobe

Auf der Wegwerf-Datenbank `lumeos_c280_neg` wurde absichtlich eine falsche Sicht mit `reported_mitigations` erzeugt.

Der fokussierte Sicht-Waechter wurde rot:

```text
EXIT 1
FORBIDDEN_COLUMNS:
reported_mitigations
FORBIDDEN_VIEWDEF:
reported_mitigations
```

Der volle Schema-Waechter hatte bei der manipulierten Sicht nicht terminiert; der neue fokussierte Waechter prueft dieselbe Grenze direkt und reproduzierbar.

## Kettenlauf

Wegwerf-Kette:

- Datenbank: `lumeos_c280_neg`
- Ergebnis: `KETTE OK`
- `SCHEMA VOLLSTAENDIG`
- C-280-Hinweis: `OK C-280 community_anzeige: 212 Zeilen, 37 Nebenwirkungen, keine raw-/Anleitungsfelder`

Gemessen auf der Kette:

- `im_katalog` Top-Level: 412
- sichtbare Unterformen: 0

## Live

Vor dem Live-Einspielen wurde gesichert:

- `backup/vollsicherung/*_c280_vor_live.dump`
- `backup/vollsicherung/*_c280_vor_live.sql`

Live eingespielt wurde nur Schritt 280.

Live nach Einspielen:

- `supplements.community_anzeige`: 212 Zeilen
- `im_katalog` Top-Level: 412
- sichtbare Unterformen: 0
- `supabase/config.toml`: kein Treffer fuer `wissen`
- Schemafreigabe: gruen
- Schema-Vollstaendigkeit: `SCHEMA VOLLSTAENDIG`
- `testdaten-pruefen.ts`: Exit 0

Die alte 19er-Kontrollliste enthaelt inzwischen Tabellen aus dem alten Supplements-Umbau, die im aktuellen Schema nicht mehr existieren:

- `supplements.substance_catalog_sources`: `MISSING`
- `supplements.substance_catalog`: `MISSING`
- `supplements.substance_lab_effects`: `MISSING`

Die uebrigen Kontrollzahlen wurden gemessen; die Abweichungen entsprechen dem aktuellen Live-Stand nach den neueren Supplements-Schritten.

## Dateien

Nachweise liegen unter:

- `backup/c280/kettenlauf-neg.out`
- `backup/c280/probe2-direkt.out`
- `backup/c280/live-direkt.out`
- `backup/c280/sicht-waechter-negativ.out`
- `backup/c280/live-schema-vollstaendigkeit.out`
- `backup/c280/live-schemafreigabe.out`
- `backup/c280/live-testdaten-pruefen.out`
- `backup/c280/live-19-kontrollzahlen.out`
