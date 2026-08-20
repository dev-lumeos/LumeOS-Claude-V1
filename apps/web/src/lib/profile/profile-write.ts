// Lese- und Schreib-I/O fuer das Nutzerprofil (GO-01).
//
// `[cmd]` Nach den Food-Praeferenzen (C-02) ist das der ZWEITE
// Schreibpfad in apps/web. Er ist bewusst klein gehalten: eine Zeile je
// Nutzerin, zehn Spalten, kein Verlauf.
//
// RLS-KONFORM, und zwar doppelt abgesichert:
//   1. Session-Client mit der Identitaet der Nutzerin — kein
//      Service-Schluessel, kein docker exec.
//   2. `id` wird explizit auf `auth.uid()` gesetzt, nie aus der Eingabe
//      uebernommen. `[cmd]` Die Policies verlangen `auth.uid() = id`
//      in USING und WITH CHECK; ohne den expliziten Wert schluege ein
//      INSERT fehl, und ein aus der Eingabe uebernommener Wert waere
//      ein Weg, fremde Zeilen anzusprechen.
//
// Laeuft ausschliesslich serverseitig (Route mit runtime 'nodejs').
import { createSessionClient } from '@lumeos/shared/session'
import { isDbUnavailableMessage } from '@lumeos/shared/nutrition/db'

import {
  EMPTY_PROFILE,
  ProfileWriteError,
  parseStoredProfile,
  type ProfileWrite,
  type StoredProfile,
} from './profile-model'

/** Die Spalten, die diese Seite liest und schreibt. */
const SPALTEN = [
  'birth_date',
  'biological_sex',
  'height_cm',
  'body_weight_kg',
  'activity_level',
  // G-110: seit C-140 vorhanden, seither angeschlossen.
  'experience_level',
  'nutrition_goal',
  'pregnancy_started_on',
  'pregnancy_ended_on',
  'lactation_started_on',
  'lactation_ended_on',
].join(', ')

function classifyDbError(message: string): ProfileWriteError {
  if (isDbUnavailableMessage(message)) {
    return new ProfileWriteError('DB_UNAVAILABLE', `Datenbank nicht erreichbar: ${message}`)
  }
  return new ProfileWriteError('WRITE_FAILED', message)
}

async function requireSession() {
  const supabase = createSessionClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new ProfileWriteError('NO_SESSION', 'Keine angemeldete Session.')
  }
  return { supabase, userId: user.id }
}

/**
 * Das eigene Profil.
 *
 * Keine Zeile heisst nicht „Fehler", sondern „noch nichts angegeben" —
 * `[cmd]` `090_profile.sql` legt zwar je Nutzerin eine Zeile an, aber
 * darauf verlaesst sich diese Funktion nicht.
 */
export async function getOwnProfile(): Promise<StoredProfile> {
  const { supabase, userId } = await requireSession()

  const { data, error } = await supabase
    .from('profiles')
    .select(SPALTEN)
    // Trotz RLS explizit auf die eigene Zeile filtern: die Policy ist
    // die Sperre, dieser Filter die Absicht. Faellt die Policy je weg,
    // liefert die Abfrage immer noch nur eine Zeile.
    .eq('id', userId)
    .maybeSingle()

  if (error) throw classifyDbError(error.message)
  return data ? parseStoredProfile(data) : EMPTY_PROFILE
}

/**
 * Das eigene Profil schreiben.
 *
 * `upsert` statt `update`: existiert die Zeile nicht, entsteht sie —
 * die Insert-Policy erlaubt genau das fuer `auth.uid() = id`.
 */
export async function saveOwnProfile(eingabe: ProfileWrite): Promise<StoredProfile> {
  const { supabase, userId } = await requireSession()

  const zeile = {
    // NIE aus der Eingabe. Siehe Kopf.
    id: userId,
    ...eingabe,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('profiles')
    .upsert(zeile, { onConflict: 'id' })
    .select(SPALTEN)
    .maybeSingle()

  if (error) throw classifyDbError(error.message)
  return data ? parseStoredProfile(data) : EMPTY_PROFILE
}
