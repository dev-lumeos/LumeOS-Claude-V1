// G-309: der ganze Weg im Browser — aktivieren, sehen, entscheiden.
//
// `[read]` **Die Nachweiszeile, an der Tom es misst, ist der
// Rezept-Eintrag:** Einzelzutaten, nicht als Einheit.
import { chromium } from '@playwright/test'
import { wortFuer } from '../tools/konten.mjs'

const KONTO = 'test-user@lumeos.local'
const BASIS = 'http://127.0.0.1:3200'
const SCHRITT = process.argv[2] ?? 'zeigen'

const browser = await chromium.launch()
const seite = await browser.newPage({ viewport: { width: 1400, height: 1500 } })
const netz = []
seite.on('response', r => {
  const u = r.url()
  if (u.includes('/api/nutrition/plan')) {
    netz.push(`${r.request().method()} ${r.status()}`)
  }
})

await seite.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
await seite.fill('input[type="email"]', KONTO)
await seite.fill('input[type="password"]', wortFuer(KONTO))
await seite.click('button[type="submit"]')
await seite.waitForURL(u => !u.pathname.includes('login'), { timeout: 30000 })

const heute = process.env.G309_TAG ?? new Date().toISOString().slice(0, 10)

if (SCHRITT === 'aktivieren') {
  // Den Neuplan ueber die Oberflaeche aktivieren.
  await seite.goto(`${BASIS}/v2/nutrition?tab=planner`, { waitUntil: 'networkidle' })
  await seite.waitForTimeout(1500)
  const knopf = seite.getByRole('button', { name: /Aktivieren/ })
  const n = await knopf.count()
  console.log(`Aktivieren-Knoepfe: ${n}`)
  if (n === 0) {
    const text = await seite.locator('body').innerText()
    const ab = text.indexOf('Alle Pläne')
    console.log(text.slice(ab, ab + 700))
  } else {
    // Erster Klick oeffnet die Frage (Flow 3, Schritte 5+6).
    await knopf.first().click()
    await seite.waitForTimeout(700)
    console.log(`Startdatum-Feld: ${await seite.getByLabel('Startdatum').count()}`)
    const start = await seite.getByLabel('Startdatum').inputValue()
    console.log(`Vorgabe (soll morgen sein): ${start}`)
    for (const z of ['läuft einmal ab', 'beginnt danach von vorn']) {
      console.log(`  Zyklus „${z}": ${await seite.getByText(z).count()}`)
    }
    const pausiert = await seite.getByText(/wird pausiert/).count()
    console.log(`Hinweis „wird pausiert": ${pausiert > 0 ? 'da' : 'FEHLT'}`)

    // Ab heute, damit die Ghost Entries heute sichtbar sind.
    await seite.getByLabel('Startdatum').fill(heute)
    // Zweiter Klick: der Absendeknopf in der Frage.
    await seite.getByRole('button', { name: 'Aktivieren', exact: true })
      .last().click()
    await seite.waitForTimeout(3000)
    console.log(`Netz: ${netz.join(', ') || '(keine Anfrage)'}`)
  }
  await browser.close()
  process.exit(0)
}

// Das Tagebuch von heute.
await seite.goto(`${BASIS}/v2/nutrition?tab=diary&datum=${heute}`,
  { waitUntil: 'networkidle' })
await seite.waitForTimeout(2000)

const text = await seite.locator('body').innerText()

console.log('=== Ghost Entries am Schirm ===')
const ausPlan = await seite.getByText('aus deinem Plan').count()
console.log(`  Karten mit "aus deinem Plan": ${ausPlan}`)

console.log('\n=== Der Rezept-Eintrag (die Nachweiszeile) ===')
const rezeptUeberschrift = await seite.getByText(/G-309 Huhn-Reis-Bowl/).count()
console.log(`  Rezeptname als Ueberschrift: ${rezeptUeberschrift > 0 ? 'ja' : 'FEHLT'}`)
for (const zutat of ['Hähnchen', 'Reis', 'Brokkoli', 'Broccoli']) {
  const c = await seite.getByText(new RegExp(zutat, 'i')).count()
  if (c > 0) console.log(`  Zutat einzeln sichtbar: ${zutat} (${c}x)`)
}

console.log('\n=== Mengenfelder je Zutat (ADR) ===')
const felder = await seite.locator('input[aria-label^="Menge "]').count()
console.log(`  editierbare Mengenfelder: ${felder}`)
const namen = await seite.locator('input[aria-label^="Menge "]')
  .evaluateAll(els => els.map(e => e.getAttribute('aria-label')))
namen.forEach(n => console.log(`    ${n}`))

console.log('\n=== Knoepfe ===')
for (const k of ['Bestätigen', 'Auslassen']) {
  console.log(`  ${k}: ${await seite.getByRole('button', { name: k }).count()}`)
}

if (SCHRITT === 'bestaetigen' || SCHRITT === 'abweichen' || SCHRITT === 'auslassen') {
  // Welcher Slot? breakfast = BLS, lunch = Rezept, dinner = BLS.
  const karte = seite.locator('div').filter({ hasText: /aus deinem Plan/ })
  if (SCHRITT === 'abweichen') {
    // `[read]` **Am Rezept-Slot**, damit die Skalierung mitgeprueft
    // wird — dort lag der Fehler in `plan-log-write.ts`.
    const feld = seite.locator('input[aria-label="Menge Grillhähnchen"]').first()
    const alt = await feld.inputValue()
    await feld.fill(String(Math.round(Number(alt) * 3)))
    console.log(`\nMenge ${alt} -> ${Math.round(Number(alt) * 3)} g (Rezept-Slot)`)
  }
  const knopf = SCHRITT === 'auslassen' ? 'Auslassen' : 'Bestätigen'
  // `[read]` **Der Knopf DIESER Karte**, nicht irgendeiner — sonst
  // bestaetigt die Probe einen anderen Slot als den geaenderten.
  const ziel = SCHRITT === 'auslassen'
    ? seite.getByRole('button', { name: 'Auslassen' }).last()
    : SCHRITT === 'abweichen'
      ? seite.locator('.v2-card', { hasText: 'G-309 Huhn-Reis-Bowl' })
          .getByRole('button', { name: 'Bestätigen' })
      : seite.getByRole('button', { name: 'Bestätigen' }).first()
  await ziel.click()
  await seite.waitForTimeout(3000)
  console.log(`\n„${knopf}" -> ${netz.join(', ')}`)
  const nachher = await seite.getByText('aus deinem Plan').count()
  console.log(`Ghost Entries danach: ${nachher} (vorher ${ausPlan})`)
}

await seite.screenshot({ path: `backup/g309-${SCHRITT}.png`, fullPage: false })
console.log(`\nBild: backup/g309-${SCHRITT}.png`)
await browser.close()
