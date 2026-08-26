
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
await p.waitForTimeout(700)
await p.locator('tbody tr',{hasText:'1-Testosterone'}).first().click()
await p.waitForTimeout(900)
const r=p.locator('.v2-supp-reiter-knopf',{hasText:'Rechtslage'}).first()
console.log('Reiter da:', await r.count())
if (await r.count()) { await r.click(); await p.waitForTimeout(500) }
console.log(JSON.stringify(await p.evaluate(() => {
  const e=document.querySelector('.v2-supp-wada-block')
  if(!e) return {kein:true}
  const k=[]
  for(let x=e;x&&k.length<5;x=x.parentElement)
    k.push(String(x.className).slice(0,32)+' :: '+getComputedStyle(x).backgroundColor)
  return {kette:k}
}), null, 2))
await b.close()
