# Recovery Module — User Flows
> Spec Phase 3 | Alle primären User Flows

---

## Flow 1: Morning Check-in (Kern-Flow)

Der wichtigste Flow. Täglich, <30 Sekunden.

```
1. Home-Screen: Wenn noch kein Checkin heute →
   Prominenter Banner: "Guten Morgen! Wie hast du geschlafen? ☀️"
   [Jetzt eintragen]

2. Morning Check-in Screen:
   ┌────────────────────────────────────────┐
   │ 😴 Schlaf                              │
   │ Stunden:  [====●=====] 7.5h            │
   │ Qualität: 😫●──────🤩  [8]             │
   │                                        │
   │ 🫁 Wie fühlst du dich heute?           │
   │ Energie:  😴●──────⚡  [7]             │
   │                                        │
   │ 💪 Muskelkater                         │
   │ [Body Map — klickbar]                  │
   │   Brust: ○ ● ○ ○    (1 = leicht)      │
   │   Beine: ○ ○ ○ ●    (3 = stark)       │
   │                                        │
   │ 🙂 Stimmung                            │
   │ [💪] [😊] [😐] [😩] [🤒]              │
   │       ^ gewählt                        │
   │                                        │
   │ [Speichern →]                          │
   └────────────────────────────────────────┘

3. Speichern → UPSERT recovery_checkins
4. Recovery Score wird berechnet (async)
5. Recovery Score Screen erscheint
```

---

## Flow 2: Recovery Score anzeigen

```
1. Tab "Recovery" → Haupt-Screen
2. Recovery Score Card:
   ┌────────────────────────────────────────┐
   │ Recovery Score  heute                  │
   │         78                             │
   │      ●────────                         │
   │       GUT                             │
   │                                        │
   │ 🏋️ Empfehlung: Normales Training       │
   │ "Heute ideal für Push Day"             │
   ├────────────────────────────────────────┤
   │ Komponenten:                           │
   │ Schlaf     ████████░░  8/10            │
   │ Empfinden  ███████░░░  7/10            │
   │ Kater      █████░░░░░  mittel          │
   │ Training   ████████░░  gut             │
   │ Ernährung  ██████░░░░  ok              │
   └────────────────────────────────────────┘

3. Trend-Karte (7-Tage):
   │ ▂▅▇▆▅▇█ │
   │ Mo–So   │
   └─────────┘

4. Für mehr Details → [Score-Details öffnen]
   Vollständige Komponenten-Aufschlüsselung
```

---

## Flow 3: Muscle Recovery Map

```
1. Tab "Recovery" → Sub-Tab "Muskeln"
2. Body Map (anterior + posterior):

   ┌────────────────────────────────────────┐
   │  VORNE           HINTEN               │
   │  🟢 Schultern    🟡 Trapez            │
   │  🟢 Brust        🟢 Oberer Rücken     │
   │  🟢 Bizeps       🔴 Lats (65%)        │
   │  🟡 Abs          🟡 Unterer Rücken    │
   │  🔴 Quads (47%)  🔴 Hamstrings (52%)  │
   │  🟢 Waden        🟢 Gesäß             │
   └────────────────────────────────────────┘

   Legende: 🟢 >80% (ready) · 🟡 50-80% · 🔴 <50% (nicht ready)

3. Tap auf Muskelgruppe → Detail-Modal:
   ┌────────────────────────────────────────┐
   │ Quadrizeps  47%                        │
   │ ████░░░░░░  Noch erholt sich           │
   │                                        │
   │ Letztes Training: vor 28h              │
   │ 16 Sätze · 4.800 kg Volumen            │
   │                                        │
   │ Erwartet bereit in: ca. 20h            │
   │                                        │
   │ Modifikatoren:                         │
   │ Schlaf (gestern): 7.5h ✅              │
   │ Protein: 180g ✅                       │
   │ Soreness: 3/3 😫                       │
   │                                        │
   │ Empfehlung: Heute KEIN Leg Day          │
   └────────────────────────────────────────┘

4. "Heute ideal"-Empfehlung basierend auf Recovery Map:
   "Ideal heute: Push Day (Chest/Shoulders/Triceps alle >85%)"
```

---

## Flow 4: HRV messen (Phone Camera)

```
1. Tab "Recovery" → "HRV messen" Button
2. Instructions:
   "Zeigefinger sanft auf die hintere Kameralinse legen.
    Flashlight leuchtet automatisch. 60 Sekunden still halten."
3. Messung startet:
   [•••••••••◐◑◑◑◑◑◑◑◑◑] 60s
4. Ergebnis:
   ┌────────────────────────────────────────┐
   │ HRV heute         RMSSD: 42.3 ms       │
   │                                        │
   │ Deine Baseline:   38.5 ms (30-Tage Ø) │
   │ Heute:            42.3 ms  ↑ +10%     │
   │ Status:           ✅ Über Baseline     │
   │                                        │
   │ Impact auf Recovery Score: +8 Punkte  │
   └────────────────────────────────────────┘

   [Zu Checkin hinzufügen]
```

---

## Flow 5: Recovery Modality loggen

```
1. Tab "Recovery" → "Aktivität loggen" oder "+ Recovery"
2. Modalität wählen:
   [🧖 Sauna] [🧊 Cold Plunge] [💆 Massage]
   [🧘 Stretch] [🌬️ Atem] [💤 Nap] [🚶 Active]

3. Details eingeben (je nach Typ):
   Sauna:
     Dauer: [20] min
     Temperatur: [80] °C
     Feucht/Trocken: [●Trocken] [○Feucht]
     Sofort-Gefühl: ████████ 8/10

   Massage:
     Typ: [Deep Tissue ▾]
     Dauer: [60] min
     Kosten: [€80]
     Therapeut: [optional]
     Sofort-Gefühl: ████████░ 8/10

4. Speichern → Modality Bonus sofort sichtbar
   "+2.0 Punkte Recovery Score"

5. Next-Day Impact (optional, nächster Morgen):
   "Wie hat sich die gestrige Sauna-Session angefühlt?"
   [████████ 8/10] Nächster-Tag-Rating
```

---

## Flow 6: Recovery Trend & Insights

```
1. Tab "Recovery" → "Insights"
2. Trend-Charts:
   - 7-Tage Verlauf Recovery Score (Linien-Chart)
   - Schlafqualität Trend
   - HRV Trend vs. Baseline

3. Pattern Insights:
   ┌────────────────────────────────────────────┐
   │ 💡 Erkannte Muster                        │
   │                                            │
   │ ✅ Dein Score ist Di + Do am höchsten      │
   │ ⚠️ Wenig Schlaf (< 7h) → Score -18 Punkte │
   │ 💪 Sauna → avg. +2.3 Punkte nächsten Tag  │
   │ 🍗 Protein > 160g → Recovery +12%         │
   └────────────────────────────────────────────┘

4. Modality Effectiveness Ranking:
   1. Massage         +3.2 Punkte Ø
   2. Cold Plunge     +2.8 Punkte Ø
   3. Sauna           +2.3 Punkte Ø
   4. Meditation      +1.4 Punkte Ø
```

---

## Flow 7: Übertraining Alert

```
1. System erkennt: 3+ Signale über mehrere Tage
2. Notification + Banner:
   ┌────────────────────────────────────────┐
   │ ⚠️ Übertraining Risiko — Moderat       │
   │                                        │
   │ 4 Warnsignale erkannt:                 │
   │ • Recovery Score < 60 (3 Tage)        │
   │ • HRV 12% unter Baseline              │
   │ • Soreness hoch (Rücken, Beine)       │
   │ • Subjektive Erschöpfung ≤4/10        │
   │                                        │
   │ Empfehlung:                            │
   │ • 1–2 Rest Days                        │
   │ • Training-Volumen -30%               │
   │ • Mehr Protein + Kalorien             │
   │ • Sauna / Massage empfohlen           │
   │                                        │
   │ [Deload-Protokoll starten]             │
   │ [Verstanden, weiter trainieren]        │
   └────────────────────────────────────────┘

3. Bei "Critical" (7+ Signale):
   Pflicht-Bestätigung + Arzt-Empfehlung
```

---

## Flow 8: Deload Protokoll starten

```
1. Via Übertraining Alert ODER manuell via Tab "Protokolle"
2. Protokoll-Auswahl:
   - Aktive Erholung (Light Cardio, Yoga, 7 Tage)
   - Passive Deload (Volumen -50%, 7 Tage)
   - Intensiver Deload (Rest + Recovery Modalities, 3–5 Tage)
   - Custom (eigene Konfiguration)

3. Protokoll aktivieren:
   → Zeigt Daily Tasks in Tab "Heute" (wie Ghost Entries bei Nutrition)
   → Training-Modul wird informiert (Deload aktiv)
   → Buddy gibt täglich Protokoll-Reminder

4. Protokoll-Compliance tracken:
   X/7 Tage abgeschlossen
```

---

## Flow 9: Wearable verbinden

```
1. Einstellungen → "Datenquellen"
2. Verfügbare Quellen:
   [🍎 Apple Health] [🤖 Google Health] [O Oura] [W WHOOP] [⌚ Garmin]

3. Apple Health verbinden:
   → iOS Permission Dialog: "Lumeos möchte auf HealthKit zugreifen"
   → Bereiche: Schlaf, HRV, Herzrate, Schritte
   → [Erlauben]
   → Auto-Sync alle 15 Min im Hintergrund

4. Bei bestehender Verbindung:
   Letzte Sync: vor 12 Min
   [Jetzt synchronisieren]
   Sync-Statistik: 30 Tage · 178 Datenpunkte
```

---

## Flow 10: Pending Actions

```
GET /api/recovery/pending-actions

Auslöser:
- Kein Morning Check-in heute (nach 10 Uhr)
- Ungelöste Übertraining-Alerts
- Protokoll: heute ausstehende Aktivität

Response:
{
  "pending": [
    {
      "type": "morning_checkin",
      "priority": "high",
      "label": "Morning Check-in noch ausstehend",
      "action_url": "/recovery/checkin"
    },
    {
      "type": "overtraining_alert",
      "priority": "high",
      "label": "⚠️ Übertraining-Risiko nicht bestätigt",
      "alert_id": "uuid",
      "action_url": "/recovery/alerts"
    }
  ]
}
```
