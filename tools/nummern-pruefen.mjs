#!/usr/bin/env node
// Prueft die Nummernvergabe in docs/todo/.
//
// Anlass (2026-08-21): Neun Nummern waren gleichzeitig doppelt vergeben --
// darunter A-18, das selbst "Berichtsnummern kollidieren" heisst. Die Regel
// stand in CLAUDE.md und griff nicht, weil sie ein Absatz war und kein
// Werkzeug.
//
// Prueft:
//   dublette-todo       Dubletten innerhalb von TODO.md
//   dublette-erledigt   Dubletten innerhalb von ERLEDIGT.md
//   beide-dateien       Nummern, die in beiden Dateien stehen
//   haken-in-todo       Abgehakte Punkte, die in TODO.md liegengeblieben sind
//   laufend-unbekannt   LAUFEND.md nennt eine Nummer, die nirgends angelegt ist
//   laufend-erledigt    LAUFEND.md fuehrt einen Auftrag, der schon erledigt ist
//   kopfzaehler         Den Zaehler im TODO-Kopf gegen die Datei
//
// Gegenprobe: LUMEOS_NUMMERN_SELBSTTEST=1 baut je Pruefung einen eigenen
// Fehler ein und verlangt, dass genau diese Pruefung anschlaegt.
//
// Die alte Fassung hing dafuer eine A-01-Zeile an TODO.md an. A-01 steht
// dort nicht, sondern in ERLEDIGT.md -- angeschlagen ist deshalb
// beide-dateien, gemeldet wurde dublette-todo. Der Selbsttest war gruen,
// ohne dass die benannte Pruefung je gelaufen waere. Eine Pruefung, die
// beim Selbsttest die falsche Ursache nennt, ist nicht belegt.

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const WURZEL = resolve(process.cwd())
const PFAD = {
  todo: resolve(WURZEL, 'docs/todo/TODO.md'),
  erledigt: resolve(WURZEL, 'docs/todo/ERLEDIGT.md'),
  laufend: resolve(WURZEL, 'docs/todo/LAUFEND.md')
}

const ZEILE = /^[ \t]*- \[( |x|~)\] \*\*([A-Z]+-\d+[a-z]?):/

// In LAUFEND.md stehen die Auftraege in Tabellenzeilen, fett gesetzt und
// ohne Doppelpunkt: | **C-185** Peptide ... | `supabase/` |
const LAUFEND_NR = /\*\*([A-Z]+-\d+[a-z]?)\*\*/g

function punkte (text) {
  const aus = []
  text.split('\n').forEach((z, i) => {
    const m = z.match(ZEILE)
    if (m) aus.push({ zustand: m[1], nr: m[2], zeile: i + 1, titel: z.trim().slice(0, 90) })
  })
  return aus
}

function ersteNummer (text) {
  const p = punkte(text)
  if (!p.length) throw new Error('keine Punkte gefunden')
  return p[0].nr
}

// Alle Pruefungen an einer Stelle. Gibt eine Liste von Befunden zurueck,
// jeder mit dem Namen der Pruefung, die ihn gefunden hat -- der Selbsttest
// haengt daran.
function pruefe (texte) {
  const fehler = []
  const offen = punkte(texte.todo)
  const fertig = punkte(texte.erledigt)

  for (const [datei, liste, pruefung] of [
    ['TODO.md', offen, 'dublette-todo'],
    ['ERLEDIGT.md', fertig, 'dublette-erledigt']
  ]) {
    const nach = new Map()
    for (const p of liste) {
      if (!nach.has(p.nr)) nach.set(p.nr, [])
      nach.get(p.nr).push(p)
    }
    for (const [nr, vor] of nach) {
      if (vor.length > 1) {
        fehler.push({
          pruefung,
          text: `${datei}: ${nr} steht ${vor.length}x -- Zeilen ${vor.map(v => v.zeile).join(', ')}`
        })
      }
    }
  }

  const fertigNr = new Set(fertig.map(p => p.nr))
  for (const p of offen) {
    if (fertigNr.has(p.nr)) {
      fehler.push({
        pruefung: 'beide-dateien',
        text: `${p.nr} steht offen UND erledigt -- TODO Zeile ${p.zeile}`
      })
    }
  }

  // Ein Haken in TODO.md schliesst nichts -- er versteckt es. Neun solche
  // Punkte lagen dort, keiner davon hatte einen Eintrag in ERLEDIGT.md,
  // und beide-dateien kann sie deshalb nicht sehen.
  for (const p of offen) {
    if (p.zustand === 'x') {
      fehler.push({
        pruefung: 'haken-in-todo',
        text: `${p.nr} ist abgehakt und steht in TODO.md -- Zeile ${p.zeile}. Erledigtes gehoert nach ERLEDIGT.md.`
      })
    }
  }

  // LAUFEND.md sagt, wer woran arbeitet. Steht dort eine Nummer, die es
  // nicht gibt, oder ein Auftrag, der laengst in ERLEDIGT.md liegt, dann
  // schickt die Datei jemanden auf eine Arbeit, die keine mehr ist.
  const angelegt = new Set([...offen, ...fertig].map(p => p.nr))
  const offenNr = new Set(offen.map(p => p.nr))
  for (const nr of new Set([...texte.laufend.matchAll(LAUFEND_NR)].map(m => m[1]))) {
    if (!angelegt.has(nr)) {
      fehler.push({
        pruefung: 'laufend-unbekannt',
        text: `LAUFEND.md nennt ${nr} -- angelegt ist die Nummer weder in TODO.md noch in ERLEDIGT.md.`
      })
    } else if (!offenNr.has(nr)) {
      fehler.push({
        pruefung: 'laufend-erledigt',
        text: `LAUFEND.md fuehrt ${nr} als Auftrag, der Punkt steht in ERLEDIGT.md.`
      })
    }
  }

  const kopf = texte.todo.slice(0, 600)
  const m = kopf.match(/\*\*Stand:[^*]*\*\*\s*(\d+)\s+offen/)
  const gezaehltOffen = offen.filter(p => p.zustand === ' ').length
  if (!m) {
    fehler.push({
      pruefung: 'kopfzaehler',
      text: 'Kein Zaehler im Kopf gefunden -- Format "**Stand: DATUM.** N offen"'
    })
  } else if (Number(m[1]) !== gezaehltOffen) {
    fehler.push({
      pruefung: 'kopfzaehler',
      text: `Kopf sagt ${m[1]} offen, gezaehlt sind ${gezaehltOffen}`
    })
  }

  return { fehler, offen, fertig, gezaehltOffen }
}

function lesen () {
  return {
    todo: readFileSync(PFAD.todo, 'utf8'),
    erledigt: readFileSync(PFAD.erledigt, 'utf8'),
    laufend: readFileSync(PFAD.laufend, 'utf8')
  }
}

// --- Gegenprobe -----------------------------------------------------------
// Jeder Fall baut genau einen Fehler ein und verlangt, dass genau die
// benannte Pruefung anschlaegt -- nicht irgendeine. Faelle, die einen
// offenen Punkt hinzufuegen, ziehen den Kopfzaehler mit, sonst schluege
// kopfzaehler mit an und der Fall bewiese zwei Dinge halb.

function kopfAnpassen (todo, delta) {
  return todo.replace(/(\*\*Stand:[^*]*\*\*\s*)(\d+)(\s+offen)/,
    (_, a, n, b) => a + (Number(n) + delta) + b)
}

function faelle (basis) {
  const inTodo = ersteNummer(basis.todo)
  const inErledigt = ersteNummer(basis.erledigt)
  return [
    {
      pruefung: 'dublette-todo',
      was: `${inTodo} ein zweites Mal in TODO.md`,
      bau: t => ({
        ...t,
        todo: kopfAnpassen(`${t.todo}\n- [ ] **${inTodo}: eingebaute Dublette**\n`, 1)
      })
    },
    {
      pruefung: 'dublette-erledigt',
      was: `${inErledigt} ein zweites Mal in ERLEDIGT.md`,
      bau: t => ({ ...t, erledigt: `${t.erledigt}\n- [x] **${inErledigt}: eingebaute Dublette**\n` })
    },
    {
      pruefung: 'beide-dateien',
      was: `${inErledigt} zusaetzlich als offener Punkt`,
      bau: t => ({
        ...t,
        todo: kopfAnpassen(`${t.todo}\n- [ ] **${inErledigt}: offen und erledigt zugleich**\n`, 1)
      })
    },
    {
      pruefung: 'haken-in-todo',
      was: 'ein abgehakter Punkt bleibt in TODO.md liegen',
      bau: t => ({ ...t, todo: `${t.todo}\n- [x] **ZZ-998: abgehakt und liegengeblieben**\n` })
    },
    {
      pruefung: 'laufend-unbekannt',
      was: 'LAUFEND.md nennt eine Nummer, die es nicht gibt',
      bau: t => ({ ...t, laufend: `${t.laufend}\n| **ZZ-997** nie angelegt | \`nirgends\` |\n` })
    },
    {
      pruefung: 'laufend-erledigt',
      was: `LAUFEND.md fuehrt ${inErledigt}, das erledigt ist`,
      bau: t => ({ ...t, laufend: `${t.laufend}\n| **${inErledigt}** laengst erledigt | \`supabase/\` |\n` })
    },
    {
      pruefung: 'kopfzaehler',
      was: 'Kopfzaehler um eins verstellt',
      bau: t => ({ ...t, todo: kopfAnpassen(t.todo, 1) })
    }
  ]
}

function selbsttest (basis) {
  const grund = pruefe(basis).fehler
  if (grund.length) {
    console.error('[nummern] SELBSTTEST: der Ausgangsstand ist schon rot --')
    grund.forEach(f => console.error(`            ${f.pruefung}: ${f.text}`))
    return 1
  }

  let schlecht = 0
  for (const fall of faelle(basis)) {
    const getroffen = pruefe(fall.bau(basis)).fehler.map(f => f.pruefung)
    const einzig = getroffen.length === 1 && getroffen[0] === fall.pruefung
    if (einzig) {
      console.log(`[nummern] ok    ${fall.pruefung} -- ${fall.was}`)
    } else {
      schlecht++
      const gefunden = getroffen.length ? getroffen.join(', ') : 'nichts'
      console.error(`[nummern] ROT   ${fall.pruefung} -- ${fall.was}: angeschlagen hat ${gefunden}`)
    }
  }

  if (schlecht) {
    console.error(`[nummern] SELBSTTEST: ${schlecht} von ${faelle(basis).length} Faellen nicht belegt.`)
    return 1
  }
  console.log(`[nummern] SELBSTTEST bestanden -- ${faelle(basis).length} Pruefungen einzeln belegt.`)
  return 0
}

// --- Lauf -----------------------------------------------------------------

const basis = lesen()

if (process.env.LUMEOS_NUMMERN_SELBSTTEST === '1') {
  process.exit(selbsttest(basis))
}

const { fehler, offen, fertig, gezaehltOffen } = pruefe(basis)

for (const f of fehler) console.error(`[nummern] ${f.pruefung}: ${f.text}`)

if (fehler.length === 0) {
  const hoch = new Map()
  for (const p of [...offen, ...fertig]) {
    const [pre, num] = p.nr.split(/-(?=\d)/)
    hoch.set(pre, Math.max(hoch.get(pre) ?? 0, parseInt(num, 10)))
  }
  const liste = [...hoch.entries()].sort().map(([k, v]) => `${k}-${v}`).join(' \u00b7 ')
  // Dieselbe Zaehlweise wie der Kopf von TODO.md: "offen" sind die [ ].
  // Die alte Zeile nannte alle Punkte "offen" -- 174 gegen 165 im Kopf,
  // aus demselben Lauf.
  const arbeit = offen.filter(x => x.zustand === '~').length
  console.log(`[nummern] TODO.md: ${gezaehltOffen} offen, ${arbeit} in Arbeit `
    + `(${offen.length} Punkte). ERLEDIGT.md: ${fertig.length}. Keine Dublette.`)
  console.log(`[nummern] Hoechste vergebene Nummer je Reihe: ${liste}`)
}

process.exit(fehler.length > 0 ? 1 : 0)
