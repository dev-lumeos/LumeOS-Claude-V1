// G-474 — liegt es am Zwischenspeicher des Browsers?
//
// [cmd] Entscheidender Befund: sobald eine Probe die CSS-Antworten
// ABFAENGT — auch unveraendert durchgereicht — ueberlebt der Reiter.
// Abfangen umgeht den Plattenzwischenspeicher.
//
// [cmd] Die Stilblaetter tragen `Cache-Control: immutable`. Beim
// ZWEITEN Aufruf kommen sie also aus dem Zwischenspeicher, nicht vom
// Server — genau der Aufruf, der stirbt.
//
// [read] Gegenprobe ohne jedes Abfangen: einmal mit, einmal ohne
// Zwischenspeicher.
import { chromium } from '@playwright/test'
const BASIS = process.env.LUMEOS_BASIS ?? 'http://127.0.0.1:3251'
const ROUTE = '/' + (process.argv[2] ?? 'login').replace(/^\/+/, '')

function mitFrist(p, ms, beiFrist) {
  return Promise.race([p.catch(e => ({ fehler: String(e).slice(0,140) })),
    new Promise(r => setTimeout(() => r(beiFrist), ms))])
}

async function probe(name, args, vorher) {
  const b = await chromium.launch({ headless: true, args })
  const k = await b.newContext()
  const s = await k.newPage()
  if (vorher) await vorher(s, k)
  let tot = false
  s.on('crash', () => { tot = true })
  const laeufe = []
  for (let i = 0; i < 2 && !tot; i++) {
    const r = await mitFrist(
      s.goto(`${BASIS}${ROUTE}`, { waitUntil: 'domcontentloaded', timeout: 20000 })
        .then(x => ({ status: x?.status() ?? null })), 24000, { frist: true })
    await new Promise(x => setTimeout(x, 900))
    laeufe.push(tot || r.frist ? 'TOT' : (r.status ?? '?'))
  }
  await b.close().catch(()=>{})
  return { fall: name, laeufe, stirbt: laeufe[1] === 'TOT' }
}

const aus = []
aus.push(await probe('unveraendert', []))
aus.push(await probe('--disable-http-cache', ['--disable-http-cache']))
aus.push(await probe('--disk-cache-size=0', ['--disk-cache-size=1']))
// Ueber CDP den Zwischenspeicher abschalten — ohne Abfangen.
aus.push(await probe('CDP Network.setCacheDisabled', [], async (s, k) => {
  const cdp = await k.newCDPSession(s)
  await cdp.send('Network.enable')
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true })
}))
// [read] Die entscheidende Trennung: liegt es am ABGESCHALTETEN
// Zwischenspeicher — oder schon daran, dass die Netzwerk-Domaene
// ueberhaupt eingeschaltet ist? Beide Proben oben tun BEIDES.
aus.push(await probe('CDP Network.enable OHNE Cache-Aus', [], async (s, k) => {
  const cdp = await k.newCDPSession(s)
  await cdp.send('Network.enable')
}))
console.log(JSON.stringify({ route: ROUTE, faelle: aus }, null, 2))
