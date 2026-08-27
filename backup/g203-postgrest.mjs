// G-203, Gegenprobe: dieselbe RPC direkt gegen PostgREST, ohne die
// Anwendung.
//
// `[read]` **Wenn die Zeit dort verschwindet, liegt es nicht am
// Transport** — das ist der Beleg, der die Erklaerungen trennt.
//
// Aufruf: node backup/g203-postgrest.mjs
import { readFileSync } from 'node:fs'

function env(name) {
  for (const p of ['apps/web/.env.local', '.env']) {
    try {
      const z = readFileSync(p, 'utf8').split('\n')
        .find(x => x.startsWith(name + '='))
      if (z) return z.slice(name.length + 1).trim().replace(/^["']|["']$/g, '')
    } catch { /* naechste Datei */ }
  }
  return null
}

const URL_ = env('NEXT_PUBLIC_SUPABASE_URL') ?? env('SUPABASE_URL')
const KEY = env('SUPABASE_SERVICE_ROLE_KEY')
if (!URL_ || !KEY) {
  console.log('Kein Zugang gefunden.')
  process.exit(1)
}

const KONTEN = {
  'dev@lumeos.app': process.argv[2],
  'test-user@lumeos.local': process.argv[3],
}
const HEUTE = new Date().toISOString().slice(0, 10)

for (const [konto, uid] of Object.entries(KONTEN)) {
  if (!uid) continue
  console.log(`\n══ ${konto} ══`)
  for (const [name, gzip] of [['ohne gzip', false], ['mit gzip', true]]) {
    const zeiten = []
    let bytes = 0, roh = 0
    for (let i = 0; i < 4; i++) {
      const t = performance.now()
      const r = await fetch(`${URL_}/rest/v1/rpc/rule_assessment`, {
        method: 'POST',
        headers: {
          apikey: KEY, Authorization: `Bearer ${KEY}`,
          'Content-Type': 'application/json',
          'Content-Profile': 'supplements',
          'Accept-Profile': 'supplements',
          ...(gzip ? { 'Accept-Encoding': 'gzip' } : { 'Accept-Encoding': 'identity' }),
        },
        body: JSON.stringify({ p_user_id: uid, p_entry_date: HEUTE }),
      })
      const text = await r.text()
      zeiten.push(Math.round(performance.now() - t))
      roh = text.length
      bytes = Number(r.headers.get('content-length') ?? 0)
      if (i === 0) {
        console.log(`  ${name}: HTTP ${r.status}`
          + ` · content-encoding=${r.headers.get('content-encoding') ?? '(keins)'}`)
      }
    }
    console.log(`  ${name}: ${zeiten} ms · Nutzlast ${roh} B`
      + (bytes ? ` · content-length ${bytes} B` : ''))
  }
}
