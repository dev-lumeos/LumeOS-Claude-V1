/** @type {import('next').NextConfig} */

// B-18 (2026-08-06): Build-Verzeichnis ueber LUMEOS_DIST_DIR waehlbar.
// Anlass: `next dev` und der Gate-Build teilten sich `.next`. Der Build
// raeumt `.next` beim Start ab und schreibt es neu, waehrend der laufende
// Dev-Server dieselben Dateien fortschreibt — dazwischen las `tsc` die in
// tsconfig `include` gelistete `.next/types/**` und brach mit TS6053 ab
// ("File '.../.next/types/app/layout.ts' not found"), zweimal belegt am
// 2026-08-05, erneut reproduziert am 2026-08-06.
// Das Gate setzt LUMEOS_DIST_DIR=.next-gate (siehe apps/web/package.json),
// der Dev-Server bleibt ohne die Variable auf `.next`. Beide Verzeichnisse
// existieren nebeneinander; keiner raeumt das des anderen ab.
// Wichtig: tsconfig.json listet BEIDE types-Pfade im `include`, sonst waere
// das Problem nur verschoben statt geloest.
//
// Die Trennung allein GENUEGT NICHT — [cmd] 2026-08-06 belegt: danach trat
// TS6053 weiter auf, nur mit .next-gate-Pfaden (3 von 5 Laeufen rot). Zweite
// Ursache war die Nebenlaeufigkeit INNERHALB des Gates: turbo liess
// typecheck und build desselben Pakets gleichzeitig laufen, der Build raeumte
// .next-gate/types ab, waehrend tsc daraus las. Erst `dependsOn: ["^build",
// "build"]` bei typecheck (turbo.json) macht das Gate stabil — [cmd] 6 von 6
// Laeufen gruen bei laufendem Dev-Server. Beide Teile gehoeren zusammen.
const distDir = process.env.LUMEOS_DIST_DIR || '.next'

const nextConfig = {
  distDir,
  transpilePackages: ['@lumeos/shared'],
  experimental: {
    typedRoutes: true,
  },
}

// A-14: next-intl. Der Pfad zeigt auf die Anfragekonfiguration; ohne
// ihn sucht das Plugin unter `./i18n/request.ts` relativ zur Wurzel.
// [read] KEIN Routing je Sprache — die Sprache kommt aus einem Cookie,
// die Adresse bleibt ohne Praefix. Begruendung: docs/ssot/88-i18n.md.
const withNextIntl = require('next-intl/plugin')('./src/i18n/request.ts')

module.exports = withNextIntl(nextConfig)
