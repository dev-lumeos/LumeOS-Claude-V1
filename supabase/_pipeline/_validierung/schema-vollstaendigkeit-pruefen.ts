#!/usr/bin/env node
// ABSCHLUSSPRUEFUNG DER KETTE: steht nach einem vollstaendigen Lauf
// alles da, was dastehen muss?
//
// ANLASS (2026-08-16): `[cmd]` Nach dem Neuaufbau fuer C-38 fehlten
// nutrition.meals, meal_items, water_logs und zwei Sichten — dazu 12
// Policies, 2 Funktionen und 4 Trigger. **Kein Kettenlauf hat sich
// beschwert.** Die damalige Abschlusspruefung zaehlte nur foods,
// food_nutrients, food_aliases, food_tags, search_synonyms und die
// sort_weight-Stufen; was in keiner Erwartungsliste stand, konnte
// spurlos fehlen.
//
// DER ENTSCHEIDENDE PUNKT: Die Sollliste steht im REPO
// (supabase/_pipeline/daten/schema-sollstand.json), nicht in der
// Datenbank. `[read]` Genau dieser Fehler ist hier schon einmal
// passiert — eine Rechtepruefung, die ihre Sollliste vom Prueflig bezog
// und deshalb jeden Zustand bestaetigte. Eine Pruefung, die ihre
// Erwartung aus dem Prueflig ableitet, prueft nichts.
//
// AUFRUF: pnpm exec tsx supabase/_pipeline/_validierung/schema-vollstaendigkeit-pruefen.ts
// Exit 0 = vollstaendig, Exit 1 = etwas fehlt.
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'

const C = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE ?? 'postgres'
const SOLL_PATH = process.argv[2] ?? 'supabase/_pipeline/daten/schema-sollstand.json'
const SEP = ''

function sql(text: string): string[][] {
  return execFileSync('docker',
    ['exec', C, 'psql', '-U', 'postgres', '-d', DB, '-t', '-A', '-F', SEP, '-c', text],
    { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
    .split('\n').map(z => z.trimEnd()).filter(Boolean).map(z => z.split(SEP))
}

const SOLL = JSON.parse(
  fs.readFileSync(SOLL_PATH, 'utf8'))

const istTabellen = new Set(sql(
  `SELECT table_name FROM information_schema.tables
   WHERE table_schema='nutrition' AND table_type='BASE TABLE';`).map(r => r[0]))
const istSichten = new Set(sql(
  `SELECT table_name FROM information_schema.tables
   WHERE table_schema='nutrition' AND table_type='VIEW';`).map(r => r[0]))
const istFunktionen = new Set(sql(
  `SELECT DISTINCT p.proname FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
   WHERE n.nspname='nutrition';`).map(r => r[0]))

console.log('Schema-Vollstaendigkeit — Datenbank:', DB)
console.log(`Sollliste: ${SOLL_PATH} (von Hand gepflegt)`)
console.log('')

const fehler: string[] = []
const warnung: string[] = []

function pruefe(art: string, soll: Array<{ name: string; schritt: string }>, ist: Set<string>) {
  const fehlend = soll.filter(s => !ist.has(s.name))
  const zuviel = [...ist].filter(n => !soll.some(s => s.name === n))
  console.log(`${art.padEnd(12)} ${soll.length - fehlend.length}/${soll.length} vorhanden`)
  for (const f of fehlend) {
    fehler.push(`${art}: ${f.name} FEHLT — erzeugt von Schritt ${f.schritt}`)
  }
  for (const z of zuviel) {
    // Unerwartetes ist kein Fehler, aber es gehoert genannt: entweder
    // ist die Liste veraltet oder es liegt Ausschuss im Schema.
    const bekannt = SOLL.nicht_erwartet[z]
    warnung.push(bekannt
      ? `${art}: ${z} steht da und ist als "nicht erwartet" vermerkt (${bekannt})`
      : `${art}: ${z} steht da, aber NICHT in der Sollliste — Liste veraltet oder Ausschuss`)
  }
}

pruefe('Tabellen', SOLL.tabellen, istTabellen)
pruefe('Sichten', SOLL.sichten, istSichten)
pruefe('Funktionen', SOLL.funktionen, istFunktionen)

// =============================================================
// Zeilenschutz, Policies, security_invoker, Trigger, Fremdschluessel
// =============================================================
// Erweiterung vom 2026-08-16. `[cmd]` Beim Ausfall fehlten neben den
// Tabellen auch 12 Policies, 4 Trigger und ein Fremdschluessel — die
// erste Fassung dieser Pruefung haette davon nichts bemerkt.
// `[read]` Im Repo gab es bereits eine Sicht ohne security_invoker,
// durch die der zweite Nutzer die Daten des ersten sah. "Tabelle
// vorhanden" und "Tabelle geschuetzt" sind zwei Aussagen.

// --- 1. Zeilenschutz je Tabelle ---
const rlsIst = new Map<string, boolean>()
for (const [t, r] of sql(
  `SELECT tablename, rowsecurity::text FROM pg_tables WHERE schemaname='nutrition';`)) {
  // `rowsecurity::text` liefert 'true'/'false', nicht 't'/'f' —
  // beide Schreibweisen zulassen, damit die Pruefung nicht an der
  // psql-Ausgabe haengt.
  rlsIst.set(t, r === 'true' || r === 't')
}
let rlsOk = 0
for (const t of SOLL.tabellen) {
  if (!istTabellen.has(t.name)) continue          // Fehlen ist oben gemeldet
  const ist = rlsIst.get(t.name) === true
  if (ist === t.rls) rlsOk++
  else fehler.push(`Zeilenschutz: ${t.name} hat rowsecurity=${ist}, erwartet ${t.rls}` +
    ` — Schritt ${t.schritt}`)
}
console.log(`Zeilenschutz ${rlsOk}/${SOLL.tabellen.length} wie erwartet`)

// --- 2. Policies je Tabelle UND Operation ---
// Nicht die Gesamtzahl, sondern je Tabelle, welche Operationen
// abgedeckt sind. Das Muster steht in 060_zugriffsschicht.sql:
// Policies je Operation, keine Sammelpolicy.
const polIst = new Map<string, Set<string>>()
for (const [t, cmd] of sql(
  `SELECT tablename, cmd FROM pg_policies WHERE schemaname='nutrition';`)) {
  if (!polIst.has(t)) polIst.set(t, new Set())
  polIst.get(t)!.add(cmd)
}
let polOk = 0
for (const t of SOLL.tabellen) {
  if (!istTabellen.has(t.name)) continue
  const ist = polIst.get(t.name) ?? new Set<string>()
  const fehlend = (t.policies as string[]).filter(op => !ist.has(op))
  // Der gefaehrlichste Fall zuerst: Zeilenschutz an, keine einzige
  // Policy. Die Tabelle ist dann fuer alle gesperrt — der Fehler aus
  // ADR-0003, und er sieht von aussen aus wie "leer".
  if (t.rls && ist.size === 0) {
    fehler.push(`Policies: ${t.name} hat Zeilenschutz, aber KEINE Policy` +
      ` — Tabelle ist gesperrt (ADR-0003) — Schritt ${t.schritt}`)
  } else if (fehlend.length) {
    fehler.push(`Policies: ${t.name} fehlt ${fehlend.join(', ')}` +
      ` — Schritt ${t.schritt}`)
  } else {
    polOk++
  }
  const zuviel = [...ist].filter(op => !(t.policies as string[]).includes(op))
  if (zuviel.length) {
    warnung.push(`Policies: ${t.name} hat zusaetzlich ${zuviel.join(', ')}` +
      ` — Sollliste veraltet oder unerwartete Rechte`)
  }
}
console.log(`Policies    ${polOk}/${SOLL.tabellen.length} Tabellen vollstaendig`)

// --- 3. security_invoker je Sicht ---
const sichtOpt = new Map<string, string>()
for (const [v, o] of sql(
  `SELECT c.relname, COALESCE(array_to_string(c.reloptions,','),'')
   FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
   WHERE n.nspname='nutrition' AND c.relkind='v';`)) {
  sichtOpt.set(v, o)
}
let sichtOk = 0
for (const s of SOLL.sichten) {
  if (!istSichten.has(s.name)) continue
  const hat = (sichtOpt.get(s.name) ?? '').includes('security_invoker=true')
  if (hat === (s.security_invoker === true)) sichtOk++
  else fehler.push(`Sicht ${s.name}: security_invoker=${hat}, erwartet ${s.security_invoker}` +
    ` — ohne den Schalter laeuft sie mit Eigentuemerrechten — Schritt ${s.schritt}`)
}
console.log(`Sichten     ${sichtOk}/${SOLL.sichten.length} mit security_invoker`)

// --- 3b. Spalten je Tabelle/Sicht, wo der Sollstand welche fuehrt (C-37/C-51) ---
// `[read]` _bewusst_nicht_geprueft.spalten sagt: "Eine Tabelle kann den
// richtigen Namen tragen und die falschen Spalten haben." Fuer Sichten
// wog das schwerer als gedacht: daily_summary stand mit Namen,
// security_invoker und Grants in der Liste — ihre 48 Mikro-Spalten
// haetten ersatzlos verschwinden koennen, ohne dass hier etwas auffaellt.
// Geprueft wird NUR, wo der Sollstand eine "spalten"-Liste fuehrt; die
// allgemeine Aussage in _bewusst_nicht_geprueft bleibt sonst gueltig.
// Reihenfolge zaehlt mit, sobald eine Liste gepflegt wird: SELECT * und
// positionsbezogene Zugriffe haengen daran, und bei Tabellen schuetzt es
// vor stillen Anhaengseln ohne dokumentierte Entscheidung.
function pruefeSpalten(art: string, eintraege: any[], istObjekte: Set<string>): number {
  let spaltenGeprueft = 0
  for (const s of eintraege) {
    if (!Array.isArray(s.spalten) || !istObjekte.has(s.name)) continue
    spaltenGeprueft++
    const ist = sql(
      `SELECT column_name FROM information_schema.columns
       WHERE table_schema='nutrition' AND table_name='${s.name}'
       ORDER BY ordinal_position;`).map(r => r[0])
    const fehlend = s.spalten.filter((c: string) => !ist.includes(c))
    const zuviel = ist.filter(c => !s.spalten.includes(c))
    if (fehlend.length) {
      fehler.push(`${art} ${s.name}: ${fehlend.length} Spalten FEHLEN` +
      ` (${fehlend.slice(0, 6).join(', ')}${fehlend.length > 6 ? ' …' : ''})` +
      ` — Schritt ${s.schritt}`)
    }
    if (zuviel.length) {
      warnung.push(`${art} ${s.name}: ${zuviel.length} Spalten stehen da,` +
      ` aber nicht im Sollstand (${zuviel.slice(0, 6).join(', ')}` +
      `${zuviel.length > 6 ? ' …' : ''}) — Liste veraltet?`)
    }
    if (!fehlend.length && !zuviel.length &&
      s.spalten.join('|') !== ist.join('|')) {
      fehler.push(`${art} ${s.name}: Spalten vollstaendig, aber in anderer` +
      ` Reihenfolge — bei gepflegter Spaltenliste ist die Reihenfolge Teil des Vertrags`)
    }
  }
  return spaltenGeprueft
}
const tabellenSpaltenGeprueft = pruefeSpalten('Tabelle', SOLL.tabellen, istTabellen)
const sichtSpaltenGeprueft = pruefeSpalten('Sicht', SOLL.sichten, istSichten)
console.log(`Tabellensp.  ${tabellenSpaltenGeprueft} Tabelle(n) mit Spaltenliste geprueft`)
console.log(`Sichtspalten ${sichtSpaltenGeprueft} Sicht(en) mit Spaltenliste geprueft`)

// --- 4. Trigger namentlich ---
const trigIst = new Set(sql(
  `SELECT c.relname||'.'||t.tgname FROM pg_trigger t
   JOIN pg_class c ON c.oid=t.tgrelid JOIN pg_namespace n ON n.oid=c.relnamespace
   WHERE n.nspname='nutrition' AND NOT t.tgisinternal;`).map(r => r[0]))
let trigOk = 0
for (const t of SOLL.trigger) {
  if (trigIst.has(`${t.tabelle}.${t.name}`)) trigOk++
  else fehler.push(`Trigger: ${t.tabelle}.${t.name} FEHLT — erzeugt von Schritt ${t.schritt}`)
}
console.log(`Trigger     ${trigOk}/${SOLL.trigger.length} vorhanden`)

// =============================================================
// C-42: GRANTs und Policy-Bedingungen
// =============================================================
// `[read]` PostgREST prueft Tabellenrechte VOR RLS — eine Tabelle mit
// tadellosen Policies, aber ohne GRANT SELECT, ist fuer die Anwendung
// genauso unerreichbar wie eine gesperrte. Und eine Policy mit
// USING (true) auf einer Nutzertabelle zeigt jedem alles. Beide Faelle
// sind STILL: die Pruefung meldete gruen, die Anwendung war blind oder
// offen.

// --- 6. GRANTs je Rolle, EXAKT ---
// Nicht "mindestens diese Rechte": ein zusaetzliches Recht (GRANT ALL
// auf einer Stammdatentabelle) ist der gefaehrlichere Fall und faellt
// bei einer Mindestpruefung durch.
// `postgres` bleibt aussen vor — es ist Eigentuemer, seine Rechte sind
// Eigentum, keine Grants.
const grantIst = new Map<string, Map<string, Set<string>>>()
for (const [obj, rolle, recht] of sql(
  `SELECT table_name, grantee, privilege_type
   FROM information_schema.role_table_grants
   WHERE table_schema='nutrition' AND grantee <> 'postgres';`)) {
  if (!grantIst.has(obj)) grantIst.set(obj, new Map())
  const m = grantIst.get(obj)!
  if (!m.has(rolle)) m.set(rolle, new Set())
  m.get(rolle)!.add(recht)
}

let grantOk = 0, grantGeprueft = 0
function pruefeGrants(art: string, eintraege: Array<Record<string, any>>, vorhanden: Set<string>) {
  for (const e of eintraege) {
    if (!vorhanden.has(e.name)) continue          // Fehlen ist oben gemeldet
    if (!e.grants) continue
    grantGeprueft++
    let sauber = true
    const ist = grantIst.get(e.name) ?? new Map<string, Set<string>>()
    for (const [rolle, soll] of Object.entries(e.grants as Record<string, string[]>)) {
      const habe = ist.get(rolle) ?? new Set<string>()
      const fehlend = soll.filter(r => !habe.has(r))
      const zuviel = [...habe].filter(r => !soll.includes(r))
      if (fehlend.length) {
        sauber = false
        fehler.push(`GRANT: ${art} ${e.name} fehlt ${rolle}:${fehlend.join(',')}` +
          ` — die Anwendung kommt nicht heran (PostgREST prueft Grants vor RLS)` +
          ` — Herkunft ${e.grants_herkunft ?? e.schritt}`)
      }
      if (zuviel.length) {
        sauber = false
        fehler.push(`GRANT: ${art} ${e.name} hat ZU VIEL ${rolle}:${zuviel.join(',')}` +
          ` — Herkunft ${e.grants_herkunft ?? e.schritt}`)
      }
    }
    // Rollen, die ueberhaupt nicht vorgesehen sind.
    for (const rolle of ist.keys()) {
      if (!(rolle in (e.grants as Record<string, string[]>))) {
        sauber = false
        fehler.push(`GRANT: ${art} ${e.name} traegt Rechte fuer die nicht ` +
          `vorgesehene Rolle ${rolle} (${[...ist.get(rolle)!].join(',')})`)
      }
    }
    if (sauber) grantOk++
  }
}
pruefeGrants('Tabelle', SOLL.tabellen, istTabellen)
pruefeGrants('Sicht', SOLL.sichten, istSichten)
console.log(`GRANTs      ${grantOk}/${grantGeprueft} Objekte wie erwartet`)

// --- 7. Policy-BEDINGUNGEN, nicht nur ihre Existenz ---
// Nicht zeichengenau vergleichen: Postgres normalisiert den Ausdruck,
// und jede Umformulierung wuerde die Pruefung brechen. Geprueft wird
// die EIGENSCHAFT, auf die es ankommt:
//   oeffentlich   -> USING (true) ist richtig (Stammdaten)
//   eigene_zeilen -> die Bedingung MUSS auth.uid() nennen
//   admin         -> die Bedingung MUSS public.is_admin() nennen
const bedIst = new Map<string, string[]>()
for (const [tab, pol, using, check] of sql(
  `SELECT tablename, policyname, COALESCE(qual,''), COALESCE(with_check,'')
   FROM pg_policies WHERE schemaname='nutrition';`)) {
  if (!bedIst.has(tab)) bedIst.set(tab, [])
  bedIst.get(tab)!.push(`${pol}${using}${check}`)
}

let bedOk = 0, bedGeprueft = 0
for (const t of SOLL.tabellen) {
  if (!istTabellen.has(t.name)) continue
  const art = t.zeilenschutzart
  if (!art) continue
  bedGeprueft++
  let sauber = true
  for (const eintrag of bedIst.get(t.name) ?? []) {
    const [pol, using, check] = eintrag.split('')
    // INSERT-Policies tragen die Bedingung in with_check, nicht in qual.
    const ausdruck = (using + ' ' + check).trim()
    const leerOderWahr = ausdruck === '' || /^true$/i.test(ausdruck)
    // F-07: coach.hat_sicht(user_id, modul, stufe) prueft auth.uid()
    // IN der Funktion (152, eine Sichtregel an einer Stelle). Eine
    // Policy, die sie ruft, ist auf den angemeldeten Coach begrenzt —
    // sie faellt nicht unter "zeigt jedem alles".
    const nenntUid = /auth\.uid\(\)/.test(ausdruck) || /coach\.hat_sicht\(/.test(ausdruck)
    const nenntAdmin = /is_admin\(\)/.test(ausdruck)

    if (art === 'eigene_zeilen' && (leerOderWahr || !nenntUid)) {
      sauber = false
      fehler.push(`POLICY-BEDINGUNG: ${t.name}.${pol} fuehrt "nur eigene Zeilen", ` +
        `nennt aber kein auth.uid() — Bedingung "${ausdruck.slice(0, 40)}" ` +
        `zeigt jedem alles — Schritt ${t.schritt}`)
    } else if (art === 'admin' && !nenntAdmin) {
      sauber = false
      fehler.push(`POLICY-BEDINGUNG: ${t.name}.${pol} soll auf is_admin() pruefen, ` +
        `Bedingung ist "${ausdruck.slice(0, 40)}" — Schritt ${t.schritt}`)
    } else if (art === 'oeffentlich' && !leerOderWahr) {
      // Kein Fehler: enger als noetig schadet nicht. Aber es weicht von
      // der hinterlegten fachlichen Aussage ab und gehoert gemeldet.
      warnung.push(`POLICY-BEDINGUNG: ${t.name}.${pol} ist als "oeffentlich lesbar" ` +
        `gefuehrt, traegt aber die Bedingung "${ausdruck.slice(0, 40)}"`)
    }
  }
  if (sauber) bedOk++
}
console.log(`Policy-Bed. ${bedOk}/${bedGeprueft} Tabellen wie erwartet`)

// --- 5. Fremdschluessel namentlich ---
const fkIst = new Set(sql(
  `SELECT conname FROM pg_constraint
   WHERE contype='f' AND connamespace='nutrition'::regnamespace;`).map(r => r[0]))
let fkOk = 0
for (const f of SOLL.fremdschluessel) {
  if (fkIst.has(f.name)) fkOk++
  else fehler.push(`Fremdschluessel: ${f.name} (${f.tabelle} -> ${f.zeigt_auf}) FEHLT` +
    ` — erzeugt von Schritt ${f.schritt}`)
}
console.log(`Fremdschl.  ${fkOk}/${SOLL.fremdschluessel.length} vorhanden`)

// Mindestzeilen: eine Tabelle kann existieren und trotzdem leer sein.
console.log('')
console.log('Mindestzeilen:')
for (const [tab, min] of Object.entries(SOLL.mindestzeilen)) {
  if (tab.startsWith('_')) continue
  if (!istTabellen.has(tab)) continue          // Fehlen ist oben schon gemeldet
  const n = Number(sql(`SELECT count(*) FROM nutrition.${tab};`)[0][0])
  const ok = n >= (min as number)
  console.log(`  ${tab.padEnd(20)} ${String(n).padStart(7)} / ${String(min).padStart(7)}  ${ok ? 'ok' : 'ZU WENIG'}`)
  if (!ok) fehler.push(`Zeilen: nutrition.${tab} hat ${n}, erwartet mindestens ${min}`)
}

// C-43: Die Kette umfasst nicht mehr nur nutrition. Die zuvor fehlenden
// Schritte 100-105 erzeugen Training-Daten; ohne diese Zaehler koennte ein
// Kettenlauf die komplette Trainingsschicht verlieren und trotzdem gruen sein.
if (SOLL.mindestzeilen_schema) {
  for (const [qualified, min] of Object.entries(SOLL.mindestzeilen_schema)) {
    if (qualified.startsWith('_')) continue
    const [schema, table] = qualified.split('.')
    if (!schema || !table) {
      fehler.push(`Sollliste: mindestzeilen_schema enthaelt ungueltigen Namen ${qualified}`)
      continue
    }
    const exists = sql(
      `SELECT EXISTS (
         SELECT 1 FROM information_schema.tables
         WHERE table_schema='${schema.replace(/'/g, "''")}'
           AND table_name='${table.replace(/'/g, "''")}'
           AND table_type='BASE TABLE'
       )::text;`
    )[0]?.[0] === 'true'
    if (!exists) {
      console.log(`  ${qualified.padEnd(20)} ${String(0).padStart(7)} / ${String(min).padStart(7)}  FEHLT`)
      fehler.push(`Tabelle: ${qualified} FEHLT`)
      continue
    }
    const n = Number(sql(
      `SELECT count(*) FROM "${schema.replace(/"/g, '""')}"."${table.replace(/"/g, '""')}";`
    )[0][0])
    const ok = n >= (min as number)
    console.log(`  ${qualified.padEnd(20)} ${String(n).padStart(7)} / ${String(min).padStart(7)}  ${ok ? 'ok' : 'ZU WENIG'}`)
    if (!ok) fehler.push(`Zeilen: ${qualified} hat ${n}, erwartet mindestens ${min}`)
  }
}

// Inhaltliche Mindestqualitaet: Bei C-38 ging nicht die Tabelle verloren,
// sondern eine ganze Codefamilie innerhalb von food_nutrients. Die
// Zeilenzahl allein war zu grob und wurde danach sogar falsch als
// Sollwert uebernommen. Diese Pruefung haette den Verlust sofort gesehen.
if (SOLL.datenqualitaet?.food_nutrients && istTabellen.has('food_nutrients')) {
  const soll = SOLL.datenqualitaet.food_nutrients
  const codeIst = Number(sql(
    `SELECT count(DISTINCT nutrient_code) FROM nutrition.food_nutrients;`)[0][0])
  const codeSoll = Number(soll.distinct_nutrient_codes)
  const codeOk = codeIst === codeSoll
  console.log(`  ${'food_nutrients.codes'.padEnd(20)} ${String(codeIst).padStart(7)} / ${String(codeSoll).padStart(7)}  ${codeOk ? 'ok' : 'FALSCH'}`)
  if (!codeOk) {
    fehler.push(`Datenqualitaet: nutrition.food_nutrients hat ${codeIst} verschiedene ` +
      `Naehrstoffcodes, erwartet ${codeSoll}`)
  }

  const quellenIst = sql(
    `SELECT DISTINCT data_source FROM nutrition.food_nutrients ORDER BY data_source;`
  ).map(r => r[0])
  const quellenSoll = [...(soll.data_sources as string[])].sort()
  const quellenOk = quellenIst.length === quellenSoll.length &&
    quellenIst.every((q, i) => q === quellenSoll[i])
  console.log(`  ${'food_nutrients.sources'.padEnd(20)} ${String(quellenIst.length).padStart(7)} / ${String(quellenSoll.length).padStart(7)}  ${quellenOk ? 'ok' : 'FALSCH'}`)
  if (!quellenOk) {
    fehler.push(`Datenqualitaet: nutrition.food_nutrients data_source ist ` +
      `[${quellenIst.join(', ')}], erwartet [${quellenSoll.join(', ')}]`)
  }
}

// GO-00: Referenzwerte duerfen nur dann in Prozent umgerechnet werden,
// wenn ihre Einheit zur Bestandseinheit passt. C-45 pruefte Quelle und
// Codeabdeckung, aber nicht diese Vergleichbarkeit; Calcium-UL wurde
// dadurch als 2.5 g gegen mg-Bestand gelesen und ergab 32.000 %.
if (istTabellen.has('nutrient_reference_values') && istTabellen.has('nutrient_defs')) {
  const abweichungen = sql(
    `SELECT r.nutrient_code,
            r.reference_kind,
            r.unit,
            d.unit,
            r.basis,
            COALESCE(r.notes, '')
     FROM nutrition.nutrient_reference_values r
     JOIN nutrition.nutrient_defs d ON d.code = r.nutrient_code
     WHERE COALESCE(r.value_min, r.value_max) IS NOT NULL
       AND NOT (
         r.unit = d.unit
         OR (
           r.basis = 'per_day'
           AND (
             (r.unit = 'mg/day' AND d.unit = 'mg')
             OR (r.unit = 'g/day' AND d.unit = 'g')
           )
         )
         OR (
           r.basis IN ('per_kg_bw_per_day', 'energy_percent', 'per_mj')
           AND COALESCE(r.notes, '') LIKE '%GO-00%'
         )
       )
     ORDER BY r.nutrient_code, r.reference_kind, r.unit;`
  )
  console.log(`  ${'reference_units'.padEnd(20)} ${String(abweichungen.length).padStart(7)} unpassend`)
  if (abweichungen.length) {
    const beispiele = abweichungen.slice(0, 12).map(([code, kind, refUnit, defUnit, basis]) =>
      `${code}/${kind}: ${refUnit} vs ${defUnit} (${basis})`).join('; ')
    fehler.push(`Datenqualitaet: nutrition.nutrient_reference_values hat ` +
      `${abweichungen.length} Wertzeile(n), deren Einheit nicht zur ` +
      `nutrient_defs.unit passt und nicht als GO-00-Sonderbezug markiert ist` +
      ` — ${beispiele}${abweichungen.length > 12 ? '; …' : ''}`)
  }
}

// =============================================================
// Fremde Schemata (GO-03/GO-04)
// =============================================================
// Alles oben liest `nutrition`. [cmd] Ein neues Schema waere damit
// strukturell ungeprueft — Tabelle, Zeilenschutz, Policies und Grants
// koennten fehlen, ohne dass ein Kettenlauf sich beschwert. Das ist
// dieselbe Fehlerklasse, die C-43 aufgedeckt hat, nur eine Ebene
// hoeher: dort fehlten Schritte, hier faellt ein ganzes Schema aus dem
// Blickfeld.
if (Array.isArray(SOLL.fremde_schemata) && SOLL.fremde_schemata.length) {
  let fremdOk = 0
  const erwarteteFremdeTabellen = new Set<string>()
  const fremdeSchemaNamen = new Set<string>()
  for (const t of SOLL.fremde_schemata) {
    erwarteteFremdeTabellen.add(`${t.schema}.${t.name}`)
    fremdeSchemaNamen.add(t.schema)
  }

  if (fremdeSchemaNamen.size) {
    const schemaSql = [...fremdeSchemaNamen].map(s => `'${s}'`).join(',')
    for (const [voll] of sql(
      `SELECT table_schema||'.'||table_name
       FROM information_schema.tables
       WHERE table_type='BASE TABLE'
         AND table_schema IN (${schemaSql})
       ORDER BY 1;`)) {
      const name = voll.split('.').pop() ?? voll
      const bekannt =
        erwarteteFremdeTabellen.has(voll) ||
        SOLL.nicht_erwartet?.[voll] ||
        SOLL.nicht_erwartet?.[name]
      if (!bekannt) {
        fehler.push(`Tabelle: ${voll} steht da, aber NICHT in fremde_schemata` +
          ` — schema-sollstand.json ist unvollstaendig`)
      }
    }
  }

  for (const t of SOLL.fremde_schemata) {
    const voll = `${t.schema}.${t.name}`

    const daIst = sql(
      `SELECT EXISTS (SELECT 1 FROM information_schema.tables
         WHERE table_schema='${t.schema}' AND table_name='${t.name}'
           AND table_type='BASE TABLE')::text;`)[0]?.[0] === 'true'
    if (!daIst) {
      fehler.push(`Tabelle: ${voll} FEHLT — erzeugt von Schritt ${t.schritt}`)
      continue
    }

    // Zeilenschutz
    const rls = sql(
      `SELECT c.relrowsecurity::text FROM pg_class c
       JOIN pg_namespace n ON n.oid=c.relnamespace
       WHERE n.nspname='${t.schema}' AND c.relname='${t.name}';`)[0]?.[0]
    const rlsAn = rls === 'true' || rls === 't'
    if (rlsAn !== (t.rls === true)) {
      fehler.push(`Zeilenschutz: ${voll} hat rowsecurity=${rlsAn}, erwartet ${t.rls}` +
        ` — Schritt ${t.schritt}`)
      continue
    }

    // Policies je Operation — derselbe Massstab wie fuer nutrition.
    const polIst2 = new Set(sql(
      `SELECT cmd FROM pg_policies
       WHERE schemaname='${t.schema}' AND tablename='${t.name}';`).map(r => r[0]))
    if (t.rls && polIst2.size === 0) {
      fehler.push(`Policies: ${voll} hat Zeilenschutz, aber KEINE Policy` +
        ` — Tabelle ist gesperrt (ADR-0003) — Schritt ${t.schritt}`)
      continue
    }
    const polFehlt = (t.policies as string[]).filter(op => !polIst2.has(op))
    if (polFehlt.length) {
      fehler.push(`Policies: ${voll} fehlt ${polFehlt.join(', ')} — Schritt ${t.schritt}`)
      continue
    }

    // Grants, exakt wie bei nutrition.
    const grIst = new Map<string, Set<string>>()
    for (const [rolle, recht] of sql(
      `SELECT grantee, privilege_type FROM information_schema.role_table_grants
       WHERE table_schema='${t.schema}' AND table_name='${t.name}';`)) {
      if (!grIst.has(rolle)) grIst.set(rolle, new Set())
      grIst.get(rolle)!.add(recht)
    }
    let grOk = true
    for (const [rolle, soll] of Object.entries(t.grants as Record<string, string[]>)) {
      const ist = grIst.get(rolle) ?? new Set<string>()
      const fehlt = soll.filter(r => !ist.has(r))
      const zuviel = [...ist].filter(r => !soll.includes(r))
      if (fehlt.length) {
        fehler.push(`GRANT: ${voll} fehlt ${rolle} ${fehlt.join(', ')} — Schritt ${t.schritt}`)
        grOk = false
      }
      if (zuviel.length) {
        fehler.push(`GRANT: ${voll} hat ${rolle} ZU VIEL: ${zuviel.join(', ')}` +
          ` — Schritt ${t.schritt}`)
        grOk = false
      }
    }
    if (grOk) fremdOk++
  }
  console.log(`Fremde Tab. ${fremdOk}/${SOLL.fremde_schemata.length} vollstaendig`)
}

if (Array.isArray(SOLL.fremde_funktionen) && SOLL.fremde_funktionen.length) {
  let fnOk = 0
  for (const f of SOLL.fremde_funktionen) {
    const da = sql(
      `SELECT EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
         WHERE n.nspname='${f.schema}' AND p.proname='${f.name}')::text;`)[0]?.[0] === 'true'
    if (da) fnOk++
    else fehler.push(`Funktion: ${f.schema}.${f.name} FEHLT — Schritt ${f.schritt}`)
  }
  console.log(`Fremde Fkt. ${fnOk}/${SOLL.fremde_funktionen.length} vorhanden`)
}

console.log('')
if (warnung.length) {
  console.log('Hinweise:')
  for (const w of warnung) console.log('  · ' + w)
  console.log('')
}

if (fehler.length) {
  console.log('FEHLT:')
  for (const f of fehler) console.log('  · ' + f)
  console.log('')
  console.log(`SCHEMA UNVOLLSTAENDIG — ${fehler.length} Abweichung(en)`)
  process.exit(1)
}

console.log('SCHEMA VOLLSTAENDIG')
