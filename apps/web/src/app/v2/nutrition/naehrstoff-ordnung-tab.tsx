'use client'

// Der Nutrients-Tab mit der echten Naehrstoffordnung (G-101, C-54),
// seit G-121 mit den Werten der langen Form und Zeitfenstern (C-157).
//
// **DIE VORLAGE:** `theme-v1/module-nutrition-nutrients.jsx` — Spalten
// Naehrstoff · Menge · Ziel · Fortschritt · % · Status, dazu die
// Scope-Filter. `[read]` Die Vorlage haelt einen Elternknoten
// sichtbar, wenn ein KIND auffaellig ist (`hasChildOutOfRange`,
// rekursiv) — das ist mitgebaut (`kindTrifft`).
//
// **STATUS IST EINE AUSSAGE UEBER DIE ZAHL,** nicht ueber die Person:
// „unter Ziel" heisst, die Zahl liegt unter der persoenlichen
// Referenz aus `daily_reference_assessment` — kein Score, keine
// Ampel fuer den Menschen. Zeilen ohne Referenz tragen einen Strich.
//
// **DAS DETAIL-MODAL DER VORLAGE IST NICHT GEBAUT:** es braucht
// `parent_code` in `nutrient_defs` (C-161). Der Andockpunkt ist die
// `waehlen`-Eigenschaft an den Zeilen — das Modal haengt sich dort
// ein, ohne dass Tabelle oder Filter angefasst werden muessen. Der
// 14-Tage-Trend der Vorlage ist dort erfunden („Fake 14-day trend",
// Z. 694) — er gehoert ins Modal und wartet mit ihm auf C-161.
import * as React from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import type { Route } from 'next'
import { Card, Pill, Icon } from '@lumeos/ui'

import type {
  NaehrstoffOrdnung, NaehrstoffGruppe, NaehrstoffKnoten,
} from '../../../lib/nutrition/naehrstoff-ordnung'
import {
  FENSTER, sichtbar, zaehleSichtbare, type Scope,
} from '../../../lib/nutrition/naehrstoff-anzeige'

function zahl(v: number | null, einheit: string | null): string {
  if (v === null) return '—'
  const n = v.toLocaleString('de-DE', { maximumFractionDigits: v < 1 ? 3 : 1 })
  return einheit ? `${n} ${einheit}` : n
}

const STATUS_TEXT: Record<string, string> = {
  unter: 'unter Ziel',
  im: 'im Bereich',
  ueber: 'ueber UL',
}
const STATUS_FARBE: Record<string, string> = {
  unter: 'var(--warn)',
  im: 'var(--pos)',
  ueber: 'var(--neg)',
}

export function NaehrstoffOrdnungTab({ d }: { d: NaehrstoffOrdnung }) {
  // G-117, Tom: „standard eingeklappt". Alle 12 Gruppen zu; ein
  // aktiver Scope-Filter oeffnet die Treffergruppen, denn wer nach
  // Auffaelligem fragt, will es sehen, nicht erst aufklappen.
  const [offen, setOffen] = React.useState<Set<string>>(() => new Set())
  const [scope, setScope] = React.useState<Scope>('alle')

  // G-121: das Fenster steht in der Adresse — dieselbe Begruendung wie
  // beim Tab (tab-url.ts): serverseitig geladen, von aussen messbar.
  const router = useRouter()
  const pfad = usePathname()
  const suche = useSearchParams()
  const fensterSetzen = React.useCallback((tage: number) => {
    const p = new URLSearchParams(suche?.toString() ?? '')
    if (tage === 1) p.delete('fenster')
    else p.set('fenster', String(tage))
    const rest = p.toString()
    router.push((rest ? `${pfad}?${rest}` : pfad) as Route)
  }, [router, pfad, suche])

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
        {/* Zeitfenster (G-121, Toms Liste) und Scope-Filter der Vorlage. */}
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
                onClick={() => setScope(k)}
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
          Urteil.
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
            offen={scope !== 'alle' || offen.has(g.name)}
            umschalten={() => setOffen(s => {
              const n = new Set(s)
              if (n.has(g.name)) n.delete(g.name)
              else n.add(g.name)
              return n
            })}
          />
        )
      })}
    </div>
  )
}

function GruppenKarte({ g, scope, treffer, istTag, offen, umschalten }: {
  g: NaehrstoffGruppe; scope: Scope; treffer: number; istTag: boolean
  offen: boolean; umschalten: () => void
}) {
  return (
    <Card>
      <button
        type="button"
        onClick={umschalten}
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
                <Zeilen key={k.code} k={k} tiefe={0} scope={scope} istTag={istTag} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}

/**
 * Ein Knoten und alles darunter — die Einrueckung zeigt die Stufe.
 *
 * ANDOCKPUNKT (C-161): `waehlen` bekommt den Code der Zeile, sobald
 * das Detail-Modal existiert; bis dahin bleibt die Zeile ohne Klick —
 * ein Zeiger-Cursor ohne Wirkung waere eine Attrappe.
 */
function Zeilen({ k, tiefe, scope, istTag, waehlen }: {
  k: NaehrstoffKnoten; tiefe: number; scope: Scope; istTag: boolean
  waehlen?: (code: string) => void
}): React.ReactElement {
  const farbe = k.status ? STATUS_FARBE[k.status] : 'var(--fg-dim)'
  return (
    <>
      <tr onClick={waehlen ? () => waehlen(k.code) : undefined}>
        <td style={{ paddingLeft: 8 + tiefe * 18 }}>
          {tiefe > 0 && (
            <span className="v2-dim" style={{ marginRight: 4 }}>└</span>
          )}
          {k.name}
          <span className="v2-dim v2-mono" style={{ fontSize: 9.5, marginLeft: 6 }}>
            {k.code}
          </span>
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
            // „188 g aus 11 von 14 Positionen" — die Kurzform der Zelle.
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
      {k.kinder.filter(x => sichtbar(x, scope)).map(x => (
        <Zeilen key={x.code} k={x} tiefe={tiefe + 1} scope={scope} istTag={istTag} waehlen={waehlen} />
      ))}
    </>
  )
}
