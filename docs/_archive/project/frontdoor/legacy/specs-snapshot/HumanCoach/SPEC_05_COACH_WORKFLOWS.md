# Human Coach Module — Coach Workflows
> Spec Phase 5 | Typische Coach-Abläufe in Detail

---

## 1. Workflow: Neuen Client onboarden

```
Dauer: 30–60 Minuten (einmalig)

SCHRITT 1: Client einladen
  - Coach schickt Invite-Link (E-Mail oder in-App)
  - Client registriert sich / loggt sich ein
  - Client wählt Permissions

SCHRITT 2: Profil-Review (Coach)
  - Coach reviewed Onboarding-Daten (Ziele, Verletzungen, Diät)
  - Coach setzt initiales Autonomy Level (Standard: Level 2)
  - Coach fügt Tags hinzu: ['contest_prep', 'intermediate', 'male']

SCHRITT 3: Plan erstellen
  ┌────────────────────────────────┐
  │ Training Program               │
  │ → Routine aus Library wählen   │
  │ → Oder neu erstellen           │
  │ → Assign to Client             │
  ├────────────────────────────────┤
  │ Nutrition Targets              │
  │ → Kalorienziel aus Goal/TDEE   │
  │ → Macro-Aufteilung setzen      │
  │ → Als Proposal senden          │
  ├────────────────────────────────┤
  │ Supplement Stack               │
  │ → Stack aus Catalog zusammen   │
  │ → Timing + Dosis               │
  │ → Proposal → Client bestätigt  │
  └────────────────────────────────┘

SCHRITT 4: Rules aktivieren
  - System-Regeln: Automatically aktiv
  - Coach aktiviert gewünschte Custom-Regeln
  - Optional: Neue Regel für diesen Client-Typ

SCHRITT 5: Check-in Template
  - Coach wählt Template (weekly_standard / prep_intensive)
  - Check-in beginnt automatisch nächsten Montag
```

---

## 2. Workflow: Wöchentlicher Review (Standard Coach)

```
Dauer: 15–45 Minuten/Woche
Frequenz: Montag morgens

1. Dashboard öffnen → Clients nach Priorität sortiert
2. Critical + Attention Clients zuerst behandeln
3. Für jeden Client mit Aufmerksamkeitsbedarf:
   a. Detail-Ansicht öffnen
   b. Relevante Tabs prüfen
   c. Message schreiben ODER Plan anpassen
4. Check-ins der Woche reviewen
5. Alerts bestätigen / lösen
6. Routine Clients: kurze "Keep it up!" Messages (optional)
```

---

## 3. Workflow: Bodybuilding Prep Coach

```
Dauer: 30–60 Minuten/Woche pro Client
Frequenz: Wöchentlich (Woche 1–24)

MONITORING-CHECKLIST (vom System automatisch):

Week X / 16:
✅ Körpergewicht auf Kurs? (Erwarteter Verlust: X kg)
✅ Macro Adherence > 90%?
✅ Training Adherence > 90%?
✅ Recovery Score > 65?
✅ Schlaf > 7h?
⚠️ HRV unter Baseline?

BLOODWORK-CHECKS (alle 4–6 Wochen):
Required bei Enhanced Mode:
  - Hematocrit < 50%?
  - ALT / AST < 2× ULN?
  - Hormone (Testosteron, Estradiol, LH)
  - Lipide (LDL, HDL, Triglycerides)
  - Vitamin D, Ferritin

PEAK WEEK PROTOCOL (Woche 15):
  Coach setzt Peak Week Phase in Goals Modul
  System generiert tägliche Tasks:
  - Carb Depletion Tage 1–3
  - Carb Load Tage 4–5
  - Natrium-Management
  - Wasser-Management
  - Show Day Protokoll
```

---

## 4. Workflow: Program Auto-Delivery

```
Coach erstellt 12-Wochen Program:
  - Woche 1–4: Block 1 (Hypertrophy, High Volume)
  - Woche 5–8: Block 2 (Strength, Lower Volume, Higher Intensity)
  - Woche 9–12: Block 3 (Peaking)

Auto-Delivery Konfiguration:
  Week 1: sofort (bei Assign)
  Week 2: +7 Tage
  Week 3: +14 Tage
  ...

System liefert automatisch neue Woche aus.
Auto-Message: "Neue Woche freigeschaltet! Fokus: [Block-Name]"
Coach muss nur reagieren wenn:
  - Client stellt Fragen
  - Alert wird generiert
  - Check-in zeigt Probleme
```

---

## 5. Workflow: Nutrition Coach

```
Fokus: Ernährung, Meal Plans, Adherence

WÖCHENTLICHER REVIEW:
  - Nutrition Dashboard öffnen
  - Macro Adherence (Kalorien, Protein, Carbs, Fett)
  - 138 Mikronährstoffe: Mängel?
    → "Eisenmangel erkannt → Supplementierung vorschlagen"
    → "Vitamin D nur 28 ng/mL → Bluttest empfehlen"
  - Mahlzeit-Qualität
  - MealCam-Logs (wenn geteilt)

MEAL PLAN UPDATE:
  - Aktuellen Plan anschauen
  - Neue Woche planen
  - Via Nutrition API als Proposal senden
  - Client bestätigt
```

---

## 6. Workflow: Strength Coach

```
Fokus: Progression, PRs, Periodization

WÖCHENTLICHER REVIEW:
  - Training Tab
  - Progression pro Hauptübung (Squat, Bench, Deadlift, OHP)
  - Volume Landmarks (in MAV-Bereich?)
  - ACWR (Overtraining-Risiko?)
  - Recovery Score (Erholung ausreichend?)

PERIODIZATION REVIEW (monatlich):
  - Aktuelles Trainingsblock-Ziel
  - Progression Rate vs. Plan
  - Empfehlung für nächsten Block
  - Phase-Transition (von Lean Bulk zu Cut wenn Zielgewicht erreicht?)
```

---

## 7. Coach-Client Dashboard Mock

```
┌─────────────────────────────────────────────────────────────┐
│ 👤 Max Mustermann                   [Autonomy Level 2]      │
│ Program: PPL Hypertrophy (Woche 6/12)  Start: 01.02.2026   │
│                                                              │
│ STATUS: ⚠️ ATTENTION                                        │
│                                                              │
│ 📊 Compliance (letzte 7 Tage)                               │
│ Training:     ████████░░  85%  → stable                    │
│ Nutrition:    ██████░░░░  65%  ↓ declining                 │
│ Supplements:  ████░░░░░░  40%  ↓ declining  ⚠️             │
│ Recovery:     ██████░░░░  62%  ↓ declining  ⚠️             │
│                                                              │
│ 📈 Recovery Trend: 71→65→58→54→52  🔴 KRITISCH            │
│ 😴 Ø Schlaf: 5.9h  (Ziel: 7.5h)  🔴                      │
│ 💪 Body Weight: 82.3kg (-0.5kg/Wk) ✅                      │
│ 🏋️ Bench PR: 100kg (+2.5kg) 🎉                             │
│                                                              │
│ 🩸 Bloodwork: 14.02.2026                                    │
│    Hematocrit: 48% ✅  Vit D: 28 ng/mL ⚠️ ALT: 38 ⚠️     │
│                                                              │
│ ⚠️ OFFENE ALERTS (2):                                       │
│    ↑ Recovery Score kritisch niedrig (HIGH)                 │
│    ↑ Supplement Compliance unter 50% (MEDIUM)              │
│                                                              │
│ 💬 Letzte Nachricht: Gestern 18:32                          │
│ 📋 Nächster Check-In: Montag                                │
│                                                              │
│ [Message]  [Plan anpassen]  [Details]  [Acknowledge Alerts] │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. Rule Templates — System-Vorlagen

| Template | Beschreibung | Standard-Severity |
|---|---|---|
| Protein Alert | protein_adherence_pct < 70 AND training.session_today | MEDIUM |
| Übertraining Warning | recovery.score_trend_down (7d) AND training.volume_trend_up (7d) | HIGH |
| Recovery Kritisch | recovery.score_7d_avg < 50 | HIGH |
| Schlaf-Alarm | recovery.sleep_hours < 6 AND 3+ Tage | MEDIUM |
| Supplement Abfall | supplements.compliance < 50 AND 5+ Tage | MEDIUM |
| Streak Achievement | training.consecutive_days >= 7 | INFO (Feiern!) |
| Adherence Drop | nutrition.daily_score_trend_down (5d) AND under 70 | MEDIUM |
| Medical Alert weiterleiten | medical.critical_flag = true | CRITICAL |
| Missed Check-In | checkin.missed = true AND days_since > 3 | LOW |
| Inaktivität | training.days_since_last_session > 7 | MEDIUM |
