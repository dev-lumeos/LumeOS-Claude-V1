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

  return <ProfilFormular start={profil} ladefehler={fehler} slots={slots} />
}
