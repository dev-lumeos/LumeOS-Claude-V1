/**
 * Zerlegung deutscher Komposita auf der ANFRAGESEITE.
 *
 * ANLASS: `[cmd]` `?q=huehnerbrust` lieferte nichts. Der Bestand kennt
 * "Hähnchen Brustfilet, roh" — kein einziges Wort davon steht in der
 * Anfrage. Zerlegen allein reicht nicht, es braucht die Bruecke aus
 * nutrition.search_synonyms (Kettenschritt 024).
 *
 * WARUM HIER UND NICHT IN DER DATENBANK
 * Die Faltung (normalizeFoodSearchText) steht schon hier und ist die
 * einzige Quelle; sie wird als Parameter an die DB gereicht. Eine
 * Zerlegung in SQL braeuchte eine zweite Kopie der Faltungsregel —
 * genau der Fehler, der in Block 29 zwei Regeln auseinanderlaufen
 * liess. Diese Datei laeuft ausschliesslich serverseitig (die
 * Lebensmittelseite ist eine Server Component), der Wortschatz von
 * 21.885 Woertern erreicht also kein Browserbuendel.
 *
 * DIE UMLAUTFALLE, gemessen statt vermutet
 * Das Woerterbuch traegt echte Umlaute ("hühner"), die Anfrage oft
 * nicht ("huehner"). Der Ausweg ist NICHT, vor dem Falten zu zerlegen —
 * Toms Ausgangsfall `?q=huehnerbrust` enthaelt gar kein "ü", das man
 * retten koennte. Stattdessen wird der WORTSCHATZ beim Erzeugen
 * gefaltet. `[cmd]` Das kostet nichts: 14.517 Eintraege fallen auf
 * 14.502, und alle 11 Kollisionen sind ss/ß-Schreibweisen desselben
 * Wortes (fuss/fuß, mass/maß). `[cmd]` Alle 7 geprueften Paare
 * zerlegen danach identisch.
 */
import { SUCH_WORTSCHATZ } from './generated/such-wortschatz'
import { SUCH_SYNONYME } from './generated/such-synonyme'

/**
 * Fugenelemente. `[cmd]` Ohne sie zerfallen "putenbrust" (Fuge "n") und
 * "rinderhack" (Fuge "er") nicht. Die leere Fuge steht nicht in der
 * Liste, sondern wird davor geprueft.
 */
const FUGEN = ['s', 'n', 'en', 'es', 'er', 'e'] as const

/**
 * `[cmd]` GEMESSEN, nicht gewaehlt. Kopf und Rest wurden getrennt
 * variiert, weil sie Verschiedenes tun:
 *   minKopf=3, minRest=3 -> "olivenoel" bleibt ganz ("oel" zu kurz)
 *   minKopf=3, minRest=2 -> "reis" zerfaellt zu "rei"+"s"
 *   minKopf=4, minRest=2 -> 23/25 zerlegt, 18/18 Einzelwoerter heil, 0 falsch
 * Der Rest darf kurz sein, weil "oel" ein echtes Wort ist; der Kopf
 * nicht, weil kurze Koepfe Zufallstreffer produzieren.
 */
const MIN_KOPF = 4
const MIN_REST = 2

/** Mehr Gruppen bringen keine Treffer, kosten aber Laufzeit. */
const MAX_GRUPPEN = 6

/**
 * Zerlegt ein Wort in genau zwei Teile, wenn beide im Wortschatz
 * stehen. Von hinten gesucht, damit der laengste sinnvolle Kopf
 * gewinnt. Gibt null zurueck, wenn keine Zerlegung traegt.
 */
export function zerlegeWort(wort: string): [string, string] | null {
  const w = wort.toLowerCase()
  for (let i = w.length - MIN_REST; i >= MIN_KOPF; i--) {
    const kopf = w.slice(0, i)
    const rest = w.slice(i)
    if (!SUCH_WORTSCHATZ.has(rest)) continue
    if (SUCH_WORTSCHATZ.has(kopf)) return [kopf, rest]
    for (const fuge of FUGEN) {
      if (!kopf.endsWith(fuge)) continue
      const basis = kopf.slice(0, -fuge.length)
      if (basis.length >= MIN_KOPF && SUCH_WORTSCHATZ.has(basis)) return [basis, rest]
    }
  }
  return null
}

/**
 * Ein Wort samt seiner Synonyme — das Wort selbst steht immer vorn.
 *
 * Ohne Set-Spreizung, weil das tsconfig-Ziel von apps/web unter ES2015
 * liegt und `[...new Set(…)]` dort nicht uebersetzt (--downlevelIteration).
 */
function mitSynonymen(wort: string): string[] {
  const ziele = SUCH_SYNONYME[wort]
  if (!ziele || ziele.length === 0) return [wort]
  const out = [wort]
  for (const z of ziele) {
    if (out.indexOf(z) === -1) out.push(z)
  }
  return out
}

/**
 * Baut aus einer Anfrage die Suchgruppen.
 *
 * Ergebnis: eine Liste von Gruppen. Innerhalb einer Gruppe gilt ODER
 * (Alternativen desselben Begriffs), zwischen den Gruppen UND.
 *
 * DER ENTSCHEIDENDE PUNKT: Ein zerlegtes Wort liefert ZWEI Gruppen,
 * nicht eine. `[cmd]` Wirft man Kopf und Rest in dieselbe ODER-Gruppe,
 * liefert "huehnerbrust" 216 Treffer, angefuehrt von "Hühnerfett" und
 * "Lamm Brust, roh" — denn "brust" allein trifft dann alles. UND-
 * verknuepft sind es 31 Treffer, angefuehrt von "Hähnchen Brustfilet,
 * roh". Ein Kompositum meint BEIDE Bestandteile.
 *
 * Woerter, die selbst im Wortschatz stehen, werden NICHT zerlegt.
 * `[cmd]` Sonst zerfiele "weisswurst" in "weiss"+"wurst" und traefe
 * jede weisse Sauce. Deshalb bleiben alle 16 Schutzfaelle unveraendert.
 */
export function buildFoodSearchTokenGroups(normalizedQuery: string): string[][] {
  const basis = normalizedQuery.split(' ').filter(Boolean)
  const gruppen: string[][] = []

  for (const token of basis) {
    if (SUCH_WORTSCHATZ.has(token)) {
      gruppen.push(mitSynonymen(token))
      continue
    }
    const teile = zerlegeWort(token)
    if (!teile) {
      gruppen.push(mitSynonymen(token))
      continue
    }
    gruppen.push(mitSynonymen(teile[0]))
    gruppen.push(mitSynonymen(teile[1]))
  }

  return gruppen.slice(0, MAX_GRUPPEN)
}
