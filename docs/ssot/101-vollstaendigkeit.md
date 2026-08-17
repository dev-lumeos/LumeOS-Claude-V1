# 101 — Vollständigkeit der Mockups gegen die Vorlage

**Stand:** 2026-08-17 · **Auftrag:** G-38 · **Herkunft:** `[cmd]` gemessen mit
`tools/vollstaendigkeit.mjs`, Einzelbefunde per `grep`/`Read` am Code geprüft.

Dieses Dokument beantwortet eine Frage: **Ist von der Vorlage alles da?**
Bis hierher war die Antwort „durchgeklickt und für gut befunden". Bei
Supplements hat sich gezeigt, dass das nicht genügt — dort fehlten in zwei
Tabs fünfzehn Unterkomponenten, ohne dass es beim Klicken auffiel (G-33).

---

## Das Werkzeug

`tools/vollstaendigkeit.mjs` — verallgemeinert aus dem Medical-Skript
(`apps/web/src/app/v2/medical/vollstaendigkeit.mjs`, G-37). Modul und
Vorlagendateien sind Parameter.

```
node tools/vollstaendigkeit.mjs            # alle sechs Module
node tools/vollstaendigkeit.mjs nutrition  # eines
```

Es zählt **nach Namen, nicht nach Zeilen**, und folgt den drei Regeln aus
`theme-v1-umsetzung.md`:

1. **Der Aufrufbaum ist das Maß.** Ein Tab-Rumpf mit 46 Zeilen kann acht
   Komponenten mit 365 Zeilen rufen — so bei `SuppExtended` (G-29).
2. **Gesucht wird in allen Vorlagendateien eines Moduls.** `CalendarView`
   stand in `-modals.jsx` und galt fälschlich als undefiniert (G-33).
3. **Eigene Zustände sind eigene Bildschirme.** Das misst das Skript
   **nicht** — es steht als Merkposten unter „Was offen bleibt".

Zusätzlich zählt es **Kacheltitel**, weil die Unterkomponentenzahl allein
nicht genügt: Medicals Tabs setzen die Kacheln direkt, ohne eigene
Komponenten. Wer nur Namen zählt, sieht bei „0 Unterkomponenten" nicht, ob
eine Kachel fehlt.

> **Das Skript ist inzwischen geteilt.** `[cmd]` Während dieses Auftrags kam
> von anderer Seite die Konfiguration für Coach und Coach-AI dazu (G-40).
> Ein Lauf ohne Argument zeigt deren Module mit `0 von 60` bzw. `0 von 41` —
> die Verzeichnisse sind dort noch leer. **Das ist fremder Arbeitsstand, kein
> Befund dieses Auftrags**; die sechs Zahlen unten sind je Modul einzeln
> gemessen (`node tools/vollstaendigkeit.mjs <modul>`).

### Drei Fehler des Werkzeugs, die vor den Zahlen gefunden wurden

Sie stehen hier, weil jede von ihnen eine Messung geliefert hätte, die
sicher aussieht und falsch ist.

| Fehler | Folge | Behoben durch |
|---|---|---|
| Kommentare als Umsetzung gezählt | `MealCard` und `NutritionDiary` galten als gebaut — sie standen nur in einem Herkunftskommentar | `ohneKommentare()` streicht Kommentare, längenerhaltend |
| Gegen den **abgelösten** Recovery-Rahmen gemessen | 22 Phantomlücken (`RecoveryToday`, `RecoverySleep`, …); die Umsetzung folgt `RecoveryModuleV2`, weil `app.jsx:122` diesen wählt | `rahmen`/`rahmenDatei` je Modul |
| Modale und Konstanten aus toten Vorlagendateien mitgezählt | Vier Modale und zwei Konstanten aus `module-recovery-modals.jsx` galten als Lücke, obwohl `-v2.jsx` sie **nullmal** nennt | nur zählen, was die Datei des lebenden Rahmens erwähnt |

---

## Die Zählung je Modul

`[cmd]` `node tools/vollstaendigkeit.mjs`, 2026-08-17.

| Modul | Stand | Offen |
|---|---|---|
| Dashboard | **3 / 3** | — |
| Nutrition | **38 / 38** | eine bewusste Abweichung, siehe unten |
| Training | **45 / 45** | — |
| Recovery | **67 / 71** | vier — alle die Muskelkarte (G-26) |
| Goals | **65 / 65** | — |
| Supplements | **42 / 67** | 25 — davon 24 aus G-31, **einer neu gefunden** |

**Dashboard, Training, Goals sind vollständig.** Nutrition ist es nach dem
Nachziehen dieses Auftrags.

### Nutrition: was dieser Auftrag gebaut hat

Vorher **11 von 38**. Sechs der sieben Tabs zeigten einen Platzhalter mit
Attrappen-Hinweis; vier Modale fehlten ganz, die Kopfknöpfe öffneten
stattdessen „in Entwicklung".

Gebaut, jeweils nach der Vorlage:

| Tab / Fenster | Quelle | Umfang |
|---|---|---|
| Preferences | `module-nutrition-spec.jsx:213-332` | 6 Kacheln, EU-14-Allergene, Kategorien mit ±50, Einzellebensmittel mit ±100 |
| Meal plans | `module-nutrition-spec.jsx:334-521` | 3 Unter-Tabs, 8 Kacheln, Ghost-Entries mit vier Zuständen, Einkaufsliste |
| Insights | `module-nutrition.jsx:357-439` | 3 Kacheln, Kalorienkurve, Makroverteilung, 30-Tage-Heatmap über 8 Nährstoffe |
| Planner | `module-nutrition.jsx:598-654` | Wochenmatrix 4 × 7 mit denselben Gerichten |
| Vier Modale | `module-nutrition.jsx:655-734`, `-spec.jsx:71-212, 547-628` | MealCam (3 Schritte), Custom food, Quick-add, Nutrition settings |

Die drei Datenkonstanten (`DIET_TAGS`, `EU14_ALLERGENS`, `GHOST_ENTRIES`)
sind **mechanisch übernommen**, nicht abgetippt — abgetippte Zahlen driften.

**Alles bleibt Attrappe.** 18 Kacheln tragen die Marke mit Begründung; kein
Fenster schreibt. Es gibt kein Schema für Essenspläne, keine Spalten für
Vorlieben am Profil, kein Modell für MealCam.

---

## Umbenannt oder fehlend

*„Eine Zuordnung ohne Beleg ist eine Behauptung."* Jeder Eintrag der
Tabelle in `tools/vollstaendigkeit.mjs` trägt eine Begründung, die auf
**Verhalten** zeigt, nicht auf ähnliche Schreibweise. Jede wurde von Hand am
Code geprüft.

| Vorlage | Umsetzung | Beleg |
|---|---|---|
| `NutritionModule` | `TagebuchAnsicht` | `ansicht.tsx:87` — Kopfzeile, `<Tableiste>` mit denselben sieben Tabs, Tab-Weiche |
| `MealCard` | `MahlzeitKarte` | `mahlzeiten.tsx:177` — nimmt `datum/typ/mahlzeit/onGeaendert`, rendert Mahlzeit mit Positionen |
| `NutritionDiary` | `Mahlzeiten` | `mahlzeiten.tsx` — Tagesliste in der Reihenfolge der Vorlage |
| `MacroRing` | `ProgressRing` | `ansicht.tsx:225` — der geteilte Ring aus `packages/ui` statt eines modul-eigenen |
| `FoodPreferencesView` | `FoodPreferencesTab` | `tab-prefs.tsx` — dieselben sechs Kacheln, acht Ernährungsformen, EU-14 |
| `MealPlansView` | `MealPlansTab` | `tab-plans.tsx` — dieselben drei Unter-Tabs, dieselbe Compliance-Rechnung |
| `NutritionInsights` | `NutritionInsightsTab` | `tab-insights.tsx` — dieselben drei Kacheln, 8 Nährstoffe × 30 Tage |
| `NutritionPlanner` | `NutritionPlannerTab` | `tab-planner.tsx` — dieselbe 4 × 7-Matrix, dieselben Gerichte |
| `NutritionModalLauncher` | `NutritionModale` | `modale.tsx` — dieselben vier Schlüssel; Verteilung per Zustand statt `window`-Ereignis |
| `TrainingToolLauncher` | `TrainingModale` | `modale.tsx:107` — `plates`→`PlateCalculatorModal:677`, `warmup`→`:745`, `aigen`→`:806` |
| `DashboardModule` | `DashboardEntwurf` | `entwurf.tsx:60` — **nicht** `DashboardAnsicht`; per `grep` geprüft, die gibt es nicht |
| `RecoveryModuleV2` | `RecoveryAnsicht` | die Umsetzung führt einen Rahmen, nicht zwei konkurrierende |

**Die Tabelle kann keine Lücke verstecken.** `[cmd]` Gegenprobe: Zielname
auf einen erfundenen gesetzt → `MealCard` erschien sofort wieder als
fehlend.

### Bewusste Abweichung: `NutritionFoods`

Die Vorlage führt im Food-DB-Tab eine Tabelle mit **zwölf fest
eingetragenen** Lebensmitteln. Die Umsetzung hat unter
`/v2/nutrition/suche` eine **echte Suche gegen die BLS-Daten** (293 Zeilen,
G-03), auf die der Tab verlinkt.

Die zwölf Zeilen nachzubauen hieße, funktionierenden Code durch eine
Attrappe zu ersetzen. **Nicht gebaut, mit Absicht.**

---

## Was offen bleibt

### Recovery: die Muskelkarte — 4 Posten, gehört G-26

`BodyMap18` (in `RecToday`, `RecCheckin`, `RecMuscleMap`) und
`MuscleDetailModal2`.

**Hier wurde nichts gebaut, und das ist richtig so.** `[read]` Der Auftrag:
nicht aus der Vorlage nachbauen. Der Ersatz liegt bereit —
`apps/web/public/mockup/components/MuscleBodyMap.js` (593 Zeilen, fünf
Darstellungen: `renderFatigue`, `renderActivation`, `renderInjection`,
`renderPoints`, `renderCombined`), dazu `body_front.svg` und
`MuscleBodyMap_test.html`. Das ist G-26.

### Supplements: 25 Posten — 24 aus G-31, **einer neu**

24 hängen an den fünf Tabs, die G-29 bewusst nicht gebaut hat (Catalog,
Stacks, Intelligence, Inventory, Injections) und ihren Modalen. Das ist
G-31.

**Neu gefunden, gehört nicht zu G-31:** `SuppCost` ist ein **gebauter** Tab,
aber die Vorlage führt dort **fünf** Kacheln, die Umsetzung **zwei**.

`[cmd]` Fehlen: *Cost · 12 months trend*, *Spend per supplement · this
month*, *Category split*, *If you removed…*, *Cost optimization ·
suggestions*. Gebaut sind *Cost per supplement* und *Total*
(`tabs.tsx:507, 520`).

Das ist dieselbe Klasse Lücke wie bei `SuppExtended` in G-33 — der Tab
existiert, sieht beim Klicken vollständig aus, ist es aber nicht.
**Vorschlag: an G-31 anhängen oder als eigener kleiner Auftrag.**

### Was dieses Werkzeug nicht misst

**Regel 3 — eigene Zustände sind eigene Bildschirme.** Ein Tab, der leer,
ladend und gefüllt unterschiedlich aussieht, ist dreimal zu prüfen. Das
Skript zählt Namen und Kacheltitel; es kann nicht sehen, ob der Leerzustand
einer Kachel gebaut ist. Wer eine Kachel anbindet, prüft das von Hand.

### Ein Randbefund, nicht aus diesem Auftrag

`[cmd]` Bei 375 px scrollt **jede** v2-Seite waagerecht — Dashboard, Goals
und das unveränderte Diary genauso wie die neuen Tabs. Ursache ist
`.v2-sidebar-nav` (880 px breit in einem 375-px-Fenster), nicht der
Modulinhalt. Die neuen Raster scrollen sauber in sich: die Wochenmatrix
misst 640 px in einem 293-px-Kasten mit `overflow-x: auto`.

**Nicht angefasst** — das ist die Schale, nicht dieser Auftrag.

---

## Die Prüfungen, die dazugekommen sind

Vier Tests in `apps/web/src/components/shell/__tests__/v2-attrappen.test.ts`.
**Jeder wurde absichtlich zum Fehlschlagen gebracht**, bevor er als
Sicherheit gilt.

| Test | Hält fest | Gegenprobe |
|---|---|---|
| Attrappen-Marken der neuen Tabs | 18 Kacheln, je Datei gezählt | Marke entfernt → „5 gekennzeichnet, erwartet 6" |
| Die vier Modale sind da | `MealCamModal`, `CustomFoodModal`, `QuickAddModal`, `NutritionSettingsModal` | umbenannt → „Das Modal `QuickAddModal` fehlt" |
| Kein `Math.random` in v2 | zerlegt die Hydration | wieder eingebaut → „Gefunden in: tab-planner.tsx" |
| Berechnete Stilwerte sind gerundet | siehe unten | Rundung entfernt → „Ungerundet in: tab-insights.tsx (wert)" |

### Der Fehler, den kein Test gefunden hat — sondern der Browser

Die Vorlage würfelt an zwei Stellen (`module-nutrition.jsx:405` Heatmap,
`:648` Planner-Kalorien). In Next.js rendert der Server einmal und der
Browser noch einmal — `Math.random()` liefert zwei Bilder und React bricht
ab. Beide wurden durch feste Sinus-Formeln ersetzt, der Test darauf war
grün.

**Der Browser meldete trotzdem:**

```
Prop `style` did not match.
Server: opacity:0.6199775584337404
Client: opacity:0.6199775584345043
```

`Math.sin` ist in ECMAScript **nicht bitgenau festgelegt**; Node und das V8
im Browser weichen ab der zwölften Stelle ab. „Fest" heißt also nicht „bei
jedem Aufruf gleich", sondern **„in jeder Engine gleich"**. Behoben durch
Runden auf drei Nachkommastellen.

Der vierte Test prüft jetzt genau das — aber **nur dort, wo es weh tut**:
Ein erster Entwurf schlug auch bei `goals/daten.ts` und
`nutrients-entwurf.tsx` an, deren Sinuswerte in Diagrammdaten fließen, nicht
in ein `style`. React vergleicht bei der Hydration gerenderte Attribute;
eine Zahl, die nur die Höhe einer SVG-Kurve bestimmt, taucht dort nicht auf.
Ein Test, der sie meldet, erzeugt Lärm statt Sicherheit — und Lärm schaltet
man irgendwann ab.

---

## Zustand

`[cmd]` `pnpm gate` — 8 von 8 Aufgaben grün, 218 Web-Tests + 7 Admin-Tests,
kein Fehlschlag. `[cmd]` Browser bei 375 / 768 / 1440 px geprüft, alle vier
Tabs rendern, keine Hydrationsmeldung mehr.

**Nichts ist committet oder gestaged.**
