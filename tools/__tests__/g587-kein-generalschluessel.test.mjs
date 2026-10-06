// G-587 — der Generalschluessel hat im App-Code nichts verloren.
//
// `[cmd]` **Bis 2026-10-06 bauten zwei Stellen einen Client mit
// `SUPABASE_SERVICE_ROLE_KEY`**, beide ohne Aufrufer:
// `createServiceClient()` in `packages/shared/src/supabase/server.ts`
// und `wissenService()` in `apps/web/src/lib/supplements/substanz-read.ts`
// — die zweite las den Schluessel notfalls aus `.env` von der Platte.
// **Ein solcher Client umgeht die Zeilensicherheit (RLS)**; ein Aufrufer
// waere eine Zeile entfernt gewesen. Tom, 06.10.: entfernen.
//
// `[read]` **Ausnahmeliste leer** — wer den Schluessel in `apps/*/src`
// oder `packages/*/src` braucht, braucht vorher eine Entscheidung.
//
// `[read]` **Die Pruefung wird gerufen, nicht nur gegen das Repo
// gehalten:** eine Attrappe zeigt, dass sie einen Fund ueberhaupt
// sieht, und die Untergrenze der Dateizahl, dass sie am richtigen
// Ort sucht (ein falscher Wurzelpfad ist sonst gruen).
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import test from 'node:test'

const NAME = 'SERVICE_ROLE_KEY'

/** Alle Dateien unter `apps/*\/src` und `packages/*\/src`, und wo der Name steht. */
function fundstellen(wurzel) {
  const dateien = []
  const lauf = (p) => {
    for (const e of fs.readdirSync(p, { withFileTypes: true })) {
      if (e.name === 'node_modules' || e.name === '.next') continue
      const q = path.join(p, e.name)
      if (e.isDirectory()) lauf(q)
      else dateien.push(q)
    }
  }
  for (const oben of ['apps', 'packages']) {
    const o = path.join(wurzel, oben)
    if (!fs.existsSync(o)) continue
    for (const e of fs.readdirSync(o)) {
      const src = path.join(o, e, 'src')
      if (fs.existsSync(src) && fs.statSync(src).isDirectory()) lauf(src)
    }
  }
  const treffer = dateien
    .filter(d => fs.readFileSync(d, 'utf8').includes(NAME))
    .map(d => path.relative(wurzel, d).split(path.sep).join('/'))
  return { dateien: dateien.length, treffer }
}

test('kein SERVICE_ROLE_KEY in apps/*/src und packages/*/src', () => {
  const { dateien, treffer } = fundstellen(process.cwd())
  // Gemessen 2026-10-06: 857 Dateien. Die Grenze liegt darunter, damit
  // geloeschte Dateien nicht rot werden — aber weit ueber null.
  assert.ok(dateien > 600, `nur ${dateien} Dateien gelesen — falscher Ort?`)
  assert.deepEqual(treffer, [],
    'Der Generalschluessel steht im App-Code. Er umgeht die '
    + 'Zeilensicherheit — G-587, Ausnahmeliste leer.')
})

test('die Pruefung sieht einen Fund in apps und in packages, nicht daneben', () => {
  const w = fs.mkdtempSync(path.join(tmpdir(), 'g587-'))
  try {
    const leg = (rel, text) => {
      fs.mkdirSync(path.dirname(path.join(w, rel)), { recursive: true })
      fs.writeFileSync(path.join(w, rel), text)
    }
    leg('apps/a/src/lib/x.ts', 'process.env.SUPABASE_SERVICE_ROLE_KEY\n')
    leg('packages/p/src/y.ts', "env['NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY']\n")
    leg('apps/a/src/z.ts', 'const ok = 1\n')
    leg('apps/a/node_modules/m/src/n.ts', 'SUPABASE_SERVICE_ROLE_KEY\n')
    leg('apps/a/scripts/s.mjs', 'SUPABASE_SERVICE_ROLE_KEY\n')
    const { dateien, treffer } = fundstellen(w)
    assert.equal(dateien, 3)
    assert.deepEqual(treffer.sort(), ['apps/a/src/lib/x.ts', 'packages/p/src/y.ts'])
  } finally {
    fs.rmSync(w, { recursive: true, force: true })
  }
})
