// G-222: derselbe Reiter, zwei Konten. Der Unterschied IST der
// Leerzustand. Nur lesend.
import { chromium } from '@playwright/test'
import { wortFuer } from '../tools/konten.mjs'

const B = 'http://127.0.0.1:3200'
const TABS = ['diary', 'planner', 'nutrients', 'foods', 'einkauf', 'rezepte']

async function messe(konto, marke) {
  const b = await chromium.launch()
  const s = await b.newContext({ viewport: { width: 1400, height: 1100 } })
  const p = await s.newPage()
  await p.goto(`${B}/login`, { waitUntil: 'networkidle' })
  await p.fill('input[type=email]', konto)
  await p.fill('input[type=password]', wortFuer(konto))
  await Promise.all([
    p.waitForURL(u => !u.pathname.includes('login'), { timeout: 60000 }),
    p.click('button[type=submit]'),
  ])

  const raus = {}
  for (const tab of TABS) {
    await p.goto(`${B}/v2/nutrition?tab=${tab}`, { waitUntil: 'networkidle' })
    await p.waitForTimeout(2200)

    // Der Inhaltsbereich: alles NACH der Reiterleiste.
    const txt = await p.locator('body').innerText()
    const ab = txt.indexOf('Heute')
    const inhalt = ab >= 0 ? txt.slice(ab + 5) : txt

    raus[tab] = {
      zeichen: inhalt.length,
      zeilen: inhalt.split('\n').map(z => z.trim())
        .filter(z => z.length > 2).slice(0, 12),
      knoepfe: await p.locator('main button, main a[role=button]')
        .allTextContents().then(a => a.map(x => x.trim())
          .filter(Boolean).slice(0, 10)).catch(() => []),
    }
    await p.screenshot({ path: `backup/g222-${marke}-${tab}.png` })
  }
  await b.close()
  return raus
}

const leer = await messe('test-user@lumeos.local', 'leer')
const voll = await messe('dev@lumeos.app', 'voll')

for (const tab of TABS) {
  console.log(`\n===== ${tab} =====`)
  console.log(`  leer: ${leer[tab].zeichen} Zeichen | voll: ${voll[tab].zeichen}`)
  console.log('  LEER sieht:')
  for (const z of leer[tab].zeilen.slice(0, 8)) console.log('    ', z.slice(0, 84))
  console.log('  VOLL sieht:')
  for (const z of voll[tab].zeilen.slice(0, 5)) console.log('    ', z.slice(0, 84))
}
