// Vertragstest des Theme-Systems (Block 4 B1).
// Liest Registry und Theme-CSS als TEXT (kein Import — tsx kann keine
// CSS-Importe laden) und prueft:
//  1. Jede registrierte id hat eine CSS-Datei und einen CSS-Import; jede
//     CSS-Datei ist registriert.
//  2. Jedes Theme definiert alle BASE-Tokens im Basisblock und alle
//     LIGHT-Tokens im Tagmodus-Block — ein unvollstaendiges Theme faellt
//     hier auf, statt still halb zu wirken.
//  3. globals.css bleibt frei von Festfarben (hex/rgba) — Regressionswache.
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

import { THEME_TOKENS_BASE, THEME_TOKENS_LIGHT } from '../contract'

const THEMES_DIR = path.join(process.cwd(), 'src', 'styles', 'themes')
const registrySource = readFileSync(path.join(THEMES_DIR, 'registry.ts'), 'utf8')

const registeredIds = Array.from(registrySource.matchAll(/id:\s*'([a-z0-9-]+)'/g), m => m[1])
const importedIds = Array.from(registrySource.matchAll(/import\s+'\.\/([a-z0-9-]+)\.css'/g), m => m[1])
const cssFiles = readdirSync(THEMES_DIR).filter(f => f.endsWith('.css')).map(f => f.replace(/\.css$/, ''))

function blockFor(css: string, selector: string): string {
  const start = css.indexOf(selector)
  if (start === -1) return ''
  const open = css.indexOf('{', start)
  const close = css.indexOf('}', open)
  if (open === -1 || close === -1) return ''
  return css.slice(open + 1, close)
}

test('registry, css imports and css files match exactly', () => {
  assert.ok(registeredIds.length > 0, 'registry defines at least one theme')
  assert.deepEqual([...registeredIds].sort(), [...importedIds].sort(),
    'every registered theme has a css import in registry.ts (and vice versa)')
  assert.deepEqual([...registeredIds].sort(), [...cssFiles].sort(),
    'every registered theme has a css file in the themes directory (and vice versa)')
})

for (const id of registeredIds) {
  test(`theme '${id}' fulfils the token contract in both modes`, () => {
    const css = readFileSync(path.join(THEMES_DIR, `${id}.css`), 'utf8')
    const base = blockFor(css, `[data-theme='${id}']`)
    const light = blockFor(css, `[data-theme='${id}'][data-mode='light']`)
    assert.ok(base.length > 0, `base block [data-theme='${id}'] exists`)
    assert.ok(light.length > 0, `light block [data-theme='${id}'][data-mode='light'] exists`)

    const missingBase = THEME_TOKENS_BASE.filter(token => !base.includes(`${token}:`))
    assert.deepEqual(missingBase, [], `base block misses tokens: ${missingBase.join(', ')}`)

    const missingLight = THEME_TOKENS_LIGHT.filter(token => !light.includes(`${token}:`))
    assert.deepEqual(missingLight, [], `light block misses tokens: ${missingLight.join(', ')}`)
  })
}

test('globals.css stays free of hardcoded colors', () => {
  const globals = readFileSync(path.join(process.cwd(), 'src', 'app', 'globals.css'), 'utf8')
  assert.equal((globals.match(/#[0-9a-fA-F]{3,8}\b/g) ?? []).length, 0, 'no hex colors in globals.css')
  assert.equal((globals.match(/rgba?\(/g) ?? []).length, 0, 'no rgb/rgba colors in globals.css')
})
