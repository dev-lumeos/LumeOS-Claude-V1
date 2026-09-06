// `[cmd]` **2026-09-07.** Tom: *,,und das waere in deiner datei
// alles drin wo die sources deklariert sind..... no comment"*
//
// `[cmd]` **`00-QUELLEN.md` sagt je Modul, was zu lesen ist** —
// **und der Orchestrator hat zweimal an einem Tag behauptet, eine
// Spec existiere nicht, ohne sie zu oeffnen.**
//
// `[read]` **Dieser Waechter prueft, ob die Datei noch stimmt** —
// **ob jedes Spec-Verzeichnis und jedes Mockup dort genannt ist.**
//
// `[read]` **Er kann nicht erzwingen, dass sie gelesen wird.**
// **Aber wenn sie unvollstaendig ist, taugt sie nichts.**

import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs'
import { join } from 'node:path'

const QUELLEN = 'docs/spezifikation/00-QUELLEN.md'
const SPECS = 'docs/specs'
const MOCKUPS = 'docs/spezifikation/10-plattform/design-system/theme-v1'

if (!existsSync(QUELLEN)) {
  console.log('[quellen] 00-QUELLEN.md fehlt - der Orchestrator ist blind.')
  process.exit(1)
}

const text = readFileSync(QUELLEN, 'utf8')
const fehlen = []

// `[read]` **Jedes Spec-Verzeichnis muss genannt sein.**
if (existsSync(SPECS)) {
  for (const e of readdirSync(SPECS, { withFileTypes: true })) {
    if (!e.isDirectory()) continue
    if (!text.includes(`docs/specs/${e.name}`) && !text.includes(e.name)) {
      fehlen.push(`Spec-Verzeichnis docs/specs/${e.name}/`)
    }
  }
}

// `[read]` **Und jede Mockup-Datei.**
if (existsSync(MOCKUPS)) {
  for (const f of readdirSync(MOCKUPS)) {
    if (!f.startsWith('module-')) continue
    if (!text.includes(f)) fehlen.push(`Mockup ${f}`)
  }
}

const specDirs = existsSync(SPECS)
  ? readdirSync(SPECS, { withFileTypes: true }).filter(e => e.isDirectory()).length
  : 0
const mocks = existsSync(MOCKUPS)
  ? readdirSync(MOCKUPS).filter(f => f.startsWith('module-')).length
  : 0

console.log(`[quellen] ${specDirs} Spec-Verzeichnisse, ${mocks} Mockups`
  + (fehlen.length ? `, ${fehlen.length} nicht in 00-QUELLEN.md` : ', alle genannt'))

if (fehlen.length) {
  console.log('[quellen] ROT: 00-QUELLEN.md ist unvollstaendig.')
  console.log('[quellen] Wer sie liest, findet diese nicht:')
  for (const x of fehlen.slice(0, 12)) console.log(`  ${x}`)
  if (fehlen.length > 12) console.log(`  ... und ${fehlen.length - 12} weitere`)
  process.exit(1)
}
