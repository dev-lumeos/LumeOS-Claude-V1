'use client'

// Das Erfassungsformular fuer Medikamente — G-211.
//
// ══ DER KERN IST DIE VERKNUEPFUNG, NICHT DAS FORMULAR ═══════════════
//
// **Auftrag: *„Wer Scemblix eintraegt, muss auf `drug_0642bd1e2f`
// landen — sonst feuert keine der Regeln."***
//
// `[cmd]` **Die Suche dafuer steht seit G-210 bereit:** 428 Marken
// ueber `wirkstoff-marke.ts`, davon 164 echte Handelsnamen, die den
// Wirkstoffnamen nicht enthalten. **Scemblix ist einer davon.**
//
// `[read]` **Deshalb steht die Wirkstoffsuche OBEN und das Namensfeld
// darunter** — nicht umgekehrt. Wer zuerst tippt, was auf der Packung
// steht, findet den Wirkstoff; wer ihn nicht findet, traegt trotzdem
// ein. **Die Reihenfolge ist die Empfehlung.**
//
// ══ A-30 ════════════════════════════════════════════════════════════
//
// `[read]` **Werte nur aus serverfreien Dateien.** `medikament-write`
// zieht `next/headers`; von dort kommen hier ausschliesslich Typen.
// Die Schreibaufrufe laufen ueber die Serveraktionen.
import * as React from 'react'
import { Icon, Pill } from '@lumeos/ui'

import type { WirkstoffZeile } from '../../../lib/medical/wirkstoff-read'
import { passendeMarken } from '../../../lib/medical/wirkstoff-marke'
import {
  pruefeEingabe, bindungVon, LEERE_EINGABE,
  OHNE_BINDUNG_FOLGE, OHNE_BINDUNG_GRUND,
  type MedikamentEingabe, type EingabeFehler,
} from '../../../lib/medical/medikament-eingabe'
import { trifft } from './tab-wirkstoffe'

/**
 * Der Hinweis, wenn keine Zuordnung besteht — der dritte Zustand.
 *
 * ══ ER HAT EINE FOLGE, NICHT NUR EINE ANZEIGE ═══════════════════════
 *
 * `[read]` **In G-208 unterschied die Form *begruendet leer* von
 * *nicht bearbeitet*.** Beides waren Aussagen ueber den Datenbestand.
 * **Hier ist es eine Aussage ueber die Wirkung:** der Eintrag ist
 * richtig, vollstaendig und wird trotzdem von keiner Regel geprueft.
 *
 * `[read]` **Ton: Hinweis, nicht Fehlermeldung.** Der Mensch hat
 * nichts falsch gemacht — der Katalog fuehrt keine deutschen
 * Handelsnamen. **Dieselbe Haltung wie das Leerergebnis aus G-210:**
 * sagen, was fehlt, ohne dem Nutzer die Schuld zu geben.
 */
export function OhneBindungHinweis() {
  return (
    <div className="v2-med-eingabe-hinweis">
      <Icon name="alert" className="v2-ic v2-ic-sm" />
      <div>
        <strong>Ohne Wirkstoff aus dem Katalog.</strong>
        {' '}{OHNE_BINDUNG_FOLGE}
        <div className="v2-med-eingabe-hinweis-grund">{OHNE_BINDUNG_GRUND}</div>
      </div>
    </div>
  )
}

/** Die Wirkstoffsuche im Formular. */
function Wirkstoffwahl(
  { katalog, gewaehlt, onWaehlen }: {
    katalog: WirkstoffZeile[]
    gewaehlt: WirkstoffZeile | null
    onWaehlen: (z: WirkstoffZeile | null) => void
  },
) {
  const [frage, setFrage] = React.useState('')

  // `[read]` **Hier gilt die Deckelung, anders als im Katalog.**
  // `[cmd]` G-176 hat im Substanzkatalog das Limit entfernt, weil ein
  // Katalog zum Blaettern da ist. **Eine Auswahlliste ist es nicht** —
  // wer 498 Vorschlaege bekommt, waehlt nicht, er scrollt.
  const treffer = React.useMemo(() => {
    const f = frage.trim()
    if (!f) return []
    return katalog.filter(z => trifft(z, f.toLowerCase())).slice(0, 8)
  }, [katalog, frage])

  if (gewaehlt) {
    return (
      <div className="v2-med-eingabe-gewaehlt">
        <Icon name="check" className="v2-ic v2-ic-sm" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <strong>{gewaehlt.name}</strong>
          {gewaehlt.atc.length > 0 && (
            <span className="v2-dim v2-mono" style={{ marginLeft: 6, fontSize: 10 }}>
              {gewaehlt.atc.join(' · ')}
            </span>
          )}
          <div className="v2-med-eingabe-gewaehlt-satz">
            Zugeordnet — die Wechselwirkungsregeln prüfen diesen Eintrag.
          </div>
        </div>
        <button type="button" className="v2-btn v2-btn-ghost v2-btn-sm"
                onClick={() => { onWaehlen(null); setFrage('') }}>
          Lösen
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="v2-med-wirk-suche">
        <Icon name="search" className="v2-ic v2-ic-sm v2-med-wirk-suchsymbol" />
        <input
          className="v2-feld" value={frage}
          onChange={e => setFrage(e.target.value)}
          placeholder="Wirkstoff oder Handelsname — z. B. Scemblix…"
          aria-label="Wirkstoff suchen"
          style={{ paddingLeft: 30, width: '100%' }}
        />
      </div>
      {treffer.length > 0 && (
        <div className="v2-med-eingabe-vorschlaege">
          {treffer.map(z => {
            // G-210: warum dieser Vorschlag passt.
            const marken = passendeMarken(z.marken, frage)
            return (
              <button key={z.id} type="button" className="v2-med-eingabe-vorschlag"
                      onClick={() => onWaehlen(z)}>
                <span className="v2-med-eingabe-vorschlag-name">{z.name}</span>
                {marken.map(m => (
                  <span key={m.name} className="v2-med-eingabe-vorschlag-marke">
                    <Icon name="check" className="v2-ic v2-ic-sm" />
                    {m.name} ist ein Handelsname von {z.name}
                  </span>
                ))}
                {z.kurz && (
                  <span className="v2-med-eingabe-vorschlag-kurz">{z.kurz}</span>
                )}
              </button>
            )
          })}
        </div>
      )}
      {frage.trim() && treffer.length === 0 && (
        // `[read]` **Auch hier kein Schweigen** (G-210). Der Satz sagt,
        // dass Weitertippen im Namensfeld richtig ist — nicht, dass es
        // das Medikament nicht gibt.
        <p className="v2-med-eingabe-kein-treffer">
          Kein Wirkstoff und kein Handelsname passt zu „{frage.trim()}&quot;.
          {' '}<strong>Trag den Namen unten trotzdem ein</strong> — der
          Katalog kennt keine deutschen Handelsnamen.
        </p>
      )}
    </div>
  )
}

function Feld(
  { id, label, wert, onWert, fehler, typ = 'text', platzhalter, breite }: {
    id: string; label: string; wert: string
    onWert: (v: string) => void
    fehler?: string; typ?: string; platzhalter?: string; breite?: number
  },
) {
  return (
    <div className="v2-med-eingabe-feld" style={breite ? { width: breite } : undefined}>
      <label htmlFor={id} className="v2-eyebrow">{label}</label>
      <input id={id} className="v2-feld" type={typ} value={wert}
             placeholder={platzhalter}
             aria-invalid={fehler ? true : undefined}
             onChange={e => onWert(e.target.value)} />
      {fehler && <span className="v2-med-eingabe-fehler">{fehler}</span>}
    </div>
  )
}

/**
 * Das Formular — anlegen und aendern.
 *
 * `[read]` **Eine Form fuer beides.** Die Felder sind dieselben; der
 * Unterschied ist die Vorbelegung und der Knopftext. Zwei Formulare
 * waeren zwei Stellen, an denen ein Feld vergessen werden kann.
 */
export function MedikamentFormular(
  { katalog, vorgabe, titel, knopf, laeuft, fehlerVonAussen, onSpeichern, onAbbrechen }: {
    katalog: WirkstoffZeile[]
    vorgabe?: MedikamentEingabe
    titel: string
    knopf: string
    laeuft: boolean
    fehlerVonAussen: EingabeFehler[]
    onSpeichern: (e: MedikamentEingabe) => void
    onAbbrechen: () => void
  },
) {
  const [e, setE] = React.useState<MedikamentEingabe>(vorgabe ?? LEERE_EINGABE)
  const [gezeigt, setGezeigt] = React.useState<EingabeFehler[]>([])

  const gewaehlt = React.useMemo(
    () => katalog.find(z => z.id === e.active_substance_id) ?? null,
    [katalog, e.active_substance_id])

  const alleFehler = [...gezeigt, ...fehlerVonAussen]
  const fehlerZu = (feld: string) => alleFehler.find(f => f.feld === feld)?.text

  function setzen(k: keyof MedikamentEingabe, v: string) {
    setE(alt => ({ ...alt, [k]: v }))
  }

  function absenden() {
    const f = pruefeEingabe(e)
    setGezeigt(f)
    if (f.length === 0) onSpeichern(e)
  }

  return (
    <div className="v2-med-eingabe">
      <div className="v2-med-eingabe-kopf">
        <span style={{ fontSize: 13, fontWeight: 600 }}>{titel}</span>
      </div>

      {/* ── Erst der Wirkstoff, dann der Name ────────────────────────
          `[read]` Die Reihenfolge ist die Empfehlung: wer zuerst
          zuordnet, bekommt die Regeln dazu. */}
      <div className="v2-med-eingabe-abschnitt">
        <span className="v2-eyebrow">Wirkstoff aus dem Katalog</span>
        <Wirkstoffwahl
          katalog={katalog} gewaehlt={gewaehlt}
          onWaehlen={z => setE(alt => ({
            ...alt,
            active_substance_id: z?.id ?? null,
            // `[read]` **Der Name wird vorbelegt, nicht erzwungen.**
            // Wer Scemblix nimmt, soll „Scemblix" schreiben duerfen,
            // auch wenn der Wirkstoff Asciminib heisst.
            name: alt.name.trim() ? alt.name : (z?.name ?? ''),
          }))} />
      </div>

      {bindungVon(e.active_substance_id) === 'nicht_zugeordnet' && <OhneBindungHinweis />}

      <div className="v2-med-eingabe-zeile">
        <Feld id="med-name" label="Name auf der Packung" wert={e.name}
              onWert={v => setzen('name', v)} fehler={fehlerZu('name')}
              platzhalter="z. B. Concor" />
        <Feld id="med-start" label="Seit" wert={e.start_date} typ="date"
              onWert={v => setzen('start_date', v)}
              fehler={fehlerZu('start_date')} breite={150} />
      </div>

      <div className="v2-med-eingabe-zeile">
        <Feld id="med-menge" label="Menge" wert={e.dose_amount}
              onWert={v => setzen('dose_amount', v)}
              fehler={fehlerZu('dose_amount')} platzhalter="5" breite={100} />
        <Feld id="med-einheit" label="Einheit" wert={e.dose_unit}
              onWert={v => setzen('dose_unit', v)} platzhalter="mg" breite={100} />
        <Feld id="med-proTag" label="Pro Tag" wert={e.doses_per_day}
              onWert={v => setzen('doses_per_day', v)}
              fehler={fehlerZu('doses_per_day')} platzhalter="1" breite={100} />
        <Feld id="med-weg" label="Einnahmeweg" wert={e.route}
              onWert={v => setzen('route', v)} platzhalter="oral" breite={140} />
      </div>

      <div className="v2-med-eingabe-zeile">
        <Feld id="med-grund" label="Wofür" wert={e.indication}
              onWert={v => setzen('indication', v)}
              platzhalter="z. B. Bluthochdruck" />
      </div>
      <div className="v2-med-eingabe-zeile">
        <Feld id="med-notiz" label="Notiz" wert={e.notes}
              onWert={v => setzen('notes', v)} />
      </div>

      {/* `[read]` Ein Fehler ohne Feldbezug (z. B. NO_SESSION) darf
          nicht verschwinden — er steht ueber den Knoepfen. */}
      {alleFehler.filter(f => !f.feld).map(f => (
        <p key={f.text} className="v2-med-eingabe-fehler">{f.text}</p>
      ))}

      <div className="v2-med-eingabe-knoepfe">
        <button type="button" className="v2-btn v2-btn-sm" onClick={onAbbrechen}>
          Abbrechen
        </button>
        <button type="button" className="v2-btn v2-btn-primary v2-btn-sm"
                disabled={laeuft} onClick={absenden}>
          {laeuft ? 'Speichert…' : knopf}
        </button>
      </div>
    </div>
  )
}
