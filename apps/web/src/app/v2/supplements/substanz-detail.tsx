'use client'

// Der EINE Substanzkatalog (C-229) — Liste, Detail und Add getrennt.
//
// `[read]` Toms Urteil zur ersten Fassung: „diese substanzenauflistung
// sieht scheisse aus, detail … hat keine informationen wie was ist das
// ueberhaupt, tonnen eintraege aber keine beschreibung." Und zum
// Database-Tab: „das sieht viel mehr wie eine brauchbare version aus …
// detail ist das supplement / add ist separat / links wird name und
// keypoints was es macht angezeigt."
//
// `[cmd]` Deshalb ist das Layout hier die `DatabaseEcht`-Vorlage
// (tabs.tsx:779, G-37) — links Name mit der `description` als
// Unterzeile, Add als eigene Spalte, Active/View im Stack, Zeilenklick
// oeffnet das Detail, `stopPropagation` auf den Knoepfen, EINE Suche.
// Nur die Tabelle ist neu: `substance_catalog` (566) statt
// `supplement_catalog` (44).
//
// **Drei Gruppen** (C-228): Supplements · Peptide · Enhanced, je mit
// Zaehler; Peptide und Enhanced erst ab experience_level pro/elite
// (G-167 — dieselbe Schwelle wie das Extended-Gate). Darunter die
// Kategorien mit Farbe UND Text (C-227, A-31).
//
// **Detail**: erst was es ist (Kopf, dann `description`), DANN die
// Bloecke — alle klappbar und eingeklappt (`Klappe` aus packages/ui,
// Start ueber `startOffen()`, der Waechter haelt sie zu). Add bleibt
// SEPARAT: der Knopf oeffnet den Add-Dialog, das Detail schreibt nie.
import * as React from 'react'
import { useTranslations } from 'next-intl'
import { Card, Pill, Icon, Klappe } from '@lumeos/ui'

// `[read]` Serverfrei — `substanz-read` selbst zieht `next/headers`
// und darf im Client-Bundle nicht als Wert auftauchen (A-30).
import { OHNE_QUELLE } from '../../../lib/supplements/substanz-luecken'
import type {
  SubstanzListenEintrag, SubstanzSatz,
} from '../../../lib/supplements/substanz-read'
import {
  baueBloecke, benannteLuecken, startOffen, type Feld,
} from '../../../lib/supplements/substanz-anzeige'
import {
  GRUPPEN, UNZUGEORDNET_ID, UNZUGEORDNET_TEXT,
  filtereGruppe, filtereKategorien, gruppeGesperrt, gruppeVon,
  kategorieFarbe, kategorieLabel, kategorieVon,
  zaehleGruppen, zaehleKategorien, type Gruppe,
} from '../../../lib/supplements/substanz-kategorien'
import { useSupp } from './kontext'

/** Kategorie-Kennzeichnung: Farbe UND Text, nie nur Farbe (A-31). */
function KategoriePill({ kategorie }: { kategorie: string }) {
  const farbe = kategorieFarbe(kategorie)
  return (
    <span
      className="v2-pill"
      title={kategorie === UNZUGEORDNET_ID ? UNZUGEORDNET_TEXT : undefined}
      style={{
        fontSize: 9, color: farbe,
        borderColor: `color-mix(in oklch, ${farbe} 45%, var(--border))`,
        background: `color-mix(in oklch, ${farbe} 10%, transparent)`,
      }}
    >
      {kategorieLabel(kategorie)}
    </span>
  )
}

/** Der Herkunftsvermerk an jedem Feld (C-224). */
function HerkunftPill({ f }: { f: Feld }) {
  if (!f.herkunft) {
    return (
      <span className="v2-mono" style={{
        fontSize: 8.5, color: 'var(--warn)', whiteSpace: 'nowrap',
      }}>ohne Herkunft</span>
    )
  }
  const h = f.herkunft
  return (
    <span className="v2-mono v2-dim" style={{ fontSize: 8.5, whiteSpace: 'nowrap' }}>
      {[h.evidence_class, h.source_id, h.as_of].filter(Boolean).join(' · ')}
    </span>
  )
}

/**
 * Ist die Substanz im Stack? Erst ueber den Anker aus der Zuteilung
 * (`substance_catalog:<id>` in notes), dann ueber Namensgleichheit —
 * Positionen aus dem 44er-Katalog tragen keinen Anker.
 *
 * `[cmd]` **C-252: der Anker wird gegen `slug` geprueft, nicht gegen
 * `id`.** Der Katalog liest seit C-252 `supplements.supplements`, und
 * dort ist `id` ein UUID; der Anker traegt die alte
 * `substance_catalog.id`. **Die ist gleich `slug`, bei allen 566
 * gemessen am 2026-08-23.** Gegen `id` verglichen traefe er nie mehr.
 *
 * `[cmd]` Live haengt daran nichts: **0 von 11 `stack_items` tragen
 * ueberhaupt einen Anker.** Der Namensweg greift also ohnehin — aber
 * ein Anker, der stumm nicht mehr passt, waere genau die Art Fehler,
 * die erst in Monaten auffaellt.
 */
function imStackIds(
  positionen: Array<{ notes: string | null; name: string }>,
  liste: SubstanzListenEintrag[],
): Set<string> {
  const anker = new Set<string>()
  const namen = new Set<string>()
  for (const p of positionen) {
    const m = p.notes?.match(/substance_catalog:(\S+)/)
    if (m) anker.add(m[1])
    namen.add(p.name.toLowerCase())
  }
  const drin = new Set<string>()
  for (const s of liste) {
    if (anker.has(s.slug) || anker.has(s.id) || namen.has(s.name.toLowerCase())) {
      drin.add(s.id)
    }
  }
  return drin
}

// ── Das Detail ───────────────────────────────────────────────────

function SubstanzModal({
  satz, imStack, onClose,
}: {
  satz: SubstanzSatz
  imStack: boolean
  onClose: () => void
}) {
  // G-172: der Knopftext aus `messages/`.
  const t = useTranslations('Supplements')
  const { open } = useSupp()
  const bloecke = baueBloecke(satz)
  const luecken = benannteLuecken(satz)
  // Alle Bloecke starten ZU — startOffen() haelt der Waechter leer.
  const [offen, setOffen] = React.useState<Set<string>>(startOffen)
  const gruppe = gruppeVon({ gruppe: satz.gruppe ?? null })

  function schalte(titel: string) {
    setOffen(alt => {
      const neu = new Set(alt)
      if (neu.has(titel)) neu.delete(titel)
      else neu.add(titel)
      return neu
    })
  }

  return (
    <div className="v2-modal-veil" onClick={onClose} role="presentation">
      <div className="v2-modal" onClick={e => e.stopPropagation()}
           role="dialog" aria-modal="true" aria-label={satz.canonical_name}
           style={{ maxWidth: 680 }}>
        <div className="v2-modal-h">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 15, fontWeight: 600 }}>{satz.canonical_name}</span>
              {gruppe && (
                <Pill style={{ fontSize: 9 }}>
                  {GRUPPEN.find(g => g.id === gruppe)?.label ?? gruppe}
                </Pill>
              )}
              <KategoriePill kategorie={kategorieVon({
                canonical_category: satz.canonical_category ?? null,
              })} />
            </div>
            {/* `[read]` C-252: der Slug, nicht die `id`. Seit der
                Umstellung ist `id` ein UUID — fuer einen Menschen
                nichtssagend, waehrend der Slug (`sub_9f9bb8c160`) die
                Zeile benennt und zugleich der Anker des Stacks ist. */}
            <div className="v2-dim v2-mono" style={{ fontSize: 10, marginTop: 2 }}>
              {[satz.chemical_form, satz.slug || satz.id].filter(Boolean).join(' · ')}
            </div>
          </div>
          <button type="button" className="v2-btn v2-btn-ghost v2-btn-sm" onClick={onClose}>
            <Icon name="x" className="v2-ic v2-ic-sm" />
          </button>
        </div>
        <div className="v2-modal-body" style={{ overflowY: 'auto' }}>
          {/* ERST was es ist — die description, vor allen Bloecken. */}
          {satz.description && (
            <p style={{ fontSize: 12.5, lineHeight: 1.6, margin: '0 0 12px' }}>
              {satz.description}
            </p>
          )}
          {satz.aliases.length > 0 && (
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 12 }}>
              {satz.aliases.slice(0, 8).map(a => <Pill key={a}>{a}</Pill>)}
            </div>
          )}

          {/* DANN die Zusatzinfos — „die keiner sehen muss wenn er es
              nicht explizit will": klappbar, Start zu. */}
          <div className="v2-col-gap" style={{ gap: 6 }}>
            {bloecke.map(b => (
              <Klappe
                key={b.titel} titel={b.titel}
                sub={`${b.felder.length} ${b.felder.length === 1 ? 'Feld' : 'Felder'}`}
                offen={offen.has(b.titel)} onToggle={() => schalte(b.titel)}
              >
                <div className="v2-col-gap" style={{ gap: 6 }}>
                  {b.felder.map(f => (
                    <div key={f.pfad} style={{
                      padding: '7px 10px', background: 'var(--bg-elev)',
                      border: '1px solid var(--border)', borderRadius: 5,
                    }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', marginBottom: 2 }}>
                        <span style={{ fontSize: 11.5, fontWeight: 600 }}>{f.label}</span>
                        <span style={{ marginLeft: 'auto' }}><HerkunftPill f={f} /></span>
                      </div>
                      {f.zeilen.map((z, i) => (
                        <div key={i} className="v2-muted" style={{ fontSize: 11, lineHeight: 1.5 }}>{z}</div>
                      ))}
                    </div>
                  ))}
                </div>
              </Klappe>
            ))}
          </div>

          {luecken.length > 0 && (
            <div style={{ margin: '12px 0' }}>
              <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Benannte Lücken</div>
              {luecken.map(l => (
                <div key={l.feld} className="v2-dim" style={{ fontSize: 10.5, lineHeight: 1.55 }}>
                  <span className="v2-mono">{l.feld}</span> — {l.grund}
                </div>
              ))}
            </div>
          )}

          {bloecke.length === 0 && !satz.description && (
            <div className="v2-muted" style={{ fontSize: 11.5, marginBottom: 12 }}>
              Zu dieser Substanz liegen über Name, Einordnung und Aliasse
              hinaus keine Rechercheblöcke vor.
            </div>
          )}

          {/* C-252 Punkt 3/4: was beim Umbau keine Quelle bekam.
              `[read]` Es steht als GRUND da, nicht als Strich und nicht
              als Null — ein Strich hiesse „leer", und das waere eine
              Aussage ueber die Substanz statt ueber den Datenstand. */}
          <div style={{ margin: '12px 0 0' }}>
            <div className="v2-eyebrow" style={{ marginBottom: 6 }}>
              Ohne Quelle im neuen Katalog
            </div>
            <div className="v2-dim" style={{ fontSize: 10.5, lineHeight: 1.55, marginBottom: 6 }}>
              Gemessen am 23.08.2026 über die 290 sichtbaren Substanzen.
              Diese Felder führte die alte Breittabelle; im neuen Katalog
              haben sie keine Spalte oder keinen Wert.
            </div>
            {OHNE_QUELLE.map(l => (
              <div key={l.feld} className="v2-dim" style={{ fontSize: 10.5, lineHeight: 1.55 }}>
                <span className="v2-mono">{l.feld}</span>
                {' '}<Pill style={{ fontSize: 9 }}>{l.art === 'fehlt' ? 'keine Spalte' : 'leer'}</Pill>
                {' '}— {l.grund}
              </div>
            ))}
          </div>
        </div>
        {/* Add ist SEPARAT — das Detail schreibt nie. Der Knopf
            oeffnet den Add-Dialog mit Stackwahl. */}
        <div className="v2-modal-f" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {imStack && <Pill variant="pos"><Icon name="check" className="v2-ic v2-ic-sm" />Active</Pill>}
          <button
            type="button" className="v2-btn v2-btn-primary"
            style={{ marginLeft: 'auto' }}
            onClick={() => {
              onClose()
              // `[cmd]` C-252: der SLUG als Anker, nicht die `id`.
              // `modale.tsx` schreibt ihn als `substance_catalog:<wert>`
              // in `notes`, und `imStackIds` liest ihn dort wieder. Mit
              // dem UUID stuende dort ein Wert, der nie wieder trifft.
              open('add', { name: satz.canonical_name, substanzId: satz.slug || satz.id })
            }}
          >
            <Icon name="plus" className="v2-ic v2-ic-sm" />
            {t('zumStackHinzufuegen')}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Die Liste — das DatabaseEcht-Layout auf 566 Zeilen ───────────

export function SubstanzDatenbank() {
  // G-172: Spaltenkoepfe und Knopftexte aus `messages/`.
  const t = useTranslations('Supplements')
  const { substanzen, daten, gateOffen, open } = useSupp()
  const [frage, setFrage] = React.useState('')
  const [gruppe, setGruppe] = React.useState<Gruppe | null>(null)
  const [kategorien, setKategorien] = React.useState<ReadonlySet<string>>(new Set())
  const [satz, setSatz] = React.useState<SubstanzSatz | null>(null)
  const [ladeFehler, setLadeFehler] = React.useState<string | null>(null)

  const drin = React.useMemo(
    () => imStackIds(daten?.positionen ?? [], substanzen),
    [daten, substanzen])

  const gruppenZaehler = React.useMemo(() => zaehleGruppen(substanzen), [substanzen])
  const hatGruppen = Object.values(gruppenZaehler).some(n => n > 0)

  const sichtbar = React.useMemo(
    () => filtereGruppe(substanzen, gruppe, gateOffen),
    [substanzen, gruppe, gateOffen])
  const kategorieZaehler = React.useMemo(() => zaehleKategorien(sichtbar), [sichtbar])

  const treffer = React.useMemo(() => {
    const f = frage.trim().toLowerCase()
    const nachKategorie = filtereKategorien(sichtbar, kategorien)
    const menge = f
      ? nachKategorie.filter(s => s.name.toLowerCase().includes(f)
        || (s.description ?? '').toLowerCase().includes(f))
      : nachKategorie
    return { gezeigt: menge.slice(0, 50), gesamt: menge.length }
  }, [sichtbar, frage, kategorien])

  async function oeffne(id: string) {
    setLadeFehler(null)
    try {
      const antwort = await fetch(`/api/supplements/substanz?id=${encodeURIComponent(id)}`)
      const j = await antwort.json() as { satz?: SubstanzSatz; error?: string }
      if (!antwort.ok || !j.satz) {
        setLadeFehler(j.error ?? 'Nicht geladen.')
        return
      }
      setSatz(j.satz)
    } catch (e) {
      setLadeFehler(e instanceof Error ? e.message : String(e))
    }
  }

  // Deep-Link `?substanz=<id>` — oeffnet das Detail direkt (C-224).
  React.useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('substanz')
    if (id) void oeffne(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function schalteKategorie(k: string) {
    setKategorien(alt => {
      const neu = new Set(alt)
      if (neu.has(k)) neu.delete(k)
      else neu.add(k)
      return neu
    })
  }

  return (
    <div>
      {/* Die drei Gruppen (C-228) — Zaehler gezaehlt; Peptide und
          Enhanced erst ab pro/elite (G-167). */}
      {hatGruppen && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
          {GRUPPEN.map(g => {
            const gesperrt = gruppeGesperrt(g.id, gateOffen)
            const aktiv = gruppe === g.id
            return (
              <button
                key={g.id} type="button" disabled={gesperrt}
                onClick={() => setGruppe(aktiv ? null : g.id)}
                className={aktiv ? 'v2-pill v2-pill-acc' : 'v2-pill'}
                aria-pressed={aktiv}
                title={gesperrt ? 'Ab Erfahrungsgrad pro/elite (Extended-Gate, G-167).' : undefined}
                style={{
                  cursor: gesperrt ? 'not-allowed' : 'pointer',
                  padding: '4px 12px', fontSize: 11.5,
                  opacity: gesperrt ? 0.55 : 1,
                }}
              >
                {/* Kein Schloss-Icon im Satz (IconName kennt keins) —
                    der title und die gedimmte Optik sagen es. */}
                {gesperrt ? '🔒 ' : ''}{g.label} · {gruppenZaehler[g.id]}
              </button>
            )
          })}
        </div>
      )}

      {/* EINE Suche. */}
      <div style={{ position: 'relative', marginBottom: 10 }}>
        <Icon name="search" className="v2-ic v2-ic-sm v2-supp-suchsymbol" />
        <input
          className="v2-feld"
          value={frage}
          onChange={e => setFrage(e.target.value)}
          placeholder="Substanz suchen · Name oder Beschreibung…"
          aria-label="Substanz suchen"
          style={{ paddingLeft: 30, width: '100%' }}
        />
      </div>

      {/* Die Kategorien mit Farbe UND Text (C-227). */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
        <span className="v2-eyebrow" style={{ alignSelf: 'center', marginRight: 4 }}>
          Kategorie
        </span>
        {kategorieZaehler.map(([k, n]) => {
          const farbe = kategorieFarbe(k)
          const aktiv = kategorien.has(k)
          return (
            <button
              key={k} type="button" onClick={() => schalteKategorie(k)}
              className="v2-pill" aria-pressed={aktiv}
              title={k === UNZUGEORDNET_ID ? UNZUGEORDNET_TEXT : undefined}
              style={{
                cursor: 'pointer', padding: '3px 10px', fontSize: 10.5,
                fontWeight: aktiv ? 600 : 400,
                color: farbe,
                borderColor: aktiv ? farbe : `color-mix(in oklch, ${farbe} 35%, var(--border))`,
                background: aktiv
                  ? `color-mix(in oklch, ${farbe} 16%, transparent)`
                  : `color-mix(in oklch, ${farbe} 5%, transparent)`,
              }}
            >
              {kategorieLabel(k)} · {n}
            </button>
          )
        })}
      </div>

      <Card style={{ padding: 0 }}>
        <div className="v2-supp-tbl-wrap">
          <table className="v2-tbl">
            <thead>
              <tr>
                {/* G-172: aus `messages/`. `ACTION` bekommt keine
                    Ueberschrift — die Spalte traegt Knoepfe, und ein
                    Wort darueber sagt nichts, was der Knopf nicht
                    selbst sagt. */}
                <th style={{ paddingLeft: 14 }}>{t('spalteSubstanz')}</th>
                <th style={{ width: 140 }}>{t('spalteKategorie')}</th>
                <th style={{ width: 70 }}>{t('spalteEvidenz')}</th>
                <th style={{ width: 90 }}>{t('spalteImStack')}</th>
                <th style={{ width: 90, textAlign: 'right' }} />
              </tr>
            </thead>
            <tbody>
              {treffer.gezeigt.map(s => {
                const aktivImStack = drin.has(s.id)
                return (
                  <tr key={s.id} style={{ cursor: 'pointer' }}
                      onClick={() => void oeffne(s.id)}>
                    <td style={{ paddingLeft: 14 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 500 }}>{s.name}</div>
                      {/* Die Keypoints: `description` aus C-228 — wo
                          sie fehlt, steht nichts, kein Strich. */}
                      {s.description && (
                        <div className="v2-muted" style={{
                          fontSize: 10.5, maxWidth: 480, overflow: 'hidden',
                          textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {s.description}
                        </div>
                      )}
                    </td>
                    <td><KategoriePill kategorie={kategorieVon(s)} /></td>
                    <td>
                      {s.grad && <Pill style={{ fontSize: 9 }}>{s.grad}</Pill>}
                    </td>
                    <td>
                      {aktivImStack
                        ? <Pill variant="pos"><Icon name="check" className="v2-ic v2-ic-sm" />Active</Pill>
                        : <span className="v2-dim" style={{ fontSize: 11 }}>—</span>}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {aktivImStack
                        ? <button type="button" className="v2-btn v2-btn-ghost v2-btn-sm"
                                  onClick={e => { e.stopPropagation(); void oeffne(s.id) }}>View</button>
                        : <button type="button" className="v2-btn v2-btn-sm"
                                  onClick={e => {
                                    e.stopPropagation()
                                    open('add', { name: s.name, substanzId: s.id })
                                  }}>
                            <Icon name="plus" className="v2-ic v2-ic-sm" />Add
                          </button>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="v2-dim" style={{ fontSize: 10.5, padding: '8px 14px' }}>
          {treffer.gezeigt.length < treffer.gesamt
            ? `${treffer.gezeigt.length} von ${treffer.gesamt} Treffern — Suche verfeinern für mehr.`
            : `${treffer.gesamt} von ${substanzen.length} Einträgen · supplements.supplements`}
        </div>
        {ladeFehler && (
          <div style={{ fontSize: 11, color: 'var(--warn)', padding: '0 14px 10px' }}>{ladeFehler}</div>
        )}
      </Card>

      {satz && (
        <SubstanzModal
          satz={satz} imStack={drin.has(satz.id)}
          onClose={() => setSatz(null)}
        />
      )}
    </div>
  )
}
