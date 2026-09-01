Uebergabe 2026-09-02
====================

Fuer den Orchestrator der naechsten Sitzung.

> **An Tom:** die Projektanweisung nennt als Einstieg
> `docs/sessions/2026-08-27-uebergabe.md`. **Bitte auf
> `2026-09-02-uebergabe.md` aendern.** Ich kann die Projektanweisung
> nicht selbst bearbeiten.

---

Zuerst lesen
------------

1. **Diese Datei.**
2. `CLAUDE.md` — vier neue Regeln vom 01. und 02.09., siehe unten.
3. `docs/punkte/00-INDEX.md` — 431 Punkte, nach Nummer.

`[read]` **`docs/todo/LAUFEND.md` gibt es nicht mehr.** Wer woran
arbeitet, steht in `docs/punkte/laufend_codex/` und
`laufend_claudecode/`.

---

Was gerade laeuft
-----------------

    Codex          C-381 + G-151   die Freigaberegel liegt im
                                   Browser; der Ausfuehrer fehlt
    Claude Code    G-320           die Lebensmittelsuche als Modal
                   G-305, G-314    Sackgassen, Plan-Vorschau

---

Der Stand
---------

    todos       219   quer 58 - nutrition 46 - medical 34 -
                      supplements 32 - training 16 - coach 14 -
                      recovery 14 - goals 5
    erledigt    207
    E-Nummern    44
    Waechter     25 Befunde, genau der Sollstand
    Gate         15 Aufgaben, gruen
    gepusht      bis 4aca5b5e

---

Nutrition ist der Schwerpunkt der letzten zwei Tage
---------------------------------------------------

    Diary        vollstaendig
    Insights     6 Kacheln
    Nutrients    vollstaendig
    Preferences  vollstaendig
    Rezepte      Flow 7 und 8 gehen durch
    Meal plans   Bibliothek, Aktivieren, Compliance, Protokoll
    Planner      Werkbank, Positionen, Copy week
    Food DB      zwei Luecken: FoodAmountInput, CustomFoodForm

`[cmd]` **Der Weg laeuft durchgehend:** Plan bauen, aktivieren,
Tagebuch zeigt die Plantage, bestaetigen oder abweichen, das
Protokoll traegt es, die Auswertung sagt was regelmaessig gewechselt
wird.

`[cmd]` **Auf `dev@lumeos.app` stehen 8 Plaene mit allen vier
Herkuenften und 6 Protokollzeilen** — angelegt, damit am Schirm
etwas zu sehen ist. **Der Seed ist dauerhaft**
(`testdaten-einspielen.ts:2167`).

---

Neun Entscheidungen aus zwei Tagen
----------------------------------

    E-36  Thai bleibt waehlbar mit Hinweis
    E-37  Marketplace zurueckgestellt, Importweg definiert
    E-38  zensierte Messwerte nach Lower Bound
    E-39  Rezepte, Plaene, Einkaufslisten werden in V1 gebaut
    E-40  der Planner ist die Werkbank, Meal plans die Bibliothek
    E-41  zwei verschiedene Sperren, getrennt gehalten
    E-42  Editieren ist erlaubt, Weiterverkaufen nicht
    E-43  BLS 4.0 ist die einzige Lebensmittelquelle
    E-44  drei Lebenszyklen fuer Plaene

`[read]` **E-43 und E-44 entstanden, weil der Orchestrator zwei
falsche Kennungen zitiert hatte** — E-03 ist Soreness, E-31 sind
Referenzbewertungen. **Codex hat beide gefunden.**

---

Was der Orchestrator falsch gemacht hat
---------------------------------------

`[read]` **Vier Fehlerklassen, alle mehrfach:**

**1. Kacheln aus dem Schema abgeleitet statt aus dem Mockup.**
`[cmd]` Planumfang, Einhaltung, Herkunft — eine Kachel je
Spaltengruppe. **Keine davon stand in einer Vorlage.**

**2. Zwei gleichnamige Dateien vermischt.** `[cmd]`
`theme-v1/module-nutrition-spec.jsx` ist die Vorlage,
`mockup-zwischenwurf/.../MealPlansView.js` nicht. **Dreimal
verwechselt.**

**3. Komponenten zitiert, die es nicht gibt.** `[cmd]`
`RecipeDetail` steht nur als Kommentar. **Zweimal.**

**4. Berichte abgenommen, ohne selbst hinzusehen.** `[cmd]` Bei
G-311 stand *,,vier von vier Plaenen sichtbar"* — **die Buehne war
zurueckgebaut, der Nachweis existierte nicht mehr.**

`[read]` **Alle vier stehen jetzt als Regel in `CLAUDE.md`.**

---

Was die Agenten gut gemacht haben
---------------------------------

`[read]` **Beide haben mehrfach angehalten und gemeldet, statt zu
erfinden:**

`[cmd]` **Claude Code:** `meal_plan_day_to_diary` schreibt echte
`meals` — **Auftragspunkt vorgelegt statt gebaut.** `[cmd]` Und
*,,Copy week"*: die Funktion existierte seit C-150 unter einem
Attrappen-Knopf.

`[cmd]` **Codex:** zwei falsche E-Nummern gefunden. `[cmd]` Den
allgemeinen Kopierlauf nicht gestartet, **weil er den
protokollierten Plan beruehrt haette.** `[cmd]` Und den Fremdanteil
im Arbeitsbaum gemeldet.

---

Wiederkehrende Fallen
---------------------

`[read]` **Der Waechter prueft das Wort statt der Wirkung** — an
einem Tag zwoelfmal aufgetreten, bei beiden Agenten.

`[cmd]` **Acht Waechter waren gruen, waehrend `tsc` acht
Syntaxfehler meldete** — ein JSX-Kommentar als erstes Element nach
`return (`. **Die Reihenfolge im Gate ist die einzige Absicherung.**

`[cmd]` **Drei Funktionen ohne Aufrufer gefunden:**
`meal_plan_day_to_diary`, `copy_meal_plan_week`,
`reference_assessment_window_flags`. `[read]` **Was keinen Aufrufer
hat, wird beim naechsten Auftrag fuer gebaut gehalten.**

---

Was bei Tom liegt
-----------------

    G-222   Onboarding — Inhalt gemeinsam festlegen, Daten sind da
    C-382   wer entscheidet, ob ein Plan editierbar ist
    C-379   sequence ist waehlbar und tut dasselbe wie once
    G-228   Stufennamen intermediate gegen pro

---

Wie gearbeitet wird
-------------------

`[read]` **Der Zyklus laeuft ohne Aufforderung:**

    Bericht kommt
      -> Kurzcheck: ist ein vorbereiteter Auftrag betroffen?
      -> Auftrag raus, BEVOR abgenommen wird
      -> Abnahme mit eigener Messung
      -> Befunde als Punkte
      -> committen, getrennt nach Agentenbereich
      -> next/ fuellen

`[read]` **Der Orchestrator hat den dritten Schritt zweimal
uebersprungen** — **Tom musste beide Male nachfragen.**
