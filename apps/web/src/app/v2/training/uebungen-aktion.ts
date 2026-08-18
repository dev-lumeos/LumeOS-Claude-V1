'use server'

// Serveraktion fuer den Exercises-Tab (G-64).
//
// `[read]` Warum eine Aktion und keine Serverkomponente: Suche und
// Filter aendern sich bei jedem Tastendruck. Eine Serverkomponente
// muesste dafuer die Adresse wechseln und die ganze Seite neu bauen —
// das Mockup zeigt ein Suchfeld, das sofort filtert.
//
// Gelesen wird mit der Identitaet der Sitzung; der Zeilenschutz
// entscheidet, was ankommt.
import { getUebungen, type KatalogFilter, type Uebung } from '../../../lib/training/uebungen-read'

export async function uebungenSuchen(filter: KatalogFilter): Promise<{
  zeilen: Uebung[]
  gesamt: number
  fehler: string | null
}> {
  try {
    const { zeilen, gesamt } = await getUebungen(filter)
    return { zeilen, gesamt, fehler: null }
  } catch (e) {
    return { zeilen: [], gesamt: 0, fehler: e instanceof Error ? e.message : String(e) }
  }
}
