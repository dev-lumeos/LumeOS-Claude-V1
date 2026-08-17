// Training der Oberflaeche v2 — der uebernommene Entwurf, ganz Attrappe.
//
// `[cmd]` Die Seitenleiste fuehrt seit G-02 einen Eintrag `Training`
// mit `href: /v2/training` (packages/ui/src/shell/nav.ts:71). Er zeigte
// bis hierher ins Leere.
//
// DIESE SEITE LIEST NICHTS. `[cmd]` `training.exercises` hat 1.416
// Zeilen Stammdaten, aber es gibt weder `training.sessions` noch
// `training.sets` — jede Zahl des Moduls (Volumen, e1RM, Streak,
// Herzfrequenz) braucht Sitzungen. Es ist nichts anzubinden, also wird
// nichts geladen: eine Serverkomponente ohne Datenzugriff waere
// Fassade. Welche Kachel als erste echte Daten bekommen koennte, steht
// in docs/ssot/91-training-mockup.md, Abschnitt „Was angebunden werden
// koennte".
import type { Metadata } from 'next'

import { TrainingAnsicht } from './ansicht'

export const metadata: Metadata = {
  title: 'Training · LumeOS',
}

export default function V2TrainingPage() {
  return <TrainingAnsicht />
}
