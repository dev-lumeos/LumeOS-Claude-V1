---
nr: G-274
typ: feature
modul: nutrition
schwere: hoch
angelegt: 2026-08-30
braucht: []
kind_von: G-270
entscheidung: null
beruehrt:
  tabellen: [nutrition.meal_plan_logs, nutrition.meals]
zahlen:
  gemessen: 2026-08-30
  plan_eintraege: 112
  plan_tage: 42
  logs: 0
agent: claudecode
beauftragt: 2026-08-30
erledigt: 2026-08-30
commit: OFFEN
---

# G-274 — der Bestaetigungsweg fuer Plan-Eintraege

## Befund

`[cmd]` **112 Plan-Eintraege ueber 42 Tage, ein aktiver Plan — und
0 Zeilen in `meal_plan_logs`.**

`[read]` **Das ist die Ursache aller drei Attrappen aus G-270.** Ghost
Entries, Lifecycle und Compliance lesen aus dem Log, **und niemand
schreibt hinein.**

`[cmd]` **Das Schema steht seit dem 30.08. vollstaendig:**
`plan_id`, `plan_entry_id`, `execution_date`, `status`,
`actual_meal_id`, `confirmation_mode`, `deviation_kcal`,
`deviation_pct`, `confirmed_at`, `skipped_at`.

## Auftrag

**Der Knopf *Confirm as planned* schreibt.** Dazu *Skip* und
*Log deviation*.

### Was der Bildschirm heute zeigt

`[cmd]` **Toms Bildschirmfoto vom 28.08.:** fuenf Eintraege mit
`confirmed`, `deviated`, `pending` — **und drei Knoepfe je Zeile:**
*Confirm as planned*, *MealCam*, *Log deviation*, *Skip*.

`[read]` **Die Gestalt steht. Was fehlt, ist der Schreibweg.**

### Die vier Zustaende kommen aus dem Flow

`[cmd]` **`SPEC_03_USER_FLOWS` Flow 4 beschreibt das Bestaetigen in
vier Faellen, einschliesslich rueckwirkend.** `[read]` **Lies ihn
zuerst** — Codex hat den Status daraus entworfen, nicht aus der
Vorlage.

### Was *Confirm as planned* bedeutet

`[read]` **Ein bestaetigter Eintrag ist eine gegessene Mahlzeit.**
`[cmd]` **`actual_meal_id` verweist auf `nutrition.meals`** — **also
entsteht beim Bestaetigen auch ein Eintrag im Tagebuch.**

`[read]` **Miss, ob das gemeint ist.** **Wenn ja, nutz den Schreibweg
aus G-272** — `createMeal` und `addMealItem` stehen und sind belegt.
**Kein zweiter Weg.**

`[read]` **Wenn nein: sag es, bevor du baust.** **Ein Log ohne
Tagebucheintrag ist eine Zusage, die die Bilanz nicht kennt.**

### *Log deviation*

`[cmd]` **`deviation_kcal` und `deviation_pct` stehen im Schema.**
`[read]` **Eine Abweichung ist eine andere Mahlzeit als die
geplante** — **nicht keine.**

`[cmd]` **Toms Bildschirmfoto zeigt es:** *,,Mandeln → Walnuesse"*.

### Was nicht zu tun ist

**Kein Schema aendern** — es steht vollstaendig.
**Keine zweite Ansicht, keinen zweiten Schreibweg.**
**Nichts auf `dev@lumeos.app`** — `test-user@lumeos.local` mit
Rueckbau, wie in G-272 und G-267.
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    Confirm schreibt        Log-Zeile, belegt mit Rueckbau
    Tagebucheintrag         entsteht er? gewollt?
    Skip schreibt           Log-Zeile mit `skipped_at`
    Abweichung              Log-Zeile mit `deviation_*`
    Ghost Entries           echte Zeilen statt Leerzustand
    7-day compliance        rechnet aus dem Log
    rueckwirkend            Flow 4 kennt den Fall - geht er?
    Attrappen               vorher / nachher, am Schirm
    Ladezeit                ms, kalt und warm

`[read]` **Die drei mittleren Zeilen sind das Ergebnis:** **nach
diesem Auftrag zeigt der Reiter echte Zahlen, keine ehrlichen
Leerzustaende mehr.**

### Regeln

`tools/lauf.py`, keine Konsolenfenster.
`[cmd]` **A-30, A-59, A-60.**
`[cmd]` **A-62:** ein Waechter, der eine Abwesenheit sichert, kippt
still, wenn die Sache kommt. **Deine eigenen aus G-270 betreffen
genau dieses Log.**

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Bericht

**Claude Code, 2026-08-30.** Alle Zahlen mit Nutzer und Zeitraum.

### Die Kurzfassung

**Die Frage vor dem Bauen ist beantwortet, und zwar aus dem Flow:**
`[cmd]` **`SPEC_03_USER_FLOWS` Flow 4, Case 1 Schritt 6** sagt
woertlich *,,Mahlzeit wird erstellt (Meal + MealItems mit
eingefrorenen Naehrstoffen)"*, Schritt 8 *,,MealPlanLog wird
geschrieben"*. **Also ja — und in dieser Reihenfolge.**

**Der Weg aus G-272 wird gerufen, nicht nachgebaut.**

**Der Reiter zeigt echte Zahlen.** `[cmd]` **Auf `dev`, 18.06.2026:
*,,4 von 4 offen"* mit drei Knoepfen je Zeile.** `[cmd]` **Auf
`test-user` nach der Probe: 6 Log-Zeilen, Einhaltung 50 %,
*,,bestaetigt 3, abgewichen 2, ausgelassen 1"*.**

### Die Nachweiszeilen

| Zeile | Ergebnis |
|---|---|
| Confirm schreibt | **Log + Mahlzeit**, mit Rueckbau belegt |
| Tagebucheintrag | **entsteht — und ist gewollt**, Flow 4 Schritt 6 |
| Skip schreibt | **`skipped` mit `skipped_at`, ohne Mahlzeit** |
| Abweichung | **`deviated` mit beiden Zahlen**, Schwelle aus dem Flow |
| Ghost Entries | **echte Eintraege statt Leerzustand** — 4 von 4 offen auf dev |
| 7-day compliance | **rechnet aus dem Log** — 50 % bei 6 Zeilen |
| rueckwirkend | **geht** — auf 24.–28.08. gebucht, mit Hinweis am Schirm |
| Attrappen | **0**, vorher wie nachher |
| Ladezeit | **3.920 ms kalt / 3.053 ms warm** (dev) |

### 1 · Die Frage vor dem Bauen

**Der Auftrag:** *,,Miss, ob das gemeint ist. Wenn nein: sag es,
bevor du baust."*

`[cmd]` **Flow 4 beantwortet es zweimal.** Case 1:

    6. Mahlzeit wird erstellt (Meal + MealItems mit
       eingefrorenen Naehrstoffen)
    7. Ghost Entry -> confirmed (oder deviated wenn dkcal > 20%)
    8. MealPlanLog wird geschrieben

`[read]` **Und die Reihenfolge ist keine Geschmacksfrage:**
`actual_meal_id` verweist auf `nutrition.meals` — **das Log kann erst
entstehen, wenn die Mahlzeit da ist.** Ein Test haelt es fest.

`[cmd]` **Also `createMeal` und `addMealItem` aus G-272** — sie
frieren die Naehrwerte bereits ein, genau was Schritt 6 verlangt.
**Kein zweiter Weg**, und ein Test verbietet einen direkten Zugriff
auf `meal_items`.

### 2 · Was die Messung noetig gemacht hat

`[cmd]` **Die Zahlen des Auftrags stimmen:** 112 Eintraege, 42 Tage,
2 aktive Plaene, **0 Logs.**

`[cmd]` **Zwei Befunde kamen dazu, und beide haben den Bau
geaendert:**

**a) 72 der 112 Eintraege sind `recipe`, 40 sind `bls`.** `[cmd]`
**`addMealItem` verlangt ein `food_id`** — ein Rezept als Ganzes kann
es nicht. `[cmd]` **Die Zutaten tragen alle eines** (gemessen: 4 von
4, 3 von 3). **Also wird ein Rezepteintrag zu seinen Zutaten
aufgeloest**, mit `planned_servings` als Faktor.

**b) `UNIQUE (plan_entry_id, execution_date)`** — ein Log je Eintrag
und Tag. `[read]` **Deshalb `upsert`, nicht `insert`:** zweimal
bestaetigen soll die Zeile aendern, nicht scheitern. **Gegengeprobt:
derselbe Aufruf zweimal liefert dieselbe `id`.**

`[cmd]` **Und `createMeal` wirft `DUPLICATE_MEAL`**, wenn Tag und
Mahlzeitart schon existieren. `[read]` **Bestaetigen darf daran nicht
scheitern** — wer mittags schon erfasst hat, bekommt die Posten in
dieselbe Mahlzeit.

### 3 · Die Schwelle stammt aus dem Flow

`[cmd]` **Flow 4 nennt sie zweimal: *,,deviated wenn dkcal > 20%"*.**
**Keine erfundene Zahl.**

`[cmd]` **An der laufenden Datenbank gegengeprobt** (test-user,
2026-08-30): geplant 150 g = **166,5 kcal**.

    170 g = 188,7 kcal   +13,3 %   -> confirmed
    200 g = 222,0 kcal   +33,3 %   -> deviated

`[read]` **Die Grenze gehoert zur unauffaelligen Seite** — Flow 4
sagt *groesser als*, nicht *ab*. **Und zu wenig ist auch eine
Abweichung:** wer die Haelfte isst, weicht ab; ein Betrag ohne
Vorzeichen verloere die Richtung.

### 4 · Die Schreibprobe, mit Rueckbau

`[cmd]` **`test-user@lumeos.local`, ueber die Route:**

    1 BLS bestaetigen (rueckwirkend 28.08.)  200  confirmed
    2 Rezept bestaetigen (2 Zutaten)         200  confirmed
    3 nochmal derselbe                       200  gleiche id
    4 andere Menge                           200  deviated, +33,3 %
    5 ueberspringen                          200  skipped, ohne Mahlzeit
    6 confirmation_mode 'zettel'             400  VALIDATION_FAILED

`[cmd]` **Was danach in der Datenbank stand:** 6 Log-Zeilen ueber
24.–28.08., **5 Mahlzeiten mit eingefrorenen kcal** (222, 189, 1.404,
185, 333) — **und die `skipped`-Zeile ohne Mahlzeit.**

`[cmd]` **Ueber die Oberflaeche gegengeprobt:** ein Log entfernt,
Reiter zeigte *,,1 von 2 offen"*, Klick auf *Wie geplant*, danach
*,,0 von 2 offen"* und die Quote bei 50 %.

`[cmd]` **Rueckbau in der Reihenfolge, die `ON DELETE RESTRICT`
verlangt** — erst Logs, dann Posten, Mahlzeiten, Plan, Rezept:
**6 + 8 + 5 + 1 + 2 + 1 geloescht, Gegenprobe alles 0.**
`[cmd]` **Der Altbestand von test-user (Mahlzeit vom 16.08.) blieb**,
**dev unveraendert bei 1 Plan, 0 Logs.**

### 5 · Was der Reiter jetzt zeigt

`[cmd]` **Auf `dev`, 18.06.2026 (ein Tag mit Planeintraegen):**
*,,Plan-Eintraege · 4 von 4 offen"* — Fruehstueck, Mittag, Snack,
Abendessen mit Namen, Zustandspille und drei Knoepfen: *Wie geplant*,
*MealCam*, *Auslassen*.

`[read]` **Die Karte zeigt die EINTRAEGE, nicht die Logs.** `[cmd]`
**Die alte `GhostEintraegeEcht` las Log-Zeilen** — und war damit am
ersten Tag leer, **weil ein Eintrag ohne Log gar nicht vorkam.**
**Entfernt** (A-59), ersetzt durch `PlanEintraegeEcht`.

`[cmd]` **Rueckwirkend wird benannt:** *,,Wird auf den 2026-06-18
gebucht, nicht auf heute."* `[cmd]` **Flow 4 verlangt es und verbietet
eine Sperre:** *,,Ghost Entries haben kein automatisches Expiry."*

`[cmd]` **Die Einhaltung rechnet aus dem Log** — auf dev steht sie
weiter auf dem Leerzustand (0 Logs), **auf test-user zeigte sie
50 %.** `[read]` **Beides richtig:** ohne Entscheidung keine Quote,
nicht null Prozent.

### 6 · Die Sabotagen — 10 von 10 fallen

Jede einzeln, Rueckbau bytegleich per SHA-256.

| # | Sabotage | faellt |
|---|---|---|
| 1 | die 20-Prozent-Schwelle wird veraendert | ja |
| 2 | zu wenig gilt nicht mehr als Abweichung | ja |
| 3 | genau 20 % gilt schon als Abweichung | ja |
| 4 | `pending` darf eine halbe Bestaetigung tragen | ja |
| 5 | `skipped` darf eine Mahlzeit tragen | ja |
| 6 | ohne Bezugsgroesse wird trotzdem gerechnet | ja |
| 7 | die Mahlzeit entsteht nicht mehr | ja |
| 8 | der UNIQUE wird nicht mehr behandelt | ja |
| 9 | Rezepteintraege werden nicht aufgeloest | ja |
| 10 | die Knoepfe stehen an entschiedenen Eintraegen | ja |

**Drei Runden, und jede hat etwas gefunden:**

`[cmd]` **Ein eigener Test fand einen Fehler in meinem Code:**
`felderPassen('skipped', …)` liess eine Zeile mit gesetzter
`actual_meal_id` durch, **weil `bestaetigt` alle drei Felder
verlangt.** **Der Datenbank-CHECK prueft jedes einzeln** — nachgezogen,
fuer `skipped` UND `pending`.

`[cmd]` **Sabotage 4 ueberlebte dann trotzdem:** mein Test setzte
alle drei Felder gleichzeitig, also griff auch die schwache Form.
**Zwei Faelle mit je EINEM gesetzten Feld ergaenzt.**

`[cmd]` **Und Sabotage 8 ueberlebte zweimal:** erst suchte der Test
nur `onConflict` im Text, dann nur `.upsert(` — **eine Sabotage, die
`{ onConflict: … }` entfernte, liess beides stehen.** **Jetzt werden
`upsert`-Aufrufe und `onConflict`-Angaben gezaehlt und verglichen.**

### 7 · Gate und Testlage

`[cmd]` **`pnpm gate`: 11 von 11 gruen.** `[cmd]` **Typecheck sauber,
Build gruen.** `[cmd]` **353 von 353 Nutrition-Tests gruen**, davon
17 neue. `[cmd]` **Encoding sauber, Exit 0.**

`[cmd]` **Am Schirm: 0 Attrappen, keine Doppelung**,
**3.920 ms kalt / 3.053 ms warm** (dev, Reiter `plans`).

`[cmd]` **Zwei eigene Waechter mussten nachgezogen werden** (A-62):
der aus G-270 listete `GhostEintraegeEcht`, die jetzt entfernt ist.

**Bildschirmfotos:** `backup/g274-dev.png` (vier offene Eintraege mit
Knoepfen), `g274-test-user.png` (Zustaende und Quote),
`g274-knopf.png` (nach dem Klick).

**Nichts auf `dev@lumeos.app` geschrieben. `supabase/` nicht
angefasst. Nicht committet, nicht gestaget.**

## Abnahme

**2026-08-30, Orchestrator. Nachgemessen.**

`[cmd]` **`meal_plan_logs` auf `dev` bei 0** — richtig, der Rueckbau
war Teil des Nachweises. `[cmd]` **`uq_meal_plan_logs_entry_execution`
steht.** `[cmd]` **112 Eintraege, davon 72 Rezepte.**

### Die Vorabfrage wurde aus der Spec beantwortet

`[cmd]` **Flow 4, Fall 1, Schritt 6 woertlich:** *,,Mahlzeit wird
erstellt (Meal + MealItems mit eingefrorenen Naehrstoffen)"*, Schritt
8 schreibt das Log.

`[read]` **Und die Reihenfolge folgt daraus:** `actual_meal_id` zeigt
auf die Mahlzeit, **also muss sie zuerst existieren.**

`[cmd]` **Er ruft `createMeal`/`addMealItem` aus G-272, und ein Test
verbietet den direkten Zugriff auf `meal_items`.**

`[read]` **Ich hatte *,,vermutlich"* geschrieben — die Datei sagt es
genau.**

### Zwei Messungen haben den Bau geaendert

`[cmd]` **72 von 112 Eintraegen sind Rezepte, `addMealItem` braucht
ein `food_id`** — **ein Rezepteintrag loest sich in seine Zutaten
auf, skaliert nach `planned_servings`.**

`[cmd]` **`UNIQUE (plan_entry_id, execution_date)`** — also `upsert`:
**zweimal bestaetigen aktualisiert, statt zu scheitern.** `[cmd]`
**Und `createMeal` wirft `DUPLICATE_MEAL`, also wird eine vorhandene
Mahlzeit wiederverwendet.**

### Die Schwelle kommt aus der Spec, nicht aus dem Kopf

`[cmd]` **20 Prozent, zweimal genannt.** `[cmd]` **Gegen die laufende
Datenbank belegt:** 170 g → +13,3 % → `confirmed`, 200 g → +33,3 % →
`deviated`. `[read]` **Und zu wenig zaehlt auch als Abweichung.**

### Drei Sabotage-Runden, jede fand etwas

`[read]` **Der eigene Test fand einen echten Fehler in
`felderPassen`:** eine uebersprungene Zeile konnte eine Mahlzeit
tragen, **weil die Pruefung alle drei Felder zusammen verlangte.**

`[read]` **Dann ueberlebte Sabotage 4, weil die Testdaten alle drei
gleichzeitig setzten.** `[read]` **Und Sabotage 8 zweimal** — erst
prueste der Waechter nur das Wort `onConflict`, dann nur `.upsert(`.
**Jetzt zaehlt er beide und vergleicht.**

### A-62 am selben Tag angewandt

`[cmd]` **`GhostEintraegeEcht` entfernt** — es las Logs und war ab Tag
eins leer. `[cmd]` **Samt dem eigenen G-270-Waechter, der es
auflistete.**

`[cmd]` **Nachweis auf `test-user` mit Rueckbau:** 6 Log-Zeilen, 5
Mahlzeiten mit eingefrorenen Kalorien, die uebersprungene Zeile ohne
Mahlzeit, **rueckwirkende Buchung auf den 24. bis 28.08.** —
**danach alles auf 0, die vorhandene Mahlzeit vom 16.08. unberuehrt,
`dev` unveraendert.**

`[cmd]` 10/10 Sabotagen fallen, Gate 11/11, 353/353 Tests, 0
Attrappen.

**Abgenommen.** Der MealCam-Hinweis geht als **G-276**.

