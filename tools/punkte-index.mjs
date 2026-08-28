#!/usr/bin/env node
// Erzeugt `docs/punkte/00-INDEX.md` aus dem Frontmatter.
//
// ══ NIE VON HAND ════════════════════════════════════════════════════
//
// `[read]` **Das Modell sagt es zweimal:** *„erzeugt, nie von Hand"*
// und *„Ein handgefuehrter Index driftet — so wie meine Zahlen
// gedriftet sind."*
//
// `[cmd]` **Der Beleg dafuer steht in G-212:** neun Punkte trugen
// Zahlen, die zwischen 20 % und 300 % danebenlagen — nicht weil
// jemand falsch gemessen hat, sondern weil niemand nachzog.
//
// ══ WIE ER BENUTZT WIRD ═════════════════════════════════════════════
//
//     node tools/punkte-index.mjs              zeigt, was entstuende
//     node tools/punkte-index.mjs --schreiben  schreibt die Datei
//     node tools/punkte-index.mjs --pruefen    rot, wenn veraltet
//
// `[read]` **`--pruefen` gehoert ins Gate, `--schreiben` nicht.**
// Ein Gate, das schreibt, hinterlaesst bei jedem Lauf eine geaenderte
// Datei — **das ist G-202**, und der Punkt ist offen.
import fs from 'node:fs'
import path from 'node:path'

import { punkteLesen, ORDNER } from './punkte-lesen.mjs'

const WURZEL = process.cwd()
const PUNKTE = path.join(WURZEL, 'docs', 'punkte')
const ZIEL = path.join(PUNKTE, '00-INDEX.md')

const SCHREIBEN = process.argv.includes('--schreiben')
const PRUEFEN = process.argv.includes('--pruefen')

/** Die Reihenfolge der Module — die Sicht, in der gearbeitet wird. */
const MODULE = ['medical', 'nutrition', 'supplements', 'training',
  'recovery', 'goals', 'coach', 'quer']

function sortSchluessel(p) {
  const m = /^([A-Z]+)-(\d+)$/.exec(String(p.daten?.nr ?? ''))
  return m ? `${m[1]}-${m[2].padStart(4, '0')}` : String(p.daten?.nr ?? '')
}

function titelVon(p) {
  // Die Ueberschrift der Datei, ohne die Nummer davor.
  const m = /^#\s+(.+)$/m.exec(p.text.split(/^---\s*$/m).slice(2).join('---'))
  if (!m) return '(ohne Titel)'
  return m[1].replace(/^[A-Z]+-\d+\s*[—–-]\s*/, '').trim()
}

const punkte = punkteLesen(PUNKTE).filter(p => p.daten && p.daten.nr)
const nummern = new Set(punkte.map(p => String(p.daten.nr)))

const alsListe = v => (Array.isArray(v) ? v : (v == null ? [] : [v]))
  .map(x => String(x).trim()).filter(Boolean)

/**
 * Ist der Punkt blockiert?
 *
 * `[read]` **Nur durch Blocker, die selbst noch offen sind.** Ein
 * `braucht:` auf einen erledigten Punkt blockiert nichts — sonst
 * stuende die halbe Liste dauerhaft als „wartet".
 */
function blocker(p) {
  return alsListe(p.daten.braucht).filter(b => {
    const ziel = punkte.find(x => String(x.daten.nr) === b)
    return ziel ? ziel.ordner !== 'erledigt' : false
  })
}

const zeilen = []
zeilen.push('# Punkte — Index')
zeilen.push('')
zeilen.push('**Erzeugt aus dem Frontmatter. Nie von Hand pflegen.**')
zeilen.push('`node tools/punkte-index.mjs --schreiben`')
zeilen.push('')

// ── Kopfzahlen ──────────────────────────────────────────────────────
const jeOrdner = {}
for (const p of punkte) jeOrdner[p.ordner] = (jeOrdner[p.ordner] ?? 0) + 1
zeilen.push('| Zustand | Punkte |')
zeilen.push('|---|---|')
for (const o of ORDNER) {
  if (!jeOrdner[o]) continue
  zeilen.push(`| \`${o}\` | ${jeOrdner[o]} |`)
}
zeilen.push(`| **gesamt** | **${punkte.length}** |`)
zeilen.push('')

// ── Je Modul ────────────────────────────────────────────────────────
const module = [...new Set(punkte.map(p => String(p.daten.modul ?? '?')))]
  .sort((a, b) => {
    const ia = MODULE.indexOf(a), ib = MODULE.indexOf(b)
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) || a.localeCompare(b)
  })

// ══ DIE KINDER WERDEN ABGELEITET, NICHT GEPFLEGT — A-58 ═════════════
//
// `[read]` **Das Modell fuehrt kein Feld `kinder`** — nachzulesen in
// `00-LIESMICH.md`: *„Die Kinder stehen im Index, abgeleitet aus
// `kind_von`."*
//
// `[cmd]` **Der Grund, gemessen:** nach der Migration standen **121
// `kind_von` gegen 1 `kinder`.** Wer ein Kind anlegt, traegt
// `kind_von` ein; **niemand geht zum Elternteil zurueck.** Zwei
// Felder fuer dieselbe Beziehung sind eine Driftquelle.
//
// `[read]` **Abgeleitet kann nichts driften.** Die Richtung, die
// gepflegt wird, ist die einzige, die zaehlt.
const kinderVon = new Map()
for (const p of punkte) {
  const el = String(p.daten.kind_von ?? '').trim()
  if (!el) continue
  if (!kinderVon.has(el)) kinderVon.set(el, [])
  kinderVon.get(el).push(String(p.daten.nr))
}
for (const liste of kinderVon.values()) liste.sort()

for (const modul of module) {
  const eigene = punkte.filter(p => String(p.daten.modul ?? '?') === modul)
    .sort((a, b) => sortSchluessel(a).localeCompare(sortSchluessel(b)))
  zeilen.push(`## ${modul} — ${eigene.length}`)
  zeilen.push('')

  // `[read]` **Blockierte sichtbar von unblockierten getrennt** —
  // damit man sieht, was ueberhaupt beauftragbar ist.
  const frei = eigene.filter(p => blocker(p).length === 0)
  const wartet = eigene.filter(p => blocker(p).length > 0)

  const tabelle = (liste, ueberschrift) => {
    if (liste.length === 0) return
    if (ueberschrift) {
      zeilen.push(`### ${ueberschrift} — ${liste.length}`)
      zeilen.push('')
    }
    zeilen.push('| Nr | Typ | Schwere | Titel | Zustand | Blocker | Kinder |')
    zeilen.push('|---|---|---|---|---|---|---|')
    for (const p of liste) {
      const b = blocker(p)
      zeilen.push(`| \`${p.daten.nr}\` | ${p.daten.typ ?? '?'} `
        + `| ${p.daten.schwere ?? '?'} `
        + `| [${titelVon(p).replace(/\|/g, '\\|')}](${p.ordner}/${p.name}) `
        + `| ${p.zustand} `
        + `| ${b.length ? b.join(', ') : '—'} `
        + `| ${(kinderVon.get(String(p.daten.nr)) ?? []).join(', ') || '—'} |`)
    }
    zeilen.push('')
  }

  if (wartet.length === 0) {
    tabelle(frei, null)
  } else {
    tabelle(frei, 'beauftragbar')
    tabelle(wartet, 'wartet auf Blocker')
  }
}

// ── Verweise, die nur der Altbestand kennt ──────────────────────────
//
// `[read]` **Sie gehoeren in den Index, nicht in eine Fussnote.**
// `[cmd]` Solange erledigte Punkte nicht migriert sind, zeigen 93
// Verweise auf Nummern, die es unter `docs/punkte/` nicht gibt.
const offeneVerweise = new Set()
for (const p of punkte) {
  // A-58: `kinder` faellt weg — das Feld gibt es nicht mehr.
  for (const b of [...alsListe(p.daten.braucht),
    ...(p.daten.kind_von ? [String(p.daten.kind_von)] : [])]) {
    if (!nummern.has(b)) offeneVerweise.add(b)
  }
}
if (offeneVerweise.size > 0) {
  zeilen.push('## Verweise ausserhalb von `docs/punkte/`')
  zeilen.push('')
  zeilen.push(`${offeneVerweise.size} Nummern werden genannt, liegen aber in `
    + 'keinem Punktordner — erledigte Punkte sind noch nicht migriert:')
  zeilen.push('')
  zeilen.push([...offeneVerweise].sort().map(x => `\`${x}\``).join(' · '))
  zeilen.push('')
}

const inhalt = zeilen.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd() + '\n'

if (SCHREIBEN) {
  fs.mkdirSync(path.dirname(ZIEL), { recursive: true })
  fs.writeFileSync(ZIEL, inhalt, { encoding: 'utf8' })
  console.log(`[index] ${punkte.length} Punkte -> docs/punkte/00-INDEX.md`)
  process.exit(0)
}

if (PRUEFEN) {
  if (!fs.existsSync(ZIEL)) {
    console.error('[index] docs/punkte/00-INDEX.md fehlt.')
    console.error('        node tools/punkte-index.mjs --schreiben')
    process.exit(1)
  }
  const ist = fs.readFileSync(ZIEL, 'utf8')
  if (ist !== inhalt) {
    console.error('[index] docs/punkte/00-INDEX.md ist nicht auf dem Stand '
      + 'des Frontmatters.')
    console.error('        node tools/punkte-index.mjs --schreiben')
    process.exit(1)
  }
  console.log(`[index] 00-INDEX.md stimmt mit ${punkte.length} Punkten ueberein.`)
  process.exit(0)
}

process.stdout.write(inhalt)
