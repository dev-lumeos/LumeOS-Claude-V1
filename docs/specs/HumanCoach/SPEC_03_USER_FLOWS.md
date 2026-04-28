# Human Coach Module — User Flows
> Spec Phase 3 | Alle primären User Flows

---

## Flow 1: Coach — Neuen Client onboarden

```
1. Coach: Dashboard → "+" → "Client einladen"
2. Coach gibt ein: Client E-Mail + Start Date + Plan Type
3. System sendet Invite-Link an Client
4. Client akzeptiert → Permission-Auswahl:
   ┌────────────────────────────────────────────────┐
   │ Was darf dein Coach sehen?                    │
   │                                               │
   │ Training:    [Full ▾]                         │
   │ Nutrition:   [Full ▾]                         │
   │ Recovery:    [Summary ▾]                      │
   │ Supplements: [Full ▾]                         │
   │ Medical:     [None ▾]  ← Sensitiv!            │
   │ Goals:       [Full ▾]                         │
   │ Body Metrics:[Summary ▾]                      │
   │                                               │
   │ [Bestätigen] [Zurück]                         │
   └────────────────────────────────────────────────┘
5. Coach sieht Client im Dashboard
6. Coach erstellt: Training Routine + Nutrition Targets + Supplement Stack
7. Client erhält Notification: "Coach hat dir einen Plan zugewiesen"
8. Client bestätigt Plan → aktiv in Lumeos App
```

---

## Flow 2: Coach — Daily Dashboard Runde

```
1. Coach öffnet Dashboard → Client Cards sortiert nach Risk
2. Reihenfolge:
   [CRITICAL] Max M. — Recovery 3 Tage unter 50% ⚠️
   [ATTENTION] Lisa K. — Protein 60% letzte 5 Tage
   [GOOD] Tom R. — Bench Press PR heute 🎉
   ...

3. Coach klickt Max M.:
   Recovery Tab: "Score Trend 71→65→58→54 ↓"
   Training Tab: "Volumen letzte Woche +25% vs. Vorwoche"
   Nutrition Tab: "Kalorienziel OK, Protein OK"
   
4. Coach sendet Message:
   "Hey Max, ich sehe dass dein Recovery Score seit 4 Tagen fällt.
    Ich empfehle eine Deload-Woche. Training habe ich angepasst — bitte bestätigen."
   + [Deload Routine zuweisen]

5. Für Lisa K.:
   Alert: "Protein unter 70% seit 5 Tagen"
   Coach schreibt: "Lass uns über Protein-Quellen sprechen"
   
6. Für Tom R.:
   Info Alert: "PR: Bench 100kg"
   Coach antwortet auf Auto-Alert: "Incredible! Du bist auf Kurs 💪"
```

---

## Flow 3: Wöchentlicher Check-in (automatisiert)

```
Automatisch jeden Montag (konfigurierbar):

1. System sendet Check-in Template an alle Clients mit Autonomy Level 1–3
   Template enthält:
   - Gewicht (vorausgefüllt aus App)
   - Training Compliance (vorausgefüllt)
   - Nutrition Compliance (vorausgefüllt)
   - Supplement Compliance (vorausgefüllt)
   - Recovery Score Ø (vorausgefüllt)
   - Fragen: "Wie war deine Energie?", "Besonderheiten?", "Fragen?"

2. Client füllt in 2 Minuten aus (meiste Felder auto)
3. Coach sieht Zusammenfassung aller eingegangenen Check-ins
4. Coach reagiert auf Check-ins die Handlungsbedarf zeigen
```

---

## Flow 4: Rule Builder — Neue Regel erstellen

```
1. Coach: Rules Tab → "Neue Regel erstellen"
2. Name: "Protein Alert Trainingstag"
3. Conditions:
   + [IF] Nutrition · protein_adherence_pct · < · 70 (%)
   + [AND] Training · session_today · = · true
4. Logic: AND
5. Action:
   Alert · MEDIUM
   Title: "Client unter Protein-Ziel an Trainingstag"
   Cooldown: 24 Stunden
6. [Test → 3 Clients würden heute triggern: Max M., Lisa K., Petra S.]
7. [Speichern + Aktivieren]
8. Morgen: Alert erscheint für betroffene Clients
```

---

## Flow 5: Autonomy Level anpassen

```
1. Coach bemerkt: Client Maria trackt seit 6 Wochen täglich, Adherence Ø 88%
2. Coach → Client Detail → Autonomy Tab
3. System zeigt: "Empfehlung: Level 2 → 3 (Intermediate)"
   Scores: Consistency 0.92, Knowledge 0.78, Self-Correction 0.71
4. Coach bestätigt Level-Up mit Begründung:
   "Exzellente Konsistenz seit 6 Wochen, versteht Plan sehr gut"
5. Level-History wird aktualisiert
6. Check-in Frequenz ändert sich: täglich → wöchentlich
7. Client erhält Message: "Dein Coach hat dein Autonomy Level erhöht!"
```

---

## Flow 6: Bodybuilding Prep Coach (Enhanced Mode)

```
1. Client teilt Medical Permission mit Coach (explizit, zeitbegrenzt)
2. Coach sieht Medical Tab in Client-Ansicht
3. Wöchentlicher Monitoring-Check:
   ┌────────────────────────────────────────────────┐
   │ Max M. — Contest Prep Woche 8/16              │
   │                                               │
   │ 📊 Training: 85% Adherence ✅                  │
   │ 🥩 Protein: 2.8g/kg ✅                         │
   │ 😴 Recovery: 58 ↓⚠️ (Ziel: >70)               │
   │ 💊 Supplement Stack: 78% ✅                    │
   │                                               │
   │ 🩸 Bloodwork (Woche 6):                       │
   │    Hematocrit: 48% ✅ (< 50%)                 │
   │    Testosteron: 620 ng/dL ✅                   │
   │    ALT: 38 U/L 🟡 (leicht erhöht)             │
   │    Vitamin D: 28 ng/mL ⚠️ Niedrig             │
   │                                               │
   │ ⚠️ ALERT: ALT erhöht → Leberwerte beachten   │
   │ ⚠️ ALERT: Vitamin D niedrig                  │
   │                                               │
   │ [Message senden] [Plan anpassen]              │
   └────────────────────────────────────────────────┘
4. Coach justiert Plan: +TUDCA, +Vitamin D3 5000 IU
5. Client erhält Supplement-Update-Vorschlag
```

---

## Flow 7: Client — Coach-Sicht einschränken

```
1. Client: Settings → Coach-Zugang
2. Sieht Übersicht: "Coach Alex sieht folgende Daten:"
   Training: Full ✅
   Nutrition: Full ✅
   Medical: None (deaktiviert)
3. Client ändert: "Nutrition: Full → Summary"
   → Coach sieht nur noch Score + Trend, keine Mahlzeiten
4. System loggt Änderung mit Timestamp (Consent-Log)
5. Coach sieht Benachrichtigung: "Client hat Nutrition Permission eingeschränkt"
```

---

## Flow 8: Alert Lifecycle

```
1. System erkennt: Recovery Score unter 50% für 3+ Tage
   → Regel feuert: "Recovery Warning"
2. Alert wird erstellt: priority=2, severity=high
3. Coach-App: Rote Badge im Header ("+1")
4. Coach klickt Alert:
   Title: "Recovery Score kritisch niedrig (3 Tage)"
   Message: "Score Trend: 71→65→58→52. Ø Schlaf: 5.9h"
   Actions: "Schlaf besprechen", "Volumen reduzieren", "Deload empfehlen"
5. Coach wählt: [Acknowledge + Note: "Deload empfohlen, gechattet"]
6. Alert Status: open → acknowledged
7. Coach sendet Message an Client
8. Nach Deload-Woche: Recovery erholt sich → Coach markiert [Resolve]
9. Alert Status: resolved
```

---

## Flow 9: Coach Performance Review

```
1. Coach: Analytics Tab → "Dieser Monat"
2. Übersicht:
   Client Retention: 94% (April)
   Avg. Satisfaction: 4.6/5
   Goal Completion: 72%
   Avg. Response Time: 3.2h
   Adherence Improvement: +12% (Ø aller Clients)
   Alerts: 47 gesamt, 5% False Positives
3. Coach sieht: "Welche Clients haben sich am meisten verbessert?"
4. Coach sieht: "Welche Clients brauchen mehr Aufmerksamkeit?"
```

---

## Flow 10: Pending Actions (Coach)

```
GET /api/coach/dashboard/pending-actions

Auslöser:
- Unbestätigte kritische Alerts
- Check-in nicht ausgefüllt (Client > 48h überfällig)
- Geplantes Programm läuft ab
- Client Autonomy Assessment fällig

Response:
[
  { type: "critical_alert", client: "Max M.", label: "Recovery Score kritisch", priority: 1 },
  { type: "checkin_overdue", client: "Lisa K.", label: "Check-in seit 3 Tagen überfällig" },
  { type: "program_expiring", client: "Tom R.", label: "12-Wochen Plan endet in 7 Tagen" }
]
```
