---
nr: C-540
typ: feature
modul: nutrition
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-539
entscheidung: C-539
agent: codex
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: 56d2c4ed
beruehrt:
  tabellen: [nutrition.animal_species, nutrition.food_animal_species]
zahlen:
  gemessen: 2026-09-24
  arten: 21
  katalogbereich: 1449
  sicher_zugeordnet: 1160
  offen_gemeldet: 289
---

# C-540 - die Tierarten kurieren

## Toms Entscheidung

Tom, 2026-09-08:

> C-539 kurieren, und mealcam kann trotzdem noch fragen bei
> unstimmigkeiten

`[read]` **Zwei Sachen: der Katalog bekommt die Art, UND die
Rueckfrage bleibt.**

## Was C-539 gemessen hat

    20 Testgerichte   17 richtig
                       2 falsche Tierart auf Rang 1
                       1 ganz andere Speise

    Haehnchenbrust / gegrillte Huehnerbrust   0,4242
    Haehnchenbrust / Putenbrust gegrillt      0,5172

`[cmd]` **Eine hoehere Schwelle behebt nichts: bei 0,5 fallen
6 von 20 Eingaben ganz heraus.**

`[cmd]` **Und die Kategorie *,,Haehnchenbrust & Filet"*
enthaelt Huhn, Pute UND Ente.**

## Der Umfang

`[cmd]` **Selbst gemessen:**

    7.140 Foods gesamt
    1.449 tragen einen Tiernamen
      212 davon Gefluegel
       53 tragen ZWEI Tierarten, eines drei

`[read]` **Nicht 7.140, sondern 1.449** ? **und die Arten
selbst sind eine kurze Liste.**

## Codex eigene Empfehlung (C-539)

> *,,Kuratierte MEHRWERTIGE Food-Arten-Relation mit kanonischen
Codes und Synonymen; Art VOR dem Trigramm-Ranking einschraenken,
bei unsicherer Art KEINE automatische Auswahl."*

`[read]` **Mehrwertig, weil die 53 zwei Arten tragen.**

## Zu bauen

    1  eine Artenrelation: kanonischer Code, Name,
       Synonyme
    2  eine mehrwertige Zuordnung Food -> Art
    3  die Zuordnung, wo sie aus dem Namen sicher ist
    4  wo unsicher: KEINE Zuordnung, gemeldet

`[cmd]` **Der Name traegt sie meist: *Haehnchen*, *Pute*,
*Rind*** ? **MISS, wie weit das reicht, und melde die Reste.**

`[read]` **Die Synonyme sind der Kern: *Huhn*, *Haehnchen*,
*Poulet*, *chicken* meinen dasselbe Tier.**

## Was NICHT Teil ist

`[read]` **Die Zuordnung im Suchweg** ? **erst der Katalog,
dann das Ranking.**

Tom: *,,mealcam kann trotzdem noch fragen bei
unstimmigkeiten"* ? **die Rueckfrage bleibt, auch wenn die Art
sicher ist.**

`[read]` **Und C-538 speichert weiter Bild, Ergebnis und
Deklaration** ? **unveraendert.**

## Abnahmebedingungen

    A1  eine Artenrelation mit Synonymen. Zahl.
    A2  die mehrwertige Zuordnung -- die 53 mit zwei
        Arten tragen beide. Belegt.
    A3  wie viele der 1.449 sind sicher zugeordnet?
        Zahl.
    A4  die Reste GEMELDET, nicht geraten.
    A5  Gegenprobe: Pute und Huhn sind zwei Arten,
        Poulet und Huhn eine.
    A6  KEINE Aenderung am Suchweg.
    A7  Sicherung, Vollkette, ALLE Waechter.

## Bericht, 2026-09-24

### A1 - kanonischer, lesbarer Katalog

`20260924110000_c540_animal_species.sql` legt
`nutrition.animal_species` und die mehrwertige
`nutrition.food_animal_species` an. Der Katalog hat **21** kanonische
Codes mit deutschem, englischem und thailaendischem Namen sowie
gefalteten deutschen Synonymen. Beide Tabellen haben RLS; nur
`authenticated` darf lesen, nur `service_role` schreiben.

`chicken` enthaelt unter anderem `huhn`, `huehn`, `haehnchen`,
`poulet`, `chicken`, `suppenhuhn` und `poularde`. `turkey` enthaelt
getrennt `pute`, `truthahn` und `turkey`.

### A2 bis A5 - mehrwertig, konservativ und belegt

`025a_tierarten_kuration.sql` erzeugt die Zuordnung nur aus
ausdruecklichen Namen im deutschen Food-Namen. Das Ergebnis im
Katalogbereich `fleisch-gefluegel`:

| Messung | Ergebnis |
|---|---:|
| Foods im Bereich | 1.449 |
| sicher zugeordnet | 1.160 |
| bewusst ohne Zuordnung gemeldet | 289 |
| Foods mit genau zwei Arten, katalogweit | 57 |
| Foods mit genau drei Arten, katalogweit | 1 |

Damit tragen mindestens die zuvor gemessenen 53 Zweifach-Foods beide
Arten. Die zwei zusaetzlichen Treffer liegen ebenfalls in expliziten
Namen. Der Dreifach-Fall ist `Gansgalantine mit Kalb- und
Schweinefleisch`.

Die **289 Reste sind gemeldet, nicht geraten**: 288 liegen in
`wurstwaren-aufschnitt`, eines in `gefluegel-haehnchen`; in beiden
Faellen nennt der Name keine belastbare Art. Sie erhalten keine Zeile
in `food_animal_species`. Eine Gegenprobe belegt: Huhn und Poulet
haben denselben Code, Huhn und Pute zwei verschiedene.

Ein Testfall sichert die konservative Regel besonders ab: `Haselnuss`
wird nie als `Hase` zugeordnet. Die Hasen-Regel akzeptiert nur die
expliziten BLS-Formen wie `Hase Fleisch`, `Hasenbraten`,
`Hasenragout` und `Hasenpfeffer`.

### A6 - Suchweg unveraendert

Es gibt keine Aenderung an `food_search` oder dem App-Suchweg. Der
C-540-Integrationstest prueft explizit, dass die Definition von
`nutrition.food_search` keinen Verweis auf `animal_species` enthaelt.
MealCam-Deklaration und Rueckfrage bleiben unveraendert.

### A7 - Sicherung und Pruefung

- Frische Schema-Sicherung vor dem Vollkettenlauf:
  `backup/schema/20260924055419_c43_vor_kettenlauf.sql`.
- Vollkette: `supabase/_pipeline/kette.json`, 268 Schritte, Exit-Code
  0, gegen die aufbewahrte Wegwerf-Datenbank `lumeos_c540_chain`.
- C-540-Integrationstest gegen diese Vollkette: gruen.
- `pnpm gate`: gruen, inklusive Waechter, Lint, Typpruefung, Tests und
  Builds.

Die Daten wurden danach auch in die lokale Live-Datenbank eingespielt;
die dortigen Messwerte sind identisch. Keine Datei unter `apps/` und
kein Dev-Server wurden fuer C-540 veraendert.

## Abnahme

**2026-09-08, Orchestrator. LIVE, nachgemessen.**

    nutrition.animal_species        21 Arten
    nutrition.food_animal_species   57 Zweifach, 1 Dreifach

`[cmd]` **Die 21:** beef, chicken, duck, goat, goose,
guinea_fowl, hare, horse, ostrich, pheasant, pigeon, pork,
quail, rabbit, red_deer, reindeer, roe_deer, sheep, turkey,
veal, wild_boar.

### Die Synonyme tragen

`[cmd]` **`chicken`:** huhn, huehn, haehnchen, poulet, chicken,
suppenhuhn, poularde.

`[read]` **Genau A5: Poulet und Huhn sind EINE Art, Pute eine
andere.**

### Und die Gegenprobe, die er selbst erfunden hat

> *,,Haselnuss wird ausdruecklich nie als Hase klassifiziert."*

`[cmd]` **Selbst geprueft: Haselnuss traegt KEINE Art, `Hase`
traegt `hare`.**

`[read]` **Ein Wortstamm, der in einem Nicht-Tier steckt** ?
**die Falle, die eine reine Textsuche stellt, und er hat sie
vor mir gesehen.**

### Das Dreifach-Food belegt A2

`[cmd]` **Gansgalantine mit Kalb- und Schweinefleisch,
gebacken: `goose + pork + veal`.**

`[read]` **Drei Tiere in einem Gericht, alle drei drin** ?
**das ist der Grund, warum die Relation mehrwertig sein
musste.**

### Und 289 bewusst offen

`[cmd]` **1.160 von 1.449 sicher zugeordnet, 289 offen.**

`[read]` **A4 war: die Reste GEMELDET, nicht geraten** ?
**eingehalten.**

`[cmd]` **Suchweg und C-538 unveraendert** ? **A6.**

**Abgenommen.**

