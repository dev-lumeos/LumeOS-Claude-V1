import { chromium } from '@playwright/test'
const b = await chromium.launch()
const s = await b.newPage({ viewport: { width: 1440, height: 900 } })
// Ein Zahlenfeld mit v2-feld-Polsterung nachbauen und messen, ab
// welcher Breite "4400" ohne Abschnitt steht.
await s.setContent(`<style>
  body { font-family: system-ui, sans-serif; margin: 0; }
  .f { border:1px solid #888; border-radius:6px; padding:7px 10px;
       font-size:12.5px; box-sizing:border-box; }
</style>` + [56, 64, 72, 80, 88].map(w =>
  `<div><input class="f" type="number" style="width:${w}px" value="4400" id="i${w}"></div>`
).join(''))
for (const w of [56, 64, 72, 80, 88]) {
  const r = await s.locator(`#i${w}`).evaluate(n => ({
    scroll: n.scrollWidth, client: n.clientWidth,
  }))
  console.log(`  ${String(w).padStart(3)} px: scrollWidth=${r.scroll} clientWidth=${r.client} ` +
              `${r.scroll > r.client ? 'ABGESCHNITTEN' : 'passt'}`)
}
await b.close()
