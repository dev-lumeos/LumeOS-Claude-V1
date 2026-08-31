---
nr: E-41
getroffen: 2026-08-31
von: Tom
status: gueltig
loest_ab: null
abgeloest_durch: null
betrifft: [C-372, C-370, G-298, G-305, C-375]
modul: nutrition
---

# E-41 — Bibliothek, Werkbank und zwei verschiedene Sperren

## Entscheidung

Tom, 2026-08-31, als Erweiterung zu E-40:

> die fertigen Plaene werden in Meal plans aufgelistet, da kann ein
> User denjenigen den er will aktivieren gemaess Vorgaben, da kann er
> editieren (die gekauften Plaene oder vom Coach brauchen ein Flag das
> definiert ob es editable sein soll oder nicht)
>
> edit oder neuer Plan bleibt beim Planner, dann brauchen wir da auch
> eine Auflistung aller Plaene
>
> im Planner soll man Einzelpositionen oder fertige Rezepte einfuegen
> koennen
>
> Rezepte sind mehrere Nutrients als Rezept, das kann auch die
> Zubereitung beinhalten und koennen auch kaufbar sein

## Die Rollenteilung

    Meal plans   Bibliothek: alle Plaene, aktivieren,
                 "Bearbeiten" fuehrt in den Planner
    Planner      Werkbank: Auflistung aller Plaene, neu anlegen,
                 Positionen und Rezepte einfuegen

`[read]` **Bearbeiten fuehrt in den Planner, statt in der Bibliothek
selbst zu editieren** — **sonst gibt es wieder zwei Orte fuer
dasselbe, und genau das war der Befund vom 31.08.**

## Zwei Sperren, die nichts miteinander zu tun haben

### 1 · Aktiv — die Positionen sind eingefroren

`[cmd]` **`ADR_IMPROVEMENTS_PACKAGE` #17, und dieselbe Regel in
`SPEC_01` Abschnitt 8, `SPEC_04` und `SPEC_02_PATCH_NOTES`:**

    MealPlan.status = 'active'
      -> MealPlanDay READ-ONLY
      -> MealPlanItem READ-ONLY
      -> API gibt 409 bei PUT/PATCH/DELETE

`[cmd]` **Die Begruendung steht dort:** *,,MealPlanLog referenziert
`plan_item_id`. Wenn Items nachtraeglich geaendert werden, stimmt die
Compliance-History nicht mehr."*

`[cmd]` **Der Ausweg steht auch dort:** *,,Coach oder User muss Plan
pausieren, eine Kopie erstellen, bearbeiten und neu aktivieren.
Original-Plan mit seinem Log bleibt unveraendert erhalten."*

`[read]` **G-298 hat am 31.08. Positionen bearbeitbar gemacht — an
einem Plan mit `status = active`.** **Weder der Agent noch der
Orchestrator hatten den ADR gelesen.** **Das gehoert zurueckgebaut.**

### 2 · Fremde Herkunft — darf der Empfaenger ueberhaupt

Tom: *,,die gekauften Plaene oder vom Coach brauchen ein Flag das
definiert ob es editable sein soll oder nicht."*

`[cmd]` **Es gibt kein solches Flag** — kein `editable`, `readonly`,
`locked` oder `is_template` in `nutrition` oder `coach`.

`[read]` **Diese Sperre gilt je Herkunft und unabhaengig vom
Status.** `[read]` **Wer einen Plan verkauft oder als Coach vergibt,
entscheidet, ob der Empfaenger ihn aendern darf.**

## Warum die Unterscheidung zaehlt

    aktiv          betrifft jeden Plan, kommt vom Log
    nicht editierbar  betrifft fremde Plaene, kommt vom Ersteller

`[read]` **Ein eigener Plan im Entwurf ist voll bearbeitbar.**
**Ein eigener aktiver Plan ist eingefroren.** **Ein gekaufter Plan
kann beides sein.**

## Was daraus folgt — der Vorschlag des Orchestrators

`[read]` **Wenn ein aktiver Plan nur ueber *pausieren, kopieren,
bearbeiten* aenderbar ist, braucht die Bibliothek einen Knopf dafuer.**
`[read]` **Sonst ist die Regel eine Sackgasse: der Nutzer sieht, dass
er nicht darf, und findet keinen Weg.**

**Vorschlag: ein Knopf *,,Kopie bearbeiten"* an jedem aktiven
Plan** — er legt eine Kopie an, oeffnet sie im Planner, und der
Original bleibt mit seinem Log stehen.

## Rezepte

Tom: *,,Rezepte sind mehrere Nutrients als Rezept, das kann auch die
Zubereitung beinhalten und koennen auch kaufbar sein."*

`[cmd]` **Die Zubereitung ist im Schema:** `instructions`,
`prep_time_min`, `cook_time_min`, `servings`, `cuisine_code`,
`cooking_skill`.

`[cmd]` **Was fehlt, ist `source`** — C-371 laeuft bei Codex.

`[cmd]` **Und `SPEC_01` Abschnitt 9 sagt dasselbe wie fuer Plaene:**
*,,Ein Rezept ist eine wiederverwendbare Mahlzeit-Vorlage. Quellen:
user | coach | marketplace | buddy."*

`[read]` **Also dieselbe Flag-Frage wie bei Plaenen** — ein gekauftes
Rezept kann geschuetzt sein.
