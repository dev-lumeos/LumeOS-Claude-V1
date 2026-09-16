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
  type Allergie, type ArtCode, type SchwereCode,
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
  allergien, fehler, ort = 'settings',
}: {
  allergien: Allergie[]
  fehler?: string | null
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

  async function anlegen(e: React.FormEvent) {
    e.preventDefault()
    setLaeuft(true); setMeldung(null)
    const a = await allergieAnlegen({ stoff_text: stoff, art, schwere })
    setLaeuft(false)
    if (!a.ok) { setMeldung(a.fehler); return }
    setStoff('')
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
                <span className="v2-allergie-art">{artLabel(a.art)}</span>
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
                <Pill variant={schwereTon(a.schwere)}>
                  {schwereLabel(a.schwere)}
                </Pill>
                <HerkunftsMarke quelle={a.quelle} />
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
      <form onSubmit={anlegen} className="v2-allergie-form">
        <input
          className="v2-feld"
          value={stoff}
          onChange={e => setStoff(e.target.value)}
          placeholder="Stoff — z. B. Laktose, Erdnuss, Penicillin"
          aria-label="Stoff"
          disabled={laeuft}
          style={{ flex: '1 1 200px', minWidth: 160 }}
        />
        <select className="v2-feld" value={art} disabled={laeuft}
                aria-label="Art"
                onChange={e => setArt(e.target.value as ArtCode)}>
          {ARTEN.map(a => <option key={a.code} value={a.code}>{a.label}</option>)}
        </select>
        <select className="v2-feld" value={schwere} disabled={laeuft}
                aria-label="Schwere"
                onChange={e => setSchwere(e.target.value as SchwereCode)}>
          {SCHWEREN.map(s => <option key={s.code} value={s.code}>{s.label}</option>)}
        </select>
        <button type="submit" className="v2-btn v2-btn-primary"
                disabled={laeuft || !stoff.trim()}>
          <Icon name="plus" className="v2-ic v2-ic-sm" />
          {laeuft ? 'Speichert…' : 'Hinzufügen'}
        </button>
      </form>

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
