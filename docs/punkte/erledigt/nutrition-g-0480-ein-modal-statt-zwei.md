---
nr: G-480
typ: feature
modul: nutrition
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: E-83
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: 452590fd
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/food-such-modal.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-480 - ein Modal statt zwei

## Der Anlass

Tom, 2026-09-08, mit Bildschirmfoto:

> wo kann der tom das eingeben? auf diesem laecherlichen modal?
> wo nicht mal fuer nutrition passt? lass dieses modal besser
> bauen (fooddb suche like) und supplement mit einbinden

## Die Vorlage stand die ganze Zeit da

`[cmd]` **`module-nutrition.jsx:557`, selbst nachgelesen:**

    ["All", "Favorites", "Recent", "Meat", "Fish",
     "Grains", "Dairy", "Produce", "Beverages",
     "Supplements"]

`[cmd]` **Eine Suche, `Supplements` als Filter darin,
Quellenspalte je Zeile (`<Pill>{f.src}</Pill>`).**

`[cmd]` **Und `SPEC_10:92`: die Liste ist bereits nach Quelle
geteilt** ? **eine dritte Sektion ist die vorgesehene
Erweiterung.**

### Der Fehler war meiner

Claude Code in E-83:

> *,,Das stand die ganze Zeit da, und `00-QUELLEN.md` nennt die
Datei. Ich habe bei G-475/G-478 die DRITTE QUELLE uebersprungen
und danebengebaut."*

`[read]` **Ich habe die Auftraege geschrieben, ohne Spec und
Mockup zu lesen** ? **zwei von vier Quellen ausgelassen.**

## Was heute dasteht

`[cmd]` **`food-such-modal.tsx`** ? **Suchfeld, Sortierleiste
(Relevanz, Name, Protein hoch/niedrig, Kalorien,
Kohlenhydrate, Fett), *,,Mindestens zwei Zeichen eingeben"*.**

`[cmd]` **`supplement-modal.tsx`** ? **ein Freitextfeld, kein
Suchergebnis, keine Sortierung.**

## Toms Formregel

> pillen/tablet/capsule gehoeren nicht in meals ? der wird
> nicht eine tablette zerhacken, nur dass es in einen shake
> rein passt

    Meal    Powder, Liquid, Bar, Gummy
    Stack   Capsule, Tablet, Softgel, Lozenge
    Other   nicht zuordenbar

`[cmd]` **Gemessen, On Market: Powder 24.074, Liquid 20.534,
Gummy 3.007, Bar 40.**

`[cmd]` **Und aus E-83: 82 % von `Other` tragen keinen
Formhinweis im Namen** ? **MELDEN, wie es gezeigt wird.**

`[cmd]` **`Lozenge` ist klar Stack:** **Melatonin, Zink,
sublinguales B12 ? sublingual ist der Zweck.**

## Was NICHT zu aendern ist

`[cmd]` **Die Datenseite** ? **Codex baut C-519 (Toms
Entscheidung E-84: ein Supplement bleibt ein Supplement und
wird im Stack gespeichert, auch wenn es in einer Mahlzeit
steht).**

`[read]` **Die Schreibwege ziehen danach nach** ? **bau die
SUCHE.**

## Abnahmebedingungen

    A1  eine Suche, mit Supplements als Filterpille.
        Foto.
    A2  je Zeile die Quelle erkennbar. Foto.
    A3  nur untermischbare Formen erscheinen. Zahl.
    A4  supplement-modal.tsx ist weg oder leitet um.
    A5  die bestehende Lebensmittelsuche unveraendert
        bedienbar. Foto vorher/nachher.
    A6  Kontraste gemessen.
    A7  vier Module unveraendert.
    A8  apps/web 1865 oder mehr, apps/coach 65.

## Bericht

**Alle acht Bedingungen erfuellt.** **Gemessen am 2026-09-18 auf
`dev@lumeos.app`, Dev-Server 3200.**

    A1  eine Suche mit Filterpille „Supplemente"      erfuellt
    A2  je Zeile die Quelle, BLS wie Supplement       erfuellt
    A3  20 von 20 Treffern Powder, 0 Kapseln          erfuellt
    A4  supplement-modal.tsx ohne Rumpf und Aufrufer  erfuellt
    A5  Lebensmittelsuche unveraendert                erfuellt
    A6  15 Flaechen gemessen, 1 Altbefund             gemessen
    A7  vier Module 200, Kachelzahlen unveraendert    erfuellt
    A8  apps/web 1876/1876, apps/coach 65/65          erfuellt

`[cmd]` **`supabase/` unberuehrt** — die dortigen Aenderungen tragen
sechsmal `C-519` und dreimal `E-84` und **null mal `G-480`**: das ist
Codex.

### A5 zuerst — was NICHT passieren durfte

`[read]` **Die bestehende Suche war der Massstab, nicht die neue
Kachel.** `[cmd]` **Deshalb wurde das Vorher-Bild aufgenommen, BEVOR
eine Zeile geaendert war** — mit demselben Werkzeug wie das
Nachher-Bild, sonst vergleicht man zwei Messungen statt zwei
Zustaende.

    Suchwort „banane"        VORHER              NACHHER
    Spalten                  Name Quelle kcal    gleich
                             P C F
    Zeilen                   12                  12
    Trefferzahl              12 von 21 Treffern  12 von 21 Lebensmitteln
    erste Zeile              Banane BLS 79       gleich
                             1.3 15.9 0.4
    Sortierknoepfe           10                  10
    Seitenfehler             0                   0

`[read]` **Ein einziger Unterschied: die drei Quellenpillen darueber
— und dass die Zahl jetzt sagt, WOVON sie 12 zaehlt.**

### A1 und A2 — eine Suche, zwei Quellen

`[cmd]` **`module-nutrition.jsx:557` gebaut, nicht umschrieben:**

    [Alle] [Lebensmittel] [Supplemente]

`[cmd]` **Gemessen mit „protein":**

    8 von 8 Lebensmitteln · 20 Supplemente

`[cmd]` **Und die Quelle steht JE ZEILE**, wie in Zeile 581 des
Mockups (`<Pill>{f.src}</Pill>`):

    Eiweißbrot                         BLS          226  23.4
    Sojaproteinisolat                  BLS          384  88.3
    1:1 Fats + Protein Rich Chocolate  Supplement   160  10.0
    100% Casein Protein Chocolate      Supplement     —  83.0

`[read]` **Keine Sektion mit Ueberschrift, sondern eine Marke je
Zeile** — **wer nach Protein sortiert, mischt die Quellen, und eine
Ueberschrift beschriftete dann die falschen Zeilen.**

`[cmd]` **Das `—` ist geprueft, nicht geschaetzt:** `100% Casein
Protein Chocolate Cream` **traegt in der Datenbank `prot625 = 83` und
`enercc/cho/fat = NULL`.** `[read]` **Eine 0 waere eine Behauptung,
der Strich ist die Auskunft.**

### A3 — nur, was man untermischen kann

`[cmd]` **Die Zahl: 47.655 von 121.959 On-Market-Produkten (39,1 %).**

    Powder [E0162]           24.074
    Liquid [E0165]           20.534
    Gummy or Jelly [E0176]    3.007
    Bar [E0164]                  40

`[cmd]` **Am Schirm belegt, Suchwort „creatine":**

    Supplementzeilen             20
    davon Powder [E0162]         20
    VERBOTENE Formen              0

`[read]` **Das ist die scharfe Probe** — **es gibt 525 Creatine-
Produkte, davon 112 als Kapsel oder Tablette.** `[read]` **Keine
einzige kam durch.**

`[cmd]` **Die Form steht als `data-form` am Knoten** — **damit sich
das PRUEFEN laesst, statt es zu glauben.**

#### Der Fallstrick, der den Filter fast blind gemacht haette

`[cmd]` **`produktform` traegt einen DSLD-Code:** `Powder [E0162]`,
**nicht** `Powder`.

`[cmd]` **Ein Filter auf `= 'Bar'` findet NULL Zeilen** — **es gibt
40.** `[read]` **Deshalb `like ...%` und nie `eq`** — **und der
Waechter prueft genau das:** `assert.doesNotMatch(f,
/produktform\.eq\./)`.

### A4 — der zweite Weg ist zu

`[cmd]` **Vier Stellen, alle gemessen:**

    modale.tsx        Import und Verteilerzweig entfernt
    modale.tsx        `'supplement'` aus NutritionModalTyp
    kopfknoepfe.tsx   der zweite Knopf entfernt
    supplement-modal.tsx   Rumpf entfernt, `export {}`

`[cmd]` **Die Datei hat keinen Aufrufer mehr** — gemessen mit `rg`.

`[read]` **Sie steht noch da, weil das Loeschen abgelehnt wurde** —
**der Auftrag laesst „weg ODER leitet um" zu, und die Datei traegt
jetzt ihren Nachfolger im Kopf**, damit niemand sie fuer verloren
haelt und ein drittes Modal baut. `[read]` **Das endgueltige
Entfernen gehoert Tom.**

### Eine Entscheidung, die der Auftrag nicht vorgab

`[cmd]` **`FoodSuchModal` hat VIER Aufrufer** — Mahlzeit, Ghost,
Planeintrag, Rezept.

`[cmd]` **Nur die Mahlzeit kann Supplemente schreiben:**
`meal_plan_entries` **hat kein `supplement_product_id`, und**
`recipe_ingredients.food_source` **erlaubt nur `bls` und `custom`**
(E-83).

`[read]` **Deshalb wird die Quelle FREIGESCHALTET, nicht
vorausgesetzt:** `onSupplement` **fehlt — keine Pille.** `[read]`
**Eine Filterpille, die zu einer Liste fuehrt, aus der man nichts
waehlen darf, waere wieder eine Bedienfalle.**

`[cmd]` **Der Waechter prueft beide Richtungen** — **der Mahlzeitweg
reicht durch, und Plan, Rezept und Ghost tun es NICHT.**

### A6 — 15 Flaechen, und ein Altbefund

`[cmd]` **Gemessen ueber ein 1x1-Canvas** (`oklch()` bricht jeden
Regex).

`[cmd]` **14 von 15 bestehen.** **Die neuen Flaechen:**

    v2-supp-regelsatz        8,57:1
    v2-pill „Supplement"     9,19:1
    Trefferzahl              9,19:1
    Pille „Supplemente"     14,68:1

`[cmd]` **Eine faellt: der Tabellenkopf `th` mit 2,88:1.**

`[read]` **Der gehoert NICHT zu G-480.** `[cmd]` **Belegt, nicht
behauptet:** **dieselbe Messung am Food-DB-Reiter, den dieser Auftrag
nicht angefasst hat, ergibt ebenfalls 2,88:1.**

`[cmd]` **Die Regel steht in `packages/ui/src/styles/v2.css:785`
(`.v2-tbl th { color: var(--fg-dim) }`) und betrifft 57 Dateien in
`v2`.**

`[read]` **Dort zu greifen hiesse, alle Module zu aendern** — **das
waere A7.** `[read]` **Gemeldet, nicht stillschweigend behoben** —
**es ist derselbe Befund, den ich am Ende von G-478 schon genannt
habe, und er braucht einen eigenen Punkt.**

### Der Waechter, und das Loch, das die Sabotage fand

`[cmd]` **`g480-eine-suche.test.ts`, 11 Faelle.** `[cmd]`
**`_g480-sabotage.mjs`: 15 Schaeden plus eine KONTROLLPROBE.**

`[cmd]` **Erster Lauf: 15/16** — **ein Schaden blieb GRUEN:**
*,,Kapsel darf in die Mahlzeit"* (`'Capsule'` aus `STACK_FORMEN`
entfernt).

`[read]` **Der Waechter war an dieser Stelle blind:**
`darfInMahlzeit` **liest nur `MEAL_FORMEN`, und die
Ueberschneidungspruefung findet bei einer KUERZEREN Liste nichts.**

`[cmd]` **Zusicherung ergaenzt: `STACK_FORMEN` muss alle vier Formen
tragen.** `[cmd]` **Zweiter Lauf: 16/16.**

`[read]` **Die Liste ist eine Zusage ueber Toms Regel** — **faellt
eine Form still heraus, behauptet der Quelltext etwas anderes als
die Regel.**

`[cmd]` **Und der fremde Waechter aus G-478 wurde NACHGEZOGEN, nicht
entschaerft:** **er prueft weiter, dass `OHNE_NAEHRWERTE_SATZ`
importiert und nicht abgeschrieben wird — nur zeigt er jetzt auf
`food-such-modal.tsx`.**

`[read]` **Der Satz haette sonst keinen Anzeigeort mehr gehabt** —
**mit dem alten Modal waere G-478/A5 still verschwunden.** `[cmd]`
**Er steht jetzt unter der Trefferliste, sobald ein Produkt ohne
Naehrwerte dabei ist.**

### Zwei Befunde am eigenen Werkzeug

`[cmd]` **Die Probe mass zuerst die Mahlzeitentabelle HINTER dem
Modal** — `.v2-tbl` **trifft beide.** `[read]` **Vier Zeilen
Haferflocken statt zwoelf Treffern, und es sah wie ein Ergebnis
aus.** ? **auf `[data-probe="modal-kasten"]` begrenzt.**

`[cmd]` **Und sie mass zu frueh:** **bei 1,5 s null Zeilen, bei 3 s
zwoelf.** `[read]` **Jetzt wird auf die Zeilen gewartet, nicht auf
eine Frist** — **und zusaetzlich darauf, dass ,,sucht Supplemente…"
verschwunden ist.**

`[cmd]` **Dabei fiel ein echter Anzeigefehler auf:** **es stand
*,,Keine Treffer. · sucht Supplemente…"*** — **eine Aussage, die sich
selbst widerspricht.** `[cmd]` **Behoben: ,,Keine Treffer" erst, wenn
BEIDE Quellen geantwortet haben.**

### Neustart noetig?

`[read]` **Nein** — **nur `apps/web/src` und `globals.css`.**
`[read]` **`packages/` wurde bewusst NICHT angefasst**, obwohl der
blasse Tabellenkopf dort liegt.

### Was offen bleibt

`[read]` **Der Schreibweg ist der alte** (`art: 'supplement'` aus
G-478) — **wie beauftragt.** `[cmd]` **Codex baut C-519 (E-84: ein
Supplement bleibt ein Supplement und wird im Stack gespeichert)** —
**danach zieht dieser Aufruf nach.**

`[read]` **Zwei Dinge, die diese Suche noch nicht kann:**

    Mahlzeitplaene   meal_plan_entries braucht die vierte Quelle
    Rezepte          food_source erlaubt nur bls|custom,
                     und die Erlaubnis ist nicht erteilt (E-83/D)

`[read]` **Beide brauchen Schema, beide gehoeren nicht hierher.**

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

`[cmd]` **`x-g480-a2-quellen.png` angesehen:**

    [Alle] [Lebensmittel] [Supplemente]
    Relevanz | Name | Protein hoch/niedrig | ...
    8 von 8 Lebensmitteln - 20 Supplemente
    "Nur Formen, die sich untermischen lassen (Pulver,
     Fluessig, Riegel, Gummi). Kapseln und Tabletten
     gehoeren in den Stack."

    Eiweissbrot            [BLS]         226  23.4
    Sojaproteinisolat      [BLS]         384  88.3
    1:1 Fats + Protein     [Supplement]  160  10.0
    100% Casein Chocolate  [Supplement]    -  83.0

`[read]` **Der Satz ERKLAERT die Formregel, statt sie stumm
anzuwenden.**

`[cmd]` **`supplement-modal.tsx`: 53 Zeilen, rumpflos, nennt
seinen Nachfolger im Kopf. Kein Aufrufer ausser der alten
G-478-Probe.**

`[cmd]` **Proben: web 1876/1876, coach 65/65.**

### Ein Fallstrick, der den Filter blind gemacht haette

> *,,`produktform` traegt einen DSLD-Code ? `Powder [E0162]`,
nicht `Powder`. Ein Filter auf `= Bar` findet null Zeilen,
obwohl es 40 gibt. Der Waechter prueft deshalb ausdruecklich,
dass KEIN `eq` verwendet wird."*

`[cmd]` **A3 belegt: 20 von 20 Powder, 0 Kapseln ? bei 112
vorhandenen Creatine-Kapseln.**

### Eine Entscheidung, die der Auftrag nicht vorgab

> *,,`FoodSuchModal` hat VIER Aufrufer, aber nur die Mahlzeit
kann Supplemente schreiben (`meal_plan_entries` hat keine
Spalte, `recipe_ingredients` erlaubt nur `bls|custom`). Die
Quelle wird daher FREIGESCHALTET, nicht vorausgesetzt ? Plan,
Rezept und Ghost zeigen die Pille gar nicht."*

`[read]` **Er hat gemessen, wo es nicht geht, statt eine
Pille anzubieten, die ins Leere fuehrt.**

`[cmd]` **Und C-519 wird das aufloesen** ? **danach zieht die
Pille an den drei anderen Stellen nach.**

### Die Sabotage fand ein echtes Loch

> *,,`Capsule` aus `STACK_FORMEN` zu entfernen blieb GRUEN,
weil `darfInMahlzeit` nur `MEAL_FORMEN` liest. Zusicherung
ergaenzt, dann 16/16."*

### Und ein Anzeigefehler nebenbei

> *,,Es stand *Keine Treffer. - sucht Supplemente...* ? eine
Aussage, die sich selbst widerspricht."*

### Zwei Sachen gemeldet statt behoben

`[cmd]` **Der Tabellenkopf misst 2,88:1** ? **belegt als
ALTBEFUND, weil dieselbe Messung am unangetasteten
Food-DB-Reiter denselben Wert liefert.**

`[read]` **Die Regel liegt in `packages/ui`, 57 Dateien** ?
**dort zu greifen waere A7 gewesen. Als G-479.**

`[cmd]` **`supplement-modal.tsx` steht noch auf der Platte** ?
**Loeschen abgelehnt, das ist Toms Sache.**

**Abgenommen.**


