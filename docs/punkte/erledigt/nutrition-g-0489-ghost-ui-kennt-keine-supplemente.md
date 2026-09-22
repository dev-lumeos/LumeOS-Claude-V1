---
nr: G-489
typ: feature
modul: nutrition
schwere: hoch
angelegt: 2026-09-08
braucht: [C-524]
kind_von: C-524
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: 3ed2eac5
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/plan-eintraege.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-489 - die Ghost-UI kennt keine Supplemente

## Befund

Aus C-524, Codex, 2026-09-08:

> *,,Die Ghost-UI bleibt unveraendert: Sie stuerzt nicht ab,
kann Supplement-Planeintraege aber noch nicht anzeigen oder
bestaetigen."*

## Der Weg steht schon

> *,,Dafuer muss der spaetere UI-Weg die Referenz LESEN und
nach dem Anlegen der Mahlzeit `record_supplier_product_intake(
..., meal_id)` aufrufen."*

`[cmd]` **C-524 bringt die Absichtsreferenz, C-519 die
Einnahmefunktion** ? **beides liegt vor.**

`[read]` **Ein Planeintrag ist eine ABSICHT, das Bestaetigen
macht daraus eine EINNAHME.**

## Und die Formregel steht in der Datenbank

`[cmd]` **C-524 weist Capsule, Tablet, Softgel, Lozenge im
Plan ab** ? **die Oberflaeche muss sie nicht noch einmal
pruefen, aber sie soll es ERKLAEREN.**

## Abnahmebedingungen

    A1  ein Supplement im Ghost sichtbar. Foto.
    A2  Bestaetigen macht eine Einnahme daraus, mit
        intake_log. Belegt.
    A3  die Tagesbilanz zaehlt es. Zahl.
    A4  eine Kapsel im Plan: was sagt die Flaeche?
        Foto.
    A5  ein Plan ohne Supplemente unveraendert. Foto.
    A6  vier Module unveraendert.

## Bericht

**Es fehlte nicht nur das Bestaetigen — es gab keinen Weg hinein.**

    A1  ein Supplement im Ghost sichtbar     erfuellt
    A2  Bestaetigen -> intake_log            erfuellt
    A3  die Tagesbilanz zaehlt es            erfuellt
    A4  eine Kapsel im Plan: was sagt sie?   erfuellt
    A5  ein Plan ohne Supplemente unveraendert erfuellt
    A6  vier Module unveraendert             erfuellt

`[cmd]` **`supabase/` unberuehrt** — die dortige Aenderung ist
Codex' C-532.

### A1 — ueber welchen Weg kommt ein Supplement in den Plan?

`[read]` **Das war die Frage des Auftrags, und die Antwort war:
ueber gar keinen.**

`[cmd]` **Gemessen 2026-09-22, VOR dem Bauen:**

    nutrition.meal_plan_entries             648 bls
                                            108 recipe
                                              0 supplement
    supplements.meal_plan_product_references  0 Zeilen

`[cmd]` **Die Datenbank kann es seit C-524:**

    meal_plan_entries_entry_type_check
      CHECK (entry_type = ANY (ARRAY['recipe','bls','custom',
                                     'supplement']))

`[cmd]` **Die Oberflaeche kannte drei:**

    plan-eintrag-lage.ts:29
      EINTRAG_TYPEN = ['recipe', 'bls', 'custom']

`[cmd]` **Und `verletztCheck` verlangte GENAU EINE Quelle-Id** —
**ein Supplementeintrag traegt KEINE:**

    (entry_type = 'supplement') AND recipe_id IS NULL
      AND food_id IS NULL AND custom_food_id IS NULL
      AND amount_g IS NULL AND planned_servings IS NULL

`[read]` **Die Probe haette gemeldet: *„Genau eine Quelle muss
gesetzt sein, gesetzt sind 0"*** — und das Supplement waere nie
in einen Plan gekommen.

**Gebaut:** `supplement` in `EINTRAG_TYPEN`, ein eigener Zweig in
`verletztCheck`, `feldFuer` gibt `keines` zurueck. `[read]` **Die
Menge steht in der Referenz, nicht im Planeintrag.**

### A1 — und jetzt steht es da

`[cmd]` **Gemessen am Schirm** (Karte `.v2-ghost-offen`):

    "📖 ON Optimum Nutrition Gold Standard 100% Whey
     Chocolate Hazelnut
     1 × 33 Gram(s) · 130 kcal, 24 g Protein"

`[cmd]` **Der Name kommt aus der C-524-Referenz** — **in einem
anderen SCHEMA**, und PostgREST bettet ueber Schemagrenzen nicht
ein (G-485). `[read]` **Also nachgelesen, ueber die eine Datei,
der die `supplements`-Tabellen gehoeren** (G-138) — **verschoben,
nicht den Waechter gelockert.**

### Zwei Fehler, die erst die Messung gezeigt hat

**1 — der Bestaetigen-Knopf war gesperrt.**

`[cmd]` **Gemessen: `<button disabled …>Bestätigen</button>`.**
`[cmd]` **Der Grund:** `disabled={laeuft || posten.length === 0}`
— **und ein Supplementeintrag hat keine Posten.**

`[read]` **Ein Ghost, den man nicht einloesen kann, ist schlimmer
als keiner** — er sieht aus wie ein Angebot. `[cmd]` **Die
Bedingung fragt jetzt nach dem INHALT:** Posten ODER ein Produkt.

**2 — der Leersatz nannte den falschen Grund.**

`[cmd]` **Die Karte zeigte:** *„Für diese Planposition sind keine
Lebensmittel hinterlegt."* `[read]` **Es IST etwas hinterlegt,
nur kein Lebensmittel** — die Lehre aus G-491: **ein Vermerk mit
falschem Grund ist schlimmer als keiner.**

`[cmd]` **Jetzt steht dort die Portion aus der Referenz** — und
ohne Naehrwerte ein benannter Leerhinweis statt einer Null
(E-72).

### A2/A3 — aus der Absicht wird eine Einnahme

**Codex, C-524:** *„die Referenz LESEN und nach dem Anlegen der
Mahlzeit `record_supplier_product_intake(…, meal_id)` aufrufen."*

`[cmd]` **Genau so gebaut**, und der Zweig steht VOR der
Postenpruefung — sonst faengt sie den Eintrag mit der falschen
Meldung ab.

`[cmd]` **Gemessen, gegen die DATENBANK:**

    intake_logs heute   vorher 6   nachher 7
    die neue Zeile      ON Optimum Nutrition Gold Standard
                        100% Whey Chocolate Hazelnut
                        33 Gram(s) · 1.000
    meal_plan_logs      status = confirmed
                        actual_meal_id gesetzt

`[read]` **Nicht am Statuscode geprueft** — G-484 hat gemessen,
dass eine Fehlermeldung ueber einen Erfolg moeglich ist.

`[cmd]` **`record_supplier_product_intake` ist `RETURNS uuid`** —
`data` IST die Id. **Der Waechter prueft das mit.**

### A4 — die Kapsel, und was die Flaeche sagt

`[cmd]` **In einer Transaktion belegt, mit ROLLBACK:**

    INSERT … Ultraplex Vitamin D3 (Capsule [E0159])
    -> ERROR: Diese Produktform ist nicht für einen
              Mahlzeitplan zugelassen
       CONTEXT: validate_meal_plan_product_reference() line 28

`[cmd]` **Dasselbe mit einem Pulver: angenommen.**

`[read]` **Die Oberflaeche prueft die Formregel NICHT noch
einmal** — der Auftrag sagt: *„sie muss sie nicht noch einmal
pruefen, aber sie soll es ERKLAEREN."* `[cmd]` **Die Meldung der
Datenbank wird durchgereicht**, nicht durch eine eigene ersetzt:
**sie ist die Wahrheit ueber den Grund.**

### A4 (Foto) — gruen und abgehakt, wie in G-486

`[cmd]` **Gemessen, dieselbe Karte vorher und nachher:**

    vorher   .v2-ghost-offen     "· aus deinem Plan"
    nachher  .v2-ghost-erfuellt  "· erfüllt"
             "Erfüllt — die erfasste Mahlzeit steht oben."

`[read]` **Der Status haengt an `meal_plan_logs`**, genau wie
G-486 es gemessen hat — **ein bestaetigter Supplement-Ghost steht
gruen und abgehakt stehen.**

`[cmd]` **Der Zustand ist immer `confirmed`, nie `deviated`** —
eine Abweichung setzt einen kcal-Vergleich voraus, und eine
Kapsel hat keinen.

### A5 — ein Plan ohne Supplemente

`[cmd]` **Auf dem Foto: vier Ghost-Karten unveraendert**
(Frühstück, Mittagessen, Nachmittagssnack, Abendessen), mit ihren
Posten, Mengen und Knoepfen. `[cmd]` **Nur die fuenfte ist neu.**

### Was ich NICHT geaendert habe

`[cmd]` **Die Supplement-Karte traegt die Ueberschrift
*„Frühstück"*, obwohl der Eintrag `pre_workout` ist.**

`[cmd]` **Gemessen:** die Datenbank hat `pre_workout | 05:30`
richtig; **der Name kommt aus `mahlzeitName`** (G-335), und
**`test-user` hat fuenf Slots — keiner davon `pre_workout`:**

    1 Frühstück · 2 Snack · 3 Mittagessen
    4 Nachmittagssnack · 5 Abendessen

`[read]` **Das ist die bestehende G-335-Regel fuer Kategorien
ohne eigenen Slot, kein Fehler dieses Auftrags.** `[read]` **Die
gemeinsame Namensaufloesung zu aendern, waere eine Entscheidung
ueber Diary, Plan und Rezepte zugleich** — **gemeldet, nicht
angefasst.**

### Der Waechter, und fuenf gruene Schaeden

`[cmd]` **`g489-supplement-im-plan.test.ts`, 9 Faelle.** `[cmd]`
**`_g489-sabotage.mjs`: 15 Schaeden plus Kontrolle.**

`[cmd]` **Erster Lauf: 10/15.** `[read]` **Fuenf gruen — und
KEINER davon war ein blinder Waechter im ueblichen Sinn:**

    2x  Praefix-Kollision: `…intake` ist ein Praefix von
        `…intakeX`, die Zusicherung traf weiter
    3x  zweites Vorkommen: `planProduktverweise` steht je
        zweimal (Import + Aufruf), der Rest erfuellte sie

`[cmd]` **Nach dem Nachziehen: 14/15.** `[read]` **Der letzte war
ein ECHTER Waechterfehler:** die Zusicherung suchte den Text
`posten.length === 0 && !eintrag.supplement` — **und der steht
ZWEIMAL** (Knopf und Leersatz). **Die Sabotage am Knopf blieb
gruen, weil der Leersatz sie weiter erfuellte.**

`[cmd]` **Jetzt prueft sie das `disabled` DES KNOPFES** — 15/15.

### Ein fremder Waechter musste nachgeben

`[cmd]` **`plan-eintrag-lage.test.ts` (G-298) wurde rot:**
*„supplement: keine Einheit"*. `[cmd]` **Er verlangte fuer JEDEN
Typ eine Einheit** — **und `supplement` hat kein Mengenfeld.**

`[read]` **Die Zusicherung bleibt, was sie war:** wo ein Feld
STEHT, braucht es Beschriftung und Einheit. **Sie gilt jetzt fuer
die Typen mit Feld.**

`[cmd]` **Und sie ist belegt, dass sie noch rot werden kann:** die
Sabotage *„eine Einheit faellt weg"* laeuft gegen SEINE Testdatei
— **rot.** `[read]` **Eine gelockerte Zusicherung ohne Beleg waere
eine stillgelegte.**

### Neustart noetig?

`[read]` **Nein** — nur `apps/web/src`.

### Die Fotos

    x-g489-a1-ghost.png        A1: das Supplement im Plan
    x-g489-a1-ghost-offen.png  A1: die Karte, offen
    x-g489-a4-erfuellt.png     A4: gruen, abgehakt, "erfüllt"
                               + vier unveraenderte Karten (A5)

### Der Nachweiseintrag bleibt liegen

`[cmd]` **Ein Planeintrag (`pre_workout`, 05:30) mit Referenz und
bestaetigtem Log steht in der Datenbank** — **als Beleg, nicht als
Altlast.** `[read]` **Loeschen ist Toms Entscheidung.**

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

    meal_plan_entries   bls 648 | recipe 108 | supplement 1
    meal_plan_logs      11 bestaetigt
    intake_logs heute   7

### A1 war die eigentliche Frage

> *,,Ueber GAR KEINEN Weg. Gemessen 648 bls, 108 recipe, 0
supplement, 0 Referenzen. Die Datenbank kann es seit C-524, die
Oberflaeche kannte drei Typen, und `verletztCheck` verlangte
genau EINE Quelle-Id."*

`[read]` **Es fehlte nicht nur das Bestaetigen, sondern der
ganze Weg hinein.**

`[cmd]` **Bestaetigen macht eine Einnahme: intake_logs 6 -> 7,
`meal_plan_logs.status = confirmed`, Karte gruen wie G-486.**

`[cmd]` **Die Kapsel weist die Datenbank ab, die Oberflaeche
reicht die Meldung durch** ? **Regel nicht nachgebaut.**

### Zwei Befunde, bewusst nicht geaendert

`[cmd]` **Die Karte betitelt einen pre_workout-Eintrag als
*,,Fruehstueck"*** ? **G-335-Namensaufloesung ohne passenden
Slot.**

`[cmd]` **Ein Nachweis-Planeintrag vom 2026-09-22 liegt
bewusst in der Datenbank.**

**Abgenommen.**
