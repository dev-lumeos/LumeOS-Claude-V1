# 152 — Filter, Nährstoffordnung, Diary und Insights (G-101)

**Stand:** 2026-08-20 · **Modul:** Nutrition · **Auftrag:** G-101

---

## Warum der Filter nicht griff

**Tom, 2026-08-20:** *„Addon-Filter wie proteinreich/lowcarb greifen
nicht in der Liste, die müssen auch funktionieren, wenn nichts gesucht
wird."*

`[cmd]` **Der Filter griff. Man sah es nur nicht.**

**Zuerst gemessen, in drei Schichten:**

| Schicht | ohne Suchbegriff | mit „reis" |
|---|---|---|
| `food_search` direkt | 7.140 → **1.400** | 145 → 17 |
| Route `/api/nutrition/foods` | 7.140 → **1.400** | 145 → 17 |
| Der Tab im Browser | Trefferzahl **1.400** | — |

`[cmd]` **Alle drei richtig.** Und die Liste wechselte auch: nach einem
Klick auf „Proteinreich" verschwinden **Avocado und Banane** aus den 50
Zeilen, Kürbiskern und Linse stehen oben.

### Was wirklich fehlte

`[cmd]` **Gemessen mit geschlossenem Filterband: das Wort
„Proteinreich" kommt auf der ganzen Seite NULL Mal vor.** Sichtbar
blieb nur eine kleine `1` am Knopf `Filters`.

`[read]` **Dazu die Verdeckung:** Das Filterband klappt zwischen
Kategoriepillen und Liste auf und schiebt die Trefferliste nach unten
— am Bildschirmfoto von 1440 px sichtbar: nach dem Klick beginnt die
erste Zeile erst bei rund zwei Dritteln der Seitenhöhe. Wer einen
Filter setzt, sieht die Änderung nicht sofort. **Kein gemessener
Pixelwert, sondern das, was das Foto zeigt.**

`[read]` **Beides zusammen ergibt genau Toms Satz.** Der zweite Teil
seines Befundes sagt es direkt: *„die angezeigte Liste filtermäßig
anzeigen."*

### Was gebaut wurde

**Eine Zeile über der Liste, mit dem Namen des Filters und einem
Weg-Knopf je Filter**, dazu „Alle aufheben".

`[cmd]` **Vorher/Nachher, gemessen mit geschlossenem Filterband:**

| | „Proteinreich" im HTML | Trefferzahl | Avocado in der Liste |
|---|---|---|---|
| vorher | **0×** | 1.400 | nein |
| nachher | **1×** (als Chip) | 1.400 | nein |

`[read]` **Die Liste war nie falsch — die Anzeige war stumm.** Deshalb
ändert sich an der Trefferzahl nichts; es kommt nur dazu, *wonach*
gefiltert wird.

---

## Wie die Nährstoffstufen dargestellt sind

`[cmd]` **`nutrient_defs` hat kein `parent_code`** — bestätigt. Die
Hierarchie steckt in `display_tier` (1–3) und `sort_index`.

`[cmd]` **138 Nährstoffe in 12 Gruppen, kein Eintrag ohne Stufe:**

| Gruppe | Einträge | Stufe 1 / 2 / 3 |
|---|---|---|
| Fettsäuren | 36 | 1 / 11 / 24 |
| Aminosäuren | 19 | 0 / 10 / 9 |
| Fettlösliche Vitamine | 17 | 4 / 8 / 5 |
| Elemente | 16 | 9 / 3 / 4 |
| Wasserlösliche Vitamine | 12 | 7 / 5 / 0 |
| **Kohlenhydrate** | **11** | **1 / 7 / 3** |
| Makronährstoffe | 9 | 6 / 3 / 0 |
| Ballaststoffe | 6 | 0 / 0 / 6 |
| Organische Säuren | 5 | 0 / 0 / 5 |
| Zuckeralkohole | 3 | 0 / 0 / 3 |
| Energie | 2 | 2 / 0 / 0 |
| Sonstige | 2 | 1 / 0 / 1 |

### Warum „zeigt nur added sugar"

`[cmd]` **Die Stufen wurden nicht falsch ausgewertet — die v2-Oberfläche
las sie nie.** `display_tier` kommt in `apps/web/src/app/v2/` an
**keiner Stelle** vor.

`[cmd]` **Berichtigung einer eigenen ersten Aussage:** Ich schrieb
zuerst „in `apps/web` nirgends" — das ist falsch. Die Spalte wird
**neunmal** gelesen, aber ausschliesslich in der älteren Fläche
`/nutrition/local-schema` (u. a. `nutrient-pin-compare.ts`,
`local-schema-debug.ts`). **Dort war die Ordnung also längst bekannt;
in die v2-Oberfläche ist sie nie gekommen.**

`[cmd]` **Was stattdessen dastand:** `nutrient-baum.ts` — eine feste
Liste mit **79 erfundenen Einträgen in 8 Gruppen**, die Zahlen eines
fiktiven Athleten (Energy 1847, Water 1.2 L). Die Gruppennamen
(`Macronutrients`, `Bioactives`) **gibt es in der Datenbank nicht**,
und `parent` war eine eigene Erfindung des Entwurfs.

`[cmd]` **Die Oberfläche schrieb „79 nutrients tracked"**, während der
Tab-Zähler daneben 138 sagte.

### Die Falle beim Bauen

`[cmd]` **Der Elternknoten steht NACH seinen Kindern.** Bei den
Kohlenhydraten hat `SUGAR` die Stufe 1, aber `sort_index` **73** — die
Kinder beginnen bei 65.

`[read]` Ein einziger Durchlauf nach dem Muster „der letzte flachere
Knoten ist der Vater" hätte **die ersten sechs Kinder verloren**.
Deshalb zwei Durchläufe; **fünf Tests halten es fest.**

`[cmd]` **Gerendert belegt — alle elf Kohlenhydrate mit ihrer
Einrückung:**

```
Zucker, gesamt          SUGAR    Stufe 1    56,9 g
└ Monosaccharide        MNSAC    Stufe 2
└ Glucose               GLUS     Stufe 2
└ Fructose              FRUS     Stufe 2
   └ Galactose          GALS     Stufe 3
└ Disaccharide          DISAC    Stufe 2
└ Saccharose            SUCS     Stufe 2
   └ Maltose            MALS     Stufe 3
└ Lactose               LACS     Stufe 2
└ Oligosaccharide       OLSAC    Stufe 3
└ Stärke                STARCH   Stufe 2
```

`[read]` **Gruppen ohne Stufe 1 bleiben flach** — Ballaststoffe,
Zuckeralkohole und Organische Säuren haben nur Stufe 3. Es gibt keinen
Sammelbegriff dafür, und einer wird auch nicht erfunden.

`[cmd]` **Und die ehrliche Zahl steht dabei: 33 von 138** tragen für
diesen Tag einen Wert. `daily_summary` führt 28 Mikronährstoffe als
Spalten, nicht alle 138.

---

## Was Diary und Insights jetzt zeigen

### Micronutrient snapshot und Below threshold

`[cmd]` **Der Auftrag nannte den Namen falsch — aber anders als
vermutet.** Beides existiert:

| | |
|---|---|
| `micronutrient_overview_items` | **Konfigurationstabelle**, 8 Zeilen: welche Nährstoffe, in welcher Reihenfolge |
| `micronutrient_snapshot(user, datum)` | **Funktion**, füllt daraus die Kachel |
| `micronutrient_below_threshold(user, datum, pct)` | **Funktion**, die zweite Kachel |

`[cmd]` **Gemessen für `dev` am 2026-08-20:**

| Nährstoff | Wert | Referenz | Art | Anteil |
|---|---|---|---|---|
| Vitamin C | 190,5 mg | 110 mg | PRI | **—** |
| Vitamin D | 19,6 µg | 15 µg | AI | 131 % |
| Eisen | 15,1 mg | 11 mg | PRI | 137 % |
| Calcium | 732,9 mg | 950 mg | PRI | 77 % |
| Magnesium | 506,2 mg | 350 mg | AI | 145 % |
| Zink | 12,1 mg | 7,5 mg | PRI | 161 % |
| Vitamin B12 | 22,4 µg | 4 µg | AI | 559 % |
| Omega-3 (ALA) | 2,0 g | 1,4 g | GOAL | 141 % |

`[read]` **Vitamin C zeigt bewusst keinen Prozentwert.** Die Funktion
meldet `reference_status = incomplete`; die Kachel schreibt
*„Tagessumme unvollständig — kein Anteil ausweisbar"* statt einer
Zahl.

`[cmd]` **Below threshold: 3 von 21 geprüften** unter 80 % — Salz
(54,3 %), Wasser (63,1 %), Calcium (77,2 %).

`[read]` **Zwei Abweichungen vom Entwurf, beide bewusst:**

1. `[cmd]` Der Entwurf schreibt **„3 of 117"**. Echt sind es **3 von
   21** — nur so viele haben für diesen Tag einen Wert *und* eine
   Referenz. **Die Kachel sagt beides.**
2. `[cmd]` Der Entwurf färbt alle Balken `warn`. `[read]` **Eine
   Warnfarbe ist ein Urteil.** Hier steht die Modulfarbe, und der Satz
   darunter nennt die 80 % eine **Anzeigegrenze, keine medizinische**.

### Hydration

`[cmd]` **Der Schreibweg lag vollständig vor** — `/api/nutrition/water`,
`addWaterLog`, 361 Einträge über 315,1 Liter. Es gab nur **einen**
Knopf, und der trug 250 ml aus `WATER_QUICK_AMOUNTS_ML`.

`[cmd]` **Jetzt: 100 / 250 / 500 ml plus freie Eingabe.** Gegen die
Route geprüft — alle vier schreiben, HTTP 201, die Summe wächst:

```
vorher : 2 Einträge, 1.750 ml
  +100 ml (quick_add) → total 3.427,1
  +250 ml (quick_add) → total 3.677,1
  +500 ml (quick_add) → total 4.177,1
  +333 ml (manual)    → total 4.510,1
nachher: 6 Einträge, 2.933 ml
danach : 2 Einträge, 1.750 ml   (Testdaten wieder entfernt)
```

`[read]` **`WATER_QUICK_AMOUNTS_ML` bleibt unangetastet** — die
Konstante kommt aus SPEC_04 (`[250, 500, 750, 1000]`) und wird
anderswo gelesen. Toms Mengen stehen als eigene Liste in der Kachel;
eine geteilte Konstante für zwei verschiedene Absichten wäre die
schlechtere Lösung.

### Insights

`[cmd]` **Calorie balance, 14 Tage:** Zufuhr **2.487,4 kcal**,
Verbrauch **2.534,8**, Abstand **−47,4 kcal je Tag**, Gewicht
**−0,08 kg**, Konfidenz **hoch**, 14 von 14 Tagen vollständig.

`[read]` Der Auftrag nennt −55 kcal (C-122) — die Zahl bewegt sich mit
den Tagen, deshalb steht der Stichtag dabei.

`[cmd]` **`alpha = 1,0` wird angezeigt**, nicht verschwiegen (GO-15).

`[cmd]` **Macro split, 14 Tage:** 27,7 % / 47,6 % / 24,7 % bei 166 /
285 / 66 g.

`[read]` **Ohne Zielverteilung.** Der Entwurf schreibt *„Target ratio:
28 / 47 / 25"* — **diese Zahlen sind nirgends entschieden.**
`goals.zielwerte_am` führt Gramm je Makro, keine Quote; daraus eine
Sollverteilung zu rechnen wäre eine eigene Erfindung.

`[cmd]` **Bemerkenswert:** der gemessene Schnitt liegt sehr nah an der
erfundenen Zahl. **Das macht sie nicht zum Ziel** — es heisst nur, dass
der Entwurf plausibel geraten hat.

`[cmd]` **Die Anteile sind auf die Summe der drei bezogen**, nicht auf
`enercc` — Alkohol und Ballaststoffe tragen ebenfalls Energie. Gegen
`enercc` gerechnet fehlten Prozentpunkte, ohne dass die Anzeige sagen
könnte, wo. **Fünf Tests halten die Rechnung fest.**

---

## Was fehlt

**1. Micronutrient trend — nicht gebaut, und der Grund ist messbar.**

`[cmd]` Die Werte **liegen je Tag vor**: `daily_summary` führt 28
Mikronährstoffe als Spalten. Ein Trend wäre also rechenbar.

`[cmd]` **Was fehlt, ist die Referenz je Tag.** Die persönliche
Empfehlung kommt aus `daily_reference_assessment`, und die rechnet
**einen Tag auf einmal**. Ein Trend über 30 Tage bräuchte 30 Aufrufe je
Seitenaufruf.

`[read]` **Das ist eine Entscheidung, keine fehlende Spalte** — als
Befund aufgenommen (G-107).

**2. Der Nutrients-Tab hat seine Filter noch nicht.** `[cmd]` Der
Entwurf zeigt `Today · 7d avg · 30d avg · 90d avg` und `All · Out of
range · Deficient only`. **Die Zeiträume scheitern an derselben Sache
wie der Trend**; „Out of range" bräuchte je Nährstoff die persönliche
Referenz. Die Ordnung steht jetzt — die Filter sind der nächste
Schritt (G-108).

**3. Vier Diary-Kacheln bleiben Attrappe** (7 → 5 gerendert): Smart
suggestions, Nutrition score, Pending actions, Pre-workout window.
Nicht Teil dieses Auftrags.

**4. Der Entwurfsbaum `nutrient-baum.ts` steht weiter da** — 465
Zeilen mit 79 erfundenen Einträgen. `[cmd]` **Er hat zwei Aufrufer:**
`nutrients-entwurf.tsx` (der Rückfall, wenn die echte Ordnung nicht
gelesen werden konnte) und `v2-attrappen.test.ts`. **Also kein toter
Code** — aber im Regelbetrieb wird er nicht mehr gezeigt.

---

## Nachweis

`[cmd]` **434 Tests grün** (vorher 424 — 10 neue), Typecheck sauber,
`pnpm --filter @lumeos/web build` erfolgreich.

`[read]` Das Gate als Ganzes bleibt rot an `apps/coach` (Fable) — wie
im Auftrag vermerkt.

`[cmd]` **Attrappen gerendert gezählt (A-24):**

| Seite | vorher | nachher |
|---|---|---|
| **Diary** | **7** | **5** |
| Nutrients | — | **1** |
| Insights | — | **4** |
| Food DB | — | **1** |

`[cmd]` **Zeilenschutz:** `test-user@lumeos.local` sieht auf Diary,
Insights und Nutrients **keinen einzigen** der Werte von `dev` —
Vitamin D, Calcium, Wasser, Zufuhr: alle 0 Treffer. **Der
Nährstoffkatalog ist geteilt** (138 für beide, wie die
Lebensmitteldatenbank), **die messbaren Werte nicht: 33 gegen 0.**

`[cmd]` **Bildschirmfotos** über `tools/schuss.mjs`, headless: Diary,
Nutrients, Insights und Food DB, je 1440 und 375 px, hell und dunkel.
**Zwei Konsolenfehler** an jeder Breite — die Hydrationswarnung des
Rahmens, nicht aus dieser Arbeit.

### Ein Werkzeug erweitert

`[cmd]` **`tools/schuss.mjs` um `--zaehle` und `--zaehleSel`.** `[read]`
Die Wortliste war seit G-13 **fest verdrahtet** und trug die Begriffe
eines einzelnen Auftrags; jetzt sagt der Aufrufer, was er nachgezählt
haben will. **Genau damit ist der Filterbefund belegt worden.**

### Der Dev-Server hing wieder

`[cmd]` **Zum zweiten Mal an einem Tag** kompilierte er eine geänderte
Route nicht neu — diesmal `/v2/nutrition?tab=insights`.

`[cmd]` **Ursache zuerst geprüft, wie Tom es vorgibt:** kein fremdes
Build-Verzeichnis, `.next-gate` (18:10) sauber getrennt von `.next`
(17:32). **Der Watcher hing, nicht die Trennung.** Beendet und neu
gestartet, `.next` nicht gelöscht; danach stand die Seite beim ersten
Aufruf.

`[read]` **Das ist inzwischen ein Muster** — als Befund aufgenommen
(G-109).

---

## Geänderte und neue Dateien

| Datei | Was |
|---|---|
| `lib/nutrition/mikro-read.ts` | **neu** — beide Mikronährstoff-Funktionen |
| `lib/nutrition/naehrstoff-ordnung.ts` | **neu** — 138 Nährstoffe aus `display_tier` |
| `lib/nutrition/insights-read.ts` | **neu** — Bilanz und Makroschnitt |
| `v2/nutrition/mikro-kacheln.tsx` | **neu** — die zwei Diary-Kacheln |
| `v2/nutrition/naehrstoff-ordnung-tab.tsx` | **neu** — der Baum mit Stufen |
| `v2/nutrition/insights-echt.tsx` | **neu** — zwei Insights-Kacheln |
| `__tests__/naehrstoff-ordnung.test.ts` | **neu** — 5 Tests auf den Baum |
| `__tests__/insights-read.test.ts` | **neu** — 5 Tests auf die Anteile |
| `v2/nutrition/tab-foods.tsx` | Filterchips über der Liste |
| `v2/nutrition/hydration.tsx` | 100/250/500 ml plus freie Eingabe |
| `v2/nutrition/ansicht.tsx`, `page.tsx` | drei Lesepfade durchgereicht |
| `tools/schuss.mjs` | `--zaehle`, `--zaehleSel` |

**Nicht angefasst:** `packages/ui`, `apps/coach`, `supabase/`,
`tab-prefs.tsx`, `tab-planner-echt.tsx`, `nutrient-baum.ts`,
`diary-entwurf.tsx`.

---

## Neue Befunde

1. **G-107 — Der Mikronährstoff-Trend braucht eine Referenz je Tag.**
   Werte liegen vor (28 Spalten in `daily_summary`), aber
   `daily_reference_assessment` rechnet einen Tag auf einmal.
2. **G-108 — Die Filter des Nutrients-Tabs** (`7d/30d/90d`, „Out of
   range") hängen an derselben Frage.
3. **G-109 — Der Dev-Server hängt wiederholt.** Zweimal an einem Tag
   kompilierte er geänderte Routen nicht neu, ohne dass die
   `.next`-Trennung verletzt war. **Ein Neustart je Vorfall kostet
   Zeit; die Ursache ist nicht gefunden.**
4. **Der Entwurfsbaum `nutrient-baum.ts`** (465 Zeilen, 79 erfundene
   Einträge) wird im Regelbetrieb nicht mehr gezeigt, hat aber zwei
   Aufrufer — als **Rückfall markieren**, nicht löschen.
5. **`display_tier` war in `/nutrition/local-schema` längst in
   Gebrauch** (9 Dateien), in der v2-Oberfläche nie. **Zwei Flächen
   für dieselben Daten** — wer die alte ablöst, hat die Ordnung dort
   schon fertig.
