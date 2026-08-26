
import { chromium } from '@playwright/test'
import { wortFuer } from '../tools/konten.mjs'
const B='http://127.0.0.1:3200', K='test-user@lumeos.local'
const b=await chromium.launch(); const c=await b.newContext({viewport:{width:1440,height:1000}})
const p=await c.newPage()
await p.goto(B+'/login',{waitUntil:'networkidle'})
await p.fill('input[type="email"]',K); await p.fill('input[type="password"]',wortFuer(K))
await p.click('button[type="submit"]'); await p.waitForURL(u=>!u.pathname.includes('/login'),{timeout:30000})
for (const n of ['AC-262356','Creatine monohydrate','1-Testosterone','Semaglutide']) {
  await p.goto(B+'/v2/supplements?tab=database',{waitUntil:'networkidle'})
  const su=p.locator('.v2-supp-suche input, input[type="search"]').first()
  await su.waitFor({state:'visible',timeout:20000}); await su.fill(n)
  await p.waitForTimeout(700)
  const z=p.locator('tbody tr',{hasText:n}).first()
  if (await z.count()===0) { console.log(n+': nicht gefunden'); continue }
  await z.click(); await p.waitForTimeout(900)
  const r=await p.locator('.v2-supp-reiter-knopf').allInnerTexts()
  console.log(n+': '+r.length+' Reiter -> '+r.map(x=>x.replace(/\s+/g,' ')).join(' | '))
}
await b.close()
