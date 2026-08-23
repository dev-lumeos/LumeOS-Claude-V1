#!/usr/bin/env node
// Prueft die Substanzkatalog-Anker im Supplements-Frontend.
//
// Anlass C-253: `supplements.substance_catalog.id` ist text, die neue
// `supplements.supplements.id` ist uuid. Der stabile alte Wert liegt in
// `supplements.supplements.slug`. Ein Anker `substance_catalog:<wert>`
// muss deshalb auf `slug` zeigen und gegen `slug` gelesen werden.
//
// Gegenprobe: LUMEOS_KATALOGANKER_SELBSTTEST=1 baut im Speicher einen
// falschen Add-Anker ein. Die Pruefung muss dann genau
// `add-list-anchor-uses-id` melden.

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const WURZEL = resolve(process.cwd())
const DATEIEN = {
  detail: resolve(WURZEL, 'apps/web/src/app/v2/supplements/substanz-detail.tsx'),
  read: resolve(WURZEL, 'apps/web/src/lib/supplements/substanz-read.ts'),
}

function lies(datei) {
  return readFileSync(datei, 'utf8')
}

function zeileVon(text, index) {
  return text.slice(0, index).split(/\r?\n/).length
}

function fehler(code, datei, text, index, hinweis) {
  return {
    code,
    datei,
    zeile: zeileVon(text, index),
    hinweis,
  }
}

function pruefe(detail, read) {
  const funde = []

  const addList = "open('add', { name: s.name, substanzId: s.id })"
  const addListIx = detail.indexOf(addList)
  if (addListIx !== -1) {
    funde.push(fehler(
      'add-list-anchor-uses-id',
      DATEIEN.detail,
      detail,
      addListIx,
      'Listen-Add schreibt supplements.supplements.id als substance_catalog-Anker; erwartet ist s.slug || s.id.',
    ))
  }

  const addDetailOk = "substanzId: satz.slug || satz.id"
  const addDetailIx = detail.indexOf(addDetailOk)
  if (addDetailIx === -1) {
    const ix = detail.indexOf("open('add'")
    funde.push(fehler(
      'detail-add-anchor-missing-slug',
      DATEIEN.detail,
      detail,
      ix === -1 ? 0 : ix,
      'Detail-Add muss den slug als substance_catalog-Anker weitergeben.',
    ))
  }

  const ankerId = 'anker.has(s.id)'
  const ankerIdIx = detail.indexOf(ankerId)
  if (ankerIdIx !== -1) {
    funde.push(fehler(
      'stack-anchor-compares-uuid',
      DATEIEN.detail,
      detail,
      ankerIdIx,
      'Stack-Anker substance_catalog:<wert> darf nicht gegen supplements.supplements.id (uuid) treffen.',
    ))
  }

  const ankerSlugOk = 'anker.has(s.slug)'
  const ankerSlugIx = detail.indexOf(ankerSlugOk)
  if (ankerSlugIx === -1) {
    funde.push(fehler(
      'stack-anchor-missing-slug',
      DATEIEN.detail,
      detail,
      0,
      'Stack-Anker muss gegen supplements.supplements.slug gelesen werden.',
    ))
  }

  const kopfOk = 'satz.slug || satz.id'
  const kopfIx = detail.indexOf(kopfOk)
  if (kopfIx === -1) {
    funde.push(fehler(
      'detail-head-missing-slug',
      DATEIEN.detail,
      detail,
      0,
      'Detailkopf muss den slug vor der uuid anzeigen.',
    ))
  }

  const listenTypOk = 'slug: string'
  const listenTypIx = read.indexOf(listenTypOk)
  if (listenTypIx === -1) {
    funde.push(fehler(
      'list-entry-missing-slug',
      DATEIEN.read,
      read,
      0,
      'SubstanzListenEintrag muss slug als alte substance_catalog.id tragen.',
    ))
  }

  const selectSlugOk = "'id, slug, name_de"
  const selectSlugIx = read.indexOf(selectSlugOk)
  if (selectSlugIx === -1) {
    funde.push(fehler(
      'list-select-missing-slug',
      DATEIEN.read,
      read,
      0,
      'Die Substanzliste muss slug aus supplements.supplements lesen.',
    ))
  }

  const detailLookupOk = ".eq(istUuid ? 'id' : 'slug', id)"
  const detailLookupIx = read.indexOf(detailLookupOk)
  if (detailLookupIx === -1) {
    funde.push(fehler(
      'detail-lookup-missing-slug',
      DATEIEN.read,
      read,
      0,
      'Das Detail muss alte Textanker ueber slug und neue UUIDs ueber id laden.',
    ))
  }

  return funde
}

let detail = lies(DATEIEN.detail)
const read = lies(DATEIEN.read)

const selbsttest = process.env.LUMEOS_KATALOGANKER_SELBSTTEST === '1'
if (selbsttest) {
  detail = detail.replace(
    "open('add', { name: s.name, substanzId: s.slug || s.id })",
    "open('add', { name: s.name, substanzId: s.id })",
  )
}

const funde = pruefe(detail, read)

if (selbsttest) {
  const erwartung = funde.some(f => f.code === 'add-list-anchor-uses-id')
  if (!erwartung) {
    console.error('[kataloganker] FEHLER: Selbsttest misst nichts.')
    console.error('  Erwartet: add-list-anchor-uses-id')
    process.exit(1)
  }
  console.log('[kataloganker] Selbsttest rot wie erwartet: add-list-anchor-uses-id.')
  process.exit(0)
}

if (funde.length) {
  console.error(`[kataloganker] FEHLER: ${funde.length} typfalsche oder fehlende Kataloganker.`)
  for (const f of funde) {
    console.error(`  ${f.code}: ${f.datei}:${f.zeile}`)
    console.error(`    ${f.hinweis}`)
  }
  process.exit(1)
}

console.log('[kataloganker] 3 Ankerstellen geprueft, 0 typfalsche Verweise.')
