// G-433 - wieviele getrennte STRAENGE hat eine Flaeche je Seite?
//
// ══ DIE FRAGE, DIE ICH ZU SPAET GESTELLT HABE ═══════════════════════
//
// **Tom:** *,,wurde bei hamstring auch gesagt und nun hat es jeden der
// muskeln einzeln anwaehlbar."*
//
// `[read]` **Er hat recht.** **Ich habe gefragt *,,wie heisst das?"*
// und aus *,,kein Name in muscle_groups"* geschlossen *,,nicht
// trennbar"*.** **Das sind zwei verschiedene Dinge:**
//
//     ob die Grafik trennt   -> entscheidet das BILD
//     ob es einen Namen gibt -> entscheidet die DATENBANK
//
// `[read]` **Ein fehlender Name ist eine Luecke in `muscle_groups`,
// kein Grund, die Flaeche zusammenzulassen.**
//
// ══ WAS DIESE PROBE MISST ═══════════════════════════════════════════
//
// `[cmd]` **Je Flaeche: wieviele Pfade liegen LINKS, wieviele
// RECHTS** - und wieviele getrennte Straenge das je Seite ergibt.
//
// `[read]` **Die Seite kommt aus der x-Mitte des Pfades** gegen die
// Mitte der Ansicht. **Ein Strang je Seite heisst: zusammenlassen.
// Mehrere heisst: trennbar.**
import fs from 'node:fs'
import path from 'node:path'

const WURZEL = path.resolve(import.meta.dirname, '..')
const s = fs.readFileSync(
  path.join(WURZEL, 'packages/ui/src/koerperkarte-pfade.ts'), 'utf8')

function bloecke(text) {
  const aus = []
  const re = /\n {4}'?([a-z_-]+)'?:\s*\{/g
  let m
  while ((m = re.exec(text)) !== null) {
    let tiefe = 1, i = m.index + m[0].length, inStr = null
    for (; i < text.length && tiefe > 0; i++) {
      const c = text[i]
      if (inStr) { if (c === '\\') i += 1; else if (c === inStr) inStr = null; continue }
      if (c === '"' || c === "'" || c === '`') inStr = c
      else if (c === '{') tiefe += 1
      else if (c === '}') tiefe -= 1
    }
    aus.push({ name: m[1], rumpf: text.slice(m.index + m[0].length, i - 1) })
    re.lastIndex = i
  }
  return aus
}

const t = fs.readFileSync(path.join(WURZEL, 'packages/ui/src/koerperkarte.tsx'), 'utf8')
const VB_W = Number((t.match(/VB_W\s*=\s*(\d+)/) ?? [])[1])

/**
 * Der ABSOLUTE Startpunkt eines Pfades.
 *
 * `[cmd]` **Die erste Fassung las jedes Zahlenpaar** - und damit auch
 * relative Kurvenwerte (`c`, `l`, `v`) und Arc-Flags. **Gemessen:
 * `chest` ergab *,,2 Straenge je Seite"* bei zwei Pfaden**, von denen
 * einer bei x=273 und einer bei x=416 beginnt - also links und
 * rechts. **Unmoeglich.**
 *
 * `[read]` **Nur das `M` am Anfang ist verlaesslich absolut.**
 * **Fuer die Frage „links oder rechts" reicht es** - die Haelften
 * liegen weit auseinander.
 */
function startX(d) {
  const m = d.match(/^M\s*(-?[\d.]+)/)
  return m ? Number(m[1]) : null
}

const blok = s.slice(s.indexOf('export const MUSKELN'), s.indexOf('export const UMRISS_VORNE'))

console.log('\n=== Straenge je Seite ===\n')
console.log('  Flaeche          Ansicht  Pfade  links  rechts   Urteil')
console.log('  ' + '-'.repeat(64))

const trennbar = []
for (const b of bloecke(blok)) {
  const side = (b.rumpf.match(/side:\s*'(\w+)'/) ?? [])[1] ?? '?'
  for (const schl of ['paths', 'paths_front', 'paths_back']) {
    const g = b.rumpf.match(new RegExp(`${schl}:\\s*\\[([\\s\\S]*?)\\]`))
    if (!g) continue
    const pf = [...g[1].matchAll(/"((?:[^"\\]|\\.)*)"/g)].map(x => x[1])
    if (!pf.length) continue
    const hinten = schl === 'paths_back' || (schl === 'paths' && side === 'back')
    const ansicht = hinten ? 'back' : 'front'
    const x0 = hinten ? VB_W : 0
    const mitte = x0 + VB_W / 2

    let links = 0, rechts = 0
    for (const d of pf) {
      const x = startX(d)
      if (x === null) continue
      if (x < mitte) links += 1
      else rechts += 1
    }
    const max = Math.max(links, rechts)
    const urteil = max <= 1 ? 'ein Strang je Seite'
      : `${max} STRAENGE je Seite -> trennbar`
    console.log(`  ${b.name.padEnd(16)} ${ansicht.padEnd(8)} ${String(pf.length).padStart(5)}`
      + ` ${String(links).padStart(6)} ${String(rechts).padStart(7)}   ${urteil}`)
    if (max > 1) trennbar.push({ flaeche: b.name, ansicht, straenge: max, pfade: pf.length })
  }
}

console.log(`\n=== ${trennbar.length} Flaechen/Ansichten mit MEHR als einem Strang je Seite ===\n`)
for (const x of trennbar) {
  console.log(`  ${x.flaeche.padEnd(16)} ${x.ansicht.padEnd(6)} ${x.straenge} Straenge (${x.pfade} Pfade)`)
}
