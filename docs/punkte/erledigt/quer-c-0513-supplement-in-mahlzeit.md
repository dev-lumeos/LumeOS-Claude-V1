---
nr: C-513
typ: feature
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-512
entscheidung: null
agent: codex
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: 72ed6318
beruehrt:
  tabellen: [nutrition.meal_items]
zahlen:
  gemessen: 2026-09-08
---

# C-513 - ein Supplement in eine Mahlzeit

## Die Punktdatei fehlte

`[cmd]` **Codex:** *,,Fuer C-513 lag keine Punktdatei vor; ich
habe keine erfunden."*

`[read]` **Dritter Fall heute** ? **nach C-495 und C-501.**

`[read]` **Nachgetragen, damit der Bericht einen Ort hat.**

## Das Ziel

Tom, 2026-09-08:

> alle supplements, egal ob im stack oder in nutrition
> verbucht, zaehlen mit in den nutrients makros und mikros
> (und werden separat ausgewiesen) ? und nicht aus dem kopf
> verlieren, dass man auch supplements in ein meal packen kann

`[read]` **Der Anlass war sein Gespraech mit Tobias
(IFBB-Profi): ein Fruehstueck aus Haferflocken, Blaubeeren,
Mandelmus (alle BLS) und Whey.**

## Und die Entscheidung zu A7

Tom: *,,stack ist stack und meal ist meal. allenfalls wenn es
exakt dieselben supplements wie zb whey xy in etwa zur selben
zeit, koennten wir den user nachfragen"*

## Abnahmebedingungen

    A1  ein Supplementprodukt laesst sich einer
        Mahlzeit hinzufuegen.
    A2  seine Naehrwerte zaehlen in die Tagesbilanz.
    A3  sie werden SEPARAT ausgewiesen.
    A4  Toms Beispiel gerechnet.
    A5  ein Produkt mit mehreren Portionsgroessen:
        was passiert?
    A6  ein Produkt ohne Naehrwerte: was passiert?
    A7  Stack und Mahlzeit getrennt. Bei DEMSELBEN
        Produkt in engem Zeitfenster: eine Nachfrage,
        keine Automatik.
    A8  RLS, Gegenprobe, Sicherung, Vollkette, ALLE
        Waechter.

## Bericht

_(steht im Agentenbericht vom 2026-09-08)_

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen, LIVE.**

`[cmd]` **Der CHECK:**

    food_source = ANY (ARRAY['bls','manual','custom',
                             'supplement'])

`[cmd]` **Vier neue Spalten:** `supplement_product_id`,
`supplement_serving_size`, `supplement_serving_quantity`,
`supplement_nutrient_status`.

`[cmd]` **Und der Waechter ist ein TRIGGER:**
`meal_items_supplement_snapshot_guard_trg`.

`[read]` **Nicht nur in der Funktion** ? **auch ein direkter
`INSERT` faellt.**

### Toms Beispiel, gerechnet

    Haferflocken, 60 g          208,8 kcal    7,932 g
    Blaubeeren, 100 g            61,0          0,5 g
    Mandelmus, 30 g             167,7          7,59 g
    ON Gold Standard Whey,
      1 Scoop / 31 g            120,0         24,0 g
    ----------------------------------------------
    Summe                       557,5 kcal   40,022 g

`[cmd]` **120 kcal und 24 g Protein je Scoop** ? **exakt die
Zahlen vom Etikett, das Tom geprueft hat.**

### Der Servier-Snapshot

> *,,Naehrwerte werden als Servier-Snapshot EINGEFROREN."*

`[read]` **Wenn der Hersteller die Rezeptur aendert, bleibt die
vergangene Mahlzeit richtig** ? **das war nicht verlangt und
ist die richtige Entscheidung.**

### A7: 60 Minuten, begruendet

> *,,60 Minuten deckt 495 gemessene Naehepaare ab; 90 Minuten
fuegt KEINE hinzu, 120 Minuten weitere 165 und waere zu
ungenau."*

`[read]` **Er hat drei Fenster gemessen und das gewaehlt, wo
die naechste Stufe nichts bringt** ? **statt eine runde Zahl zu
nehmen.**

`[cmd]` **Und: *,,Fehlende Uhrzeiten erzeugen keinen
Kandidaten."*** ? **keine Nachfrage auf Verdacht.**

### Die Luecken bleiben sichtbar

`[cmd]` **Mehrere Portionsgroessen erzwingen eine explizite
Auswahl. Produkte ohne Naehrwerte bleiben sichtbar als
`no_nutrients_available`.**

`[read]` **Dieselbe Bauform wie C-500 und C-512.**

**Abgenommen.**

