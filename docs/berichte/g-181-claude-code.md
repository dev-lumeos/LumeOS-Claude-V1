# G-181 — Claude Code, 2026-08-25

Auftrag: `docs/auftraege/g-181-claude-code.md`

**Sechs Punkte, fuenf davon wie beschrieben umgesetzt.** Bei Punkt 2
geht die Vorgabe nicht auf — **die Wirkungszahl steht bei 278 von 290
nicht im Text**, und die Treffer sind zum Teil das Gegenteil einer
Wirkung. Gemeldet, nicht passend gemacht.

Nicht committet, nicht gestaged, nicht gepusht.

---

## 2 · DIE WIRKUNGSKACHEL — hier geht die Vorgabe nicht auf

`[cmd]` **Gemessen 2026-08-25 ueber alle 290 Nutzertexte:**

    was_bringt_es_de mit Text            290
    davon mit IRGENDEINER Prozentzahl     18
    davon mit Prozent-BEREICH             12

`[read]` **Bei 278 von 290 gibt es keine Zahl zu zeigen.** Die Texte
beschreiben die Studienlage, nicht Effektgroessen — *„Unabhaengige
Studien mit belastbaren Effektgroessen fehlen."*

`[cmd]` **Und die 12 Treffer sind zum Teil irrefuehrend:**

| Substanz | Regex faende | was es wirklich ist |
|---|---|---|
| Beta-Carotin | 18–28 % | **Risikoerhoehung bei Rauchern** |
| BPC-157 | 60–70 % | **Heilungsrate bei Ratten** — Text: „beim Menschen weiss es niemand" |
| TB-500 | 60–70 % | ebenso, **keine Humanstudien** |
| Ca-AKG | 10–15 % | **Lebensdauer bei Maeusen** |
| Kreatin | 5–15 % | **richtig** |
| Koffein | 2–4 % | **richtig** |

`[read]` **Eine Regex haette „60–70 %" als Wirkung von BPC-157
gezeigt** — neben einem Text, der ausdruecklich sagt, dass es beim
Menschen niemand weiss. **Das ist die erfundene Zahl, die der Auftrag
verbietet, nur mit einem Automaten davor.**

**Geloest ueber eine gepflegte Liste** (`substanz-kacheln.ts`,
`WIRKUNG`): fuenf Eintraege, jede Zahl steht so im Text derselben
Substanz. **Was nicht drinsteht, bekommt keine Kachel.**

`[cmd]` **Ein Waechter haelt das fest:** wer Beta-Carotin einträgt,
macht den Test rot (gegengeprobt, siehe unten).

---

## DIE UEBRIGEN FUENF PUNKTE

### 1 · Die Tafel hebt sich ab

- anderer Grund: `color-mix(in oklch, var(--acc) 4%, var(--bg-elev))`
- **durchgehende Akzentkante links** ueber Zeile und Tafel
- **Nachbarzeilen auf `opacity: 0.55`**, solange eine Tafel offen ist —
  beim Ueberfahren wieder voll

### 2 · Zahlenkacheln statt Tabellenzeile

`[cmd]` **Kreatin: vier Kacheln** — Beleglage **A** *sehr gut belegt* ·
Übliche Menge **3-5 g/day** · Wirkung **5–15 %** *mehr
Maximalleistung* · WADA **erlaubt** *nicht auf der Liste*.

**Kachel ohne Wert entfaellt.** `[cmd]` Gemessen ueber die 318:
Beleglage 290 · Menge 83 · WADA 290 · Wirkung 5.

### 3 · Feste Breiten — gemessen bei 1280 UND 1920

| | 1280 | 1920 |
|---|---|---|
| Zahlenkacheln | **196 · 196 · 196 · 196** | **196 · 196 · 196 · 196** |
| Textkacheln | 378 · 378 | **520 · 520** (max-width) |
| erster Satz | 620 | 620 |
| **laengste Zeile** | **87 Zeichen** | **87 Zeichen** |

`[cmd]` **Keine Kachel ist bei 1920 breiter als bei 1280** — die
Zahlenkacheln sind pixelgleich, die Textkacheln stossen an ihre
`max-width`. **Bleibt Platz uebrig, bleibt er leer.**

`[cmd]` **Der erste Anlauf war zu breit:** mit `max-width: 720px` ergab
der erste Satz **104 Zeichen** — ueber der 90er Grenze. Auf 620 px
korrigiert, jetzt 87.

### 4 · Textkacheln statt Fliesstext

*„Wie es wirkt"* und *„Was es bringt"* stehen nebeneinander, je mit
Symbol (`zap` / `trend_up`) und Farbakzent. **Eine Kachel ohne Inhalt
erscheint nicht.**

### 5 · Die Listenzeile liest `kurz_was_de`

`[cmd]` **Schablonenzeilen: 103 → 12.** Die verbliebenen 12 sind genau
die Sammelnamen ohne eigene Nutzertextzeile — **der dokumentierte
Rueckfall**, nicht ein Rest.

    vorher   Creatine monohydrate ist eine Supplement-Substanz mit
             eigener Beleglage und eigenen Grenzen.
    jetzt    Unter allen Kreatin-Formen ist das einfache Monohydrat
             das am besten untersuchte – und gleichzeitig das
             billigste.

### 6 · Die drei kleinen Punkte

**a)** Das **X** erscheint, sobald etwas im Suchfeld steht.

**b)** **„Alle" als erster Eintrag** in beiden Filterebenen — Gruppe
(mit Gesamtzahl) und Kategorie. `[read]` Bis hierher war das Abwaehlen
des aktiven Knopfes der einzige Weg zurueck; man musste sich merken,
welcher gedrueckt war.

**c)** **Liste und Hoehenbremse zusammen auf `vh` umgestellt** —
`calc(100vh - 300px)` und `calc(100vh - 420px)`.

`[cmd]` **Gemessen:** bei 1100 px Fensterhoehe ist die Liste **800 px**
(vorher fest 660), bei **720 px Fenster** sind es **420 px**.

`[read]` **Warum zusammen:** die feste `460px` der Tafelbremse war
gegen die festen 660 px des Behaelters gerechnet. Waechst der
Behaelter und die Bremse nicht, bleibt die Tafel klein, waehrend
darunter Platz frei steht — **die Bremse waere keine Begrenzung mehr,
sondern eine Verkleinerung.**

---

## NACHWEIS

### Gegenprobe, namentlich

| Substanz | erwartet | gemessen |
|---|---|---|
| **Creatine monohydrate** | vier Kacheln | **4** ✔ |
| **1-Testosterone** (`sub_906d55f873`) | keine Menge, keine Wirkungszahl → zwei | **2** ✔ |
| **Ashwagandha (KSM-66)** | faellt in der Liste auf `description` zurueck | ✔ |

`[cmd]` **Ashwagandha zeigt 0 Kacheln** — es hat weder Grad noch
WADA-Zeile noch Formen (gemessen). `[read]` **Das ist richtig, nicht
fehlend:** eine Kachel zu erfinden waere genau das, was der Auftrag
verbietet.

### Negativprobe — vier Eingriffe, alle rot

| Eingriff | vorher | mit Fehler | zurueck |
|---|---|---|---|
| `max-width` der Textkachel entfernt | 12/0 | **11/1** | 12/0 |
| feste Breite der Zahlenkachel entfernt | 12/0 | **11/1** | 12/0 |
| Hoehenbremse wieder fest statt `vh` | 12/0 | **11/1** | 12/0 |
| **Beta-Carotin bekommt eine Wirkungskachel** | 9/0 | **8/1** | 9/0 |

**Alle Dateien byteweise identisch zurueck.**

`[read]` **Der vierte Eingriff ist der wichtigste:** er haelt fest,
dass eine Prozentzahl, die keine Leistungswirkung ist, keine Kachel
bekommt — **die Regel, an der Punkt 2 haengt.**

### Stand

`[cmd]` `tsc` **sauber** · Build **`Compiled successfully`** · Tests
**208 pass, 0 fail** · `serverimport` **50 Chunks, 0 Treffer** ·
`sprachrueckfall` **0 Funde**.

**Bilder:** `g181-1-liste.png` · `g181-2-tafel-1280.png` ·
`g181-3-tafel-1920.png` · `g181-4-enhanced.png` · `g181-5-klein.png`

---

## GEAENDERT

| Datei | |
|---|---|
| `lib/supplements/substanz-kacheln.ts` | **neu** — Kacheln, `WIRKUNG`-Liste |
| `lib/supplements/substanz-read.ts` | Listenzeile liest `kurz_was_de` |
| `v2/supplements/substanz-tafel.tsx` | `Zahlenkacheln`, `Textkacheln` |
| `v2/supplements/substanz-detail.tsx` | Such-X, „Alle" ×2, `hat-offene` |
| `v2/supplements/supplements.css` | Abhebung, feste Breiten, `vh`-Hoehen |
| `__tests__/substanz-kacheln.test.ts` | **neu**, 9 Faelle |
| `__tests__/deutsch-und-scroll.test.ts` | Breiten- und Hoehenwaechter |
| `tools/_g181-breiten.mjs`, `_g181-bilder.mjs` | **neu** |

`[read]` **Ein G-172-Waechter musste angepasst werden:** er prueft auf
`max-height: \d+vh`, und `calc(100vh - 300px)` trifft das Muster nicht.
**Die Zusage ist dieselbe geblieben** — eine Hoehe, die sich am Fenster
bemisst —, deshalb prueft das Muster jetzt auf `vh` in beiden
Schreibweisen.

**Keine Texte geaendert.** `[read]` Die Mengenkachel laesst
*„maintenance"*, *„studied"*, *„per serving"* weg — **die Zahl bleibt
unveraendert**, und die volle Angabe steht im Satz unter „Wann und
wie".

## OFFEN

1. **Die Wirkungskachel deckt 5 von 290.** Sie waechst, wenn jemand
   weitere Zahlen liest und eintraegt — **nicht durch einen Automaten.**
2. **Die Mengenkachel ist teils englisch** (`3-5 g/day`), weil
   `supplement_dosing` keine deutsche Spalte hat. Der deutsche Satz
   steht in `wann_wie_de` und wird im Reiter „Dosierung" gezeigt.
3. **12 Sammelnamen ohne Nutzertextzeile** fallen weiter auf
   `description` zurueck.
