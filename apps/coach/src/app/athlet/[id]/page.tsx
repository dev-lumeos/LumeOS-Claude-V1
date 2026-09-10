// Die Klientenakte: je Modul genau das, was die Sichtstufe hergibt —
// none: gesperrt gesagt · summary: das definierte Aggregat (152) ·
// full: Aggregat plus juengste Zeilen. Die Stufe entscheidet die
// Anzeige, die RLS erzwingt sie — auch ein umgebauter Client saehe
// nicht mehr.
import { notFound, redirect } from 'next/navigation'
import { Card, Empty, Pill } from '@lumeos/ui'
import {
  MODULE, MODUL_LABEL, autoApplyVon, levelVon, modulDetails, modulSummaries,
  portalStand, sichtVon, type Modul,
} from '../../../lib/daten'
import { vorschlagSenden } from '../../../lib/aktionen'
import { datum, wert, zeitpunkt } from '../../../lib/format'

export const dynamic = 'force-dynamic'

export default async function AthletSeite({
  params, searchParams,
}: {
  params: { id: string }
  searchParams: { fehler?: string }
}) {
  const stand = await portalStand()
  if (!stand) redirect('/login')
  const klient = stand.klienten.find(k => k.client_id === params.id)
  if (!klient) notFound()

  const rechte = stand.rechte.find(r => r.client_id === klient.client_id)
  const autonomie = stand.autonomie.find(a => a.client_id === klient.client_id)
  const sicht = Object.fromEntries(
    MODULE.map(m => [m, sichtVon(rechte, m)]),
  ) as Record<Modul, 'none' | 'summary' | 'full'>

  const [summaries, details] = await Promise.all([
    modulSummaries(klient.client_id),
    modulDetails(klient.client_id, sicht),
  ])

  const vorschlaege = stand.pending.filter(p => p.client_id === klient.client_id)
  const aktionen = stand.actionLog.filter(a => a.client_id === klient.client_id)
  const pfad = `/athlet/${klient.client_id}`

  return (
    // ══ G-402/A7: `v2-module-header` statt `cp-shell`/`cp-kopf` ══
    //
    // `[read]` **Die Akte ist eine eigene Seite ohne Seitenleiste** —
    // man kommt ueber „Athleten" zurueck. `[cmd]` **Der Kopf ist
    // trotzdem der des Hauses**, wie auf allen Bereichen.
    <main className="cp-inhalt">
      <div className="v2-module-header v2-module-hero-lite">
        <div className="v2-module-title-block">
          <div className="v2-module-title-row">
            <a className="v2-btn" href="/?bereich=klienten">← Athleten</a>
            <span className="v2-module-title">{klient.display_name}</span>
            <Pill variant={klient.status === 'active' ? 'pos' : undefined}>
              {klient.status === 'active' ? `aktiv seit ${datum(klient.started_at)}` : klient.status}
            </Pill>
          </div>
        </div>
        <div className="v2-module-actions">
          <span className="cp-konto cp-monospace">{klient.email}</span>
        </div>
      </div>

      {searchParams.fehler && (
        <p className="cp-hinweis" role="alert" style={{ color: 'var(--neg)' }}>{searchParams.fehler}</p>
      )}

      <div className="cp-grid cp-grid-2">
        {MODULE.map(m => (
          <ModulKachel
            key={m}
            modul={m}
            sicht={sicht[m]}
            autoApply={autoApplyVon(rechte, m)}
            level={levelVon(autonomie, m)}
            summary={summaries[m]}
            details={details}
          />
        ))}

        <Card
          title="Vorschlag senden"
          sub="Wird als pending_action angelegt und wartet auf die Bestaetigung des Klienten"
        >
          <form action={vorschlagSenden} className="cp-formular">
            <input type="hidden" name="client_id" value={klient.client_id} />
            <input type="hidden" name="pfad" value={pfad} />
            <label>
              Modul
              <select name="module">
                {MODULE.map(m => <option key={m} value={m}>{MODUL_LABEL[m]}</option>)}
              </select>
            </label>
            <label>
              Titel
              <input name="titel" required placeholder="z. B. Protein leicht anheben" />
            </label>
            <label>
              Beschreibung
              <textarea name="beschreibung" rows={3} />
            </label>
            <button className="cp-knopf cp-knopf-primaer" type="submit">Vorschlag senden</button>
            <p className="cp-hinweis">
              Verfaellt nach 10 Minuten ohne Bestaetigung (150). Ein Ausfuehrer,
              der einen bestaetigten Vorschlag ins Zielmodul schreibt, fehlt
              weiterhin — der Vorschlag aendert bis dahin nur seinen Status.
            </p>
          </form>
        </Card>

        <Card title="Vorschlaege und Aktionen" sub="pending_actions und action_log dieser Beziehung">
          {vorschlaege.length === 0 && aktionen.length === 0 ? (
            <Empty title="Nichts vorhanden" />
          ) : (
            <div className="cp-tabelle-huelle">
              <table className="cp-tabelle">
                <thead><tr><th>Wann</th><th>Art</th><th>Inhalt</th><th>Status</th></tr></thead>
                <tbody>
                  {vorschlaege.map(p => (
                    <tr key={p.id}>
                      <td className="cp-monospace">{zeitpunkt(p.created_at)}</td>
                      <td>Vorschlag · {p.module}</td>
                      <td>{String(p.preview['title'] ?? p.action_type)}</td>
                      <td><Pill variant={p.status === 'pending' ? 'warn' : p.status === 'confirmed' ? 'pos' : undefined}>{p.status}</Pill></td>
                    </tr>
                  ))}
                  {aktionen.map(a => (
                    <tr key={a.id}>
                      <td className="cp-monospace">{zeitpunkt(a.executed_at)}</td>
                      <td>Aktion · {a.module}</td>
                      <td>{a.action_type}</td>
                      <td>{a.undone_at ? <Pill>zurueckgeholt</Pill> : <Pill variant="pos">ausgefuehrt</Pill>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </main>
  )
}

function ModulKachel({
  modul, sicht, autoApply, level, summary, details,
}: {
  modul: Modul
  sicht: 'none' | 'summary' | 'full'
  autoApply: boolean
  level: number | null
  summary: Record<string, unknown> | undefined
  details: Awaited<ReturnType<typeof modulDetails>>
}) {
  const kopf = (
    <>
      <Pill variant={sicht === 'full' ? 'pos' : sicht === 'summary' ? 'acc' : undefined}>Sicht: {sicht}</Pill>
      {autoApply && <Pill variant="warn">ohne Bestaetigung</Pill>}
      {level !== null && <Pill>Autonomie {level}</Pill>}
    </>
  )

  if (sicht === 'none') {
    return (
      <Card title={MODUL_LABEL[modul]} actions={kopf}>
        <Empty
          title="Nicht freigegeben"
          sub="Der Klient hat dieses Modul nicht geoeffnet — es gibt keine Daten und kein Aggregat."
        />
      </Card>
    )
  }

  const eintraege = summary
    ? Object.entries(summary).filter(([k]) => k !== 'freigegeben' && k !== 'fehler')
    : []

  return (
    <Card title={MODUL_LABEL[modul]} actions={kopf}>
      {modul === 'buddy' ? (
        <Empty title="Kein Datengegenstueck" sub="buddy steht im Rechtemodell, hat aber kein Schema (T5)." />
      ) : summary && summary['freigegeben'] === true ? (
        <div className="cp-tabelle-huelle">
          <table className="cp-tabelle">
            <tbody>
              {eintraege.map(([k, v]) => (
                <tr key={k}><td>{k}</td><td className="cp-monospace">{wert(v)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty title="Aggregat nicht lesbar" sub={String(summary?.['fehler'] ?? 'Freigabe verweigert.')} />
      )}

      {sicht === 'full' && <VollDetails modul={modul} details={details} />}
    </Card>
  )
}

function VollDetails({
  modul, details,
}: {
  modul: Modul
  details: Awaited<ReturnType<typeof modulDetails>>
}) {
  if (modul === 'nutrition' && details.nutritionTage?.length) {
    return (
      <Zeilen
        titel="Letzte Tage (daily_summary)"
        koepfe={['Tag', 'kcal', 'Protein', 'Carbs', 'Fett']}
        zeilen={details.nutritionTage.map(t => [
          datum(t.entry_date), wert(t.enercc && Math.round(Number(t.enercc))),
          wert(t.prot625 && Math.round(Number(t.prot625))),
          wert(t.cho && Math.round(Number(t.cho))),
          wert(t.fat && Math.round(Number(t.fat))),
        ])}
      />
    )
  }
  if (modul === 'training' && details.trainingEinheiten?.length) {
    return (
      <Zeilen
        titel="Letzte Einheiten"
        koepfe={['Tag', 'Name', 'Status', 'Saetze', 'Volumen kg']}
        zeilen={details.trainingEinheiten.map(s => [
          datum(s.session_date), wert(s.name), wert(s.status), wert(s.total_sets),
          wert(s.total_volume_kg && Math.round(Number(s.total_volume_kg))),
        ])}
      />
    )
  }
  if (modul === 'goals') {
    return (
      <>
        {details.gewichte?.length ? (
          <Zeilen
            titel="Letzte Messungen"
            koepfe={['Tag', 'Gewicht kg', 'KFA %']}
            zeilen={details.gewichte.map(g => [datum(g.measurement_date), wert(g.weight_kg), wert(g.body_fat_pct)])}
          />
        ) : null}
        {details.ziele?.length ? (
          <Zeilen
            titel="Aktive Ziele"
            koepfe={['Titel', 'Typ', 'Fortschritt %']}
            zeilen={details.ziele.map(z => [wert(z.title), wert(z.goal_type), wert(z.progress_pct)])}
          />
        ) : null}
      </>
    )
  }
  if (modul === 'recovery' && details.recoveryScores?.length) {
    return (
      <Zeilen
        titel="Letzte Scores"
        koepfe={['Tag', 'Score']}
        zeilen={details.recoveryScores.map(s => [datum(s.entry_date), wert(s.score)])}
      />
    )
  }
  if (modul === 'supplements' && details.einnahmen?.length) {
    return (
      <Zeilen
        titel="Letzte Einnahmen"
        koepfe={['Tag', 'Supplement', 'Status']}
        zeilen={details.einnahmen.map(e => [datum(e.intake_date), wert(e.supplement_name_snapshot), wert(e.status)])}
      />
    )
  }
  if (modul === 'medical' && details.befunde?.length) {
    return (
      <Zeilen
        titel="Befunde"
        koepfe={['Tag', 'Labor', 'Titel']}
        zeilen={details.befunde.map(b => [datum(b.report_date), wert(b.lab_name), wert(b.title)])}
      />
    )
  }
  return null
}

function Zeilen({
  titel, koepfe, zeilen,
}: {
  titel: string
  koepfe: string[]
  zeilen: string[][]
}) {
  return (
    <>
      <p className="v2-eyebrow" style={{ marginTop: 10 }}>{titel}</p>
      <div className="cp-tabelle-huelle">
        <table className="cp-tabelle">
          <thead><tr>{koepfe.map(k => <th key={k}>{k}</th>)}</tr></thead>
          <tbody>
            {zeilen.map((z, i) => (
              <tr key={i}>{z.map((v, j) => <td key={j} className={j > 0 ? 'cp-monospace' : ''}>{v}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
