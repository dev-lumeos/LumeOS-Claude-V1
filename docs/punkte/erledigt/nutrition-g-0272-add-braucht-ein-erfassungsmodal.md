---
nr: G-272
typ: feature
modul: nutrition
schwere: hoch
angelegt: 2026-08-29
braucht: []
kind_von: G-265
entscheidung: null
agent: claudecode
beauftragt: 2026-08-29
erledigt: 2026-08-30
commit: bdecfcfa
beruehrt:
  tabellen: [nutrition.meals, nutrition.meal_items]
zahlen: null
---

# G-272 — `+ Add` braucht ein Erfassungsmodal

## Befund

Aus G-271, Claude Code, 2026-08-29.

`[cmd]` **`+ Add` fuehrt seit G-265 auf die Detailsuche mit gefuelltem
Feld** — drei Treffer, Lebensmittel ausgewaehlt, 101 Naehrstoffe.

`[read]` **Aber das ist nicht, was der Knopf verspricht.** `[read]`
*,,Add"* heisst hinzufuegen, nicht suchen.

`[cmd]` **Keins der vier vorhandenen Modale schreibt ein Lebensmittel
in `meals` / `meal_items`.**

## Was zu klaeren ist

`[read]` **Ein Erfassungsmodal braucht mehr als das Lebensmittel:**
Menge, Einheit, Mahlzeit, Tag. `[cmd]` **`PortionSelector` und
`FoodAmountInput` stehen in `SPEC_10`.**

`[read]` **Und der Schreibweg selbst ist zu messen** — ob er
existiert oder ob dies der erste ist.

## Bericht

**Claude Code, 2026-08-30.** Alle Zahlen mit Nutzer und Zeitraum.

### Die Kurzfassung

**Der Schreibweg existierte** — vollstaendig, seit C-51/G-56.
`[cmd]` **Sieben Funktionen in `diary-write.ts` und eine gepruefte
Route.** `[read]` **Die Warnung des Auftrags war berechtigt und hat
diesmal getroffen:** wie bei Supplements (G-148/G-138) musste nichts
gebaut werden, nur gerufen. **Gemessen, bevor eine Zeile entstand.**

**Das Modal steht und schreibt.** `[cmd]` **Auf
`test-user@lumeos.local` nachgewiesen: 1 Mahlzeit, 1 Position — und
gezaehlt zurueckgebaut.**

**G-273 geht nicht.** `[cmd]` **Die Funktion aus C-348 existiert in
der laufenden Datenbank NICHT** — sie steht in der Pipeline und ist
nie eingespielt worden. **Das ist genau der C-195-Fall aus
`CLAUDE.md`.**

### Die Nachweiszeilen

| Zeile | Ergebnis |
|---|---|
| Schreibweg ins Tagebuch | **existiert** — 7 Funktionen + Route, gemessen vor dem Bauen |
| Erfassungsmodal | **gebaut**, Schreibprobe mit Rueckbau belegt |
| zaehlende Funktion | **nicht anbindbar** — live nicht vorhanden, siehe Teil 2 |
| Ergebnisgleichheit | **nicht pruefbar**, solange die Funktion fehlt |
| Detailsuche hin und zurueck | **beide Richtungen belegt** |
| Attrappen | **foods 0, nutrients 0** — vorher wie nachher |
| Ladezeit | foods **6.615 / 4.483 ms**, nutrients **7.313 / 6.898 ms** |

### 1 · G-272 — der Schreibweg war da

`[cmd]` **Gemessen am 2026-08-30, als erstes und vor jeder
Aenderung:**

    lib/nutrition/diary-write.ts
      createMeal · addMealItem · updateMealItemAmount
      removeMealItem · listOwnMeals · listOwnMealItems
      listPortionsForFood
    app/api/nutrition/diary/route.ts
      GET  ?datum= · ?portionen_fuer=
      POST art:'mahlzeit' · art:'position'   (beide mit Zod-Pruefung)

`[read]` **Der Auftrag nannte G-138 als Mahnung — drei Tage an einem
vorhandenen Weg vorbeigesucht.** **Hier war die Lage dieselbe, und
die Suche kostete zwei Minuten statt drei Tage.**

**Gebaut wurde deshalb nur, was fehlte:** `erfassen-modal.tsx`, 300
Zeilen, **ohne eigene Suche, ohne eigene Portionslogik, ohne eigenen
Datenbankzugriff.**

`[cmd]` **Warum nicht das vorhandene `HinzufuegenModal`
(`mahlzeiten.tsx:468`) wiederverwendet:** es ist an die Mahlzeitkarte
gebunden — es bekommt `slot` und `sicherstellen()` von aussen und
**fragt weder nach Mahlzeit noch nach Tag.** `[cmd]` **Der
Food-DB-Reiter kannte beides nicht** (er bekam bis heute kein Datum).
**Das neue Modal ergaenzt genau diese zwei Felder und ruft denselben
Weg.**

`[read]` **Und das Lebensmittel steht schon fest**, wenn es aufgeht —
die Suche des anderen Modals waere hier ueberfluessig.

**Die Schreibprobe, `test-user@lumeos.local`, 2026-08-30:**

    vorher     meals 0   meal_items 0
    Klick auf +Add bei „Tofu"
    Modal:     Titel „Zu Breakfast hinzufuegen"
               7 Mahlzeiten waehlbar, Portion „1 Handvoll" (30 g)
               vorausgewaehlt, Felder [1, 30]
    Mahlzeit auf „Lunch" gewechselt, Hinzufuegen
    Meldung:   „Zu Lunch hinzugefuegt."
    nachher    meals 1   meal_items 1
    Rueckbau   DELETE 1 + DELETE 1  ->  meals 0, meal_items 0

`[cmd]` **`dev@lumeos.app` blieb unberuehrt** — die 4 Mahlzeiten am
2026-08-30 tragen alle `created_at = 2026-08-23`, sind also Seed.

`[read]` **Ohne Tag schreibt der Knopf nicht.** `datum` ist in
`AndererTab` optional typisiert; **einen Ersatzwert („heute") zu
setzen waere eine zweite Wahrheit neben dem Datumswaehler.**
Stattdessen bleibt das Modal zu — ein Test haelt es fest.

### 2 · G-273 — die Funktion ist gebaut, aber nicht eingespielt

`[cmd]` **Gemessen am 2026-08-30:**

    live vorhanden?   nutrition.reference_assessment_window_flags
                      -> NEIN
    in der Pipeline?  supabase/_pipeline/05_user_tabellen/
                      059d_reference_assessment_window_flags.sql
                      -> JA, 78 Zeilen

`[read]` **Damit ist G-273 nicht ausfuehrbar, und zwar aus dem
Grund, den `CLAUDE.md` unter C-195 festhaelt:** *,,Ein
Pipeline-Auftrag ist nicht fertig, wenn die Kette gruen laeuft —
sondern wenn die Aenderung dort ist, wo Tom sie sieht."*

`[cmd]` **Die Funktion selbst passt:** Signatur
`(p_user_id, p_end_date, p_days)`, Rueckgabe mit
`triggered_day_count`, `assessed_day_count`,
`incomplete_day_count` — **und dieselben Regeln wie meine
`flagVon`:** 80 Prozent, mindestens 4 bewertete Tage, Anteil 0,5.
**Die Anbindung waere ein Handgriff.**

`[read]` **Ich habe sie nicht angebunden**, weil ein Aufruf auf eine
nicht existierende Funktion die Seite bricht — und `supabase/`
anzufassen war ausgeschlossen. **Gemeldet statt passend gemacht.**

`[cmd]` **Der Reiter steht unveraendert bei 6.898 ms warm**
(fenster=90) gegen 6.393 ms in G-259 — dieselbe Groessenordnung, der
Unterschied ist Laufstreuung.

**Was fehlt, ist ein Schritt:** die Pipeline-Datei auf die laufende
Instanz spielen. **Dann ist G-273 ein kleiner Folgeauftrag.**

### 3 · G-266 / E-33 — Weg C, beide Richtungen

`[cmd]` **Gemessen am 2026-08-30, `dev@lumeos.app`:**

    HINWEG    Food DB, „reis" eingegeben        50 Zeilen
              Klick auf die Lupe
              -> /v2/nutrition/suche?food=…&q=Reis poliert, roh
              Feld auf der Detailseite:  „Reis poliert, roh"

    RUECKWEG  Verweis „Zurueck zur Food DB"     vorhanden
              href: /v2/nutrition?tab=foods&q=Reis poliert, roh
              Feld im Reiter:            „Reis poliert, roh"
              Zeilen:                    3

`[read]` **Der Hinweg stand seit G-265, der Rueckweg fehlte ganz** —
es gab nur den Zurueck-Knopf des Browsers, und der brachte die
Trefferliste nicht mit. **Genau das war Toms Einwand gegen die eigene
Seite.**

`[cmd]` **Zwei Stellen waren noetig, nicht eine:** der Reiter liest
`?q=` als Anfangswert, **und der erste Suchlauf darf nicht mehr
uebersprungen werden**, wenn ein Begriff mitkam — sonst stuende das
Wort im Feld und die Liste zeigte etwas anderes.

`[cmd]` **`+ Add` ist jetzt ein Knopf, die Lupe daneben der
Verweis** — *Add* fuegt hinzu, die Lupe zeigt Naehrwerte. **Das
trennt, was Tom als *,,falsches Modal"* gemeldet hat.**

### 4 · Die Sabotagen — 9 von 9 fallen

Jede einzeln, Rueckbau bytegleich per SHA-256.

| # | Sabotage | faellt |
|---|---|---|
| 1 | die Mahlzeit wird nicht angelegt | ja |
| 2 | die Position wird nicht geschrieben | ja |
| 3 | nur ein Portionsfeld statt aller drei | ja |
| 4 | die Tageszeit spielt keine Rolle | ja |
| 5 | das Modal oeffnet auch ohne Tag | ja |
| 6 | Add oeffnet das Modal nicht mehr | ja |
| 7 | mit Begriff laeuft die Suche nicht an | ja |
| 8 | der Reiter liest den Begriff nicht | ja |
| 9 | der Rueckweg nimmt nichts mit | ja |

`[cmd]` **Sabotage 6 ueberlebte im ersten Lauf.** Mein Test suchte
`setErfassen(` im Quelltext — **`undefined && setErfassen({…})` liess
den Namen stehen und den Aufruf nie laufen.** `[read]` **Wort statt
Wirkung, dieselbe Klasse wie G-216/G-247/G-108.** Verschaerft:
geprueft wird die Klickzuweisung selbst, plus ein Verbot der
stillgelegten Form.

`[cmd]` **Sabotage 3 sichert den CHECK aus 058a:** entweder alle drei
Portionsfelder oder keines.

### 5 · Gate und Testlage

`[cmd]` **`pnpm gate`: 11 von 11 gruen** — auch der Index, der in
G-259 und G-271 noch abwich. `[cmd]` **Typecheck sauber, Build
gruen.** `[cmd]` **321 von 321 Nutrition-Tests gruen**, davon 10
neue. `[cmd]` **Encoding sauber, Exit 0.**

`[cmd]` **Am Schirm: 0 Attrappen in beiden Reitern, keine
Doppelung** — **keine zweite Ansicht**, das Modal steht einmal im
Baum und nicht je Trefferzeile.

**Bildschirmfotos:** `backup/g272-modal.png` (Modal mit Portionen und
Erfolgsmeldung), `g272-zurueck.png` (Rueckweg),
`g272-nachher-foods.png`.

**Nichts auf `dev@lumeos.app` geschrieben — die Schreibprobe lief auf
`test-user@lumeos.local` und ist gezaehlt zurueckgebaut. Nicht
committet, nicht gestaget. `supabase/` nicht angefasst.**

## Abnahme

**2026-08-30, Orchestrator. Nachgemessen.**

### Der Schreibweg existierte, und diesmal kostete die Suche zwei Minuten

`[cmd]` **`diary-write.ts` traegt sieben Funktionen** — `createMeal`,
`addMealItem`, `listPortionsForFood` und vier weitere — **plus eine
Zod-gepruefte Route unter `/api/nutrition/diary`.**

`[read]` **Die Warnung im Auftrag hat getragen:** *,,bei Supplements
gab es ihn seit G-148, und G-138 hat drei Tage daran vorbeigesucht."*
**Dieselbe Lage, zwei Minuten statt drei Tage.**

### Und er hat begruendet, warum er nicht wiederverwendet

`[read]` **`HinzufuegenModal` aus dem Diary-Reiter ist an eine
Mahlzeitenkarte gebunden** — es bekommt `slot` und `sicherstellen()`
von aussen und fragt weder nach Mahlzeit noch nach Tag. **Food DB
kennt beides nicht.**

`[cmd]` **Das neue Modal ergaenzt genau diese zwei Felder und ruft
denselben Weg** — keine zweite Suche, keine zweite Portionslogik,
kein zweiter Schreibweg.

`[read]` **Das ist die Doppelungspruefung, angewandt bevor der Fehler
entsteht** — zum dritten Mal in Folge.

`[cmd]` **Belegt auf `test-user@lumeos.local`:** eine Mahlzeit und
eine Position geschrieben, **dann auf 0/0 zurueckgebaut und
gezaehlt.** `[cmd]` **`dev` unberuehrt** — die vier Mahlzeiten dort
stammen vom 23.08.

`[read]` **Und die Trennung, die Toms Befund aufloest:** `+ Add` ist
jetzt eine Schaltflaeche, die Lupe daneben bleibt der Verweis.
**Add fuegt hinzu, die Lupe zeigt Naehrwerte.**

### G-266 brauchte zwei Aenderungen, nicht eine

`[cmd]` **Der Reiter liest `?q=` als Anfangswert** — **und der erste
Suchlauf darf nicht mehr uebersprungen werden, wenn ein Begriff
ankommt.** `[read]` **Sonst steht das Wort im Feld und die Liste
zeigt etwas anderes.**

`[cmd]` **Beide Richtungen belegt:** *reis* mit 50 Zeilen → Lupe →
Detailseite mit gefuelltem Feld → zurueck → Reiter mit 3 Zeilen.

### Die neunte Sabotage

`[read]` **Der Test suchte `setErfassen(` im Quelltext** —
`undefined && setErfassen({…})` laesst den Namen stehen. **Wort statt
Wirkung, das Muster aus G-216, G-247 und G-108 zum fuenften Mal**,
jetzt auf die Klickzuweisung geprueft.

`[cmd]` 9/9 Sabotagen fallen, Gate 11/11, 321/321 Tests, 0 Attrappen.
`[cmd]` **Und die Index-Abweichung der letzten zwei Runden ist
weg** — sie kam aus meinem Aufraeumen.

**Abgenommen.**

