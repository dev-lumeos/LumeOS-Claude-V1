# Design — Bestandsaufnahme

**Stand:** 2026-08-03 · **Ankerhash:** 0aff79a
**Zweck:** Was an Designdefinition existiert und was davon im Code umgesetzt ist.
Reine Inventur, keine Empfehlung. Grundlage für TODO A-06.

---

## Teil 1: Was im Code IST

### Das Design-System existiert — in einer einzigen CSS-Datei

`[cmd]` `apps/web/src/app/globals.css`: **1.423 Zeilen**, 339 CSS-Variablen,
**104 OKLCH-Farbwerte**.

`[cmd]` `apps/web/tailwind.config.js`: `theme.extend` ist **leer**.
`[cmd]` `packages/ui`: enthält **nur `.gitkeep`**.

Das Design-System ist damit weder über Tailwind-Utilities erreichbar noch
zwischen Apps teilbar. Es hängt vollständig an einer Datei in `apps/web`.

### Tokenaufbau

`[read]` Drei Ebenen in `:root` (Zeilen 6–38):

| Gruppe | Tokens | Beispiel |
|---|---|---|
| Flächen | `--bg`, `--bg-elev`, `--surface`, `--surface-2`, `--surface-hover` | `oklch(0.155 0.005 270)` |
| Ränder und Text | `--border`, `--border-strong`, `--fg`, `--fg-muted`, `--fg-subtle`, `--fg-dim` | |
| Status | `--pos`, `--warn`, `--neg` | `--pos: oklch(0.78 0.13 150)` |
| Akzente | 11 Stück, siehe unten | |
| Maße | `--pad-card: 16px`, `--radius: 8px`, `--radius-sm`, `--radius-lg` | |
| Schrift | `--font-mono` | generischer Systemstapel |

### Die elf Akzentfarben mischen Module und Apps

`[read]` `--acc-dash`, `--acc-nutri`, `--acc-train`, `--acc-recov`,
`--acc-suppl`, `--acc-goals`, `--acc-medic`, `--acc-coach`, `--acc-buddy`,
`--acc-mkt`, `--acc-admin`

Davon sind nach Toms Modell **Module**: Dashboard, Nutrition, Training,
Recovery, Supplements, Goals, Medical, HumanCoach.
Und **Apps**: Buddy, Marketplace, Admin.

`--acc: var(--acc-dash)` setzt den aktiven Akzent, umschaltbar je Ansicht.

Die Vermischung von App- und Modulachse aus den Altbestand-Specs findet sich
also auch in den Design-Tokens wieder. Es fehlen: Settings, Login, AICoach,
Gym, Supplier.

### Themes

`[cmd]` `:root` ist dunkel als Voreinstellung, `[data-theme="light"]`
(Zeile 40) und `html[data-theme="light"]` (Zeile 69) überschreiben.
Kein `prefers-color-scheme`, kein `.dark`-Selektor.

### Schrift

`[cmd]` Sieben `font-family`-Deklarationen, alle auf `--font-mono` oder einen
generischen Monospace-Stapel. **Kein Webfont geladen**, kein `next/font`,
keine getrennte Schrift für Fließtext oder Überschriften.

Die Spezifikationen nennen JetBrains Mono für Zahlenwerte — `[cmd]` im Code
nicht vorhanden, nur der Systemstapel als Ersatz.

### Komponenten

`[cmd]` Vier UI-Primitiven in `apps/web/src/components/ui/`, zusammen
**339 Zeilen**:

| Datei | Zeilen |
|---|---|
| `cards.tsx` | 128 |
| `placeholder-page.tsx` | 136 |
| `page-header.tsx` | 41 |
| `status-badge.tsx` | 34 |

Dazu `shell/app-shell.tsx` mit 445 Zeilen und
`governance/GovernanceConsole.tsx` mit 1.115 Zeilen (Altlast).

`[cmd]` Es fehlen aus dem deklarierten Stack: shadcn/ui, lucide-react,
Recharts, Framer Motion, @dnd-kit — siehe TODO C-01.

---

## Teil 2: Wo Designdefinitionen liegen

`[cmd]` Verstreut über vier Orte, keiner davon in
`docs/spezifikation/10-plattform/design-system/` (leer).

| Ort | Dateien | Umfang |
|---|---|---|
| `docs/design-system/` | `DESIGN_CONCEPT.md` + components, tokens | 8,6 KB + Unterordner |
| `docs/prompts/` | `mockup_deep_fill.md`, `mockup_deep_rebuild.md`, `mockup_vollausbau.md` | 41,6 KB |
| `docs/Screenshots/` | 13 PNG vom 2026-07-31 | 1,9 MB |
| `docs/specs/` | `WebPlatform/SPEC_02_DESIGN_SYSTEM.md`, dazu `SPEC_01/11_UI_DESIGN` in Admin, Buddy, HumanCoach, Marketplace | 44,7 KB |
| `docs/BrainstormDocs/` | `Core/DESIGN_SYSTEM.md`, `Core/14_DESIGN_SYSTEM.md` | 25,1 KB — archiviert, keine Referenz |

### Die Screenshots

`[cmd]` Alle vom 2026-07-31, aus einem Claude-Design-Durchlauf:

| Bereich | Dateien |
|---|---|
| Nutrition | `nutrition1` bis `nutrition4` |
| Training | `training1` bis `training4`, `activeworkoutscreendraft` |
| Recovery | `recovery1`, `recovery2` |
| Coaching | `coaching1` |
| Marketplace | `marketplace1` |

Kein Screenshot für Dashboard, Goals, Medical, Supplements, Settings, Login,
Admin, Buddy, Gym, Supplier.

---

## Teil 3: Offen

Diese Bestandsaufnahme deckt **den Code** ab. Was in den fünf Dokumentquellen
tatsächlich steht, wo sie sich widersprechen und was davon in den Screenshots
umgesetzt ist, ist noch nicht ausgewertet.

### Bereits sichtbare Fragen

1. **Ein Ort oder viele.** Das System lebt in `apps/web/src/app/globals.css`.
   Sechs weitere Apps sind geplant; `packages/ui` steht leer bereit.
2. **Tailwind ohne Tokens.** `theme.extend` ist leer, die 339 Variablen sind
   für Utility-Klassen unerreichbar. Entweder Tokens in die Konfiguration
   spiegeln oder bewusst nur über CSS-Variablen arbeiten.
3. **Akzentachse klären.** Elf Akzentfarben mischen Module und Apps; fünf
   Einheiten aus Toms Modell fehlen ganz.
4. **Schrift.** Spezifikation nennt JetBrains Mono, Code lädt keinen Webfont.
   Und es gibt keine getrennte Schrift für Fließtext.
5. **Themes.** Nur `data-theme`, keine Auswertung der Systemeinstellung.
6. **Komponentenumfang.** 339 Zeilen Primitiven gegen einen Stack, von dem
   `[cmd]` zehn von dreizehn Bibliotheken fehlen.

**Nächster Schritt:** Auswertung der fünf Dokumentquellen, dann getrennte
Sitzung zur Entscheidung. Tom hat mehrere Ansätze.
