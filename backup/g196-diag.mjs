
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
console.log(JSON.stringify(await p.evaluate(() => {
  const cv=document.createElement('canvas'); cv.width=cv.height=1
  const ctx=cv.getContext('2d',{willReadFrequently:true})
  const by=(f)=>{ctx.clearRect(0,0,1,1);ctx.fillStyle='rgba(0,0,0,0)';ctx.fillStyle=f
    ctx.fillRect(0,0,1,1);const d=ctx.getImageData(0,0,1,1).data;return [d[0],d[1],d[2],d[3]]}
  const aus=[]
  for (const sel of ['.v2-supp-wada-block','.v2-supp-kasten-warn']) {
    const e=document.querySelector(sel)
    if(!e) { aus.push({sel, fehlt:true}); continue }
    const kette=[]
    for(let x=e;x&&kette.length<4;x=x.parentElement)
      kette.push({cls:String(x.className).slice(0,30), bg:by(getComputedStyle(x).backgroundColor)})
    aus.push({sel, kette})
  }
  return aus
}), null, 2))
await b.close()
