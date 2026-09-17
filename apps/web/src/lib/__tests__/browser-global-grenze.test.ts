// G-470: ein Browser-Objekt auf dem Server wirft erst im Bau.
//
// ══ DER BEFUND ══════════════════════════════════════════════════════
//
// `[cmd]` **Gemessen 2026-09-17 am Produktionsbau:** jeder
// Seitenaufruf warf serverseitig
//
//     ReferenceError: document is not defined
//       at Object.s [as get]        <- `lesen` in client.ts
//       at Object.getItem
//       at rL.__loadSession / rL._recoverAndRefresh / rL._initialize
//
// `[cmd]` **Der Weg:** `app-shell.tsx:257` ruft `createClient()` in
// einem `useMemo` — **und `useMemo` laeuft beim Serveranstrich MIT**,
// anders als `useEffect`. `[cmd]` **`AppShell` steht im
// Wurzel-Layout**, also traf es JEDE Seite.
//
// `[read]` **Im Entwicklungsmodus fiel es NICHT auf** — Next.js
// buendelt dort anders. **Drei Monate lang war der Produktionsbau
// nicht anmeldefaehig, ohne dass ein Waechter es gesehen haette.**
//
// ══ WARUM `client-grenze.test.ts` IHN VERPASST HAT ══════════════════
//
// `[cmd]` **Gemessen: die Datei nennt `document`, `window` und
// `localStorage` kein einziges Mal.** `[read]` **Sie bewacht eine
// ANDERE Grenze:** `Map`/`Set` in den Prop-Signaturen von
// `'use client'`-Komponenten (A-60) — ein Serialisierungsproblem.
//
// `[read]` **Zwei Fragen, ein Name.** **Dieser Waechter ist die
// zweite Frage:** greift jemand auf dem Server nach einem
// Browser-Objekt?
//
// ══ WAS ER PRUEFT ═══════════════════════════════════════════════════
//
// `[read]` **Die WIRKUNG, nicht das Wort.** `[cmd]` **`document` in
// einer Datei zu verbieten waere falsch** — `packages/shared` MUSS
// den Keks im Browser lesen, das ist F-07/G-411. **Gesucht wird ein
// Zugriff OHNE Absicherung.**
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

const WURZEL = path.resolve(process.cwd(), '../..')

/**
 * Die Dateien, die auf dem Server landen KOENNEN.
 *
 * `[read]` **`packages/` ist der gefaehrliche Ort** — er wird von
 * Server- und Clientcode gleichermassen importiert, und niemand sieht
 * der Datei an, wo sie ausgefuehrt wird.
 *
 * `[read]` **`'use client'`-Dateien sind NICHT ausgenommen** — genau
 * das war der Irrtum: **eine Client-Komponente wird beim ersten
 * Anstrich auf dem SERVER gerendert.**
 */
function dateien(): string[] {
  const roh = execFileSync('git', ['ls-files', '--',
    'packages/shared/src/**/*.ts', 'packages/shared/src/**/*.tsx',
  ], { cwd: WURZEL, encoding: 'utf8' })
  return roh.split('\n').map(z => z.trim()).filter(Boolean)
    .filter(z => !z.includes('__tests__'))
}

const lies = (rel: string) => fs.readFileSync(path.join(WURZEL, rel), 'utf8')

/** Kommentare weg — sonst findet der Waechter seine eigene Begruendung. */
function ohneKommentare(q: string): string {
  return q.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
}

/** Die Objekte, die es auf dem Server nicht gibt. */
const GLOBALE = ['document', 'window', 'localStorage', 'sessionStorage']

/**
 * Die HUELLEN — sie laufen auf JEDER Seite.
 *
 * ══ G-471 ═══════════════════════════════════════════════════════════
 *
 * `[cmd]` **Gemessen 2026-09-17 am Produktionsbau:** ein Reiter, der
 * sich gerade angemeldet hat, STIRBT beim Aufruf von `/v2`
 * (`Inspector.targetCrashed`, keine Ausnahme, kein Stapel, 10 MB
 * Speicher). **Ein frischer Reiter ueberlebt dieselbe Route, und die
 * alten Routen ueberleben im selben Reiter.**
 *
 * `[read]` **Die Ursache ist NICHT gefunden** (siehe Bericht G-471).
 * **Aber diese beiden Dateien laufen auf jeder `/v2`-Seite**, und ein
 * Browserzugriff beim Anstrich waere genau die Klasse Fehler, die
 * G-470 ausgeloest hat. **Deshalb werden sie mitbewacht.**
 */
const HUELLEN = [
  'apps/web/src/app/v2/shell.tsx',
  'apps/web/src/components/shell/app-shell.tsx',
]

/**
 * Greift die Funktion um `treffer` herum auf ein Global zu, ohne es
 * vorher zu pruefen?
 *
 * `[read]` **Abgesichert heisst: irgendwo VOR dem Zugriff steht ein
 * `typeof X === 'undefined'`-Rueckfall** — in derselben Funktion.
 */
function abgesichert(text: string, bis: number, global: string): boolean {
  // Den Anfang der umgebenden Funktion suchen.
  const davor = text.slice(0, bis)
  const start = Math.max(
    davor.lastIndexOf('\nfunction '),
    davor.lastIndexOf('\nexport function '),
    davor.lastIndexOf('=> {'),
  )
  const rumpf = davor.slice(start < 0 ? 0 : start)
  const rx = new RegExp(`typeof\\s+${global}\\s*===?\\s*['"]undefined['"]`)
  return rx.test(rumpf)
}

test('G-470: kein ungesicherter Zugriff auf Browser-Objekte in packages/', () => {
  // `[cmd]` **Die Liste selbst wird geprueft** — eine Sabotage, die
  // `GLOBALE` leert, liess die Probe sonst gruen: **kein Objekt zu
  // suchen heisst, nichts zu finden.** `[read]` **Eine leere
  // Erlaubnisliste ist kein bestandener Test, sondern ein
  // abgeschalteter.**
  assert.ok(GLOBALE.includes('document') && GLOBALE.includes('window'),
    'Die Liste der Browser-Objekte ist unvollstaendig — dann sucht '
    + 'der Waechter nach nichts und ist immer gruen.')
  assert.ok(GLOBALE.length >= 4,
    `Nur ${GLOBALE.length} Objekte in der Liste — erwartet sind vier.`)

  const funde: string[] = []
  for (const rel of dateien()) {
    const text = ohneKommentare(lies(rel))
    for (const g of GLOBALE) {
      // `[read]` **Nur ein ZUGRIFF zaehlt** (`document.cookie`), nicht
      // das blosse Wort und nicht `typeof document`.
      const rx = new RegExp(`(?<![A-Za-z0-9_.'"\`])${g}\\s*\\.`, 'g')
      let m: RegExpExecArray | null
      while ((m = rx.exec(text)) !== null) {
        if (abgesichert(text, m.index, g)) continue
        const zeile = text.slice(0, m.index).split('\n').length
        funde.push(`${rel}:${zeile} — ${g}. ohne typeof-Pruefung`)
      }
    }
  }
  assert.deepEqual(funde, [],
    'Ein Browser-Objekt wird ohne Absicherung benutzt. Im '
    + 'Entwicklungsmodus faellt das NICHT auf; im Produktionsbau wirft '
    + 'es `ReferenceError` beim Serveranstrich, und die Anwendung ist '
    + 'nicht mehr anmeldefaehig (G-470). Mit '
    + "`if (typeof document === 'undefined') return` absichern. "
    + 'Gefunden:\n  ' + funde.join('\n  '))
})

test('G-471: die Huellen fassen Browser-Objekte nur in Effekten an', () => {
  // `[read]` **`'use client'` heisst NICHT „nur im Browser"** — beim
  // ersten Anstrich laeuft die Komponente auf dem SERVER. `[cmd]`
  // **Genau so ist G-470 entstanden:** `createClient()` in einem
  // `useMemo`, und der Produktionsbau war nicht mehr anmeldefaehig.
  //
  // `[cmd]` **Die LISTE wird zuerst geprueft** — eine Sabotage, die
  // einen Eintrag entfernt, liess die Probe sonst gruen: **was nicht
  // in der Liste steht, wird nicht gelesen.**
  assert.equal(HUELLEN.length, 2,
    `Nur ${HUELLEN.length} Huelle(n) in der Liste — erwartet sind `
    + 'zwei (v2/shell.tsx und components/shell/app-shell.tsx).')
  for (const h of HUELLEN) {
    assert.ok(fs.existsSync(path.join(WURZEL, h)),
      `Die Huelle ${h} gibt es nicht mehr — die Liste ist veraltet.`)
  }

  // `[read]` **Geprueft wird der ORT des Zugriffs:** in einem
  // `useEffect`/`useCallback` oder einer Ereignisbehandlung ist er
  // richtig — im Rumpf der Komponente oder in einem `useMemo` nicht.
  const funde: string[] = []
  for (const rel of HUELLEN) {
    const text = ohneKommentare(lies(rel))
    for (const g of GLOBALE) {
      const rx = new RegExp(`(?<![A-Za-z0-9_.'"\`])${g}\\s*\\.`, 'g')
      let m: RegExpExecArray | null
      while ((m = rx.exec(text)) !== null) {
        const davor = text.slice(Math.max(0, m.index - 900), m.index)
        const inEffekt = /use(Effect|Callback|LayoutEffect)\s*\(/.test(davor)
          || /function\s+\w*[Hh]andle/.test(davor)
          || /on[A-Z]\w*\s*[:=]/.test(davor)
        if (inEffekt) continue
        if (abgesichert(text, m.index, g)) continue
        const zeile = text.slice(0, m.index).split('\n').length
        funde.push(`${rel}:${zeile} — ${g}. ausserhalb eines Effekts`)
      }
    }
  }
  assert.deepEqual(funde, [],
    'Eine Huelle fasst ein Browser-Objekt beim ANSTRICH an. Die '
    + 'Huellen laufen auf jeder Seite, und beim ersten Anstrich laeuft '
    + 'der Code auf dem SERVER — dort gibt es das Objekt nicht '
    + '(G-470). In einen `useEffect` verschieben oder mit '
    + "`typeof X === 'undefined'` absichern. Gefunden:\n  "
    + funde.join('\n  '))
})

test('G-470: der Waechter misst etwas — Gegenprobe', () => {
  // `[read]` **Ein Waechter, der eine Abwesenheit sichert, ist
  // wertlos, wenn er nicht anschlaegt** (A-62).
  const roh = `
function lesen(name: string): string | undefined {
  const treffer = document.cookie.split('; ')
  return treffer[0]
}
`
  const i = roh.indexOf('document.')
  assert.equal(abgesichert(roh, i, 'document'), false,
    'Ein UNGESICHERTER Zugriff gilt als abgesichert — dann findet '
    + 'der Waechter den Fall aus G-470 nicht.')

  // Und die Gegenrichtung: mit Pruefung darf er NICHT anschlagen.
  const sicher = `
function lesen(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined
  const treffer = document.cookie.split('; ')
  return treffer[0]
}
`
  const j = sicher.lastIndexOf('document.cookie')
  assert.equal(abgesichert(sicher, j, 'document'), true,
    'Ein abgesicherter Zugriff schlaegt an — dann ist der Waechter '
    + 'unbrauchbar, weil die BEHEBUNG rot wird.')

  // `[read]` **Und das blosse Wort in einem Kommentar zaehlt nicht.**
  assert.equal(
    ohneKommentare('// document.cookie lesen\nconst x = 1').includes('document.'),
    false, 'Kommentare werden nicht entfernt.')
})

test('G-470: client-grenze.test.ts bewacht eine ANDERE Grenze', () => {
  // `[read]` **Das ist der eigentliche Befund des Auftrags** — und er
  // gehoert festgehalten, damit niemand die beiden verwechselt.
  //
  // `[cmd]` **Gemessen: `client-grenze.test.ts` nennt keines der vier
  // Browser-Objekte.** **Sie kann den Fall nicht sehen.**
  const andere = lies('apps/web/src/lib/__tests__/client-grenze.test.ts')
  for (const g of GLOBALE) {
    assert.ok(!new RegExp(`\\b${g}\\b`).test(andere),
      `client-grenze.test.ts nennt jetzt \`${g}\` — dann ueberschneiden `
      + 'sich die beiden Waechter, und einer von beiden gehoert '
      + 'entfernt statt doppelt gepflegt.')
  }
  // Und sie prueft weiterhin IHRE Sache.
  assert.match(andere, /Map\|Set\|WeakMap/,
    'client-grenze.test.ts bewacht Map/Set nicht mehr.')
})
