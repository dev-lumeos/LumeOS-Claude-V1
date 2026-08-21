'use client'

// Der Nutrients-Tab (G-101, G-121), seit G-122 mit dem echten Baum
// aus `parent_code`, klappbar auf JEDER Ebene, gespeicherter Ansicht
// und Detailmodal.
//
// **KLAPPEN:** Tom: „Ich will jede Ebene im Baum ein- und ausklappen
// koennen. Startet mit alles zu, und danach wird die letzte Sicht
// gespeichert fuer den User." Jeder Knoten mit Kindern traegt einen
// Chevron; der Start ist ueberall zu; die Menge der offenen Knoten
// (plus Fenster und Filter) geht als eine Ansicht nach
// `public.user_display_preferences` — in die Datenbank, nicht in den
// Browser (Begruendung: dieselbe Sicht am Telefon).
//
// **FILTER:** ein aktiver Scope zeigt die Treffer unabhaengig vom
// Klappzustand (wer nach Auffaelligem fragt, will es sehen) und
// laesst Eltern auffaelliger Kinder stehen (`kindTrifft`, die
// `hasChildOutOfRange`-Regel der Vorlage).
//
// **MODAL:** Klick auf die Zeile oeffnet das Detailmodal (G-122);
// der Chevron klappt nur.
import * as React from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import type { Route } from 'next'
import { Card, Pill, Icon } from '@lumeos/ui'

import type {
  NaehrstoffOrdnung, NaehrstoffGruppe, NaehrstoffKnoten,
} from '../../../lib/nutrition/naehrstoff-ordnung'
import {
  FENSTER, sichtbar, zaehleSichtbare, STATUS_TEXT, STATUS_FARBE,
  zahlMitEinheit as zahl, type Scope, type GespeicherteAnsicht,
} from '../../../lib/nutrition/naehrstoff-anzeige'
import { NaehrstoffModal } from './naehrstoff-modal'

/** Gruppennamen und Codes teilen sich die `offen`-Menge; das Praefix
 *  haelt sie auseinander (ein Code heisst nie `g:…`). */
const GRUPPE = 'g:'

type Auswahl = { knoten: NaehrstoffKnoten; elternName: string | null }

export function NaehrstoffOrdnungTab({ d }: { d: NaehrstoffOrdnung }) {
  const [offen, setOffen] = React.useState<Set<string>>(
    () => new Set(d.gespeichert?.offen ?? []))
  const [scope, setScope] = React.useState<Scope>(d.gespeichert?.scope ?? 'alle')
  const [auswahl, setAuswahl] = React.useState<Auswahl | null>(null)

  const router = useRouter()
  const pfad = usePathname()
  const suche = useSearchParams()

  // Die letzte Sicht speichern — gesammelt (600 ms), damit ein
  // Klickgewitter nicht je Klick eine Zeile schreibt. Der letzte
  // Stand gewinnt; ein Fehlschlag ist still: die Ansicht ist Komfort,
  // kein Datenverlust.
  const speicherTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const speichern = React.useCallback((ansicht: GespeicherteAnsicht) => {
    if (speicherTimer.current) clearTimeout(speicherTimer.current)
    speicherTimer.current = setTimeout(() => {
      void fetch('/api/nutrition/ansicht', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(ansicht),
      }).catch(() => undefined)
    }, 600)
  }, [])

  const fensterSetzen = React.useCallback((tage: number) => {
    speichern({ offen: Array.from(offen), fenster: tage, scope })
    const p = new URLSearchParams(suche?.toString() ?? '')
    if (tage === 1) p.delete('fenster')
    else p.set('fenster', String(tage))
    const rest = p.toString()
    router.push((rest ? `${pfad}?${rest}` : pfad) as Route)
  }, [router, pfad, suche, offen, scope, speichern])

  const scopeSetzen = React.useCallback((s: Scope) => {
    setScope(s)
    speichern({ offen: Array.from(offen), fenster: d.fenster, scope: s })
  }, [offen, d.fenster, speichern])

  const umschalten = React.useCallback((schluessel: string) => {
    setOffen(alt => {
      const n = new Set(alt)
      if (n.has(schluessel)) n.delete(schluessel)
      else n.add(schluessel)
      speichern({ offen: Array.from(n), fenster: d.fenster, scope })
      return n
    })
  }, [d.fenster, scope, speichern])

  if (d.fehler) {
    return (
      <Card title="Naehrstoffe">
        <p className="v2-muted" style={{ fontSize: 12 }}>Nicht gelesen: {d.fehler}</p>
      </Card>
    )
  }

  const istTag = d.fenster === 1

  return (
    <div className="v2-col-gap" style={{ gap: 14 }}>
      <Card title="Naehrstoffordnung" sub={`${d.gesamt} Naehrstoffe in ${d.gruppen.length} Gruppen`}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
          <div className="v2-segmented" role="group" aria-label="Zeitfenster">
            {FENSTER.map(t => (
              <button
                key={t}
                type="button"
                className={d.fenster === t ? 'v2-btn v2-btn-primary' : 'v2-btn v2-btn-ghost'}
                style={{ height: 24, fontSize: 11, padding: '0 10px', borderRadius: 5 }}
                aria-pressed={d.fenster === t}
                onClick={() => fensterSetzen(t)}
              >
                {t === 1 ? 'Heute' : `${t} Tage`}
              </button>
            ))}
          </div>
          <div className="v2-segmented" role="group" aria-label="Filter">
            {([['alle', 'Alle'], ['auffaellig', 'Auffaellig'], ['unter', 'Unter Ziel']] as const).map(([k, l]) => (
              <button
                key={k}
                type="button"
                className={scope === k ? 'v2-btn v2-btn-primary' : 'v2-btn v2-btn-ghost'}
                style={{ height: 24, fontSize: 11, padding: '0 10px', borderRadius: 5 }}
                aria-pressed={scope === k}
                onClick={() => scopeSetzen(k)}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <p className="v2-muted" style={{ fontSize: 11.5, lineHeight: 1.55 }}>
          {istTag ? (
            <>
              <strong>{d.messbar} von {d.gesamt}</strong> tragen fuer diesen Tag
              einen Wert — gezeigt wird die <strong>Tagessumme</strong>, daneben
              aus wievielen Positionen sie stammt. Wo Positionen ohne Wert
              blieben, ist die Summe eine Untergrenze.
            </>
          ) : (
            <>
              <strong>{d.messbar} von {d.gesamt}</strong> tragen im Fenster einen
              Wert — gezeigt wird der <strong>Schnitt je protokolliertem
              Tag</strong> ({d.tageErfasst} {d.tageErfasst === 1 ? 'Tag' : 'Tage'} erfasst),
              nicht die Fenstersumme; die steht als Hinweis an jedem Wert.
            </>
          )}
        </p>
        <p className="v2-muted" style={{ fontSize: 11.5, marginTop: 8, lineHeight: 1.55 }}>
          <strong>{d.mitReferenz}</strong> tragen eine persoenliche Referenz
          (<span className="v2-mono">daily_reference_assessment</span>):
          davon stehen <strong>{d.unterZiel}</strong> unter dem Ziel
          und <strong>{d.ueberObergrenze}</strong> ueber der Obergrenze.
          Die uebrigen {d.gesamt - d.mitReferenz} sind gegliedert und
          gemessen, aber ohne Referenzwert — dort steht ein Strich, kein
          Urteil. Klick auf eine Zeile oeffnet die Erklaerung.
        </p>
      </Card>

      {d.gruppen.map(g => {
        const treffer = zaehleSichtbare(g.knoten, scope)
        if (scope !== 'alle' && treffer === 0) return null
        return (
          <GruppenKarte
            key={g.name}
            g={g}
            scope={scope}
            treffer={treffer}
            istTag={istTag}
            offen={scope !== 'alle' || offen.has(GRUPPE + g.name)}
            offenSet={offen}
            umschalten={umschalten}
            waehlen={(knoten, elternName) => setAuswahl({ knoten, elternName })}
          />
        )
      })}

      {auswahl && (
        <NaehrstoffModal
          knoten={auswahl.knoten}
          elternName={auswahl.elternName}
          datum={d.stichtag}
          fenster={d.fenster}
          onClose={() => setAuswahl(null)}
        />
      )}
    </div>
  )
}

function GruppenKarte({ g, scope, treffer, istTag, offen, offenSet, umschalten, waehlen }: {
  g: NaehrstoffGruppe; scope: Scope; treffer: number; istTag: boolean
  offen: boolean; offenSet: Set<string>
  umschalten: (schluessel: string) => void
  waehlen: (k: NaehrstoffKnoten, elternName: string | null) => void
}) {
  return (
    <Card>
      <button
        type="button"
        onClick={() => umschalten(GRUPPE + g.name)}
        aria-expanded={offen}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, width: '100%',
          background: 'none', border: 0, padding: 0, cursor: 'pointer',
          font: 'inherit', color: 'inherit', textAlign: 'left',
        }}
      >
        <Icon name={offen ? 'chevron_down' : 'chevron_right'} className="v2-ic v2-ic-sm" />
        <span style={{ fontSize: 13, fontWeight: 600 }}>{g.name}</span>
        <span className="v2-num v2-dim" style={{ fontSize: 11 }}>
          {scope === 'alle'
            ? `${g.anzahl} Eintr${g.anzahl === 1 ? 'ag' : 'aege'}`
            : `${treffer} von ${g.anzahl} Eintraegen`}
        </span>
        <span style={{ marginLeft: 'auto' }}>
          <Pill>{g.mitWert} mit Wert</Pill>
        </span>
      </button>

      {offen && (
        <div className="v2-tbl-wrap" style={{ marginTop: 10 }}>
          <table className="v2-tbl">
            <thead>
              <tr>
                <th style={{ width: 26 }} aria-label="Klappen" />
                <th>Naehrstoff</th>
                <th style={{ width: 110 }}>{istTag ? 'Heute' : 'Schnitt/Tag'}</th>
                <th style={{ width: 100 }}>Erfasst</th>
                <th style={{ width: 110 }}>Ziel</th>
                <th style={{ width: 110 }}>Fortschritt</th>
                <th style={{ width: 52 }}>%</th>
                <th style={{ width: 92 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {g.knoten.filter(k => sichtbar(k, scope)).map(k => (
                <Zeilen
                  key={k.code}
                  k={k}
                  tiefe={0}
                  elternName={null}
                  scope={scope}
                  istTag={istTag}
                  offenSet={offenSet}
                  umschalten={umschalten}
                  waehlen={waehlen}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}

/**
 * Ein Knoten und — wenn er offen ist — alles darunter.
 *
 * Der Chevron klappt (jede Ebene, G-122), der Rest der Zeile oeffnet
 * das Modal. Bei aktivem Filter zaehlt der Klappzustand nicht: die
 * Treffer stehen ausgeklappt da.
 */
function Zeilen({ k, tiefe, elternName, scope, istTag, offenSet, umschalten, waehlen }: {
  k: NaehrstoffKnoten; tiefe: number; elternName: string | null
  scope: Scope; istTag: boolean; offenSet: Set<string>
  umschalten: (schluessel: string) => void
  waehlen: (k: NaehrstoffKnoten, elternName: string | null) => void
}): React.ReactElement {
  const farbe = k.status ? STATUS_FARBE[k.status] : 'var(--fg-dim)'
  const hatKinder = k.kinder.length > 0
  const istOffen = scope !== 'alle' || offenSet.has(k.code)
  return (
    <>
      <tr onClick={() => waehlen(k, elternName)} style={{ cursor: 'pointer' }}>
        <td style={{ paddingLeft: 4 + tiefe * 16 }}>
          {hatKinder ? (
            <button
              type="button"
              className="v2-icon-btn"
              style={{ width: 20, height: 20 }}
              aria-expanded={istOffen}
              aria-label={`${k.name} ${istOffen ? 'einklappen' : 'ausklappen'}`}
              onClick={ev => { ev.stopPropagation(); umschalten(k.code) }}
            >
              <Icon name={istOffen ? 'chevron_down' : 'chevron_right'} className="v2-ic v2-ic-sm" />
            </button>
          ) : (
            <span
              aria-hidden
              style={{
                display: 'inline-block', width: 4, height: 4, borderRadius: 999,
                background: 'var(--fg-dim)', opacity: 0.5, marginLeft: 8,
              }}
            />
          )}
        </td>
        <td>
          {k.name}
          <span className="v2-dim v2-mono" style={{ fontSize: 9.5, marginLeft: 6 }}>
            {k.code}
          </span>
          {hatKinder && !istOffen && (
            <span className="v2-dim" style={{ fontSize: 9.5, marginLeft: 6 }}>
              +{k.kinder.length}
            </span>
          )}
        </td>
        <td
          className="v2-num"
          title={istTag || k.summe === null ? undefined
            : `Summe ueber das Fenster: ${zahl(k.summe, k.einheit)}`}
        >
          {zahl(k.wert, k.einheit)}
        </td>
        <td className="v2-num v2-dim" style={{ fontSize: 11 }}>
          {k.positionen === 0 ? '—' : istTag
            ? `${k.positionenMitWert} von ${k.positionen} Pos.`
            : `${k.tageVollstaendig}/${k.tageErfasst} Tg. vollst.`}
        </td>
        <td className="v2-num v2-dim">
          {k.ziel === null ? '—' : (
            <>
              {zahl(k.ziel, k.einheit)}
              {k.zielMax !== null && <>–{zahl(k.zielMax, null)}</>}
              {k.zielArt && (
                <span style={{ fontSize: 9.5, marginLeft: 4 }}>{k.zielArt}</span>
              )}
            </>
          )}
          {k.obergrenze !== null && (
            <span style={{ display: 'block', fontSize: 9.5 }}>
              UL {zahl(k.obergrenze, k.einheit)}
            </span>
          )}
        </td>
        <td>
          {k.prozent !== null && (
            <div style={{ position: 'relative', height: 4, background: 'var(--surface-2)', borderRadius: 999 }}>
              <div style={{
                position: 'absolute', left: 0, top: 0, bottom: 0,
                width: `${Math.min(k.prozent, 100)}%`,
                background: farbe, borderRadius: 999,
              }} />
            </div>
          )}
        </td>
        <td className="v2-num" style={{ color: k.prozent !== null ? farbe : undefined }}>
          {k.prozent === null ? '—' : `${Math.round(k.prozent)}%`}
        </td>
        <td>
          {k.status ? (
            <Pill dot={farbe}>{STATUS_TEXT[k.status]}</Pill>
          ) : (
            <span className="v2-dim" style={{ fontSize: 11 }}>—</span>
          )}
        </td>
      </tr>
      {hatKinder && istOffen && k.kinder.filter(x => sichtbar(x, scope)).map(x => (
        <Zeilen
          key={x.code}
          k={x}
          tiefe={tiefe + 1}
          elternName={k.name}
          scope={scope}
          istTag={istTag}
          offenSet={offenSet}
          umschalten={umschalten}
          waehlen={waehlen}
        />
      ))}
    </>
  )
}
