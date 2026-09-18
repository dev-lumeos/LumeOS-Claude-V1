// G-464 — was die Produkttafel WIRKLICH zeigt.
//
// Aufruf:  node tools/_g464-tafel.mjs <produkt-id> <foto|->
//
// [read] Gemessen wird der Schirm, nicht der Quelltext: welche
// Ueberschrift welche Zutat traegt, und welche Zeile die Marke
// „auswertbar" bekommt. Toms Befund war genau ein Widerspruch
// zwischen beidem.
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'

const KONTO = process.env.LUMEOS_KONTO ?? 'dev@lumeos.app'
const BASIS = 'http://127.0.0.1:3200'
const NAME = process.argv[2] ?? 'Serious Mass Vanilla'
// [cmd] Der Name reicht NICHT: „Serious Mass Vanilla" gibt es
// mehrfach, und der erste Treffer war ein anderes Produkt mit 10
// statt 85 Zeilen — gemessen 0 markierte und kein Calcium.
// [read] Deshalb entscheidet die ID, welche Zeile geklickt wird.
// Die erwartete Zeilenzahl macht das Produkt eindeutig.
const ZEILEN = Number(process.argv[4] ?? 85)
const FOTO = process.argv[3] && process.argv[3] !== '-' ? process.argv[3] : null

const b = await chromium.launch({ headless: true })
const k = await b.newContext({ viewport: { width: 1600, height: 1200 } })
const s = await k.newPage()
const fehler = []
s.on('pageerror', e => fehler.push('PAGEERROR: ' + e.message.slice(0, 200)))

await s.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
if (await s.locator('input[type=email]').count()) {
  await s.fill('input[type=email]', KONTO)
  await s.fill('input[type=password]', wortFuer(KONTO))
  await Promise.all([
    s.waitForURL(u => !u.pathname.includes('login')),
    s.click('button[type=submit]'),
  ])
}

// [cmd] Die Tafel kennt KEINEN Adressparameter — sie oeffnet sich
// per Klick auf die Zeile (`schalteZeile`). Gemessen 2026-09-17.
// [read] Also wird gesucht und geklickt, wie ein Nutzer es taete.
const r = await s.goto(`${BASIS}/v2/supplements?tab=produkte`,
  { waitUntil: 'networkidle' })
await s.waitForTimeout(1500)
// ══ AUF DIE GEFILTERTE LISTE WARTEN ══════════════════════════════
//
// [cmd] `fill()` allein reichte NICHT: die Liste blieb unveraendert
// alphabetisch („The Original" HerbaGreen Tea …), und jeder Klick
// traf ein beliebiges Produkt. So entstanden die Messungen an
// `QUICKMASS Vanilla`, die wie ein Widerspruch zum Leseweg aussahen.
//
// [read] Getippt statt gefuellt (die Suche haengt an `onChange`),
// und gewartet, bis der NAME in der Liste steht — nicht nur, bis
// irgendeine Zeile da ist.
const suchfeld = s.locator('input[aria-label="Produkt suchen"]')
await suchfeld.click()
await suchfeld.fill('')
await suchfeld.type(NAME, { delay: 25 })
await s.waitForFunction((n) => {
  const z = Array.from(document.querySelectorAll('.v2-tbl tbody tr'))
  return z.length > 0 && z.every(r => (r.textContent ?? '').includes(n))
}, NAME, { timeout: 30000 }).catch(() => {})
await s.waitForTimeout(1200)
// ══ DIE ZEILE MIT DEM GENAUEN NAMEN ══════════════════════════════
//
// [cmd] Durch alle Zeilen zu klicken, bis die Zeilenzahl passt, hat
// zweimal das falsche Produkt getroffen (`QUICKMASS Vanilla` hat
// ebenfalls 85 Zeilen) — und liess Tafeln offen stehen, sodass die
// Messung Zeilen aus zwei Produkten summierte.
//
// [read] Jetzt wird EINE Zeile geklickt: die erste, deren Name
// genau passt. Welches Produkt offen ist, meldet die Messung selbst.
const namenInListe = await s.evaluate(() =>
  Array.from(document.querySelectorAll('.v2-tbl tbody tr'))
    .slice(0, 12)
    .map(z => z.querySelector('td div')?.textContent.trim() ?? ''))
console.log('TREFFERLISTE:', JSON.stringify(namenInListe))
const zeilen = s.locator('.v2-tbl tbody tr', { hasText: NAME })
const anzahl = await zeilen.count()
let geklickt = -1
if (anzahl > 0) {
  await zeilen.first().click({ timeout: 15000 })
  await s.waitForSelector('.v2-supp-prod-zutat', { timeout: 30000 }).catch(() => {})
  await s.waitForTimeout(1500)
  geklickt = 0
}

const m = await s.evaluate(() => {
  // ══ NUR EINE TAFEL MESSEN ════════════════════════════════════════
  //
  // [cmd] Beim Durchklicken bleiben vorige Tafeln im Baum. Die
  // Messung zaehlte dann Zeilen aus ZWEI Produkten: erst „57 von
  // 85", dann „60 von 95" — waehrend die Route unveraendert 62 von
  // 85 lieferte. [read] Die Zahl war echt, die Grundgesamtheit nicht.
  const tafeln = Array.from(document.querySelectorAll('.v2-supp-prod-buendel'))
  const tafel = tafeln[tafeln.length - 1] ?? null
  if (!tafel) return { fehler: 'keine Tafel offen', offeneTafeln: 0 }
  const abschnitte = Array.from(
    tafel.querySelectorAll('.v2-supp-prod-abschnitt'))
  const gruppen = abschnitte.map(a => {
    const titel = a.querySelector('.v2-eyebrow')?.textContent.trim()
      ?? a.firstElementChild?.textContent.trim() ?? '?'
    const zeilen = Array.from(a.querySelectorAll('.v2-supp-prod-zutat'))
      .map(z => ({
        name: z.querySelector('.v2-supp-prod-zutat-name')
          ?.textContent.replace('↳', '').trim(),
        // Die Marke ist die Sache, um die es geht.
        markiert: !!z.querySelector('.v2-supp-prod-zutat-marke'),
      }))
    return { titel, anzahl: zeilen.length, zeilen }
  })
  const alle = gruppen.flatMap(g => g.zeilen)
  return {
    gruppen: gruppen.map(g => ({ titel: g.titel, anzahl: g.anzahl })),
    zeilenGesamt: alle.length,
    markiert: alle.filter(z => z.markiert).length,
    // Toms sechs Zutaten, je mit Gruppe und Marke.
    toms: gruppen.flatMap(g => g.zeilen
      .filter(z => /^(Calcium|Vitamin C|Iron|Zinc|Thiamin|Biotin|Vitamin A|Total Fat|Protein)$/i
        .test(z.name ?? ''))
      .map(z => ({ name: z.name, gruppe: g.titel, markiert: z.markiert }))),
    // [read] Welche Zeilen sind NICHT markiert? Die Namensliste
    // sagt, ob der Unterschied zum Leseweg an bestimmten Zutaten
    // haengt — eine blosse Zahl sagt es nicht.
    ohneMarke: alle.filter(z => !z.markiert).map(z => z.name),
    // [read] WELCHES Produkt steht offen? Zwei heissen gleich und
    // haben 85 bzw. 46 Zeilen — der Name im Kopf der Tafel sagt es
    // nicht, die Id schon.
    // [read] Der Zaehler der Tafel rechnet aus DENSELBEN Daten
    // (`bekanntZaehlen`) — weicht er von den gezaehlten Marken ab,
    // liegt der Fehler in der Anzeige, nicht im Leseweg.
    // [cmd] Die Route DIREKT fragen, im selben Browser, mit
    // derselben Sitzung — und mit der Id des offenen Produkts.
    // [read] Weicht sie vom Schirm ab, rendert die Tafel anders,
    // als sie liest.
    // [read] Wie viele Tafeln stehen offen? Mehr als eine heisst:
    // die Zahlen oben beschreiben mehrere Produkte.
    offeneTafeln: tafeln.length,
    zaehler: (tafel.parentElement?.textContent ?? '').match(
      /(\d+)\s+von\s+(\d+)\s+Zutaten kennt LumeOS/)?.slice(1, 3) ?? [],
    offenerName: document.querySelector('.v2-supp-prod-kopf-name')
      ?.textContent.trim()
      ?? document.querySelector('.v2-supp-tafel-zeile')?.getAttribute('data-id')
      ?? null,
    // A4: wie oft steht derselbe Name da?
    doppelte: (() => {
      const z = new Map()
      for (const x of alle) z.set(x.name, (z.get(x.name) ?? 0) + 1)
      return {
        verschiedeneNamen: z.size,
        inDubletten: [...z.values()].filter(n => n > 1)
          .reduce((a, n) => a + n, 0),
      }
    })(),
  }
})

// [read] Gegenprobe: dieselbe Route, derselbe Browser.
const direkt = await s.evaluate(async () => {
  const a = await fetch('/api/supplements/produkt?id=0351cf6e-efb6-4960-bd85-caaceb73cba2')
  const j = await a.json()
  const i = j?.satz?.inhalt ?? []
  return { zeilen: i.length, markiert: i.filter(z => z.bekannt).length }
})
console.log('DIREKT ueber die Route:', JSON.stringify(direkt))

if (FOTO) {
  // [read] Die UEBERSCHRIFTEN sind die Aussage von A3 — ohne sie
  // zeigt das Bild Zeilen ohne Gruppe. Deshalb auf den Etikettkopf
  // scrollen, nicht auf die erste Zutat.
  await s.locator('.v2-supp-prod-etikettkopf').first()
    .scrollIntoViewIfNeeded({ timeout: 10000 }).catch(() => {})
  await s.waitForTimeout(600)
  await s.screenshot({ path: FOTO })
}
console.log(JSON.stringify({ name: NAME, erwarteteZeilen: ZEILEN, geklickteZeile: geklickt, status: r?.status(), ...m, fehler }, null, 2))
await b.close()
