// Die dreizehn Ansichten des Assistenten — G-407.
//
// ══ ALLE DREIZEHN SIND ATTRAPPEN ═══════════════════════════════════
//
// `[cmd]` **Gemessen: `coach` fuehrt 15 Tabellen, keine davon traegt
// Entwuerfe, Gedaechtnis, Regeln oder Kosten eines Assistenten.**
//
// `[read]` **Das ist der groesste Einzelbefund aus G-405** und
// aendert sich hier nicht. **Was sich aendert: die Kacheln stehen
// jetzt da, mit den Zahlen der Vorlage** — statt eines Vermerks auf
// leerem Schirm.
//
// `[cmd]` **Je Kachel ein Vermerk mit der fehlenden Tabelle** —
// nicht je Ansicht, sonst laesst er sich nicht zaehlen (E-69).
import * as React from 'react'
import { Card, Pill, Row, Icon, KPI, Meter } from '@lumeos/ui'

import {
  CLONE_SOURCES, CLONE_FIDELITY, CLONE_SCOPE, CLONE_LOG,
  PC_CLIENTS, PC_LADDER, CD_DECISIONS,
  CVO_NOTES, CM_METHOD, CM_CLIENTS, CB_BRIEFS, CBU_INTENTS,
  CW_RULES, CG_LOG,
  CAI_QUEUE, CAI_AUTOMATIONS, CAI_DIGEST, CAI_DELEGATION, CAI_CHAT,
} from './daten-assistent'
import {
  Streifen, Haken, Balken, Zitat, Kasten, KastenKopf, Attrappe,
  Raster, Stapel, Auge,
} from './bausteine'

/** Der Vermerk, den alle dreizehn tragen. */
const FEHLT = 'es gibt keine Tabelle fuer den Assistenten in coach '
  + '(15 Tabellen gemessen, keine davon traegt Entwuerfe, Gedaechtnis '
  + 'oder Kosten)'

const V = (quelle: string) => <Attrappe fehlt={FEHLT} quelle={quelle} />

// ── assist · Triage & chat ──────────────────────────────────────
// `ai-assistant.jsx:83` — Warteschlange, Tagesbericht, Chat.

export function AnsichtAssist() {
  return (
    <Stapel>
      <Streifen
        icon="brain"
        titel="Was heute deine Entscheidung braucht"
        text={CAI_DIGEST.headline}
      />

      <Raster spalten="1.4fr 1fr">
        <Card title="Warteschlange" sub={`${CAI_QUEUE.length} Klienten · nach Dringlichkeit`}>
          <Stapel gap={10}>
            {CAI_QUEUE.map(q => (
              <Kasten
                key={q.id}
                ton={q.urgency === 'high' ? 'var(--neg)'
                  : q.urgency === 'medium' ? 'var(--warn)' : 'var(--fg-dim)'}
              >
                <KastenKopf
                  name={q.client}
                  marken={<Pill variant={q.urgency === 'high' ? 'neg' : 'warn'}>{q.urgency}</Pill>}
                  rechts={q.why}
                />
                <div className="dk-streifen-text">{q.prep}</div>
              </Kasten>
            ))}
          </Stapel>
          {V('CAI_QUEUE')}
        </Card>

        <Stapel>
          <Card title="Tagesbericht" sub={CAI_DIGEST.period}>
            <Stapel gap={10}>
              {CAI_DIGEST.sections.map(s => (
                <div key={s.t}>
                  <Auge>{s.t}</Auge>
                  <Stapel gap={4}>
                    {s.items.map((i: string) => (
                      <Haken key={i} ton={s.tone === 'warn' ? 'warn' : 'pos'}>{i}</Haken>
                    ))}
                  </Stapel>
                </div>
              ))}
            </Stapel>
            {V('CAI_DIGEST')}
          </Card>

          <Card title="Automatismen" sub={`${CAI_AUTOMATIONS.length} aktiv`}>
            <Stapel gap={8}>
              {CAI_AUTOMATIONS.map(a => (
                <Kasten key={a.id}>
                  <KastenKopf
                    name={a.name}
                    marken={<Pill variant={a.mode === 'auto' ? 'pos' : undefined}>{a.mode}</Pill>}
                    rechts={`${a.fired}x`}
                  />
                  <div className="dk-streifen-text">{a.trigger} → {a.action}</div>
                  <Row label="freigegeben / bearbeitet" value={`${a.approved} / ${a.edited}`} />
                </Kasten>
              ))}
            </Stapel>
            {V('CAI_AUTOMATIONS')}
          </Card>
        </Stapel>
      </Raster>

      <Raster spalten="1fr 1fr">
        <Card title="Was du abgegeben hast" sub="je Faehigkeit eine Stufe">
          <Stapel gap={6}>
            {CAI_DELEGATION.map(d => (
              <Row
                key={d.cap}
                label={d.cap}
                sub={d.note}
                value={<Pill variant={d.level === 'auto' ? 'pos' : d.level === 'never' ? 'neg' : undefined}>{d.level}</Pill>}
              />
            ))}
          </Stapel>
          {V('CAI_DELEGATION')}
        </Card>

        <Card title="Gespraech" sub="wie du mit dem Assistenten sprichst">
          <Stapel gap={8}>
            {CAI_CHAT.map((m, i) => (
              <div key={i} className={`dk-chat dk-chat-${m.from}`}>
                <div className="dk-kasten-rechts v2-mono">{m.at}</div>
                <div className="dk-streifen-text">{m.body}</div>
              </div>
            ))}
          </Stapel>
          {V('CAI_CHAT')}
        </Card>
      </Raster>
    </Stapel>
  )
}

// ── as-clone · Your clone ───────────────────────────────────────
// `clone.jsx:41` — Quellen, Treue, Reichweite, Protokoll.

export function AnsichtClone() {
  const treue = Math.round(
    CLONE_FIDELITY.reduce((s, f) => s + f.score, 0) / CLONE_FIDELITY.length)
  return (
    <Stapel>
      <Streifen
        icon="brain"
        titel="Anders · AI"
        text={'Beantwortet Routinefragen in deiner Stimme zwischen deinen '
          + 'Kontakten. Jede Antwort ist auf der Klientenseite als KI '
          + 'gekennzeichnet. Sie wendet nie eine Planaenderung an.'}
        aktion={<Pill variant="pos" dot>Treue {treue} %</Pill>}
      />

      <Raster spalten="1fr 1fr">
        <Card title="Quellen" sub={`${CLONE_SOURCES.length} · woraus sie gelernt hat`}>
          <Stapel gap={11}>
            {CLONE_SOURCES.map(s => (
              <Balken
                key={s.id}
                label={<>{s.label} <span className="v2-dim v2-mono" style={{ fontSize: 10 }}>{s.n}</span></>}
                wert={s.pct}
                note={s.desc}
                farbe={s.status === 'processing' ? 'var(--warn)' : undefined}
              />
            ))}
          </Stapel>
          {V('CLONE_SOURCES')}
        </Card>

        <Card title="Treue" sub={`${treue} % im Mittel ueber sechs Masse`}>
          <Stapel gap={11}>
            {CLONE_FIDELITY.map(f => (
              <Balken key={f.dim} label={f.dim} wert={f.score} note={f.note} />
            ))}
          </Stapel>
          {V('CLONE_FIDELITY')}
        </Card>
      </Raster>

      <Card title="Reichweite" sub="worauf sie antwortet und worauf nicht">
        <table className="cp-tabelle">
          <thead>
            <tr><th>Frage</th><th>Beispiel</th><th style={{ width: 90 }}>Erlaubt</th><th>Anmerkung</th></tr>
          </thead>
          <tbody>
            {CLONE_SCOPE.map(s => (
              <tr key={s.q}>
                <td>{s.q}</td>
                <td className="v2-dim" style={{ fontStyle: 'italic' }}>{s.ex}</td>
                <td>
                  {s.allowed === true ? <Pill variant="pos">ja</Pill>
                    : s.allowed === false ? <Pill variant="neg">nein</Pill>
                      : <Pill variant="warn">Entwurf</Pill>}
                </td>
                <td className="v2-dim">{s.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {V('CLONE_SCOPE')}
      </Card>

      <Card title="Protokoll" sub={`${CLONE_LOG.length} Antworten · was sie gesagt hat`}>
        <Stapel gap={10}>
          {CLONE_LOG.map((l, i) => (
            <Kasten key={i} ton={l.verdict === 'escalated' ? 'var(--warn)' : 'var(--pos)'}>
              <KastenKopf
                name={l.client}
                marken={<Pill variant={l.verdict === 'escalated' ? 'warn' : 'pos'}>{l.verdict}</Pill>}
                rechts={l.at}
              />
              <Zitat>{l.q}</Zitat>
              {l.answer !== '—' && (
                <div className="dk-streifen-text" style={{ marginTop: 8 }}>{l.answer}</div>
              )}
              {'editNote' in l && l.editNote && (
                <div className="dk-balken-note" style={{ marginTop: 6 }}>{l.editNote}</div>
              )}
            </Kasten>
          ))}
        </Stapel>
        {V('CLONE_LOG')}
      </Card>
    </Stapel>
  )
}

// ── as-client · Per-client setup ────────────────────────────────
// `clone.jsx:203` — je Klient eine Stufe.

export function AnsichtPerClient() {
  return (
    <Stapel>
      <Card title="Die Leiter" sub={`${PC_LADDER.length} Stufen · von „nur du" bis „handelt allein"`}>
        <Stapel gap={8}>
          {PC_LADDER.map(l => (
            <Kasten key={l.n}>
              <KastenKopf
                name={<><span className="v2-mono">{l.n}</span> · {l.label}</>}
              />
              <div className="dk-streifen-text">{l.desc}</div>
            </Kasten>
          ))}
        </Stapel>
        {V('PC_LADDER')}
      </Card>

      <Card title="Je Klient" sub={`${PC_CLIENTS.length} Klienten · Stufe, Klon, Entwurf, Ton`}>
        <table className="cp-tabelle">
          <thead>
            <tr>
              <th>Klient</th><th style={{ width: 70 }}>Stufe</th>
              <th style={{ width: 60 }}>Klon</th><th style={{ width: 70 }}>Entwurf</th>
              <th style={{ width: 70 }}>Ton</th><th>Anmerkung</th>
            </tr>
          </thead>
          <tbody>
            {PC_CLIENTS.map(c => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td className="v2-num">{c.autonomy}</td>
                <td>{c.clone ? <Pill variant="pos">an</Pill> : <Pill>aus</Pill>}</td>
                <td>{c.drafts ? <Pill variant="pos">ja</Pill> : <Pill>nein</Pill>}</td>
                <td className="v2-dim">{c.tone}</td>
                <td className="v2-dim">{c.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {V('PC_CLIENTS')}
      </Card>
    </Stapel>
  )
}

// ── as-ident · Identity ─────────────────────────────────────────
// `clone.jsx:314` — wie sie sich nennt und was sie nie tut.

export function AnsichtIdentitaet() {
  return (
    <Raster spalten="1fr 1.2fr">
      <Card title="Kennzeichnung" sub="was der Klient sieht">
        <Row label="Name" value="Anders · AI" />
        <Row label="Marke am Text" value="jede Antwort" />
        <Row label="Antwortzeit" value="unter 2 min" />
        <Row label="Uebergabe an dich" value="bei allem Persoenlichen" />
        <div style={{ marginTop: 12 }}>
          <Auge>Was sie nie tut</Auge>
          <Stapel gap={4}>
            <Haken ton="neg">sich als Mensch ausgeben</Haken>
            <Haken ton="neg">eine Planaenderung anwenden</Haken>
            <Haken ton="neg">auf Medizinisches antworten</Haken>
            <Haken ton="neg">ueber Vertrag oder Geld sprechen</Haken>
          </Stapel>
        </div>
        {V('clone.jsx:314')}
      </Card>

      <Card title="Stimme" sub="woran der Klient dich erkennt">
        <Stapel gap={11}>
          {CLONE_FIDELITY.slice(0, 4).map(f => (
            <Balken key={f.dim} label={f.dim} wert={f.score} note={f.note} />
          ))}
        </Stapel>
        {V('CLONE_FIDELITY')}
      </Card>
    </Raster>
  )
}

// ── as-dec · Decisions ──────────────────────────────────────────
// `clone.jsx:390` — jede Entscheidung mit Grund.

export function AnsichtEntscheidungen() {
  return (
    <Card
      title="Entscheidungen"
      sub={`${CD_DECISIONS.length} · warum sie so gehandelt hat`}
    >
      <Stapel gap={10}>
        {CD_DECISIONS.map((d, i) => (
          <Kasten key={i}>
            <KastenKopf
              name={d.short}
              marken={<>
                <Pill>{d.type}</Pill>
                <Pill variant={d.conf >= 0.9 ? 'pos' : 'warn'}>
                  {d.conf.toFixed(2)}
                </Pill>
              </>}
              rechts={d.at}
            />
            <div className="dk-streifen-text">{d.detail}</div>
            <div className="dk-balken-note" style={{ marginTop: 5 }}>
              Regel: <span className="v2-mono">{d.rule}</span>
            </div>
          </Kasten>
        ))}
      </Stapel>
      {V('CD_DECISIONS')}
    </Card>
  )
}

// ── as-brief · Briefings ────────────────────────────────────────

export function AnsichtBriefings() {
  return (
    <Raster spalten="1fr 1.3fr">
      <Card title="Zeitpunkte" sub={`${CB_BRIEFS.length} Berichte am Tag`}>
        <Stapel gap={8}>
          {CB_BRIEFS.map(b => (
            <Kasten key={b.id}>
              <KastenKopf
                name={<><span className="v2-mono">{b.time}</span> · {b.id}</>}
                marken={b.push ? <Pill variant="pos">Push</Pill> : <Pill>still</Pill>}
                rechts={b.days}
              />
              <div className="dk-streifen-text">{b.scope}</div>
              <div className="dk-balken-note">zuletzt {b.last}</div>
            </Kasten>
          ))}
        </Stapel>
        {V('CB_BRIEFS')}
      </Card>

      <Card title="Der Bericht von heute" sub={CAI_DIGEST.period}>
        <div className="dk-streifen-text" style={{ marginBottom: 12 }}>
          {CAI_DIGEST.headline}
        </div>
        <Stapel gap={10}>
          {CAI_DIGEST.sections.map(s => (
            <div key={s.t}>
              <Auge>{s.t}</Auge>
              <Stapel gap={4}>
                {s.items.map((i: string) => (
                  <Haken key={i} ton={s.tone === 'warn' ? 'warn' : 'pos'}>{i}</Haken>
                ))}
              </Stapel>
            </div>
          ))}
        </Stapel>
        {V('CAI_DIGEST')}
      </Card>
    </Raster>
  )
}

// ── as-voice · Voice notes ──────────────────────────────────────

export function AnsichtStimme() {
  const unabgelegt = CVO_NOTES.filter(n => n.state === 'unfiled').length
  return (
    <Raster spalten="1fr 1.4fr">
      <Card title="Diktat" sub="zwischen den Einheiten · auf dem Geraet">
        <Row label="Umschrift" value="auf dem Geraet · whisper.cpp" />
        <Row label="Tonaufbewahrung" value="nach dem Lesen verworfen" />
        <Row label="Klientenerkennung" value="aus dem Namen in der Rede" />
        <Row label="Unabgelegte Notizen" value={unabgelegt} />
        {V('assistant-layers.jsx:20')}
      </Card>

      <Card title="Aufnahmen" sub={`${CVO_NOTES.length} · rohe Rede und was herausgelesen wurde`}>
        <Stapel gap={10}>
          {CVO_NOTES.map((n, i) => (
            <Kasten key={i}>
              <KastenKopf
                name={n.client}
                marken={<>
                  <span className="v2-dim v2-mono" style={{ fontSize: 10 }}>{n.dur}</span>
                  {n.state === 'unfiled'
                    ? <Pill variant="warn">unabgelegt</Pill>
                    : <Pill variant="pos">abgelegt</Pill>}
                </>}
                rechts={n.at}
              />
              <Zitat>{n.raw}</Zitat>
              <div style={{ marginTop: 9 }}>
                <Auge>Herausgelesen</Auge>
                <Stapel gap={4}>
                  {n.parsed.map((p: string) => <Haken key={p}>{p}</Haken>)}
                </Stapel>
              </div>
            </Kasten>
          ))}
        </Stapel>
        {V('CVO_NOTES')}
      </Card>
    </Raster>
  )
}

// ── as-method · Method memory ───────────────────────────────────

export function AnsichtMethode() {
  return (
    <Stapel>
      <Streifen
        icon="brain"
        titel="Gelernt aus 1.240 Nachrichten und 412 Planentscheidungen"
        text={'Das ist es, was einen Entwurf nach dir klingen laesst statt '
          + 'nach einem Modell. Jede Zeile ist aenderbar — steht hier etwas '
          + 'Falsches, werden die Entwuerfe in dieselbe Richtung falsch.'}
      />
      <Raster spalten="1.5fr 1fr">
        <Card title="Deine Methode" sub="aus deiner Arbeit abgeleitet">
          <table className="cp-tabelle">
            <thead>
              <tr>
                <th style={{ width: 110 }}>Bereich</th><th>Muster</th>
                <th style={{ width: 120 }}>Sicherheit</th>
                <th style={{ width: 60, textAlign: 'right' }}>Male</th>
              </tr>
            </thead>
            <tbody>
              {CM_METHOD.map((m, i) => (
                <tr key={i}>
                  <td><Pill>{m.cat}</Pill></td>
                  <td className="v2-dim">{m.txt}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ flex: 1 }}>
                        <Meter
                          value={m.conf * 100}
                          color={m.conf >= 0.9 ? 'var(--pos)' : 'var(--acc-recov)'}
                        />
                      </div>
                      <span className="v2-num v2-dim" style={{ fontSize: 10 }}>
                        {m.conf.toFixed(2)}
                      </span>
                    </div>
                  </td>
                  <td className="v2-num" style={{ textAlign: 'right' }}>{m.uses}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {V('CM_METHOD')}
        </Card>

        <Card title="Je Klient" sub="was sie sich zum Umgang gemerkt hat">
          <Stapel gap={9}>
            {CM_CLIENTS.map(c => (
              <Kasten key={c.c}>
                <KastenKopf name={c.c} rechts={`${c.n} Notizen`} />
                <div className="dk-streifen-text">{c.top}</div>
              </Kasten>
            ))}
          </Stapel>
          {V('CM_CLIENTS')}
        </Card>
      </Raster>
    </Stapel>
  )
}

// ── as-butler · Portal actions ──────────────────────────────────

export function AnsichtButler() {
  return (
    <Stapel>
      <Streifen
        icon="sparkles"
        titel="Sag, was geschehen soll"
        text={'Der Assistent versteht Absichten und fuehrt sie im Portal aus. '
          + 'Was sofort geht, geht sofort; was eine Entscheidung braucht, '
          + 'wartet auf dich.'}
      />
      <Card title="Absichten" sub={`${CBU_INTENTS.length} erkannt`}>
        <table className="cp-tabelle">
          <thead>
            <tr>
              <th style={{ width: 150 }}>Absicht</th><th>Beispiel</th>
              <th style={{ width: 100 }}>Sicherheit</th>
              <th style={{ width: 100 }}>Ablauf</th>
              <th style={{ width: 50, textAlign: 'right' }}>Male</th>
            </tr>
          </thead>
          <tbody>
            {CBU_INTENTS.map(i => (
              <tr key={i.intent}>
                <td className="v2-mono">{i.intent}</td>
                <td className="v2-dim" style={{ fontStyle: 'italic' }}>{i.ex}</td>
                <td className="v2-num">{i.conf.toFixed(2)}</td>
                <td>
                  <Pill variant={i.flow === 'immediate' ? 'pos' : 'warn'}>{i.flow}</Pill>
                </td>
                <td className="v2-num" style={{ textAlign: 'right' }}>{i.n}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {V('CBU_INTENTS')}
      </Card>
    </Stapel>
  )
}

// ── as-watch · Roster watcher ───────────────────────────────────

export function AnsichtWaechter() {
  const gefeuert = CW_RULES.reduce((s, r) => s + r.fired, 0)
  return (
    <Stapel>
      <Raster spalten="repeat(3, 1fr)">
        <KPI label="Regeln" value={CW_RULES.length} />
        <KPI label="ausgeloest · 30 T" value={gefeuert} />
        <KPI label="stummgeschaltet" value={CW_RULES.filter(r => r.muted).length} />
      </Raster>
      <Card title="Was er beobachtet" sub={`${CW_RULES.length} Regeln ueber die ganze Liste`}>
        <table className="cp-tabelle">
          <thead>
            <tr>
              <th style={{ width: 150 }}>Regel</th><th style={{ width: 80 }}>Stufe</th>
              <th>Bedingung</th>
              <th style={{ width: 70, textAlign: 'right' }}>Male</th>
              <th style={{ width: 80, textAlign: 'right' }}>Klienten</th>
            </tr>
          </thead>
          <tbody>
            {CW_RULES.map(r => (
              <tr key={r.id}>
                <td className="v2-mono">{r.id}</td>
                <td>
                  <Pill variant={r.level === 'critical' ? 'neg' : r.level === 'warning' ? 'warn' : undefined}>
                    {r.level}
                  </Pill>
                </td>
                <td className="v2-dim">{r.cond}</td>
                <td className="v2-num" style={{ textAlign: 'right' }}>{r.fired}</td>
                <td className="v2-num" style={{ textAlign: 'right' }}>{r.clients}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {V('CW_RULES')}
      </Card>
    </Stapel>
  )
}

// ── as-tone · Tone calibration ──────────────────────────────────

export function AnsichtTon() {
  return (
    <Raster spalten="1fr 1fr">
      <Card title="Ton je Klient" sub="wie direkt der Assistent schreibt">
        <Stapel gap={8}>
          {PC_CLIENTS.map(c => (
            <Row key={c.id} label={c.name} value={<Pill>{c.tone}</Pill>} sub={c.note} />
          ))}
        </Stapel>
        {V('PC_CLIENTS')}
      </Card>
      <Card title="Wo der Ton kippt" sub="die schwaechsten zwei Masse">
        <Stapel gap={11}>
          {[...CLONE_FIDELITY].sort((a, b) => a.score - b.score).slice(0, 3).map(f => (
            <Balken key={f.dim} label={f.dim} wert={f.score} note={f.note} />
          ))}
        </Stapel>
        {V('CLONE_FIDELITY')}
      </Card>
    </Raster>
  )
}

// ── as-guard · Guardrails ───────────────────────────────────────

export function AnsichtGrenzen() {
  return (
    <Stapel>
      <Streifen
        icon="shield"
        titel="Was der Assistent nicht darf"
        text={'Jeder Eingriff steht im Protokoll — mit dem, was stattdessen '
          + 'geschehen ist.'}
        ton="warn"
      />
      <Card title="Protokoll" sub={`${CG_LOG.length} Eingriffe`}>
        <Stapel gap={10}>
          {CG_LOG.map((g, i) => (
            <Kasten key={i} ton={g.action === 'blocked' ? 'var(--neg)' : 'var(--warn)'}>
              <KastenKopf
                name={g.what}
                marken={<Pill variant={g.action === 'blocked' ? 'neg' : 'warn'}>{g.action}</Pill>}
                rechts={g.at}
              />
              <div className="dk-streifen-text">{g.out}</div>
            </Kasten>
          ))}
        </Stapel>
        {V('CG_LOG')}
      </Card>
    </Stapel>
  )
}

// ── as-cost · Cost & usage ──────────────────────────────────────

export function AnsichtKosten() {
  return (
    <Stapel>
      <Raster spalten="repeat(4, 1fr)">
        <KPI label="Entwuerfe · 7 T" value={18} />
        <KPI label="selbst gesendet" value={11} />
        <KPI label="eskaliert" value={3} />
        <KPI label="Kosten · 30 T" value="$14.82" />
      </Raster>
      <Raster spalten="1fr 1fr">
        <Card title="Woran es liegt" sub="Anteil je Aufgabe">
          <Stapel gap={11}>
            <Balken label="Entwuerfe schreiben" wert={62} note="der groesste Posten" />
            <Balken label="Warteschlange ordnen" wert={18} />
            <Balken label="Tagesbericht" wert={12} />
            <Balken label="Stimme umschreiben" wert={8} />
          </Stapel>
          {V('assistant-layers.jsx:401')}
        </Card>
        <Card title="Je Klient" sub="wo die Arbeit anfaellt">
          <Stapel gap={6}>
            {PC_CLIENTS.map(c => (
              <Row key={c.id} label={c.name} value={c.drafts ? 'Entwuerfe an' : '—'} />
            ))}
          </Stapel>
          {V('PC_CLIENTS')}
        </Card>
      </Raster>
    </Stapel>
  )
}

/** Die dreizehn, nach der Kennung des Unterpunkts. */
export const ASSISTENT_ANSICHTEN: Record<string, () => React.JSX.Element> = {
  assist: AnsichtAssist,
  'as-clone': AnsichtClone,
  'as-client': AnsichtPerClient,
  'as-ident': AnsichtIdentitaet,
  'as-dec': AnsichtEntscheidungen,
  'as-brief': AnsichtBriefings,
  'as-voice': AnsichtStimme,
  'as-method': AnsichtMethode,
  'as-butler': AnsichtButler,
  'as-watch': AnsichtWaechter,
  'as-tone': AnsichtTon,
  'as-guard': AnsichtGrenzen,
  'as-cost': AnsichtKosten,
}
