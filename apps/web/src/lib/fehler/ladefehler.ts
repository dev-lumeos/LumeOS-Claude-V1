// Sitzungsfehler von Datenfehler trennen — G-553/A1, G-555.
//
// ══ G-555: WARUM DIE DATEI HIER LIEGT UND NICHT UNTER goals/ ══════
//
// `[cmd]` **Sie lag in `lib/goals/`, wird aber von drei Modulen
// gebraucht** — Goals, Medical, Nutrition. `[read]` **Ein
// medical-Fehler hatte dort keinen Platz:** `fehlertexte` gab den
// Titel `'Goals'` zurueck, fest verdrahtet.
//
// `[cmd]` **Und es wird mehr:** G-535 hat die Fachmeldung
// `medical import: user mismatch` (`P0001`) erzeugt
// (`535_auth_uid_legacy_readers.sql:175`,
// `142_laborimport_matching.sql:231`). `[cmd]` **Gezaehlt in
// `apps/web/src/lib` am 2026-10-01: null Treffer auf `P0001`, null
// auf `user mismatch`** — die Meldung hat heute keinen Ort, an dem
// sie zu einem Text wird. **G-571 baut den Aufrufer.**
//
// `[read]` **`lib/fehler/` statt `packages/ui`:** das hier ist
// Fachlogik ueber Fehlertexte, keine Darstellung. **`packages/ui`
// gehoert allen Apps** — eine Supabase-Fehlerkunde gehoert nicht
// hinein (A-30-Nachbarschaft: was dort liegt, zieht jede App mit).
//
// ══ DER BEFUND ═════════════════════════════════════════════════════
//
// **Tom, 2026-09-29, 16:56, auf dem Phase-Reiter:**
//
//     Goals konnten nicht geladen werden
//     body_composition_navy: JWT issued at future
//
// `[cmd]` **`goals.body_composition_navy` ist NICHT kaputt** —
// Kettenschritt 112 (`112_body_measurements.sql:216`), live, und
// `lesen.ts:86` ruft sie richtig auf. **`JWT issued at future` kommt
// aus der Tokenpruefung**, bevor die Funktion ueberhaupt laeuft.
//
// `[read]` **Die Meldung schickt auf die falsche Suche:** wer *„Goals
// konnten nicht geladen werden"* liest, prueft seine Ziele — und das
// Problem ist die Anmeldung.
//
// ── Warum der Fehlercode dafuer nicht reicht ───────────────────────
//
// `[cmd]` **Der beobachtete Fehler kam als `READ_FAILED`**, nicht als
// `NO_SESSION`: PostgREST meldet den Tokenfehler als Antwort auf die
// Abfrage, und `lesen.ts` verpackt jede Antwort mit `error` als
// `READ_FAILED`. `[read]` **Die Unterscheidung muss deshalb den TEXT
// lesen** — der Code weiss es nicht.
//
// `[read]` **Nicht Gegenstand dieses Punktes:** WARUM die Uhr
// sprang. Das ist Umgebung, nicht Bau.

export type Fehlerart = 'sitzung' | 'daten'

/**
 * Die Merkmale, an denen ein Tokenfehler erkennbar ist.
 *
 * `[cmd]` **`JWT issued at future` ist der beobachtete Fall.** Die
 * uebrigen stehen daneben, weil sie aus derselben Pruefung kommen und
 * dieselbe Handlung verlangen — neu anmelden:
 *
 *     JWT expired            Token abgelaufen
 *     JWT issued at future   `iat` hinter der Serveruhr (der Fall)
 *     invalid JWT / claim    verfaelscht oder falsch signiert
 *     token is expired       dieselbe Lage, andere Schreibweise
 *     PGRST301               PostgREST: JWT expired
 *
 * `[read]` **Kleingeschrieben verglichen** — die Schreibweise
 * schwankt zwischen GoTrue, PostgREST und Kong.
 */
const SITZUNGSMERKMALE = [
  'jwt',
  'token is expired',
  'pgrst301',
  'invalid claim',
  'bad_jwt',
  'session not found',
  'refresh_token',
] as const

/**
 * Ist das ein Sitzungsfehler oder ein Datenfehler?
 *
 * `[read]` **Im Zweifel Datenfehler.** Ein faelschlich als
 * Sitzungsfehler gemeldeter Datenfehler schickt den Nutzer zur
 * Anmeldung, die nichts aendert — und dort steht dann kein
 * technischer Text mehr, der weiterhilft.
 *
 * @param text  Die Fehlermeldung, wie sie `page.tsx` gefangen hat.
 * @param code  Der Code aus `GoalsLeseFehler`, wenn er bekannt ist.
 */
export function fehlerart(
  text: string | null, code?: string | null,
): Fehlerart {
  // `[cmd]` **`NO_SESSION` ist eindeutig** — die Session fehlte schon
  // vor der ersten Abfrage (`lesen.ts:43`).
  if (code === 'NO_SESSION') return 'sitzung'
  // ══ G-578: zwei SQLSTATEs sagen es ohne Textsuche ══════════════
  //
  // `[cmd]` **`28000` wirft `medical.start_lab_report_ocr` und
  // `store_lab_report_ocr_result`**, wenn `auth.uid()` leer ist;
  // **`42501` wirft `goals.body_circumference_write`** im selben
  // Fall. `[read]` **Beides ist eine fehlende Sitzung** — und der
  // Text *„medical OCR: authentication required"* traegt keines der
  // Merkmale unten. **Ohne diese Zeile stuende er als Datenfehler
  // da, ohne Weg zur Anmeldung.**
  if (code === '28000' || code === '42501') return 'sitzung'
  if (!text) return 'daten'
  const t = text.toLowerCase()
  return SITZUNGSMERKMALE.some(m => t.includes(m)) ? 'sitzung' : 'daten'
}

// ══ G-578/A3: FACHMELDUNGEN MIT EIGENEM TEXT ══════════════════════
//
// `[cmd]` **G-535 hat Meldungen erzeugt, die die Oberflaeche nicht
// kannte.** `[cmd]` **Gezaehlt in `apps/web/src/lib` am 2026-10-01,
// vor diesem Punkt: null Treffer auf `P0001`, null auf
// `user mismatch`** — sie haetten als roher Postgres-Satz
// dagestanden.
//
// `[read]` **Hier statt in einem medical-eigenen Zweig**, weil diese
// Datei seit G-555 querliegt: **ein zweiter Ort fuer dieselbe Frage
// driftet** (G-529).

/**
 * Fachmeldungen, die einen eigenen Satz bekommen.
 *
 * `[cmd]` **Die Texte stammen aus den Funktionsruempfen**, gelesen am
 * 2026-10-01 aus `pg_get_functiondef`:
 *
 *     medical import: user mismatch        535_…:171  (P0001)
 *     medical import: rows must be an array           (P0001)
 *     medical import: marker_name missing             (P0001)
 *     medical import: unit missing                    (P0001)
 *     medical OCR: authentication required            (28000)
 *     medical OCR: own report with original not found (P0002)
 *     medical OCR: own processing report not found    (P0002)
 *
 * `[read]` **Der Satz sagt, was der Nutzer TUN kann** — „user
 * mismatch" sagt das nicht, und eine Neuanmeldung hilft dort auch
 * nicht.
 */
const FACHMELDUNGEN: Array<{ merkmal: string; satz: string }> = [
  {
    merkmal: 'user mismatch',
    // `[read]` **Kein Sitzungsfehler** — die Sitzung ist gueltig, sie
    // gehoert nur zu einer anderen Person als der Bericht. **Zur
    // Anmeldung zu schicken waere die falsche Suche** (G-553).
    satz: 'Dieser Befund gehoert zu einem anderen Konto. Melde dich '
      + 'mit dem Konto an, zu dem er gehoert — uebernehmen laesst er '
      + 'sich nur dort.',
  },
  {
    merkmal: 'rows must be an array',
    satz: 'Die Zeilenliste kam in der falschen Form an. Waehle die '
      + 'Werte neu aus und versuche es noch einmal.',
  },
  {
    merkmal: 'marker_name missing',
    satz: 'Eine Zeile hat keinen Markernamen. Ohne Namen laesst sie '
      + 'sich keinem Katalogeintrag zuordnen.',
  },
  {
    merkmal: 'unit missing',
    satz: 'Eine Zeile hat keine Einheit. Ein Wert ohne Einheit ist '
      + 'keine Messung.',
  },
  {
    merkmal: 'own report with original not found',
    satz: 'Zu diesem Befund liegt kein hochgeladenes Original vor — '
      + 'oder er gehoert einem anderen Konto. Lade das Original hoch, '
      + 'bevor du die Erkennung startest.',
  },
  {
    merkmal: 'own processing report not found',
    satz: 'Fuer diesen Befund laeuft keine Erkennung. Starte sie, '
      + 'bevor du ein Ergebnis speicherst.',
  },
  {
    merkmal: 'medical ocr: authentication required',
    satz: 'Die Sitzung ist nicht mehr gueltig. Melde dich neu an — '
      + 'deine Daten sind unveraendert.',
  },
  // ══ G-579: der Plansprung ═══════════════════════════════════════
  //
  // `[cmd]` **Aus `nutrition.meal_plan_set_next_plan` gelesen**
  // (`pg_get_functiondef`, 2026-10-02). `[cmd]` **Der vierte Fall,
  // `Anmeldung erforderlich` mit `42501`, ist seit G-578 ueber den
  // SQLSTATE abgedeckt** — er braucht hier keinen eigenen Eintrag.
  {
    merkmal: 'quelle und unterschiedlicher folgeplan',
    satz: 'Waehle einen Folgeplan, der nicht der Plan selbst ist — '
      + 'ein Plan kann nicht auf sich selbst folgen.',
  },
  {
    merkmal: 'eigener quellplan nicht gefunden',
    satz: 'Diesen Plan gibt es nicht mehr, oder er gehoert zu einem '
      + 'anderen Konto. Lade die Liste neu.',
  },
  {
    merkmal: 'eigener folgeplan nicht gefunden',
    satz: 'Den gewaehlten Folgeplan gibt es nicht mehr, oder er '
      + 'gehoert zu einem anderen Konto. Waehle einen anderen.',
  },
]

/**
 * Der Satz zu einer Fachmeldung, oder `null`.
 *
 * `[read]` **`null` heisst: dafuer gibt es keinen eigenen Text** —
 * dann steht der technische Satz da, und das ist besser als ein
 * erfundener. **Ein Fehler ohne Text waere schlechter als der
 * falsche** (G-553).
 *
 * @param text  Die Meldung, wie die Datenbank sie geworfen hat.
 */
export function fachmeldung(text: string | null | undefined): string | null {
  if (!text) return null
  const t = text.toLowerCase()
  return FACHMELDUNGEN.find(m => t.includes(m.merkmal))?.satz ?? null
}

/** Was die Kachel ueber dem technischen Text sagt. */
export type Fehlertexte = { titel: string; satz: string }

/**
 * Der Satz zur Fehlerart.
 *
 * `[read]` **Er sagt, was zu tun ist — nicht, was schiefging.** Der
 * technische Text steht darunter und bleibt sichtbar: **er hat diesen
 * Befund moeglich gemacht.** `[read]` **Ein Fehler ohne Text waere
 * schlechter als der falsche.**
 *
 * `[cmd]` **G-555: der Titel ist ein Parameter.** Hier stand
 * `titel: 'Goals'` fest — **damit war die Datei an ein Modul
 * gebunden**, obwohl drei sie brauchen.
 *
 * `[read]` **Der Sitzungsfall nennt KEIN Modul**, und das ist
 * Absicht: eine abgelaufene Sitzung betrifft die Anmeldung, nicht
 * die Biomarker. **Das Modul zu nennen schickte wieder auf die
 * falsche Suche** — genau der Befund aus G-553.
 *
 * @param art    Was `fehlerart()` ergeben hat.
 * @param modul  Der Reitername fuer den Datenfall (`Goals`,
 *               `Biomarkers`, `Preferences`). **Fehlt er, steht der
 *               Satz ohne Modul** — ehrlicher als ein geratenes.
 */
export function fehlertexte(
  art: Fehlerart, modul?: string,
): Fehlertexte {
  if (art === 'sitzung') {
    return {
      titel: 'Sitzung abgelaufen',
      satz: 'Die Sitzung ist nicht mehr gueltig. Melde dich neu an — '
        + 'deine Daten sind unveraendert.',
    }
  }
  return {
    titel: modul ?? 'Daten',
    satz: 'Die Daten konnten nicht geladen werden.',
  }
}
