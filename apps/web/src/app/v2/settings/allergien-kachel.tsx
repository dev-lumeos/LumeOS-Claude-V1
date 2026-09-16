'use client'

// Die Allergienpflege — G-455, EIN Baustein fuer ZWEI Orte.
//
// **Tom:** *„dargestellt kann es ja trotzdem zusaetzlich in
// foods/preferences bleiben und auch da editierbar."*
//
// `[read]` **Dasselbe Muster wie die Mahlzeiten-Slots** (G-332:
// *„Ein Formular, zwei Orte"*) — Settings und Preferences zeigen
// denselben Baustein auf denselben Zeilen. **Eine zweite Fassung
// waere genau die Drift, die Tom vermeiden wollte.**
//
// ══ WAS DIE AUSWAHLLISTEN TRAGEN ════════════════════════════════════
//
// `[cmd]` **Die fuenf Arten und drei Schweren kommen aus den CHECKs
// von `public.user_allergies`** (gemessen 2026-09-15) — sie stehen in
// `allergie-lage.ts` abgeschrieben. `[read]` **Eine Auswahlliste ist
// eine Zusage:** was hier angeboten wird, muss die Datenbank annehmen.
//
// ══ KEINE ALLERGIE ABLEITEN ═════════════════════════════════════════
//
// **Der Auftrag sagt es woertlich:** *„KEINE Allergie ableiten — nur
// was der Nutzer eintraegt."*
//
// `[read]` **Deshalb gibt es hier keine Vorschlagsliste aus den
// Zutaten, keine Uebernahme aus dem Tagebuch und keine Ableitung aus
// den Vorlieben.** **Ein Freitextfeld und drei Auswahlen.**
import * as React from 'react'
import { Card, Pill, Icon } from '@lumeos/ui'

import {
  ARTEN, SCHWEREN, artLabel, schwereLabel, schwereTon,
  QUELLE_SETTINGS, QUELLE_VORLIEBEN,
  prueftProdukte, reichweiteSatz,
  type Allergie, type ArtCode, type SchwereCode, type Vorschlag,
} from '../../../lib/allergien/allergie-lage'
import {
  allergieAnlegen, allergieLoeschen, allergieAendern,
} from './allergie-aktionen'

/**
 * Woher eine Zeile kommt — in einem Wort.
 *
 * `[cmd]` **`nutrition.food_preferences_write` loescht beim Speichern
 * `art='nahrung' AND quelle='nutrition_preferences'`** (gemessen
 * 2026-09-15 im Funktionsrumpf).
 *
 * `[read]` **Das muss sichtbar sein:** wer eine Nahrungsmittelallergie
 * in den Vorlieben gesetzt hat und sie hier loescht, bekommt sie beim
 * naechsten Speichern in Preferences zurueck. **Die Herkunftsmarke
 * sagt, welche Zeile das betrifft.**
 */
function HerkunftsMarke({ quelle }: { quelle: string }) {
  if (quelle === QUELLE_VORLIEBEN) {
    return (
      <span className="v2-muted" style={{ fontSize: 9.5 }}
            title={'Diese Zeile stammt aus Nutrition · Preferences. '
              + 'Wird dort gespeichert, wird sie neu geschrieben.'}>
        aus Preferences
      </span>
    )
  }
  if (quelle === QUELLE_SETTINGS) return null
  // `[read]` **Eine unbekannte Quelle wird BENANNT, nicht versteckt**
  // — sie kann aus einem Import stammen, und wer sie sieht, fragt nach.
  return (
    <span className="v2-muted" style={{ fontSize: 9.5 }}>aus {quelle}</span>
  )
}

export function AllergienKachel({
  allergien, fehler, treffer = {}, ort = 'settings',
}: {
  allergien: Allergie[]
  fehler?: string | null
  /**
   * G-459/A8 — je Allergie die Zahl getroffener Katalogzeilen.
   *
   * `[cmd]` **Aus `user_allergy_catalog_matches` (C-503)**, gelesen in
   * `page.tsx`. `[read]` **Fehlt eine Kennung, fehlt nur die Zahl** —
   * die Zeile steht trotzdem. **Eine `0` waere hier falsch:** sie
   * saehe aus wie *„trifft nichts"*, und das ist etwas anderes als
   * *„nicht gemessen"* (E-72).
   */
  treffer?: Record<string, number>
  /** Nur fuer den Untertitel — die Mechanik ist an beiden Orten gleich. */
  ort?: 'settings' | 'preferences'
}) {
  const [stoff, setStoff] = React.useState('')
  const [art, setArt] = React.useState<ArtCode>('nahrung')
  const [schwere, setSchwere] = React.useState<SchwereCode>('allergie')
  const [laeuft, setLaeuft] = React.useState(false)
  const [meldung, setMeldung] = React.useState<string | null>(null)
  // `[read]` **Welche Zeile gerade gefragt wird** — Loeschen ohne
  // Rueckfrage waere hier falsch: eine Allergie ist eine
  // Sicherheitsangabe, und ein Fehlklick entfernt einen Schutz.
  const [frage, setFrage] = React.useState<Allergie | null>(null)

  // ══ G-459: die Vorschlaege aus C-503 ═══════════════════════════════
  //
  // **Tom:** *„smartsearch mit vorschlaegen im pulldown, live bei der
  // eingabe."*
  //
  // `[read]` **Entprellt und abbrechbar** — dieselbe Mechanik wie in
  // `food-suche-hook.ts` (G-320) und im Produktreiter. `[cmd]` **Ohne
  // Abbruch ueberholt eine langsame aeltere Antwort die neuere**, und
  // im Feld steht ein Wort, waehrend die Liste ein anderes zeigt.
  const [vorschlaege, setVorschlaege] = React.useState<Vorschlag[]>([])
  const [katalogHinweis, setKatalogHinweis] = React.useState<string | null>(null)
  const [listeOffen, setListeOffen] = React.useState(false)
  /** Der angeklickte Vorschlag — er traegt den `stoff_code`. */
  const [gewaehlt, setGewaehlt] = React.useState<Vorschlag | null>(null)
  const laufend = React.useRef<AbortController | null>(null)
  const feld = React.useRef<HTMLDivElement>(null)

  // `[read]` **Die Adresse ist der Schluessel** — eine Zeichenkette,
  // kein Objekt. `[cmd]` **G-455: ein Array als Abhaengigkeit liess
  // den Effekt endlos laufen und seine eigene Anfrage abbrechen.**
  const schluessel = `${art}|${stoff.trim()}`

  React.useEffect(() => {
    const [a, q] = schluessel.split('|')
    // `[read]` **Auch OHNE Begriff gefragt** — bei `medikament` ist
    // die Kataloglucke die Antwort, und die soll man sehen, bevor man
    // tippt.
    const zeit = setTimeout(async () => {
      laufend.current?.abort()
      const ctrl = new AbortController()
      laufend.current = ctrl
      try {
        const r = await fetch(
          `/api/allergien/vorschlaege?art=${encodeURIComponent(a)}`
          + `&q=${encodeURIComponent(q)}`, { signal: ctrl.signal })
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        const j = await r.json() as {
          vorschlaege?: Vorschlag[]; hinweis?: string | null
        }
        setVorschlaege(j.vorschlaege ?? [])
        setKatalogHinweis(j.hinweis ?? null)
      } catch (e) {
        if (e instanceof Error && e.name === 'AbortError') return
        // `[read]` **Ohne Vorschlaege bleibt der Freitext** — die
        // Kachel ist nicht kaputt, sie kann nur weniger.
        setVorschlaege([])
      }
    }, 180)
    return () => clearTimeout(zeit)
  }, [schluessel])

  // Ein Klick daneben schliesst die Liste.
  React.useEffect(() => {
    if (!listeOffen) return
    function daneben(e: MouseEvent) {
      if (feld.current && !feld.current.contains(e.target as Node)) {
        setListeOffen(false)
      }
    }
    document.addEventListener('mousedown', daneben)
    return () => document.removeEventListener('mousedown', daneben)
  }, [listeOffen])

  async function anlegen() {
    if (laeuft || !stoff.trim()) return
    setLaeuft(true); setMeldung(null)
    // `[cmd]` **Der Code geht mit, wenn ein Vorschlag gewaehlt wurde**
    // — sonst `null`, und die Zeile ist Freitext. **C-503 prueft ihn
    // per Trigger:** ein erfundener Code faellt an der Datenbank
    // (gemessen 2026-09-16).
    const a = await allergieAnlegen({
      stoff_text: stoff, art, schwere,
      stoff_code: gewaehlt?.code ?? null,
    })
    setLaeuft(false)
    if (!a.ok) { setMeldung(a.fehler); return }
    setStoff(''); setGewaehlt(null); setListeOffen(false)
  }

  async function loeschen(id: string) {
    setLaeuft(true); setMeldung(null)
    const a = await allergieLoeschen(id)
    setLaeuft(false); setFrage(null)
    if (!a.ok) setMeldung(a.fehler)
  }

  async function schwereWechseln(a: Allergie, neu: SchwereCode) {
    setLaeuft(true); setMeldung(null)
    const r = await allergieAendern(a.id, { schwere: neu })
    setLaeuft(false)
    if (!r.ok) setMeldung(r.fehler)
  }

  return (
    <Card
      // `[read]` **Eine eigene Klasse statt `packages/ui` anfassen** —
      // `.v2-card-h` ist eine `flex`-Reihe ohne Umbruch, und in der
      // halb so breiten Spalte (A1) lagen Titel und Untertitel
      // uebereinander (Foto 2026-09-16). `[cmd]` **`packages/ui`
      // gehoert allen Apps** — eine Aenderung dort traefe jede Kachel
      // im Produkt, fuer ein Problem, das nur diese hat.
      className="v2-allergie-kachel"
      title="Allergien und Unverträglichkeiten"
      sub={ort === 'settings'
        ? 'Gilt in allen Modulen — Lebensmittel, Supplemente, Medikamente.'
        : 'Dieselben Angaben wie in Einstellungen — hier und dort pflegbar.'}
      actions={allergien.length > 0
        ? <Pill>{allergien.length}</Pill>
        : undefined}
    >
      {fehler && (
        <p className="v2-muted" style={{ fontSize: 12, color: 'var(--warn)' }}>
          Nicht geladen: {fehler}
        </p>
      )}

      {/* ── Die Liste ──────────────────────────────────────────────
          `[read]` **Schwerste zuerst** (`sortiere`) — eine Anaphylaxie
          oben. */}
      {allergien.length === 0
        ? (
          // `[read]` **Ein benannter Leerhinweis** (E-72) — und er sagt,
          // dass NICHTS abgeleitet wird. Wer nichts eintraegt, hat
          // keine Allergien im System, nicht „unbekannt".
          <p className="v2-muted" style={{ fontSize: 12.5, margin: '0 0 14px' }}>
            Keine Allergie eingetragen. LumeOS leitet keine ab — es gilt
            nur, was hier steht.
          </p>
          )
        : (
          <ul className="v2-allergie-liste">
            {allergien.map(a => (
              <li key={a.id} className="v2-allergie-zeile">
                <span className="v2-allergie-stoff">{a.stoff_text}</span>
                {/* `[read]` **Die Schwere ist klickbar** — sie aendert
                    sich haeufiger als der Stoff, und ein eigener
                    Bearbeitungsdialog fuer ein Feld waere zu viel. */}
                <select
                  className="v2-feld v2-allergie-schwere"
                  value={a.schwere}
                  disabled={laeuft}
                  aria-label={`Schwere von ${a.stoff_text}`}
                  onChange={e => void schwereWechseln(
                    a, e.target.value as SchwereCode)}
                >
                  {SCHWEREN.map(s => (
                    <option key={s.code} value={s.code}>{s.label}</option>
                  ))}
                </select>

                {/* ══ G-459: die zweite Zeile ══════════════════════
                    `[read]` **Alles Erklaerende zusammen** — Art,
                    Reichweite, Herkunft. `[cmd]` **Vorher standen sie
                    in derselben `flex`-Reihe wie der Knopf**, und in
                    der halb so breiten Spalte brach diese Reihe
                    ungeordnet um (Foto 2026-09-16). */}
                <div className="v2-allergie-unten">
                <Pill variant={schwereTon(a.schwere)}>
                  {schwereLabel(a.schwere)}
                </Pill>
                <span className="v2-allergie-art">{artLabel(a.art)}</span>
                {/* ══ A8: WIE WEIT DIE ZEILE REICHT ═════════════
                    `[read]` **Drei Faelle, drei verschiedene Saetze**
                    — und keiner von ihnen ist eine nackte Null:

                      Katalogcode + Zahl   „prüft N Einträge"
                      Katalogcode, keine   nur der Code steht
                      Freitext             „nicht gegen Produkte"

                    `[cmd]` **`magnesium_stearate` trifft 56.948
                    Produkte, `contains_lactose` 1.021** (gemessen
                    2026-09-16) — **die Zahl ist die Auskunft.** */}
                {prueftProdukte(a)
                  ? (
                    <span className="v2-allergie-reichweite ist-geprueft"
                          style={{ fontSize: 10 }}>
                      {typeof treffer[a.id] === 'number'
                        ? `prüft ${treffer[a.id].toLocaleString('de-DE')} Einträge`
                        : 'aus dem Katalog'}
                    </span>
                    )
                  : (
                    <span className="v2-allergie-reichweite"
                          style={{ fontSize: 10 }}
                          title={reichweiteSatz(a)}>
                      Freitext
                    </span>
                    )}
                <HerkunftsMarke quelle={a.quelle} />
                </div>
                <button
                  type="button" className="v2-btn v2-btn-ghost v2-btn-sm"
                  disabled={laeuft}
                  onClick={() => setFrage(a)}
                  aria-label={`${a.stoff_text} entfernen`}
                >
                  Entfernen
                </button>
              </li>
            ))}
          </ul>
          )}

      {/* ── Anlegen ────────────────────────────────────────────────── */}
      {/* ══ G-459: TABELLARISCH, EINE SPALTE ════════════════════════
          **Tom, 2026-09-08:** *„kann man tabellarisch schoener machen,
          dass die eingabe schoen alles in derselben spalte erfolgt."*

          `[cmd]` **Hier stand eine `flex`-Reihe** — Stoff, Art,
          Schwere und der Knopf nebeneinander, jedes Feld in einer
          anderen Breite. `[read]` **Dieselbe Falle wie in G-453**
          (*„nicht so verstreut auf die breite"*): die Beschriftung
          stand links, das Feld irgendwo rechts daneben.

          `[read]` **Jetzt ein Raster aus zwei Spalten** — Beschriftung
          und Feld —, und **alle Felder beginnen an derselben Kante.**

          ══ DIE ART STEHT ZUERST ════════════════════════════════════

          **Tom:** *„user gibt ein, ob es um nahrung/supplement/
          medikament geht, dementsprechend wissen wir, welche
          produktkataloge SSOT sind."*

          `[read]` **Sie entscheidet, welcher Katalog gefragt wird** —
          eine Suche davor waere eine Frage ohne Adresse. */}
      {/* ══ EIN <div>, KEIN <form> ═══════════════════════════════
          `[cmd]` **Hier stand `<form onSubmit={anlegen}>`.** Seit die
          Kachel in der Spalte des Profilformulars steht (A1), lag sie
          damit INNERHALB von dessen `<form>` — **und ein `<form>` im
          `<form>` ist ungueltiges HTML.**

          `[cmd]` **Der Browser zieht das innere beim Einlesen heraus**,
          der Server hatte es aber verschachtelt ausgeliefert:
          **neunmal `Hydration failed` je Seitenaufruf** (gemessen
          2026-09-16).

          `[read]` **Der Knopf leistet dasselbe ohne `<form>`** — er
          traegt den Aufruf selbst. **Was dabei verloren geht, ist die
          Eingabetaste**, und die wird unten eigens wiederhergestellt. */}
      <div className="v2-allergie-form">
        <label className="v2-allergie-zeile-neu">
          <span className="v2-allergie-label">Art</span>
          <select className="v2-feld" value={art} disabled={laeuft}
                  aria-label="Art"
                  onChange={e => {
                    setArt(e.target.value as ArtCode)
                    // `[read]` **Der gewaehlte Vorschlag faellt mit**
                    // — ein `nutrition:`-Code unter `supplement`
                    // waere ein Code der falschen Art, und der
                    // Trigger von C-503 wiese ihn ab.
                    setGewaehlt(null)
                  }}>
            {ARTEN.map(a => <option key={a.code} value={a.code}>{a.label}</option>)}
          </select>
        </label>

        <div className="v2-allergie-zeile-neu">
          <span className="v2-allergie-label">Stoff</span>
          <div className="v2-allergie-suchfeld" ref={feld}>
            <input
              className="v2-feld"
              value={stoff}
              onChange={e => { setStoff(e.target.value); setGewaehlt(null) }}
              onFocus={() => setListeOffen(true)}
              // `[read]` **Die Eingabetaste kam vom `<form>`** — ohne
              // es muss sie hier stehen, sonst verliert die Kachel eine
              // Bedienung, die vorher da war.
              onKeyDown={e => {
                if (e.key !== 'Enter') return
                e.preventDefault()
                void anlegen()
              }}
              placeholder="Tippen — z. B. Laktose, Erdnuss, Magnesium"
              aria-label="Stoff"
              role="combobox"
              aria-expanded={listeOffen}
              aria-controls="v2-allergie-vorschlaege"
              disabled={laeuft}
              style={{ width: '100%' }}
            />

            {/* ══ DIE VORSCHLAEGE ══════════════════════════════════
                `[cmd]` **Aus `public.allergy_catalog_suggestions`
                (C-503)** — gerufen, nicht nachgebaut.
                `[cmd]` **Gemessen:** *laktose* und *milchzucker*
                finden beide `nutrition:contains_lactose` mit 1.021
                Treffern. **Die Synonymaufloesung ist die Leistung
                der Funktion.** */}
            {listeOffen && (vorschlaege.length > 0 || katalogHinweis) && (
              <div className="v2-allergie-vorschlaege"
                   id="v2-allergie-vorschlaege" role="listbox">
                {/* `[read]` **Die Kataloglucke steht OBEN und ist
                    kein Eintrag** — wer sie anklicken koennte,
                    waehlte eine Abwesenheit. */}
                {katalogHinweis && (
                  <div className="v2-allergie-katalogluecke">
                    <Icon name="alert" className="v2-ic v2-ic-sm" />
                    {katalogHinweis}
                  </div>
                )}
                {vorschlaege.map(v => (
                  <button
                    key={v.code} type="button" role="option"
                    aria-selected={gewaehlt?.code === v.code}
                    className="v2-allergie-vorschlag"
                    onClick={() => {
                      setGewaehlt(v)
                      setStoff(v.name)
                      setListeOffen(false)
                    }}
                  >
                    <span className="v2-allergie-vorschlag-name">{v.name}</span>
                    {/* `[read]` **Die Trefferzahl ist die Auskunft,
                        die den Vorschlag traegt** — sie sagt, wie
                        weit die Allergie reicht. */}
                    <span className="v2-allergie-vorschlag-zahl">
                      {v.treffer.toLocaleString('de-DE')}
                    </span>
                    {/* `[cmd]` **Bei einem Synonym stand ein anderes
                        Wort im Feld** — dann wird es genannt, sonst
                        sieht der Vorschlag wie ein Zufall aus. */}
                    {v.treffertext
                      && v.treffertext.toLowerCase() !== v.name.toLowerCase() && (
                      <span className="v2-allergie-vorschlag-grund">
                        Treffer über „{v.treffertext}“
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="v2-allergie-zeile-neu">
          <span className="v2-allergie-label">Schwere</span>
          <select className="v2-feld" value={schwere} disabled={laeuft}
                  aria-label="Schwere"
                  onChange={e => setSchwere(e.target.value as SchwereCode)}>
            {SCHWEREN.map(s => <option key={s.code} value={s.code}>{s.label}</option>)}
          </select>
        </div>

        {/* ══ NOTIERT ODER GESCHUETZT ═══════════════════════════════
            **Der Auftrag nennt es woertlich:** *„Der Unterschied
            zwischen ‚ich habe es notiert' und ‚LumeOS schuetzt mich
            davor'."*

            `[cmd]` **Die Datenbank zieht dieselbe Grenze** — der
            Trigger `validate_user_allergy_catalog_code` laesst
            `stoff_code IS NULL` durch und weist einen erfundenen Code
            ab (beide 2026-09-16 gemessen).

            `[read]` **Kein Warnton fuer den Freitext** — er ist keine
            Fehleingabe, sondern eine mit geringerer Reichweite. */}
        <div className="v2-allergie-zeile-neu">
          <span className="v2-allergie-label" />
          <div className={gewaehlt
            ? 'v2-allergie-reichweite ist-geprueft'
            : 'v2-allergie-reichweite'}>
            {gewaehlt
              ? (
                <>
                  <Icon name="check" className="v2-ic v2-ic-sm" />
                  Aus dem Katalog — wird gegen{' '}
                  {gewaehlt.treffer.toLocaleString('de-DE')} Einträge
                  geprüft.
                </>
                )
              : (
                <>
                  Freitext: LumeOS notiert den Stoff, prüft aber keine
                  Produkte dagegen. Ein Vorschlag aus der Liste tut es.
                </>
                )}
          </div>
        </div>

        <div className="v2-allergie-zeile-neu">
          <span className="v2-allergie-label" />
          <button type="button" className="v2-btn v2-btn-primary"
                  onClick={() => void anlegen()}
                  disabled={laeuft || !stoff.trim()}>
            <Icon name="plus" className="v2-ic v2-ic-sm" />
            {laeuft ? 'Speichert…' : 'Hinzufügen'}
          </button>
        </div>
      </div>

      {meldung && (
        <p style={{ fontSize: 11.5, color: 'var(--warn)', marginTop: 8 }}>
          {meldung}
        </p>
      )}

      {/* ── Die Rueckfrage vor dem Entfernen ────────────────────────
          `[read]` **Nur abwaerts gefragt** — dieselbe Linie wie beim
          Daumen (G-67): eine Zustimmung ist umkehrbar, das Entfernen
          eines Schutzes nicht folgenlos. **Und die Frage nennt den
          Stoff beim Namen**, statt „Sind Sie sicher?". */}
      {frage && (
        <div
          role="dialog" aria-modal="true"
          aria-label="Allergie entfernen"
          onClick={() => setFrage(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'color-mix(in oklch, var(--bg) 70%, transparent)',
            display: 'grid', placeItems: 'center', padding: 16,
          }}
        >
          <div onClick={e => e.stopPropagation()} style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: 20, maxWidth: 440, width: '100%',
          }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
              {frage.stoff_text} aus den Allergien entfernen?
            </div>
            <div className="v2-muted"
                 style={{ fontSize: 12, lineHeight: 1.55, marginBottom: 16 }}>
              Der harte Filter in Supplements und die Ausschlüsse in
              Nutrition greifen dann nicht mehr für diesen Stoff.
              {frage.quelle === QUELLE_VORLIEBEN && (
                <>
                  {' '}<strong>Diese Zeile stammt aus Nutrition ·
                  Preferences</strong> — wird dort gespeichert, kommt sie
                  zurück.
                </>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button type="button" className="v2-btn v2-btn-ghost"
                      disabled={laeuft} onClick={() => setFrage(null)}>
                Abbrechen
              </button>
              <button type="button" className="v2-btn v2-btn-primary"
                      disabled={laeuft}
                      onClick={() => void loeschen(frage.id)}>
                Entfernen
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
