---
nr: C-48
typ: blocker
modul: nutrition
schwere: hoch
angelegt: 2026-08-15
braucht: []
kind_von: null
kinder: []
agent: claudecode
beauftragt: 2026-08-28
erledigt: 2026-08-28
commit: OFFEN
entscheidung: null
beruehrt:
  tabellen: []
  dateien: ["apps/web/src/app/nutrition/foods/page.tsx"]
zahlen: null
---

# C-48 - Die Tagesbilanz sichtbar machen

## Befund

(neu 2026-08-15).
  Der nächste Schritt, sobald Theme V1 steht.

  `[cmd]` **Alles darunter ist fertig und live.** Was fehlt, ist
  ausschliesslich Oberfläche:

  | | |
  |---|---|
  | `daily_summary` | 70 Spalten, 24 Mikros mit Fehlzählern |
  | `daily_reference_assessment` | Deckungsgrad je Nährstoff |
  | `nutrient_reference_values` | 165 Zeilen, alle 138 Codes, Quelle je Zeile |
  | `profiles` | `birth_date`, `biological_sex`, Zeiträume für Schwangerschaft/Stillzeit |
  | `food_search` | 234 ms, Massstab 34/37 |

  **Vier Regeln, die aus der Datenseite kommen und die Oberfläche binden:**

  1. `[cmd]` **Fehlzähler müssen sichtbar bleiben.** Steht
     `vita_missing` auf 2, ist die Summe unvollständig — die Bewertung
     liefert dann `reference_status = 'incomplete'` **ohne** Prozentwert.
     Die Oberfläche darf daraus keine Null machen.
  2. `[cmd]` **Die Wertart entscheidet die Leserichtung.** 80 % eines
     `PRI` ist zu wenig, 80 % eines `UL` ist zu viel. Beides als
     „80 %" anzuzeigen wäre gefährlich.
  3. `[cmd]` **57 Nährstoffe tragen `NO_STANDALONE_REFERENCE`**, 21
     `NO_REFERENCE`. Beide sind kein „0 % gedeckt", sondern eine eigene
     Aussage.
  4. `[read]` **Die Referenzwerte gelten für gesunde Erwachsene in
     Ruhe.** 100 % Deckung heisst nicht „genug für dich" — ein
     Kraftsportler im Aufbau hat einen anderen Bedarf, und EFSA sagt
     dazu nichts.

  **Blockiert durch A-06** (Theme V1). `[cmd]` Und durch den Zustand von
  `foods/page.tsx`: 208 harte Farbwerte, **eine einzige
  Token-Verwendung**. Die Seite müsste vor oder mit dem Umbau auf Tokens
  gezogen werden — sonst bleibt sie im Hellmodus dunkel.

## Auftrag

**Die Tagesbilanz im Tagebuch.** `[read]` **Die
Mikronaehrstoff-Ansicht steht seit G-239** — dies ist die Ebene
darueber.

### Vorweg

`[read]` **Die Zahlen misst du.** `[cmd]` Seit dem 27.08. traegt ein
Auftrag keine Zahlen mehr vom Orchestrator. **Nenn die Abgrenzung
mit.**

`[read]` **Und lies zuerst die drei Quellen.** `[cmd]` **Der
massgebliche Mockup liegt in
`docs/spezifikation/10-plattform/design-system/theme-v1/`**, nicht im
`.js`-Ordner — `module-nutrition.jsx` und `module-nutrition-spec.jsx`.
`[read]` **Das habe ich am 28.08. selbst verwechselt und drei Stunden
im falschen Bestand gesucht.** `docs/spezifikation/00-QUELLEN.md`
sagt es je Modul.

`[cmd]` **Der `.js`-Mockup `DiaryView.js` traegt trotzdem etwas:**
*,,DEEP REBUILD — 5 meal slots (3 states), MacroRing CSS,
RemainingBar, MicroDashboard, WaterTracker, WeightTracker, 2-col"*.

### Die Datenlage

`[cmd]` **`nutrition.daily_summary` ist eine View mit 74 Spalten** —
je Naehrstoff ein Wert und ein `_missing`-Zaehler:

    enercc · prot625 · fat · cho · fibt · sugar · fasat · nacl
    water_g · vita · vitd · vite · vitk · thia · ribf · nia
    vitb6 · fol · vitb12 · vitc · na · k · ca · mg · p · fe · zn
    iodid · chorl · fapun3 · fapun6 · aae9 · leu
    f18_2cn6 · f18_3cn3
    dazu meal_count und item_count

`[read]` **Die `_missing`-Zaehler sind Regel 1 aus dem Befund:** steht
einer ueber null, ist die Summe unvollstaendig. **Die Oberflaeche darf
daraus keine Null machen.**

### Was zu bauen ist

**Die Tagesansicht: Mahlzeiten, Makros, was noch fehlt.**

`[read]` **Der Bewertungsteil ist gebaut** — `daily_reference_assessment`
und die Ansicht aus G-239. **Hier geht es um die Ebene davor:** was
wurde gegessen, wie steht der Tag.

`[cmd]` **Toms Bildschirmfoto vom 28.08. zeigt den Reiter *Diary*
bereits** — mit Kalorienring, Protein-, Kohlenhydrat- und Fettbalken
und *,,Smart suggestions"* als Attrappe. `[read]` **Miss zuerst, was
davon echt ist.**

### Was nicht zu tun ist

**Keine Bewertung nachbauen** — die steht in G-239.
**Keinen `WeightTracker`** — er gehoert laut **E-21** in den
taeglichen Checkin; im Tagebuch und Dashboard ist er moeglich, aber
nicht Teil dieses Auftrags.
**Keine Tabelle anlegen** — Codex arbeitet an G-245.
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    Mahlzeiten des Tages          aus `meals`, nicht erfunden
    Makros                        aus `daily_summary`
    `_missing` ueber null         sichtbar, keine Null
    Attrappen im Reiter           vorher / nachher
    Ladezeit                      ms, kalt und warm getrennt
    Bildschirmfoto je Zustand     `node tools/schuss.mjs`

`[read]` **Gegenprobe:** einen Tag ohne Mahlzeiten aufrufen. `[read]`
**Er muss sich von einem Tag unterscheiden, an dem gegessen und nichts
erfasst wurde** — falls die Daten das ueberhaupt hergeben. **Wenn
nicht, sag es.**

### Regeln

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
`[cmd]` **Der Dev-Server beendet sich von selbst** (G-205).
`[cmd]` **A-30:** kein Wert-Import aus dem Leseweg in eine
Browserdatei.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Bericht

**Die Praemisse stimmt zum groessten Teil nicht mehr** — Ring,
Makrobalken und Mahlzeiten sind seit G-03/C-03 echt. **Was fehlte,
war eine Unterscheidung, die die Gegenprobe des Auftrags genau
trifft:** ein leerer Tag und ein unfertiger Tag sahen gleich aus.

### Was ich zuerst gemessen habe

**Der Auftrag sagt: *„Miss zuerst, was davon echt ist."*** `[cmd]`
**Gemessen 2026-08-28 im Diary-Reiter:**

    Kalorienring           ECHT   daily_summary.enercc, Ziel aus
                                  goals.zielwerte_am, mit
                                  `incomplete`-Markierung
    Protein/KH/Fett        ECHT   dieselbe Quelle, mit „g left" und
                                  Prozentwert
    Weitere Makros (5)     ECHT   und sie zeigen bereits
                                  „N ohne Wert" je Zeile
    Mahlzeitenkarten       ECHT   `Mahlzeiten` liest aus `meals`,
                                  fuenf Slots wie die Vorlage
    Hydration              ECHT   `hydration-day-read`
    Mikro-Kacheln          ECHT   `mikro-read` (G-101)
    Smart suggestions      ATTRAPPE
    Nutrition score        ATTRAPPE
    Pending actions        ATTRAPPE
    PreWorkout Optimizer   ATTRAPPE

`[read]` **Vier der fuenf Attrappen sind die rechte Spalte** — sie
brauchen Daten, die es nicht gibt (Muster, Score, Buddy-TODO). **Sie
stehen nicht in diesem Zuschnitt** und tragen jede ihren Grund.

`[cmd]` **Die Datenlage stimmt wie beschrieben:**
`nutrition.daily_summary` hat **74 Spalten, davon 35
`_missing`-Zaehler** — nachgezaehlt gegen `information_schema`.

### Der Befund, der die Arbeit ausmacht

`[cmd]` **`ansicht.tsx:150` bildete den Leerzustand als:**

    const leer = !summe || summe.item_count === 0

`[read]` **Eine Bedingung fuer zwei verschiedene Lagen.** `[cmd]` Auf
dem Bildschirm gemessen, beide Tage zeigten denselben Satz *„Nichts
erfasst an diesem Tag"*:

    2026-01-15   keine Zeile in `daily_summary`, 0 Mahlzeiten
                 -> es wurde nie etwas angelegt
    2026-05-29   4 Mahlzeiten, 0 Positionen
                 -> es wurde gegessen und nichts erfasst

`[read]` **Das ist genau die Gegenprobe des Auftrags** — und die
Daten geben sie her, es war nur nicht sichtbar. `[read]` **Dieselbe
Klasse wie `begruendet_leer` gegen `nicht_bearbeitet` (G-208) und
`ohne_referenz` gegen `unvollstaendig` (G-239).**

`[read]` **Warum es zaehlt:** der falsche Satz schickt jemanden zum
Anlegen einer fuenften Mahlzeit, statt die vier vorhandenen zu
fuellen.

### Die Gegenprobe, nachher

`[cmd]` **Gemessen nach dem Umbau:**

    2026-01-15   „Nichts erfasst an diesem Tag."
                 „Für diesen Tag ist keine Mahlzeit angelegt."
    2026-05-29   „Mahlzeiten angelegt, aber nichts darin."
                 „4 Mahlzeiten stehen für diesen Tag, aber ohne
                  Lebensmittel. Die Tagessumme bleibt deshalb leer —
                  das ist keine Aussage über das, was du gegessen
                  hast."
    2026-05-31   kein Leerhinweis (erfasst)

`[read]` **Der Satz *„das ist keine Aussage"* ist der Kern** — ohne
ihn liest sich die leere Summe als *„nichts gegessen"*, und das
behaupten die Daten nicht.

### Regel 1: die Fehlzaehler

`[cmd]` **Der Ring trug die Unvollstaendigkeit schon als Markierung**
(`incomplete={(summe?.macros.enercc.missing ?? 0) > 0}`), **die fuenf
weiteren Makros je Zeile als *„N ohne Wert"*.** `[read]` **Was
fehlte: eine Zahl und ein Satz auf der Summenkarte** — und vor allem
die **Richtung** des Fehlers.

**Neu:** ein Hinweisfeld ueber dem Zielhinweis, das die betroffenen
Naehrstoffe nennt und sagt, dass die Summe **eher zu niedrig als zu
hoch** ist. `[read]` **Wer das nicht weiss, liest eine Unterdeckung,
wo eine Luecke steht.**

**Und ein Befund dazu, der gemeldet gehoert:**

`[cmd]` **Bei den vier Hauptmakros feuert auf dev KEIN Zaehler** —
0 von 181 Tagen. **Der Hinweis ist damit heute unsichtbar.**

`[cmd]` **Die Zaehler feuern anderswo:**

    vitc_missing      180 von 181 Tagen
    water_g_missing     3
    zn_missing          3
    fe_missing          1
    nacl_missing        0

`[cmd]` **Und der Leseweg laedt nur 9 der 35 Zaehler** —
`SUMMARY_MACROS` in `diary-summary.ts` fuehrt `enercc, prot625, fat,
cho, fibt, sugar, fasat, nacl, water_g`. **`vitc` und `fe` sind nicht
dabei**, also kann der Diary-Reiter ihre Luecken gar nicht zeigen.

`[read]` **Das ist kein Fehler dieses Auftrags, sondern seine
Grenze.** Die Bewertungsansicht aus G-239 zeigt die
Mikro-Fehlzaehler ueber `daily_reference_assessment` (dort 77
`incomplete`-Zeilen mit 407 fehlenden Positionen). **Wer den
Diary-Reiter um Mikro-Luecken erweitern will, muss `SUMMARY_MACROS`
erweitern — das ist ein eigener Punkt.**

`[read]` **Die Regel ist also nicht tot, sie trifft nur andere
Naehrstoffe als die, die dieser Reiter laedt.** Ein Waechter faellt,
wenn die Zaehler ignoriert werden.

### Was gebaut wurde

    neu   lib/nutrition/tageslage.ts            serverfrei, vier Zustaende
    neu   lib/nutrition/__tests__/…             15 Tests
    ger.  app/v2/nutrition/ansicht.tsx          Leerlagen getrennt,
                                                Luecken-Hinweis

`[read]` **Bewusst klein gehalten.** Ring, Balken, Mahlzeiten und
Hydration waren gebaut und richtig angebunden — **sie anzufassen
haette Arbeit erzeugt, aber nichts verbessert.**

`[cmd]` **`restVon()` liegt bereit und wird noch nicht benutzt** —
sie fasst Wert, Ziel, Rest und Unvollstaendigkeit zusammen. `[read]`
Die Anzeige rechnet den Rest heute inline; **ich habe sie nicht
umgestellt, weil das eine Aenderung ohne sichtbare Wirkung waere.**
Die Funktion ist getestet und steht fuer den naechsten Griff bereit.

### Was ich NICHT gebaut habe

**Keine Bewertung** — steht in G-239, ein Waechter prueft, dass
`tageslage.ts` `reference_*` nicht anfasst.
**Kein `WeightTracker`** — E-21, gehoert in den Checkin.
**Keine Tabelle** — G-245 gehoert Codex.
**Kein erfundenes Tagesziel:** `[cmd]` die Vorlage rechnet gegen ein
festes `target.kcal = 2700`. `[read]` **Das ist genau die Abweichung,
die der Kopfkommentar von `ansicht.tsx` festhaelt** — fehlt das Ziel,
bleibt der Rest `null`, und ein Test haelt das fest.

### Nachweisliste

    Mahlzeiten des Tages    [cmd] aus `meals`, war schon echt
    Makros                  [cmd] aus `daily_summary`, war schon echt
    `_missing` ueber null   [cmd] sichtbar, mit Richtung; auf dev bei
                                  den Hauptmakros 0 von 181 Tagen
    Attrappen im Reiter     [cmd] 5 vorher, 5 nachher — unveraendert
    Ladezeit                [cmd] kalt 3.886-4.756 ms, warm 2.837-2.895 ms
    Bildschirmfoto          [cmd] sechs Bilder, drei Zustaende vorher
                                  und nachher

### Waechter: sieben Sabotagen, sieben Ausfaelle

`[cmd]` Jede einzeln, Dateien danach byte-identisch (SHA-256):

    die zwei Leerlagen wieder zusammenwerfen        faellt
    der Satz verschweigt „keine Aussage"            faellt
    Fehlzaehler werden ignoriert                    faellt
    der Luecken-Satz nennt die Richtung nicht       faellt
    ohne Ziel wird ein Rest erfunden                faellt
    die Unvollstaendigkeit faellt aus dem Rest      faellt
    die Anzeige nimmt die alte Sammelbedingung      faellt

`[cmd]` **15 neue Tests, 212 im Nutrition-Modul gruen**, Typecheck
sauber, `serverimport-pruefen.mjs` 0 Treffer (A-30),
`encoding-pruefen.mjs` 20.577 Dateien sauber.

### Rueckbau

`[cmd]` **Nichts geschrieben.** `nutrition.meals` 2.895,
`meal_items` 9.051 — vor wie nach dem Auftrag. Nur gelesen, nicht
committet.

### Abgrenzung der Zahlen

**Alle Zahlen sind von mir gemessen**, am 2026-08-28 gegen die
laufende Datenbank und den laufenden Dev-Server.

`[cmd]` **Die Zahl des Auftrags stimmt:** `daily_summary` hat 74
Spalten. `[read]` **Der Befundtext oben sagt „70 Spalten, 24 Mikros"**
— das ist der Stand vom 2026-08-15 und heute ueberholt; **35
`_missing`-Zaehler sind es jetzt.**

`[read]` **Abgrenzung bei „Attrappen":** gezaehlt wird, was
`schuss.mjs` auf der gerenderten Seite findet (A-24), nicht
Textmarken im Quelltext. **5 vorher wie nachher** — ich habe keine
entfernt und keine hinzugefuegt.

`[read]` **Abgrenzung bei „Ladezeit":** drei Tage einzeln gemessen,
angemeldet, kalt und warm getrennt. **Die Spanne kommt von der
Datenmenge des Tages**, nicht vom Umbau: der leere Tag laedt
dieselben Abfragen wie der volle.

`[read]` **Abgrenzung bei „0 von 181 Tagen":** gezaehlt ueber
`daily_summary` fuer `dev@lumeos.app`, Bedingung
`enercc_missing > 0 or prot625_missing > 0 or fat_missing > 0 or
cho_missing > 0`. **Andere Naehrstoffe sind nicht mitgezaehlt** —
genau darum steht ihre Zahl daneben.

### Was ein eigener Punkt werden sollte

`[read]` **`SUMMARY_MACROS` um die Naehrstoffe erweitern, deren
Zaehler tatsaechlich feuern** (`vitc` an 180 von 181 Tagen). Dann
zeigt der Diary-Reiter Regel 1 auch dort, wo sie greift.

`[read]` **Die vier Attrappen der rechten Spalte** brauchen je eine
eigene Datengrundlage — Muster, Score, Buddy-TODO. **Vier Punkte,
nicht einer.**

## Abnahme

**2026-08-28, Orchestrator. Selbst gemessen.**

`[cmd]` **181 Tage, und die Fehlzaehler feuern wie berichtet:**

    vitc      180 von 181
    water_g     3
    zn          3
    fe          1
    enercc · prot625 · cho · fat    0

`[cmd]` **Genau ein Tag hat Mahlzeiten ohne Positionen** — der Fall,
den er auf dem Schirm gefunden hat.

### Der Befund ist besser als mein Auftrag

`[read]` **Meine Gegenprobe war eine Vermutung, seine Messung hat sie
belegt.** `[cmd]` `ansicht.tsx:150` bildete den Leerzustand als
`!summe || summe.item_count === 0` — **eine Bedingung fuer zwei
verschiedene Lagen.** 2026-01-15 (nie etwas angelegt) und 2026-05-29
(4 Mahlzeiten, 0 Positionen) zeigten denselben Satz.

`[read]` **Und die Begruendung ist die Folge, nicht die Aesthetik:**
*,,sonst schickt der Satz jemanden zum Anlegen einer fuenften
Mahlzeit statt zum Fuellen der vier vorhandenen."*

### Drei Grenzen, sauber gemeldet

`[cmd]` **Der neue Hinweis ist auf `dev` unsichtbar** — 0 von 181
Tagen bei den Hauptmakros. `[cmd]` **Der Leseweg laedt nur 9 von 35
Zaehlern**; `vitc` und `fe` sind nicht in `SUMMARY_MACROS`.

`[read]` *,,Die Regel ist nicht tot, sie trifft nur andere
Naehrstoffe als die, die dieser Reiter laedt."* **Das ist die
Unterscheidung, an der ich heute mehrfach gescheitert bin.** **Als
G-248 angelegt.**

`[read]` **`restVon()` gebaut, getestet, ungenutzt — und gesagt.**
*,,Eine Umstellung ohne sichtbare Wirkung habe ich mir gespart."*
**Lieber gemeldet als still eingebaut.**

`[cmd]` **Kein erfundenes Tagesziel:** die Vorlage rechnet gegen feste
2.700 kcal, hier bleibt der Rest null, wenn das Ziel fehlt — **mit
einem Test, der das festhaelt.**

### Die Praemisse stimmte wieder nicht

`[cmd]` **Ring, Makrobalken, Mahlzeitenkarten und Hydration sind seit
G-03/C-03 echt angebunden.** Der Ring trug die Unvollstaendigkeit
sogar bereits als Markierung. **Attrappe sind nur die vier Karten der
rechten Spalte**, die Daten brauchen, die es nicht gibt.

`[read]` **Zum wiederholten Mal hat ein Auftrag von mir etwas
bestellt, das schon da war** — und der Agent hat zuerst gemessen
statt zu bauen.

**Abgenommen.**

