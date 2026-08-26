
import { chromium } from '@playwright/test'
import { wortFuer } from '../tools/konten.mjs'
const B='http://127.0.0.1:3200', K='test-user@lumeos.local'
const b=await chromium.launch()
const c=await b.newContext({viewport:{width:1440,height:1000},colorScheme:'light'})
const p=await c.newPage()
await p.goto(B+'/login',{waitUntil:'networkidle'})
await p.fill('input[type="email"]',K); await p.fill('input[type="password"]',wortFuer(K))
await p.click('button[type="submit"]'); await p.waitForURL(u=>!u.pathname.includes('/login'),{timeout:30000})
await p.goto(B+'/v2/supplements?tab=database',{waitUntil:'networkidle'})
const su=p.locator('.v2-supp-suche input, input[type="search"]').first()
await su.waitFor({state:'visible',timeout:20000}); await su.fill('1-Testosterone')
await p.waitForTimeout(900)
const z=p.locator('tbody tr',{hasText:'1-Testosterone'}).first()
await z.click()
await p.waitForTimeout(1400)
console.log(JSON.stringify(await p.evaluate(() => {
  const t=document.querySelector('.v2-supp-tafel')
  if(!t) return {tafelFehlt:true, zeilen:document.querySelectorAll('tbody tr').length}
  const cs=getComputedStyle(t)
  return {tafelBg: cs.backgroundColor,
    accHier: cs.getPropertyValue('--acc').trim(),
    bgElev: cs.getPropertyValue('--bg-elev').trim()}
}), null, 2))
await b.close()
