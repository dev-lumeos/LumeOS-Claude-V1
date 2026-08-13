-- =============================================================
-- 031 — Die 30 Einzelfettsaeuren nachtragen
-- Datum: 2026-08-14 · Laeuft NACH 030. Idempotent.
-- Grundlage: docs/ssot/46-bls-importluecke.md
-- =============================================================
--
-- BEFUND: `[cmd]` nutrient_defs traegt 138 Codes, food_nutrients nur 108.
-- Fuer 30 Codes existierte keine einzige Wertzeile — 171.409 Werte,
-- 19,7 % des Bestands. Alle dreissig sind Einzelfettsaeuren:
-- F16:0 Palmitinsaeure, F18:1CN9 Oelsaeure, F20:5CN3 EPA,
-- F22:6CN3 DHA, F4:0 Buttersaeure und so weiter.
--
-- WO DER FEHLER LAG — nicht beim Datenbankimport:
-- `[cmd]` supabase/_data/bls_4_0_local_import.zip traegt in
-- food_nutrients.csv bereits nur 108 Codes und exakt 698.092 Zeilen,
-- genau so viele wie die Datenbank hat. 030 hat also vollstaendig
-- eingelesen, was dastand. Der Verlust passierte eine Stufe frueher,
-- beim Erzeugen jener CSV aus der amtlichen Arbeitsmappe.
-- `[cmd]` Die CSV enthaelt NULL Codes mit Doppelpunkt; alle 30
-- fehlenden tragen einen. Das ist die einzige Eigenschaft, die alle
-- dreissig teilen und keiner der 108 uebrigen.
--
-- DER BESTAND IST GEPRUEFT, bevor hier etwas dazukommt:
-- `[cmd]` 2026-08-14 wurden alle 698.092 vorhandenen Werte gegen
-- docs/ssot/daten/BLS_4_0_Daten_2025_DE.xlsx verglichen. 353
-- Abweichungen, ALLE Rundungen auf die fuenfte Nachkommastelle
-- (0.79074 gegen 0.790735) — das ist die Genauigkeit der Spalte,
-- kein Datenfehler. Null inhaltliche Abweichungen.
--
-- WAS NICHT IMPORTIERT WIRD, und warum:
-- `[cmd]` In der Quelle stehen neben Zahlen auch
--   '-'              110.083  fehlender Wert
--   '<LOD'             2.733  unterhalb Nachweisgrenze
--   'TR'               1.806  Spuren
--   '<LOQ'               746  unterhalb Bestimmungsgrenze
--   '<LOD or <LOQ'       392
-- `[read]` BLS-Dokumentation 4.3: "Ein fehlender Wert ist nicht
-- gleichbedeutend mit Null und sollte nicht als Null interpretiert
-- werden." Deshalb wird keine dieser Angaben zu einer 0. Sie fehlen
-- danach ebenso wie vorher — aber sie sind gezaehlt und benannt,
-- statt lautlos zu verschwinden.
-- OFFEN (docs/ssot/46-…): 'TR' und '<LOD' sind fachlich GROESSER null.
-- Sie liessen sich mit einer eigenen Kennzeichnung tragen, sobald die
-- Datenherkunftsspalten uebernommen werden.
--
-- QUELLE: supabase/_data/bls_4_0_fettsaeuren.zip (0,8 MB), erzeugt aus
-- der amtlichen Arbeitsmappe. Format wie 030: bls_code, nutrient_code,
-- value, data_source. `data_source = 'bls_4_0_xlsx_nachtrag'` haelt die
-- Herkunft unterscheidbar von den 698.092 aus 'bls_4_0_local_import'.
--
-- GRENZEN wie 030: nur lokale Datenbank, kein DEV, kein LIVE, keine
-- Cloud. Die Arbeitsmappe selbst wird nicht committet.
-- =============================================================

begin;

create temporary table stage_fettsaeuren (
  bls_code text not null,
  nutrient_code text not null,
  value numeric(12,5) not null,
  data_source text not null
) on commit drop;

\copy stage_fettsaeuren (bls_code, nutrient_code, value, data_source) from '/tmp/bls-fettsaeuren/fehlende_fettsaeuren.csv' with (format csv, header true, encoding 'UTF8')

-- --- Vorbedingungen, bevor irgendetwas geschrieben wird ---
do $$
declare
  ohne_def integer;
  ohne_food integer;
  fremde_codes integer;
begin
  select count(*) into ohne_def
  from stage_fettsaeuren s
  left join nutrition.nutrient_defs d on d.code = s.nutrient_code
  where d.code is null;
  if ohne_def <> 0 then
    raise exception 'Nachtrag traegt % Naehrstoffcodes ohne Definition', ohne_def;
  end if;

  select count(*) into ohne_food
  from stage_fettsaeuren s
  left join nutrition.foods f on f.bls_code = s.bls_code
  where f.id is null;
  if ohne_food <> 0 then
    raise exception 'Nachtrag traegt % Lebensmittel, die es nicht gibt', ohne_food;
  end if;

  -- Dieser Schritt traegt AUSSCHLIESSLICH Codes mit Doppelpunkt nach.
  -- Kaeme etwas anderes mit, wuerde er bestehende Werte ueberschreiben,
  -- und der Bestand ist geprueft — er soll unangetastet bleiben.
  select count(*) into fremde_codes
  from stage_fettsaeuren where position(':' in nutrient_code) = 0;
  if fremde_codes <> 0 then
    raise exception 'Nachtrag traegt % Zeilen ohne Doppelpunkt im Code', fremde_codes;
  end if;
end
$$;

insert into nutrition.food_nutrients (food_id, nutrient_code, value, data_source)
select f.id, s.nutrient_code, s.value, s.data_source
from stage_fettsaeuren s
join nutrition.foods f on f.bls_code = s.bls_code
on conflict (food_id, nutrient_code) do update set
  value = excluded.value,
  data_source = excluded.data_source;

commit;
