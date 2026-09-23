---
nr: G-494
typ: aufraeumen
modul: supplements
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: C-520
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  dateien:
    - apps/web/src/lib/supplements/produkte-read.ts
zahlen:
  gemessen: 2026-09-08
---

# G-494 - die Form-Nachlese aus G-492 entfernen

## Befund

`[cmd]` **C-520 ist live: `search_supplier_products` gibt
`produktform` zurueck, `p_formen text[]` trifft `Powder` auf
`Powder [E0162]`.**

`[cmd]` **G-492 hat bis dahin eine Nachlese gebaut:
`produkte-read.ts`, 2,8 ms je 500 Zeilen, markiert zum
Entfernen.**

## Ein Haken

`[cmd]` **Die neue Signatur mit `p_formen` hat KEINE
Vorgabewerte** ? **wer sie nutzt, muss alle elf Parameter
uebergeben.**

`[cmd]` **Die alte Signatur (mit Vorgaben) gibt `produktform`
jetzt ebenfalls zurueck** ? **fuer die Nachlese reicht die
alte.**

## Abnahmebedingungen

    A1  die Nachlese ist weg. Belegt.
    A2  die Spalte FORM ist in der Liste gefuellt. Foto.
    A3  der Knopf bietet bei Pulver weiter beides an.
        Foto.
    A4  Laufzeit vorher/nachher.
    A5  vier Module unveraendert.

## Bericht

**Die Nachlese ist weg, und die Form steht trotzdem.**

    A1  die Nachlese ist weg                erfuellt
    A2  die Spalte FORM ist gefuellt        erfuellt
    A3  der Knopf bietet bei Pulver beides  erfuellt
    A4  Laufzeit vorher/nachher             erfuellt
    A5  vier Module unveraendert            erfuellt

`[cmd]` **`supabase/` unberuehrt** — die dortigen Aenderungen sind
Codex' C-531.

### A1 — C-520 selbst nachgemessen, dann geloescht

`[cmd]` **Gemessen 2026-09-23:**

    pg_get_function_result(search_supplier_products)
    -> TABLE(id, marke, name_en, portionsgroesse,
             portionseinheit, packungsgroesse, packungseinheit,
             market_status, gtin, produktform, similarity,
             meidestoff_treffer)

`[cmd]` **BEIDE Signaturen geben `produktform` zurueck** — auch die
alte mit Vorgabewerten. `[read]` **Genau die ruft dieser Leseweg**
(vier benannte Argumente: `p_query`, `p_marke`, `p_market_status`,
`p_limit`).

`[cmd]` **Dein Haken ist damit erledigt, ohne dass ich ihn anfassen
musste:** die neue Signatur mit `p_formen` hat keine Vorgabewerte —
**der Aufruf bleibt, wie er war.** `[cmd]` **Der Waechter sichert
das:** ein `p_formen:` im Aufruf macht ihn rot.

`[cmd]` **Geloescht: `formNachlesen`, `NACHLESE_STUECK`,
`SupplementsClient` und der Aufruf.** `[read]` **Nicht
auskommentiert** (G-163): eine zweite Quelle fuer dieselbe Spalte
laedt dazu ein, die eine zu aendern und die andere zu vergessen.

### A2/A3 — gemessen, nicht angenommen

`[cmd]` **Ueber die API, je Begriff, nach dem Aufwaermen:**

    "Whey"        200 Zeilen   0 ohne Form   2 versch. Formen
    "Vitamin D3"  200 Zeilen   0 ohne Form   7 versch. Formen
    "Creatine"    200 Zeilen   0 ohne Form   6 versch. Formen

`[cmd]` **Am Schirm, zwoelf Zeilen einer Vitamin-D3-Suche:**
**0 leer**, und die Formen stehen ohne E-Code da (G-453/4):
*Softgel Capsule*, *Gummy or Jelly*, *Tablet or Pill*, *Liquid*.

`[cmd]` **A3: das Pulver bietet weiter BEIDES an** — Stack und
Mahlzeit, kein „nur Stack"-Satz. `[read]` **Das ist der Beleg, dass
die Formregel (C-524) weiter trifft:** ohne Form fiele jedes Pulver
auf „nur Stack".

### A4 — die Laufzeit, und was sie wirklich misst

`[cmd]` **Ueber die API, je vier Laeufe nach dem Aufwaermen:**

                   vorher      nachher
    "Whey"         4.676 ms    5.523 ms
    "Vitamin D3"   4.876 ms    5.378 ms
    "Creatine"     4.695 ms    5.242 ms

`[read]` **Die Zahl ist NICHT besser geworden** — und das waere
auch nicht zu erwarten: **die Nachlese kostete 2,8 ms.**

`[cmd]` **In der Datenbank gemessen, dieselbe Funktion:**

    search_supplier_products('Whey', 'alle', NULL, 200)
      erster Lauf   7,5 ms
      danach        1,3 ms / 1,2 ms

`[read]` **Die rund fuenf Sekunden im Browser sind der
Dev-Server**, nicht die Abfrage — **die Differenz zwischen vorher
und nachher (0,7 s) liegt im Rauschen dieser Messung.**

`[read]` **Der Gewinn ist nicht Zeit, sondern eine Quelle weniger:**
eine Kruecke, die mit ihrem eigenen Ablaufdatum im Kopf stand, ist
eingeloest.

### Der Waechter

`[cmd]` **`g494-keine-form-nachlese.test.ts`, 3 Faelle.** `[cmd]`
**`_g494-sabotage.mjs`: 6 Schaeden plus Kontrolle — 7/7.**

`[cmd]` **Erster Lauf: 6/7** — ein mehrzeiliger Suchtext traf in der
CRLF-Datei nicht. `[read]` **Kein blinder Waechter, ein Werkzeug-
fehler** — derselbe wie in G-492, G-493 und G-496, jetzt einzeilig.

`[cmd]` **Ein Fall prueft die Gegenrichtung:** ein Aufruf mit
`p_formen` (der Signatur ohne Vorgabewerte) macht ihn rot.

### Die Fotos

    x-g494-a2-form.png     A2: zwoelf Zeilen, jede mit Form
    x-g494-a3-pulver.png   A3: das Pulver bietet beides

### Neustart noetig?

`[read]` **Nein** — nur `apps/web/src`.

## Abnahme

_(vom Orchestrator)_
