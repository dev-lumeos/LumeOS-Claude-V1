/**
 * G-518 — `next build` darf nicht in das Verzeichnis des Dev-Servers.
 *
 * `[cmd]` **B-18 (2026-08-06) hat die Trennung gebaut:** das Gate
 * setzt `LUMEOS_DIST_DIR=.next-gate`, der Dev-Server bleibt auf
 * `.next`. `[read]` **Die Trennung ist dicht — sie laesst sich nur
 * umgehen:** wer `next build` DIREKT ruft statt `pnpm build`,
 * bekommt die Variable nicht und schreibt nach `.next`.
 *
 * `[cmd]` **Gemessen am 2026-09-27 in `apps/web`:**
 *
 *     .next/BUILD_ID        9Gr-DMlsJLyVv6vA_Zhks
 *     .next-gate/BUILD_ID   M191AWaoOQ5UC1-_xp4al
 *
 * **Zwei verschiedene Baulaeufe, einer davon im Verzeichnis des
 * laufenden Dev-Servers.** `[cmd]` **Danach lagen 22 gehashte
 * Bau-Chunks neben 4 Dev-Buendeln**, und die Manifeste gehoerten
 * nur einer der beiden Generationen — **der 404-Zustand, den Tom
 * am 2026-09-08 und am 2026-09-27 gemeldet hat.**
 *
 * `[read]` **Warum es zweimal nicht gefunden wurde:** der
 * Dev-Server schreibt die Manifeste beim naechsten Uebersetzen neu
 * und repariert sich selbst. **Ein Neustart zeigt Gruen — und
 * loescht den Beweis.**
 *
 * `[read]` **Die Sperre greift NUR beim Bauen.** `next dev` braucht
 * `.next` und bleibt unberuehrt, `next start` liest nur.
 *
 * `[read]` **Eine Stelle fuer drei Anwendungen** — drei Kopien
 * waeren drei Stellen, an denen die Regel altern kann.
 */
function pruefeDistDir(app) {
  const baut = process.env.NODE_ENV === 'production'
    && process.argv.some(a => a === 'build')
  if (!baut) return

  // ── N1: den WERT pruefen, nicht die Anwesenheit ─────────────────
  //
  // `[cmd]` **Die erste Fassung fragte nur `if
  // (process.env.LUMEOS_DIST_DIR) return`.** `[read]` **Damit ging
  // `LUMEOS_DIST_DIR=.next next build` durch und richtete genau den
  // Schaden an, gegen den die Sperre steht** — **die Variable war
  // gesetzt, also schwieg sie.**
  //
  // `[read]` **Gemeint ist nicht *,,ist eine Variable da"*, sondern
  // *,,zeigt sie irgendwohin ausser auf das Verzeichnis des
  // Dev-Servers"*.**
  const ziel = (process.env.LUMEOS_DIST_DIR ?? '').trim()

  // `[read]` **Auf `.next` zeigt auch `./.next`, `.next/`,
  // `.\.next` und `apps/web/.next`** — verglichen wird deshalb der
  // normalisierte letzte Abschnitt, nicht die Zeichenkette.
  const zeigtAufDotNext = (() => {
    if (ziel === '') return true               // gar nicht gesetzt
    const n = ziel.replace(/\\/g, '/').replace(/\/+$/, '')
    const letzter = n.slice(n.lastIndexOf('/') + 1)
    return letzter === '.next'
  })()

  if (!zeigtAufDotNext) return

  const wie = ziel === ''
    ? 'ohne LUMEOS_DIST_DIR'
    : `mit LUMEOS_DIST_DIR=${ziel}`

  throw new Error(
    `\n\n[G-518] \`next build\` ${wie} wuerde in apps/${app}/.next `
    + 'schreiben — in das Verzeichnis, aus dem der Dev-Server '
    + 'ausliefert.\n'
    + 'Der Bau raeumt es ab; der Dev-Server liefert danach 404 auf '
    + 'main-app.js und app-pages-internals.js.\n\n'
    + `Statt dessen:  pnpm --filter @lumeos/${app} build\n`
    + '(geht ueber scripts/gate-build.js und schreibt nach .next-gate)\n\n'
    + 'Oder bewusst:  LUMEOS_DIST_DIR=.next-gate next build\n\n'
    + 'Zustand pruefen:  node tools/next-zustand.mjs\n',
  )
}

module.exports = { pruefeDistDir }
