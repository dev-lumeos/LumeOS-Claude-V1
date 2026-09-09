// Supplements der Oberflaeche v2.
//
// G-29 war reines Mockup. `[cmd]` **G-37 bindet drei Tabs an:** Today,
// Stack und Database lesen aus dem `supplements`-Schema (C-68). Der
// Rest bleibt Attrappe und traegt die Marke weiter.
//
// DIESE SEITE LIEST. Keine Schreibpfade: das Erfassen einer Einnahme
// ist ein eigener Auftrag. Die Knoepfe „Mark taken"/"Skip" bleiben
// deshalb Zustand in der Oberflaeche.
//
// Serverkomponente mit der Identitaet der Sitzung — kein
// Service-Client, wie bei Nutrition.
import type { Metadata } from 'next'

import './supplements.css'
import { heute } from '../../../lib/datum'
import {
  getStackDaten, getKatalog, getTagesbilanz, getBelegteSubstanzen,
  type BilanzZeileRoh,
} from '../../../lib/supplements/stack-read'
import type { StackDaten, KatalogEintrag } from '../../../lib/supplements/stack-read'
import { SupplementsAnsicht } from './ansicht'
// G-388: die Injektionsorte liegen in `medical`, nicht in
// `supplements` — fuenf Tabellen, gemessen in 00-MODULTABELLEN.md.
import {
  ladeInjektionsStand, type InjektionsStand,
} from '../../../lib/medical/injektion-read'

export const metadata: Metadata = {
  title: 'Supplements · LumeOS',
}

// G-110: das Regelwerk (C-133) und das Gate von Extended.
import { ladeRegeln, ladeGate, type RegelStand, type GateStand } from '../../../lib/supplements/regeln-read'
// C-224: die Substanzdatenbank und die eigenen Stacks.
import {
  ladeSubstanzListe, ladeEigeneStacks,
  type SubstanzListenEintrag, type EigenerStack, type StackVorlage,
  ladeStackVorlagen,
} from '../../../lib/supplements/substanz-read'

export const dynamic = 'force-dynamic'

/**
 * Eine Abfrage, die nie wirft.
 *
 * `[read]` **Das ist der Ersatz fuer sechs `try`-Bloecke, nicht deren
 * Abschaffung.** Jede Abfrage behaelt ihren eigenen Rueckfallwert —
 * faellt der Katalog aus, bleibt der Stack gueltig. Ein gemeinsames
 * `try` um ein `Promise.all` haette genau das zerstoert: der erste
 * Fehler haette die ganze Seite leer gemacht.
 */
function ruhig<T>(f: () => Promise<T>, rueckfall: T): Promise<T> {
  return f().catch(() => rueckfall)
}

export default async function V2SupplementsPage({
  searchParams,
}: {
  searchParams?: { datum?: string }
}) {
  // G-74: Compliance und Inventory rechnen gegen ein Datum. Es kommt
  // aus `lib/datum.ts` (ueber Mittag gerechnet) und wird SERVERSEITIG
  // bestimmt — `new Date()` in der Komponente ergaebe im Browser einen
  // anderen Wert als beim Rendern und zerlegte die Hydration.
  // ══ G-375: der Tag kommt aus der Adresse ════════════════
  //
  // `[cmd]` **Hier stand `heute()`, fest.** **Der Tageswechsler
  // der Schale haette darueber gestanden und nichts bewirkt**
  // (C-426: kein Regler ohne Wirkung).
  //
  // `[read]` **Der Stichtag war schon durchgereicht** — er
  // wurde nur nicht entgegengenommen.
  // `[read]` **Zwei Werte, absichtlich getrennt:** `gewaehlterTag`
  // ist `null`, wenn niemand einen gewaehlt hat — `stichtag` faellt
  // dann auf heute. Nur so kann `bilanzTag` unterscheiden zwischen
  // „der Nutzer meint diesen Tag" und „es steht keiner in der
  // Adresse" (G-378).
  const gewaehlterTag = /^\d{4}-\d{2}-\d{2}$/.test(searchParams?.datum ?? '')
    ? searchParams!.datum!
    : null
  const stichtag = gewaehlterTag ?? heute()

  // ══ WARUM PARALLEL ══════════════════════════════════════════════
  //
  // `[cmd]` **Gemessen 2026-08-25, angemeldet, zwei Laeufe:** die sechs
  // Abfragen liefen NACHEINANDER und summierten sich auf **1373–1531
  // ms**; parallel sind es **993–1011 ms**.
  //
  // `[cmd]` **Keine der sechs baut auf einer anderen auf** — der
  // einzige geteilte Wert ist `stichtag`, und der steht oben.
  //
  // `[read]` **Die Kette ist in fuenf Auftraegen gewachsen**, je zwei
  // Abfragen: 0 → 2 → 2 → 4 → 6. Jeder Schritt war fuer sich klein,
  // keiner hat die Summe gemessen. `Promise.all` stand die ganze Zeit
  // in sechs Nachbarmodulen (training, goals, recovery, nutrition,
  // medical) — nur hier nicht.
  //
  // `[cmd]` **Der Gewinn ist kleiner als die Rechnung verspricht, und
  // das ist der eigentliche Befund:** `ladeRegeln` allein braucht
  // **887–1001 ms**, die uebrigen fuenf zusammen rund 500 ms. Parallel
  // kann nicht schneller werden als die langsamste Einzelabfrage.
  // Ursache steht in `rule_assessment`: `explain (analyze, buffers)`
  // meldet **temp read=9457 written=9457** bei 171 ms in der Datenbank
  // — ein Kreuzprodukt. Das ist ein eigener Befund, siehe Bericht.
  const [daten, katalog, regeln, gate, substanzen, stacks, belegteSubstanzen,
         vorlagen, injektionen]
    = await Promise.all([
      ruhig<StackDaten | null>(getStackDaten, null),
      ruhig<KatalogEintrag[]>(getKatalog, []),
      ruhig<RegelStand | null>(() => ladeRegeln(stichtag), null),
      ruhig<GateStand | null>(ladeGate, null),
      ruhig<SubstanzListenEintrag[]>(ladeSubstanzListe, []),
      ruhig<EigenerStack[]>(ladeEigeneStacks, []),
      ruhig<number>(getBelegteSubstanzen, 0),
      // G-347b: die Vorlagen. Die Kachel stand auf einer fest
      // verdrahteten Null aus der Zeit, als die Tabelle leer war.
      ruhig<StackVorlage[]>(ladeStackVorlagen, []),
      // G-388: die Injektionsorte. `[cmd]` Fuenf Tabellen in
      // `medical`, und kein Leseweg fuehrte dorthin — die Kachel
      // rechnete aus Entwurfskonstanten.
      ruhig<InjektionsStand>(ladeInjektionsStand, {
        orte: [], protokoll: [], nadeln: 0, gewebehinweise: 0, fehler: null,
      }),
    ])

  // ══ G-275: die Bilanz gilt fuer den ANGESEHENEN Tag ══════════════
  //
  // `[cmd]` **Der Reiter zeigt den juengsten Protokolltag**, nicht
  // heute (G-149) — auf `dev` ist das der 19.08. `[read]` **Die
  // Bilanz muss denselben Tag nehmen**, sonst stuenden Kachel und
  // Tabelle auf verschiedenen Tagen und niemand saehe es.
  //
  // `[read]` **Sie laeuft NACH `daten`, weil sie davon abhaengt** —
  // die einzige der sieben Abfragen, die das tut.
  // ══ G-378: der gewaehlte Tag gewinnt ═══════════════════════════
  //
  // `[cmd]` **Hier stand `daten?.einnahmen[0]?.intake_date ??
  // stichtag`** — der juengste Protokolltag ZUERST, der Stichtag nur
  // als Rueckfall.
  //
  // `[cmd]` **In G-375 gemessen:** mit `?datum=2026-09-06` und mit
  // `?datum=2026-08-15` stand beide Male 2026-09-06 da. **Der
  // Tageswechsler waere ein Regler ohne Wirkung gewesen** (C-426),
  // deshalb bekam supplements keinen.
  //
  // `[read]` **Die Umkehr ist klein und traegt weit:** wer einen Tag
  // WAEHLT, meint ihn. **Wer keinen waehlt, bekommt weiter den
  // juengsten Protokolltag** — G-275 bleibt damit gueltig, es ist
  // jetzt nur der zweite Fall statt des ersten.
  const bilanzTag = gewaehlterTag ?? daten?.einnahmen[0]?.intake_date ?? stichtag
  const bilanz = await ruhig<BilanzZeileRoh[]>(
    () => getTagesbilanz(bilanzTag), [])

  return (
    <>
    <SupplementsAnsicht
      daten={daten} katalog={katalog} heute={stichtag}
      regeln={regeln} gate={gate}
      substanzen={substanzen} stacks={stacks} vorlagen={vorlagen}
      bilanz={bilanz} belegteSubstanzen={belegteSubstanzen}
      bilanzTag={bilanzTag}
      injektionen={injektionen}
    />
    </>
  )
}
