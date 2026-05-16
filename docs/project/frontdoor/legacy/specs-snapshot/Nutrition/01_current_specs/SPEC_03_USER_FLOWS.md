# Nutrition Module — User Flows

> Spec Phase 3 | Alle primären User Flows

---

## Flow 1: Tägliches Meal Logging + Food Search

Der Haupt-Logging-Flow. Beinhaltet die vollständige Food-Search-Logik.

```
1. User öffnet Nutrition → Diary (heutiges Datum)
2. Tippt auf "+ Mahlzeit hinzufügen" oder auf einen Meal-Slot
3. Wählt Meal Type: Frühstück | Mittagessen | Abendessen | Snack | Pre/Post-Workout
4. Food Search öffnet sich
```

### Food Search Interface

Die Search-Oberfläche hat folgende Bereiche:

**Schnellzugriff-Buttons (oben, immer sichtbar):**

```
[Meist genutzt]  [Eigene Foods]  [Wie gestern]  [Aus Mealplan]
```

- **Meist genutzt** — Zeigt die 10 am häufigsten geloggten Foods des Users (nach Häufigkeit sortiert)
- **Eigene Foods** — Zeigt alle Custom Foods des Users ohne Suchbegriff
- **Wie gestern** — Öffnet gestrigen Tag zur Auswahl: ganzen Tag kopieren oder einzelne Mahlzeiten auswählen
- **Aus Mealplan** — Zeigt Foods aus vergangenen aktiven Plänen zum Wiederverwenden

**Suchfeld:**

```
🔍 [Suchbegriff eingeben...]         [Smart Search ⚡] [Filter ▼]
```

- Tippen triggert Suche mit pg_trgm (Debounce 300ms)
- Smart Search Toggle: filtert nach User-Preferences wenn aktiviert
- Filter-Dropdown öffnet Filteroptionen

**Filter-Panel (erweiterbar):**

```
Kategorie:      [Alle] [Fleisch] [Fisch] [Milch] [Eier] [Getreide]
                [Gemüse] [Obst] [Hülsenfrüchte] [Nüsse] [Fette]
                [Fertiggerichte] ... (alle L1-Kategorien als Chips)

Sub-Kategorie:  Erscheint wenn L1 gewählt — zeigt L2-Kategorien als Chips

Diät:           [Vegetarisch] [Vegan] [Low-Carb] [Keto] [High-Protein]

Sortierung:     [Relevanz ✓] [Protein ↓] [Kalorien ↑] [Name A-Z]
```

**Suchergebnisse:**

- Custom Foods des Users → immer zuerst (eigene Section: "Meine Foods")
- BLS Foods → nach Relevanz (sort_weight + Text-Matching)
- Jede Food-Karte zeigt: Name, kcal/100g, Protein g · Carbs g · Fat g
- Tap auf Card → Mengen-Eingabe

**Mengen-Eingabe:**

```
  Hähnchenbrust (roh)
  ─────────────────────
  Menge:  [200] g

  Portionen: [1 Stück (~120g)] [1 Brust (~150g)]

  Nährstoffe bei 200g:
  218 kcal · 46g Protein · 3.4g Fett · 0g KH

  [Hinzufügen]
```

**Flow-Abschluss:**

```
5. Menge eingeben (g oder Portion)
6. "Hinzufügen" → MealItem erstellt, Nährstoffe eingefroren (alle Makros + alle Mikros)
7. Weitere Foods hinzufügen oder Suche schließen
8. Macro Dashboard und Daily Score aktualisieren sich live
```

**Quick-Add Makros (Fallback ohne Food-Suche)**:Direkte Eingabe von kcal + Protein wenn User kein spezifisches Food suchen möchte. Erstellt MealItem ohne Food-Referenz, nur Makro-Werte, keine Mikros.

---

## Flow 2: MealCam — Foto-Logging (ohne Plan)

```
1. User tippt MealCam-Icon im Diary
2. Kamera öffnet sich (oder Foto-Upload aus Galerie)
3. Foto → Claude Vision API

4. Confidence ≥ 0.85 (AUTO_ACCEPT):
   → Erkannte Foods direkt als Vorschlag
   → User kann Mengen anpassen
   → "Hinzufügen" → MealItems erstellt

   Confidence 0.50–0.84 (SUGGEST):
   → Kandidaten-Liste mit %-Confidence
   → User wählt den richtigen aus
   → Menge anpassen → Bestätigen

   Confidence 0.30–0.49 (LOW):
   → "Meintest du...?" mit Alternativen
   → Oder: manuelle Suche

   Confidence < 0.30 (REJECT):
   → "Nicht erkannt"
   → Weiter zur manuellen Food Search (Flow 1)

5. User kann einzelne erkannte Items korrigieren/ergänzen
6. Unbekannte Foods → Custom Food erstellen (Flow 7)
```

---

## Flow 3: Meal Plan Aktivierung

```
1. User navigiert zu "Meal Plans"
2. Übersicht zeigt alle verfügbaren Pläne:
   - Eigene (source: user) — ohne Label
   - Vom Coach (source: coach) — "Von [Coach-Name]"
   - Marketplace (source: marketplace) — "Gekauft: [Produkt-Name]"
   - Von Buddy (source: buddy) — "Erstellt von Buddy"

3. Tap auf Plan → Plan-Vorschau:
   - Name, Beschreibung, Kalorien-Ziel/Tag, Dauer
   - Tages-Preview: Tag 1, Tag 2, ... (zusammengeklappt, expandierbar)

4. "Plan aktivieren"

5. Startdatum wählen (Default: morgen, max. 7 Tage im Voraus)

6. Lifecycle wählen:
   ┌────────────────────────────────────────────┐
   │ ○ Einmalig — endet nach X Tagen            │
   │ ○ Wiederholend — startet automatisch neu   │
   │ ○ Gefolgt von... → Plan-Picker             │
   └────────────────────────────────────────────┘

7. Bestätigen → status: active
   - Bestehender aktiver Plan → status: paused
   - Ab Startdatum: Ghost Entries erscheinen im Diary
```

---

## Flow 4: Ghost Entry bestätigen (MealCam oder manuell)

### Kontext

Aktiver Plan → Ghost Entries im Diary (gestrichelte Umrandung, andere Farbe). Jeder Ghost Entry zeigt: Meal Type, geplante Foods, Plan-Gesamtkalorien.

Ghost Entries haben **kein automatisches Expiry**. User entscheidet jederzeit — auch retroaktiv für vergangene Tage.

---

### Case 1: Bestätigung via MealCam

```
1. User öffnet Ghost Entry
2. Tippt "MealCam scannen"
3. Foto → Claude Vision

4. System vergleicht erkannte Foods mit Plan:
   ┌──────────────────────────────────────────────────────┐
   │ Hähnchenbrust 200g (geplant) — erkannt 180g → Match  │
   │   [200g beibehalten] [auf 180g ändern]               │
   │                                                      │
   │ Reis 150g (geplant) — erkannt 200g → Abweichung      │
   │   Menge: [200] g  [Bestätigen]                       │
   │                                                      │
   │ Brokkoli 100g (geplant) — NICHT erkannt              │
   │   [Trotzdem hinzufügen 100g] [Weglassen]             │
   │                                                      │
   │ Pommes — erkannt, NICHT im Plan (+380 kcal)          │
   │   [Hinzufügen] [Ignorieren]                          │
   └──────────────────────────────────────────────────────┘

5. User löst jeden Punkt auf
6. Mahlzeit wird erstellt (Meal + MealItems mit eingefrorenen Nährstoffen)
7. Ghost Entry → confirmed (oder deviated wenn Δkcal > 20%)
8. MealPlanLog wird geschrieben
```

---

### Case 2: Manuelle Bestätigung

```
1. User öffnet Ghost Entry
2. Tippt "Bestätigen"

3. Plan-Vorschlag mit Mengen:
   ┌────────────────────────────────────────────────────┐
   │ Mittagessen — Plan-Vorschlag                       │
   ├────────────────────────────────────────────────────┤
   │ ● Hähnchenbrust    200g   218 kcal  46g P          │
   │ ● Reis gekocht     150g   174 kcal   3g P          │
   │ ● Brokkoli         100g    34 kcal   3g P          │
   ├────────────────────────────────────────────────────┤
   │ Gesamt: 426 kcal · 52g Protein                     │
   └────────────────────────────────────────────────────┘

4a. "Stimmt so" → Mahlzeit direkt erstellt mit Plan-Mengen
    Status: confirmed

4b. "Mengen anpassen" → Jedes Item bekommt Eingabefeld:
    ● Hähnchenbrust  [200] g
    ● Reis           [120] g  ← geändert
    ● Brokkoli       [100] g
    [+ Food hinzufügen]
    → Bestätigen → Status: deviated wenn Δkcal > 20%

5. MealPlanLog wird geschrieben
```

---

### Ghost Entry überspringen

```
1. User öffnet Ghost Entry → "Überspringen"
2. Kurze Bestätigung
3. Status → skipped, Ghost Entry ausgegraut
```

---

### Ghost Entry retroaktiv bestätigen (vergangene Tage)

```
1. User navigiert zu einem vergangenen Datum im Diary
2. Offene Ghost Entries sind sichtbar (ausgegraut, aber interaktiv)
3. Tap → gleicher Bestätigungs-Flow wie heute (Case 1 oder 2)
4. Bestätigung mit originalem execution_date, confirmed_at = jetzt
5. MealPlanLog und Daily Summary werden aktualisiert
```

---

## Flow 5: Water Logging

```
1. Water-Widget im Diary (Fortschrittsbalken) oder eigene Page
2. Aktueller Stand: "1.200 / 2.800 ml  43%"
3. Quick-Add: [250ml] [500ml] [750ml] [1L]
4. Custom: Eingabefeld + "Hinzufügen"
5. Log-Liste mit Uhrzeit, Löschen via Swipe
```

---

## Flow 6: Custom Food erstellen

```
1. Aus Food Search: kein Ergebnis → "Selbst anlegen"
   ODER: Barcode-Scan → nicht gefunden → "Custom erstellen"
   ODER: direkt über "+ Eigenes Food" Button

2. Formular:
   Name (Pflicht, DE)
   Name EN, Name TH (optional)
   Barcode (auto-gefüllt wenn via Scan, sonst optional)
   Marke (optional)
   Portionsgröße + Bezeichnung

   Makros (Pflicht):
     Kalorien (kcal), Protein, Kohlenhydrate, Fett

   Makros (optional):
     Zucker, Ballaststoffe, Salz, gesättigte Fette

   Mikros (optional — für Profis):
     Erweiterbar via "Mikronährstoffe hinzufügen"

3. Speichern → nutrition.foods_custom
4. Sofort in Search unter "Meine Foods" verfügbar
```

---

## Flow 7: Rezept erstellen + als Mahlzeit loggen

```
1. Rezept-Bereich → "Neues Rezept"
2. Name, Portionen, optional: Beschreibung, Zeiten, Anleitung
3. Zutaten hinzufügen via Food Search:
   - Food suchen → Menge in g eingeben
   - Mehrere Zutaten sammeln
   - Live-Preview: Gesamt + pro Portion (Makros + kcal)
4. Speichern

5. Rezept loggen:
   → "Als Mahlzeit loggen"
   → Anzahl Portionen wählen
   → Meal Type wählen
   → Bestätigen → Meal + MealItems (eine Zeile pro Zutat, Nährstoffe eingefroren)
```

---

## Flow 8: Einkaufsliste aus Rezept generieren

```
1. Rezept öffnen → "Einkaufsliste erstellen"
2. Portionen wählen (wie viele Portionen sollen eingekauft werden?)
   Standard: Rezept-Portionen (z.B. 4)
3. Generieren → ShoppingList mit ShoppingListItems (Food-Name + Menge skaliert)
4. Einkaufsliste anzeigen:
   ┌────────────────────────────────────┐
   │ Protein Meal Prep (4 Portionen)    │
   ├────────────────────────────────────┤
   │ ☐ Hähnchenbrust      800g          │
   │ ☐ Reis               600g          │
   │ ☐ Brokkoli           400g          │
   │ ☐ Olivenöl            40ml         │
   └────────────────────────────────────┘
5. Items abhaken via Tap (is_checked Toggle)
6. Teilen / Exportieren möglich
```

---

## Flow 9: Food Preferences setzen

```
1. Nutrition → Einstellungen → Ernährungspräferenzen

2. Diät-Typ:
   [Omnivor] [Vegetarisch] [Vegan] [Pescatarisch]
   [Keto] [Paleo] [Mediterran] [Carnivore] [Custom]

3. Allergien:
   Chips: [Gluten] [Milch] [Eier] [Nüsse] [Erdnüsse]
          [Fisch] [Schalentiere] [Soja] [Sesam] + weitere
   → Allergene werden aus Smart Search hart ausgeschlossen

4. Likes / Dislikes:
   Food Search → Tip auf Food → [👍 Mag ich] [👎 Mag ich nicht]
   Kategorie → [👍] [👎]
   Tag → [👍] [👎]

5. Weitere Optionen:
   Kochskill: [Anfänger] [Mittel] [Fortgeschritten]
   Max. Zubereitungszeit: [15min] [30min] [60min] [Keine]
   Budget: [Günstig] [Mittel] [Premium] [Egal]

6. Speichern → sofort aktiv in Smart Search + Buddy-Kontext
```

---

## Flow 10: Tages-Zusammenfassung

```
1. Öffnet sich abends automatisch via Buddy-Push, oder manuell
2. Anzeige:
   - Makro-Compliance: Kalorien / Protein / Carbs / Fat / Fiber (% von Target)
   - Nutrition Score 0–100 (ok/warn/block)
   - Mikro-Flags: welche Nährstoffe unter Ziel (Tier 1 immer, Tier 2+ je nach Level)
   - Bei aktivem Plan: Plan-Compliance (X von Y bestätigt/übersprungen/offen)
3. Buddy-Empfehlung: "4g Protein noch offen — kleiner Casein-Shake?"
4. "Abschliessen" oder Tag weiter offen lassen (kein Zwang)
```

---

## Flow 11–13: Meal Plan Lifecycle (once / rollover / sequence)

**Flow 11 — Lifecycle-Wahl:** Beim Aktivieren (Flow 3, Schritt 6) wählt User:

- `once`: Plan endet nach days_count Tagen → `completed`
- `rollover`: Nach Ablauf → Day 1 startet neu, rollover_count++
- `sequence`: Nach Ablauf → next_plan_id wird automatisch aktiviert (vorab bestätigt)

**Flow 12 — Rollover:** Tag N endet → start_date + N, Buddy informiert.

**Flow 13 — Sequence:** Plan A endet → Plan B startet morgen, kein User-Eingriff.

---

## Flow 14: Pending Actions (TODO-System)

```
GET /api/nutrition/pending-actions

Response:
{
  "date": "2026-04-15",
  "pending": [
    {
      "type": "meal_confirm",
      "priority": "high",
      "label": "Mittagessen bestätigen",
      "plan_item_id": "uuid",
      "meal_type": "lunch",
      "scheduled_time": "12:00",
      "action_url": "/nutrition/diary?confirm=uuid"
    },
    {
      "type": "water_reminder",
      "priority": "normal",
      "label": "Noch 800ml bis Tagesziel",
      "current_ml": 2000,
      "target_ml": 2800,
      "action_url": "/nutrition/water"
    }
  ]
}
```

Erscheint in Buddy's Tages-TODO-Liste aggregiert mit allen anderen Modulen.

**Was in pending-actions erscheint:**

- Ghost Entries mit `status: pending` für heute
- Water Target &lt; 80% nach 18:00 Uhr
- Keine Mahlzeit geloggt vor 14:00 Uhr

**Was NICHT erscheint:**

- Vergangene pending Entries alter Tage (die bleiben im Diary sichtbar, aber nicht als Push)
- Bereits bestätigte oder übersprungene Items
