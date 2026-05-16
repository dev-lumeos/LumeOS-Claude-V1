# Nutrition Module — Offene Punkte, Bugs & Geplante Features

Alle TODOs, Bugs und offene Fragen aus den alten Dokumenten — konsolidiert und priorisiert.

---

## 🔴 Kritische Bugs

### Bug 1: Custom Foods Route 500-Error
**Problem:** `GET /api/nutrition/foods/custom` gibt 500 zurück, weil der `:id`-Parameter-Handler den String "custom" als UUID zu parsen versucht.

**Ursache:** In `routes/foods.ts` ist die Route `GET /foods/:id` vor der Route `GET /custom-foods` gemounted, sodass "custom" als UUID-Wert behandelt wird.

**Fix:** Route-Reihenfolge in `server.ts` anpassen — Smart Search und Custom Foods müssen **vor** dem generellen `/:id`-Handler gemounted werden.

```typescript
// FALSCH: /:id fängt "custom"
app.route('/foods', foodsRouter);
app.route('/foods/custom', customFoodsRouter); // nie erreicht

// RICHTIG:
app.route('/foods/custom', customFoodsRouter); // zuerst
app.route('/foods', foodsRouter);              // danach
```

---

### Bug 2: Micro-Dashboard zeigt 0-Werte
**Problem:** `MicroDashboard.tsx` zeigt für viele Mikronährstoffe 0 an, obwohl Daten vorhanden sind.

**Ursache:** Der Endpoint liest Spalten aus `meal_items` (direkte Spalten), aber die Mikronährstoff-Daten für Tier 2/3 befinden sich in `nutrients_full` JSONB der `foods`-Tabelle. `meal_items` hat nicht alle 138 Spalten.

**Fix:** Beim Berechnen der Meal-Item-Nährstoffe müssen die Werte aus `foods.nutrients_full` herangezogen und in `meal_items` persistiert werden (oder beim Abrufen via JOIN berechnet werden).

---

## 🟡 Mittlere Priorität

### Feature: MealCam → Echte Claude Vision API
**Status:** Aktuell Mock-Implementierung
**Was fehlt:** `routes/mealcam.ts` durch echten Claude Vision API-Call ersetzen. Confidence-Thresholds sind bereits definiert (≥0.85 Auto-Accept, etc.).

### Feature: Barcode Scanner
**Status:** Deferred
**Was fehlt:** OpenFoodFacts API-Integration für `POST /mealcam/scan` oder eigenen Barcode-Endpoint. Lookup-Flow: eigene DB → OFF API → Manual.

### Feature: Food-DB Expansion
**Status:** BLS 4.0 geladen; Anreicherung ausstehend
**Was fehlt:** Import-Pipeline für USDA Foundation, Fineli, CIQUAL, CoFID, Swiss NWD. Merge-Logik implementieren (Confidence-basiert).

### Feature: Semantic Tags Phase 2
**Status:** Phase 1 (12 Tags) implementiert
**Was fehlt:** Allergen-Tags (`gluten`, `nuts`, `soy`), Fitness-Tags (`low_carb`, `low_fat`), Qualitäts-Tags (`organic`, `processed`).

---

## 🟢 Niedrige Priorität / Zukünftige Features

### Coach-Integration
| Feature | Beschreibung |
|---|---|
| Menu Plan per Coach | Coach erstellt Essenspläne direkt für einzelne User |
| Menu Plan Confirmation Flow | User muss jeden Mahlzeit-Eintrag aus Coach-Plan bestätigen |
| AI Coach Nutrition Advice | Personalisierte Coach-basierte Ernährungsempfehlungen via Buddy |
| Multi-Client Dashboard | Coach sieht alle Client-Nutrition-Daten im Überblick |

### Soziale & Community Features
| Feature | Beschreibung |
|---|---|
| Recipe Sharing | Rezepte zwischen Usern teilen (`is_public = true`) |
| Meal Plan Templates Library | Vorgefertigte Pläne (Cut-Week, Vegan, High-Protein, etc.) |
| Community Challenges | Streak-Challenges, Gruppen-Goals |

### Integrationen
| Feature | Beschreibung |
|---|---|
| Apple Health Import | Weight + Water aus Apple Health |
| Google Health Connect | Android-Pendant |
| Smart Scale Sync | Withings, Eufy, Renpho → Weight automatisch |
| Grocery Delivery | HelloFresh, Factor75 Affiliate-Integration |

### Analytik & KI
| Feature | Beschreibung |
|---|---|
| Adaptive TDEE | MacroFactor-Ansatz: TDEE aus echtem Gewichtsverlauf berechnen |
| Predictive Analytics | KI-Progress-Predictions und Optimierungsvorschläge |
| Bloodwork Integration | Lab-Ergebnisse → Mikronährstoff-Defizit-Alerts |
| Offline-Fähigkeit | Local Cache (letzte 500 Foods + Favoriten), Offline Logging + Sync |

### Monetisierung
| Feature | Beschreibung |
|---|---|
| Wallet/Monetisierung | Integration mit LumeOS Wallet-System |
| Food DB API Lizenzierung | Lumeos Food-DB als API für Drittanbieter |
| Semantic Tags Phase 3 | `halal`, `kosher`, `local`, `seasonal` |

---

## Offene Design-Fragen

| Frage | Empfehlung |
|---|---|
| Recipe nesting (Rezept als Zutat in Rezept)? | **NEIN für v1** — zu komplex, kaum Use Case |
| Recipe Sharing — öffentlich querybar? | **DEFER** — erst wenn User-Base groß genug |
| Mehrere Weight-Logs pro Tag erlauben? | **NEIN** — UNIQUE constraint auf (user_id, date), Update-Logik |
| MealCam als Free Feature? | **NEIN** — ~$0.01/Scan, 3 Trial-Scans dann Plus |
| Barcode Scanner als Free Feature? | **JA** — wichtiger Differenzierungsfaktor vs. MFP |

---

## Migration Ausstehend

| Migration | Inhalt | Priorität |
|---|---|---|
| `diary_days` target_* columns | Zielsnapshot auf Tagesebene für historische Analyse | Mittel |
| `user_targets` Tabelle | Saubere 1-Row-per-User Zieltabelle mit BMR/TDEE | Mittel |
| `user_target_logs` | Append-only History aller Zieländerungen | Mittel |
| Phase 2 Semantic Tags Migration | `gluten`, `nuts`, `soy`, `low_carb`, `low_fat` | Niedrig |

---

## Bekannte Technische Schulden

| Schuld | Beschreibung |
|---|---|
| Micro-Dashboard Architektur | meal_items sollten beim Einfügen alle 138 Mikro-Werte aus nutrients_full übernehmen |
| In-Memory Store (`store.ts`) | Existiert als Fallback, sollte langfristig entfernt werden |
| `user_food_preferences` RLS | Policy ist offen (TODO: restrict) |
| Duplizierte Migrations | `20250322030003–005` sind Duplikate von `071–073` |
| Schemata für recipes/meal_plans | Noch im `public` Schema, sollten nach `nutrition` verschoben werden |
