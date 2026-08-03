// Zentraler Zugang zur Nutrition-Datenbank über supabase-js (PostgREST).
// Ersetzt den früheren `docker exec psql`-Umweg (M1 Teil C, 2026-08-03).
//
// Bewusst der Service-Client: apps/web hat noch keine Anmeldung (M3),
// ein Session-Client wäre `anon` und hätte kein USAGE auf `nutrition`.
// Diese Dateien laufen ausschliesslich serverseitig (runtime 'nodejs');
// der service_role-Schlüssel erreicht den Browser nicht (AK-7).
// Nach Einführung der Anmeldung werden Stammdaten-Reads auf den
// Session-Client umgestellt.

import { createServiceClient } from '@lumeos/shared'

/** Ersetzt den alten Containernamen im Payload-Feld `container`. */
export const NUTRITION_DB_SOURCE = 'supabase_api:nutrition'

/** PostgREST-Client, auf das Schema `nutrition` gerichtet (für rpc()). */
export function nutritionRpc() {
  return createServiceClient().schema('nutrition')
}

/**
 * Trennt "Instanz nicht erreichbar / nicht konfiguriert" von fachlichen
 * Abfragefehlern — gleiche Zweiteilung wie zuvor bei docker exec.
 */
export function isDbUnavailableMessage(message: string): boolean {
  return /fetch failed|ECONNREFUSED|ENOTFOUND|supabaseUrl|supabaseKey|Invalid URL|network/i.test(message)
}
