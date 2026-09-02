// ════════════════════════════════════════════════════════════════════
// DIE MAHLZEITEN-SLOTS — G-332 / E-58
// ════════════════════════════════════════════════════════════════════
//
// **Tom, 2026-09-02:** *„kuenftig sagt man wieviele mahlzeiten man hat
// und dann definiert man jede einzelne mit zeit und namen."*
//
// `[cmd]` **`nutrition.meal_slots` steht seit C-392:** `user_id`,
// `position`, `name`, `planned_time` — **alle NOT NULL**, PK auf
// `(user_id, position)`, **keine `id`**.
//
// ══ WAS HIER STEHT UND WARUM ════════════════════════════════════════
//
// `[read]` **Nur Rechnen, kein I/O.** Die Zuordnung einer Uhrzeit zu
// einem Slot ist die tragende Entscheidung dieses Punkts — **sie
// gehört an eine Stelle, die man aufrufen und messen kann.**
//
// `[cmd]` **G-315 hat gezeigt, warum:** eine Bedingung mitten im
// Baustein lässt sich nur über ihren Wortlaut prüfen, nicht über ihre
// Wirkung.

/** Ein Slot, wie ihn `meal_slots` führt. */
export type MahlzeitSlot = {
  position: number
  name: string
  /** `HH:MM`, wie die Datenbank sie als `time` liefert. */
  planned_time: string
}

/**
 * Die gängigsten Namen — Auswahl, nicht Vorschrift.
 *
 * **Tom:** *„die gaengigsten als pulldown plus manuelle eingabe."*
 *
 * `[cmd]` **Die ersten fünf sind die, die auf dev stehen** (C-394):
 * Frühstück, Snack, Mittagessen, Nachmittagssnack, Abendessen.
 *
 * `[read]` **Die Liste schränkt nichts ein** — `name` ist freier
 * Text, und das Formular erlaubt beides.
 */
export const NAMEN_VORSCHLAEGE: readonly string[] = [
  'Frühstück',
  'Zwischenmahlzeit',
  'Snack',
  'Mittagessen',
  'Nachmittagssnack',
  'Abendessen',
  'Spätmahlzeit',
  'Vor dem Training',
  'Nach dem Training',
]

/**
 * Die Zeiten, aus denen Initialwerte entstehen.
 *
 * `[cmd]` **Gemessen, nicht geraten:** auf `dev@lumeos.app` stehen
 * `07:30`, `10:14`, `12:30`, `16:00`, `19:30` — dieselben Zeiten, die
 * die Seed-Mahlzeiten tragen.
 *
 * `[read]` **Die Reihenfolge ist Frühstück, Snack, Mittag,
 * Nachmittag, Abend** — wer mehr Mahlzeiten hat, bekommt hinten eine
 * Spätmahlzeit dazu.
 */
const VORGABE: ReadonlyArray<{ name: string; zeit: string }> = [
  { name: 'Frühstück', zeit: '07:30' },
  { name: 'Mittagessen', zeit: '12:30' },
  { name: 'Abendessen', zeit: '19:30' },
  { name: 'Zwischenmahlzeit', zeit: '10:00' },
  { name: 'Nachmittagssnack', zeit: '16:00' },
  { name: 'Spätmahlzeit', zeit: '21:30' },
]

/** `07:30:00` zu `07:30` — die Datenbank liefert Sekunden mit. */
export function kurzZeit(t: string): string {
  return /^\d{2}:\d{2}/.test(t) ? t.slice(0, 5) : t
}

/** `07:30` zu Minuten seit Mitternacht. `null`, wenn unlesbar. */
export function minuten(t: string | null | undefined): number | null {
  if (!t) return null
  const m = /^(\d{1,2}):(\d{2})/.exec(t)
  if (!m) return null
  const h = Number(m[1])
  const min = Number(m[2])
  if (!Number.isFinite(h) || !Number.isFinite(min)) return null
  if (h < 0 || h > 23 || min < 0 || min > 59) return null
  return h * 60 + min
}

/**
 * Initialwerte für `n` Mahlzeiten — G-332.
 *
 * **Der Auftrag:** *„Initialwerte aus `meals_per_day`/`snacks_per_day`,
 * mit den gemessenen Zeiten."*
 *
 * `[read]` **Hauptmahlzeiten zuerst, dann Snacks dazwischen** — wer
 * drei Mahlzeiten hat, bekommt Frühstück/Mittag/Abend; wer fünf hat,
 * die zwei Snacks dazu.
 *
 * `[cmd]` **Keine Obergrenze** — der CHECK auf `meals_per_day` ist
 * seit C-392 weg. **Über sechs füllt die Liste mit nummerierten
 * Mahlzeiten auf**, statt abzuschneiden: eine stumm gekürzte Liste
 * wäre schlimmer als eine mit faden Namen.
 */
export function initialSlots(anzahl: number): MahlzeitSlot[] {
  const n = Math.max(0, Math.floor(Number.isFinite(anzahl) ? anzahl : 0))
  if (n === 0) return []
  const aus: MahlzeitSlot[] = []
  for (let i = 0; i < n; i += 1) {
    const v = VORGABE[i]
    aus.push(v
      ? { position: i + 1, name: v.name, planned_time: v.zeit }
      // `[read]` **Ab der siebten: nummeriert und stündlich** — ein
      // Platzhalter, den man umbenennt, ist besser als keine Zeile.
      : {
        position: i + 1,
        name: `Mahlzeit ${i + 1}`,
        planned_time: `${String(Math.min(23, 7 + i)).padStart(2, '0')}:00`,
      })
  }
  // `[read]` **Nach Zeit sortiert, dann neu nummeriert** — sonst stünde
  // die Zwischenmahlzeit um 10:00 hinter dem Abendessen.
  aus.sort((x, y) => (minuten(x.planned_time) ?? 0) - (minuten(y.planned_time) ?? 0))
  return aus.map((s, i) => ({ ...s, position: i + 1 }))
}

/**
 * Die Liste auf `n` Zeilen bringen — G-332.
 *
 * **Der Auftrag:** *„Wer die Anzahl erhöht, bekommt neue Zeilen; wer
 * sie senkt, verliert Zeilen von unten."*
 *
 * `[read]` **Vorhandene Zeilen bleiben unverändert** — wer den Namen
 * der dritten Mahlzeit geändert hat, behält ihn, auch wenn er von 4
 * auf 6 erhöht.
 */
export function aufAnzahl(
  vorhanden: readonly MahlzeitSlot[], anzahl: number,
): MahlzeitSlot[] {
  const n = Math.max(0, Math.floor(Number.isFinite(anzahl) ? anzahl : 0))
  if (n <= vorhanden.length) {
    // Von unten kürzen — die Reihenfolge bleibt.
    return vorhanden.slice(0, n).map((s, i) => ({ ...s, position: i + 1 }))
  }
  const zusatz = initialSlots(n).slice(vorhanden.length)
  return [...vorhanden, ...zusatz].map((s, i) => ({ ...s, position: i + 1 }))
}

/**
 * Eine Zeile entfernen und die Nummern schliessen — G-332.
 *
 * **Die Auftragsfrage:** *„Miss, was mit einer gelöschten Position
 * geschieht, deren Nummer eine andere braucht."*
 *
 * `[cmd]` **Am 2026-09-02 gegen die Datenbank gemessen:**
 *
 *     DELETE position=2, dann UPDATE 3 -> 2     geht
 *     UPDATE 3 -> 2, waehrend 2 noch steht      duplicate key
 *
 * `[read]` **Also: erst löschen, dann nachrücken** — nie umgekehrt.
 * `[cmd]` **Der PK ist `(user_id, position)`**, es gibt keine `id`,
 * die das auffangen würde.
 *
 * `[read]` **Diese Funktion rechnet nur die Zielliste** — der
 * Schreibweg macht daraus `DELETE` und `INSERT`, nicht `UPDATE`.
 * **So kann die Reihenfolge der Anweisungen gar nicht kollidieren.**
 */
export function ohnePosition(
  vorhanden: readonly MahlzeitSlot[], position: number,
): MahlzeitSlot[] {
  return vorhanden
    .filter(s => s.position !== position)
    .map((s, i) => ({ ...s, position: i + 1 }))
}

/**
 * Welcher Slot zu einer Uhrzeit gehört — G-332 / E-58.
 *
 * **Der Auftrag:** *„Die Zuordnung macht die Zeit — nächstliegende
 * Slot-Zeit, ohne gespeicherte Kennung."*
 *
 * `[cmd]` **0 von 2.899 `meals` sind ohne `meal_time`** (2026-09-02
 * gemessen) — die Zuordnung greift lückenlos.
 *
 * `[read]` **Nächstliegend, nicht „der letzte davor"**: wer um 11:50
 * isst, gehört zum Mittagessen um 12:30, nicht zur Zwischenmahlzeit
 * um 10:00. **Der Abstand entscheidet, nicht die Richtung.**
 *
 * `[read]` **Über Mitternacht wird nicht gerechnet.** Eine Mahlzeit um
 * 23:50 und ein Slot um 00:10 liegen 20 Minuten auseinander, aber an
 * verschiedenen Tagen — **und `meals` trägt das Datum getrennt.**
 *
 * `[read]` **E-58: kein gespeicherter Wert ändert sich.** Wer eine
 * Slot-Zeit verschiebt, sieht alte Einträge anders gruppiert — die
 * Zuordnung ist Anzeige, keine Speicherung.
 */
/**
 * Wie weit eine Mahlzeit hoechstens von ihrem Slot liegen darf.
 *
 * **Tom, 2026-09-02:** *,,wer um 22:00 noch isst, hat dafuer keinen
 * Slot und soll trotzdem erfassen koennen."*
 *
 * `[cmd]` **Ohne Grenze faende 22:00 das Abendessen um 19:30** —
 * 150 Minuten entfernt. **Das ist keine Zuordnung mehr, das ist der
 * naechstbeste Rest.**
 *
 * `[cmd]` **Gemessen an den dev-Slots (2026-09-02):** die Abstaende
 * zwischen benachbarten Slots sind 164, 136, 210 und 210 Minuten.
 * **Die Haelfte des groessten ist 105.**
 *
 * `[read]` **120 liegt knapp darueber** — **jede Zeit ZWISCHEN zwei
 * Slots wird noch zugeordnet**, auch bei der weitesten Luecke; erst
 * ausserhalb der Reihe faellt sie heraus. **Enger gefasst verloere
 * man Zuordnungen, weiter gefasst waere 22:00 wieder Abendessen.**
 */
export const MAX_ABSTAND_MIN = 120

export function slotFuerZeit(
  slots: readonly MahlzeitSlot[], zeit: string | null | undefined,
): MahlzeitSlot | null {
  if (slots.length === 0) return null
  const m = minuten(zeit)
  if (m === null) return null
  let beste: MahlzeitSlot | null = null
  let abstand = Number.POSITIVE_INFINITY
  for (const s of slots) {
    const sm = minuten(s.planned_time)
    if (sm === null) continue
    const d = Math.abs(sm - m)
    // `[read]` **Bei Gleichstand gewinnt die frühere Position** —
    // sonst hinge die Zuordnung an der Reihenfolge der Zeilen.
    if (d < abstand || (d === abstand && beste !== null && s.position < beste.position)) {
      abstand = d
      beste = s
    }
  }
  // `[read]` **Zu weit weg heisst: kein Slot** — nicht der
  // naechstbeste. **Die Mahlzeit steht dann mit ihrer Uhrzeit da.**
  return abstand <= MAX_ABSTAND_MIN ? beste : null
}

/**
 * Die Kategorien aus dem CHECK — als Rueckfall, nicht als Beschriftung.
 *
 * ══ G-335: EINE Liste statt acht ═══════════════════════
 *
 * `[cmd]` **Gemessen am 2026-09-02: `meal_type` wurde an ACHT
 * Stellen uebersetzt**, jede mit eigener Liste — **vier
 * Schreibweisen fuer `pre_workout`:**
 *
 *     erfassen-modal       'Pre-workout'
 *     plan-eintrag-editor  'Vor dem Training'
 *     plans-echt           'Pre-Workout'
 *     rezepte-echt         'Vor dem Training'
 *     erfassen             'vor dem Training'
 *     mahlzeiten           'Pre-workout'
 *     modale               { id: 'preworkout', time: '16:30' }
 *     plan-model           'Pre-Workout'
 *
 * `[read]` **`meal_type` ist eine Kategorie, keine Beschriftung**
 * (E-58/E-59). **Diese Liste ist der Rueckfall, wenn keine Quelle
 * einen Namen liefert** — nicht die Wahrheit ueber den Namen.
 */
export const KATEGORIE_TEXT: Record<string, string> = {
  breakfast: 'Frühstück',
  lunch: 'Mittagessen',
  dinner: 'Abendessen',
  snack: 'Snack',
  pre_workout: 'Vor dem Training',
  post_workout: 'Nach dem Training',
  other: 'Sonstiges',
}

/**
 * Die Kategorien als Auswahlliste — G-335.
 *
 * **Tom, 2026-09-02:** *,,Pulldown zeigt Pre-workout statt der
 * eigenen Namen."*
 *
 * `[cmd]` **Zwei Stellen bauten eigene Tupel-Listen** —
 * `erfassen-modal` mit *Pre-workout*, `rezepte-echt` mit *Vor dem
 * Training*. **Dieselbe Auswahl, zwei Beschriftungen.**
 *
 * `[read]` **Wo der Nutzer eigene Slots hat, stehen SEINE Namen** —
 * die Kategorie ist dann nur der gespeicherte Wert. **Ohne Slots
 * bleibt es bei `KATEGORIE_TEXT`.**
 */
export function kategorieAuswahl(
  slots: readonly MahlzeitSlot[] = [],
  reihen: readonly string[] = [],
): Array<{ code: string; label: string }> {
  return Object.keys(KATEGORIE_TEXT).map(code => ({
    code,
    label: mahlzeitName(code, { slots, reihen }),
  }))
}

/**
 * Woher ein Mahlzeitenname kommt — G-335.
 *
 * **Der Auftrag:** *,,Wo ein Plan die Quelle ist, kommt der Name aus
 * dem Plan (E-59). Wo der Nutzer die Quelle ist, aus `meal_slots`
 * (E-58)."*
 *
 * `[cmd]` **C-396 liefert die Planstruktur noch nicht** (gemessen
 * 2026-09-02: keine plangebundene Tabelle, keine Namensspalte in
 * `meal_plan_entries`). **`planName` bleibt deshalb `null`** — die
 * Stelle steht, die Quelle fehlt.
 *
 * `[read]` **Die Reihenfolge ist die Entscheidung:** Plan schlaegt
 * Nutzerslot schlaegt Kategorie. **Ein gelieferter Plan bringt seine
 * Benennung mit; sie durch die eigene zu ersetzen hiesse, den Plan
 * umzuschreiben.**
 */
export function mahlzeitName(
  kategorie: string,
  {
    zeit = null, slots = [], planName = null, reihen = [],
  }: {
    /** Die Uhrzeit der Buchung — sie ordnet zu (E-58). */
    zeit?: string | null
    /** Die Slots des Nutzers. */
    slots?: readonly MahlzeitSlot[]
    /** Der Name aus dem Plan, sobald C-396 ihn liefert (E-59). */
    planName?: string | null
    /** Die Reihenfolge der Kategorien — fuer Zeilen ohne Uhrzeit. */
    reihen?: readonly string[]
  } = {},
): string {
  // 1. Der Plan, wenn er einen Namen mitbringt.
  if (planName && planName.trim().length > 0) return planName.trim()
  // 2. Der Nutzerslot, ueber die Zeit.
  const ueberZeit = slotFuerZeit(slots, zeit)
  if (ueberZeit) return ueberZeit.name
  // 3. Ohne Uhrzeit: ueber die Stellung in der Reihe.
  const ueberReihe = slotFuerTyp(slots, kategorie, reihen)
  if (ueberReihe) return ueberReihe
  // 4. Die Kategorie — der letzte Rueckfall.
  return KATEGORIE_TEXT[kategorie] ?? kategorie
}

// ══ G-336: die Zeilen des Rasters ═══════════════════════════════════

/** Eine Rasterzeile: was dransteht, und welche Eintraege hineinfallen. */
export type RasterZeile = {
  /** Die Beschriftung — der Slotname, sonst die Kategorie. */
  label: string
  /** Die Kategorie, nach der Eintraege gefiltert werden. */
  kategorie: string
  /** Die geplante Zeit, wenn die Quelle eine kennt. */
  zeit: string | null
}

/** Woher die Zeilen kommen — fuer den Satz unter dem Raster. */
export type ZeilenQuelle = 'plan' | 'nutzer' | 'vorlieben'

/**
 * Welche Zeilen ein Plan-Raster hat — G-336.
 *
 * **Der Auftrag:** *,,Plan-Slots, wenn der Plan welche hat ·
 * Nutzer-Slots, wenn nicht und es ein Selbstplan ist · `meals_per_day`
 * als Rueckfall."*
 *
 * `[read]` **Dieselbe Ordnung wie `mahlzeitName`** (G-335): der Plan
 * schlaegt den Nutzer schlaegt die Kategorie. **Keine zweite
 * Rangfolge** — diese Funktion IST die eine, nur fuer Zeilen statt
 * fuer Namen.
 *
 * `[cmd]` **Warum die Kategorie mitlaeuft:** `meal_plan_entries`
 * traegt `meal_type`, nicht die Slotposition. **Eine Zeile braucht
 * beides** — den Namen zum Anzeigen und die Kategorie zum Filtern.
 *
 * `[cmd]` **Die Zuordnung Slot → Kategorie geht ueber die Stellung**,
 * nicht ueber den Namen: der erste Slot nimmt die erste Kategorie der
 * Reihe. **Nach `reihen`** — hat der Plan mehr Slots als Kategorien,
 * bekommen die uebrigen `other`.
 *
 * `[read]` **Ein Selbstplan ohne eigene Slots liest die Nutzerslots**
 * — er ist ja der Plan desselben Menschen. **Ein gelieferter Plan
 * ohne Slots faellt auf die Vorlieben zurueck** und meldet das:
 * seine Struktur fehlt, sie wird nicht erfunden (E-59).
 */
export function rasterQuelle(
  {
    planSlots = [], nutzerSlots = [], planEigen = false,
    vorlieben = [], reihen = [],
  }: {
    /** Die Slots DIESES Plans (`meal_plan_slots`). */
    planSlots?: readonly MahlzeitSlot[]
    /** Die Slots des Nutzers (`meal_slots`). */
    nutzerSlots?: readonly MahlzeitSlot[]
    /** Ist es ein selbst angelegter Plan? */
    planEigen?: boolean
    /** Der Rueckfall aus `meals_per_day` — Kategorien, keine Namen. */
    vorlieben?: readonly string[]
    /** Die Kategorien in ihrer Reihenfolge, fuer die Zuordnung. */
    reihen?: readonly string[]
  } = {},
): { zeilen: RasterZeile[]; quelle: ZeilenQuelle } {
  const ordnung = reihen.length > 0 ? reihen : vorlieben

  const ausSlots = (slots: readonly MahlzeitSlot[]): RasterZeile[] =>
    [...slots]
      .sort((a, b) => a.position - b.position)
      .map((s, i) => ({
        label: s.name,
        kategorie: ordnung[i] ?? 'other',
        zeit: s.planned_time,
      }))

  // 1. Der Plan, wenn er eigene Slots traegt (E-59).
  if (planSlots.length > 0) {
    return { zeilen: ausSlots(planSlots), quelle: 'plan' }
  }
  // 2. Die Slots des Nutzers — aber nur bei einem eigenen Plan (E-58).
  if (planEigen && nutzerSlots.length > 0) {
    return { zeilen: ausSlots(nutzerSlots), quelle: 'nutzer' }
  }
  // 3. Der Rueckfall aus den Vorlieben — Kategorien ohne Zeit.
  return {
    zeilen: vorlieben.map(k => ({
      label: KATEGORIE_TEXT[k] ?? k, kategorie: k, zeit: null,
    })),
    quelle: 'vorlieben',
  }
}

/**
 * Der Satz unter dem Raster — G-336.
 *
 * `[cmd]` **Gemessen am 2026-09-02, vor dem Bau:** drei Plaene mit
 * NULL Slots schrieben *,,4 Reihen aus diesem Plan"*, waehrend `test`
 * mit FUENF Slots *,,aus deinen Vorlieben"* schrieb. **Der Satz war
 * in jedem gemessenen Fall falsch herum.**
 *
 * `[read]` **Er stand neben der Rangfolge, statt aus ihr zu folgen** —
 * deshalb kommt er jetzt aus derselben Funktion.
 */
export function zeilenSatz(
  quelle: ZeilenQuelle, anzahl: number, planEigen = false,
): string {
  if (quelle === 'plan') {
    return `${anzahl} Reihen aus diesem Plan — er bringt seine eigene `
      + 'Mahlzeitenstruktur mit.'
  }
  if (quelle === 'nutzer') {
    return `${anzahl} Reihen aus deinen Mahlzeiten — dieser Plan hat `
      + 'keine eigene Struktur, also gilt deine.'
  }
  return planEigen
    ? `${anzahl} Reihen aus deinen Vorlieben — weder der Plan noch `
      + 'deine Mahlzeiten sind gesetzt.'
    : `${anzahl} Reihen aus deinen Vorlieben — dieser Plan bringt `
      + 'keine eigene Struktur mit.'
}

/**
 * Der Name fuer eine LEERE Karte — G-332.
 *
 * `[read]` **Eine leere Karte hat keine Uhrzeit** — es gibt nichts
 * zuzuordnen. **Also ueber die Stellung in der Reihe:** die dritte
 * Mahlzeitenreihe bekommt den dritten Slot.
 *
 * `[cmd]` **Nicht ueber `meal_type`** — die sieben Werte sind eine
 * Kategorie, die Slots sind frei benannt. **Eine Abbildung
 * *breakfast → Fruehstueck* waere geraten**, sobald jemand seinen
 * ersten Slot *,,Morgenmahlzeit"* nennt.
 *
 * `[read]` **`null`, wenn die Reihe nicht in der Liste steht oder es
 * keinen Slot dafuer gibt** — der Aufrufer faellt dann auf seine
 * feste Bezeichnung zurueck.
 */
export function slotFuerTyp(
  slots: readonly MahlzeitSlot[],
  typ: string,
  reihen: readonly string[],
): string | null {
  const i = reihen.indexOf(typ)
  if (i < 0) return null
  return slots[i]?.name ?? null
}

/**
 * Was eine Zeile im Formular verletzt — G-332.
 *
 * `[read]` **Alle Spalten sind NOT NULL** (C-392): ein leerer Name
 * oder eine unlesbare Zeit wären ein Schreibfehler, den erst die
 * Datenbank meldet. **Hier fällt er vorher auf.**
 */
export function zeilenFehler(slot: MahlzeitSlot): string | null {
  if (slot.name.trim().length === 0) return 'Der Name darf nicht leer sein.'
  if (minuten(slot.planned_time) === null) return 'Die Zeit muss HH:MM sein.'
  return null
}

/**
 * Was die ganze Liste verletzt — G-332.
 *
 * `[cmd]` **Der PK verbietet zwei Zeilen mit derselben Position.**
 * `[read]` **Zwei Zeilen zur selben UHRZEIT sind dagegen erlaubt** —
 * wer zweimal um 12:30 isst, hat zwei Mahlzeiten; `slotFuerZeit`
 * nimmt dann die frühere Position.
 */
export function listenFehler(slots: readonly MahlzeitSlot[]): string | null {
  for (const s of slots) {
    const f = zeilenFehler(s)
    if (f) return `Mahlzeit ${s.position}: ${f}`
  }
  const nummern = new Set(slots.map(s => s.position))
  if (nummern.size !== slots.length) {
    return 'Zwei Zeilen tragen dieselbe Nummer.'
  }
  return null
}
