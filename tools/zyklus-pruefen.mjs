#!/usr/bin/env node
// Der Zyklus wird erzwungen, nicht beschrieben.
//
// ══ WARUM ES DIESEN WAECHTER GIBT ════════════════════════════════════
//
// `[cmd]` **A-81, 2026-09-29:** `docs/punkte/00-LIESMICH.md` beschreibt
// seit dem 2026-08-30 einen Vierstufen-Zyklus mit `laufend_<agent>/next/`.
// **Beide `next/`-Ordner waren dreissig Tage leer**, und kein laufender
// Punkt trug seinen Auftragsteil.
//
// `[cmd]` **Und `00-LIESMICH.md:228` ,,Der Orchestrator zaehlt nicht"
// steht seit dem 2026-08-27** — mit elf Fehlzaehlungen aufgelistet.
// **Am 2026-09-29 kamen sechs weitere dazu**, alle gegen dieselbe Regel.
//
// `[read]` **Zwei Regeln, die vollstaendig geschrieben dastanden und
// nicht befolgt wurden.** Der Grund ist derselbe: `00-LIESMICH.md` wird
// nur gelesen, wenn jemand darauf zeigt. **Eine Regel, die von
// Aufmerksamkeit abhaengt, ist eine Empfehlung.**
//
// `[read]` **Deshalb prueft dieser Waechter das, was mechanisch pruefbar
// ist** — nicht ob jemand die Datei gelesen hat, sondern ob das Ergebnis
// aussieht wie eines, bei dem sie befolgt wurde.
//
// ══ WAS ER PRUEFT ════════════════════════════════════════════════════
//
//     todos/                  KEIN agent:, KEIN beauftragt:
//                             (nicht zugeteilt heisst nicht zugeteilt)
//     laufend_<agent>/        agent: passt zum Ordner, beauftragt: da,
//                             UND ein Auftragsteil in derselben Datei
//     laufend_<agent>/next/   Auftragsteil da, aber NOCH KEIN agent:
//                             (00-LIESMICH.md:430)
//     erledigt/              -- nicht hier, das prueft punkte-pruefen
//
// ══ WAS ER NICHT TUT ═════════════════════════════════════════════════
//
// `[read]` **Er repariert nichts und er liest keinen Auftragstext.** Ob
// ein Auftrag gut ist, entscheidet kein Waechter. **Er stellt fest, dass
// einer da ist, wo einer hingehoert.**
//
// Aufruf:
//     node tools/zyklus-pruefen.mjs
import fs from 'node:fs'
import path from 'node:path'

const WURZEL = process.cwd()
const PUNKTE = path.join(WURZEL, 'docs', 'punkte')

// `[read]` **Sollstand 0, und das ist Absicht.** Anders als bei
// `punkte-pruefen` (25) gibt es hier keinen Altbestand, den man
// mitschleppen muesste: die Regel wurde am 2026-09-29 auf alle vier
// Ordner angewandt, vier Punkte in `todos/` bereinigt, danach 0.
//
// `[read]` **Ein Sollstand, den jemand beim Roten anhebt, misst nichts**
// — A-70 hat das belegt. Wer hier anhebt, hat den Zyklus gebrochen und
// nicht den Waechter verbessert.
const SOLLSTAND = 0

// Ein Auftragsteil ist eine Ueberschrift, die "Auftrag" enthaelt.
// `[read]` Bewusst grosszuegig: "## Auftrag", "## Vorbereiteter Auftrag
// - Codex", "### AUFTRAG FUER ..." zaehlen alle. Der Waechter prueft die
// Anwesenheit, nicht die Form.
const AUFTRAG = /^#{2,4} .*(Auftrag|AUFTRAG)/m

const REGELN = [
  { ordner: 'todos', agent: null, auftrag: false },
  { ordner: 'laufend_codex', agent: 'codex', auftrag: true },
  { ordner: 'laufend_claudecode', agent: 'claudecode', auftrag: true },
  { ordner: path.join('laufend_codex', 'next'), agent: null, auftrag: true },
  { ordner: path.join('laufend_claudecode', 'next'), agent: null, auftrag: true },
]

function frontmatter(text) {
  if (!text.startsWith('---')) return ''
  const ende = text.indexOf('\n---', 3)
  return ende === -1 ? '' : text.slice(3, ende)
}

function feld(kopf, name) {
  const m = kopf.match(new RegExp(`^${name}:\\s*(\\S.*)$`, 'm'))
  if (!m) return null
  const wert = m[1].trim()
  return wert === 'null' || wert === '' ? null : wert
}

const befunde = []

for (const regel of REGELN) {
  const d = path.join(PUNKTE, regel.ordner)
  if (!fs.existsSync(d)) continue
  const dateien = fs.readdirSync(d).filter(n => n.endsWith('.md')).sort()

  for (const name of dateien) {
    const pfad = path.join(d, name)
    const text = fs.readFileSync(pfad, 'utf8')
    const kopf = frontmatter(text)
    const rel = path.join('docs', 'punkte', regel.ordner, name)

    const agent = feld(kopf, 'agent')
    const beauftragt = feld(kopf, 'beauftragt')
    const hatAuftrag = AUFTRAG.test(text)

    if (regel.agent === null) {
      if (agent) befunde.push([rel, `agent: ${agent} — gehoert nicht in ${regel.ordner}/`])
      if (beauftragt) befunde.push([rel, `beauftragt: ${beauftragt} — gehoert nicht in ${regel.ordner}/`])
    } else {
      if (!agent) befunde.push([rel, `agent: fehlt — ein laufender Punkt nennt seinen Agenten`])
      else if (agent !== regel.agent) befunde.push([rel, `agent: ${agent}, aber der Ordner sagt ${regel.agent}`])
      if (!beauftragt) befunde.push([rel, 'beauftragt: fehlt — wann ging der Auftrag raus?'])
    }

    if (regel.auftrag && !hatAuftrag) {
      befunde.push([rel, 'kein Auftragsteil in der Datei (00-LIESMICH.md:22-41)'])
    }
    if (!regel.auftrag && hatAuftrag && regel.ordner === 'todos') {
      // `[read]` **Kein Befund.** Ein zurueckgelegter Punkt darf den
      // Auftragstext behalten - er ist Teil seiner Geschichte. Nur
      // `agent:` und `beauftragt:` behaupten eine Zuteilung, die nicht
      // mehr gilt.
    }
  }
}

if (befunde.length > SOLLSTAND) {
  console.error(`[zyklus] ROT: ${befunde.length} Verstoesse, Soll ${SOLLSTAND}.`)
  console.error('')
  for (const [pfad, grund] of befunde) {
    console.error(`  ${pfad}`)
    console.error(`    ${grund}`)
  }
  console.error('')
  console.error('  Der Zyklus (docs/punkte/00-LIESMICH.md):')
  console.error('')
  console.error('    todos/                  offen, kein Auftrag geschrieben')
  console.error('    laufend_<agent>/next/   Auftrag geschrieben, noch nicht raus')
  console.error('    laufend_<agent>/        laeuft')
  console.error('    erledigt/               abgenommen')
  console.error('')
  console.error('  Der Auftragsteil steht IN der Punktdatei, nicht im')
  console.error('  Gespraech. Verschoben wird BEIM Beauftragen, nicht')
  console.error('  danach. agent:/beauftragt: kommen beim Verschieben')
  console.error('  eine Ebene hoeher dazu und gehen beim Zuruecklegen weg.')
  console.error('')
  console.error('  DAS SOLL HIER WIRD NICHT ANGEHOBEN. Wer es anhebt, hat')
  console.error('  den Zyklus gebrochen und nicht den Waechter verbessert.')
  process.exit(1)
}

const zahl = (o) => {
  const d = path.join(PUNKTE, o)
  return fs.existsSync(d) ? fs.readdirSync(d).filter(n => n.endsWith('.md')).length : 0
}
console.log(`[zyklus] gruen: ${zahl('todos')} offen · ` +
            `${zahl(path.join('laufend_codex', 'next'))}+${zahl(path.join('laufend_claudecode', 'next'))} vorbereitet · ` +
            `${zahl('laufend_codex')}+${zahl('laufend_claudecode')} laufend. ` +
            `Jeder laufende und vorbereitete Punkt traegt seinen Auftrag.`)
