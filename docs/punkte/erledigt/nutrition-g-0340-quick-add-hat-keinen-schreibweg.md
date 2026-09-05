---
nr: G-340
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-09-02
braucht: [G-339]
kind_von: G-232
entscheidung: null
agent: claudecode
beauftragt: 2026-09-07
erledigt: 2026-09-07
commit: f8893422
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

**Beauftragt am 2026-09-07.**

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

**Claude Code, 2026-09-05.** Dev-Server auf 3200 **nicht neu
gestartet**. **Nichts auf `dev@lumeos.app` geschrieben** — der
Nachweis lief auf `test-user@lumeos.local` (vorher leer, 0/0) und
wurde gezaehlt zurueckgebaut.

---

## Die zwei Fragen, die der Auftrag zu MESSEN gab

### `amount_g` — Eingabefeld, und ohne Angabe 1

`[cmd]` **Die Spalte ist NOT NULL, der CHECK verlangt `> 0`** —
**eine Null ist unmoeglich, `null` auch.**

`[cmd]` **Gemessen: die Menge wird NICHT zum Hochrechnen benutzt.**
`059b_daily_nutrient_summary_long.sql` liest die eingefrorenen
Spalten direkt — **`amount_g` steht in keiner Multiplikation.**
`[read]` **Eine falsche Zahl verfaelscht also keinen Naehrwert.**

`[cmd]` **Aber sie faellt in die Grammsumme des Tages**
(`mahlzeiten.tsx:725`), **und die steht in der Kopfzeile.**

**Tom zu genau dieser Zeile (G-330):** *,,eine Angabe, die man direkt
nachwiegen kann."*

`[read]` **Deshalb wird kein Gewicht erfunden.** Ein Restaurantteller
mit *450 kcal* wiegt weder 450 g noch 100 g — **jede geratene Zahl
waere eine Behauptung ueber etwas Ungewogenes**, und sie stuende in
genau der Summe, die man nachwiegen koennen soll.

**Gebaut: ein optionales Eingabefeld.** `[read]` **Wer das Gewicht
kennt, gibt es an** — dann stimmt die Summe. **Wer nicht, bekommt
`1`:** der kleinste Wert, den der CHECK zulaesst, **also die kleinste
Verschiebung.**

`[cmd]` **Und `1` ist kein Fremdkoerper** — zwei Bestandsposten
tragen ihn bereits.

`[cmd]` **Das Modal sagt es dem Nutzer:** *,,Ohne Angabe zaehlt der
Posten mit 1 g in die Tagessumme — geraten wird nichts."*

### `nutrients` — leeres Objekt, und das ist die Aussage

`[cmd]` **Gemessen in `059b`, Zeile 94-96:** der jsonb-Zweig
schliesst die neun Spaltencodes **ausdruecklich** aus:

    WHERE kv.key NOT IN ('ENERCC','PROT625','FAT','CHO','FIBT',
                         'SUGAR','FASAT','NACL','WATER')

`[read]` **Die Eingaben gehoeren also in die SPALTEN.** **Im jsonb
wuerden sie schlicht ignoriert** — und ein Wert, den niemand liest,
ist eine zweite Wahrheit, die auf ihren Fehler wartet.

`[cmd]` **`{}` ist ohnehin der Spaltenvorgabewert**, und er heisst
genau das Richtige: **fuer die uebrigen Codes gibt es keine
Messung.** `[read]` **Seit G-341 sagt der Naehrstoffreiter das auch.**

---

## Am lebenden Schema geprueft — nicht behauptet

`[cmd]` **Buehne auf `test-user@lumeos.local`** (leer, 0/0). **Nicht
auf dev** — der Auftrag verbietet es.

    1  Mahlzeit angelegt                          lunch, 12:30
    2  manueller Posten geschrieben               'manual',
                                                  amount_g 1,
                                                  enercc 450,
                                                  nutrients {}
    3  CHECK gegen 'manual' MIT food_id           ABGEWIESEN
    3  CHECK gegen amount_g = 0                   ABGEWIESEN
    4  Tagessumme                                 ENERCC 450
    4b Ehrlichkeit: PROT625                       missing_count 1
                                                  days_with_value 0
                                                  complete_day 0
    5  Rueckbau                                   1 Posten, 1 Mahlzeit
    6  Endstand                                   0 | 0

`[read]` **Punkt 4b ist der wichtigste:** **der Tag wird durch einen
manuellen Posten NICHT vollstaendig.** `PROT625` und `VITC` zaehlen
weiter als fehlend — **genau die Spalte, die G-341 lesbar gemacht
hat.** **C-378 gewahrt: es wird nichts geschaetzt.**

### Und durch den Browser, mit echtem Klick

`[cmd]` **Auf `test-user`, angemeldet:** Mahlzeit angelegt, Quick-Add
geoeffnet, *Pasta im Ristorante* / 450 kcal eingetragen, *Eintragen*
geklickt.

    Pulldown zeigt die Mahlzeit des Tages       ja
    Knopf wird aktiv                            ja
    Posten danach im Tagebuch sichtbar          ja
    kcal sichtbar                               ja

`[cmd]` **Die geschriebene Zeile, direkt gelesen:**

    manual | Pasta im Ristorante | 1.00 | 450.0000 | (prot625 NULL)
           | {} | manual

`[cmd]` **Danach gezaehlt zurueckgebaut** — `test-user` wieder 0 | 0.

---

## Was gebaut ist

    diary-model.ts     manualItemCreateSchema
                       buildManualItemInsert
    diary-write.ts     addManualItem
    route.ts           art === 'manuell'
    modale.tsx         QuickAddModal auf ZiehModal, mit Schreibweg
    kopfknoepfe.tsx    reicht `datum` durch
    ansicht.tsx        gibt `datum` mit

`[read]` **Kein Einfrieren:** `computeFrozenNutrients` rechnet je
100 g hoch — **ein Restaurantteller hat keine Naehrwerte je 100 g.**
**Die Zahlen kommen vom Nutzer und sind bereits absolut.**

`[read]` **Ein fehlendes Makro wird `null`, nicht `0`** — wer kein
Protein angibt, sagt nicht *,,null Gramm"*, sondern *,,ich weiss es
nicht"* (C-48 Regel 1). **Eine eingegebene Null bleibt eine Null.**

`[cmd]` **Auf der gemeinsamen Huelle** (G-320/G-321/G-336) — am
Schirm belegt: `ziehbar: 1` (vorher 0). **Keine dritte Ziehlogik.**

### Der Posten haengt an einer Mahlzeit, nicht an einer Kategorie

`[cmd]` **Vorher zeigte das Pulldown die sieben Kategorien.**
`[cmd]` **`meal_id` ist aber NOT NULL und verweist auf eine ZEILE.**

`[read]` **Also laedt das Modal die Mahlzeiten des Tages** — ueber
denselben GET, den das Tagebuch benutzt. `[cmd]` **Am Schirm:**
Fruehstueck, Mittagessen, Snack, Abendessen — **echte Zeilen.**

`[cmd]` **Der Name kommt weiter aus `KATEGORIE_TEXT`** — **keine
siebte Liste**, und ein Waechter sichert es.

`[read]` **Gibt es fuer den Tag noch keine Mahlzeit, sagt das Modal
es** und bietet nichts an, statt ins Leere zu schreiben.

---

## Zwei eigene Waechter sind gefallen — zu Recht

`[cmd]` **Der Volllauf meldete zwei rote aus G-339**, beide durch
meinen Umbau:

    "die option traegt ein value"        Anker `aria-label="Meal"`
                                         war weg
    "die Auswahl kommt aus KATEGORIE_TEXT"  `MEAL_TYPES` war weg

`[read]` **Beide Zusagen gelten unveraendert** — nur ihr Gegenstand
hat gewechselt. **Nachgezogen, nicht gestrichen:**

`[cmd]` **Der erste prueft jetzt das Mahlzeiten-Pulldown**
(`data-probe="quick-mahlzeit"`) — dieselbe Frage: traegt die
`<option>` ein `value`, oder faehrt der Label los?

`[cmd]` **Der zweite prueft jetzt eine ABWESENHEIT:** kein
Kategoriecode neben einem Text in `modale.tsx`, weder als Schluessel
noch als Wert. `[read]` **Das ist die staerkere Form** — sie faengt
auch eine Liste, die anders heisst.

`[cmd]` **Und `MEAL_TYPES` ist entfernt, nicht liegengelassen**
(A-59): 25 Zeilen, letzter Verbraucher weg.

---

## Waechter

`[cmd]` **Neu: `__tests__/quick-add-manueller-posten.test.ts`,
10 Waechter.**

    die Dateiproben finden ihre Dateien
    WEDER food_id NOCH custom_food_id (der CHECK, nachgebaut)
    ohne Gewichtsangabe steht 1 — und die Angabe gilt
    nutrients bleibt leer — die Zahlen in den Spalten
    ein fehlendes Makro wird null, nicht 0
    Name und Kalorien Pflicht, die Makros nicht
    die Route kennt die dritte art
    der Schreibweg friert NICHT ein
    das Modal schreibt und steht auf der Huelle
    das Modal sagt, was der Posten NICHT kann

## Sabotageprobe: 12 Eingriffe, 12 Faelle

    faellt   food_id wird gesetzt (CHECK braeche)
    faellt   ein Gewicht wird geraten (100 statt 1)
    faellt   die Angabe des Nutzers wird ignoriert
    faellt   die Makros wandern in den jsonb
    faellt   ein fehlendes Makro wird 0
    faellt   der Vertrag verlangt die Makros
    faellt   amount_g = 0 kommt durch
    faellt   der Schreibweg friert doch ein
    faellt   die Route kennt die dritte art nicht
    faellt   das Modal schickt die falsche art
    faellt   der Knopf wird wieder eine Attrappe
    faellt   der Ehrlichkeitshinweis faellt weg

`[cmd]` **Nach dem Rueckbau keiner rot.**

`[read]` **Der zweite und dritte sind die tragenden:** sie treffen
genau die Entscheidung, die der Auftrag zu messen gab — **kein
geratenes Gewicht, und die Angabe des Nutzers gewinnt.**

## Bildschirmfotos

    backup/g340-vorher-quickadd.png       englisch, Add ohne Wirkung
    backup/g340-nachher-quickadd.png      deutsch, mit Gewichtssatz
    backup/g340-nachher-ausgefuellt.png   ausgefuellt, Knopf aktiv
    backup/g340-nachher-eingetragen.png   der Posten im Tagebuch

## Laeufe

    pnpm --filter @lumeos/web test      1388 gruen, 0 rot  (+10)
    npx tsc --noEmit                    keine Ausgabe
    pnpm --filter @lumeos/web lint      keine Warnung

`[cmd]` **`pnpm gate` nicht gelaufen** — er faellt an fremden
ungetrackten Migrationen (C-327a, C-385, Codex) mit INSERT/DELETE.
**Nicht diese Arbeit.**

## Datenstand nach dem Lauf

    dev@lumeos.app          730 Mahlzeiten, 2.300 Posten
    davon nicht 'bls'       0        <- nichts von mir auf dev
    test-user@lumeos.local  0 | 0    <- Buehne geraeumt

## Nicht getan

    kein custom_food — das ist Flow 6
    keine Naehrwertschaetzung — C-378
    nichts auf dev geschrieben
    nicht committet, nicht gestaged, nicht gepusht
    Dev-Server nicht neu gestartet

## Abnahme

**2026-09-07, Orchestrator. Nachgemessen.** `[cmd]` Gate 15/15.

### Der erste Nicht-BLS-Weg steht

`[cmd]` **Vertrag, Schreibweg, dritte Art in der Route, Modal auf
der gemeinsamen Ziehhuelle.**

`[cmd]` **`food_source = 'manual'`** — **der erste Weg neben `bls`.**

`[cmd]` **Nachgemessen: 9.051 Posten, alle `bls`** — **der Rueckbau
auf `test-user` ist vollstaendig.**

`[read]` **Nachgewiesen und zurueckgebaut, mit Zaehlung** — **genau
so, wie es sein soll.**

### Die zwei Fragen sind gemessen, nicht gesetzt

`[cmd]` **`amount_g`: optionales Feld mit Vorgabe 1.**
`[cmd]` **`nutrients`: leer.**

`[read]` **Ich hatte beides offen gelassen und um Messung gebeten.**
`[read]` **Die Vorgabe 1 ist die ehrlichste Antwort:** **wer *450
kcal* eintraegt, hat keine Grammzahl** — **und eine erfundene waere
schlimmer als eine offensichtlich symbolische.**

### Ein Befund, der eine Produktentscheidung ist

`[cmd]` **Der Posten haengt an einer echten Mahlzeit, nicht an einer
Kategorie.**

`[read]` **Das heisst: Quick-Add braucht fuer den Tag mindestens eine
angelegte Mahlzeit.** `[cmd]` **Das Modal sagt es.**

`[read]` **Er hat es gemeldet, statt einen Einstieg zu erfinden** —
**richtig.** **Als G-346.**

### Und zwei Waechter mussten nachziehen

`[cmd]` **Zwei G-339-Waechter verloren durch den Umbau ihre Anker.**

`[read]` **Er sagt: die Zusagen sind unveraendert, nur ihr Gegenstand
wechselte.** `[read]` **Und er bittet, es bei der Abnahme
mitzupruefen** — **richtig, denn ein Waechter, der seinen Anker
verliert, koennte still gruen werden.**

`[cmd]` **Gate 15/15, also greifen sie.** `[read]` **Aber das Muster
ist ein eigener Punkt** — **es ist derselbe Fall wie
`v2-attrappen.test.ts`.** **Beides in G-343.**

**Abgenommen.**

