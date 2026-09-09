// Die Trennlinie zwischen Ist und Soll — E-69, hier fuer das Portal.
//
// ══ WARUM EINE EIGENE FASSUNG UND KEIN IMPORT ═══════════════════════
//
// **Der Auftrag fragt es ausdruecklich:** *„miss, ob `MockupReferenz`
// aus `apps/web` wiederverwendbar ist oder ob es eine eigene Fassung
// braucht."*
//
// `[cmd]` **Gemessen 2026-09-09:**
//
//     apps/web/src/components/shell/referenz-trenner.tsx
//       'use client', import { Pill } from '@lumeos/ui'
//       -- sonst nichts
//
// `[read]` **Technisch waere er wiederverwendbar** — er haengt an
// genau einem Baustein, und den hat `apps/coach` auch
// (`@lumeos/ui`, `layout.tsx:3`). **Die v2-Klassen liegen ebenfalls
// vor:** `@lumeos/ui/styles.css` bringt sie mit, und das Portal nutzt
// `v2-eyebrow` und `v2-pill` schon.
//
// `[cmd]` **Aber die Datei liegt in `apps/web/src/`** — nicht in
// `packages/`. `[read]` **Ein Import aus einer fremden Anwendung ist
// kein Weg, den `tsconfig` kennt:** `apps/coach` loest `@/*` auf
// `./src/*` auf, `@lumeos/*` auf `packages/*`. **Fuer `apps/web` gibt
// es keinen Alias**, und einen anzulegen hiesse, zwei Anwendungen
// aneinanderzubinden, die sonst nur ueber `packages/` verbunden sind.
//
// `[read]` **Also eine eigene Fassung** — 30 Zeilen, mit DERSELBEN
// Marke `data-referenz-trenner`. `[cmd]` **Die Marke ist der
// Messpunkt**, nicht das Wort „Mockup-Referenz": eine Messung, die am
// Text haengt, ist ein Wortwaechter.
//
// `[read]` **Der richtige Ort waere `packages/ui`** — dann haetten
// beide Anwendungen einen Baustein statt zwei. **Das verbietet der
// Auftrag** (*„Nichts in `packages/ui` — melden"*), also steht es im
// Bericht.
import { Pill } from '@lumeos/ui'

export function ReferenzTrenner({ reiter, quelle }: {
  reiter: string
  quelle: string
}) {
  return (
    <div
      // `[cmd]` Dieselbe Marke wie in `apps/web` — wer beide
      // Anwendungen misst, braucht nur einen Selektor.
      data-referenz-trenner={reiter}
      className="cp-trenner"
    >
      <div className="cp-trenner-linie" />
      <Pill variant="warn">Mockup-Referenz</Pill>
      <span className="cp-trenner-text">
        {reiter} · {quelle} · fällt mit der Abnahme
      </span>
      <div className="cp-trenner-linie" />
    </div>
  )
}
