'use client'

// Drei Tabs: „Muscle map", „HRV" und „Sleep".
//
// QUELLE: theme-v1/module-recovery-v2.jsx:378-443 (`RecMuscleMap`),
// :446-537 (`RecHRV`), :540-645 (`RecSleep`).
//
// `[read]` Die drei gehoeren zusammen, weil sie dasselbe zeigen: eine
// Messgroesse, ihre Herleitung und ihren Verlauf. Jede von ihnen legt
// die Rechnung offen — die Vorlage druckt die Formel als Text unter
// das Ergebnis. **Das ist uebernommen**, nicht als Zierrat: es ist der
// Beleg, dass die Zahl nicht geraten ist.
//
// GEAENDERT IST NUR DAS TECHNISCHE: TypeScript, `v2-`-Praefix,
// `color-mix(in srgb, …)` -> `in oklch`, Tabellen in `v2-tbl-wrap`.
//
// `[cmd]` ALLES IST ATTRAPPE.
import * as React from 'react'
import { Card, Pill, Icon, Meter, Row, LineChart, Empty, ErmuedungsKarte } from '@lumeos/ui'

// G-163: die Entwurfsdaten der Rueckfallfassungen sind gefallen;
// CHECKIN/SLEEP_DATA/calcSleepScore braucht nur noch die
// Score-paths-Attrappe.
import {
  CHECKIN, MUSCLE_GROUPS_BODYMAP, MUSCLE_LABEL, MUSCLE_STATE, NUTRITION_INPUT,
  SLEEP_DATA,
  calcMuscleRecovery, calcSleepScore,
} from './motor'
// G-26: die anatomische Karte kommt jetzt aus packages/ui.
import { alsErmuedung, KARTE_ZU_RECOVERY } from './muskel-zuordnung'
import { useRecovery } from './kontext'
import { ATTRAPPE } from './ansicht'
// G-160: die erfassten Werte aus `recovery.checkins`.
import type { CheckinStand, CheckinZeile } from '../../../lib/recovery/checkin-read'
// `[cmd]` **G-435/A6: die Hierarchie fuer `Per-muscle detail`.**
// `[read]` **`baueBaum` rechnet nur** — keine Importe, also faellt es
// nicht ueber die `'use client'`-Grenze.
// `[cmd]` **G-436: `deckung` ist raus** — die Ansicht zeigt die
// Luecken je Zeile („nicht gezeichnet"), nicht mehr als Summe in
// einer Ueberschrift. **Geloescht wird die Funktion NICHT.**
import {
  baueBaum, mitWerten, type AstMitWert, type MuskelbaumStand,
} from '../../../lib/koerper/muskelbaum'
import { EBENEN } from '../../../lib/koerper/ebenen'
// `[cmd]` **G-438: die fehlende Uebersetzung** —
// motor.ts-Schluessel -> muscle_groups-Name.
import {
  wertKommtVonGruppe, SCHLUESSEL_ZU_GRUPPE,
} from '../../../lib/koerper/schluessel-gruppe'
// `[cmd]` **G-440: der gerechnete Zustand je Muskel.**
// `[read]` **Nur der TYP aus dem Leseweg** — ein Wert-Import
// zoege `next/headers` mit (G-430).
import type { MuskelzustandStand } from '../../../lib/training/muskelzustand-read'
// `[cmd]` **G-445: `muskelLage` kommt aus `muskelzustand.ts`, NICHT
// aus `-read.ts`** — die Rechendatei ist importfrei, der Leseweg
// zoege `next/headers` mit (dieselbe Falle wie oben, G-430).
import { muskelLage } from '../../../lib/training/muskelzustand'

/**
 * Das Etikett einer Kachel — und was daran noch geschaetzt ist.
 *
 * **Tom, 2026-09-13:** *„oben steht echte daten … das ist alles
 * dreck was hier geliefert wird und verarschend gegenueber mich."*
 *
 * `[cmd]` **Das alte Etikett haengte allein am Muskelkater** —
 * `echterKater ? 'echte Daten' : undefined`. **Stunden und Saetze
 * kamen aus 18 festen Mockup-Zeilen, und die Kachel behauptete
 * trotzdem „echte Daten".**
 *
 * `[read]` **Solange ein Teil geschaetzt ist, steht das dran.**
 * `[cmd]` **C-466 macht es vor:** `unmapped_taken_log_count` zaehlt,
 * was fehlt, statt es zu verschweigen.
 */
function datenEtikett(
  deckung: { gemessen: number; gesamt: number; rollenUngewichtet: boolean } | undefined,
  katerEcht: boolean,
): { marke: string; ton: 'pos' | 'warn'; erklaerung: string } {
  if (!deckung || deckung.gemessen === 0) {
    return {
      marke: 'keine Trainingsdaten',
      ton: 'warn',
      erklaerung: 'Kein Satz in `training.workout_sets` trifft einen '
        + 'dieser Muskeln — deshalb steht überall „--".',
    }
  }
  const teile: string[] = []
  // `[read]` **Jede Einschraenkung wird BENANNT**, nicht gezaehlt
  // und weggelassen.
  teile.push(`${deckung.gemessen} von ${deckung.gesamt} Muskeln `
    + 'aus workout_sets gerechnet')
  if (deckung.rollenUngewichtet) {
    teile.push('ein Satz zählt für jeden zugeordneten Muskel gleich '
      + '(primary wie secondary — C-487)')
  }
  if (!katerEcht) {
    teile.push('kein Check-in erfasst, Muskelkater fehlt')
  }
  teile.push('Schlaf und Ernährung aus dem Entwurf')

  return {
    // `[read]` **„teilweise gemessen" ist die ehrliche Marke** —
    // nicht „echte Daten", solange die Formel Entwurfszahlen
    // bekommt.
    marke: 'teilweise gemessen',
    ton: 'warn',
    erklaerung: teile.join(' · '),
  }
}

// ═══ MUSCLE MAP ══════════════════════════════════════════════════
// [cmd] module-recovery-v2.jsx:378-443.
export function RecMuscleMap({ stand, muskelbaum, muskelzustand }: {
  stand?: CheckinStand | null
  /** G-435/A6: die Hierarchie fuer `Per-muscle detail`. */
  muskelbaum?: MuskelbaumStand
  /**
   * G-440: der GERECHNETE Trainingszustand je Muskel.
   *
   * `[cmd]` **Hier stand `MUSCLE_STATE`** — 18 feste Zeilen aus
   * `module-recovery-engine.jsx:135-154`, mit `Push B · Wed` als
   * „letzter Sitzung". **Tom, 2026-09-13:** *„mir wird irgendwas
   * serviert aus den haenden gezogen und als echte daten
   * verkauft."*
   */
  muskelzustand?: MuskelzustandStand
}) {
  const { open } = useRecovery()

  // ══ G-364: der Muskelkater kommt aus dem Check-in ════════════
  //
  // **Tom, 2026-09-07:** *„DIE WAREN ANGEBUNDEN UND HABEN
  // VOLLUMFAENGLICH FUNKTIONIERT."*
  //
  // `[cmd]` **Gemessen 2026-09-06: `recovery.checkins.soreness` ist
  // ein `jsonb` und traegt je Muskel eine Stufe** — auf
  // `dev@lumeos.app` `{"back": 1, "chest": 1}`.
  //
  // `[cmd]` **`checkin-read.ts:28` liest es, `CheckinStreifen:59`
  // zeigt es** — **nur diese Kachel bekam es nie:
  // `<RecMuscleMap />` wurde ohne Prop aufgerufen**, anders als
  // `<RecHRV stand={checkins} />`.
  //
  // `[read]` **Was echt ist, ist jetzt echt:** Muskelkater und
  // Schlafqualitaet aus dem juengsten Check-in.
  //
  // `[cmd]` **Was Entwurf BLEIBT: `hours` und `sets` je Muskel** —
  // **dafuer gibt es keinen Leseweg** (kein Volumen je Muskelgruppe
  // in `apps/web/src/lib/training`). **Gemeldet, nicht erfunden**
  // (C-378) — die Kachel sagt es unten selbst.
  const neuster = stand?.neuster ?? null
  const echterKater = neuster?.soreness ?? null
  const echteSchlafguete = neuster?.sleep_quality ?? null

  // `[cmd]` **G-445: aus der Liste wieder ein `Set`** — sie kommt
  // als Array ueber die `'use client'`-Grenze, weil ein `Set` dort
  // als `{}` ankaeme.
  const katalog = React.useMemo(
    () => new Set(muskelzustand?.imKatalog ?? []),
    [muskelzustand])

  // ══ G-440: die KARTE rechnet aus denselben Daten wie die Liste ═
  //
  // **Tom, 2026-09-13:** *„es korrespondiert von der grafik nicht
  // in die liste."*
  //
  // `[cmd]` **Hier stand `MUSCLE_STATE[slug]`** — die Karte faerbte
  // aus 18 festen Mockup-Zeilen, waehrend die Liste daneben aus
  // `workout_sets` rechnete. **Zwei Quellen, ein Bild.**
  //
  // `[cmd]` **Der Weg vom Kuerzel zum Muskel steht in G-438:**
  // `SCHLUESSEL_ZU_GRUPPE` nennt die Muskelgruppe, an der die
  // Messung haengt.
  const rows = React.useMemo(() => {
    const nachName = new Map(
      (muskelbaum?.knoten ?? []).map(k => [k.name.toLowerCase(), k.id]))
    return MUSCLE_GROUPS_BODYMAP.map(slug => {
      const gruppe = SCHLUESSEL_ZU_GRUPPE[slug]
      const id = gruppe ? nachName.get(gruppe.toLowerCase()) : undefined
      // ══ G-445: nie belastet ist ERHOLT ═══════════════════════
      //
      // **Tom:** *„dann sollten alle nicht verwendeten muskeln
      // zumindest sicher mal gruen sein."*
      //
      // `[cmd]` **Hier stand `if (!st) return { value: null }`** —
      // **die Flaeche blieb grau.** `[read]` **Grau hiess
      // „unbekannt", gemeint war „unbelastet"** — zwei
      // verschiedene Sachen.
      const lage = id
        ? muskelLage(id, muskelzustand?.zustaende ?? {}, katalog)
        : { herkunft: 'nicht-im-katalog' as const, zustand: null }
      // `[read]` **Nicht im Katalog bleibt grau** — ihn kann keine
      // Uebung treffen, „erholt" waere dort eine Aussage ueber
      // etwas, das nie stattfinden kann.
      if (lage.herkunft === 'nicht-im-katalog') {
        return { slug, value: null as number | null, herkunft: lage.herkunft }
      }
      // `[read]` **Der Kater kommt aus dem Check-in**; ohne
      // Check-in ist er `0` — eine Angabe, kein geratener Wert.
      const kater = echterKater?.[slug] ?? 0
      const guete = echteSchlafguete ?? CHECKIN.sleep_quality
      const st = lage.zustand
      // `[cmd]` **Unbelastet: `hours` unendlich, `sets` 0** — und
      // `baseRecoveryCurve` gibt ab 96 h glatt 100. **Die Zahl
      // kommt aus derselben Formel wie jede andere.**
      const calc = calcMuscleRecovery({
        hours: st ? st.hours : Number.POSITIVE_INFINITY,
        sets: st ? st.sets : 0,
        sleepQuality: guete,
        proteinPct: NUTRITION_INPUT.proteinPct,
        caloriePct: NUTRITION_INPUT.caloriePct,
        soreness: kater,
      })
      return { slug, ...(st ?? {}), soreness: kater, ...calc,
        herkunft: lage.herkunft }
    }).sort((a, b) => (a.value ?? 999) - (b.value ?? 999))
  }, [echterKater, echteSchlafguete, muskelbaum, muskelzustand, katalog])

  // ══ G-440: das Etikett sagt, was gemessen ist ════════════════
  const etikett = datenEtikett(muskelzustand?.deckung, !!echterKater)

  const values = Object.fromEntries(rows.map(r => [r.slug, r.value]))

  return (
    <div className="v2-rec-grid-1135">
      <Card
        title="Muscle recovery"
        sub={etikett.erklaerung}
        actions={<Pill variant={etikett.ton}>{etikett.marke}</Pill>}
      >
        {/* G-26: die anatomische Karte. Sie bringt ihre Legende mit —
            die drei Zeilen, die hier standen, sind entfallen. */}
        <ErmuedungsKarte
          daten={alsErmuedung(values)}
          breite={180}
          onPick={(id, typ) => {
            const slug = KARTE_ZU_RECOVERY[id]
            if (typ === 'muscle' && slug) open({ typ: 'muscle', slug })
          }}
        />
        <div className="v2-divider" />
        <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Base recovery curve</div>
        <LineChart h={110} range={[0, 105]} xLabels={['0h', '12h', '24h', '48h', '72h', '96h']}
                   series={[{ data: [10, 30, 50, 75, 90, 100], color: 'var(--acc-recov)' }]} />
        <div className="v2-dim v2-mono" style={{ fontSize: 10, marginTop: 8, lineHeight: 1.7 }}>
          recovery = base(hours) × volume_mod × sleep_mod × nutrition_mod × soreness_mod
        </div>
      </Card>

      {/* ══ G-436: die Liste IST die Hierarchie ═══════════════════
          **Tom:** *„wir haben eine schoene auflistung und die soll
          aufgebohrt werden auf die hierarchie darunter im style von
          parent/childs, immer offen, und jedes teil anwaehlbar fuer
          details — gruppen und einzelmuskel."*

          `[cmd]` **Hier standen ZWEI Listen** — eine flache Tabelle
          mit 18 Kuerzeln und darunter mein Notbehelf aus G-435.
          **Jetzt eine.**

          `[read]` **Immer offen, kein Aufklappen** — 105 Namen in
          vier Ebenen. **Das ist lang, aber vollstaendig.** */}
      <Card
        title="Per-muscle detail"
        sub={etikett.erklaerung}
        actions={<Pill variant={etikett.ton}>{etikett.marke}</Pill>}
      >
        {(() => {
          const knoten = muskelbaum?.knoten ?? []
          if (knoten.length === 0) {
            // `[read]` **Kein Strich, sondern ein benannter
            // Leerhinweis** (E-72/G-161) — ein Strich hiesse „leer",
            // und hier ist „nicht gelesen" gemeint.
            return (
              <Empty title="Muskelbaum nicht gelesen"
                     sub="training.muscle_groups war beim Laden nicht erreichbar." />
            )
          }

          // `[cmd]` **`EBENEN` sagt, welchen Muskel eine Flaeche
          // WIRKLICH zeigt** — nicht `MUSKEL_ZU_FLAECHE`, das
          // beantwortet eine andere Frage (die Lehre aus G-432).
          const zeigt: Record<string, string> = {}
          for (const [code, e] of Object.entries(EBENEN)) {
            if (e.name) zeigt[e.name] = code
          }

          // ══ Der Wert je Knoten ═════════════════════════════════
          //
          // `[cmd]` **Gemessen** (`g436-zustaende.test.ts`,
          // 2026-09-12): **22 Namen gezeichnet, 21 davon mit Wert,
          // 1 ohne (`tibialis`), 83 ueberhaupt nicht gezeichnet.**
          //
          // `[read]` **Ein Muskel ohne Volumenzuordnung KANN keinen
          // Wert haben** — das ist C-487, nicht mein Fehler.
          const werte = mitWerten(baueBaum(knoten, zeigt), a => {
            // ══ G-440: der Zustand kommt aus `workout_sets` ══════
            //
            // `[cmd]` **Hier stand `MUSCLE_STATE[slug]`** — eine von
            // 18 festen Zeilen. **Jetzt je `muscle_group_id` aus
            // dem Trainingstagebuch gerechnet.**
            //
            // `[read]` **Kein Eintrag heisst KEIN Wert** — nicht 0.
            // **Wo kein Satz auf einen Muskel zeigt, hat er
            // keinen.**
            const id = knoten.find(
              k => k.name.toLowerCase() === a.name.toLowerCase())?.id
            // ══ G-445: dieselbe Entscheidung wie auf der Karte ═══
            //
            // `[cmd]` **Hier stand `if (!st) return null`** — und
            // die Zeile zeigte „--  kein Volumen zugeordnet".
            // `[read]` **Ein nie trainierter Muskel ist erholt, nicht
            // unbekannt** (Tom, G-445).
            const lage = id
              ? muskelLage(id, muskelzustand?.zustaende ?? {}, katalog)
              : { herkunft: 'nicht-im-katalog' as const, zustand: null }
            if (lage.herkunft === 'nicht-im-katalog') return null
            const st = lage.zustand
            const slug = a.flaeche ? KARTE_ZU_RECOVERY[a.flaeche] : null
            const kater = slug ? echterKater?.[slug] ?? 0 : 0
            const guete = echteSchlafguete ?? CHECKIN.sleep_quality
            const wert = calcMuscleRecovery({
              hours: st ? st.hours : Number.POSITIVE_INFINITY,
              sets: st ? st.sets : 0,
              sleepQuality: guete,
              proteinPct: NUTRITION_INPUT.proteinPct,
              caloriePct: NUTRITION_INPUT.caloriePct,
              soreness: kater,
            }).value
            // ══ G-438: woher kommt dieser Wert? ══════════════════
            //
            // **Tom:** *„arms triceps ist orange, zeigt aber keine
            // werte in der liste."*
            //
            // `[cmd]` **Die Karte faerbt die drei KOEPFE, gemessen
            // ist der ELTERNTEIL `Triceps`.** `[read]` **Wo der
            // gezeichnete Muskel nicht die Gruppe IST, an der die
            // Messung haengt, ist der Wert geliehen** — und die
            // Zeile sagt es dazu.
            const gruppe = wertKommtVonGruppe(a.name, slug)
            return gruppe ? { wert, vonGruppe: gruppe } : wert
          })

          function zeile(a: AstMitWert): React.ReactNode {
            const slug = a.flaeche ? KARTE_ZU_RECOVERY[a.flaeche] : null
            const id = knoten.find(
              k => k.name.toLowerCase() === a.name.toLowerCase())?.id
            // `[cmd]` **G-445: die Herkunft gehoert AN DIE ZEILE** —
            // wer nachsieht, muss erkennen koennen, ob ein Wert
            // gerechnet oder unbelastet ist.
            const lage = id
              ? muskelLage(id, muskelzustand?.zustaende ?? {}, katalog)
              : { herkunft: 'nicht-im-katalog' as const, zustand: null }
            const st = lage.zustand
            // `[read]` **Der Kater kommt aus `recovery.checkins`** —
            // die EINZIGE Groesse, die schon vorher echt war.
            const sore = slug && echterKater ? echterKater[slug] : undefined
            const farbe = a.wert == null ? 'var(--fg-dim)'
              : a.wert >= 80 ? 'var(--pos)'
              : a.wert >= 50 ? 'var(--warn)' : 'var(--neg)'

            // ══ Anwaehlbar: Gruppe UND Muskel ════════════════════
            //
            // `[read]` **Tom:** *„jedes teil anwaehlbar fuer details
            // — gruppen und einzelmuskel."*
            //
            // `[cmd]` **Gemessen: ein Klick auf `Arms` oeffnete
            // NICHTS** — eine Gruppe hat keine Kartenflaeche, also
            // kein Kuerzel. **Deshalb zwei Ziele:** ein Muskel
            // oeffnet sein Detail, eine Gruppe ihr eigenes Fenster.
            const oeffne = slug
              ? () => open({ typ: 'muscle', slug })
              : a.kinder.length > 0
                ? () => open({ typ: 'muskelgruppe', name: a.name })
                : undefined

            return (
              <div key={`${a.name}-${a.ebene}`}>
                <div
                  data-muskelzeile={a.name}
                  onClick={oeffne}
                  style={{
                    display: 'flex', alignItems: 'baseline', gap: 8,
                    // ══ G-438/A4: die Hauptgruppen abgrenzen ═════
                    //
                    // **Tom:** *„hauptgruppen sollen besser
                    // ersichtlich sein und gegen naechste
                    // hauptgruppe unterteilt sein."*
                    //
                    // `[read]` **Acht Wurzeln** — sie standen in
                    // derselben Groesse wie ihre Kinder, `Arms` und
                    // `Biceps` sahen gleich wichtig aus.
                    paddingTop: a.ebene === 1 ? 10 : 3,
                    paddingBottom: 3,
                    paddingLeft: (a.ebene - 1) * 14,
                    fontSize: a.ebene === 1 ? 13.5 : a.ebene === 2 ? 12 : 11.5,
                    fontWeight: a.ebene === 1 ? 700
                      : a.kinder.length > 0 ? 600 : 400,
                    letterSpacing: a.ebene === 1 ? '0.02em' : undefined,
                    textTransform: a.ebene === 1 ? 'uppercase' as const : undefined,
                    cursor: oeffne ? 'pointer' : 'default',
                    // `[read]` **Nicht gezeichnet = grau** — der
                    // dritte Zustand, sichtbar verschieden von „--".
                    color: a.flaeche ? 'var(--fg)' : 'var(--fg-dim)',
                    borderRadius: 3,
                  }}
                >
                  <span style={{ flex: 1 }}>{a.name}</span>

                  {/* ══ Gruppe: Schnitt UND Engpass ═══════════════
                      **Tom:** *„wieso waehlen wenn man beides haben
                      kann?"* */}
                  {a.kinder.length > 0 && a.schnitt != null && (
                    <>
                      <span className="v2-num" style={{ fontSize: 11 }}>
                        Ø {a.schnitt}%
                      </span>
                      {a.engpass && (
                        <span className="v2-dim" style={{ fontSize: 10 }}>
                          · schwächstes: {a.engpass.name} {a.engpass.wert}%
                        </span>
                      )}
                    </>
                  )}

                  {/* ══ Blatt mit Wert ════════════════════════════ */}
                  {a.wert != null && (
                    <>
                      <span className="v2-num" style={{
                        fontSize: 11,
                        color: a.vonGruppe ? 'var(--fg-muted)' : farbe,
                        fontWeight: a.vonGruppe ? 400 : 600,
                        minWidth: 34, textAlign: 'right',
                      }}>{a.wert}%</span>
                      {/* ══ G-438, Auflage 1 (Tom) ═══════════════
                          *„‚Wert von Triceps' steht AM KIND, nicht
                          nur die Zahl. Sonst sieht es aus wie eine
                          eigene Messung."* */}
                      {a.vonGruppe ? (
                        <span className="v2-dim" style={{ fontSize: 9.5 }}>
                          Wert von {a.vonGruppe}
                        </span>
                      ) : st ? (
                        <span className="v2-dim v2-mono" style={{ fontSize: 9.5 }}>
                          {sore != null ? `${sore}/3 · ` : ''}{st.hours} h
                          {' · '}{st.sets} Sätze
                          {' · '}{st.lastSession}
                        </span>
                      ) : lage.herkunft === 'unbelastet' && (
                        // ══ G-445/A3: gerechnet ODER unbelastet ═══
                        //
                        // `[read]` **Die 100 % ohne diesen Zusatz
                        // saehen aus wie eine Messung.** **Sie sind
                        // die Antwort der Formel auf „nie belastet"**
                        // — und die Zeile sagt es, statt es zu
                        // verschweigen (E-72).
                        <span className="v2-dim" style={{ fontSize: 9.5 }}>
                          unbelastet · nie trainiert
                        </span>
                      )}
                    </>
                  )}

                  {/* ══ Die beiden Leerzustaende, benannt ═════════
                      `[cmd]` **„-- ist die Antwort, nicht 0"** —
                      eine Null saehe aus wie „voellig unerholt".
                      `[read]` **Und die beiden Gruende sind
                      VERSCHIEDEN**: kein Volumen (C-487) gegen
                      nicht gezeichnet. */}
                  {a.wert == null && a.schnitt == null && (
                    <>
                      <span className="v2-num v2-dim" style={{
                        fontSize: 11, minWidth: 34, textAlign: 'right',
                      }}>--</span>
                      <span className="v2-dim" style={{ fontSize: 9.5 }}>
                        {/* ══ G-438: der VIERTE Grund ═══════════════
                            `[cmd]` **Auflage 2 hat eine Nebenwirkung:**
                            eine Gruppe, deren Kinder ihren Wert alle
                            von ihr GELIEHEN haben, hat keinen Schnitt
                            — richtig so, es waere eine Scheinrechnung.
                            `[read]` **Aber dann stuende sie stumm da.**
                            **Der Grund wird benannt**, nicht
                            verschwiegen (E-72). */}
                        {/* ══ G-445/A2: „kein Volumen zugeordnet"
                            ist WEG ══════════════════════════════
                            `[read]` **Er war nie ein Zustand,
                            sondern eine fehlende Antwort** — ein
                            Muskel ohne Satz ist unbelastet und
                            damit erholt, nicht unbekannt.
                            `[cmd]` **Was bleibt, ist der
                            KATALOGbefund:** 15 der 105
                            Muskelgruppen kommen in
                            `exercise_muscles` gar nicht vor
                            (gemessen 2026-09-13) — **die kann
                            keine Uebung treffen.** */}
                        {lage.herkunft === 'nicht-im-katalog' && a.flaeche
                          ? 'keine Uebung trifft ihn'
                          : a.kinder.length > 0 && a.kinder.some(k => k.vonGruppe)
                            ? 'Kinder ohne eigene Messung'
                            : 'nicht gezeichnet'}
                      </span>
                    </>
                  )}
                </div>
                {a.kinder.map(k => zeile(k))}
              </div>
            )
          }

          return (
            <div className="v2-col-gap" style={{ gap: 0 }}>
              {/* `[read]` **Eine Linie ZWISCHEN den Wurzeln** —
                  nicht vor der ersten, sonst haengt sie unter der
                  Kachelkante. */}
              {werte.map((a, i) => (
                <React.Fragment key={a.name}>
                  {i > 0 && <div className="v2-divider" style={{ margin: '8px 0 0' }} />}
                  {zeile(a)}
                </React.Fragment>
              ))}
            </div>
          )
        })()}
      </Card>
    </div>
  )
}

// ═══ HRV ═════════════════════════════════════════════════════════
// [cmd] module-recovery-v2.jsx:446-537.
//
// G-160: Mit geladenen Check-ins rendern die erfassten Werte — der
// Entwurf bleibt nur ohne Sitzung stehen (Muster G-65/G-159).
export function RecHRV({ stand }: { stand?: CheckinStand | null }) {
  if (stand && stand.zeilen.length > 0) return <HrvEcht stand={stand} />
  // G-163: die Rueckfallfassung ist raus — statt erfundener Werte
  // steht hier, dass nicht gelesen werden konnte (kein Strich: ein
  // Strich hiesse "leer" statt "nicht gelesen", G-161).
  return (
    <Card title="HRV">
      <Empty
        title="Nicht geladen"
        sub={stand?.fehler
          ? `recovery.checkins meldet: ${stand.fehler}`
          : 'recovery.checkins kam für dieses Konto leer zurück — kein Check-in erfasst.'}
        icon="trend_up"
      />
    </Card>
  )
}

/**
 * Die HRV-Kacheln aus `recovery.checkins` (G-160).
 *
 * **Was hier NICHT steht: ein Score.** `[read]` Die Entwurfsformel
 * (score = 70 + z×15, Anker z+2→100) ist dieselbe Klasse unbelegter
 * Setzung wie die entfernten C-124/C-181-Werte; der Erholungswert des
 * Tages steht in `recovery.scores` und wird dort gezeigt. Hier stehen
 * die MESSWERTE: RMSSD je Tag, dazu Mittel und Streuung der letzten
 * Zeilen — deskriptive Statistik der Erfassung, kein Urteil.
 *
 * `[cmd]` Nicht angebunden bleiben ausdruecklich: „Phone camera HRV"
 * (Geraetefunktion fehlt ganz) und ein Messprotokoll mit method/
 * quality/note — das braeuchte `recovery.hrv_measurements` (C-219).
 */
function HrvEcht({ stand }: { stand: CheckinStand }) {
  const mitHrv = stand.zeilen.filter(z => z.hrv_rmssd != null)
  const neuster = mitHrv[0] ?? null
  const werte = mitHrv.map(z => Number(z.hrv_rmssd))
  const mittel = werte.length
    ? werte.reduce((s, v) => s + v, 0) / werte.length : null
  const sd = werte.length > 1 && mittel !== null
    ? Math.sqrt(werte.reduce((s, v) => s + (v - mittel) ** 2, 0) / (werte.length - 1))
    : null

  // Chronologisch fuer die Kurve — geliefert wird absteigend.
  const kurve = [...mitHrv].reverse()

  return (
    <div className="v2-grid-14">
      <div className="v2-col-gap" style={{ gap: 14 }}>
        <Card
          title="HRV"
          sub={`${mitHrv.length} von ${stand.zeilen.length} Check-ins mit Messwert · recovery.checkins`}
        >
          <div className="v2-rec-ring-zeile">
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="v2-grid v2-g-cols-2" style={{ gap: 10 }}>
                {([
                  ['Jüngster RMSSD', neuster ? `${Number(neuster.hrv_rmssd)} ms` : null,
                    neuster?.entry_date ?? ''],
                  ['Mittel', mittel !== null ? `${mittel.toFixed(1)} ms` : null,
                    `über ${werte.length} Messungen`],
                  ['Streuung', sd !== null ? `± ${sd.toFixed(1)}` : null, 'Stichproben-SD'],
                  ['Erfassung', `${mitHrv.length} Tage`, 'im geladenen Fenster'],
                ] as Array<[string, string | null, string]>).map(([l, v, s]) =>
                  v === null ? null : (
                    <div key={l} style={{
                      padding: 9, background: 'var(--bg-elev)',
                      border: '1px solid var(--border)', borderRadius: 5,
                    }}>
                      <div className="v2-eyebrow" style={{ marginBottom: 2 }}>{l}</div>
                      <div className="v2-num" style={{ fontSize: 15 }}>{v}</div>
                      {s && <div className="v2-dim v2-mono" style={{ fontSize: 9, marginTop: 2 }}>{s}</div>}
                    </div>
                  ))}
              </div>
            </div>
          </div>
          <div className="v2-divider" />
          <div className="v2-dim" style={{ fontSize: 10.5, lineHeight: 1.55 }}>
            Ohne Score: die Entwurfsformel (70 + z×15 mit gesetzten Ankern)
            ist unbelegt — der Erholungswert des Tages steht in{' '}
            <span className="v2-mono">recovery.scores</span> und rechnet dort.
          </div>
        </Card>

        <Card title="Messprotokoll" sub="Datum und RMSSD, wie erfasst">
          <div className="v2-tbl-wrap">
            <table className="v2-tbl">
              <thead>
                <tr>
                  <th style={{ width: 110 }}>Datum</th>
                  <th style={{ width: 90, textAlign: 'right' }}>RMSSD</th>
                  <th style={{ width: 90, textAlign: 'right' }}>Ruhepuls</th>
                </tr>
              </thead>
              <tbody>
                {mitHrv.slice(0, 12).map(z => (
                  <tr key={z.entry_date}>
                    <td className="v2-num v2-muted">{z.entry_date}</td>
                    <td className="v2-num" style={{ textAlign: 'right' }}>
                      {Number(z.hrv_rmssd)} <span className="v2-dim" style={{ fontSize: 9 }}>ms</span>
                    </td>
                    <td className="v2-num v2-muted" style={{ textAlign: 'right' }}>
                      {z.resting_hr != null ? Number(z.resting_hr) : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="v2-dim" style={{ fontSize: 10, marginTop: 8, lineHeight: 1.5 }}>
            Methode, Signalqualität und Notiz je Messung brauchen eine
            Tabelle recovery.hrv_measurements — gemeldet (C-219), nicht erfunden.
          </div>
        </Card>
      </div>

      <div className="v2-col-gap" style={{ gap: 14 }}>
        {/* Die Geraetefunktion fehlt ganz — bleibt Attrappe, mit Marke. */}
        <PhoneCameraKachel />

        {kurve.length >= 2 && mittel !== null && (
          <Card title="Verlauf" sub={`${kurve.length} Messungen · Mittel als Linie`}>
            <LineChart
              h={150}
              range={[Math.min(...werte) - 10, Math.max(...werte) + 10]}
              xLabels={kurve.map((z, i) =>
                i === 0 || i === kurve.length - 1 ? z.entry_date.slice(5) : '')}
              series={[
                { data: kurve.map(z => Number(z.hrv_rmssd)), color: 'var(--acc-recov)' },
                { data: Array(kurve.length).fill(Number(mittel.toFixed(1))), color: 'var(--fg-dim)' },
              ]}
            />
            <div style={{
              display: 'flex', gap: 14, marginTop: 8, fontSize: 10.5,
              color: 'var(--fg-muted)', flexWrap: 'wrap',
            }}>
              <span className="v2-row-gap"><span className="v2-dot" style={{ background: 'var(--acc-recov)' }} />RMSSD</span>
              <span className="v2-row-gap"><span className="v2-dot" style={{ background: 'var(--fg-dim)' }} />Mittel</span>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

/**
 * „Phone camera HRV" — in beiden Zweigen dieselbe, und in beiden
 * Attrappe: die Geraetefunktion (PPG ueber die Kamera) fehlt ganz.
 */
function PhoneCameraKachel() {
  const { open } = useRecovery()
  return (
    <Card title="Phone camera HRV" sub="no wearable required" attrappe={ATTRAPPE}>
      <div style={{
        padding: 14, background: 'color-mix(in oklch, var(--acc-recov) 6%, var(--surface))',
        border: '1px solid color-mix(in oklch, var(--acc-recov) 24%, var(--border))',
        borderRadius: 7, marginBottom: 12,
      }}>
        <div style={{ fontSize: 12.5, lineHeight: 1.6, color: 'var(--fg-muted)' }}>
          Index finger on the camera lens with the flash on. 60 seconds of PPG signal gives R-R intervals, which give RMSSD. Validated at r = 0.98 against a chest strap.
        </div>
      </div>
      <Row label="Duration" value="60 seconds" />
      <Row label="Accuracy vs. strap" value="r = 0.98" />
      <Row label="Limitations" value="motion, poor lighting" />
      <Row label="Best time" value="on waking, before standing" />
      <div style={{ marginTop: 12 }}>
        <button type="button" className="v2-btn v2-btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => open({ typ: 'hrvMeasure' })}>
          <Icon name="camera" className="v2-ic v2-ic-sm" />Start 60-second measurement
        </button>
      </div>
    </Card>
  )
}

// ═══ SLEEP ═══════════════════════════════════════════════════════
// [cmd] module-recovery-v2.jsx:540-645.
//
// G-160: Mit geladenen Check-ins rendern die erfassten Werte.
export function RecSleep({ stand }: { stand?: CheckinStand | null }) {
  if (stand && stand.zeilen.length > 0) return <SleepEcht stand={stand} />
  // G-163: Rueckfall raus, Hinweis statt Entwurf.
  return (
    <Card title="Sleep">
      <Empty
        title="Nicht geladen"
        sub={stand?.fehler
          ? `recovery.checkins meldet: ${stand.fehler}`
          : 'recovery.checkins kam für dieses Konto leer zurück — kein Check-in erfasst.'}
        icon="moon"
      />
    </Card>
  )
}

/**
 * Die Schlaf-Kacheln aus `recovery.checkins` (G-160).
 *
 * `[cmd]` Was die Tabelle NICHT hat und deshalb fehlt statt erfunden
 * zu werden: Schlafphasen (deep/REM/light/awake), Bettzeit und
 * Effizienz brauchen `recovery.sleep_data` (C-219); die Spalten
 * sleep_start_time/sleep_end_time existieren, sind aber auf allen 170
 * Zeilen leer — gemeldet. Erfasst sind Stunden und Qualitaet, dazu
 * die Hygiene-Felder (Koffein, Alkohol, Bildschirm, Stress) auf allen
 * Zeilen.
 */
function SleepEcht({ stand }: { stand: CheckinStand }) {
  const neuster = stand.neuster!
  const naechte = stand.zeilen.filter(z => z.sleep_hours != null)
  const letzte14 = naechte.slice(0, 14)
  const mittel14 = letzte14.length
    ? letzte14.reduce((s, z) => s + Number(z.sleep_hours), 0) / letzte14.length
    : null

  const std = (h: number) =>
    `${Math.floor(h)}:${String(Math.round((h % 1) * 60)).padStart(2, '0')}`

  return (
    <div className="v2-grid-14">
      <div className="v2-col-gap" style={{ gap: 14 }}>
        <Card
          title="Letzte Nacht"
          sub={`${neuster.entry_date} · recovery.checkins`}
        >
          <div className="v2-rec-ring-zeile">
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="v2-num" style={{ fontSize: 26, lineHeight: 1, marginBottom: 4 }}>
                {neuster.sleep_hours != null ? std(Number(neuster.sleep_hours)) : ''}
                {neuster.sleep_hours != null && (
                  <span className="v2-dim" style={{ fontSize: 12, marginLeft: 5 }}>Std geschlafen</span>
                )}
              </div>
              {neuster.sleep_quality != null && (
                <div className="v2-muted" style={{ fontSize: 11.5 }}>
                  Qualität {neuster.sleep_quality}/10 — Selbsteinschätzung aus dem Check-in
                </div>
              )}
            </div>
          </div>
          <div className="v2-divider" />
          <div className="v2-dim" style={{ fontSize: 10.5, lineHeight: 1.55 }}>
            Ohne Phasen, Bettzeit und Effizienz: dafür braucht es{' '}
            <span className="v2-mono">recovery.sleep_data</span> (C-219);{' '}
            <span className="v2-mono">sleep_start_time</span>/<span className="v2-mono">sleep_end_time</span>{' '}
            existieren als Spalten, sind aber auf allen Zeilen leer.
          </div>
        </Card>

        {letzte14.length >= 2 && (
          <Card
            title="14 Nächte"
            sub={`Schlafdauer je Nacht · Mittel ${mittel14 !== null ? mittel14.toFixed(1) : ''} h`}
          >
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${letzte14.length}, 1fr)`,
              gap: 3, height: 96, alignItems: 'end',
            }}>
              {[...letzte14].reverse().map(z => {
                const h = Number(z.sleep_hours)
                return (
                  <div key={z.entry_date}
                       title={`${z.entry_date}: ${h.toFixed(1)} h${z.sleep_quality != null ? ` · Qualität ${z.sleep_quality}/10` : ''}`}
                       style={{
                         height: `${Math.min(100, (h / 10) * 100)}%`,
                         background: 'var(--acc-recov)',
                         opacity: z.sleep_quality != null ? 0.4 + (z.sleep_quality / 10) * 0.6 : 0.7,
                         borderRadius: '2px 2px 0 0',
                       }} />
                )
              })}
            </div>
            <div style={{
              display: 'flex', justifyContent: 'space-between', marginTop: 6,
              fontSize: 9.5, color: 'var(--fg-dim)', fontFamily: 'var(--font-mono)',
            }}>
              <span>{letzte14[letzte14.length - 1].entry_date}</span>
              <span>{letzte14[0].entry_date}</span>
            </div>
            <div className="v2-dim" style={{ fontSize: 10, marginTop: 6 }}>
              Deckkraft = Qualität (dunkler heißt besser bewertet). Keine
              Phasenfarben — Phasen werden nicht erfasst.
            </div>
          </Card>
        )}
      </div>

      <div className="v2-col-gap" style={{ gap: 14 }}>
        {/* Der Vergleich der zwei Rechenwege braucht sleep_data — die
            Kachel bleibt Attrappe, mit Marke. */}
        <ScorePathsKachel />

        <Card title="Schlafhygiene" sub={`aus dem Check-in · ${neuster.entry_date}`}>
          {neuster.caffeine_mg != null && (
            <Row label="Koffein" value={`${Number(neuster.caffeine_mg)} mg`} />
          )}
          {neuster.alcohol_units != null && (
            <Row label="Alkohol" value={`${Number(neuster.alcohol_units)} Einheiten`} />
          )}
          {neuster.screen_time_before_bed != null && (
            <Row label="Bildschirm vor dem Schlafen" value={`${Number(neuster.screen_time_before_bed)} min`} />
          )}
          {neuster.stress_level != null && (
            <Row label="Stress" value={`${neuster.stress_level}/10`} />
          )}
          <div className="v2-divider" />
          <div className="v2-dim" style={{ fontSize: 10.5, lineHeight: 1.5 }}>
            Erfasste Werte, keine Deutung — ob 300 mg Koffein „zu viel&quot;
            sind, ist eine Schwellenfrage ohne belegte Quelle im Repo.
          </div>
        </Card>
      </div>
    </div>
  )
}

/**
 * „Score paths" — in beiden Zweigen dieselbe, und in beiden Attrappe:
 * der Wearable-Pfad braucht `recovery.sleep_data` (Phasen, Effizienz),
 * die es nicht gibt (C-219).
 */
function ScorePathsKachel() {
  const w = calcSleepScore(SLEEP_DATA, CHECKIN)
  const s = calcSleepScore(null, CHECKIN)
  return (
    <Card title="Score paths" sub="wearable vs. subjective" attrappe={ATTRAPPE}>
      <div className="v2-col-gap" style={{ gap: 8 }}>
        <div style={{
          padding: 11, background: 'color-mix(in oklch, var(--pos) 6%, var(--surface))',
          border: '1px solid color-mix(in oklch, var(--pos) 26%, var(--border))', borderRadius: 6,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 12, fontWeight: 600 }}>Wearable path</span>
            <Pill variant="pos" style={{ marginLeft: 'auto' }}>active</Pill>
          </div>
          <div className="v2-num" style={{ fontSize: 20, color: 'var(--pos)' }}>{w.score}</div>
          <div className="v2-dim v2-mono" style={{ fontSize: 10, marginTop: 3 }}>efficiency 0.4 + duration 0.4 + deep 0.2</div>
        </div>
        <div style={{ padding: 11, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6 }}>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Subjective fallback</div>
          <div className="v2-num" style={{ fontSize: 20, color: 'var(--fg-muted)' }}>{s.score}</div>
          <div className="v2-dim v2-mono" style={{ fontSize: 10, marginTop: 3 }}>quality 0.6 + duration 0.4</div>
        </div>
      </div>
      <div className="v2-dim" style={{ fontSize: 10.5, marginTop: 10, lineHeight: 1.5 }}>
        The subjective path is what most users get. It never blocks a score — the engine degrades gracefully rather than refusing to compute.
      </div>
    </Card>
  )
}
