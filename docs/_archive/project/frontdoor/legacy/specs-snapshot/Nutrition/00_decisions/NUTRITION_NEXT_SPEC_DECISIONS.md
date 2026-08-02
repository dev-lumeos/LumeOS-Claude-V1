# NUTRITION_NEXT_SPEC_DECISIONS.md

Status: Draft aus Interview  
Zweck: Entscheidungen für die Korrektur und Weiterentwicklung der bestehenden LumeOS Nutrition Specs  
Scope: Nutrition V1 über alle Module hinweg, mit klarer Abgrenzung zu Supplements, Goals, Coach, Marketplace, Buddy und Permissions

---

## 1. V1 Scope

### V1 minimal

Diese Bereiche gehören zwingend in Nutrition V1:

- Food Search
- BLS 4.0 Food Database
- Meals / Diary Logging
- Meal Items mit Snapshot-Nährwerten
- Water Logs
- Nutrition Targets
- Custom Foods
- Micronutrient Review
- Thai/i18n strukturell vorbereiten
- MealCam V1
- Nutrition Preferences:
  - Allergien
  - Unverträglichkeiten
  - Likes
  - Dislikes
  - Ernährungsform
  - religiöse/kulturelle Einschränkungen

### V1 nice-to-have / schema-only

Diese Bereiche dürfen vorbereitet werden, sind aber keine Pflicht für V1-Feature-Vollausbau:

- Recipes
- Meal Plans
- Shopping Lists

Wenn Zeit knapp wird, werden Recipes, Meal Plans und Shopping Lists vollständig auf Phase 2 verschoben.

### Phase 2

Diese Bereiche sind nicht V1:

- Barcode Scanner
- Supplement-Produktverwaltung innerhalb Nutrition
- Buddy MealPlan Builder
- Marketplace Recipes
- Public Custom Foods / Sharing
- BLS 5.0 Update-Mechanismus
- Full Recipe UI
- Full Meal Plan Builder
- Shopping List UI
- Smart Scale Integration

Wichtig: MealCam ist V1.

---

## 2. Food-Datenquellen

### Entscheidung

- BLS 4.0 ist die einzige Master-Food-Datenquelle für V1.
- OpenFoodFacts ist für V1 nicht relevant.
- USDA ist für V1 nicht relevant.
- Custom Foods sind erlaubt, aber klar getrennt von BLS.
- BLS 5.0 Update-Mechanismus kommt später.

### Konsequenz

V1 Food Data besteht aus:

- BLS 4.0 Foods
- User Custom Foods

Nicht enthalten:

- OpenFoodFacts
- USDA
- Barcode-Datenlayer

---

## 3. Custom Foods

### Entscheidung

Custom Foods in V1:

- sind nur für den jeweiligen User sichtbar
- können später teilbar/öffentlich gemacht werden, aber nicht in V1
- dürfen Makros enthalten
- dürfen Mikronährstoffe enthalten
- brauchen Pflichtfelder:
  - Name
  - kcal pro 100 g
  - Protein pro 100 g
  - Carbs pro 100 g
  - Fat pro 100 g
- Mikronährstoffe sind optional
- erscheinen in Food Search zusammen mit BLS Foods
- sind klar als Custom markiert

### Konsequenz

V1 Food Search muss BLS Foods und User Custom Foods gemeinsam anzeigen, aber sauber unterscheiden.

---

## 4. Food Search V1

### Entscheidung

Food Search V1 muss unterstützen:

- deutsche Namen
- englische Namen
- Thai-Schema vorbereiten
- Alias-Suche
- Tippfehler-/Fuzzy-Suche
- Kategorienfilter
- Tags
- exakte Treffer zuerst
- Alias-Treffer danach
- Kategorie-/Relevanzranking
- Custom Foods oberhalb oder gleichrangig mit BLS Foods
- Live-Typing-Performance

### Ranking-Regeln

Food Search Ranking V1:

- exakter Name-Match ganz oben
- exakter Alias-Match direkt danach
- Prefix-Match vor Fuzzy-Match
- Custom Foods des Users bevorzugt
- häufig genutzte Foods des Users bekommen Ranking-Boost
- BLS Foods bleiben sichtbar, auch wenn Custom Foods matchen
- Kategorie-Match gibt Ranking-Boost
- Tags geben Ranking-Boost, wenn Suchbegriff Tag entspricht
- Fuzzy-Match braucht Mindest-Score
- sehr unsichere Treffer werden nicht angezeigt
- Search Result zeigt Quelle: BLS oder Custom
- Search Result zeigt wichtige Makros direkt an

---

## 5. Food Tags V1

### V1 Tags

Alle folgenden Tags sind V1:

- high_protein
- low_carb
- low_fat
- high_fiber
- vegan
- vegetarian
- gluten_free
- lactose_free
- nut_free
- halal
- kosher
- spicy
- thai_food
- mediterranean
- processed_food
- ultra_processed

### Tag-Zuweisung

Tags werden in V1 so gesetzt:

- automatisch aus BLS-Kategorie und Nährwerten, wo möglich
- manuell gepflegte Tag-Liste für schwierige Tags
- User darf Tags bei Custom Foods selbst setzen
- Admin darf Tags bei BLS Foods korrigieren
- unsichere Tags werden nicht gesetzt
- Tags müssen erklärbar sein

Beispiel:

high_protein wegen Protein > X g / 100 g

### Konsequenz

V1 braucht ein echtes Tag-System mit:

- Auto-Tagging-Regeln
- manuellen Tag-Overrides
- User-Tags für Custom Foods
- Admin-Korrekturen für BLS Foods
- Tag-Quelle oder Reason-Feld

---

## 6. Nutrition Preferences / Onboarding / Settings

Nutrition V1 braucht ein Präferenzmodell, das sowohl im Onboarding als auch in den Nutrition Settings genutzt wird.

### Onboarding

Im Onboarding werden initial erfasst:

- Allergien
- Unverträglichkeiten
- Ernährungsform
- religiöse/kulturelle Einschränkungen
- absolute No-Go-Lebensmittel
- Likes
- Dislikes
- bevorzugte Küchen/Stile
- Meal-Frequenz und Meal-Slots
- Zielrichtung

### Nutrition Settings

In den Nutrition Settings kann der User diese Angaben später bearbeiten:

- Allergien
- Unverträglichkeiten
- Likes
- Dislikes
- Ernährungsform
- religiöse/kulturelle Einschränkungen
- ausgeschlossene Lebensmittel
- bevorzugte Lebensmittel
- bevorzugte Küchen/Stile
- Meal-Slots
- Nutrition Targets
- Coach-Freigaben

### Constraint-Level

- Allergien sind Hard Constraints.
- Unverträglichkeiten sind Strong Constraints.
- Religiöse/kulturelle Ernährung ist Hard Constraint, wenn der User es so setzt.
- Dislikes sind Soft Constraints.
- Likes sind Ranking-Boosts.

### Nutzung im System

Diese Preferences beeinflussen:

- Food Search Ranking
- Food Suggestions
- MealCam Vorschläge
- Custom Food Vorschläge
- Meal Plans
- Coach Suggestions
- Buddy MealPlan Builder später
- Marketplace Recipes später

### Coach-Regel

Coach darf Preferences nur vorschlagen.

Der User muss Änderungen bestätigen.

Coach ändert keine Preferences direkt.

### Datenmodell

V1 braucht Tabellen oder Felder für:

- allergy_preferences
- intolerance_preferences
- food_likes
- food_dislikes
- diet_style_preferences
- cuisine_preferences
- excluded_foods
- preferred_foods

Jeder Preference-Eintrag sollte enthalten:

- user_id
- type
- target_type: food / ingredient / tag / category / cuisine
- target_id oder freier Text
- severity: hard / strong / soft / boost
- source: onboarding / settings / coach_suggestion / import
- created_at
- updated_at

---

## 7. Micronutrient Review V1

### Datenquellen

Micronutrient Review V1 kombiniert:

- Food Intake aus Nutrition
- Custom Food Nutrients
- Supplement Intake über Supplements-V1-API

Nutrition speichert keine Supplement-Produkte.

Supplements-Modul speichert:

- Supplement-Produkte
- Inhaltsstoffe
- Dosierungen
- Risiken
- Interaktionen

Nutrition fragt den Tages-Supplement-Intake per API ab.

Wenn Supplements-API nicht erreichbar ist:

Supplement-Daten nicht verfügbar

### Bewertung

Jeder Mikronährstoff bekommt einen Status:

- grün = im wissenschaftlich definierten Zielbereich ohne UL-Konflikt
- gelb = leicht zu niedrig oder leicht zu hoch
- rot = deutlich zu niedrig oder deutlich zu hoch / über sicherem Bereich
- grau = nicht bewertbar wegen fehlender Daten

Rot und Gelb können in beide Richtungen entstehen:

- zu niedrig
- zu hoch

### Bewertungsgrundlage

Bewertung erfolgt pro Stoff mit eigener Regel:

- RDA
- AI
- belegbarer Zielbereich
- UL / Upper Limit
- Warnlogik bei fehlendem UL

Wichtig:

- wasserlösliche Vitamine werden nicht pauschal als ungefährlich behandelt
- jeder Stoff bekommt eigene Sicherheitslogik
- fettlösliche Vitamine bekommen eigene UL-/Akkumulationslogik
- Mineralstoffe und Spurenelemente bekommen eigene UL-/Risiko-Logik

Beispiele:

- Vitamin A
- Vitamin D
- Vitamin E
- Vitamin K
- Eisen
- Zink
- Selen
- Jod
- Kupfer
- Vitamin B6
- Vitamin C

### Darstellung

Micronutrient Review V1 zeigt:

- Makros
- Mikros
- RDA-/AI-Zielerreichung
- UL-Risiko zuerst, wenn vorhanden
- Food-Anteil
- Supplement-Anteil
- Ampelstatus
- Score 0–100
- Erklärungstext pro auffälligem Nährstoff

Score darf rote Einzelwerte nicht verstecken.

Kritische rote Werte werden oben priorisiert.

### Grenzen

LumeOS gibt keine Therapieempfehlungen.

Erlaubt sind:

- Status
- Relevanz
- neutrale Erklärung
- Hinweis auf ärztliche Abklärung bei kritischem Wert

---

## 8. Nutrient Reference Values

V1 braucht eine interne Tabelle:

nutrient_reference_values

### Anforderungen

Pro Nährstoff werden getrennt gespeichert:

- RDA
- AI
- UL
- target_range, falls sauber belegbar

Werte können abhängig sein von:

- Alter
- Geschlecht
- Schwangerschaft
- Stillzeit

V1 unterstützt aktiv:

- Alter
- Geschlecht

Schema vorbereitet, aber in V1 nicht aktiv bewertet:

- Schwangerschaft
- Stillzeit

### Metadaten

Jeder Referenzwert speichert:

- Quelle
- Quellen-Version / Stand
- Einheit
- Gültigkeitsbereich
- effective_from

Wenn kein UL existiert:

kein UL belegt

Nicht:

0

Wenn kein Zielwert existiert:

Status = grau / nicht bewertbar

Admin kann Referenzwerte später aktualisieren.

---

## 9. BLS Import / Nutrient Mapping

### Entscheidung

BLS Import V1:

- läuft über eigene Import-Pipeline
- nicht manuell
- jeder BLS-Nährstoffcode muss auf nutrient_defs gemappt werden
- nicht gemappte BLS-Spalten kommen in einen Import-Warnreport
- nicht gemappte Werte dürfen nicht still ignoriert werden
- foods.bls_code ist Pflicht und unique
- food_nutrients speichert Werte pro 100 g
- Einheiten werden normalisiert
- Import erzeugt Version-/Import-Run-Metadaten
- alte Imports bleiben nachvollziehbar
- fehlerhafte Foods werden nicht importiert, sondern in eine Review-Queue geschrieben

### Konsequenz

BLS Import V1 braucht:

- deterministische Import-Pipeline
- nutrient_defs Mapping
- Import Run Metadata
- Warn-/Error-Report
- Review Queue
- keine stillen Drops

---

## 10. Food Portions / Mengen

### Entscheidung

V1 unterstützt:

- Menge in Gramm
- Standardportionen
- BLS-Werte bleiben pro 100 g gespeichert
- Meal Item berechnet Nährwerte aus Gramm / 100 g
- Portionsgrößen pro Food
- Custom Food Portions
- zuletzt genutzte Portionsgrößen
- Live-Anzeige von kcal/Makros beim Ändern der Menge
- Portionseinheiten wie:
  - Stück
  - Scheibe
  - Glas
- Fallback auf Gramm, wenn Portionsdaten fehlen

### Konsequenz

V1 braucht:

- gram-based canonical calculation
- food_portions
- custom food portions
- user recent portions
- live macro recalculation
- fallback to grams

---

## 11. Meals / Diary Logging

### Entscheidung

V1 Diary unterstützt:

- User kann Meals pro Tag loggen
- feste Meal-Slots wie breakfast, lunch, dinner, snack
- User kann eigene Meal-Slots anlegen
- Meal Items speichern Snapshot-Werte beim Logging
- Food-Daten-Änderungen verändern alte Diary-Einträge nicht
- User kann Meal Items bearbeiten
- User kann Meal Items löschen
- User kann komplette Meals kopieren
- User kann Tage kopieren
- Diary zeigt Tagesgesamtwerte für Makros und Mikros
- Diary zeigt Zielvergleich gegen Nutrition Targets

### Konsequenz

Diary V1 braucht:

- Meal Slots
- Custom Meal Slots
- immutable nutrient snapshots
- edit/delete/copy actions
- daily aggregation
- target comparison

---

## 12. Diary Snapshots

### Entscheidung

Meal Item Snapshot speichert:

- kcal/macros
- alle verfügbaren Mikronährstoffe
- original food_id oder custom_food_id
- Datenquelle:
  - BLS
  - Custom
  - MealCam
  - Manual
- Import-Version bzw. Food-Data-Version

Spätere Food-Änderungen verändern Snapshots nicht.

User kann Meal Item später neu berechnen lassen.

Recalculate:

- erzeugt neuen Snapshot
- speichert Audit/Version

Diary Day speichert Tagesaggregate als Snapshot.

Tagesaggregate können aus Meal Items neu aufgebaut werden.

### Konsequenz

V1 braucht ein starkes Snapshot-/Audit-Modell.

Historische Diary-Daten bleiben stabil.

Neuberechnung ist explizit und versioniert.

---

## 13. Nutrition Targets

### Entscheidung

Nutrition Targets V1:

- werden pro User gespeichert
- enthalten kcal, Protein, Carbs, Fat
- enthalten Wasserziel
- enthalten Mikronährstoffziele / RDA / AI / UL-Referenzen
- kcal/macros können manuell gesetzt werden
- kcal/macros können aus Goals/Bodydaten berechnet werden
- Nutrition speichert aktuellen Target-Snapshot pro Tag
- Änderungen an Targets verändern alte Diary-Tage nicht
- Coach kann Targets sehen, wenn User freigegeben hat
- Coach kann Targets vorschlagen, aber User muss bestätigen

### Konsequenz

Nutrition Targets V1 braucht:

- User Targets
- manuelle Targets
- berechnete Targets aus Goals/Bodydaten
- Tages-Snapshots
- Coach-Vorschläge mit User-Bestätigung
- Permission Gate für Coach-Zugriff

---

## 14. Water Logs / Hydration

### Entscheidung

Water Logs V1:

- User kann Wasser manuell loggen
- Wasser wird pro Tag summiert
- Water Target kommt aus Goals-Modul
- Nutrition speichert Water Logs
- Nutrition speichert nicht das langfristige Hydration-Ziel
- Kaffee, Tee, Saft zählen nicht als Water Log
- Kaffee, Tee, Saft zählen als Food/Meal Item
- Drink-Faktor optional später, nicht V1
- Coach/Admin kann Tages-Wasserstatus sehen, wenn freigegeben
- Water Progress erscheint im Diary

### Konsequenz

Nutrition ist zuständig für tägliche Water Logs.

Goals ist zuständig für langfristige Wasserziele.

---

## 15. Recipes / Meal Plans / Shopping Lists

### Entscheidung

V1:

- Recipes nur Schema vorbereiten
- Meal Plans nur Schema vorbereiten
- Shopping Lists nur Schema vorbereiten

Keine V1-Pflicht:

- Full Recipe UI
- Full Meal Plan Builder
- Shopping List UI
- Marketplace-Anbindung
- Buddy MealPlan Builder

Wenn Zeit knapp wird:

Recipes, Meal Plans und Shopping Lists komplett Phase 2

---

## 16. Thai / i18n

### Entscheidung

V1 i18n:

- UI muss DE/EN/TH strukturell unterstützen
- alle sichtbaren Nutrition-Labels brauchen i18n-Keys
- Thai-Texte müssen in V1 nicht vollständig befüllt sein
- Food-Namen brauchen Schema für Thai, Werte können später kommen
- Thai-Food-Suche nur Schema vorbereiten
- keine künstliche Thai-Fallback-Suche über DE/EN/Alias
- Admin kann Thai-Aliases später ergänzen
- fehlende Thai-Übersetzungen blockieren Release nicht

### UI-Verhalten

DE/EN aktiv.

TH sichtbar, aber disabled/ausgegraut.

Wenn User auf TH klickt:

Coming soon

### Konsequenz

Thai ist V1 strukturell vorbereitet, aber nicht visuell oder inhaltlich release-blockierend.

---

## 17. SPEC_06 Fixes

### Entscheidung

SPEC_06 muss korrigiert werden:

- food_categories.name_th ergänzen
- name_th darf leer sein
- openfoodfacts aus foods_custom.source entfernen
- foods_custom.source erlaubt nur:
  - user
  - manual
  - import
  - admin
- Shopping Lists Tabellen im Schema vorbereiten
- Shopping Lists bekommen in V1 keine UI
- Shopping Lists bekommen in V1 keine API, außer später ausdrücklich entschieden
- Wenn Zeit knapp, Shopping Lists Schema auch auf Phase 2 verschieben

---

## 18. MealCam V1

### Entscheidung

MealCam ist V1.

Barcode Scanner ist Phase 2.

MealCam V1:

- User kann Bild zu einem Meal hochladen
- User kann Kamera direkt aus der App öffnen
- MealCam erkennt mehrere Lebensmittel auf einem Teller
- MealCam schätzt Portionsgrößen
- MealCam matcht erkannte Lebensmittel gegen BLS Foods
- wenn kein guter Match existiert, wird ein Custom-Food-Vorschlag erzeugt
- User muss jedes erkannte Item bestätigen
- User kann Menge/Gramm manuell korrigieren
- Confidence Score wird angezeigt
- niedrige Confidence blockiert automatisches Hinzufügen
- Bild kann dauerhaft gespeichert werden
- extrahierte Ergebnisse werden gespeichert
- Bild ist optional/löschbar

### Provider

Vision-Provider wird jetzt noch nicht final entschieden.

MealCam darf kein Diary Item automatisch final schreiben.

Flow:

Bild
→ Erkennung
→ BLS/Custom Match
→ Portionsvorschlag
→ Confidence
→ User korrigiert/bestätigt
→ erst dann Meal Item

---

## 19. MealCam Datenschutz / Training-Freigabe

### Entscheidung

MealCam-Bilder:

- werden standardmäßig privat gespeichert
- dürfen nur mit separater User-Freigabe anonymisiert zur Verbesserung genutzt werden
- dürfen ohne Freigabe nicht für Training/Evaluation genutzt werden
- User kann Freigabe später widerrufen
- bei Widerruf werden Bilder aus dem Trainingspool entfernt
- bestätigte Diary-Nährwerte bleiben trotz Bildlöschung erhalten
- Coach sieht MealCam-Bilder nur bei User-Freigabe
- Admin sieht Bilder nur bei expliziter Debug-/Support-Freigabe

### Zweck

MealCam-Bilder und User-Korrekturen sollen später als reale Trainings-/Evaluationsbeispiele dienen.

V1 braucht deshalb saubere Datenstruktur für:

- Originalbild
- erkannte Items
- vorgeschlagene BLS-Matches
- Confidence Scores
- User-Korrekturen
- bestätigte Mengen
- finaler Diary-Eintrag
- Feedback-Daten für spätere Verbesserung

---

## 20. Nutrition ↔ Supplements Grenze

### Entscheidung

Supplements-Modul:

- speichert Supplement-Produkte
- speichert Inhaltsstoffe
- speichert Dosierungen
- bewertet supplement-spezifische Risiken
- bewertet Interaktionen

Nutrition-Modul:

- speichert keine Supplement-Produkte
- fragt Supplement-Intake für den Tag per API ab
- kombiniert Food-Intake + Supplement-Intake im Micronutrient Review
- führt UL/RDA/AI-Bewertung durch

Wenn Supplements-API nicht erreichbar ist:

Supplement-Daten nicht verfügbar

Coach Review soll anzeigen:

- Anteil aus Food
- Anteil aus Supplements

---

## 21. Coach-Zugriff / Permissions

### Globale Regel

User kann pro Modul und Subfunktion/Funktion freigeben oder sperren, was ein Coach sehen oder nutzen darf.

### Nutrition Permissions

User kann Coach-Zugriff erlauben/sperren für:

- gesamtes Nutrition-Modul
- Diary
- Water Logs
- Micronutrient Review
- MealCam-Bilder
- Nutrition Targets
- Custom Foods
- Recipes
- Meal Plans
- Nutrition Preferences

Coach:

- hat nur Leserechte
- darf nichts direkt ändern
- kann Vorschläge machen
- User muss Vorschläge bestätigen
- alle Coach-Zugriffe werden auditierbar geloggt

---

## 22. Coach Suggestions

Coach darf folgende Vorschläge machen:

- Nutrition Targets vorschlagen
- Meal-Plan-Vorschlag machen
- Food-Alternativen vorschlagen
- Wasserziel-Vorschlag machen
- Custom-Food-Korrektur vorschlagen
- Micronutrient-Hinweis kommentieren
- MealCam-Ergebnis kommentieren
- Diary-Eintrag zur Prüfung markieren
- Nutrition Preferences vorschlagen

Jeder Vorschlag:

- muss vom User einzeln angenommen oder abgelehnt werden
- bekommt Status:
  - pending
  - accepted
  - rejected
  - expired

Coach schreibt nicht direkt in Nutrition-Daten.

---

## 23. Nicht-V1 / explizite Abgrenzung

Nicht Nutrition V1:

- Barcode Scanner
- Full Recipe UI
- Full Meal Plan Builder
- Shopping List UI
- Marketplace Recipes
- Buddy MealPlan Builder
- Supplement-Produktverwaltung
- Smart Scale
- BLS 5.0 Update-Mechanismus
- Public Custom Foods / Sharing

Modulgrenzen:

- Supplement-Produkte → Supplements
- Supplement-Risiken/Interaktionen → Supplements
- Weight Logs / Smart Scale → Goals / Weight
- Water Target → Goals
- Coach-Freigaben → Auth / Permissions / Coach Access
- Marketplace Recipes → Marketplace
- Buddy MealPlan Builder → Buddy

---

## 24. Offene Punkte für Spec-Korrektur

### Muss in bestehende Specs eingearbeitet werden

- MealCam ist V1, nicht Phase 2
- Barcode bleibt Phase 2
- OpenFoodFacts komplett aus V1 entfernen
- USDA komplett aus V1 entfernen
- Custom Foods sauber von BLS trennen
- Nutrition muss Supplements-API für Micronutrient Review konsumieren
- Thai ist V1 strukturell vorbereitet, aber nicht release-blockierend
- Recipes / Meal Plans / Shopping Lists nur Schema oder Phase 2
- Coach Permissions und Suggestions ergänzen
- MealCam Consent / Training-Freigabe ergänzen
- nutrient_reference_values ergänzen
- BLS Import strikt mit Mapping/Warnreport/Review Queue definieren
- Food Tags V1 vollständig definieren
- Food Search Ranking detaillieren
- Snapshot-/Recalculate-/Audit-Modell definieren
- Nutrition Preferences / Onboarding / Settings ergänzen
- Allergien, Unverträglichkeiten, Likes, Dislikes und religiöse/kulturelle Einschränkungen ergänzen

### SPEC_06 direkte Fixes

- food_categories.name_th ergänzen
- foods_custom.source Werte bereinigen
- Shopping-List-Schema nur vorbereiten
- keine Shopping-List UI/API in V1

---

## 25. Nächster Schritt

Aus diesem Entscheidungsdokument sollen die bestehenden Nutrition Specs aktualisiert werden.

Priorität:

1. SPEC_01_MODULE_CONTRACT.md
2. SPEC_02_ENTITIES.md
3. SPEC_06_DATABASE_SCHEMA.md
4. SPEC_07_API.md
5. SPEC_08_IMPORT_PIPELINE.md
6. SPEC_09_SCORING.md
7. SPEC_10_COMPONENTS.md
8. ADR-Dateien aktualisieren oder ergänzen

Ziel danach:

saubere Nutrition V1 Specs
↓
Spec Review
↓
Micro-Workorders
↓
Implementation

Akzeptanzkriterien:
- Alle bestehenden Nutrition Specs widersprechen diesem Entscheidungsdokument nicht mehr.
- MealCam ist als V1 Feature eingeordnet.
- Barcode ist Phase 2.
- OpenFoodFacts und USDA sind aus V1 entfernt.
- BLS 4.0 ist einzige Master-Food-Datenquelle.
- Custom Foods sind klar getrennt.
- Nutrition Preferences sind in Onboarding und Nutrition Settings ergänzt.
- Allergien, Unverträglichkeiten, Likes und Dislikes sind berücksichtigt.
- Micronutrient Review konsumiert Supplements-API.
- Coach Permissions und Coach Suggestions sind ergänzt.
- Thai ist strukturell vorbereitet, aber nicht release-blockierend.
- Recipes, Meal Plans und Shopping Lists sind nur schema-only oder Phase 2.
- SPEC_06 Fixes sind eingearbeitet.
- Keine produktiven Code-Dateien wurden geändert.

Output am Ende:
1. Geänderte Dateien
2. Neue Dateien
3. Veraltete Annahmen, die entfernt oder ersetzt wurden
4. Offene Fragen
5. Empfehlungen für den nächsten Spec-Review