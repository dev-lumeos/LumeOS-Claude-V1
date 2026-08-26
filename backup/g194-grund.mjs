
import { chromium } from '@playwright/test'
import { wortFuer } from '../tools/konten.mjs'
const B='http://127.0.0.1:3200', K='test-user@lumeos.local'
const b=await chromium.launch(); const c=await b.newContext({viewport:{width:1440,height:1000}})
const p=await c.newPage()
await p.goto(B+'/login',{waitUntil:'networkidle'})
await p.fill('input[type="email"]',K); await p.fill('input[type="password"]',wortFuer(K))
await p.click('button[type="submit"]'); await p.waitForURL(u=>!u.pathname.includes('/login'),{timeout:30000})
await p.goto(B+'/v2/supplements?tab=database',{waitUntil:'networkidle'})
console.log(JSON.stringify(await p.evaluate(() => {
  const cv=document.createElement('canvas'); cv.width=cv.height=1
  const ctx=cv.getContext('2d',{willReadFrequently:true})
  const by=(f)=>{ctx.clearRect(0,0,1,1);ctx.fillStyle='#000';ctx.fillStyle=f;ctx.fillRect(0,0,1,1)
    const d=ctx.getImageData(0,0,1,1).data;return [d[0],d[1],d[2]]}
  const lum=([r,g,bl])=>{const f=(v)=>{const x=v/255;return x<=0.03928?x/12.92:Math.pow((x+0.055)/1.055,2.4)}
    return 0.2126*f(r)+0.7152*f(g)+0.0722*f(bl)}
  const verh=(a,c)=>{const [h,n]=[lum(a),lum(c)].sort((x,y)=>y-x);return Math.round(((h+0.05)/(n+0.05))*100)/100}
  const cs=getComputedStyle(document.documentElement)
  const t=(n)=>cs.getPropertyValue(n).trim()
  const aus={}
  const setz=(modus)=>{ if(modus==='hell') document.documentElement.setAttribute('data-mode','light')
    else document.documentElement.removeAttribute('data-mode') }
  for (const modus of ['dunkel','hell']) {
    setz(modus)
    const cs2=getComputedStyle(document.documentElement)
    const tt=(n)=>cs2.getPropertyValue(n).trim()
    // Der ECHTE Grund einer getoenten Flaeche: 5-7% Farbe auf surface.
    const grund=(tok,pct)=>'color-mix(in oklch, '+tt(tok)+' '+pct+'%, '+tt('--surface')+')'
    aus[modus]={}
    for (const [name,tok,pct] of [['gefahr','--warn',7],['entwarnung','--pos',5],['pruefen','--acc-suppl',6]]) {
      aus[modus][name]={
        auf_surface: verh(by(tt(tok)), by(tt('--surface'))),
        auf_getoent: verh(by(tt(tok)), by(grund(tok,pct))),
      }
    }
  }
  return aus
}), null, 2))
await b.close()
