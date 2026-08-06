# LumeOS

Health & Performance Operating System — Produkt-Monorepo.
Kern ist **Buddy**, ein AI-Companion; die Fachmodule (Nutrition, Training,
Recovery, …) liefern das Wissen. Aktuell gebaut: `apps/web` mit Anmeldung
(Supabase Auth), Nutrition-Lesepfaden und dem ersten Schreibpfad
(Food-Präferenzen), alles durch Zeilenschutz (RLS) in der Datenbank begrenzt.
Vieles Übrige ist sichtbare Attrappe und sagt das auf der Fläche auch.

## Loslegen

```
pnpm install
git config core.hooksPath .githooks     # Prüf-Gate aktivieren (Pflicht, s. u.)
supabase start                          # lokale Instanz (Docker)
pnpm dev                                # apps/web auf http://localhost:3200
```

- Datenbankaufbau (Struktur-Baseline in `supabase/migrations/`, Daten über
  die lokale Kette in `supabase/_pipeline/`): **`supabase/README.md`** —
  dort steht die verbindliche Reihenfolge samt Validierungen.
- `apps/web/.env.local` braucht `NEXT_PUBLIC_SUPABASE_URL` und
  `NEXT_PUBLIC_SUPABASE_ANON_KEY` (lokal: Werte aus `supabase start`).
- Anmeldung: E-Mail + Passwort unter `/login`; geschützte Routen leiten
  unangemeldet dorthin um.

## Entwicklung: Prüf-Gate (B-14, Stand 2026-08-05)

Ein Befehl prüft alles: **`pnpm gate`** = `turbo run typecheck test build`.

- **Aktivierung nach frischem Klon (Pflicht, sonst läuft kein Gate):**
  `git config core.hooksPath .githooks`
  Der Pre-Commit-Hook ist versioniert (`.githooks/pre-commit`), die
  Aktivierung ist lokale Git-Konfiguration und passiert nicht von selbst.
- **Einschränkung:** Der Hook prüft den **Working Tree, nicht den Index**.
  Wer in logischen Scheiben committet, kann Commit 1 von 3 grün bekommen,
  obwohl er für sich allein nicht baut — Änderungen aus Scheibe 2 liegen im
  Working Tree und heilen den Bruch bereits. Bewusst so belassen: ein
  Index-Checkout je Commit kostet Laufzeit und Komplexität.
- **Notausgang:** `git commit --no-verify` — bewusst einsetzen, nicht still.
- **Frühere Betriebsregel „`next dev` und Gate nicht gleichzeitig" —
  entfällt seit B-18 (2026-08-06).** Sie galt, weil beide sich
  `apps/web/.next` teilten: `[cmd]` 2026-08-05 (zweimal) und erneut
  2026-08-06 erzeugte ein parallel laufender Dev-Server TS6053-Fehler auf
  `.next/types/**` im Gate-Typecheck. Der Gate-Build schreibt jetzt nach
  `apps/web/.next-gate` (`LUMEOS_DIST_DIR`, gesetzt in
  `apps/web/scripts/gate-build.js`), der Dev-Server bleibt auf `.next`.
  Beide Verzeichnisse bestehen nebeneinander, keins räumt das andere ab.
  Dazu gehört zwingend die zweite Hälfte: `typecheck` hängt in `turbo.json`
  jetzt auch am **eigenen** `build` (`dependsOn: ["^build", "build"]`).
  Ohne sie blieb das Gate rot — `[cmd]` nach der Verzeichnistrennung allein
  fielen 3 von 5 Läufen mit TS6053 auf `.next-gate/types/**` aus, weil turbo
  `typecheck` und `build` desselben Pakets nebenläufig startete und der Build
  das Verzeichnis abräumte, während `tsc` daraus las.
  `[cmd]` 2026-08-06 belegt: **6 von 6** `pnpm gate --force`-Läufen grün,
  **während** `next dev` auf Port 3200 bediente (HTTP 200 vorher wie
  nachher) — derselbe Befehl, der die Regel vorher verletzte.
  Wer sie noch irgendwo zitiert findet: sie ist gegenstandslos, nicht
  gelockert.
- Laufzeit: warm ~1 s (Turbo-Cache), kalt ~24 s (`[cmd]` 2026-08-06,
  `pnpm gate --force` bei laufendem Dev-Server).
- Zusätzlich schützt ein PreToolUse-Hook (`.claude/hooks/protect-paths.ps1`)
  `supabase/migrations/` vor Schreibzugriffen und `.env*` vor Lese- wie
  Schreibzugriffen — Letzteres ist Absicht, kein Fehler (Details im
  Dateikopf des Hooks).

## Struktur

```
apps/web/              # Next.js 14 App (lebend): Auth, Nutrition, Theming
services/nutrition-api # Hono-Gerüst (unverdrahtet); weitere Ordner: Endausbau
packages/shared        # Supabase-Clients (verdrahtet)
packages/types         # Domänentypen (noch unverdrahtet)
supabase/              # migrations/ (Struktur-Baseline) + _pipeline/ (lokale Kette)
docs/ssot/             # Ist-Zustand — die einzige verbindliche Beschreibung
docs/spezifikation/    # Zielbild
docs/todo/TODO.md      # Nächste Schritte
_archive/              # Stillgelegte Governance-Ära — nicht reaktivieren
```

## Wo der Rest steht

- **Ist-Zustand & Regeln:** `docs/ssot/00-INDEX.md` (Rangfolge:
  Code > ssot > alles andere; Herkunftsmarker `[cmd]`/`[read]`/`[annahme]`)
- **Konventionen:** `docs/spezifikation/10-plattform/konventionen/`
- **Arbeitsanweisungen für Claude:** `CLAUDE.md`
- Wurzeldateien wie `AGENTS.md`, `SESSION_ONBOARDING.md`,
  `STACK_REFERENCE.md`, `COMMANDS.md` sind Altlast der Governance-Ära —
  nicht als Sollwert lesen (`docs/ssot/50-governance-rest.md`).
