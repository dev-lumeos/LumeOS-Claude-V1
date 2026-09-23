// G-474 — die Belegkette in einem Lauf.
//
// [cmd] Vier Messungen, die zusammen die Ursache benennen:
//   1 unveraendert                     stirbt
//   2 CSS gar nicht geladen            lebt
//   3 CSS abgefangen (Zwischenspeicher umgangen)  lebt
//   4 Zwischenspeicher per CDP aus     lebt
// [read] Und die Trennprobe: Network.enable ALLEIN rettet nicht —
// es ist der Zwischenspeicher, nicht das Messwerkzeug.
import { chromium } from '@playwright/test'
const BASIS = process.env.LUMEOS_BASIS ?? 'http://127.0.0.1:3251'
const ROUTE = '/' + (process.argv[2] ?? 'login').replace(/^\/+/, '')

function mitFrist(p, ms, beiFrist) {
  return Promise.race([p.catch(e => ({ fehler: String(e).slice(0,140) })),
    new Promise(r => setTimeout(() => r(beiFrist), ms))])
}
async function probe(name, vorher) {
  const b = await chromium.launch({ headless: true })
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
aus.push(await probe('1 unveraendert', null))
aus.push(await probe('2 CSS blockiert', async (s, k) => {
  await k.route('**/*.css', r => r.abort())
}))
aus.push(await probe('3 CSS durchgereicht', async (s, k) => {
  await k.route('**/*.css', r => r.continue())
}))
aus.push(await probe('4 Zwischenspeicher aus', async (s, k) => {
  const cdp = await k.newCDPSession(s)
  await cdp.send('Network.enable')
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true })
}))
aus.push(await probe('5 nur Network.enable', async (s, k) => {
  const cdp = await k.newCDPSession(s)
  await cdp.send('Network.enable')
}))
console.log(JSON.stringify({
  route: ROUTE,
  ursacheBelegt: aus[0].stirbt && !aus[3].stirbt && aus[4].stirbt,
  faelle: aus,
}, null, 2))
