'use client'

// Das Gate von Extended — jetzt mit einer Bedingung (G-110, G-92).
//
// **WAS VORHER DASTAND:** `[cmd]` `const [unlocked, setUnlocked] =
// React.useState(false)` und ein Knopf, der es umlegt. G-92 hat es
// gemessen: *„Sein Gate ist ein blosses `useState` und schuetzt nichts.
// **Wer klickt, sieht die Protokolle.**"*
//
// **WAS JETZT GILT:** `[cmd]` Der Erfahrungsgrad steht seit C-140 in
// `public.profiles.experience_level`. Das Gate faellt **serverseitig**:
// reicht der Grad nicht, bekommt der Browser die Inhalte **gar nicht
// erst** — nicht nur einen versteckten Zweig.
//
// `[read]` **Tom (C-113):** *„Ich stelle mir vor, es ist nur für
// bestimmte Level-User aktivierbar."*
//
// `[read]` **Und wenn der Grad fehlt: kein Zugang, aber ein Weg
// dorthin.** Ein gesperrter Bereich ohne Ausweg ist eine Sackgasse;
// die Kachel in `/v2/settings` ist seit G-110 bedienbar, und der Knopf
// hier fuehrt hin.
import * as React from 'react'
import Link from 'next/link'
import type { Route } from 'next'
import { Card, Icon, Pill } from '@lumeos/ui'

import type { GateStand } from '../../../lib/supplements/regeln-read'
import { EXPERIENCE_LEVEL_INFO } from '../../../lib/profile/profile-model'

export function ExtendedGesperrt({ g }: { g: GateStand }) {
  const ohneAngabe = g.grad === null
  return (
    <div style={{ maxWidth: 520, margin: '48px auto 0' }}>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{
          width: 56, height: 56, borderRadius: 14,
          background: 'color-mix(in oklch, var(--acc-medic) 12%, var(--surface))',
          border: '1px solid color-mix(in oklch, var(--acc-medic) 30%, var(--border))',
          color: 'var(--acc-medic)', display: 'grid', placeItems: 'center',
          margin: '0 auto 16px',
        }}>
          <Icon name="shield" className="v2-ic" style={{ width: 24, height: 24 }} />
        </div>
        <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 8 }}>
          Extended supplements
        </div>
        <p className="v2-muted" style={{ fontSize: 13, lineHeight: 1.55 }}>
          Diese Flaeche fuehrt verschreibungspflichtige Hormone, Peptide
          und Forschungssubstanzen als <strong>persoenliches
          Protokoll</strong> — was du und deine Aerztin ohnehin
          verwaltet. LumeOS verschreibt nicht, raet nicht und gibt
          nichts ab.
        </p>
      </div>

      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span className="v2-eyebrow">Dein Erfahrungsgrad</span>
          <span style={{ marginLeft: 'auto' }}>
            {ohneAngabe
              ? <Pill variant="warn">nicht angegeben</Pill>
              : <Pill>{EXPERIENCE_LEVEL_INFO[g.grad!]?.label ?? g.grad}</Pill>}
          </span>
        </div>

        <p className="v2-muted" style={{ fontSize: 12, lineHeight: 1.55, marginBottom: 12 }}>
          {ohneAngabe
            ? 'Der Bereich ist ab «Fortgeschritten» offen. Solange kein Grad hinterlegt ist, bleibt er zu.'
            : `Der Bereich ist ab «${EXPERIENCE_LEVEL_INFO.advanced.label}» offen.`}
        </p>

        {/*
          `[read]` **Der Weg heraus gehoert dazu.** Der Grad ist
          Selbstauskunft (C-71) — die Nutzerin setzt ihn selbst, und
          zwar dort, wo das Profil steht.
        */}
        <Link href={'/v2/settings' as Route} className="v2-btn v2-btn-primary">
          <Icon name="settings" className="v2-ic v2-ic-sm" />
          {ohneAngabe ? 'Erfahrungsgrad angeben' : 'Erfahrungsgrad aendern'}
        </Link>

        {g.fehler && (
          <p className="v2-muted" style={{ fontSize: 11, marginTop: 10 }}>
            Der Grad konnte nicht gelesen werden: {g.fehler}
          </p>
        )}
      </Card>

      <p className="v2-hinweis" style={{ marginTop: 12 }}>
        <Icon name="alert" className="v2-ic v2-ic-sm" />
        <span>
          Der Erfahrungsgrad ist <strong>Selbstauskunft</strong>, keine
          Freigabe durch jemand anderen — und etwas anderes als die
          Autonomy-Stufe im Coach-Modul, die das System aus dem
          Verhalten ableitet.
        </span>
      </p>
    </div>
  )
}
