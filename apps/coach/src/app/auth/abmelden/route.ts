// Abmelden aus dem Portal — G-402/A11.
//
// **Tom, 2026-09-10:** *„links unten user logged in"* — die
// Nutzerzeile der Seitenleiste nimmt ein `userMenu`, und dort gehoert
// der Abmeldeknopf hin.
//
// `[read]` **Ohne diese Route waere der Knopf eine Attrappe** — er
// zeigte auf nichts, und C-426 verbietet genau das. `[cmd]` **Gebaut
// nach dem Muster von `auth/callback/route.ts`** in derselben
// Anwendung.
//
// `[cmd]` **POST, nicht GET** — eine Abmeldung aendert den Zustand.
// `[read]` **Ein Vorabruf des Browsers duerfte niemanden abmelden**,
// und genau das koennte bei GET passieren.
import { NextResponse } from 'next/server'
import { createSessionClient } from '@lumeos/shared/session'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const supabase = createSessionClient()
  await supabase.auth.signOut()
  // `[read]` **Zur Anmeldung, nicht zur Wurzel** — `middleware.ts`
  // schickte von dort ohnehin weiter, aber ein Umweg mehr ist ein
  // Blinken mehr.
  return NextResponse.redirect(new URL('/login', new URL(request.url).origin), {
    // 303: der Browser soll dem Ziel mit GET folgen, nicht das POST
    // wiederholen.
    status: 303,
  })
}
