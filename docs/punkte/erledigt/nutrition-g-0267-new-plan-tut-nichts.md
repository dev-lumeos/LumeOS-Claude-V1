---
nr: G-267
typ: befund
modul: nutrition
schwere: hoch
angelegt: 2026-08-29
braucht: []
kind_von: null
entscheidung: null
agent: claudecode
beauftragt: 2026-08-30
erledigt: 2026-08-30
commit: OFFEN
beruehrt:
  tabellen: [nutrition.meal_plans, nutrition.meal_plan_logs]
zahlen: null
---
# G-267 — *New plan* tut nichts

## Befund

**Tom, 2026-08-29:** *,,new plan geht nix"*.

`[cmd]` **Der Knopf steht oben rechts im Meal-plans-Reiter.**

`[read]` **Und daran haengt mehr als ein Knopf:** wer Plaene erstellen
kann, muss sie auch bearbeiten koennen. **Tom:** *,,wenn man plaene
erstellen kann dann kann man die auch editieren"*. **Als G-268
angelegt.**

## Auftrag

**Mitbeauftragt mit G-271 am 2026-08-29.** Der Auftragstext
und der Bericht stehen dort.

## Zwischenstand, 2026-08-29

**Aus G-271 gemessen:** nicht gebaut: `meal_plans` hat keinen Lebenszyklus, `meal_plan_entries` keinen Status.
**Die Messung steht dort.**

## Auftrag — der Meal-plans-Reiter, vier Punkte

**Mitbeauftragt: G-268, G-269, G-270.** Bericht in diese Datei.

### Vorweg

`[read]` **Dieser Auftrag traegt Zahlen, weil sie gemessen sind** —
alle vom 2026-08-30. **Pruef sie nach.**

`[read]` **Und du hast G-267 im letzten Durchgang zu Recht nicht
gebaut:** *,,ein Knopf, der ein Formular oeffnet, das die Haelfte
seiner Felder nicht speichern kann, ist schlimmer als einer, der
wartet."* **Jetzt kann es speichern.**

### Was seit heute live steht

`[cmd]` **`nutrition.meal_plans` hat sechs neue Spalten:**

    lifecycle_type · start_date · days_count · next_plan_id
    rollover_count · status · plan_origin

`[cmd]` **Und eine neue Tabelle `nutrition.meal_plan_logs`:**

    plan_id · plan_entry_id · execution_date · status
    actual_meal_id · confirmation_mode
    deviation_kcal · deviation_pct · confirmed_at · skipped_at

`[read]` **Das ist die wichtigste Messung des Auftrags:** **der
Status liegt im Log, nicht am Eintrag.** `[cmd]`
**`meal_plan_entries` hat keine Statusspalte** — der Eintrag ist die
Vorlage, das Log die Ausfuehrung.

`[read]` **Wer am Eintrag nach Status sucht, findet keinen und haelt
ihn fuer fehlend.**

### 1 · G-267 — *New plan*

`[read]` **Der Knopf kann jetzt speichern.** `[cmd]` **Die Felder
stehen:** Name, Beschreibung, Ziele, Lebenszyklus, Startdatum,
Tageszahl.

`[cmd]` **`plan_origin` erlaubt `self_created`, `coach_created`,
`marketplace`** — **ein selbst erstellter Plan traegt `self_created`.**

### 2 · G-268 — bearbeiten

`[cmd]` **Die zwei Bestandsplaene tragen `plan_origin = NULL`**, weil
die Herkunft nicht belegbar war. `[read]` **Das ist kein Fehler,
sondern eine ehrliche Leerstelle** — **aber die Oberflaeche muss
damit umgehen koennen.**

### 3 · G-269 — Herkunft und Bearbeitungsrecht

`[cmd]` **`coach.darf_nutrition_plan_aendern(p_client uuid)` existiert
live.** `[cmd]` **Sie erlaubt direkte Aenderungen nur bei voller
Sicht, `nutrition_auto_apply` und Stufe 5.** `[cmd]` **`dev` steht
auf Stufe 3 und bekommt keine Freigabe.**

`[read]` **Also: der Reiter muss den Fall zeigen koennen, in dem
Bearbeiten nicht erlaubt ist** — **und sagen warum, nicht nur den
Knopf ausgrauen.**

`[read]` **E-29 gilt:** ueber die Funktion lesen, nicht direkt in
`coach.client_autonomy`.

### 4 · G-270 — die drei Attrappen

`[cmd]` **Sie haengen alle an `meal_plan_logs`:**

    ghost entries     status je Eintrag und Tag
    Lifecycle types   lifecycle_type am Plan
    7-day compliance  status ueber eine Zeitreihe

`[cmd]` **Und du hast gemessen, dass es fuenf sind, nicht drei** —
zwei weitere unter *Shopping list*. `[cmd]` **`nutrition.shopping_lists`
existiert mit einer Zeile und sechs Positionen** — **die Kachel ist
Attrappe, weil `dev` keine Liste hat, nicht weil die Tabelle fehlt.**

`[read]` **Das ist ein Leerzustand, kein fehlendes Feature** —
dieselbe Unterscheidung wie in C-48.

### Was nicht zu tun ist

**Kein Schema aendern** — Codex arbeitet an C-350.
**Keine zweite Ansicht neben eine bestehende.**
**Nichts erfinden, wo Daten fehlen** — `plan_origin` und
`lifecycle_type` sind bei den Bestandsplaenen `NULL`, **und das
gehoert gezeigt, nicht gefuellt.**
**Nichts auf `dev@lumeos.app` schreiben** — `test-user@lumeos.local`
mit Rueckbau, wie in G-272.
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    New plan               schreibt, belegt mit Rueckbau
    bearbeiten             schreibt, belegt mit Rueckbau
    plan_origin NULL       wie sieht die Zeile aus?
    Bearbeiten gesperrt    dev auf Stufe 3 - was zeigt der Reiter?
    ghost entries          echte Zeilen aus meal_plan_logs
    Lifecycle types        aus lifecycle_type, nicht aus der Vorlage
    7-day compliance       aus dem Log
    Shopping list          Leerzustand, nicht Attrappe
    Attrappen im Reiter    vorher 5, nachher - am Schirm gezaehlt
    Ladezeit               ms, kalt und warm
    Bildschirmfoto         je Zustand

### Regeln

`tools/lauf.py`, keine Konsolenfenster.
`[cmd]` **Der Dev-Server beendet sich von selbst** (G-205).
`[cmd]` **A-30, A-59, A-60**, **`.limit()` hebt den PostgREST-Deckel
nicht auf**, **ein `await` in einer Schleife kostet je Durchlauf
voll.**

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Bericht

**Claude Code, 2026-08-30.** Alle Zahlen mit Nutzer und Zeitraum.

### Die Kurzfassung

**Das Schema steht wirklich live** — als erstes gemessen, nicht dem
Auftrag geglaubt (die Lehre aus G-273, wo eine „gebaute" Funktion
fehlte). **Alle sechs Spalten, `meal_plan_logs` und
`coach.darf_nutrition_plan_aendern` sind da.**

**Vier Punkte gebaut, fuenf Attrappen auf null.** `[cmd]` **Gemessen
auf `dev`, alle drei Unterreiter: 5 vorher, 0 nachher.**

**Ein Befund schraenkt G-270 ein:** `[cmd]` **`meal_plan_logs` ist
LEER — 0 Zeilen, fuer jeden Nutzer.** `[read]` **Die drei Attrappen
werden damit zu Leerzustaenden, nicht zu echten Zahlen.** Das ist ein
Fortschritt, aber nicht dasselbe wie „angebunden" — und es gehoert
gesagt.

### Die Nachweiszeilen

| Zeile | Ergebnis |
|---|---|
| New plan | **schreibt** — Route und Oberflaeche, mit Rueckbau belegt |
| bearbeiten | **schreibt** — Name und Zustand geaendert, Rueckbau belegt |
| `plan_origin` NULL | **eigener Zustand**, mit Satz statt Behauptung |
| Bearbeiten gesperrt | **`dev` bekommt `false`** — Fall gebaut, Grund genannt |
| ghost entries | **aus `meal_plan_logs`** — heute Leerzustand (0 Zeilen) |
| Lifecycle types | **aus `lifecycle_type`** dieses Plans, nicht aus der Vorlage |
| 7-day compliance | **aus dem Log**, ohne Entscheidung keine Quote |
| Shopping list | **Leerzustand** — die Tabelle steht, `dev` hat keine Liste |
| Attrappen | **5 → 0**, am Schirm gezaehlt |
| Ladezeit | **3.486 ms kalt / 2.872 ms warm** |

### 1 · Zuerst: steht das Schema wirklich?

`[cmd]` **Gemessen am 2026-08-30, vor jeder Zeile Code:**

    meal_plans          alle sechs Spalten da; `status` als einziges
                        NOT NULL, Vorgabe 'assigned'
    meal_plan_logs      14 Spalten, Tabelle vorhanden
    meal_plan_entries   KEINE Statusspalte — bestaetigt
    coach.darf_nutrition_plan_aendern(p_client uuid) -> boolean

`[cmd]` **Und die CHECKs, aus `pg_constraint` gelesen:**
`lifecycle_type` in (`once`, `rollover`, `sequence`) oder NULL;
`plan_origin` in (`self_created`, `coach_created`, `marketplace`)
oder NULL; **`sequence` verlangt `next_plan_id`.**

`[read]` **Die wichtigste Messung des Auftrags stimmt:** der Status
liegt im Log, nicht am Eintrag. **Der Eintrag ist die Vorlage, das
Log die Ausfuehrung.**

`[cmd]` **Ein Nebenbefund, der die Anzeige aendert:**
`lifecycle_type` hat die **Vorgabe `'once'`** und `days_count` die
Vorgabe **7**. `[read]` **Ein neuer Plan ist also nie ohne Zyklus** —
**nur die zwei Bestandsplaene tragen NULL.** Das schaerft „gezeigt,
nicht gefuellt": die Leerstelle ist ein Altbestand, kein Dauerfall.

### 2 · G-267 — *New plan* schreibt

**Gebaut:** `plan-write.ts` (Zod-Pruefung, zwei Vorgaenge),
`api/nutrition/plan/route.ts`, `plan-modal.tsx`.

`[cmd]` **Die Schreibprobe ueber die Route,
`test-user@lumeos.local`:**

    1 anlegen                 200, plan_origin self_created,
                              status assigned, lifecycle rollover
    2 aendern                 200, Name und Zustand uebernommen
    3 Herkunft faelschen      200 — aber origin bleibt self_created
    4 Zyklus 'taeglich'       400 VALIDATION_FAILED
    5 sequence ohne Ziel      500 — der CHECK greift

`[read]` **Probe 3 ist die, auf die es ankommt:** `plan_origin` steht
NICHT im Eingabeschema und wird serverseitig gesetzt. **Sonst gaebe
ein Browser einen Plan als `coach_created` aus und umginge die
Sperre aus G-269.**

`[cmd]` **Und ueber die Oberflaeche:** *New plan* oeffnet ein Modal
mit 8 Feldern und den drei Zyklen im Klartext („laeuft einmal ab",
„beginnt danach von vorn", „geht in einen Folgeplan ueber").
**Angelegt, gespeichert, Reiter zeigt den Plan.**

`[read]` **`status` bleibt bei `assigned`** — aktivieren ist ein
eigener Vorgang (`MealPlanActivationModal` in SPEC_10). **Zwei
Entscheidungen in einen Knopf zu legen waere derselbe Fehler wie ein
Knopf, der nichts tut.**

### 3 · G-268 — bearbeiten, und die NULL-Herkunft

`[cmd]` **Bearbeiten laeuft:** Modal mit vorbelegten Feldern,
gespeichert, Reiter aktualisiert.

`[cmd]` **Die zwei Bestandsplaene tragen `plan_origin = NULL`** —
gemessen, wie der Auftrag sagt. `[read]` **`herkunftVon(null)`
liefert `unbekannt`, nicht `self_created`** — und die Kachel schreibt
dazu: *„Für diesen Plan ist keine Herkunft hinterlegt — er stammt aus
der Zeit vor der Unterscheidung. Das ist keine Aussage darüber, wer
ihn erstellt hat."*

`[read]` **Ein Plan unbekannter Herkunft bleibt bearbeitbar.**
**Ihn zu sperren waere schlimmer als die Leerstelle** — der Nutzer
verlöre den Zugriff auf seinen eigenen Plan, weil eine Spalte fehlt.

### 4 · G-269 — das Recht, mit Begruendung

`[cmd]` **`coach.darf_nutrition_plan_aendern` liefert `false` fuer
`dev`, `test-user` und `max.seed`** — alle drei gemessen.

`[cmd]` **E-29 eingehalten:** gelesen wird ueber die Funktion, nicht
ueber `coach.client_autonomy`. Ein Test verbietet den direkten
Tabellenzugriff.

`[read]` **Der Reiter zeigt den Fall und sagt warum:**

    coach_created ohne Freigabe  „Dieser Plan kommt von deinem Coach.
                                 Direkte Änderungen sind erst ab
                                 Autonomiestufe 5 freigegeben — sprich
                                 ihn an, wenn du etwas anpassen
                                 möchtest."
    marketplace                  „... Leg eine Kopie an ..."

`[read]` **Zwei Sperren, zwei Wege heraus** — beim Coach reden, beim
Marktplatz kopieren. **Ein ausgegrauter Knopf ohne Grund waere eine
Sackgasse.**

`[cmd]` **Und die Sperre sitzt im Schreibweg, nicht nur in der
Anzeige** — `planAendern` liest die Herkunft und fragt die Funktion,
bevor es schreibt. **Ein ausgegrauter Knopf ist eine Bitte; die
Pruefung im Schreibweg ist die Regel.**

### 5 · G-270 — die fuenf Attrappen

`[cmd]` **Alle fuenf sind weg** (dev, am Schirm gezaehlt: Active plan
0, Plan library 0, Shopping list 0).

**Aber nicht alle wurden zu Zahlen:**

    ghost entries     -> Leerzustand: meal_plan_logs hat 0 Zeilen
    Lifecycle types   -> ECHT: der Zyklus DIESES Plans, mit Erklaerung
                        was am Ende geschieht
    7-day compliance  -> Leerzustand: ohne Entscheidung keine Quote
    Shopping list     -> Leerzustand: die Tabelle steht, dev hat keine

`[read]` **Ohne entschiedene Zeilen gibt es keine Quote, nicht null
Prozent** — dieselbe Regel wie in C-323. **Und `pending` zaehlt nicht
in den Nenner:** eine offene Mahlzeit ist keine Entscheidung.

`[cmd]` **Eine Praemisse hat sich beim Messen gedreht:** der Auftrag
sagt, `dev` habe keine Einkaufsliste — **die eine Liste gehoert
`test-user`, nicht `dev`.** Beides fuehrt zum selben Ergebnis (dev
sieht den Leerzustand), aber die Zuordnung stimmt so nicht.

### 6 · Ein Satz, der still falsch geworden ist

`[cmd]` **Die Kachel „Planumfang" trug bis heute:** *„Lebenszyklus,
Startdatum und Bestätigungsmodus fehlen im Schema."*

`[read]` **Der Satz stand vier Wochen richtig und wurde an dem Tag
falsch, an dem Codex das Schema einspielte.** Entfernt und durch die
Lebenszyklus-Kachel ersetzt.

`[cmd]` **Derselbe Fund bei meinem eigenen Waechter aus G-272:** er
verlangte, dass der Reiter `lifecycle` NICHT benutzt — richtig am
29.08., falsch am 30.08. **Er ist umgedreht: der Knopf MUSS jetzt
schreiben koennen.**

`[cmd]` **Und ein zweiter Waechter prueft seither einen Kommentar
statt der Anzeige:** er suchte „fehlen im Schema", was nur noch in
einem Dokumentationsblock steht. **Ein Waechter, der einen Kommentar
findet, prueft nichts** — verschaerft auf die fuenf Bauteile.

### 7 · Die Sabotagen — 9 von 9 fallen

Jede einzeln, Rueckbau bytegleich per SHA-256.

| # | Sabotage | faellt |
|---|---|---|
| 1 | NULL wird als `self_created` ausgegeben | ja |
| 2 | unbekannte Herkunft gilt als gesperrt | ja |
| 3 | die Coach-Freigabe wirkt nicht mehr | ja |
| 4 | keine Entscheidung wird als 0 % ausgegeben | ja |
| 5 | offene Zeilen zaehlen in den Nenner | ja |
| 6 | die Herkunft wird nicht mehr gesetzt | ja |
| 7 | die Sperre im Schreibweg faellt weg | ja |
| 8 | die Herkunft wird vom Browser annehmbar | ja |
| 9 | *New plan* oeffnet das Modal nicht mehr | ja |

`[read]` **Sabotage 8 ist die sicherheitsrelevante:** sie fuegt
`plan_origin` ins Eingabeschema ein — und faellt.

### 8 · Gate und Testlage

`[cmd]` **`pnpm gate`: 11 von 11 gruen.** `[cmd]` **Typecheck sauber,
Build gruen.** `[cmd]` **336 von 336 Nutrition-Tests gruen**, davon
15 neue. `[cmd]` **Encoding sauber, Exit 0.**

`[cmd]` **Am Schirm (dev): 0 Attrappen, keine Doppelung,
3.486 ms kalt / 2.872 ms warm.**

**Rueckbau:** `[cmd]` beide Proben auf `test-user@lumeos.local`
angelegt und geloescht — **test-user 0 Plaene, dev unveraendert 1,
Bestand 2, Einkaufslisten 1.** **Nichts auf `dev` geschrieben.**

**Bildschirmfotos:** `backup/g267-nachher-plans.png` (Plan mit
Zyklus, Herkunft, Leerzustaenden), `g267-dev-final.png`,
`g267-dev-shopping.png`.

**`supabase/` nicht angefasst. Nicht committet, nicht gestaget.**

## Abnahme

**2026-08-30, Orchestrator. Nachgemessen.**

`[cmd]` **Alle fuenf Attrappen weg, 5 auf 0.** `[cmd]` 3.486 ms kalt
/ 2.872 ms warm, 336/336 Tests, 9/9 Sabotagen.

### Der Schutz liegt im Schreibweg, nicht in der Anzeige

`[cmd]` **`plan_origin` steht nicht im Eingabeschema und wird
serverseitig gesetzt** — **sonst koennte ein Browser einen Plan als
`coach_created` deklarieren und G-269 umgehen.**

`[cmd]` **Fuenf Pruefungen ueber die Route:** anlegen → 200 mit
`self_created`, bearbeiten → 200, gefaelschte Herkunft → ignoriert,
ungueltiger Zyklus → 400, `sequence` ohne Ziel → vom `CHECK`
geblockt.

`[cmd]` **Und eine Sabotage setzt `plan_origin` zurueck ins
Eingabeschema** — sie faellt. `[read]` **Ein Waechter gegen genau den
Weg, der die Regel aushebeln wuerde.**

`[cmd]` **`planAendern` liest die Herkunft und fragt die Funktion vor
dem Schreiben.** `[cmd]` `dev`, `test-user` und `max.seed` bekommen
alle `false`, **und der Reiter sagt warum — mit verschiedenen
Auswegen fuer Coach und Marktplatz.**

`[read]` **Das ist E-29 durchgesetzt, nicht angezeigt.**

### Drei meiner Auftragsangaben waren falsch

`[cmd]` **`meal_plan_logs` ist leer — 0 Zeilen.** `[read]` **Also
sind Ghost Entries und Compliance ehrliche Leerzustaende, keine
echten Zahlen.** Er schreibt es selbst: *,,Das ist Fortschritt, aber
es ist nicht angebunden, und es waere falsch, es so zu berichten."*

`[cmd]` **`lifecycle_type` hat die Vorgabe `'once'`, `days_count` 7**
— **ein neuer Plan ist nie `NULL`.** Nur die zwei Bestandsplaene
sind es. `[read]` **Das schaerft *zeigen statt fuellen*, statt es zu
widerlegen.**

`[cmd]` **Die eine Einkaufsliste gehoert `test-user`, nicht `dev`.**
Gleiche sichtbare Wirkung, **falsche Zuordnung in meinem Auftrag.**

### Ein Satz war still gekippt

`[cmd]` **Die Planumfang-Karte trug weiter *,,Lebenszyklus,
Startdatum und Bestaetigungsmodus fehlen im Schema"*** — **vier
Wochen richtig, falsch an dem Tag, an dem Codex lieferte.**

`[cmd]` **Sein eigener Waechter aus G-272 war genauso invertiert** —
er verbot die Nutzung von `lifecycle`. `[cmd]` **Und ein zweiter
bestand, weil er den Text in einem Kommentar fand.**

`[read]` **Ein Waechter, der einen Kommentar findet, prueft nichts.**
**Beide nachgeschaerft. Als A-62 festgehalten** — das Muster trifft
mehr als diese zwei.

**Abgenommen.**

