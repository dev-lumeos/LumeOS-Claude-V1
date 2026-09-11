// ════════════════════════════════════════════════════════════════════
// DIE EINE SCHREIBSTELLE FUER `goals.progress_photos` — G-421
// ════════════════════════════════════════════════════════════════════
//
// ══ WARUM ES DIESE DATEI JETZT GIBT ═════════════════════════════════
//
// `[cmd]` **Der Vermerk am `LogPhotoModal` sagte bis heute:**
// *„Fotosessions brauchen eine Dateiablage — der Umsetzungsplan
// fuehrt sie unter ,Was nicht gebaut wird'."*
//
// `[cmd]` **C-463 hat beides gebaut**, gemessen 2026-09-11:
//
//     goals.progress_photos          13 Spalten, 0 Zeilen
//     Bucket goals-progress-photos   privat (public = f)
//     vier Owner-Policies            SELECT INSERT UPDATE DELETE
//
// `[read]` **Der Vermerk war damit eine Falschaussage** — und eine
// selbsterhaltende: er nannte einen Grund, der niemanden mehr
// nachsehen liess. **Dieselbe Klasse wie G-413.**
//
// ══ WAS DIE TABELLE VERLANGT ════════════════════════════════════════
//
// `[cmd]` **Gemessen gegen `pg_constraint`:**
//
//     pose_type    CHECK: mandatory_8 | quarter_turns | detail | custom
//     pose_name    CHECK: btrim(pose_name) <> ''
//     photo_url    CHECK: btrim(photo_url) <> ''
//     ai_analysis  CHECK: jsonb_typeof = 'object', Vorgabe '{}'
//     is_private   NOT NULL, Vorgabe true
//
// `[read]` **Die Werte kommen aus dem CHECK, nicht aus dem Kopf** —
// eine Auswahlliste ist eine Zusage.
//
// `[cmd]` **Das Modal zeigt Front · Side · Back** — das sind
// Vierteldrehungen, also `quarter_turns`. **Nicht `mandatory_8`:**
// das sind die acht Pflichtposen des IFBB, und drei davon sind keine
// acht.
//
// ══ EINE ZEILE JE POSE, NICHT JE SESSION ════════════════════════════
//
// `[read]` **Die Tabelle hat kein `session_id`** — sie traegt
// `session_date` und `pose_number`. **Drei Fotos an einem Tag sind
// drei Zeilen mit demselben Datum.**
//
// MUSTER: `koerpermass-write.ts` (G-122) — Session-Client mit der
// Identitaet der Nutzerin, `user_id` explizit, kein Service-Client.
// Laeuft ausschliesslich serverseitig.
//
// ── DIE NULLZEILENPRUEFUNG IST PFLICHT ──────────────────────────────
//
// `[cmd]` **G-79:** PostgREST meldet `ok` bei einem Schreibvorgang,
// den der Zeilenschutz leergefiltert hat.
import { createSessionClient } from '@lumeos/shared/session'

export class FotosessionFehler extends Error {
  constructor(
    public code: 'NO_SESSION' | 'NOT_FOUND' | 'VALIDATION_FAILED'
      | 'UPLOAD_FAILED' | 'WRITE_FAILED',
    message: string,
    public felder?: Array<{ feld: string; text: string }>,
  ) {
    super(message)
    this.name = 'FotosessionFehler'
  }
}

/** Die vier Werte, die der CHECK auf `pose_type` erlaubt. */
export const POSE_ARTEN = [
  'mandatory_8', 'quarter_turns', 'detail', 'custom',
] as const
export type PoseArt = typeof POSE_ARTEN[number]

/** Der private Bucket aus C-463. */
export const FOTO_BUCKET = 'goals-progress-photos'

/** Eine Pose der Session: Bild plus Benennung. */
export type PoseEingabe = {
  /** `Front`, `Side`, `Back` — landet in `pose_name`. */
  pose_name: string
  /** 1-basiert, wie die Vorlage sie zeigt. */
  pose_number: number
  /** Der Dateiinhalt. */
  datei: File
}

export type FotosessionEingabe = {
  session_date: string
  pose_type: PoseArt
  posen: PoseEingabe[]
  notes: string
}

export type GeschriebenesFoto = {
  id: string
  session_date: string
  pose_type: string
  pose_name: string
  pose_number: number | null
  photo_url: string
  is_private: boolean
}

const RUECKGABE = 'id, session_date, pose_type, pose_name, pose_number, '
  + 'photo_url, is_private'

function alsZeile(v: unknown): GeschriebenesFoto {
  const z = v as Record<string, unknown>
  return {
    id: String(z.id),
    session_date: String(z.session_date),
    pose_type: String(z.pose_type),
    pose_name: String(z.pose_name),
    pose_number: z.pose_number == null ? null : Number(z.pose_number),
    photo_url: String(z.photo_url),
    is_private: Boolean(z.is_private),
  }
}

async function sitzung() {
  const supabase = createSessionClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new FotosessionFehler('NO_SESSION', 'Keine angemeldete Sitzung.')
  return { userId: user.id }
}

/**
 * Die Eingabe pruefen, bevor irgendetwas hochgeladen wird.
 *
 * `[read]` **Zuerst pruefen, dann hochladen** — sonst liegen Dateien
 * im Bucket, zu denen es keine Zeile gibt.
 */
export function pruefeSession(
  e: FotosessionEingabe,
): Array<{ feld: string; text: string }> {
  const felder: Array<{ feld: string; text: string }> = []
  if (!/^\d{4}-\d{2}-\d{2}$/.test(e.session_date.trim())) {
    felder.push({ feld: 'session_date', text: 'Ein Datum wird gebraucht.' })
  }
  // `[read]` **Der CHECK entscheidet, nicht diese Datei** — hier steht
  // dieselbe Liste, damit der Fehler am Feld erscheint statt als
  // Datenbankmeldung.
  if (!POSE_ARTEN.includes(e.pose_type)) {
    felder.push({ feld: 'pose_type', text: 'Unbekannte Posenart.' })
  }
  if (e.posen.length === 0) {
    felder.push({ feld: 'posen', text: 'Mindestens ein Foto wird gebraucht.' })
  }
  for (const p of e.posen) {
    if (!p.pose_name.trim()) {
      felder.push({ feld: 'pose_name', text: 'Jede Pose braucht einen Namen.' })
    }
    if (!(p.datei instanceof File) || p.datei.size === 0) {
      felder.push({ feld: p.pose_name, text: 'Die Datei ist leer.' })
    }
  }
  return felder
}

/** Der Ablagepfad — je Nutzer ein eigener Ordner. */
function pfad(userId: string, datum: string, nummer: number, name: string): string {
  const endung = name.includes('.') ? name.split('.').pop() : 'jpg'
  // `[read]` **Der Zeitstempel verhindert Kollisionen** — zwei
  // Sessions am selben Tag mit derselben Posennummer sind erlaubt.
  return `${userId}/${datum}/${nummer}-${Date.now()}.${endung}`
}

/**
 * Eine Fotosession anlegen: Dateien in den Bucket, Zeilen in die
 * Tabelle.
 *
 * `[read]` **Schlaegt eine Zeile fehl, bleiben die Bilder liegen** —
 * das ist bewusst: ein Bild ohne Zeile ist Ballast, eine Zeile ohne
 * Bild waere ein toter Verweis in der Oberflaeche.
 */
export async function fotosessionAnlegen(
  e: FotosessionEingabe,
): Promise<GeschriebenesFoto[]> {
  const felder = pruefeSession(e)
  if (felder.length > 0) {
    throw new FotosessionFehler(
      'VALIDATION_FAILED', 'Die Eingabe ist unvollständig.', felder)
  }
  const { userId } = await sitzung()
  const supabase = createSessionClient()
  const datum = e.session_date.trim()

  // ── 1: die Dateien in den privaten Bucket ────────────────────────
  const pfade: string[] = []
  for (const p of e.posen) {
    const ziel = pfad(userId, datum, p.pose_number, p.datei.name)
    const { error } = await supabase.storage
      .from(FOTO_BUCKET)
      .upload(ziel, p.datei, { contentType: p.datei.type || 'image/jpeg' })
    if (error) throw new FotosessionFehler('UPLOAD_FAILED', error.message)
    pfade.push(ziel)
  }

  // ── 2: je Pose eine Zeile ────────────────────────────────────────
  //
  // `[read]` **`photo_url` traegt den PFAD, nicht eine oeffentliche
  // Adresse** — der Bucket ist privat, eine dauerhafte URL gaebe es
  // gar nicht. **Der Leseweg erzeugt daraus eine signierte.**
  const zeilen = e.posen.map((p, i) => ({
    user_id: userId,
    session_date: datum,
    pose_type: e.pose_type,
    pose_name: p.pose_name.trim(),
    pose_number: p.pose_number,
    photo_url: pfade[i],
    notes: e.notes.trim() || null,
    // `[cmd]` **`is_private` hat die Vorgabe `true`** — hier trotzdem
    // gesetzt, damit der Wert an der Schreibstelle steht und nicht
    // stillschweigend aus dem Schema kommt.
    is_private: true,
  }))

  const { data, error } = await supabase
    .schema('goals')
    .from('progress_photos')
    .insert(zeilen)
    .select(RUECKGABE)
  if (error) throw new FotosessionFehler('WRITE_FAILED', error.message)

  // `[cmd]` **G-79: PostgREST meldet `ok`, wenn der Zeilenschutz
  // leergefiltert hat** — ohne diese Pruefung saehe das wie Erfolg
  // aus.
  const roh = (data ?? []) as unknown[]
  if (roh.length === 0) {
    throw new FotosessionFehler('NOT_FOUND', 'Keine Zeile angelegt.')
  }
  return roh.map(alsZeile)
}
