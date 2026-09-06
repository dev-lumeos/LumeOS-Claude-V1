// G-354: welche Fenster tragen eigene Auswahllisten?
// Nicht nach einem Namen suchen (G-339), sondern nach der WIRKUNG:
// ein Literal-Feld aus Objekten mit `id`/`label`/`code`/`value`,
// oder eine Reihe von <option>/aria-pressed-Knoepfen.
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const WURZEL = 'apps/web/src/app/v2'

function dateien(pfad) {
  const aus = []
  for (const e of readdirSync(pfad)) {
    const p = join(pfad, e)
    if (statSync(p).isDirectory()) {
      if (e === '__tests__') continue
      aus.push(...dateien(p))
    } else if (e.endsWith('.tsx')) aus.push(p)
  }
  return aus
}

const treffer = []
for (const d of dateien(WURZEL)) {
  const t = readFileSync(d, 'utf8')

  // Traegt die Datei ueberhaupt ein Fenster?
  const fenster = /Modal|GModal|ZiehModal/.test(t)

  // 1 · Literal-Liste aus Auswahl-Objekten: [{ id: 'x', label: 'Y' }, …]
  const objListen = t.match(
    /\[\s*\{\s*(id|code|value|key)\s*:\s*['"][^'"]+['"][^\]]{0,600}\]/g) ?? []

  // 2 · Mehrere feste <option value="…"> nebeneinander
  const optionen = t.match(/<option\s+value=["'][a-z_]+["']/g) ?? []

  // 3 · Knoepfe mit aria-pressed ueber einer Liste (die Bauform aus G-352)
  const knopfWahl = /aria-pressed/.test(t) && objListen.length > 0

  if (!fenster) continue
  if (objListen.length === 0 && optionen.length < 2 && !knopfWahl) continue

  treffer.push({
    datei: d.replace(/\\/g, '/'),
    objListen: objListen.length,
    festeOptionen: optionen.length,
    knopfWahl,
    // Die Werte selbst — daran erkennt man, ob sie zu einem CHECK passen
    werte: objListen.flatMap(l =>
      (l.match(/(?:id|code|value|key)\s*:\s*['"]([^'"]+)['"]/g) ?? [])
        .map(m => m.replace(/.*['"]([^'"]+)['"]/, '$1'))).slice(0, 12),
  })
}

console.log(JSON.stringify(treffer, null, 2))
console.log('\nFenster mit eigener Liste:', treffer.length)
