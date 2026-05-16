# Human Coach Module — Module Contract
> Spec Phase 1 | Final

---

## 1. Zweck

Professionelles Coaching-Dashboard für Personal Trainer und Coaches. Client bleibt immer Eigentümer seiner Daten. Coach liest ausschließlich explizit freigegebene Daten.

**Kern-Innovation:** Client nutzt normale Lumeos App. Coach bekommt Permission-gefiltertes Dashboard-Overlay. Kein Doppel-Tracking.

---

## 2. Prinzipien

| Prinzip | Bedeutung |
|---|---|
| **Client-Ownership** | Alle Daten gehören dem Client. Coach liest nur mit Permission. |
| **Read-only Coach** | Coach kann keine User-Daten direkt schreiben. Nur vorschlagen. |
| **Permission-First** | Jeder Datenabruf prüft Permissions. Keine Ausnahmen. |
| **Medical = Sensitiv** | Medical Permission default = none. Explizite Freigabe erforderlich. |
| **Schema-Isolation** | Schema `coach`. Client-Daten via Permission-API, nie via direkten JOIN. |
| **GDPR-konform** | Consent-Log aller Freigaben. Widerruf jederzeit möglich. |

---

## 3. Permission System

```typescript
type AccessLevel = 'full' | 'summary' | 'none';

interface CoachPermissions {
  training:    AccessLevel;
  nutrition:   AccessLevel;
  recovery:    AccessLevel;
  supplements: AccessLevel;
  medical:     AccessLevel;  // Default: none. Sensitiv!
  goals:       AccessLevel;
  bodyMetrics: AccessLevel;
}

// full:    Coach sieht alle Daten des Moduls
// summary: Coach sieht nur Compliance-Score + Trend
// none:    Modul ist für Coach nicht sichtbar
```

---

## 4. Outputs (was Coach produziert)

### 4.1 → Training: Routines für Client
```
POST http://training:5200/api/training/routines
{ source: 'coach', coach_id: uuid }
```

### 4.2 → Nutrition: Macro-Targets / Meal Plans
```
POST http://nutrition:5100/api/nutrition/targets (als Client-Proposal)
```

### 4.3 → Supplements: Supplement Protocol
```
POST http://supplements:5300/api/supplements/stacks
{ source: 'coach', requires_client_confirmation: true }
```

### 4.4 → Goals: Goal-Adjustment vorschlagen (nicht direkt schreiben)
Coach sendet Empfehlung via Message. Client bestätigt in der App.

---

## 5. Inputs (was Coach liest — alles Permission-abhängig)

```
nutrition:   GET http://nutrition:5100/api/nutrition/for-coach
training:    GET http://training:5200/api/training/for-coach
recovery:    GET http://recovery:5400/api/recovery/for-coach
supplements: GET http://supplements:5300/api/supplements/for-coach
medical:     GET http://medical:5800/api/medical/for-coach
goals:       GET http://goals:5900/api/goals/for-coach
```

Jeder dieser Endpoints prüft intern: Hat Coach die nötige Permission?

---

## 6. Modul-Grenzen

### Human Coach BESITZT:
- Coach-Profile
- Coach-Client-Mappings
- Permission-Verwaltung
- Alert-System
- Rule Builder
- Autonomy Management
- Adherence Analytics
- In-App Chat
- Program Builder (aber: Assignment = Vorschlag, Client bestätigt)

### Human Coach BESITZT NICHT:
- User-Daten anderer Module (liest via API)
- AI-Empfehlungen (das ist Buddy/Coach-AI Modul 5500)
- Bezahlung / Billing (Marketplace Modul 5700)

---

## 7. API-Übersicht

```
http://human-coach:5600
  /api/coach/dashboard/    Summary, Clients, Activity, Metrics
  /api/coach/clients/      CRUD Coach-Client-Relations
  /api/coach/alerts/       Alert-Lifecycle
  /api/coach/rules/        Rule Builder
  /api/coach/autonomy/     Autonomy Management
  /api/coach/adherence/    Analytics
  /api/coach/programs/     Program Builder
  /api/coach/messages/     Chat
  /api/coach/checkins/     Check-in Templates
  /api/coach/permissions/  Permission-Verwaltung
  /api/coach/client/       Client-seitige Endpunkte
```
