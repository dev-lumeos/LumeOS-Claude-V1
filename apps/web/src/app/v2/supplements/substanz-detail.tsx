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
// **Detail**: seit G-180 kein Modal mehr, sondern eine Tafel, die
// unter der gewaehlten Zeile aufklappt — `substanz-tafel.tsx`, dort
// steht auch die Begruendung. Add bleibt SEPARAT: der Knopf oeffnet
// den Add-Dialog, das Detail schreibt nie.
import * as React from 'react'
import { useTranslations } from 'next-intl'
import { Card, Pill, Icon } from '@lumeos/ui'

import type {
  SubstanzListenEintrag, SubstanzSatz,
} from '../../../lib/supplements/substanz-read'
// G-180: aus dem Modal wurde ein Ausklappen unter der Zeile — die
// Begruendung steht im Kopf von `substanz-tafel.tsx`.
import { SubstanzTafel } from './substanz-tafel'
import type { ReiterId } from '../../../lib/supplements/substanz-reiter'
import {
  GRUPPEN, UNZUGEORDNET_ID, UNZUGEORDNET_TEXT,
  filtereGruppe, filtereKategorien, gruppeGesperrt, gruppeVon,
  kategorieFarbe, kategorieLabel, kategorieVon, nachGruppenwechsel, trifftSuche,
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
    if (anker.has(s.slug) || namen.has(s.name.toLowerCase())) {
      drin.add(s.id)
    }
  }
  return drin
}

// ── Das Detail ───────────────────────────────────────────────────

// ── G-180: `SubstanzModal` ist entfernt (2026-08-25) ────
//
// **Tom, 2026-08-25:** *„wieso modal und nicht gleich pulldown
// unter dem gewaehlten eintrag?“*
//
// `[cmd]` Hier standen 315 Zeilen Modal. Der Inhalt lebt in
// `substanz-tafel.tsx` weiter und wird als zweite `<tr>` unter der
// gewaehlten Zeile gerendert.
//
// `[read]` **Die Begruendung steht dort im Dateikopf**, damit
// daraus nicht beim naechsten Umbau wieder ein Modal wird.

export function SubstanzDatenbank() {
  // G-172: Spaltenkoepfe und Knopftexte aus `messages/`.
  const t = useTranslations('Supplements')
  const { substanzen, daten, gateOffen, open } = useSupp()
  const [frage, setFrage] = React.useState('')
  const [gruppe, setGruppe] = React.useState<Gruppe | null>(null)
  const [kategorien, setKategorien] = React.useState<ReadonlySet<string>>(new Set())
  const [satz, setSatz] = React.useState<SubstanzSatz | null>(null)
  const [ladeFehler, setLadeFehler] = React.useState<string | null>(null)
  // G-180: welche Zeile ist aufgeklappt — und welcher Reiter darin.
  // `[read]` **Immer nur eine.** Zwei offene Zeilen wuerden den
  // Behaelter sprengen, und die Hoehenbremse waere wirkungslos.
  const [offeneZeile, setOffeneZeile] = React.useState<string | null>(null)
  const [offenerReiter, setOffenerReiter] = React.useState<ReiterId | null>(null)

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
    // G-186 Punkt 3: die Suche durchsucht auch die Zwecke.
    // `[read]` Die Regel steht in `trifftSuche()` — dort ist sie
    // pruefbar, und die Begruendung (842 verschiedene Zwecke, deshalb
    // kein Filter) steht daneben.
    const menge = f ? nachKategorie.filter(s => trifftSuche(s, f)) : nachKategorie
    // ── G-176: KEIN Limit mehr (2026-08-23) ───────────────────────
    //
    // `[cmd]` Hier stand `menge.slice(0, 50)`, eingebracht mit
    // `d019b79`. Die Fusszeile sagte dann *„50 von 290 Treffern —
    // Suche verfeinern fuer mehr"*, und wer bis ganz nach unten rollte,
    // kam bis **Choline bitartrate**. Die uebrigen 240 waren ohne
    // Tippen unerreichbar.
    //
    // `[read]` **Das widersprach dem Punkt, aus dem es stammte:**
    // G-172 verlangte den Rollbehaelter, WEIL unten alles unerreichbar
    // war. Und die Aufforderung geht ins Leere — wer den Namen nicht
    // kennt, kann die Suche nicht verfeinern. **Ein Katalog ist zum
    // Blaettern da.**
    //
    // `[cmd]` **Gemessen am 2026-08-23, bevor entschieden wurde**
    // (`tools/_g176-liste.mjs`, angemeldet, drei Laeufe):
    //
    //            DOM-Knoten   Ladezeit        letzte Zeile
    //   50           1.115    3.565 ms        Choline bitartrate
    //   290          4.713    3.270–3.494 ms  Zinc (T cross-ref)
    //
    // `[read]` **4.713 Knoten sind fuer einen Browser unauffaellig,
    // und die Ladezeit steigt nicht** — sie liegt eher darunter, im
    // Rauschen. **Damit braucht es weder Nachladen noch virtualisierte
    // Liste:** beides waere Aufwand gegen ein Problem, das die Messung
    // nicht zeigt. Wenn der Katalog einmal Tausende traegt, ist die
    // Messung zu wiederholen — die Zahl steht oben, damit sie
    // vergleichbar ist.
    return { gezeigt: menge, gesamt: menge.length }
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
      setOffeneZeile(j.satz.id)
      // `[read]` Der Reiter wird beim Laden zurueckgesetzt: die neue
      // Substanz hat womoeglich andere Reiter, und ein „Formen", das
      // bei ihr nicht existiert, zeigte sonst eine leere Flaeche.
      setOffenerReiter(null)
    } catch (e) {
      setLadeFehler(e instanceof Error ? e.message : String(e))
    }
  }

  /**
   * Ein Klick auf die Zeile: aufklappen — oder wieder zu.
   *
   * `[read]` **Der zweite Klick schliesst.** Das ersetzt den
   * Schliessen-Knopf des Modals, den man suchen musste.
   */
  function schalteZeile(id: string) {
    if (offeneZeile === id) {
      setOffeneZeile(null)
      setSatz(null)
      return
    }
    void oeffne(id)
  }

  // Deep-Link `?substanz=<id>` — oeffnet das Detail direkt (C-224).
  React.useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('substanz')
    if (id) void oeffne(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /**
   * Warum die Liste leer ist — in einem Satz (G-182, Punkt 1).
   *
   * `[read]` **Der Grund wird benannt, nicht geraten:** geprueft wird
   * in der Reihenfolge, in der ein Filter greift. Steht die Suche im
   * Weg, nennt der Satz die Suche; sonst die Kategorie, sonst die
   * Gruppe.
   */
  const grundFuerLeer = React.useMemo(() => {
    const q = frage.trim()
    if (q && sichtbar.length > 0) {
      return `Keine Substanz enthält „${q}“ in Name oder Beschreibung.`
    }
    if (kategorien.size > 0) {
      const namen = Array.from(kategorien).map(kategorieLabel).join(', ')
      return gruppe
        ? `In dieser Gruppe gibt es nichts unter „${namen}“.`
        : `Nichts unter „${namen}“.`
    }
    if (gruppe) return 'In dieser Gruppe ist nichts freigeschaltet.'
    return 'Keine Treffer.'
  }, [frage, sichtbar.length, kategorien, gruppe])

  /**
   * Die Gruppe wechseln — und die Kategorie mit zuruecksetzen.
   *
   * `[cmd]` **G-182 Punkt 1:** `enhanced` → `fatburner` →
   * `supplement` ergab eine leere Liste, weil `fatburner` unter
   * `supplement` keine Zeile trifft (die Kategorie gibt es dort
   * nicht). **Die Regel steht in `nachGruppenwechsel()`** und ist
   * dort per Test bewacht.
   */
  function waehleGruppe(neu: Gruppe | null) {
    const stand = nachGruppenwechsel(gruppe, neu, kategorien)
    setGruppe(stand.gruppe)
    setKategorien(stand.kategorien)
  }

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
          {/* G-181 Punkt 6b: „Alle" als erster Eintrag.
              `[read]` Tom: *„diverse filter haengen wenn man sie
              abwaehlt."* Bis hierher war das Abwaehlen des aktiven
              Knopfes der EINZIGE Weg zurueck — man musste sich merken,
              welcher gedrueckt war. **Ein eigener Knopf ist der Weg
              zurueck, den man sieht.** */}
          <button
            type="button" onClick={() => waehleGruppe(null)}
            className={gruppe === null ? 'v2-pill v2-pill-acc' : 'v2-pill'}
            aria-pressed={gruppe === null}
            style={{ cursor: 'pointer', padding: '4px 12px', fontSize: 11.5 }}
          >
            Alle · {substanzen.length}
          </button>
          {GRUPPEN.map(g => {
            const gesperrt = gruppeGesperrt(g.id, gateOffen)
            const aktiv = gruppe === g.id
            return (
              <button
                key={g.id} type="button" disabled={gesperrt}
                onClick={() => waehleGruppe(aktiv ? null : g.id)}
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
      <div className="v2-supp-suche" style={{ marginBottom: 10 }}>
        <Icon name="search" className="v2-ic v2-ic-sm v2-supp-suchsymbol" />
        <input
          className="v2-feld"
          value={frage}
          onChange={e => setFrage(e.target.value)}
          placeholder="Substanz suchen · Name oder Beschreibung…"
          aria-label="Substanz suchen"
          style={{ paddingLeft: 30, paddingRight: 30, width: '100%' }}
        />
        {/* G-181 Punkt 6a: das X erscheint, sobald etwas drinsteht. */}
        {frage.length > 0 && (
          <button
            type="button" className="v2-supp-suche-x"
            onClick={() => setFrage('')}
            aria-label="Suche leeren"
            title="Suche leeren"
          >
            ×
          </button>
        )}
      </div>

      {/* Die Kategorien mit Farbe UND Text (C-227). */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
        <span className="v2-eyebrow" style={{ alignSelf: 'center', marginRight: 4 }}>
          Kategorie
        </span>
        {/* G-181 Punkt 6b: „Alle" auch hier — die Kategorien sind
            mehrfach waehlbar, und ohne diesen Knopf muss man jede
            einzeln wieder abwaehlen. */}
        <button
          type="button" onClick={() => setKategorien(new Set())}
          className="v2-pill" aria-pressed={kategorien.size === 0}
          style={{
            cursor: 'pointer', padding: '3px 10px', fontSize: 10.5,
            fontWeight: kategorien.size === 0 ? 600 : 400,
            borderColor: kategorien.size === 0 ? 'var(--acc)' : undefined,
            background: kategorien.size === 0
              ? 'color-mix(in oklch, var(--acc) 14%, transparent)' : undefined,
          }}
        >
          Alle
        </button>
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
          {/* G-181 Punkt 1: solange eine Tafel offen ist, werden die
              Nachbarzeilen gedaempft — man soll auf einen Blick sehen,
              was offen ist, statt es beim Lesen zu merken. */}
          <table className={`v2-tbl${offeneZeile ? ' hat-offene' : ''}`}>
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
                const istOffen = offeneZeile === s.id
                return (
                <React.Fragment key={s.id}>
                  <tr style={{ cursor: 'pointer' }}
                      aria-expanded={istOffen}
                      onClick={() => schalteZeile(s.id)}>
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
                                  onClick={e => { e.stopPropagation(); schalteZeile(s.id) }}>
                            {istOffen ? 'Zu' : 'View'}
                          </button>
                        : <button type="button" className="v2-btn v2-btn-sm"
                                  onClick={e => {
                                    e.stopPropagation()
                                    open('add', { name: s.name, substanzId: s.slug || s.id })
                                  }}>
                            <Icon name="plus" className="v2-ic v2-ic-sm" />Add
                          </button>}
                    </td>
                  </tr>
                  {/* G-180: die aufgeklappte Zeile — kein Modal.
                      Begruendung steht in `substanz-tafel.tsx`. */}
                  {istOffen && satz && satz.id === s.id && (
                    <tr className="v2-supp-tafel-zeile">
                      <td colSpan={5} style={{ padding: 0 }}
                          onClick={e => e.stopPropagation()}>
                        <SubstanzTafel
                          satz={satz}
                          offenerReiter={offenerReiter}
                          onReiter={setOffenerReiter}
                          onOeffnen={id => void oeffne(id)}
                          imStack={aktivImStack}
                          onAdd={() => open('add', {
                            name: satz.canonical_name,
                            substanzId: satz.slug || satz.id,
                          })}
                        />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
                )
              })}
            </tbody>
          </table>
          {/* ── G-182 Punkt 1: bei 0 Treffern sagen WARUM ───────────
              `[read]` Eine leere Liste sagt nicht, dass ein Filter
              schuld ist — genau daran ist Tom haengengeblieben. Der
              Satz nennt den Grund, der Knopf ist der Weg zurueck. */}
          {treffer.gesamt === 0 && (
            <div style={{ padding: '22px 14px', textAlign: 'center' }}>
              <p className="v2-muted" style={{ fontSize: 12.5, margin: '0 0 10px' }}>
                {grundFuerLeer}
              </p>
              <button type="button" className="v2-btn v2-btn-sm"
                      onClick={() => { setFrage(''); waehleGruppe(null) }}>
                Filter zurücksetzen
              </button>
            </div>
          )}
        </div>
        {/* G-176: der Zweig „Suche verfeinern fuer mehr" ist weg — mit
            dem Limit ist er unerreichbar geworden, und er wies auf
            einen Weg, den es nicht mehr braucht. Was dasteht, ist die
            Zahl der gezeigten Zeilen gegen den Gesamtbestand. */}
        <div className="v2-dim" style={{ fontSize: 10.5, padding: '8px 14px' }}>
          {`${treffer.gesamt} von ${substanzen.length} Einträgen · supplements.supplements`}
        </div>
        {ladeFehler && (
          <div style={{ fontSize: 11, color: 'var(--warn)', padding: '0 14px 10px' }}>{ladeFehler}</div>
        )}
      </Card>

      {/* G-180: hier stand `<SubstanzModal>`. Die Tafel sitzt jetzt
          als zweite `<tr>` unter der gewaehlten Zeile — Begruendung im
          Kopf von `substanz-tafel.tsx`. */}
    </div>
  )
}
