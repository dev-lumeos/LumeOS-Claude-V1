/**
 * G-583 — drei Reste ohne Aufrufer, nach dem Verfahren aus G-581
 *
 * `[cmd]` **Am 2026-10-02 ueber 701 Dateien gezaehlt, OHNE
 * Kommentare:**
 *
 *     wertKommtVonGruppe   0 Aufrufer (mit Kommentaren: 3 Dateien)
 *     LiveWorkout          0 Aufrufer (die zweite Nennung ist eine
 *                          Beschriftung in `placeholder-page.tsx`)
 *     plan-detail.tsx      3 Nennungen im Praesens, Datei seit G-581 weg
 *
 * `[read]` **Der Unterschied zwischen „mit" und „ohne Kommentare" IST
 * der Befund:** genau daran war der Waechter in G-446 blind — er las
 * seine eigene Begruendung mit.
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const HIER = dirname(fileURLToPath(import.meta.url))
// `[cmd]` **Zwei Ebenen: `__tests__` -> `lib` -> `src`.** `[read]`
// **In G-581 zeigte derselbe Pfad eine Ebene zu kurz** — drei
// Zusicherungen waren gruen, ohne `app/v2/` je gesehen zu haben.
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

// `[read]` **Der Waechter schliesst sich SELBST aus** — er nennt alle
// drei Namen als Suchmuster und faende sich sonst als Aufrufer.
const DATEIEN = quelldateien(SRC)
  .filter(p => !p.endsWith('g583-drei-reste.test.ts'))

describe('G-583 — der Heuhaufen stimmt', () => {
  it('er umfasst app/ UND lib/', () => {
    // `[cmd]` **701 Dateien am 2026-10-02.** `[read]` **Die
    // Untergrenze ist an der ECHTEN Zahl geeicht** — mit `> 100`
    // waere auch ein Heuhaufen aus `lib/` allein durchgegangen
    // (die Falle aus G-581).
    assert.ok(DATEIEN.length > 500,
      `nur ${DATEIEN.length} Dateien — der Waechter sieht nicht alles`)
    assert.ok(DATEIEN.some(p => /[\\/]app[\\/]v2[\\/]training[\\/]/.test(p)),
      'app/v2/training fehlt im Heuhaufen — die Wurzel stimmt nicht')
    assert.ok(DATEIEN.some(p => /[\\/]lib[\\/]koerper[\\/]/.test(p)),
      'lib/koerper fehlt im Heuhaufen')
  })
})

// ════════════════════════════════════════════════════════════════
// Fall 1 — wertKommtVonGruppe (G-446)
// ════════════════════════════════════════════════════════════════

describe('G-583/1 — wertKommtVonGruppe ist entfernt', () => {
  const MUSTER = /(?<![A-Za-z0-9_])wertKommtVonGruppe(?![A-Za-z0-9_])/

  it('sie wird nirgends mehr definiert oder gerufen', () => {
    // `[read]` **Ohne Kommentare gezaehlt** — die Begruendungen
    // nennen den Namen weiter, und das sollen sie.
    const treffer = DATEIEN.filter(p => MUSTER.test(lies(p)))
    assert.deepEqual(treffer.map(p => p.slice(SRC.length)), [],
      'wertKommtVonGruppe ist zurueck — G-446 hat sie ausgetragen, '
      + 'weil sie die Herkunft aus der KARTENflaeche riet')
  })

  it('die Begruendung steht weiter da — als Kommentar', () => {
    // `[read]` **Die Abwesenheit braucht ihren Grund** (E-70), sonst
    // baut sie der naechste Auftrag nach.
    const q = roh(join(SRC, 'lib', 'koerper', 'schluessel-gruppe.ts'))
    assert.match(q, /G-583/, 'die Datei sagt nicht, wer sie entfernt hat')
    // `[read]` **Die Begruendung muss AM Entfernungsvermerk stehen**,
    // nicht irgendwo in der Datei. `[cmd]` **`G-446` steht dreimal** —
    // ein `assert.match` war zufrieden, als die Sabotage eines
    // strich. **Gesucht ist der Satz, der sie traegt.**
    const i = q.indexOf('G-583: `wertKommtVonGruppe` ist entfernt')
    assert.ok(i > 0, 'der Entfernungsvermerk fehlt')
    const vermerk = q.slice(i, i + 1400)
    assert.match(vermerk, /G-446 hat sie ausgetragen/,
      'der Vermerk nennt nicht, wer sie ausgetragen hat')
    assert.match(vermerk, /KARTENflaeche/,
      'der Vermerk nennt den Grund nicht — ohne ihn baut sie der '
      + 'naechste Auftrag nach (E-70)')
  })

  it('die zwei lebenden Ausfuhren bleiben', () => {
    // `[read]` **Die Gegenprobe zum Entfernen:** die Karte braucht
    // weiter den Weg vom Kuerzel zur Muskelgruppe.
    const q = lies(join(SRC, 'lib', 'koerper', 'schluessel-gruppe.ts'))
    assert.match(q, /export const SCHLUESSEL_ZU_GRUPPE/,
      'SCHLUESSEL_ZU_GRUPPE ist mitgegangen')
    assert.match(q, /export const OHNE_GRUPPE/, 'OHNE_GRUPPE ist mitgegangen')
  })

  it('der Waechter trifft die Form, die er sucht', () => {
    // `[read]` **An der geloeschten Zeile eichen.**
    assert.ok(MUSTER.test('export function wertKommtVonGruppe('),
      'der Waechter findet die geloeschte Definition nicht')
    // `[cmd]` **Und ein Kommentar darf NICHT zaehlen** — sonst waere
    // er so blind wie der in G-446.
    assert.ok(!MUSTER.test(ohneKommentare(
      '// `[cmd]` hier stand wertKommtVonGruppe(a.name, slug)')),
      'der Waechter liest Kommentare mit')
  })
})

// ════════════════════════════════════════════════════════════════
// Fall 2 — LiveWorkout (G-217), mit dem Befund aus A3
// ════════════════════════════════════════════════════════════════

describe('G-583/2 — LiveWorkout ist entfernt, sein Inhalt benannt', () => {
  const ANSICHT = join(SRC, 'app', 'v2', 'training', 'ansicht.tsx')

  it('die Komponente ist weg', () => {
    const q = lies(ANSICHT)
    assert.ok(!/function LiveWorkout\b/.test(q),
      'LiveWorkout ist zurueck — ohne Aufrufer')
    assert.ok(!/<LiveWorkout\b/.test(q), 'LiveWorkout wird gerendert')
  })

  // `[cmd]` **A3: was der Entwurf trug, wird Text, BEVOR er geht.**
  // `[read]` **Ein toter Zweig als einziger Traeger einer Idee ist
  // kein Archiv** — er verschwindet beim naechsten Aufraeumen.
  it('die drei Sachen stehen als Befund in der Datei', () => {
    const q = roh(ANSICHT)
    const i = q.indexOf('G-217/G-583')
    assert.ok(i > 0, 'der Befund fehlt')
    // `[read]` **Zeilenumbrueche und Kommentarzeichen raus, bevor
    // gesucht wird** — der Befund steht als Blockkommentar, und
    // `auto-start after log` ist ueber zwei Zeilen gebrochen.
    // **Ein Muster, das den Umbruch nicht kennt, trifft nie**
    // (die Lehre aus G-459/G-464).
    const block = q.slice(i, i + 2400)
      .replace(/\n\s*(\/\/)?\s*/g, ' ')
    // `[read]` **Die drei NUMMERIERTEN Ueberschriften**, nicht
    // irgendein Vorkommen des Wortes. `[cmd]` **„Pausenuhr" steht
    // zweimal** — einmal als Ueberschrift, einmal im Satz ueber die
    // fehlenden Quellen. **Die Sabotage strich die Ueberschrift, der
    // Satz blieb, und `assert.match` war zufrieden.**
    for (const [sache, muster] of [
      ['Pausenuhr', /\*\*1\. Pausenuhr\.\*\*/],
      ['auto-start', /auto-start after log/],
      ['PR-Marke', /\*\*2\. PR-Marke\.\*\* Eine Pille `PR attempt`/],
      ['Zielvorgabe', /\*\*3\. Zielvorgabe je Satz\.\*\*/],
      ['Target-Zeile', /Target: 5x5 @ 117\.5kg/],
      ['RIR', /RIR 2/],
    ] as const) {
      assert.match(block, muster, `der Befund nennt ${sache} nicht`)
    }
    // `[read]` **Und er sagt, dass keine davon eine Quelle hat** —
    // sonst liest es sich wie eine Zusage.
    assert.match(block, /ohne Quelle/,
      'der Befund sagt nicht, dass die drei Sachen keine Quelle haben')
  })

  it('der echte Weg steht und wird gerufen', () => {
    // `[read]` **Die Gegenprobe:** was ersetzt hat, muss da sein.
    const q = lies(ANSICHT)
    assert.match(q, /<SitzungFormular\b/,
      'SitzungFormular fehlt — sie hat LiveWorkout ersetzt (G-217)')
    assert.match(q, /liveOpen && <SitzungFormular/,
      'der Schalter oeffnet nicht mehr das echte Formular')
  })

  it('die Beschriftung in placeholder-page bleibt', () => {
    // `[read]` **Sie ist KEIN Aufrufer** — ein Wort in einer Liste
    // kuenftiger Bereiche. **Wer sie mit entfernt, nimmt eine
    // Ankuendigung mit.**
    const q = roh(join(SRC, 'components', 'ui', 'placeholder-page.tsx'))
    assert.match(q, /'LiveWorkout'/,
      'die Ankuendigung in placeholder-page ist mitgegangen')
  })
})

// ════════════════════════════════════════════════════════════════
// Fall 3 — die drei Kommentarzeilen (A4)
// ════════════════════════════════════════════════════════════════

describe('G-583/3 — keine geloeschte Datei im Praesens', () => {
  it('plan-detail.tsx gibt es nicht mehr', () => {
    assert.ok(!existsSync(join(SRC, 'app', 'v2', 'nutrition', 'plan-detail.tsx')),
      'die Datei ist zurueck — dann gilt G-581 nicht mehr')
  })

  it('wer sie nennt, sagt dass sie weg ist', () => {
    // `[read]` **Die Zeilen bleiben** (A4) — sie erklaeren, warum
    // dort etwas fehlt. **Aber sie duerfen nicht im Praesens
    // behaupten, die Datei zeige etwas.**
    const nenner = DATEIEN.filter(p => /plan-detail\.tsx/.test(roh(p)))
      .filter(p => !p.includes('__tests__'))
    assert.ok(nenner.length >= 1, 'niemand nennt sie mehr — dann fehlt '
      + 'die Erklaerung, warum dort etwas fehlt')
    for (const p of nenner) {
      const q = roh(p)
      // `[read]` **JE NENNUNG, nicht je Datei.** `[cmd]`
      // **`plans-echt.tsx` nennt die Datei dreimal und traegt den
      // Hinweis zweimal** — eine Sabotage, die einen strich, kam
      // gruen durch, weil `assert.match` den anderen fand.
      //
      // `[read]` **Gezaehlt:** so viele Hinweise wie Bloecke, die
      // die Datei nennen. **Ein Block ist ein Absatz des
      // Kommentars** — getrennt durch eine Leerzeile oder `//\n`.
      const nennungen = (q.match(/plan-detail\.tsx/g) ?? []).length
      const hinweise = (q.match(/G-581 hat/g) ?? []).length
      assert.ok(hinweise >= 1,
        `${p.slice(SRC.length)} nennt plan-detail.tsx ${nennungen}x, `
        + 'ohne zu sagen, dass G-581 sie entfernt hat')
      // `[cmd]` **In `plans-echt.tsx` stehen DREI Nennungen in ZWEI
      // Bloecken** — jeder Block braucht seinen Hinweis.
      if (nennungen >= 3) {
        assert.ok(hinweise >= 2,
          `${p.slice(SRC.length)}: ${nennungen} Nennungen, aber nur `
          + `${hinweise} Hinweis(e) — ein Block behauptet weiter, die `
          + 'Datei stehe dort')
      }
      // `[cmd]` **Die eine Zeile, die *„zeigt ihn bereits"* sagte.**
      assert.ok(!/plan-detail\.tsx` zeigt ihn bereits/.test(q),
        `${p.slice(SRC.length)} behauptet weiter, die geloeschte Datei `
        + 'zeige etwas')
    }
  })
})
