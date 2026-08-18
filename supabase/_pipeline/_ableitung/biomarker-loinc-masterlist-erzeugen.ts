#!/usr/bin/env node
// C-70b: split the LOINC-derived biomarker masterlist into files below the
// repository size limit. This script requires the local LOINC 2.82 source
// folder; the source archive itself is not committed.
import fs from 'node:fs'
import path from 'node:path'

type CsvTable = {
  rows: string[][]
  header: string[]
  index: Record<string, number>
  get: (row: string[], column: string) => string
}

type LoincRecord = {
  loinc_code: string
  status: string
  common_test_rank: number
  class_type: number
  class_type_name: string | null
  class: string | null
  panel_type: string | null
  order_observation: string | null
  names: {
    component: string | null
    long_common_name: string | null
    short_name: string | null
    display_name: string | null
    consumer_name: string | null
    german: {
      component: string | null
      long_name: string | null
      display_name: string | null
      class_name: string | null
    } | null
  }
  units: {
    example_units: string | null
    example_ucum_units: string | null
    units_required: string | null
  }
  method: string | null
  property: string | null
  time_aspect: string | null
  system: string | null
  scale: string | null
  definition: string | null
  synonyms: { loinc_related_names: string[] }
  panels: Array<{
    parent_loinc: string | null
    parent_name: string | null
    sequence: number | null
    display_name: string | null
    required: string | null
    category: string | null
    external_copyright_notice: string | null
  }>
  external_copyright_notice: string | null
  reference_ranges: {
    status: 'not_in_loinc'
    note: string
  }
  source: {
    system: 'LOINC'
    version: '2.82'
    source_file: string
  }
}

type Bucket = {
  slug: string
  title: string
  classes: string[]
  records: LoincRecord[]
}

const SOURCE_ROOT = 'docs/ssot/daten/Loinc_2.82'
const OUTPUT_ROOT = 'supabase/_pipeline/daten/biomarker-loinc'
const OLD_SINGLE_FILE = 'supabase/_pipeline/daten/biomarker-loinc-masterlist.json'
const LOINC_TABLE = path.join(SOURCE_ROOT, 'LoincTable/Loinc.csv')
const PANELS = path.join(SOURCE_ROOT, 'AccessoryFiles/PanelsAndForms/PanelsAndForms.csv')
const GERMAN_VARIANT = path.join(SOURCE_ROOT, 'AccessoryFiles/LinguisticVariants/deDE15LinguisticVariant.csv')
const CONSUMER_NAMES = path.join(SOURCE_ROOT, 'AccessoryFiles/ConsumerName/ConsumerName.csv')
const LICENSE = path.join(SOURCE_ROOT, 'LoincLicense_5.8.txt')

const LICENSE_NOTICE =
  'This material contains content from LOINC (http://loinc.org). LOINC is copyright (c) Regenstrief Institute, Inc. and the Logical Observation Identifiers Names and Codes (LOINC) Committee and is available at no cost under the license at http://loinc.org/license. LOINC is a registered United States trademark of Regenstrief Institute, Inc.'

const BAD_CLASS_SEGMENTS = new Set([
  'ABXBACT',
  'ADMIN',
  'ALLERGY',
  'CYTO',
  'CLINTRIAL',
  'DENTAL',
  'DEVICES',
  'DICOM',
  'DOC',
  'EYE',
  'GENETICS',
  'HL7',
  'HLA',
  'IEEE ROSETTA',
  'LABORDERS',
  'MEDS',
  'MICRO',
  'MOLPATH',
  'NEMSIS',
  'NIH',
  'PATH',
  'PATIENT SAFETY',
  'PHENX',
  'PUBLICHEALTH',
  'RAD',
  'SURVEY',
  'VACCIN',
])

const BUCKET_RULES: Array<{ slug: string; title: string; matches: (className: string) => boolean }> = [
  { slug: 'chemistry', title: 'Clinical chemistry', matches: className => className === 'CHEM' },
  {
    slug: 'drug-toxicology',
    title: 'Drug monitoring and toxicology',
    matches: className => className === 'DRUG/TOX' || className === 'DRUGDOSE' || className.startsWith('PANEL.DRUG/TOX'),
  },
  {
    slug: 'hematology-coagulation',
    title: 'Hematology, blood bank and coagulation',
    matches: className =>
      className === 'HEM/BC' ||
      className === 'COAG' ||
      className === 'BLDBK' ||
      className.startsWith('PANEL.HEM/BC') ||
      className.startsWith('PANEL.COAG') ||
      className.startsWith('PANEL.BLDBK'),
  },
  {
    slug: 'serology-cellmarkers',
    title: 'Serology and cell markers',
    matches: className =>
      className === 'SERO' ||
      className === 'CELLMARK' ||
      className === 'HPA' ||
      className.startsWith('PANEL.SERO') ||
      className.startsWith('PANEL.CELLMARK'),
  },
  {
    slug: 'challenge-fertility',
    title: 'Challenge tests, fertility and endocrine procedures',
    matches: className =>
      className === 'CHAL' ||
      className.startsWith('CHAL') ||
      className === 'FERT' ||
      className === 'ENDO.GI' ||
      className === 'OBGYN' ||
      className.startsWith('PANEL.CHAL') ||
      className.startsWith('PANEL.FERT'),
  },
  {
    slug: 'urine-specimen',
    title: 'Urinalysis, specimen and miscellaneous lab',
    matches: className =>
      className === 'UA' ||
      className === 'SPEC' ||
      className === 'MISC' ||
      className.startsWith('PANEL.UA') ||
      className.startsWith('PANEL.SPEC') ||
      className.startsWith('PANEL.MISC'),
  },
  {
    slug: 'vitals-clinical',
    title: 'Vitals and clinical observations',
    matches: className =>
      className.startsWith('BDYTMP') ||
      className.startsWith('BP') ||
      className.startsWith('HRTRATE') ||
      className.startsWith('BDYWGT') ||
      className.startsWith('BDYHGT') ||
      className.startsWith('BDYCRC') ||
      className.startsWith('BDYSURF') ||
      className.startsWith('HEMODYN') ||
      className.startsWith('EKG') ||
      className.startsWith('RESP') ||
      className === 'PULM' ||
      className.startsWith('PANEL.PULM') ||
      className.startsWith('CARD') ||
      className === 'CARDIO-PULM' ||
      className.startsWith('IO_') ||
      className.startsWith('IO.') ||
      className.startsWith('H&P') ||
      className === 'CLIN' ||
      className === 'CLIN.RISK' ||
      className === 'ED' ||
      className === 'FUNCTION' ||
      className.startsWith('PANEL.H&P') ||
      className.startsWith('PANEL.CARDIAC') ||
      className.startsWith('PANEL.CLIN') ||
      className.startsWith('PANEL.CV') ||
      className.startsWith('PANEL.FUNCTION') ||
      className.startsWith('PANEL.OBS'),
  },
]

function fail(message: string): never {
  console.error(message)
  process.exit(1)
}

function requireFile(filePath: string): void {
  if (!fs.existsSync(filePath)) {
    fail(`${filePath} fehlt. Die Ableitung braucht den lokalen LOINC-2.82-Quellordner.`)
  }
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false

  for (let index = 0; index < text.length; index++) {
    const char = text[index]
    const next = text[index + 1]

    if (quoted) {
      if (char === '"' && next === '"') {
        field += '"'
        index++
      } else if (char === '"') {
        quoted = false
      } else {
        field += char
      }
    } else if (char === '"') {
      quoted = true
    } else if (char === ',') {
      row.push(field)
      field = ''
    } else if (char === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else if (char !== '\r') {
      field += char
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  return rows
}

function readCsv(filePath: string): CsvTable {
  const rows = parseCsv(fs.readFileSync(filePath, 'utf8'))
  const header = rows.shift()
  if (!header) fail(`${filePath}: leere CSV-Datei`)
  const index = Object.fromEntries(header.map((name, columnIndex) => [name, columnIndex]))
  return {
    rows,
    header,
    index,
    get: (row, column) => row[index[column]] ?? '',
  }
}

function splitSynonyms(value: string): string[] {
  return [...new Set(value.split(/;|\|/).map(item => item.trim()).filter(Boolean))].sort((left, right) =>
    left.localeCompare(right, 'en'),
  )
}

function isExcludedClass(className: string): boolean {
  const segments = className.split(/[./]/).filter(Boolean)
  if (segments.some(segment => BAD_CLASS_SEGMENTS.has(segment))) return true
  return segments.includes('US')
}

function bucketFor(className: string): string {
  const rule = BUCKET_RULES.find(candidate => candidate.matches(className))
  return rule?.slug ?? 'other-small'
}

function bucketTitle(slug: string): string {
  return BUCKET_RULES.find(rule => rule.slug === slug)?.title ?? 'Other small classes'
}

function summarize(records: LoincRecord[]): Record<string, unknown> {
  return {
    records: records.length,
    with_ucum_unit: records.filter(record => record.units.example_ucum_units).length,
    with_definition: records.filter(record => record.definition).length,
    with_consumer_name: records.filter(record => record.names.consumer_name).length,
    with_german_name: records.filter(
      record => record.names.german && (record.names.german.display_name || record.names.german.long_name || record.names.german.component),
    ).length,
    with_panel_assignment: records.filter(record => record.panels.length > 0).length,
    with_external_copyright_notice: records.filter(
      record => record.external_copyright_notice || record.panels.some(panel => panel.external_copyright_notice),
    ).length,
  }
}

function main(): void {
  for (const filePath of [LOINC_TABLE, PANELS, GERMAN_VARIANT, CONSUMER_NAMES, LICENSE]) requireFile(filePath)

  const loinc = readCsv(LOINC_TABLE)
  const german = readCsv(GERMAN_VARIANT)
  const consumer = readCsv(CONSUMER_NAMES)
  const panels = readCsv(PANELS)

  const germanByCode = new Map<string, LoincRecord['names']['german']>()
  for (const row of german.rows) {
    const code = german.get(row, 'LOINC_NUM')
    if (!code) continue
    germanByCode.set(code, {
      component: german.get(row, 'COMPONENT') || null,
      long_name: german.get(row, 'LONG_COMMON_NAME') || null,
      display_name: german.get(row, 'LinguisticVariantDisplayName') || null,
      class_name: german.get(row, 'CLASS') || null,
    })
  }

  const consumerByCode = new Map<string, string>()
  for (const row of consumer.rows) {
    const code = consumer.get(row, 'LoincNumber')
    const name = consumer.get(row, 'ConsumerName')
    if (code && name) consumerByCode.set(code, name)
  }

  const panelsByCode = new Map<string, LoincRecord['panels']>()
  for (const row of panels.rows) {
    const code = panels.get(row, 'Loinc')
    if (!code) continue
    const sequence = panels.get(row, 'SEQUENCE')
    const panel = {
      parent_loinc: panels.get(row, 'ParentLoinc') || null,
      parent_name: panels.get(row, 'ParentName') || null,
      sequence: sequence ? Number(sequence) : null,
      display_name: panels.get(row, 'DisplayNameForForm') || null,
      required: panels.get(row, 'ObservationRequiredInPanel') || null,
      category: panels.get(row, 'ObservationCategory') || null,
      external_copyright_notice: panels.get(row, 'EXTERNAL_COPYRIGHT_NOTICE') || panels.get(row, 'AdditionalCopyright') || null,
    }
    panelsByCode.set(code, [...(panelsByCode.get(code) ?? []), panel])
  }

  const classTypeName: Record<string, string> = { '1': 'laboratory', '2': 'clinical' }
  const records: LoincRecord[] = loinc.rows
    .filter(row => {
      const status = loinc.get(row, 'STATUS')
      const classType = loinc.get(row, 'CLASSTYPE')
      const rank = Number(loinc.get(row, 'COMMON_TEST_RANK'))
      const className = loinc.get(row, 'CLASS')
      return status === 'ACTIVE' && (classType === '1' || classType === '2') && rank > 0 && !isExcludedClass(className)
    })
    .map(row => {
      const code = loinc.get(row, 'LOINC_NUM')
      const panelsForCode = (panelsByCode.get(code) ?? []).sort((left, right) => (left.sequence ?? 999999) - (right.sequence ?? 999999))
      return {
        loinc_code: code,
        status: loinc.get(row, 'STATUS'),
        common_test_rank: Number(loinc.get(row, 'COMMON_TEST_RANK')),
        class_type: Number(loinc.get(row, 'CLASSTYPE')),
        class_type_name: classTypeName[loinc.get(row, 'CLASSTYPE')] ?? null,
        class: loinc.get(row, 'CLASS') || null,
        panel_type: loinc.get(row, 'PanelType') || null,
        order_observation: loinc.get(row, 'ORDER_OBS') || null,
        names: {
          component: loinc.get(row, 'COMPONENT') || null,
          long_common_name: loinc.get(row, 'LONG_COMMON_NAME') || null,
          short_name: loinc.get(row, 'SHORTNAME') || null,
          display_name: loinc.get(row, 'DisplayName') || null,
          consumer_name: loinc.get(row, 'CONSUMER_NAME') || consumerByCode.get(code) || null,
          german: germanByCode.get(code) ?? null,
        },
        units: {
          example_units: loinc.get(row, 'EXAMPLE_UNITS') || null,
          example_ucum_units: loinc.get(row, 'EXAMPLE_UCUM_UNITS') || null,
          units_required: loinc.get(row, 'UNITSREQUIRED') || null,
        },
        method: loinc.get(row, 'METHOD_TYP') || null,
        property: loinc.get(row, 'PROPERTY') || null,
        time_aspect: loinc.get(row, 'TIME_ASPCT') || null,
        system: loinc.get(row, 'SYSTEM') || null,
        scale: loinc.get(row, 'SCALE_TYP') || null,
        definition: loinc.get(row, 'DefinitionDescription') || null,
        synonyms: { loinc_related_names: splitSynonyms(loinc.get(row, 'RELATEDNAMES2')) },
        panels: panelsForCode,
        external_copyright_notice: loinc.get(row, 'EXTERNAL_COPYRIGHT_NOTICE') || null,
        reference_ranges: {
          status: 'not_in_loinc',
          note: 'LOINC identifiziert Tests und liefert keine Normbereiche. Bereiche docken spaeter ueber Quellen wie NHANES, alte 122er-Kuration oder Laborhandbuecher an.',
        },
        source: { system: 'LOINC', version: '2.82', source_file: LOINC_TABLE },
      }
    })
    .sort((left, right) => left.common_test_rank - right.common_test_rank || left.loinc_code.localeCompare(right.loinc_code))

  fs.rmSync(OUTPUT_ROOT, { recursive: true, force: true })
  fs.mkdirSync(OUTPUT_ROOT, { recursive: true })

  const generatedAt = new Date().toISOString()
  const bucketsBySlug = new Map<string, Bucket>()
  for (const record of records) {
    const className = record.class ?? 'unknown'
    const slug = bucketFor(className)
    const bucket = bucketsBySlug.get(slug) ?? { slug, title: bucketTitle(slug), classes: [], records: [] }
    if (!bucket.classes.includes(className)) bucket.classes.push(className)
    bucket.records.push(record)
    bucketsBySlug.set(slug, bucket)
  }

  const selectionRule = {
    include: ['LOINC STATUS = ACTIVE', 'CLASSTYPE in (1 laboratory, 2 clinical)', 'COMMON_TEST_RANK present', 'all ranked terms retained; no top-2000 cap'],
    exclude_class_segments: [...BAD_CLASS_SEGMENTS].sort(),
    exclude_class_segment_note: 'Zusaetzlich ausgeschlossen: Klassen mit Segment US fuer Ultraschall/Imaging.',
    retained_edge_domains: [
      'DRUG/TOX bleibt enthalten, weil solche Messwerte in realen Labor-/Toxikologieberichten auftauchen koennen; bei enger Healthcheck-UI kann spaeter gefiltert werden.',
    ],
    rationale:
      'Breiter Importkatalog fuer Healthcheck- und spezifizierte Check-Berichte. Radiologie, Mikrobiologie-Einzelkeime, Allergietests, Frageboegen, Dokumenten-Ontologie, Genetik/Pathologie, Admin-/Geraete-/Order-Klassen werden ausgeschlossen; seltenere gerankte Labor- und Vitalwerte bleiben enthalten.',
  }

  const sourceFiles = {
    loinc_table: LOINC_TABLE,
    panels_and_forms: PANELS,
    german_variant: GERMAN_VARIANT,
    consumer_names: CONSUMER_NAMES,
    license: LICENSE,
  }

  const files = [...bucketsBySlug.values()]
    .sort((left, right) => left.slug.localeCompare(right.slug))
    .map(bucket => {
      bucket.classes.sort((left, right) => left.localeCompare(right))
      const payload = {
        schema_version: 1,
        status: 'loinc_masterlist_part_not_import_ready',
        generated_at: generatedAt,
        bucket: {
          slug: bucket.slug,
          title: bucket.title,
          classes: bucket.classes,
        },
        selection_rule: selectionRule,
        license_notice_required: LICENSE_NOTICE,
        source_files: sourceFiles,
        stats: summarize(bucket.records),
        records: bucket.records,
      }
      const fileName = `${bucket.slug}.json`
      const filePath = path.join(OUTPUT_ROOT, fileName)
      fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
      return {
        file: fileName,
        bucket: bucket.slug,
        title: bucket.title,
        classes: bucket.classes,
        records: bucket.records.length,
        bytes: fs.statSync(filePath).size,
      }
    })

  const classToFile: Record<string, string> = {}
  for (const file of files) {
    for (const className of file.classes) classToFile[className] = file.file
  }

  const sampleCodes = ['718-7', '2986-8', '2857-1', '8310-5', '8867-4', '8480-6', '50196-5', '5792-7']
  const sampleLocations = sampleCodes.map(code => {
    const record = records.find(candidate => candidate.loinc_code === code)
    return {
      loinc_code: code,
      found: Boolean(record),
      file: record ? `${bucketFor(record.class ?? 'unknown')}.json` : null,
      class: record?.class ?? null,
      name: record?.names.long_common_name ?? null,
    }
  })

  const indexPayload = {
    schema_version: 1,
    status: 'loinc_masterlist_index_not_import_ready',
    generated_at: generatedAt,
    source_required: SOURCE_ROOT,
    source_required_note: 'Der lokale LOINC-2.82-Quellordner ist fuer die Reproduktion erforderlich und wird nicht aus dieser Ableitung rekonstruiert.',
    selection_rule: selectionRule,
    license_notice_required: LICENSE_NOTICE,
    source_files: sourceFiles,
    total_records: records.length,
    files,
    class_to_file: Object.fromEntries(Object.entries(classToFile).sort(([left], [right]) => left.localeCompare(right))),
    sample_locations: sampleLocations,
    stats: summarize(records),
  }
  fs.writeFileSync(path.join(OUTPUT_ROOT, 'index.json'), `${JSON.stringify(indexPayload, null, 2)}\n`, 'utf8')

  if (fs.existsSync(OLD_SINGLE_FILE)) {
    fs.rmSync(OLD_SINGLE_FILE)
  }

  const tooLarge = files.filter(file => file.bytes >= 10_000_000)
  if (tooLarge.length > 0) {
    fail(`Dateien ueber 10 MB: ${tooLarge.map(file => `${file.file}=${file.bytes}`).join(', ')}`)
  }

  const uniqueCodes = new Set(records.map(record => record.loinc_code))
  if (uniqueCodes.size !== records.length) {
    fail(`Doppelte LOINC-Codes: ${records.length - uniqueCodes.size}`)
  }

  console.log(JSON.stringify({ total_records: records.length, files, sample_locations: sampleLocations }, null, 2))
}

main()
