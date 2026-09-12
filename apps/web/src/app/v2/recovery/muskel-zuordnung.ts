// Recovery-Kuerzel -> Muskel-ID der Koerperkarte.
//
// `[cmd]` DIE BEIDEN LISTEN SIND NICHT DECKUNGSGLEICH. Recovery fuehrt
// 18 Kuerzel (motor.ts:28-34), die Karte 39 IDs: **17 einfaerbbare
// Gruppen**, 6 Nicht-Muskeln (Kniescheibe, Kopf, Haare, Haende,
// Knoechel, Fuesse) und 16 Injektionsorte. Vollstaendig aufgeschluesselt
// in `EINORDNUNG` unten — G-44 hat die Zahlen zur Laufzeit gezaehlt und
// die frueheren „21 Gruppen, fuenf Nicht-Muskeln" berichtigt.
//
// **Jede Zeile ist geprueft, keine geraten.** Wo die Karte gruenlicher
// zeichnet als Recovery unterscheidet, steht der Grund daneben.
import { MUSKELN } from '@lumeos/ui'

// ---------------------------------------------------------------------
// EINORDNUNG — was jede ID der Karte ist (G-44)
// ---------------------------------------------------------------------
//
// `[read]` Tom, 2026-08-18: „Recheck, ob alle Muskeln in der Grafik auch
// in der Liste auftauchen."
//
// `[cmd]` DIE KARTE FUEHRT 39 IDs: 23 in `MUSKELN`, 16 in
// `INJEKTIONS_ORTE`. Zur Laufzeit gezaehlt (`Object.keys`), nicht per
// grep — an einem `[a-z_]+`-Muster ist in G-26 schon `upper-back`
// durchgefallen und waere dauerhaft grau geblieben.
//
// **Jede der 39 bekommt hier eine Einordnung.** Der Test
// `karten-ids.test.ts` macht eine fehlende zum Fehler; sonst waechst
// die Liste still weiter.
//
// `[annahme]` ZU TOMS ZAEHLUNG VON 41: die beiden zusaetzlichen sind
// `label` und `side` — das sind **Eigenschaften** der
// Injektionsort-Objekte, keine IDs. Aus demselben Grund taucht `both`
// als vermeintliche ID auf: es ist der WERT von `side` bei
// beidseitigen Muskeln. In der Zuordnung stand `both` nie; es kommt
// nur in einem Kommentar vor.

export type Einordnung =
  /** Eine Muskelgruppe, die eingefaerbt werden kann. */
  | { art: 'gruppe'; name: string }
  /** Teilstueck einer Gruppe — ein Injektionsort, keine Flaeche. */
  | { art: 'teilstueck'; von: string; name: string }
  /** Zeichnet die Figur, traegt keinen Zustand. */
  | { art: 'nicht-muskel'; name: string }

export const EINORDNUNG: Record<string, Einordnung> = {
  // ── 17 Muskelgruppen (einfaerbbar) ────────────────────────────────
  chest: { art: 'gruppe', name: 'Brust' },
  // ══ G-433: Bauch und Flanke aufgeteilt ══════════════════════════
  //
  // **Tom:** *„abs sind die unteren 2 Rectus abdominis, die oberen 6
  // Tendinous Inscriptions / obliques gibt es Serratus Anterior die
  // oberen 3, darunter 5 External Oblique."*
  'rectus-abdominis': { art: 'gruppe', name: 'Gerader Bauchmuskel' },
  'tendinous-inscriptions': { art: 'gruppe', name: 'Sehnenzwischenstuecke' },
  'serratus-anterior': { art: 'gruppe', name: 'Saegemuskel' },
  'external-oblique': { art: 'gruppe', name: 'Aeusserer schraeger Bauchmuskel' },
  biceps: { art: 'gruppe', name: 'Bizeps' },
  // ══ G-433 Nachtrag: die drei Trizeps-Koepfe ════════════════════
  'triceps-longum': { art: 'gruppe', name: 'Trizeps (langer Kopf)' },
  'triceps-lateralis': { art: 'gruppe', name: 'Trizeps (aeusserer Kopf)' },
  'triceps-mediale': { art: 'gruppe', name: 'Trizeps (innerer Kopf)' },
  deltoids: { art: 'gruppe', name: 'Schultern' },
  trapezius: { art: 'gruppe', name: 'Trapezmuskel' },
  // ══ G-433 Nachtrag: Hals ═══════════════════════════════════════
  sternocleidomastoid: { art: 'gruppe', name: 'Kopfwender' },
  nacken: { art: 'gruppe', name: 'Nacken' },
  // `[read]` **Das Kehlstueck ist kein Muskel** — es traegt keinen
  // Zustand, wie Kopf und Haende.
  kehle: { art: 'nicht-muskel', name: 'Kehle' },
  // ══ G-433 Nachtrag: Beuger und Strecker ════════════════════════
  'forearm-flexors': { art: 'gruppe', name: 'Unterarmbeuger' },
  brachioradialis: { art: 'gruppe', name: 'Oberarmspeichenmuskel' },
  'forearm-extensors': { art: 'gruppe', name: 'Unterarmstrecker' },
  'forearm-extensors-ulnar': { art: 'gruppe', name: 'Unterarmstrecker (ulnar)' },
  // ══ G-433: die Adduktorengruppe in ihre drei ═══════════════════
  'adductor-longus': { art: 'gruppe', name: 'Langer Anzieher' },
  'adductor-magnus': { art: 'gruppe', name: 'Grosser Anzieher' },
  'adductor-brevis': { art: 'gruppe', name: 'Kurzer Anzieher' },
  // ══ G-433: Quadrizeps in seine Straenge ═════════════════════════
  //
  // `[cmd]` **Drei Straenge je Schenkel** — am Bild getrennt, auch
  // wenn `muscle_groups` nur `Rectus Femoris` fuehrt.
  'rectus-femoris': { art: 'gruppe', name: 'Gerader Schenkelmuskel' },
  'vastus-lateralis': { art: 'gruppe', name: 'Aeusserer Schenkelmuskel' },
  'vastus-medialis': { art: 'gruppe', name: 'Innerer Schenkelmuskel' },
  // ══ G-433: Wade in zwei Koepfe plus Sehne ═══════════════════════
  'gastrocnemius-lateralis': { art: 'gruppe', name: 'Wadenmuskel (aussen)' },
  'gastrocnemius-medialis': { art: 'gruppe', name: 'Wadenmuskel (innen)' },
  // `[read]` **Eine SEHNE** — Tom: *„sehnen brauchen wir dann
  // anwaehlbar fuer painpoints."*
  achillessehne: { art: 'gruppe', name: 'Achillessehne' },
  // ══ G-430: der Ruecken ist aufgeteilt ════════════════════════════
  //
  // `[cmd]` **Hier standen zwei Gruppen:** `'upper-back'` (*,,Oberer
  // Ruecken (mit Latissimus)"*) und `'lower-back'`.
  //
  // `[cmd]` **G-425 hat jeden Pfad einzeln eingefaerbt und
  // fotografiert:** `upper-back` **buendelte DREI Muskelpaare**,
  // `lower-back` **ZWEI** — als einzige zwei der 23 Flaechen.
  // **`triceps` ist der Gegenbeweis: 8 Pfade, EIN Muskel.**
  //
  // `[read]` **Die Pfade sind unveraendert** — nur ihre Zuordnung.
  'teres-minor': { art: 'gruppe', name: 'Teres minor' },
  'teres-major': { art: 'gruppe', name: 'Teres major' },
  latissimus: { art: 'gruppe', name: 'Latissimus dorsi' },
  'erector-spinae': { art: 'gruppe', name: 'Rueckenstrecker' },
  flanke: { art: 'gruppe', name: 'Flanke' },
  // ══ G-431: Gesaess und Beinbeuger aufgeteilt ════════════════════
  //
  // `[cmd]` **Am Bild bestimmt** (`tafel-gluteal-back.png`,
  // `tafel-hamstring-back.png`): **je Seite zwei verschiedene
  // Muskeln**, nicht ein Muskel mit mehreren Koepfen.
  //
  // `[read]` **Der Gegenbeweis ist `quadriceps`:** dort liegt EINE
  // grosse Masse mit zwei schmalen Raendern — vier Koepfe, EIN
  // Muskel. **Er bleibt zusammen.**
  'gluteus-maximus': { art: 'gruppe', name: 'Gesaessmuskel (gross)' },
  'gluteus-medius': { art: 'gruppe', name: 'Gesaessmuskel (mittel)' },
  'biceps-femoris': { art: 'gruppe', name: 'Zweikoepfiger Schenkelmuskel' },
  semitendinosus: { art: 'gruppe', name: 'Halbsehnenmuskel' },
  // `[cmd]` DIE EINZIGE GRUPPE OHNE RECOVERY-KUERZEL. Die Karte
  // zeichnet den Schienbeinmuskel, `MUSCLE_GROUPS_BODYMAP` (motor.ts:28)
  // fuehrt ihn nicht — deshalb bleibt er grau. **Kein Zuordnungsfehler,
  // sondern eine Luecke auf der Datenseite.** Ein Kuerzel zu erfinden
  // hiesse, eine Muskelgruppe zu erfinden, die das Modul nicht misst.
  tibialis: { art: 'gruppe', name: 'Schienbeinmuskel — ohne Recovery-Kuerzel' },
  // `knees` zeichnet die Kniescheibe. Sie liegt in `MUSKELN`, ist aber
  // Knochen, kein Muskel — deshalb `nicht-muskel`, siehe unten.

  // ── Nicht-Muskeln: sie zeichnen die Figur ─────────────────────────
  // `[cmd]` Sie tragen keinen Zustand und bleiben in der Grundfarbe.
  // Am Bildschirm gemessen: `var(--surface-2)` bzw. der feste
  // Hautton. Das ist beabsichtigt — die Gestaltungsfrage dazu steht
  // im Bericht.
  knees: { art: 'nicht-muskel', name: 'Kniescheibe' },
  head: { art: 'nicht-muskel', name: 'Kopf (fester Hautton)' },
  hair: { art: 'nicht-muskel', name: 'Haare (fester Ton)' },
  hands: { art: 'nicht-muskel', name: 'Haende' },
  ankles: { art: 'nicht-muskel', name: 'Knoechel' },
  feet: { art: 'nicht-muskel', name: 'Fuesse' },

  // ── 16 Injektionsorte: Punkte, keine Flaechen ─────────────────────
  // `[cmd]` Sie liegen in `INJEKTIONS_ORTE` und werden als Kreis ueber
  // die Figur gelegt (`InjektionsKarte`), nicht als Flaeche
  // eingefaerbt. Ein Teilstueck einzufaerben ergaebe einen halben
  // Muskel — `karten-ids.test.ts` verbietet das.
  delt_l: { art: 'teilstueck', von: 'deltoids', name: 'Schulter links' },
  delt_r: { art: 'teilstueck', von: 'deltoids', name: 'Schulter rechts' },
  pec_l: { art: 'teilstueck', von: 'chest', name: 'Brust links' },
  pec_r: { art: 'teilstueck', von: 'chest', name: 'Brust rechts' },
  bicep_l: { art: 'teilstueck', von: 'biceps', name: 'Bizeps links' },
  bicep_r: { art: 'teilstueck', von: 'biceps', name: 'Bizeps rechts' },
  quad_l: { art: 'teilstueck', von: 'quadriceps', name: 'Oberschenkel links' },
  quad_r: { art: 'teilstueck', von: 'quadriceps', name: 'Oberschenkel rechts' },
  // `[cmd]` **G-431: auf die GROSSE Masse** — die Injektion geht in
  // den Gluteus maximus, nicht in die Kappe darueber.
  glute_l: { art: 'teilstueck', von: 'gluteus-maximus', name: 'Gesaess links' },
  glute_r: { art: 'teilstueck', von: 'gluteus-maximus', name: 'Gesaess rechts' },
  // `[cmd]` „Ventrogluteal" ist eine anerkannte Injektionsstelle in der
  // Gesaessregion (vorderer oberer Anteil), **kein Vastus und keine
  // Wade** — die Vermutung im Auftrag traf nicht zu. Die Vorlage
  // beschriftet sie selbst so (koerperkarte-pfade.ts:256).
  // `[cmd]` **Ventrogluteal liegt ueber dem MEDIUS** — das ist
  // gerade der Grund, warum die Stelle als sicher gilt.
  vg_l: { art: 'teilstueck', von: 'gluteus-medius', name: 'Ventrogluteal links' },
  vg_r: { art: 'teilstueck', von: 'gluteus-medius', name: 'Ventrogluteal rechts' },
  // ══ G-430: der Latissimus HAT jetzt eine eigene Flaeche ══════════
  //
  // `[cmd]` **Hier stand:** *„Der Latissimus hat KEINE eigene Flaeche
  // — er steckt in `upper-back` (6 Pfade ueber den ganzen oberen
  // Ruecken)."* `[cmd]` **Das war der Grund fuer G-424** (*,,waehlbar,
  // nicht zeichenbar"*).
  //
  // `[read]` **Die zwei Punkte liegen jetzt ueber IHREM Muskel**,
  // nicht ueber einem Buendel aus dreien.
  lat_l: { art: 'teilstueck', von: 'latissimus', name: 'Latissimus links' },
  lat_r: { art: 'teilstueck', von: 'latissimus', name: 'Latissimus rechts' },
  tricep_l: { art: 'teilstueck', von: 'triceps', name: 'Trizeps links' },
  tricep_r: { art: 'teilstueck', von: 'triceps', name: 'Trizeps rechts' },
}

/** Die IDs je Art — fuer den Bericht und die Pruefung. */
export function nachArt(art: Einordnung['art']): string[] {
  return Object.entries(EINORDNUNG).filter(([, e]) => e.art === art).map(([k]) => k)
}

/**
 * `null` heisst: die Karte kennt diesen Muskel nicht getrennt.
 * Der Wert wird dann nicht dargestellt — **nicht** auf einen
 * benachbarten Muskel gelegt. Eine erfundene Zuordnung waere eine
 * Falschaussage ueber den Koerper.
 */
// `[cmd]` **G-430: der Wert darf eine LISTE sein.** `[read]` **Ein
// Kuerzel, das mehrere Muskeln misst, faerbt mehrere Flaechen** —
// seit `upper-back` in drei Muskeln zerfaellt. **Die alten
// Einzelwerte bleiben gueltig**, `flaechenFuer()` macht aus beidem
// eine Liste.
export const RECOVERY_ZU_KARTE: Record<string, string | string[] | null> = {
  // Deckungsgleich — gleicher Name, gleiche Gruppe.
  chest: 'chest',
  abs: ['rectus-abdominis', 'tendinous-inscriptions'],
  obliques: ['serratus-anterior', 'external-oblique'],
  biceps: 'biceps',
  triceps: ['triceps-longum', 'triceps-lateralis', 'triceps-mediale'],
  forearm: ['forearm-flexors', 'brachioradialis', 'forearm-extensors',
    'forearm-extensors-ulnar'],
  quadriceps: ['rectus-femoris', 'vastus-lateralis', 'vastus-medialis'],
  // `[cmd]` **G-431: ein Kuerzel, zwei Flaechen** — Recovery misst
  // „Beinbeuger" und „Gesaess" als je EINE Gruppe.
  hamstring: ['biceps-femoris', 'semitendinosus'],
  gluteal: ['gluteus-maximus', 'gluteus-medius'],
  calves: ['gastrocnemius-lateralis', 'gastrocnemius-medialis', 'achillessehne'],
  neck: ['sternocleidomastoid', 'nacken'],
  trapezius: 'trapezius',

  // Recovery trennt vorne/hinten, die Karte fuehrt `deltoids` mit
  // `side:'both'` — ein Eintrag, zwei Pfadsaetze. Beide Kuerzel zeigen
  // deshalb auf dieselbe Gruppe; die Karte zeichnet den vorderen Teil
  // in der Vorderansicht, den hinteren in der Rueckansicht.
  front_deltoids: 'deltoids',
  back_deltoids: 'deltoids',

  // `adductor` (Recovery, Einzahl) und `adductors` (Karte, Mehrzahl).
  // Dieselbe Gruppe, anderer Numerus.
  adductor: ['adductor-longus', 'adductor-magnus', 'adductor-brevis'],

  // `[cmd]` UNTERSTRICH GEGEN BINDESTRICH. Die Karte schreibt diese
  // beiden mit Bindestrich (`upper-back`), Recovery mit Unterstrich.
  //
  // **Beinahe falsch eingestuft:** Der erste Durchgang hat sie als
  // „keine Entsprechung" gefuehrt, weil die Suche nach `[a-z_]+` den
  // Bindestrich nicht traf. Am Bildschirm waeren zwei Muskelgruppen
  // dauerhaft grau geblieben, ohne Fehlermeldung. Aufgefallen ist es
  // erst, als die gerenderten Gruppen im Browser gezaehlt wurden.
  // ══ G-430: ein Kuerzel, MEHRERE Flaechen ═════════════════════════
  //
  // `[cmd]` **Hier stand `upper_back: 'upper-back'`** — eine Flaeche,
  // ein Kuerzel. **Seit der Aufteilung gibt es `upper-back` nicht
  // mehr**, sondern drei Muskeln.
  //
  // `[read]` **Recovery misst weiter den oberen Ruecken als EINE
  // Gruppe** — es fragt „wie erholt ist dein oberer Ruecken", nicht
  // „wie erholt ist dein Teres minor". **Also faerbt ein Wert alle
  // drei Teile**, statt willkuerlich einen zu waehlen.
  //
  // `[read]` **Die Alternative waere gewesen, `upper_back` auf
  // `latissimus` zu legen** — dann blieben Teres major und minor
  // dauerhaft grau, ohne Fehlermeldung. **Genau der Fehler, den der
  // Kommentar darueber beschreibt.**
  upper_back: ['latissimus', 'teres-major', 'teres-minor'],
  lower_back: ['erector-spinae', 'flanke'],

  // `abductors` — die Karte fuehrt nur `adductors` (Innenseite). Die
  // Aussenseite fehlt ihr. Nicht auf `gluteal` legen: das ist ein
  // anderer Muskel.
  abductors: null,
}

/**
 * G-430: die Flaechen eines Kuerzels — IMMER als Liste.
 *
 * `[read]` **Eine Stelle, die den Unterschied zwischen `'chest'` und
 * `['latissimus', …]` aufloest** — sonst muesste jeder Aufrufer es
 * selbst tun, und wer es vergisst, faerbt nichts.
 */
export function flaechenFuer(slug: string): string[] {
  const v = RECOVERY_ZU_KARTE[slug]
  if (!v) return []
  return Array.isArray(v) ? v : [v]
}

/** Die Kuerzel, die die Karte nicht darstellen kann. */
export const OHNE_ENTSPRECHUNG = Object.entries(RECOVERY_ZU_KARTE)
  .filter(([, v]) => v === null)
  .map(([k]) => k)

/**
 * Zurueck: Muskel-ID der Karte -> Recovery-Kuerzel.
 *
 * `[cmd]` GEBRAUCHT BEIM KLICK. Die Karte meldet ihre eigene ID
 * (`chest`, `deltoids`); das Muskeldetail-Fenster schlaegt aber in
 * `MUSCLE_STATE` und `MUSCLE_LABEL` nach, und die sind auf
 * Recovery-Kuerzel gebaut (modale.tsx:340, 354). Ohne diese Richtung
 * oeffnet ein Klick auf die Schulter ein leeres Fenster.
 *
 * `deltoids` hat zwei Urbilder — vorne und hinten. Genommen wird
 * `front_deltoids`: die Karte kann beim Klick nicht sagen, welche
 * Ansicht gemeint war, und vorne ist die haeufigere Auswahl. `[read]`
 * Das ist eine Entscheidung, keine Messung — wenn es stoert, trennt
 * man den Klick nach Ansicht.
 */
export const KARTE_ZU_RECOVERY: Record<string, string> = (() => {
  const k: Record<string, string> = {}
  for (const slug of Object.keys(RECOVERY_ZU_KARTE)) {
    // `[cmd]` **G-430: ueber `flaechenFuer`, nicht ueber den Rohwert**
    // — `upper_back` traegt jetzt drei Flaechen, und alle drei
    // muessen zurueckfinden. **Sonst oeffnete ein Klick auf den
    // Latissimus ein leeres Fenster.**
    for (const id of flaechenFuer(slug)) {
      if (k[id]) continue // erster gewinnt — front_deltoids vor back_deltoids
      k[id] = slug
    }
  }
  return k
})()

/**
 * Rechnet Recovery-Werte auf die Karte um.
 *
 * `werte`: Prozent je Recovery-Kuerzel. Rueckgabe: was
 * `ErmuedungsKarte` erwartet.
 *
 * `[cmd]` ACHTUNG, UMGEKEHRTE RICHTUNG: Recovery fuehrt
 * BEREITSCHAFT (100 = erholt), die Karte ERMUEDUNG (100 = platt).
 * `module-recovery-v2.jsx:68` faerbt `>= 80` gruen, die Karte faerbt
 * `<= 25` gruen. Ohne diese Umrechnung stuende der Koerper auf Rot,
 * wenn er erholt ist.
 */
export function alsErmuedung(
  werte: Record<string, number | null | undefined>,
): Array<{ id: string; fatigue: number }> {
  const raus: Array<{ id: string; fatigue: number }> = []
  const gesehen = new Set<string>()
  for (const [slug, wert] of Object.entries(werte)) {
    if (wert == null) continue
    // `[cmd]` **G-430: ein Kuerzel kann MEHRERE Flaechen faerben** —
    // `upper_back` misst den oberen Ruecken als Gruppe und faerbt
    // Latissimus, Teres major und Teres minor.
    for (const id of flaechenFuer(slug)) {
      if (!MUSKELN[id]) continue
      // Beide Deltoid-Kuerfel zeigen auf dieselbe Gruppe. Der schlechtere
      // Wert gewinnt — eine Karte, die den besseren zeigt, beruhigt
      // faelschlich.
      const ermuedung = 100 - wert
      const schon = raus.find(r => r.id === id)
      if (schon) {
        schon.fatigue = Math.max(schon.fatigue, ermuedung)
        continue
      }
      gesehen.add(id)
      raus.push({ id, fatigue: ermuedung })
    }
  }
  return raus
}

/**
 * Der Check-in misst Muskelkater in Stufen 0-3.
 *
 * `[cmd]` `module-recovery-v2.jsx:302` — dort ist 0 = kein Kater, also
 * bereits die Ermuedungsrichtung; keine Umkehr noetig. Die vier Farben
 * sind die des Entwurfs (tab-checkin.tsx), nicht die Ermuedungsampel —
 * die Stufe 1 „mild" ist dort gruenlich (`--acc-recov`), nicht gelb.
 */
const KATER_FARBE = [
  'var(--surface-2)',   // 0 none
  'var(--acc-recov)',   // 1 mild
  'var(--warn)',        // 2 moderate
  'var(--neg)',         // 3 severe
]

export function katerAlsMuskeln(
  werte: Record<string, number | null | undefined>,
): Array<{ id: string; color: string; opacity: number }> {
  const raus: Array<{ id: string; color: string; opacity: number; stufe: number }> = []
  for (const [slug, wert] of Object.entries(werte)) {
    if (wert == null) continue
    // `[cmd]` **G-430: wie oben — ein Kuerzel, mehrere Flaechen.**
    for (const id of flaechenFuer(slug)) {
      if (!MUSKELN[id]) continue
      const stufe = Math.min(Math.max(Math.round(wert), 0), 3)
      const schon = raus.find(r => r.id === id)
      // Deltoids: der schlechtere Wert gewinnt, wie oben.
      if (schon) {
        if (stufe > schon.stufe) {
          schon.stufe = stufe
          schon.color = KATER_FARBE[stufe]
        }
        continue
      }
      raus.push({ id, color: KATER_FARBE[stufe], opacity: 0.85, stufe })
    }
  }
  return raus.map(({ id, color, opacity }) => ({ id, color, opacity }))
}
