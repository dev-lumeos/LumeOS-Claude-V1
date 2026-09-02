// `[cmd]` **A-70, 2026-09-02.** Tom: *,,setz dir fuer die
// ueberwachung einen reminder dass wir das woechentlich raeumen."*
//
// `[read]` **Der Waechter loescht nichts.** **Er sagt, wann es Zeit
// ist** — und was oben liegt.
//
// `[cmd]` **Am 02.09. geraeumt: 5,97 auf 2,31 GiB.**
// `[read]` **Ohne Erinnerung waechst es wieder** — 57
// Vollsicherungen entstanden in acht Tagen.

import { readdirSync, statSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const WURZEL = 'backup'
const GRENZE_GIB = 2.5
const TAGE = 7

/** `[cmd]` Ordner, aus denen die Kette liest. Nie raeumen. */
const QUELLEN = new Set(['kimi-research', 'legacy-v2'])

function groesse(pfad) {
  let n = 0, bytes = 0
  for (const e of readdirSync(pfad, { withFileTypes: true })) {
    const p = join(pfad, e.name)
    if (e.isDirectory()) {
      const u = groesse(p)
      n += u.n; bytes += u.bytes
    } else {
      n += 1
      bytes += statSync(p).size
    }
  }
  return { n, bytes }
}

if (!existsSync(WURZEL)) {
  console.log('[backup] kein backup/ - nichts zu pruefen.')
  process.exit(0)
}

const je = []
let gesamt = 0
for (const e of readdirSync(WURZEL, { withFileTypes: true })) {
  if (!e.isDirectory()) continue
  const u = groesse(join(WURZEL, e.name))
  gesamt += u.bytes
  je.push({ name: e.name, ...u, quelle: QUELLEN.has(e.name) })
}
const gib = gesamt / 1024 ** 3

// `[read]` **Das juengste Manifest sagt, wann zuletzt inventarisiert
// wurde** - der beste verfuegbare Anhaltspunkt fuer den Raeumtakt.
let letzte = null
const md = join(WURZEL, '_manifests')
if (existsSync(md)) {
  const dateien = readdirSync(md).filter(f => f.endsWith('.json')).sort()
  if (dateien.length) letzte = statSync(join(md, dateien.at(-1))).mtime
}
const alter = letzte ? Math.floor((Date.now() - letzte.getTime()) / 86400000) : null

console.log(`[backup] ${gib.toFixed(2)} GiB in ${je.length} Ordnern`
  + (alter === null ? ', kein Manifest' : `, zuletzt inventarisiert vor ${alter} Tagen`))

// `[read]` **Kein Manifest heisst: nie inventarisiert.** **Das ist
// kein Grund zu schweigen, sondern der aelteste denkbare Stand.**
if (gib > GRENZE_GIB || alter === null || alter >= TAGE) {
  console.log(`[backup] ERINNERUNG: raeumen faellig`
    + ` (Grenze ${GRENZE_GIB} GiB, Takt ${TAGE} Tage).`)
  console.log('[backup] Der Orchestrator legt vor, Tom entsorgt. Kein Agent loescht.')
  const raeumbar = je.filter(x => !x.quelle).sort((a, b) => b.bytes - a.bytes).slice(0, 5)
  for (const x of raeumbar) {
    console.log(`  ${x.name.padEnd(22)} ${(x.bytes / 1024 / 1024).toFixed(1).padStart(8)} MiB`
      + `  ${String(x.n).padStart(6)} Dateien`)
  }
  for (const x of je.filter(y => y.quelle)) {
    console.log(`  ${x.name.padEnd(22)} ${(x.bytes / 1024 / 1024).toFixed(1).padStart(8)} MiB`
      + '  QUELLE - nie raeumen')
  }
}
