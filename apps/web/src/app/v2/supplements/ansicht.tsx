'use client'

// Der Rahmen des Supplements-Moduls.
//
// QUELLE: theme-v1/module-supplements.jsx, `SupplementsModule` (214).
// `[cmd]` `app.jsx:123` sagt `case "supplements": return
// <SupplementsModule />` — EIN Rahmen, keine V2-Weiche. Anders als
// Recovery (abgeloester Rahmen) und Medical (Weiche vorhanden).
//
// UEBERNOMMEN: Kopfzeile, elf Tabs in ihrer Reihenfolge, alle Zahlen.
//
// WAS DIESER DURCHGANG NICHT BAUT: die vier Tabs, die aus
// `-spec.jsx` und `-injection.jsx` kommen (Catalog, Stacks,
// Intelligence, Inventory, Injections). `[read]` Der Auftrag erlaubt
// das ausdruecklich: „Ein vollstaendiges Drittel ist besser als drei
// halbe Tabs." Sie stehen als Tab da und sagen, dass sie fehlen —
// weglassen waere schlechter, weil die Tab-Leiste dann unvollstaendig
// aussieht statt unfertig.
import * as React from 'react'
import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'
import { Card, Pill, Icon, Tabs, InEntwicklungKnopf, type TabItem } from '@lumeos/ui'

// G-123: der Tab-Hook aus G-117.
import { useTabParam } from '../../../lib/tab-url'
// ══ G-117: KEIN Wert-Import von `EXTENDED_STACK` ═════════════════
//
// `[cmd]` **Hier stand `import { STACK, EXTENDED_STACK }`** — und
// gebraucht wurde davon **eine einzige Zahl**, die Laenge fuer das
// Zaehlerchen am Reiter (`count:`).
//
// `[cmd]` **Gemessen am 2026-09-24:** dieser eine Import zieht die
// ganze Liste ins Seitenbuendel — fuenf Wirkstoffe mit Namen, Dosis
// und Anwendungsschema, **auch fuer jemanden ohne Grad.** `[read]`
// **Das `dynamic` am Reiter allein haette daran nichts geaendert:**
// es haelt `tab-extended.tsx` heraus, nicht `daten.ts`.
//
// `[read]` **Eine Zahl ist kein Grund, eine Stoffliste
// auszuliefern.** Sie steht deshalb als Konstante hier.
import { STACK } from './daten'

/**
 * Wie viele Wirkstoffe der Extended-Entwurf fuehrt — nur fuer das
 * Zaehlerchen am Reiter.
 *
 * `[cmd]` **5**, gemessen am 2026-09-24 gegen `EXTENDED_STACK` in
 * `daten.ts`. `[read]` **Ein Waechter haelt die Zahl aktuell**
 * (`g117-extended-buendel.test.ts`) — eine abgeschriebene Zahl ohne
 * Waechter altert still.
 */
const EXTENDED_ANZAHL = 5
import { SuppCtx, type ModalZustand, type ModalTyp } from './kontext'
import type { StackDaten, KatalogEintrag } from '../../../lib/supplements/stack-read'
import type { BilanzZeile } from '../../../lib/supplements/bilanz-lage'
import {
  SuppToday, SuppStack, SuppDatabase, SuppCost,
} from './tabs'
// G-33: die beiden Tabs mit den meisten Unterkomponenten stehen in
// eigenen Dateien — `tabs.tsx` waere sonst ueber 1.200 Zeilen lang.
// G-110: statisch importiert — der Schutz liegt auf dem Server.
//
// `[cmd]` **Ein Versuch mit `dynamic({ ssr: false })` ist
// zurueckgenommen:** der Tab rendert damit gar nichts mehr, auch nicht
// den Ladehinweis (gemessen 2026-08-20). Der Gewinn waere gewesen,
// dass der Code nicht im Buendel steht; der Preis war ein Tab, der
// niemandem mehr etwas zeigt.
//
// ══ G-117: DER CODE LIEGT NICHT MEHR IM BUENDEL ══════════════════
//
// `[cmd]` **Gemessen am 2026-09-24 (Produktionsbau):** die
// Kennzeichen aus `tab-extended.tsx` (die Nebenwirkungsnotizen und
// die Knopfbeschriftung des Zyklusplaners) standen in **einem von
// zehn** JS-Chunks der Seite, `app/v2/supplements/page-*.js`. **Auch
// fuer jemanden, dessen Grad nicht reicht.**
//
// `[read]` **Die Kennzeichen stehen hier BEWUSST nicht woertlich.**
// `[cmd]` Eine erste Fassung zitierte sie — im Entwicklungsbau
// werden Kommentare mitgeliefert, und die Probe fand sie in
// `page.js` und wurde rot. **Der Suchtext eines Waechters gehoert
// nicht in die Datei, die er bewacht** (dieselbe Falle wie
// `selbstpruefung-findet-ihre-eigenen-muster`).
//
// `[read]` **Was das wiegt:** die Protokolle selbst kommen nicht mit,
// nur die Attrappenzahlen. **Aber wer den Code liest, erfaehrt, DASS
// es PED-Protokolle gibt und wie sie aufgebaut sind** — und sobald
// Extended echte Daten fuehrt, wird aus dem Entwurf ein Leseweg.
//
// ── WARUM `ssr: false` DAS FALSCHE WERKZEUG WAR ──────────────────
//
// `[cmd]` **Der erste Versuch (2026-08-20) nahm `dynamic({ ssr:
// false })`.** Das hielt den Chunk heraus **und machte den Reiter
// leer** — auch den Ladehinweis. Zurueckgenommen, richtig.
//
// `[read]` **`dynamic` verschiebt das LADEN, es entscheidet nicht
// ueber das AUSLIEFERN** — das war die Diagnose. `[read]` **Sie
// stimmt fuer `ssr: false`, aber die Verschiebung ist genau das, was
// hier gebraucht wird:** ein eigener Chunk, der erst geholt wird,
// wenn jemand ihn rendert. **Mit `ssr: true` rendert der Server
// weiterhin** — der Reiter bleibt am Leben, und wessen Grad nicht
// reicht, rendert ihn nie und bekommt den Chunk nie.
//
// `[read]` **Die Grenze ERSETZT das serverseitige Gate nicht, sie
// kommt dazu** (A5): `ladeGate()` entscheidet weiterhin ueber die
// DATEN, `gateOffen` weiterhin ueber das Rendern. Das hier
// entscheidet nur, was im Buendel liegt.
const SuppExtended = dynamic(
  () => import('./tab-extended').then(m => ({ default: m.SuppExtended })),
  {
    // `[cmd]` **`ssr: true` ist die Vorgabe und steht hier
    // ausdruecklich** — ein spaeteres `false` waere der Rueckfall,
    // den `g117-extended-buendel.test.ts` faengt.
    ssr: true,
    // `[read]` **Ein Ladehinweis, kein leeres Feld** — die Lehre aus
    // G-482/G-486. Beim Serveranstrich erscheint er gar nicht; er
    // gilt dem Nachladen im Browser.
    loading: () => (
      <p className="v2-muted" style={{ fontSize: 12, padding: '24px 0' }}>
        Extended wird geladen …
      </p>
    ),
  },
)
// G-110: das Regelwerk (C-133) und das echte Gate.
import { InteractionsEchtTab, RegelHinweis } from './tab-interactions-echt'
import { ExtendedGesperrt } from './extended-gate'
import type { RegelStand, GateStand } from '../../../lib/supplements/regeln-read'
import { ReferenzTrenner } from '../../../components/shell/referenz-trenner'
// `[cmd]` G-365: die Mockup-Kacheln, die OBEN fehlen.
import {
  FehlendeKostenKacheln, FehlendeIntelKacheln,
  FehlendeInteraktionsKacheln,
} from './fehlende-kacheln'
import {
  SuppExtendedReferenz, SuppInjectionReferenz,
} from './mockup-referenz'
// G-365: die Mockup-Reiter, die im Code nicht mehr stehen.
import {
  SuppInteractionsReferenz, SuppStacksReferenz,
  SuppIntelligenceReferenz,
} from './mockup-referenz'
import { SuppCompliance } from './tab-compliance'
// G-452: die 214.780 Lieferantenprodukte (C-467/C-485).
import { SuppProdukte } from './tab-produkte'

/** C-418/3: die Quelle unter der Trennlinie. */
const QUELLE = 'theme-v1/module-supplements.jsx'
// G-45: der Injections-Tab mit der Rotationskarte.
import { SuppInjections } from './tab-injektionen'
// G-388: der Typ des Injektionsstands.
import type {
  InjektionsStand, KonfigurationsStand, InjizierbareSubstanz,
} from '../../../lib/medical/injektion-read'
// G-423: Zyklen, Protokolle und die Injektionskonfiguration.
import type { ZyklusStand } from '../../../lib/supplements/zyklus-read'
import {
  ZyklusKarte, ProtokollKarte, InjektionsKonfigKarte,
} from './zyklus-karten'
// G-45: die vier Tabs aus -spec.jsx.
// G-172: `SuppCatalog` ist geloescht — der Tab zeigt `SuppDatabase`.
import { SuppStacks, SuppIntelligence, SuppInventory } from './tab-spec'
// G-74: Inventory und Compliance mit echten Werten.
import { ComplianceEcht, InventoryEcht } from './tab-inventory-echt'
// C-224/C-229: Substanzdatenbank — Liste, Detail und Add getrennt.
import type {
  SubstanzListenEintrag, EigenerStack, StackVorlage,
} from '../../../lib/supplements/substanz-read'
import { SupplementsModale } from './modale'
// G-468: der Vorlieben-Reiter.
import { SuppVorliebenTab } from './tab-vorlieben'
import { VORGABE } from '../../../lib/supplements/vorlieben-lage'
import type { VorliebenDaten } from '../../../lib/supplements/vorlieben-read'
import type { AllergieStand } from '../../../lib/allergien/allergie-read'

/**
 * Die elf Tabs der Vorlage (module-supplements.jsx:240-253).
 *
 * G-37: Die Zahl an `Stack` kommt aus dem echten Stack, sobald einer
 * gelesen wurde — sonst aus der Vorlage.
 */
// G-172: Die Beschriftungen kommen aus `messages/{de,en}.json`.
//
// `[read]` **Tom, 2026-08-22:** *„i18n ist fuer die UI und auch da
// gilt: wir entwickeln immer de plus en, thai machen wir spaeter."*
// Die Schicht ist next-intl und steht seit A-14; Nutrition und
// Settings nutzen sie, Supplements bis heute nirgends.
//
// `[cmd]` **`Extended` bleibt unuebersetzt** — Eigenname, in G-167 so
// festgelegt.
// ══ G-428: die Reiter-Ids, EINMAL ════════════════════════════════
//
// `[cmd]` **`/v2/supplements?tab=injektionen` zeigte 1 Kachel und 801
// Zeichen** — der deutsche Name trifft keinen Zweig, denn alle Zweige
// unten fragen `tab === 'injection'`. **Gemessen auf beiden Konten,
// und dieselbe Zahl VOR G-389** (`git checkout 05425238^`): **der
// Reiter war nie kaputt.**
//
// `[read]` **Die Liste wird NICHT abgeschrieben, sondern aus `tabs()`
// abgeleitet** — `reiterIds()` ruft dieselbe Funktion, die die Leiste
// rendert. **Eine zweite, von Hand gepflegte Liste waere genau die
// Drift, vor der `tab-url.ts` gewarnt hat**: wer einen Reiter
// ergaenzt und die Liste vergisst, haette ihn stumm geklammert.
//
// `[read]` **Die Argumente sind egal** — sie bestimmen Beschriftung
// und Zahl, nie die Menge der Ids.
function reiterIds(): string[] {
  return tabs(s => s, 0, null, 0).map(x => x.id)
}

function tabs(
  t: (s: string) => string,
  stackAnzahl: number,
  regelAnzahl: number | null,
  substanzAnzahl: number,
): TabItem[] {
  return [
    { id: 'today', label: t('tabHeute'), icon: 'check' },
    { id: 'stack', label: t('tabStack'), icon: 'supplements', count: stackAnzahl },
    { id: 'extended', label: t('tabExtended'), icon: 'medical', count: EXTENDED_ANZAHL },
    // ══ G-452: der Produkte-Reiter, LINKS NEBEN `catalog` ═══════════
    //
    // **Tom, 2026-09-08, mit Tobias:** *„die supplier produkte
    // inklusive details in supplements links neben katalog."*
    //
    // `[cmd]` **`supplements.supplier_products`: 214.780 Zeilen**
    // (121.959 On Market), gemessen 2026-09-14. **C-467 hat die
    // Tabelle gebaut, C-485 gefuellt** — und bis hierher fuehrte kein
    // Leseweg in `apps/` dorthin.
    //
    // ══ WARUM KEINE ZAHL AN DER LEISTE ══════════════════════════════
    //
    // `[cmd]` **Ein erster Versuch trug `count: 121959`** und stand im
    // Foto als **`121959`** da — ohne Tausenderpunkte.
    //
    // `[cmd]` **`Tabs` rendert `count` roh** (`packages/ui`,
    // `primitives.tsx:701`, `{t.count}`), und `count` ist dort ein
    // `number`. **Ein `toLocaleString` braeuchte eine Aenderung in
    // `packages/ui`** — das Paket gehoert allen Apps, und eine
    // sechsstellige Zahl ist ein Problem dieses einen Reiters: **alle
    // uebrigen Zaehler liegen unter 566.**
    //
    // `[read]` **Also keine Zahl hier, statt einer unlesbaren.** Sie
    // steht ohnehin dreimal formatiert im Reiter selbst — an den
    // Marktpillen (121.959 / 92.821 / 214.780) und in der Fusszeile.
    // **Eine vierte, schlechter gesetzte Stelle waere kein Gewinn.**
    { id: 'produkte', label: t('tabProdukte'), icon: 'marketplace' },
    // G-172: Der Katalog-Tab traegt jetzt die echte Substanzdatenbank
    // (C-229) — die Zahl ist deren Laenge, nicht die der Vorlage.
    { id: 'catalog', label: t('tabKatalog'), icon: 'search',
      count: substanzAnzahl || undefined },
    // ══ G-468: DER VORLIEBEN-REITER ══════════════════════════════
    //
    // **Tom:** *„jedes modul braucht seine preferences … nutrition
    // haben wir das schon"*
    //
    // `[cmd]` **Gemessen, wo nutrition seinen hat**
    // (`nutrition/ansicht.tsx:171`): **`prefs`, sechster von zehn —
    // NACH den Bloetterreitern, VOR den Werkzeugen.**
    //
    // `[read]` **Dieselbe Stelle:** hier nach `Katalog`, vor
    // `Stacks`. `[cmd]` **Der Punkt sagt es auch:** *„der neue steht
    // bei den Einstellungen, nicht bei den Produkten."*
    { id: 'prefs', label: t('tabVorlieben'), icon: 'settings' },
    { id: 'stacks', label: t('tabStacks'), icon: 'layers' },
    { id: 'intel', label: t('tabAuswertung'), icon: 'sparkles' },
    { id: 'inventory', label: t('tabBestand'), icon: 'marketplace' },
    { id: 'injection', label: t('tabInjektionen'), icon: 'medical' },
    { id: 'compliance', label: t('tabEinnahmetreue'), icon: 'calendar' },
    // G-110: die Zahl ist jetzt die der ZUTREFFENDEN Regeln, nicht
    // die drei Zeilen des Entwurfs.  heisst: nicht gelesen.
    { id: 'interactions', label: t('tabWechselwirkungen'), icon: 'sparkles',
      count: regelAnzahl ?? undefined },
    { id: 'cost', label: t('tabKosten'), icon: 'trend_up' },
  ]
}

// G-45: Die Platzhalter-Tabelle ist entfallen — **alle zwoelf Tabs
// der Vorlage sind gebaut.** Sie fuehrte die fuenf, die aus
// `-spec.jsx` und `-injection.jsx` kommen, und zeigte je eine Kachel
// mit Herkunftsangabe. `[cmd]` Nachgezaehlt: `tabs()` gibt zwoelf
// Eintraege, und zu jedem gibt es unten eine Weiche.

export function SupplementsAnsicht({
  daten: datenProp = null, katalog = [], heute: heuteProp = null,
  regeln = null, gate = null, substanzen = [], stacks = [],
  vorlagen = [],
  // G-468: die Vorlieben und die Allergien.
  vorlieben = null, allergien = null,
  bilanz = [], belegteSubstanzen = 0, bilanzTag = null,
  injektionen = null,
  zyklen = null,
  konfig = null,
  injizierbare = [],
}: {
  /**
   * G-468: die Vorlieben aus C-511 und die Allergien aus C-498.
   *
   * `[read]` **Beide optional** — ein Ladefehler laesst den Reiter
   * stehen, mit Vorgaben und einem Satz. **Eine leere Flaeche ohne
   * Grund saehe aus wie ein Fehler** (G-482, G-486).
   */
  vorlieben?: VorliebenDaten | null
  allergien?: AllergieStand | null
  daten?: StackDaten | null
  katalog?: KatalogEintrag[]
  /** G-110: die 64 Regeln des Tages (C-133). */
  regeln?: RegelStand | null
  /** G-110: der Erfahrungsgrad, der Extended oeffnet. */
  gate?: GateStand | null
  /** C-224: die Substanzdatenbank und die eigenen Stacks. */
  substanzen?: SubstanzListenEintrag[]
  stacks?: EigenerStack[]
  /**
   * G-347b: die Stack-Vorlagen aus `supplements.stack_templates`.
   *
   * `[cmd]` **Die Kachel stand auf `vorlagenLageVon(0)`** — einer
   * fest verdrahteten Null aus der Zeit, als die Tabelle leer war
   * (G-253). **C-423/C-424 haben sie gefuellt:** vier kuratierte
   * und eine vom Nutzer.
   */
  vorlagen?: StackVorlage[]
  /** G-275: die Naehrstoffbilanz des angesehenen Tages. */
  bilanz?: BilanzZeile[]
  belegteSubstanzen?: number
  /** Der Tag, fuer den die Bilanz gilt — der juengste Protokolltag. */
  bilanzTag?: string | null
  /**
   * G-388: die Injektionsorte aus `medical`.
   *
   * `[read]` **Reine Felder, keine `Map`** — eine `Map` als Prop an
   * eine `'use client'`-Komponente kommt leer an, ohne Fehler und
   * ohne Typfehler.
   */
  injektionen?: InjektionsStand | null
  /** `[cmd]` **G-423: C-456, fuenf Schreibwege ohne Aufrufer.** */
  zyklen?: ZyklusStand | null
  /** `[cmd]` **G-423/E-79: die konfigurierten Flaechen (C-455).** */
  konfig?: KonfigurationsStand | null
  /** `[cmd]` **Was der Katalog als injizierbar belegt.** */
  injizierbare?: InjizierbareSubstanz[]
  /**
   * G-74: Das echte Heute, serverseitig aus `lib/datum.ts`.
   *
   * `[read]` Compliance und Inventory rechnen dagegen. `null` heisst:
   * kein Datum uebergeben — dann faellt die Rechnung auf den juengsten
   * Protokolltag zurueck, statt `new Date()` im Browser zu rufen.
   */
  heute?: string | null
}) {
  // G-123: Tab in der Adresse — Drop-in aus lib/tab-url (G-117).
  //
  // `[cmd]` **`supplements` war das letzte Modul mit `useState`**
  // (G-119). Sechs andere waren seit G-117 umgestellt, Nutrition hatte
  // das Muster schon seit G-38.
  //
  // `[read]` Zwei Wirkungen: der Tab ueberlebt eine Navigation und ist
  // verlinkbar — und `tools/schuss.mjs` kann einzelne Tabs messen,
  // statt immer nur den ersten zu sehen.
  // G-172: die Beschriftungen aus `messages/`. Clientkomponente,
  // also `useTranslations` — `getTranslations` waere serverseitig.
  const t = useTranslations('Supplements')
  // G-428: unbekannte Reiter fallen auf `today` statt ins Leere.
  // `[read]` **Ueber `useMemo`, weil `reiterIds()` bei jedem Anstrich
  // ein NEUES Array gaebe** — dieselbe Falle wie bei `stand?.orte ??
  // []` in `tab-injektionen.tsx:133`.
  const bekannteReiter = React.useMemo(() => reiterIds(), [])
  const [tab, setTab] = useTabParam('today', bekannteReiter)
  const [modal, setModal] = React.useState<ModalZustand>(null)

  // G-74: Der Stichtag der Rechnungen. Kommt serverseitig; ohne ihn
  // der juengste Protokolltag — **nie `new Date()`**, das zerlegte die
  // Hydration und rechnete im Browser anders als beim Rendern.
  const stichtag = heuteProp
    ?? datenProp?.einnahmen.map(e => e.intake_date).sort().pop()
    ?? '1970-01-01'

  // G-37: Sind echte Daten da, kommt der Anfangszustand aus dem
  // Protokoll — abgehakt ist, was als `taken` gebucht ist. Ohne Daten
  // bleiben die drei Vorgaben der Vorlage (Zeile 216).
  const [takenToday, setTakenToday] = React.useState<Record<string, boolean>>(() => {
    if (!datenProp) return { creatine: true, d3k2: true, omega3: true }
    const heute = datenProp.einnahmen[0]?.intake_date
    const ab: Record<string, boolean> = {}
    for (const e of datenProp.einnahmen) {
      if (e.intake_date === heute && e.stack_item_id && e.status === 'taken') {
        ab[e.stack_item_id] = true
      }
    }
    return ab
  })

  const open = React.useCallback((type: ModalTyp, payload?: unknown) => {
    setModal({ type, payload })
  }, [])
  const close = React.useCallback(() => setModal(null), [])
  // G-148: der Stand nach einem Schreibzugriff. `null` heisst „noch
  // nichts geschrieben" — dann gilt, was der Server geliefert hat.
  const [frisch, setFrisch] = React.useState<StackDaten | null>(null)
  const [schreibfehler, setSchreibfehler] = React.useState<string | null>(null)
  const [laeuft, setLaeuft] = React.useState(false)
  const daten = frisch ?? datenProp

  /**
   * G-148: Eine Einnahme erfassen oder zuruecknehmen.
   *
   * `[cmd]` **Vorher war das reiner Browserzustand** — `setTakenToday`
   * und sonst nichts. Ein Haken verschwand beim Neuladen, und die
   * Compliance ruehrte sich nie.
   *
   * `[read]` **Ohne echte Daten bleibt es beim Browserzustand:** Die
   * Vorlage hat keine `stack_item_id`, gegen die geschrieben werden
   * koennte. Der Haken ist dann Anschauung, kein Protokoll.
   */
  const toggleTaken = React.useCallback(async (id: string) => {
    if (!daten) { setTakenToday(t => ({ ...t, [id]: !t[id] })); return }

    // G-149: Gebucht wird auf den ANGESEHENEN Tag — den juengsten
    // Protokolltag, den die Today-Kachel zeigt und aus dem auch
    // `takenToday` initialisiert wird (einnahmen[0]). `[cmd]` Vorher
    // stand hier `stichtag` (= echtes Heute): wer den angezeigten
    // zurueckliegenden Tag abhakte, buchte still auf heute, und die
    // Kachel zeigte etwas anderes, als der Nutzer getan hatte.
    const ansichtsTag = daten.einnahmen[0]?.intake_date ?? stichtag
    const heuteZeile = daten.einnahmen.find(
      e => e.stack_item_id === id && e.intake_date === ansichtsTag)
    setLaeuft(true)
    setSchreibfehler(null)
    try {
      const antwort = heuteZeile
        ? await fetch(`/api/supplements/intake?id=${encodeURIComponent(heuteZeile.id)}`,
                      { method: 'DELETE' })
        : await fetch('/api/supplements/intake', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              stack_item_id: id, intake_date: ansichtsTag, status: 'taken',
            }),
          })
      const inhalt = await antwort.json()
      if (!antwort.ok) throw new Error(inhalt?.error ?? 'Schreiben fehlgeschlagen.')
      if (inhalt.daten) setFrisch(inhalt.daten as StackDaten)
      setTakenToday(t => ({ ...t, [id]: !heuteZeile }))
    } catch (e) {
      setSchreibfehler(e instanceof Error ? e.message : String(e))
    } finally {
      setLaeuft(false)
    }
  }, [daten, stichtag])

  // C-229: die Substanzliste, die Stacks und das Gate wandern in den
  // Kontext — der Database-Tab und der Add-Dialog lesen sie dort.
  const gateOffen = gate?.offen === true
  const ctx = React.useMemo(
    () => ({
      takenToday, toggleTaken, open, daten, katalog,
      substanzen, stacks, vorlagen, gateOffen,
      // G-275: die Bilanz und der Tag, fuer den sie gilt.
      bilanz, belegteSubstanzen,
      stichtag: bilanzTag ?? stichtag,
      laeuft, setFrisch, schreibfehler, setSchreibfehler,
    }),
    [takenToday, toggleTaken, open, daten, katalog,
     substanzen, stacks, vorlagen, gateOffen, bilanz, belegteSubstanzen,
     bilanzTag,
     stichtag, laeuft, schreibfehler],
  )

  // Angebunden oder Vorlage — beide Faelle an einer Stelle entschieden.
  const stackAnzahl = daten ? daten.positionen.length : STACK.length
  // `[cmd]` Der juengste Protokolltag; die Vorlage zeigt „Sat · May 16".
  const heuteText = daten?.einnahmen[0]?.intake_date ?? 'Sat · May 16'


  return (
    <>
      <div className="v2-module-header v2-module-hero-lite">
        <div className="v2-module-title-block">
          <div className="v2-module-title-row">
            <span className="v2-module-title">Supplements</span>
            {/* G-37: Datum und Anzahl aus den echten Daten, wo sie
                vorliegen. Die Quote fehlt bewusst — `[cmd]` das
                Protokoll deckt EINEN Tag ab; „30d · 94%" waere eine
                Behauptung ueber 29 Tage, die es nicht gibt. Was sie
                braeuchte, steht im Bericht. */}
            <Pill>{heuteText}</Pill>
            <Pill variant="acc">{stackAnzahl} active</Pill>
            {daten
              ? <Pill><span className="v2-dot" style={{ background: 'var(--acc-suppl)' }} />
                  {daten.protokoll_tage} d logged
                </Pill>
              : <Pill><span className="v2-dot" style={{ background: 'var(--pos)' }} /> Compliance 30d · 94%</Pill>}
          </div>
          <div className="v2-module-sub">{t('untertitel')}</div>
        </div>
        {/* G-172: **Der `Database`-Knopf ist weg.** `[cmd]` Er fuehrte
            auf einen verborgenen Tab, waehrend `Catalog` einen Entwurf
            zeigte — zwei Einstiege in dieselbe Sache, einer davon
            Vorlage. Die Datenbank steht jetzt auf `Katalog`. */}
        {/* `[cmd]` **G-378: der Platz fuer den Tageswechsler.**
            In G-375 blieb er weg, weil `bilanzTag` immer auf den
            juengsten Protokolltag zurueckfiel — ein Regler ohne
            Wirkung (C-426). **Jetzt gewinnt der gewaehlte Tag**,
            und der Rueckfall gilt nur noch ohne Auswahl. */}
        <div className="v2-kopf-mitte" data-tageswechsler />

        <div className="v2-module-actions">
          <InEntwicklungKnopf titel={t('stackExportieren')} className="v2-btn">
            <Icon name="download" className="v2-ic v2-ic-sm" /> {t('stackExportieren')}
          </InEntwicklungKnopf>
          <button type="button" className="v2-btn v2-btn-primary" onClick={() => open('catalogAdd')}>
            <Icon name="plus" className="v2-ic v2-ic-sm" /> {t('supplementHinzufuegen')}
          </button>
        </div>
      </div>

      <Tabs items={tabs(t, stackAnzahl, regeln?.erfuellt ?? null, substanzen.length)}
            active={tab} onChange={setTab} />

      <SuppCtx.Provider value={ctx}>
        {/*
          `[read]` **`key={tab}` haengt den Inhalt beim Wechsel neu ein**
          — erst dadurch greift `@starting-style` in `.v2-tabinhalt`
          bei JEDEM Wechsel, nicht nur beim ersten Aufbau.

          **Nur Deckkraft, kein Verschieben.** Ein Reiter, den man oft
          klickt, darf nicht wandern; Bewegung waere hier Zierde und
          wuerde beim zehnten Klick stoeren. 120 ms sind kurz genug,
          dass niemand wartet, und lang genug, dass es nicht springt.
        */}
        <div className="v2-tabinhalt" key={tab} style={{ marginTop: 16 }}>
          {tab === 'today' && <SuppToday />}
          {tab === 'stack' && <SuppStack />}
          {tab === 'extended' && (
            // G-110: Das Gate entscheidet SERVERSEITIG. Reicht der
            // Grad nicht, wird `SuppExtended` gar nicht gerendert —
            // vorher war es ein `useState` im Browser (G-92).
            // G-359/3: beides untereinander (E-68).
            <>
              {/* ══ G-423: Zyklen und Protokolle ═══════════════════
                  `[cmd]` **C-456 hat sie gebaut** — und keiner der
                  fuenf Schreibwege hatte einen Aufrufer.
                  `[read]` **Sie stehen im Extended-Reiter**, weil ein
                  PCT-Protokoll dorthin gehoert: es faengt einen
                  Zyklus ab, den der Grundreiter gar nicht kennt.
                  `[read]` **Und nur hinter dem Gate** — dieselbe
                  Schranke wie fuer den uebrigen Inhalt.

                  ══ G-428: sie stehen jetzt IN der Vorlage ══════════
                  **Tom:** *„nach modulmenu Zyklen und Protokolle
                  halbherzig eingebaut, was ist das?"*
                  `[cmd]` **Hier standen sie als eigene Geschwister
                  VOR `<SuppExtended/>`** — gemessen: zwei Kacheln vor
                  dem Raster `.v2-grid-14`, ueber die ganze Breite,
                  ohne Rahmen der Vorlage.
                  `[read]` **Die Schreibwege sind NICHT entfernt** —
                  sie sind dieselben Kacheln, nur an der Stelle, die
                  die Vorlage fuer sie hat. */}
              {gate?.offen && (
                <SuppExtended
                  protokolle={(
                    <ProtokollKarte
                      d={zyklen ?? { zyklen: [], protokolle: [], vorlagen: [], fehler: null }}
                      substanzen={substanzen.map(x => ({ id: x.id, name: x.name }))} />
                  )}
                  zyklen={(
                    <ZyklusKarte
                      d={zyklen ?? { zyklen: [], protokolle: [], vorlagen: [], fehler: null }}
                      substanzen={substanzen.map(x => ({ id: x.id, name: x.name }))} />
                  )} />
              )}
              {/* `[cmd]` G-365: die Linie stand unter einer
                  Datenbedingung. Sabotageprobe 2026-09-07 in
                  training und goals: ohne Daten verschwindet sie,
                  und der Mockup-Reiter steht ununterscheidbar da
                  wie eine echte Ansicht.

                  `[read]` Die Linie beschriftet, was DARUNTER
                  steht — und das steht unbedingt. */}
              <SuppExtendedReferenz />
              <ExtendedGesperrt g={gate ?? { grad: null, offen: false, fehler: null }} />
            </>
          )}
          {/* G-172: `database` ist kein eigener Tab mehr — der Inhalt
              steht auf `catalog`. Die Weiche bleibt als Umleitung
              stehen, damit ein alter Link (`?tab=database`) nicht ins
              Leere zeigt. */}
          {tab === 'database' && <SuppDatabase />}
          {/* `[cmd]` G-74: Compliance liest echt, sobald ein Protokoll
              vorliegt. Ohne Daten bleibt der Entwurf mit seiner Marke —
              dasselbe Muster wie bei Today, Stack, Database und Cost. */}
          {tab === 'compliance' && (
            <>
              {daten && daten.einnahmen.length > 0
                && <ComplianceEcht d={daten} heute={stichtag} />}
              <ReferenzTrenner reiter="Compliance" quelle={QUELLE} />
              <SuppCompliance />
            </>
          )}
          {/* ══ G-189: der Rueckfallzweig ist ENTFERNT ═══════════
              `[cmd]` **Hier stand `: <SuppInteractions />`.** Der
              Zweig griff nur bei `regeln.length === 0` — und
              `rule_catalog` traegt **64 Zeilen mit einer
              `{authenticated}`-Policy ohne Nutzerfilter (`qual:
              true`)**, gemessen 2026-08-28. **Er war nicht
              erreichbar.**

              `[read]` **G-163-Beschluss:** eine Rueckfallfassung
              bleibt nicht als Notanzeige stehen. **Ein Zweig, der nur
              bei einem Datenbankfehler erscheint, ist genau der Fall,
              fuer den die Regel geschrieben wurde** — er wird beim
              naechsten Umbau versehentlich wiederbelebt.

              `[read]` **Faellt `rule_catalog` wirklich aus, wirft der
              Lesepfad** — dann steht ein Fehler da, kein
              Ersatzinhalt. Das ist ehrlicher. */}
          {tab === 'interactions' && regeln && (
            <>
              <InteractionsEchtTab d={regeln} />
              <RegelHinweis />
              <FehlendeInteraktionsKacheln />
              <SuppInteractionsReferenz />
            </>
          )}
          {tab === 'cost' && <SuppCost />}
          {tab === 'injection' && (
            <>
              {/* ══ G-423/E-79: die Konfiguration steht OBEN ═════
                  **Tom:** *„der user waehlt … moegliche
                  injektionspunkte — und wir verwalten es."*
                  `[read]` **Erst die Auswahl, dann die Karte** — eine
                  Rotation ueber nicht gewaehlte Punkte waere ein
                  Vorschlag, den niemand bestellt hat. */}
              <InjektionsKonfigKarte
                k={konfig ?? { flaechen: [], vorschlag: null, fehler: null }}
                substanzen={injizierbare} />
              <SuppInjections stand={injektionen} stichtag={stichtag} />
              <SuppInjectionReferenz />
            </>
          )}
          {/* `[cmd]` G-91: Catalog liest `supplement_catalog` — 44
              Eintraege, `evidence_grade` auf allen gefuellt. Ohne
              Katalog bleibt der Entwurf mit seiner Marke, dasselbe
              Muster wie bei Compliance und Inventory. */}
          {/* C-229: es bleibt EIN Katalog — er steht im Database-Tab
              (566er, `SubstanzDatenbank`). Der Catalog-Tab zeigt bis
              zur Navigations-Entscheidung wieder den Entwurf mit
              seiner Marke; die 44er-Fassung (KatalogEcht) ist raus. */}
          {/* G-172: **Der Katalog-Entwurf ist geloescht, nicht
              versteckt.** `[cmd]` Er trug die Marke *„Es gibt keine
              Tabelle dafuer — die Zahlen stammen aus der Vorlage"* und
              stand neben der echten Datenbank, die am `Database`-Knopf
              hing. **Jetzt traegt `Katalog` die 566 Substanzen aus
              `substance_catalog`** (C-229). */}
          {/* ══ G-452: die 214.780 Lieferantenprodukte ══════════════
              `[read]` **KEINE Mockup-Referenz darunter** — E-70 kennt
              drei Zustaende, und dieser Reiter ist angebunden, ohne je
              eine Entwurfsfassung gehabt zu haben. **Die Vorlage
              `module-supplements.jsx` hat ihn nicht**; er entsteht aus
              Toms Vorgabe vom 2026-09-08, nicht aus einem Mockup.
              `[read]` **Eine Referenz auf etwas, das es nie gab, waere
              eine erfundene Herkunft.** */}
          {tab === 'produkte' && <SuppProdukte />}
          {tab === 'catalog' && <SuppDatabase />}
          {/* ══ G-468: DER VORLIEBEN-REITER ═══════════════
              `[read]` **Ohne Referenztrenner und ohne Attrappe** —
              die Flaeche ist vollstaendig angebunden (C-511), und
              es gibt keine Mockup-Vorlage dafuer: **Toms Vorgabe
              vom 2026-09-08, nicht aus einem Entwurf.** */}
          {tab === 'prefs' && (
            <SuppVorliebenTab d={{
              stand: vorlieben?.stand ?? VORGABE,
              marken: vorlieben?.marken ?? [],
              fehler: vorlieben?.fehler ?? null,
              allergien: allergien?.allergien ?? [],
              allergienFehler: allergien?.fehler ?? null,
            }} />
          )}
          {tab === 'stacks' && (
            <>
              <SuppStacks />
              <SuppStacksReferenz />
            </>
          )}
          {tab === 'intel' && (
            <>
              <SuppIntelligence />
              <FehlendeIntelKacheln />
              <SuppIntelligenceReferenz />
            </>
          )}
          {/* `[cmd]` G-74: Inventory rechnet die Reichweite aus
              `stock_remaining` gegen die Tagesdosis. Ohne Positionen
              bleibt der Entwurf stehen. */}
          {tab === 'inventory' && (
            <>
              {daten && daten.positionen.length > 0
                && <InventoryEcht d={daten} heute={stichtag} />}
              <ReferenzTrenner reiter="Inventory" quelle={QUELLE} />
              <SuppInventory />
            </>
          )}
        </div>

        {/* `[cmd]` **G-148: Die Modale stehen INNERHALB des Providers.**
            Vorher standen sie daneben — `useSupp()` lieferte dort den
            Vorgabewert (`daten: null`), und jedes schreibende Fenster
            meldete „Es sind keine Daten gelesen", obwohl die Seite
            daneben 360 Einnahmen zeigte. */}
        <SupplementsModale modal={modal} onClose={close}
          konfig={konfig?.flaechen ?? []} />
      </SuppCtx.Provider>
    </>
  )
}
