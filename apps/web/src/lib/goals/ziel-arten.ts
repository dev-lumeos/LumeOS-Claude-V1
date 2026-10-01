/**
 * Die Zielarten — eine Quelle, G-354.
 *
 * ## Warum es diese Datei gibt
 *
 * `[cmd]` **Gemessen am 2026-09-06: das *New goal*-Modal fuehrte eine
 * eigene Liste** (`modale.tsx:117`), **uebernommen aus dem Altrepo**
 * (`module-goals.jsx:694-744`):
 *
 *     body_comp · weight · strength · performance · habit · custom
 *
 * `[cmd]` **`body_comp` kennt die Datenbank nicht.** **Der CHECK
 * `user_goals_goal_type_check` laesst vier Werte zu:**
 * `body_composition`, `performance`, `health`, `lifestyle`.
 *
 * `[read]` **Dieselbe Klasse wie G-339** — eine Liste, die niemand
 * mitzaehlt, weil sie in einem Fenster steht. **Und wie dort ein
 * Wert, den der CHECK ablehnen wuerde.**
 *
 * `[read]` **Deshalb steht sie hier und nicht im Modal:** wer eine
 * Auswahl braucht, holt sie von hier. **Keine siebte Liste.**
 *
 * ## Die zweite Ebene
 *
 * `[cmd]` **`user_goals.subtype` hat KEINEN CHECK**, traegt aber
 * fuenf gelebte Werte, keinen davon `null` (G-352, 11 Zeilen):
 * `cut`, `gain_muscle` unter `body_composition`; `strength`,
 * `training_capacity` unter `performance`; `cardio_frequency`
 * unter `lifestyle`.
 *
 * `[read]` **Sie stehen hier als gemessener Bestand, nicht als
 * Vorschrift** — ob `subtype` einen CHECK bekommt, ist offen
 * (G-352). **Bis dahin ist diese Zuordnung eine Anzeigehilfe.**
 *
 * `[cmd]` **Seit E-89 (2026-10-01) kommt `weight` dazu** — der
 * einzige Wert, der entschieden und nicht gezaehlt ist. `[cmd]`
 * **Nochmal gemessen 2026-10-01, ueber die ganze Pipeline: null
 * Treffer auf einen CHECK fuer `subtype`** (`111_goals_ziele_
 * phasen.sql:26` fuehrt `subtype TEXT`, ohne Einschraenkung) —
 * **der Wert wird hier gesetzt, nicht in der Datenbank.**
 */

/**
 * Die vier `goal_type`-Werte.
 *
 * `[cmd]` **Genau die des CHECK `user_goals_goal_type_check`**,
 * gemessen am 2026-09-06.
 */
export const ZIEL_ARTEN = [
  'body_composition', 'performance', 'health', 'lifestyle',
] as const

export type ZielArt = (typeof ZIEL_ARTEN)[number]

/** Die deutschen Namen — die Kategorie, nicht das einzelne Ziel. */
export const ZIEL_ART_TEXT: Record<ZielArt, string> = {
  body_composition: 'Körperzusammensetzung',
  performance: 'Leistung',
  health: 'Gesundheit',
  lifestyle: 'Lebensstil',
}

/**
 * Die Unterarten je Zielart — der gemessene Bestand.
 *
 * `[read]` **Kein CHECK dahinter.** `[cmd]` **Was hier steht, wurde
 * am 2026-09-06 in `goals.user_goals` gezaehlt** — nicht erfunden
 * und nicht aus einer Spec uebernommen.
 */
export const ZIEL_UNTERARTEN: Record<ZielArt, readonly string[]> = {
  // `[cmd]` **`weight` seit E-89 (2026-10-01)** — als einziger Wert
  // hier NICHT aus dem Bestand gezaehlt, sondern entschieden.
  // `[read]` **Der Untertyp benennt die MESSGROESSE:** die Waage ist
  // eine andere Groesse als KFA und Umfaenge, auch wenn die Absicht
  // dieselbe ist. **Deshalb ein eigener Wert und kein `cut`.**
  //
  // `[cmd]` **Nachzuzaehlen, wann er im Bestand ankommt:**
  //
  //     select subtype, count(*) from goals.user_goals
  //       where goal_type = 'body_composition' group by 1;
  body_composition: ['cut', 'gain_muscle', 'weight'],
  performance: ['strength', 'training_capacity'],
  lifestyle: ['cardio_frequency'],
  // `[cmd]` **`health` traegt heute keine Unterart** — null Zeilen.
  // `[read]` **Eine leere Liste ist ehrlicher als ein erfundener
  // Wert** (C-378).
  health: [],
}

/** Die Auswahlliste fuer ein Pulldown oder eine Knopfreihe. */
export function zielArtAuswahl(): Array<{ code: ZielArt; label: string }> {
  return ZIEL_ARTEN.map(code => ({ code, label: ZIEL_ART_TEXT[code] }))
}

/**
 * Die aktiven Plaetze — G-354.
 *
 * `[cmd]` **Die Drei steht im CHECK, nicht in einer Annahme:**
 * `user_goals_check1` = `status <> 'active' OR (priority >= 1 AND
 * priority <= 3)`, **durchgesetzt vom eindeutigen Index
 * `uq_user_goals_active_slot` auf `(user_id, priority) WHERE status
 * = 'active'`.**
 *
 * `[read]` **Sie ist damit entschieden, nicht offen** — was fehlt,
 * ist die Oberflaeche, die einen freien Platz waehlt.
 */
export const AKTIVE_PLAETZE = 3

/** `1..10` — der zweite CHECK, fuer nicht aktive Ziele. */
export const PRIORITAET_MAX = 10

// ══ G-554/A3: die SECHS Knoepfe des Entwurfs ═══════════════════════
//
// **Tom, 2026-09-29:** *,,konzentriere dich nun zuerst auf die subnav
// Goals dass das nach vorgabe ist."*
//
// `[cmd]` **Der Entwurf zeigt sechs Knoepfe**
// (`module-goals.jsx:696-703`), **der CHECK kennt vier Werte.**
// `[cmd]` **G-537 nahm die vier und meldete die Abweichung** — das
// war richtig, **loest aber ,,nach Vorgabe" nicht ein.**
//
// `[read]` **Die Bruecke ist `subtype`** — die Spalte hat KEINEN
// CHECK (gemessen 2026-09-30) und traegt fuenf gelebte Werte.
// **Jeder Entwurfsknopf ist damit ein PAAR aus Art und Unterart.**
//
// ── Die Zuordnung, und wo sie unsicher ist ────────────────────────
//
// ── Der Bestand, nachzaehlbar ─────────────────────────────────────
//
// `[cmd]` **Gemessen 2026-09-30, 11 Zeilen in `goals.user_goals`:**
//
//     select goal_type, subtype, count(*)
//       from goals.user_goals group by 1,2 order by 1,2;
//
//     body_composition  cut                 2
//     body_composition  gain_muscle         2
//     lifestyle         cardio_frequency    2
//     performance       strength            4
//     performance       training_capacity   1
//
// `[cmd]` **KEINE Zeile fuehrt `subtype = NULL`:**
//
//     select count(*) filter (where subtype is null), count(*)
//       from goals.user_goals;          -- 0 von 11
//
// `[read]` **Hier stand „`strength` 2 Zeilen" — gemessen sind es 4**
// (G-557/A3). **Eine Zahl im Kommentar altert, wenn der Befehl
// danebenfehlt, mit dem sie nachzuzaehlen waere.**
//
// `[cmd]` **Vier Knoepfe sind eindeutig**, weil der Seed den
// Untertyp schon so fuehrt:
//
//     body_comp    -> body_composition / cut | gain_muscle
//                                              (aus der Strategie,
//                                               siehe unten)
//     strength     -> performance / strength            4 Zeilen
//     performance  -> performance / training_capacity   1 Zeile
//     habit        -> lifestyle / cardio_frequency      2 Zeilen
//
// `[cmd]` **Zwei waren es NICHT** — `weight` und `custom` trugen
// `unsicher: true` und warteten auf Tom.
//
// ── E-89, 2026-10-01: beide entschieden ───────────────────────────
//
// **Tom, 13:26:** *,,das kann nicht nur gewichtsabhaengig sein.
// gewicht ist eine variable aber dazu kommen noch die
// bodymeasurements, die deklarieren wo das gewicht weg oder
// hinzugekommen ist."*
//
// `[read]` **Daraus folgt der Grundsatz: der Untertyp benennt die
// MESSGROESSE, nicht die Absicht.**
//
//     weight   die Waage ist die Messgroesse -> subtype `weight`,
//              ein EIGENER Wert und kein `cut`. Ein Gewichtsziel
//              wird an der Waage gemessen, ein
//              Koerperzusammensetzungsziel an KFA und Umfaengen —
//              **verschiedene Groessen, auch wenn die Absicht
//              dieselbe ist.**
//
//     custom   ,,Eigenes": der Nutzer benennt die Groesse selbst,
//              **also steht kein Untertyp dafuer** -> `null`.
//              `[read]` **Die Art bleibt `lifestyle`** — ein
//              Behelf, weil der CHECK keinen freien `goal_type`
//              erlaubt. **E-89 entscheidet den Untertyp, nicht die
//              Art**; ob `custom` einen eigenen `goal_type`-Wert
//              braucht, ist weiter offen.
//
// `[cmd]` **`weight` ist damit der einzige Wert in
// `ZIEL_UNTERARTEN`, der nicht aus dem Bestand gezaehlt ist** — er
// kommt noch in null Zeilen vor, weil es den Knopf bis heute nicht
// gab. `[read]` **Entschieden ist nicht erfunden**, aber es ist auch
// nicht gemessen, und der Unterschied gehoert hierher.

/** Ein Knopf des Entwurfs, uebersetzt in die Datenbank. */
export type Zielknopf = {
  /** Die Kennung des Entwurfs — `module-goals.jsx:696-703`. */
  id: string
  label: string
  /** Was in `goal_type` landet. */
  art: ZielArt
  /**
   * Was in `subtype` landet, oder `null`.
   *
   * `[read]` **`null` heisst bei `custom`: der Nutzer benennt die
   * Messgroesse selbst** (E-89). **Bei `body_comp` heisst es: die
   * Richtung kommt erst aus der Strategie** — siehe
   * `unterartFuer()`. `[read]` **Zwei verschiedene Gruende fuer
   * dieselbe Abwesenheit**, deshalb steht der Grund je Knopf.
   */
  unterart: string | null
}

// ══ G-576: `unsicher` ist weg ═════════════════════════════════════
//
// `[cmd]` **Das Feld trug `true` bei genau zwei Knoepfen** —
// `weight` und `custom`, die seit G-554 auf Toms Entscheidung
// warteten. **E-89 hat beide entschieden (2026-10-01)**, damit stand
// ueberall `false`.
//
// `[read]` **Ein Feld mit einem einzigen Wert sagt nichts** — und
// ein `unsicher: false` an jedem Knopf liest sich wie eine geprüfte
// Zusicherung, wo nur die Frage weggefallen ist.
//
// `[cmd]` **Gemessen vor dem Entfernen: `modale.tsx:261` reichte es
// in `types` durch, keine Zeile las `t.unsicher`** — es erreichte
// den Schirm nie. **Die Kennzeichnung, die G-554 versprochen hatte,
// war nie gebaut.**

/**
 * Die sechs Knoepfe, in der Reihenfolge des Entwurfs.
 *
 * `[cmd]` **`module-goals.jsx:696-703`**, dieselbe Folge, dieselben
 * Beschriftungen.
 */
export const ZIELKNOEPFE: readonly Zielknopf[] = [
  { id: 'body_comp', label: 'Body composition',
    art: 'body_composition', unterart: null },
  // `[cmd]` **E-89, 2026-10-01: `weight` traegt die Waage.** Ein
  // Gewichtsziel wird an der Waage gemessen, ein
  // Koerperzusammensetzungsziel an KFA und Umfaengen — **zwei
  // Messgroessen, dieselbe Absicht.** `[read]` **Deshalb ein FESTER
  // Untertyp:** er darf nicht aus der Strategie abgeleitet werden,
  // sonst wuerde aus einem Waageziel ein `cut`.
  { id: 'weight', label: 'Weight',
    art: 'body_composition', unterart: 'weight' },
  { id: 'strength', label: 'Strength PR',
    art: 'performance', unterart: 'strength' },
  { id: 'performance', label: 'Performance',
    art: 'performance', unterart: 'training_capacity' },
  { id: 'habit', label: 'Habit',
    art: 'lifestyle', unterart: 'cardio_frequency' },
  // `[cmd]` **E-89, 2026-10-01: ,,Eigenes" traegt KEINEN Untertyp.**
  // `[read]` **Der Nutzer benennt die Messgroesse selbst** — ein
  // vorbelegter Untertyp waere eine Einordnung, die er nicht
  // vorgenommen hat. **`null` ist hier die Aussage, nicht die
  // Luecke.**
  //
  // `[read]` **`lifestyle` als Art bleibt**, weil der CHECK keinen
  // freien `goal_type` erlaubt und `lifestyle` die weiteste der vier
  // Arten ist. **Das war und bleibt ein Behelf** — E-89 entscheidet
  // den Untertyp, nicht die Art.
  { id: 'custom', label: 'Custom',
    art: 'lifestyle', unterart: null },
] as const

/** Der Knopf zu einer Kennung. */
export function zielknopf(id: string): Zielknopf | null {
  return ZIELKNOEPFE.find(k => k.id === id) ?? null
}

// ══ G-557/A2: `body_comp` traegt kein NULL ═════════════════════════
//
// `[cmd]` **Gemessen 2026-09-30: alle vier `body_composition`-Zeilen
// fuehren `cut` oder `gain_muscle`** — und **keine der 11 Zeilen der
// Tabelle hat `subtype = NULL`:**
//
//     select count(*) filter (where subtype is null), count(*)
//       from goals.user_goals;                        -- 0 von 11
//
// `[read]` **Ein `body_comp`-Ziel ohne Unterart waere das erste
// seiner Art** — und die beiden Werte stehen seit G-352 in
// `ZIEL_UNTERARTEN.body_composition`.
//
// ── Die Richtung wird ABGELEITET, nicht erfunden ──────────────────
//
// `[cmd]` **Die gewaehlte Strategie sagt sie**, ueber ihre
// `category` — gemessen an `goals.goal_strategies`:
//
//     select code, category, tdee_modifier
//       from goals.goal_strategies order by category, code;
//
//     fat_loss      5 Zeilen, tdee_modifier -0,10 bis -0,25   -> cut
//     muscle_gain   4 Zeilen, tdee_modifier +0,10 bis +0,20   -> gain_muscle
//     hybrid        2 Zeilen, tdee_modifier 0,000             -> keine Richtung
//     contest_prep  2 · recovery 1 · expert 3                 -> keine Richtung
//
// `[read]` **Nur zwei der sechs Kategorien sagen eine Richtung.**
// **Die uebrigen halten das Gewicht oder verfolgen etwas anderes** —
// dort bleibt die Unterart leer, **und die Karte sagt das**, statt
// eine der zwei zu raten.
//
// `[read]` **Ohne Strategie bleibt `subtype` leer.** Ein Ziel *„auf
// 12 % Koerperfett"* ohne gewaehlte Strategie sagt WOHIN, nicht WIE
// — **und `cut` waere schon eine Annahme ueber das Wie.**

/**
 * Welche Unterart gehoert zu dieser Strategiekategorie?
 *
 * `[read]` **Eine Tabelle, kein Vergleich im Fluss** — sonst laesst
 * sich die Ableitung nicht nachlesen und nicht pruefen.
 */
const KATEGORIE_ZU_UNTERART: Record<string, string> = {
  fat_loss: 'cut',
  muscle_gain: 'gain_muscle',
}

/**
 * Die Unterart eines neuen Ziels — G-557/A2.
 *
 * `[read]` **Drei Faelle, in dieser Reihenfolge:**
 *
 *   1  Der Knopf bringt eine feste Unterart mit (`strength`,
 *      `performance`, `habit`, **seit E-89 auch `weight`**) — sie
 *      gewinnt.
 *   2  `body_composition` mit Strategie: die Kategorie sagt die
 *      Richtung.
 *   3  Sonst `null` — **nicht geraten.**
 *
 * ══ G-576/A3: `weight` darf die Ableitung NICHT mitnehmen ════════
 *
 * `[cmd]` **Bis E-89 ergab `unterartFuer('weight', 'fat_loss')` den
 * Wert `cut`** — `weight` war `body_composition` ohne feste
 * Unterart und fiel damit in Fall 2. **Eine Zusicherung behauptete
 * das sogar ausdruecklich** (`g554-phasenziel.test.ts:485`).
 *
 * `[read]` **Nach E-89 ist das falsch:** wer ,,Weight" drueckt,
 * waehlt die Waage als Messgroesse. **Eine Abnehmstrategie aendert
 * die Absicht, nicht die Groesse** — aus einem Waageziel wird kein
 * Koerperzusammensetzungsziel.
 *
 * `[cmd]` **Fall 1 faengt es ab**, weil `weight` jetzt eine feste
 * Unterart traegt. **Das ist keine Sonderbehandlung**, sondern
 * dieselbe Regel wie bei `strength`: eine gewaehlte Messgroesse
 * ueberschreibt die abgeleitete.
 *
 * @param knopfId    Die Kennung des Entwurfsknopfes.
 * @param kategorie  `category` der gewaehlten Strategie, oder `null`.
 */
export function unterartFuer(
  knopfId: string, kategorie: string | null,
): string | null {
  const k = zielknopf(knopfId)
  if (!k) return null
  if (k.unterart !== null) return k.unterart
  if (k.art !== 'body_composition' || kategorie === null) return null
  return KATEGORIE_ZU_UNTERART[kategorie] ?? null
}

/**
 * Traegt dieser Knopf eine Ernaehrungsstrategie? — G-554/A1.
 *
 * `[read]` **Nur `body_composition`.** `[cmd]` **Der Katalog
 * `goal_strategies` fuehrt TDEE-Faktor, Zielrate und Makros** — ein
 * Bankdrueck-Ziel hat davon nichts. **Die Wahl erscheint deshalb
 * genau dort, wo sie etwas bedeutet.**
 */
export function traegtStrategie(k: Zielknopf | null): boolean {
  return k?.art === 'body_composition'
}
