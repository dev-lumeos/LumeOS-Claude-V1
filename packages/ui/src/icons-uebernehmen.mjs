// Erzeugt packages/ui/src/icons.tsx aus dem ICONS-Objekt der Vorlage.
// 51 Symbole mit teils langen Pfaddaten von Hand zu uebertragen waere
// fehleranfaellig; ein Tippfehler in einem `d`-Attribut faellt erst
// im Browser auf.
import fs from 'node:fs'

const QUELLE = 'docs/spezifikation/10-plattform/design-system/theme-v1/shared.jsx'
const ZIEL = 'packages/ui/src/icons.tsx'

const src = fs.readFileSync(QUELLE, 'utf8')
const block = src.match(/const ICONS = \{([\s\S]*?)\n\};/)[1]

// Je Zeile: "  name: <JSX>,"
const eintraege = []
for (const zeile of block.split('\n')) {
  const m = zeile.match(/^\s{2}([a-z_0-9]+):\s*(.*),\s*$/)
  if (!m) continue
  eintraege.push([m[1], m[2]])
}

const namen = eintraege.map(([n]) => n)

const kopf = `// Symbole der Oberflaeche v2 — ERZEUGT aus der Vorlage, nicht
// abgeschrieben. Quelle: ${QUELLE}
// Erzeugt am 2026-08-15 fuer G-02.
//
// Warum erzeugt: 51 Symbole mit teils langen Pfaddaten. Ein Tippfehler
// in einem d-Attribut faellt erst im Browser auf, und dann als "das
// Symbol sieht komisch aus", nicht als Fehler.
//
// Gegenueber der Vorlage getypt: IconName ist eine Union ueber die
// vorhandenen Schluessel. [cmd] Die Vorlage verweist in shell.jsx auf
// ein Symbol "user", das im ICONS-Objekt fehlt — <Icon name="user" />
// rendert dort still nichts. Mit dieser Union ist derselbe Fehler ein
// Uebersetzungsfehler.
import * as React from 'react'

export const ICONS = {
`

const koerper = eintraege
  .map(([n, jsx]) => `  ${n}: ${jsx},`)
  .join('\n')

const fuss = `
} as const

export type IconName = keyof typeof ICONS

export type IconProps = {
  name: IconName
  /** Groessenklasse: ic (Standard), ic-sm, ic-lg — siehe v2.css. */
  className?: string
  style?: React.CSSProperties
  /**
   * Beschriftung fuer Hilfsmittel. Ohne sie ist das Symbol dekorativ
   * und wird mit aria-hidden aus dem Vorlesefluss genommen — sonst
   * liest ein Screenreader 51-mal "Grafik".
   */
  title?: string
}

export function Icon({ name, className = 'v2-ic', style, title }: IconProps) {
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 24 24"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      {ICONS[name]}
    </svg>
  )
}
`

fs.writeFileSync(ZIEL, kopf + koerper + fuss, 'utf8')
console.log(`${ZIEL}: ${eintraege.length} Symbole`)
console.log(namen.join(' '))
