---
nr: C-379
typ: feature
modul: nutrition
schwere: mittel
angelegt: 2026-09-01
braucht: []
kind_von: C-377
entscheidung: E-54
agent: codex
beauftragt: 2026-09-07
erledigt: 2026-09-07
commit: ec3fa071
beruehrt:
  tabellen: [nutrition.meal_plans]
zahlen:
  gemessen: 2026-09-01
  sequence_plaene: 0
---

# C-379 — `sequence` hat kein Ziel

## Befund

Aus G-306 (Claude Code) und B-20 (Codex), 2026-09-01.

`[cmd]` **`next_plan_id` steht live, mit Ziel- und
Selbstreferenz-Constraint.** `[read]` **Die urspruengliche Aussage
*,,die Spalte fehlt"* war ueberholt.**

`[cmd]` **Aber es gibt keinen Schreiber:**

    beide Web-Schreibschemata     lassen next_plan_id nicht zu
    Aktivierungsdialog            bietet nur once und rollover
    Ablaufbehandlung              behandelt sequence wie once
    live                          0 sequence-Plaene

`[cmd]` **Und im Ablaufdialog teilen sich `once` und `sequence` einen
Knopf** — der Vorschlagssatz unterscheidet sie, der Knopf nicht.

## Der Widerspruch

`[cmd]` **Die Spec fordert automatische Uebergabe an den
Folgeplan.** `[cmd]` **C-373 und E-42 haben entschieden: die Meldung
beim Ablauf ist die Ausfuehrung, der Nutzer waehlt.**

`[read]` **Beide koennen nicht gleichzeitig gelten.**

## Zwei Wege

`[read]` **Automatisch:** beim Ablauf wird `next_plan_id` aktiviert,
ohne Frage. `[read]` **Dann braucht der Aktivierungsdialog einen
Planpicker, und der Nutzer bindet zwei Plaene aneinander.**

`[read]` **Manuell:** der Ablaufdialog nennt den Folgeplan als
Vorschlag, der Nutzer bestaetigt. `[cmd]` **Das ist der heutige
Stand, nur ohne die Spalte zu nutzen.**

`[read]` **Der zweite passt zu E-42** — *,,das obliegt dem User und
seiner Verantwortung"*. `[read]` **Der erste ist das, was *sequence*
verspricht.**

## Solange nichts entschieden ist

`[read]` **`sequence` ist waehlbar und tut dasselbe wie `once`.**
`[cmd]` **Bei 0 Plaenen faellt das niemandem auf** — **aber es ist
ein Versprechen ohne Ausfuehrung, wie *Next restart* und *Copy
week*.**

## Entschieden: E-53, 2026-09-02

Tom dreht die Frage um: *,,der kern der frage ist wie werden diese
plaene ueberhaupt gespeichert und dargestellt? wir brauchen ein
flowchart mit editierbaren daten wie startdatum etc und das muss auch
so in die db. dann koennen wir mit planpicker arbeiten."*

`[read]` **Nicht *Planpicker bauen oder `sequence` entfernen*, sondern
*erst die Kette, dann der Picker als Feld darin*.**

### Das Schema kann es bereits

`[cmd]` **Zwei CHECKs erzwingen die Kette:**

    sequence_not_self_check     next_plan_id <> id
    sequence_target_check       lifecycle_type = 'sequence'
                                -> next_plan_id NOT NULL

`[read]` **Das Schema laesst keine halbe Kette zu** — **wer
`sequence` waehlt, muss ein Ziel nennen.** `[cmd]` **Genau deshalb
bietet der Dialog es heute nicht an.**

### Zwei Fragen vor dem Bau

`[read]` **Reicht `next_plan_id`?** `[cmd]` **Eine einfach verkettete
Liste bildet eine Reihe ab** — **keine Verzweigung, keinen
gemeinsamen Nachfolger.**

`[read]` **Und was geschieht mit `start_date` in der Kette?**
`[cmd]` **Heute setzt das Aktivieren es.** `[read]` **In einer Kette
waere das zweite Startdatum abgeleitet, nicht eingegeben.**

`[read]` **Bis dahin bleibt `sequence` nicht waehlbar, mit Grund an
der Kachel.**

## Weitergedacht: E-54, 2026-09-02

Tom: *,,das kann ein komplettes jahr sein mit allen phasen parallel
zu training/supplement etc. also ja das spricht fuer eigene
ausbaubare tables."*

`[read]` **Damit faellt `next_plan_id` als Traeger** — **eine
verkettete Liste bildet eine Reihe ab, kein Jahr mit mehreren
Spuren.**

`[cmd]` **Und das Muster gibt es schon zweimal:**
`goals.goal_phases` (5 Zeilen) und
`supplements.user_supplement_cycles`.

`[read]` **Bevor eine dritte Fassung entsteht, wird gemessen** —
**C-383.**

`[read]` **Die Frage waere dann nicht *welcher Plan folgt auf
welchen*, sondern *welcher Plan gilt in dieser Phase*** — **und die
Kette entsteht aus der Zeitachse, nicht umgekehrt.**

## Auftrag — drei Punkte, deren Vorbedingung erledigt ist

**Mitbeauftragt: C-35, C-193.** Bericht in diese Datei.

**Beauftragt am 2026-09-07.**

### Warum diese drei

`[read]` **Alle drei tragen ein `braucht:`, dessen Vorbedingung
laengst erledigt ist** — **sie warten auf nichts.**

    C-379   braucht C-383   -- C-383 erledigt am 02.09.
    C-35    braucht C-386   -- C-386 erledigt am 02.09.

### 1 · C-379 — `sequence` hat kein Ziel

`[cmd]` **C-383 hat gemessen:** `goal_phases` **traegt fuenf
Testzeilen, keine Planreferenz, keinen Produkt-Schreibweg.**

`[cmd]` **Und E-53 stellte den Punkt zurueck, bis das Flussbild
steht.**

`[read]` **Miss, ob er noch gilt** — `[cmd]` **E-62 hat inzwischen
`days_count` als Laufzeit festgeschrieben, und C-403 hat die
fehlenden Wochen gebaut.**

`[read]` **Vielleicht ist die Frage jetzt kleiner:** **`sequence`
braucht einen Folgeplan, und `next_plan_id` gibt es.**

### 2 · C-35 — was aus zwei gefallenen Modellen bleibt

`[cmd]` **C-386 hat drei Reste gemessen:** Zubereitungsschluessel
eingeflossen, Vertreterregel teilweise, Erzeugnis-Zellen nicht.

`[cmd]` **C-388 hat den zweiten geschlossen:** **402 von 403 Familien
treffen nie eine Suche.**

`[cmd]` **Und C-389 den dritten:** **vier Saftzeilen berichtigt,
keine 53er-Regel.**

`[read]` **Miss, was von C-35 uebrig ist** — **vermutlich nichts.**

### 3 · C-193 — MealCam warnt bei harten Ausschluessen

`[cmd]` **A-47 hat gemessen: die harte Stufe entfernt, sie wertet
nicht ab** — **120 `contains_nuts`-Zeilen fehlen bei JEDER Suche.**

`[read]` **Miss, ob MealCam denselben Weg nimmt** — **oder ob sie
Zutaten zeigt, die die Suche ausschliesst.**

`[cmd]` **MealCam ist eine Attrappe** (G-276) — **aber der Leseweg
dahinter koennte schon stehen.**

### Was nicht zu tun ist

**Keine Datenlogik in `migrations/`.**
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `neustart`, kein `start`, kein `aufraeumen`.**

### Nachweis

    C-379   gilt noch / kleiner geworden, begruendet
    C-35    was uebrig ist, gezaehlt
    C-193   nimmt MealCam den harten Weg, gemessen

## Bericht

**Stand 2026-09-05 — gemessen, nichts gebaut.** `apps/`, Migrationen,
Dev-Server, Stage, Commit und Push blieben unberuehrt.

### C-379 — die Wochenfrage ist erledigt, die Folgebeziehung nicht

`[cmd]` **C-403 hat die behauptete Laufzeit jetzt wirklich belegt:**
der neue *Cut 4-Meal 2200* hat bei `once` und `days_count = 28` vier
Wochen, 28 Tage und 112 Positionen; *Lean bulk 3100* hat bei
`days_count = 84` zwoelf Wochen, 84 Tage und 336 Positionen. E-62 ist
damit keine offene Planfolge-Frage mehr: `days_count` ist Laufzeit,
nicht die Zahl der beschriebenen Tage.

`[cmd]` **Der vorhandene Datenanker reicht fuer eine einfache Kette,
ist aber unbenutzt:** Von neun Plaenen tragen **0**
`lifecycle_type = 'sequence'` und **0** `next_plan_id`. Die drei
CHECKs erlauben nur die sinnvolle Form: `sequence` verlangt
`next_plan_id`, Nicht-`sequence` verbietet ihn, und ein Plan darf
nicht auf sich selbst zeigen.

`[cmd]` **Der Produkt-Schreibweg kann diesen Anker noch nicht setzen.**
`next_plan_id` fehlt in beiden Plan-Eingabeschemas; das Planformular
faengt `sequence` deshalb ab und verlangt einen noch nicht gebauten
Folgeplan-Picker. Die vorhandene Spalte ist also kein benutzbarer
Folgeweg.

`[cmd]` **C-383s Befund gilt unveraendert:** `goals.goal_phases` hat
fuenf Zeilen, alle mit `source = GO-07 testdata`; es gibt weder eine
Planreferenz in ihren 14 Spalten noch einen Produkt-Schreibweg.

**Ergebnis:** C-379 ist kleiner geworden, aber nicht erledigt.
Fuer eine reine Planfolge ist kein neues Datenmodell noetig: ein
Folgeplan-Picker und die durchgereichte `next_plan_id`-Mutation
schliessen die konkrete Luecke. Das ersetzt E-53/E-54 nicht: Ob diese
Kette unabhaengig neben einer Jahres-Phasenplanung stehen darf oder
eine Phase Plan und Zeitraum besitzen soll, bleibt die noch zu
entscheidende Flussfrage. C-403 und E-62 beantworten nur Laufzeit und
Planvollstaendigkeit.

### C-35 — kein Rest

`[cmd]` **Der Zubereitungsschluessel ist produktiv verwertet:**
5.014 der 7.140 Foods haben ein von `name_de` abweichendes
`name_display_de`; die Suchfunktion benutzt zusaetzlich
`such_rang_zubereitung` in ihrer Sortierung.

`[cmd]` **Der Vertreterrest ist mit C-388 geschlossen:** Eine
pauschale Familienvertretung hat keinen belegten Nutzen (402 von 403
Familien wurden nie ausgewaehlt). Fuer konkrete spaetere Fehlsuchen
bleibt die gezielte Alias-Kuration, nicht ein viertes
Vertreterkriterium.

`[cmd]` **Die vier Erzeugnis-Zellen sind mit C-389 korrigiert:**
`F201600`, `F310600`, `F603600` und `F603700` stehen auf
`minimally_processed`; die drei nicht gleichartigen Smoothies
`F032600`, `F033600`, `F034600` bleiben `raw`.

**Ergebnis:** Von C-35 bleibt kein umsetzbarer Rest. Der
Zubereitungsschluessel ist genutzt, die Vertreterregel ist fachlich
beendet und die konkret belegten Saft-/Nektarzeilen sind berichtigt.

### C-193 — MealCam geht keinen Leseweg

`[cmd]` **Die Suche entfernt harte Ausschluesse weiter:** Bei
`nuss` liefert `food_search` ohne Profil 125 Treffer, davon 24 mit
`contains_nuts`; mit einem Profil mit harter Nussallergie sind es 77
Treffer und **0** `contains_nuts`. In den Suchzielen liegen 120
harte `profile_allergy`-Zuordnungen. Der Befund von A-47 gilt also.

`[cmd]` **MealCam ruft diese Suche nicht auf.** Der einzige Dialog
traegt drei Treffer fest im Komponentenquelltext und hat dort keinen
`fetch`, keine Supabase-Abfrage und keine `food_search`-Verwendung.
Auch im Nutrition-Schema gibt es keine MealCam-Spalte oder -Funktion;
der einzige `mealcam`-Treffer in `food_search` ist ein Kommentar.

**Ergebnis:** MealCam versteckt harte Zutaten derzeit weder noch zeigt
es sie an — es hat gar keinen Datenleseweg. C-193 bleibt deshalb ein
Auftrag fuer die echte MealCam: Erkennung muss Lebensmittel-IDs auch
dann an den Review geben, wenn die interaktive Suche sie ausblendet;
harte Treffer muessen dort sichtbar warnen und eine Bestaetigung
verlangen. Die in C-193 offene Entscheidung, ob diese Bestaetigung
dauerhaft wird, ist erst bei diesem realen Schreib-/Reviewweg faellig.

## Abnahme

**2026-09-07, Orchestrator.**

### C-379 — kleiner, aber offen

`[cmd]` **C-403 fuellt die Laufzeiten korrekt.** `[cmd]`
**`next_plan_id` und die Checks existieren** — **aber kein
Schreibweg kann einen Folgeplan setzen.**

`[cmd]` **`goal_phases` bleibt Testdaten ohne Planbezug.**

`[read]` **Meine Vermutung war, die Frage sei jetzt kleiner:**
*,,`sequence` braucht einen Folgeplan, und `next_plan_id` gibt es."*

`[read]` **Sie ist kleiner** — **aber die Spalte allein reicht
nicht.** `[read]` **Dieselbe Klasse wie `strong_avoid` vor C-406:
ein Feld ohne Schreibweg.**

### C-35 — nichts mehr uebrig

    Anzeigehilfe        aktiv
    Vertreterregel      fachlich beendet (C-388)
    vier Saftzeilen     korrigiert (C-389)

`[read]` **Meine Vermutung stimmte: kein umsetzbarer Rest.**

`[read]` **Der Punkt stand seit Wochen offen und wartete auf eine
Vorbedingung, die zweimal ohne ihn erledigt wurde.**

**Geschlossen.**

### C-193 — offen, aus einem anderen Grund als gedacht

`[cmd]` **Die Suche entfernt harte Nuss-Ausschluesse weiterhin** —
A-47 bestaetigt.

`[cmd]` **Aber MealCam ist rein statisch und hat keinen Leseweg.**

`[read]` **Ich hatte gefragt, ob MealCam denselben Weg nimmt.**
`[read]` **Sie nimmt gar keinen** — **weder dieselbe Filterung noch
eine Zutatenwarnung.**

`[read]` **Der Punkt ist damit kein Vergleichsbefund mehr, sondern
eine Anforderung an einen Leseweg, der noch nicht existiert**
(G-276: Attrappe an richtiger Stelle mit Vermerk).

**Abgenommen.**

## Auftrag (2026-09-07)

**Mitbeauftragt mit G-357.** Der Auftragstext
und der Bericht stehen dort.

## Abnahme

**2026-09-07, mit G-357 abgenommen: die Mutation steht.

`[cmd]` **`nutrition.meal_plan_set_next_plan`** — **setzt
`next_plan_id`.**

`[read]` **Der Folgeplan-Picker bleibt ein UI-Auftrag.**

`[cmd]` **Und die Flussfrage aus E-53/E-54 bleibt offen:** **ob eine
Planfolge neben einer Jahres-Phasenplanung stehen darf.**
