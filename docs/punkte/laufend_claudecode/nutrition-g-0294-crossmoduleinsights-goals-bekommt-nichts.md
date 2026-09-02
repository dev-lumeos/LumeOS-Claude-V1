---
nr: G-294
typ: feature
modul: nutrition
schwere: mittel
angelegt: 2026-08-31
braucht: []
kind_von: null
entscheidung: null
agent: claudecode
beauftragt: 2026-09-02
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/insights-echt.tsx
zahlen:
  gemessen: 2026-09-02
  nutzertage_gemessen: 120
  tage_mit_score: 0
  carotpaxb_missing: 1983
  foods_gesamt: 7140
  tage_nur_vita_blockiert: 78
---

# G-294 — CrossModuleInsights — Goals bekommt nichts

## Befund

`[cmd]` **`SPEC_10` nennt `CrossModuleInsights`:** *,,Nutrition Score
zu Dashboard-Karte fuer Goals"*.

`[cmd]` **Im `goals`-Schema gibt es keine Funktion, die Nutrition
liest.**

`[read]` **Der Nutrition-Score existiert noch nicht** (C-324 laeuft)
— **aber die Naht auch nicht.**

## Die Modulgrenze

`[cmd]` **E-29 verlangt fuer Coach-Zugriffe eine Funktion.** `[read]`
**Ob das hier gilt, ist zu messen** — `goals` und `nutrition` sind
beide Nutzermodule, kein Dritter liest.

`[cmd]` **Und `lib/dashboard/lesen.ts` liest bereits aus fremden
Modulen** — **die Naht koennte dort liegen.**

`[read]` **Erst C-324, dann dieser Punkt** — **ohne Score gibt es
nichts zu uebergeben.**

## Auftrag — Erkenntnisse ueber Module hinweg

**Mitbeauftragt: G-232, G-234.** Bericht in diese Datei.

**Beauftragt am 2026-09-02.**

### 1 · G-294 — `CrossModuleInsights`

`[cmd]` **`C-324` ist erledigt** — die NRF9.3-Funktion steht.

`[read]` **Lies den Punkt und miss, was er verlangt** — **und was
davon heute Daten hat.**

`[cmd]` **E-52 gilt:** **wo dieselben Daten immer zusammen gebraucht
werden, entsteht eine Sicht in der Datenbank** — **keine Schleife im
Browser.**

`[read]` **Wenn eine Sicht noetig ist: melden, nicht bauen** —
`supabase/` gehoert Codex.

### 2 · G-232 — Quick-Add ohne Makros

`[read]` **Lies den Punkt und miss, ob er noch gilt.**

`[cmd]` **Seit G-320 gibt es `FoodSuchModal` mit Live-Vorschau**,
seit G-330 die fuenf Werte im Kopf.

### 3 · G-234 — zwei Selektoren nur in der Spec

`[cmd]` **Miss, welche zwei** — **und ob sie heute gebraucht
wuerden.**

`[read]` **Was in der Spec steht und nirgends gebraucht wird, gehoert
gestrichen** — **nicht gebaut.**

### Was nicht zu tun ist

**Keine Sicht in `supabase/` anlegen** — melden.
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen.**

### Nachweis

    G-294   was verlangt der Punkt, was hat Daten
    G-232   gilt noch / ueberholt
    G-234   welche zwei, gebraucht oder streichen

## Bericht

**Claude Code, 2026-09-02.** Gemessen auf `dev@lumeos.app` und drei
Seed-Konten, Zeitraum 2026-08-04 bis 2026-09-02. **Nur gelesen** —
kein Code geaendert, keine Sicht angelegt, nichts geschrieben.

---

## 1 · G-294 — was der Punkt verlangt, und was Daten hat

### Was der Punkt verlangt

`[cmd]` **`SPEC_10_COMPONENTS.md:167`**, eine Tabellenzeile:

    | `CrossModuleInsights` | Nutrition Score → Dashboard-Karte fuer Goals |

`[cmd]` **Mehr steht nicht da.** `[cmd]` **`SPEC_03` kennt den Score
nur in Flow 10** (Zeile 379: *,,Nutrition Score 0–100
(ok/warn/block)"*) — **dort in der Tages-Zusammenfassung von
Nutrition selbst, nicht in Goals.**

`[read]` **Die Uebergabe an Goals steht also in EINER Tabellenzeile
und in keinem Ablauf.** **Nach der Quellenordnung (SPEC_03 → SPEC_10
→ Mockup → Schema) fehlt die oberste Quelle.**

### Was heute Daten hat: nichts

`[cmd]` **C-324 steht live**, zwei Funktionen:

    nutrition.nrf93_daily(uuid, date)          -> TABLE(score, status,
                                                  components, ...)
    nutrition.nrf93_score_from_amounts(12x)    -> numeric

`[cmd]` **Gemessen ueber 30 Tage, alle vier Konten mit Mahlzeiten:**

    Konto                      Tage   mit Score   incomplete
    dev@lumeos.app               30           0           30
    tom.seed@example.com         30           0           30
    max.seed@example.com         30           0           30
    sarah.seed@example.com       30           0           30

`[read]` **120 Nutzertage, null Scores.** **Die Funktion laeuft, sie
liefert nur nie eine Zahl.**

### Die Ursache, bis auf den Naehrstoff gemessen

`[cmd]` **11 von 12 Bestandteilen haben Werte** — fuer
`dev@lumeos.app` am 2026-09-02: Protein 161,3 g, Ballaststoffe
26,1 g, Vitamin C 365,4 mg, Kalium 5.020 mg, Eisen 19,9 mg …

`[cmd]` **Genau einer ist `null`: `VITA`.** `[cmd]` **Und er blockiert
den ganzen Tag** — C-48 Regel 1.

`[cmd]` **Ueber sieben Tage, welcher Bestandteil fehlt:**

    27.08.  VITA
    28.08.  VITA
    29.08.  VITA, VITC
    30.08.  FIBT, VITA
    31.08.  VITA, VITC
    01.09.  VITA
    02.09.  VITA

`[read]` **VITA an allen sieben** — die anderen sind Einzelfaelle.

### Und warum VITA fehlt, obwohl alle 7.140 Lebensmittel einen Wert haben

`[cmd]` **`VITA` selbst ist vollstaendig:** 7.140 von 7.140, davon
7.134 `measured`.

`[cmd]` **Aber der Score nimmt `VITA` nicht direkt** — er ruft
`nutrition.vitamin_a_iu_daily`, und die rechnet aus **drei**
BLS-Bestandteilen (C-350):

    RETOL       Retinol            × 3,3333  -> IE
    CARTB       Beta-Carotin       × 1,6667  -> IE
    CAROTPAXB   uebrige Carotine   × 0,8333  -> IE

`[cmd]` **Die Luecke sitzt in `CAROTPAXB`:**

    CAROTPAXB   measured 5.093 | missing 1.983 | trace 63 | censored 1
    CARTB       measured 6.294 | missing   641 | censored 119 | ...
    RETOL       measured 6.355 | logical_zero 737 | missing 12 | ...

`[cmd]` **1.984 von 7.140 Lebensmitteln (27,8 %) tragen in einem der
drei ein `missing`.**

`[cmd]` **Am 2026-09-02 waren es zwei von zwoelf Lebensmitteln** —
*Koerniger Frischkaese* und *Thunfisch roh*, beide `CAROTPAXB:
missing`. **Zwei Positionen legen den Tagesscore still.**

### Das ist keine offene Frage — es ist entschieden

`[cmd]` **C-378, Abnahme vom 2026-09-01, Tom:**

> *,,die datenlage bei bls ist klar oder? entweder 0 nichts/nicht
> gemessen oder loq unter erfassbarem wert. was hackst du denn seit
> tagen auf diesem thema rum? wenn die daten nicht da sind erfinden
> wir sie nicht."*

`[cmd]` **Dort steht bereits:** *,,NRF9.3 liefert `incomplete`,
solange die Komponenten fehlen. Auf `dev` an 30 von 30 Tagen. Das ist
kein Fehler, sondern die Datenlage."*

`[read]` **Meine Messung bestaetigt das und erweitert es** — nicht 30
von 30 auf einem Konto, sondern **120 von 120 auf allen vieren.**

`[cmd]` **Und E-25 hat es vorhergesagt:** *,,Was fehlt, ist die
Datengrundlage — nicht die Formel."*

### Die Antwort auf G-294

`[read]` **Der Punkt fragt, was `CrossModuleInsights` verlangt und
was davon Daten hat.** **Die Antwort ist: der Score, und er hat
keine.**

`[read]` **E-52 verlangt eine Sicht, wo dieselben Daten IMMER
ZUSAMMEN gebraucht werden.** `[read]` **Hier gaebe es nichts
zusammenzufassen** — **eine Sicht ueber eine Spalte, die an 120 von
120 Tagen `NULL` ist, ist eine leere Sicht.**

**Deshalb melde ich KEINE Sicht an Codex.** `[read]` **Nicht weil sie
falsch waere, sondern weil sie verfrueht ist:** **erst die
Datengrundlage, dann die Naht.**

### Was der Punkt WERT ist — die Naht ist naeher als gedacht

`[cmd]` **Im `goals`-Schema gibt es weiterhin keine Funktion, die
Nutrition liest** — 15 Funktionen, alle koerper- und zielbezogen.
**Der Befund des Punktes stimmt.**

`[cmd]` **Aber `lib/dashboard/lesen.ts` liest bereits ueber die
Modulgrenze** — `recovery.scores` UND `nutrition.daily_summary` in
derselben Datei. `[read]` **Die Vermutung im Punkt (*,,die Naht
koennte dort liegen"*) traegt.**

`[cmd]` **Und die Empfangsstelle existiert, als Attrappe:**

    goals/daten.ts:327    CONTRIBUTIONS = { nutrition: 88, ... }
    goals/modale.tsx:243  "Calorie balance"  "−420 kcal/day avg · 30d"

`[cmd]` **Am Schirm gemessen: die 88 steht auf `/v2/goals`.**

`[read]` **Beide sind harte Zahlen ohne Quelle** — **das ist der
Ort, an den der Score gehoert, sobald es einen gibt.**

### Was ich dem Orchestrator vorlege

**1 · G-294 ist nicht baubar und sollte zurueckgestellt werden**, mit
Verweis auf C-378. `[read]` **Nicht abgelehnt** — die Naht ist
richtig gedacht, ihr fehlt nur der Inhalt.

**2 · Der Blocker hat einen Namen und eine Zahl:** `CAROTPAXB`,
1.983 Lebensmittel `missing`. `[cmd]` **Gemessen: waere nur VITA
geloest, haetten 78 von 120 Tagen einen Score** — **an den uebrigen
42 fehlt zusaetzlich VITC oder FIBT.**

`[read]` **Ob das loesbar ist, ist eine Datenfrage an Codex**, keine
Oberflaechenfrage — und **C-378 sagt, dass sie NICHT durch Annahmen
geloest wird.** `[read]` **Eine Quelle, die `CAROTPAXB` fuehrt, waere
der Weg; erfinden ist keiner.**

**3 · Wenn Goals frueher etwas zeigen soll**, gibt es eine Groesse
mit Daten: `nutrition.daily_summary` traegt Makros an allen Tagen.
`[read]` **Das waere *Calorie balance* mit echten Zahlen statt
*−420 kcal/day avg*** — **ein eigener, kleinerer Punkt, und er
braucht keine Sicht.**

---

## 2 · G-232 — Quick-Add ohne Makros: der Punkt ist ueberholt, der Code nicht

### Der Befund der Review

`[cmd]` **MIN-3 sagt:** `SPEC_10_COMPONENTS.md` und
`SPEC_10_PASS2_PATCH.md` enthalten **keinen** `QuickMacroEntry`.
**Gemessen: das stimmt** — die Komponente steht in keiner der beiden.

### Aber gebaut ist sie

`[cmd]` **`modale.tsx:305`, `QuickAddModal`** — am Schirm geoeffnet
und ausgelesen:

    Quick-add macros
    No food lookup · for meal prep in bulk
    CALORIES kcal | PROTEIN g | CARBS g | FAT g
    LABEL | MEAL (Breakfast … Pre-workout)
    "Quick-add produces no micronutrient data. The micro dashboard
     will show this entry as „no micro data"."
    Cancel | Add

`[read]` **Der Punkt fragt, ob er noch gilt.** **Die Komponente
fehlt in der Spec, nicht im Code** — **also gilt er als
Spec-Luecke, nicht als Baulücke.**

### Der Auftrag vermutete FoodSuchModal — das trifft es nicht

`[read]` **Der Auftrag sagt: *,,seit G-320 gibt es `FoodSuchModal`
mit Live-Vorschau, seit G-330 die fuenf Werte im Kopf."***

`[read]` **Das loest G-232 NICHT ab, sondern steht daneben:**

    FoodSuchModal   sucht ein Lebensmittel, rechnet Makros AUS
                    dem Katalog — mit Mikronaehrstoffen
    Quick-add       nimmt Makros direkt entgegen, OHNE Katalog
                    — ausdruecklich ohne Mikros

`[cmd]` **Der Dialog sagt es selbst:** *,,No food lookup · for meal
prep in bulk"*. `[read]` **Wer eine selbst gekochte Portion mit
bekannten Makros erfasst, hat kein Katalogeintrag** — **dafuer ist
die Suche kein Ersatz.**

### Zwei Befunde, die der Auftrag nicht vorhergesehen hat

**a) Der Knopf schreibt nicht.** `[cmd]` *,,Add"* ist ein
`InEntwicklungKnopf` — **er oeffnet einen Hinweis statt zu
speichern.** `[read]` **Die Oberflaeche ist vollstaendig, der
Schreibweg fehlt.**

**b) Und hier steht die sechste Namensliste — mit einem ungueltigen
Wert.** `[cmd]` **`modale.tsx:31`:**

    { id: 'breakfast',  label: 'Breakfast'   }
    { id: 'lunch',      label: 'Lunch'       }
    { id: 'dinner',     label: 'Dinner'      }
    { id: 'snack',      label: 'Snack'       }
    { id: 'preworkout', label: 'Pre-workout' }

`[cmd]` **`preworkout` steht NICHT im CHECK** — der kennt
`pre_workout`. `[cmd]` **Am Schirm gemessen: die englischen Namen
stehen im Pulldown**, obwohl der Nutzer fuenf eigene Slots hat.

`[read]` **Heute faellt es nicht auf, weil nichts geschrieben wird.**
**Sobald der Schreibweg kommt, wird die Zeile abgewiesen.**

`[read]` **BERICHTIGUNG zu meinem eigenen G-335-Bericht:** dort habe
ich `modale.tsx` als *,,Recovery-Zeitraster, keine
`meal_type`-Uebersetzung"* eingestuft. `[cmd]` **Das war falsch** —
ich hatte die Zeile mit `{ id: 'preworkout', time: '16:30' }` gesehen
und nach der Zeitangabe eingeordnet, **ohne zu pruefen, wer sie
benutzt.** **Sie speist das Mahlzeiten-Pulldown im Quick-add.**

### Die Antwort auf G-232

`[read]` **Der Befund gilt, aber anders als geschrieben:** **nicht
*,,Component fehlt"*, sondern *,,Component gebaut, Spec kennt sie
nicht, Schreibweg fehlt".***

**Vorschlag: G-232 schliessen und durch zwei ersetzen** —
`QuickAddModal` an `KATEGORIE_TEXT` und die Slots anschliessen
(inkl. `preworkout` → `pre_workout`), und den Schreibweg als
eigenen Punkt. `[read]` **Die Spec nachzuziehen ist Orchestratorsache
— `docs/` gehoert nicht mir.**

---

## 3 · G-234 — die zwei Selektoren: gebaut, unter anderen Namen

### Welche zwei

`[cmd]` **`SPEC_10_PASS2_PATCH.md:88-89`:**

    IntoleranceSelector        Unvertraeglichkeiten (Laktose,
                               Fruktose, Gluten mild) als
                               Toggle-Chips. Strong Constraint.
    ReligiousDietarySelector   Religioese/kulturelle Einschraenkungen
                               (halal, kosher) + Hard-Constraint-
                               Toggle

`[cmd]` **Beide Namen kommen in `apps/` NULLMAL vor** — nur in
`docs/specs/`. **Der Befund des Punktes stimmt woertlich.**

### Aber die SACHE ist gebaut — beide

`[read]` **Nach der Regel *,,suchen nach der Sache, nicht nach dem
Wort"*** (CLAUDE.md) **gemessen, und beides steht:**

**`IntoleranceSelector` → die dreistufigen Allergenchips.**
`[cmd]` `tab-vorlieben.tsx:241-246`: `allergie` / `sensibel` /
`neutral`, *,,1× tippen = Sensibel · 2× = Allergie"*. `[cmd]` **Am
Schirm belegt:** *Sensibel* und *Allergie* stehen auf `?tab=prefs`.

`[cmd]` **Und die Stufe wirkt bis in die Suche:** `intolerances`
→ `constraint_level = 'strong'` (gemessen heute in A-47) — **genau
das *,,Strong Constraint"*, das die Spec verlangt.**

**`ReligiousDietarySelector` → `diet_type` plus die Presetgruppe
*Religioes*.** `[cmd]` `tab-vorlieben.tsx:94` fuehrt `halal` und
`kosher` als Diaetform, Zeile 825 teilt die Presets in
*Persoenlich* / *Religioes*. `[cmd]` **Live gemessen:**

    nutrition.exclusion_presets
      religious   4   halal, jain, kosher, no_beef
      personal    7   no_alcohol, no_game, no_lamb, no_offal,
                      no_pork, no_raw_animal, no_seafood

`[cmd]` **Am Schirm belegt:** *halal*, *kosher*, *Religioes* und
*Persoenlich* stehen alle auf `?tab=prefs`.

### Der Hard-Constraint-Toggle ist die einzige echte Abweichung

`[cmd]` **Die Spec verlangt *,,+ Hard-Constraint-Toggle"*.** `[cmd]`
**`food_preferences.religious_is_hard` existiert nicht** (gemessen
heute in A-47: die Spalte fehlt, ebenso `religious_dietary`).

`[read]` **Aber die Frage, die der Toggle stellen sollte, ist
entschieden:** **E-16 und E-30** — generelle Ausschluesse ranken ab,
Allergien schliessen hart aus. `[read]` **Ein Toggle, der dasselbe
noch einmal fragt, waere eine zweite Wahrheit.**

### Die Antwort auf G-234

`[read]` **Der Auftrag sagt: *,,Was in der Spec steht und nirgends
gebraucht wird, gehoert gestrichen — nicht gebaut."***

**Beide Selektoren gehoeren gestrichen** — **nicht weil sie unnoetig
sind, sondern weil ihre Funktion bereits steht**, unter Namen, die
zum gebauten Stand passen. `[read]` **Sie zu bauen hiesse, die
Vorliebenseite ein zweites Mal zu bauen.**

`[read]` **Und die Nebenfrage des Punktes ist beantwortet:**
*,,Wird `IntoleranceSelector` von Onboarding und Settings beide
verwendet?"* — `[cmd]` **Ein Onboarding gibt es nicht** (G-222). **Es
gibt nur die Settings-Seite, und sie traegt beides.**

`[read]` **Zum Verhaeltnis zu C-174:** **es ist NICHT derselbe
Befund** — der Punkt fragte danach, und ich habe es geprueft. C-174
fragt, ob die drei Constraint-Stufen wirken (heute beantwortet: ja,
ueber `intolerances`). **G-234 fragt, ob zwei Spec-Komponenten
gebraucht werden.** **Verwandt, aber zwei Fragen.**

---

## Zusammenfassung fuer die Punktverwaltung

    G-294   zurueckstellen mit Verweis auf C-378 — der Score hat an
            120 von 120 Nutzertagen keine Zahl. KEINE Sicht melden:
            sie waere leer. Naht und Empfangsstelle sind gemessen
            und beschrieben, fuer den Tag, an dem es Daten gibt.

    G-232   gilt, aber anders: Component GEBAUT, Spec kennt sie
            nicht, Schreibweg fehlt, und das Pulldown traegt eine
            sechste Namensliste mit dem ungueltigen Wert
            `preworkout`.

    G-234   streichen. Beide Selektoren sind unter anderen Namen
            gebaut und mit Daten belegt (4 religioese Presets, 7
            persoenliche, dreistufige Allergenchips). Der
            Hard-Constraint-Toggle ist durch E-16/E-30 erledigt.

### Neue Befunde, die als Punkt gehoeren

    1  `CAROTPAXB` fehlt an 1.983 von 7.140 Lebensmitteln und
       blockiert VITA — damit den Score an allen Tagen. Waere nur
       VITA geloest: 78 von 120 Tagen haetten eine Zahl.
       (Datenfrage an Codex; C-378 schliesst Annahmen aus.)

    2  `modale.tsx:31` traegt eine sechste `meal_type`-Namensliste,
       englisch, mit `preworkout` statt `pre_workout`.

    3  `goals/daten.ts:327` (`nutrition: 88`) und
       `goals/modale.tsx:243` (*−420 kcal/day avg*) sind harte
       Zahlen ohne Quelle — die Empfangsstellen fuer G-294.

## Bildschirmfotos

    backup/g294-insights.png    Insights, kein Score
    backup/g294-goals.png       Goals mit der harten 88
    backup/g232-quickadd.png    der Quick-add-Dialog, englisch
    backup/g234-prefs.png       Sensibel/Allergie, halal/kosher

## Nicht getan

    kein Code geaendert, keine Spec geaendert
    KEINE Sicht in supabase/ angelegt — und keine gemeldet, mit
      Begruendung
    nichts auf dev geschrieben — alle Messungen lesend
    nicht committet, nicht gestaged, nicht gepusht
    Dev-Server nicht neu gestartet

## Abnahme

_(vom Orchestrator)_
