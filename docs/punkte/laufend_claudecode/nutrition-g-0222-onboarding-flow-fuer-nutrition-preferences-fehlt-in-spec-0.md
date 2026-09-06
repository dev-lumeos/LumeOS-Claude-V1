---
nr: G-222
typ: befund
modul: nutrition
schwere: hoch
angelegt: 2026-08-28
braucht: []
kind_von: null
entscheidung: null
agent: claudecode
beauftragt: 2026-09-07
beruehrt:
  dateien: [docs/specs/Nutrition/05_reviews/OPUS_REVIEW_NUTRITION_03_UI_FLOWS_READINESS.md]
zahlen: null
---

# G-222 — Onboarding Flow für Nutrition Preferences fehlt in SPEC_03

## Befund

**Aus `OPUS_REVIEW_NUTRITION_03_UI_FLOWS_READINESS.md`, CRIT-3.**
`[read]` **Wortlaut der Review, nicht vom Orchestrator formuliert.**

`NUTRITION_NEXT_SPEC_DECISIONS.md §6` und `ADR_NUTRITION_PREFERENCES_V1.md` fordern einen Onboarding-Flow für:
- Allergien (Hard)
- Unverträglichkeiten (Strong)
- Ernährungsform / Diät-Stil
- Religiöse/kulturelle Einschränkungen (Hard wenn User so setzt)
- No-Go-Lebensmittel
- Likes / Dislikes
- Bevorzugte Küchen
- Meal-Slots
- Zielrichtung

`SPEC_10_PASS2_PATCH.md` definiert dafür:
- 9 Components (`OnboardingPreferencesStep`, `DietTypeSelector`, `AllergenSelector`, `IntoleranceSelector`, `ReligiousDietarySelector`, `FoodLikesInput`, `FoodDislikesInput`, `MealSlotEditor`, `CuisinePreferenceSelector`)
- 4 Onboarding-Steps (Diät+Allergien+Unverträglichkeiten → Religiös → Likes/Dislikes → Meal-Slots+Ziel)

`SPEC_03_USER_FLOWS.md` enthält **keinen** dedizierten Onboarding-Flow:
- Flow 9 "Food Preferences setzen" beschreibt **Settings-Pflege**, nicht erstmaliges Onboarding.
- Kein Trigger-Event spezifiziert (z. B. "nach Sign-up", "vor erstem Diary-Tag").
- Kein Abbruch-/Skip-Verhalten dokumentiert.
- Kein Übergang spezifiziert (Onboarding → Diary, oder Onboarding → Goals → Diary?).
- Validierung pro Step (Pflicht- vs. Optional-Felder) nicht dokumentiert.
- Wiederaufnahme bei Abbruch (`onboarding_complete = false`) nicht beschrieben.

**Konsequenz:** Workorders für Onboarding-Components sind ohne Flow nicht klar abgrenzbar. UX-Entscheidungen (Step-Reihenfolge, Skippability, Wiederaufnahme) sind offen.

---

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

`[cmd]` **Gemessen 2026-08-30: keine Spalte `onboarding` im
ganzen Schema, `food_preferences` hat 2 Zeilen.**
`[read]` **Tom, 2026-08-30:** *,,wir bauen ein initiales komplettes
onboarding fuer jeden user wenn er nach der registrierung sich
einloggt."* **Damit ist das Ob entschieden.**
`[cmd]` **Und die Spec traegt es:** `SPEC_03_USER_FLOWS.md` der
Buddy-Spec zeigt vier Schritte, `SPEC_10_PASS2_PATCH.md` neun
Komponenten.

## Auftrag

**Mitbeauftragt mit G-226 am 2026-08-30.** Der Auftragstext
und der Bericht stehen dort.

## Bericht — Urteil: **Entscheidung**, enger gefasst

**Claude Code, 2026-08-31.** Mitbeauftragt mit G-226. **Der vollstaendige Bericht steht in [G-226](nutrition-g-0226-v1-status-marker-fehlen-fuer-recipes-shopping-mealplans-co.md#bericht).**

`[cmd]` **Das Ob ist entschieden** (Tom, 2026-08-30). `[cmd]`
**Gebaut ist nichts:** keine `onboarding`-Spalte im ganzen Schema,
**und keine der neun Komponenten existiert im Code** — sie stehen nur
in `SPEC_10_PASS2_PATCH.md`.

`[read]` **Was die Review vermisst, fehlt weiterhin** — und es ist
kein Bauteil, sondern ein Ablauf: Ausloeser, Abbruch, Wiederaufnahme,
Uebergang, Pflichtfelder je Schritt.

**Die eine Frage:** *darf das Onboarding uebersprungen werden?*

`[read]` **Daran haengt alles Uebrige.** Ist es Pflicht, braucht es
keinen Wiederaufnahmezustand und keinen Abbruchweg. **Ist es
ueberspringbar, braucht es eine Spalte fuer den Fortschritt und eine
Regel, wann erneut gefragt wird.**

`[read]` **Die Inhalte sind ausdruecklich NICHT die Frage** — Tom
legt sie spaeter fest, wenn ein repraesentativer Datenbestand
vorliegt.

## Geprueft am 2026-08-31

**Urteil aus G-226:** Entscheidung: darf das Onboarding uebersprungen werden?
Alles Weitere folgt daraus.

`[read]` **Die Messung steht in der G-226-Datei.**

## Auftrag — Onboarding, mit den Daten von heute

**Mitbeauftragt: G-152, G-228.** Bericht in diese Datei.

**Beauftragt am 2026-09-07.**

### Warum jetzt

`[read]` **Der Punkt stand seit Wochen offen, weil die Daten
fehlten.** `[cmd]` **Sie stehen seit dem 02.09.:**

    meal_slots           Anzahl, Namen, Zeiten (E-58)
    food_preferences     acht Spalten, drei ausgesetzt (E-47)
    tag_definitions      vier Filtergruppen (E-49)
    profiles             biological_sex, height_cm, body_weight_kg
    goals.goal_phases    Zeitachse, fuenf Testzeilen

### 1 · Was ein neuer Nutzer mindestens braucht

`[read]` **Miss, was der Betrieb voraussetzt** — **nicht, was ein
Formular fragen koennte.**

`[cmd]` **Beispiel: `test-user` hat keine Preferences, keine Meals,
keine Slots** (C-394) — **und die Oberflaeche zeigt Leerzustaende.**

`[read]` **Welche davon sind ertraeglich, welche machen die App
unbenutzbar?**

### 2 · Was ein Nutzer spaeter nachtragen kann

`[read]` **Onboarding ist keine Datenerhebung** — **es ist der
kuerzeste Weg zu einem brauchbaren ersten Tag.**

`[cmd]` **Die Slotliste hat eine Vorgabe** (G-332) — **fuenf Zeilen
mit gemessenen Zeiten.** `[read]` **Muss man sie im Onboarding
sehen, oder reicht sie als Vorgabe?**

### 3 · Die Reihenfolge

`[read]` **Schlag eine vor, mit Begruendung je Schritt.**

`[read]` **Und sag, welcher Schritt uebersprungen werden darf** —
**ein Onboarding ohne Ausweg ist eine Huerde.**

### 4 · G-152 und G-228

`[cmd]` **G-152 wartet auf die Sicht von Codex** — **miss nur, ob
sich seit deiner Messung etwas geaendert hat.**

`[cmd]` **G-228: Erfahrungsgrade fein aufteilen** (E-46). `[read]`
**Die Skala ist zu entwerfen, die Multiplikatoren brauchen
Quellen.** `[read]` **Miss, was heute existiert, und melde, was
fehlt** — **nicht bauen.**

### Was nicht zu tun ist

**Kein Onboarding bauen** — **dieser Auftrag entwirft.**
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen.**

### Nachweis

    Pflichtdaten    was der Betrieb voraussetzt, je Modul
    Leerzustaende   welche ertraeglich sind, am Schirm
    Reihenfolge     vorgeschlagen, je Schritt begruendet
    ueberspringbar  welche Schritte
    G-228           was existiert, was fehlt

## Bericht

**Claude Code, 2026-09-05. Entwurf, nicht gebaut.**

### Der Befund, der die Frage von 2026-08-31 beantwortet

`[read]` **Am 31.08. blieb eine Frage uebrig:** *darf das Onboarding
uebersprungen werden?* **Daran hing alles Uebrige.**

`[cmd]` **Die Messung beantwortet sie, ohne dass jemand entscheiden
muss:** **in `nutrition.food_preferences` hat JEDE Spalte ausser
`user_id` eine Vorgabe.**

    diet_type          'omnivore'      meals_per_day       3
    allergies          '{}'            snacks_per_day      1
    intolerances       '{}'            cooking_skill       'intermediate'
    general_exclusions '{}'            prep_time_max_min   30
    preferred_cuisines '{}'            budget_level        'medium'
                                       meal_prep_ok        false

`[read]` **Die Datenbank beantwortet damit bereits jede Frage, die
das Onboarding stellen wollte.** **Ein Pflicht-Onboarding wuerde den
Nutzer nach Werten fragen, die schon dastehen.**

### 1 · Was der Betrieb voraussetzt — gemessen, nicht vermutet

`[cmd]` **`test-user@lumeos.local` ist der natuerliche Versuch:**
0 Preferences, 0 Slots, 0 Meals, 0 Zielphasen.

**Angemeldet, alle sechs Reiter, 2026-09-05:**

    Reiter      leer      voll     Konsolenfehler   unbenutzbar?
    diary       4.395 Z   —        1                nein
    planner     3.905 Z   —        1                nein, Leerhinweis
    nutrients   2.515 Z   6.852 Z  1                nein
    foods       3.559 Z   3.574 Z  1                nein - gleich
    einkauf       477 Z     693 Z  1                nein
    rezepte       803 Z   2.238 Z  1                nein, Leerhinweis

`[cmd]` **Kein `NaN`, kein Absturz, kein leerer Rahmen.** `[cmd]`
**Ein Konsolenfehler je Seite** — derselbe wie auf `dev`, also nicht
vom Leerzustand.

`[cmd]` **`foods` ist bei beiden Konten gleich gross** — der Katalog
gehoert niemandem. **Er braucht kein Onboarding.**

**Das Tagebuch eines Nutzers ohne alles**
(`backup/g222-leer-diary.png`):

    "Nichts erfasst an diesem Tag."
    "Fuer diesen Tag ist keine Mahlzeit angelegt."
    vier Karten: Fruehstueck, Mittagessen, ... je mit
      MealCam / Search / Same as yesterday
    "Nur stoebern? Lebensmittel suchen"

`[read]` **Das ist ein brauchbarer erster Tag, ohne eine einzige
Eingabe.** **Die Karten kommen aus der Vorgabe** (`meals_per_day`
= 3), **nicht aus Slots.**

### Der eine Fall, der wirklich blockiert — und er ist keiner

`[cmd]` **Gemessen: von 138 Naehrstoffen haben 137 eine
`sex = 'both'`-Zeile.** `[cmd]` **Genau einer haengt am Geschlecht:
`WATER`.**

`[read]` **Damit ist `biological_sex` eine Verfeinerung, kein
Betriebsmittel.** **Wer es nicht angibt, verliert einen von 138
Richtwerten.**

`[cmd]` **Und der Text sagt es ehrlich** (`mikro-lage.ts:362`):
*,,Fuer dich hinterlegt ist kein vollstaendiges Profil."* — **keine
erfundene Referenz** (C-48/C-378).

### Die Rangfolge, die daraus folgt

    Pflicht fuer den Betrieb        NICHTS
    macht sichtbar besser           Groesse, Gewicht, Geschlecht,
                                    Geburtsdatum  -> Ziele + WATER
    macht den Planer besser         Ernaehrungsform, Allergien
    reine Verfeinerung              Kuechen, Budget, Prep-Zeit,
                                    Kochkoennen, Notizen

`[read]` **Nichts in der linken Spalte** — **die App ist ohne
Onboarding benutzbar, gemessen an sechs Reitern.**

### 2 · Die Slotliste gehoert NICHT ins Onboarding

`[cmd]` **`initialSlots(n)` in `slots-lage.ts:64` traegt eine
vollstaendige Vorgabe** — Fruehstueck 07:30, Mittagessen 12:30,
Abendessen 19:30, Zwischenmahlzeit 10:00, Nachmittagssnack 16:00,
Spaetmahlzeit 21:30. **Ab der siebten nummeriert, keine Obergrenze**
(C-392).

`[cmd]` **Sie leitet sich aus `meals_per_day` ab, und das steht auf
3.** **Ein neuer Nutzer bekommt also drei benannte Mahlzeiten mit
Zeiten, ohne gefragt zu werden.**

**Antwort auf die Frage des Auftrags: sie reicht als Vorgabe.**

`[read]` **Der Grund ist nicht Bequemlichkeit, sondern Ehrlichkeit:**
**wer noch nie etwas erfasst hat, kann seine Mahlzeitenzeiten nicht
sinnvoll angeben.** **Er raet.** `[read]` **Geraten wird die Vorgabe
ohnehin — nur ohne ihn damit aufzuhalten.**

`[cmd]` **Die Liste ist in Settings jederzeit erreichbar** (G-332),
**und das freie Formular im Tagebuch legt Mahlzeiten ohne Slot an.**

### 3 · Die vorgeschlagene Reihenfolge

`[read]` **Onboarding ist der kuerzeste Weg zu einem brauchbaren
ersten Tag** — **also drei Schritte, nicht neun Komponenten.**

    Schritt 1  Koerperdaten          Geschlecht, Groesse, Gewicht,
                                     Geburtsdatum
               ueberspringbar: JA, aber als einziger mit Nachfrage
               Begruendung: der einzige Schritt mit MESSBARER
               Wirkung - TDEE, Makroziele, WATER. Ohne ihn steht
               "kein vollstaendiges Profil" im Naehrstoffreiter.

    Schritt 2  Ernaehrungsform       diet_type + Allergien
               ueberspringbar: JA
               Begruendung: 'omnivore' + '{}' ist eine ehrliche
               Vorgabe. Eine Allergie ist aber SICHERHEIT - wer
               sie hat, gibt sie an; wer keine hat, klickt weiter.

    Schritt 3  Erster Eintrag        eine Mahlzeit, jetzt
               ueberspringbar: JA
               Begruendung: kein Formular, sondern die Suche.
               Wer einmal etwas erfasst hat, hat den Nutzen
               gesehen. Das ist mehr wert als acht Praeferenzen.

**Alle drei duerfen uebersprungen werden.**

`[read]` **Ein Onboarding ohne Ausweg ist eine Huerde** — **und hier
waere es eine ohne Gegenwert, weil jede Spalte eine Vorgabe hat.**

`[read]` **Was NICHT hineingehoert:** Slots (Vorgabe reicht),
Kuechen, Budget, Prep-Zeit, Kochkoennen, Notizen, Likes/Dislikes.
**Sechs der neun Komponenten aus `SPEC_10_PASS2_PATCH.md` sind
Settings-Pflege, kein Onboarding** — **genau das, was Flow 9 schon
beschreibt.**

### Was fuer den Fortschritt noetig waere

`[cmd]` **Es gibt KEINE `onboarding`-Spalte im ganzen Schema**
(alle Schemata, 2026-09-05) — **unveraendert gegenueber dem
30.08.**

`[read]` **Da alle drei Schritte ueberspringbar sind, braucht es
einen Zustand** — sonst fragt es bei jeder Anmeldung erneut.
**Vorschlag: eine Spalte auf `profiles`, kein eigenes Schema.**
`[read]` **Das ist Codex' Bereich und nicht Teil dieses Entwurfs.**

### 4 · G-152 — unveraendert

`[cmd]` **Nachgemessen 2026-09-05: keine View fuer den
Aktivitaetsstrom.** **Die einzige Sicht mit passendem Namen ist
`pg_catalog.pg_stat_activity`** — Postgres' eigene.

`[cmd]` **Aber in der Pipeline hat sich etwas geaendert, waehrend
dieser Auftrag lief:** **`supabase/_pipeline/00_querschnitt/412_activity_stream.sql`
ist neu und ungetrackt**, dazu `quer-c412-activity-stream.test.ts`
und ein Eintrag in `kette.json`.

`[cmd]` **Die Datei traegt `G-152/E-52` im Kopf** und legt
`nutrition.activity_stream` als `security_invoker`-View ueber sechs
Ereignisquellen aus fuenf Modulen an.

`[read]` **Codex arbeitet also gerade daran.** `[cmd]` **In der
laufenden Datenbank steht die View noch nicht** — gebaut heisst
nicht eingespielt. **Der Punkt bleibt bei Codex.**

### 5 · G-228 — drei Skalen, keine zwei gleich

**Der Auftrag: messen, was existiert, melden, was fehlt.**

`[cmd]` **Was existiert — `profiles.experience_level`:**

    CHECK: beginner | advanced | pro | elite
    Vorgabe: keine (NULL erlaubt)
    belegt: 'pro' bei 2 von 6 Profilen, sonst NULL

`[cmd]` **Und daneben, in derselben Codebasis:**

    SPEC_04           beginner | intermediate | advanced | elite
    profiles CHECK    beginner |              | advanced | pro | elite
    rezept-lage.ts    beginner | intermediate | advanced

`[read]` **Drei Skalen, und keine zwei sind gleich.** `[cmd]`
**`intermediate` aus `SPEC_04` ist in `profiles` NICHT
speicherbar** — der CHECK lehnt es ab. `[cmd]` **`pro` steht in
keiner Spec.**

`[read]` **Die dritte ist etwas anderes und darf es bleiben:**
`rezept-lage.ts:273` ist die SCHWIERIGKEIT EINES REZEPTS, nicht der
Grad des Nutzers. **Gleicher Wortlaut, andere Sache** — beim
Ausbauen nicht zusammenlegen.

`[cmd]` **Der Score liest das Profil gar nicht:**
`diary-entwurf.tsx:185` sagt es selbst — *,,Source of level: fest im
Entwurf · liest kein Profil"*, **die Kachel traegt `Attrappe`.**

**Was fehlt, damit E-46 gebaut werden kann:**

    1  die Stufenzahl              Tom nannte das Ziel
                                   ("je mehr umso genauer"),
                                   nicht die Zahl
    2  woran der Grad haengt       Trainingsjahre? Koerperbau?
                                   E-46 nennt es ausdruecklich offen
    3  eine Quelle je Multiplikator  0,90 fuer intermediate steht
                                   in SPEC_04 - woher, ist ungeprueft
    4  ein Weg, ihn zu setzen      kein Feld in Settings gemessen

`[read]` **Nach C-109/E-43 gilt: eine Zahl ohne Beleg ist ein
*conservative default*, kein Ergebnis.** **Ohne Punkt 3 waere jeder
Multiplikator erfunden** — **das ist genau der Fall, den C-378
verbietet.**

`[read]` **Nicht gebaut, wie beauftragt.** **Meine Empfehlung: die
Skala gehoert Tom, weil sie eine Produktentscheidung ist, und die
Multiplikatoren brauchen eine Quelle, bevor eine Zahl entsteht.**

### Eine Abweichung, die gemeldet gehoert

`[cmd]` **Der Auftrag nennt die Datei
`nutrition-g-0222-onboarding.md`.** `[cmd]` **Sie heisst
`nutrition-g-0222-onboarding-flow-fuer-nutrition-preferences-fehlt-in-spec-0.md`.**
`[read]` **Kein zweiter Punkt, nur ein kuerzerer Name im
Auftragstext** — bearbeitet wurde die vorhandene Datei.

`[cmd]` **Zwei weitere Onboarding-Punkte liegen in `todos/`:**
G-083 (*das Onboarding ist entworfen, aber nicht gebaut*) und
G-141 (*als ADR final entschieden*). `[read]` **Wer diesen Entwurf
abnimmt, sollte sie danebenlegen** — sie koennten dasselbe zum
dritten Mal beschreiben.

### Gemessen, nicht gebaut

    geaendert           nichts
    dev@lumeos.app      nicht geschrieben, 730 Mahlzeiten
    test-user           nur gelesen
    gestaged            nichts

**Bildschirmfotos:** `backup/g222-leer-*.png` (sechs Reiter ohne
Daten), `backup/g222-voll-*.png` (dieselben mit).

## Abnahme

_(vom Orchestrator)_
