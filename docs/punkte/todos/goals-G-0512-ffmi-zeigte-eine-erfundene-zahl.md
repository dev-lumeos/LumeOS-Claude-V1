---
nr: G-512
typ: befund
modul: goals
schwere: hoch
angelegt: 2026-09-26

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

## Nicht am Schirm belegt

`[read]` **Der Dev-Server lief bei der Messung nicht** (3200 und
3220 beide ohne Antwort) — **der Nachweis am Bild steht aus.**

`[cmd]` **Belegt ist:** Typpruefung, Produktionsbau, sieben
Zusicherungen mit Sabotageprobe, und der echte Wert aus der
Datenbank.
