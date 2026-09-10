// Abmelden aus LumeOS — G-411/A1.
//
// **Tom, 2026-09-08:** *„ich bin als coach angemeldet, weil ich
// dieses login auf 3220 verwendet habe. wie log ich mich aus und
// wie ein?"*
//
// ══ DER BEFUND ═════════════════════════════════════════════════════
//
// `[cmd]` **`apps/web/src/app` fuehrte KEINE Abmelde-Route** — nur
// `/auth/callback`. `[cmd]` **`apps/coach` hat sie seit G-402.**
//
// `[read]` **Die Nutzerzeile zeigte Namen und Zustand *angemeldet*
// — aber es gab keinen Weg hinaus** ausser ueber die
// Entwicklerwerkzeuge.
//
// ══ POST, NICHT GET ════════════════════════════════════════════════
//
// `[read]` **Eine Abmeldung aendert den Zustand.** `[cmd]` **Bei GET
// koennte sie ein Bild, ein Vorabruf des Browsers oder eine
// Vorschau ausloesen** — jemand verlinkt `<img src="/auth/abmelden">`
// und meldet damit jeden Leser ab.
//
// `[cmd]` **Gebaut nach `apps/coach/src/app/auth/abmelden/route.ts`**
// — dieselbe Form, damit beide Anwendungen sich gleich verhalten.
import { NextResponse } from 'next/server'
import { createSessionClient } from '@lumeos/shared/session'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const supabase = createSessionClient()
  await supabase.auth.signOut()
  // `[read]` **Zur Anmeldung, nicht zur Wurzel** — von dort schickt
  // die Middleware ohnehin weiter, aber ein Umweg mehr ist ein
  // Blinken mehr.
  return NextResponse.redirect(new URL('/login', new URL(request.url).origin), {
    // 303: der Browser soll dem Ziel mit GET folgen, nicht das POST
    // wiederholen.
    status: 303,
  })
}

/**
 * GET wird abgewiesen — G-411/A1.
 *
 * `[read]` **Ohne diese Funktion antwortet Next mit 405**, und das
 * waere schon richtig. `[cmd]` **Sie steht hier trotzdem**, weil
 * die Gegenprobe sonst nur Nexts Vorgabe misst und nicht die
 * Entscheidung — und weil ein spaeterer `GET`-Export dann
 * auffaellt.
 */
export function GET() {
  return new NextResponse(
    'Abmelden erwartet POST — ein GET waere von einem Bild oder '
    + 'einem Vorabruf ausloesbar.',
    { status: 405, headers: { Allow: 'POST' } },
  )
}
