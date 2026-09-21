---
nr: G-491
typ: fehler
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-484
entscheidung: null
erledigt: 2026-09-08
commit: d47e68cb
beruehrt:
  dateien:
    - apps/web/src/app/v2/supplements/tab-produkte.tsx
    - apps/web/src/lib/supplements/produkt-filter-lage.ts
    - apps/web/src/lib/supplements/__tests__/g491-leersatz-nennt-jeden-filter.test.ts
zahlen:
  gemessen: 2026-09-21
---

# G-491 - die Produkttabelle bleibt im Browser leer

## Befund

Aus G-484, Claude Code, 2026-09-08:

> *,,Meine Browserprobe konnte nur den Whey oeffnen ? die API
liefert fuer andere Produkte 200 mit 200 Zeilen, im Browser
blieb die Tabelle leer. Ursache nicht gefunden."*

`[read]` **Die Daten kommen, der Schirm zeigt sie nicht.**

`[cmd]` **Und A5/A6 aus G-484 sind deshalb nur ueber den
Waechter belegt, nicht ueber ein Foto.**

## Abnahmebedingungen

    A1  welche Suchbegriffe laufen leer? Gemessen.
    A2  die Ursache benannt.
    A3  behoben, Foto mit einer Kapsel und einem
        Pulver.
    A4  A5/A6 aus G-484 mit Foto nachgeliefert.

## Bericht

**Die Tabelle war nie leer ? sie war GEFILTERT.** `[read]` **Und
der Satz, der das erklaeren sollte, nannte den falschen Filter.**

    A1  welche Begriffe leer laufen        erfuellt
    A2  die Ursache benannt                erfuellt
    A3  behoben, Foto Kapsel + Pulver      erfuellt
    A4  G-484/A5+A6 mit Foto               erfuellt
    A5  vier Module unveraendert           erfuellt
    A6  apps/web 1919/1919, coach 65/65    erfuellt

`[cmd]` **`supabase/` unberuehrt** ? die dortigen Aenderungen sind
Codex' C-530.

### A1 ? gemessen, im Browser und an der API zugleich

`[cmd]` **`tools/_g491-messen.mjs`, je Begriff ein FRISCHER
Seitenaufbau** (sonst traegt der vorige Lauf seinen Zustand mit):

    Begriff                             API   Schirm
    Gold Standard 100% Whey Vanilla …   200      1
    Ultraplex Vitamin D3                200      0
    Vitamin D3                          200      0
    Creatine                            200      0
    Whey                                200      7
    Micronized Creatine Monohydrate     200      0

`[read]` **Vier von sechs laufen leer** ? und die API liefert bei
allen sechs 200 Zeilen.

`[cmd]` **Der Schirm sagte den Grund selbst**, nur eben den
falschen:

> *,,Kein Produktname enthaelt ,Micronized Creatine Monohydrate' in
> der Kategorie ,protein'."*

### A2 ? die Ursache hat drei Teile, und ich hatte zwei davon falsch

**1 ? ein gespeicherter Filter, der jeden Neuladen ueberlebt.**

`[cmd]` **Gelesen am 2026-09-21 in `public.user_display_preferences`,
Schluessel `supplements.produkt_filter`:**

    kategorie    protein
    form         Powder [E0162]
    marken       ["Optimum Nutrition"]
    status       On Market
    allergienAn  true

`[read]` **Das ist G-467, und es arbeitet richtig** ? Tom wollte
gespeicherte Filter. `[read]` **Die Speicherung ist NICHT der
Fehler und wurde nicht angeruehrt.**

**2 ? jeder Filter schaltet die Smartsuche ab.**

`[cmd]` **Gemessen** (`tools/_g491-anteile.mjs`, je Filter EINZELN
angelegt; die Spalte `weg` kommt aus der Antwort selbst):

    "Ultraplex Vitamin D3"
      200  smart    ohne Filter
        0  einfach  + kategorie=protein
        0  einfach  + form=Powder [E0162]
        0  smart    + marke=Optimum Nutrition

`[read]` **Sobald EIN Filter gesetzt ist, kippt der Weg von `smart`
(C-495) auf `einfach` (`ILIKE`)** ? und dann entscheidet der
genaue Text.

**3 ? und das ist der eigentliche Fehler: der Leersatz nannte den
falschen Filter.**

`[cmd]` **Derselbe Lauf, anderer Begriff:**

    "Micronized Creatine Monohydrate"
      200  smart    ohne Filter
        0  einfach  + kategorie=protein
       10  einfach  + form=Powder [E0162]
        2  smart    + marke=Optimum Nutrition
        0  einfach  ALLE VIER

`[cmd]` **In der Datenbank gegengeprueft: alle 18 Zeilen dieses
Namens SIND Powder**, und keine traegt die Marke `Optimum
Nutrition` ? sie heisst dort `ON Optimum Nutrition`.

`[read]` **Es war die MARKE, die sie nahm. Der Satz behauptete die
Kategorie.**

`[cmd]` **Und `form` kam im Satz ueberhaupt nicht vor** ? obwohl
er der Filter ist, der am haeufigsten greift.

`[read]` **Ein Vermerk mit falschem Grund ist schlimmer als
keiner** ? er schickt den Leser zum falschen Regler. `[read]`
**Genau das ist mir in G-484 passiert:** ich habe den Satz
gelesen, ihm geglaubt, und die Ursache nicht gefunden.

### A3 ? behoben, und an EINER Stelle

`[cmd]` **Der Satz wird nicht mehr im JSX gebaut, sondern in
`produkt-filter-lage.ts`** ? **dort stand schon `aktiveFilter`,
die Zaehlregel fuer die Zahl am Filterknopf.**

`[read]` **Zwei Stellen mit zwei Regeln liessen die Zahl am Knopf
und den Satz darunter auseinanderlaufen** ? und eine Regel im JSX
ist nicht pruefbar.

`[cmd]` **Neu: `wirkendeFilter()` und `grundFuerLeer()`.** `[cmd]`
**Der Satz zaehlt jetzt JEDEN wirkenden Filter auf:**

> *,,Kein Produkt enthaelt ,Micronized Creatine Monohydrate' und
> passt zugleich zu Kategorie ,protein', Darreichungsform ,Powder
> [E0162]', Marke ,Optimum Nutrition' und deine Allergenmeidung.
> Mit gesetztem Filter sucht LumeOS auf genauen Text ? die
> Smartsuche, die Fehleingaben versteht, laeuft nur ohne Filter."*

`[read]` **Zwei Regeln, bewusst verschieden:**

    aktiveFilter       zaehlt die ABWEICHUNG von der Vorgabe
                       (die Zahl am Knopf)
    wirkendeFilter     nennt, was WIRKT
                       (der Satz darunter)

`[cmd]` **Deshalb steht `On Market` NICHT im Satz** (es ist die
Vorgabe, und stuende es da, saehe jeder Leersatz nach einem
gesetzten Filter aus), **die eingeschaltete Allergenmeidung aber
schon** ? sie nimmt Zeilen weg, Vorgabe hin oder her.

### A4 ? G-484/A5 und A6, jetzt mit Foto

`[cmd]` **Beide Tafeln ueber die Wege der Anwendung geoeffnet:**

    Kapsel   Ultraplex Vitamin D3 (Elevation Health)
             Capsule [E0159]
             -> NUR "In den Stack", daneben der Satz
                "Diese Darreichungsform laesst sich nicht
                 untermischen - sie gehoert in den Stack,
                 nicht in eine Mahlzeit."

    Pulver   Gold Standard 100% Whey Chocolate Hazelnut
             (ON Optimum Nutrition), Powder [E0162]
             -> BEIDES: "In den Stack" UND "Zu einer Mahlzeit"

### Warum meine G-484-Probe nur den Whey oeffnen konnte

`[read]` **Zwei Gruende, und ich hatte beide nicht gesehen.**

`[cmd]` **Der erste ist der gespeicherte Filter oben** ? `protein`
+ `Powder` + `Optimum Nutrition` liess nur Whey-Produkte durch.
**Den Filter hatten meine eigenen frueheren Proben gesetzt.**

`[cmd]` **Der zweite ist eine Wettlaufsituation in meinem
Werkzeug:** die Probe wartete eine FESTE Zeit und zaehlte dann.
`[read]` **Der Filter-Effekt laeuft aber NACH dem Laden und stoesst
die Suche neu an** ? wer vorher zaehlt, zaehlt null. `[cmd]`
**Jetzt wird auf eine Zeile gewartet, nicht auf die Uhr.**

`[cmd]` **Und ein dritter Fallstrick beim Messen selbst:** der
Reiter hat einen eigenen Speicher-Effekt, der 400 ms nach dem
Laden SEINEN State schreibt. **Wer den Filter vom Reiter aus
setzt, schreibt gegen ihn** ? der Satz nannte danach nur noch die
Allergenmeidung. `[cmd]` **Die Probe schreibt ihn jetzt von einem
anderen Reiter aus.**

### Der Waechter

`[cmd]` **`g491-leersatz-nennt-jeden-filter.test.ts`, 9 Faelle.**
`[cmd]` **`tools/_g491-sabotage.mjs`: 11 Schaeden plus Kontrolle ?
12/12.**

`[read]` **Je Filter eine eigene Zusicherung** ? eine Frage nach
dem Ganzen faellt nicht, wenn ein Teil faellt.

`[cmd]` **Der erste Lauf war 11/12:** ein mehrzeiliger Suchtext
traf in der CRLF-Datei nie, **der Schaden kam also nie an** ?
das ist kein gruener Waechter, sondern gar keine Probe. `[cmd]`
**Einzeilig gesucht, dann 12/12.**

`[cmd]` **Die Kontrolle** (Klammern um einen Rumpf) **bleibt
gruen** ? der Waechter prueft die Regel, nicht die Zeilenform.

### Was ROT bleibt und mir nicht gehoert

`[cmd]` **`pnpm gate`: einzig `[kettenlauf]` ist rot** ?
`lumeos_tageskette_20260920`, **fehlgeschlagen am 2026-09-20 um
21:00**, also vor dieser Sitzung. `[read]` **Das liegt in
`supabase/`, und der Auftrag sagt: nichts in `supabase/`.**
**Gemeldet, nicht angefasst.**

### Die Fotos

    backup/x-g491-a3-leersatz.png   A3: der Satz nennt alle vier
                                    Filter, Leiste offen daneben
    backup/x-g491-a4-kapsel.png     A4/A5: Kapsel, nur "In den
                                    Stack" + Grund
    backup/x-g491-a4-pulver.png     A4/A6: Pulver, beide Knoepfe

`[cmd]` **Drei Fotos liegen doppelt:** meine Probe lief aus
`apps/web` und hat `apps/web/backup/` angelegt. `[read]` **In
`backup/` loescht niemand ausser Tom** ? **die drei Dateien in
`apps/web/backup/` sind meine Altlast und koennen weg.**

### Neustart noetig?

`[read]` **Nein** ? nur `apps/web/src`.

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

> *,,Die Tabelle war nie leer ? sie war GEFILTERT, und der
Satz, der das erklaeren sollte, nannte den falschen Filter."*

`[cmd]` **`wirkendeFilter` in `produkt-filter-lage.ts`, Zeile
182.**

`[cmd]` **Proben: web 1919/1919, coach 65/65.**

### Der eigentliche Fehler

> *,,Der Leersatz beschuldigte die KATEGORIE. Gemessen je
Filter, wurde *Micronized Creatine Monohydrate* von der MARKE
ausgeschlossen ? alle 18 Zeilen sind Powder, und keine traegt
*Optimum Nutrition* (die Datenbank sagt *ON Optimum
Nutrition*)."*

`[read]` **Ein Satz, der eine Leere erklaeren soll und den
falschen Grund nennt** ? **schlimmer als gar keiner.**

### Zwei Regeln, bewusst verschieden

> *,,`aktiveFilter` zaehlt die ABWEICHUNG von der Vorgabe
(das Abzeichen), `wirkendeFilter` nennt, was WIRKT (der
Satz) ? so bleibt *On Market* draussen, aber ein aktiver
Allergenfilter kommt hinein."*

### A4 mit Foto

`[cmd]` **`x-g491-a4-kapsel.png` angesehen: Ultraplex Vitamin
D3, *,,In den Stack"* ? *,,Diese Darreichungsform laesst sich
nicht untermischen, sie gehoert in den Stack, nicht in eine
Mahlzeit."***

### Zwei Befunde am Foto

**1** ? `[cmd]` **Der Knopf steht ganz unten** ? **Toms Kritik,
G-492 loest es.**

**2** ? `[cmd]` **Die Spalte `FORM` ist in ALLEN Zeilen der
Liste leer.**

`[read]` **Das ist C-520: `search_supplier_products` gibt
`produktform` nicht zurueck.** **In der Liste sieht der Nutzer
nicht, ob es eine Kapsel ist ? erst in der Tafel.**

### Ein Fehlversuch, gemeldet

> *,,Der erste Lauf war 11/12, weil ein mehrzeiliger
Suchstring in einer CRLF-Datei nie traf; dieser Schaden kam nie
an, also bewies er nichts."*

**Abgenommen.**
