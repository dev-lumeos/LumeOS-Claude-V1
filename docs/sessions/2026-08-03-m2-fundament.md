# Sitzung — M2: Frontend-Fundament (designneutrale Bausteine)

**Datum der Durchführung:** 2026-08-04 · **Ankerhash bei Start:** 9de583b (verifiziert, HEAD)
**Auftrag:** designneutrale Bausteine für `apps/web` — Abhängigkeiten,
Grundverdrahtung, Tailwind-Token-Anbindung. Der designtragende Teil
(shadcn/ui, lucide-react, Recharts, Framer Motion, @dnd-kit) ist ausdrücklich
ausgenommen (A-06). Kein `pnpm install` (macht Tom), keine Commits.

---

## 1+2 — Abhängigkeiten ergänzt (nur `apps/web/package.json`)

| Paket | Eintrag | Peer-Verträglichkeit Next 14 / React 18 |
|---|---|---|
| `@types/react-dom` | `^18.0.0` (devDependencies) | passt zu `react-dom ^18` — behebt die bekannte Lücke |
| `@tanstack/react-query` | `^5.0.0` | Peer `react ^18 \|\| ^19` — passt |
| `react-hook-form` | `^7.0.0` | Peer `react >=16.8` — passt |
| `zod` | `^3.23.0` | keine Peers |
| `date-fns` | `^4.0.0` | keine Peers |
| `idb` | `^8.0.0` | keine Peers |

**Kein Abbruchfall:** keine der Bibliotheken verlangt eine Peer-Abhängigkeit,
die zu Next 14 oder React 18 nicht passt. Versionsangaben im Haus-Stil
(Major-Caret, wie `next ^14.0.0`).

## 3 — Grundverdrahtung (drei neue Dateien, eine Layout-Änderung)

- `src/components/providers/query-provider.tsx` — `'use client'`,
  `QueryClient` in `useState`, bewusst **ohne** `defaultOptions`
  (Cache-/Retry-Politik ist eine spätere fachliche Entscheidung).
- `src/lib/schemas/index.ts` — gemeinsame Stelle für zod-Schemas
  (Konvention im Dateikopf: ein Modul je Fachbereich, hier re-exportiert);
  noch keine Schemas, die ersten kommen mit M3/C-02.
- `src/lib/dates.ts` — `setDefaultOptions({ locale: de })`; importiert im
  Root-Layout (Server-Realm) und im QueryProvider (Client-Realm), damit die
  Voreinstellung in beiden Welten gilt. Zeitzonen bleiben Sache der Aufrufer
  (Konvention §7).
- `src/app/layout.tsx` — einzige Änderung an Bestehendem: `<QueryProvider>`
  um `<AppShell>`, plus die zwei Importe. Keine Komponente gebaut, keine
  Seite umgeschrieben.

## 4 — Tailwind an die Tokens angeschlossen

`tailwind.config.js`, `theme.extend`: **19 Token-Einträge**, alle als reine
`var(--token)`-Verweise — kein Farbwert dupliziert, `globals.css` unverändert
(kein Abbruchfall: die Anbindung brauchte keine Änderung dort).

| Gruppe | Einträge |
|---|---|
| Flächen (5) | `bg`, `bg-elev`, `surface`, `surface-2`, `surface-hover` |
| Ränder (2) | `border`, `border-strong` |
| Text (4) | `fg`, `fg-muted`, `fg-subtle`, `fg-dim` |
| Status (3) | `pos`, `warn`, `neg` |
| Akzent (1) | `acc` (nur der aktive Akzent `--acc`) |
| Radien (3) | `rounded-token`, `rounded-token-sm`, `rounded-token-lg` |
| Abstände (1) | `spacing.card` → `--pad-card` |

**Bewusste Abweichung bei den Radien:** `[cmd]` bestehende Seiten nutzen
`rounded`/`rounded-md`/`rounded-lg` bereits 49-mal mit Tailwind-Standardwerten
(4/6/8 px). Ein Spiegeln der Tokens auf die Standard-Schlüssel
`sm`/`DEFAULT`/`lg` hätte diese Nutzungen stillschweigend umgestylt
(`rounded-lg` 8 → 12 px) — das wäre eine Designänderung. Deshalb eigene
Schlüssel (`token*`); ob die Standard-Skala später auf die Tokens gelegt wird,
gehört zu A-06.

## 5 — Typecheck: 4 erwartete Fehler, Rest grün (Toms Entscheidung)

`[cmd]` Keine der fünf Bibliotheken ist ohne `pnpm install` auflösbar (nur
`zod@3.25.76` liegt unverlinkt im `.pnpm`-Store, Rest der archivierten
Governance-Packages). Damit waren Aufgabe 3 (Verdrahtung), Aufgabe 5
(typecheck grün) und die Grenze (kein install) zusammen nicht erfüllbar —
Tom in der Sitzung gefragt, Entscheidung: **Verdrahtung bleibt drin.**

`[cmd]` `pnpm typecheck` 2026-08-04: `@lumeos/nutrition-api` grün;
`@lumeos/web` mit **genau 4 × TS2307** (Cannot find module) —
`@tanstack/react-query`, `date-fns`, `date-fns/locale`, `zod` — und **null
sonstigen Fehlern**. Soll-Zustand: nach Toms `pnpm install` verschwinden
exakt diese vier; jeder andere Fehler wäre ein echter Befund.

## Bewusst ausgelassen — und warum

- **shadcn/ui, lucide-react, Recharts, Framer Motion, @dnd-kit, next-pwa** —
  designtragend, hängen an A-06 (ausdrückliche Grenze).
- **Die elf `--acc-*`-Akzente** — ihre Modul-/App-Zuordnung ist A-06;
  gespiegelt ist nur der aktive Akzent `--acc`.
- **`--font-mono`** — Typographie (Webfont-Frage, JetBrains Mono) ist
  A-06-Material und stand nicht in der beauftragten Gruppenliste.
- **`packages/ui`** — bleibt `.gitkeep`; wo das Design-System liegt, ist A-06.
- **`globals.css`** — unverändert (Grenze; war auch nicht nötig).
- **QueryClient-`defaultOptions`, Schema-Inhalte, Komponenten** — Fundament
  ohne fachliche Vorentscheidungen.

## Offen für Tom

1. `pnpm install` → danach `pnpm typecheck` (Erwartung: 0 Fehler, 2 Tasks,
   4 Packages in scope).
2. TODO C-01 ist damit teilweise bedient (5 von 10 fehlenden Bibliotheken
   registriert, designneutrale Hälfte); Statuspflege der TODO gehört nicht
   zu diesem Auftrag.
