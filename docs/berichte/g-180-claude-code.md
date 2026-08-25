# G-180 — Claude Code, 2026-08-25

Auftrag: `docs/auftraege/g-180-claude-code.md` (mit Nachtrag „Wie es
aussehen soll")

**Aus dem Modal ist ein Ausklappen unter der Zeile geworden.** Reiter
begrenzen die Hoehe, die Kaesten haben eigene Flaeche, die Formen sind
Karten.

Nicht committet, nicht gestaged, nicht gepusht.

---

## 1 · KEIN MODAL MEHR

**Tom:** *„wieso modal und nicht gleich pulldown unter dem gewaehlten
eintrag?"*

`[read]` **Es gab keinen Grund** — dort stand eines, weil dort schon
eines stand. `[cmd]` **315 Zeilen `SubstanzModal` sind entfernt**, der
Inhalt lebt in `substanz-tafel.tsx` als zweite `<tr>` unter der
gewaehlten Zeile.

**Die Begruendung steht im Dateikopf von `substanz-tafel.tsx`**, wie
verlangt — damit daraus nicht beim naechsten Umbau wieder ein Modal
wird:

- Der Platz in der Liste bleibt sichtbar.
- Zwei Substanzen lassen sich nacheinander aufklappen und vergleichen.
- Auf dem Telefon ist ein Overlay fast immer schlechter.
- Kein Schliessen-Knopf, den man suchen muss — der zweite Klick
  schliesst.

`[cmd]` **Gemessen: 0 Dialoge im DOM** bei allen fuenf Bildern.

## 2 · DIE HOEHE — Punkt 6, und er entschied den Rest

`[cmd]` **Zuerst gemessen, dann gebaut** (2026-08-25, 1440×1100):

    Fenster                  1100 px
    Rollbehaelter             660 px   (60vh)
    Zeile zugeklappt           54 px
    Liste gesamt           17.044 px

`[read]` **Damit war das Budget vorgegeben, nicht waehlbar:** rund
**560 px** fuer den Inhalt. **Alle Bereiche untereinander waeren ueber
900** — die Zeile waere hoeher als ihr eigener Behaelter. **Genau
deshalb Reiter.**

**Gemessen nach dem Bau:**

| Bild | Zeilenhoehe | Behaelter |
|---|---|---|
| Creatine, Überblick | **396 px** | 660 |
| Creatine, Sicherheit | **372 px** | 660 |
| 1-Testosterone (Enhanced) | **552 px** | 660 |
| Magnesium (7 Formen) | **288 px** | 660 |

**Keine ueberschreitet eine Bildschirmhoehe.**

### Und die Listendarstellung — zusammen entschieden

`[read]` **Keine Virtualisierung.** `[cmd]` 318 Zeilen kosten 4.713
DOM-Knoten und laden nicht langsamer (G-176, gemessen). Eine
virtualisierte Liste mit wachsenden Zeilen variabler Hoehe waere
deutlich mehr Aufwand — und loeste ein Problem, das die Messung nicht
zeigt.

**Zusammen entschieden, wie verlangt:** die Reiter begrenzen die Hoehe,
die Liste bleibt vollstaendig im DOM. **Nicht nacheinander, nicht
zweimal gebaut.**

## 3 · FLAECHE, NICHT NUR REIHENFOLGE

`[read]` Der Nachtrag ist der Kern: *„Fettdruck plus Absatz ist kein
Kasten."* Umgesetzt in `supplements.css`, nicht als Inline-Stil:

| Bereich | eigener Grund | eigene Kante | eigener Innenabstand |
|---|---|---|---|
| „Auf einen Blick" | `--surface` | ja | 9/11 px |
| „Bei zu viel" | `--warn` 7 % | `--warn` 34 % | 9/11 px |
| Warnkasten (Enhanced) | `--warn` 7 % | `--warn` 34 % | 9/11 px |
| Laborbezug | `--surface` | ja | 9/11 px |
| Formkarten | `--surface` | ja | 9/11 px |

**Zeile je Angabe mit Trennlinie, Wert rechtsbuendig und groesser:**
`13 px / 600` gegen `11,5 px` der Beschriftung, dazu
`tabular-nums`. `[read]` **„3-5 g/day" ist ablesbar, ohne den Satz
davor zu lesen** — das war die Vorgabe.

**Die Formkarten tragen den farbigen Gradpunkt rechts oben** (A/B
gruen, C neutral, D–F warnend). `[read]` **Das unterscheidet eine
Karte von einer Zeile.**

### Die zwei Mockup-Fehler sind NICHT uebernommen

`[cmd]` **Keine „Ashwagandha-Gruppe" in der Unterzeile** — dort steht
die Kategorie, wie sie in `supplement_categories` liegt.

`[cmd]` **Keine erfundene „Obergrenze 250 mg"** — die Werte kommen aus
`supplement_dosing`. Wo keine Obergrenze hinterlegt ist, **entfaellt
die Zeile** (Obergrenze: 38 von 318).

## 4 · DIE REITER

**Überblick · Dosierung · Sicherheit · Formen · Fragen**, jeder mit
seiner Zahl, wo es eine gibt — **und ein Reiter ohne Inhalt erscheint
nicht.**

`[read]` **Die Logik steht serverfrei in `substanz-reiter.ts`**, damit
sie ohne Browser pruefbar ist — dasselbe Muster wie
`substanz-luecken.ts` (C-252).

**Gemessen an den Bildern:**

| Substanz | Reiter |
|---|---|
| Creatine monohydrate | Überblick · Dosierung · Sicherheit · **Fragen 6** — **kein Formen** |
| 1-Testosterone | Überblick · Dosierung · Sicherheit · **Fragen 4** |
| Magnesium | **nur Formen · 7** — keine Reiterleiste, weil nur einer |

`[read]` **Der erste vorhandene Reiter ist offen, nicht ein fester.**
Bei den 15 Sammeleintraegen ohne Textzeile waere „Überblick" eine
leere Flaeche.

## 5 · ENHANCED — und der Kasten ist inzwischen gefuellt

`[cmd]` **Beim Start des Auftrags standen `irreversibel_de`,
`ueberwachung_de` und `reinheit_de` bei 0 von 290.** Gebaut und per
Test belegt, wie verlangt.

`[cmd]` **Waehrend des Laufs ist C-266 durchgelaufen:**
**irreversibel 112 · ueberwachung 96 · reinheit 134.** Damit ist der
Kasten jetzt **auch am Bild** belegt (`backup/g180-4-enhanced.png`):

    WAS NICHT ZURÜCKKOMMT   in Warnfarbe, ganz oben
    Überwachung             Nicht dokumentiert. Klassenüblich wären
                            Blutfette, Blutdruck, Hormonstatus, PSA
    Reinheit                Nach dem Verbot stammt alle Ware aus dem
                            Untergrund …

`[read]` **Reinheit steht direkt neben Überwachung**, dort wo sonst die
Menge stuende — nicht drei Bloecke weiter.

---

## NACHWEIS

### Gegenprobe, namentlich

| Substanz | `zu_wenig_de` | erwartet | gemessen |
|---|---|---|---|
| **Creatine monohydrate** | leer | zeigt **kein** „Zu wenig" | ✔ nein |
| **Beta-carotene** | gefuellt | zeigt „Zu wenig" | ✔ JA |

### Negativprobe — und der erste Anlauf hatte eine Luecke

| Eingriff | vorher | mit Fehler | zurueck |
|---|---|---|---|
| Formen-Reiter auch ohne Formen | 10/0 | **4/6** | 10/0 |
| Leerpruefung faellt weg | 10/0 | **3/7** | 10/0 |
| **Hoehenbremse entfernt** | 10/0 | **10/0 — GRUEN** | — |

`[read]` **Der dritte Eingriff blieb gruen: nichts bewachte die
`max-height`.** Ohne sie waechst eine Zeile mit vielen Fragen ueber
ihren Behaelter, und der Tabellenkopf scrollt aus dem Bild — **genau
der Fehler, den Punkt 6 verhindern soll.**

`[cmd]` **Pruefung nachgezogen, dann gegengeprobt: 10/0 → 9/1 → 10/0**,
Datei byteweise identisch.

### Stand

`[cmd]` `tsc` **sauber** · Build **`Compiled successfully`** · Tests
**197 pass, 0 fail** · `serverimport` **50 Chunks, 0 Treffer** ·
`sprachrueckfall` **0 Funde** · Katalog **2.993 ms**.

**Bilder:** `g180-1-liste.png` · `g180-2-offen.png` ·
`g180-3-reiter.png` · `g180-4-enhanced.png` · `g180-5-formen.png` ·
`g180-katalog.png`

---

## GEAENDERT

| Datei | |
|---|---|
| `lib/supplements/substanz-reiter.ts` | **neu** — welche Reiter, serverfrei |
| `v2/supplements/substanz-tafel.tsx` | **neu** — die Tafel, Kaesten, Begruendung |
| `v2/supplements/substanz-detail.tsx` | Modal raus (315 Zeilen), Ausklappzeile rein |
| `v2/supplements/substanz-abschnitte.tsx` | `Formen` mit Rastermodus und Gradpunkt |
| `v2/supplements/supplements.css` | die Flaeche: Kaesten, Reiter, Karten |
| `__tests__/substanz-reiter.test.ts` | **neu**, 10 Faelle |
| `__tests__/deutsch-und-scroll.test.ts` | Hoehenbremse + „ein Bereich" |
| `__tests__/substanz-kategorien.test.ts` | C-229-Waechter auf die neue Mechanik |
| `tools/_g180-bilder.mjs` | **neu** |

`[read]` **Zwei Waechter mussten umgeschrieben werden**, weil sie das
Modal pruefen: *„jeder Block startet ZU"* haengte an `<Klappe` und
`startOffen()`. **Die Regel dahinter — Toms *„zusatzinfos nur auf
Wunsch"* — gilt unveraendert** und wird jetzt an der Ausklappzeile
geprueft: nichts ist offen, bis jemand klickt.

**Keine Texte geaendert.** `supabase/_pipeline/` nicht angefasst.

## OFFEN

1. **Die Listenzeile zeigt noch die alte Schablone** — *„… ist eine
   Supplement-Substanz mit eigener Beleglage"* aus `description`.
   `[read]` Die Nutzertexte haetten dort mehr zu sagen (`kurz_was_de`);
   das ist ein eigener Punkt, nicht Teil dieses Auftrags.
2. **28 der 318 Eintraege haben keine Nutzertextzeile**, darunter alle
   15 Sammeleintraege. Sie zeigen nur „Formen" oder den Hinweis, dass
   nichts vorliegt.
3. **`mythen_de` ist bei 127 von 290 ein JSON-Array in einer
   `text`-Spalte** (aus G-179). Die Anzeige faengt es ab; sauber waere
   es im Import.
