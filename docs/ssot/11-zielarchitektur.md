# Zielarchitektur — was am Ende stehen soll

**Stand:** 2026-08-01
**Methode:** `[cmd]` Verzeichnislisten `apps/`, `services/`, `packages/`,
`docs/specs/`; Greps auf Ports und Framework-Versionen in den Modul-INDEX-Dateien;
`[read]` `00_MASTER_VISION.md` vollständig, `WebPlatform/INDEX.md` vollständig,
`WebPlatform/SPEC_10_WORKSPACE_LINKS.md` (Domain-Tabelle).
**Achtung:** Dieses Dokument beschreibt das **Ziel**, nicht den Ist-Zustand.
Ist-Zustand: `10-workspace.md`, `20-apps-web-ist.md`.

---

## Produktvision in fünf Sätzen

`[read]` `docs/specs/00_MASTER_VISION.md` (2026-04-14, „Definitive Strategic
Vision"): LumeOS ist ein **Health & Performance Operating System**, keine
Fitness-App. Kernprodukt ist **Buddy**, ein AI-Companion mit 5 wählbaren
Personas, der per Chat (primär), Voice und proaktiven Notifications mit dem
User lebt — Geschäftsmodell „Companion as a Service". Die Fachmodule
(Nutrition, Training, Recovery, …) sind Features, die Buddys Wissen nähren.
Roadmap: V1 2026 (Chat + „alle 10 Module stabil"), V2 2027 (Voice, Wearables),
V3 2029+ („Body OS", digitaler Körperzwilling). Zielmarkt: DACH-Launch,
EN international, Thailand; primär Fitness-Enthusiasten und Kraftathleten,
B2B Personal Trainer.

`[read]` Die 7 unveränderlichen Kernprinzipien (Z. 167–175), für die Umsetzung
besonders relevant:
- **Goals-centric** — jede Empfehlung zahlt auf ein Ziel ein
- **Rule-first, AI second**
- **No direct DB writes from UI** — immer über einen Actions Layer
- **Medical = monitoring, NOT diagnosis**
- **Safety Order:** Medical Blocks > Supplement Blocks > Recovery Rest > Protocols > Optimization

---

## Ziel-Workspace: die Gerüste sind der Bauplan

`[cmd]` 2026-08-01 — der Workspace enthält neben den 17 lebenden Packages
42 leere Gerüstordner. **Sie bleiben absichtlich** (`10-workspace.md`): sie sind
der deklarierte Endausbau.

### 5 geplante Apps (`apps/`, neben `web`)

`[cmd]` Ordner: `admin`, `buddy`, `coach`, `mobile`, `staff`.

`[read]` `WebPlatform/INDEX.md` Z. 18–22: `apps/web` ist die Haupt-Webplattform
für eingeloggte Athletes (7 Core-Module + Dashboard + Auth). Die Workspaces sind
**separate Next.js-Apps**, in `apps/web` nur verlinkt — „kein Embed, kein iFrame,
kein SSR-Mix".

`[read]` `WebPlatform/SPEC_10_WORKSPACE_LINKS.md` Z. 11–16, Domain-Mapping:

| Workspace | Domain | App | Zugang |
|---|---|---|---|
| Coach Portal | `coach.lumeos.app` | `apps/coach` | Athlete + Coach |
| Buddy | `buddy.lumeos.app` | `apps/buddy` | Athlete only |
| Marketplace | `marketplace.lumeos.app` | „zukünftig `apps/marketplace`" | Public + Athlete |
| Admin | `admin.lumeos.app` | `apps/admin` | Admin + Staff only |

Gemeinsames Auth-Backend (Supabase) und Design-System; `[annahme]` SSO-Handoff
über geteiltes Cookie auf `.lumeos.app` (aus Agentenbericht zu SPEC_10 Z. 74–94,
Abschnitt nicht selbst gelesen).

### 12 geplante Services (`services/`, neben den 6 lebenden)

`[cmd]` Gerüste: `admin-api`, `analytics-api`, `auth-api`, `coach-api`,
`goals-api`, `marketplace-api`, `medical-api`, `memory-api`, `recovery-api`,
`retrieval-api`, `supplements-api`, `training-api`.

`[cmd]` Grep über die Modul-INDEX-Dateien — der spezifizierte Service-Schnitt
mit Ports:

| Port | Service | Quelle |
|---|---|---|
| 4100 | Admin API | `Admin/13_MODULE_ADMIN.md:3` |
| 5100 | Nutrition | `Nutrition/INDEX.md:217` |
| 5200 | Training | `Training/INDEX.md:83` |
| 5300 | Supplements | `Supplements/INDEX.md:73` |
| 5400 | Recovery | `Recovery/INDEX.md:75` |
| 5500 | Buddy / AI Coach | `BuddyandAICoach/INDEX.md:2` |
| 5600 | Human Coach | `HumanCoach/INDEX.md:98` |
| 5700 | Marketplace | `Marketplace/INDEX.md:114` |
| 5800 | Medical | `Medical/INDEX.md:89` |
| 5900 | Goals | `Goals/README.md:19` |
| 8502 | Coach App (Next.js) | `HumanCoach/INDEX.md:100` |
| 8503 | Marketplace App (Next.js) | `Marketplace/INDEX.md:116` |

Alle Fach-APIs: **Hono.js + TypeScript**, je Modul ein eigenes
Postgres-Schema; `[annahme]` JWT via gemeinsamer Auth-Middleware (mehrfach in
Modul-Specs erwähnt, nicht systematisch geprüft).

### 10 geplante Packages (`packages/`, neben den 9 lebenden)

`[cmd]` Gerüste: `branch-db-core`, `config`, `contracts`, `memory-core`,
`prompts`, `retrieval-core`, `rules`, `skills`, `tool-adapters`, `ui`.

- `ui` = Shared Design System (`[annahme]` OKLCH-Tokens, `useTheme`, aus
  Agentenbericht zu SPEC_10 Z. 129–139).
- `contracts` = geteilte Response-Types (auch in `.claude/rules/api-design.md`
  vorausgesetzt).
- **Lücke:** `[cmd]` Die Specs referenzieren mehrfach `packages/scoring`
  (u. a. `Goals/README.md`, `BuddyandAICoach/SPEC_09_SCORING.md`) — dafür
  existiert **kein** Gerüstordner.

### Frontend-Zielstack

`[read]` `WebPlatform/INDEX.md` Z. 64–78: Next.js 14+ App Router, Tailwind +
OKLCH-Tokens, shadcn/ui, lucide-react, Recharts, @dnd-kit, idb + next-pwa,
Zustand, TanStack Query, Supabase Auth SSR, react-hook-form + zod, date-fns,
Framer Motion. Delta zum Ist: `20-apps-web-ist.md` (nur 3 der 13 Positionen
vorhanden).

---

## Widersprüche im Zielbild

Selbst verifiziert, sofern nicht anders markiert. Nicht auflösbar ohne
Tom-Entscheidung bzw. Spec-Audit (TODO D-05):

1. **Modulzählung inkonsistent.** `[read]` Master Vision Z. 91: „Alle 10 Module".
   `[read]` `WebPlatform/INDEX.md` Z. 9: „alle 11 Module", Z. 19: „7 Core-Module
   + Dashboard + Auth". `[cmd]` `docs/specs/` hat 13 Modul-Ordner. Keine Datei
   versöhnt die Zählungen.
2. **`apps/marketplace` vs. `apps/staff`/`apps/mobile`.** `[read]` SPEC_10 nennt
   „zukünftig `apps/marketplace`" — dafür existiert kein Gerüst. `[cmd]` Umgekehrt
   haben `apps/mobile` und `apps/staff` Gerüste, aber `[annahme]` keine eigene
   Spec in `docs/specs/` (Agentenbefund; einzige Erwähnungen: mobile in
   `WebPlatform/SPEC_01_APP_SHELL.md`, staff als Rolle in `Admin/INDEX.md`).
3. **4 Service-Gerüste ohne Spec.** `[cmd]` Ports-Grep deckt `auth-api`,
   `analytics-api`, `memory-api`, `retrieval-api` nicht ab; `[annahme]` es
   existiert keine Spec für sie (Agentenbefund, kein eigener Volltext-Sweep).
4. **Next.js-Version.** `[cmd]` Grep: WebPlatform und Admin sagen „14+", alle
   acht Fachmodul-INDEX-Dateien sagen „15". `apps/web` läuft real auf 14
   (`20-apps-web-ist.md`).
5. **Admin-Port 4100** fällt aus dem 5x00-Schema aller anderen Services
   (`[cmd]` Grep oben).
6. **Spec-Status beschreibt teils eine Vorgänger-Codebasis.** `[read]`
   `Admin/13_MODULE_ADMIN.md:3`: „Status: ✅ Backend complete" — im Repo ist
   `services/admin-api` `[cmd]` ein leeres Gerüst. Solche Status-Zeilen in
   Specs nie als Ist-Zustand lesen (gleiches Muster bei Goals, siehe
   `40-spec-code-matrix.md`).

---

## Warum die 42 leeren Ordner bleiben

Sie kodieren den Ziel-Schnitt (Apps × Services × Packages), damit künftige
Arbeit an der richtigen Stelle landet. **Aber:** Ein Scan ohne Shell sieht hier
„leere Ordner" und schließt fälschlich auf einen leeren Workspace — genau das
ist am 2026-07-30 passiert (`00-INDEX.md`, Marker-Regel). Vor Aussagen über
den Workspace immer `pnpm typecheck` oder eine Verzeichnisliste laufen lassen.
