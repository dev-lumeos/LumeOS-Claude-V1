// G-432 — welche EBENE der Hierarchie zeigt eine Kartenflaeche?
//
// ══ DIE REGEL, DIE HIER BERICHTIGT WIRD ═════════════════════════════
//
// **Tom, 2026-09-08:** *„quadrizeps ist eine muskelgruppe und hat x
// muskeln. was ist daran so schwer zu verstehen?"*
//
// `[cmd]` **G-425 formulierte:** *„EIN Muskel, mehrere Pfade ->
// zusammenlassen"*, **begruendet mit** *„triceps hat drei Koepfe und
// bleibt EIN Muskel"*.
//
// `[read]` **Das ist anatomisch falsch, und es wurde dreimal
// weitergereicht** — G-425, C-468, G-431. **G-431 hat daraufhin
// `quadriceps` zusammengelassen mit dem Satz *„vier Koepfe, ein
// Muskel"*.** `[read]` **Die Messung war richtig, das Urteil folgte
// einer falschen Regel.**
//
// ══ DIE RICHTIGE FRAGE ══════════════════════════════════════════════
//
// `[read]` **Nicht** *„ist das ein Muskel?"* **sondern** *„welche
// Ebene der Hierarchie zeigt dieser Pfad?"*
//
//     ein Pfad zeigt eine Gruppe     -> die Gruppe ist die Flaeche,
//                                       die Kinder sind Kinder
//     ein Pfad zeigt einen Muskel    -> der Muskel ist die Flaeche
//     mehrere Pfade, derselbe Muskel -> zusammenlassen
//       (Seiten, Segmente)
//
// `[cmd]` **DER PRUEFSTEIN: fuehrt `training.muscle_groups` einen
// Namen dafuer?** **Wenn nein, wird nicht geteilt** — sonst entstuende
// ein Name, den LumeOS nicht kennt.
//
// ══ WIE DIESE DATEI ENTSTANDEN IST ══════════════════════════════════
//
// `[cmd]` **Jede Zeile ist gemessen** (`tools/_g432-ebenen.mjs`,
// 2026-09-12) — gegen die laufende `training.muscle_groups` mit
// 95 Namen, nicht gegen die Anatomie.

/** Die Ebene, auf der eine Kartenflaeche in `muscle_groups` steht. */
export type Ebene = {
  /** Der Name in `training.muscle_groups` — `null`, wenn es keinen gibt. */
  name: string | null
  /** Der Weg von der Wurzel, z. B. `Legs > Lower Legs > Calves`. */
  weg: string[]
  /**
   * `gruppe`  — die Flaeche steht fuer eine Gruppe MIT Kindern
   * `muskel`  — die Flaeche steht fuer einen einzelnen Muskel (Blatt)
   * `umriss`  — kein Muskel, kein Name
   *
   * ══ G-432: `art` folgt den KINDERN, nicht der Tiefe ═══════════
   *
   * `[cmd]` **Die Probe `tools/_g432-pruefen.mjs` hat das erzwungen:**
   * ich hatte `calves` als `muskel` gefuehrt, **weil es ein KIND von
   * `Lower Legs` ist** — und die Probe hielt dagegen: *„nach 1
   * Kindern erwartet gruppe"*.
   *
   * `[read]` **Beides war wahr, und genau das war der Fehler** —
   * *„ist es ein Kind?"* und *„hat es Kinder?"* sind zwei Fragen.
   * **`art` beantwortet nur die zweite**; die erste steht in `weg`.
   */
  art: 'gruppe' | 'muskel' | 'sehne' | 'umriss'
  /**
   * Die Ebene im Baum — `weg.length`.
   *
   * `[read]` **Eine Flaeche kann Kind UND Gruppe sein:** `Calves`
   * steht auf Ebene 3 unter `Lower Legs` und hat selbst `Soleus`.
   */
  ebene?: number
  /** Die Kinder in `muscle_groups`, falls es welche gibt. */
  kinder: string[]
  /**
   * Warum die Flaeche NICHT weiter geteilt ist.
   *
   * `[read]` **Bei `art: 'gruppe'` steht hier der Grund** — und er
   * ist immer derselbe: die Vorlage zeichnet die Kinder nicht
   * getrennt, oder `muscle_groups` fuehrt sie nicht.
   */
  grund?: string
}

/**
 * Je Kartenflaeche ihre Ebene.
 *
 * `[cmd]` **Gemessen 2026-09-12** gegen `training.muscle_groups`.
 * `[read]` **Kein Name ist erfunden** — steht keiner in der
 * Datenbank, ist `name` gleich `null`.
 */
export const EBENEN: Record<string, Ebene> = {
  // ══ Beine ══════════════════════════════════════════════════════
  //
  // `[cmd]` **`Quadriceps` ist eine GRUPPE** — Ebene 2 unter `Legs`,
  // mit einem Kind: `Rectus Femoris`. **Die drei Vastus fehlen in
  // `muscle_groups`** — fuer LumeOS gibt es sie nicht.
  //
  // `[cmd]` **Am Bild** (`tafel-quadriceps-front.png`): je Schenkel
  // eine grosse Masse (der Rectus femoris) und zwei schmale Raender.
  // `[read]` **Die Raender haben keinen Namen** — also bleibt die
  // Flaeche ganz, aber sie ist eine GRUPPE, kein Muskel.
  // `[cmd]` **`Calves` ist ein KIND** — Ebene 3 unter
  // `Legs > Lower Legs`. **Die Gruppe ist `Lower Legs`**, und sie
  // fuehrt ausserdem `Anterior Tibialis`, `Tibialis Posterior`,
  // `Peroneals`.
  //
  // `[cmd]` **`Calves` hat selbst ein Kind: `Soleus`** — und der
  // liegt UNTER dem Gastrocnemius, die Vorlage zeichnet ihn nicht.
  // `[read]` **`calves` ist BEIDES** — Kind von `Lower Legs` (Ebene 3)
  // und Gruppe ueber `Soleus`. **`art` nennt die Kinder, `weg` den
  // Elternteil.**
  tibialis: {
    name: 'Tibialis', weg: ['Legs', 'Lower Legs', 'Tibialis'], art: 'muskel',
    kinder: [],
  },
  // ══ Arme ═══════════════════════════════════════════════════════
  //
  // `[cmd]` **`Triceps` ist ein BLATT** — Ebene 2 unter `Arms`, ohne
  // Kinder. **Die drei Koepfe haben KEINEN Namen in
  // `muscle_groups`.**
  //
  // `[read]` **Hier lag der Ursprung der falschen Regel** — und
  // ausgerechnet hier war das Urteil richtig, aus dem falschen Grund:
  // **nicht weil ein Muskel mit Koepfen ein Muskel bleibt, sondern
  // weil die Koepfe keinen Namen haben.**
  biceps: {
    name: 'Biceps', weg: ['Arms', 'Biceps'], art: 'gruppe',
    kinder: ['Brachialis'],
    grund: 'Brachialis liegt unter dem Bizeps — die Vorlage zeichnet '
      + 'zwei Pfade, einen je Arm.',
  },
  // `[cmd]` **`Forearms` ist eine GRUPPE mit acht Enkeln** —
  // `Forearm Flexors` (8 Kinder) und `Forearm Extensors` (5).
  //
  // `[read]` **Die Vorlage trennt sie ueber die ANSICHT:** die
  // Beuger liegen vorne, die Strecker hinten. `[read]` **Die
  // einzelnen Namen zeichnet sie nicht** — vier Streifen je Arm sind
  // Schattierung, kein `Extensor Carpi Ulnaris`.
  // ══ Rumpf ══════════════════════════════════════════════════════
  //
  // `[cmd]` **`Abdominals` ist eine GRUPPE** — Ebene 2 unter `Core`,
  // mit `Lower Abs` und `Rectus Abdominis`.
  //
  // `[cmd]` **Am Bild** (`tafel-abs-front.png`): **ein 2x4-Raster auf
  // EINER Bauchplatte.** `[read]` **Die acht Felder sind
  // Sehnenzwischenstuecke des Rectus** — sie haben keinen eigenen
  // Namen. **Das ist der Fall, den der Auftrag selbst als richtig
  // benennt.**
  // ══ Hals, Brust, Schulter ══════════════════════════════════════
  //
  // `[cmd]` **`Neck Muscles` ist eine WURZEL** — Ebene 1, mit drei
  // Kindern. **Am Bild zwei Straenge je Seite, die am Brustbein
  // zusammenlaufen** — das ist der Sternocleidomastoideus.
  chest: {
    name: 'Chest', weg: ['Chest'], art: 'gruppe',
    kinder: ['Pectoralis Major', 'Upper Chest'],
    grund: 'Zwei Pfade, einer je Brusthälfte — die Vorlage trennt '
      + 'Pectoralis major und Upper chest nicht.',
  },
  deltoids: {
    name: 'Deltoids', weg: ['Shoulders', 'Deltoids'], art: 'gruppe',
    kinder: ['Front Shoulders', 'Rear Deltoids'],
    grund: 'Vorne und hinten trennt die ANSICHT, nicht die Fläche.',
  },
  trapezius: {
    name: 'Trapezius', weg: ['Back', 'Upper Back', 'Trapezius'],
    art: 'muskel', kinder: [],
  },

  // ══ G-433: die Aufteilung nach Toms Auftrag ════════════════════
  //
  // **Tom, 2026-09-12:** *„ja alles trennen was unsere grafik
  // hergibt."*
  //
  // `[cmd]` **Fuenf Flaechen wurden zu vierzehn** — je Strang eine
  // eigene, anwaehlbare Flaeche. **Kein Pfad neu gezeichnet.**
  //
  // `[read]` **Wo `muscle_groups` den Namen fuehrt, steht er.
  // Wo nicht, ist `name: null`** — die Luecke wird ausgewiesen,
  // nicht erfunden (Codex traegt sie nach).
  'rectus-femoris': {
    name: 'Rectus Femoris', weg: ['Legs', 'Quadriceps', 'Rectus Femoris'],
    art: 'muskel', kinder: [],
  },
  'vastus-lateralis': {
    name: 'Vastus Lateralis',
    weg: ['Legs', 'Quadriceps', 'Vastus Lateralis'],
    art: 'muskel', kinder: [],
    grund: 'C-482 hat diesen Namen geliefert — der frühere Vermerk „hat in muscle_groups keinen Namen" ist überholt. Eigenes Volumen: 0 (C-487), der Wert wird deshalb von der Gruppe geliehen und in der Liste als solcher ausgewiesen.',
  },
  'vastus-medialis': {
    name: 'Vastus Medialis',
    weg: ['Legs', 'Quadriceps', 'Vastus Medialis'],
    art: 'muskel', kinder: [],
    grund: 'C-482 hat diesen Namen geliefert — der frühere Vermerk „hat in muscle_groups keinen Namen" ist überholt. Eigenes Volumen: 0 (C-487), der Wert wird deshalb von der Gruppe geliehen und in der Liste als solcher ausgewiesen.',
  },
  'adductor-longus': {
    name: 'Adductor Longus', weg: ['Legs', 'Adductors', 'Adductor Longus'],
    art: 'muskel', kinder: [],
  },
  'adductor-magnus': {
    name: 'adductor magnus', weg: ['Legs', 'Adductors', 'adductor magnus'],
    art: 'muskel', kinder: [],
  },
  'adductor-brevis': {
    name: 'adductor brevis', weg: ['Legs', 'Adductors', 'adductor brevis'],
    art: 'muskel', kinder: [],
  },
  'gastrocnemius-lateralis': {
    name: 'Gastrocnemius Lateral Head',
    weg: ['Legs', 'Lower Legs', 'Calves', 'Gastrocnemius Lateral Head'],
    art: 'muskel', kinder: [],
    grund: 'C-482 hat diesen Namen geliefert — der frühere Vermerk „hat in muscle_groups keinen Namen" ist überholt. Eigenes Volumen: 0 (C-487), der Wert wird deshalb von der Gruppe geliehen und in der Liste als solcher ausgewiesen.',
  },
  'gastrocnemius-medialis': {
    name: 'Gastrocnemius Medial Head',
    weg: ['Legs', 'Lower Legs', 'Calves', 'Gastrocnemius Medial Head'],
    art: 'muskel', kinder: [],
    grund: 'C-482 hat diesen Namen geliefert — der frühere Vermerk „hat in muscle_groups keinen Namen" ist überholt. Eigenes Volumen: 0 (C-487), der Wert wird deshalb von der Gruppe geliehen und in der Liste als solcher ausgewiesen.',
  },
  // `[read]` **Eine SEHNE, kein Muskel** — Tom: *„sehnen brauchen wir
  // dann anwaehlbar fuer painpoints."*
  achillessehne: {
    name: null, weg: [], art: 'sehne', kinder: [],
    grund: 'Sehne, kein Muskel — anwählbar für Painpoints.',
  },
  'rectus-abdominis': {
    name: 'Rectus Abdominis', weg: ['Core', 'Abdominals', 'Rectus Abdominis'],
    art: 'muskel', kinder: [],
  },
  // `[cmd]` **Toms Zuordnung:** die sechs oberen Kaestchen sind
  // Sehnenzwischenstuecke, kein eigener Muskel.
  'tendinous-inscriptions': {
    name: null, weg: [], art: 'sehne', kinder: [],
    grund: 'Sehnenzwischenstücke des Rectus abdominis — anwählbar für '
      + 'Painpoints, kein eigener Muskel.',
  },
  'serratus-anterior': {
    name: 'Serratus Anterior',
    weg: ['Shoulders', 'Serratus Anterior'],
    art: 'muskel', kinder: [],
    grund: 'C-482 hat diesen Namen geliefert — der frühere Vermerk „hat in muscle_groups keinen Namen" ist überholt. Eigenes Volumen: 0 (C-487), der Wert wird deshalb von der Gruppe geliehen und in der Liste als solcher ausgewiesen.',
  },
  'external-oblique': {
    name: 'External Oblique',
    weg: ['Core', 'Obliques', 'External Oblique'],
    art: 'muskel', kinder: [],
    grund: 'C-482 hat diesen Namen geliefert — der frühere Vermerk „hat in muscle_groups keinen Namen" ist überholt. Eigenes Volumen: 0 (C-487), der Wert wird deshalb von der Gruppe geliehen und in der Liste als solcher ausgewiesen.',
  },

  // ══ G-433 Nachtrag: Arme und Hals ══════════════════════════════
  //
  // **Tom:** *„triceps, forearms, neck sind nicht getrennt."*
  //
  // `[cmd]` **Am Bild: je Arm drei Trizeps-Koepfe, drei Beuger-
  // und vier Streckerstraenge, am Hals zwei Straenge je Seite.**
  //
  // `[cmd]` **`Triceps` ist in `muscle_groups` ein BLATT** — die
  // drei Koepfe haben dort keinen Namen. **Die Grafik trennt sie
  // trotzdem**, also werden sie getrennt und die Luecke ausgewiesen.
  'triceps-longum': {
    name: 'Triceps Brachii Long Head',
    weg: ['Arms', 'Triceps', 'Triceps Brachii Long Head'],
    art: 'muskel', kinder: [],
    grund: 'C-482 hat diesen Namen geliefert — der frühere Vermerk „hat in muscle_groups keinen Namen" ist überholt. Eigenes Volumen: 0 (C-487), der Wert wird deshalb von der Gruppe geliehen und in der Liste als solcher ausgewiesen.',
  },
  'triceps-lateralis': {
    name: 'Triceps Brachii Lateral Head',
    weg: ['Arms', 'Triceps', 'Triceps Brachii Lateral Head'],
    art: 'muskel', kinder: [],
    grund: 'C-482 hat diesen Namen geliefert — der frühere Vermerk „hat in muscle_groups keinen Namen" ist überholt. Eigenes Volumen: 0 (C-487), der Wert wird deshalb von der Gruppe geliehen und in der Liste als solcher ausgewiesen.',
  },
  'triceps-mediale': {
    name: 'Triceps Brachii Medial Head',
    weg: ['Arms', 'Triceps', 'Triceps Brachii Medial Head'],
    art: 'muskel', kinder: [],
    grund: 'C-482 hat diesen Namen geliefert — der frühere Vermerk „hat in muscle_groups keinen Namen" ist überholt. Eigenes Volumen: 0 (C-487), der Wert wird deshalb von der Gruppe geliehen und in der Liste als solcher ausgewiesen.',
  },
  // `[cmd]` **Hier fuehrt `muscle_groups` die Namen** — Beuger und
  // Strecker als Untergruppen von `Forearms`.
  'forearm-flexors': {
    name: 'Forearm Flexors', weg: ['Arms', 'Forearms', 'Forearm Flexors'],
    art: 'gruppe', kinder: ['Wrist Flexors', 'Flexor Carpi Radialis',
      'Flexor Carpi Ulnaris', 'Flexor Digitorum Profundus',
      'Fingers Flexors', 'Grip Muscles', 'Palmaris Longus', 'Pronator Teres'],
    grund: 'Die Vorlage zeichnet die Beugerseite als Bündel — die acht '
      + 'einzelnen Namen trennt sie nicht.',
  },
  brachioradialis: {
    name: 'Brachioradialis', weg: ['Arms', 'Forearms', 'Brachioradialis'],
    art: 'muskel', kinder: [],
  },
  'forearm-extensors': {
    name: 'Forearm Extensors', weg: ['Arms', 'Forearms', 'Forearm Extensors'],
    art: 'gruppe', kinder: ['Wrist Extensors', 'Extensor Carpi Radialis',
      'Extensor Carpi Radialis Brevis', 'Extensor Carpi Radialis Longus',
      'Extensor Carpi Ulnaris'],
    grund: 'Die Vorlage zeichnet die Streckerseite als Bündel — die fünf '
      + 'einzelnen Namen trennt sie nicht.',
  },
  'forearm-extensors-ulnar': {
    name: null, weg: [], art: 'muskel', kinder: [],
    grund: 'Der ulnare Streckerstrang — die Vorlage zeichnet ihn '
      + 'getrennt, muscle_groups führt ihn nicht einzeln.',
  },
  // `[cmd]` **Am Hals: zwei Straenge je Seite** — die zwei Koepfe
  // des Sternocleidomastoideus, plus das Kehlstueck dazwischen.
  sternocleidomastoid: {
    name: 'Sternocleidomastoid', weg: ['Neck Muscles', 'Sternocleidomastoid'],
    art: 'muskel', kinder: [],
  },
  kehle: {
    name: null, weg: [], art: 'umriss', kinder: [],
    grund: 'Das Kehlstück zwischen den Strängen — kein Muskel.',
  },
  nacken: {
    name: null, weg: [], art: 'muskel', kinder: [],
    grund: 'Die Nackenansicht — muscle_groups führt `Scalenes` und '
      + '`splenius capitis`, die Vorlage trennt sie nicht.',
  },
  // ══ Umrisse — kein Muskel, kein Name ═══════════════════════════
  //
  // `[cmd]` **Gemessen: `muscle_groups` fuehrt KEINEN von ihnen.**
  // `[read]` **Das ist richtig so** — sie zeichnen die Figur.
  knees: { name: null, weg: [], art: 'umriss', kinder: [] },
  hands: { name: null, weg: [], art: 'umriss', kinder: [] },
  ankles: { name: null, weg: [], art: 'umriss', kinder: [] },
  feet: { name: null, weg: [], art: 'umriss', kinder: [] },
  head: { name: null, weg: [], art: 'umriss', kinder: [] },
  hair: { name: null, weg: [], art: 'umriss', kinder: [] },
  // ══ Die aufgeteilten aus G-430 und G-431 ═══════════════════════
  //
  // `[read]` **Sie sind BLAETTER** — einzelne Muskeln mit eigenem
  // Namen, deshalb wurden sie ueberhaupt geteilt.
  latissimus: {
    name: 'latissimus dorsi', weg: ['Back', 'latissimus dorsi'],
    art: 'muskel', kinder: [],
  },
  'teres-major': {
    name: 'Teres Major', weg: ['Back', 'Upper Back', 'Teres Major'],
    art: 'muskel', kinder: [],
  },
  'teres-minor': {
    name: 'Teres Minor', weg: ['Shoulders', 'Rotator Cuff', 'Teres Minor'],
    art: 'muskel', kinder: [],
  },
  'erector-spinae': {
    name: 'erector spinae', weg: ['Back', 'Lower Back', 'erector spinae'],
    art: 'muskel', kinder: [],
  },
  'gluteus-maximus': {
    name: 'Gluteus Maximus', weg: ['Legs', 'Glutes', 'Gluteus Maximus'],
    art: 'muskel', kinder: [],
  },
  'gluteus-medius': {
    name: 'Gluteus Medius', weg: ['Legs', 'Glutes', 'Gluteus Medius'],
    art: 'muskel', kinder: [],
  },
  'biceps-femoris': {
    name: 'Biceps Femoris', weg: ['Legs', 'Hamstrings', 'Biceps Femoris'],
    art: 'muskel', kinder: [],
  },
  semitendinosus: {
    name: 'Semitendinosus', weg: ['Legs', 'Hamstrings', 'Semitendinosus'],
    art: 'muskel', kinder: [],
  },
  // `[cmd]` **`flanke` hat KEINEN Namen** — gemessen in G-430:
  // `muscle_groups` fuehrt weder `Quadratus Lumborum` noch `Flank`.
  flanke: {
    name: null, weg: [], art: 'muskel', kinder: [],
    grund: 'Kein Name in muscle_groups — die Fläche trägt Obliques mit, '
      + 'weil der Obliquus externus dorthin zieht (G-430).',
  },
}

/** Die Flaechen, die eine GRUPPE zeigen — sie haben Kinder. */
export function gruppen(): string[] {
  return Object.entries(EBENEN).filter(([, e]) => e.art === 'gruppe').map(([k]) => k)
}

/** Die Flaechen, die einen EINZELNEN Muskel zeigen. */
export function muskeln(): string[] {
  return Object.entries(EBENEN).filter(([, e]) => e.art === 'muskel').map(([k]) => k)
}

/**
 * Die Kinder einer Flaeche, die die Karte NICHT zeichnet.
 *
 * `[read]` **Das ist die Luecke, sichtbar gemacht** — wer `quadriceps`
 * anklickt, soll sehen, dass darunter `Rectus Femoris` steht und
 * warum die drei Vastus fehlen.
 */
export function ungezeichneteKinder(code: string): string[] {
  return EBENEN[code]?.kinder ?? []
}
