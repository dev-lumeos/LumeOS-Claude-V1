// G-318: was Tom am 2026-09-02 am Schirm gesehen hat.
//
// ══ WARUM ES DIESE DATEI GIBT ═══════════════════════════════════════
//
// **Tom:** *„undundund alles punkte die in deinen auftraegen lagen"*
//
// `[cmd]` **Drei Fehler, die meine Wächter nicht gefangen haben:**
//
//     16 Einträge statt 4    `ladeTagesEintraege` filtert den
//                            Planstatus nicht — in G-309 GEMELDET
//                            statt behoben
//     Label im Ring          ich prüfte „unter der ZAHL" statt
//                            „unter dem RING"
//     duplicate key          die Wochen rücken aufsteigend, die
//                            erste auf einen belegten Platz
//
// `[read]` **Ein gemeldeter Befund ist kein behobener** — und ein
// Wächter, der die falsche Beziehung prüft, ist grün und wertlos.
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const WURZEL = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)), '../../../../../..',
)
const lies = (f: string) => fs.readFileSync(path.join(WURZEL, f), 'utf8')
const ohneKommentare = (f: string) => lies(f)
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')

const LESEN = 'apps/web/src/lib/nutrition/plan-lesen.ts'
const SCHREIB = 'apps/web/src/lib/nutrition/plan-write.ts'
const CSS = 'packages/ui/src/styles/v2.css'

// ══ 1: NUR DER AKTIVE PLAN ══════════════════════════════════════════

test('G-318: die Tageseintraege kommen NUR vom aktiven Plan', () => {
  // **Tom:** *„wieso sehe ich dann immer noch soviele eintraege
  // anstatt der normalen 4 von einem aktivierten mealplan?"*
  //
  // `[cmd]` **Am 2026-09-02 gemessen: „16 still open"** — vier Pläne
  // × vier Einträge. **Die Kachel zeigte die Positionen JEDES Plans,
  // der an diesem Tag einen Tag hat.**
  //
  // `[cmd]` **Ich habe das in G-309 als offenen Punkt GEMELDET** —
  // mit dem Satz, `ladeGhostEintraege` filtere ja. `[read]` **Die
  // Kachel im Plans-Reiter benutzt aber DIESE Funktion.**
  const l = ohneKommentare(LESEN)
  const von = l.indexOf('export async function ladeTagesEintraege')
  assert.notEqual(von, -1, 'ladeTagesEintraege fehlt')
  const bis = l.indexOf('\nexport ', von + 10)
  const block = l.slice(von, bis === -1 ? undefined : bis)

  assert.match(block, /meal_plans\.status', 'active'/,
    'der Planstatus wird nicht gefiltert — dann zaehlen alle Plaene mit')
  // `[read]` **`!inner` erzwingt den Verbund** — ohne ihn kämen
  // Positionen ohne passenden Plan mit `null` durch.
  assert.match(block, /week:meal_plan_weeks!inner/,
    'der Wochenverbund ist nicht erzwungen')
  assert.match(block, /plan:meal_plans!inner/,
    'der Planverbund ist nicht erzwungen')

  // `[read]` **Und `ladeGhostEintraege` filtert weiterhin** — beide
  // Wege, nicht nur einer.
  const gvon = l.indexOf('export async function ladeGhostEintraege')
  assert.notEqual(gvon, -1)
  const gbis = l.indexOf('\nexport ', gvon + 10)
  assert.match(l.slice(gvon, gbis === -1 ? undefined : gbis),
    /meal_plans\.status', 'active'/,
    'der Ghost-Leseweg filtert den Planstatus nicht mehr')
})

// ══ 2: DAS LABEL STEHT UNTER DEM RING ═══════════════════════════════

test('G-318: das Ring-Label steht UNTER dem Kreis, nicht darin', () => {
  // **Tom:** *„wieso ist compliance immer noch in der grafik anstatt
  // darunter?"*
  //
  // `[cmd]` **Am 2026-09-02 gemessen: Ring y 306..398, Label y
  // 367..382** — es lag IM Kreis, quer über dem unteren Bogen.
  //
  // `[read]` **Mein G-317-Wächter prüfte, ob das Label unter der
  // ZAHL sitzt.** Das war erfüllt und trotzdem falsch: beides steckte
  // in `inset: 0`, also mittig im Ring. **Die richtige Frage war, ob
  // es unter dem RING sitzt.**
  const c = lies(CSS)

  // `[read]` **Der Kasten endet, wo der Kreis endet** — nicht am
  // Rand des Elements.
  // `[cmd]` **BERICHTIGT nach der Sabotageprobe:** hier stand
  // `/\.v2-ring-label \{[\s\S]*?bottom: 16px;/`. **`[\s\S]*?` ist
  // unbegrenzt** — nach dem Ersetzen fand es `bottom: 16px` beim
  // NÄCHSTEN Vorkommen weiter unten, und der Wächter blieb grün.
  //
  // `[read]` **Erst den Block herausschneiden, dann darin suchen.**
  const block = (name: string) => {
    const von = c.indexOf(`${name} {`)
    assert.notEqual(von, -1, `${name} fehlt im CSS`)
    const bis = c.indexOf('}', von)
    assert.notEqual(bis, -1, `${name} ist nicht geschlossen`)
    return c.slice(von, bis)
  }

  const labelKasten = block('.v2-ring-label')
  assert.match(labelKasten, /bottom: 16px;/,
    'der Label-Kasten reicht bis zum Elementrand — dann liegt das '
    + 'Label im Kreis')
  assert.ok(!/inset: 0;/.test(labelKasten),
    '`inset: 0` zentriert Zahl UND Label im Kreis')

  // `[read]` **Und der Ring hält den Platz frei** — sonst schneidet
  // die Karte das Label ab.
  const ringKasten = block('.v2-ring')
  assert.match(ringKasten, /padding-bottom: 16px;/,
    'der Ring haelt keinen Platz fuer das Label frei')
  assert.match(ringKasten, /box-sizing: content-box;/,
    'ohne content-box frisst die Polsterung die Ringhoehe')

  // `[cmd]` **EIN Block, nicht zwei** — ein zweiter `.v2-ring` kann
  // gegen die feste `height` nichts ausrichten, und genau daran ist
  // der erste Versuch gescheitert.
  const bloecke = (c.match(/^\.v2-ring \{/gm) ?? []).length
  assert.equal(bloecke, 1,
    `${bloecke} .v2-ring-Bloecke — der zweite ueberschreibt nicht, was `
    + 'der erste festlegt')

  // Das Label selbst sitzt in der Polsterung.
  assert.match(block('.v2-ring-label .v2-l'), /bottom: -16px;/,
    'das Label sitzt nicht in der freigehaltenen Polsterung')
})

// ══ 3: DIE WOCHEN KOLLIDIEREN NICHT ═════════════════════════════════

test('G-318: beim Vorwaertsschieben weicht die LETZTE Woche zuerst', () => {
  // **Tom:** *„wieso kann ich im planner nicht aktivieren? duplicate
  // key value violates unique constraint
  // `uq_meal_plan_days_week_date`"*
  //
  // `[cmd]` **Der Plan hat einen Wochensprung:** 1.9., **15.9.**,
  // 22.9. — die Woche vom 8.9. fehlt.
  //
  // `[cmd]` **Nachgerechnet für +14 Tage, aufsteigend:**
  //
  //     1.9.  -> 15.9.   KOLLISION (dort steht Woche 2 noch)
  //     15.9. -> 29.9.   frei
  //     22.9. -> 6.10.   frei
  //
  // `[cmd]` **Am 2026-09-02 belegt: HTTP 200 statt duplicate key**,
  // Wochen danach 15.9. / 29.9. / 6.10., keine Dubletten.
  const s = ohneKommentare(SCHREIB)
  const von = s.indexOf('async function wochenAufStartdatumSchieben')
  assert.notEqual(von, -1, 'die Verschiebung fehlt')
  const bis = s.indexOf('\n}', von) + 2
  const block = s.slice(von, bis)

  // `[read]` **Die Richtung entscheidet über die Reihenfolge.**
  assert.match(block, /const reihenfolge = tage > 0 \? \[\.\.\.wochen\]\.reverse\(\) : wochen/,
    'die Wochen werden immer aufsteigend geschoben — dann kollidiert '
    + 'die erste mit der zweiten')
  assert.match(block, /for \(const w of reihenfolge\)/,
    'die Schleife benutzt die Reihenfolge nicht')

  // `[read]` **Dieselbe Falle eine Ebene tiefer:** die Tage einer
  // Woche liegen aufeinanderfolgend, und der UNIQUE greift innerhalb.
  assert.match(block, /tage > 0 \? \[\.\.\.tageDerWoche\]\.reverse\(\) : tageDerWoche/,
    'die Tage werden immer aufsteigend geschoben')
  // `[cmd]` **Sortiert lesen** — ohne `order` ist die Reihenfolge
  // beliebig, und `reverse()` dreht dann nichts Bestimmtes um.
  assert.match(block, /\.eq\('week_id', w\.id\)\s*\n\s*\.order\('plan_date'\)/,
    'die Tage werden unsortiert gelesen — dann hilft reverse() nicht')
})

test('G-318: die Verschiebung rechnet in beide Richtungen', () => {
  // `[read]` **Rückwärts ist die Reihenfolge umgekehrt** — die erste
  // Woche weicht zuerst. **Ein `reverse()` in beide Richtungen wäre
  // derselbe Fehler, nur gespiegelt.**
  //
  // `[cmd]` **Die Rechnung, gegen den echten Fall geprüft:**
  const wochen = ['2026-09-01', '2026-09-15', '2026-09-22']
  const ziel = (start: string, tage: number) => {
    const d = new Date(`${start}T00:00:00Z`)
    d.setUTCDate(d.getUTCDate() + tage)
    return d.toISOString().slice(0, 10)
  }

  // Vorwärts: von hinten, dann ist jedes Ziel frei.
  const belegtVor = new Set(wochen)
  for (const w of [...wochen].reverse()) {
    const neu = ziel(w, 14)
    assert.ok(!belegtVor.has(neu) || neu === w,
      `vorwaerts: ${w} -> ${neu} kollidiert`)
    belegtVor.delete(w)
    belegtVor.add(neu)
  }

  // Rückwärts: von vorne.
  const belegtZur = new Set(wochen)
  for (const w of wochen) {
    const neu = ziel(w, -14)
    assert.ok(!belegtZur.has(neu) || neu === w,
      `rueckwaerts: ${w} -> ${neu} kollidiert`)
    belegtZur.delete(w)
    belegtZur.add(neu)
  }

  // Und die Gegenprobe: aufsteigend vorwärts KOLLIDIERT.
  const falsch = new Set(wochen)
  let kollision = false
  for (const w of wochen) {
    const neu = ziel(w, 14)
    if (falsch.has(neu) && neu !== w) kollision = true
    falsch.delete(w)
    falsch.add(neu)
  }
  assert.equal(kollision, true,
    'die Gegenprobe kollidiert nicht — dann prueft der Test nichts')
})
