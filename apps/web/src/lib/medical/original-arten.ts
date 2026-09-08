// Was der Bucket `medical-originals` annimmt — G-380.
//
// `[read]` **Warum eine eigene Datei:** die Liste brauchen ZWEI Seiten
// der Client-Grenze. Der Schreibweg (`dokumente-write.ts`) prueft
// gegen sie, und das Dateifeld in `tab-verlauf.tsx` — eine
// `'use client'`-Komponente — setzt daraus sein `accept`.
//
// `[cmd]` **Sie kann nicht in `dokumente-write.ts` stehen.** Die
// Datei importiert `@lumeos/shared/session`; ein WERT-Import daraus
// zoege das Servermodul in das Browserbuendel. **Gemessen in einem
// frueheren Auftrag:** das ergibt HTTP 500, waehrend `tsc` gruen
// bleibt — der Typecheck sieht die Laufzeitgrenze nicht.
//
// `[read]` **Diese Datei importiert nichts.** Damit ist sie von
// beiden Seiten sicher zu haben.

/**
 * Die vier erlaubten Arten.
 *
 * `[cmd]` **Abgeleitet, nicht erinnert.** Die Quelle ist
 * `supabase/migrations/20260908113000_c429_medical_documents_timeline.sql`
 * Zeile 18:
 *
 *     ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/heic']::text[]
 *
 * `[cmd]` **In der laufenden Datenbank nachgemessen** —
 * `storage.buckets.allowed_mime_types` fuer `medical-originals`
 * meldet genau diese vier, `file_size_limit` 20971520.
 *
 * `[read]` **Der Bucket bleibt die Autoritaet.** Diese Liste ist
 * seine Abschrift mit genannter Quelle — sie ersetzt ihn nicht.
 * Aendert sich der Bucket, aendert sich hier nichts von allein:
 * deshalb steht die Migration oben namentlich da.
 */
export const ORIGINAL_ARTEN = [
  'application/pdf', 'image/jpeg', 'image/png', 'image/heic',
] as const

/**
 * Dasselbe als `accept`-Wert fuer ein Dateifeld.
 *
 * `[read]` **Aus `ORIGINAL_ARTEN` gerechnet, nicht danebengeschrieben**
 * — sonst altert die eine, waehrend die andere stehenbleibt.
 *
 * `[read]` **`accept` haelt nichts auf.** Es filtert den Waehler des
 * Betriebssystems; wer eine Datei hineinzieht oder den Filter
 * umstellt, kommt daran vorbei. **Die Pruefung im Schreibweg ist
 * die, die zaehlt** — dies ist der Hinweis, nicht die Schranke.
 */
export const ORIGINAL_ACCEPT = ORIGINAL_ARTEN.join(',')

/**
 * Die erlaubten Arten, wie sie einem Menschen genannt werden.
 *
 * `[read]` **`application/pdf` ist kein Wort, das jemand liest.**
 * Der Hinweis am Feld und die Fehlermeldung nennen dieselbe Menge —
 * einmal fuer die Maschine, einmal fuer den Nutzer.
 */
export const ORIGINAL_ARTEN_KLARTEXT = 'PDF, JPEG, PNG, HEIC'

/**
 * Die Obergrenze in Bytes.
 *
 * `[cmd]` **Dieselbe Quelle, Zeile 17:** `20971520`. **In der
 * laufenden Datenbank nachgemessen:** `file_size_limit` meldet
 * denselben Wert.
 */
export const ORIGINAL_GROESSE_MAX = 20971520

/**
 * Dieselbe Zahl, wie sie am Schirm steht.
 *
 * `[read]` **Gerechnet, nicht danebengeschrieben** — „20 MB" und
 * `20971520` sind sonst zwei Zahlen, die getrennt altern.
 */
export const ORIGINAL_GROESSE_KLARTEXT =
  `${Math.round(ORIGINAL_GROESSE_MAX / 1024 / 1024)} MB`
