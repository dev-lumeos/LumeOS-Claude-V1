'use server'

// Serveraktionen fuer die Allergienpflege — G-455.
//
// `[read]` **Eigene Datei, nicht in `formular.tsx`** — dort steht das
// Profilformular eines anderen Auftrags, und ein `'use server'` im
// selben Baustein zoege es mit hinein.
//
// `[cmd]` **`revalidatePath` auf BEIDE Orte** — Settings und
// Preferences zeigen dieselben Zeilen (Toms Vorgabe: *„dargestellt
// kann es ja trotzdem zusaetzlich in foods/preferences bleiben"*).
// **Ohne den zweiten Aufruf saehe der Nutzer in Preferences einen
// alten Stand**, und A3 waere nicht erfuellt.
import { revalidatePath } from 'next/cache'

import {
  legeAllergieAn, loescheAllergie, aendereAllergie,
  // G-465: den Kurzspeicher der Trefferliste raeumen.
  vergissAllergieTreffer,
} from '../../../lib/allergien/allergie-read'
import {
  pruefeEingabe, type ArtCode, type SchwereCode,
} from '../../../lib/allergien/allergie-lage'

export type AktionsErgebnis = { ok: boolean; fehler: string | null }

/** `[read]` **Beide Orte** — sonst driften sie auseinander. */
function frischen(): void {
  // ══ G-465: den Kurzspeicher raeumen ═══════════════════════════════
  //
  // `[read]` **Die Trefferliste je Nutzer liegt 60 Sekunden im
  // Speicher** (G-465, sonst kostet jeder Tastendruck 15 Sekunden).
  // **Wer hier etwas aendert, muss die Wirkung SOFORT sehen** —
  // `revalidatePath` allein raeumt ihn nicht, er liegt im Modul.
  //
  // `[read]` **Ohne Kennung: alle raeumen.** Das trifft im
  // schlechtesten Fall fremde Eintraege, die dann neu geholt werden —
  // **eine Sekunde Arbeit gegen eine falsche Allergieanzeige.**
  vergissAllergieTreffer()
  revalidatePath('/v2/settings')
  revalidatePath('/v2/nutrition')
  // `[read]` **Und die Produkte** — der harte Filter liest dieselbe
  // Tabelle, und eine geloeschte Allergie muss dort sofort ausfallen
  // (A8).
  revalidatePath('/v2/supplements')
}

export async function allergieAnlegen(e: {
  stoff_text: string
  art: ArtCode
  schwere: SchwereCode
  /**
   * G-459 — der Katalogcode des gewaehlten Vorschlags, sonst `null`.
   *
   * `[read]` **Er wird durchgereicht, nicht hier gebildet** — welcher
   * Code zu welchem Wort gehoert, weiss `allergy_catalog_suggestions`
   * (C-503), und der Trigger der Tabelle weist jeden anderen ab.
   */
  stoff_code?: string | null
  seit?: string | null
  notiz?: string | null
}): Promise<AktionsErgebnis> {
  // `[read]` **Erst pruefen, dann schreiben** — die CHECKs der
  // Datenbank stehen in `allergie-lage.ts` abgeschrieben, und der
  // Nutzer soll einen Satz sehen statt einer Postgres-Meldung.
  const fehler = pruefeEingabe(e)
  if (fehler) return { ok: false, fehler }

  const a = await legeAllergieAn(e)
  if (!a.ok) return { ok: false, fehler: a.fehler }
  frischen()
  return { ok: true, fehler: null }
}

export async function allergieLoeschen(id: string): Promise<AktionsErgebnis> {
  const a = await loescheAllergie(id)
  if (!a.ok) return { ok: false, fehler: a.fehler }
  frischen()
  return { ok: true, fehler: null }
}

export async function allergieAendern(
  id: string, feld: { art?: ArtCode; schwere?: SchwereCode },
): Promise<AktionsErgebnis> {
  const a = await aendereAllergie(id, feld)
  if (!a.ok) return { ok: false, fehler: a.fehler }
  frischen()
  return { ok: true, fehler: null }
}
