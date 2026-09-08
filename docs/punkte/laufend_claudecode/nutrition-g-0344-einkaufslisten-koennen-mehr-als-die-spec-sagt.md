---
nr: G-344
typ: befund
modul: nutrition
schwere: hoch
angelegt: 2026-09-07
braucht: []
kind_von: null
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  tabellen: [nutrition.shopping_lists]
zahlen:
  gemessen: 2026-09-07
  listen: 4
  posten: 17
---

# G-344 — Einkaufslisten koennen mehr, als die Spec sagt

## Befund

Tom, 2026-09-07: *,,einkaufslisten kann ich anhand von rezepten
erzeugen, aber danach weder loeschen noch editieren, mal abgesehen
davon dass man einkaufslisten anhand von plaenen macht und nicht
einem rezeptbuch."*

## Die Spec beschreibt nur einen Weg

`[cmd]` **`SPEC_03`, Flow 8, sechs Schritte:** Rezept oeffnen,
Portionen waehlen, generieren, anzeigen, abhaken, teilen.

`[cmd]` **`SPEC_04`, Feature 6:** *,,Generiert aus Rezept:
`POST /api/nutrition/recipes/:id/shopping-list`."*

`[read]` **Kein Loeschen, kein Bearbeiten, kein Weg vom Plan.**

## Aber das Schema kann alles davon

`[cmd]` **`shopping_lists` traegt zwoelf Spalten**, darunter:

    source_type          manual | recipe | meal_plan |
                         supplement_reorder
    recipe_id
    meal_plan_week_id
    status               open | completed | archived

`[cmd]` **Und der CHECK erzwingt die Zuordnung:**

    recipe      -> recipe_id gesetzt, meal_plan_week_id leer
    meal_plan   -> meal_plan_week_id gesetzt, recipe_id leer
    manual      -> beide leer
    supplement_reorder -> beide leer

`[read]` **Die Datenbank kennt den Weg vom Plan seit ihrem Bau.**
`[read]` **Und `manual` heisst: eine Liste ohne Quelle, frei
angelegt.**

`[cmd]` **`status` kennt `archived`** — **die Absicht, eine Liste
wegzulegen, ist im Schema vorgesehen.**

## Was auf `dev` liegt

    Nachweis-Einkaufsliste                     manual
    Lachs mit Suesskartoffel (2 Portionen)     recipe
    Huhn-Reis-Bowl (2 Portionen)               recipe
    Banane-Joghurt-Haferflocken (1 Portionen)  recipe

`[cmd]` **Vier Listen, 17 Posten** — **eine davon `manual`, drei aus
Rezepten, keine aus einem Plan.**

## Und niemand liest sie

`[cmd]` **Keine API-Route unter `apps/web/src/app/api/` nennt
`shopping`.**

`[cmd]` **In `apps/` steht `shopping_list` nur in Tests** —
`plan-lage.test.ts`, `rezept-lage.test.ts`.

`[read]` **Die Tabellen sind gebaut, gefuellt und haben keinen
Aufrufer** — **dieselbe Klasse wie `meal_plan_slots` vor G-336.**

## Was zu entscheiden ist

`[read]` **Toms Einwand trifft die Spec, nicht das Schema:**
**Einkaufslisten aus Plaenen sind der Hauptfall, aus Rezepten der
Nebenfall.**

`[read]` **Wer eine Woche plant, kauft fuer die Woche** — **nicht
fuer ein einzelnes Rezept.**

`[cmd]` **`meal_plan_week_id` zeigt auf eine Woche, nicht auf einen
Plan** — **das passt: man kauft woechentlich, nicht fuer zwoelf
Wochen.**

`[read]` **Und die drei fehlenden Wege sind keine neuen Ideen,
sondern unbelegte Faehigkeiten:** loeschen (`archived`), bearbeiten
(`manual`-Posten), aus dem Plan erzeugen (`meal_plan`).

## Auftrag — die Einkaufslisten anschliessen

**Mitbeauftragt: G-353.** Bericht in diese Datei.

**Beauftragt am 2026-09-08.**

### Was schon steht

`[cmd]` **C-407: DB-Funktionen zum Erzeugen, Lesen und
Archivieren.** **Gleiche `food_id` in Gramm summiert, gleiche
Freitextnamen getrennt.**

`[cmd]` **C-408: `nutrition.user_inventory` mit Abzug beim
Erfassen.**

`[cmd]` **C-409: `nutrition_reorder` ist in beiden CHECKs.**

`[cmd]` **G-345: die Oberflaeche an drei Orten** — Fenster auf der
gemeinsamen Huelle, Knopf an der Planwoche, eigener Reiter mit
Archiv.

`[cmd]` **Und vier Listen mit 17 Posten liegen auf `dev`.**

`[read]` **Was fehlt: der Anschluss.** `[cmd]` **Keine API-Route
nennt `shopping`, in `apps/` steht der Name nur in Tests.**

### 1 · G-344 — anschliessen

`[read]` **Der Hauptfall zuerst** (E-64): **aus einer Planwoche eine
Liste.** `[cmd]` **`meal_plan_week_id` zeigt auf eine Woche, nicht
auf einen Plan.**

`[read]` **Dann: abhaken, bearbeiten, archivieren.**

`[cmd]` **Loeschen gibt es nicht** — **`authenticated` hat kein
DELETE, `status = 'archived'` ist der Weg.**

### 2 · G-353 — die Setup-Karten

`[cmd]` **Du hast sie entworfen: sie haengen an der Leere, nicht am
Konfigurationszustand** — **deshalb braucht es keine Spalte fuer
*weggewischt*.**

`[read]` **Bau sie** — **und melde, wenn eine Karte auf etwas
wartet, das noch nicht steht.**

### Abnahmebedingungen

**Miss jede einzeln, schreib die Zahl in den Bericht.**

    A1  aus einer Planwoche eine Liste erzeugt.
        Zahl: Posten in der Liste / Eintraege in der Woche.
        Und: sieben Tage Huehnchen ergeben EINE Zeile -- belegt.

    A2  abhaken schreibt `is_checked`. Zahl: vorher/nachher.

    A3  archivieren: die Liste verschwindet aus *offen*, bleibt
        lesbar. Zahl: offen vorher/nachher, archiviert
        vorher/nachher.

    A4  E-72: jede angebundene Kachel zeigt Werte oder einen
        benannten Leerhinweis. Zahl: Kacheln / mit Daten /
        mit Leerhinweis.

    A5  E-69: jede angebundene Kachel hat ihre Mockup-Referenz
        unter der Linie. Zahl: angebunden / Referenzen.

    A6  G-353: wie viele Setup-Karten, je Karte die
        Verschwindregel.

### Was nicht zu tun ist

**Nichts in `supabase/` aendern** — **der Leseweg steht.**
**Nichts auf `dev@lumeos.app` schreiben** — **Nachweise auf
`test-user@lumeos.local`.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
