// G-196: Ueberschrift → Bedeutung → Token → Kontrast, hell UND dunkel.
//
// ══ WARUM ZWEI LAEUFE ══════════════════════════════════════════════
//
// `[cmd]` **In G-194 hat das Umschalten im laufenden Fenster nicht
// gewirkt.** `data-mode` zu entfernen genuegt nicht: ein Startskript
// im Layout setzt es sofort neu aus `prefers-color-scheme`. Die
// Messung meldete deshalb zweimal HELL — erkennbar an 1.09 fuer eine
// ungefaerbte Ueberschrift, was auf dunklem Grund unmoeglich ist.
//
// `[read]` **Tom: „gib das der Browsersitzung mit, statt gegen das
// Skript zu arbeiten."** Playwright kann genau das: `colorScheme`
// setzt `prefers-color-scheme` fuer den ganzen Kontext. Das Skript
// bekommt, was es sucht — je Lauf ein eigener Kontext.
//
// Aufruf: node backup/g196-tabelle.mjs
import { chromium } from '@playwright/test'
import { wortFuer } from '../tools/konten.mjs'

const BASIS = 'http://127.0.0.1:3200'
const KONTO = process.env.LUMEOS_KONTO ?? 'test-user@lumeos.local'
// `AC-262356` ist Toms Fall; die anderen decken die uebrigen Reiter.
const SUBSTANZEN = (process.env.G196_SUBSTANZEN
  ?? 'AC-262356,Creatine monohydrate,1-Testosterone,Semaglutide').split(',')

const TOKEN = {
  gefahr: '--warn', wirkung: '--acc', pruefen: '--acc-suppl',
  entwarnung: '--pos', null: '(keins)', undefined: '(keins)',
}

/** Die Messung im Seitenkontext — Canvas erzwingt sRGB. */
const IM_BROWSER = () => {
  const cv = document.createElement('canvas')
  cv.width = cv.height = 1
  const ctx = cv.getContext('2d', { willReadFrequently: true })
  /** Echte sRGB-Bytes samt Alpha — unabhaengig von der Schreibweise. */
  const bytesA = (farbe) => {
    ctx.clearRect(0, 0, 1, 1)
    ctx.fillStyle = 'rgba(0,0,0,0)'
    ctx.fillStyle = farbe
    ctx.fillRect(0, 0, 1, 1)
    const d = ctx.getImageData(0, 0, 1, 1).data
    return [d[0], d[1], d[2], d[3]]
  }
  const bytes = (farbe) => bytesA(farbe).slice(0, 3)
  const lum = ([r, g, bl]) => {
    const f = (v) => {
      const x = v / 255
      return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4)
    }
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(bl)
  }
  const verh = (a, c) => {
    const [h, n] = [lum(a), lum(c)].sort((x, y) => y - x)
    return Math.round(((h + 0.05) / (n + 0.05)) * 100) / 100
  }
  /**
   * Der Grund unter einer Ueberschrift — getoente Flaechen
   * mitgerechnet.
   *
   * `[cmd]` **Die erste Fassung begann bei WEISS** und legte die Kette
   * darauf. Im Dunkelmodus war das falsch: eine 5-%-Toenung ueber
   * „weiss" ergab einen hellen Grund, und `--pos` (0.78) gegen einen
   * erfundenen hellen Grund ergab 4.2 statt der wirklichen ~9. **Der
   * Fehler lag in der Messung, nicht in der Seite.**
   *
   * `[read]` **Jetzt beginnt die Rechnung beim ersten DECKENDEN
   * Grund** — der existiert immer (`.v2-supp-tafel`, sonst `body`) —
   * und legt nur die durchsichtigen Schichten darueber.
   */
  const grund = (e) => {
    // `[cmd]` **`getComputedStyle().backgroundColor` liefert
    // `oklch(0.78 0.13 150 / 0.05)` WOERTLICH.** Die erste Fassung las
    // die Zahlen daraus als RGBA — `0.78, 0.13, 150` als Farbe,
    // `0.05` als Deckung. Daraus wurde ein hellgruener Grund, und
    // `--pos` darauf ergab 4.2 statt der wirklichen 9.4.
    //
    // `[read]` **Deshalb auch fuer Hintergruende der Canvas-Weg** —
    // er gibt echte Bytes samt Alpha, egal in welcher Schreibweise
    // die Farbe notiert ist.
    const schichten = []
    let basis = null
    for (let x = e; x; x = x.parentElement) {
      const [r, g, bl, a255] = bytesA(getComputedStyle(x).backgroundColor)
      const a = a255 / 255
      if (a > 0.99) { basis = [r, g, bl]; break }
      if (a > 0.001) schichten.push({ rgb: [r, g, bl], a })
    }
    if (!basis) {
      const [r, g, bl] = bytesA(getComputedStyle(document.body).backgroundColor)
      basis = [r, g, bl]
    }
    let farbe = basis
    for (const s of schichten.reverse()) {
      farbe = farbe.map((v, i) => Math.round(s.rgb[i] * s.a + v * (1 - s.a)))
    }
    return farbe
  }

  const aus = []
  for (const e of document.querySelectorAll('.v2-eyebrow, .v2-supp-zahl-label, .v2-supp-textkachel-kopf')) {
    const titel = (e.textContent || '').trim()
    if (!titel) continue
    aus.push({
      titel,
      ton: e.getAttribute('data-ton'),
      kontrast: verh(bytes(getComputedStyle(e).color), grund(e)),
      istKachel: e.classList.contains('v2-supp-zahl-label'),
    })
  }
  return {
    modus: document.documentElement.getAttribute('data-mode'),
    bgLum: Math.round(lum(bytes(getComputedStyle(document.body).backgroundColor)) * 1000) / 1000,
    zeilen: aus,
  }
}

async function lauf(modus) {
  const b = await chromium.launch()
  // Der ganze Kontext bekommt das Schema — das Startskript findet
  // vor, was es sucht.
  const s = await b.newContext({
    viewport: { width: 1440, height: 1000 },
    colorScheme: modus === 'hell' ? 'light' : 'dark',
  })
  const p = await s.newPage()
  await p.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
  await p.fill('input[type="email"]', KONTO)
  await p.fill('input[type="password"]', wortFuer(KONTO))
  await p.click('button[type="submit"]')
  await p.waitForURL(u => !u.pathname.includes('/login'), { timeout: 30000 })

  const gefunden = new Map()
  let kopf = null

  for (const name of SUBSTANZEN) {
    await p.goto(`${BASIS}/v2/supplements?tab=database`, { waitUntil: 'networkidle' })
    const suche = p.locator('.v2-supp-suche input, input[type="search"]').first()
    await suche.waitFor({ state: 'visible', timeout: 20000 })
    await suche.fill(name)
    await p.waitForTimeout(700)
    const zeile = p.locator('tbody tr', { hasText: name }).first()
    if (await zeile.count() === 0) { console.log(`  (${name} nicht gefunden)`); continue }
    await zeile.click()
    await p.waitForTimeout(900)

    const reiter = p.locator('.v2-supp-reiter-knopf')
    const n = await reiter.count()
    for (let i = 0; i < n; i++) {
      await reiter.nth(i).click()
      await p.waitForTimeout(320)
      const d = await p.evaluate(IM_BROWSER)
      kopf = kopf ?? { modus: d.modus, bgLum: d.bgLum }
      for (const z of d.zeilen) if (!gefunden.has(z.titel)) gefunden.set(z.titel, z)
    }
  }
  await b.close()
  return { kopf, zeilen: [...gefunden.values()] }
}

for (const modus of ['dunkel', 'hell']) {
  const { kopf, zeilen } = await lauf(modus)
  const echt = kopf?.bgLum > 0.5 ? 'HELL' : 'DUNKEL'
  console.log(`\n══ ${modus} — data-mode="${kopf?.modus}", `
    + `Grundhelligkeit ${kopf?.bgLum} → ${echt} ══`)
  console.log(`${'Ueberschrift'.padEnd(32)}${'Bedeutung'.padEnd(12)}`
    + `${'Token'.padEnd(14)}Kontrast`)
  const sortiert = zeilen.sort((a, c) =>
    String(a.ton).localeCompare(String(c.ton)) || a.titel.localeCompare(c.titel))
  for (const z of sortiert) {
    console.log(`${(z.istKachel ? '· ' : '') + z.titel.slice(0, 30).padEnd(32 - (z.istKachel ? 2 : 0))}`
      + `${String(z.ton ?? '—').padEnd(12)}`
      + `${TOKEN[String(z.ton)].padEnd(14)}`
      + `${String(z.kontrast).padStart(6)}${z.kontrast < 4.5 ? ' !' : ''}`)
  }
  const ohne = sortiert.filter(z => !z.ton).length
  console.log(`\n  ${sortiert.length} Ueberschriften, davon ${ohne} ohne Farbe`)
}
console.log('\n! = unter 4.5:1   · = Kachelbeschriftung')
