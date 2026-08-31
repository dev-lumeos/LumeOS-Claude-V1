---
nr: G-226
typ: entscheidung
modul: nutrition
schwere: mittel
angelegt: 2026-08-28
braucht: []
kind_von: null
entscheidung: null
agent: claudecode
beauftragt: 2026-08-30
erledigt: 2026-08-31
commit: OFFEN
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition
zahlen: null
---

# G-226 — V1-Status-Marker fehlen für Recipes/Shopping/MealPlans Components in SPEC_10

## Befund

**Aus `OPUS_REVIEW_NUTRITION_03_UI_FLOWS_READINESS.md`, IMP-4.**
`[read]` **Wortlaut der Review, nicht vom Orchestrator formuliert.**

`ADR_RECIPES_SCHEMA_ONLY.md`:
> V1: Schema vorbereiten — kein Full-UI, kein Full-API Pflicht.
> Wenn Zeit knapp: Recipes, Meal Plans und Shopping Lists komplett auf Phase 2 verschoben.

`SPEC_10_COMPONENTS.md` listet:
- 5 Recipe Components (`RecipeList`, `RecipeCard`, `RecipeBuilder`, `RecipeDetail`, `RecipeLogModal`)
- 3 Shopping List Components (`ShoppingListView`, `ShoppingListDetail`, `ShoppingListItem`)
- 8 Meal Plan Components (`MealPlanList`, `MealPlanCard`, ...)

Ohne V1-Status-Hinweis. Reader interpretiert sie als V1-Pflicht.

`SPEC_10_PASS2_PATCH.md` adressiert das nicht. Der Pass-2-Patch ergänzt nur neue Components.

`SPEC_03_USER_FLOWS.md §Flow 7` (Rezepte) und §Flow 8 (Einkaufsliste) sind als komplette V1-Flows beschrieben — ohne Phase-2-Markierung.

**Konsequenz:** WO-Generator könnte vollen Recipe-Builder als V1-Pflicht-WO schreiben, obwohl ADR sagt: optional.

## Stand

`[read]` **Die Review stammt aus der Spec-Phase und ist nicht gegen
den heutigen Stand geprueft.** `[cmd]` **Sie kennt die Entscheidungen
vom 27./28.08. nicht** — was sie fordert, kann inzwischen entschieden
oder erledigt sein.

## Gegen den heutigen Stand gemessen, 2026-08-30

`[read]` **Dieser Punkt stammt aus
`OPUS_REVIEW_NUTRITION_03_UI_FLOWS_READINESS.md`** — **einer
Spec-Review von vor dem `/v2/`-Umbau.** `[cmd]` **Acht Punkte kommen
aus derselben Datei.**

`[cmd]` **Gemessen 2026-08-30:** `nutrition.recipes` 6 Zeilen,
`shopping_lists` 1, `meal_plans` 2, `meal_plan_logs` 0.
`[read]` **Alle drei Tabellen existieren und tragen Daten.** **Der
Bestaetigungsweg dazu ist seit G-274 gebaut.**

## Auftrag — acht Punkte aus einer Review

**Mitbeauftragt: G-227, G-228, G-229, G-230, G-235, G-238, G-222.**
Bericht in diese Datei.

**Beauftragt am 2026-08-30.**

### Warum als Gruppe

`[cmd]` **Alle acht stammen aus
`OPUS_REVIEW_NUTRITION_03_UI_FLOWS_READINESS.md`** — **einer
Spec-Review von vor dem `/v2/`-Umbau.**

`[read]` **Sie kennen den heutigen Stand nicht.** `[cmd]` **Der
Orchestrator hat je Punkt eine Messung eingetragen; sie steht unter
*Gegen den heutigen Stand gemessen*.**

`[read]` **Deine Aufgabe ist das Urteil, nicht die Messung** — **aber
pruef sie nach, sie stammt von mir und ich habe die Punkttexte nicht
einzeln gelesen.**

### Je Punkt ein Urteil

    erledigt      die Sache existiert und wirkt
    ueberholt     die Review beschreibt etwas, das es nie gab
    offen         der Befund gilt weiter
    Entscheidung  Tom muss ran, mit der Frage praezise gestellt

`[cmd]` **Bei C-112 blieben von elf drei, bei C-29 blieb null.**
`[read]` **Wenn hier fuenf ueberholt sind, ist das das Ergebnis** —
kein halber Auftrag.

### Zwei, die schon halb beantwortet sind

**G-222:** `[cmd]` **Tom hat am 30.08. entschieden:** *,,wir bauen ein
initiales komplettes onboarding fuer jeden user wenn er nach der
registrierung sich einloggt."* `[read]` **Damit ist das Ob geklaert.**
`[cmd]` **Und die Spec traegt das Wie:** vier Schritte in
`SPEC_03_USER_FLOWS.md`, neun Komponenten in `SPEC_10_PASS2_PATCH.md`.
`[read]` **Tom will die Inhalte spaeter gemeinsam festlegen, wenn ein
repraesentativer Datenbestand vorliegt** — **also: pruefen, was die
Spec vorgibt, und den Punkt darauf zuschneiden.**

**G-238:** `[cmd]` **`plan_origin` erlaubt `self_created`,
`coach_created`, `marketplace` — `buddy` fehlt.** `[read]` **Die
Frage ist praezise: eigene Herkunft, oder `self_created` mit Buddy als
Werkzeug?** **Das ist eine Entscheidung, keine Messung.**

### Was nicht zu tun ist

**Nichts bauen** — dieser Auftrag urteilt.
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    je Punkt ein Urteil    mit Beleg
    Messung nachgeprueft   stimmt sie?
    Entscheidungen         praezise gestellt, nicht beantwortet

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen** — er laesst einen gesunden
Server stehen. **Codex fasst ihn nicht an.**

## Bericht

**Claude Code, 2026-08-31.** Mitbeauftragt: G-227, G-228, G-229,
G-230, G-235, G-238, G-222. Nichts gebaut, nichts auf
`dev@lumeos.app`, nichts committet.

### Das Ergebnis in einer Zeile

    ueberholt      G-226, G-230, G-235          3
    erledigt       —                            0
    offen          G-227, G-229                 2
    Entscheidung   G-222, G-228, G-238          3

`[read]` **Kein Punkt ist erledigt** — was die Review forderte, wurde
nirgends gebaut. **Drei beschreiben etwas, das es nie gab.** **Und
G-228 ist von „Inkonsistenz in der Spec" zu einem gemessenen
Widerspruch zwischen Spec und Datenbank geworden** — der einzige, der
heute wirkt.

### Die Messungen des Orchestrators, nachgeprueft

`[cmd]` **Sechs von acht stimmen.** Zwei nicht:

**G-228 — die Spec liegt woanders als angenommen.** Der Punkt sagt,
`SPEC_04_FEATURES.md` liege unter `docs/specs/Recovery/` und verweist
auf C-143/C-218. `[cmd]` **Die Datei gibt es in acht Modulen**, und
die mit `level_multiplier` ist **`docs/specs/Nutrition/01_current_specs/
SPEC_04_FEATURES.md:336`.** `[read]` **Der Recovery-Umweg fuehrt in
die Irre** — die Sache ist eine Nutrition-Sache.

**G-229 — es gibt den Trigger gar nicht.** Der Punkt misst „gegen
`apps/admin`". `[cmd]` **Wichtiger ist: `auto_tag_food` existiert
nicht.** Kein Trigger im Schema `nutrition` traegt Tags ein; die
Einwaende der Review haengen aber genau daran.

`[cmd]` **Bestaetigt:** `recipes` 6, `shopping_lists` 1, `meal_plans`
2, `meal_plan_logs` 0 (dazu `meal_plan_entries` 112);
`foods_custom.barcode` da, 0 Zeilen; `display_tier` in
`nutrient_defs`; `plan_origin` ohne `buddy`; keine
`onboarding`-Spalte, `food_preferences` 2 Zeilen; die Pfade
`nutrition/water/` und `nutrition/shopping-lists/` gibt es nicht.

---

### G-226 — **ueberholt**

**Die Review fuerchtete, ein WO-Generator koenne Recipes, Shopping
Lists und Meal Plans als V1-Pflicht schreiben, weil der V1-Hinweis in
SPEC_10 fehlt.**

`[cmd]` **Gemessen am Schirm, angemeldet, `/v2/nutrition`:** sieben
Reiter — *Diary, Insights, Nutrients, Food DB, Meal plans,
Preferences, Planner*. `[cmd]` **Die Woerter „recipe", „rezept",
„shopping", „einkaufsliste" kommen auf dem Schirm null Mal vor.**

`[read]` **Die befuerchtete Folge ist nicht eingetreten.** Das Schema
steht (6 Rezepte, 1 Liste), die Oberflaeche zeigt nichts davon —
**genau die ADR-Vorgabe *„Schema vorbereiten, kein Full-UI"*.**

`[read]` **Meal Plans sind gebaut, und das widerspricht nicht:** der
ADR nennt sie nur *„wenn Zeit knapp"* verschiebbar. **Sie war nicht
knapp.**

### G-227 — **offen**

`[cmd]` **`foods_custom.barcode` existiert, `foods_custom` hat 0
Zeilen.** `[cmd]` **Kein Barcode-Einstieg in der Oberflaeche.**

`[read]` **Der Befund gilt weiter, aber entschaerft:** die Review
fuerchtete, jemand koenne den Phase-2-Barcode-Weg bauen. **Gebaut ist
er nicht** — **die Spalte allein ist keine Verpflichtung.**

`[read]` **Warum nicht *ueberholt*:** `SPEC_03 Flow 6` und `SPEC_04
Feature 4` fuehren den Barcode-Scan weiterhin als V1-Weg, waehrend
zwei ADRs ihn auf Phase 2 setzen. **Der Widerspruch in der Spec
besteht unveraendert** — er hat nur noch keinen Schaden angerichtet.

### G-228 — **Entscheidung** (und der einzige wirkende Widerspruch)

`[read]` **Die Frage der Review — *woher kommt `user_level`?* — hat
inzwischen eine Antwort, und die Antwort deckt einen Fehler auf.**

`[cmd]` **Gemessen 2026-08-31:**

    SPEC_04 (Nutrition):336   beginner 0.75 | intermediate 0.90
                              | advanced 1.00 | elite 1.10
    profiles.experience_level CHECK: beginner | advanced | pro | elite
    live                      2x 'pro', 5x NULL (von 7 Profilen)
    diary-entwurf.tsx:31      beginner/intermediate/advanced/elite
                              Rueckfall: `?? 0.90`

`[read]` **Die Spec kennt `intermediate`, die Datenbank kennt `pro`
— und keiner kennt den anderen.** `[cmd]` **Ein Profil mit `pro`
faellt heute auf `0.90`** — den Wert, der fuer `intermediate` gedacht
war. **Kein Fehler, keine Meldung, ein stiller Ersatzwert.**

**Die Frage an Tom, praezise:**

> **Welche vier Stufen gelten — die der Spec (`intermediate`) oder
> die der Datenbank (`pro`)?** Und welchen Faktor traegt die vierte?
> `[read]` Die Namen sind austauschbar, der Faktor nicht: heute
> bekommt `pro` stillschweigend 0,90.

`[read]` **Nicht selbst entschieden**, weil beide Seiten belegt sind
und die Wahl den Score aller Nutzer verschiebt.

`[read]` **Und der Zusammenhang zu E-25:** der NRF9.3-Score kennt
keinen Stufenfaktor. **Diese Stufen gehoeren zum Entwurfsscore aus
`diary-entwurf.tsx`, nicht zum entschiedenen.** Wer E-25 baut,
braucht sie nicht — **wer den Entwurf stehen laesst, braucht die
Antwort.**

### G-229 — **offen**, aber der Einwand traegt anders als beschrieben

`[cmd]` **`auto_tag_food` gibt es nicht.** Kein Trigger im Schema
`nutrition` schreibt Tags; die 25 vorhandenen sind
`touch_updated_at`, Eigentuemerwaechter und zwei
Praeferenz-Auffrischungen.

`[read]` **Damit faellt der Kern des Einwands:** *„der Trigger loescht
alle bestehenden Tags vor INSERT, ein Admin-Override wuerde
ueberschrieben"* — **das kann nicht passieren, weil es den Trigger
nicht gibt.**

`[cmd]` **Was bleibt, gilt:** `food_tags` traegt **30.797 Zeilen**,
und **es gibt keinen Weg, sie zu aendern.** `[cmd]`
**`apps/admin/src/app/api/curation/route.ts:25` liest `tag` als
Filter** — die Kurationsseite sucht nach Tags, sie pflegt sie nicht.
`[cmd]` **Und `foods_custom` hat kein Tag-Feld** (nur
`custom_allergens`).

`[read]` **Der Punkt ist also offen, aber praeziser:** **nicht „der
Override wird ueberschrieben", sondern „es gibt keinen Override".**

### G-230 — **ueberholt**

`[cmd]` **Gemessen: alle vier Pfade antworten mit HTTP 404** —
`/v2/nutrition/water`, `/v2/nutrition/shopping-lists`,
`/nutrition/water`, `/nutrition/shopping-lists`.

`[cmd]` **`v2/nutrition` hat zwei Unterordner: `__tests__` und
`suche`.** `hydration.tsx` ist eine Komponente, keine Seite.

`[read]` **Die Review beschreibt eine Verzeichnisstruktur, die nie
gebaut wurde.** **Die von ihr befuerchtete Doppelung existiert
nicht.**

### G-235 — **ueberholt**

`[cmd]` **Ein Abo-Tier gibt es im Schema nicht.** Die Suche nach
`%micros_tier%`, `%subscription%`, `%abo%` und `tier` findet in
`nutrition` nichts — die Treffer liegen in `supplements`
(`stack_template_items.tier`) und `realtime`.

`[cmd]` **`display_tier` ist keine Abo-Stufe, sondern eine
Anzeigetiefe** — belegt an der Verteilung:

    Stufe 1   31 Codes   ALC, CA, CHO, CHORL, ENERCC
    Stufe 2   47 Codes   AAE9, ASH, BIOT, CARTB, CHOCAL
    Stufe 3   60 Codes   ACEAC, ALA, ARG, ASP, CAROTPAXB

`[read]` **Stufe 1 sind Alltagswerte, Stufe 3 Aminosaeuren und
Carotinoide.** **Das ist Tiefe, keine Bezahlschranke.**

`[cmd]` **Und ein Nebenbefund:** `apps/web/src/app/v2/nutrition/
page.tsx:46` nennt `display_tier` *„das Abo-Gate"*. `[read]` **Das
ist genau die Verwechslung, die G-140 und G-239 schon zweimal
aufgeraeumt haben** — **der Kommentar traegt sie weiter.** Als eigener
Punkt anzulegen; **nicht hier geaendert, dieser Auftrag urteilt.**

### G-238 — **Entscheidung**

`[cmd]` **Der CHECK erlaubt `self_created`, `coach_created`,
`marketplace`** — oder `NULL`. **`buddy` fehlt.**

`[cmd]` **Und die Anzeige kennt dieselben drei:**
`plan-lage.ts:40-52` bildet sie ab und faellt sonst auf
*„Herkunft nicht hinterlegt"* zurueck.

`[read]` **Das schaerft die Frage:** ein `buddy`-Plan wuerde heute
nicht nur am CHECK scheitern — **er wuerde, kaeme er durch, als
*„Herkunft nicht hinterlegt"* erscheinen.**

**Die Frage an Tom, praezise:**

> **Bekommt ein von Buddy erstellter Plan eine eigene Herkunft
> (`buddy`), oder ist er `self_created` mit Buddy als Werkzeug?**
>
> `[read]` **Was daran haengt:** bei eigener Herkunft braucht es
> einen vierten CHECK-Wert, einen vierten Anzeigetext und eine
> Entscheidung, ob der Nutzer sie unterscheiden koennen soll. **Bei
> `self_created` bleibt alles wie es ist** — und die Information, dass
> Buddy geholfen hat, ist verloren.

`[read]` **Nichts spricht heute fuer Eile:** der Buddy-Plan-Builder
ist Phase 2, und `meal_plan_logs` hat 0 Zeilen.

### G-222 — **Entscheidung**, aber eine engere als gedacht

`[cmd]` **Das Ob ist entschieden** (Tom, 2026-08-30). `[cmd]`
**Gebaut ist nichts:** keine `onboarding`-Spalte im ganzen Schema,
**und keine der neun Komponenten existiert im Code** — sie stehen nur
in `SPEC_10_PASS2_PATCH.md`.

`[cmd]` **Die Spec traegt das Wie:** neun Komponenten
(`OnboardingPreferencesStep`, `DietTypeSelector`, `AllergenSelector`,
`IntoleranceSelector`, `ReligiousDietarySelector`, `FoodLikesInput`,
`FoodDislikesInput`, `MealSlotEditor`, `CuisinePreferenceSelector`)
und vier Schritte.

`[read]` **Was die Review vermisst, fehlt weiterhin und ist kein
Bauteil, sondern ein Ablauf:** Ausloeser, Abbruch, Wiederaufnahme,
Uebergang, Pflichtfelder je Schritt.

**Die Frage an Tom, praezise — und nur eine:**

> **Darf das Onboarding uebersprungen werden?**
>
> `[read]` **Daran haengt alles Uebrige:** ist es Pflicht, braucht es
> keinen Wiederaufnahmezustand und keinen Abbruchweg — der Nutzer
> kommt ohne es nicht ins Tagebuch. **Ist es ueberspringbar, braucht
> es eine Spalte, die den Fortschritt haelt** (`onboarding_complete`
> oder aehnlich), **und eine Regel, wann erneut gefragt wird.**

`[read]` **Die Inhalte sind ausdruecklich NICHT die Frage** — Tom
will sie spaeter gemeinsam festlegen, wenn ein repraesentativer
Datenbestand vorliegt. **Der Punkt ist darauf zugeschnitten.**

---

### Nachweis

    je Punkt ein Urteil    oben, je mit Beleg
    Messung nachgeprueft   6 von 8 stimmen; G-228 (falscher
                           Spec-Ort) und G-229 (Trigger existiert
                           nicht) berichtigt
    Entscheidungen         drei, je mit EINER Frage gestellt und
                           mit dem, was daran haengt — nicht
                           beantwortet

`backup/g226-plans.png` — der Meal-plans-Reiter mit fuenf echten
Karten (Plan-Eintraege, Planumfang, Lebenszyklus, Herkunft,
Einhaltung).

### Was daraus als neue Punkte folgt

`[read]` **Zwei Funde gehoeren nicht in diese acht:**

**1. `page.tsx:46` nennt `display_tier` das Abo-Gate** — dieselbe
Verwechslung, die G-140 und G-239 zweimal aufgeraeumt haben.
**Kommentar, keine Wirkung; aber er fuehrt den naechsten Leser in die
Irre.**

**2. `food_tags` hat 30.797 Zeilen und keinen Pflegeweg.** `[read]`
**Das ist groesser als G-229 und trifft nicht nur Admins:** wer einen
falschen Tag findet, kann ihn nirgends melden oder aendern.

### Laeufe

`[read]` **Nichts gebaut, also nichts zu pruefen** — keine
Codeaenderung, keine neuen Waechter, kein Gate-Lauf noetig. **Die
einzige Schreibarbeit ist dieser Bericht.**

## Abnahme

**2026-08-31, Orchestrator.**

**Zehn Urteile, und keiner heisst *erledigt*.**

    ueberholt      G-226, G-230, G-235
    offen          G-227, G-229
    Entscheidung   G-222, G-228, G-238
    A-16           archivieren
    A-35           geschlossen, alle sieben aufgeloest

### Zwei meiner acht Messungen waren falsch

`[cmd]` **G-228: `SPEC_04_FEATURES.md` gibt es in acht Modulen.** Die
mit `level_multiplier` ist **Nutrition**, nicht Recovery. `[read]`
**Mein Recovery-Umweg ueber C-143/C-218 fuehrte weg vom Thema.**

`[cmd]` **G-229: die wichtigere Tatsache ist nicht `apps/admin`** —
**es ist, dass `auto_tag_food` nicht existiert.** `[cmd]` **Kein
Trigger im Nutrition-Schema schreibt Tags** — **damit faellt der
zentrale Einwand der Review**, der Trigger loesche vor dem Einfuegen
alle Tags.

### Der einzige Befund, der heute beisst

`[cmd]` **Die Review fragte, woher `user_level` kommt. Es hat jetzt
eine Antwort, und die zeigt einen Bruch:**

    SPEC_04:336                beginner | intermediate | advanced | elite
    profiles.experience_level  beginner | advanced | pro | elite  (CHECK)
    live                       2x 'pro', 5x NULL
    diary-entwurf.tsx:31       die vier Namen der Spec, `?? 0.90`

`[read]` **Die Spec kennt `intermediate`, die Datenbank kennt `pro`,
und keine kennt die andere** — **ein `pro`-Profil faellt still auf
0,90, den Wert fuer `intermediate`.**

`[read]` **Als eigener Punkt, weil er wirkt: G-283.**

### Die drei ueberholten sind sauber belegt

`[cmd]` **G-226: kein Recipes- oder Shopping-Reiter, die Woerter
kommen null Mal am Schirm vor** — genau das *,,schema only, no full
UI"* des ADR.

`[cmd]` **G-230: alle vier Pfade liefern 404.**

`[cmd]` **G-235: `display_tier` ist eine Anzeigetiefe, kein
Abo-Gate** — Stufe 1 traegt Kalorien und Calcium, Stufe 3
Aminosaeuren und Carotinoide.

### A-16 und A-35

`[cmd]` **A-16: archivieren, nicht loeschen.** `[read]` **Und ein
Nebenbefund, der schwerer wiegt als der Fundus:** `[cmd]` **die 94
Mockup-Dateien, 592 kB, werden ohne Anmeldung ausgeliefert** —
gemessen aus einer abgemeldeten Sitzung. `[cmd]`
**`/mockup/index.html` ist ein lauffaehiges zweites Produkt neben dem
echten.** **Als G-284.**

`[cmd]` **A-35: alle sieben aufgeloest, keiner der Coaches-Fall.**
Buddy ist unter `/v2/coach/ai` mit 20 Reitern gebaut, *completeness*
sind die Einstellungen, *crossmodule* ein Querverweis in
`goals`/`recovery` — **die uebrigen drei hat A-36 schon geklaert.**

### Und er hat gemeldet, was ihm auffiel

`[cmd]` **A-16 und A-35 lagen in `next/`, nicht ausgegeben** — **er
hat sie an Ort und Stelle bearbeitet und es gesagt.** `[read]` **Mein
Fehler, seiner Meldung nach berichtigt.**

`[cmd]` **Zwei weitere Befunde, die zu keinem Punkt gehoeren:**
`page.tsx:46` nennt `display_tier` weiter *,,das Abo-Gate"* — **die
Verwechslung, die G-140 und G-239 schon zweimal geklaert haben.**
**Und `food_tags` traegt 30.797 Zeilen ohne jeden Pflegeweg.**
**Als G-285 und C-366.**

**Abgenommen.**

