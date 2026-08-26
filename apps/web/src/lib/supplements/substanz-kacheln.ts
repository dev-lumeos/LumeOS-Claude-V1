// Die Zahlenkacheln des Substanzdetails (G-181).
//
// ══ WARUM DIE WIRKUNGSZAHL NICHT AUS DEM TEXT GEZOGEN WIRD ══════════
//
// Der Auftrag skizziert vier Kacheln, darunter *„WIRKUNG 5-15 %"*, und
// sagt dazu: **„Wo sie sich aus `was_bringt_es_de` nicht sauber ziehen
// laesst: Kachel weglassen, nicht raten."**
//
// `[cmd]` **Gemessen am 2026-08-25 ueber alle 290 Nutzertexte:** nur
// **18** tragen ueberhaupt eine Prozentzahl, **12** einen Bereich.
// Die uebrigen 278 beschreiben die Studienlage, nicht Effektgroessen.
//
// `[cmd]` **Und die 12 Treffer sind zum Teil das Gegenteil einer
// Wirkung:**
//
//     Beta-Carotin   18-28 %   Risikoerhoehung bei Rauchern
//     BPC-157        60-70 %   Heilungsrate bei RATTEN - der Satz
//                              beginnt mit „beim Menschen weiss es
//                              niemand"
//     TB-500         60-70 %   ebenso, keine Humanstudien
//     Ca-AKG         10-15 %   Lebensdauer bei Maeusen
//
// `[read]` **Eine Regex haette „60-70 %" als Wirkung von BPC-157
// gezeigt** — neben einem Text, der ausdruecklich sagt, dass es beim
// Menschen niemand weiss. **Das ist die erfundene Zahl, die der
// Auftrag verbietet, nur mit einem Automaten davor.**
//
// `[read]` **Deshalb eine gepflegte Liste statt Textausschlachtung.**
// Sie ist kurz, sie ist nachlesbar, und wer sie erweitert, hat die
// Zahl gelesen. **Was nicht drinsteht, bekommt keine Kachel.**

import type { BlockTon } from './block-ton'

/** Eine Zahlenkachel: Beschriftung, grosse Zahl, eine Zeile Erklaerung. */
export type Kachel = {
  id: 'beleglage' | 'menge' | 'wirkung' | 'wada'
  label: string
  wert: string
  hinweis: string | null
  /**
   * G-198: die Bedeutung, nicht die Farbe.
   *
   * `[cmd]` **Hier stand `'pos' | 'warn' | 'acc'`** — ein DRITTES
   * Vokabular neben den vier Bedeutungen aus G-196 und neben den
   * Textkacheln, die G-196 schon umgestellt hatte. **Gefunden erst,
   * als G-198 danach suchte.**
   *
   * `[read]` **Drei Systeme laufen dreifach auseinander.** Jetzt
   * kommt auch dieses aus `block-ton.ts`.
   */
  ton?: BlockTon
}

/**
 * Die belegten Leistungswirkungen — je Substanz-Slug.
 *
 * `[cmd]` **Jede Zahl steht so im `was_bringt_es_de` derselben
 * Substanz** (gemessen 2026-08-25); hier ist nur ausgewaehlt, welche
 * davon eine Wirkung IST und nicht ein Risiko oder ein Tierbefund.
 *
 * `[read]` **Bewusst kurz.** Fuenf Eintraege sind ehrlicher als 290
 * Kacheln, von denen 278 raten.
 */
export const WIRKUNG: Record<string, { wert: string; hinweis: string }> = {
  // „Auswertungen zeigen etwa 5-15 % mehr Leistung bei kurzen
  // Maximalbelastungen"
  sub_9f9bb8c160: { wert: '5–15 %', hinweis: 'mehr Maximalleistung' },
  // „Die belegte Kreatin-Wirkung - grob 5-15 % mehr Leistung bei
  // kurzen Maximaleinsaetzen"
  sub_6251e6e553: { wert: '5–15 %', hinweis: 'mehr Maximalleistung' },
  // „Studien zeigen bei Ausdauerleistung … 2-4 %"
  sub_2c308411e9: { wert: '2–4 %', hinweis: 'mehr Ausdauerleistung' },
  // „Uebersichtsstudien zeigen rund 2-3 % mehr Leistung bei
  // Belastungen zwischen einer und vier Minuten"
  sub_baec078bee: { wert: '2–3 %', hinweis: 'bei 1–4 Minuten Belastung' },
  // „fuer Belastungen von etwa 1-10 Minuten einen Leistungsgewinn …
  // 2-3 %"
  sub_4260ee932f: { wert: '2–3 %', hinweis: 'bei 1–10 Minuten Belastung' },
}

/**
 * Die Bedeutung des Evidenzgrades — G-198.
 *
 * `[read]` **Die Zuordnung aendert sich nicht, nur ihre Sprache.**
 * A und B sind eine **Entwarnung** („das ist belegt"), D bis F eine
 * **Gefahr** („darauf ist kein Verlass"). **C bekommt keine** —
 * „gemischt belegt" ist keine der vier Aussagen, und eine Farbe
 * ohne Bedeutung ist Dekoration.
 *
 * `[cmd]` Vorher trug C `acc`, also die WIRKUNGSfarbe — dabei sagt
 * der Grad nichts ueber die Wirkung, sondern ueber die Beleglage.
 */
const GRAD_TON: Record<string, BlockTon> = {
  A: 'entwarnung', B: 'entwarnung', D: 'gefahr', E: 'gefahr', F: 'gefahr',
}

const GRAD_TEXT: Record<string, string> = {
  A: 'sehr gut belegt',
  B: 'gut belegt',
  C: 'gemischte Belege',
  D: 'schwach belegt',
  E: 'kaum belegt',
  F: 'nicht belegt',
}

const WADA_TEXT: Record<string, string> = {
  not_prohibited: 'erlaubt',
  prohibited: 'verboten',
  monitored: 'beobachtet',
}

/**
 * Der Hinweis unter dem WADA-Wert (G-182, Punkt 7).
 *
 * ══ WAS DIE KACHEL NICHT SAGT, UND WARUM ═══════════════════════════
 *
 * **Tom, 2026-08-25:** fragt, ob der Status fuers Bodybuilding gilt.
 *
 * `[read]` **Er gilt nur, wo nach WADA-Code getestet wird.** IFBB Pro
 * und NPC sind keine WADA-Unterzeichner — dort sagt die Kachel nichts
 * ueber Zulaessigkeit.
 *
 * `[read]` **Deshalb sagt der Hinweis, WOFUER der Status gilt** —
 * *„im getesteten Wettkampf"* statt *„erlaubt"* im luftleeren Raum.
 *
 * `[cmd]` **Was NICHT dasteht: welche Verbaende testen.** Der Bestand
 * traegt dazu nichts: `supplement_wada.note_de` ist bei **0 von 290**
 * gefuellt (`note_en` ebenso). **Eine Liste von Verbaenden waere eine
 * Aussage ohne Beleg** — sie steht als eigener Punkt im Bericht.
 */
const WADA_HINWEIS: Record<string, string> = {
  not_prohibited: 'im getesteten Wettkampf erlaubt',
  prohibited: 'im getesteten Wettkampf gesperrt',
  monitored: 'im Beobachtungsprogramm',
}

function da(v: string | null | undefined): v is string {
  return typeof v === 'string' && v.trim().length > 0
}

/**
 * Die Mengenangabe auf Kachelgroesse bringen.
 *
 * `[cmd]` **Gemessen 2026-08-25:** Kreatin traegt
 * *„3-5 g/day maintenance"* — in einer 196-px-Kachel bricht das auf
 * zwei Zeilen und schiebt den Hinweis nach unten.
 *
 * `[read]` **Der englische Zusatz wird weggelassen, nicht
 * uebersetzt.** *„maintenance"*, *„studied"*, *„per serving"* sagen
 * ueber die Zahl nichts, was die Kachel nicht schon durch ihre
 * Beschriftung sagt. **Die Zahl selbst bleibt unveraendert** — und die
 * volle Angabe steht im Satz unter „Wann und wie".
 */
function kuerzeMenge(wert: string): string {
  return wert
    // `[read]` **`/day` bleibt** — es ist Teil der Angabe. Weg faellt
    // nur, was die Kachelbeschriftung ohnehin sagt.
    .replace(/\s*\b(maintenance|studied|per serving|typical)\b\s*/gi, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

/**
 * Die Kacheln einer Substanz — nur die mit Wert.
 *
 * `[read]` **Eine Kachel ohne Wert entfaellt.** Drei Kacheln sind
 * besser als vier mit einem Strich; ein Strich sieht aus wie eine
 * Angabe.
 *
 * `[cmd]` Gemessen ueber die 318 im Katalog: Beleglage **290** ·
 * Menge **83** · WADA **290** · Wirkung **5**.
 */
export function kachelnFuer(
  slug: string | null | undefined,
  grad: string | null | undefined,
  menge: string | null | undefined,
  wadaStatus: string | null | undefined,
  /**
   * G-182: die WADA-Klasse, wo sie vorliegt.
   *
   * `[cmd]` **129 von 290 gefuellt** — `S1.1`, `S2/S0`, `S4.1` … Sie
   * benennt, WELCHE Klasse gilt, und ist damit belegbar; die Frage
   * „welcher Verband testet" ist es nicht.
   */
  wadaKategorie?: string | null,
): Kachel[] {
  const aus: Kachel[] = []

  if (da(grad)) {
    aus.push({
      id: 'beleglage', label: 'Beleglage', wert: grad,
      hinweis: GRAD_TEXT[grad] ?? null, ton: GRAD_TON[grad],
    })
  }

  if (da(menge)) {
    // `[read]` Die Kachel traegt die KURZE Form. Steht dahinter ein
    // ganzer Satz, gehoert er in „Wann und wie" — nicht in eine
    // Kachel, die auf eine Zahl hin gelesen wird.
    const teile = menge.trim().split(/\s*[;(]\s*/)
    const wert = kuerzeMenge(teile[0].trim())
    aus.push({
      id: 'menge', label: 'Übliche Menge', wert,
      hinweis: teile.length > 1 ? teile.slice(1).join(' ').replace(/\)$/, '') : null,
    })
  }
  // ── G-191: der Grund bekommt KEINE Zahlenkachel ────────────────
  //
  // `[cmd]` **Hier stand der Statuscode**, weil die alte Lesefunktion
  // das Objekt verkettete: *„No validated clinical guideline dose ·
  // CLINICAL_GUIDELINE"* bei **250 von 412**.
  //
  // `[read]` **Der erste Entwurf setzte hier einen Strich mit dem
  // Grund als Hinweis — das war falsch.** Zeile 30 dieser Datei sagt
  // es seit G-181: *„Was nicht drinsteht, bekommt keine Kachel"*, und
  // ein Strich in einer Kachel, die auf eine Zahl hin gelesen wird,
  // sieht aus wie eine Angabe.
  //
  // **Der Grund steht im Zahlenkasten darunter** (`Zahlenkasten` in
  // `substanz-tafel.tsx`) — dort, wo Text ohnehin zu Hause ist.

  const w = slug ? WIRKUNG[slug] : undefined
  if (w) {
    aus.push({ id: 'wirkung', label: 'Wirkung', wert: w.wert, hinweis: w.hinweis })
  }

  if (da(wadaStatus)) {
    const grund = WADA_HINWEIS[wadaStatus] ?? null
    // `[read]` Die Klasse ergaenzt den Hinweis, ersetzt ihn nicht:
    // „im getesteten Wettkampf gesperrt · S1.1". `unknown` faellt weg
    // — es ist keine Klasse, sondern das Fehlen einer.
    const klasse = da(wadaKategorie) && wadaKategorie.trim() !== 'unknown'
      ? wadaKategorie.trim() : null
    aus.push({
      id: 'wada', label: 'WADA',
      wert: WADA_TEXT[wadaStatus] ?? wadaStatus,
      hinweis: [grund, klasse].filter(Boolean).join(' · ') || null,
      // G-198: dieselbe Bedeutung wie im Rechtslage-Block (G-194).
      ton: wadaStatus === 'prohibited' ? 'gefahr'
        : wadaStatus === 'not_prohibited' ? 'entwarnung'
          : wadaStatus === 'monitored' ? 'pruefen' : undefined,
    })
  }

  return aus
}
