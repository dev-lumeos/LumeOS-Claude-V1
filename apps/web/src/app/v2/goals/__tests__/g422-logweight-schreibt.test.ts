/**
 * G-422 — das Gewichtsmodal schreibt wirklich
 *
 * `[cmd]` **Der Befund:** `messungAnlegenAktion` gibt es seit G-122
 * (`koerpermass-aktionen.ts:31`), samt Pruefung und Schreibweg.
 * **Gemessen 2026-09-28: null Aufrufer im ganzen `apps/web/src`.**
 *
 * `[cmd]` **Und das Modal trug einen `InEntwicklungKnopf` mit dem
 * Grund** *,,Was fehlt, ist der Schreibweg"* — **der Grund war
 * falsch.** `[read]` **Ein Vermerk mit falschem Grund ist schlimmer
 * als eine fehlende Kachel:** er verhindert, dass jemand nachsieht.
 *
 * `[read]` **G-422 sagt selbst, warum es dreimal an einem Tag
 * passiert ist:** *,,Kein Test faellt darueber."* **Diese Datei ist
 * der Test, der darueber faellt.**
 *
 * `[cmd]` **Am Schirm belegt (2026-09-28, `test-user@lumeos.local`):**
 * Modal geoeffnet, Felder gefuellt, gespeichert — Zeile in
 * `goals.body_measurements`: `81.40 kg / 14.20 % / bia`, und
 * `ffmi 20.96` von der generierten Spalte gerechnet. **Danach wieder
 * geloescht.**
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const HIER = dirname(fileURLToPath(import.meta.url))
const GOALS = join(HIER, '..')

/** Quelltext ohne Kommentare — sonst liest der Waechter seine
 *  eigene Begruendung (die Lehre aus G-512). */
const ohneKommentare = (q: string) => q
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')

const MODALE = () => ohneKommentare(readFileSync(join(GOALS, 'modale.tsx'), 'utf8'))

/** Nur der Rumpf von `LogWeightModal` — nicht die ganze Datei. */
function logWeightRumpf(): string {
  const q = MODALE()
  const von = q.indexOf('function LogWeightModal')
  assert.ok(von > 0, 'LogWeightModal nicht gefunden — umbenannt?')
  const rest = q.slice(von + 10)
  const bis = rest.search(/\nfunction \w+/)
  return bis > 0 ? rest.slice(0, bis) : rest
}

describe('G-422 — das Gewichtsmodal ist verdrahtet', () => {
  it('die Wurzelmarke stimmt — sonst misst der Rest nichts', () => {
    assert.ok(logWeightRumpf().length > 500, 'der Rumpf ist leer')
  })

  // ── 1 · Die Aktion wird gerufen ────────────────────────────────
  it('das Modal ruft messungAnlegenAktion', () => {
    assert.match(logWeightRumpf(), /messungAnlegenAktion\(/,
      'das Modal ruft den Schreibweg nicht — die Funktion ist wieder '
      + 'gebaut und unerreichbar')
    assert.match(MODALE(), /import \{ messungAnlegenAktion \}/,
      'die Serveraktion wird nicht importiert')
  })

  it('kein InEntwicklungKnopf mehr im Gewichtsmodal', () => {
    const r = logWeightRumpf()
    assert.doesNotMatch(r, /InEntwicklungKnopf/,
      'das Modal traegt wieder einen Noch-nicht-Knopf, obwohl der '
      + 'Schreibweg da ist')
  })

  // ── 2 · Erst schliessen, wenn die Zeile da ist ─────────────────
  it('das Modal schliesst erst nach dem Erfolg', () => {
    const r = logWeightRumpf()
    assert.match(r, /if \(r\.ok\)/,
      'das Ergebnis wird nicht geprueft')

    // `[cmd]` **SABOTAGEPROBE 2026-09-28: die erste Fassung dieser
    // Zusicherung blieb GRUEN**, als ein zweites `onClose` VOR den
    // Erfolgszweig gesetzt wurde — sie fragte nur, ob nach
    // `if (r.ok)` irgendwo ein `onClose` steht, und das blieb wahr.
    //
    // `[read]` **Jetzt wird GEZAEHLT:** im ganzen Rumpf darf
    // `setTimeout(onClose` genau einmal vorkommen, und zwar
    // innerhalb des Erfolgszweigs. **Ein zweites daneben heisst, ein
    // Fehlschlag sieht aus wie Erfolg.**
    // `[read]` **`match` statt `matchAll`** — der Spread eines
    // `matchAll`-Iterators verlangt ein hoeheres `target`
    // (TS2802), und die tsconfig gibt es nicht her.
    const anzahl = (r.match(/setTimeout\(onClose/g) ?? []).length
    assert.equal(anzahl, 1,
      `setTimeout(onClose …) kommt ${anzahl}x vor — genau einmal, `
      + 'im Erfolgszweig, sonst schliesst das Modal auch bei einem Fehler')

    // Die Stelle muss NACH `if (r.ok)` und VOR dem `else` liegen.
    const stelle = r.indexOf('setTimeout(onClose')
    const okStelle = r.indexOf('if (r.ok)')
    const elseStelle = r.indexOf('} else', okStelle)
    assert.ok(stelle > okStelle,
      'geschlossen wird VOR der Erfolgspruefung')
    assert.ok(elseStelle < 0 || stelle < elseStelle,
      'geschlossen wird im Fehlerzweig')
  })

  // ── 3 · Fehler kommen an, nicht ins Leere ──────────────────────
  it('Feldfehler werden angezeigt', () => {
    const r = logWeightRumpf()
    assert.match(r, /setFelder\(r\.felder\)/,
      'die Feldfehler der Pruefung werden verworfen — der Nutzer '
      + 'sieht nicht, WELCHES Feld fehlt')
    assert.match(r, /felder\.map/,
      'die Feldfehler werden nicht gerendert')
  })

  // ── 4 · Die Quellen kommen aus dem CHECK ───────────────────────
  it('die Methodenliste stammt aus BF_METHODEN', () => {
    const r = logWeightRumpf()
    assert.match(r, /BF_METHODEN\.map/,
      'die Quellenliste ist wieder erfunden — vorher standen dort '
      + '„Manual / Smart scale / DXA", und zwei davon kennt '
      + 'body_measurements_method_ck nicht')
    assert.doesNotMatch(r, /'Smart scale'|'DXA'/,
      'die alten, ungueltigen Werte stehen wieder da')
  })

  // ── 5 · Kein Wert-Import aus einem write-Modul ─────────────────
  it('die Client-Datei importiert keinen Schreibweg als Wert', () => {
    const roh = readFileSync(join(GOALS, 'modale.tsx'), 'utf8')
    assert.doesNotMatch(roh,
      /^import\s+\{[^}]*\}\s+from\s+'[^']*goals\/koerpermass-write'/m,
      'Wert-Import aus koerpermass-write — das zieht next/headers '
      + 'ins Browserbuendel (A-30 / G-412)')
  })

  // ── 6 · Das Datum ist nicht die Vorlagenzahl ───────────────────
  it('das Datum kommt aus heute, nicht aus dem Mockup', () => {
    const r = logWeightRumpf()
    assert.doesNotMatch(r, /2026-05-16/,
      'das feste Vorlagendatum steht wieder da — jede Messung liefe '
      + 'auf denselben Tag')
    assert.match(r, /heuteISO\(\)/, 'kein Tagesdatum gesetzt')
  })
})
