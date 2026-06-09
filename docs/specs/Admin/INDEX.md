# Admin — Spec Index
> apps/admin | Stand: Mai 2026 | Status: draft

---

## Was dieser Ordner ist

Specs für die LumeOS Admin-Anwendung (`apps/admin`, Domain: `admin.lumeos.app`).
Internes Tool für LUMEOS-Administratoren und Staff.

---

## Dateien

| Datei | Inhalt |
|---|---|
| `SPEC_01_UI_DESIGN.md` | Vollständige UI-Spec für die Admin-App |

---

## Zugang

Nur für Accounts mit `role = admin` oder `role = staff`.
Middleware-Guard in `apps/admin/middleware.ts` blockiert alle anderen.

---

## Tech-Stack

Gleich wie `apps/web`: Next.js 14+, Tailwind, shadcn/ui.
Imports aus `packages/ui`.

---

## Modul-Accent

`--acc-admin` (neutral, oklch(0.75 0.01 270)).
Admin hat kein Modul-Farb-Theming. Neutral durch.

---

## Governance-Hinweis

Der Admin-Bereich ist **von der Governance Console getrennt**.
Die Governance Console (Workorder-Dispatch, Review-Pipeline, Approval Queue)
läuft in `AI-Governance-Core` als eigenständiges System.

Admin (hier) ist das **Business-Admin-Panel** für:
- User-Verwaltung
- Content-Moderation
- Analytics
- System-Health-Monitoring
- Food-DB-Curation (BLS)
