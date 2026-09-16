// Einstellungen der Oberflaeche v2 — Profilpflege (GO-01).
//
// WARUM /v2/settings UND NICHT /v2/profil:
// `[cmd]` Die Seitenleiste fuehrt seit G-02 unter SYSTEM einen Eintrag
// `Settings` mit `href: /v2/settings` — er zeigt heute ins Leere. Eine
// zweite Route daneben liesse den Eintrag tot und braechte einen
// zweiten Begriff fuer dieselbe Sache.
// `[read]` Der ONBOARDING_ADR legt ausserdem fest, dass jedes Modul
// einen Settings-Tab hat und Settings „immer der letzte Tab" ist. Das
// Profil ist die modueluebergreifende Ecke davon.
//
// DIESE SEITE ERFASST, SIE RECHNET NICHT. Keine TDEE, keine Zielwerte —
// das ist GO-03 und GO-04.
import type { Metadata } from 'next'

import { getOwnProfile } from '../../../lib/profile/profile-write'
import { EMPTY_PROFILE, type StoredProfile } from '../../../lib/profile/profile-model'
// G-332: die Mahlzeiten-Slots — ein Formular, zwei Orte.
import { ladeSlots } from '../../../lib/nutrition/slots-lesen'
import type { MahlzeitSlot } from '../../../lib/nutrition/slots-lage'
import { ProfilFormular } from './formular'
// G-455: die Allergienpflege — derselbe Baustein wie in Preferences.
import { ladeAllergien } from '../../../lib/allergien/allergie-read'
// G-459/A8: wie weit jede Allergie reicht — aus C-503.
import { ladeTrefferzahlen } from '../../../lib/allergien/vorschlaege-read'

export const metadata: Metadata = {
  title: 'Einstellungen · LumeOS',
}

export const dynamic = 'force-dynamic'

export default async function V2SettingsPage() {
  let profil: StoredProfile = EMPTY_PROFILE
  let fehler: string | null = null

  // G-332: die Mahlzeiten-Slots (C-392) — dieselbe Quelle wie in
  // Preferences. `[read]` **Getrennt abgefangen:** faellt sie aus,
  // bleibt das Profilformular nutzbar.
  let slots: MahlzeitSlot[] = []
  try {
    profil = await getOwnProfile()
  } catch (e) {
    fehler = e instanceof Error ? e.message : String(e)
  }
  try {
    slots = await ladeSlots()
  } catch {
    slots = []
  }

  // ══ G-455: die Allergien ═══════════════════════════════════════
  //
  // `[read]` **Eigener Abfangblock** — faellt der Leseweg aus, bleibt
  // das Profilformular nutzbar. Dieselbe Linie wie bei den Slots.
  //
  // `[cmd]` **C-498 hat `public.user_allergies` gebaut** (gemessen
  // 2026-09-15: 2 Zeilen, vier RLS-Policies auf `auth.uid()`).
  const allergien = await ladeAllergien()

  // ══ G-459/A8: die Trefferzahlen ════════════════════════════════
  //
  // **Der Auftrag:** *„Die drei bestehenden Allergien … muessen
  // bleiben"* — mit ihren Zahlen.
  //
  // `[cmd]` **`user_allergy_catalog_matches` (C-503)** sagt je
  // Allergie, wie viele Katalogzeilen sie trifft. `[read]` **Eigener
  // Abfangblock, eigener Fehler** — faellt sie aus, steht die Liste
  // trotzdem; nur die Zahlen fehlen.
  const treffer = await ladeTrefferzahlen()

  return (
    <>
      {/* ══ G-459/A1 ══════════════════════════════════════════════
          **Tom:** *„das kann eine kleinere kachel links neben
          erfahrungsgrad sein."*

          `[cmd]` **Hier stand sie UNTER dem Formular**, in einem
          eigenen `<div>` ueber die volle Breite. `[read]` **Jetzt
          gereicht sie das Formular durch** — in die linke Spalte
          seines Rasters, neben den Erfahrungsgrad.

          `[read]` **Gelesen wird weiter HIER** — `page.tsx` ist der
          Server, das Formular ist `'use client'`. **Ein Leseweg dort
          zoege `next/headers` ins Browserbuendel** (A-30). */}
      <ProfilFormular start={profil} ladefehler={fehler} slots={slots}
                      allergien={allergien.allergien}
                      allergieFehler={allergien.fehler}
                      allergieTreffer={treffer.zahlen} />
    </>
  )
}
