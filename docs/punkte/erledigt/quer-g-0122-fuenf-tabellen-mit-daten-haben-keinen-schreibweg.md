---
nr: G-122
typ: feature
modul: quer
schwere: mittel
angelegt: 2026-08-20
braucht: []
kind_von: G-123
kinder: []
entscheidung: E-17
agent: claudecode
beauftragt: 2026-08-27
beruehrt:
  tabellen: ["training.exercises", "goals.body_measurements", "recovery.checkins", "medical.lab_result_values", "recovery.modality_log"]
  dateien: []
zahlen: null
erledigt: 2026-08-27
commit: OFFEN
---

# G-122 - Fuenf Tabellen mit Daten haben keinen Schreibweg

## Befund

(neu 2026-08-20, aus G-123).

  `[cmd]` **Gemessen: gelesen ja, geschrieben nie.**

  | Tabelle | Zeilen | gesperrter Knopf |
  |---|---|---|
  | `training.exercises` | **1.416** | „Eigene Uebung" |
  | `goals.body_measurements` | **362** | Gewicht, Umfaenge |
  | `recovery.checkins` | **340** | „Check-in" |
  | `medical.lab_result_values` | **280** | „Eigener Messwert" |
  | `recovery.modality_log` | **178** | „Log modality" |

  `[read]` **Zwei brauchen vorher eine Entscheidung:** Bei der eigenen
  Uebung die Abgrenzung (der Katalog ist geteilt, eine eigene waere es
  nicht), beim eigenen Messwert die Unterscheidung von einem
  Laborbefund.

## Auftrag

**Drei Schreibwege bauen. Die zwei mit Entscheidungsbedarf sind
entschieden — siehe `docs/entscheidungen/E-17`.**

### Vorweg: die Zahlen sind Ausgangsvermutungen

`[read]` **Pruef sie zuerst. Weicht deine ab, gilt deine.** `[cmd]`
**In G-138 war meine ganze Praemisse falsch** — der Schreibweg
existierte seit G-148, und der Punkt hatte Vorlagennamen gegen
Codenamen verglichen. **Pruef zuerst, was es schon gibt.**

### Diese drei

    recovery.checkins            340 Zeilen   ,,Check-in"
    goals.body_measurements      362 Zeilen   Gewicht, Umfaenge
    recovery.modality_log        178 Zeilen   ,,Log modality"

`[read]` **Alle drei tragen bereits `user_id`** und brauchen keine
Entscheidung — nur ihren Schreibweg. **Es ist derselbe Bau wie G-138
und G-211.**

### Nicht in diesem Auftrag

`[cmd]` **Eigene Uebung und eigener Messwert bekommen eigene
Tabellen** (E-17). **Die Tabellen gibt es noch nicht** —
`supabase/_pipeline/` gehoert Codex. **Beschreib im Bericht, was du
braeuchtest; leg nichts an.**

### Was aus G-138 und G-211 uebernommen gehoert

**Eine Naht je Ziel.** `[cmd]` In G-211 war es eine Schreibstelle mit
Sabotageprobe, in G-138 *,,eine Naht mit zwei Enden"* — die Route
uebersetzt HTTP und ruft die Schreibdatei. **Pruef, welche Form hier
passt, und sag es.**

**Snapshots einfrieren, wo es welche gibt.** `[cmd]` In G-138 war das
der eigentliche Nachweis: Stack-Dosis 5 → 10 geaendert, alte
Einnahmen behielten `dose_snapshot` 5. `[read]` **Pruef, ob eine der
drei Tabellen so etwas braucht** — ein Check-in von gestern darf sich
nicht aendern, wenn heute eine Skala angepasst wird.

**Der dritte Zustand, falls es einen gibt.** `[read]` In G-211 war es
*,,wird von keiner Regel geprueft"*, in G-138 gab es ihn nicht, **weil
der Fall strukturell nicht entstehen kann.** Beides ist ein gueltiges
Ergebnis.

### Was nicht zu tun ist

**Keine Tabelle anlegen** — Codex arbeitet an A-55.
**Nichts auf `dev@lumeos.app` speichern.** Schreibende Nachweise auf
`test-user@lumeos.local`, mit gezaehltem Rueckbau.
**Die uebrigen zwei aus G-122 nicht anfangen.**
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    je Tabelle: Eintrag anlegen    Zeile da, Pflichtfelder gesetzt
    je Tabelle: aendern            alte Werte nicht verloren
    Snapshots, falls noetig        eingefroren, mit Gegenprobe
    Schreibstellen je Ziel         Zahl, und welche Form
    Attrappen im neuen Code        Soll 0
    Rueckbau                       gezaehlt, `dev` unberuehrt
    Bildschirmfoto je Zustand      `node tools/schuss.mjs`

`[read]` **Negativprobe:** einen Eintrag mit einer `user_id`
schreiben, die es nicht gibt. `[cmd]` **Pruef, ob ein Fremdschluessel
das schon erzwingt** — bei `medication_products.formulation_id` und
`user_medications` war es so, **und dann ist *,,strukturell
ausgeschlossen"* das Ergebnis. Kein Constraint loesen, um es doch zu
zeigen.**

### Regeln

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
`[cmd]` **Der Dev-Server beendet sich von selbst** (G-205, nicht dein
Fehler). `python tools/server.py start`, nie `pnpm dev`.
`[cmd]` **A-30 im Kopf behalten:** kein Wert-Import aus dem Leseweg
in eine Browserdatei.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Bericht

**Claude Code, 2026-08-27.**

**Drei Schreibwege gebaut. Die Praemisse traegt diesmal — 0
Schreibstellen fuer alle drei Ziele. Der Snapshot-Fall liegt bei
`body_measurements`, und die Datenbank loest ihn besser, als ich
gebaut hatte.**

### Die Zahlen — eine Abweichung

| Tabelle | Auftrag | Gemessen |
|---|---|---|
| `recovery.checkins` | 340 | **370** |
| `goals.body_measurements` | 362 | **362** |
| `recovery.modality_log` | 178 | **178** |

`[cmd]` **Die 370 teilen sich:** `tom.seed` 170, `dev@lumeos.app`
170, `test-user@lumeos.local` **30**. `[read]` **Die 30 auf dem
Testkonto sind vermutlich der Grund fuer die Abweichung** — sie sind
nach dem Anlegen des Punktes entstanden.

### Die Praemisse traegt — diesmal

**Auftrag: *„Pruef zuerst, was es schon gibt."***

`[cmd]` **Gemessen ueber alle `.ts`/`.tsx` unter `apps/web/src`:
0 Schreibstellen** auf `checkins`, `body_measurements` und
`modality_log`. **7 Lesestellen**, verteilt auf sechs Dateien.

`[cmd]` **`lib/goals/schreiben.ts` existiert**, schreibt aber
ausschliesslich `user_goals` (G-79). `[read]` **Kein zweiter Fall wie
G-138** — dort hiess das Gesuchte nur anders.

### Was gebaut ist

    lib/goals/koerpermass-rechnung.ts    Regeln + Vorschau (serverfrei)
    lib/goals/koerpermass-write.ts       DIE Schreibstelle
    lib/recovery/checkin-regeln.ts       Regeln (serverfrei)
    lib/recovery/checkin-write.ts        DIE Schreibstelle (beide Tabellen)
    app/v2/goals/koerpermass-aktionen.ts     Serveraktionen
    app/v2/recovery/erfassen-aktionen.ts     Serveraktionen
    2 Testdateien                        32 Tests

### Die Naht — EINE, ohne zweites Ende

**Auftrag: *„Pruef, welche Form hier passt, und sag es."***

`[read]` **Hier passt die einfache Naht:** Oberflaeche → Serveraktion
→ Schreibdatei. **Keine HTTP-Route.**

`[cmd]` **Der Unterschied zu G-138:** dort war
`api/supplements/intake` historisch bereits da, und die Route
uebersetzte HTTP ohne eigenen Datenbankzugriff — *„eine Naht mit zwei
Enden"*. `[read]` **Hier gibt es keinen Aufrufer ausserhalb der
eigenen Seite. Ein zweites Ende waere gebaut, ohne gebraucht zu
werden** — und muesste trotzdem bewacht werden.

`[cmd]` **Drei Tests zaehlen je Ziel**: genau eine Datei schreibt auf
`body_measurements`, genau eine auf `checkins`, genau eine auf
`modality_log`. **Sabotage belegt, dass sie fallen** (unten).

`[read]` **`checkins` und `modality_log` teilen sich EINE Datei** —
dieselbe Seite, dasselbe Schema, derselbe Zeilenschutz. **Der
Waechter zaehlt trotzdem je Tabelle**, damit eine dritte Datei
auffaellt, egal welche der beiden sie schreibt.

### Der Snapshot — und was die Datenbank schon loest

**Auftrag: *„Pruef, ob eine der drei so etwas braucht."***

**Ja, genau eine: `goals.body_measurements`.**

`[cmd]` **`height_cm_snapshot` stammt aus `public.profiles.height_cm`
und ist bei allen 362 gefuellt.** `[read]` **Wer seine Groesse
korrigiert, darf damit nicht rueckwirkend jedes BMI der Vergangenheit
aendern** — und es haengt mehr daran als bei G-138: aus der Groesse
folgen BMI **und** FFMI.

#### Der Fund, der den Bau geaendert hat

`[cmd]` **Der erste Nachweislauf lief auf einen Fehler:**

    ERROR: cannot insert a non-DEFAULT value into column
           "lean_mass_kg" — is a generated column

`[cmd]` **Alle vier abgeleiteten Spalten sind `GENERATED ALWAYS`** —
`bmi`, `ffmi`, `lean_mass_kg`, `fat_mass_kg` (gemessen gegen
`information_schema.columns`). **Die Datenbank rechnet sie aus
`weight_kg`, `body_fat_pct` und `height_cm_snapshot`.**

`[read]` **Damit ist `height_cm_snapshot` das EINZIGE Feld, das
eingefroren werden muss** — die vier folgen ihm automatisch, und zwar
rueckwirkend richtig, weil sie aus dem Snapshot rechnen und nicht aus
dem Profil. **Der Schreibweg setzt sie jetzt nicht mehr; ein Test
haelt fest, dass er es nie wieder tut.**

#### Die FFMI-Falle

`[cmd]` **Vor dem Bau gegen alle 362 Zeilen geprueft:** BMI,
Magermasse und Fettmasse stimmen mit der naheliegenden Formel — **der
FFMI bei KEINER einzigen.**

    lean / m^2                        21,08   weicht bei 362/362 ab
    lean / m^2 + 6.1 * (1.8 - m)      20,77   0 Abweichungen

`[read]` **Der Bestand rechnet den hoehennormalisierten FFMI
(Kouri).** `[cmd]` **Es steht so in der `generation_expression`** —
ich habe es abgeschrieben, nicht geraten.

`[read]` **Haette ich die naheliegende Formel gebaut, waere es nie
aufgefallen** — die Datenbank haette sie ohnehin ueberschrieben. **Die
Vorschau im Formular haette aber eine andere Zahl gezeigt als die
gespeicherte.**

#### Der eigentliche Nachweis

`[cmd]` **Am laufenden System, `test-user@lumeos.local`:**

    Messung angelegt   height_cm_snapshot 182.0 · bmi 25.66 · ffmi 21.66
    Profil 182 -> 170
    dieselbe Messung   height_cm_snapshot 182.0 · bmi 25.66 · ffmi 21.66
    Profil zurueck auf 182

**Unveraendert.** `[read]` **Und das gilt auch fuers Aendern:**
`messungAendern` ruft `groesseAusProfil` nicht — es liest den
eingefrorenen Wert der bestehenden Zeile. Ein Test bewacht genau das.

### Kein Snapshot bei den anderen zwei — mit Begruendung

`[cmd]` **`recovery.checkins` fuehrt keine Snapshot-Spalte**, alle 29
Spalten sind Messwert, Zeitstempel oder Herkunft.

`[read]` **Und sie braucht auch keine.** Die Skalen stehen als
CHECK-Constraint im Schema (`1..10`), nicht in einer Tabelle, die
jemand aendern koennte. **Wer die Skala aendert, aendert eine
Migration** — dann sind die Altwerte ohnehin neu zu deuten, und ein
Snapshot je Zeile haette das nicht verhindert.

### Der dritte Zustand — zweimal, verschieden

`[cmd]` **Bei `modality_log`:** `bonus_source` hat den Vorgabewert
`'pending_c124_e5'`, `bonus_value` steht auf `0` — **bei allen 178
Bestandszeilen.**

`[read]` **Die Tabelle sagt selbst, dass ihr Bonus nicht entschieden
ist** (C-124/E-05, offen). **Der Schreibweg setzt beide Felder
deshalb NICHT** — wer `bonus_value: 0` schriebe, behauptete
*„geprueft, kein Effekt"*, und das ist etwas anderes als *„noch nicht
entschieden"*. **Derselbe Unterschied wie in G-208.** Ein Test
bewacht es, in beiden Schreibruempfen.

`[cmd]` **Bei `body_measurements`:** `profiles.height_cm` ist
nullable. **Heute betrifft es 0 von 362** — aber ein neues Konto hat
keine Groesse. `[read]` **Dann fehlen BMI und FFMI, und das gehoert
benannt** (`OHNE_GROESSE`), statt stillschweigend leer zu bleiben.
**Anders als bei G-138 kann der Fall entstehen.**

### Zwei Fachregeln, die aus dem Schema kommen

`[cmd]` **`checkins_user_id_entry_date_key` ist EINDEUTIG** — ein
Check-in je Nutzerin und Tag, 0 Verstoesse im Bestand.
`[cmd]` **`modality_log` hat keinen solchen Schluessel**, und **32
Tage tragen mehr als eine Anwendung.**

`[read]` **Das ist kein Schemafehler, sondern die Sache selbst:** man
hat einen Zustand pro Tag, kann aber zweimal in die Sauna.
**Deshalb `upsert` fuer das eine, `insert` fuer das andere** — ein
zweiter Check-in am selben Tag ist eine Korrektur, keine
Fehlermeldung.

### NACHWEIS

| | |
|---|---|
| je Tabelle anlegen | **3 von 3**, Pflichtfelder gesetzt |
| je Tabelle aendern | Werte erhalten, Snapshot unberuehrt |
| **Snapshot eingefroren** | **Profil 182 → 170, Messung blieb 182.0** |
| Schreibstellen je Ziel | **1 · 1 · 1** — eine Naht ohne zweites Ende |
| Attrappen im neuen Code | **0** |
| Rueckbau | **370/362/178 → 370/362/178**, `dev` unveraendert (170/181/89) |

### Gates

    Tests            758 pass / 0 fail   (32 davon G-122)
    Typecheck        gruen
    Build            31/31 Routen
    serverimport     51 Client-Chunks, 0 Treffer  (A-30 gehalten)
    verdrahtung      kein unbewachter Zuwachs (46 → 47 bewachte Namen)
    encoding         20.501 Dateien sauber

### Die Waechter fallen wirklich

`[cmd]` **Fuenf Sabotagen, je einzeln, je genau ein roter Test,
Rueckbau byteidentisch:**

    Snapshot beim Aendern neu holen  -> „der Snapshot wird beim
                                        AENDERN NICHT neu geholt"
    FFMI ohne Normalisierung         -> „FFMI ist NORMALISIERT"
    bonus_value schreiben            -> „bonus_* werden nie geschrieben"
    Nullzeilenpruefung entfernen     -> „jeder Schreibzugriff prueft"
    zweite Schreibstelle anlegen     -> „genau EINE Datei schreibt
                                        auf modality_log"

### NEGATIVPROBE — teils strukturell ausgeschlossen, teils nicht

**Auftrag: *„Pruef, ob ein Fremdschluessel das schon erzwingt."***

`[cmd]` **Nur bei EINER der drei:**

    goals.body_measurements   FOREIGN KEY (user_id)
                              REFERENCES auth.users ON DELETE CASCADE
    recovery.checkins         KEIN Fremdschluessel auf auth.users
    recovery.modality_log     KEIN Fremdschluessel auf auth.users

`[read]` **Bei `body_measurements` ist es strukturell ausgeschlossen**
— wie bei `user_medications` (G-211) und
`medication_products.formulation_id` (G-210).

`[read]` **Bei den anderen beiden NICHT.** Die Zeilenrechte
verhindern es im Betrieb (`auth.uid() = user_id` bei INSERT), **aber
die Tabelle selbst wuerde eine erfundene `user_id` annehmen.**
`[cmd]` **Ich habe es nicht ausprobiert** — dazu haette ich mit
`postgres`-Rechten an RLS vorbeischreiben muessen, und das waere ein
Schreibvorgang ohne Auftrag. **Der Befund ist die fehlende
Fremdschluesselbeziehung selbst.**

### Was ich NICHT getan habe

**Keine Tabelle angelegt**, `supabase/_pipeline/` nicht angefasst.
**Die uebrigen zwei aus G-122 nicht angefangen** — siehe unten.
**Nichts auf `dev@lumeos.app` gespeichert.** Alle schreibenden
Nachweise auf `test-user@lumeos.local`, Rueckbau gezaehlt.
**Nicht committet, nicht gestaged, nicht gepusht.**

`[read]` **Kein Formular gebaut.** Der Auftrag verlangt die
Schreibwege und ihren Nachweis; **die Oberflaeche dazu ist ein
eigener Schritt** — und ohne sie ist der Nachweis am Bildschirm nicht
fuehrbar. **Das ist die eine Vorgabe, die nicht aufgegangen ist:**
*„Bildschirmfoto je Zustand"* konnte ich nicht liefern, weil es noch
nichts zu sehen gibt. **Gemeldet, nicht passend gemacht.**

### Was die zwei uebrigen braeuchten (E-02)

**Eigene Uebung** — `training.user_exercises`:

    id, user_id, name, category, exercise_type, tracking_type,
    equipment_id (nullable), instructions, is_active,
    created_at, updated_at
    UNIQUE (user_id, lower(name))
    RLS auf auth.uid() = user_id, alle vier Rechte

`[read]` **Getrennt von `training.exercises`** (1.416 Zeilen, geteilt)
— genau die Abgrenzung, die E-02 entschieden hat. `[read]` **Die
Leseseite braucht dann eine Vereinigung beider**, und die Sitzung
muss wissen, aus welcher sie stammt.

**Eigener Messwert** — `medical.user_lab_values`:

    id, user_id, measured_at, loinc_code (nullable),
    analyte_name, value_num, unit, notes,
    measurement_source, source_detail
    RLS wie oben

`[read]` **Getrennt von `medical.lab_result_values`** (280 Zeilen),
weil ein Laborbefund eine Herkunft hat, die eine Selbstmessung nicht
hat. `[cmd]` `lab_result_values` haengt an `lab_reports` — eine
Selbstmessung haette dort keinen Befund.

### Was mir aufgefallen ist

**1. Zwei der drei Tabellen haben keinen Fremdschluessel auf
`auth.users`.** `[cmd]` `checkins` und `modality_log`. `[read]`
**`ON DELETE CASCADE` fehlt damit auch** — wer ein Konto loescht,
laesst dort Zeilen zurueck. **Ein Punkt fuer Codex.**

**2. Die abgeleiteten Spalten sind generiert — das gehoert
dokumentiert.** `[read]` Es ist eine gute Entscheidung: die Formel
steht einmal, in der Datenbank. **Aber sie steht in keiner Spec und
in keinem SSOT-Bericht** — ich habe sie aus
`information_schema.columns` gelesen, nachdem der Insert
fehlgeschlagen war.

**3. `modality_log.bonus_source` traegt einen Punktverweis als
Datenwert.** `[cmd]` `'pending_c124_e5'` bei allen 178. `[read]`
**Das ist klug** — die Tabelle sagt selbst, was an ihr offen ist.
**Aber es bindet Daten an eine Punktnummer:** wird C-124 anders
nummeriert, steht in 178 Zeilen ein toter Verweis.

**4. Der Check-in kennt sieben Skalen, die Oberflaeche wird nicht
alle zeigen wollen.** `[cmd]` `sleep_quality`, `subjective_feeling`,
`energy_level`, `motivation`, `stress_level`, `work_stress`,
`life_stress` — alle 1..10, alle nullable. `[read]` **Der Schreibweg
laesst leere Skalen zu**, damit ein schneller Check-in moeglich ist.

**5. `abgeleitet()` ist jetzt eine Vorschau, keine Rechnung.**
`[read]` Sie wird vom Schreibweg nicht mehr gerufen — **das steht so
im Kopf der Funktion**, damit niemand sie fuer die Wahrheit haelt.
**Die Wahrheit steht in der Datenbank.**

## Abnahme

**2026-08-27, Orchestrator. Selbst gegen die Datenbank gemessen.**

`[cmd]` **Bestaetigt:**

    recovery.checkins          370   (Punkt sagte 340)
    goals.body_measurements    362
    recovery.modality_log      178
    GENERATED ALWAYS           lean_mass_kg, fat_mass_kg, bmi, ffmi
    Fremdschluessel auf        nur goals.body_measurements
      auth.users
    bonus_source               durchgaengig `pending_c124_e5`

### Der Fund, der den Bau geaendert hat

`[read]` **Alle vier abgeleiteten Spalten sind `GENERATED ALWAYS`** —
gefunden, weil der erste Nachweislauf auf
`cannot insert a non-DEFAULT value into column "lean_mass_kg"` lief.
`[read]` **Damit ist `height_cm_snapshot` das einzige Feld, das
eingefroren werden muss;** BMI und FFMI rechnen rueckwirkend richtig.

`[cmd]` **Und die FFMI-Falle:** die naheliegende Formel weicht bei
**allen 362 Zeilen** ab — der Bestand rechnet den hoehennormalisierten
FFMI nach Kouri. `[read]` **Die Formel wurde aus der
`generation_expression` abgeschrieben, nicht geraten.** Wer sie
geraten haette, haette 362 Zeilen still falsch nachgerechnet.

`[cmd]` **Der Nachweis:** Profil 182 → 170, die Messung behielt
`height_cm_snapshot` 182,0 · BMI 25,66 · FFMI 21,66. Unveraendert.

### Drei Urteile, die ich nicht vorgegeben hatte

`[read]` **Naht:** eine einfache, kein zweites Ende. *,,Ein zweites
Ende waere gebaut, ohne gebraucht zu werden, und muesste trotzdem
bewacht werden."* **Der Unterschied zu G-138 ist benannt:** dort war
die Route historisch da.

`[read]` **Snapshot nur bei einer der drei:** bei den anderen stehen
die Skalen als `CHECK`-Constraint im Schema. *,,Wer die Skala aendert,
aendert eine Migration."*

`[read]` **Dritter Zustand zweimal, verschieden:** `bonus_*` wird nie
gesetzt, weil `bonus_source` bei allen 178 Zeilen `pending_c124_e5`
traegt — **sonst behauptete der Schreibweg *,,geprueft, kein
Effekt"*.**

### Was nicht ging, und richtig gemeldet wurde

`[cmd]` **Negativprobe nur bei einer der drei strukturell
ausgeschlossen** — `checkins` und `modality_log` haben keinen
Fremdschluessel auf `auth.users`. `[read]` **Nicht ausprobiert, weil
das `postgres`-Rechte an RLS vorbei gebraucht haette. Die fehlende
Fremdschluesselbeziehung ist selbst der Befund** — und damit fehlt
auch `ON DELETE CASCADE`, was fuer den Export und die Loeschung aus
E-18 zaehlt.

`[cmd]` **,,Bildschirmfoto je Zustand" konnte nicht geliefert
werden** — gebaut wurden Schreibwege, kein Formular. `[read]`
**Meine Vorgabe war falsch, nicht die Arbeit.** Gemeldet statt
passend gemacht.

`[cmd]` **Gates:** 758 Tests / 0 Fehler, Build 31/31, Verdrahtung
46 → 47 ohne Zuwachs, Encoding 20.501, 0 Attrappen. Fuenf Sabotagen,
je genau ein roter Test, Rueckbauten byteidentisch. Rueckbau
370/362/178 exakt, `dev` unveraendert.

**Abgenommen.**

