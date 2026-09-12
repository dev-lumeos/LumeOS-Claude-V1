// G-432/A1+A2 — was zeigt JEDER Pfad der Koerperkarte?
//
// ══ SCHRITT 1 DES AUFTRAGS ══════════════════════════════════════════
//
// **Tom:** *„1. schauen was die grafik an einzelmuskeln hergibt."*
//
// `[cmd]` **158 Pfade in 28 Flaechen** — gemessen 2026-09-12, zweimal
// unabhaengig (`tools/_g431-zaehlen.mjs` und eine Zaehlung der
// Zeichenketten). **Der Auftrag nennt 160** — die Zahl stammt aus der
// Zeit vor den Aufteilungen; **158 ist der Stand, alle verschieden.**
//
// `[cmd]` **Je Flaeche eine Tafel** in `docs/bilder/g431/` — alle
// Pfade nebeneinander, je eigene Farbe, plus je ein Einzelbild.
//
// ══ WAS EIN PFAD SEIN KANN ══════════════════════════════════════════
//
// `[read]` **Der Auftrag verlangt die Unterscheidung ausdruecklich:**
// *„Wo ein Pfad KEINEN eigenen Muskel zeigt (Segment, Sehne,
// Schattierung), wird das so benannt."*
//
//     muskel        der Pfad zeigt EINEN benannten Muskel
//     seite         derselbe Muskel, andere Koerperhaelfte
//     segment       Teil EINES Muskels ohne eigenen Namen
//                   (Bauchsegmente, Muskelkoepfe)
//     sehne         Sehne oder Sehnenplatte
//     schattierung  Zeichenebene ohne anatomische Entsprechung
//     umriss        Figur, kein Muskel
//
// `[cmd]` **Der Pruefstein bleibt `training.muscle_groups`** — wo es
// keinen Namen gibt, ist es kein `muskel`.

/** Was ein einzelner Pfad darstellt. */
export type PfadArt =
  | 'muskel' | 'seite' | 'segment' | 'sehne' | 'schattierung' | 'umriss'

export type Pfadgruppe = {
  /** Die Flaeche, zu der die Pfade gehoeren. */
  flaeche: string
  /** `front`, `back` — die Ansicht. */
  ansicht: 'front' | 'back'
  /** Wieviele Pfade. */
  pfade: number
  art: PfadArt
  /** Der Name in `training.muscle_groups`, oder `null`. */
  name: string | null
  /** Was im Bild steht — die Begruendung. */
  bild: string
}

/**
 * Alle 158 Pfade, nach Flaeche und Ansicht.
 *
 * `[cmd]` **Jede Zeile am Bild bestimmt** (`docs/bilder/g431/`),
 * nicht aus der Anatomie abgeleitet. **Die Summe der `pfade` MUSS
 * 158 ergeben** — ein Waechter zaehlt sie.
 */
export const PFADNAMEN: Pfadgruppe[] = [
  // ══ Rumpf, vorne ═══════════════════════════════════════════════
  { flaeche: 'chest', ansicht: 'front', pfade: 2, art: 'seite',
    name: 'Chest', bild: 'zwei Brusthälften, je eine Platte' },
  { flaeche: 'abs', ansicht: 'front', pfade: 8, art: 'segment',
    name: 'Abdominals',
    bild: '2×4-Raster auf EINER Bauchplatte — die Felder sind '
      + 'Sehnenzwischenstücke des Rectus abdominis' },
  { flaeche: 'obliques', ansicht: 'front', pfade: 16, art: 'segment',
    name: 'Obliques',
    bild: 'acht gezackte Keile je Flanke — die Verzahnung des '
      + 'Obliquus externus, keine sechzehn Muskeln' },
  // ══ Arme ═══════════════════════════════════════════════════════
  { flaeche: 'biceps', ansicht: 'front', pfade: 2, art: 'seite',
    name: 'Biceps', bild: 'je Arm ein Bauch an der Vorderseite' },
  { flaeche: 'triceps', ansicht: 'front', pfade: 2, art: 'seite',
    name: 'Triceps', bild: 'je Arm ein Streifen an der Rückseite, von vorn sichtbar' },
  { flaeche: 'triceps', ansicht: 'back', pfade: 6, art: 'segment',
    name: 'Triceps',
    bild: 'je Arm drei Streifen — die drei Köpfe; sie haben KEINEN '
      + 'eigenen Namen in muscle_groups' },
  { flaeche: 'forearm', ansicht: 'front', pfade: 6, art: 'segment',
    name: 'Forearms',
    bild: 'je Arm drei Streifen auf der Beugerseite — die 13 '
      + 'einzelnen Namen zeichnet die Vorlage nicht' },
  { flaeche: 'forearm', ansicht: 'back', pfade: 8, art: 'segment',
    name: 'Forearms', bild: 'je Arm vier Streifen auf der Streckerseite' },
  // ══ Schulter und Hals ══════════════════════════════════════════
  { flaeche: 'deltoids', ansicht: 'front', pfade: 2, art: 'seite',
    name: 'Deltoids', bild: 'je Schulter eine Kappe, vordere Portion' },
  { flaeche: 'deltoids', ansicht: 'back', pfade: 2, art: 'seite',
    name: 'Deltoids', bild: 'je Schulter eine Kappe, hintere Portion' },
  { flaeche: 'neck', ansicht: 'front', pfade: 5, art: 'segment',
    name: 'Neck Muscles',
    bild: 'zwei Stränge je Seite plus ein Kehlstück — der '
      + 'Sternocleidomastoideus mit seinen zwei Köpfen' },
  { flaeche: 'neck', ansicht: 'back', pfade: 2, art: 'seite',
    name: 'Neck Muscles', bild: 'je Seite ein Nackenstreifen' },
  { flaeche: 'trapezius', ansicht: 'front', pfade: 2, art: 'seite',
    name: 'Trapezius', bild: 'je Seite der Schulteransatz, von vorn' },
  { flaeche: 'trapezius', ansicht: 'back', pfade: 2, art: 'seite',
    name: 'Trapezius', bild: 'je Seite das absteigende Dreieck vom Nacken' },
  // ══ Ruecken — die Aufteilungen aus G-430 ═══════════════════════
  { flaeche: 'latissimus', ansicht: 'back', pfade: 2, art: 'seite',
    name: 'latissimus dorsi',
    bild: 'je Seite das breite Dreieck von der Achsel zur Taille' },
  { flaeche: 'teres-major', ansicht: 'back', pfade: 2, art: 'seite',
    name: 'Teres Major', bild: 'je Seite die Sichel am Außenrand des Schulterblatts' },
  { flaeche: 'teres-minor', ansicht: 'back', pfade: 2, art: 'seite',
    name: 'Teres Minor', bild: 'je Seite das Dreieck oben am Schulterblatt' },
  { flaeche: 'erector-spinae', ansicht: 'back', pfade: 2, art: 'seite',
    name: 'erector spinae', bild: 'die zwei Bänder neben der Wirbelsäule' },
  { flaeche: 'flanke', ansicht: 'back', pfade: 2, art: 'seite',
    name: null,
    bild: 'je Seite ein Fleck seitlich über der Hüfte — KEIN eigener '
      + 'Name in muscle_groups (G-430)' },
  // ══ Beine, vorne ═══════════════════════════════════════════════
  { flaeche: 'quadriceps', ansicht: 'front', pfade: 6, art: 'segment',
    name: 'Quadriceps',
    bild: 'je Schenkel eine große Masse und zwei schmale Ränder — '
      + 'nur der Rectus femoris hat einen Namen, die drei Vastus nicht' },
  { flaeche: 'adductors', ansicht: 'front', pfade: 6, art: 'segment',
    name: 'Adductors',
    bild: 'je Seite drei überlappende Streifen aus der Leiste' },
  { flaeche: 'adductors', ansicht: 'back', pfade: 2, art: 'seite',
    name: 'Adductors', bild: 'je Seite die Innenseite von hinten' },
  { flaeche: 'tibialis', ansicht: 'front', pfade: 2, art: 'seite',
    name: 'Tibialis', bild: 'je Unterschenkel der Schienbeinmuskel' },
  { flaeche: 'calves', ansicht: 'front', pfade: 4, art: 'segment',
    name: 'Calves', bild: 'je Unterschenkel zwei Ränder, von vorn sichtbar' },
  // ══ Beine, hinten ══════════════════════════════════════════════
  { flaeche: 'calves', ansicht: 'back', pfade: 8, art: 'segment',
    name: 'Calves',
    bild: 'je Wade zwei Bäuche (die Gastrocnemius-Köpfe) plus zwei '
      + 'Sehnenläufer zur Ferse' },
  { flaeche: 'biceps-femoris', ansicht: 'back', pfade: 4, art: 'segment',
    name: 'Biceps Femoris', bild: 'je Seite zwei Streifen am äußeren Oberschenkel' },
  { flaeche: 'semitendinosus', ansicht: 'back', pfade: 4, art: 'segment',
    name: 'Semitendinosus', bild: 'je Seite zwei Streifen am inneren Oberschenkel' },
  { flaeche: 'gluteus-maximus', ansicht: 'back', pfade: 2, art: 'seite',
    name: 'Gluteus Maximus', bild: 'je Seite die große Gesäßmasse' },
  { flaeche: 'gluteus-medius', ansicht: 'back', pfade: 2, art: 'seite',
    name: 'Gluteus Medius', bild: 'je Seite die kleine Kappe oben außen' },
  // ══ Umrisse — kein Muskel ══════════════════════════════════════
  { flaeche: 'knees', ansicht: 'front', pfade: 4, art: 'umriss',
    name: null, bild: 'Kniescheiben und ihre Ränder — Knochen' },
  { flaeche: 'hands', ansicht: 'front', pfade: 12, art: 'umriss',
    name: null, bild: 'Finger und Handflächen — Umriss, kein Muskel' },
  { flaeche: 'hands', ansicht: 'back', pfade: 11, art: 'umriss',
    name: null, bild: 'Finger und Handrücken — Umriss, kein Muskel' },
  { flaeche: 'ankles', ansicht: 'front', pfade: 4, art: 'umriss',
    name: null, bild: 'Knöchel von vorn — Gelenk, kein Muskel' },
  { flaeche: 'ankles', ansicht: 'back', pfade: 2, art: 'umriss',
    name: null, bild: 'Knöchel von hinten — Gelenk, kein Muskel' },
  { flaeche: 'feet', ansicht: 'front', pfade: 4, art: 'umriss',
    name: null, bild: 'Füße und Zehen von vorn — Umriss, kein Muskel' },
  { flaeche: 'feet', ansicht: 'back', pfade: 2, art: 'umriss',
    name: null, bild: 'Fersen von hinten — Umriss, kein Muskel' },
  { flaeche: 'head', ansicht: 'front', pfade: 1, art: 'umriss',
    name: null, bild: 'Kopf von vorn — fester Hautton, nie eingefärbt' },
  { flaeche: 'head', ansicht: 'back', pfade: 1, art: 'umriss',
    name: null, bild: 'Hinterkopf — fester Hautton, nie eingefärbt' },
  { flaeche: 'hair', ansicht: 'front', pfade: 1, art: 'umriss',
    name: null, bild: 'Haare von vorn — fester Ton, nie eingefärbt' },
  { flaeche: 'hair', ansicht: 'back', pfade: 1, art: 'umriss',
    name: null, bild: 'Haare von hinten — fester Ton, nie eingefärbt' },
]

/** Die Summe aller Pfade — muss 158 ergeben. */
export function pfadSumme(): number {
  return PFADNAMEN.reduce((a, p) => a + p.pfade, 0)
}

/** Je Art: wieviele Pfade. */
export function nachArt(): Record<PfadArt, number> {
  const aus = {
    muskel: 0, seite: 0, segment: 0, sehne: 0, schattierung: 0, umriss: 0,
  } as Record<PfadArt, number>
  for (const p of PFADNAMEN) aus[p.art] += p.pfade
  return aus
}
