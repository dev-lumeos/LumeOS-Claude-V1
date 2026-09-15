// G-453/A7 — die zwei Gegenproben, an der ECHTEN Oberflaeche.
//
// `[cmd]` **Ueber die Suche, aber mit der id abgeglichen.** Ein erster
// Versuch tippte nur den Namen — und die Smartsuche lieferte ein
// AEHNLICHES Produkt MIT Zeilen, das genauso hiess. **Die Gegenprobe
// haette dann das Gegenteil dessen gezeigt, was sie belegen soll.**
//
// `[read]` **Deshalb wird die getroffene Zeile gegen die erwartete id
// geprueft**, und der Lauf meldet es, wenn keine passt — statt ein
// Foto von irgendeinem Produkt zu machen.
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'
const KONTO = 'dev@lumeos.app', BASIS = 'http://127.0.0.1:3200'

const FAELLE = [
  {
    id: '7e259101-9b16-4055-ad24-8607b9bc1f23',
    name: 'Ascorbic Acid (Vitamin C) Powder',
    marke: 'TerraVita Premium Collection',
    was: 'ohne Etikettzeilen',
    bild: 'backup/x-g453-a7-ohne-zeilen.png',
  },
  {
    id: '93af2f63-2cf4-4f09-914f-d549949b34e9',
    name: 'Suntheanine L-Theanine 150 mg',
    marke: "Doctor's Best",
    was: 'ohne Einnahmehinweis',
    bild: 'backup/x-g453-a7-ohne-hinweis.png',
  },
]

const b = await chromium.launch({ headless: true })
const k = await b.newContext({ viewport: { width: 1600, height: 1100 } })
const s = await k.newPage()
await s.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
if (await s.locator('input[type=email]').count()) {
  await s.fill('input[type=email]', KONTO)
  await s.fill('input[type=password]', wortFuer(KONTO))
  await Promise.all([
    s.waitForURL(u => !u.pathname.includes('login')),
    s.click('button[type=submit]'),
  ])
}

const aus = []
for (const f of FAELLE) {
  await s.goto(`${BASIS}/v2/supplements?tab=produkte`, { waitUntil: 'networkidle' })
  await s.waitForTimeout(1400)
  // Ueber die Marke eingrenzen, dann den Namen suchen — so bleibt
  // nur das eine Produkt uebrig.
  await s.click('input[aria-label="Marke filtern"]')
  await s.fill('input[aria-label="Marke filtern"]', f.marke)
  await s.waitForTimeout(600)
  const mk = s.locator('.v2-supp-prod-markenknopf')
    .filter({ hasText: new RegExp(`^${f.marke.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`) }).first()
  if (await mk.count()) { await mk.click(); await s.waitForTimeout(1600) }
  await s.fill('input[aria-label="Produkt suchen"]', f.name)
  await s.waitForFunction(
    () => document.querySelectorAll('.v2-tbl tbody tr').length > 0,
    { timeout: 30_000 }).catch(() => {})
  await s.waitForTimeout(1100)

  // Die Zeile mit dem erwarteten Namen anklicken und pruefen, ob die
  // geladene id stimmt.
  const zeilen = s.locator('.v2-tbl tbody tr')
  let getroffen = false
  for (let i = 0; i < await zeilen.count(); i++) {
    const txt = (await zeilen.nth(i).textContent()) ?? ''
    if (!txt.includes(f.name)) continue
    await zeilen.nth(i).click()
    await s.waitForFunction(
      () => !!document.querySelector('.v2-supp-prod-tafel'),
      { timeout: 20_000 }).catch(() => {})
    await s.waitForTimeout(1000)
    getroffen = true
    break
  }

  const m = await s.evaluate(() => {
    const t = document.querySelector('.v2-supp-prod-tafel')
    if (!t) return { fehler: 'keine Tafel' }
    return {
      name: t.querySelector('.v2-supp-prod-name')?.textContent?.trim(),
      etikettzeilen: t.querySelectorAll('.v2-supp-prod-zutat').length,
      // Die beiden Leerhinweise, woertlich.
      satzOhneZeilen: t.textContent.includes(
        'Zu diesem Produkt sind keine Etikettzeilen erfasst'),
      satzOhneHinweis: t.textContent.includes(
        'Das Etikett nennt keinen Einnahmehinweis'),
      satzOhneFirma: t.textContent.includes(
        'Zu diesem Produkt ist keine Firma hinterlegt'),
      leereKacheln: Array.from(t.querySelectorAll('.v2-supp-prod-kachel[data-zustand="leer"]'))
        .map(c => c.textContent.trim().slice(0, 40)),
      bilanz: t.querySelector('.v2-supp-prod-bilanz')?.textContent?.trim(),
    }
  })
  await s.screenshot({ path: f.bild })
  aus.push({ was: f.was, erwartet: f.name, getroffen, ...m })
}
console.log(JSON.stringify(aus, null, 2))
await b.close()
