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

- **Sie zählt keine Policies, Trigger, Indizes oder Fremdschlüssel.**
  `[cmd]` Gerade die fehlten hier mit: 12 Policies, 4 Trigger, 1
  Fremdschlüssel. Eine Tabelle kann existieren und trotzdem ohne
  Zeilenschutz dastehen — **das würde diese Prüfung nicht bemerken.**
  Für RLS gibt es die getrennte `zugriffsrechte-pruefen.mjs`; die
  Verbindung zwischen beiden ist nicht hergestellt.

- **Sie prüft keine Spalten.** `meal_items` trug vor dem Neuaufbau
  `food_source`, eine Prüfbedingung und `frozen_at`. Ob die
  wiederhergestellte Tabelle dieselben Spalten hat, sagt diese Prüfung
  nicht — nur, dass es eine Tabelle dieses Namens gibt.

- **Sie prüft nur das Schema `nutrition`.** `public.profiles`, der
  Trigger auf `auth.users`, `public.is_admin()` — alles ungeprüft,
  obwohl `090` und `061` sie erzeugen.

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
  („steht da, aber nicht in der Sollliste"), keinen Fehler.

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
