# Buddy / AI Coach Module — User Flows
> Spec Phase 3 | Alle primären User Flows

---

## Flow 1: Onboarding — Buddy einrichten

```
1. Erster Login → Buddy-Onboarding Wizard

STEP 1: Name deinen Coach
  Coach Name: [Alex] [Dr. Kim] [Max] [Buddy] [Custom]

STEP 2: Persönlichkeit wählen
  [🔬 Scientist]  [💪 Motivator]  [🎖️ Drill Sergeant]
  [😊 Best Friend]  [🧘 Zen Master]
  Preview: "So spricht dein Coach mit dir..."

STEP 3: Was darf Buddy sehen?
  Training:    [✅]  Nutrition:   [✅]
  Recovery:    [✅]  Supplements: [✅]
  Goals:       [✅]  Medical:     [❌] ← Sensitiv, opt-in

STEP 4: Wie aktiv soll Buddy sein?
  Level 1: [Ich frage wenn ich will]
  Level 3: [Lass uns zusammenarbeiten] ← Default
  Level 5: [Buddy entscheidet selbst]

STEP 5: Heartbeat aktivieren?
  [Ja, ich will tägliche Briefings]
  → Zeigt Standard-Schedule: Morgens 7:00 + Abends 21:00
  → "Du kannst alles später anpassen"

5. UserCoachProfile wird angelegt
6. CoachJourney mit Standard-Checkpoints wird angelegt
7. Feature-Tier = aktiver Plan
```

---

## Flow 2: Täglicher Chat (Standard)

```
1. User öffnet App → Coach Tab
2. Floating Widget zeigt: "💪 Today: 72% · Protein 65%"

3. User: "Wie war mein Tag?"
   → Hybrid Path:
     Engines: Nutrition Score 72, Training ✅, Recovery 68
     LLM: Formuliert im Motivator-Stil
   
4. Buddy:
   "Alter, Training war top heute! Protein ist noch bei 65% —
    du brauchst noch 45g. Casein-Shake vorm Schlafen wäre perfekt.
    Recovery bei 68 — morgen liegt Leg Day an, das schaffst du."
   
   [📊 Mein Tages-Overview]  [🥩 Protein-Plan für heute Abend]
```

---

## Flow 3: Voice Workout (Live Mode)

```
1. User im Gym: Coach Tab → "Workout starten" oder Hotword "Hey Buddy"
2. SESSION_START:
   Buddy: "Pull Day, 5 Übungen. Letzte Woche warst du bei 85% aller Ziel-Reps.
           Heute anstreben: 90%. Energy Check — 1 bis 5?"
   User: "4"
   Buddy: "Vier von fünf — voller Plan. Los geht's!"

3. EXERCISE_INTRO (Klimmzüge):
   Buddy: "Erste Übung: Klimmzüge. Letzte Woche: 4 Sets, 10-9-8-7.
           Heute: alle Sets über 8 halten."

4. SET_ACTIVE:
   [Stille während Set]
   Buddy (letzten 2 Reps): "Noch zwei! Komm! Und nochmal! STARK!"

5. User: "Fertig"
   Buddy: "Gewicht?"
   User: "Körpergewicht"
   Buddy: "Reps?"
   User: "11"
   Buddy: "11 Reps — neuer PR! LOG_SET, START_TIMER 90s.
           90 Sekunden Pause. Das war stark."

6. SESSION_COMPLETE:
   Buddy: "Workout fertig! 42 Minuten, 20 Sets, 2 neue PRs.
           Gesamtvolumen 9.840 Kilo, 8% mehr als letzte Woche.
           Wie war's? [💪] [😐] [😩]"
```

---

## Flow 4: App Butler — Action per Text

```
1. User: "Hab heute 200g Hähnchen mit 150g Reis gegessen"
2. Intent Recognition: log_meal (confidence: 0.94)
3. Action: 
   GET /api/nutrition/search → chicken breast + jasmine rice
   Preview: "200g Hähnchenbrust + 150g Jasminreis
             P:52g C:57g F:6g = 490 kcal
             [✅ Loggen] [Anpassen]"
4. User: "Ja loggen"
5. POST /api/nutrition/meals → Meal geloggt
6. Buddy: "✅ Geloggt! 490 kcal, 52g Protein.
           Du liegst jetzt bei 1.840 kcal, Protein 72% vom Ziel."
```

---

## Flow 5: Proaktiver Wächter trifft ein

```
Background Worker (02:00 Uhr): Recovery Score seit 4 Tagen unter 50%

1. Alert Level: WARNING 🟠
2. Alert wird erstellt:
   "Recovery Score ist seit 4 Tagen unter 50. Ø Schlaf: 5.9h."

Nächstes Morgen-Briefing (07:00):
3. Buddy: "Guten Morgen! Ich muss kurz etwas ansprechen:
           Dein Recovery Score fällt seit 4 Tagen — heute bei 48.
           Ø Schlaf war 5.9h diese Woche.
           Ich empfehle heute: Training auf 70% Volume reduzieren.
           Und heute Abend: vor 22 Uhr schlafen gehen."
```

---

## Flow 6: Heartbeat Konfiguration

```
1. Settings → Journey & Heartbeat
2. Übersicht aller Checkpoints:
   🌅 Morgen 07:00 [AKT.] → [Bearbeiten]
   🍽️ Mittagscheck 12:30 [DEAKT.]  → [Aktivieren]
   🏋️ Pre-Workout 16:00 [AKT.] → [Bearbeiten]
   🌙 Abend 21:00 [AKT.] → [Bearbeiten]
   📊 Wochenreview So 20:00 [AKT.] → [Bearbeiten]

3. "Morgen 07:00 bearbeiten":
   Uhrzeit: [07:00]
   Wochentage: [Mo✓ Di✓ Mi✓ Do✓ Fr✓ Sa✓ So✗]
   Module: [Recovery✓] [Nutrition✓] [Supplements✓] [Goals✗]
   Persona: [Drill Sergeant] ← Morgens hart
   Push Notification: [Ja]
   [Speichern]

4. Nächster Tag 07:00:
   Buddy (Drill Sergeant): "Guten Morgen.
   Recovery heute: 72. Schlaf: 7.1h — gut.
   Heute: Push Day. Kalorienziel: 3.150 kcal. Protein: 185g.
   Supps: Kreatin (noch nicht genommen), Vitamin D.
   Los. Kein Rum stehen."
```

---

## Flow 7: Feature Gate Upsell

```
1. User (Free Tier): klickt Mikrofon-Button
2. Buddy: "🎤 Voice Input ist im Pro-Plan verfügbar.
           Im Pro-Plan bekommst du:
           • Voice im Gym (Log Sets per Sprache)
           • Proaktiver Wächter (ich melde mich wenn was falsch läuft)
           • Push Notifications
           Upgrade für €X/Monat — 14 Tage gratis testen."
           [Jetzt upgraden] [Vielleicht später]

3. User: "Vielleicht später"
4. Buddy: "Kein Stress. Wenn du Lust auf eine Probe hast:
           Heute noch 1 gratis Voice-Command. Was möchtest du loggen?"
```

---

## Flow 8: Persona wechseln per Chat

```
1. User (zu Drill Sergeant): "Hey, ich brauche heute was Sanfteres.
   Stressiger Tag."
2. Buddy (erkennt Stress-Signal):
   [Intern: stress_proxy erhöht sich]
   "Alles klar. Heute lockerer Modus.
   Was brauchst du gerade?"
   [Coach wechselt intern zu Best Friend-Ton für diese Session]

3. User: "Danke. War ne harte Woche."
4. Buddy: "Ich sehe das — Recovery war diese Woche bei Ø 58.
   Das ist okay. Manchmal ist Aushalten auch eine Form von Stärke.
   Was wäre heute drin für dich — 20 Minuten leichtes Training?"
```

---

## Flow 9: Wöchentlicher Buddy-Review

```
Sonntag 20:00 (Heartbeat Checkpoint):

Buddy: "Dein Wochenreview:

✅ Training: 4 von 5 geplanten Workouts. 2 neue PRs.
✅ Protein: 6 von 7 Tagen über Ziel. Ø 181g.
⚠️ Schlaf: Ø 6.4h (Ziel: 7.5h) — das ist der größte Hebel.
📈 BSS: 71 (+4 vs letzte Woche). Du wirst stabiler.

Was mich am meisten beschäftigt: Schlaf.
Wenn du diese Woche 1 Stunde früher ins Bett gehst,
gehen die Gains nächste Woche 20% schneller.

Deal für diese Woche: Mo + Di + Mi vor 22:30 Uhr.
[Ja, Deal] [Zu früh für mich] [Erstmal drüber nachdenken]"
```

---

## Flow 10: Medical Safety Gate

```
1. User lädt Bluttest hoch (Vitamin D: 22 ng/ml)
2. Policy Gate prüft Response
3. LLM wollte schreiben: "Du hast einen Mangel, nimm 5000 IU D3 täglich."
4. Policy Gate: BLOCK + SAFE_REWRITE

5. Buddy:
   "Dein Vitamin D liegt bei 22 ng/ml. 
   Das liegt unter dem üblichen Referenzbereich (30–100 ng/ml).
   Bitte besprich das mit deinem Arzt.
   Wenn du nachtesten lässt: Vitamin D (25-OH), ggf. Calcium, PTH.
   Soll ich dich in 8 Wochen erinnern, nochmal zu testen?"

   [UI Card: Auffällige Blutwerte mit Referenzbereich]
   [safety_flags: ["medical_content"]]
   [Disclaimer Banner persistent]
```

---

## Flow 11: BSS Monatsreview

```
1. Nach 90 Tagen: BSS-Berechnung läuft (Cron)
2. BSS heute: 71 (Vormonat: 58, +13)
3. Heartbeat triggert: "Quartals-Milestone"

Buddy:
"3 Monate. Dein Stability Score ist von 58 auf 71 gestiegen.
Das heißt: du wirst konsistenter — nicht nur stärker, sondern stabiler.
Die Aussetzer werden kürzer, du kommst schneller zurück.
Vor 2 Monaten hat ein Rückfall 5 Tage gedauert. Jetzt 2.
Das ist der eigentliche Fortschritt."

[UI Chart: BSS 90-Tage Trend]
[UI Comparison: Bounceback Zeit Monat 1 vs 3]
[input_type: free_text — "Was war dein größter Moment diesen 3 Monaten?"]
```
