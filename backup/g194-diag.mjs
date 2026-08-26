
import { chromium } from '@playwright/test'
import { wortFuer } from '../tools/konten.mjs'
const B='http://127.0.0.1:3200', K='test-user@lumeos.local'
const b=await chromium.launch(); const c=await b.newContext(); const p=await c.newPage()
await p.goto(B+'/login',{waitUntil:'networkidle'})
await p.fill('input[type="email"]',K); await p.fill('input[type="password"]',wortFuer(K))
await p.click('button[type="submit"]'); await p.waitForURL(u=>!u.pathname.includes('/login'),{timeout:30000})
await p.goto(B+'/v2/supplements?tab=database',{waitUntil:'networkidle'})
console.log(JSON.stringify(await p.evaluate(() => {
  const cs = getComputedStyle(document.documentElement)
  const d = document.createElement('div'); document.body.appendChild(d)
  d.style.color='var(--warn)'
  const r = {
    htmlAttr: document.documentElement.getAttribute('data-theme'),
    tokenWarn: cs.getPropertyValue('--warn').trim(),
    tokenFg: cs.getPropertyValue('--fg').trim(),
    tokenBg: cs.getPropertyValue('--bg').trim(),
    probeColor: getComputedStyle(d).color,
    bodyBg: getComputedStyle(document.body).backgroundColor,
  }
  d.remove(); return r
}), null, 2))
await b.close()
