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
//   uebersicht-veraltet 00-UEBERSICHT.md gegen den Bestand in TODO.md
//
// `--schreiben` erzeugt `docs/todo/00-UEBERSICHT.md` neu. Die Datei wird
// NICHT von Hand gepflegt: ein handgepflegter Zweitindex driftet gegen
// den ersten, das war die Fehlerquelle, die den alten Uebersichtsblock
// gekostet hat. Sie kommt aus denselben Zeilen wie der Zaehler.
//
// Gegenprobe: LUMEOS_NUMMERN_SELBSTTEST=1 baut je Pruefung einen eigenen
// Fehler ein und verlangt, dass genau diese Pruefung anschlaegt.
//
// Die alte Fassung hing dafuer eine A-01-Zeile an TODO.md an. A-01 steht
// dort nicht, sondern in ERLEDIGT.md -- angeschlagen ist deshalb
// beide-dateien, gemeldet wurde dublette-todo. Der Selbsttest war gruen,
// ohne dass die benannte Pruefung je gelaufen waere. Eine Pruefung, die
// beim Selbsttest die falsche Ursache nennt, ist nicht belegt.

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'

const WURZEL = resolve(process.cwd())
const PFAD = {
  todo: resolve(WURZEL, 'docs/todo/TODO.md'),
  erledigt: resolve(WURZEL, 'docs/todo/ERLEDIGT.md'),
  laufend: resolve(WURZEL, 'docs/todo/LAUFEND.md'),
  uebersicht: resolve(WURZEL, 'docs/todo/00-UEBERSICHT.md'),
  auftraege: resolve(WURZEL, 'docs/auftraege'),
  berichte: resolve(WURZEL, 'docs/berichte'),
  ssot: resolve(WURZEL, 'docs/ssot'),
  ssotIndex: resolve(WURZEL, 'docs/ssot/00-INDEX.md')
}

// `[read]` Berichte von vor dem 2026-08-23 haben keine Auftragsdatei --
// der Ordner `docs/auftraege/` gab es damals nicht. Sie werden nicht
// rueckwirkend nachgeschrieben: ein aus dem Gedaechtnis erfundener
// Auftrag waere genau die Selbstauskunft, gegen die der Ordner gebaut
// ist. Die Liste steht hier namentlich, damit sie beim Lesen auffaellt
// und nicht als stille Regel mitlaeuft. Sie waechst nicht.
const BERICHTE_OHNE_AUFTRAG = new Set(['C-235', 'C-236', 'G-161', 'C-243'])


// `c-245-codex.md` -> C-245. `00-LIESMICH.md` und alles ohne fuehrende
// Nummer faellt raus. Der Dateiname traegt die Leitnummer; ein Auftrag
// darf weitere Punkte mitnehmen, geprueft wird die im Namen.
const DATEI_NR = /^([a-z]+)-(\d+[a-z]?)-/

function nummernAusOrdner (pfad) {
  if (!existsSync(pfad)) return []
  return readdirSync(pfad)
    .filter(n => n.endsWith('.md'))
    .map(n => {
      const m = n.match(DATEI_NR)
      return m ? { datei: n, nr: `${m[1].toUpperCase()}-${m[2]}` } : null
    })
    .filter(Boolean)
}


const ZEILE = /^[ \t]*- \[( |x|~)\] \*\*([A-Z]+-\d+[a-z]?):/

// In LAUFEND.md stehen die Auftraege in Tabellenzeilen, fett gesetzt und
// ohne Doppelpunkt: | **C-185** Peptide ... | `supabase/` |
const LAUFEND_NR = /\*\*([A-Z]+-\d+[a-z]?)\*\*/g

function punkte (text) {
  const aus = []
  let sektion = '(ohne Sektion)'
  text.split('\n').forEach((z, i) => {
    if (z.startsWith('## ')) sektion = z.slice(3).trim()
    const m = z.match(ZEILE)
    if (m) {
      // Der Titel steht zwischen `**NR:` und dem schliessenden `**`.
      const t = z.match(/\*\*[A-Z]+-\d+[a-z]?:\s*([^*]+)/)
      aus.push({
        zustand: m[1],
        nr: m[2],
        zeile: i + 1,
        sektion,
        kurz: (t ? t[1] : '').trim().replace(/\s+/g, ' ').slice(0, 90),
        titel: z.trim().slice(0, 90)
      })
    }
  })
  return aus
}

function ersteNummer (text) {
  const p = punkte(text)
  if (!p.length) throw new Error('keine Punkte gefunden')
  return p[0].nr
}

function uebersichtBauen (offen) {
  const zeichen = { ' ': 'offen', '~': 'in Arbeit', x: 'ABGEHAKT' }
  const zeilen = [
    '# Übersicht — offene Punkte',
    '',
    '**Diese Datei wird erzeugt, nicht gepflegt.**',
    'Sie kommt aus `docs/todo/TODO.md`, aus denselben Zeilen wie der',
    'Zähler im Kopf. `pnpm exec node tools/nummern-pruefen.mjs --schreiben`',
    'schreibt sie neu; das Gate wird rot, wenn sie vom Bestand abweicht.',
    '',
    '`[read]` Der alte Übersichtsblock stand von Hand in `TODO.md` und ist',
    'gegen die Punkte darunter gedriftet. Ein Zweitindex ist nur brauchbar,',
    'wenn er erzeugt und geprüft wird.',
    ''
  ]
  let letzte = null
  for (const p of offen) {
    if (p.sektion !== letzte) {
      zeilen.push('', `## ${p.sektion}`, '', '| | Zustand | Zeile |', '|---|---|---:|')
      letzte = p.sektion
    }
    zeilen.push(`| **${p.nr}** ${p.kurz} | ${zeichen[p.zustand]} | ${p.zeile} |`)
  }
  zeilen.push('')
  return zeilen.join('\n')
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

  // `docs/auftraege/` sagt seit 2026-08-23, was verlangt wurde. Eine
  // Auftragsdatei ohne Punkt im Register ist verloren -- so ist C-186
  // verschwunden. Geprueft wird die Nummer aus dem Dateinamen; ein
  // Auftrag darf weitere Punkte mitnehmen.
  const berichtNr = new Set(texte.berichte.map(b => b.nr))
  const auftragNr = new Set(texte.auftraege.map(a => a.nr))
  for (const a of texte.auftraege) {
    if (!angelegt.has(a.nr)) {
      fehler.push({
        pruefung: 'auftrag-ohne-punkt',
        text: `docs/auftraege/${a.datei} traegt ${a.nr} -- angelegt ist die Nummer weder in TODO.md noch in ERLEDIGT.md.`
      })
    } else if (!offenNr.has(a.nr) && !berichtNr.has(a.nr)) {
      // `[read]` Der Punkt ist geschlossen, aber es liegt kein Bericht
      // daneben. Dann ist er entweder ohne Nachweis abgenommen worden,
      // oder der Bericht ist verlorengegangen -- beides ist ein Befund.
      fehler.push({
        pruefung: 'auftrag-ohne-bericht',
        text: `${a.nr} ist erledigt, aber docs/berichte/ traegt keinen Bericht dazu (Auftrag: ${a.datei}).`
      })
    }
  }

  // Die Gegenrichtung: ein Bericht ohne Auftrag heisst, dass jemand
  // gearbeitet hat, ohne dass nachlesbar ist, was verlangt war. Genau
  // diese Luecke hat am 2026-08-23 einen Auftragsfehler beinahe zu
  // einem Agentenfehler gemacht (C-245).
  for (const b of texte.berichte) {
    if (!auftragNr.has(b.nr) && !BERICHTE_OHNE_AUFTRAG.has(b.nr)) {
      fehler.push({
        pruefung: 'bericht-ohne-auftrag',
        text: `docs/berichte/${b.datei} traegt ${b.nr}, aber docs/auftraege/ hat keinen Auftrag dazu.`
      })
    }
  }

  // `[cmd]` Am 2026-08-18 fehlten vier Indexzeilen -- 123, 126, 128,
  // 131. Gefunden hat sie ein Agent, nicht der Orchestrator. Der Index
  // ist laut CLAUDE.md der Einstieg: ein Bericht, der nicht drinsteht,
  // existiert fuer die naechste Sitzung nicht.
  for (const datei of texte.ssotDateien) {
    if (!texte.ssotIndex.includes(`\`${datei}\``)) {
      fehler.push({
        pruefung: 'ssot-ohne-index',
        text: `docs/ssot/${datei} steht nicht in 00-INDEX.md -- fuer die naechste Sitzung existiert der Bericht damit nicht.`
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

  // Die Uebersicht ist erzeugt. Weicht sie ab, ist sie von Hand
  // angefasst worden oder jemand hat vergessen, sie neu zu schreiben --
  // beides macht sie zur zweiten Wahrheit.
  //
  // `[read]` Eine fehlende Datei ist ebenfalls ein Befund. Waere sie es
  // nicht, machte ein `rm` das Gate gruen -- eine Pruefung, die man
  // durch Loeschen ihres Gegenstands abstellen kann, misst nichts.
  const soll = uebersichtBauen(offen)
  if (texte.uebersicht === null) {
    fehler.push({
      pruefung: 'uebersicht-veraltet',
      text: 'docs/todo/00-UEBERSICHT.md fehlt -- erzeugen mit: '
        + 'node tools/nummern-pruefen.mjs --schreiben'
    })
  } else if (texte.uebersicht !== soll) {
    fehler.push({
      pruefung: 'uebersicht-veraltet',
      text: 'docs/todo/00-UEBERSICHT.md weicht vom Bestand ab -- '
        + 'neu erzeugen mit: node tools/nummern-pruefen.mjs --schreiben'
    })
  }

  return { fehler, offen, fertig, gezaehltOffen }
}

function lesen () {
  return {
    todo: readFileSync(PFAD.todo, 'utf8'),
    erledigt: readFileSync(PFAD.erledigt, 'utf8'),
    laufend: readFileSync(PFAD.laufend, 'utf8'),
    uebersicht: existsSync(PFAD.uebersicht) ? readFileSync(PFAD.uebersicht, 'utf8') : null,
    auftraege: nummernAusOrdner(PFAD.auftraege),
    berichte: nummernAusOrdner(PFAD.berichte),
    ssotDateien: existsSync(PFAD.ssot)
      ? readdirSync(PFAD.ssot).filter(n => n.endsWith('.md') && n !== '00-INDEX.md')
      : [],
    ssotIndex: existsSync(PFAD.ssotIndex) ? readFileSync(PFAD.ssotIndex, 'utf8') : ''
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
      pruefung: 'uebersicht-veraltet',
      was: '00-UEBERSICHT.md steht auf einem alten Bestand',
      bau: t => ({ ...t, uebersicht: `${t.uebersicht}\n| **ZZ-996** von Hand angefasst | offen | 1 |\n` })
    },
    {
      pruefung: 'kopfzaehler',
      was: 'Kopfzaehler um eins verstellt',
      bau: t => ({ ...t, todo: kopfAnpassen(t.todo, 1) })
    },
    {
      pruefung: 'auftrag-ohne-punkt',
      was: 'eine Auftragsdatei traegt eine Nummer, die es nicht gibt',
      bau: t => ({
        ...t,
        auftraege: [...t.auftraege, { datei: 'zz-995-erfunden.md', nr: 'ZZ-995' }]
      })
    },
    {
      pruefung: 'auftrag-ohne-bericht',
      was: `${inErledigt} ist erledigt, aber ohne Bericht`,
      bau: t => ({
        ...t,
        auftraege: [...t.auftraege, { datei: `${inErledigt.toLowerCase()}-niemand.md`, nr: inErledigt }],
        berichte: t.berichte.filter(b => b.nr !== inErledigt)
      })
    },
    {
      pruefung: 'bericht-ohne-auftrag',
      was: 'ein Bericht liegt da, ohne dass ein Auftrag nachlesbar ist',
      bau: t => ({
        ...t,
        berichte: [...t.berichte, { datei: 'zz-993-irgendwer.md', nr: 'ZZ-993' }]
      })
    },
    {
      pruefung: 'ssot-ohne-index',
      was: 'ein SSOT-Bericht fehlt in 00-INDEX.md',
      bau: t => ({ ...t, ssotDateien: [...t.ssotDateien, '999-nie-indiziert.md'] })
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
    let t = fall.bau(basis)
    // Wer TODO.md anfasst, verschiebt auch die Uebersicht. Die wird
    // deshalb mitgezogen -- sonst schluege uebersicht-veraltet bei jedem
    // zweiten Fall mit an und kein Fall bewiese mehr genau eine Sache.
    // Nur der Uebersichtsfall selbst behaelt seine verstellte Fassung.
    if (fall.pruefung !== 'uebersicht-veraltet' && t.uebersicht !== null) {
      t = { ...t, uebersicht: uebersichtBauen(punkte(t.todo)) }
    }
    const getroffen = pruefe(t).fehler.map(f => f.pruefung)
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

if (process.argv.includes('--schreiben')) {
  const inhalt = uebersichtBauen(punkte(basis.todo))
  writeFileSync(PFAD.uebersicht, inhalt, 'utf8')
  console.log(`[nummern] docs/todo/00-UEBERSICHT.md neu erzeugt `
    + `(${inhalt.split('\n').length} Zeilen).`)
  basis.uebersicht = inhalt
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
