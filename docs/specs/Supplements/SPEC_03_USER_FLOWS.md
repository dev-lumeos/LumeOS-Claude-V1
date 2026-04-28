# Supplements Module — User Flows
> Spec Phase 3 | Alle primären User Flows

---

## Flow 1: Supplement suchen + zu Stack hinzufügen

```
1. Tab "Supplements" → "Catalog" oder "+ Hinzufügen"
2. Suchfeld: Name eingeben (z.B. "Vitamin D")
3. Ergebnisliste (sortiert nach evidence_grade: S zuerst):
   ┌────────────────────────────────────────┐
   │ Vitamin D3 (Cholecalciferol)           │
   │ Vitamins · Evidence: ★★★★★ (S)        │
   │ 2.000–5.000 IU täglich · mit Fett     │
   │ [+ Zum Stack]                          │
   ├────────────────────────────────────────┤
   │ Vitamin D2 (Ergocalciferol)            │
   │ Vitamins · Evidence: ★★★☆☆ (B)        │
   └────────────────────────────────────────┘

4. Supplement-Detail öffnen:
   - Name + Kategorie + Evidence Grade (visuell prominent)
   - Evidence-Zusammenfassung
   - Empfohlene Dosierung + Timing
   - Absorption-Hinweise ("Mit fetthaltiger Mahlzeit")
   - Bekannte Interactions aus aktuellem Stack
   - Nutri-Gap: "Dir fehlen X IU aus deinem Food Log"
   - Benefits-Liste

5. [+ Zum Stack hinzufügen] → Konfiguration:
   ┌────────────────────────────────────────┐
   │ Vitamin D3 zum Stack hinzufügen        │
   │                                        │
   │ Dosis: [3000] [IU ▾]                  │
   │ Timing: [Mittagessen ▾]               │
   │ Frequenz: [Täglich ▾]                 │
   │ Custom Name: [optional]               │
   │ Notizen: [optional]                   │
   │                                        │
   │ ⚠️ Interaction check läuft...          │
   │ ✅ Keine Konflikte gefunden            │
   │                                        │
   │ [Hinzufügen]                          │
   └────────────────────────────────────────┘

6. Item wird zu aktivem Stack hinzugefügt
7. Interaction Check läuft automatisch für gesamten Stack
```

---

## Flow 2: Stack erstellen + aktivieren

```
1. Tab "Stacks" → "+ Neuer Stack"
2. Name eingeben: "Bulk Stack"
3. Ziel wählen: Muskelaufbau | Fat Loss | Recovery | Health | Longevity | Custom
4. Optionale Template-Empfehlung:
   "Basierend auf deinem Ziel: Muskelaufbau"
   → "Empfohlener Starter-Stack: Creatine + Vitamin D + Omega-3 + Magnesium"
   [Template übernehmen] oder [Von Grund auf erstellen]
5. Stack ist erstellt, Items können hinzugefügt werden (Flow 1)

6. Stack aktivieren:
   → [Stack aktivieren] Button
   → Bestätigung: "Dieser Stack wird zum aktiven Stack.
      Dein bisheriger aktiver Stack wird pausiert."
   → Bestätigen
   → Aktueller Stack → is_active = false
   → Neuer Stack → is_active = true
   → Daily Intake für morgen wird automatisch vorbereitet
```

---

## Flow 3: Daily Intake — Tägliche Einnahme

```
1. Home Widget oder Tab "Today"
2. Einnahme-Liste für heute (nach Timing-Slots gruppiert):

   ┌────────────────────────────────────────┐
   │ 🌅 Morgens                             │
   │ ☐ Vitamin D3   3.000 IU  [✓ Nehmen]   │
   │ ☐ Omega-3      2g EPA+DHA [✓ Nehmen]   │
   │ ☐ Magnesium    400mg     [✓ Nehmen]    │
   ├────────────────────────────────────────┤
   │ 💪 Pre-Workout                         │
   │ ☐ Creatine     5g        [✓ Nehmen]    │
   │ ☐ Caffeine     200mg     [✓ Nehmen]    │
   ├────────────────────────────────────────┤
   │ 🌙 Abends                              │
   │ ☐ Zinc         15mg      [✓ Nehmen]    │
   └────────────────────────────────────────┘

3. [✓ Nehmen] Tap → IntakeLog status = 'taken', taken_at = now()
   Oder [✗ Überspringen] → status = 'skipped'
   Oder [⏰ Später] → status = 'snoozed' + Reminder

4. Compliance Fortschrittsbalken aktualisiert sich live:
   "6 von 8 genommen (75%) ✅"

5. Am Ende des Tages: Compliance → Goals Modul
```

---

## Flow 4: Interaction Check (automatisch)

```
Auslöser: Supplement zu Stack hinzufügen ODER Stack aktivieren

1. System lädt alle supplement_ids aus aktivem Stack
2. Query: alle Interactions wo BEIDE Supplements im Stack sind
3. Ergebnis wird nach Severity sortiert

   Bei keinen Problemen:
   ✅ "Keine kritischen Interactions gefunden"

   Bei Problemen:
   ┌────────────────────────────────────────────────────────┐
   │ ⚠️ Interaction gefunden                                │
   │                                                        │
   │ 🔴 KRITISCH: St. John's Wort + SSRIs                  │
   │    "Serotonin-Syndrom Risiko — nicht kombinieren"      │
   │    [Supplement entfernen] [Trotzdem behalten (Risiko)] │
   │                                                        │
   │ 🟡 WARNUNG: Calcium + Iron                            │
   │    "Calcium blockiert Eisenaufnahme — 2h Abstand"      │
   │    [Timing anpassen] [Verstanden]                      │
   │                                                        │
   │ ✅ SYNERGIE: Vitamin D + K2                           │
   │    "Empfohlen: zusammen einnehmen für Calcium-Routing" │
   └────────────────────────────────────────────────────────┘

4. User löst jeden Punkt auf
5. Critical = Einnahme gesperrt bis User explizit handelt
```

---

## Flow 5: Gap Analysis (Nutrition → Supplements)

```
1. Supplements → "Intelligenz" → "Nährstoff-Lücken"
   ODER Buddy empfiehlt automatisch

2. System holt Nutrition Summary für heute/letzte 7 Tage
3. Vergleicht mit RDA-Werten

   ┌────────────────────────────────────────────────────────┐
   │ Nährstoff-Lücken — Letzte 7 Tage                     │
   ├────────────────────────────────────────────────────────┤
   │ 🔴 Vitamin D: ∅ 420 IU/Tag (Ziel: 800+ IU)           │
   │    Stack: ✅ Vitamin D3 3.000 IU deckt das ab         │
   │                                                        │
   │ 🟡 Magnesium: ∅ 245mg/Tag (Ziel: 420mg)              │
   │    Stack: Magnesium nicht vorhanden                    │
   │    → [Magnesium hinzufügen] [Ignorieren]              │
   │                                                        │
   │ 🟡 Omega-3: ∅ 0.4g/Tag (Ziel: 1.6g+)                │
   │    Stack: Omega-3 2g ✅                               │
   │                                                        │
   │ ✅ Vitamin C: 112mg/Tag (✅ ausreichend)              │
   └────────────────────────────────────────────────────────┘

4. [Hinzufügen]-Buttons führen direkt zu Flow 1
```

---

## Flow 6: Redundancy Detection

```
1. Supplements → "Intelligenz" → "Redundanzen"

   ┌────────────────────────────────────────────────────────┐
   │ ⚠️ Überschneidungen im Stack                          │
   │                                                        │
   │ Magnesium (3 Quellen):                                 │
   │   • Magnesium Glycinat 400mg                          │
   │   • Multivitamin (enthält 100mg Mg)                   │
   │   • ZMA (enthält 450mg Mg)                            │
   │   Gesamt: 950mg = 226% RDA                            │
   │   → [ZMA entfernen] [Dosis reduzieren] [Ignorieren]   │
   │                                                        │
   │ Vitamin C (2 Quellen):                                 │
   │   • Vitamin C 500mg                                    │
   │   • Multivitamin (enthält 60mg C)                     │
   │   Gesamt: 560mg — akzeptabel                          │
   └────────────────────────────────────────────────────────┘
```

---

## Flow 7: Training-Aware Stack (automatisch)

```
Wenn: Training-Modul meldet heutigen Workout-Typ

Flow:
1. System empfängt Workout-Info (Leg Day / Push Day / Rest Day)
2. Analysiert Stack Items nach Timing = 'pre_workout' oder 'post_workout'
3. Erstellt Training-Context in für-Buddy Response:

   "Heute: Leg Day 🦵"
   ┌────────────────────┐
   │ Pre-Workout Stack: │
   │ • Creatine 5g      │
   │ • Caffeine 200mg   │
   │ • Beta-Alanine 3g  │
   ├────────────────────┤
   │ Post-Workout Stack:│
   │ • Magnesium 400mg  │
   └────────────────────┘

   "Rest Day → Pre-Workout Items heute weglassen?"
   [✓ Überspringen] [Trotzdem nehmen]
```

---

## Flow 8: Inventory tracken

```
1. Supplements → "Inventory"
2. Liste aller Produkte mit Bestand:
   ┌────────────────────────────────────────────────────────┐
   │ Vitamin D3 (Now Foods)                                 │
   │ 📦 Bestand: 67 Kapseln (ca. 22 Tage)                  │
   │ Ablauf: Jun 2027 ✅                                    │
   ├────────────────────────────────────────────────────────┤
   │ Omega-3 (Strath)                                       │
   │ ⚠️ Bestand: 8 Kapseln (ca. 4 Tage) — LOW STOCK        │
   │ [Nachbestellen] [Bestand aktualisieren]                │
   └────────────────────────────────────────────────────────┘

3. [Bestand aktualisieren] → neue Packung eingeben
4. [Nachbestellen] → Affiliate-Link oder Marketplace
```

---

## Flow 9: Enhanced Mode aktivieren

```
1. Supplements → Einstellungen → "Enhanced Mode"
2. Warnung-Screen:
   ┌────────────────────────────────────────────────────────┐
   │ ⚠️ Enhanced Mode                                      │
   │                                                        │
   │ Dieser Bereich enthält Informationen zu leistungs-    │
   │ steigernden Substanzen (PEDs). Diese sind in vielen   │
   │ Ländern ohne ärztliche Verschreibung illegal.          │
   │                                                        │
   │ LumeOS bietet diese Informationen nur zu Harm-        │
   │ Reduction Zwecken an und unterstützt, empfiehlt oder  │
   │ fördert die Verwendung nicht.                          │
   │                                                        │
   │ Ich bin 18+ Jahre alt und akzeptiere die Bedingungen. │
   │ [✓ Bestätigen + Enhanced Mode aktivieren]             │
   │ [Zurück]                                              │
   └────────────────────────────────────────────────────────┘

3. Nach Aktivierung: Enhanced Substances in separatem Tab sichtbar
4. Enhanced Stack-Items in separater Sektion
5. Enhanced Intake Logs getrennt von Standard
```

---

## Flow 10: Pending Actions (Buddy-TODO)

```
GET /api/supplements/pending-actions

Auslöser:
- Intake-Log status = 'pending' für fällige Timing-Slots (nach Uhrzeit)
- Low-Stock Alert (Bestand < Schwelle)
- Interaction Warning nicht aufgelöst
- Cycling: heute ist "Off"-Tag aber User hat genommen (oder umgekehrt)

Response:
{
  "pending": [
    {
      "type": "take_supplement",
      "label": "Magnesium 400mg (Abends) noch ausstehend",
      "stack_item_id": "uuid",
      "timing": "evening",
      "action_url": "/supplements/today"
    },
    {
      "type": "low_stock",
      "label": "Omega-3: nur noch 4 Tage Vorrat",
      "inventory_id": "uuid",
      "action_url": "/supplements/inventory"
    }
  ]
}
```
