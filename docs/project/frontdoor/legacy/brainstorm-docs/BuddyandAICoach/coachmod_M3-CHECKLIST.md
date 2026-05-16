# M3: Human Coach Platform — Spec vs. Reality Checklist

## PRD Reference: docs/coach-module/PRD.md

---

## F1.1 — Coach Dashboard (Client-Übersicht)

| # | Spec Feature | Status | Notes |
|---|---|---|---|
| 1.1.1 | Client-Liste mit Ampel-Status (🟢🟡🔴) | ✅ DONE | Status dots on avatars |
| 1.1.2 | Per client: Training Compliance % | ❌ MISSING | Shows 0 — no cross-module aggregation per client |
| 1.1.3 | Per client: Nutrition Compliance % | ❌ MISSING | Same issue — fetches from shared dev user API |
| 1.1.4 | Per client: Supplement Compliance % | ❌ MISSING | Same |
| 1.1.5 | Per client: Recovery Score | ❌ MISSING | Same |
| 1.1.6 | Per client: Weight trend (kg, +/- per week) | ❌ MISSING | Not shown at all |
| 1.1.7 | Per client: Last Bloodwork | ⏸️ DEFERRED | No bloodwork module yet |
| 1.1.8 | Per client: Last Message + time | ✅ DONE | In messages tab |
| 1.1.9 | Per client: Next Check-in date | ❌ MISSING | Not displayed |
| 1.1.10 | Sortierung: letzte Aktivität, Alerts, Compliance | ❌ MISSING | Only alphabetical sort |
| 1.1.11 | Click → Client-Detailansicht | ✅ DONE | Works |
| 1.1.12 | Multi-Coach Support | ⏸️ DEFERRED | Single coach dev mode |
| 1.1.13 | Branding (Coach-Logo, Farben) | ⏸️ DEFERRED | Profile has avatar placeholder |

## F1.2 — Permission-Based Data Access

| # | Spec Feature | Status | Notes |
|---|---|---|---|
| 1.2.1 | Permission JSONB per client (7 categories) | ✅ DONE | In DB + shown in detail |
| 1.2.2 | Client kontrolliert Zugriff | ⏸️ DEFERRED | No client-side UI yet |
| 1.2.3 | Coach sees data based on permissions | ⚠️ PARTIAL | Permissions exist but cross-module fetch ignores them |
| 1.2.4 | Medical = explicit opt-in | ✅ DONE | Default "none" in JSONB |
| 1.2.5 | Revoke jederzeit | ⏸️ DEFERRED | No client-side UI |

## F1.3 — Program Builder

| # | Spec Feature | Status | Notes |
|---|---|---|---|
| 1.3.1 | Create/Edit/Delete Programs | ✅ DONE | Full CRUD works |
| 1.3.2 | Phases (Accumulation/Overreach/Deload) | ✅ DONE | Phase editor in form |
| 1.3.3 | Template System | ⚠️ PARTIAL | `is_template` field exists but no template UI |
| 1.3.4 | Assign to Client | ✅ DONE | Works |
| 1.3.5 | Auto-Delivery (Woche für Woche) | ❌ MISSING | No week-by-week unlock |
| 1.3.6 | Meal Plan Integration | ❌ MISSING | No macro → recipe linking |
| 1.3.7 | Supplement Protocol Templates | ❌ MISSING | No supplement protocol in program |
| 1.3.8 | Drag & Drop Workout-Erstellung | ⏸️ DEFERRED | Complex UI, not MVP |
| 1.3.9 | Periodisierung visual | ❌ MISSING | Phases list exists but no visual timeline |

## F1.4 — Automated Check-Ins

| # | Spec Feature | Status | Notes |
|---|---|---|---|
| 1.4.1 | Create/Review Check-ins | ✅ DONE | Full flow works |
| 1.4.2 | Auto-pull data (Weight, Recovery, Compliance) | ⚠️ PARTIAL | auto_data field exists, no auto-pull logic |
| 1.4.3 | Client submits feedback | ✅ DONE | POST /:id/submit endpoint |
| 1.4.4 | Coach reviews with notes/feedback/action items | ✅ DONE | Full review UI |
| 1.4.5 | Konfigurierbar pro Client (wöchentlich/bi-weekly) | ❌ MISSING | No schedule config |
| 1.4.6 | Auto-Reminder an Client | ❌ MISSING | No reminder system |
| 1.4.7 | Dashboard-Summary statt Daten-Dump | ⚠️ PARTIAL | Auto data cards exist when data present |

## F1.5 — Communication

| # | Spec Feature | Status | Notes |
|---|---|---|---|
| 1.5.1 | In-App Chat (Text) | ✅ DONE | Real-time polling |
| 1.5.2 | Voice Notes | ❌ MISSING | No audio recording |
| 1.5.3 | Photo/Video in chat | ❌ MISSING | Text only |
| 1.5.4 | Kurzvideo-Funktion | ❌ MISSING | Complex feature |
| 1.5.5 | Video Call Link | ❌ MISSING | No Zoom/Meet integration |
| 1.5.6 | Session Notes | ❌ MISSING | Notes exist in client but not linked to chat |
| 1.5.7 | Thread view (all clients) | ✅ DONE | Messages tab with threads |
| 1.5.8 | Unread badges | ✅ DONE | On tabs and thread list |
| 1.5.9 | Mark as read | ✅ DONE | Auto-mark on open |

## F1.6 — Enhanced Protocol Management

| # | Spec Feature | Status | Notes |
|---|---|---|---|
| 1.6.1 | Cycle-Übersicht pro Client | ❌ MISSING | Client has cycles but coach can't see them |
| 1.6.2 | Bloodwork-Tracking | ⏸️ DEFERRED | No bloodwork module |
| 1.6.3 | Auto-Alerts (Hematocrit etc.) | ⏸️ DEFERRED | |
| 1.6.4 | PCT-Planung | ⏸️ DEFERRED | |

## F1.7 — Analytics & Reporting

| # | Spec Feature | Status | Notes |
|---|---|---|---|
| 1.7.1 | Revenue pro Client | ✅ DONE | Revenue bars in overview |
| 1.7.2 | Laufzeiten | ❌ MISSING | No duration/expiry tracking UI |
| 1.7.3 | Neukunden-Rate | ❌ MISSING | |
| 1.7.4 | Ablauf-Warnungen | ❌ MISSING | No expiry alerts |
| 1.7.5 | Retention-Rate | ❌ MISSING | |
| 1.7.6 | Kundeneinteilung (Tags/Filter) | ✅ DONE | Tags + search + status filter |
| 1.7.7 | Client-Fortschritt über Wochen | ❌ MISSING | No trend charts |
| 1.7.8 | Compliance-Trends | ❌ MISSING | |
| 1.7.9 | Kraft-Kurven (PRs) | ⏸️ DEFERRED | Training module needed |
| 1.7.10 | Auto-generated Insights | ❌ MISSING | No "10% stärker als letzte Woche" |

---

## M1 Butler ACs (already partially done)

| AC | Description | Status |
|---|---|---|
| AC1 | Mahlzeit per Text loggen | ✅ DONE |
| AC2 | Supplement per Text loggen | ✅ DONE |
| AC3 | Wasser per Text loggen | ✅ DONE |
| AC4 | Gewicht per Text loggen | ✅ DONE |
| AC5 | Recovery Check-in per Text | ✅ DONE |
| AC6 | Intent Recognition (Action/Frage/SmallTalk) | ✅ DONE |
| AC7 | Rückfrage bei Unsicherheit | ❌ MISSING |
| AC8 | Bestätigung nach Action | ✅ DONE |
| AC9 | Off-Topic geblockt | ✅ DONE |
| AC10 | Bestehende Features funktional | ✅ DONE |
| AC11 | Feature-Gate Middleware | ⚠️ PARTIAL | FEATURE_TIERS const exists but not enforced |
| AC12 | Modulares Pricing konfigurierbar | ⚠️ PARTIAL | Same |

---

## Summary

| Category | Done | Partial | Missing | Deferred |
|---|---|---|---|---|
| F1.1 Dashboard | 3 | 0 | 5 | 2 |
| F1.2 Permissions | 2 | 1 | 0 | 2 |
| F1.3 Programs | 3 | 1 | 4 | 1 |
| F1.4 Check-ins | 3 | 2 | 2 | 0 |
| F1.5 Communication | 4 | 0 | 5 | 0 |
| F1.6 Enhanced | 0 | 0 | 1 | 3 |
| F1.7 Analytics | 2 | 0 | 5 | 1 |
| **TOTAL** | **17** | **4** | **22** | **9** |

**M3 Completion: ~33% of spec features done**
**Priority gaps:** Cross-module data per client, sort/filter, client compliance %, auto-pull check-in data, analytics trends
