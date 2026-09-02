---
nr: G-329
typ: feature
modul: nutrition
schwere: hoch
angelegt: 2026-09-02
braucht: []
kind_von: G-309
entscheidung: E-42
agent: claudecode
beauftragt: 2026-09-02
erledigt: 2026-09-02
commit: eecfede1
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/mahlzeiten.tsx
zahlen:
  gemessen: 2026-09-02
---

# G-329 — Ghost-Eintraege koennen nur bestaetigen oder auslassen

## Befund

Tom, 2026-09-02, am Schirm:

> die ghosteintraege des mealplanners brauchen bearbeiten (fuer
> manuelle aenderungen) und mealcam (fuer visuelle bestaetigung oder
> korrektur)
>
> und die positionen sollen gleich abgebildet sein wie in den
> normalen eintraegen

`[cmd]` **Heute traegt eine Ghost-Karte zwei Knoepfe: *Bestaetigen*
und *Auslassen*.**

`[cmd]` **Und die Positionen zeigen nur Menge und kcal:**

    Haferflocken          [80]  g   278 kcal
    Joghurt (0,5% Fett)   [250] g   120 kcal
    Banane                [120] g    95 kcal

`[cmd]` **Eine normale Mahlzeitzeile zeigt vier Werte:**

    Vollkornbrot   81 g   170 kcal   6 g   31 g   1 g

## Was fehlt

### 1 · Bearbeiten

`[read]` **Wer 80 g Haferflocken auf 120 aendert, kann das heute
nur ueber das Mengenfeld** — **aber keine Zutat austauschen oder
hinzufuegen.**

`[cmd]` **E-42: geloggt ist eingefroren, nicht geloggt ist frei.**
`[read]` **Ein Ghost-Eintrag ist nicht geloggt** — **er darf
geaendert werden.**

### 2 · MealCam

`[cmd]` **Der Knopf existiert in der leeren Mahlzeit**
(`mahlzeiten.tsx:451`) — **als Attrappe** (G-276, kein Modell).

`[read]` **Und Flow 4 nennt ihn ausdruecklich fuer Ghost Entries:**
*,,confirm via MealCam or manually"* — **die Attrappe aus G-315 stand
so in der Vorlage.**

`[read]` **Solange kein Modell da ist, bleibt er eine Attrappe** —
**aber an der richtigen Stelle, mit dem Vermerk warum.**

### 3 · Dieselbe Zeilenform

`[cmd]` **Die normale Zeile: Punkt, Name, Menge, kcal, P, C, F,
Menue.** `[cmd]` **Die Ghost-Zeile: Name, Mengenfeld, kcal.**

`[read]` **Zwei Darstellungen fuer dieselbe Sache** — **und die
Ghost-Zeile zeigt weniger, obwohl die Werte da sind.**

`[cmd]` **`menge-rechnen.ts` liefert alle vier** — G-320, gegen
`food_nutrient_snapshot` geprueft.

## Auftrag — Ghost-Eintraege wie normale Eintraege

**Mitbeauftragt: G-330.** Bericht in diese Datei.

**Beauftragt am 2026-09-02.**

### 1 · Dieselbe Zeilenform

`[cmd]` **Normal:** Punkt, Name, Menge, kcal, P, C, F, Menue.
`[cmd]` **Ghost:** Name, Mengenfeld, kcal.

`[read]` **Zwei Darstellungen fuer dieselbe Sache** — **und die
Ghost-Zeile zeigt weniger, obwohl die Werte da sind.**

`[cmd]` **`menge-rechnen.ts` liefert die Naehrwerte** (G-320,
gegen `food_nutrient_snapshot` geprueft) — **das Gewicht steht im
Mengenfeld.**

`[read]` **Das Mengenfeld bleibt** — es ist der Unterschied: **ein
Ghost-Eintrag ist ein Vorschlag, den man aendern darf, bevor man ihn
bestaetigt.**

### 2 · Bearbeiten

Tom: *,,fuer manuelle aenderungen."*

`[cmd]` **Heute laesst sich nur die Menge aendern** — **keine Zutat
austauschen, keine hinzufuegen, keine entfernen.**

`[cmd]` **E-42: geloggt ist eingefroren, nicht geloggt ist frei.**
`[read]` **Ein Ghost-Eintrag ist nicht geloggt.**

`[read]` **Und das Suchmodal steht** (G-320, G-323) — **es kann eine
Zutat liefern.**

`[read]` **Zu klaeren, bevor du baust: aendert *Bearbeiten* den
Plan oder nur diesen Tag?** `[cmd]` **E-42 sagt: nicht geloggte
Planpositionen sind frei** — **aber ein Ghost-Eintrag zeigt eine
Planposition, er ist keine.**

**Miss, was `bestaetigen` heute schreibt, und sag was richtig
waere.**

### 3 · MealCam

Tom: *,,fuer visuelle bestaetigung oder korrektur."*

`[cmd]` **Der Knopf existiert in der leeren Mahlzeit**
(`mahlzeiten.tsx:451`) — **als Attrappe, G-276: kein Modell.**

`[cmd]` **Flow 4 nennt ihn fuer Ghost Entries:** *,,confirm via
MealCam or manually"*.

`[read]` **Er gehoert an die Ghost-Karte, mit demselben Vermerk wie
in der leeren Mahlzeit** — **eine Attrappe an der richtigen Stelle
ist besser als keine an der falschen.**

### 4 · G-330 — die Kopfzeile, fuenf Werte

Tom, praezisiert: *,,es sind 5 werte die in header als total rein
muessen und einzeln in den positionen.
gewicht/kalorien/protein/kohlenhydrate/fat."*

    07:30  Breakfast · 3 items      333  413   23   47    2
                                      G  KCAL    P    K    F

    Vollkornbrot                      81  170    6   31    1
    Ei (roh)                         126  170   17    0   11
    Apfel                            126   73    1   15    1

`[cmd]` **Heute:** `413 kcal · 23g P` — **zwei von fuenf.**

`[read]` **Das Gewicht gehoert dazu** — **es ist die einzige Angabe,
die man direkt nachwiegen kann.**

`[read]` **Und die Spalten muessen senkrecht fluchten:** `[cmd]`
**die Ueberschrift steht ueber derselben Spalte wie der Einzelwert.**
`[read]` **Sonst beschriftet sie nichts.**

`[cmd]` **Kurzform ist erlaubt: G / KCAL / P / K / F.**

### Was nicht zu tun ist

**Kein MealCam-Modell** — G-276, der Knopf bleibt Attrappe.
**Keine zweite Zeilenkomponente** — dieselbe fuer beide.
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen.**

### Nachweis

    Ghost-Zeile      fuenf Werte wie die normale
    Bearbeiten       Zutat tauschen, hinzufuegen, entfernen
    Wirkung          aendert es den Plan oder den Tag? gemessen
    MealCam          an der Ghost-Karte, mit Vermerk
    Kopfzeile        fuenf Werte, Beschriftung darunter
    Flucht           Ueberschrift steht ueber ihrer Spalte
    Bildschirmfoto   vorher / nachher

## Bericht

**Claude Code, 2026-09-02.** Mitbeauftragt G-330; beides in diesem
Bericht. **Nicht committet, nichts auf `dev@lumeos.app` geschrieben.**

### Die Auftragsfrage: aendert Bearbeiten den Plan oder den Tag?

**Gemessen, bevor gebaut wurde.** `planEintragBestaetigen`
(`plan-log-write.ts:229-285`) schreibt nach:

    meals            createMeal
    meal_items       addMealItem
    meal_plan_logs   upsert

`[cmd]` **`meal_plan_entries` fasst es NICHT an.** An den Daten
gegengeprueft: nach dem Bestaetigen existiert die Planposition weiter,
der Log verweist nur darauf (6 Zeilen auf dev, alle mit
`position_existiert = t`).

**Es aendert den Tag, und das ist richtig so.** Ein Ghost-Eintrag
*zeigt* eine Planposition, er *ist* keine. Wer heute mehr isst, hat
nicht den Plan geaendert.

`[read]` **Deshalb leben die Aenderungen nur im Zustand der Karte** und
gehen als `mengen` an `bestaetigen`. **Kein Schreibweg in den Plan** —
ein Waechter haelt das fest.

### Was gebaut wurde

**1 · Dieselbe Zeilenform.** Die Ghost-Zeile ist jetzt eine Tabelle
mit denselben Spalten und Breiten wie die Tagebuchzeile
(18/–/44/58/40/40/40/20).

    vorher   Name, Mengenfeld, kcal
    nachher  Punkt, Name, Menge, kcal, P, K, F, Entfernen

`[cmd]` **Am Schirm: 8 von 8 Spalten fluchten (delta 0).**

**2 · Bearbeiten.** Entfernen je Zeile, Hinzufuegen ueber dasselbe
`FoodSuchModal` wie Planner (G-320) und Rezept (G-323) — **keine
vierte Suche.** Entfernte Zutaten sind sichtbar und ruecknehmbar.

`[cmd]` **Gemessen: 9 Zeilen, entfernen 9 -> 8, zuruecknehmen 8 -> 9,
hinzufuegen 9 -> 10** (neue Zeile: *Lachs (geduenstet) 293kcal 31g 0g
19g*).

**3 · MealCam** steht an der Ghost-Karte, mit `InEntwicklung`-Vermerk
und dem Grund (G-276, kein Modell) — **eine Attrappe an der richtigen
Stelle, die sagt, dass sie eine ist.**

**4 · G-330, die Kopfzeile.** Fuenf Werte statt zwei, Reihenfolge
Gewicht, kcal, Protein, Kohlenhydrate, Fett.

`[cmd]` **Vorher:** *413 kcal · 23g P*.
`[cmd]` **Nachher:** *333g 413kcal 23P 46K 13F*.

**Die Beschriftung steht im `<thead>` derselben Tabelle**, nicht in der
Kopfzeile. `[cmd]` **Ein erster Versuch mit gerechnetem Abstand lag 66
px daneben** — rechts der Summe stehen zwei Knoepfe — **und der
Ausgleich verschob die ganze Karte** (Abweichung dann 132 px).
`[read]` **Im `<thead>` fluchtet sie von selbst.**

**5 · Nachgereicht am selben Tag: der Ghost-Kopf.** Tom: *,,ghost
entries haben im header noch keine totals."*

`[cmd]` **Er zeigte nur kcal.** `[cmd]` **Und er rechnete ueber
`eintrag.posten` — die GEPLANTEN:** eine entfernte Zutat blieb in der
Summe, eine hinzugefuegte fehlte. **Der Kopf haette etwas anderes
gesagt als die Zeilen darunter.**

`[cmd]` **Jetzt ueber `posten`, die gerenderte Liste. Gemessen:**

    450g 493kcal 25P 76K 6F     (3 Zeilen)
    Haferflocken entfernt (80 g, 278 kcal)
    370g 215kcal 15P 34K 1F     (2 Zeilen)

### Nachweis

    Ghost-Zeile     fuenf Werte, 8 von 8 Spalten delta 0
    Bearbeiten      entfernen 9->8, zuruecknehmen 8->9, dazu 9->10
    Wirkung         Tag, nicht Plan — im Schreibweg gemessen
    MealCam         an der Ghost-Karte, Vermerk nennt G-276
    Kopfzeile       333g 413kcal 23P 46K 13F
    Flucht          thead gegen tbody, 8 von 8 delta 0
    Ghost-Kopf      450g 493kcal 25P 76K 6F, folgt der Bearbeitung
    Bilder          backup/g329-vorher.png, -nachher.png,
                    -mealcam.png, -kopf.png, g330-nachher.png

**Gegen die Datenbank geprueft:** *Hafer Flocken* bei 200 g liefert
`food_nutrient_snapshot` **696,0 / 26,4 / 106,6 / 13,3** — genau die
angezeigten Werte.

`[read]` **Zur Rundung:** der Kopf zeigt *25P/76K*, die Zeilen addiert
ergaeben *26/77*. **Der Kopf summiert ungerundet (25,32 / 76,32) und
rundet einmal am Ende** — er erbt nicht die Rundungsfehler der
Anzeige. Dieselbe Regel wie im Rezepteditor (G-326).

### Gate und Sabotageprobe

    pnpm gate        15 von 15 Tasks, 1.291 Tests, 0 Fehler
    Sabotageprobe    24 von 24 gefangen (Zeilen, Kopf, Bearbeiten,
                     Wirkung, MealCam, Rechnung)
                     + 4 von 4 fuer den nachgereichten Ghost-Kopf

**Neue Waechter:** `ghost-zeile-wie-normal.test.ts`, 340 Zeilen, 13
Proben.

### Ein bestehender Waechter stand der Anforderung im Weg

`[cmd]` **G-309 verbot ausdruecklich `filter` auf `eintrag.posten`** —
und **Zutaten entfernen heisst filtern.**

`[read]` **Was er sichert, gilt weiter** (die Zutaten stehen einzeln
da, nicht das Rezept als Einheit). **Er prueft jetzt die Wirkung:**
gerendert wird ueber `posten`, und diese Liste entsteht sichtbar aus
der vollen minus den vom Nutzer entfernten, mit leerem
Anfangszustand.

### Umfang

    ghost-eintrag.tsx   +359 / -
    mahlzeiten.tsx      +75
    plan-lesen.ts       +52   (vier Naehrwerte je 100 g statt nur kcal)
    ghost-eintraege.test.ts  +27  (G-309 auf die Wirkung)
    ghost-zeile-wie-normal.test.ts   340 neu

## Abnahme

**2026-09-02, Orchestrator.** `[cmd]` Gate 15/15, 1.291 Tests, 24
von 24 Sabotagen plus 4 fuer den Nachtrag, `dev` unberuehrt.

### Die Auftragsfrage ist im Schreibweg beantwortet

`[cmd]` **`planEintragBestaetigen` schreibt nach `meals`,
`meal_items`, `meal_plan_logs`** — **`meal_plan_entries` fasst es
nicht an.**

`[cmd]` **An den Daten gegengeprueft: 6 Logzeilen auf `dev`, alle mit
`position_existiert = t`.**

`[read]` **Seine Begruendung ist die richtige:** *,,Ein Ghost-Eintrag
zeigt eine Planposition, er ist keine. Wer heute mehr isst, hat nicht
den Plan geaendert."*

`[cmd]` **Ein Waechter haelt fest, dass es keinen Schreibweg in den
Plan gibt.**

### Fuenf Werte, und die Flucht ist gemessen

`[cmd]` **Vorher:** *413 kcal · 23g P*. `[cmd]` **Nachher:** *333g
413kcal 23P 46K 13F*.

`[cmd]` **8 von 8 Spalten fluchten, delta 0.**

`[read]` **Und der Weg dorthin ist der interessante Teil:** `[cmd]`
**ein erster Versuch mit gerechnetem Abstand lag 66 px daneben** —
rechts der Summe stehen zwei Knoepfe — **und der Ausgleich verschob
die ganze Karte, dann 132 px.**

`[read]` **Im `<thead>` derselben Tabelle fluchtet sie von selbst.**
**Dieselbe Klasse wie `v2-tab` in G-321 und `.v2-feld` in G-325:
die Mechanik loest es, nicht die Rechnung.**

### Der Nachtrag, den Tom fand, deckte einen zweiten Fehler auf

`[cmd]` **Der Ghost-Kopf rechnete ueber `eintrag.posten` — die
geplanten.** `[read]` **Eine entfernte Zutat blieb in der Summe, eine
hinzugefuegte fehlte.**

`[read]` **Der Kopf haette etwas anderes gesagt als die Zeilen
darunter** — **genau der Fehler, den G-330 beheben sollte, in der
Gegenrichtung.**

`[cmd]` **Jetzt ueber `posten`, die gerenderte Liste. Belegt:** 450g
493kcal bei 3 Zeilen, **370g 215kcal nach dem Entfernen der
Haferflocken.**

### Und die Rundung ist begruendet

`[cmd]` **Der Kopf zeigt 25P/76K, die Zeilen addiert ergaeben
26/77.**

`[read]` **Der Kopf summiert ungerundet (25,32 / 76,32) und rundet
einmal am Ende** — **er erbt nicht die Rundungsfehler der Anzeige.**
`[cmd]` **Dieselbe Regel wie im Rezepteditor** (G-326).

### Ein Waechter stand der Anforderung im Weg

`[cmd]` **G-309 verbot `filter` auf `eintrag.posten`** — **und
Zutaten entfernen heisst filtern.**

`[read]` **Was er sichert, gilt weiter:** die Zutaten stehen einzeln
da, nicht das Rezept als Einheit. `[read]` **Er prueft jetzt die
Sache statt das Wort** — **die Klasse, die heute zwoelfmal aufgetreten
ist.**

### Bearbeiten und MealCam

`[cmd]` **Entfernen 9 auf 8, zuruecknehmen 8 auf 9, hinzufuegen 9 auf
10** — ueber dasselbe `FoodSuchModal` wie Planner und Rezept, **keine
vierte Suche.**

`[cmd]` **MealCam steht an der Ghost-Karte mit `InEntwicklung` und
dem Grund** (G-276). `[read]` **Eine Attrappe an der richtigen Stelle,
die sagt, dass sie eine ist.**

**Abgenommen.**

