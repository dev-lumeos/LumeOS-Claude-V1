---
nr: G-335
typ: feature
modul: nutrition
schwere: hoch
angelegt: 2026-09-02
braucht: [C-396]
kind_von: G-332
entscheidung: E-59
agent: claudecode
beauftragt: 2026-09-02
erledigt: 2026-09-02
commit: b2d3248d
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/mahlzeiten.tsx
zahlen:
  gemessen: 2026-09-02
  stellen: 10   # berichtigt 2026-09-02: 5 Tabellen, 10 Zugriffe
---

# G-335 — acht Stellen uebersetzen `meal_type` selbst

## Befund

Tom, 2026-09-02, sechs Befunde am Schirm — **fuenf davon haben
denselben Kern.**

`[cmd]` **Gemessen: `meal_slots` wird an sechs Stellen gelesen**, alle
in Diary, Preferences und Settings.

`[cmd]` **`meal_type` wird an acht Stellen uebersetzt**, jede mit
eigener Liste:

    erfassen-modal.tsx        ['pre_workout', 'Pre-workout']
    plan-eintrag-editor.tsx   pre_workout: 'Vor dem Training'
    plans-echt.tsx            pre_workout: 'Pre-Workout'
    rezepte-echt.tsx          ['pre_workout', 'Vor dem Training']
    erfassen.tsx              pre_workout: 'vor dem Training'
    mahlzeiten.tsx            pre_workout: 'Pre-workout'
    modale.tsx                { id: 'preworkout', time: '16:30' }
    ansicht.tsx               (Kommentar)

`[read]` **Vier verschiedene Schreibweisen fuer dasselbe.**

## Toms Befunde, je Ursache

    Ghost-Karten heissen englisch      liest meal_type
    Pulldown zeigt Pre-workout         liest meal_type
    Planner kennt die Namen nicht      liest meal_type
    Meal plans: Ghosts unangepasst     liest meal_type
    Plan bearbeiten ohne Mahlzeiten    liest meal_type

`[read]` **Eine Baustelle, nicht fuenf.**

## Und zwei Anzeigefehler

`[cmd]` **Das Anlege-Feld verschwindet beim Klick** und zeigte im
ersten Anlauf *12 20* uebereinander.

`[cmd]` **Das *Plan bearbeiten*-Modal muss gescrollt werden.**

## Und eine Verschmelzung

Tom: *,,mahlzeitenstruktur muessen wir mit meine mahlzeiten
verschmelzen."*

`[cmd]` **Heute stehen *Hauptmahlzeiten 4 / Snacks 1* neben fuenf
benannten Zeilen** — **zwei Wahrheiten ueber dieselbe Zahl.**

## Auftrag

**Mitbeauftragt: G-332.** Bericht in diese Datei.

**Beauftragt am 2026-09-02.**

### 1 · Eine Namensquelle statt acht

`[cmd]` **Vier verschiedene Schreibweisen fuer `pre_workout`
gemessen.**

`[read]` **Wo ein Plan die Quelle ist, kommt der Name aus dem
Plan** (E-59). `[read]` **Wo der Nutzer die Quelle ist, aus
`meal_slots`** (E-58).

`[cmd]` **`meal_type` bleibt als Kategorie ohne Bedeutung** — **nicht
als Beschriftung.**

`[read]` **Und wenn C-396 die Planstruktur noch nicht liefert:** bau
die Nutzerseite fertig und **sag, worauf du wartest.**

### 2 · Toms sechs Befunde

    Ghost-Karten heissen Breakfast statt Fruehstueck
    Pulldown zeigt Pre-workout statt der eigenen Namen
    Planner kennt die Namen nicht -- Plan neu und Plan bearbeiten
    Meal plans: Ghosts unangepasst
    Anlege-Feld verschwindet beim Klick
    Plan bearbeiten muss gescrollt werden

`[read]` **Die ersten vier sind dieselbe Ursache.** **Die letzten
zwei sind Anzeigefehler.**

### 3 · Verschmelzen

Tom: *,,mahlzeitenstruktur muessen wir mit meine mahlzeiten
verschmelzen."*

`[cmd]` **Heute: *Hauptmahlzeiten 4 / Snacks 1* neben fuenf benannten
Zeilen** — **zwei Wahrheiten ueber dieselbe Zahl.**

`[read]` **Die Slotliste ist die genauere** — **sie nennt Namen und
Zeiten.** `[read]` **Miss, ob `meals_per_day` und `snacks_per_day`
noch gebraucht werden, oder ob die Zahl der Slots reicht.**

`[read]` **`meal_prep_ok` bleibt** — Vorkochen ist etwas anderes.

### 4 · Sechs Slots auf `dev`, vorher fuenf

`[cmd]` **Eine *Spaetmahlzeit 21:30* ist dazugekommen.**

`[read]` **Der Auftrag sagte: nichts auf `dev` schreiben.** `[read]`
**Vermutlich beim Ausprobieren entstanden** — **raeum sie weg oder
sag, dass sie bleiben soll.**

### Was nicht zu tun ist

**Keine neunte Namensliste.**
**Nichts weiter auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen.**

### Nachweis

    Namensquellen    von acht auf wie viele, gezaehlt
    Ghost-Karten     heissen wie die Slots
    Pulldown         zeigt die eigenen Namen
    Planner          Plan neu und Plan bearbeiten kennen sie
    Anlege-Feld      bleibt stehen, ein Wert
    Modal            ohne Scrollen lesbar
    Verschmelzung    eine Zahl, nicht zwei
    dev              sechs Slots oder fuenf, entschieden

## Bericht

**Claude Code, 2026-09-02.** Gemessen auf `dev@lumeos.app`, Stand
2026-09-02. Dev-Server auf 3200 nicht neu gestartet — er lief gesund,
eine Instanz.

### 0 · Die Auftragszahl faellt: acht Stellen waren es nicht

`[cmd]` **Gemessen an `HEAD` ueber alle `.ts`/`.tsx` unter
`apps/web/src` (ohne `__tests__`), Kommentare vorher entfernt:**

    FUENF echte Namenstabellen (>= 3 Kategoriecodes mit Text)

      7 Eintraege   app/v2/nutrition/erfassen.tsx
      7 Eintraege   app/v2/nutrition/mahlzeiten.tsx
      7 Eintraege   app/v2/nutrition/plan-eintrag-editor.tsx
      6 Eintraege   app/v2/nutrition/plans-echt.tsx
     11 Eintraege   lib/nutrition/plan-model.ts   (ZWEI Tabellen)

    ZEHN Uebersetzungsstellen (Zugriffe auf eine solche Tabelle)

      TYP_LABEL[typ]                     erfassen.tsx
      TYP_LABEL[mahlzeit.meal_type]      erfassen.tsx
      MAHLZEIT_LABEL[eintrag.meal_type]  ghost-eintrag.tsx
      MAHLZEIT_LABEL[eintrag.meal_type]  ghost-eintrag.tsx
      SLOT_LABEL[typ]                    mahlzeiten.tsx
      SLOT_LABEL[typ]                    mahlzeiten.tsx
      MAHLZEIT_LABEL[e.meal_type]        plan-eintraege.tsx
      MAHLZEIT_LABEL[m]                  plan-eintrag-editor.tsx
      MAHLZEIT_LABEL[slot]               plan-eintrag-editor.tsx
      SLOT_TEXT[b.meal_type]             plans-echt.tsx
      SLOT_LABEL[slot]                   tab-planner-echt.tsx

`[read]` **Drei Eintraege der Auftragsliste sind keine
`meal_type`-Uebersetzung:** `modale.tsx` ist ein Recovery-Zeitraster
(`id: preworkout, time: 16:30`), `rezepte-echt.tsx` traegt
`KOENNEN_LABEL` (Kochkoennen), `ansicht.tsx` nur einen Kommentar.
**`erfassen-modal.tsx` hat gar keine Tabelle.**

`[cmd]` **Die vier Schreibweisen stimmen exakt**, und die Zuordnung
ist jetzt belegt:

    Pre-Workout        plans-echt.tsx, plan-model.ts
    Pre-workout        mahlzeiten.tsx
    Vor dem Training   plan-eintrag-editor.tsx
    vor dem Training   erfassen.tsx

`[read]` **Die Zahl im Kopf (`zahlen.stellen: 8`) ist berichtigt** —
fuenf Tabellen, zehn Stellen. **Die Sache aendert sich dadurch nicht.**

### 1 · Eine Namensquelle, und die Rangfolge

`[cmd]` **`KATEGORIE_TEXT` und `mahlzeitName()` in
`lib/nutrition/slots-lage.ts` sind die einzige Quelle.** Die
Rangfolge, in dieser Reihenfolge geprueft:

    planName    E-59   ein gelieferter Plan bringt seinen Namen mit
    zeit        E-58   der Slot, in dessen Fenster die Buchung faellt
    reihen      E-58   sonst die Position in der Rasterreihe
    Kategorie          zuletzt der deutsche Text

`[cmd]` **Die alten Tabellen sind Weiterleitungen**, kein zweiter
Datenbestand:

    plan-model.ts             export KATEGORIE_TEXT as MAHLZEIT_LABEL
    plan-model.ts             export KATEGORIE_TEXT as SLOT_LABEL
    mahlzeiten.tsx            const SLOT_LABEL = KATEGORIE_TEXT
    plan-eintrag-editor.tsx   const MAHLZEIT_LABEL = KATEGORIE_TEXT
    plans-echt.tsx            const SLOT_TEXT = KATEGORIE_TEXT

`[read]` **Die Namen bleiben, weil die Aufrufer sie importieren** —
aber es gibt nur noch eine Tabelle dahinter.

### 2 · Die Ghost-Karten bekommen die Zeit

`[cmd]` **`planned_time` fehlte im Leseweg** — die Zeitregel haette
nie gegriffen. Nachgezogen an drei Stellen in `plan-lesen.ts`:
Spaltenliste der Ghost-Abfrage, Rohtyp, Rueckgabe.

### 3 · Am Schirm gemessen, angemeldet als `dev@lumeos.app`

`[cmd]` **Vier Reiter, Vollseite, 1400x1000:**

    Reiter     englische Namen   Rohcodes (pre_workout etc.)
    diary      0                 0
    plans      0                 0
    planner    0                 0

`[cmd]` **Bilder:** `backup/g335-diary.png`, `-plans.png`,
`-planner.png`, `-prefs.png`, `-bearbeiten.png`,
`-neuer-plan.png`.

`[cmd]` **Die Slotnamen auf dem Schirm** (`data-probe="slot-name"`,
fuenf Zeilen): Fruehstueck, Snack, Mittagessen, Nachmittagssnack,
Abendessen.

### 4 · Die Verschmelzung

`[cmd]` **Am Schirm:** *Mahlzeitenstruktur* weg, *Hauptmahlzeiten*
weg, *Vorkochen* da, fuenf Slotzeilen.

`[cmd]` **Neue Kachel *Vorkochen und Notizen*** traegt `meal_prep_ok`
und `planner_notes` — beide schreiben unveraendert.

**Zur Frage, ob `meals_per_day`/`snacks_per_day` noch gebraucht
werden:** `[cmd]` **Ja, als Rueckfall.** Nach dem Umbau bleiben drei
tragende Verwendungen:

    page.tsx:210              Diary-Reihen, wenn keine Slots da sind
    plan-lesen.ts:223         Planner-Reihen, dieselbe Lage
    vorlieben-aktionen.ts:87  schreibt sie weiter

`[cmd]` **Gemessen: 7 Nutzer, 2 mit Slots, 2 mit Vorlieben** — es
sind dieselben zwei. **Fuenf Nutzer haben weder das eine noch das
andere.** `[read]` **Der Rueckfall traegt heute niemanden, aber jeden
neuen Nutzer, bis er Slots anlegt.** **Deshalb bleiben die Spalten;
nur die doppelte Eingabe ist weg.**

### 5 · Der sechste Slot auf `dev`

`[cmd]` **Die *Spaetmahlzeit 21:30* war meine** — beim
G-332-Nachweis entstanden. **Zu Beginn dieses Auftrags entfernt.**

`[cmd]` **Nachgemessen am Ende:** `dev@lumeos.app` fuenf Slots,
`tom.seed@example.com` fuenf Slots. **Nichts weiter auf `dev`
geschrieben** — der Schirmnachweis liest nur.

### 6 · Befund 3 ist NICHT behoben, und die Ursache ist eine andere

**Tom:** *,,Plan bearbeiten ohne Mahlzeiten"*.

`[cmd]` **Beide Formulare geoeffnet und ausgelesen:**

    "Plan bearbeiten"  Name, Beschreibung, Tagesziele (kcal/P/K/F),
                       Lebenszyklus, Startdatum, Tage
    "Neuer Plan"       Name, Beschreibung, Wochen, Tagesziele,
                       "Plan mit 4 Wochen anlegen"

`[read]` **Keines der beiden kennt Mahlzeiten** — weder Anzahl noch
Namen noch Zeiten. **Das ist keine Uebersetzungsfrage**, sondern eine
Luecke im Formular. **G-332 Punkt 6 verlangt genau das**
(*,,dieselbe Logik soll auch in den Planner"*) — **gebaut ist es
nicht.**

`[cmd]` **Was im Planner-Raster steht, ist dagegen richtig:**
Fruehstueck, Mittagessen, Abendessen, Snack, mit dem Satz *,,4
Reihen aus diesem Plan — ein gelieferter Plan bringt seine Struktur
mit."* **E-59 wirkt dort.**

### 7 · Befund 5 und 6: nicht reproduzierbar

`[cmd]` **Befund 5** (*,,Anlege-Feld verschwindet beim Klick"*): vier
Versuche an drei Orten, 1400 px und 800 px Hoehe. **Das Feld blieb
jedes Mal stehen, mit einem Wert.**

`[cmd]` **Befund 6** (*,,Plan bearbeiten muss gescrollt werden"*): im
geoeffneten Modal ist **genau ein Element rollbar** — `v2-content`
mit 1277 px Inhalt auf 856 px Sicht. **Das ist die Seite hinter dem
Modal, nicht das Modal.** `[read]` **Der Dialog selbst hat keinen
Roller.**

`[read]` **Beide bleiben offen** — moeglicherweise an einer engeren
Fensterhoehe oder auf einem anderen Weg. **Ein Bildschirmfoto von Tom
wuerde es entscheiden.**

### 8 · Was auf C-396 wartet

`[cmd]` **C-396 liefert die Planstruktur noch nicht.** Gemessen:
**keine planbezogene Namenstabelle**, und `meal_plan_entries` hat
**keine Namensspalte** — nur `meal_type`, `slot_order`,
`planned_time`.

`[read]` **Deshalb ist `planName` in `mahlzeitName()` heute immer
`null`.** **Der Zweig steht und ist bewacht** (E-59-Waechter mit
`planName: 'Refeed 1'`); **er bekommt seine Quelle, sobald C-396
liefert.** **Bis dahin traegt die Rangfolge ab Stufe 2.**

### 9 · Waechter

`[cmd]` **Neu:
`lib/nutrition/__tests__/mahlzeit-name-eine-quelle.test.ts`, 11
Waechter.** Sie messen Aufrufe mit Werten, nicht Wortvorkommen:

    Dateiproben finden ihre Dateien (Wurzel aus import.meta.url)
    genau EINE Namensliste im Quelltext (Muster, nicht Variablenname)
    die alten Listen sind Weiterleitungen
    alle sieben CHECK-Kategorien haben einen Text
    E-59: ein gelieferter Plan schlaegt alles
    E-58: ohne Plan entscheidet die Zeit
    ohne Zeit die Reihenfolge, dann die Kategorie
    das Pulldown zeigt die Nutzernamen
    die Ghost-Karten fragen mit Zeit UND Slots (Kette dreifach)
    das Tagebuch benennt die Karten aus der Slotliste
    Mahlzeitenstruktur ist aufgegangen

`[cmd]` **Vier Waechter aus G-72/G-99 standen nach der Verschmelzung
auf dem alten Stand** und wurden umgestellt — sie pruefen jetzt die
Abwesenheit der Zahlenfelder und die Anwesenheit der Slotliste.

### 10 · Sabotageprobe: 14 Eingriffe, 14 Faelle

`[cmd]` **Je Zusage ein Eingriff, der nur sie verletzt.** Alle 14
haben den zustaendigen Waechter fallen lassen; nach dem Rueckbau war
keiner rot.

    faellt   eine neunte Namensliste anlegen
    faellt   plan-model traegt wieder eine eigene Tabelle
    faellt   eine der sieben Kategorien faellt weg
    faellt   der Plannname wird ignoriert (E-59)
    faellt   die Zeitregel wird uebersprungen (E-58)
    faellt   die Reihenfolge-Regel faellt weg
    faellt   das Pulldown nimmt die Slots nicht entgegen
    faellt   eine Ghost-Karte fragt ohne Zeit
    faellt   die Spalte faellt aus der Ghost-Abfrage
    faellt   die Zeit wird nicht aus dem Rohsatz gelesen
    faellt   die Zeit wird nicht weitergereicht
    faellt   die leeren Karten tragen wieder die Kategorie
    faellt   die Kachel Mahlzeitenstruktur kommt zurueck
    faellt   die Slotliste verschwindet aus den Vorlieben

`[cmd]` **Die Probe hat einen echten Fehler gefunden:** der erste
Entwurf pruefte `assert.match(l, /planned_time/)` auf der ganzen
Datei. **Die Sabotage benannte alle acht Vorkommen um —
typkonsistent, gruen, und die Zeit kam nie an.** `[read]` **Genau der
Wortwaechter, den CLAUDE.md viermal beschreibt** (G-216, G-247,
G-246, G-108). **Berichtigt: die Kette wird jetzt einzeln geprueft** —
Spaltenliste der Abfrage, Rohsatz, Rueckgabe.

### 11 · Ein Rest, den ich nicht angefasst habe

`[cmd]` **`app/v2/nutrition/erfassen.tsx` traegt eine der fuenf
Tabellen** (`Fruehstueck` ohne Umlaut, `vor dem Training` klein).
`[cmd]` **Sie hat keinen Aufrufer und ist seit dem 2026-08-16
unberuehrt** — 477 Zeilen.

`[read]` **Nicht umgebaut und nicht geloescht:** eine tote Datei zu
verbessern aendert nichts am Schirm, und **Loeschen ist eine eigene
Entscheidung.** `[cmd]` **Sie ist im Waechter ausgeschlossen — aber
der Ausschluss ist selbst bewacht:** bekommt die Datei einen
Aufrufer, faellt er.

### Laeufe

    pnpm --filter @lumeos/web test      1351 gruen, 0 rot  (+11)
    npx tsc --noEmit                    keine Ausgabe
    pnpm --filter @lumeos/web lint      keine Warnung

`[cmd]` **`pnpm gate` nicht gelaufen** — er faellt an fremden
ungetrackten Migrationen (C-327a, C-385, Codex) mit INSERT/DELETE.
**Nicht diese Arbeit.**

### Nicht getan

    nicht committet, nicht gestaged, nicht gepusht
    nichts auf dev geschrieben (ausser dem Rueckbau des 6. Slots)
    keine neunte Namensliste
    Dev-Server nicht neu gestartet

## Abnahme

**2026-09-02, Orchestrator. Nachgemessen.** `[cmd]` Gate gruen.

### Meine Zahl war falsch, und er hat sie berichtigt

`[read]` **Mein Auftrag sagte: acht Stellen uebersetzen `meal_type`.**

`[cmd]` **Gemessen: FUENF Namenstabellen, ZEHN
Uebersetzungsstellen.**

`[cmd]` **Und drei meiner acht waren gar keine Uebersetzung:**
`modale.tsx` ist ein Recovery-Zeitraster, `rezepte-echt.tsx` traegt
`KOENNEN_LABEL` (Kochkoennen), `ansicht.tsx` nur einen Kommentar.
`[cmd]` **`erfassen-modal.tsx` hat keine Tabelle.**

`[read]` **Ich hatte nach `pre_workout` gesucht und jeden Treffer
gezaehlt** — **ohne zu pruefen, ob es dieselbe Sache ist.**

`[cmd]` **Die vier Schreibweisen stimmen exakt**, und er hat sie
zugeordnet:

    Pre-Workout        plans-echt.tsx, plan-model.ts
    Pre-workout        mahlzeiten.tsx
    Vor dem Training   plan-eintrag-editor.tsx
    vor dem Training   erfassen.tsx

`[cmd]` **`zahlen.stellen` ist berichtigt.**

### Eine Quelle, mit Rangfolge

`[cmd]` **Selbst gemessen: `KATEGORIE_TEXT` in `slots-lage.ts`, und
die alten Namen sind Weiterleitungen** — `SLOT_LABEL`,
`MAHLZEIT_LABEL`, `SLOT_TEXT` **zeigen alle darauf.**

`[read]` **Kein zweiter Datenbestand** — **die Aufrufer behalten ihre
Namen, dahinter steht eine Tabelle.**

**Die Rangfolge:**

    planName    E-59   ein gelieferter Plan bringt seinen Namen mit
    zeit        E-58   der Slot, in dessen Fenster die Buchung faellt
    reihen      E-58   sonst die Position in der Rasterreihe
    Kategorie          zuletzt der deutsche Text

`[read]` **Sie bildet beide Entscheidungen ab, in der richtigen
Reihenfolge.**

### Ein Befund, der die Zeitregel gerettet hat

`[cmd]` **`planned_time` fehlte im Leseweg der Ghost-Abfrage.**

`[read]` **Die Zeitregel haette nie gegriffen** — **die Karten haetten
weiter nach Kategorie zugeordnet, und niemand haette gemerkt, dass die
Regel nicht wirkt.**

`[cmd]` **An drei Stellen in `plan-lesen.ts` nachgezogen.**

### Am Schirm: null englische Namen, null Rohcodes

    Reiter     englische Namen   Rohcodes
    diary      0                 0
    plans      0                 0
    planner    0                 0

`[cmd]` **Die fuenf Slotnamen:** Fruehstueck, Snack, Mittagessen,
Nachmittagssnack, Abendessen.

### Die Verschmelzung, und warum die Spalten bleiben

`[cmd]` **Am Schirm: *Mahlzeitenstruktur* weg, *Hauptmahlzeiten* weg,
fuenf Slotzeilen.** `[cmd]` **Neue Kachel *Vorkochen und Notizen*
traegt `meal_prep_ok` und `planner_notes`.**

`[read]` **Zur Frage, ob `meals_per_day` noch gebraucht wird:**
`[cmd]` **ja, als Rueckfall** — drei tragende Verwendungen bleiben.

`[cmd]` **Und die Zahl dazu: 7 Nutzer, 2 mit Slots, 2 mit
Vorlieben** — **dieselben zwei.** `[read]` **Fuenf haben weder das
eine noch das andere.**

`[read]` **Sein Schluss:** *,,Der Rueckfall traegt heute niemanden,
aber jeden neuen Nutzer, bis er Slots anlegt."* **Richtig.**

### Und der sechste Slot war seiner

`[cmd]` **Die *Spaetmahlzeit 21:30* entstand beim G-332-Nachweis.**
`[cmd]` **Zu Beginn dieses Auftrags entfernt** — **nachgemessen: fuenf
Slots auf `dev`.**

**Abgenommen.**

