---
nr: G-340
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-09-02
braucht: [G-339]
kind_von: G-232
entscheidung: null
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/kopfknoepfe.tsx
zahlen:
  gemessen: 2026-09-02
---

# G-340 — Quick-Add hat keinen Schreibweg

## Befund

Aus G-294, Claude Code, 2026-09-02.

`[cmd]` **Die Komponente ist gebaut, der Schreibweg fehlt.**

`[read]` **Und die Spec hat eine Luecke an derselben Stelle** —
**der Punkt G-232 beschrieb das Fehlen falsch.**

## Zu klaeren

`[read]` **Was soll Quick-Add schreiben?** `[cmd]` **Seit G-320 gibt
es `FoodSuchModal` mit Live-Vorschau, seit G-336 das
Mahlzeiten-Modal.**

`[read]` **Vielleicht ist Quick-Add ueberfluessig geworden** —
**oder es ist der Weg fuer den Fall ohne Suche: eine Zahl, kein
Lebensmittel.**

`[read]` **Das gehoert entschieden, bevor der Schreibweg entsteht.**

## Auftrag

**Mitbeauftragt mit G-341 am 2026-09-02.** Der Auftragstext
und der Bericht stehen dort.

## Gemessen am 2026-09-02: nicht ueberfluessig

`[cmd]` **Quick-Add ist der einzige Zugang zu
`food_source = 'manual'`.**

`[cmd]` **Das Schema sieht den Wert ausdruecklich vor** — **und kein
Weg bedient ihn.**

`[read]` **Der Orchestrator hatte gefragt, ob es seit G-320 und
G-336 ueberholt sei.** `[read]` **Es hat einen Zweck, den kein
anderer Weg erfuellt: eine Zahl ohne Lebensmittel.**

**Bauen oder begruenden, warum nicht** — **die Entscheidung gehoert
Tom.**

## Auftrag — Quick-Add bauen

**Tom, 2026-09-02: *,,Quick-Add bauen."***

`[read]` **Vorbereitet am 2026-09-02.**

### Warum es gebraucht wird

`[cmd]` **Du hast gemessen: Quick-Add ist der einzige Zugang zu
`food_source = 'manual'`.**

`[cmd]` **Alle 9.051 `meal_items` tragen heute `bls`** — **`manual`
und `custom` sind unbenutzt.**

`[read]` **Der Fall: wer im Restaurant isst, kennt die Kalorien vom
Menue, aber kein Lebensmittel.** `[read]` **Er soll eine Zahl
eintragen koennen, ohne zu suchen.**

### Der CHECK sagt genau, was noetig ist

    CHECK (food_source IN ('bls', 'manual', 'custom'))

    CHECK ( (food_source = 'bls'    AND food_id IS NOT NULL
                                    AND custom_food_id IS NULL)
         OR (food_source = 'custom' AND food_id IS NULL
                                    AND custom_food_id IS NOT NULL)
         OR (food_source = 'manual' AND food_id IS NULL
                                    AND custom_food_id IS NULL) )

`[read]` **Ein manueller Posten hat weder `food_id` noch
`custom_food_id`** — **er traegt nur seinen Namen und seine Zahlen.**

### Die Pflichtspalten

    meal_id            in welche Mahlzeit
    user_id
    food_source        'manual'
    food_name          Freitext, vom Nutzer
    amount_g           PFLICHT -- auch bei manuell
    nutrients          PFLICHT -- jsonb
    frozen_at          PFLICHT
    measurement_source 'manual'

`[cmd]` **`measurement_source` kennt fuenf Werte:** `manual`,
`device`, `import`, `admin`, `seed`.

`[read]` **`amount_g` ist Pflicht, auch ohne Lebensmittel** —
**miss, was dort sinnvoll steht, wenn jemand nur *450 kcal*
eintraegt.**

### Was der Nutzer eingibt

`[read]` **Mindestens: Name und Kalorien.** `[read]` **Optional die
drei Makros** — `prot625`, `fat`, `cho`.

`[cmd]` **Und `nutrients` ist Pflicht** — **miss, ob ein leeres
Objekt reicht oder ob die Eingaben dorthin gehoeren.**

`[read]` **Der Rest der 138 Codes bleibt leer** — **und genau dafuer
gibt es seit G-341 die Spalte, die sagt, wie viele Tage einen Wert
haben.**

### Wo es hingehoert

`[cmd]` **`QuickAddModal` steht in `modale.tsx:325`, gerufen ueber
`modal === 'quickadd'`.**

`[cmd]` **Und seit G-336 gibt es das Mahlzeiten-Modal auf
gemeinsamer Huelle** — **dieselbe Machart, keine neue.**

### Was nicht zu tun ist

**Kein `custom_food`** — das ist Flow 6, `foods_custom` traegt 0
Zeilen.
**Keine Naehrwertschaetzung** — C-378: wenn die Daten nicht da sind,
erfinden wir sie nicht.
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen.**

### Nachweis

    manueller Posten   angelegt, food_source = 'manual', CHECK haelt
    amount_g           was steht dort, begruendet
    nutrients          leeres Objekt oder Eingaben, begruendet
    Tagessumme         der Posten zaehlt mit
    Naehrstoffreiter   der Tag bleibt unvollstaendig, ehrlich
    Bildschirmfoto     vorher / nachher

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
