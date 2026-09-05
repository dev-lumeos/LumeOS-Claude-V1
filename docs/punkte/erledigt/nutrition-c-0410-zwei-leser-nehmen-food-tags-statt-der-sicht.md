---
nr: C-410
typ: befund
modul: nutrition
schwere: hoch
angelegt: 2026-09-07
braucht: []
kind_von: C-366
entscheidung: E-55
agent: codex
beauftragt: 2026-09-07
erledigt: 2026-09-07
commit: 9940d6b3
beruehrt:
  tabellen: [nutrition.food_tags]
zahlen:
  gemessen: 2026-09-07
  leser_richtig: 1
  leser_falsch: 2
---

# C-410 — zwei Leser nehmen `food_tags` statt der Sicht

## Befund

Aus C-409, Codex, 2026-09-07, selbst gemeldet.

`[cmd]` **Der bestehende C-366-Test ist fachlich rot:**

    preference_search_preview              liest food_tags_effective
    food_search                            liest food_tags
    refresh_food_preference_search_targets liest food_tags

`[read]` **C-366 hatte alle drei umgestellt** — **zwei sind
zurueckgefallen.**

`[read]` **Er hat es gemeldet, statt es stillschweigend ausserhalb
des Auftrags zu aendern** — **richtig.**

## Warum es zaehlt

`[cmd]` **E-55: die Kuration liegt in `food_tags_kuriert`, die Sicht
`food_tags_effective` vereint sie mit dem Import.**

`[read]` **Wer `food_tags` direkt liest, sieht die Kuration nicht.**

`[cmd]` **Und `curate_food_tag` schreibt seit C-31 in die
Overlay-Tabelle** — **die Kuration entsteht also, und zwei von drei
Lesern ignorieren sie.**

`[read]` **Das ist schlimmer als vor C-366:** **damals las niemand
die Sicht, jetzt liest einer sie und zwei nicht** — **dieselbe Suche
liefert je nach Weg andere Tags.**

## Zu messen

`[read]` **Wann sind die zwei zurueckgefallen?** `[cmd]` **Ein
Kettenlauf koennte eine aeltere Fassung ueberschrieben haben.**

`[read]` **Und ob der Test es haette melden muessen** — `[cmd]` **er
ist rot, aber niemand hat ihn gelesen.**

## Auftrag — die zwei Leser und die Laufzeit

**Mitbeauftragt: C-404.** Bericht in diese Datei.

**Beauftragt am 2026-09-07.**

### 1 · C-410 — die zwei Leser zurueckholen

`[cmd]` **`food_search` und `refresh_food_preference_search_targets`
lesen `food_tags` statt `food_tags_effective`.**

`[read]` **Miss zuerst, wann sie zurueckgefallen sind** — **ein
Kettenlauf koennte eine aeltere Fassung ueberschrieben haben.**

`[read]` **Und ob der Test es haette melden muessen.** `[cmd]` **Er
ist rot, aber niemand hat ihn gelesen** — **dieselbe Klasse wie ein
Waechter, der still gruen wird.**

`[read]` **Dann umstellen** — **mit einer Gegenprobe: eine kuratierte
Zeile muss in beiden Wegen wirken.**

### 2 · C-404 — `Aufbau-Wochenplan`

`[cmd]` **4 Wochen, 28 Tage, 84 Eintraege bei `days_count 21`.**

`[cmd]` **Der umgekehrte Fall zu Cut und Lean** — **zu viele Tage,
nicht zu wenige.**

`[read]` **E-62: `days_count` ist die Laufzeit.** `[read]` **Wenn der
Plan vier Wochen beschreibt, laeuft er vier Wochen** — **dann ist die
Zahl falsch.**

`[read]` **Oder die vierte Woche gehoert nicht dazu** — **dann sind
84 Eintraege zu viel.**

`[cmd]` **Und `test` traegt 4 Wochen, 28 Tage, 0 Eintraege** — **die
Werkbank, richtig leer.**

### Was nicht zu tun ist

**Keine Datenlogik in `migrations/`.**
`apps/` nicht anfassen — **die 17 seriellen Abfragen sind ein
UI-Auftrag.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `neustart`, kein `start`, kein `aufraeumen`.**

### Nachweis

    beide Leser    nehmen die Sicht, mit Gegenprobe
    Rueckfall      wann und wodurch, mit Fundstelle
    Test           war rot, jetzt gruen
    Aufbau-Plan    Laufzeit oder Woche, begruendet

## Bericht

**Stand 2026-09-05 — gebaut und lokal eingespielt.** `apps/`,
Migrationen, Dev-Server, Stage, Commit und Push blieben unberuehrt.

### C-410 — kein einzelner Rueckfall, sondern eine nicht dauerhafte Reparatur

`[cmd]` **C-366 wurde am 2026-09-02 um 15:19 als Migration
committet.** Sie ersetzte die drei Funktionsdefinitionen im laufenden
Bestand, aenderte aber nicht die dauerhafte Quelle
`075_preference_search_application.sql`: ihre 21 direkten
`nutrition.food_tags`-Lesestellen stammen unveraendert aus dem
2026-08-22-Commit.

`[cmd]` **Der Rueckfall wurde mit C-405 am 2026-09-05 ausgeloest.**
Der Commit aenderte in Schritt 075 `strong_avoid`; dessen erneute
Ausfuehrung erzeugte `food_search` und
`refresh_food_preference_search_targets` aus der weiterhin alten
Quelle neu. Vor diesem Fix mass der C-366-Test deshalb genau einen
effektiven Leser (`preference_search_preview`) statt drei. Die
Ausfuehrungszeit selbst wird nicht protokolliert; Ursache und
Reproduktionsweg sind aber durch Commit, unveraenderte Quellzeilen und
die vorherigen Live-Definitionen belegt.

`[cmd]` **Der dauerhafte Fix steht jetzt in 075:** alle 21 Lesestellen
der beiden Funktionen verwenden `nutrition.food_tags_effective`.
Nach dem lokalen Lauf lesen wieder alle drei Funktionen die Sicht;
keine direkte `nutrition.food_tags`-Lesestelle bleibt in Schritt 075.

`[cmd]` **Die Gegenprobe wirkt in beiden Wegen:** Eine vorher nicht
als `contains_nuts` importierte Food-Zeile wurde in einer
zurueckgerollten Probe kuratiert auf `set`. `food_search` findet sie
daraufhin im Tagfilter, und
`refresh_food_preference_search_targets` erzeugt fuer das
Nussallergieprofil das zugehoerige harte Ziel. Vor dem Fix waren beide
Werte `false`, danach beide `true`.

`[cmd]` **Der vorhandene Test haette den Rueckfall gemeldet:** Seine
Strukturpruefung erwartete drei Leser und war rot bei eins. Er wird
nicht vom allgemeinen Gate ausgefuehrt; deshalb blieb der rote
Nachweis ungelesen. Der Test enthaelt nun auch die direkte
Wirkungsprobe fuer Suche und Refresh.

### C-404 — die 28 Tage gehoeren zum Aufbau-Plan

`[cmd]` **`dev@lumeos.app` beschreibt vom 2026-09-01 bis 2026-09-28
28 Kalendertage:** vier Wochen, 28 Tageszeilen und 84 Eintraege bei
`lifecycle_type = once`; `days_count` steht noch auf 21.

`[cmd]` **Die Woche ab 22.09. ist nicht ueberzaehlig.** Der
dauerhafte C-150-Seed bezeichnet den Plan als eine gefuellte, eine
leere und eine *kopierte* Woche und ruft `copy_meal_plan_week` fuer
den 22.09. auf. Zusaetzlich entstand am 01.09. eine dokumentierte
Kopie fuer den 08.09. Beide Kopien tragen `copied_from_week_id`; keine
ist ein verwaister Eintrag.

**Ergebnis:** Nach E-62 ist `days_count = 21` falsch; die Laufzeit des
aktiven Plans muss **28** sein. Die vierte Woche und ihre 84
Eintraege bleiben. Der Testdatenseed traegt diese Laufzeitmetadaten
heute nicht mit, daher waere eine blosse Live-Korrektur beim naechsten
Neuaufbau nicht dauerhaft. Diesen separaten Seed-/Aktivierungs-Schreibweg
habe ich nicht ohne ausdruecklichen Auftrag erweitert.

### Nachweise

    pnpm exec tsx --test supabase/_pipeline/_validierung/
      nutrition-c366-curated-food-tags.test.ts                 2 gruen

Der Lauf war vor der Quellaenderung rot (1 statt 3 Leser; beide neue
Wirkungswerte false) und danach gruen. Die allgemeinen App-Tests
blieben ausserhalb dieses Auftrags.

## Abnahme

**2026-09-07, Orchestrator. Nachgemessen.**

`[cmd]` **Selbst gemessen: alle drei lesen `food_tags_effective`.**

    food_search                             food_tags_effective
    refresh_food_preference_search_targets  food_tags_effective
    preference_search_preview               food_tags_effective

`[cmd]` **Und die Kuration wirkt nach Gegenprobe in beiden Wegen.**

### Die Ursache ist die wichtigste Zeile

`[cmd]` **Der Rueckfall kam mit C-405 am 05.09.:** **die erneute
Ausfuehrung von `075_preference_search_application.sql` erzeugte die
zwei Funktionen aus dem alten Quelltext neu.**

`[read]` **Kein Mensch hat etwas zurueckgenommen** — **ein
Kettenschritt hat eine spaetere Aenderung ueberschrieben.**

`[read]` **Das ist eine Eigenschaft der Kette, nicht ein
Versehen:** `[cmd]` **der Zustand entsteht aus
`supabase/_pipeline/`, und wer eine Funktion dort aendert, muss sie
an der Quelle aendern** — **nicht nur live.**

`[read]` **C-366 hat live umgestellt.** `[read]` **C-405 hat die
Kette neu laufen lassen.** **Die Kette gewann.**

### Und der Test war rot, aber nicht im Gate

`[cmd]` **Er meldete 1 statt 3 Leser** — **und war nicht in den
allgemeinen Gate-Lauf eingebunden.**

`[read]` **Ein Test, der rot ist und niemanden erreicht, ist kein
Test** — **er ist eine Notiz.**

`[cmd]` **Er enthaelt jetzt zusaetzlich die Wirkungsprobe** —
**nicht nur *wer liest was*, sondern *wirkt die Kuration*.**

### C-404 — beabsichtigt, und deshalb `days_count 28`

`[cmd]` **Die vierte Aufbau-Woche ist eine kopierte Woche und darf
nicht geloescht werden.**

`[read]` **Damit ist E-62 eindeutig:** **vier Wochen heissen 28
Tage.**

`[cmd]` **Er hat ohne Auftrag keine nicht-persistente
Einzelkorrektur vorgenommen** — **richtig.** `[read]` **Eine
Aenderung, die der naechste Kettenlauf wegwischt, waere genau der
Fehler, den er gerade aufgeklaert hat.**

**Jetzt beauftragt.**

**Abgenommen.**

