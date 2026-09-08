// `[cmd]` **2026-09-08, A-74.** **Die SSOT lag zwoelf Tage zurueck,
// und niemand merkte es** ? **weil kein Waechter sie prueft.**
//
// `[read]` **Was nicht geprueft wird, verfaellt.**
//
// `[read]` **Dieser Waechter misst nur das Alter, nicht den
// Inhalt** ? **er kann nicht wissen, ob eine Beschreibung stimmt.**
// `[read]` **Aber er kann sagen, dass seit dem letzten Nachtrag
// gebaut wurde.**

import { execFileSync } from 'node:child_process'

function letzterCommit(pfad) {
  try {
    return execFileSync('git', ['log', '-1', '--format=%cI', '--', pfad],
      { encoding: 'utf8' }).trim()
  } catch { return null }
}
function commitsSeit(seit, ...pfade) {
  try {
    const roh = execFileSync('git',
      ['log', '--since=' + seit, '--oneline', '--', ...pfade],
      { encoding: 'utf8' })
    return roh.split('\n').filter(z => z.trim()).length
  } catch { return 0 }
}

const ssot = letzterCommit('docs/ssot/')
if (!ssot) {
  console.log('[ssot-alter] docs/ssot/ hat keinen Commit ? uebersprungen.')
  process.exit(0)
}
const offen = commitsSeit(ssot, 'supabase/', 'apps/')
const tage = Math.floor((Date.now() - Date.parse(ssot)) / 86400000)

console.log('[ssot-alter] letzter Nachtrag vor ' + tage + ' Tagen, '
  + offen + ' Commits in supabase/ und apps/ seither')

// `[read]` **Die Grenze ist grosszuegig** ? **ein Tag Arbeit ohne
// Nachtrag ist normal, eine Woche nicht.**
const GRENZE = 40
if (offen > GRENZE) {
  console.log('[ssot-alter] ROT: ' + offen + ' Commits ohne Nachtrag, Soll hoechstens ' + GRENZE + '.')
  console.log('[ssot-alter] Zum Tagesabschluss: node tools/ssot-nachtragen.mjs --schreiben')
  console.log('[ssot-alter] Und die Modul-Dateien in docs/ssot/ nachziehen ? das bleibt Handarbeit.')
  process.exit(1)
}
