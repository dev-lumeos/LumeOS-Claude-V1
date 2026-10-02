/**
 * G-582 — `coach.raise_alert` bekommt seinen Aufrufer
 *
 * `[cmd]` **Null Aufrufer in `apps/` und `packages/`**, gezaehlt am
 * 2026-10-02 — **der vierte und letzte Weg aus G-571.** Der Reiter
 * zeigte Alarme; erzeugen konnte sie niemand.
 *
 * `[read]` **Die Fehlerklasse aus G-571:** jede Messung hat gefragt,
 * ob die Funktion RICHTIG ist, keine, ob sie ANKOMMT.
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const HIER = dirname(fileURLToPath(import.meta.url))
// `[cmd]` **Drei Ebenen: `__tests__` -> `lib` -> `src`.** `[read]`
// **In G-581 zeigte derselbe Pfad eine Ebene zu kurz** — drei
// Zusicherungen waren gruen, ohne `components/` je gesehen zu haben.
const SRC = join(HIER, '..', '..')

const ohneKommentare = (q: string) => q
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')
const roh = (p: string) => readFileSync(p, 'utf8')
const lies = (p: string) => ohneKommentare(roh(p))

function quelldateien(pfad: string, aus: string[] = []): string[] {
  for (const e of readdirSync(pfad)) {
    if (e === 'node_modules' || e.startsWith('.next')) continue
    const p = join(pfad, e)
    if (statSync(p).isDirectory()) quelldateien(p, aus)
    else if (e.endsWith('.ts') || e.endsWith('.tsx')) aus.push(p)
  }
  return aus
}

// `[read]` **Der Waechter schliesst sich selbst aus** — er traegt den
// Namen als Suchmuster und faende sich sonst als Aufrufer.
const DATEIEN = quelldateien(SRC)
  .filter(p => !p.endsWith('g582-alarm-aufrufer.test.ts'))

const AKTIONEN = join(SRC, 'lib', 'aktionen.ts')
const TAB = join(SRC, 'components', 'tab-alerts.tsx')

describe('G-582/A4 — die Datenbankfunktion hat einen Aufrufer', () => {
  it('der Heuhaufen umfasst lib/ UND components/', () => {
    // `[cmd]` **Die Untergrenze an der ECHTEN Zahl geeicht**, nicht
    // an einer runden — die Falle aus G-581.
    assert.ok(DATEIEN.length > 30,
      `nur ${DATEIEN.length} Dateien — der Waechter sieht nicht alles`)
    assert.ok(DATEIEN.some(p => /[\\/]components[\\/]tab-alerts\.tsx$/.test(p)),
      'components/tab-alerts.tsx fehlt — die Wurzel stimmt nicht')
  })

  it('raise_alert wird gerufen, nicht nur erwaehnt', () => {
    // `[read]` **Gesucht ist der AUFRUF.** `[cmd]` **Bei G-578 war
    // der einzige Treffer im ganzen Produkt ein Kommentar** — ein
    // Waechter auf den blossen Namen waere damals gruen gewesen.
    const rufer = DATEIEN.filter(p => /\.rpc\(\s*'raise_alert'/.test(lies(p)))
      .map(p => p.split(/[\\/]/).pop())
    assert.deepEqual(rufer, ['aktionen.ts'],
      `coach.raise_alert wird aus ${rufer.join(', ') || 'keiner Datei'} `
      + 'gerufen — erwartet ist genau der Schreibweg in lib/aktionen.ts '
      + '(vor G-582: null Aufrufer, G-571)')
  })

  it('der Waechter trifft die Form, die er sucht', () => {
    assert.ok(/\.rpc\(\s*'raise_alert'/.test(
      ".rpc('raise_alert', { p_client: id, p_kind: art })"),
      'der Waechter findet den eigenen Aufruf nicht')
    // `[cmd]` **Eine Erwaehnung darf NICHT zaehlen.**
    assert.ok(!/\.rpc\(\s*'raise_alert'/.test(
      '// spaeter ruft das raise_alert auf'),
      'der Waechter haelt eine Erwaehnung fuer einen Aufruf')
  })

  it('der Weg fuehrt von der Oberflaeche bis zur Funktion', () => {
    const tab = lies(TAB)
    assert.match(tab, /action=\{alarmAusloesen\}/,
      'das Formular ruft die Serveraktion nicht')
    assert.match(tab, /data-alarm-ausloesen/, 'es gibt keinen Knopf')

    const akt = lies(AKTIONEN)
    assert.match(akt, /'use server'/, 'die Aktionen laufen nicht serverseitig')
    assert.match(akt, /export async function alarmAusloesen/,
      'die Serveraktion fehlt')
  })

  it('das Formular steht AUCH im Leerzustand', () => {
    // `[read]` **Sonst waere es genau dann unerreichbar, wenn man den
    // ersten Alarm braucht** — der Reiter kehrt bei null Alarmen
    // frueh zurueck.
    const tab = lies(TAB)
    const treffer = (tab.match(/<AlarmFormular\b/g) ?? []).length
    assert.equal(treffer, 2,
      `AlarmFormular steht ${treffer}x — es gehoert in BEIDE Zweige, `
      + 'den Leerzustand und die Liste')
  })
})

describe('G-582/A1 — was die Funktion selbst tut', () => {
  it('die sechs Parameter heissen wie die Signatur', () => {
    // `[cmd]` **`pg_get_function_arguments`, 2026-10-02:**
    // `p_client, p_kind, p_severity, p_title, p_detail, p_metric`.
    const akt = lies(AKTIONEN)
    for (const p of ['p_client', 'p_kind', 'p_severity', 'p_title',
      'p_detail', 'p_metric']) {
      assert.ok(akt.includes(`${p}:`), `${p} fehlt im Aufruf`)
    }
    // `[read]` **`module` ist KEIN Parameter** — die Funktion setzt
    // `'general'` selbst.
    assert.ok(!/p_module/.test(akt),
      'der Aufrufer schickt ein Modul — die Funktion nimmt keines')
  })

  it('coach_id kommt nicht vom Aufrufer', () => {
    // `[read]` **`auth.uid()` im Rumpf** — ein Parameter vom Browser
    // waere eine Einladung, einen fremden zu nennen.
    const akt = lies(AKTIONEN)
    assert.ok(!/p_coach/.test(akt), 'der Aufrufer schickt eine Coach-Id')
  })

  it('die Rueckgabe wird geprueft, nicht angenommen', () => {
    // `[cmd]` **G-79.**
    const akt = lies(AKTIONEN)
    assert.match(akt, /if \(!data\) zurueck\(/,
      'ein Ergebnis ohne Kennung gilt als Erfolg')
  })

  it('die Entdoppelung steht AM Knopf, nicht nur im Bericht', () => {
    // `[cmd]` **Der Rumpf gibt den BESTEHENDEN Alarm zurueck**, wenn
    // zu `coach + client + kind` einer aus 24 Stunden offen ist.
    // `[read]` **Ohne diesen Satz sieht ein ausbleibender zweiter
    // Eintrag wie ein Fehler aus.**
    const tab = roh(TAB)
    const i = tab.indexOf('data-alarm-entdoppelt')
    assert.ok(i > 0, 'der Hinweis zur Entdoppelung fehlt')
    // `[read]` **Zeilenumbrueche UND die JSX-Leerzeichen `{' '}`
    // raus**, bevor gesucht wird — sonst steht mitten im Satz ein
    // Ausdruck, und ein Muster ueber zwei Woerter trifft nie
    // (dieselbe Falle wie der mehrzeilige Suchtext in G-459).
    const block = tab.slice(i, i + 700)
      .replace(/\{' '\}/g, ' ')
      .replace(/\s+/g, ' ')
    assert.match(block, /24 Stunden/, 'der Hinweis nennt das Fenster nicht')
    // `[read]` **Keine Alternation.** `[cmd]` **Hier stand
    // `/kein|bleibt es bei diesem/`** — eine Sabotage strich die eine
    // Haelfte, die andere blieb, **und der Waechter war zufrieden.**
    // **Beide Aussagen einzeln**, denn beide tragen den Satz.
    assert.match(block, /bleibt es bei diesem/,
      'der Hinweis sagt nicht, dass der bestehende Alarm gilt')
    assert.match(block, /es entsteht kein\s+zweiter/,
      'der Hinweis sagt nicht, dass kein zweiter entsteht')
    assert.match(block, /general/,
      'der Hinweis nennt nicht, dass das Modul general ist')
  })
})

describe('G-582/A2 — nur aktive Klienten stehen zur Wahl', () => {
  it('die Liste filtert auf status active', () => {
    // `[cmd]` **Der Rumpf verlangt eine aktive eigene Beziehung**
    // und wirft sonst `42501`. `[read]` **Eine Auswahl, die
    // garantiert scheitert, waere schlimmer als eine kurze.**
    const tab = lies(TAB)
    assert.match(tab, /klienten\.filter\(k => k\.status === 'active'\)/,
      'das Formular bietet auch nicht-aktive Klienten an')
  })

  it('ohne aktiven Klienten steht ein benannter Leerhinweis', () => {
    // `[read]` **E-72: kein leeres Formular, sondern der Grund.**
    const tab = lies(TAB)
    assert.match(tab, /data-alarm-keine-klienten/,
      'der Leerhinweis fehlt')
  })

  it('die fuenf Arten und fuenf Grade kommen aus dem Rumpf', () => {
    // `[cmd]` **`alerts_kind_ck` und `alerts_severity_ck`, gelesen
    // 2026-10-02** — eine sechste Art wirft `23514`.
    const tab = lies(TAB)
    for (const art of ['checkin_overdue', 'inactivity', 'adherence_low',
      'progress_stagnation', 'engagement_low']) {
      assert.ok(tab.includes(`'${art}'`), `die Alarmart ${art} fehlt`)
    }
    const akt = lies(AKTIONEN)
    for (const grad of ['info', 'low', 'medium', 'high', 'critical']) {
      assert.ok(akt.includes(`'${grad}'`), `der Schweregrad ${grad} fehlt`)
    }
  })
})

describe('G-582/A3 — die Fehlertexte, und wo sie stehen', () => {
  it('42501 ist KEIN Sitzungsfehler', () => {
    // `[read]` **Der Coach ist angemeldet** — er betreut diesen
    // Athleten nur nicht. **Zur Anmeldung zu schicken waere die
    // falsche Suche** (G-553).
    const akt = roh(AKTIONEN)
    const i = akt.indexOf("error.code === '42501'")
    assert.ok(i > 0, 'der 42501-Fall fehlt')
    const block = akt.slice(i, i + 500).replace(/\n\s*/g, ' ')
    assert.match(block, /keine aktive/,
      'der Satz sagt nicht, woran es liegt')
    assert.ok(!/Anmeldung|anmelden/.test(block.replace(/\/\/[^\n]*/g, '')),
      'der Satz schickt zur Anmeldung — die hilft hier nicht')
  })

  it('23514 bekommt einen eigenen Satz', () => {
    const akt = lies(AKTIONEN)
    assert.match(akt, /error\.code === '23514'/, 'der CHECK-Fall fehlt')
  })

  it('apps/coach fuehrt KEINEN zweiten Ort fuer Fehlertexte', () => {
    // `[cmd]` **A3: `apps/coach` teilt mit `apps/web` nur
    // `@lumeos/shared` und `@lumeos/ui`** — gemessen 2026-10-02, kein
    // Pfad nach `apps/web/src`. `[read]` **Also keine Kopie von
    // `ladefehler.ts`**, sondern die Meldung ueber `zurueck()`, wie
    // bei allen Aktionen hier.
    const kopien = DATEIEN.filter(p => /ladefehler/.test(p))
    assert.deepEqual(kopien, [],
      'apps/coach fuehrt eine eigene Fehlerkunde — ein zweiter Ort '
      + 'fuer dieselbe Frage driftet (G-529)')
    const akt = lies(AKTIONEN)
    assert.match(akt, /zurueck\(pfad,/,
      'die Meldung reist nicht ueber zurueck()')
  })
})
