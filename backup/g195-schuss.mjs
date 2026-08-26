
import { chromium } from '@playwright/test'
import { wortFuer } from '../tools/konten.mjs'
const B='http://127.0.0.1:3200', K='test-user@lumeos.local'
const MODUS=process.argv[2]||'light', BREITE=Number(process.argv[3]||1280)
const NAME=process.argv[4]||'1-Testosterone', ZIEL=process.argv[5]
const b=await chromium.launch()
const c=await b.newContext({viewport:{width:BREITE,height:1100},colorScheme:MODUS})
const p=await c.newPage()
await p.goto(B+'/login',{waitUntil:'networkidle'})
await p.fill('input[type="email"]',K); await p.fill('input[type="password"]',wortFuer(K))
await p.click('button[type="submit"]'); await p.waitForURL(u=>!u.pathname.includes('/login'),{timeout:30000})
await p.goto(B+'/v2/supplements?tab=database',{waitUntil:'networkidle'})
const su=p.locator('.v2-supp-suche input, input[type="search"]').first()
await su.waitFor({state:'visible',timeout:20000}); await su.fill(NAME)
await p.waitForTimeout(800)
const z=p.locator('tbody tr',{hasText:NAME}).first()
if (await z.count()===0) { console.log(JSON.stringify({NAME, fehlt:true})); await b.close(); process.exit(0) }
await z.click(); await p.waitForTimeout(1000)
const reiter=await p.locator('.v2-supp-reiter-knopf').allInnerTexts()
const ueberblickHoehe=await p.evaluate(()=>{const i=document.querySelector('.v2-supp-tafel-inhalt')
  return i?Math.round(i.scrollHeight):null})
const rl=p.locator('.v2-supp-reiter-knopf',{hasText:'Rechtslage'}).first()
let hatBlock=false
if (await rl.count()) { await rl.click(); await p.waitForTimeout(600)
  hatBlock = await p.locator('.v2-supp-wada-block').count()>0 }
if (ZIEL) await p.screenshot({path:ZIEL})
console.log(JSON.stringify({NAME, MODUS, BREITE,
  reiter: reiter.map(x=>x.replace(/\s+/g,' ')),
  reiterZahl: reiter.length, ueberblickHoehe, rechtslageDa: await rl.count()>0, hatBlock}))
await b.close()
