---
nr: G-258
typ: feature
modul: nutrition
schwere: mittel
angelegt: 2026-08-29
braucht: []
kind_von: G-254
entscheidung: E-29
agent: claudecode
beauftragt: 2026-08-30
erledigt: 2026-08-30
commit: OFFEN
beruehrt:
  tabellen: [coach.pending_actions]
zahlen: null
---

# G-258 — Pending actions im Tagebuch

## Befund

`[cmd]` **`coach.pending_actions` traegt Zeilen und eine Spalte
`module`** — die Tabelle ist modulueebergreifend gedacht.

`[read]` **Eine der sechs Kacheln aus G-254**, herausgeloest, weil
Tom sie am 2026-08-29 entschieden hat. **Die anderen fuenf bleiben
dort offen.**

## Entschieden: E-29

**Ueber eine Funktion, nicht direkt.**

`[cmd]` **Das Coach-Schema fuehrt drei Aenderungsprotokolle**, und
`client_permissions` / `client_autonomy` sagen, was ein Coach darf.
`[read]` **Ein direkter Lesezugriff umgeht beides und muesste die
Rechtelogik nachbauen** — ab dem zweiten Modul doppelt.

## Offen

`[read]` **Die Gegenrichtung:** wenn ein Modul eine offene
Coach-Aktion zeigt, kann der Nutzer sie vermutlich bestaetigen.
**Ein Schreibweg zurueck ist eine eigene Entscheidung** — er beruehrt
`confirmed_by` und die Protokolle.

## Auftrag

**Mitbeauftragt mit G-276 am 2026-08-30.** Der Auftragstext
und der Bericht stehen dort.

## Blockiert, 2026-08-30

**Aus G-276 gemessen:** keine der 16 coach-Funktionen liest `pending_actions`; RLS liesse
direkt lesen, E-29 verbietet es.

`[read]` **Wartet auf C-354.**

## Auftrag — entblockt am 2026-08-30

`[cmd]` **`coach.offene_aktionen(p_modul text)` ist live** — als
`SECURITY DEFINER`, **ohne `client_id`-Parameter: ausschliesslich
`auth.uid()` bestimmt den Klienten.** `[cmd]` **Fuer `dev` liefert sie
2 Zeilen, fuer einen anderen Klienten 0.** `[cmd]` **`authenticated`
darf, `anon` nicht.**

`[read]` **Das ist die Naht aus E-29.** **Du hast am 30.08. gemeldet,
dass keine der 16 Funktionen `pending_actions` liest — jetzt tut es
eine.**

`[cmd]` **Ein Befund aus dem Bau:** die beiden `dev`-Zeilen tragen
einen vergangenen `expires_at` und trotzdem `status = 'pending'`.
**Die Funktion gibt beides unveraendert aus.** `[read]` **Ein
Verfall-Schreibweg wurde nicht gebaut** — **also muss die Anzeige
entscheiden, was sie mit abgelaufenen Aktionen tut.**

### Regeln

`[cmd]` **A-30, A-59, A-62.** **Nichts auf `dev@lumeos.app`
schreiben.** Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    echte Zeilen        am Schirm, mit Bildschirmfoto
    Leerzustand         wo er auftritt, benannt
    Attrappen           vorher / nachher
    Ladezeit            ms, kalt und warm

## Bericht

**Claude Code, 2026-08-30.** Mitbeauftragt: G-251. Nichts auf
`dev@lumeos.app` geschrieben, nichts committet, nichts gestaged.
`supabase/` nicht angefasst.

### Die Praemissen tragen — mit einer Praezisierung

`[cmd]` **Gemessen gegen die laufende Datenbank:**

    coach.offene_aktionen(p_modul text)   existiert
    prosecdef                             t (SECURITY DEFINER)
    Rechte                                authenticated, service_role,
                                          postgres — kein anon
    Rueckgabe                             TABLE(8 Spalten)

`[cmd]` **Eine Praezisierung zum Auftrag: die Funktion gibt 8 der 14
Tabellenspalten zurueck.** Zurueck bleiben `client_id`, `coach_id`,
`confirmed_at`, `confirmed_by`, `created_by`, `updated_at`.

`[read]` **Das ist die Naht, praeziser als „ohne `client_id`-
Parameter":** sie nimmt keine Kennung entgegen **und gibt auch keine
heraus.** Wer `confirmed_by` braucht, muss durch das Coach-Portal.

`[cmd]` **Die Zeilen:** `pending_actions` traegt **3 pending-Zeilen,
alle mit vergangener Frist** — davon **2 fuer `dev`**. Die dritte
gehoert einem anderen Klienten und kommt ueber die Funktion nicht an.

### Der Befund aus dem Bau: was die Anzeige entscheidet

`[cmd]` **Beide `dev`-Zeilen sind `status = 'pending'` mit
`expires_at` in der Vergangenheit** (2026-08-20 und 2026-08-23).
**Einen Verfall-Schreibweg gibt es nicht.**

**Entschieden: drei Zustaende, nicht zwei.**

    offen        pending, und die Frist laeuft noch
    abgelaufen   pending, aber die Frist ist vorbei
    erledigt     alles andere (confirmed, rejected, ...)

`[read]` **„Abgelaufen" ist NICHT „erledigt".** Niemand hat bestaetigt
oder abgelehnt; die Frist ist verstrichen. **Wer beides zusammenwirft,
behauptet eine Entscheidung, die nie gefallen ist.** Dieselbe
Dreiteilung wie C-48 und G-239.

`[read]` **Und der Untertitel zaehlt entsprechend:** er sagt
**„2 abgelaufen"**, nicht „2 open". `[cmd]` **Bei diesen Daten waere
„2 open" schlicht falsch** — offen ist keine.

`[read]` **Nichts wird stillschweigend aufgeraeumt.** Die Anzeige
entscheidet, was sie zeigt; **sie schreibt nicht.** Ein Verfall in der
Datenbank bleibt eine eigene Entscheidung (gehoert zu „Offen" oben,
zusammen mit dem Schreibweg zurueck).

### Der Leseweg — E-29 eingehalten

`apps/web/src/lib/coach/offene-aktionen.ts`, serverseitig, geladen in
`page.tsx` nur fuer `tab=diary`.

    client.schema('coach').rpc('offene_aktionen', { p_modul: 'nutrition' })

`[cmd]` **Kein `.from(` in der Datei** — durch einen Waechter
gesichert, nicht nur behauptet. **Keine Kennung im Aufruf:** der
Klient kommt aus `auth.uid()`.

`[read]` **A-30:** die Kachel `pending-echt.tsx` importiert nur Typen
und reine Funktionen (`lageVon`, `fristSatz`) — **kein
`createSessionClient`, kein Ladeaufruf.** Auch das ist bewacht.

`[read]` **Die Zeit kommt als Prop** (`gelesenUm`, ISO-Text, im
Leseweg gestempelt). `[cmd]` **Kein `new Date()` in der Kachel** —
sonst rechnet der Server eine andere Minute als der Browser und React
bricht die Hydration ab; **derselbe Fehler, den `tab-insights.tsx` mit
`Math.random()` hatte.**

### Nachweis

`[cmd]` **Am Schirm, `dev@lumeos.app`, 2026-08-30, frischer Server:**

    Pending actions · 2 abgelaufen
      Protein leicht anheben
      Frist abgelaufen — nicht bestätigt und nicht abgelehnt.
      vor 10 Tagen abgelaufen          [abgelaufen]
      Protein leicht anheben
      Frist abgelaufen — nicht bestätigt und nicht abgelehnt.
      vor 7 Tagen abgelaufen           [abgelaufen]

`backup/g258-nachher-karte.png`, `backup/g258-nachher.png`.

`[read]` **Die Titel kommen aus `preview`**, nicht aus einer erfundenen
Struktur — `titelVon` faellt auf `action_type` zurueck, wenn `preview`
nichts Brauchbares traegt (`jsonb` sichert nichts zu).

    Leerzustand   „Keine offenen Aktionen · Schlägt dein Coach etwas
                  vor, erscheint es hier." — tritt auf, sobald die
                  Funktion 0 Zeilen liefert (ein anderer Klient).
                  GETRENNT davon: „Nicht geladen" mit dem Fehlertext,
                  damit ein Fehler nicht wie Leere aussieht.

    Attrappen     Tagebuch: 4 vorher -> 3 nachher.
                  `[cmd]` Die Karte trug die Marke, jetzt nicht mehr.
                  Die uebrigen 3 sind Smart suggestions, Nutrition
                  score und Pre-workout — nicht dieser Auftrag.

    Ladezeit      kalt 4.417 ms · warm 3.135 ms
                  `[read]` Gemessen nach `server.py neustart`: der
                  laufende Server stand bei 1,5 GB und antwortete in
                  1,6 s auf /login — gegen den zu messen haette
                  Zahlen ergeben, die nichts bedeuten.

---

## G-251 — die Herkunfts-Filter

**Der Bericht steht hier, weil beide Auftraege zusammen liefen.** Die
Punktdatei `nutrition-g-0251-...` traegt denselben Text.

### Eine Praemisse ist gefallen: „genau 1 Treffer"

`[cmd]` **Gemessen fuer `dev@lumeos.app`, 2026-08-30:**

    ohne Filter               total 4.970
    {"favorites": true}       total 4.098
    {"sources": ["custom"]}   total 0

`[cmd]` **Der Favoritenfilter liefert 4.098, nicht 1.** Die Ursache
steht in der Funktion selbst (075, Zeile 945):

    is_favorite = bool_or(constraint_level = 'boost')

`[cmd]` **Und `boost` entsteht auch aus einem gemochten TAG:**

    food_preference_items      1x liked|food, 3x liked|tag
    search_targets             1 boost|food, 5.557 boost|tag

`[read]` **Die „1" des Auftrags ist die Zahl der `boost|food`-Zeilen**
— der ausdruecklich gemochten Lebensmittel. **Der Filter zeigt etwas
anderes: alles, was zu einem gemochten Merkmal passt.** Das ist die
Funktion wie gebaut, **kein Fehler** — aber es entscheidet die
Beschriftung.

**Deshalb heisst die Pille „Bevorzugt", nicht „Favoriten".** `[read]`
**Eine Beschriftung, die 1 verspricht und 4.098 zeigt, waere die
Falschaussage — nicht die Zahl.** Ein Waechter haelt den Namen fest.

`[cmd]` **Ein Messfehler auf meiner Seite, bevor die Zahl stand:**
`food_search` gibt **ein `json`** zurueck, keine Tabelle — `count(*)`
darauf ist immer 1. **Die erste Messung ergab dreimal „1" und sah nach
Bestaetigung des Auftrags aus.** Die Trefferzahl steht in `total` bzw.
`foods`; erst danach war die Praemisse pruefbar.

### Gebaut

    Reiter        eigene Pillenzeile „Meine": Bevorzugt · Eigene
                  `[read]` NICHT zwischen die Kategoriepillen — die
                  teilen nach dem, WAS ein Lebensmittel ist; diese
                  nach der Beziehung des Nutzers dazu.

    Weg           tab-foods -> `?herkunft=` -> Route -> p_filters
                  `[cmd]` An die SUCHFUNKTION, nicht an die geladene
                  Seite. Dieselbe Lehre wie G-133: clientseitig
                  blieben die Ausgeschlossenen auf Seite 2 stehen,
                  und `total` waere gelogen.

    prefs         `herkunft=bevorzugt` schaltet `prefs` implizit ein.
                  `[read]` Ohne `p_user_id` berechnet die Funktion
                  kein `is_favorite` — der Filter liefe stumm ins
                  Leere.

    einer zur Zeit  kein Set. „Bevorzugt" und „nur eigene" schliessen
                  einander sachlich aus (`foods_custom` traegt keine
                  Vorlieben); eine Kombination ergaebe immer 0 und
                  saehe kaputt aus statt leer.

### Der dritte Filter bleibt ungebaut, und das ist kein Rueckstand

`[read]` **„Wie gestern" braucht `food_search` nicht** — `meals` +
`meal_items` des Vortags sind **eine eigene Liste, keine Verfeinerung
der Katalogsuche.** Ihn als Suchfilter zu schicken ergaebe eine
Anfrage, die die Funktion ignoriert: **die Liste bliebe unveraendert
stehen, und ein Filter, der nichts tut, sieht aus wie ein defekter.**

`[cmd]` **Der Typ `SuchHerkunft` schliesst ihn deshalb aus** — der
Reiter kann ihn nicht versehentlich senden. Die drei Zustaende aus
G-276 (`posten` / `leer` / `kein_tag`) bleiben unveraendert stehen,
fuer den Auftrag, der die Liste baut.

### Nachweis

`[cmd]` **Am Schirm und ueber die Route, `dev@lumeos.app`,
2026-08-30:**

    ohne Filter   50 Zeilen · total 4.970
    Bevorzugt     50 Zeilen · total 4.098 · 1.503 ms
    Eigene         0 Zeilen · total     0 · 1.490 ms

`backup/g251-nachher-bevorzugt.png`, `backup/g251-nachher-eigene.png`.

    Leerzustand   „Es gibt noch keine eigenen Lebensmittel. Was hier
                  erscheint, legst du selbst an — der BLS-Katalog
                  bleibt davon unberührt."
                  `[cmd]` Tritt auf bei `Eigene`, weil `foods_custom`
                  0 Zeilen hat. `[read]` Ein allgemeines „passt
                  nichts" liesse den Nutzer die Suche aendern, was
                  nichts aendern wuerde — deshalb nennt der Satz den
                  Grund. Ein Waechter haelt beide Saetze
                  auseinander.

    Attrappen     Food-DB: 0 vorher, 0 nachher. Der Reiter trug
                  keine, und die Filter fuegen keine hinzu.

    Ladezeit      kalt 6.029 ms · warm 5.681 ms (ganzer Reiter)
                  Filterwechsel je rund 1.500 ms.

### A-62: drei Waechter waren gekippt

`[cmd]` **Die G-276-Waechter sicherten den blockierten Zustand** — und
einer haette genau diesen Auftrag verhindert:

    „kein Filter wurde gebaut"       verbot die Beschriftungen im
                                     Reiter. UMGEDREHT: er verlangt
                                     jetzt, dass die Herkunft an die
                                     Suchfunktion geht.
    „je Filter Quelle und Luecke"    verlangte ein Feld `fehlt`.
                                     BERICHTIGT: prueft die Quelle.
    FILTER_LAGE.favoriten            hiess nach dem gemessenen
                                     Verhalten falsch. UMBENANNT.

`[read]` **Genau die Klasse aus A-62** — vier Wochen richtig, falsch am
Tag der Lieferung. **Diesmal ist es beim Bauen aufgefallen, weil der
Typecheck sie gerissen hat**, nicht erst hinterher.

### Waechter und Sabotageprobe

**Neu:** `apps/web/src/lib/coach/__tests__/offene-aktionen.test.ts`
(8 Waechter). **Berichtigt:**
`apps/web/src/lib/nutrition/__tests__/herkunft-filter.test.ts`.

**Elf Sabotagen, jede einzeln, Rueckbau je byte-gleich (SHA-256) —
alle elf fallen:**

    G-258  abgelaufen wie erledigt behandeln
    G-258  die Frist ignorieren (alles offen)
    G-258  Abgelaufene als „open" zaehlen
    E-29   direkt in coach.pending_actions lesen
    A-30   den Leseweg in die Browserdatei ziehen
    G-258  die Zeit in der Kachel holen
    G-258  den Entwurf stehen lassen
    G-251  die Herkunft nicht mitschicken
    G-251  herkunft aus den Abhaengigkeiten nehmen
    G-251  die Pille wieder „Favoriten" nennen
    G-251  denselben Leerzustand fuer beide

`[cmd]` **Ein eigener Waechterfehler, von der Kette gefangen:** die
Leerzustands-Pruefung verlangte *„eigene Lebensmittel"* und fiel an
*„keine eigenen Lebensmittel"* — **auf eine Beugung geprueft statt auf
die Aussage.**

### Laeufe

    pnpm --filter @lumeos/web test    1042 pass, 0 fail (vorher 1031)
    turbo typecheck                    gruen
    pnpm gate                          11/11 Tasks gruen
    [abwesenheit]                      3 Marken, alle gelten noch
    [encoding]                         20.532 Dateien sauber

### Dateien

    apps/web/src/lib/coach/offene-aktionen.ts               neu
    apps/web/src/app/v2/nutrition/pending-echt.tsx          neu
    apps/web/src/lib/coach/__tests__/offene-aktionen.test.ts neu
    apps/web/src/lib/nutrition/herkunft-filter.ts     ueberarbeitet
    apps/web/src/lib/nutrition/__tests__/
      herkunft-filter.test.ts                    A-62 berichtigt
    apps/web/src/lib/nutrition/food-search.ts       zwei Filter
    apps/web/src/app/api/nutrition/foods/route.ts   ?herkunft=
    apps/web/src/app/v2/nutrition/tab-foods.tsx     Pillenzeile
    apps/web/src/app/v2/nutrition/ansicht.tsx       Kachel + Prop
    apps/web/src/app/v2/nutrition/page.tsx          Laden (diary)
    backup/g258-nachher*.png, backup/g251-nachher-*.png Nachweis

## Abnahme

**2026-08-30, Orchestrator.**

### Die Naht ist schaerfer beschrieben als in E-29

`[cmd]` **Die Funktion gibt 8 von 14 Spalten zurueck** — `client_id`,
`coach_id`, `confirmed_by` und drei weitere bleiben drin.

`[read]` Er: *,,das ist die Naht schaerfer als *kein
client_id-Parameter*: sie nimmt keine Identitaet und gibt keine
heraus."*

`[read]` **Das ist die bessere Formulierung von E-29** — nicht nur
*ueber eine Funktion*, sondern **eine Funktion, die keine fremde
Identitaet kennt und keine preisgibt.**

`[cmd]` **Alle 3 Zeilen in `pending_actions` sind abgelaufen**, 2 fuer
`dev`. **Die dritte gehoert einem anderen Klienten und kommt durch die
Funktion nie an.**

### Drei Zustaende, nicht zwei

`[cmd]` **offen / abgelaufen / erledigt.**

`[read]` ***Abgelaufen* ist nicht *erledigt*** — **niemand hat
bestaetigt oder abgelehnt, die Frist ist blos verstrichen.**
`[read]` **Wer beides zusammenwirft, behauptet eine Entscheidung, die
nie gefallen ist.**

`[cmd]` **Die Unterzeile liest *,,2 abgelaufen"*, nicht *,,2
offen"*** — **was bei dieser Datenlage falsch waere.**

`[read]` **Dieselbe Unterscheidung wie *es gibt kein Gestern* gegen
*gestern war nichts*.** **Zum zweiten Mal an einem Tag, an zwei
verschiedenen Stellen.**

`[cmd]` **Die Anzeige entscheidet, sie schreibt nicht** — der
Schreibweg bleibt C-358, **und ist dadurch kleiner geworden.**

### G-251 — meine Zahl war falsch, und der Grund ist lehrreich

`[cmd]` **Der Favoritenfilter liefert 4.098 von 4.970, nicht 1.**

`[cmd]` **`is_favorite = bool_or(constraint_level = 'boost')`, und ein
Boost kommt auch von einem gemochten Tag** — **5.557 Ziele gegen ein
Lebensmittel.**

`[read]` **Die *1* war die Zahl ausdruecklich gemochter Lebensmittel.
Der Filter zeigt alles, was ein gemochtes Merkmal traegt.**

`[read]` **Kein Fehler, aber es entscheidet die Beschriftung:**
`[cmd]` **die Pille heisst *,,Bevorzugt"*, nicht *,,Favoriten"*** —
**eine Beschriftung, die 1 verspricht und 4.098 zeigt, waere die
falsche Aussage, nicht die Zahl.**

### Und sein eigener Messfehler, gemeldet statt verschwiegen

`[cmd]` **`food_search` liefert ein JSON-Dokument, keine Tabelle** —
**`count(*)` ist immer 1.** `[read]` **Sein erster Lauf ergab dreimal
eine 1 und sah aus wie eine Bestaetigung des Auftrags.**

`[read]` **Genau der Fehler, den ich am 29.08. zweimal gemacht
habe** — bei G-116 und bei C-27. **Jetzt ist er benannt.**

### Was nicht gebaut wurde

`[cmd]` ***,,Wie gestern"* bleibt** — **`meals`/`meal_items` sind eine
eigene Liste, keine Verfeinerung der Katalogsuche.** `[read]` **Und
der Typ schliesst es aus, damit der Reiter keinen Filter senden kann,
den die Funktion ignorieren wuerde.**

`[cmd]` **Der Custom-Leerzustand nennt den Grund** statt *,,nichts
gefunden"* — **das wuerde jemanden dazu bringen, einen Suchbegriff zu
aendern, der nicht helfen kann.**

### A-62 hat wieder zugeschlagen

`[cmd]` **Drei G-276-Waechter sicherten den blockierten Zustand, und
einer — *,,kein Filter wurde gebaut"* — haette genau diesen Auftrag
blockiert.** `[read]` **Vom Typecheck waehrend des Baus gefangen, nicht
danach.**

`[cmd]` 11 Sabotagen, 1042 Tests, Gate 11/11. Attrappen im Tagebuch
4 auf 3.

**Abgenommen.**

