// Die Kacheln von Athletes, Check-ins, Plans, Library, Kalender und
// Benachrichtigungen — G-407.
//
// `[cmd]` **Je Kachel ein Vermerk mit der fehlenden Tabelle** — je
// Ansicht waere zu grob, dann liesse sich nicht zaehlen, WELCHE
// Kachel woran haengt (E-69).
//
// `[read]` **Wo eine Tabelle DA ist, steht sie im Vermerk mit** —
// `coach.checkin_templates` traegt zwei Zeilen, es fehlt nur der
// Schreibweg. **Das ist ein anderer Mangel als „keine Tabelle".**
import * as React from 'react'
import { Card, Pill, Row, KPI, Meter, Ring, Sparkline, Icon } from '@lumeos/ui'

// G-409/A5: die Modale der Vorlage.
import { ModalKnopf } from './modal-huelle'

import {
  CAL_EVENTS, CAL_KIND, CN_NOTES, CN_TAGS, LIB_EX, LIB_MEAL,
  NC_ITEMS, NC_KIND, CD_PERMS, PORTAL_WF_DEFS, PEAK_WEEK, PORTAL_ONBOARD,
  FCR_CLIENT, FCR_MODULES, FCR_TRAINING, FCR_NUTRITION, FCR_RECOVERY,
  FCR_SUPPS, FCR_BODY, FCR_MEDICAL, FCR_TIMELINE,
  PROGRAMS, DELIVERY_MODES, ASSIGNMENT, DELIVERY_LOG, STATUS_STYLE,
} from './daten-portal'
import {
  Streifen, Haken, Balken, Zitat, Kasten, KastenKopf, Attrappe,
  Raster, Stapel, Auge,
} from './bausteine'

const KEIN_PLAN = 'keine Tabelle fuer Plaene oder Programme'
const KEINE_BIB = 'keine Tabelle fuer eigene Uebungen oder Rezepte'
const KEIN_TERMIN = 'keine Tabelle fuer Termine oder einen Kalender'
const KEINE_NOTIZ = 'keine Tabelle fuer freie Notizen je Klient — '
  + 'coach.checkins.coach_notes gibt es nur je Check-in'
const KEIN_EREIGNIS = 'keine Tabelle fuer Benachrichtigungen — '
  + 'coach.messages fuehrt Nachrichten je Beziehung, keine Ereignisse'

const V = (quelle: string, fehlt: string) => <Attrappe fehlt={fehlt} quelle={quelle} />

// ── notes · Client notes ────────────────────────────────────────

export function AnsichtNotizen() {
  const angeheftet = CN_NOTES.filter(n => n.pinned)
  return (
    <Stapel>
      <Card
        title="Notizen"
        sub={`${CN_NOTES.length} · ${angeheftet.length} angeheftet`}
        actions={<ModalKnopf modal="notiz" mid={CN_NOTES[0].id}>Notiz oeffnen</ModalKnopf>}
      >
        <Stapel gap={10}>
          {CN_NOTES.map(n => (
            <Kasten key={n.id} ton={(CN_TAGS as Record<string, string>)[n.tag]}>
              <KastenKopf
                name={n.who}
                marken={<>
                  <Pill>{n.tag}</Pill>
                  {n.pinned && <Pill variant="acc">angeheftet</Pill>}
                </>}
                rechts={n.at}
              />
              <div className="dk-streifen-text">{n.body}</div>
            </Kasten>
          ))}
        </Stapel>
        {V('CN_NOTES', KEINE_NOTIZ)}
      </Card>
    </Stapel>
  )
}

// ── adherence · Adherence ───────────────────────────────────────
// `[cmd]` Die Vorlage rechnet sie aus Plan gegen Ist. Es gibt
// weder Plantabelle noch Rechnung — beides fehlt, nicht nur eines.

export function AnsichtAdherence() {
  const FEHLT = 'keine Adherence je Klient — die Vorlage rechnet sie aus '
    + 'Plan gegen Ist; es gibt weder eine Plantabelle noch die Rechnung'
  return (
    <Stapel>
      <Raster spalten="repeat(4, 1fr)">
        {FCR_NUTRITION.kpis.map(([l, w]) => <KPI key={l} label={l} value={w} />)}
      </Raster>
      <Raster spalten="1fr 1fr">
        <Card title="Naehrwerte gegen Ziel" sub="heute">
          <Stapel gap={11}>
            {FCR_NUTRITION.macros.map(([l, ist, soll, farbe]) => (
              <Balken
                key={String(l)}
                label={String(l)}
                wert={Number(ist)}
                max={Number(soll)}
                farbe={String(farbe)}
                note={`${ist} von ${soll}`}
              />
            ))}
          </Stapel>
          {V('FCR_NUTRITION', FEHLT)}
        </Card>
        <Card title="Ergaenzungen" sub={`${FCR_SUPPS.length} · Einnahmetreue`}>
          <Stapel gap={9}>
            {FCR_SUPPS.map(s => (
              <Balken
                key={s.n}
                label={<>{s.n} <span className="v2-dim">{s.dose} · {s.when}</span></>}
                wert={s.adherence}
                note={`${s.days} Tage`}
              />
            ))}
          </Stapel>
          {V('FCR_SUPPS', FEHLT)}
        </Card>
      </Raster>
    </Stapel>
  )
}

// ── record · Full record ────────────────────────────────────────
// `client-record.jsx` — die Akte, alle Module nebeneinander.

export function AnsichtAkte() {
  const FEHLT = 'die Akte der Vorlage zeigt Trainings-, Naehrwert-, '
    + 'Erholungs- und Koerperdaten je Klient — im Coach-Schema gibt es '
    + 'davon keine Tabelle (die Werte liegen beim Klienten, nicht beim Coach)'
  return (
    <Stapel>
      <Streifen
        icon="user"
        titel={`${FCR_CLIENT.name} · ${FCR_CLIENT.goal}`}
        text={`${FCR_CLIENT.age} Jahre · ${FCR_CLIENT.height} cm · Klient seit `
          + `${FCR_CLIENT.since} · Zugriff ${FCR_CLIENT.access} seit ${FCR_CLIENT.granted}`}
        aktion={<Pill variant="acc">{FCR_CLIENT.tier}</Pill>}
      />

      <Card title="Freigaben" sub="was der Klient sehen laesst">
        <Raster spalten="repeat(3, 1fr)" gap={8}>
          {FCR_MODULES.map(m => (
            <Row
              key={m.id}
              label={<><span className="v2-dot" style={{ background: m.color }} /> {m.label}</>}
              // `[cmd]` **Die Vorlage kennt hier nur `full` und
              // `summary`** — `tsc` hat den `none`-Zweig als
              // unerreichbar gemeldet, und das stimmte: `medical`
              // steht auf `summary`, nicht auf `none`.
              value={<Pill variant={m.access === 'full' ? 'pos' : 'warn'}>
                {m.access}
              </Pill>}
            />
          ))}
        </Raster>
        {V('FCR_MODULES', FEHLT)}
      </Card>

      <Raster spalten="1fr 1fr">
        <Card title="Training" sub={`${FCR_TRAINING.sessions.length} Einheiten`}>
          <Raster spalten="repeat(2, 1fr)" gap={8}>
            {FCR_TRAINING.kpis.map(([l, w]) => <KPI key={l} label={l} value={w} />)}
          </Raster>
          <div style={{ marginTop: 12 }}>
            <Stapel gap={8}>
              {FCR_TRAINING.sessions.map((s, i) => (
                <Kasten key={i}>
                  <KastenKopf
                    name={s.name}
                    marken={<Pill>RPE {s.rpe}</Pill>}
                    rechts={s.d}
                  />
                  <div className="dk-streifen-text">{s.sets} Saetze · {s.vol} · {s.note}</div>
                </Kasten>
              ))}
            </Stapel>
          </div>
          {V('FCR_TRAINING', FEHLT)}
        </Card>

        <Card title="Erholung" sub="Schlaf und HRV, sieben Tage">
          <Raster spalten="repeat(2, 1fr)" gap={8}>
            {FCR_RECOVERY.kpis.map(([l, w]) => <KPI key={l} label={l} value={w} />)}
          </Raster>
          <div style={{ marginTop: 12 }}>
            <Auge>Schlaf</Auge>
            <Sparkline data={[...FCR_RECOVERY.sleep]} color="var(--acc-recov)" w={300} h={40} />
            <Auge>HRV</Auge>
            <Sparkline data={[...FCR_RECOVERY.hrv]} color="var(--acc-buddy)" w={300} h={40} />
            <Stapel gap={4}>
              {FCR_RECOVERY.flags.map((f, i) => (
                <Haken key={i} ton="warn">{f.t}</Haken>
              ))}
            </Stapel>
          </div>
          {V('FCR_RECOVERY', FEHLT)}
        </Card>
      </Raster>

      <Raster spalten="1fr 1fr">
        <Card title="Koerper" sub="zwoelf Wochen">
          <Raster spalten="repeat(2, 1fr)" gap={8}>
            {FCR_BODY.kpis.map(([l, w]) => <KPI key={l} label={l} value={w} />)}
          </Raster>
          <div style={{ marginTop: 12 }}>
            <Sparkline data={[...FCR_BODY.weight]} color="var(--acc-goals)" w={330} h={54} />
            <Stapel gap={5}>
              {FCR_BODY.measures.map(([l, w]) => (
                <Row key={String(l)} label={String(l)} value={String(w)} />
              ))}
            </Stapel>
          </div>
          {V('FCR_BODY', FEHLT)}
        </Card>

        <Card title="Medizinisch" sub="nur Zusammenfassung">
          <div className="dk-streifen-text" style={{ marginBottom: 10 }}>
            {FCR_MEDICAL.note}
          </div>
          <Stapel gap={5}>
            {FCR_MEDICAL.visible.map(([l, w]) => (
              <Row key={String(l)} label={String(l)} value={String(w)} />
            ))}
          </Stapel>
          {V('FCR_MEDICAL', FEHLT)}
        </Card>
      </Raster>

      <Card title="Verlauf" sub={`${FCR_TIMELINE.length} Ereignisse`}>
        <Stapel gap={6}>
          {FCR_TIMELINE.map((e, i) => (
            <Row
              key={i}
              label={<><Pill>{e.m}</Pill> {e.t}</>}
              value={<span className="v2-mono v2-dim">{e.at}</span>}
            />
          ))}
        </Stapel>
        {V('FCR_TIMELINE', FEHLT)}
      </Card>
    </Stapel>
  )
}

// ── chkedit · Check-in templates ────────────────────────────────
// `[cmd]` HIER GIBT ES EINE TABELLE: `coach.checkin_templates`,
// zwei Zeilen, sie wird gelesen. Es fehlt der SCHREIBWEG.

export function AnsichtVorlagen() {
  const FEHLT = 'coach.checkin_templates steht und wird gelesen — es fehlt '
    + 'der Schreibweg, um eine Vorlage anzulegen oder zu aendern'
  return (
    <Stapel>
      <Streifen
        icon="edit"
        titel="Die Tabelle steht, der Schreibweg fehlt"
        text={'coach.checkin_templates wird gelesen. Was fehlt, ist die '
          + 'Moeglichkeit, eine Vorlage anzulegen — deshalb ist die Form '
          + 'hier gebaut und der Knopf ohne Wirkung.'}
        ton="warn"
      />
      <Card title="Ablaeufe" sub={`${PORTAL_WF_DEFS.length} Vorlagen`}>
        <Stapel gap={10}>
          {PORTAL_WF_DEFS.map(w => (
            <Kasten key={w.id} ton={w.accent}>
              <KastenKopf
                name={w.name}
                marken={<><Pill>{w.cadence}</Pill><Pill>{w.duration}</Pill></>}
              />
              <div className="dk-streifen-text">{w.when}</div>
              <div style={{ marginTop: 8 }}>
                <Auge>Schritte</Auge>
                <Stapel gap={4}>
                  {w.steps.map(s => (
                    <Haken key={s.n}>{s.t}</Haken>
                  ))}
                </Stapel>
              </div>
            </Kasten>
          ))}
        </Stapel>
        {V('PORTAL_WF_DEFS', FEHLT)}
      </Card>

      {/* `[cmd]` **G-409: `PEAK_WEEK`** — sieben Tage mit Kohlenhydraten,
          Wasser, Natrium, Training und Anmerkung. **Die Vorlage zeigt
          sie im Ablauf „Contest Prep review"; G-407 zeigte sie
          nicht.** */}
      <Card title="Peak week" sub={`${PEAK_WEEK.length} Tage · der Ablauf im Detail`}>
        <table className="cp-tabelle">
          <thead>
            <tr>
              <th style={{ width: 110 }}>Tag</th>
              <th style={{ width: 130 }}>Kohlenhydrate</th>
              <th style={{ width: 70 }}>Wasser</th>
              <th style={{ width: 90 }}>Natrium</th>
              <th style={{ width: 160 }}>Training</th>
              <th>Anmerkung</th>
            </tr>
          </thead>
          <tbody>
            {PEAK_WEEK.map(d => (
              <tr key={d.day}>
                <td className="v2-mono">{d.day}</td>
                <td>{d.carbs}</td>
                <td className="v2-num">{d.water}</td>
                <td className="v2-dim">{d.sodium}</td>
                <td>{d.training}</td>
                <td className="v2-dim">{d.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {V('PEAK_WEEK', FEHLT)}
      </Card>
    </Stapel>
  )
}

// ── plans · Plans ───────────────────────────────────────────────

export function AnsichtPlaene() {
  return (
    <Stapel>
      <Streifen
        icon="calendar"
        titel="Einmal bauen, nach Plan ausliefern"
        text={'Ein mehrwoechiges Programm schaltet sich Woche fuer Woche '
          + 'selbst frei. Du greifst nur ein, wenn der Klient fragt, ein '
          + 'Alarm faellt oder ein Check-in ein Problem zeigt.'}
      />
      <Raster spalten="300px 1fr">
        <Card
          title="Programme"
          sub={`${PROGRAMS.length} · ${PROGRAMS.reduce((s, p) => s + p.assigned, 0)} Zuweisungen`}
          actions={<ModalKnopf modal="neuerPlan" art="primaer">New plan</ModalKnopf>}
        >
          <Stapel gap={0}>
            {PROGRAMS.map(p => (
              <Row
                key={p.id}
                label={p.name}
                sub={`${p.category} · ${p.weeks} Wochen`}
                value={<Pill>{p.assigned}</Pill>}
              />
            ))}
          </Stapel>
          {V('PROGRAMS', KEIN_PLAN)}
        </Card>

        <Card title={ASSIGNMENT.program} sub={`${ASSIGNMENT.athlete} · Woche ${ASSIGNMENT.currentWeek} von ${ASSIGNMENT.weeks}`}>
          <table className="cp-tabelle">
            <thead>
              <tr>
                <th style={{ width: 60 }}>Woche</th><th style={{ width: 70 }}>Datum</th>
                <th style={{ width: 60 }}>Block</th><th>Zustand</th>
                <th style={{ width: 90, textAlign: 'right' }}>Erfuellung</th>
              </tr>
            </thead>
            <tbody>
              {ASSIGNMENT.schedule.map(w => {
                const st = (STATUS_STYLE as Record<string, { color: string, label: string }>)[w.status]
                return (
                  <tr key={w.week}>
                    <td className="v2-num">{w.week}</td>
                    <td className="v2-mono v2-dim">{w.date}</td>
                    <td className="v2-num">{w.block}</td>
                    <td><span style={{ color: st.color }}>{st.label}</span></td>
                    <td className="v2-num" style={{ textAlign: 'right' }}>
                      {w.completion == null ? '—' : `${w.completion} %`}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {V('ASSIGNMENT', KEIN_PLAN)}
        </Card>
      </Raster>

      <Raster spalten="1fr 1.3fr">
        <Card title="Auslieferung" sub={`${DELIVERY_MODES.length} Arten`}>
          <Stapel gap={8}>
            {DELIVERY_MODES.map(m => (
              <Kasten key={m.id} ton={m.id === ASSIGNMENT.mode ? 'var(--acc-coach)' : undefined}>
                <KastenKopf
                  name={m.label}
                  marken={m.id === ASSIGNMENT.mode ? <Pill variant="acc">gewaehlt</Pill> : undefined}
                />
                <div className="dk-streifen-text">{m.desc}</div>
              </Kasten>
            ))}
          </Stapel>
          {V('DELIVERY_MODES', KEIN_PLAN)}
        </Card>

        <Card title="Protokoll" sub={`${DELIVERY_LOG.length} Ereignisse`}>
          <Stapel gap={6}>
            {DELIVERY_LOG.map((l, i) => (
              <Row
                key={i}
                label={<><Pill>{l.event}</Pill> {l.athlete} · Woche {l.week}</>}
                sub={l.note}
                value={<span className="v2-mono v2-dim">{l.at}</span>}
              />
            ))}
          </Stapel>
          {V('DELIVERY_LOG', KEIN_PLAN)}
        </Card>
      </Raster>
    </Stapel>
  )
}

// ── programs · Programs ─────────────────────────────────────────

export function AnsichtProgramme() {
  const p = PROGRAMS[0]
  return (
    <Stapel>
      <Card title={p.name} sub={`${p.weeks} Wochen · ${p.blocks.length} Bloecke · Bewertung ${p.rating}`}>
        <Stapel gap={9}>
          {p.blocks.map(b => (
            <Kasten key={b.n} ton={b.color}>
              <KastenKopf name={b.name} marken={<Pill>{b.weeks}</Pill>} />
              <div className="dk-streifen-text">{b.focus}</div>
            </Kasten>
          ))}
        </Stapel>
        {V('PROGRAMS[0].blocks', KEIN_PLAN)}
      </Card>

      <Card title="Alle Programme" sub={`${PROGRAMS.length}`}>
        <table className="cp-tabelle">
          <thead>
            <tr>
              <th style={{ width: 70 }}>Nr</th><th>Name</th>
              <th style={{ width: 100 }}>Art</th>
              <th style={{ width: 70, textAlign: 'right' }}>Wochen</th>
              <th style={{ width: 90, textAlign: 'right' }}>Zugewiesen</th>
              <th style={{ width: 80, textAlign: 'right' }}>Bewertung</th>
            </tr>
          </thead>
          <tbody>
            {PROGRAMS.map(x => (
              <tr key={x.id}>
                <td className="v2-mono">{x.id}</td>
                <td>{x.name}</td>
                <td><Pill>{x.category}</Pill></td>
                <td className="v2-num" style={{ textAlign: 'right' }}>{x.weeks}</td>
                <td className="v2-num" style={{ textAlign: 'right' }}>{x.assigned}</td>
                <td className="v2-num" style={{ textAlign: 'right' }}>{x.rating}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {V('PROGRAMS', KEIN_PLAN)}
      </Card>
    </Stapel>
  )
}

// ── builder · Program builder ───────────────────────────────────

export function AnsichtBauer() {
  return (
    <Stapel>
      <Streifen
        icon="edit"
        titel="Der Baukasten"
        text={'Bloecke, Wochen und die Nachricht, die beim Freischalten '
          + 'mitgeht. Die Vorlage zeigt ihn fertig — es gibt keine Tabelle, '
          + 'in die er schreiben koennte.'}
        ton="warn"
      />
      <Raster spalten="1fr 1fr">
        <Card title="Bloecke" sub={`${PROGRAMS[0].blocks.length}`}>
          <Stapel gap={9}>
            {PROGRAMS[0].blocks.map(b => (
              <Kasten key={b.n} ton={b.color}>
                <KastenKopf name={b.name} marken={<Pill>{b.weeks}</Pill>} />
                <div className="dk-streifen-text">{b.focus}</div>
              </Kasten>
            ))}
          </Stapel>
          {V('PROGRAMS[0].blocks', KEIN_PLAN)}
        </Card>
        <Card title="Beim Freischalten" sub="was der Klient bekommt">
          <Row label="Nachricht" value={ASSIGNMENT.autoMessage ? 'an' : 'aus'} />
          <div style={{ marginTop: 10 }}>
            <Auge>Vorlage</Auge>
            <Zitat>{ASSIGNMENT.messageTemplate}</Zitat>
          </div>
          {V('ASSIGNMENT', KEIN_PLAN)}
        </Card>
      </Raster>
    </Stapel>
  )
}

// ── lib-ex · Library exercises ──────────────────────────────────

export function AnsichtUebungen() {
  return (
    <Card title="Eigene Uebungen" sub={`${LIB_EX.length} · ${LIB_EX.reduce((s, e) => s + e.assigned, 0)} Zuweisungen`}>
      <table className="cp-tabelle">
        <thead>
          <tr>
            <th style={{ width: 70 }}>Nr</th><th>Name</th>
            <th style={{ width: 100 }}>Art</th><th>Muskeln</th>
            <th style={{ width: 90 }}>Geraet</th>
            <th style={{ width: 80, textAlign: 'right' }}>Zugewiesen</th>
          </tr>
        </thead>
        <tbody>
          {LIB_EX.map(e => (
            <tr key={e.id}>
              <td className="v2-mono">{e.id}</td>
              <td>{e.name}<div className="v2-dim" style={{ fontSize: 10.5 }}>{e.note}</div></td>
              <td><Pill>{e.cat}</Pill></td>
              <td className="v2-dim">{e.muscles.join(', ')}</td>
              <td className="v2-dim">{e.equip}</td>
              <td className="v2-num" style={{ textAlign: 'right' }}>{e.assigned}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {V('LIB_EX', KEINE_BIB)}
    </Card>
  )
}

// ── lib-meal · Library meals ────────────────────────────────────

export function AnsichtRezepte() {
  return (
    <Card title="Eigene Rezepte" sub={`${LIB_MEAL.length} · ${LIB_MEAL.reduce((s, m) => s + m.assigned, 0)} Zuweisungen`}>
      <table className="cp-tabelle">
        <thead>
          <tr>
            <th style={{ width: 70 }}>Nr</th><th>Name</th>
            <th style={{ width: 90 }}>Zeit</th>
            <th style={{ width: 70, textAlign: 'right' }}>kcal</th>
            <th style={{ width: 130, textAlign: 'right' }}>E / K / F</th>
            <th style={{ width: 80, textAlign: 'right' }}>Zugewiesen</th>
          </tr>
        </thead>
        <tbody>
          {LIB_MEAL.map(m => (
            <tr key={m.id}>
              <td className="v2-mono">{m.id}</td>
              <td>{m.name}<div className="v2-dim" style={{ fontSize: 10.5 }}>{m.note}</div></td>
              <td><Pill>{m.tag}</Pill></td>
              <td className="v2-num" style={{ textAlign: 'right' }}>{m.kcal}</td>
              <td className="v2-num" style={{ textAlign: 'right' }}>{m.p} / {m.c} / {m.f}</td>
              <td className="v2-num" style={{ textAlign: 'right' }}>{m.assigned}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {V('LIB_MEAL', KEINE_BIB)}
    </Card>
  )
}

// ── calendar · Calendar ─────────────────────────────────────────

export function AnsichtKalender() {
  // `as const` macht die Listen `readonly` — `Object.entries`
  // braucht das nicht, also der Umweg ueber den Grundtyp.
  const tage = Object.entries(CAL_EVENTS) as Array<[string, ReadonlyArray<{
    t: string, who: string, kind: string, label: string
  }>]>
  const anzahl = tage.reduce((s, [, e]) => s + e.length, 0)
  return (
    <Stapel>
      <Card
        title="Termine"
        sub={`${anzahl} an ${tage.length} Tagen`}
        actions={<>
          <ModalKnopf modal="coachEinladen">Invite coach</ModalKnopf>
          <ModalKnopf modal="qr">Scan QR</ModalKnopf>
        </>}
      >
        <Stapel gap={12}>
          {tage.map(([tag, ereignisse]) => (
            <div key={tag}>
              <Auge>{tag}</Auge>
              <Stapel gap={6}>
                {ereignisse.map((e, i) => {
                  const k = (CAL_KIND as Record<string, { c: string, l: string }>)[e.kind]
                  return (
                    <Row
                      key={i}
                      label={<>
                        <span className="v2-dot" style={{ background: k?.c }} />
                        <span className="v2-mono">{e.t}</span> {e.label}
                      </>}
                      sub={e.who}
                      value={<Pill>{k?.l ?? e.kind}</Pill>}
                    />
                  )
                })}
              </Stapel>
            </div>
          ))}
        </Stapel>
        {V('CAL_EVENTS', KEIN_TERMIN)}
      </Card>
    </Stapel>
  )
}

// ── inbox · Notifications ───────────────────────────────────────

export function AnsichtBenachrichtigungen() {
  const ungelesen = NC_ITEMS.filter(n => n.unread).length
  return (
    <Stapel>
      <Card
        title="Benachrichtigungen"
        sub={`${NC_ITEMS.length} · ${ungelesen} ungelesen`}
        actions={<ModalKnopf modal="nachrichten">Verlauf</ModalKnopf>}
      >
        <Stapel gap={9}>
          {NC_ITEMS.map(n => {
            const k = (NC_KIND as Record<string, { c: string, i: string, l: string }>)[n.kind]
            return (
              <Kasten key={n.id} ton={k?.c}>
                <KastenKopf
                  name={n.title}
                  marken={<>
                    <Pill>{k?.l ?? n.kind}</Pill>
                    {n.unread && <Pill variant="acc">neu</Pill>}
                  </>}
                  rechts={n.at}
                />
                <div className="dk-streifen-text">{n.who} — {n.body}</div>
              </Kasten>
            )
          })}
        </Stapel>
        {V('NC_ITEMS', KEIN_EREIGNIS)}
      </Card>
    </Stapel>
  )
}

/**
 * Die zehn dieser Gruppe, die WIRKLICH gezeigt werden.
 *
 * `[cmd]` **`AnsichtAkte` ist gebaut, steht aber NICHT hier** —
 * `record` ist im Verzeichnis als `gebaut` vermerkt und liest echte
 * Zeilen (`TabAthleten`). `[read]` **Waere sie registriert, stuenden
 * echte Daten und Vorlagenzahlen untereinander auf einem Schirm.**
 *
 * `[read]` **Sie bleibt exportiert**, damit sie da ist, wenn jemand
 * die Akte als eigene Ansicht will — und damit auffaellt, dass sie
 * gebaut ist.
 */
export const PORTAL_ANSICHTEN: Record<string, () => React.JSX.Element> = {
  notes: AnsichtNotizen,
  adherence: AnsichtAdherence,
  chkedit: AnsichtVorlagen,
  plans: AnsichtPlaene,
  programs: AnsichtProgramme,
  builder: AnsichtBauer,
  'lib-ex': AnsichtUebungen,
  'lib-meal': AnsichtRezepte,
  calendar: AnsichtKalender,
  inbox: AnsichtBenachrichtigungen,
}
