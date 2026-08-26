
import { chromium } from '@playwright/test'
import { wortFuer } from '../tools/konten.mjs'
const B='http://127.0.0.1:3200', K='test-user@lumeos.local'
const MODUS=process.argv[2]||'light', ZIEL=process.argv[3]||'backup/g196.png'
const b=await chromium.launch()
const c=await b.newContext({viewport:{width:1440,height:1100},colorScheme:MODUS})
const p=await c.newPage()
await p.goto(B+'/login',{waitUntil:'networkidle'})
await p.fill('input[type="email"]',K); await p.fill('input[type="password"]',wortFuer(K))
await p.click('button[type="submit"]'); await p.waitForURL(u=>!u.pathname.includes('/login'),{timeout:30000})
await p.goto(B+'/v2/supplements?tab=database',{waitUntil:'networkidle'})
const su=p.locator('.v2-supp-suche input, input[type="search"]').first()
await su.waitFor({state:'visible',timeout:20000}); await su.fill('AC-262356')
await p.waitForTimeout(800)
await p.locator('tbody tr',{hasText:'AC-262356'}).first().click()
await p.waitForTimeout(1000)
await p.screenshot({path:ZIEL})
console.log(JSON.stringify(await p.evaluate(() => {
  const a=[]
  for (const e of document.querySelectorAll('.v2-eyebrow'))
    a.push(((e.textContent||'').trim().slice(0,26))+' -> '+(e.getAttribute('data-ton')||'grau'))
  return a
})))
await b.close()
