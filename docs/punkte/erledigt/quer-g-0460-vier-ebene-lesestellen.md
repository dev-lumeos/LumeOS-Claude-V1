---
nr: G-460
typ: fehler
modul: quer
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: G-458
entscheidung: null
erledigt: 2026-09-08
commit: 96e80560
beruehrt:
  dateien:
    - apps/web/src/lib/koerper/hierarchie.ts
zahlen:
  gemessen: 2026-09-08
---

# G-460 - vier Lesestellen auf die gefallene Spalte ebene

## Befund

Aus G-458, Codex, 2026-09-08:

> *,,`gefallene-spalten-pruefen`: VIER bestehende
`ebene`-Lesestellen nach C-484."*

`[cmd]` **C-484 hat `public.koerperflaechen.ebene`
entfernt** ? **E-81: `parent_id` traegt die Tiefe.**

`[read]` **Vier Stellen lesen sie noch.**

## Warum es zaehlt

`[read]` **Eine Lesestelle auf eine gefallene Spalte gibt
`undefined`, keinen Fehler** ? **dieselbe Falle wie der
Vorgabewert in G-450.**

`[cmd]` **G-435 hat drei Zeilen nachgezogen** ? **vier sind
geblieben.**

## Was zu tun ist

`[cmd]` **`gefallene-spalten-pruefen` nennt sie** ? **miss, ob
sie wirken oder toter Code sind.**

`[read]` **Ein toter Zweig ist etwas anderes als eine falsche
Anzeige.**

## Bericht

**Claude Code, 2026-09-16.**

### Der Stand in einem Satz

`[read]` **Keine der Lesestellen greift auf eine Spalte zu** ?
**alle acht sind Falschmeldungen eines Waechters, der ein WORT sucht
statt eines ZUGRIFFS.**

### Es waren acht, nicht vier

`[cmd]` **Der Waechter meldete beim ersten Lauf ACHT Stellen** ?
vier auf `ebene`, **und vier auf `allergies`.**

`[cmd]` **Die zweite Spalte ist heute um 07:05 Uhr gefallen:**
`20260916070000_g458_drop_legacy_food_preference_allergies.sql`.
`[read]` **Der Auftrag konnte sie nicht kennen** ? die Migration kam
nach seiner Abfassung.

### A1 ? die Tabelle

    Stelle                              wirksam?   was es wirklich ist
    ----------------------------------------------------------------
    lib/nutrition/generated/
      such-wortschatz.ts                WEDER       ein deutsches WORT
    lib/koerper/muskelbaum.ts           WIRKSAM     Rekursionszaehler
    lib/koerper/ebenen.ts               WIRKSAM     Feldtyp `weg.length`
    v2/recovery/tab-messwerte.tsx       WIRKSAM     zeigt den Zaehler
    ----------------------------------------------------------------
    app/nutrition/foods/page.tsx        WIRKSAM     RPC-Feld
    v2/nutrition/tab-vorlieben.tsx      WIRKSAM     RPC-Feld
    v2/nutrition/vorlieben-aktionen.ts  WIRKSAM     RPC-Feld
    lib/nutrition/vorlieben-lesen.ts    WIRKSAM     RPC-Feld

`[read]` **KEINE ist toter Code, und KEINE ist eine falsche Anzeige**
? **das ist die dritte Moeglichkeit, die der Auftrag nicht vorsah:
sie wirken, aber sie lesen keine Spalte.**

**1** ? `[cmd]` **`such-wortschatz.ts:4845` ist das Wort `'ebene'`**,
alphabetisch zwischen `'ebenbild'` und `'ebenheit'`, in einem
Verzeichnis von **21.890 Woertern** aus `dictionary-de.txt` und den
BLS-Namen. **Mit der Spalte hat es nichts zu tun.**

**2** ? `[cmd]` **`muskelbaum.ts:50` ist ein REKURSIONSZAEHLER:**
`function ast(k, ebene)` ? gerechnet aus `parent_id`, mit
Tiefenbremse bei 6. `[read]` **Genau das, was E-81 wollte:** die
Tiefe kommt aus dem Baum, nicht aus einer Spalte.

**3** ? `[cmd]` **`ebenen.ts:68` ist ein Feldtyp** ? `ebene?: number`,
im Kommentar darueber dokumentiert als *„Die Ebene im Baum ?
`weg.length`"*.

**4** ? `[cmd]` **`tab-messwerte.tsx` liest den gerechneten Wert** ?
`a` kommt aus `baueBaum` (Stelle 2), nicht aus der Datenbank.

**5 bis 8** ? `[cmd]` **Die vier `allergies`-Stellen lesen das
RPC-Feld**, nicht die Spalte. **`nutrition.food_preferences_read`
liefert `allergies` weiterhin** ? jetzt aus `public.user_allergies`
(C-498).

### Der entscheidende Beleg: kein einziges `.select()`

`[cmd]` **Alle Lesewege auf `koerperflaechen` und `muscle_groups`
durchgesehen:**

    hierarchie-read.ts:66  .select('id,parent_id,code,name_de,
                                    name_en,art,muscle_group_id')
    muskelbaum-read.ts:36  .select('id,name,parent_id')

`[read]` **Keine Spaltenliste nennt `ebene`** ? G-435 hat das schon
nachgezogen.

`[cmd]` **Und in der Datenbank gemessen:**

    ebene-Spalte in koerperflaechen      0
    allergies-Spalte in food_preferences 0
    RPC liefert allergies                ["lactose", "soja"]

### Die Gegenprobe am Schirm

`[read]` **Ein `undefined` waere hier kein Fehler, sondern ein
`NaN`** ? die Einrueckung rechnet `(a.ebene - 1) * 14`. **Dieselbe
Falle wie der Vorgabewert in G-450: kein Typfehler, keine Meldung.**

`[cmd]` **Gemessen auf `/v2/recovery?tab=muscles`:**

    Zeilen                     105
    Einrueckungen        0 / 14 / 28 / 42   = (ebene-1) * 14
    NaN                          0
    Schriftgroessen   11,5 / 12 / 13,5 px   = die drei ebene-Zweige

`[read]` **Der Wert ist da, er stimmt, und er kommt aus dem
gerechneten Baum.**

`[cmd]` **Und die Vorlieben zeigen drei Allergien**, obwohl die
Spalte seit 07:05 Uhr weg ist.

### A2 ? warum der Waechter geaendert wurde

`[read]` **Er suchte das WORT, nicht den ZUGRIFF** ? mit Wortgrenze
und ohne Kommentare, aber eben nur den Namen.

`[read]` **Sein eigener Kopf sagt, worum es geht:** *„Ein `.select()`
auf eine fehlende Spalte laesst JEDE Zeile scheitern."* **Danach wird
jetzt gesucht:**

    .select('…,ebene,…')                    Spaltenliste
    .eq/.neq/.in/.order/.filter('ebene')    Filter
    ->'ebene' / ->>'ebene'                  jsonb

`[read]` **Acht Falschmeldungen erziehen dazu, einen Waechter
abzuschalten** ? **das ist schaedlicher als keine Pruefung:** wer die
Meldung gewohnt ist, uebersieht die echte.

`[cmd]` **Ergebnis: 22 gefallene Spalten, 498 Codedateien, kein
lebender Lesepfad ? GRUEN.**

### A4 ? die Gegenprobe

    neue ebene-Spalte in .select()                  ROT
    neuer .eq('ebene', ...)                         ROT
    neuer .order('allergies')                       ROT
    (Kontrolle) das blosse Wort im Kommentar      gruen

`[read]` **Die Kontrollprobe ist der Kern:** sie MUSS gruen bleiben.
**Ohne sie haette ich nur gemessen, dass der Waechter auf
Dateiaenderungen anspringt** ? und genau das war sein alter Fehler.

### Was gebaut wurde

    GEAENDERT  tools/gefallene-spalten-pruefen.mjs
               Zugriffsformen statt Wortsuche, mit der Messung
               im Kopf

    NEU        tools/_g460-ebene.mjs   die Schirmmessung

`[cmd]` **Keine der acht Stellen wurde angefasst** ? **es gab nichts
zu beheben.** `[cmd]` **Nichts in `supabase/`, nichts committet.**

### Was offen bleibt

`[read]` **Der Waechter prueft jetzt schaerfer und faengt damit
weniger.** `[cmd]` **Ein Zugriff ueber eine Variable**
(`.select(spalten)` mit `spalten` aus einer Konstante) **wird nicht
gefunden** ? das war vorher auch so, nur unsichtbar hinter den
Falschmeldungen. **Gemeldet, nicht zugedeckt.**

## Abnahme

**2026-09-08, Orchestrator.**

> *,,Es waren ACHT, nicht vier, und KEINE ist ein
Spaltenzugriff."*

`[cmd]` **Vier auf `ebene`, vier auf `allergies`** ? **die
zweite Spalte fiel um 07:05, NACH Abfassung meines
Auftrags.**

### Die dritte Moeglichkeit, die mein Auftrag nicht vorsah

`[read]` **Ich fragte: *,,wirksam oder toter Code?"***

> *,,wirksam UND TROTZDEM KEIN Spaltenzugriff."*

    such-wortschatz.ts   das deutsche WORT, zwischen
                         ebenbild und ebenheit
    muskelbaum.ts        Rekursionszaehler aus parent_id
    ebenen.ts            Feldtyp, dokumentiert als weg.length
    tab-messwerte.tsx    zeigt den gerechneten Zaehler
    4x allergies         RPC-Feld, nicht Spalte

`[cmd]` **Kein `.select()` im Code nennt eine der beiden
Spalten.**

`[cmd]` **Am Schirm gegengeprobt: 105 Zeilen, Einrueckungen
0/14/28/42 = (ebene-1)x14, 0 NaN.**

### Der Waechter suchte das Wort, nicht den Zugriff

> *,,Obwohl sein eigener Kopf sagt, worum es geht: *Ein
`.select()` auf eine fehlende Spalte laesst JEDE Zeile
scheitern.*"*

> *,,Acht Falschmeldungen erziehen dazu, einen Waechter
ABZUSCHALTEN; das ist schlimmer als keine Pruefung."*

`[read]` **Derselbe blinde Fleck wie in G-453 und G-455** ?
**Zeichenkette statt Wirkung.**

`[cmd]` **Jetzt sucht er Spaltenform.**

**Abgenommen.**

