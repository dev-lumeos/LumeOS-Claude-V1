// Der Weg hinaus — G-411.
//
// **Tom, 2026-09-08:** *„ich bin als coach angemeldet, weil ich
// dieses login auf 3220 verwendet habe. wie log ich mich aus und
// wie ein?"*
//
// ══ WAS DIESE PROBEN MESSEN ════════════════════════════════════════
//
// `[read]` **Nicht, dass die Abmeldung funktioniert** — das ist am
// Schirm gemessen (`tools/_g411-abmelden.mjs`: Cookie weg, Ziel
// `/login`). `[read]` **Sondern, dass die ENTSCHEIDUNGEN stehen
// bleiben:** POST statt GET, und ein Knopf, der auch da ist.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const HIER = dirname(fileURLToPath(import.meta.url))
const WURZEL = join(HIER, '..', '..', '..', '..', '..')
const WEB = join(WURZEL, 'apps', 'web', 'src')

/** Kommentarzeilen weg — sonst findet eine Probe ihre Begruendung. */
function ohneKommentar(pfad: string): string {
  return readFileSync(pfad, 'utf8').split('\n')
    .filter(z => !z.trim().startsWith('//') && !z.trim().startsWith('*'))
    .join('\n')
}

test('die Abmelde-Route nimmt POST und weist GET ab', () => {
  // `[read]` **Eine Abmeldung aendert den Zustand.** `[cmd]` **Bei
  // GET koennte ein `<img src="/auth/abmelden">` jeden Leser
  // abmelden** — am Schirm gemessen: angemeldet, GET -> 405, Cookie
  // bleibt.
  const pfad = join(WEB, 'app', 'auth', 'abmelden', 'route.ts')
  assert.ok(existsSync(pfad), 'apps/web hat keine Abmelde-Route')
  const t = ohneKommentar(pfad)

  assert.match(t, /export async function POST/)
  assert.match(t, /signOut\(\)/)
  // GET muss ABWEISEN, nicht abmelden.
  assert.match(t, /export function GET/)
  assert.match(t, /status:\s*405/)
  const get = t.slice(t.indexOf('export function GET'))
  assert.ok(!get.includes('signOut'),
    'GET darf nicht abmelden — sonst ist die Trennung wirkungslos.')
})

test('die Nutzerzeile bekommt ein userMenu', () => {
  // `[cmd]` **`packages/ui/src/shell/sidebar.tsx:87`:** *„Menue
  // rechts unten, z. B. Abmelden. Ohne Angabe fehlt der Knopf."*
  // `[read]` **Und genau so war es.**
  const t = ohneKommentar(join(WEB, 'app', 'v2', 'shell.tsx'))
  assert.match(t, /userMenu=\{/)
  // Der Knopf schickt per Formular, nicht per onClick — sonst
  // braeuchte er JavaScript, und die Route nimmt nur POST.
  assert.match(t, /action="\/auth\/abmelden"/)
  assert.match(t, /method="post"/)
})

test('die Anmeldung benutzt v2-Bausteine, keine Tailwind-Marken', () => {
  // **Tom:** *„und das login muss auf v2 normal laufen."*
  //
  // `[cmd]` **Vorher am Schirm gemessen: 0 v2-Klassen, 8
  // Tailwind-Marken.** `[cmd]` **Nachher: 12 v2-Klassen, 0
  // Tailwind.**
  const t = ohneKommentar(join(WEB, 'components', 'auth', 'login-form.tsx'))
  for (const b of ['v2-card', 'v2-feld', 'v2-btn', 'v2-btn-primary']) {
    assert.ok(t.includes(b), `${b} fehlt in der Anmeldung`)
  }
  // Die Marken, die der Auftrag nennt.
  for (const alt of ['rounded-token', 'text-fg-muted', 'bg-bg-elev', 'bg-[var(--acc)]']) {
    assert.ok(!t.includes(alt), `Tailwind-Marke „${alt}" steht noch da`)
  }
})

test('die Anmeldeseite laedt die v2-Regeln', () => {
  // `[cmd]` **Am Schirm gefunden:** die Klassen standen da, die
  // Regeln fehlten — `@lumeos/ui/styles.css` wird nur in
  // `app/v2/layout.tsx` geladen, und `/login` liegt ausserhalb.
  //
  // `[read]` **Ohne diese Zeile ist die Anmeldung unformatiert**,
  // und die Probe darueber waere trotzdem gruen.
  const t = ohneKommentar(join(WEB, 'app', 'login', 'page.tsx'))
  assert.match(t, /@lumeos\/ui\/styles\.css/)
})

test('der Browser-Client traegt die Cookie-Umsetzung', () => {
  // **BEFUND F-07**, am Schirm belegt: `apps/admin` liess sich NICHT
  // anmelden — `Cannot read properties of undefined (reading 'get')`.
  //
  // `[cmd]` **Ursache:** `createBrowserClient` bekam `cookieOptions`
  // ohne `cookies`; in `@supabase/ssr` 0.1.0 wird der Vorgabewert
  // dabei mit `undefined` ueberschrieben.
  //
  // `[read]` **Betroffen ist jede App MIT Scope** — ohne Scope
  // entfaellt das Options-Objekt. **Deshalb lief apps/web immer.**
  const pfad = join(WURZEL, 'packages', 'shared', 'src', 'supabase', 'client.ts')
  const t = ohneKommentar(pfad)
  assert.match(t, /cookies:\s*\{/,
    'Ohne `cookies` wirft @supabase/ssr 0.1.0, sobald ein Scope gesetzt ist.')
  assert.match(t, /storageKey:\s*cookieOptions\.name/,
    'Ohne storageKey schriebe der Browser den web-Namen.')
})

test('keine App baut den Browser-Client ein zweites Mal', () => {
  // `[read]` **`apps/coach` hatte eine eigene Fassung, solange F-07
  // offen war.** `[cmd]` **Jetzt steht die Umsetzung im Paket** —
  // eine zweite waere wieder eine Stelle, die altert.
  const kopie = join(WURZEL, 'apps', 'coach', 'src', 'lib', 'browser-client.ts')
  if (!existsSync(kopie)) return
  const t = ohneKommentar(kopie)
  assert.ok(!t.includes('createBrowserClient'),
    'Die Kopie baut den Client wieder selbst — sie soll nur verweisen.')
  assert.match(t, /export \{ createClient \} from '@lumeos\/shared'/)
})
