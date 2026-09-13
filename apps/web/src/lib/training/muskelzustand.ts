// G-440 - der Trainingszustand je Muskel, GERECHNET statt geschrieben.
//
// ══ WARUM ES DIESE DATEI GIBT ═══════════════════════════════════
//
// **Tom, 2026-09-13:** *„oben steht echte daten und es
// korrespondiert von der grafik nicht in die liste, und zweidrittel
// der liste zeigt keine werte."* **Und:** *„mir wird irgendwas
// serviert aus den haenden gezogen und als echte daten verkauft."*
//
// `[cmd]` **`motor.ts:184` traegt 18 FESTE Zeilen**, abgeschrieben
// aus `module-recovery-engine.jsx:135-154`:
//
//     chest: { hours: 38, sets: 14, soreness: 1,
//              lastSession: 'Push B · Wed' }
//
// `[read]` **`Push B · Wed` ist kein Datum aus der Datenbank.**
// `[read]` **Die Erholungsformel darueber ist echt — sie bekam nur
// Attrappenzahlen.**
//
// ══ DIE KETTE ═══════════════════════════════════════════════════
//
// `[cmd]` **Gemessen** (`tools/_g440-quellen.mjs`, 2026-09-13):
//
//     workout_sets.workout_exercise_id
//       -> workout_exercises.exercise_id
//          -> exercise_muscles.muscle_group_id   (6.588 Zuordnungen)
//       -> workout_exercises.workout_session_id
//          -> workout_sessions.session_date, .name, .user_id
//
// `[cmd]` **Die erste Fassung nahm `workout_sets.exercise_id`** —
// **die Spalte gibt es nicht**, und die Messung meldete *„0 von
// 105"*. `[read]` **Die Zwischentabelle suchen, statt die Null zu
// glauben.**
//
// ══ WAS DIESE DATEI NICHT TUT ═══════════════════════════════════
//
// `[cmd]` **Sie erfindet keine Zahl.** `[read]` **Wo kein Satz auf
// einen Muskel zeigt, gibt es keinen Eintrag** — nicht `0`, nicht
// einen geschaetzten Wert.
//
// `[cmd]` **Und sie wertet die ROLLE noch nicht.** `exercise_muscles`
// fuehrt `primary` (3.053) und `secondary` (3.535); **wie sie in die
// Saetze eingeht, ist C-487.** `[read]` **Bis dahin zaehlt ein Satz
// fuer jeden zugeordneten Muskel gleich — und die Kachel sagt es.**

/** Ein Satz, wie ihn `training.workout_sets` fuehrt. */
export type RohSatz = {
  workout_exercise_id: string | null
}

/** Eine Uebung innerhalb einer Sitzung. */
export type RohUebung = {
  id: string
  exercise_id: string | null
  workout_session_id: string | null
}

/** Eine Sitzung. */
export type RohSitzung = {
  id: string
  session_date: string | null
  name: string | null
}

/** Welche Muskeln eine Uebung trifft. */
export type RohZuordnung = {
  exercise_id: string
  muscle_group_id: string
  role: string | null
}

/**
 * Der gerechnete Zustand EINES Muskels.
 *
 * `[read]` **Dieselben Felder wie die alte Attrappe** — damit die
 * Erholungsformel unveraendert bleibt. **Nur die Herkunft ist
 * anders.**
 */
export type Muskelzustand = {
  /** Stunden seit der letzten Sitzung, die diesen Muskel traf. */
  hours: number
  /** Saetze in jener Sitzung. */
  sets: number
  /** Der Name der Sitzung — aus `workout_sessions.name`. */
  lastSession: string
  /** Das Datum jener Sitzung, fuer die Herkunftsangabe. */
  datum: string
  /** Wie oft primaer / sekundaer — fuer C-487, heute nur Ausweis. */
  rollen: { primary: number; secondary: number }
}

/**
 * Je `muscle_group_id` den Zustand rechnen.
 *
 * `[read]` **Reine Rechnung, keine Importe** — damit sie in einer
 * Probe laufen kann und die `'use client'`-Grenze nicht bricht
 * (die Lehre aus G-430: ein Wert-Import aus dem Leseweg zieht
 * `next/headers` mit und wirft HTTP 500, waehrend `tsc` gruen
 * bleibt).
 *
 * `jetzt` wird hereingereicht, nicht aus `Date.now()` genommen —
 * sonst waere die Funktion nicht pruefbar.
 */
export function muskelzustaende(
  saetze: RohSatz[],
  uebungen: RohUebung[],
  sitzungen: RohSitzung[],
  zuordnungen: RohZuordnung[],
  jetzt: Date,
): Record<string, Muskelzustand> {
  const uebungNach = new Map(uebungen.map(u => [u.id, u]))
  const sitzungNach = new Map(sitzungen.map(z => [z.id, z]))
  const muskelnZurUebung = new Map<string, RohZuordnung[]>()
  for (const z of zuordnungen) {
    const liste = muskelnZurUebung.get(z.exercise_id)
    if (liste) liste.push(z)
    else muskelnZurUebung.set(z.exercise_id, [z])
  }

  // Je Muskel: je Sitzung die Saetze zaehlen, dann die juengste
  // Sitzung nehmen.
  type Sammler = {
    proSitzung: Map<string, number>
    datum: Map<string, string>
    name: Map<string, string>
    rollen: { primary: number; secondary: number }
  }
  const sammler = new Map<string, Sammler>()

  for (const satz of saetze) {
    if (!satz.workout_exercise_id) continue
    const ue = uebungNach.get(satz.workout_exercise_id)
    if (!ue?.exercise_id || !ue.workout_session_id) continue
    const sitzung = sitzungNach.get(ue.workout_session_id)
    if (!sitzung?.session_date) continue

    for (const z of muskelnZurUebung.get(ue.exercise_id) ?? []) {
      let s = sammler.get(z.muscle_group_id)
      if (!s) {
        s = {
          proSitzung: new Map(), datum: new Map(), name: new Map(),
          rollen: { primary: 0, secondary: 0 },
        }
        sammler.set(z.muscle_group_id, s)
      }
      s.proSitzung.set(sitzung.id, (s.proSitzung.get(sitzung.id) ?? 0) + 1)
      s.datum.set(sitzung.id, sitzung.session_date)
      s.name.set(sitzung.id, sitzung.name ?? 'Sitzung ohne Namen')
      if (z.role === 'primary') s.rollen.primary += 1
      else if (z.role === 'secondary') s.rollen.secondary += 1
    }
  }

  // `[cmd]` **`forEach` statt `for…of`** — die Ziel-Version des
  // Projekts erlaubt keine Map-Iteration (TS2802).
  const aus: Record<string, Muskelzustand> = {}
  sammler.forEach((s, muskelId) => {
    // Die juengste Sitzung, die diesen Muskel traf.
    let juengste: string | null = null
    let juengstesDatum: string | null = null
    s.datum.forEach((datum, sitzungId) => {
      if (!juengstesDatum || datum > juengstesDatum) {
        juengstesDatum = datum
        juengste = sitzungId
      }
    })
    // ══ Unerreichbar — und das wird ZUGESICHERT ════════════════
    //
    // `[cmd]` **Die Gegenprobe fand hier einen blinden Fleck:** eine
    // Sabotage, die an dieser Stelle `hours: 0` einsetzte, blieb
    // GRUEN. `[read]` **Der Grund: der Filter oben** (`if
    // (!sitzung?.session_date) continue`) **laesst nur Sitzungen MIT
    // Datum in den Sammler** — ein Eintrag ohne Datum kann gar nicht
    // entstehen.
    //
    // `[read]` **Ein stilles `return` sieht aus wie ein behandelter
    // Fall.** **Ein Wurf sagt, dass er nicht vorkommen DARF** — und
    // faellt laut, falls der Filter oben je entfernt wird.
    if (!juengste || !juengstesDatum) {
      throw new Error(
        'muskelzustaende: Sammler ohne Datum — der Filter auf '
        + '`session_date` oben muss ihn verhindern.')
    }

    // `[read]` **Stunden, nicht Tage** — die Formel rechnet in
    // Stunden. **`session_date` ist ein Datum ohne Uhrzeit**, also
    // ist die Stunde auf den Tagesbeginn bezogen; das steht in der
    // Kachel als Naeherung ausgewiesen.
    const dann = new Date(`${juengstesDatum}T00:00:00Z`)
    const stunden = Math.max(
      0, Math.round((jetzt.getTime() - dann.getTime()) / 3_600_000))

    aus[muskelId] = {
      hours: stunden,
      sets: s.proSitzung.get(juengste) ?? 0,
      lastSession: s.name.get(juengste) ?? 'Sitzung ohne Namen',
      datum: juengstesDatum,
      rollen: s.rollen,
    }
  })
  return aus
}

// ══ G-445: nie belastet ist ERHOLT, nicht unbekannt ═════════════
//
// **Tom, 2026-09-13:** *„selbst wenn es nur 6 uebungen sind, wo
// liegt die logik, dass dann nur die muskeln der uebungen gruen
// gezeigt werden? dann sollten alle nicht verwendeten muskeln
// zumindest sicher mal gruen sein."*
//
// `[read]` **Das ist ein Denkfehler in der Rechnung, kein
// Datenproblem.** `[cmd]` **Die Formel beantwortet die Frage
// selbst:** `base(hours)` **sind die Stunden seit der letzten
// Belastung** — **nie belastet heisst unendlich, und
// `baseRecoveryCurve` gibt ab 96 h glatt `100`.**
//
// `[read]` **100 % ist also KEIN erfundener Wert** — es ist die
// Antwort der bestehenden Formel auf „nie belastet". **Hier wird
// nichts geschaetzt, nur eine Luecke geschlossen, die als
// „unbekannt" gelesen wurde.**
//
// ══ WO DIE GRENZE BLEIBT ════════════════════════════════════════
//
// `[cmd]` **Gemessen 2026-09-13:** `exercise_muscles` **hat 6.744
// Zuordnungen auf 90 Muskelgruppen; `training.muscle_groups`
// fuehrt 105.** `[read]` **Die 15 Rest-Gruppen kann KEINE Uebung
// treffen** — wer dort nicht vorkommt, kann nie trainiert werden.
//
// `[read]` **Das ist ein KATALOGbefund, kein Erholungswert** — er
// wird gemeldet, nicht mit 100 % zugedeckt.

// `[cmd]` **G-446 hat `Herkunft`, `MuskelLage` und `muskelLage`
// hier abgeloest** — sie stehen weiter unten, jetzt mit `geliehen`
// und `verdichtet`. `[read]` **Der Grund oben gilt unveraendert**,
// die Entscheidung ist nur um zwei Faelle reicher.

/**
 * Welche Muskelgruppen ueberhaupt von einer Uebung getroffen werden.
 *
 * `[cmd]` **Aus denselben `exercise_muscles`-Zeilen, die der
 * Leseweg ohnehin holt** — keine zweite Abfrage.
 *
 * `[cmd]` **Gibt eine LISTE zurueck, kein `Set`** — zwei Gruende:
 * die Ziel-Version erlaubt keine Set-Iteration (TS2802, wie bei
 * `Map` oben), **und der Wert muss ueber die `'use
 * client'`-Grenze**, wo ein `Set` als `{}` ankaeme.
 */
export function katalogMuskeln(
  zuordnungen: RohZuordnung[],
): string[] {
  const gesehen: Record<string, true> = {}
  const aus: string[] = []
  for (const z of zuordnungen) {
    if (gesehen[z.muscle_group_id]) continue
    gesehen[z.muscle_group_id] = true
    aus.push(z.muscle_group_id)
  }
  return aus
}

// ══ G-446: die Vererbung laeuft in BEIDE Richtungen ═════════════
//
// **Tom, 2026-09-13:** *„schau zuerst selber, was die liste
// betrifft, vorallem child vom triceps."*
//
// `[read]` **Drei Widersprueche, ein gemeinsamer Nenner: ein
// Elternteil weiss nicht, was seine Kinder tun.**
//
// `[cmd]` **Gemessen 2026-09-13, `training`-Schema:**
//
//     Triceps          309 Zuordnungen, 109 Saetze
//       die drei Koepfe  0 Zuordnungen   -> zeigten „--"
//     Lower Back         0 Zuordnungen,   0 Saetze
//       erector spinae 204 Zuordnungen,  77 Saetze
//                                        -> lieh vom Elternteil OHNE Wert
//     Chest              1 Zuordnung,     0 Saetze
//       Pectoralis Major 211 Zuordnungen, 109 Saetze
//                                        -> Elternteil „unbelastet"
//
// ══ DIE REIHENFOLGE ═════════════════════════════════════════════
//
//     1  eigene Saetze?          -> rechnen
//     2  Elternteil hat Saetze?  -> leihen        (nach unten)
//     3  Kinder haben Saetze?    -> verdichten    (nach oben, NEU)
//     4  weder noch              -> Marke
//
// `[read]` **Schritt 3 fehlte, und Schritt 4 wurde zu frueh
// erreicht.**
//
// ══ WIE VERDICHTET WIRD — UND WARUM SO ══════════════════════════
//
// `[cmd]` **Der Auftrag gibt keine Formel vor.** `[cmd]` **Gemessen,
// welche Eltern ueberhaupt betroffen sind:**
//
//     Chest       1 gemessenes Kind  (Pectoralis Major)
//     Lower Back  1 gemessenes Kind  (erector spinae)
//     Glutes / Hamstrings / Adductors / Calves
//                 0 gemessene Kinder -> bleiben unbelastet
//
// `[read]` **Es ist der SCHNITT ueber die gemessenen Kinder.**
//
// **Warum nicht das Maximum oder das Minimum:** `[cmd]` **Tom hat
// die Frage fuer die Gruppenzeile schon entschieden** (G-436) —
// *„dem Total/Anzahl zusammenfassender Muskeln die Farbe"*.
// `[read]` **Dieselbe Grosse an derselben Stelle darf nicht zwei
// Rechenarten haben** — sonst zeigte `Ø` etwas anderes als der
// Wert daneben.
//
// **Warum nicht die Summe:** `[read]` **Erholung ist ein Prozentsatz,
// keine Menge** — zwei Kinder zu 100 % ergeben nicht 200 %.
//
// `[read]` **Und der Schnitt zaehlt NUR gemessene Kinder** — ein
// Kind, das selbst geliehen oder verdichtet hat, zieht ihn nicht
// mit (sonst mittelte man einen Wert gegen sich selbst, die
// Auflage aus G-438).

/** Woher der Wert eines Muskels stammt. */
export type Herkunft =
  | 'gerechnet'
  | 'geliehen'
  | 'verdichtet'
  | 'unbelastet'
  | 'nicht-im-katalog'

/**
 * Der Zustand EINES Muskels, einschliesslich der Faelle ohne Satz.
 *
 * `[read]` **`zustand` ist `null`, wo nie belastet wurde** — es
 * gibt keine Sitzung, auf die `hours`/`sets`/`lastSession` zeigen
 * koennten. **Die Herkunft sagt, warum.**
 */
export type MuskelLage = {
  herkunft: Herkunft
  zustand: Muskelzustand | null
  /** Bei `geliehen`: von wem. Bei `verdichtet`: aus wievielen. */
  quelle?: string
  /** Bei `verdichtet`: die Zahl der eingegangenen Kinder. */
  ausKindern?: number
}

/** Die Verwandtschaft eines Muskels — Eltern und direkte Kinder. */
export type Sippe = {
  elternId: string | null
  kinderIds: string[]
}

/**
 * Je Muskel: rechnen, leihen, verdichten — oder die Marke.
 *
 * `[read]` **Reine Rechnung, keine Importe** — dieselbe Auflage wie
 * `muskelzustaende` (die `'use client'`-Grenze, G-430).
 *
 * `imKatalog` ist die Menge der `muscle_group_id`, die ueberhaupt
 * in `exercise_muscles` vorkommen. **Sie wird hereingereicht, nicht
 * hier gelesen** — sonst waere die Funktion nicht pruefbar.
 */
export function muskelLage(
  muskelId: string,
  zustaende: Record<string, Muskelzustand>,
  imKatalog: ReadonlySet<string>,
  sippe?: Sippe,
  /** Nur fuer die Meldung: Id -> Name. */
  namen?: Record<string, string>,
): MuskelLage {
  // ── 1 · eigene Saetze schlagen alles ──────────────────────────
  const st = zustaende[muskelId]
  if (st) return { herkunft: 'gerechnet', zustand: st }

  // ── 2 · nach unten: vom Elternteil leihen ─────────────────────
  //
  // `[cmd]` **G-446/Befund 2: NUR wenn der Elternteil wirklich
  // einen Wert HAT.** `[read]` **`Lower Back` hatte keinen, und
  // `erector spinae` lieh trotzdem von ihm** — ein Wert aus dem
  // Nichts.
  const elternZustand = sippe?.elternId
    ? zustaende[sippe.elternId] : undefined
  if (elternZustand) {
    return {
      herkunft: 'geliehen',
      zustand: elternZustand,
      quelle: sippe?.elternId ? namen?.[sippe.elternId] : undefined,
    }
  }

  // ── 3 · nach oben: aus den Kindern verdichten ─────────────────
  //
  // `[cmd]` **G-446/Befund 3: `Chest` galt als unbelastet, waehrend
  // `Pectoralis Major` darunter 109 Saetze trug.**
  const kinderZustaende = (sippe?.kinderIds ?? [])
    .map(k => zustaende[k])
    .filter((z): z is Muskelzustand => z != null)
  if (kinderZustaende.length > 0) {
    return {
      herkunft: 'verdichtet',
      // `[read]` **Der juengste Reiz zaehlt** — wer ein Kind vor
      // zwei Stunden trainiert hat, ist als Gruppe nicht erholt,
      // auch wenn ein anderes Kind seit Wochen ruht.
      // `[cmd]` **Die Saetze werden SUMMIERT** — sie sind eine
      // Menge, anders als die Erholung selbst.
      zustand: {
        hours: Math.min(...kinderZustaende.map(z => z.hours)),
        sets: kinderZustaende.reduce((s, z) => s + z.sets, 0),
        lastSession: juengste(kinderZustaende).lastSession,
        datum: juengste(kinderZustaende).datum,
        rollen: {
          primary: kinderZustaende.reduce((s, z) => s + z.rollen.primary, 0),
          secondary: kinderZustaende.reduce((s, z) => s + z.rollen.secondary, 0),
        },
      },
      ausKindern: kinderZustaende.length,
    }
  }

  // ── 4 · die Marke ─────────────────────────────────────────────
  //
  // `[cmd]` **Der Auftrag sagt es woertlich:** *„keine Uebung trifft
  // ihn"* **nur noch, wenn WEDER Muskel NOCH Eltern NOCH Kinder
  // getroffen werden.**
  //
  // `[cmd]` **Am Bildschirm gefunden, nachdem Schritt 3 stand:**
  //
  //     Calves                      100%  unbelastet
  //       Soleus                    100%  unbelastet
  //       Gastrocnemius Lat. Head     --  keine Uebung trifft ihn
  //
  // `[read]` **Alle drei sind gleich untrainiert** — `Calves` hat
  // 199 Zuordnungen, aber NULL Saetze. **Die Koepfe standen nur
  // deshalb anders da, weil sie selbst nicht im Katalog stehen.**
  //
  // `[read]` **Die Katalogfrage ist eine Frage an die SIPPE, nicht
  // an den einzelnen Knoten** — wer erreichbare Verwandte hat, ist
  // erreichbar.
  const sippeImKatalog = imKatalog.has(muskelId)
    || (sippe?.elternId != null && imKatalog.has(sippe.elternId))
    || (sippe?.kinderIds ?? []).some(k => imKatalog.has(k))
  if (!sippeImKatalog) {
    return { herkunft: 'nicht-im-katalog', zustand: null }
  }
  return { herkunft: 'unbelastet', zustand: null }
}

/** Der Zustand mit den wenigsten Stunden — der juengste Reiz. */
function juengste(liste: Muskelzustand[]): Muskelzustand {
  let aus = liste[0]
  for (const z of liste) if (z.hours < aus.hours) aus = z
  return aus
}

/**
 * Die Sippe je Muskel aus der Knotenliste — Eltern und Kinder.
 *
 * `[read]` **Aus denselben Zeilen, die der Baum ohnehin hat** —
 * keine zweite Abfrage.
 */
export function sippen(
  knoten: Array<{ id: string; parent_id: string | null }>,
): Record<string, Sippe> {
  // `[read]` **ZWEI Durchlaeufe, nicht einer** — im Einzeldurchlauf
  // haengt das Ergebnis an der Reihenfolge der Zeilen: ein Knoten,
  // der erst als ELTERNTEIL auftaucht, bekaeme `elternId: null` und
  // behielte es, wenn seine eigene Zeile spaeter kaeme.
  const aus: Record<string, Sippe> = {}
  for (const k of knoten) aus[k.id] = { elternId: k.parent_id, kinderIds: [] }
  for (const k of knoten) {
    if (k.parent_id && aus[k.parent_id]) aus[k.parent_id].kinderIds.push(k.id)
  }
  return aus
}

/**
 * Wieviel ist gemessen, wieviel fehlt — fuer das ehrliche Etikett.
 *
 * **Tom:** *„das Etikett wird ehrlich. Solange ein Teil geschaetzt
 * ist, steht das dran — nicht ‚echte Daten'."*
 *
 * `[cmd]` **C-466 macht es vor:** `unmapped_taken_log_count` zaehlt,
 * was fehlt, statt es zu verschweigen.
 */
export function deckungsbericht(
  zustaende: Record<string, Muskelzustand>, muskelnGesamt: number,
): {
  gemessen: number
  gesamt: number
  ohneDaten: number
  /** Rollen noch ungewichtet? Dann ist die Satzzahl eine Naeherung. */
  rollenUngewichtet: boolean
} {
  const gemessen = Object.keys(zustaende).length
  return {
    gemessen,
    gesamt: muskelnGesamt,
    ohneDaten: Math.max(0, muskelnGesamt - gemessen),
    // `[cmd]` **Fest `true` bis C-487** — und der Waechter haelt
    // fest, dass es nicht stillschweigend auf `false` kippt.
    rollenUngewichtet: true,
  }
}
