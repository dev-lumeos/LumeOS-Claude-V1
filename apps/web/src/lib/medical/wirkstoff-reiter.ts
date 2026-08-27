// Die Reiter der Wirkstoff-Tafel — G-208.
//
// ══ WARUM DIE REITER HIER ANDERS ENTSTEHEN ALS BEI SUPPLEMENTS ══════
//
// `[read]` **Das Vorbild `substanz-reiter.ts` (G-180) laesst einen
// Reiter WEG, wenn er leer waere.** Dort ist das richtig und wichtig:
// `[cmd]` von 412 sichtbaren Substanzen haben **15** Unterformen und
// **345** eine Rechtslage — ein fester Reitersatz stuende bei zwei
// Dritteln leer.
//
// `[cmd]` **Hier misst es sich genau umgekehrt, gemessen 2026-08-27
// ueber alle 498 Wirkstoffe:**
//
//     Ueberblick       498 / 498
//     Einnahme         498 / 498
//     Sicherheit       498 / 498
//     Wechselwirkung   498 / 498
//     Rechtslage       498 / 498
//     Fragen           498 / 498   (2.313 Antworten, 3-6 je Wirkstoff)
//     Schwangerschaft  449 / 498
//     Mythen           383 / 498
//
// `[read]` **Die Wegfall-Regel wuerde bei sechs von acht Reitern nie
// greifen.** Sie steht trotzdem hier — fuer die zwei, bei denen sie
// greift, und damit die Regel dieselbe bleibt, falls die Pipeline
// spaeter einen Reiter duenner besetzt.
//
// ══ UND DESHALB LIEGT DER SCHWERPUNKT WOANDERS ══════════════════════
//
// `[read]` **Bei Supplements variiert, WELCHE Reiter es gibt. Hier
// variiert, was IN einem Reiter fehlt** — und ob das Fehlen begruendet
// ist. Das ist der Grund, warum diese Runde `wirkstoff-luecke.ts`
// baut und nicht noch eine Reiterregel.
import type { Feld } from './wirkstoff-luecke'

export type WirkstoffReiterId =
  | 'ueberblick' | 'einnahme' | 'sicherheit' | 'wechselwirkung'
  | 'recht' | 'schwangerschaft' | 'mythen' | 'fragen'

export type WirkstoffReiter = {
  id: WirkstoffReiterId
  titel: string
  /** Die Zahl hinter dem Titel — nur wo eine etwas bedeutet. */
  zahl: number | null
}

function da(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0
}

/** Hat mindestens ein Feld einen Wert ODER eine Begruendung? */
function etwasZuSagen(felder: Feld[]): boolean {
  return felder.some(f => f.zustand !== 'nicht_bearbeitet')
}

/**
 * Die Reiter eines Wirkstoffs.
 *
 * `[read]` **Ein Reiter erscheint auch dann, wenn seine Felder nur
 * BEGRUENDET leer sind** — das ist der Unterschied zum Vorbild. Bei
 * einem Mischpraeparat traegt die Ueberblickskachel „keine einzelne
 * CAS-Nummer", und genau das ist die Auskunft, die jemand sucht.
 * **Ein weggelassener Reiter haette sie verschwiegen.**
 */
export function wirkstoffReiter(w: {
  ueberblickFelder: Feld[]
  einnahmeFelder: Feld[]
  sicherheitFelder: Feld[]
  wechselwirkung: string | null
  recht: string | null
  mythen: string[]
  schwangerschaft: boolean
  fragen: number
}): WirkstoffReiter[] {
  const aus: WirkstoffReiter[] = []
  if (etwasZuSagen(w.ueberblickFelder)) {
    aus.push({ id: 'ueberblick', titel: 'Überblick', zahl: null })
  }
  if (etwasZuSagen(w.einnahmeFelder)) {
    aus.push({ id: 'einnahme', titel: 'Einnahme und Absetzen', zahl: null })
  }
  if (etwasZuSagen(w.sicherheitFelder)) {
    aus.push({ id: 'sicherheit', titel: 'Sicherheit', zahl: null })
  }
  if (da(w.wechselwirkung)) {
    aus.push({ id: 'wechselwirkung', titel: 'Wechselwirkung im Alltag', zahl: null })
  }
  // `[read]` **„Rechtslage", nicht „Verschreibungspflicht".** Das Feld
  // heisst `verschreibungspflicht_klartext_de`, sagt aber mehr als ob
  // ein Rezept noetig ist — bei Metformin nennt es die eGFR als
  // entscheidende Kennziffer. Der Reitertitel folgt dem Inhalt.
  if (da(w.recht)) {
    aus.push({ id: 'recht', titel: 'Rechtslage', zahl: null })
  }
  // `[cmd]` **449 von 498** — der einzige Reiter neben „Mythen", bei
  // dem die Wegfall-Regel ueberhaupt greift.
  if (w.schwangerschaft) {
    aus.push({ id: 'schwangerschaft', titel: 'Schwangerschaft und Stillzeit', zahl: null })
  }
  // `[cmd]` **383 von 498.** Bei den uebrigen 115 traegt `null_context`
  // den Grund — der steht dann als Zeile im Ueberblick, nicht als
  // leerer Reiter.
  if (w.mythen.length > 0) {
    aus.push({ id: 'mythen', titel: 'Mythen', zahl: w.mythen.length })
  }
  // `[cmd]` **Bei allen 498 gefuellt, 3 bis 6 Fragen, Median 5.**
  if (w.fragen > 0) {
    aus.push({ id: 'fragen', titel: 'Fragen', zahl: w.fragen })
  }
  return aus
}

/** Der Reiter, der beim Aufklappen offen ist — der erste vorhandene. */
export function ersterWirkstoffReiter(
  reiter: WirkstoffReiter[],
): WirkstoffReiterId | null {
  return reiter.length > 0 ? reiter[0].id : null
}
