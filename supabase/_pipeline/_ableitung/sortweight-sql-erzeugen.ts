#!/usr/bin/env node
// Erzeugt den sort_weight-Block fuer 020_food_human_layer.sql aus
// supabase/_pipeline/daten/sortweight-formel.json.
//
// WARUM ERZEUGT UND NICHT ABGESCHRIEBEN: Datendatei und SQL wuerden
// sonst auseinanderdriften, und in vier Wochen weiss niemand, welche
// der beiden gilt. Die Formel steht an EINER Stelle; dieses Skript
// uebersetzt sie.
//
// Das ist eine Formeluebersetzung, kein Namensgenerator.
//
// AUFRUF (schreibt in 020_food_human_layer.sql):
//   pnpm exec tsx supabase/_pipeline/_ableitung/sortweight-sql-erzeugen.ts
// AUFRUF (nur anzeigen):
//   pnpm exec tsx supabase/_pipeline/_ableitung/sortweight-sql-erzeugen.ts --zeigen
import fs from 'node:fs'

const F = JSON.parse(fs.readFileSync('supabase/_pipeline/daten/sortweight-formel.json', 'utf8'))
const ZIEL = 'supabase/_pipeline/02_human_layer/020_food_human_layer.sql'

const core = Object.keys(F.core_liste).filter(k => !k.startsWith('_')).sort()
const basis = F.basis_warengruppe

/** SQL-Ausdruck fuer den gefalteten Namen — wie nutrition.search_fold. */
const N = `nutrition.search_fold(COALESCE(f.name_de,''))`
/** Zubereitungscode, Stellen 5-7. */
const ZUB = `substring(f.bls_code from 5 for 3)`
/** Warengruppe, Stelle 1. */
const WG = `substring(f.bls_code from 1 for 1)`

// Grundform nach CODE (fuer whole_food) und nach Code UND Name
// (fuer den Grundform-Bonus und den Zubereitet-Abzug).
const GRUNDFORM_CODE = `${ZUB} IN ('100','000')`
const ZUBEREITET_NAME =
  `${N} ~ '\\m(gebraten|gekocht|gegrillt|paniert|geschmort|gebacken|frittiert|geduenstet|pochiert)\\M'`
const GRUNDFORM = `(${GRUNDFORM_CODE} AND NOT ${ZUBEREITET_NAME})`

// `_`-Schluessel sind Kommentarfelder der Datendatei, keine
// Warengruppen. Ohne diesen Filter landet "_kommentar" als
// CASE-Zweig im SQL — der Kettenlauf bricht dann mit
// "syntax error at or near ..." ab.
const basisZeilen = Object.keys(basis).filter(k => !k.startsWith('_')).sort()
  .map(k => `    WHEN '${k}' THEN ${basis[k]}`).join('\n')

const coreZeilen: string[] = []
for (let i = 0; i < core.length; i += 6) {
  coreZeilen.push('        ' + core.slice(i, i + 6).map(c => `'${c}'`).join(','))
}

const sql = `-- =============================================================
-- sort_weight nach SPEC_05_FOOD_TAXONOMY, Abschnitt "Sort Weight System"
-- =============================================================
-- ERZEUGT aus supabase/_pipeline/daten/sortweight-formel.json durch
-- supabase/_pipeline/_ableitung/sortweight-sql-erzeugen.ts.
-- NICHT von Hand aendern — die Formel steht in der Datendatei, sonst
-- driften beide auseinander.
--
-- Vorher stand hier eine Fassung nach SPEC_08_IMPORT_PIPELINE. Die
-- Unterschiede und die Ablösung sind in docs/ssot/51-sortweight-formel.md
-- belegt (dritter Teil). Kurz:
--   * SPEC_08 kannte 8 Core-Codes, SPEC_05 kennt ${core.length}.
--   * SPEC_08 hatte keine Innereien-, Blut- und Fettgewebe-Abzuege.
--   * SPEC_08 zog X/Y zusaetzlich -300 ab, obwohl die Basis die
--     Warengruppe schon kodiert (Doppelbestrafung, siehe unten).
--
-- DREI REGELN DER SPEC SIND UNWIRKSAM ODER GESTRICHEN:
--   * ultra_processed (-250): \`[cmd]\` nutrition.foods.processing_level
--     traegt fuer alle 7.140 Eintraege den Wert 'raw', auch fuer
--     Bechamelsauce. Der Abzug kann nicht feuern.
--   * fertiggericht (-300, X/Y) und alkohol (-300, P): GESTRICHEN.
--     Doppelbestrafung — die Basis kodiert die Warengruppe bereits
--     (X 200, Y 240, P 180). \`[cmd]\` Mit dem Abzug standen alle 119
--     P-Eintraege auf 0 (eine einzige Stufe), dazu 1.114 von 1.165 X
--     und 862 von 885 Y.
--
-- EINE ABWEICHUNG VON DER SPEC, bewusst und entschieden:
--   * whole_food (+60) feuert bei Zubereitungscode 100 ODER 000.
--     Die Spec nennt nur 100. \`[read]\` 44-bls-codestruktur.md: 000
--     heisst nicht "roh", sondern "keine Zubereitungsvariante" —
--     Haferflocken, Skyr und Olivenoel tragen 000, weil sie keine
--     Rohform HABEN. nutrition.such_rang_zubereitung behandelt beide
--     seit Block 32 gleichrangig; Code schlaegt Spec.
--
-- \`[cmd]\` Abnahme: MealCam-Massstab 34 von 37 (vorher 31), 145
-- Nullwerte statt 2.165, 95 Stufen statt 93.
-- =============================================================
UPDATE nutrition.foods f
SET sort_weight = LEAST(1000, GREATEST(0,
  -- Basis nach Warengruppe
  CASE ${WG}
${basisZeilen}
    ELSE 400
  END
  -- Sonderfaelle: die Spec teilt E, U und V nach Untergruppe
  + CASE
      WHEN ${WG} = 'E' AND ${N} ~ '\\m(teigwaren|nudeln|spaetzle)\\M' THEN 580 - 750
      WHEN ${WG} = 'U' AND (${N} ~ '\\m(fettgewebe|speck|flomen|wamme)\\M'
                            OR ${N} ~ '^[a-z]+ schwarte\\M') THEN 100 - 780
      WHEN ${WG} = 'V' AND ${N} ~ '\\m(leber|herz|magen|niere)\\M' THEN 300 - 760
      ELSE 0
    END
  -- Zuschlaege
  + CASE WHEN f.bls_code IN (
${coreZeilen.join(',\n')}
      ) THEN 200 ELSE 0 END
  + CASE WHEN COALESCE(prot.value, -1) >= 20 THEN 80 ELSE 0 END
  + CASE WHEN COALESCE(prot.value, -1) >= 30 THEN 120 ELSE 0 END
  + CASE WHEN COALESCE(prot.value, -1) >= 20 AND fat.value IS NOT NULL
              AND fat.value <= 5 THEN 50 ELSE 0 END
  + CASE WHEN COALESCE(n3.value, -1) >= 1 THEN 40 ELSE 0 END
  + CASE WHEN COALESCE(fibt.value, -1) >= 6 THEN 30 ELSE 0 END
  + CASE WHEN ${GRUNDFORM_CODE} AND ${WG} IN ('C','G','F','H','T') THEN 60 ELSE 0 END
  + CASE WHEN ${N} ~ '\\m(hummer|kaviar|trueffel)\\M' THEN 100 ELSE 0 END
  -- Grundform: nicht aus der Spec, sondern aus Block 32. Ohne sie
  -- faellt "Banane roh" hinter "Banane getrocknet".
  + CASE WHEN ${GRUNDFORM} THEN ${F.zubereitung.grundform_bonus} ELSE 0 END
  -- Abzuege
  + CASE WHEN ${GRUNDFORM} THEN 0 ELSE -150 END
  + CASE WHEN ${N} ~ '\\m(gesuesst|gezuckert|dragiert|kandiert)\\M' THEN -100 ELSE 0 END
  + CASE WHEN ${N} ~ '\\mkonserve\\M' AND ${WG} <> 'T' THEN -80 ELSE 0 END
  + CASE WHEN ${N} ~ '\\m(herz|herzen|niere|nieren|magen|kutteln|bries|zunge|euter)\\M'
         THEN -400 ELSE 0 END
  + CASE WHEN ${N} ~ '\\mleber'
              AND NOT ${N} ~ '\\m(leberkaese|leberwurst|leberpastete|leberknoedel|leberterrine)\\M'
         THEN -380 ELSE 0 END
  + CASE WHEN ${N} ~ '\\m(hirn|gehirn|lunge|milz)\\M' THEN -450 ELSE 0 END
  + CASE WHEN ${N} ~ '\\mblut' THEN -500 ELSE 0 END
  + CASE WHEN ${N} ~ '\\mfettgewebe\\M' THEN -500 ELSE 0 END
  + CASE WHEN ${N} ~ '\\mknochenmark\\M' THEN -450 ELSE 0 END
  -- Schwarte nur, wenn das Stueck die Schwarte IST. \`[cmd]\` 8 Eintraege
  -- heissen "(mit|ohne) Fett und Schwarte" und meinen ein Bratenstueck;
  -- vier davon fielen sonst von 480 auf 0.
  + CASE WHEN (${N} ~ '^[a-z]+ schwarte\\M' OR ${N} ~ '\\mschwarten\\M')
              AND NOT ${N} ~ '\\mschwarten und\\M' THEN -430 ELSE 0 END
  + CASE WHEN ${N} ~ '\\ms (i|ii|iii|iv|v|vi|vii|viii|ix|x|xi|xii)\\M' THEN -200 ELSE 0 END
))
FROM nutrition.foods source_food
LEFT JOIN nutrition.food_nutrients prot ON prot.food_id = source_food.id AND prot.nutrient_code = 'PROT625'
LEFT JOIN nutrition.food_nutrients fat  ON fat.food_id  = source_food.id AND fat.nutrient_code  = 'FAT'
LEFT JOIN nutrition.food_nutrients fibt ON fibt.food_id = source_food.id AND fibt.nutrient_code = 'FIBT'
LEFT JOIN nutrition.food_nutrients n3   ON n3.food_id   = source_food.id AND n3.nutrient_code   = 'FAPUN3'
WHERE f.id = source_food.id;`

if (process.argv.includes('--zeigen')) {
  console.log(sql)
  process.exit(0)
}

// --- Den alten Block ersetzen ---
const datei = fs.readFileSync(ZIEL, 'utf8')
// Zwei Startmarken: die alte SPEC_08-Fassung beim ersten Lauf, die
// eigene Ueberschrift bei jedem weiteren. So bleibt das Skript
// wiederholbar.
const START_ALT = '-- Deterministic local sort_weight refresh based on SPEC_08 scoring rules.'
const START_NEU = '-- =============================================================\n-- sort_weight nach SPEC_05_FOOD_TAXONOMY'
let i = datei.indexOf(START_ALT)
if (i < 0) i = datei.indexOf(START_NEU)
if (i < 0) throw new Error('Startmarke nicht gefunden — steht der Block noch da?')
// Das Blockende ist die naechste Zeile, die mit "-- Deterministic macro" beginnt.
const ENDE = '-- Deterministic macro-derived V1 food tags only.'
const j = datei.indexOf(ENDE, i)
if (j < 0) throw new Error('Endmarke nicht gefunden')

const neu = datei.slice(0, i) + sql + '\n\n' + datei.slice(j)
fs.writeFileSync(ZIEL, neu, { encoding: 'utf8' })

const alteZeilen = datei.slice(i, j).split('\n').length
const neueZeilen = sql.split('\n').length
console.log(`${ZIEL} aktualisiert`)
console.log(`  alter Block : ${alteZeilen} Zeilen (SPEC_08)`)
console.log(`  neuer Block : ${neueZeilen} Zeilen (SPEC_05)`)
console.log(`  Core-Codes  : ${core.length}`)
