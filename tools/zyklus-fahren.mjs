#!/usr/bin/env node
// Die ausfuehrende Haelfte des Zyklus — A-85.
//
// ══ WARUM ES DIESES WERKZEUG GIBT ════════════════════════════════════
//
// `[cmd]` **A-85, 2026-10-01:** in `tools/` liegen fuenf Werkzeuge fuer
// Punkte — `punkte-index`, `punkte-lesen`, `punkte-pruefen`,
// `zyklus-pruefen`, `fragen-index`. **Alle fuenf lesen oder pruefen.
// Keines fuehrt aus.**
//
// `[cmd]` **Was der Orchestrator deshalb je Zyklus von Hand machte:**
// die Punktdatei zwischen vier Ordnern verschieben, `agent:` und
// `beauftragt:` beim Rausgeben setzen, `erledigt:` und `commit:` beim
// Abnehmen setzen, die Tabelle oben in `docs/todo/LAUFEND.md`
// nachziehen. **Am 01.10. war die Tabelle der aufwendigste
// Einzelschritt des Tages.**
//
// ══ WO DIE GRENZE LIEGT ══════════════════════════════════════════════
//
// `[read]` **A-81 hat ein Werkzeug verworfen, das aus einer Nummer
// einen Pfad macht** — mit der Begruendung, die Regel loese das besser:
// erst verschieben, dann beauftragen. **Diese Begruendung gilt
// weiterhin, und dieses Werkzeug macht es nicht.**
//
// `[read]` **Der Unterschied:** dieses Werkzeug entscheidet nichts. Es
// ersetzt keinen Abnahmetext, keinen Auftragstext, keine Messung und
// keine Reihenfolge. **Es fuehrt aus, was der Orchestrator ohnehin tut.**
// Wer es benutzt, hat vorher entschieden.
//
// `[read]` **Daraus folgt die harte Grenze:** kein Schritt erfindet eine
// Zahl, einen Hash oder einen Text. Fehlt der Hash, bricht es ab.
// **Ein Werkzeug, das einen Platzhalter einsetzt, erzeugt genau die
// Fehlerklasse, die `punkte-pruefen` sucht.**
//
// ══ WIE ES BENUTZT WIRD ══════════════════════════════════════════════
//
//     node tools/zyklus-fahren.mjs tabelle            zeigt, was entstuende
//     node tools/zyklus-fahren.mjs tabelle --schreiben
//
//     node tools/zyklus-fahren.mjs rausgeben <pfad> --agent claudecode
//     node tools/zyklus-fahren.mjs abnehmen  <pfad> --commit 309db7e1
//     node tools/zyklus-fahren.mjs vorbereiten <pfad> --agent codex
//
//     --datum 2026-10-01   statt heute (fuer Proben)
//     --punkte <verz>      andere Wurzel als docs/punkte (fuer Proben)
//     --trocken            nichts schreiben, nur sagen was geschaehe
//
// `[read]` **Nach jedem schreibenden Schritt laeuft `zyklus-pruefen`.**
// Das Werkzeug prueft nicht selbst, was der Waechter prueft — zwei
// Pruefungen, die dasselbe behaupten, laufen irgendwann auseinander
// (A5). **Es ruft ihn auf und meldet, wenn er rot ist.**
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { spawnSync } from 'node:child_process'

import { punkteLesen, frontmatter } from './punkte-lesen.mjs'

const WURZEL = process.cwd()

// ══ DIE MARKIERUNGEN ═════════════════════════════════════════════════
//
// `[read]` **A1 ist NUR die Tabelle.** `LAUFEND.md` hatte am 01.10. 603
// Zeilen; die Tabelle darin hat fuenf. **Die uebrigen 598 sind NICHT
// ableitbar** — was auf Tom wartet, die Regeln, die Lehren, die
// Einspielreihenfolge mit ihren gemessenen Zahlen. **Wer sie anfasst,
// hat den Auftrag verfehlt.**
//
// `[read]` **Deshalb schreibt der Generator zwischen zwei Marken und
// nirgends sonst.** Fehlen sie, bricht er ab statt zu raten, wo die
// Tabelle anfaengt — eine geratene Grenze loescht Prosa.
const MARKE_AUF = '<!-- ERZEUGT:laufend-tabelle -->'
const MARKE_ZU = '<!-- /ERZEUGT:laufend-tabelle -->'

/** Die Anzeigenamen der Agenten — `laufend_codex` → `Codex`. */
const AGENTNAME = {
  codex: 'Codex',
  claudecode: 'Claude Code',
  fable: 'Fable',
  kimi: 'Kimi',
}

/** Die Reihenfolge der Agenten in der Tabelle — stabil, nicht alphabetisch. */
const AGENTEN = ['claudecode', 'codex', 'fable', 'kimi']

// ── Argumente ───────────────────────────────────────────────────────
function argumente(argv) {
  const frei = []
  const opt = {}
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i]
    if (!a.startsWith('--')) { frei.push(a); continue }
    const name = a.slice(2)
    if (name === 'schreiben' || name === 'trocken') { opt[name] = true; continue }
    opt[name] = argv[++i]
  }
  return { frei, opt }
}

function abbruch(...zeilen) {
  for (const z of zeilen) console.error(z)
  process.exit(1)
}

// ══ A2 — DER FRONTMATTER-SETZER ══════════════════════════════════════
//
// `[cmd]` **Die Falle ist belegt:** am 01.10. standen zwei Punktdateien
// auf 0 Bytes, weil ein Schreibgriff die Datei leerte, bevor der
// Lesezugriff lief. **Lesen, Ergebnis in eine Variable, Temporaerdatei,
// umbenennen.** Nie in einem Ausdruck, nie direkt auf die Zieldatei.
function sicherSchreiben(ziel, inhalt) {
  const temp = `${ziel}.zyklus-fahren.tmp`
  fs.writeFileSync(temp, inhalt, 'utf8')
  fs.renameSync(temp, ziel)
}

/**
 * Ein Feld in den Frontmatter setzen.
 *
 * `[read]` **Steht es schon drin, ist das ein Abbruch, keine
 * Ueberschreibung** (A2). Ein Werkzeug, das `beauftragt:` ueberschreibt,
 * verliert das Datum, an dem der Auftrag wirklich rausging.
 *
 * Reine Funktion auf Text — pruefbar ohne Dateisystem.
 */
export function feldSetzen(text, name, wert) {
  const zeilen = text.split(/\r?\n/)
  if (zeilen[0]?.trim() !== '---') {
    throw new Error('kein Frontmatter (erste Zeile ist nicht `---`)')
  }
  let ende = -1
  for (let i = 1; i < zeilen.length; i += 1) {
    if (zeilen[i].trim() === '---') { ende = i; break }
  }
  if (ende < 0) throw new Error('Frontmatter nicht geschlossen (kein zweites `---`)')

  const vorhanden = new RegExp(`^${name}:\\s*(\\S.*)$`, 'm')
  for (let i = 1; i < ende; i += 1) {
    const m = vorhanden.exec(zeilen[i])
    if (!m) continue
    const alt = m[1].trim()
    if (alt !== 'null' && alt !== '~') {
      throw new Error(`${name}: steht schon da (${alt}) — das Werkzeug `
        + 'ueberschreibt nicht, es bricht ab')
    }
    // `null` darf ersetzt werden: das ist ein leeres Feld, keine Aussage.
    zeilen[i] = `${name}: ${wert}`
    return zeilen.join('\n')
  }

  // Neu dazu: hinter das letzte Feld der ersten Gruppe, vor die erste
  // Leerzeile — dort stehen heute `agent:` und `beauftragt:` in allen
  // Punktdateien, die sie tragen.
  let einfuegen = ende
  for (let i = 1; i < ende; i += 1) {
    if (zeilen[i].trim() === '') { einfuegen = i; break }
  }
  zeilen.splice(einfuegen, 0, `${name}: ${wert}`)
  return zeilen.join('\n')
}

/** Das Datum, das das Werkzeug einsetzt — `--datum` macht Proben moeglich. */
function heute(opt) {
  if (opt.datum) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(opt.datum)) {
      abbruch(`[zyklus-fahren] --datum ${opt.datum} ist kein JJJJ-MM-TT.`)
    }
    return opt.datum
  }
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

// ══ A3 — DER UMZUG ═══════════════════════════════════════════════════
//
// `[read]` **Die Stufen des Wegs, als Zahl** — damit ein Sprung ueber
// eine Stufe messbar ist und nicht nur beschrieben.
const STUFE = { todos: 0, next: 1, laufend: 2, erledigt: 3 }

/** Welche Stufe ist dieser Pfad? Gibt `null`, wenn er keine ist. */
export function stufeVon(relPfad) {
  const teile = relPfad.replace(/\\/g, '/').split('/')
  const i = teile.lastIndexOf('punkte')
  const rest = i >= 0 ? teile.slice(i + 1) : teile
  if (rest[0] === 'todos') return { stufe: 'todos', agent: null }
  if (rest[0] === 'erledigt') return { stufe: 'erledigt', agent: null }
  const m = /^laufend_(.+)$/.exec(rest[0] ?? '')
  if (!m) return null
  if (rest[1] === 'next') return { stufe: 'next', agent: m[1] }
  return { stufe: 'laufend', agent: m[1] }
}

/**
 * Darf von `von` nach `nach` verschoben werden?
 *
 * `[read]` **Der Weg ist `todos/ → next/ → laufend/ → erledigt/`**, und
 * **ein Sprung ueber eine Stufe ist ein Abbruch mit Begruendung** (A3).
 * Nur der Rueckweg nach `todos/` ist frei: ein Punkt, der vom Agenten
 * zurueckkommt, geht dorthin zurueck, aus jeder Stufe.
 *
 * Reine Funktion — pruefbar ohne Dateisystem.
 */
export function wegPruefen(von, nach) {
  if (von === nach) return `${von}/ nach ${nach}/ ist kein Umzug`
  if (nach === 'todos') return null
  const d = STUFE[nach] - STUFE[von]
  if (d < 0) {
    return `${von}/ nach ${nach}/ geht rueckwaerts — zurueck geht nur nach todos/`
  }
  if (d > 1) {
    return `${von}/ nach ${nach}/ springt ueber eine Stufe — `
      + 'der Weg ist todos/ -> next/ -> laufend/ -> erledigt/'
  }
  return null
}

function zielPfad(punkteWurzel, stufe, agent, dateiname) {
  if (stufe === 'todos') return path.join(punkteWurzel, 'todos', dateiname)
  if (stufe === 'erledigt') return path.join(punkteWurzel, 'erledigt', dateiname)
  if (stufe === 'next') return path.join(punkteWurzel, `laufend_${agent}`, 'next', dateiname)
  return path.join(punkteWurzel, `laufend_${agent}`, dateiname)
}

/**
 * `[cmd]` **`git mv` scheitert an untracked Dateien** — ein frisch
 * geschriebener Punkt ist nicht im Index (A3). **Umbenennen auf
 * Dateisystemebene, git sieht ihn am neuen Ort.**
 */
function umziehen(von, nach) {
  if (fs.existsSync(nach)) {
    abbruch(`[zyklus-fahren] ${nach} liegt schon da — kein Ueberschreiben.`)
  }
  fs.mkdirSync(path.dirname(nach), { recursive: true })
  fs.renameSync(von, nach)
}

// ══ A5 — ZYKLUS-PRUEFEN BLEIBT DIE WAHRHEIT ══════════════════════════
//
// `[read]` **Das Werkzeug prueft nicht selbst, was der Waechter prueft.**
// Zwei Pruefungen, die dasselbe behaupten, laufen irgendwann
// auseinander. **Es ruft ihn auf und meldet, wenn er rot ist.**
// `[read]` **`--waechter <pfad>` ist fuer die Probe, nicht fuer den
// Betrieb.** Ohne sie laeuft der echte Waechter; mit ihr kann ein Test
// einen roten unterschieben und belegen, dass das Werkzeug stehenbleibt.
// Ein Test gegen den echten Waechter waere ein Test gegen den echten
// Punktebestand — und der aendert sich bei jedem Auftrag.
function waechter(welcher) {
  const r = spawnSync(process.execPath, [welcher ?? 'tools/zyklus-pruefen.mjs'],
    { cwd: WURZEL, encoding: 'utf8' })
  if (r.status === 0) {
    console.log(`[zyklus-fahren] ${String(r.stdout).trim()}`)
    return
  }
  console.error('[zyklus-fahren] zyklus-pruefen ist ROT nach diesem Schritt:')
  console.error(String(r.stderr).trim())
  process.exit(1)
}

// ══ A1 — DER TABELLENGENERATOR ═══════════════════════════════════════

/**
 * Die Zeilen der Tabelle, abgeleitet aus dem Frontmatter.
 *
 * `[read]` **Nur das Ableitbare:** Agent, Nummer, Titel aus der H1,
 * Stand (`laeuft` mit `beauftragt:`, `bereit in next/`). **Mehr nicht.**
 * „Gebaut, nicht eingespielt" ist eine Beurteilung und gehoert in den
 * Abschnitt *Die Einspielreihenfolge* weiter unten, der von Hand bleibt.
 *
 * `[read]` **Und kein Freitextfeld im Frontmatter dafuer** — Freitext
 * ist eine zweite Wahrheit, die unbemerkt veraltet (G-572). Braucht es
 * spaeter ein Zustandsfeld, dann mit geschlossener Werteliste.
 *
 * Reine Funktion auf gelesenen Punkten — pruefbar ohne Dateisystem.
 */
export function tabellenZeilen(punkte) {
  const zeilen = []
  zeilen.push('| Agent | Nr | Inhalt | Stand |')
  zeilen.push('|---|---|---|---|')

  // `[cmd]` **`laufend_fable/` und `laufend_kimi/` existieren und sind
  // leer** — gemessen 2026-10-01, beide tragen nur `.gitkeep`.
  // `[read]` **Eine Zeile „`next/` ist leer, Schritt 7 offen" fuer einen
  // Agenten, der nie einen Auftrag hatte, ist eine Falschaussage** —
  // niemand wartet dort auf einen vorbereiteten Auftrag. **Ein Agent
  // kommt in die Tabelle, wenn er etwas hat.**
  const taetig = AGENTEN.filter(a =>
    punkte.some(p => p.ordner === `laufend_${a}`))

  const zeile = (name, p, stand) =>
    `| ${name} | ${p.daten?.nr ?? '—'} | ${titelVon(p)} | ${stand} |`

  // `[read]` **Erst alles, was laeuft, dann alles, was bereitliegt.**
  // Dieselbe Gliederung, die die Tabelle von Hand hatte: wer darauf
  // sieht, sucht zuerst die laufenden Auftraege.
  for (const agent of taetig) {
    const name = AGENTNAME[agent] ?? agent
    for (const p of punkte.filter(p => p.ordner === `laufend_${agent}` && !p.vorbereitet)) {
      const b = p.daten?.beauftragt
      zeilen.push(zeile(name, p, `**laeuft**${b ? `, raus ${kurzdatum(b)}` : ''}`))
    }
  }
  for (const agent of taetig) {
    const name = AGENTNAME[agent] ?? agent
    const vorbereitet = punkte.filter(p => p.ordner === `laufend_${agent}` && p.vorbereitet)
    for (const p of vorbereitet) {
      zeilen.push(zeile(name, p, '**bereit in `next/`**'))
    }
    // `[read]` **Ein leeres `next/` ist eine Aussage, keine Luecke** —
    // Schritt 7 des Zyklus ist dann offen, und die Tabelle sagt es.
    if (vorbereitet.length === 0) {
      zeilen.push(`| ${name} | — | \`next/\` ist leer | **offen**: Schritt 7 des Zyklus |`)
    }
  }
  return zeilen
}

/** Die H1 ohne die Nummer davor — dasselbe Vorgehen wie `punkte-index`. */
function titelVon(p) {
  const m = /^#\s+(.+)$/m.exec(p.text.split(/^---\s*$/m).slice(2).join('---'))
  if (!m) return '(ohne Titel)'
  return m[1].replace(/^[A-Z]+-\d+\s*[—–-]\s*/, '').trim()
}

/** `2026-10-01` → `01.10.` — die Form, die in der Tabelle schon stand. */
function kurzdatum(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso).trim())
  return m ? `${m[3]}.${m[2]}.` : String(iso).trim()
}

/**
 * Den erzeugten Abschnitt in `LAUFEND.md` ersetzen.
 *
 * `[read]` **Ausserhalb der Marken bleibt die Datei byteidentisch.**
 * Fehlt eine Marke, bricht es ab — eine geratene Grenze loescht Prosa.
 *
 * Reine Funktion auf Text.
 */
export function abschnittErsetzen(alt, zeilen) {
  const auf = alt.indexOf(MARKE_AUF)
  const zu = alt.indexOf(MARKE_ZU)
  if (auf < 0 || zu < 0) {
    throw new Error(`die Markierungen fehlen in LAUFEND.md — `
      + `erwartet ${MARKE_AUF} und ${MARKE_ZU}`)
  }
  if (zu < auf) throw new Error('die Endmarkierung steht vor der Anfangsmarkierung')
  // Der Zeilenumbruch der Quelldatei bleibt erhalten.
  const crlf = alt.includes('\r\n')
  const umbruch = crlf ? '\r\n' : '\n'
  const vor = alt.slice(0, auf + MARKE_AUF.length)
  const nach = alt.slice(zu)
  return `${vor}${umbruch}${zeilen.join(umbruch)}${umbruch}${nach}`
}

function tabelle(opt) {
  const punkteWurzel = opt.punkte
    ? path.resolve(opt.punkte)
    : path.join(WURZEL, 'docs', 'punkte')
  const ziel = opt.ziel
    ? path.resolve(opt.ziel)
    : path.join(WURZEL, 'docs', 'todo', 'LAUFEND.md')

  const punkte = punkteLesen(punkteWurzel).filter(p => p.ordner.startsWith('laufend_'))
  const zeilen = tabellenZeilen(punkte)

  if (!opt.schreiben) {
    console.log(zeilen.join('\n'))
    console.log('')
    console.log(`[zyklus-fahren] ${zeilen.length - 2} Zeilen. `
      + 'Mit --schreiben landen sie zwischen den Markierungen in '
      + path.relative(WURZEL, ziel).replace(/\\/g, '/') + '.')
    return
  }

  const alt = fs.readFileSync(ziel, 'utf8')
  let neu
  try {
    neu = abschnittErsetzen(alt, zeilen)
  } catch (e) {
    abbruch(`[zyklus-fahren] ${e.message}`)
  }
  if (neu === alt) {
    console.log('[zyklus-fahren] die Tabelle ist schon aktuell, nichts geschrieben.')
    return
  }
  if (opt.trocken) {
    console.log('[zyklus-fahren] --trocken: die Tabelle wuerde sich aendern.')
    return
  }
  sicherSchreiben(ziel, neu)
  console.log(`[zyklus-fahren] ${zeilen.length - 2} Zeilen geschrieben, `
    + 'ausserhalb der Markierungen unveraendert.')
}

// ══ DIE DREI UMZUEGE ═════════════════════════════════════════════════

function punktLesen(pfad) {
  if (!fs.existsSync(pfad)) abbruch(`[zyklus-fahren] ${pfad} gibt es nicht.`)
  const text = fs.readFileSync(pfad, 'utf8')
  const { daten, fehler } = frontmatter(text)
  if (!daten) abbruch(`[zyklus-fahren] ${pfad}: ${fehler.join('; ')}`)
  return { text, daten }
}

function umzug(unterbefehl, frei, opt) {
  const pfad = frei[0]
  if (!pfad) abbruch(`[zyklus-fahren] ${unterbefehl} braucht einen Pfad zur Punktdatei.`)
  const quelle = path.resolve(pfad)
  const herkunft = stufeVon(path.relative(WURZEL, quelle))
  if (!herkunft) {
    abbruch(`[zyklus-fahren] ${pfad} liegt in keiner Stufe des Zyklus `
      + '(todos/, laufend_<agent>/next/, laufend_<agent>/, erledigt/).')
  }

  const punkteWurzel = opt.punkte
    ? path.resolve(opt.punkte)
    : path.join(WURZEL, 'docs', 'punkte')

  // Welche Stufe, welcher Agent, welche Felder?
  const nachStufe = { vorbereiten: 'next', rausgeben: 'laufend', abnehmen: 'erledigt' }[unterbefehl]
  const grund = wegPruefen(herkunft.stufe, nachStufe)
  if (grund) abbruch(`[zyklus-fahren] ${grund}`)

  let agent = herkunft.agent
  if (nachStufe !== 'erledigt') {
    if (opt.agent) {
      if (agent && agent !== opt.agent) {
        abbruch(`[zyklus-fahren] die Datei liegt bei ${agent}, --agent sagt ${opt.agent}.`)
      }
      agent = opt.agent
    }
    if (!agent) abbruch(`[zyklus-fahren] ${unterbefehl} braucht --agent <name>.`)
    if (!AGENTNAME[agent]) {
      abbruch(`[zyklus-fahren] --agent ${agent} ist keiner von `
        + `${Object.keys(AGENTNAME).join(', ')}.`)
    }
  }

  const { text } = punktLesen(quelle)
  let neu = text
  const gesetzt = []
  try {
    if (nachStufe === 'laufend') {
      // `[read]` **agent:/beauftragt: nur beim Weg nach laufend_<agent>/**
      neu = feldSetzen(neu, 'agent', agent)
      neu = feldSetzen(neu, 'beauftragt', heute(opt))
      gesetzt.push(`agent: ${agent}`, `beauftragt: ${heute(opt)}`)
    }
    if (nachStufe === 'erledigt') {
      // `[read]` **erledigt:/commit: nur beim Weg nach erledigt/.** Und
      // der Hash wird nicht erfunden: fehlt er, bricht es ab. Ein Punkt
      // in `erledigt/` ohne Hash behauptet mehr, als er hat (A-81 A6).
      if (!opt.commit) {
        abbruch('[zyklus-fahren] abnehmen braucht --commit <hash>.',
          '  Der Hash wird nicht erfunden und nicht als Platzhalter gesetzt:',
          '  erst committen, dann abnehmen (00-LIESMICH.md, Schritt 6).')
      }
      if (!/^[0-9a-f]{7,40}$/.test(opt.commit)) {
        abbruch(`[zyklus-fahren] --commit ${opt.commit} sieht nicht wie ein `
          + 'Git-Hash aus (7 bis 40 Hexzeichen).')
      }
      neu = feldSetzen(neu, 'erledigt', heute(opt))
      neu = feldSetzen(neu, 'commit', opt.commit)
      gesetzt.push(`erledigt: ${heute(opt)}`, `commit: ${opt.commit}`)
    }
    // `vorbereiten` setzt NICHTS: ein vorbereiteter Auftrag traegt den
    // Auftragsteil, aber noch KEIN agent: (00-LIESMICH.md:430).
  } catch (e) {
    abbruch(`[zyklus-fahren] ${path.relative(WURZEL, quelle)}: ${e.message}`)
  }

  const ziel = zielPfad(punkteWurzel, nachStufe, agent, path.basename(quelle))
  const relZiel = path.relative(WURZEL, ziel).replace(/\\/g, '/')

  if (opt.trocken) {
    console.log(`[zyklus-fahren] --trocken: ${herkunft.stufe}/ -> ${nachStufe}/`)
    for (const g of gesetzt) console.log(`  ${g}`)
    console.log(`  -> ${relZiel}`)
    return
  }

  if (neu !== text) sicherSchreiben(quelle, neu)
  umziehen(quelle, ziel)

  for (const g of gesetzt) console.log(`[zyklus-fahren] ${g}`)
  console.log(`[zyklus-fahren] ${herkunft.stufe}/ -> ${nachStufe}/: ${relZiel}`)
  // `[read]` **A5: der Waechter ist die Wahrheit, nach jedem Schritt.**
  // Auf einer Attrappenwurzel (`--punkte`) laeuft er nicht — er liest
  // `docs/punkte/` und wuerde ueber den echten Bestand urteilen, nicht
  // ueber die Probe. `--waechter` schiebt einen unter.
  if (opt.waechter) waechter(opt.waechter)
  else if (!opt.punkte) waechter()
}

// ── Aufruf ──────────────────────────────────────────────────────────
//
// `[read]` **Nur als Befehl, nicht beim Import.** Der Test ruft die
// reinen Funktionen (`feldSetzen`, `wegPruefen`, `tabellenZeilen`) —
// ein ungeschuetzter Aufruf hier wuerde beim `import` die Hilfe
// ausgeben und mit 1 abbrechen.
// `[read]` **`pathToFileURL` statt Pfadarithmetik** — auf Windows ist
// `new URL(import.meta.url).pathname` ein `/D:/...`, und ein von Hand
// abgeschnittener Schraegstrich ist genau die Art Fehler, die hier
// niemand bemerken wuerde.
const alsBefehl = process.argv[1]
  && pathToFileURL(process.argv[1]).href === import.meta.url

if (alsBefehl) {
  const { frei, opt } = argumente(process.argv.slice(2))
  const befehl = frei.shift()

  if (befehl === 'tabelle') {
    tabelle(opt)
  } else if (befehl === 'vorbereiten' || befehl === 'rausgeben' || befehl === 'abnehmen') {
    umzug(befehl, frei, opt)
  } else {
    abbruch(
      'Die ausfuehrende Haelfte des Zyklus (A-85). Sie entscheidet nichts.',
      '',
      '  node tools/zyklus-fahren.mjs tabelle [--schreiben]',
      '  node tools/zyklus-fahren.mjs vorbereiten <pfad> --agent <name>',
      '  node tools/zyklus-fahren.mjs rausgeben   <pfad> [--agent <name>]',
      '  node tools/zyklus-fahren.mjs abnehmen    <pfad> --commit <hash>',
      '',
      '  --datum JJJJ-MM-TT   statt heute      --trocken   nichts schreiben',
      '  --punkte <verz>      andere Wurzel    --ziel <datei>  andere LAUFEND.md',
      '  --waechter <pfad>    anderer Waechter statt zyklus-pruefen (Proben)',
      '',
      '  Der Weg: todos/ -> next/ -> laufend/ -> erledigt/.',
      '  Ein Sprung ueber eine Stufe ist ein Abbruch. Ein Feld, das schon',
      '  dasteht, wird nicht ueberschrieben. Ein fehlender Hash ist ein',
      '  Abbruch, kein Platzhalter.',
    )
  }
}
