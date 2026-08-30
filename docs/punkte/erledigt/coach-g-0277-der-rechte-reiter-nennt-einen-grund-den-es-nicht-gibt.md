---
nr: G-277
typ: befund
modul: coach
schwere: hoch
angelegt: 2026-08-30
braucht: []
kind_von: A-62
entscheidung: null
agent: claudecode
beauftragt: 2026-08-30
erledigt: 2026-08-30
commit: OFFEN
beruehrt:
  dateien:
    - apps/web/src/app/v2/coach/ansicht.tsx
zahlen:
  gemessen: 2026-08-30
  coach_tabellen: 12
  gelesene_tabellen: 10
---

# G-277 — der Rechte-Reiter nennt einen Grund, den es nicht gibt

## Befund

Aus A-62, Claude Code, 2026-08-30.

`[cmd]` **`tab-rechte.tsx:66` sagt: *,,sechs Tabellen"* und *,,coach
ist nicht fuer PostgREST freigegeben"*.**

`[cmd]` **Es sind zwoelf Tabellen, und alle sieben Schemata stehen in
`config.toml` unter `schemas`.**

`[cmd]` **Und `rechte-read.ts:234` liest zehn `coach`-Tabellen, in
denen Zeilen stehen.**

`[read]` **Der Reiter zeigt einen Leerzustand und nennt dafuer einen
Grund, den es nicht gibt.**

## Warum es `hoch` ist

`[read]` **Das ist nicht nur ein falscher Kommentar.** **Die
Behauptung ist die genannte Begruendung fuer das, was der Nutzer
sieht** — **wer sie liest, haelt den Leerzustand fuer richtig.**

`[cmd]` **A-62 hat den Kommentar berichtigt.** `[read]` **Ob der
Reiter jetzt Daten zeigt, ist damit nicht gesagt** — **der Leseweg
existiert, die Anzeige ist ungeprueft.**

## Zu messen

**Was zeigt der Reiter heute, und was koennte er zeigen?**

`[cmd]` **`coach.relationships` traegt 6 Zeilen, `client_permissions`
und `client_autonomy` je 5.** `[cmd]` **`dev` hat einen Coach und
steht auf Autonomiestufe 3.**

`[read]` **Und E-29 gilt:** Modulzugriffe auf `coach` gehen ueber eine
Funktion. `[cmd]` **`coach.offene_aktionen()` und
`darf_nutrition_plan_aendern()` sind der gebaute Weg** — **ob der
Rechte-Reiter selbst unter diese Regel faellt, ist zu klaeren:** er
ist Teil des Coach-Moduls, nicht eines fremden.

## Auftrag — was der Rechte-Reiter zeigen kann

**Mitbeauftragt: G-278.** Bericht in diese Datei.

**Beauftragt am 2026-08-30.**

### 1 · G-277 — der Leerzustand mit falschem Grund

`[cmd]` **Du hast den Kommentar in A-62 berichtigt.** `[read]` **Ob
der Reiter jetzt Daten zeigt, ist damit nicht gesagt** — der Leseweg
existiert, **die Anzeige ist ungeprueft.**

`[cmd]` **`coach.relationships` traegt 6 Zeilen,
`client_permissions` und `client_autonomy` je 5.** `[cmd]` **`dev`
hat einen Coach und steht auf Stufe 3.**

`[read]` **Und eine Grenzfrage gehoert geklaert, bevor du baust:**
`[cmd]` **E-29 verlangt eine Funktion fuer Modulzugriffe auf
`coach`** — **aber der Rechte-Reiter ist Teil des Coach-Moduls, nicht
eines fremden.** `[read]` **Miss, ob die Regel hier ueberhaupt
greift.** **Wenn ja: melden, nicht umgehen.**

### 2 · G-278 — die restlichen 222

`[cmd]` **Drei Aussagen sind markiert, neun waren gekippt, 222 leben.**

`[read]` **Ein Durchgang durch alle 222 ist Fleissarbeit.** **Der
Mittelweg steht im Punkt:** nur die markieren, **die eine Anzeige
begruenden.**

`[read]` **Miss, wie viele das sind** — **und markiere die.** `[cmd]`
**Die tragende Stelle in G-277 war genau so eine:** eine Behauptung,
die erklaerte, warum ein Nutzer nichts sieht.

### Was nicht zu tun ist

**Kein Schema aendern.**
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    Rechte-Reiter heute      was zeigt er, Bildschirmfoto
    was er zeigen koennte    gemessen
    E-29                     greift die Regel hier? belegt
    begruendende Aussagen    Zahl, davon markiert
    Attrappen                vorher / nachher

## Bericht

**Claude Code, 2026-08-30.** Mitbeauftragt: G-278, G-262, G-263.
Nichts auf `dev@lumeos.app` geschrieben, nichts committet, nichts
gestaged, kein Schema geaendert.

### 1 · G-277 — die Praemisse faellt, der Befund ist ein anderer

**Der Punkt sagt: der Rechte-Reiter zeigt einen Leerzustand.**
`[cmd]` **Er zeigt Daten.** Gemessen am 2026-08-30, `dev@lumeos.app`,
angemeldet:

    Permissions   2 Karten a 7 Zeilen (Coach 10000000, Coach 70000000)
                  + Historie der Freigaben, 4 Eintraege
                  0 Attrappen
    Proposals     „2 offen · 0 entschieden", echte Aktion
    Autonomy      2 Einstufungen + Historie, 4 Eintraege

`[read]` **Der A-62-Kommentar war das Problem, nicht die Anzeige.**
Der Reiter las bereits; nur der Kommentar behauptete das Gegenteil.
**Damit ist G-277 in seiner urspruenglichen Form gegenstandslos.**

**Der wirkliche Befund liegt einen Reiter weiter — und ist derselbe
Fehlertyp:**

`[cmd]` **Der `Coaches`-Reiter zeigte VIER erfundene Personen** —
Anders Lindqvist, Jana Bauer, Dr. Magnus Kessler, David Park aus
`daten.ts`. `[cmd]` **`dev` hat EINE aktive Beziehung** zu
`coach@lumeos.app` in `coach.relationships`.

`[cmd]` **Und die Reiterleiste zaehlte dabei richtig:** *„Coaches 1"*
(`ansicht.tsx:99` liest `stand.beziehungen.length`). **Zahl und Liste
widersprachen sich auf demselben Schirm.**

`[read]` **Die Ursache war ein fehlendes Prop, kein fehlender
Bauteil:** `CoachesEcht` steht seit G-158 fertig daneben und wird in
der Uebersicht benutzt. **`AthleteCoaches()` nahm `stand` gar nicht
entgegen** — sie *konnte* den Entwurf nicht verlassen, auch wenn Daten
dagewesen waeren.

**Behoben:** ein Prop, ein Zweig (Muster G-65/G-90).

    vorher    4 Attrappen, 4 erfundene Personen
    nachher   0 Attrappen, „1 Beziehung · aus coach.relationships",
              Coach 70000000, active, seit 2026-04-22

`backup/g277-ist-coaches.png`, `backup/g277-soll-coaches.png`.

### Die Grenzfrage: greift E-29 hier?

**Nein — gemessen, nicht ausgelegt.**

`[cmd]` **Der ADR sagt seinen Geltungsbereich selbst:** *„Diese
Entscheidung gilt fuer einen einzelnen Fall: Pending actions im
Tagebuch"*, berichtigt auf **G-258**.

`[cmd]` **Seine Begruendung nennt den Grund:** *„Ein direkter
Lesezugriff **aus einem anderen Modul** umgeht sie"* — die drei
Aenderungsprotokolle — und *„die Rechte liegen dort, nicht im lesenden
Modul"*.

`[cmd]` **Der Rechte-Reiter ist kein anderes Modul.** Alle Verbraucher
von `rechte-read.ts` liegen unter `app/v2/coach/`:

    app/v2/coach/human/page.tsx        ladeCoachRechte()
    app/v2/coach/rechte-echt.tsx       Typen
    app/v2/coach/tab-rechte.tsx        Typen
    app/v2/coach/tab-autonomie.tsx     Typen
    app/v2/coach/uebersicht-echt.tsx   Typen
    app/v2/coach/ansicht.tsx           Typen

`[read]` **Die Regel greift nicht** — sie schuetzt die Grenze *zum*
Coach-Modul, und hier steht niemand ausserhalb. **Das Modul, dem die
Rechtelogik gehoert, muss sie nicht ueber eine Funktion von sich
selbst erfragen.**

`[read]` **Gemeldet statt umgangen:** wuerde ein FREMDES Modul diese
Zeilen zeigen wollen, gilt E-29 unveraendert.

### 2 · G-262 — Pre-workout window

**Die Modulgrenze ist gemessen, und sie liegt anders als bei `coach`.**

`[cmd]` **E-29 begruendet sich aus Protokollen und Rechtetabellen:**

    Schema      Aenderungsprotokolle   Rechtetabellen
    coach                          4                4
    training                       0                0

`[read]` **In `training` gibt es beides nicht** — kein Protokoll, das
umgangen wuerde, keine Rechtelogik, die nachzubauen waere. **Die
Begruendung von E-29 hat hier keinen Gegenstand.**

`[cmd]` **Und `training` fuehrt keine Lesefunktion:** die fuenf
Funktionen des Schemas sind Trigger-Helfer.
`[cmd]` **RLS ist an** (5 Policies auf `workout_sessions`).
`[cmd]` **Der Zugriff ist Bestand:** `lib/dashboard/lesen.ts:229`
liest dieselbe Tabelle direkt, aus einem fremden Modul.

**Also direkt gelesen, mit der Abwaegung in der Datei.**

`[cmd]` **Die Daten tragen:** dev hat 30 Sitzungen, davon **14
`planned`** (2026-08-25 bis 2026-11-11), **13 ab heute**, alle mit
`started_time = 17:30`. **Die 17:30 der Vorlage sind die 17:30 der
Seeds.**

**Was bleibt und was faellt:**

    17:30-Sitzung            BLEIBT - Tatsache aus eigenen Daten
    Abstand „in 22 h 40 min" BLEIBT - Rechnung aus der Uhrzeit
    Score „68 · optimal"     RAUS - Bewertung ohne Formel
    „Eat by 16:00"           RAUS - Empfehlung
    Carbs 60 g / Protein     RAUS - Dosierungsempfehlung
      25-30 g / Fat <10 g
    drei Mahlzeiten-         RAUS - Kombinationsvorschlag
      kombinationen

`[read]` **Vier von sechs Teilen waren genau das, was C-108/F-02
verbietet** — ausdruecklich in C-113: *„Was nicht gebaut wird:
Dosierungsempfehlung, Zyklusaufbau, PCT-Protokoll,
Kombinationsvorschlag."*

`[cmd]` **Am Schirm:** „Nächstes Training · aus
training.workout_sessions · 17:30 · 2026-08-31 · Legs 6 · in 22 h
40 min · geplant" — plus der Satz, **warum** die Kachel duenner ist
als der Entwurf. `[read]` **Ohne ihn baut der naechste Auftrag die
Empfehlung nach.**

**Drei Zustaende, nicht zwei:** `geplant` / `ohne_zeit` / `keine`.
`[read]` *„Keine Einheit geplant"* ist etwas anderes als *„geplant,
aber ohne Uhrzeit"* — wer beides zusammenwirft, zeigt im zweiten Fall
nichts und behauptet, es sei kein Training vorgesehen.

### 3 · G-263 — Smart suggestions: entfernt

**Die Vorfrage war inhaltlich, und die Antwort entscheidet die
Kachel.** `[read]` **Ein Vorschlag sagt, was jemand tun soll — das ist
eine Bewertung.** Damit ist die Kachel **unter ihrem Namen nicht
baubar.** `[read]` **Aber je Zeile ist die Antwort verschieden**, und
nur eine Messung sagt, welche:

    „Same as yesterday"    der Fakt ist da (Vortag: 16 Posten ueber
                           vier Mahlzeiten, breakfast 4/501 kcal,
                           lunch 4/715, dinner 4/626, snack 4/391)
                           ABER GEBAUT: `wieGestern()` in
                           mahlzeiten.tsx:275, je Mahlzeit, mit
                           Schreibweg -> waere die zweite Ansicht

    „Top breakfast · 78%"  Haeufigkeit zaehlbar (Huehnerei roh 27x,
                           Hafer Flocken 8x, Dinkelbrot 8x in 30 Tagen)
                           „78% adherence" NICHT: eine Zielzeile
                           (gueltig ab 2026-05-21)
                           und „Top" ist bereits eine Wertung

    „Quick post-workout"   keine Quelle. Menge und Kombination stehen
                           nirgends - genau C-113

    „Saturday cheat meal"  KEIN MUSTER: ueber 90 Tage traegt jeder
                           Wochentag dieselben 13 Tage; Samstag
                           625 kcal liegt zwischen Fr 560 und Do 663.
                           „allowance" ist zudem eine Erlaubnis

`[read]` **Eine ist gebaut, eine ist erfunden, zwei sind
Empfehlungen. Keine traegt.** **Der Auftrag sagt, was dann geschieht:
entfernt statt gefuellt.**

`[cmd]` **A-59 eingehalten:** nach dem Wegfall hatte
`SmartSuggestionsCard` null Aufrufer — **geloescht, nicht
stehengelassen.** Die Messungen stehen in
`lib/nutrition/vorschlags-lage.ts`, damit niemand dieselbe Frage ein
zweites Mal stellt.

`[read]` **Eine offene Produktfrage bleibt und ist notiert:** eine
Kachel *„haeufig erfasst"* waere eine **Angabe** und keine Bewertung —
sie nennt Zahlen aus dem eigenen Protokoll, ohne zu sagen, was jemand
tun soll. **Das ist eine Entscheidung, keine Messung.**

### 4 · G-278 — der Mittelweg, gemessen

`[cmd]` **194 Abwesenheitsaussagen in laufendem Code** (nicht 222 —
die aeltere Zahl schloss Protokollordner mit ein). **76 stehen im
Umfeld einer Anzeige-Entscheidung** (Leerzustand, Attrappenmarke,
`InEntwicklungKnopf`).

`[read]` **Davon sind die wirklich tragenden die `grund=`-Texte** —
der Satz, den ein Nutzer liest, wenn ein Knopf nichts tut. **Genau die
Sorte, die G-277 ausgeloest hat.**

**Zehn Tabellen aus diesen Gruenden gegen die Datenbank geprueft:**

    DA      goals.body_measurements, goals.user_goals,
            medical.symptoms, recovery.modality_log,
            training.exercises
    FEHLT   medical.biomarker_results, recovery.hrv_readings,
            recovery.protocols, training.blocks, training.routines

`[cmd]` **Eine war gekippt, und sie stand am Schirm:**
`medical/modale.tsx` sagte *„Symptome brauchen eine Tabelle
medical.symptoms — die gibt es nicht"*. **Die Tabelle hat 8 Spalten
und 34 Zeilen, und `lib/medical/lesen.ts:431` liest sie bereits.**

`[read]` **Berichtigt mit dem, was wirklich fehlt:** `symptoms` ist
ein **Katalog** (Namen, kein `user_id`, kein Datum). **Was zum
Erfassen fehlt, ist ein Protokoll je Nutzer** — markiert als
`@abwesend medical.symptom_log`. Nebenbei war *„11 Tabellen"* auch
falsch: es sind 22.

**Sechs Marken gesetzt, alle an tragenden Gruenden:**

    medical.symptom_log          (neu benannt, s. o.)
    medical.biomarker_results    zwei Knoepfe
    recovery.hrv_readings
    recovery.protocols
    training.routines
    training.blocks

`[cmd]` **Der Gate fuehrt jetzt 10 Marken, alle gueltig.**

`[read]` **Warum nicht alle 194:** die uebrigen stehen in Kommentaren,
Waechtern und Protokolldateien. **Sie altern zu Recht** — der Mittelweg
aus dem Punkt ist genau diese Auswahl.

### Nachweis

    Rechte-Reiter heute   zeigt Daten: 2x7 Zeilen + 4 Historie,
                          0 Attrappen (backup/g277-ist-permissions.png)
    was er zeigen koennte  nichts Weiteres - der Befund lag im
                          Coaches-Reiter
    E-29                  greift NICHT: alle Verbraucher von
                          rechte-read.ts liegen in app/v2/coach/;
                          der ADR nennt „aus einem anderen Modul"
                          als Grund. Belegt, nicht ausgelegt.
    begruendende Aussagen 194 gesamt, 76 an einer Anzeige,
                          6 markiert (10 Marken im Gate)
    Attrappen             Coaches   4 -> 0
                          Tagebuch  3 -> 1 (Rest: Nutrition score,
                                    E-25, nicht dieser Auftrag)
    Ladezeit              Coaches-Reiter 1.598 ms
                          Tagebuch kalt 5.218 / warm 3.842 ms

### Waechter und Sabotageprobe

**Neu:** `apps/web/src/lib/training/__tests__/naechste-sitzung.test.ts`
(8 Waechter). **Berichtigt:** der Attrappen-Waechter
`v2-attrappen.test.ts:139`.

`[cmd]` **A-62 wieder, und diesmal beim Bauen bemerkt:** der Waechter
*„die sieben Begleitkarten des Diary stehen da"* **sicherte die
Vollstaendigkeit des ENTWURFS** — richtig, solange alle sieben Entwurf
waren, **falsch in dem Moment, in dem eine bewusst entfernt wird.**
Er stand dem Auftrag im Weg, statt etwas zu schuetzen. **Umgedreht:**
sechs Karten muessen stehen, und `SmartSuggestionsCard` darf **nicht**
zurueckkommen.

**Elf Sabotagen, jede einzeln, Rueckbau je byte-gleich (SHA-256) —
alle elf fallen:**

    G-277  der Coaches-Reiter bekommt den Stand nicht
    G-277  der echte Zweig wird uebersprungen
    G-262  auch abgesagte Einheiten holen
    G-262  vergangene Einheiten mitholen
    G-262  ohne_zeit wie keine behandeln
    G-262  die Makroempfehlung zurueckbauen
    G-263  die Attrappe wieder einbauen
    G-263  das Urteil zu wie_gestern umdrehen
    G-278  die Marke aus dem medical-Grund nehmen
    G-278  die Marke aus dem training-Grund nehmen
    G-278  medical.symptoms wieder als fehlend behaupten

### Laeufe

    pnpm --filter @lumeos/web test    1051 pass, 0 fail (vorher 1042)
    turbo typecheck                    gruen
    pnpm gate                          11/11 Tasks gruen
    [abwesenheit]                      10 Marken, alle gelten noch
    [encoding]                         20.538 Dateien sauber

`[cmd]` **Zum Messen mehrfach noetig: `python tools/server.py start`.**
Der Dev-Server ueberlebte die langen Testlaeufe nicht; **die Zahlen
oben sind gegen einen frisch gestarteten Server gemessen**, nicht
gegen einen verhungerten.

### Dateien

    apps/web/src/lib/training/naechste-sitzung.ts          neu
    apps/web/src/app/v2/nutrition/pre-workout-echt.tsx     neu
    apps/web/src/lib/nutrition/vorschlags-lage.ts          neu
    apps/web/src/lib/training/__tests__/
      naechste-sitzung.test.ts                             neu
    apps/web/src/app/v2/coach/ansicht.tsx            G-277
    apps/web/src/app/v2/nutrition/ansicht.tsx       G-262/G-263
    apps/web/src/app/v2/nutrition/page.tsx          Laden (diary)
    apps/web/src/app/v2/nutrition/diary-entwurf.tsx G-263 geloescht
    apps/web/src/app/v2/medical/modale.tsx          G-278 + Marken
    apps/web/src/app/v2/recovery/modale.tsx         G-278 Marken
    apps/web/src/app/v2/training/modale.tsx         G-278 Marken
    apps/web/src/components/shell/__tests__/
      v2-attrappen.test.ts                          A-62 umgedreht
    backup/g277-*.png, backup/g262-*.png            Nachweis

## Abnahme

**2026-08-30, Orchestrator.**

### Die Praemisse fiel, und der echte Befund lag daneben

`[cmd]` **Der Rechte-Reiter zeigt Daten** — 2 Karten a 7 Zeilen, 4
Historieneintraege, 0 Attrappen. `[read]` **Der A-62-Kommentar war
das Problem, nicht die Anzeige.**

`[cmd]` **Der wirkliche Fund liegt einen Reiter weiter, und es ist
derselbe Fehlertyp:** der `Coaches`-Reiter zeigte **vier erfundene
Personen** gegen **eine echte Beziehung.**

`[cmd]` **Und die Reiterleiste zaehlte dabei richtig: *,,Coaches
1"*** — **Zahl und Liste widersprachen sich auf demselben Schirm.**

`[read]` **Die Ursache war ein fehlendes Prop, kein fehlender
Bauteil:** `CoachesEcht` steht seit G-158 fertig daneben, **aber
`AthleteCoaches()` nahm `stand` gar nicht entgegen.** **Sie konnte den
Entwurf nicht verlassen, auch wenn Daten dagewesen waeren.**

`[cmd]` **4 Attrappen auf 0.**

### Zwei Grenzfragen, gegen den ADR-Wortlaut entschieden

`[read]` **E-29 greift beim Rechte-Reiter nicht** — `[cmd]` **der ADR
nennt seinen Geltungsbereich selbst: *,,gilt fuer einen einzelnen
Fall: Pending actions"*, und seine Begruendung sagt *,,ein direkter
Lesezugriff aus einem anderen Modul"*.** `[cmd]` **Alle Verbraucher
von `rechte-read.ts` liegen unter `app/v2/coach/`.**

`[read]` **Das Modul, dem die Rechtelogik gehoert, muss sie nicht ueber
eine Funktion von sich selbst erfragen.**

`[read]` **Bei `training` liegt es anders und er hat es gemessen statt
analog geschlossen:** `[cmd]` **`coach` hat vier
Aenderungsprotokolle und vier Rechtetabellen, `training` keines von
beidem** — **E-29s Begruendung hat dort kein Gegenstueck.** `[cmd]`
**Und `lib/dashboard/lesen.ts:229` liest dieselbe Tabelle bereits aus
einem fremden Modul.**

`[read]` **Zweimal dieselbe Frage, zweimal verschieden beantwortet,
beide Male aus dem Wortlaut statt aus der Aehnlichkeit.**

### G-262 — gebaut, aber nur die Tatsache

`[cmd]` **Von sechs Teilen der Attrappe waren zwei Tatsachen** —
Sitzungszeit und Abstand — **und vier Empfehlungen:** Score 68,
*,,Eat by 16:00"*, Makrovorgaben, drei Mahlzeitenkombinationen.

`[read]` **Genau das, was C-108/F-02 verbietet.** `[cmd]` **Die Karte
zeigt jetzt *,,17:30 · 2026-08-31 · Legs 6 · in 22 h 40 min"*** —
**plus eine Zeile, warum sie duenner ist als die Vorlage, damit der
naechste Auftrag die Ratschlaege nicht neu baut.**

### G-263 — entfernt, je Zeile begruendet

    "Same as yesterday"   Fakt, aber gebaut (wieGestern())
    "Top breakfast 78%"   Haeufigkeit zaehlbar, Quote nicht;
                          "Top" ist selbst ein Urteil
    "Quick post-workout"  keine Quelle
    "Saturday cheat meal" kein Muster: Sa 625 kcal liegt zwischen
                          Fr 560 und Do 663

`[read]` **Eine gebaut, eine erfunden, zwei Empfehlungen. Keine
traegt.** `[cmd]` **`SmartSuggestionsCard` hatte danach null Aufrufer
und ist geloescht.**

`[read]` **Und die Produktfrage, die er offengelassen hat, ist eine
echte:** eine Kachel *,,haeufig erfasst"* waere eine Angabe statt
einer Bewertung. **Als G-279 an Tom.**

### G-278 — 194 statt 222, und eine kippte am Schirm

`[cmd]` **194 Aussagen in laufendem Code, nicht 222** — die aeltere
Zahl schloss die Protokollordner ein. `[cmd]` **76 stehen im Umfeld
einer Anzeige-Entscheidung.**

`[read]` **Tragend sind die `grund=`-Texte** — **der Satz, den ein
Nutzer liest, wenn ein Knopf nichts tut.** `[read]` **Genau die
Sorte, die G-277 ausgeloest hat.**

`[cmd]` **Zehn genannte Tabellen geprueft, fuenf da.** `[cmd]` **Eine
war gekippt und stand am Schirm: `medical.symptoms` mit 34 Zeilen,
gelesen von `lesen.ts:431`, wurde als *,,gibt es nicht"*
behauptet.**

`[read]` **Berichtigt mit dem, was wirklich fehlt:** `symptoms` ist
ein Katalog, **fuers Erfassen fehlt ein Protokoll je Nutzer.** **Als
C-359.**

`[cmd]` **Sechs Marken gesetzt, der Gate fuehrt jetzt 10.**

### A-62 hat wieder zugeschlagen

`[cmd]` **Der Waechter, der alle sieben Entwurfskarten verlangte,
sicherte die Vollstaendigkeit des Entwurfs** — **und blockierte genau
die Entfernung, die G-263 verlangt.** `[read]` **Beim Bau gefangen,
nicht danach.**

`[cmd]` 1051 Tests, 11 Sabotagen, Gate 11/11. Attrappen: Coaches 4 auf
0, Tagebuch 3 auf 1.

`[read]` **Und ein Betriebsbefund:** `[cmd]` **der Dev-Server hat die
langen Testlaeufe nicht ueberlebt und musste mehrfach neu gestartet
werden.** **Als G-280.**

**Abgenommen.**

