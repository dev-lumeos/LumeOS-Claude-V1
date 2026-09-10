---
nr: G-410
typ: feature
modul: coach
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-409
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  dateien:
    - apps/coach/src/components/draft/ansicht-akte.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-410 — der Kalender und das Athletendetail

## Auftrag

Tom, 2026-09-08: *,,kalender ist immer noch nicht der kalender. und
wenn man selber entscheidet wie athletendetails aussehen soll und
nicht die vorlage uebernimmt, sollte man wenigstens den inhalt mit
rein nehmen und nicht irgendwelche scheindaten tabellarisch ueber
die ganze seite verteilen."*

**Beauftragt am 2026-09-08.**

## 1 - Der Kalender ist ein MONATSRASTER

`[cmd]` **`module-coach-portal-tools.jsx:30`,
`window.PortalCalendar`** ? **zwei Spalten, 1.5fr zu 1fr:**

**Links, Karte *September 2026*:**

    Kopf: Pfeil links, "Today", Pfeil rechts
    Untertitel: N scheduled events

    Wochentage Mon-Sun, Montag zuerst
      startDow = (first.getDay() + 6) % 7

    Monatsraster, 7 Spalten:
      je Zelle minHeight 62, Tageszahl oben
      darunter bis zu DREI Farbstreifen
        (height 3, borderRadius 999)
      mehr als drei: "+N"
      HEUTE: dickerer Rahmen, fette Zahl
      GEWAEHLT: Akzenthintergrund
      Klick waehlt den Tag

    Trennlinie, dann die Legende:
      Check-in   var(--acc-coach)
      Session    var(--acc-train)
      Call       var(--acc-recov)
      Prep review var(--acc-goals)
      Deadline   var(--warn)

**Rechts, zwei Karten untereinander:**

    Der gewaehlte Tag
      Titel: "Thursday, 10 September" (ausgeschrieben)
      Untertitel: N events
      Knopf: + Add
      je Termin: Zeit (40px breit), Farbbalken (3px),
                 Titel, darunter der Name
      leer: "Nothing scheduled."

    Upcoming, next 7 events
      je Zeile: "10 Sep" (52px), Farbpunkt (6px),
                Titel, rechts der Vorname

`[cmd]` **Die Daten stehen in `CAL_EVENTS`, Zeile 5-19** ? **neun
Tage, vierzehn Termine.**

`[read]` **Gebaut ist eine Liste** (`calendar.png`) ? **dieselben
Daten, aber kein Raster, keine Farbstreifen, keine Tagesauswahl,
kein Ausblick.**

## 2 - Das Athletendetail zeigt Spaltennamen

`[cmd]` **`athlet-draft.png`:**

    Ernaehrung
      tage              7
      kcal_schnitt      2439
      fat_g_schnitt     65
      carbs_g_schnitt   277
      letzter_eintrag   2026-11-16
      tage_mit_eintrag  74
      protein_g_schnitt 165
    darunter eine Tabelle mit sieben Zeilen

`[read]` **Das sind Spaltennamen aus der Datenbank, nicht die
Sprache eines Coaches.**

`[cmd]` **Die Vorlage an derselben Stelle
(`module-coach-client-record.jsx`, Reiter Nutrition):**

    VIER Kennzahlen als Kacheln:
      Calories today   2.180
      Protein          218 g
      Adherence - 7d   97 %
      Water            4,2 L

    DREI Kachelbloecke:
      Today's macros    drei Balken mit Ist/Soll
                        Protein 218/220 g
                        Carbs   180/190 g
                        Fat      52/55 g
      This week         Wochenbalken Mon-Sun,
                        einer hervorgehoben
                        darunter ein Satz:
                        "Saturday 200 kcal over, agreed
                         refeed. Protein never below 208 g."
      Micronutrient gaps  drei Balken mit Prozent
                        Vitamin D 62 %, Omega-3 71 %,
                        Magnesium 84 %
                        darunter: "Vitamin D is supplemented;
                        the gap is dietary intake only."

`[read]` **Der Unterschied ist nicht die Datenmenge** ? **es ist
die Form:**

    Vorlage   vier Kennzahlen, drei Bloecke mit Balken,
              je ein erklaerender Satz
    Gebaut    sieben Feldnamen untereinander,
              eine Tabelle mit sieben Zeilen

`[read]` **Und wo Daten fehlen, zeigt die Vorlage trotzdem die
Form** ? **nicht den Spaltennamen.**

## Was zu tun ist

### Kalender

`[read]` **Das Raster bauen, wie oben beschrieben.**

`[cmd]` **`CAL_EVENTS` als Vorlagedaten uebernehmen** ? **es gibt
keine Termintabelle, das ist bekannt und benannt.**

### Athletendetail

`[read]` **Je Modul die Kacheln der Vorlage** ? **nicht die
Spalten der Abfrage.**

`[cmd]` **`module-coach-client-record.jsx` zeigt acht Reiter:**
**Overview, Training, Nutrition, Recovery, Supplements, Body,
Medical, Timeline.**

`[read]` **Je Reiter: Kennzahlen oben, Kacheln darunter, je Kachel
ein Satz in Coachsprache.**

`[read]` **Wo echte Daten da sind: hineinlegen.** `[read]` **Wo
nicht: die Zahlen der Vorlage, mit Vermerk.**

`[read]` **KEINE Spaltennamen am Schirm** ? **`kcal_schnitt`
heisst *Kalorien, Schnitt 7 Tage*.**

## Abnahmebedingungen

    A1  der Kalender: Monatsraster, 7 Spalten, Farbstreifen,
        Tagesauswahl, Legende mit fuenf Arten,
        Tagesspalte, Upcoming. Bildschirmfoto.
    A2  Klick auf einen Tag wechselt die rechte Spalte.
        Zwei Fotos.
    A3  das Athletendetail: je Reiter Kennzahlen und
        Kacheln der Vorlage. Zahl: 8 Reiter / je Kacheln.
    A4  KEIN Spaltenname am Schirm. Gegenprobe: eine Suche
        nach `_schnitt`, `_g_`, `tage_mit` findet nichts
        im gerenderten Text.
    A5  je Kachel ein Satz in Coachsprache, wie die Vorlage.
    A6  Bildschirmfoto je Reiter des Athletendetails.
    A7  apps/coach 61/61 oder mehr, apps/web 1545.

## Was nicht zu tun ist

**`?bereich=` NICHT anfassen.**
**Nichts in `supabase/`.**
**Keine Rueckfrage** ? **die Vorlage zeigt beides.**
Nicht committen, nicht stagen, nicht pushen.

## Der Dev-Server

`[cmd]` **Port 3220 laeuft.**
`[cmd]` **NIE `start`, `neustart`, `aufraeumen`.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
