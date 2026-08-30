# ADR: Coach Permissions V1 — Granularität und Suggestions-Modell

**Datum:** April 2026 | **Status:** Final — V1 Entscheidung

> **Teilweise abgeloest, Stand 2026-08-30.**
>
> **E-11** legt Permissions je Modul und zweiwertig fest, nicht je
> Subfunktion. **E-29** verlangt fuer moduluebergreifende
> Coach-Zugriffe eine Funktion statt eines direkten Lesezugriffs;
> `coach.darf_nutrition_plan_aendern()` und `coach.offene_aktionen()`
> sind der gebaute Weg.
>
> **Was hier weiter gilt:** der Abschnitt zu Suggestions. Dazu sagt
> keine spaetere Entscheidung etwas.
>
> Gemessen in A-37 (Codex, 2026-08-30), vermerkt in C-357.

---

## Kontext

In LumeOS hat ein Human Coach Zugriff auf User-Daten um zu coachen. Die Frage war: Wie granular sind die Permissions, und was darf Coach direkt schreiben vs nur vorschlagen?

## Entscheidung

### Globale Regel

User kann pro Modul und Subfunktion freigeben oder sperren, was ein Coach sehen oder nutzen darf.

### Nutrition Permissions

```
nutrition.diary               → Diary lesen
nutrition.water               → Water-Logs lesen
nutrition.micronutrient       → Micronutrient Review lesen
nutrition.mealcam_images      → MealCam-Bilder lesen (separate Freigabe!)
nutrition.targets             → Nutrition Targets lesen
nutrition.custom_foods        → Custom Foods lesen
nutrition.recipes             → Rezepte lesen
nutrition.meal_plans          → Meal Plans lesen
nutrition.preferences         → Preferences lesen
```

Default: **keine Freigabe** — User muss aktiv freigeben.

### Was Coach DARF

```
Lesen von freigegebenen Bereichen
Suggestions erstellen (Vorschläge, keine direkten Änderungen)
```

### Was Coach NICHT DARF

```
Direkt in Nutrition-Tabellen schreiben
Preferences direkt ändern
Nutrition Targets direkt setzen
MealItems erstellen oder löschen
```

### Suggestions-Modell

Coach erzeugt Suggestions (Vorschläge) die User einzeln bestätigen muss:

```
nutrition_targets vorschlagen
meal_plan vorschlagen
food_alternative vorschlagen
water_goal vorschlagen
custom_food_correction vorschlagen
micronutrient_comment hinterlassen
mealcam_comment hinterlassen (wenn Bild freigegeben)
diary_item markieren (zur Prüfung)
preference vorschlagen
```

Jede Suggestion hat Status:
```
pending   → User hat noch nicht entschieden
accepted  → User hat angenommen
rejected  → User hat abgelehnt
expired   → TTL abgelaufen (Standard: 7 Tage)
```

### Audit

Alle Coach-Zugriffe und Suggestion-Aktionen werden auditierbar geloggt.
User kann Freigaben jederzeit widerrufen.
