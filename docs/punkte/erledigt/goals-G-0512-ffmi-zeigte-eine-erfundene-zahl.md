---
nr: G-512
typ: befund
modul: goals
schwere: hoch
angelegt: 2026-09-26
erledigt: 2026-09-26
commit: abf33847

braucht: []
kind_von: G-510
entscheidung: E-68

beruehrt:
  # `goals.body_composition_navy` ist eine FUNKTION, keine Tabelle —
  # der Punktewaechter hat es gefangen.
  tabellen:
    - goals.body_measurements
  dateien:
    - apps/web/src/app/v2/goals/fehlende-kacheln.tsx
    - apps/web/src/app/v2/goals/ansicht.tsx
    - apps/web/src/app/v2/goals/__tests__/g512-ffmi-kommt-aus-den-daten.test.ts

zahlen:
  gemessen: 2026-09-26
  gezeigt_vorher: 22.4
  gemessen_echt: 21.81
  bandgrenze: 22
---

# G-512 - die FFMI-Kachel zeigte eine erfundene Zahl als echte

## Der Befund

`[cmd]` **`fehlende-kacheln.tsx:571` trug `22.4` fest im JSX** —
**ueber der Trennlinie**, also dort, wo nach E-68 das Angebundene
steht.

`[cmd]` **Darunter stand woertlich:** *,,Der WERT ist angebunden — er
steht im Composition-Reiter aus `body_composition_navy`. Die Stufen
sind es nicht."*

`[read]` **Die Attrappenmarke deckte nur die BAENDER.** `[read]`
**Der Wert stand ungekennzeichnet daneben und sah aus wie eine Zahl
aus der Datenbank** — **das ist genau der Fall aus G-440**, wo eine
Kachel `echte Daten` trug und aus achtzehn festen Zeilen rechnete.

## Gemessen

`[cmd]` **`goals.body_composition_navy` auf `dev@lumeos.app`,
2026-09-26:**

    ffmi            21,81
    body_fat_pct    10,76
    lean_mass_kg    75,69

`[cmd]` **`goals.body_measurements.ffmi`, juengste Zeilen:** 20,77.

`[read]` **Gezeigt wurden 22,4 — gemessen sind 21,81.**

## Warum es mehr ist als eine falsche Nachkommastelle

`[cmd]` **Die Bandgrenze der Kachel liegt bei 22:**

    18-20   Developing
    20-22   Natural trained      <- 21,81 liegt hier
    22-25   Advanced natural     <- 22,4 lag hier, fest markiert
    25+     Elite / assisted

`[cmd]` **Die dritte Spalte von `FFMI_BAENDER` stand fest auf
`true` beim Band 22-25**, und die Pille sagte `advanced`.

`[read]` **Die Kachel zeigte also eine EINSTUFUNG, die der echte
Wert nicht traegt.** `[read]` **Eine Attrappe, die aussieht wie ein
Wert, ist schlimmer als eine, die sich als solche zeigt** (A10).

## Woher die Zahl stammte

`[cmd]` **Aus dem Mockup** — und dort widerspricht sie sich selbst:

    module-goals.jsx:553      ffmi = leanMass/h² = 20,2  (gerechnet)
    module-goals-pro.jsx:693  const ffmi = 22.3;         (fest)

`[cmd]` **Die 22,4 im Code ist keine von beiden** — sie ist eine
dritte Zahl, die in keinem der drei Mockups steht.

## Behoben

`[cmd]` **Die Kachel nimmt den Wert jetzt als Requisite** und
bekommt ihn aus demselben Leseweg wie der Composition-Reiter:
`echt.navy?.ffmi`, ersatzweise die juengste Messung.

`[cmd]` **Das aktive Band rechnet `imBand()` aus dem Wert** — die
feste Spalte ist raus.

`[cmd]` **Ohne Wert steht kein Grad da**, sondern ein benannter
Leerhinweis (E-72) — eine Pille `advanced` ueber einem Strich waere
eine Behauptung.

`[cmd]` **Die Marke bleibt** — die Baender haben weiterhin keine
Quelle im Repo (GO-21). **Sie nennt jetzt zusaetzlich, dass der WERT
seit G-512 echt ist.**

## Die Pruefung

`[cmd]` **`__tests__/g512-ffmi-kommt-aus-den-daten.test.ts`, 7
Zusicherungen, alle gruen.**

`[cmd]` **Sabotageprobe in BEIDE Richtungen gelaufen:**

    22.4 zurueck ins JSX     -> Zusicherung 4 faellt   ROT
    Requisite entfernt       -> Zusicherung 2 faellt   ROT
    beides zurueckgebaut     -> 7 von 7                GRUEN

`[cmd]` **Und ein Fehler der Pruefung selbst, beim ersten Lauf
gefunden:** **sie las ihre eigene Begruendung** — der Kommentar
ueber der Kachel nennt `22,4`, und eine Textsuche im ganzen Rumpf
fand ihn. `[cmd]` **Behoben: `physiqueCode()` schneidet Kommentare
heraus, bevor gesucht wird.**

`[cmd]` **`npx tsc --noEmit` gruen, `next build` laeuft durch.**

## Nachpruefung 2026-09-28 (A1 bis A4) — BEHOBEN, nichts offen

`[cmd]` **A1 — der Stand, mit Zeilenbeleg:**

    fehlende-kacheln.tsx:566  ({ ffmi }: { ffmi: number | null })
    :596                      {ffmi != null ? ffmi.toFixed(2) : '—'}
    :580                      const imBand = … aus dem echten Wert
    ansicht.tsx               ffmi={echt.navy?.ffmi ?? …}

`[cmd]` **Die feste `22.4` steht NUR NOCH IM KOMMENTAR** (`:567`),
der die Behebung beschreibt. `[cmd]` **Der Waechter
`g512-ffmi-kommt-aus-den-daten.test.ts` laeuft: 7 von 7 gruen.**

`[read]` **Ergebnis: BEHOBEN, nicht halb.** `[read]` **Nicht
nachgezogen war allein die PUNKTDATEI** — sie lag in `todos/`,
obwohl Code und Waechter seit 2026-09-26 stehen. **Kein
Codebefund.**

`[cmd]` **A3 — die Falle, gegen alle 362 Zeilen gemessen:**

    Zeilen gesamt                          362
    weichen von lean/m^2 ab                362
    treffen lean/m^2 + 6.1*(1.8-m)         362

`[read]` **Die naheliegende Formel ist bei JEDER Zeile falsch.**
`[cmd]` **Der Code rechnet nicht — er liest die Spalte.** **Beim
Schreibnachweis aus G-422 hat die Datenbank `ffmi 20.96` selbst
erzeugt, ohne Zutun der Oberflaeche.**

`[cmd]` **A4 — die Marke deckt den Wert NICHT mit:**

    attrappe={marke('belegte Einordnungsbaender — 18-20 „Developing"
      bis 25+ „Elite / assisted" haben im Repo keine Quelle (GO-21).
      Der WERT ist seit G-512 echt.')}

`[cmd]` **Und der Fusssatz sagt dasselbe:** *,,Der WERT kommt aus
`body_composition_navy` … Die Stufen sind weiterhin Entwurf."*

`[cmd]` **Am Schirm, `test-user@lumeos.local`,
`/v2/goals?tab=physique`:** 7 Attrappen, 1 Konsolenfehler (die
bekannte `data-mode`-Warnung).

`[read]` **Dieser Punkt gehoert nach `erledigt/`** — es gibt nichts
zu bauen.

## Nicht am Schirm belegt — NACHGEHOLT 2026-09-27

`[read]` **Der Dev-Server lief bei der Messung nicht** (3200 und
3220 beide ohne Antwort) — **der Nachweis am Bild stand aus.**

`[cmd]` **Belegt war:** Typpruefung, Produktionsbau, sieben
Zusicherungen mit Sabotageprobe, und der echte Wert aus der
Datenbank.

### Der Schirmnachweis, 2026-09-27

`[cmd]` **Bild:** `backup/x-g512-ffmi-kachel.png`
(`/v2/goals?tab=physique`, 1440 px, `dev@lumeos.app`).

`[cmd]` **Was die Kachel UEBER der Linie zeigt, Text aus dem
Schirm gelesen:**

    FFMI · fat-free mass index
    Attrappe — theme-v1/module-goals-pro.jsx · wartet auf:
      belegte Einordnungsbaender … Der WERT ist seit G-512 echt.
    21.73  ffmi
    height-adjusted · aus body_composition_navy
    18–20  Developing
    20–22  Natural trained   [du]      <- die Marke sitzt hier
    22–25  Advanced natural
    25+    Elite / assisted

`[read]` **Die Marke *du* sitzt auf `20-22 Natural trained`** —
**vorher stand sie fest auf `22-25 Advanced natural`, passend zur
erfundenen 22,4.** `[read]` **Die Fehleinstufung ist am Bild
widerlegt, nicht nur im Quelltext.**

### Die Zahl folgt dem Datum — der staerkste Beleg

`[cmd]` **Gemessen 2026-09-26:** `body_composition_navy` gab
**21,81**. `[cmd]` **Gemessen 2026-09-27:** **21,73**.

`[cmd]` **Die Kachel zeigt am 27. genau 21.73.**

`[read]` **Eine feste Zahl haette sich nicht bewegt.** `[read]`
**Dass der angezeigte Wert dem Stichtag folgt, belegt den
Leseweg besser als jeder Vergleich mit einer einzelnen
Messung.**

`[cmd]` **Die Entwurfsfassung unter der Linie zeigt weiterhin
22.3** (`tab-physique.tsx:31`) — **richtig, sie ist die
Referenz** (E-70).

## Abnahme

`[cmd]` **Behoben am 2026-09-26 in `abf33847`**
(`goals(G-510): Bestandsaufnahme, FFMI aus body_composition_navy`).
Der Commit traegt `fehlende-kacheln.tsx` mit +74/-17 und die
Testdatei mit 130 Zeilen.

`[cmd]` **Die feste `22.4` steht nur noch im Kommentar** (`:567`),
der die Behebung beschreibt. Der Wert kommt als Requisite, das Band
rechnet `imBand()` (`:580`) aus dem echten Wert, und die Marke sagt
ausdruecklich: *,,Der WERT ist seit G-512 echt."* (`:592`) — sie
deckt nur noch die Baender.

`[cmd]` **Die Hoehenkorrektur gegen alle 362 Zeilen geprueft:** 362
weichen von `lean / m^2` ab, 362 treffen
`lean / m^2 + 6.1 * (1.8 - m)`. **Der Code rechnet nicht, er
liest.**

### Was daran schiefging, und es war nicht der Code

`[read]` **Der Punkt lag zwei Tage in `todos/`, obwohl Code, Test
und Waechter standen.** Am 28.09. ging deshalb ein Auftrag an Claude
Code, dessen erste Nachweiszeile lautete: ,,messen, was davon schon
behoben ist." **Die Antwort war: alles.**

`[cmd]` **Dasselbe bei G-422** — zwei seiner drei Faelle waren unter
G-421 und G-413 laengst zu. **Zwei von zwei Punkten in einem
Auftrag waren ganz oder teils erledigt.**

`[cmd]` **Gemessen, wie gross das Problem ist:** von 263 offenen
Punkten haben 11 eine Testdatei auf ihre Nummer, und neun davon sind
die gerade laufenden. **In `todos/` sind es drei** — dieser, G-422
und C-236. **Das Signal ist billig und scharf**, und es gehoert
nach A-78: ein Punkt in `todos/`, dessen Nummer einen gruenen Test
hat, ist ein Kandidat fuer den Abschluss.

`[read]` **Der Commit-Betreff taugt dafuer NICHT.** Dieser Punkt
wurde unter `goals(G-510)` behoben, ohne seine eigene Nummer zu
nennen — eine Suche im Verlauf haette ihn verschlafen und
stattdessen 44 Buchhaltungscommits gemeldet.
