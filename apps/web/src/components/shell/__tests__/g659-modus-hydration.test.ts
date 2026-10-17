/**
 * G-659 — der Konsolenfehler auf jeder Seite
 *
 * `[cmd]` `tools/schuss.mjs` meldete auf /v2/goals, /v2/nutrition und /v2/settings je 1 Fehler:
 * „Extra attributes from the server: data-mode“ an `<html>`. Ohne Modus-Cookie setzt
 * MODE_BOOTSTRAP `data-mode` vor der Hydration — gewollt, also muss `<html>` die Abweichung
 * erlauben. Belegt am Schirm: mit dem Attribut 0 Fehler, ohne es 1.
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const LAYOUT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', 'app', 'layout.tsx')

describe('G-659 — <html> erlaubt das Modus-Attribut des Bootstrap-Skripts', () => {
  const q = readFileSync(LAYOUT, 'utf8')
  // Nur das oeffnende <html …>-Element — nicht ein Vorkommen irgendwo in der Datei.
  const html = q.match(/<html\b[^>]*>/)?.[0] ?? ''

  it('das Skript setzt data-mode vor der Hydration', () => {
    assert.match(q, /setAttribute\('data-mode'/, 'MODE_BOOTSTRAP setzt data-mode nicht mehr — Pruefung neu ansetzen')
  })

  it('<html> traegt suppressHydrationWarning', () => {
    assert.ok(html.length > 0, '<html> in app/layout.tsx nicht gefunden')
    assert.match(html, /\bsuppressHydrationWarning\b(?!=\{false\})/,
      'ohne suppressHydrationWarning meldet jede Seite ohne Modus-Cookie einen Konsolenfehler')
  })
})
