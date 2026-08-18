'use server'

// Serveraktion für die Katalogsuche.
//
// `[cmd]` Warum eine Aktion und kein Client-Zugriff: der Lesepfad
// benutzt `createSessionClient()` aus `@lumeos/shared/session`, und der
// liest Cookies über `next/headers` — das geht nur serverseitig. Genau
// derselbe Grund wie bei Nutrition
// (`packages/shared/src/nutrition/nutrition-db.ts:9`: *„Diese Dateien
// laufen ausschliesslich serverseitig"*).
//
// Die Begrenzung auf 25 Treffer steht im Lesepfad, nicht hier — sonst
// gäbe es zwei Stellen, an denen sie geändert werden müsste.

import { sucheKatalog, type KatalogTreffer } from '../../../lib/medical/lesen'

export async function katalogSuchen(begriff: string): Promise<KatalogTreffer[]> {
  try {
    return await sucheKatalog(begriff)
  } catch {
    // Ein Suchfehler darf die Seite nicht abräumen: die Anzeige zeigt
    // dann „kein Treffer" statt eines Absturzes. Der Fehler steht in
    // der Serverkonsole.
    return []
  }
}
