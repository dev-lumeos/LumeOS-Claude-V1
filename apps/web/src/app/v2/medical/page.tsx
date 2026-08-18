// Medical der Oberflaeche v2 — seit G-46 teils angebunden.
//
// `[cmd]` Die Seitenleiste fuehrt seit G-02 einen Eintrag `Medical`
// mit `href: /v2/medical`. Seit G-36 stand dort der Entwurf, ganz
// Attrappe; seit den Kettenschritten 140–143 gibt es das Schema:
//   medical.biomarker_catalog          11.676
//   medical.biomarker_reference_ranges    464
//   medical.biomarker_aliases             292
//   medical.lab_reports / lab_result_values  2 / 6  (Testdaten)
//
// DIESE SEITE LIEST JETZT. Serverseitig, mit der Identitaet der
// angemeldeten Nutzerin — dasselbe Muster wie `/v2/settings`
// (`page.tsx:27`): laden, Fehler auffangen, durchreichen. Der Rahmen
// ist eine Client-Komponente und kann selbst nicht lesen, weil
// `createSessionClient()` Cookies ueber `next/headers` holt.
//
// `[cmd]` Der Katalog wird NICHT geladen, sondern durchsucht: 11.676
// Zeilen. Vorgeladen sind die 25 haeufigsten nach `common_test_rank`
// (0,05 ms ueber den Rangindex), alles weitere holt die Suche.
//
// `[read]` Was noch Attrappe bleibt und warum, steht in
// docs/ssot/109-medical-anbindung.md.
import type { Metadata } from 'next'

import {
  angemeldeteNutzerin, ladeBefundwerte, ladeMarkerStamm, sucheKatalog, zaehleKatalog,
  type BefundWert, type KatalogTreffer,
} from '../../../lib/medical/lesen'
import { zuReihen, type MarkerReihe } from '../../../lib/medical/reihe'
import { MedicalAnsicht } from './ansicht'
import './medical.css'

export const metadata: Metadata = {
  title: 'Medical · LumeOS',
}

// Ohne das wuerde Next die Seite zur Bauzeit einfrieren — mit den
// Werten der Bauzeit, also ohne Session und ohne Zeile.
export const dynamic = 'force-dynamic'

export default async function V2MedicalPage() {
  let werte: BefundWert[] = []
  let reihen: MarkerReihe[] = []
  let befunde = 0
  let katalogStart: KatalogTreffer[] = []
  let katalogGesamt = 0
  let ladefehler: string | null = null

  try {
    const userId = await angemeldeteNutzerin()
    ;[werte, katalogStart, katalogGesamt] = await Promise.all([
      ladeBefundwerte(userId),
      sucheKatalog(''),
      zaehleKatalog(),
    ])

    // Kurzname und Klasse je Code — ein Zugriff fuer alle, erst wenn
    // die Werte da sind, weil er ihre Codes braucht.
    const codes = Array.from(
      new Set(werte.map(w => w.loinc_code).filter((c): c is string => !!c)),
    )
    reihen = zuReihen(werte, await ladeMarkerStamm(codes))
    befunde = new Set(werte.map(w => w.report_id)).size
  } catch (e) {
    ladefehler = e instanceof Error ? e.message : String(e)
  }

  return (
    <MedicalAnsicht
      echt={{ reihen, befunde, werte, katalogStart, katalogGesamt, ladefehler }}
    />
  )
}
