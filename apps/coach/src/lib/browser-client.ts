// Der Browser-Client des Portals — seit G-411 nur noch ein Verweis.
//
// ══ WARUM DIESE DATEI EINMAL EXISTIERTE ════════════════════════════
//
// **BEFUND F-07:** `createClient()` aus `packages/shared` uebergab an
// `createBrowserClient` ein Options-Objekt mit `cookieOptions`, aber
// ohne `cookies`. In `@supabase/ssr` 0.1.0 ueberschreibt die
// Destrukturierung `({ cookies, ... } = options)` den Vorgabewert mit
// `undefined`, und `typeof cookies.get` wirft beim ersten Speichern
// der Sitzung.
//
// `[read]` **Deshalb hatte das Portal eine eigene Umsetzung** — mit
// dem Vermerk *„apps/admin nutzt denselben Pfad und waere zu
// pruefen"*.
//
// ══ G-411: GEPRUEFT, UND DER BEFUND TRAF ZU ════════════════════════
//
// `[cmd]` **Am Schirm gemessen 2026-09-10: `apps/admin` liess sich
// NICHT anmelden** — kein Cookie, obige Ausnahme in der Konsole.
//
// `[cmd]` **Die Umgehung steht jetzt in
// `packages/shared/src/supabase/client.ts`** — dort, wo sie jeder App
// hilft, die einen Cookie-Scope setzt. `[cmd]` **Danach gemessen:
// admin meldet sich an (`sb-127-admin-auth-token`), web und coach
// unveraendert.**
//
// `[read]` **Die Datei bleibt als Wegweiser stehen** — wer den alten
// Pfad sucht, findet hier den Grund, warum es ihn nicht mehr gibt.
// **Sie hat keinen Aufrufer mehr** (gemessen).
export { createClient } from '@lumeos/shared'
