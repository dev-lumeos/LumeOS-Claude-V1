/**
 * G-641 — keine Mischung in oklch mit einer neutralen Farbe, die einen Farbton traegt.
 *
 * `[cmd]` **Ursache, gemessen 2026-10-10 in Chromium:** `color-mix(in oklch, …)`
 * interpoliert den Farbton auch dann, wenn eine Seite (fast) keine Chroma hat.
 * Die neutralen Tokens trugen hell H 0 (Chroma 0), dunkel H 270 (Chroma 0,005):
 * Goals-Gelb (H 90) 14 % + `--surface` ergab hell **H 13 (rosa)**, dunkel
 * **H 248 (blau)**; Neg-Rot (H 22) dunkel H 286 (lila).
 *
 * `[read]` **Behoben im Token** (`oklab(L 0 0)`): ohne Farbton-Komponente wird
 * der Farbton beim Mischen in oklch machtlos, die Mischung nimmt den des Akzents.
 * `[cmd]` **Nicht `oklch(L 0 none)`:** Chromium traegt `none` in
 * `color-mix(in srgb, …)` auf den Blaukanal — gemessen: Reiterleiste
 * `color(srgb 0.98 0.97 -0.117)`, knallgelb.
 *
 * Dieser Waechter liest jede `color-mix(in oklch, …)` der Anwendung und jedes
 * Token aus `lume.css` und wird rot, wenn eine neutrale Farbe mit Zahlen-Farbton
 * hineingemischt wird (Token ODER Literal) oder ein Token `none` traegt.
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, relative } from 'node:path'

const HIER = dirname(fileURLToPath(import.meta.url))
const SRC = join(HIER, '..', '..', '..')
const LUME = join(HIER, '..', 'lume.css')

/** Grenze „neutral": Chroma unter 0,01. `--acc-admin` (0,01) ist ein Akzent. */
const NEUTRAL_UNTER = 0.01

export type Farbe = { l: number; c: number; h: number | 'none' }
export function oklch(s: string): Farbe | null {
  const m = /oklch\(\s*([0-9.]+%?)\s+([0-9.]+)\s+([0-9.]+|none)\s*(?:\/[^)]*)?\)/.exec(s)
  if (!m) return null
  return { l: parseFloat(m[1]!), c: parseFloat(m[2]!), h: m[3] === 'none' ? 'none' : parseFloat(m[3]!) }
}
/** Neutral mit Zahlen-Farbton: genau der Fall, der in oklch-Mischungen kippt. */
export const kippt = (f: Farbe | null) => !!f && f.c < NEUTRAL_UNTER && f.h !== 'none'

/** `oklab(L a b)` — unbunt, wenn a und b 0 sind; ein Farbton entsteht erst beim Umrechnen und ist dann machtlos. */
export function oklab(s: string): Farbe | null {
  const m = /oklab\(\s*([0-9.]+%?)\s+(-?[0-9.]+)\s+(-?[0-9.]+)\s*(?:\/[^)]*)?\)/.exec(s)
  if (!m) return null
  const a = parseFloat(m[2]!), b = parseFloat(m[3]!)
  const c = Math.hypot(a, b)
  return { l: parseFloat(m[1]!), c, h: c === 0 ? 'none' : (Math.atan2(b, a) * 180 / Math.PI + 360) % 360 }
}

/** Alle Token-Definitionen je Block (hell und dunkel getrennt). */
export function tokens(css: string): Map<string, Farbe[]> {
  const t = new Map<string, Farbe[]>()
  for (const m of Array.from(css.matchAll(/--([a-z0-9-]+):\s*((?:oklch|oklab)\([^)]*\))/g))) {
    const f = m[2]!.startsWith('oklab') ? oklab(m[2]!) : oklch(m[2]!)
    if (f) t.set(m[1]!, [...(t.get(m[1]!) ?? []), f])
  }
  return t
}

/** Jede `color-mix(in oklch, …)` mit ihren Argumenten (Klammern ausgezaehlt). */
export function mischungen(text: string): string[] {
  const aus: string[] = []
  let i = 0
  while ((i = text.indexOf('color-mix(in oklch', i)) >= 0) {
    let tiefe = 0, j = i
    for (; j < text.length; j++) {
      if (text[j] === '(') tiefe++
      else if (text[j] === ')') { tiefe--; if (tiefe === 0) break }
    }
    aus.push(text.slice(i, j + 1)); i = j + 1
  }
  return aus
}

export function befunde(mix: string, t: Map<string, Farbe[]>): string[] {
  const b: string[] = []
  for (const m of Array.from(mix.matchAll(/var\(--([a-z0-9-]+)\)/g))) {
    if ((t.get(m[1]!) ?? []).some(kippt)) b.push(`--${m[1]} ist neutral mit Farbton`)
  }
  for (const m of Array.from(mix.matchAll(/oklch\([^()]*\)/g))) if (kippt(oklch(m[0]))) b.push(`Literal ${m[0]} ist neutral mit Farbton`)
  return b
}

function dateien(dir: string, aus: string[] = []): string[] {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e)
    if (e === 'node_modules' || e === '__tests__') continue
    if (statSync(p).isDirectory()) dateien(p, aus)
    else if (/\.(tsx?|css)$/.test(e)) aus.push(p)
  }
  return aus
}

describe('G-641 — der Abgleich selbst', () => {
  const T = tokens('a{--n: oklch(0.2 0.005 270); --ok: oklch(0.2 0 none); --akz: oklch(0.6 0.13 90); --adm: oklch(0.7 0.01 270)}')
  it('erkennt das neutrale Token mit Farbton, laesst none und Akzente durch', () => {
    assert.deepEqual(befunde('color-mix(in oklch, var(--akz) 14%, var(--n))', T), ['--n ist neutral mit Farbton'])
    assert.deepEqual(befunde('color-mix(in oklch, var(--akz) 14%, var(--ok))', T), [])
    assert.deepEqual(befunde('color-mix(in oklch, var(--akz) 14%, var(--adm))', T), [], '--acc-admin (0,01) ist ein Akzent')
  })
  it('erkennt das Literal, auch verschachtelt', () => {
    assert.equal(befunde('color-mix(in oklch, var(--akz) 10%, oklch(0.98 0.002 270))', T).length, 1)
    assert.deepEqual(mischungen('x color-mix(in oklch, color-mix(in oklch, var(--a) 5%, var(--b)) 50%, var(--c)) y'),
      ['color-mix(in oklch, color-mix(in oklch, var(--a) 5%, var(--b)) 50%, var(--c))'])
  })
})

describe('G-641 — die Anwendung', () => {
  const T = tokens(readFileSync(LUME, 'utf8'))
  it('die neutralen Tokens sind echt neutral — oklab(L 0 0), hell UND dunkel', () => {
    const css = readFileSync(LUME, 'utf8')
    const neutral = ['bg', 'bg-elev', 'surface', 'surface-2', 'surface-hover', 'border', 'border-strong', 'fg', 'fg-muted', 'fg-subtle', 'fg-dim']
    for (const n of neutral) {
      const roh = Array.from(css.matchAll(new RegExp(`--${n}:\\s*([^;]+);`, 'g'))).map(m => m[1]!.trim())
      assert.equal(roh.length, 2, `--${n}: erwartet hell und dunkel, gefunden ${roh.length}`)
      for (const r of roh) assert.match(r, /^oklab\([0-9.]+ 0 0\)$/, `--${n}: ${r}`)
    }
  })
  it('kein Token traegt `none` — Chromium setzt es in srgb-Mischungen auf den Blaukanal', () => {
    const css = readFileSync(LUME, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
    assert.deepEqual(Array.from(css.matchAll(/--([a-z0-9-]+):[^;]*\bnone\b/g)).map(m => m[1]), [])
  })
  it('keine color-mix(in oklch) mischt eine neutrale Farbe mit Farbton', () => {
    const alle = dateien(SRC)
    assert.ok(alle.length > 300, `nur ${alle.length} Dateien — Wurzel falsch?`)
    let gezaehlt = 0
    const fehler: string[] = []
    for (const p of alle) {
      for (const mix of mischungen(readFileSync(p, 'utf8'))) {
        gezaehlt++
        for (const b of befunde(mix, T)) fehler.push(`${relative(SRC, p)}: ${b} — ${mix.slice(0, 80)}`)
      }
    }
    assert.ok(gezaehlt > 500, `nur ${gezaehlt} Mischungen gefunden — Muster falsch?`)
    assert.deepEqual(fehler, [])
  })
})
