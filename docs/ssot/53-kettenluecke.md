# Vier fehlende Kettenschritte: Ursache und Prüfung

`[cmd]` Erhoben 2026-08-16. Anlass: Nach dem Kettenneuaufbau für C-38
fehlten in `nutrition` die Tabellen `meals`, `meal_items`, `water_logs`
und zwei Sichten — **ohne dass ein Kettenlauf sich beschwert hätte.**

Sicherung vor der Reparatur:
`backup/schema/2026-08-16_nutrition_vor_kettenluecke.sql`, 83 KB,
`--schema-only`.

---

## Das Ergebnis in drei Sätzen

`[cmd]` Die Ursache ist **eine unvollständige Kettensteuerung** — genauer:
es gibt gar keine. Die „Kette" ist eine Prosa-Tabelle in
`supabase/README.md`, und die Schritte `052` bis `056` standen dort im
Abschnitt *„Herkunft der Baseline-Struktur (historische
Kettenschritte)"*, nicht in der Aufbaureihenfolge.

`[cmd]` Die Dateien selbst sind fehlerfrei: alle fünf laufen ohne einen
einzigen Fehler durch, wenn man sie in der richtigen Reihenfolge und
gegen eine Datenbank mit `auth`-Schema aufruft.

`[cmd]` Der Schaden war grösser als die fünf Objekte: **12 Policies,
2 Funktionen und 4 Trigger** fehlten mit.

---

## Schritt 1 — die drei Möglichkeiten, geprüft

### 1. Die Steuerung ruft sie nicht auf — **das ist die Ursache**

`[cmd]` Eine Volltextsuche über `supabase/` nach den Dateinamen
(`05[0-6]_(preferences|curation|diary|daily|water|hydration)`) findet
**genau eine** Fundstelle: `supabase/README.md`.

`[cmd]` Es existiert **kein ausführbares Kettenskript** — weder in
`package.json` (Skripte: `dev`, `build`, `test`, `lint`, `typecheck`,
`gate`) noch als `.sh`, `.ps1`, `.ts` oder `.mjs`. Die Kette wird von
Hand ausgeführt, nach der Tabelle in der README.

**Und diese Tabelle war unvollständig.** Sie endete bei `021`. Es
fehlten darin: `022`, `023`, `024`, **`052`–`056`**, `060`, `061`,
`070`, `072`, `073`, `090`.

`[cmd]` Die Zeile `| B | …baseline… | Schema nutrition (11 Tabellen) |`
sagt es indirekt: die Baseline legt **11** Tabellen an, und keine davon
ist eine Diary-Tabelle. Nachgezählt in der Baseline-Datei: 12
`CREATE TABLE`, davon 11 in `nutrition` und `public.profiles`.

Die Schritte `050` und `051` haben nur deshalb „gegriffen", weil ihre
Erzeugnisse (`food_preferences`, `food_preference_items`,
`food_curation_candidates`, `food_curation_decisions`) **in der Baseline
enthalten sind**. `052`–`056` sind es nicht.

### 2. Sie sind gelaufen und still fehlgeschlagen — **nein, aber fast**

`[cmd]` Auf einer Wegwerf-Datenbank laufen alle fünf fehlerfrei durch,
wenn `auth` vorhanden ist. Ergebnis: 17 Tabellen, 2 Sichten.

**Eine Falle steckt trotzdem darin, und sie ist neu:** `[cmd]` Baut man
die Wegwerf-Datenbank nur aus dem `nutrition`-Schema auf, bricht `052`
mit `ERROR: schema "auth" does not exist` ab — **nachdem** es Tabellen,
Indizes, Funktionen und Trigger bereits angelegt hat. Der Schritt läuft
in einer Transaktion, also wird alles zurückgerollt.

Sichtbar bleibt davon fast nichts: die Ausgabe besteht aus
`NOTICE ... does not exist, skipping`-Zeilen, und wer nur nach dem Wort
`ERROR` in den letzten Zeilen sucht, übersieht es. Das ist genau die
Konstellation aus Möglichkeit 2 — sie hat hier nur nicht zugeschlagen,
weil die Live-Datenbank ein `auth`-Schema hat.

`[cmd]` Ausserdem gibt es eine echte Reihenfolgeabhängigkeit:
`053` braucht `meals` aus `052`, `055` braucht
`nutrition.touch_updated_at()` aus `052`, `056` braucht `water_logs`
aus `055`. Einzeln aufgerufen scheitern sie:

```
053 → ERROR: relation "nutrition.meals" does not exist
055 → ERROR: function nutrition.touch_updated_at() does not exist
056 → ERROR: relation "nutrition.water_logs" does not exist
```

### 3. Ein späterer Schritt hat sie entfernt — **nein**

`[cmd]` Die einzigen `DROP TABLE`/`DROP SCHEMA` in `_pipeline/` und
`migrations/` stehen in `080_public_bereinigen.sql` und betreffen vier
Governance-Tabellen im Schema `public`
(`execution_tokens`, `wo_failure_events`, `governance_artefacts`,
`workorders`). Nichts davon berührt `nutrition`.

Das einzige `DROP SCHEMA nutrition CASCADE` war meines, im
Neuaufbau-Skript von C-38 — und dort war es beabsichtigt.

---

## Warum die Prüfung nichts gemerkt hat

Die Abschlussprüfung des C-38-Neuaufbaus zählte sechs Dinge:

```
foods 7140 · food_nutrients 698092 · food_aliases 32522
food_tags 9265 · search_synonyms 4877 · sort_weight-Stufen 95
```

**Alle sechs waren richtig.** Der Lauf meldete Erfolg, und der Erfolg
war für das, was gezählt wurde, echt.

Der Fehler liegt in der Bauart: **die Prüfung zählte nur, was sie
erwartete.** Sie hatte keinen Begriff davon, was *sonst noch* im Schema
stehen müsste. Was in keiner Erwartungsliste stand, konnte spurlos
fehlen, ohne eine einzige Zeile Ausgabe zu verändern.

Das ist dieselbe Fehlerklasse, die in diesem Repo mehrfach aufgetreten
ist — Werkzeuge, die Sicherheit behaupten, ohne sie zu erzeugen. Der
Unterschied zu den früheren Fällen: hier war die Zahl nicht falsch
berechnet, sie war **unvollständig erhoben**. Eine Prüfung, die neun
von siebzehn Tabellen kennt, kann acht fehlende nicht melden.

Verschärfend kommt hinzu, dass die einzige Beschreibung der Kette
(`README.md`) selbst unvollständig war. Es gab also weder eine
ausführende noch eine prüfende Instanz, die die Diary-Schritte kannte.

---

## Schritt 2 — repariert, wo die Ursache sitzt

**Die Steuerung wurde ergänzt, nicht die Datei von Hand nachgeladen.**

`supabase/README.md`, Tabelle „Lokaler Neubau": von 6 auf 20 Zeilen.
Neu darin `022`, `023`, `024`, `052`–`056`, `060`, `061`, `070`, `072`,
`073`, `090`, jeweils mit Erzeugnis und Erwartung. Dazu drei Absätze,
die vorher nirgends standen:

- die Reihenfolgeabhängigkeit innerhalb von `05`,
- die `auth`-Abhängigkeit von `052`–`056` samt der stillen
  Zurückrollung,
- die zwei Stolpersteine aus dem C-38-Bericht
  (`public.handle_new_user()`/`is_admin()` überleben
  `DROP SCHEMA nutrition CASCADE`; Schritt `030` erwartet die CSVs
  **im Container** unter `/tmp/p1-005-bls-local-import/`).

Erst danach wurden die fünf Schritte auf der laufenden Datenbank
nachgezogen — in der Reihenfolge, die die README jetzt vorschreibt.
`[cmd]` Alle fünf ohne Fehlermeldung.

---

## Schritt 3 — die Prüfung, die das nächste Mal anschlägt

`supabase/_pipeline/_validierung/schema-vollstaendigkeit-pruefen.ts`
gegen `supabase/_pipeline/daten/schema-sollstand.json`.

**Die Sollliste steht im Repo, nicht in der Datenbank.** `[read]` Genau
dieser Fehler ist hier schon einmal passiert — eine Rechteprüfung, die
ihre Sollliste vom Prüfling bezog und deshalb jeden Zustand bestätigte.
Die Datei trägt die Regel im Kopf: *„VON HAND GEPFLEGT. Diese Liste darf
ihre Werte NIEMALS aus der laufenden Datenbank beziehen."*

Geprüft wird viererlei:

| | Umfang |
|---|---|
| Tabellen | `[cmd]` 17, je mit erzeugendem Schritt |
| Sichten | `[cmd]` 2 |
| Funktionen | `[cmd]` 10 |
| Mindestzeilen | `[cmd]` 9 Tabellen, Untergrenzen |

### Der Nachweis, dass sie anschlägt — in beide Richtungen

Eine Prüfung ist erst brauchbar, wenn sie an bekannten Fällen **beider**
Sorten gezeigt hat, dass sie trennt.

`[cmd]` **Gegen das kaputte Live-Schema** (vor der Reparatur):

```
Tabellen     14/17 vorhanden
Sichten       0/2 vorhanden
Funktionen    8/10 vorhanden

FEHLT:
  · Tabellen: meals FEHLT — erzeugt von Schritt 052
  · Tabellen: meal_items FEHLT — erzeugt von Schritt 052
  · Tabellen: water_logs FEHLT — erzeugt von Schritt 055
  · Sichten: daily_summary FEHLT — erzeugt von Schritt 053
  · Sichten: hydration_summary FEHLT — erzeugt von Schritt 056
  · Funktionen: touch_updated_at FEHLT — erzeugt von Schritt 052
  · Funktionen: meal_items_owner_guard FEHLT — erzeugt von Schritt 052

SCHEMA UNVOLLSTAENDIG — 7 Abweichung(en)          Exit 1
```

Jede Meldung nennt den Schritt, der das Objekt erzeugt — der Weg von
der Meldung zur Reparatur ist damit einen Blick lang.

`[cmd]` **Gegen ein strukturell vollständiges, aber leeres Schema**
(die Wegwerf-Datenbank, nur `--schema-only` aufgebaut):

```
Tabellen     17/17 vorhanden
Sichten       2/2 vorhanden
Funktionen   10/10 vorhanden

FEHLT:
  · Zeilen: nutrition.foods hat 0, erwartet mindestens 7140
  · … acht weitere
                                                   Exit 1
```

Die Strukturprüfung meldet Vollständigkeit, die Zeilenprüfung schlägt
an. Der zweite Fall — „Tabelle existiert, ist aber leer" — wird also
ebenfalls erkannt.

`[cmd]` **Nach der Reparatur, gegen live:** `SCHEMA VOLLSTAENDIG`,
Exit 0.

---

## Was die neue Sollliste abdeckt und was nicht

**Sie deckt ab:** Existenz von 17 Tabellen, 2 Sichten, 10 Funktionen im
Schema `nutrition`, dazu Mindestzeilen für 9 Tabellen. Unerwartete
Objekte werden als Hinweis gemeldet, nicht als Fehler — entweder ist die
Liste veraltet oder es liegt Ausschuss im Schema.

**Ihre blinden Flecken, jeder einzeln benannt:**

> **Aktualisiert am 2026-08-16.** Der erste Punkt — keine Policies,
> Trigger, Fremdschlüssel — ist behoben, siehe „Die Erweiterung" unten.
> Er bleibt hier stehen, weil er den damaligen Stand festhält. Die
> übrigen Punkte gelten unverändert.

- ~~**Sie zählt keine Policies, Trigger, Indizes oder Fremdschlüssel.**~~
  `[cmd]` Gerade die fehlten hier mit: 12 Policies, 4 Trigger, 1
  Fremdschlüssel. **Behoben** — Policies je Operation, Zeilenschutz,
  `security_invoker`, Trigger und Fremdschlüssel werden seit der
  Erweiterung geprüft. **Indizes bewusst weiterhin nicht**, siehe unten.

- **Sie prüft keine Spalten.** `meal_items` trug vor dem Neuaufbau
  `food_source`, eine Prüfbedingung und `frozen_at`. Ob die
  wiederhergestellte Tabelle dieselben Spalten hat, sagt diese Prüfung
  nicht — nur, dass es eine Tabelle dieses Namens gibt.

- **Sie prüft keine GRANTs.** `[read]` PostgREST prüft Tabellenrechte
  **vor** RLS — eine Tabelle mit tadellosen Policies, aber ohne
  `GRANT SELECT`, ist für die Anwendung genauso unerreichbar wie eine
  gesperrte. Das ist der nächstliegende blinde Fleck und der beste
  Kandidat für die nächste Erweiterung.

- **Sie prüft nur das Schema `nutrition`.** `public.profiles`, der
  Trigger auf `auth.users`, `public.is_admin()` — alles ungeprüft,
  obwohl `090` und `061` sie erzeugen.

- **Sie prüft keine Policy-Bedingungen.** Geprüft wird, *dass* eine
  Policy für eine Operation existiert, nicht *was* sie erlaubt. Eine
  `USING (true)` auf `meals` würde die Prüfung bestehen und trotzdem
  jedem alle Mahlzeiten zeigen. `[read]` Für die Bedingungen gibt es
  `zugriffsrechte-pruefen.mjs`; die Verbindung zwischen beiden
  Prüfungen ist weiterhin nicht hergestellt.

- **Die Mindestzeilen sind Untergrenzen, keine Sollwerte.** Sie fangen
  „leer geblieben" ab, nicht „halb importiert". `[annahme]` Exakte
  Sollwerte wären schärfer, würden aber bei jedem BLS-Update
  fehlschlagen; die Untergrenze ist der Kompromiss.

- **Sie läuft nicht automatisch.** `[cmd]` Sie hängt nicht in
  `pnpm gate` — sie braucht eine laufende Datenbank, wie
  `zugriffsrechte-pruefen.mjs` und `mealcam-zutaten-messen.ts` auch.
  **Wer die Kette baut, muss sie von Hand aufrufen.** Damit hat sie
  denselben Schwachpunkt wie die Kette selbst: sie verlässt sich auf
  Disziplin. Der Aufruf steht jetzt in der README.

- **Die Liste altert.** Sie ist von Hand gepflegt — das ist der Preis
  dafür, dass sie ihre Werte nicht vom Prüfling bezieht. Wer einen
  Kettenschritt ergänzt und die Liste vergisst, bekommt einen Hinweis
  („steht da, aber nicht in der Sollliste"), keinen Fehler. **Bei
  Policies ist das jetzt schärfer:** eine *zusätzliche* Operation
  erzeugt einen Hinweis, eine *fehlende* einen Fehler.

---

## Schritt 4 — was sonst noch fehlte

`[cmd]` Vergleich zwischen dem kaputten Live-Schema und einer
Wegwerf-Datenbank mit vollständig gelaufener Kette:

| | vorher live | vollständig | fehlte |
|---|---|---|---|
| Tabellen | `[cmd]` 14 | 17 | **3** |
| Sichten | `[cmd]` 0 | 2 | **2** |
| Funktionen | `[cmd]` 8 | 10 | **2** |
| Policies | `[cmd]` 20 | 32 | **12** |
| Trigger | `[cmd]` 0 | 4 | **4** |

Die mitgerissenen Objekte im Einzelnen:

- **Funktionen:** `nutrition.touch_updated_at()`,
  `nutrition.meal_items_owner_guard()` — beide aus `052`.
- **Trigger:** `[cmd]` alle vier —
  `meals.meals_touch_updated_at`,
  `meal_items.meal_items_touch_updated_at`,
  `meal_items.meal_items_owner_guard_trg`,
  `water_logs.water_logs_touch_updated_at`.
  Live standen **null** Trigger im Schema `nutrition`.
- **Policies:** 12, je 4 auf `meals` und `meal_items`, 4 auf
  `water_logs`.
- **Fremdschlüssel:** `meal_items_meal_id_fkey` auf `nutrition.meals`.

`[cmd]` **Kein Verweis aus einem anderen Schema** zeigte auf die
Diary-Tabellen — der Schaden blieb innerhalb von `nutrition`.

### Zwei Korrekturen an der Aufgabenstellung

`[cmd]` **Die Sichten heissen `daily_summary` und
`hydration_summary`**, nicht `daily_nutrition_summary`.

`[cmd]` **`nutrition_targets` fehlt nicht — es existiert nicht und soll
das auch nicht.** Kein Kettenschritt legt es an. `055_water_logs.sql`
hält es in seinem Kopf ausdrücklich fest: *„`[cmd]` 2026-08-06:
nutrition.nutrition_targets existiert NICHT"*, und `056` nennt den
Grund: die Tabelle gehört zu Goals (C-06) und ist noch nicht gebaut. Sie
steht deshalb in der Sollliste unter `nicht_erwartet`, damit sie nicht
beim nächsten Lauf fälschlich als Lücke gemeldet wird.

---

## Stand nach der Reparatur

```
[cmd] schema-vollstaendigkeit-pruefen   SCHEMA VOLLSTAENDIG, Exit 0
[cmd] Tabellen 17 · Sichten 2 · Funktionen 10 · Policies 32 · Trigger 4
[cmd] mealcam-zutaten-messen            34 von 37 — unveraendert
[cmd] pnpm gate                         8/8, Exit 0
```

Die beiden Wegwerf-Datenbanken sind verworfen.

## Was dieser Bericht nicht sagt

- **Er sagt nicht, dass die Kette jetzt zuverlässig ist.** Es gibt
  weiterhin **kein ausführbares Kettenskript** — nur eine jetzt
  vollständige Beschreibung. `[annahme]` Ein Skript, das die Reihenfolge
  aus einer Datendatei liest, wäre der nächste Schritt; das ist nicht
  Teil dieses Auftrags.

- **Er sagt nicht, dass die wiederhergestellten Tabellen identisch zu
  den vorherigen sind.** `[read]` `meal_items` trug vorher
  `food_source`, eine Prüfbedingung und `frozen_at`. Die Datei `052`
  erzeugt, was sie erzeugt; ob das dem Stand vor dem Neuaufbau
  entspricht, ist **nicht geprüft**. Es lag keine Datensicherung des
  vorherigen Zustands vor, nur die Schemasicherung von heute.

- **Er sagt nichts über die anderen Kettenschritte.** `[cmd]` Geprüft
  wurde, ob `052`–`056` laufen. Ob `060`, `070` oder `090` beim
  Neuaufbau vollständig gegriffen haben, hat die neue Prüfung nur
  indirekt bestätigt — über die Existenz ihrer Funktionen, nicht über
  ihre Wirkung.

- **Er sagt nichts über Daten.** Die Diary-Tabellen sind leer wieder
  angelegt worden. Ob dort vorher Zeilen standen, ist unbekannt;
  `[annahme]` bei einer Entwicklungsdatenbank ohne angemeldete Nutzer
  vermutlich nicht.

---
---

# Die Erweiterung: Rechte, Trigger, Verweise

`[cmd]` 2026-08-16, unmittelbar nach der Reparatur. Anlass ist der
blinde Fleck, den dieser Bericht selbst benannt hat: **die Prüfung zählte
Tabellen, aber nicht ihren Schutz.**

`[read]` Warum das zählt: Im Repo gab es bereits eine Sicht ohne
`security_invoker`, durch die der zweite Nutzer die Daten des ersten
sah. „Tabelle vorhanden" und „Tabelle geschützt" sind zwei Aussagen —
die erste zu prüfen und die zweite zu unterlassen, ist genau die Sorte
Werkzeug, die Sicherheit behauptet, ohne sie zu erzeugen.

## Was jetzt geprüft wird

| | vorher | nachher |
|---|---|---|
| Tabellen | `[cmd]` 17 | 17 |
| Sichten | `[cmd]` 2 | 2 |
| Funktionen | `[cmd]` 10 | 10 |
| **Zeilenschutz je Tabelle** | — | `[cmd]` **17** |
| **Policies je Tabelle und Operation** | — | `[cmd]` **32** |
| **`security_invoker` je Sicht** | — | `[cmd]` **2** |
| **Trigger namentlich** | — | `[cmd]` **4** |
| **Fremdschlüssel namentlich** | — | `[cmd]` **14** |
| Mindestzeilen | `[cmd]` 9 | 9 |

`[cmd]` Die Prüfung deckt damit **107 Einzelaussagen** statt 38 — 69
davon sind neu (17 Zeilenschutz + 32 Policy-Operationen + 2
`security_invoker` + 4 Trigger + 14 Fremdschlüssel).

### Die vier Ergänzungen im Einzelnen

**1. Zeilenschutz.** Für jede der 17 Tabellen steht `rls: true` in der
Sollliste. Weicht `pg_tables.rowsecurity` ab, ist es ein **Fehler**,
kein Hinweis.

**2. Policies je Tabelle und Operation.** Nicht die Gesamtzahl, sondern
je Tabelle, welche Operationen abgedeckt sein müssen. `[read]` Das
Muster steht in `060_zugriffsschicht.sql`: Policies je Operation, keine
Sammelpolicy. Der Bestand zerfällt sauber in zwei Gruppen:

| | Tabellen | Policies |
|---|---|---|
| Katalogdaten (lesbar für alle) | `[cmd]` 11 | `SELECT` |
| Nutzerdaten (eigene Zeilen) | `[cmd]` 6 | `SELECT`, `INSERT`, `UPDATE`, `DELETE` |

**Der gefährlichste Fall wird zuerst geprüft:** Zeilenschutz an, aber
**keine einzige Policy**. Die Tabelle ist dann für alle gesperrt — der
Fehler aus ADR-0003, und von aussen sieht er aus wie „die Tabelle ist
leer". Die Meldung nennt ihn beim Namen.

**3. `security_invoker`.** `[cmd]` Beide Sichten tragen ihn heute; die
erzeugenden Dateien `053` und `056` setzen ihn ausdrücklich
(`WITH (security_invoker = true)`). Fehlt er, ist es ein Fehler.

**4. Trigger und Fremdschlüssel namentlich**, jeweils mit erzeugendem
Schritt — dasselbe Muster wie bei den Tabellen.

## Jede Zeile gegen die erzeugende Datei geprüft

Der Ist-Stand war der Ausgangspunkt, aber **keine Zeile ist ungeprüft
übernommen worden.** `[cmd]` Die 32 Policies verteilen sich restlos auf
fünf Pipeline-Dateien:

| Datei | Policies |
|---|---|
| `060_zugriffsschicht.sql` | `[cmd]` 15 |
| `052_diary_foundation.sql` | `[cmd]` 8 |
| `055_water_logs.sql` | `[cmd]` 4 |
| `023_zubereitung_ableitung.sql` | `[cmd]` 2 |
| `061_rollen_admin.sql` | `[cmd]` 2 |
| `024_suchsynonyme.sql` | `[cmd]` 1 |
| **Summe** | **32** ✓ |

Ebenso die vier Trigger (`052`: drei, `055`: einer) und die 14
Fremdschlüssel (`[cmd]` 13 `REFERENCES` in der Baseline, 2 in `052` —
davon einer auf `foods`, einer auf `meals`).

**Nichts blieb übrig, das sich nicht in einer Pipeline-Datei
wiederfindet.** Hätte es etwas gegeben, stünde es hier als Meldung statt
in der Liste.

## Der Nachweis in beide Richtungen

`[read]` Eine Prüfung, die noch nie fehlgeschlagen ist, ist kein Beleg.
Alles auf einer Wegwerf-Datenbank, danach verworfen.

**Richtung 1 — vollständiges Schema (Vollkopie mit Daten):**

```
Tabellen     17/17    Zeilenschutz 17/17
Sichten       2/2     Policies     17/17 Tabellen vollstaendig
Funktionen   10/10    Sichten       2/2 mit security_invoker
                      Trigger       4/4
                      Fremdschl.   14/14
SCHEMA VOLLSTAENDIG                              Exit 0
```

**Richtung 2 — fünf gezielte Eingriffe, jeder einzeln:**

| Eingriff | Meldung | |
|---|---|---|
| `DROP POLICY meals_update` | `Policies: meals fehlt UPDATE — Schritt 052` | `[cmd]` Exit 1 |
| alle vier Policies von `water_logs` | `water_logs hat Zeilenschutz, aber KEINE Policy — Tabelle ist gesperrt (ADR-0003) — Schritt 055` | `[cmd]` |
| `security_invoker = false` auf `daily_summary` | `Sicht daily_summary: security_invoker=false, erwartet true — ohne den Schalter laeuft sie mit Eigentuemerrechten — Schritt 053` | `[cmd]` |
| `DISABLE ROW LEVEL SECURITY` auf `meals` | `Zeilenschutz: meals hat rowsecurity=false, erwartet true — Schritt 052` | `[cmd]` |
| Trigger + Fremdschlüssel entfernt | `Trigger: meal_items.meal_items_owner_guard_trg FEHLT` / `Fremdschluessel: meal_items_meal_id_fkey (meal_items -> meals) FEHLT` | `[cmd]` |

`[cmd]` Der Einzelnachweis auf der Vollkopie: nach `DROP POLICY
meals_update` meldet die Prüfung **genau eine** Abweichung und beendet
sich mit Exit 1. Vorher Exit 0, nachher Exit 1, ein Unterschied — die
Prüfung trennt.

Jede Meldung nennt Tabelle, Operation und erzeugenden Schritt. Der Weg
von der Meldung zur Reparatur ist einen Blick lang.

## Ein Fehler in meiner eigenen Umsetzung

`[cmd]` Der erste Lauf meldete `Zeilenschutz 0/17 wie erwartet` — obwohl
alle 17 Tabellen Zeilenschutz haben. Ursache: ich verglich gegen `'t'`,
aber `rowsecurity::text` liefert `'true'`. Die Prüfung hätte also
**siebzehn falsche Fehler** gemeldet und wäre als unbrauchbar abgetan
worden. Behoben; beide Schreibweisen werden akzeptiert.

Das ist die Kehrseite derselben Medaille: eine Prüfung, die zu viel
meldet, wird abgeschaltet — und schützt danach genauso wenig wie eine,
die zu wenig meldet.

## Indizes: bewusst ausgelassen

`[read]` Auf Toms Vorgabe **nicht** aufgenommen, und die Begründung
steht in der Datendatei unter `_bewusst_nicht_geprueft`:

- Indizes sind **Laufzeit, nicht Korrektheit** — ein fehlender Index
  macht die Suche langsam, keine Daten falsch oder sichtbar.
- Die Liste wäre unpflegbar: jeder Ausdrucksindex aus `072`/`073`
  müsste mitgezogen werden, und die werden beim Umbau der Suchbedingung
  ohnehin neu gelegt (C-17).

`[annahme]` Ein fehlender Trigram-Index würde sich in der
Laufzeitmessung zeigen, nicht in einer Strukturprüfung. Gemessen ist das
nicht.

## Stand nach der Erweiterung

```
[cmd] schema-vollstaendigkeit-pruefen   SCHEMA VOLLSTAENDIG, Exit 0
[cmd] 17 Tabellen · 2 Sichten · 10 Funktionen
[cmd] 17 Zeilenschutz · 32 Policies · 2 security_invoker
[cmd] 4 Trigger · 14 Fremdschluessel · 9 Mindestzeilen
```

Keine Schemaänderung — es wurde geprüft, nicht repariert. Die beiden
Wegwerf-Datenbanken sind verworfen.
