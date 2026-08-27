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
const PROFILE = process.env.SCHEMA_CHECK_PROFILE === '1'
let sqlCall = 0

function sql(text: string): string[][] {
  const call = ++sqlCall
  const started = Date.now()
  const output = execFileSync('docker',
    ['exec', C, 'psql', '-U', 'postgres', '-d', DB, '-t', '-A', '-F', SEP, '-c', text],
    { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
  const elapsed = Date.now() - started
  if (PROFILE) {
    const label = text.replace(/\s+/g, ' ').trim().slice(0, 120)
    console.error(`PROFILE sql#${call} ${elapsed}ms ${label}`)
  }
  return output.split('\n').map(z => z.trimEnd()).filter(Boolean).map(z => z.split(SEP))
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

function lit(v: string): string {
  return `'${v.replace(/'/g, "''")}'`
}

function ident(v: string): string {
  return `"${v.replace(/"/g, '""')}"`
}

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
function pruefeSpalten(art: string, eintraege: any[], istObjekte: Set<string>, schema = 'nutrition'): number {
  let spaltenGeprueft = 0
  for (const s of eintraege) {
    const tableSchema = s.schema ?? schema
    const voll = s.schema ? `${s.schema}.${s.name}` : s.name
    if (!Array.isArray(s.spalten) || !istObjekte.has(voll)) continue
    spaltenGeprueft++
    const ist = sql(
      `SELECT column_name FROM information_schema.columns
       WHERE table_schema='${tableSchema}' AND table_name='${s.name}'
       ORDER BY ordinal_position;`).map(r => r[0])
    const fehlend = s.spalten.filter((c: string) => !ist.includes(c))
    const zuviel = ist.filter(c => !s.spalten.includes(c))
    if (fehlend.length) {
      fehler.push(`${art} ${voll}: ${fehlend.length} Spalten FEHLEN` +
      ` (${fehlend.slice(0, 6).join(', ')}${fehlend.length > 6 ? ' …' : ''})` +
      ` — Schritt ${s.schritt}`)
    }
    if (zuviel.length) {
      fehler.push(`${art} ${voll}: ${zuviel.length} Spalten stehen da,` +
      ` aber nicht im Sollstand (${zuviel.slice(0, 6).join(', ')}` +
      `${zuviel.length > 6 ? ' …' : ''}) — Liste veraltet?`)
    }
    if (!fehlend.length && !zuviel.length &&
      s.spalten.join('|') !== ist.join('|')) {
      fehler.push(`${art} ${voll}: Spalten vollstaendig, aber in anderer` +
      ` Reihenfolge — bei gepflegter Spaltenliste ist die Reihenfolge Teil des Vertrags`)
    }
  }
  return spaltenGeprueft
}
const tabellenSpaltenGeprueft = pruefeSpalten('Tabelle', SOLL.tabellen, istTabellen)
const sichtSpaltenGeprueft = pruefeSpalten('Sicht', SOLL.sichten, istSichten)
const fremdeSpaltenGeprueft = Array.isArray(SOLL.fremde_schemata)
  ? pruefeSpalten(
    'Tabelle',
    SOLL.fremde_schemata,
    new Set(SOLL.fremde_schemata.map((s: any) => `${s.schema}.${s.name}`)),
  )
  : 0
const fremdeSichtSpaltenGeprueft = Array.isArray(SOLL.fremde_sichten)
  ? pruefeSpalten(
    'Sicht',
    SOLL.fremde_sichten,
    new Set(SOLL.fremde_sichten.map((s: any) => `${s.schema}.${s.name}`)),
  )
  : 0
console.log(`Tabellensp.  ${tabellenSpaltenGeprueft + fremdeSpaltenGeprueft} Tabelle(n) mit Spaltenliste geprueft`)
console.log(`Sichtspalten ${sichtSpaltenGeprueft + fremdeSichtSpaltenGeprueft} Sicht(en) mit Spaltenliste geprueft`)

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
  `SELECT tablename, policyname,
          regexp_replace(COALESCE(qual,''), '[[:space:]]+', ' ', 'g'),
          regexp_replace(COALESCE(with_check,''), '[[:space:]]+', ' ', 'g')
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
const fkIst = new Set<string>()
for (const [schema, name] of sql(
  `SELECT n.nspname, c.conname
   FROM pg_constraint c
   JOIN pg_namespace n ON n.oid = c.connamespace
   WHERE c.contype='f'
     AND n.nspname NOT LIKE 'pg_%'
     AND n.nspname <> 'information_schema';`)) {
  fkIst.add(name)
  fkIst.add(`${schema}.${name}`)
}
let fkOk = 0
for (const f of SOLL.fremdschluessel) {
  const key = f.schema ? `${f.schema}.${f.name}` : f.name
  if (fkIst.has(key)) fkOk++
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
  const mindestzeilenSchema = Object.entries(SOLL.mindestzeilen_schema)
  const vorhandeneSchemaTabellen = new Set(sql(
    `SELECT table_schema||'.'||table_name
     FROM information_schema.tables
     WHERE table_type='BASE TABLE';`
  ).map(r => r[0]))
  const zaehlbareSchemaTabellen = mindestzeilenSchema.filter(([qualified]) => vorhandeneSchemaTabellen.has(qualified))
  const schemaZeilen = new Map<string, number>()
  if (zaehlbareSchemaTabellen.length) {
    const counts = zaehlbareSchemaTabellen.map(([qualified]) => {
      const [schema, table] = qualified.split('.')
      return `SELECT ${lit(qualified)} AS key, count(*)::text AS value FROM ${ident(schema)}.${ident(table)}`
    }).join(' UNION ALL ')
    for (const [qualified, count] of sql(counts)) schemaZeilen.set(qualified, Number(count))
  }
  for (const [qualified, min] of mindestzeilenSchema) {
    if (qualified.startsWith('_')) continue
    const [schema, table] = qualified.split('.')
    if (!schema || !table) {
      fehler.push(`Sollliste: mindestzeilen_schema enthaelt ungueltigen Namen ${qualified}`)
      continue
    }
    if (!vorhandeneSchemaTabellen.has(qualified)) {
      console.log(`  ${qualified.padEnd(20)} ${String(0).padStart(7)} / ${String(min).padStart(7)}  FEHLT`)
      fehler.push(`Tabelle: ${qualified} FEHLT`)
      continue
    }
    const n = schemaZeilen.get(qualified) ?? 0
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

// C-292: Die Medikamenten-Zeilenzahl belegt weder CAS/ATC noch die drei
// additiven Evidenzfelder. Die Mindestwerte stehen ausserhalb der Datenbank,
// damit ein uebersprungener Enrichment-Schritt im Abschlusspruefer auffaellt.
if (SOLL.datenqualitaet?.medical_medication_wave1) {
  const soll = SOLL.datenqualitaet.medical_medication_wave1
  const [cas, atc, mechanism, precautions, identifiers, mechanismRecords, precautionRecords] = sql(`
    SELECT
      count(*) FILTER (WHERE NULLIF(btrim(cas_number), '') IS NOT NULL),
      count(*) FILTER (WHERE NULLIF(btrim(atc_code), '') IS NOT NULL),
      count(*) FILTER (WHERE NULLIF(btrim(pharmacology->>'mechanism_of_action'), '') IS NOT NULL),
      count(*) FILTER (WHERE precautions <> '{}'::jsonb AND precautions <> '[]'::jsonb AND precautions <> 'null'::jsonb),
      COALESCE(sum(jsonb_array_length(COALESCE(evidence_provenance->'c292_identifiers', '[]'::jsonb))), 0),
      count(*) FILTER (WHERE evidence_provenance ? 'c292_mechanism_of_action'),
      count(*) FILTER (WHERE evidence_provenance ? 'c292_precautions')
    FROM medical.medication_active_substances;
  `)[0].map(Number)
  const checks: [string, number, number][] = [
    ['medical.cas_number', cas, Number(soll.cas_number)],
    ['medical.atc_code', atc, Number(soll.atc_code)],
    ['medical.mechanism_of_action', mechanism, Number(soll.mechanism_of_action)],
    ['medical.precautions', precautions, Number(soll.precautions)],
    ['medical.identifier_records', identifiers, Number(soll.identifier_records)],
    ['medical.mechanism_records', mechanismRecords, Number(soll.mechanism_records)],
    ['medical.precaution_records', precautionRecords, Number(soll.precaution_records)],
  ]
  for (const [name, actual, minimum] of checks) {
    const ok = actual >= minimum
    console.log(`  ${name.padEnd(31)} ${String(actual).padStart(7)} / ${String(minimum).padStart(7)}  ${ok ? 'ok' : 'ZU WENIG'}`)
    if (!ok) fehler.push(`Datenqualitaet: ${name} hat ${actual}, erwartet mindestens ${minimum}`)
  }

  const missingReasonErrors = Number(sql(`
    SELECT count(*)
    FROM medical.medication_active_substances substance
    CROSS JOIN LATERAL jsonb_array_elements(COALESCE(substance.evidence_provenance->'c292_identifiers', '[]'::jsonb)) AS identifier(record)
    WHERE NULLIF(btrim(identifier.record->>'cas'), '') IS NULL
      AND NULLIF(btrim(identifier.record->>'atc'), '') IS NULL
      AND NULLIF(btrim(identifier.record->>'missing_reason'), '') IS NULL;
  `)[0][0])
  console.log(`  ${'medical.identifier_missing_reason'.padEnd(31)} ${String(missingReasonErrors).padStart(7)} /       0  ${missingReasonErrors === 0 ? 'ok' : 'FALSCH'}`)
  if (missingReasonErrors !== 0) {
    fehler.push(`Datenqualitaet: ${missingReasonErrors} leere C-292-Identifier ohne missing_reason`)
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

  const schemaSql = [...fremdeSchemaNamen].map(s => lit(s)).join(',')
  const fremdeTabellenIst = new Set(sql(
    `SELECT table_schema||'.'||table_name
     FROM information_schema.tables
     WHERE table_type='BASE TABLE' AND table_schema IN (${schemaSql});`
  ).map(r => r[0]))
  const fremdeRlsIst = new Map(sql(
    `SELECT n.nspname||'.'||c.relname, c.relrowsecurity::text
     FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
     WHERE c.relkind='r' AND n.nspname IN (${schemaSql});`
  ))
  const fremdePoliciesIst = new Map<string, Set<string>>()
  for (const [voll, cmd] of sql(
    `SELECT schemaname||'.'||tablename, cmd
     FROM pg_policies WHERE schemaname IN (${schemaSql});`
  )) {
    if (!fremdePoliciesIst.has(voll)) fremdePoliciesIst.set(voll, new Set())
    fremdePoliciesIst.get(voll)!.add(cmd)
  }
  const fremdeGrantsIst = new Map<string, Map<string, Set<string>>>()
  for (const [voll, rolle, recht] of sql(
    `SELECT table_schema||'.'||table_name, grantee, privilege_type
     FROM information_schema.role_table_grants
     WHERE table_schema IN (${schemaSql}) AND grantee <> 'postgres';`
  )) {
    if (!fremdeGrantsIst.has(voll)) fremdeGrantsIst.set(voll, new Map())
    const proTabelle = fremdeGrantsIst.get(voll)!
    if (!proTabelle.has(rolle)) proTabelle.set(rolle, new Set())
    proTabelle.get(rolle)!.add(recht)
  }

  if (fremdeSchemaNamen.size) {
    for (const voll of fremdeTabellenIst) {
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

    if (!fremdeTabellenIst.has(voll)) {
      fehler.push(`Tabelle: ${voll} FEHLT — erzeugt von Schritt ${t.schritt}`)
      continue
    }

    // Zeilenschutz
    const rls = fremdeRlsIst.get(voll)
    const rlsAn = rls === 'true' || rls === 't'
    if (rlsAn !== (t.rls === true)) {
      fehler.push(`Zeilenschutz: ${voll} hat rowsecurity=${rlsAn}, erwartet ${t.rls}` +
        ` — Schritt ${t.schritt}`)
      continue
    }

    // Policies je Operation — derselbe Massstab wie fuer nutrition.
    const polIst2 = fremdePoliciesIst.get(voll) ?? new Set<string>()
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
    const grIst = fremdeGrantsIst.get(voll) ?? new Map<string, Set<string>>()
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

if (Array.isArray(SOLL.fremde_sichten) && SOLL.fremde_sichten.length) {
  let fremdeSichtenOk = 0
  for (const v of SOLL.fremde_sichten) {
    const voll = `${v.schema}.${v.name}`
    let sauber = true

    const daIst = sql(
      `SELECT EXISTS (SELECT 1 FROM information_schema.tables
         WHERE table_schema=${lit(v.schema)}
           AND table_name=${lit(v.name)}
           AND table_type='VIEW')::text;`)[0]?.[0] === 'true'
    if (!daIst) {
      fehler.push(`Sicht: ${voll} FEHLT - erzeugt von Schritt ${v.schritt}`)
      continue
    }

    const reloptions = sql(
      `SELECT COALESCE(array_to_string(c.reloptions, ','), '')
       FROM pg_class c
       JOIN pg_namespace n ON n.oid = c.relnamespace
       WHERE n.nspname=${lit(v.schema)}
         AND c.relname=${lit(v.name)}
         AND c.relkind='v';`)[0]?.[0] ?? ''
    const hatInvoker = reloptions.includes('security_invoker=true')
    const hatBarrier = reloptions.includes('security_barrier=true')
    if (hatInvoker !== (v.security_invoker === true)) {
      fehler.push(`Sicht ${voll}: security_invoker=${hatInvoker}, erwartet ${v.security_invoker} - Schritt ${v.schritt}`)
      sauber = false
    }
    if (hatBarrier !== (v.security_barrier === true)) {
      fehler.push(`Sicht ${voll}: security_barrier=${hatBarrier}, erwartet ${v.security_barrier} - Schritt ${v.schritt}`)
      sauber = false
    }

    const grIst = new Map<string, Set<string>>()
    for (const [rolle, recht] of sql(
      `SELECT grantee, privilege_type
       FROM information_schema.role_table_grants
       WHERE table_schema=${lit(v.schema)}
         AND table_name=${lit(v.name)}
         AND grantee <> 'postgres';`)) {
      if (!grIst.has(rolle)) grIst.set(rolle, new Set())
      grIst.get(rolle)!.add(recht)
    }
    for (const [rolle, soll] of Object.entries(v.grants as Record<string, string[]>)) {
      const ist = grIst.get(rolle) ?? new Set<string>()
      const fehlt = soll.filter(r => !ist.has(r))
      const zuviel = [...ist].filter(r => !soll.includes(r))
      if (fehlt.length) {
        fehler.push(`GRANT: Sicht ${voll} fehlt ${rolle} ${fehlt.join(', ')} - Schritt ${v.schritt}`)
        sauber = false
      }
      if (zuviel.length) {
        fehler.push(`GRANT: Sicht ${voll} hat ${rolle} ZU VIEL: ${zuviel.join(', ')} - Schritt ${v.schritt}`)
        sauber = false
      }
    }
    for (const rolle of grIst.keys()) {
      if (!(rolle in (v.grants as Record<string, string[]>))) {
        fehler.push(`GRANT: Sicht ${voll} traegt Rechte fuer die nicht vorgesehene Rolle ${rolle}`)
        sauber = false
      }
    }

    const spalten = sql(
      `SELECT column_name
       FROM information_schema.columns
       WHERE table_schema=${lit(v.schema)}
         AND table_name=${lit(v.name)}
       ORDER BY ordinal_position;`).map(r => r[0])
    const verboten = (v.verbotene_spalten ?? []).filter((c: string) => spalten.includes(c))
    if (verboten.length) {
      fehler.push(`Sicht ${voll}: verbotene Spalten ${verboten.join(', ')} - Schritt ${v.schritt}`)
      sauber = false
    }

    const definition = sql(
      `SELECT pg_get_viewdef(c.oid)
       FROM pg_class c
       JOIN pg_namespace n ON n.oid = c.relnamespace
       WHERE n.nspname=${lit(v.schema)}
         AND c.relname=${lit(v.name)}
         AND c.relkind='v';`)[0]?.[0] ?? ''
    const verboteneDefinition = (v.verbotene_viewdef ?? [])
      .filter((token: string) => definition.includes(token))
    if (verboteneDefinition.length) {
      fehler.push(`Sicht ${voll}: View-Definition liest verbotene Felder ${verboteneDefinition.join(', ')} - Schritt ${v.schritt}`)
      sauber = false
    }

    if (Number.isFinite(v.zeilen_min) || Number.isFinite(v.zeilen_max)) {
      const count = Number(sql(
        `SELECT count(*) FROM ${ident(v.schema)}.${ident(v.name)};`)[0]?.[0] ?? '0')
      if (Number.isFinite(v.zeilen_min) && count < v.zeilen_min) {
        fehler.push(`Sicht ${voll}: ${count} Zeilen, erwartet mindestens ${v.zeilen_min} - Schritt ${v.schritt}`)
        sauber = false
      }
      if (Number.isFinite(v.zeilen_max) && count > v.zeilen_max) {
        fehler.push(`Sicht ${voll}: ${count} Zeilen, erwartet hoechstens ${v.zeilen_max} - Schritt ${v.schritt}`)
        sauber = false
      }
    }

    if (sauber) fremdeSichtenOk++
  }
  console.log(`Fremde Sicht ${fremdeSichtenOk}/${SOLL.fremde_sichten.length} vollstaendig`)
}

if (Array.isArray(SOLL.fremde_funktionen) && SOLL.fremde_funktionen.length) {
  const funktionsSchemata = [...new Set(SOLL.fremde_funktionen.map((f: any) => f.schema))]
  const fremdeFunktionenIst = new Set(sql(
    `SELECT n.nspname||'.'||p.proname
     FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
     WHERE n.nspname IN (${funktionsSchemata.map(lit).join(',')});`
  ).map(r => r[0]))
  let fnOk = 0
  for (const f of SOLL.fremde_funktionen) {
    const da = fremdeFunktionenIst.has(`${f.schema}.${f.name}`)
    if (da) fnOk++
    else fehler.push(`Funktion: ${f.schema}.${f.name} FEHLT — Schritt ${f.schritt}`)
  }
  console.log(`Fremde Fkt. ${fnOk}/${SOLL.fremde_funktionen.length} vorhanden`)
}

const biomarkerMultiSlug = Number(sql(
  `SELECT count(*)
   FROM (
     SELECT loinc_code
     FROM medical.biomarker_reference_ranges
     WHERE NULLIF(loinc_code, '') IS NOT NULL
     GROUP BY loinc_code
     HAVING count(DISTINCT curated_slug) > 1
   ) d;`)[0]?.[0] ?? '0')
if (biomarkerMultiSlug !== 0) {
  fehler.push(`Medical: ${biomarkerMultiSlug} LOINC-Codes tragen mehrere curated_slug — C-248`)
}
console.log(`Medical LOINC-Slug-Eindeutigkeit ${biomarkerMultiSlug === 0 ? '0 Abweichungen' : biomarkerMultiSlug + ' Abweichung(en)'}`)

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
