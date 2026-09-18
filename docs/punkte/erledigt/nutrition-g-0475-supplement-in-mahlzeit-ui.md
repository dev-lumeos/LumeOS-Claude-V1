---
nr: G-475
typ: feature
modul: nutrition
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-513
entscheidung: null
erledigt: 2026-09-08
commit: e21a7a13
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/ansicht.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-475 - Supplemente in die Mahlzeit, in der Oberflaeche

## Was C-513 liefert

`[cmd]` **`meal_items.food_source` erlaubt jetzt
`supplement`.**

`[cmd]` **Vier Spalten:** `supplement_product_id`,
`supplement_serving_size`, `supplement_serving_quantity`,
`supplement_nutrient_status`.

`[cmd]` **Toms Beispiel rechnet: 557,5 kcal, 40,022 g
Protein** ? **Whey mit 120 kcal und 24 g.**

## Abnahmebedingungen

    A1  ein Supplement laesst sich einer Mahlzeit
        hinzufuegen. Foto.
    A2  die Tagesbilanz weist es SEPARAT aus. Foto.
    A3  Toms Fruehstueck: Haferflocken, Blaubeeren,
        Mandelmus, Whey. Foto mit der Summe.
    A4  mehrere Portionsgroessen: die Wahl steht.
    A5  ein Produkt ohne Naehrwerte: was steht da?
    A6  A7 aus C-513: dasselbe Produkt im Stack UND
        in der Mahlzeit innerhalb 60 Minuten ->
        die Nachfrage. Foto.
    A7  vier Module unveraendert.
    A8  apps/web 1835 oder mehr, apps/coach 65.

## Bericht

**Claude Code, 2026-09-18.**

### Der Stand in einem Satz

`[read]` **Der Schreibweg steht und ist gegen die Datenbank
belegt** ? **die OBERFLAECHE ist nicht gebaut.** `[cmd]` **A1,
A2, A3 und A6 sind damit NICHT erfuellt** ? es gibt keine Fotos,
weil es nichts zu fotografieren gibt.

`[read]` **Ich melde das, statt vier Fotos von etwas zu machen,
das ich nicht gebaut habe.**

### Zwei Berichtigungen zum Auftrag

`[cmd]` **1 ? Toms Fruehstueck steht NICHT in der Datenbank.**

    SELECT count(*) FROM nutrition.meal_items
    WHERE food_source='supplement';   ->  0

`[read]` **Die Zahlen aus dem Auftrag (557,5 kcal, 40,022 g)
sind eine Rechnung, kein erfasster Tag.** `[read]` **Der Weg
funktioniert ? aber durch ihn ist noch nichts gegangen.**

`[cmd]` **2 ? der Trigger RECHNET nicht, er PRUEFT.**

`[read]` **Der Auftrag sagt:** *,,Ein Trigger schuetzt den
Naehrwert-Snapshot."* `[cmd]` **Gemessen: er schuetzt ihn, indem
er ihn NACHRECHNET und jede Abweichung abweist.**

`[cmd]` **Ein erster Versuch schickte nur Produkt, Portion und
Anzahl:**

    C513: supplement nutrient snapshot differs from its
          evidenced product serving

`[read]` **Der Aufrufer muss den GANZEN Schnappschuss
schreiben** ? neun Makros plus 22 Mikronaehrstoffe, je genau
`Option x Anzahl`.

### Was gemessen wurde, bevor gebaut wurde

`[cmd]` **`nutrition.meal_items`, vier CHECKs:**

    amount_g          MUSS NULL sein bei 'supplement'
    serving_quantity  NOT NULL und > 0
    nutrient_status   'available' | 'no_nutrients_available'
    portion_*         alle drei NULL

`[cmd]` **`supplier_product_nutrient_serving_options`:** 116.200
Zeilen ueber 113.264 Produkte, **2.760 davon mit mehr als einer
Portion** (das ist A4).

`[cmd]` **Toms Whey, gemessen:**

    Gold Standard 100% Whey Vanilla Ice Cream
    31 Gram(s)   ->  120 kcal   24 g Protein

`[read]` **Genau die Zahlen vom Etikett, das Tom mit Tobias
geprueft hat.**

### Der Schreibweg ? gegen die Datenbank belegt

`[cmd]` **In einer Transaktion eingefuegt und
zurueckgerollt:**

    Anzahl 1  ->  120,0000 kcal   24,0000 g   'available'
    Anzahl 2  ->  240,0000 kcal   48,0000 g

`[read]` **Die Multiplikation stimmt, der Trigger nimmt es an.**
`[cmd]` **Beide Laeufe mit `ROLLBACK`** ? **in der Datenbank
steht nichts von mir.**

### A4 ? mehrere Portionsgroessen: die Wahl steht

`[cmd]` **Der Leseweg holt ALLE Portionen eines Produkts mit**
(`sucheSupplemente`) ? **ohne sie weiss die Oberflaeche nicht,
welche Wahl sie anbieten darf.**

`[cmd]` **Die Zeile im Pulldown traegt die Zahlen, die die Wahl
tragen:**

    31 Gram(s) · 120 kcal · 24 g Protein

`[read]` **Ohne Naehrwerte bleibt die Groesse allein stehen** ?
keine erfundene Null.

### A5 ? ein Produkt ohne Naehrwerte

`[cmd]` **Der Trigger verlangt dann:** `no_nutrients_available`,
**kein `serving_size`, KEINEN Naehrwert, `nutrients = {}`** ?
sonst *,,must remain visibly unknown"*.

`[read]` **Was dasteht:**

> Für dieses Produkt sind keine Nährwerte hinterlegt. Es wird
> erfasst, zählt aber nicht in die Tagesbilanz.

`[read]` **Kein ,,0 kcal"** ? das waere eine Behauptung.
`[read]` **Kein Strich** ? der saehe aus wie ein fehlender Wert.
**Ein Satz, der die Lage benennt** (E-72).

### A6 ? die Nachfrage, mit einer Einschraenkung

`[cmd]` **GEMESSEN: die Bruecke, die der Auftrag voraussetzt,
gibt es nicht.**

    supplements.intake_logs       -> stack_item_id
    supplements.stack_items       -> supplement_id  (SUBSTANZ)
    supplements.supplier_products -> KEINE Substanzspalte

`[read]` **Der Stack fuehrt SUBSTANZEN, das Tagebuch PRODUKTE.**
`[cmd]` **,,Dasselbe Produkt" ist mit diesen Daten nicht
entscheidbar.**

`[cmd]` **Entscheidbar ist der NAME** ? `intake_logs` traegt
`supplement_name_snapshot` (gemessen: *Magnesium*, *Creatine
Monohydrate*, *Vitamin D3*, 810 Zeilen).

`[read]` **Die Rechenregel steht** (`fragtNach`, 60 Minuten, die
Frage als FRAGE formuliert) ? **die Verknuepfung Produkt/Substanz
fehlt in der Datenbank.** `[cmd]` **Gemeldet, nicht gebaut** ?
`supabase/` ist gesperrt.

### Ein fremder Waechter wurde rot ? zu Recht

`[cmd]` **G-138 verlangt: genau EINE Datei beruehrt
`intake_logs`.** `[read]` **Mein Leseweg war die zweite** ? und
die Probe zaehlt je DATEI, nicht je Aufruf: mein `.insert()` auf
`meal_items` und das `from('intake_logs')` standen zusammen.

`[cmd]` **Nicht den Waechter aufgeweicht, sondern die Lesestelle
umgezogen** ? nach `lib/supplements/stack-write.ts`, wo die
Tabelle hingehoert. `[cmd]` **G-138 ist wieder gruen (11/11).**

### A7 ? die vier Module

    /v2/nutrition     195.458 Zeichen / 13 Kacheln
    /v2/training      104.988 / 11
    /v2/medical       511.300 / 11
    /v2/goals          50.405 / 18
    /v2/supplements   480.610 / 18

`[read]` **Die Kachelzahlen sind unveraendert.** `[cmd]`
**`/v2/supplements` bewegt sich weiter** (480.610 gegen 482.399
im letzten Lauf) ? **Codex arbeitet an C-515**, und ich habe
dort nichts angefasst.

### A8 ? die Waechter

    apps/web     1857 Proben   1857 gruen   0 rot
    apps/coach     65 Proben     65 gruen   0 rot
    tsc web        exit 0
    next lint      keine Fehler

**Neu: 13 Proben in `g475-supplement-posten.test.ts`.**

`[cmd]` **Sabotage ? alle NEUN Faelle ROT, die Kontrolle
GRUEN:**

    Portion egal                ROT
    Anzahl 0 erlaubt            ROT
    Stand geraten               ROT
    Satz behauptet 0 kcal       ROT
    Vorschau ohne Anzahl        ROT
    Fenster weg                 ROT
    amount_g gesetzt            ROT
    Makros nicht uebernommen    ROT
    null in nutrients           ROT
    KONTROLLE                 GRUEN

#### Eine eigene Probe war blind

`[cmd]` **`/amount_g:\s*null/` traf auch
`portion_amount_g: null`** in derselben Datei ? **die Sabotage
`amount_g: 1` blieb gruen.** `[read]` **Jetzt mit Wortanfang**
(`(?<![A-Za-z_])amount_g:`).

### Was gebaut wurde

    NEU        lib/nutrition/supplement-posten-lage.ts
                 serverfrei: Typen, Pruefung, Vorschau,
                 A5-Satz, A6-Rechenregel
               lib/nutrition/supplement-posten-read.ts
                 Suche mit Portionen, Schreibweg mit
                 vollem Schnappschuss
               lib/nutrition/__tests__/g475-supplement-posten.test.ts
               tools/_g475-sabotage.mjs   9 + 1 Kontrolle

    GEAENDERT  lib/supplements/stack-write.ts
                 `letzteEinnahmen` (A6) ? dorthin, wo
                 `intake_logs` hingehoert (G-138)

`[cmd]` **Nichts in `supabase/`, nichts committet.**

### Was offen bleibt ? und was als naechstes zu tun ist

`[read]` **DIE OBERFLAECHE.** `[cmd]` **A1, A2, A3 und A6 sind
nicht erfuellt** ? es fehlen:

    ein Suchfeld fuer Produkte im Tagebuch
    das Pulldown der Portionsgroessen (A4 steht als Rechenregel)
    der Posten in der Mahlzeitenliste
    die SEPARATE Zeile in der Tagesbilanz (A2)
    die Rueckfrage beim Doppeleintrag (A6)

`[read]` **Der Unterbau dafuer steht und ist belegt** ? ein
Folgeauftrag muss nur noch die Kacheln bauen, nicht mehr messen.

`[read]` **Und die fehlende Bruecke Produkt/Substanz** ist ein
Datenbankpunkt: **ohne sie kann A6 nur ueber den Namen
vermuten.**

`[read]` **Ein Neustart ist NICHT noetig** ? nur
`apps/web/src`.

## Teilabnahme

**2026-09-08, Orchestrator. Unterbau ja, Oberflaeche nein.**

`[cmd]` **Drei neue Dateien:** `supplement-posten-read.ts`,
`supplement-posten-lage.ts`,
`__tests__/g475-supplement-posten.test.ts`.

`[cmd]` **Proben: web 1857/1857, coach 65/65.**

### Zwei meiner Auftragspraemissen waren falsch

**1** ? `[cmd]` **Selbst nachgemessen: 0 Zeilen mit
`food_source=supplement`.**

> *,,Toms Fruehstueck steht nicht in der Datenbank. Die 557,5
kcal sind eine RECHNUNG, kein erfasster Tag."*

`[read]` **Ich habe C-513s Rechenbeispiel als erfasste Daten
in den Auftrag geschrieben.**

**2** ? **Der Trigger rechnet nicht, er PRUEFT.**

> *,,Mein erster Versuch schickte nur Produkt, Portion und
Anzahl und fiel: *snapshot differs from its evidenced product
serving*. Der Aufrufer muss den GANZEN Schnappschuss schreiben
? neun Makros plus 22 Mikronaehrstoffe."*

`[read]` **Er hat es durch einen Einfuegeversuch gefunden, nicht
durch Lesen.**

### Was belegt ist, mit ROLLBACK

    1 x 31 Gram(s)   120 kcal, 24 g   genau Toms Etikett
    2 x 31 Gram(s)   240 kcal, 48 g

`[read]` **Nichts steht in der Datenbank** ? **beide Laeufe
zurueckgerollt.**

### A5 ist gebaut, und der Satz ist richtig

> *,,Fuer dieses Produkt sind keine Naehrwerte hinterlegt. Es
wird erfasst, zaehlt aber nicht in die Tagesbilanz."*

`[read]` **Kein *,,0 kcal"*, kein Strich** ? **derselbe Gedanke
wie bei den Luecken in C-500 und C-512.**

### A6 ist nicht baubar, und das ist ein Befund

> *,,Die Bruecke, die der Auftrag voraussetzt, gibt es nicht ?
`intake_logs` -> `stack_items.supplement_id` fuehrt SUBSTANZEN,
das Tagebuch fuehrt PRODUKTE, und `supplier_products` hat keine
Substanzspalte. *Dasselbe Produkt* ist nicht entscheidbar;
entscheidbar ist nur der Name."*

`[cmd]` **Selbst nachgemessen: `supplier_products` hat keine
Spalte mit `supplement` oder `substan`.**

`[read]` **C-513s A7 hat eine Nachfragefunktion gebaut, die
auf `supplier_product_id` vergleicht** ? **im Stack steht
aber keine.**

`[cmd]` **Als C-518.**

### Und ein fremder Waechter, richtig behandelt

> *,,G-138 verlangt, dass nur EINE Datei `intake_logs`
beruehrt. Statt ihn aufzuweichen, ist die Lesestelle nach
`stack-write.ts` gezogen ? 11/11 wieder gruen."*

`[read]` **Die Regel eingehalten, nicht die Regel geaendert.**

**Teilabnahme. Der Unterbau steht, die Oberflaeche fehlt.**

