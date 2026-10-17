// G-657: die Kontextleiste ist eingeklappt, wenn die Anwendung es sagt.
// Ohne Angabe bleibt sie offen (apps/coach).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { renderToStaticMarkup } from 'react-dom/server'
import * as React from 'react'
import { AppShell } from '@lumeos/ui'

const Lnk = (p: Record<string, unknown>) => React.createElement('a', p)
const zeichne = (extra: Record<string, unknown>) => renderToStaticMarkup(
  React.createElement(AppShell, {
    pathname: '/v2/goals', linkAs: Lnk,
    context: { buddyMessage: 'BUDDYTEXT', details: [] },
    ...extra,
  }, 'Inhalt'))

test('eingeklappt: keine Spalte, Raster zweispaltig, Knopf steht', () => {
  const html = zeichne({ contextDefaultOpen: false })
  assert.match(html, /data-rightpanel="hidden"/)
  assert.doesNotMatch(html, /BUDDYTEXT/)
  assert.match(html, /title="Kontextspalte umschalten"[^>]*aria-expanded="false"|aria-expanded="false"[^>]*title="Kontextspalte umschalten"/)
})

test('ohne Angabe offen wie bisher', () => {
  const html = zeichne({})
  assert.doesNotMatch(html, /data-rightpanel/)
  assert.match(html, /BUDDYTEXT/)
})

test('apps/web gibt die gemerkte Wahl weiter, Vorgabe eingeklappt', async () => {
  const { readFileSync } = await import('node:fs')
  const p = (f: string) => readFileSync(new URL(`../../../app/v2/${f}`, import.meta.url), 'utf8')
  assert.match(p('shell.tsx'), /contextDefaultOpen=\{kontextOffen\}/)
  assert.match(p('layout.tsx'), /kontextOffen=\{await ladeKontextOffen\(\)\}/)
  // ohne Zeile, ohne Sitzung, ohne `offen: true` → zu
  assert.match(p('kontextleiste.ts'), /if \(!user\) return false/)
  assert.match(p('kontextleiste.ts'), /\?\.offen === true/)
})
