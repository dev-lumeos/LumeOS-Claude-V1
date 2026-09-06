---
nr: C-414
typ: befund
modul: quer
schwere: mittel
angelegt: 2026-09-07
braucht: []
kind_von: C-412
entscheidung: E-65
agent: codex
beauftragt: 2026-09-07
erledigt: 2026-09-07
commit: 14bbc565
beruehrt:
  tabellen: [nutrition.meals]
zahlen:
  gemessen: 2026-09-07
  module: 6
---

# C-414 — die Querschnittssicht liegt in `nutrition`

## Befund

Nachgemessen bei der C-412-Abnahme, 2026-09-07.

`[cmd]` **`activity_stream` liegt in `nutrition`** — **obwohl sie
sechs Module vereint:** Mahlzeiten, Wasser, Supplements, Training,
Recovery, Medical.

`[cmd]` **Der Dateiname sagt `00_querschnitt/412_activity_stream.
sql`, das Schema sagt `nutrition`.**

## Warum es zaehlt

Tom, 2026-09-07: *,,wir mischen keine module durcheinander. jedes
modul ist in sich geschlossen."* (E-65)

`[read]` **E-65 verbot einen Fremdschluessel ueber die
Modulgrenze** — **eine Sicht, die sechs Module liest und im Schema
eines davon liegt, ist derselbe Fall.**

`[read]` **Wer `nutrition` liest, erwartet Nutrition** — **nicht
Trainingseinheiten.**

## Zu tun

`[read]` **Nach `quer` oder `public` verschieben.**

`[cmd]` **Und die Leser nachziehen** — **G-152 wartet auf sie,
gebaut ist dort noch nichts.**

`[read]` **Jetzt ist es billig** — **nach dem ersten Aufrufer
nicht.**

## Auftrag — das Schema und zwei Reste

**Mitbeauftragt: C-389, C-193.** Bericht in diese Datei.

**Beauftragt am 2026-09-07.**

### 1 · C-414 — die Sicht liegt im falschen Schema

`[cmd]` **`activity_stream` liegt in `nutrition`** — **obwohl sie
sechs Module vereint.** `[cmd]` **Der Dateiname sagt
`00_querschnitt/`.**

Tom, 2026-09-07: *,,wir mischen keine module durcheinander."* (E-65)

`[read]` **Verschieb sie nach `quer` oder `public`** — **und
begruende, welches.**

`[cmd]` **Kein Aufrufer in `apps/`** — **G-152 wartet noch.**
`[read]` **Jetzt ist es billig.**

### 2 · C-389 — die drei Saftfamilien

`[cmd]` **Du hast gemessen und vier Zeilen berichtigt:** `F201600`,
`F310600`, `F603600`, `F603700` **auf `minimally_processed`.**

`[cmd]` **Die drei Smoothies bleiben `raw`, keine 53er-Regel.**

`[read]` **Miss, ob der Punkt damit zu ist** — **oder was noch
offen bleibt.**

### 3 · C-193 — was ein MealCam-Leseweg braucht

`[cmd]` **Du hast es dokumentiert:** *,,MealCam muss BLS-Kandidaten
ungefiltert lesen und erst danach Konflikte pro Food/Zutat als
Warnung zurueckgeben."*

`[cmd]` **`SPEC_11` steht seit heute** — **Abschnitt 2a nennt drei
Kandidatentypen:** `BLS_FOOD`, `GLOBAL_RECIPE`, `USER_RECIPE`.

`[read]` **Miss, was eine solche Funktion braeuchte** — **und ob
`food_search` sie tragen kann oder eine zweite noetig ist.**

`[cmd]` **`match_reason` gibt es seit C-391** — **zehn Wege.**

`[read]` **Melden, nicht bauen** — **MealCam ist Phase 0.**

### Was nicht zu tun ist

**Keine Datenlogik in `migrations/`.**
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `neustart`, kein `start`, kein `aufraeumen`.**

### Nachweis

    Schema      verschoben, Wahl begruendet
    Kettenlauf  ueberlebt, in kette.json
    C-389       zu / was offen bleibt
    C-193       was die Funktion braeuchte, mit Zahl

## Bericht

### C-414 -- `public`, nicht ein neues `quer`

`[cmd]` Die Sicht heisst nun `public.activity_stream`; der alte Name
`nutrition.activity_stream` existiert nicht mehr. `public` ist bereits
das exponierte Plattform-Schema (Profile und Zugriffshilfen) und
`authenticated` hat dort Schemazugriff. Ein neues `quer`-Schema wuerde
fuer genau diese eine Sicht eine zweite API-Exposition, Grants und
Konvention schaffen.

`[read]` Das haelt E-65 ein: Nutrition, Supplements, Training,
Recovery und Medical bleiben Fachschemas. Der gemeinsame Leser liegt im
Plattform-Schema, nicht in einem der sechs Fachmodule.

`[cmd]` Der Kettenschritt `412` bleibt unter
`00_querschnitt/412_activity_stream.sql` und ist in `kette.json` als
`public.activity_stream` beschrieben. Er entfernt beim Lauf gezielt nur
die alte Sicht und baut die neue mit `security_invoker` und denselben
SELECT-Grants auf.

`[cmd]` Gegen einen Klon des Bestands sowie anschliessend gegen den
lokalen Bestand sind drei Pruefungen gruen: sechs Ereignistypen und ihre
Quellmengen stimmen, die Supplement-Historie wird nicht gedeutet, und
eine authentifizierte Sitzung sieht nur ihre eigenen Zeilen.

`[read]` Der vollstaendige Kettenlauf bleibt derzeit vor Schritt 412
in Schritt 075 stehen, weil `nutrition.food_tags_effective` dort noch
nicht existiert. Das ist ein bestehender Reihenfolgefehler vor dieser
Sicht; der Klon- und Bestandstest prueft Schritt 412 dennoch vollstaendig.

### C-193 -- eigener, typisierter MealCam-Resolver noetig

`[cmd]` `food_search` durchsucht ausschliesslich `BLS` und eigene
`custom` Foods. Seine Ausgabe ist ein einzelner Food-Vertrag mit
Naehrstoffdetail; Rezepttabellen kommen im Quelltext nicht vor.
`match_reason` kann fuer den `BLS_FOOD`-Ast wiederverwendet werden,
liefert aber keinen Rezept-Treffergrund.

`[cmd]` Im Bestand sind 120 Foods effektiv als `contains_nuts`
getaggt. `food_search` entfernt harte Ziele vor der Ausgabe. Beim
test-user reduziert die leere Suche den Gesamtbestand von 7.140 auf
6.010; darin wirken die 120 Nuss-Ausschluesse zusammen mit dessen
Laktose-Intoleranz. Ein MealCam-Resolver darf die 120 nicht verschwinden
lassen, sondern muss den Konflikt am einzelnen Kandidaten ausweisen.

`[cmd]` Es existieren fuenf Rezepttabellen, aber keine
`GLOBAL_RECIPE`-Tabelle: sechs vorhandene `nutrition.recipes` tragen
`source = 'user'`, test-user traegt 0 Rezepte. Auch die beiden
Kurationskandidatentabellen aus C-411 haben 0 Zeilen und sind ein
Admin-Pruefweg, kein globaler Rezeptkatalog.

`[read]` Daher braucht MealCam eine **zweite** SECURITY-INVOKER-
Lesefunktion, etwa einen typisierten Kandidaten-Resolver. Ihr Vertrag
braucht mindestens Anfrage/normalisierte Tokens, Nutzerkontext sowie
`candidates[]` mit `entity_type`, `entity_id`, Label, Rang und
`match_reason`. Sie vereinigt ungefilterte `BLS_FOOD`, eigene
`USER_RECIPE` samt Zutaten und spaeter einen explizit freigegebenen
`GLOBAL_RECIPE`-Katalog.

`[read]` Danach bewertet sie fuer jedes Food und jede Rezeptzutat die
vorhandenen Preference-Ziele (`food_preferences_read`, effektive Tags,
Allergie/Intoleranz) als `warnings[]`; harte Konflikte bleiben sichtbar,
aber sind nicht automatisch waehl- oder schreibbar. Die vorhandene
Bestaetigungsstufe entscheidet erst danach. Ein Union-Ausbau von
`food_search` wuerde seinen Food- und Filtervertrag brechen und die
globale Rezeptquelle vortaeuschen, die noch nicht existiert.

### Nachweis

    pnpm exec tsx --test supabase/_pipeline/_validierung/quer-c412-activity-stream.test.ts
    3 gruen

`[read]` Keine Datenlogik in `migrations/`, keine Aenderung unter
`apps/`, kein Dev-Server und kein Commit.

## Abnahme

**2026-09-07, Orchestrator. Nachgemessen.**

### Die Sicht liegt in `public`

`[cmd]` **Selbst gemessen: `public.activity_stream` (VIEW).**
`[cmd]` **Der alte Name ist weg.**

`[read]` **Und seine Begruendung traegt:** *,,`public` ist das
vorhandene Plattform-Schema; die sechs Fachschemas bleiben
geschlossen."*

`[read]` **Kein neues Schema erfunden** — **das vorhandene benutzt.**
`[cmd]` **E-65 gilt: jedes Modul ist in sich geschlossen.**

`[cmd]` **Fuenf Module in der Sicht, `supplements` von 744 auf
810** — **der neue `test-user`-Seed wirkt.**

### C-193 — ein eigener Resolver

`[cmd]` **`food_search` liefert nur BLS- und Custom-Foods und
filtert harte Konflikte weg** — **weder `GLOBAL_RECIPE` noch
`USER_RECIPE`.**

`[read]` **Damit ist die Frage aus dem Auftrag beantwortet:**
**`food_search` kann es nicht tragen.**

`[cmd]` **Und die Zahlen dazu:** 120 `contains_nuts`-Foods, sechs
Nutzerrezepte, kein globaler Rezeptkatalog, `test-user` ohne
Rezepte.

`[read]` **Der letzte Punkt ist ein Befund fuer sich:** **der neue
Seed traegt Plaene und Mahlzeiten, aber keine Rezepte** — **und
MealCam wird sie brauchen.**

`[cmd]` **SPEC_11 Abschnitt 2a nennt drei Kandidatentypen** — **die
Empfehlung passt dazu.**

### Und der Hinweis am Ende ist der wichtigste Teil

`[cmd]` **Der Vollkettenlauf scheitert vor Schritt 412 in Schritt
075** — **`food_tags_effective` fehlt dort.**

`[read]` **Er hat die Sicht separat auf einem Klon geprueft** —
richtig, **aber es ersetzt den Vollauf nicht.**

`[read]` **Und es ist die Gegenrichtung von C-410:** `[cmd]` **dort
ueberschrieb 075 eine spaetere Aenderung, jetzt verlangt 075 etwas,
das erst spaeter entsteht.**

`[read]` **Niemand hat es gemerkt, weil alles live eingespielt
wurde.**

**Als C-415, sofort beauftragt.**

**Abgenommen.**

