// Punktdateien lesen — die gemeinsame Grundlage von Index und Waechter.
//
// ══ WARUM EINE EIGENE DATEI ═════════════════════════════════════════
//
// `[read]` **Index und Waechter lesen dasselbe.** Zwei Leser waeren
// zwei Auffassungen davon, was ein Punkt ist — und die erste
// Abweichung faende niemand, weil beide fuer sich gruen blieben.
//
// `[read]` **Dasselbe Muster wie `wirkstoff-luecke.ts` (G-208) und
// `wirkstoff-marke.ts` (G-210):** die Regel steht ohne I/O daneben,
// damit sie pruefbar ist.
//
// ══ WARUM KEIN YAML-PAKET ═══════════════════════════════════════════
//
// `[cmd]` **Das Repo fuehrt keinen YAML-Leser** (geprueft gegen die
// `package.json` der Wurzel und von `apps/web`). `[read]` **Eine neue
// Abhaengigkeit fuer einen Waechter waere teuer** — die
// Hausregel verlangt einen eigenen Task dafuer.
//
// `[read]` **Der Frontmatter des Modells ist klein und flach:**
// Skalare, Listen in `[a, b]`, Listen als `- Zeile`, und genau zwei
// Ebenen (`beruehrt.tabellen`, `zahlen.gemessen`). **Dafuer genuegt
// ein Leser von 80 Zeilen — aber er muss sagen, wenn er etwas nicht
// versteht, statt es zu verschlucken.**
import fs from 'node:fs'
import path from 'node:path'

/** Die Ordner des Modells, in der Reihenfolge des Wegs. */
export const ORDNER = [
  'todos',
  'laufend_codex',
  'laufend_claudecode',
  'laufend_fable',
  'laufend_kimi',
  'erledigt',
]

/** Der Zustand ergibt sich aus dem Ordner, nicht aus einem Feld. */
export function zustandVon(ordner) {
  if (ordner === 'todos') return 'offen'
  if (ordner === 'erledigt') return 'erledigt'
  if (ordner.startsWith('laufend_')) return `laeuft (${ordner.slice(8)})`
  return ordner
}

/**
 * Einen Skalar deuten.
 *
 * `[read]` **`null` und `~` sind leer, nicht die Zeichenkette
 * „null".** Sonst zeigte `kind_von: null` auf einen Punkt namens
 * `null`, und der Waechter meldete ihn als unbekannte Nummer.
 */
function wert(roh) {
  const t = roh.trim().replace(/\s+#.*$/, '').trim()
  if (t === '' || t === 'null' || t === '~') return null
  if (/^\[\s*\]$/.test(t)) return []
  // Liste in einer Zeile: [A-1, B-2]
  if (/^\[.*\]$/.test(t)) {
    return t.slice(1, -1).split(',')
      .map(x => x.trim().replace(/^['"]|['"]$/g, ''))
      .filter(Boolean)
  }
  const ohneAnfuehrung = t.replace(/^['"]|['"]$/g, '')
  if (/^-?\d+$/.test(ohneAnfuehrung)) return Number(ohneAnfuehrung)
  if (ohneAnfuehrung === 'true') return true
  if (ohneAnfuehrung === 'false') return false
  return ohneAnfuehrung
}

/**
 * Den Frontmatter einer Punktdatei lesen.
 *
 * Gibt `{ daten, fehler }` zurueck — **`fehler` ist eine Liste, keine
 * Ausnahme.** `[read]` Ein Waechter, der beim ersten kaputten Punkt
 * abbricht, zeigt den zweiten nie.
 */
export function frontmatter(text) {
  const fehler = []
  const zeilen = text.split(/\r?\n/)
  if (zeilen[0]?.trim() !== '---') {
    return { daten: null, fehler: ['kein Frontmatter (erste Zeile ist nicht `---`)'] }
  }
  let ende = -1
  for (let i = 1; i < zeilen.length; i += 1) {
    if (zeilen[i].trim() === '---') { ende = i; break }
  }
  if (ende < 0) {
    return { daten: null, fehler: ['Frontmatter nicht geschlossen (kein zweites `---`)'] }
  }

  const daten = {}
  let block = null      // aktueller Zweitebenen-Schluessel
  let liste = null      // aktueller `- `-Listenschluessel
  let listeIn = null    // in welchem Block die Liste haengt

  for (let i = 1; i < ende; i += 1) {
    const roh = zeilen[i]
    if (!roh.trim() || /^\s*#/.test(roh)) continue

    // `- eintrag` — gehoert zur zuletzt geoeffneten Liste
    const punkt = /^(\s*)-\s+(.*)$/.exec(roh)
    if (punkt) {
      if (!liste) {
        fehler.push(`Zeile ${i + 1}: Listeneintrag ohne Schluessel davor`)
        continue
      }
      const ziel = listeIn ? (daten[listeIn] ??= {}) : daten
      ;(ziel[liste] ??= []).push(String(wert(punkt[2]) ?? '').trim())
      continue
    }

    const paar = /^(\s*)([A-Za-z_][A-Za-z0-9_]*)\s*:\s*(.*)$/.exec(roh)
    if (!paar) {
      fehler.push(`Zeile ${i + 1}: nicht lesbar — ${roh.trim().slice(0, 60)}`)
      continue
    }
    const [, einzug, schluessel, rest] = paar
    const tief = einzug.length > 0

    if (!tief) block = null

    if (rest.trim() === '' || /^\s*#/.test(rest)) {
      // Schluessel ohne Wert: entweder ein Block oder eine Liste
      if (tief) {
        const ziel = (daten[block] ??= {})
        ziel[schluessel] = []
        liste = schluessel
        listeIn = block
      } else {
        daten[schluessel] = {}
        block = schluessel
        liste = schluessel
        listeIn = null
      }
      continue
    }

    liste = null
    listeIn = null
    if (tief) {
      if (!block) {
        fehler.push(`Zeile ${i + 1}: eingerueckter Schluessel ohne Block — ${schluessel}`)
        continue
      }
      ;(daten[block] ??= {})[schluessel] = wert(rest)
    } else {
      daten[schluessel] = wert(rest)
      block = schluessel
    }
  }

  // Ein Block, der nur Listen bekam, ist ein Objekt — ein Schluessel
  // ohne jeden Inhalt bleibt ein leeres Objekt und faellt dem
  // Waechter auf, nicht hier.
  return { daten, fehler }
}

/**
 * Alle Punkte unter `docs/punkte/` einlesen.
 *
 * `[read]` **Dateien, die mit `00-` beginnen, sind keine Punkte** —
 * `00-LIESMICH.md` und `00-INDEX.md` liegen bewusst daneben.
 */
export function punkteLesen(wurzel) {
  const aus = []
  for (const ordner of ORDNER) {
    const d = path.join(wurzel, ordner)
    if (!fs.existsSync(d)) continue
    for (const name of fs.readdirSync(d).sort()) {
      if (!name.endsWith('.md') || name.startsWith('00-')) continue
      const pfad = path.join(d, name)
      const text = fs.readFileSync(pfad, 'utf8')
      const { daten, fehler } = frontmatter(text)
      aus.push({
        ordner,
        name,
        pfad: path.relative(wurzel, pfad).replace(/\\/g, '/'),
        relativ: `docs/punkte/${ordner}/${name}`,
        zustand: zustandVon(ordner),
        daten,
        lesefehler: fehler,
        text,
      })
    }
  }
  return aus
}

/**
 * Der Dateiname, den ein Punkt nach dem Modell tragen muesste.
 *
 * `[cmd]` **Vorgabe:** `<modul>-<reihe>-<nummer vierstellig>-<kurztitel>.md`
 * `[read]` **Vierstellig, damit alphabetisch gleich numerisch ist** —
 * `C-0296` sortiert nach `C-0030`, `C-296` nicht.
 */
export function nummernTeil(nr) {
  const m = /^([A-Z]+)-(\d+)$/.exec(String(nr ?? '').trim())
  if (!m) return null
  return `${m[1]}-${m[2].padStart(4, '0')}`
}
