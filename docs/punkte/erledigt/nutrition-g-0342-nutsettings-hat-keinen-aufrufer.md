---
nr: G-342
typ: befund
modul: nutrition
schwere: niedrig
angelegt: 2026-09-02
braucht: []
kind_von: G-339
entscheidung: null
agent: claudecode
beauftragt: 2026-09-02
erledigt: 2026-09-07
commit: adff4a07
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/modale.tsx
zahlen:
  gemessen: 2026-09-02
---

# G-342 — `nutsettings` hat keinen Aufrufer

## Befund

Aus G-339, Claude Code, 2026-09-02.

`[cmd]` **`nutsettings` hat keinen Aufrufer.** `[cmd]` **Der
`meal_schedule`-Block darin ist toter Code.**

`[read]` **Und er ist seit E-58 ueberholt:** **die Mahlzeitenstruktur
liegt in `meal_slots`, nicht in einem Einstellungsblock.**

## Zu entscheiden

`[read]` **Loeschen oder anschliessen?**

`[cmd]` **G-332 hat die Slotliste in Preferences gebaut, G-335 hat
sie in Settings angeschlossen** — **der Ort existiert.**

`[read]` **Ein zweiter Block waere ein zweiter Schreibweg** — **genau
das, was G-72 vermieden hat.**

`[read]` **A-59: geloescht, nicht auskommentiert.**

## Auftrag — toter Code und zwei Reste

**Mitbeauftragt: G-333, G-337.** Bericht in diese Datei.

**Beauftragt am 2026-09-02.**

### 1 · G-342 — `nutsettings` loeschen

`[cmd]` **Kein Aufrufer.** `[cmd]` **Der `meal_schedule`-Block ist
seit E-58 ueberholt** — **die Mahlzeitenstruktur liegt in
`meal_slots`.**

`[cmd]` **G-332 hat die Slotliste in Preferences gebaut, G-335 hat
sie in Settings angeschlossen** — **der Ort existiert.**

`[read]` **A-59: geloescht, nicht auskommentiert.**

### 2 · G-333 — `erfassen.tsx` loeschen

`[read]` **Deine Empfehlung, mit Begruendung:** *,,enthaelt nichts,
was anderswo fehlt, und ihr einziges Alleinstellungsmerkmal beruft
sich auf ein UNIQUE, das es nicht mehr gibt."*

`[cmd]` **477 Zeilen, kein Aufrufer, zuletzt 16.08.**

`[read]` **Toms Freigabe fuer `backup/` gilt nicht fuer Code** —
**aber A-59 ist eindeutig, und die Messung liegt vor.**

`[read]` **Loeschen.** `[cmd]` **Und ein Waechter, der es meldet,
falls die Datei je wiederkehrt.**

### 3 · G-337 — `strong_avoid` ohne Schreibweg

`[cmd]` **Der CHECK kennt sechs Werte, drei sind belegt.**
`[cmd]` **`strong_avoid` erzeugt niemand.**

`[cmd]` **Die mittlere Stufe wirkt in der Suche** —
`075_preference_search_application.sql:1053-1065` — **aber sie kommt
aus `intolerances`, nicht aus `strong_avoid`.**

`[read]` **Miss, ob ein Nutzer die Stufe je Lebensmittel braucht.**
`[read]` **Und wenn nicht: melde, dass der Wert aus dem CHECK
faellt** — **das ist Codex' Arbeit, nicht deine.**

`[read]` **Ein CHECK-Wert ohne Schreibweg ist dieselbe Klasse wie
eine Funktion ohne Aufrufer** — **beim naechsten Auftrag wird er fuer
gebaut gehalten.**

### Was nicht zu tun ist

**Kein Schreibweg fuer Quick-Add** — das ist G-340, Toms
Entscheidung.
**Nichts in `supabase/` aendern.**
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen.**

### Nachweis

    nutsettings     weg, Waechter meldet Wiederkehr
    erfassen.tsx    weg, 477 Zeilen, Gate gruen
    strong_avoid    braucht ein Nutzer die Stufe, begruendet
    Gate            15/15 nach dem Loeschen

## Bericht

**Claude Code, 2026-09-02.** Gemessen auf `dev@lumeos.app`.
Dev-Server auf 3200 **nicht neu gestartet**. **Nichts in `supabase/`
geaendert, nichts auf `dev` geschrieben.**

---

## 1 · G-342 — `nutsettings` ist geloescht

### Vor dem Loeschen gegengeprueft

`[cmd]` **Drei Vorkommen, alle in derselben Datei:**

    modale.tsx:30    der Typwert 'nutsettings'
    modale.tsx:572   die Verteilerzeile
    v2-attrappen.test.ts:1307   ein Kommentar

`[cmd]` **Nichts setzt ihn** — `kopfknoepfe.tsx` kennt nur `quickadd`
und `mealcam`. **Der Befund aus G-339 gilt unveraendert.**

### Was entfernt wurde

    NutritionSettingsModal   133 Zeilen  (421-552)
    VORGABE_ZEIT              17 Zeilen  (nur dort benutzt)
    der Typwert                1 Stelle
    die Verteilerzeile         1 Zeile

`[cmd]` **`modale.tsx`: 574 → 440 Zeilen.**

`[read]` **`MEAL_TYPES` bleibt** — es speist weiter die
Quick-Add-Auswahl (G-339). **Nur `VORGABE_ZEIT` verlor seinen
einzigen Verbraucher und ging mit.**

`[read]` **Die Schnittgrenzen habe ich vorher gemessen**, nicht
geschaetzt: Startzeile 421, Endzeile 552, und was folgt ist der
Verteiler. `[read]` **Die Endmarke `</Rahmen>\n  )\n}` kommt in
mehreren Modalen vor** — ohne Gegenprobe haette ich den falschen
Block treffen koennen.

### Warum es richtig war, nicht anzuschliessen

`[cmd]` **Der `meal_schedule`-Block ist seit E-58 ueberholt:** die
Mahlzeitenstruktur liegt in `nutrition.meal_slots` (C-392), gepflegt
im Vorlieben-Reiter (G-332), aus den Einstellungen verlinkt (G-335).

`[read]` **Ein zweiter Block waere ein zweiter Schreibweg** — genau
das, was G-72 vermieden hat.

### Ein Waechter, der die Vorlage mass, ist berichtigt

`[cmd]` **`v2-attrappen.test.ts` verlangte alle VIER Modale der
Vorlage** — er waere durch die Loeschung gefallen.

`[read]` **Er mass die Treue zum Entwurf.** **An dieser Stelle ist
der Entwurf ueberholt: eine Entscheidung (E-58) schlaegt ein
Mockup.** `[cmd]` **Er prueft jetzt die drei lebenden**, und die
Abwesenheit des vierten sichert ein neuer Waechter.

---

## 2 · G-333 — `erfassen.tsx` ist geloescht

`[cmd]` **477 Zeilen, kein Aufrufer, zuletzt geaendert am
2026-08-16.** `[cmd]` **Vor dem Loeschen noch einmal gegengeprueft:
kein Import in `apps/` oder `packages/`.**

`[read]` **Die Begruendung stand im G-341-Bericht und ist gemessen**
— Stueck fuer Stueck:

    TYP_LABEL              KATEGORIE_TEXT (G-335/G-339)
    Mahlzeit anlegen       FreieMahlzeit-Modal (G-336)
    Position hinzufuegen   FoodSuchModal (G-320)
    Menge aendern          mahlzeiten.tsx:1063, PATCH
    Position entfernen     mahlzeiten.tsx:1081, DELETE
    Suchfeld               useFoodSuche — deutlich besser
    search_events          food-search.ts:864

`[cmd]` **Ihr einziges Alleinstellungsmerkmal war falsch:** sie
sperrte Mahlzeitentypen wegen eines `UNIQUE (user_id, entry_date,
meal_type)`, **das es nicht mehr gibt** — `dev@lumeos.app` hat an
vier Tagen zwei `lunch`-Eintraege.

### Drei Waechter mussten mit

`[cmd]` **Zwei hielten sie ausdruecklich am Leben:**

    suchen-und-vorschau    "toter Code — gemeldet, nicht umgebaut"
    mahlzeit-name          nahm sie als TOT aus der Zaehlung aus,
                           und prueft, DASS es sie gibt

`[read]` **Der zweite hat genau getan, wofuer er gebaut war:** er
sagt *,,die ausgeschlossene Datei gibt es nicht mehr — dann den
Ausschluss entfernen"*. **Das habe ich getan** — der Zaehler sieht
jetzt den ganzen Baum.

`[cmd]` **Der erste ist umgestellt:** aus *,,sie ist tot"* wird
*,,sie ist weg und kommt nicht zurueck"*. **Das ist der Waechter,
den der Auftrag verlangt.**

---

## 3 · G-337 — nein, ein Nutzer braucht die Stufe nicht

**Die Frage:** *,,braucht ein Nutzer die Stufe je Lebensmittel?"*

### Der ADR bindet `strong` an die Unvertraeglichkeit, nicht ans Lebensmittel

`[cmd]` **`ADR_NUTRITION_PREFERENCES_V1.md:30`:**

    | Unvertraeglichkeit | **strong** | Starker Ausschluss —
      nur auf explizite User-Suche anzeigen |

`[cmd]` **Der ADR nennt `strong` an genau drei Stellen** (Zeile 30,
55, 89) — **jedes Mal fuer die Unvertraeglichkeit, nie fuer ein
einzelnes Lebensmittel.**

`[read]` **Zeile 55 ist die Ursache des Rests:** dort steht
`severity -- 'hard' | 'strong' | 'soft' | 'boost'` als
Datenmodell-Skizze. **Diese Liste wurde in den CHECK uebernommen** —
**auch der Wert, fuer den es kein Eingabewort gibt.**

### Die zwei Mechanismen beantworten verschiedene Fragen

`[cmd]` **Gemessen:**

    Weg                       Ziel              Reichweite
    food_preferences          Allergenklasse    contains_lactose
      .intolerances                             = 1.021 Lebensmittel
                                                contains_gluten = 622
                                                contains_nuts   = 120

    food_preference_items     einzelnes Essen,  je Zeile eines
      .strength               Kategorie, Tag

`[read]` **Eine Unvertraeglichkeit ist eine Eigenschaft des
Koerpers, kein Urteil ueber ein Lebensmittel.** **Wer Laktose nicht
vertraegt, vertraegt sie in jedem Essen nicht** — die Klasse ist die
richtige Ebene, und dort ist sie gebaut.

### Und der Nutzer hat kein Wort dafuer

`[cmd]` **Je Lebensmittel kennt die Oberflaeche genau drei
Aeusserungen** (`FOOD_PREFERENCE_KINDS`): `liked`, `disliked`,
`hard_exclude`. `[cmd]` **Der `preference`-CHECK kennt dieselben
drei.**

`[read]` **Es gibt kein *,,ich vermeide das ziemlich"* zwischen
Daumen runter und Ausschluss** — **und keine Entscheidung verlangt
eines.** `[cmd]` **E-16 und E-30 regeln generelle Ausschluesse und
Allergien; die mittlere Stufe kommt in beiden nicht vor.**

### Die Antwort: der Wert faellt aus dem CHECK

**MELDUNG AN CODEX — `strong_avoid` gehoert entfernt:**

    050_preferences_foundation.sql:63   der CHECK selbst
    074_preferences_api.sql:75          WHEN strength = 'strong_avoid'
    075_preference_search_application.sql:263   dieselbe Zuordnung
    075_preference_search_application.sql:837   dieselbe Zuordnung

`[cmd]` **Die drei Lesestellen bilden `strong_avoid` → `strong` ab**
— **tote Zweige, weil kein Erzeuger den Wert setzt.** `[cmd]`
**Belegt: `boost 5`, `hard_exclude 2`, `soft_dislike 2`; `strong_avoid`
null.**

`[read]` **Die mittlere Stufe bleibt** — sie kommt aus
`intolerances` und wirkt (`075:402-411`, `strong`, −25).
**Entfernt wird nur der zweite, nie benutzte Zugang zu ihr.**

`[read]` **Ich habe nichts in `supabase/` geaendert** — der Auftrag
sagt es, und die Migration gehoert Codex.

`[read]` **Warum es zaehlt:** `[cmd]` **ein CHECK-Wert ohne
Schreibweg ist dieselbe Klasse wie eine Funktion ohne Aufrufer** —
**beim naechsten Auftrag wird er fuer gebaut gehalten.** **Genau das
ist bei `meal_plan_slots` passiert** (G-336: gebaut, gefuellt, kein
Leser).

---

## Waechter

`[cmd]` **Neu bzw. umgestellt:**

    G-333: erfassen.tsx ist geloescht und kommt nicht zurueck
           (Datei-Abwesenheit + kein Import, ueber den ganzen Baum)
    G-333: der Ausschluss im Zaehler ist weg
    G-342: der tote Einstellungsblock ist weg
           (Funktion, Typwert, meal_schedule — dreifach)
    G-342: die drei LEBENDEN Modale bleiben
    G-339/G-342: in modale.tsx stehen keine Zeiten mehr
    v2-attrappen: prueft drei statt vier Modale, mit Begruendung

`[read]` **Der Waechter fuer die lebenden Modale ist der wichtigste:**
**ohne ihn koennte eine Loeschung alle vier treffen und bliebe
gruen.**

## Sabotageprobe: 6 Eingriffe, 6 Faelle

`[cmd]` **Eine Loeschung ist eine Abwesenheit** — **sie laesst sich
nur pruefen, indem man die Sache zurueckbringt.**

    faellt   erfassen.tsx kehrt zurueck
    faellt   ein Aufrufer fuer erfassen.tsx (Datei bleibt weg)
    faellt   das Einstellungsmodal kehrt zurueck
    faellt   der Typwert nutsettings kehrt zurueck
    faellt   die Vorgabezeiten kehren zurueck
    faellt   der meal_schedule-Block kehrt zurueck

`[cmd]` **Nach dem Rueckbau keiner rot.**

## Laeufe

    pnpm --filter @lumeos/web test      1378 gruen, 0 rot
    npx tsc --noEmit                    keine Ausgabe
    pnpm --filter @lumeos/web lint      keine Warnung

`[cmd]` **`pnpm gate` nicht gelaufen** — er faellt an fremden
ungetrackten Migrationen (C-327a, C-385, Codex) mit INSERT/DELETE.
**Nicht diese Arbeit.** `[read]` **Der Nachweis verlangt *,,Gate
15/15"*** — **das kann ich nicht liefern, solange fremde Dateien ihn
blockieren.** **Web-Tests, Typecheck und Lint sind einzeln gruen.**

## Neue Befunde

    1  `strong_avoid` faellt aus dem CHECK — vier Stellen in
       supabase/, Codex' Arbeit. Die mittlere Stufe bleibt, sie
       kommt aus `intolerances`.

    2  `v2-attrappen.test.ts` mass Vorlagentreue gegen eine seit
       E-58 ueberholte Vorlage. Berichtigt — aber es lohnt zu
       pruefen, ob weitere Zusagen dort denselben Stand messen.

## Nicht getan

    kein Schreibweg fuer Quick-Add — das ist G-340, Toms
      Entscheidung
    nichts in supabase/ geaendert — strong_avoid nur gemeldet
    nichts auf dev geschrieben
    nicht committet, nicht gestaged, nicht gepusht
    Dev-Server nicht neu gestartet

## Abnahme

**2026-09-07, Orchestrator. Nachgemessen.** `[cmd]` Gate 15/15
gruen — **die Blockade, die er meldete, ist weg.**

### 610 Zeilen weniger

    nutsettings-Block   133 Zeilen, modale.tsx 574 -> 440
    erfassen.tsx        477 Zeilen

`[cmd]` **Committet in `adff4a07`.**

### Vier Waechter hielten sie am Leben

`[read]` **Das ist der interessante Teil:** **die Dateien waren nicht
nur ungenutzt** — **vier Waechter pruefen ihre Existenz und haetten
das Loeschen gemeldet.**

`[cmd]` **Umgestellt, 6 von 6 Sabotagen bestanden** — **durch
Zurueckbringen geprueft.**

`[read]` **Ein Waechter, der toten Code schuetzt, ist selbst ein
Befund** — **er misst das Wort *existiert*, nicht die Wirkung.**

### Und ein Test mass gegen einen ueberholten Entwurf

`[cmd]` **`v2-attrappen.test.ts` prueft Vorlagentreue gegen einen
Stand von vor E-58.**

`[read]` **Er hat eine Zusage berichtigt und gemeldet, dass eine
Durchsicht lohnt** — **ob weitere Tests denselben alten Stand
messen.**

`[read]` **Das ist die richtige Reihenfolge:** **berichtigen, was im
Auftrag steht, und den Rest melden.** **Als G-343.**

**Abgenommen.**

