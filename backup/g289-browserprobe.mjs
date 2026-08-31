// G-289: Flow 7 und Flow 8 durch die OBERFLAECHE, nicht per fetch.
//
// `[read]` **Ein gruener Endpunkt beweist nicht, dass ein Knopf ihn
// erreicht** — genau diese Luecke hat G-192 durchrutschen lassen.
import { chromium } from '@playwright/test'
import { wortFuer } from '../tools/konten.mjs'

const KONTO = process.env.LUMEOS_KONTO ?? 'test-user@lumeos.local'
const BASIS = 'http://127.0.0.1:3200'

const browser = await chromium.launch()
const seite = await browser.newPage({ viewport: { width: 1500, height: 1300 } })
const fehler = []
seite.on('console', m => { if (m.type() === 'error') fehler.push(m.text()) })

await seite.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
await seite.fill('input[type="email"]', KONTO)
await seite.fill('input[type="password"]', wortFuer(KONTO))
await seite.click('button[type="submit"]')
await seite.waitForURL(u => !u.pathname.includes('login'), { timeout: 30000 })
console.log(`angemeldet als ${KONTO}`)

const gehe = async () => {
  await seite.goto(`${BASIS}/v2/nutrition?tab=rezepte`, { waitUntil: 'networkidle' })
  await seite.waitForTimeout(1000)
}
const text = async () => (await seite.locator('body').innerText())
const zaehleRezepte = async () =>
  ((await text()).match(/REZEPTE\s+(\d+)/)?.[1]) ?? '?'

await gehe()
console.log(`\nRezepte vorher: ${await zaehleRezepte()}`)

// ══ FLOW 7, Schritt 1-4 ═══════════════════════════════════════════
console.log('\n── Flow 7, Schritt 1: „Neues Rezept" ──')
await seite.getByRole('button', { name: 'Neues Rezept' }).click()
await seite.waitForTimeout(500)
console.log(`  Formular offen: ${await seite.getByLabel('Rezeptname').count() > 0}`)

console.log('── Schritt 2: Name, Portionen ──')
await seite.getByLabel('Rezeptname').fill('G-289 Browserrezept')
await seite.getByLabel('Portionen').fill('4')

console.log('── Schritt 3: Zutaten via Food Search ──')
for (const [frage, gramm] of [['Reis', '250'], ['Aal', '150']]) {
  await seite.getByLabel('Zutat suchen').fill(frage)
  await seite.locator('form button[type="submit"]').click()
  await seite.waitForTimeout(1200)
  const treffer = seite.locator('.v2-hit')
  const n = await treffer.count()
  console.log(`  „${frage}": ${n} Treffer`)
  if (n === 0) continue
  await treffer.first().click()
  await seite.waitForTimeout(300)
  await seite.getByLabel('Menge in Gramm').fill(gramm)
  await seite.getByRole('button', { name: 'Hinzufügen' }).click()
  await seite.waitForTimeout(400)
}

// Die Live-Vorschau — der Kern von Schritt 3.
const vorschau = await seite.locator('text=Live-Vorschau').locator('..').innerText()
console.log('── Live-Vorschau ──')
console.log(vorschau.split('\n').filter(Boolean).slice(0, 14)
  .map(s => `  ${s}`).join('\n'))

console.log('── Schritt 4: Speichern ──')
await seite.getByRole('button', { name: 'Speichern' }).click()
await seite.waitForTimeout(2500)
console.log(`  Rezepte nachher: ${await zaehleRezepte()}`)

// ══ FLOW 8 ═══════════════════════════════════════════════════════
console.log('\n── Flow 8: Einkaufsliste aus dem Rezept, 8 Portionen ──')
const karte = seite.locator('.v2-card').filter({ hasText: 'G-289 Browserrezept' }).first()
await karte.getByRole('button', { name: 'Einkaufsliste' }).click()
await seite.waitForTimeout(600)
await seite.getByLabel('Portionen für die Liste').fill('8')
await seite.waitForTimeout(300)
const modalText = await seite.locator('.v2-modal').innerText()
console.log('  Vorschau der Mengen (250 g / 150 g bei 4 -> 8 Portionen):')
console.log(modalText.split('\n').filter(z => z.includes('g'))
  .slice(0, 4).map(s => `    ${s}`).join('\n'))
await seite.getByRole('button', { name: 'Generieren' }).click()
await seite.waitForTimeout(2500)

const nachListe = await text()
console.log(`  Liste angelegt: ${nachListe.includes('Einkaufslisten')}`)
const listenBlock = nachListe.slice(nachListe.indexOf('Einkaufslisten'))
console.log(listenBlock.split('\n').filter(Boolean).slice(0, 8)
  .map(s => `    ${s}`).join('\n'))

console.log('\n── Flow 8, Schritt 5: abhaken ──')
const posten = seite.locator('button[aria-pressed]')
const vorHaken = await posten.count()
if (vorHaken > 0) {
  await posten.first().click()
  await seite.waitForTimeout(2200)
  const t2 = await text()
  console.log(`  nach dem Abhaken: ${/(\d+) von (\d+) erledigt/.exec(t2)?.[0] ?? '?'}`)
}

// ══ FLOW 7, Schritt 5 ════════════════════════════════════════════
console.log('\n── Flow 7, Schritt 5: als Mahlzeit loggen ──')
const karte2 = seite.locator('.v2-card').filter({ hasText: 'G-289 Browserrezept' }).first()
await karte2.getByRole('button', { name: 'Als Mahlzeit loggen' }).click()
await seite.waitForTimeout(600)
const logText = await seite.locator('.v2-modal').innerText()
console.log('  Hinweis im Dialog:')
console.log(logText.split('\n').filter(z => z.includes('Einzelzutaten'))
  .map(s => `    ${s}`).join('\n'))
await seite.getByLabel('Anzahl Portionen').fill('2')
await seite.getByRole('button', { name: 'Bestätigen' }).click()
await seite.waitForTimeout(2500)
console.log('  eingetragen')

console.log(`\nKonsolenfehler: ${fehler.length}`)
fehler.slice(0, 2).forEach(f => console.log(`  ${f.slice(0, 120)}`))

await seite.screenshot({ path: 'backup/g289-browserprobe.png', fullPage: false })
await browser.close()
