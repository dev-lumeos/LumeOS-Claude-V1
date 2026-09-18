import fs from 'node:fs'
import path from 'node:path'

const migrationDir = path.resolve('supabase/migrations')
const baselineTriggerException = {
  file: '20260805120000_baseline_structure.sql',
  functionName: 'public.handle_new_user',
  command: 'INSERT',
  // Der Auth-Trigger legt beim Anlegen eines Auth-Users genau das zugehoerige
  // Profil an. Das ist Strukturverhalten, kein Katalog-Backfill.
  requiredSql: 'INSERT INTO public.profiles (id)',
}
const structuralFunctionExceptions = [
  baselineTriggerException,
  {
    file: '20260913001900_c489_produktname_name_en.sql',
    functionName: 'supplements.create_supplier_product',
    command: 'INSERT',
    count: 4,
    // C-489 benennt die Spalte eines bestehenden Service-Role-Schreibwegs
    // um. Sein Funktionskoerper schreibt nur bei einem spaeteren RPC-Aufruf,
    // nicht beim Einspielen der Migration, keine Katalogdaten.
    requiredSql: 'INSERT INTO supplements.supplier_products(supplier_id,name_en',
  },
  {
    file: '20260915004916_c497_supplier_product_preferences.sql',
    functionName: 'supplements.supplier_product_preference_write',
    commands: ['DELETE', 'INSERT'],
    // C-497 definiert den authenticated-only RPC-Schreibweg. Er fuehrt beim
    // Einspielen keine Datenoperation aus; die bestehende RLS entscheidet
    // erst beim spaeteren Nutzeraufruf ueber die eigene Vorliebe.
    requiredSql: [
      'DELETE FROM nutrition.food_preference_items',
      'INSERT INTO nutrition.food_preference_items',
    ],
  },
  {
    file: '20260915142000_c498_global_allergies.sql',
    functionName: 'coach.log_allergy_permission_change',
    command: 'INSERT',
    // C-498 definiert nur einen AFTER-Trigger fuer kuenftige
    // Freigabeaenderungen; beim Migrationseinspielen wird kein Log erzeugt.
    requiredSql: 'INSERT INTO coach.allergy_permission_change_log',
  },
  {
    file: '20260916160500_c504_supplier_product_database_filters.sql',
    functionName: 'supplements.supplier_product_filter_preferences_write',
    command: 'INSERT',
    // C-504 definiert den ownergebundenen RPC fuer eine einzelne
    // Anzeigeeinstellung. Das INSERT liegt im Funktionskoerper, wird beim
    // Einspielen nicht ausgefuehrt und schreibt weder Katalog- noch Seed-Daten.
    requiredSql: 'INSERT INTO public.user_display_preferences',
  },
  {
    file: '20260917100000_c511_supplement_preferences.sql',
    functionName: 'supplements.supplement_preferences_write',
    commands: ['INSERT', 'UPDATE'],
    // C-511 definiert den authenticated-only Schreibweg fuer genau eine
    // eigene Vorliebenzeile. Das INSERT liegt im RPC-Koerper, laeuft nicht
    // beim Einspielen und schreibt weder Katalog- noch Seed-Daten.
    requiredSql: [
      'INSERT INTO supplements.supplement_preferences',
      'UPDATE supplements.supplement_preferences',
    ],
  },
  {
    file: '20260917143500_c513_supplement_product_meals.sql',
    functionName: 'nutrition.add_supplement_product_to_meal',
    command: 'INSERT',
    // C-513 definiert den RLS-gebundenen Schreibweg für eine eigene
    // Mahlzeitenposition. Der Snapshot wird erst beim späteren Nutzeraufruf
    // erzeugt; beim Einspielen schreibt die Migration keine Katalogdaten.
    requiredSql: 'INSERT INTO nutrition.meal_items',
  },
]
// Im Funktionskoerper zaehlt nur der Anfang einer ausfuehrbaren SQL-Anweisung.
// `FOR UPDATE` sperrt, schreibt aber nicht; ebenso ist `ON DELETE` Teil einer
// Fremdschluesseldefinition. Beide duerfen keinen Befund erzeugen.
const dataCommands = /(?:^|;|\b(?:begin|then|else|loop)\b)\s*(?:with\b[\s\S]*?\b)?(insert|update|copy|delete|truncate|merge)\b/gi

// C-472, gemessen am 2026-09-12: 44 ausfuehrbare Datenoperationen in 15
// bereits committeten Migrationen C-428 bis C-467. Diese Altlast bleibt
// sichtbar, aber blockiert die Kette nicht mehr dauerhaft. Wie im
// Sollstand von `punkte-pruefen.mjs` ist jede Abweichung in beide Richtungen
// rot: mehr waere neue Datenlogik, weniger verlangt eine bewusste
// Nachmessung statt eines stillen Freipasses.
const SOLLSTAND = 44

function ohneKommentareUndStrings(sql) {
  let out = ''
  for (let i = 0; i < sql.length;) {
    if (sql.startsWith('--', i)) {
      const end = sql.indexOf('\n', i)
      i = end === -1 ? sql.length : end
    } else if (sql.startsWith('/*', i)) {
      const end = sql.indexOf('*/', i + 2)
      i = end === -1 ? sql.length : end + 2
    } else if (sql[i] === "'") {
      i++
      while (i < sql.length) {
        if (sql[i] === "'" && sql[i + 1] === "'") i += 2
        else if (sql[i++] === "'") break
      }
      out += ' '
    } else if (sql[i] === '"') {
      i++
      while (i < sql.length) {
        if (sql[i] === '"' && sql[i + 1] === '"') i += 2
        else if (sql[i++] === '"') break
      }
      out += ' '
    } else if (sql[i] === '$') {
      const tag = sql.slice(i).match(/^\$[A-Za-z_0-9]*\$/)?.[0]
      if (tag) {
        const end = sql.indexOf(tag, i + tag.length)
        i = end === -1 ? sql.length : end + tag.length
        out += ' '
      } else out += sql[i++]
    } else out += sql[i++]
  }
  return out
}

function commandsInStatement(sql) {
  return ohneKommentareUndStrings(sql)
    .split(';')
    .flatMap((statement) => {
      const match = statement.match(/^\s*(?:with\b[\s\S]*?\b)?(insert|update|copy|delete|truncate|merge)\b/i)
      return match ? [match[1].toUpperCase()] : []
    })
}

function commandsInDollarBlocks(sql, file) {
  const blocks = []
  const pattern = /\$([A-Za-z_0-9]*)\$([\s\S]*?)\$\1\$/g
  for (const match of sql.matchAll(pattern)) {
    const body = match[2]
    const prefix = sql.slice(Math.max(0, (match.index ?? 0) - 500), match.index)
    const sanitizedBody = ohneKommentareUndStrings(body)
    const commands = [...sanitizedBody.matchAll(dataCommands)]
      .map((entry) => entry[1].toUpperCase())
    if (!commands.length) continue

    const structuralException = structuralFunctionExceptions.some((exception) => {
      const expectedCommands = exception.commands ?? Array(exception.count ?? 1).fill(exception.command)
      const requiredSql = Array.isArray(exception.requiredSql) ? exception.requiredSql : [exception.requiredSql]
      return file === exception.file &&
        new RegExp(`CREATE (OR REPLACE )?FUNCTION ${exception.functionName.replace('.', '\\.')}`, 'i').test(prefix) &&
        commands.length === expectedCommands.length &&
        commands.every((command, index) => command === expectedCommands[index]) &&
        requiredSql.every((fragment) => sanitizedBody.includes(fragment))
    })
    if (!structuralException) blocks.push(...commands)
  }
  return blocks
}

function findingsInFile(file, sql) {
  return [
    ...commandsInStatement(sql),
    ...commandsInDollarBlocks(sql, file),
  ].map((command) => `${file}: ${command}`)
}

function findingsInDirectory() {
  return fs.readdirSync(migrationDir)
    .filter((file) => file.endsWith('.sql'))
    .flatMap((file) => findingsInFile(file, fs.readFileSync(path.join(migrationDir, file), 'utf8')))
}

function selfTest() {
  const probes = [
    ['insert', 'INSERT INTO c291_probe VALUES (1);', 1],
    ['update', 'UPDATE c291_probe SET value = 1;', 1],
    ['copy', 'COPY c291_probe FROM STDIN;', 1],
    ['delete', 'DELETE FROM c291_probe;', 1],
    ['truncate', 'TRUNCATE c291_probe;', 1],
    ['merge', 'MERGE INTO c291_probe AS target USING c291_source AS source ON false WHEN NOT MATCHED THEN INSERT VALUES (1);', 1],
    ['do_insert', 'DO $$ BEGIN INSERT INTO c291_probe VALUES (1); END $$;', 1],
    ['do_for_update', 'DO $$ BEGIN PERFORM 1 FROM c291_probe FOR UPDATE; END $$;', 0],
    ['alter', 'ALTER TABLE c291_probe ADD COLUMN c291_marker text;', 0],
  ]

  const existing = findingsInDirectory()
  if (existing.length !== SOLLSTAND) {
    throw new Error(`Selbstprobe braucht ${SOLLSTAND} Altbefunde, gemessen: ${existing.length}`)
  }

  for (const [name, sql, expected] of probes) {
    const file = `9999999999_c291_${name}.sql`
    const target = path.join(migrationDir, file)
    fs.writeFileSync(target, sql, { encoding: 'utf8', flag: 'wx' })
    try {
      const findings = findingsInDirectory()
      const probeFindings = findings.filter((finding) => finding.startsWith(`${file}:`))
      if (findings.length !== SOLLSTAND + expected || probeFindings.length !== expected) {
        throw new Error(`${name}: ${findings.length} Meldungen, erwartet ${SOLLSTAND + expected} (${probeFindings.join(', ')})`)
      }
      console.log(`[migration-datenlogik] Selbstprobe ${name}: ${probeFindings.length} neue Meldung(en)`)
    } finally {
      fs.unlinkSync(target)
    }
  }
  console.log('[migration-datenlogik] Selbstprobe erfolgreich; temporaere Migrationen entfernt.')
}

if (process.argv.includes('--self-test')) {
  selfTest()
  process.exit(0)
}

const findings = findingsInDirectory()
if (findings.length !== SOLLSTAND) {
  console.error(`Migrationen duerfen keine neue Datenlogik enthalten (Soll ${SOLLSTAND}, Ist ${findings.length}):`)
  for (const finding of findings) console.error(`- ${finding}`)
  if (findings.length > SOLLSTAND) {
    console.error(`Neue Befunde: ${findings.length - SOLLSTAND}.`)
  } else {
    console.error(`Altbestand gesunken: ${SOLLSTAND - findings.length}. Sollstand nachmessen und mit Begruendung nachziehen.`)
  }
  process.exit(1)
}

console.log(`Migrationen: ${findings.length} historische Datenoperationen, genau Sollstand ${SOLLSTAND}; keine neue Datenlogik.`)
console.log('Benannte Strukturausnahme: 20260805120000_baseline_structure.sql public.handle_new_user().')
