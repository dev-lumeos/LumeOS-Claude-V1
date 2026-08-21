// Legt JEDEN Pfad der Datei einzeln in ein SVG und laesst den Browser
// urteilen. Kein eigener Parser (G-123) — gezaehlt wird, was der
// Browser bemaengelt.
import { chromium } from '@playwright/test'
import { readFileSync } from 'node:fs'

const src = readFileSync('packages/ui/src/koerperkarte-pfade.ts', 'utf8')
const pfade = [...src.matchAll(/"([MmLlCcQqAaSsTtHhVvZz][\s\d.\-][^"]*)"/g)]
  .map(m => m[1])

if (process.argv.includes('--selbsttest-kaputt')) {
  pfade.push('M 0 0 C 1 2 3')
}

const browser = await chromium.launch()
const page = await browser.newPage()
const fehler = []
page.on('console', m => { if (m.type() === 'error') fehler.push(m.text()) })
page.on('pageerror', e => fehler.push(String(e)))

await page.setContent('<svg id="s" viewBox="0 0 1500 1400"></svg>')

// Einzeln einsetzen, damit ein Fehler dem richtigen Pfad zuzuordnen ist.
const kaputt = []
for (let i = 0; i < pfade.length; i++) {
  const vorher = fehler.length
  await page.evaluate(d => {
    const s = document.getElementById('s')
    s.innerHTML = ''
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    p.setAttribute('d', d)
    s.appendChild(p)
    // Erzwingt das Parsen.
    void p.getTotalLength()
  }, pfade[i])
  await page.waitForTimeout(1)
  if (fehler.length > vorher) kaputt.push({ i, d: pfade[i].slice(0, 55) })
}

console.log(`Pfade insgesamt: ${pfade.length}`)
console.log(`vom Browser bemaengelt: ${kaputt.length}`)
for (const k of kaputt) console.log(`   [${k.i}] ${k.d}`)
await browser.close()

if (kaputt.length > 0) process.exitCode = 1
