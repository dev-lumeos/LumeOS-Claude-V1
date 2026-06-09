# WebPlatform — UI Spec Index
> Stand: Mai 2026 | Status: draft | Quelle: Design Intake LumeOS.html

---

## Was diese Spec ist

Dieser Ordner enthält die vollständige Frontend-UI-Spec für die LumeOS Webapplikation (`apps/web`).
Abgeleitet aus dem Claude-Design-Mockup (LumeOS.html, ~100 Iterationsturns, alle 11 Module vollständig iteriert).

Diese Spec ist **orthogonal** zu den bestehenden Backend-Specs (SPEC_01–SPEC_10 pro Modul).
Sie beschreibt: Layout, Komponenten, Design-Tokens, Interaktionen, Routing — nicht die API-Schicht.

---

## Scope

`apps/web` ist die **Haupt-Webplattform** für eingeloggte Athletes.
Sie enthält 7 Core-Module + Dashboard + Auth.

Die 4 Workspaces sind **separate Anwendungen** (`apps/coach`, `apps/buddy`, `apps/admin`, zukünftig `apps/marketplace`).
In `apps/web` werden sie nur verlinkt — kein Embed, kein iFrame, kein SSR-Mix.

---

## Dateistruktur dieser Spec

| Datei | Inhalt |
|---|---|
| `SPEC_01_APP_SHELL.md` | 3-Spalten-Shell, Sidebar, Topbar, Context Panel, Routing, Shortcuts |
| `SPEC_02_DESIGN_SYSTEM.md` | Tokens, Typografie, Farbe, Spacing, Komponenten-Primitives, Dark/Light |
| `SPEC_03_DASHBOARD.md` | Dashboard-Modul: KPI-Grid, Today-Flow, Activity Feed |
| `SPEC_04_NUTRITION_UI.md` | Nutrition: Diary, MealCam, Food DB (BLS), 117-Nutrient-Tree, Planner |
| `SPEC_05_TRAINING_UI.md` | Training: Today, LiveWorkout, Plan, History, Library, Offline-first |
| `SPEC_06_RECOVERY_UI.md` | Recovery: Score, HRV, Sleep, Body-Map, KI-Insights |
| `SPEC_07_SUPPLEMENTS_UI.md` | Supplements: Today, Stack, Database, Compliance, Interactions, Cost, Extended Mode |
| `SPEC_08_GOALS_UI.md` | Goals & Body: Goals, Timeline, Body Metrics, Measurements, Composition |
| `SPEC_09_MEDICAL_UI.md` | Medical: Overview, Lab Results, Medications, History, Documents, Appointments |
| `SPEC_10_WORKSPACE_LINKS.md` | Workspace-Integration: Auth-Handoff, Deep-Link-Protokoll, Cross-Domain |

---

## Workspace-App-Specs (separate Domains)

| Workspace | Spec-Datei | App |
|---|---|---|
| Coach Portal | `docs/specs/HumanCoach/SPEC_11_UI_DESIGN.md` | `apps/coach` |
| Buddy | `docs/specs/BuddyandAICoach/SPEC_11_UI_DESIGN.md` | `apps/buddy` |
| Marketplace | `docs/specs/Marketplace/SPEC_11_UI_DESIGN.md` | zukünftig `apps/marketplace` |
| Admin | `docs/specs/Admin/SPEC_01_UI_DESIGN.md` | `apps/admin` |

---

## Design-Referenz

Quelle: Claude Design Handoff — LumeOS-Draft Projekt (v0.9.4)
Original-Bundle: `LumeOS.html` + 22 JSX-Module + `styles.css` + `governance.css`
Design-Chat: ~100 Turns, alle 11 Module vollständig ausgearbeitet

---

## Tech-Stack (Frontend)

| Layer | Technologie |
|---|---|
| Framework | Next.js 14+ App Router |
| Styling | Tailwind CSS + CSS Custom Properties (OKLCH tokens) |
| UI Primitives | shadcn/ui |
| Icons | lucide-react |
| Charts | Recharts |
| Drag & Drop | @dnd-kit/core + @dnd-kit/sortable |
| Offline | idb (IndexedDB) + Workbox via next-pwa |
| State Client | Zustand |
| State Server | TanStack Query (React Query) |
| Auth | Supabase Auth SSR |
| Forms | react-hook-form + zod |
| Dates | date-fns |
| Animations | Framer Motion (Buddy-Avatar, Transitions) |
