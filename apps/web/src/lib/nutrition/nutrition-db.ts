// Zentraler Zugang zur Nutrition-Datenbank über supabase-js (PostgREST).
// Ersetzt den früheren `docker exec psql`-Umweg (M1 Teil C, 2026-08-03).
//
// Seit M3 (2026-08-04) läuft der Zugriff über den Session-Client mit der
// Identität der angemeldeten Nutzerin — damit greifen die Policies aus
// Kettenschritt 060 im Anwendungspfad. Ohne Session ist die Rolle `anon`
// und scheitert bereits am fehlenden USAGE auf `nutrition`; die Middleware
// leitet solche Aufrufe vorher nach /login.
// Diese Dateien laufen ausschliesslich serverseitig (runtime 'nodejs').

import { createSessionClient } from '@lumeos/shared/session'

/** Ersetzt den alten Containernamen im Payload-Feld `container`. */
export const NUTRITION_DB_SOURCE = 'supabase_api:nutrition'

/** PostgREST-Client, auf das Schema `nutrition` gerichtet (für rpc()). */
export function nutritionRpc() {
  return createSessionClient().schema('nutrition')
}

/**
 * Trennt "Instanz nicht erreichbar / nicht konfiguriert" von fachlichen
 * Abfragefehlern — gleiche Zweiteilung wie zuvor bei docker exec.
 */
export function isDbUnavailableMessage(message: string): boolean {
  return /fetch failed|ECONNREFUSED|ENOTFOUND|supabaseUrl|supabaseKey|Invalid URL|network/i.test(message)
}
