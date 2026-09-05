---
nr: G-343
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-09-07
braucht: []
kind_von: G-342
entscheidung: E-58
agent: claudecode
beauftragt: 2026-09-07
beruehrt:
  dateien:
    - apps/web/src/components/shell/__tests__/v2-attrappen.test.ts
zahlen:
  gemessen: 2026-09-07
---

# G-343 — Tests messen gegen ueberholte Entwuerfe

## Befund

Aus G-342, Claude Code, 2026-09-07.

`[cmd]` **`v2-attrappen.test.ts` prueft Vorlagentreue gegen einen
Entwurf von vor E-58.**

`[read]` **Er hat eine Zusage berichtigt und gemeldet, dass eine
Durchsicht lohnt.**

## Zu messen

`[read]` **Welche Tests messen noch gegen Staende, die seit dem
02.09. ueberholt sind?**

`[cmd]` **Neunzehn Entscheidungen an einem Tag** — E-45 bis E-63.
`[cmd]` **Darunter E-58 (Mahlzeitenstruktur), E-59 (Planstruktur),
E-61 (Vitamin A), E-63 (Sonstige faellt weg).**

`[read]` **Ein Test, der eine ueberholte Vorlage sichert, wird gruen
und schuetzt den falschen Zustand.**

`[read]` **Dieselbe Klasse wie die vier Waechter aus G-342:** **sie
hielten toten Code am Leben, weil sie seine Existenz massen.**

## Auftrag — Tests gegen ueberholte Staende

**Mitbeauftragt: G-328, G-279.** Bericht in diese Datei.

**Beauftragt am 2026-09-07.**

### 1 · G-343 — welche Tests messen Vergangenes?

`[cmd]` **Du hast `v2-attrappen.test.ts` gefunden:** **er prueft
Vorlagentreue gegen einen Entwurf von vor E-58.**

`[cmd]` **Und in G-340 musstest du zwei G-339-Waechter nachziehen**,
weil dein Umbau ihnen die Anker nahm.

`[read]` **Zweimal dasselbe Muster** — **ein Waechter, der an einer
Stelle haengt statt an einer Zusage.**

`[cmd]` **Zwanzig Entscheidungen seit dem 02.09.:** E-45 bis E-65.
`[cmd]` **Darunter E-58 (Mahlzeitenstruktur), E-59 (Planstruktur),
E-61 (Vitamin A), E-63 (*Sonstige* faellt weg).**

`[read]` **Miss, welche Tests noch gegen ueberholte Staende
messen.** `[read]` **Ein Test, der eine alte Vorlage sichert, wird
gruen und schuetzt den falschen Zustand.**

`[read]` **Und sag, woran man es erkennt** — **damit der naechste
Waechter an der Zusage haengt, nicht an der Zeile.**

### 2 · G-328 — was zaehlt *am haeufigsten*?

`[cmd]` **E-56 entschied: *Am haeufigsten* mit Zahl** — *,,27 von 30
Tagen"*.

`[read]` **Miss, was gezaehlt wird:** **Tage mit mindestens einem
Eintrag, oder Anzahl der Eintraege?**

`[read]` **Bei sieben Kaffees an einem Tag ist der Unterschied
gross.**

### 3 · G-279 — die Kachel *haeufig erfasst*

`[cmd]` **Sie braucht G-328** — **erst muss feststehen, was gezaehlt
wird.**

`[read]` **Wenn G-328 die Zaehlweise klaert, bau sie** — **sonst
melde, was noch fehlt.**

### Was nicht zu tun ist

**Keine Zusage aendern** — **nur ihren Gegenstand, wo er weggefallen
ist.**
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen.**

### Nachweis

    Tests           welche messen Vergangenes, gezaehlt
    Erkennung       woran man es merkt, als Regel
    G-328           Tage oder Eintraege, begruendet
    G-279           gebaut oder was fehlt
    Bildschirmfoto  vorher / nachher

## Bericht

**Claude Code, 2026-09-05.** Dev-Server auf 3200 **nicht neu
gestartet**. **Nichts auf `dev@lumeos.app` geschrieben** — alle
Messungen lesend.

---

## 1 · G-343 — welche Tests messen Vergangenes

### Gesucht wurde, was die Entscheidungen ABGESCHAFFT haben

`[cmd]` **132 Testdateien durchsucht**, Kommentare vorher entfernt.
`[read]` **Ein Vermerk ueber die alte Lage ist kein Befund** — nur
eine ZUSAGE zaehlt.

`[cmd]` **35 Fundstellen, nach Richtung getrennt:**

    verlangt das Abgeschaffte   21
    verbietet es (richtig)      14

`[read]` **Die meisten 21 waren Fehlalarm** — Testnamen, Wortlisten,
Rueckfallzusagen. **Drei trugen wirklich.**

### Der Befund: drei Tests, alle gruen, alle falsch

**a) `naehrstoff-anzeige.test.ts:166` und
`karten-und-filtergruppen.test.ts:54`**

    assert.equal(karteFuerWurzel('CHORL', 'Sonstige Nährstoffe'),
                 'Sonstige')

`[cmd]` **Live gemessen, 2026-09-05:** `CHORL` traegt
`Fettbegleitstoffe`, **und die Gruppe `Sonstige Nährstoffe` gibt es
in `nutrient_defs` nicht mehr** — 0 Zeilen.

`[read]` **Der Test blieb trotzdem gruen** — **weil er die
abgeschaffte Gruppe SELBST als Argument hineinreicht.** **Er prueft
die Abbildung seiner eigenen Annahme, nicht den Bestand.**

**b) `karten-und-filtergruppen.test.ts:113`** — elf Karten in fester
Reihenfolge. `[cmd]` **`Fettbegleitstoffe` fehlte in der Liste.**

### Und daraus folgten zwei echte Fehler am Schirm

`[cmd]` **E-63 sagt: *,,die Gruppe verschwindet"*.** `[cmd]` **Am
Schirm stand sie noch** — als Karte *Sonstige · 1 Eintrag* mit
`Stickstoff, gesamt NT`.

`[cmd]` **Gemessen: von 41 Wurzeln fiel genau eine hinein.** `NT` war
der letzte Rest, und E-63 sagt, wohin er gehoert: *,,Stickstoff ist
die Rechengroesse, aus der Protein entsteht"* — `PROT625` heisst so,
weil es `NT x 6,25` ist.

`[cmd]` **Zweiter Fehler, vom neuen Waechter gefunden:**
`Fettbegleitstoffe` stand **nicht** in `KARTEN_REIHENFOLGE`.
`[cmd]` **`naehrstoff-ordnung.ts:621` gibt unbekannten Karten den
Sortierwert `length`** — **am Schirm stand sie als LETZTE, hinter
*Genussmittel*.**

`[read]` **Kein Test hat es gefangen**, weil keiner die Karten gegen
die Wurzeln hielt.

### Gebaut

    naehrstoff-anzeige.ts   NT -> Protein (E-63)
                            Fettbegleitstoffe hinter Fette (E-63:
                            „sichtbar bei den Lipiden")

`[cmd]` **Am Schirm nachher:** *Sonstige* ist weg, und die
Reihenfolge lautet Kohlenhydrate > Fette > **Fettbegleitstoffe** >
Protein > … > Genussmittel.

`[read]` **Der Rueckfall auf *Sonstige* BLEIBT im Code** — er faengt
heute nichts, **aber eine stumm weggelassene Wurzel waere derselbe
Fehler wie eine Null statt eines Fehlzaehlers.** **Ein Waechter
beweist ihn mit einem erfundenen Code.**

### Woran man es erkennt — die Regel

`[read]` **Eine Zusage ist gefaehrdet, wenn ihr Gegenstand aus dem
Test selbst kommt statt aus dem Bestand.**

    gefaehrdet   f('CHORL', 'Sonstige Naehrstoffe') === 'Sonstige'
                 der Test liefert die Gruppe UND prueft ihre
                 Abbildung — er kann nie widersprechen

    traegt       jede Wurzel des Bestands landet auf einer Karte,
                 die KARTEN_REIHENFOLGE kennt
                 der Bestand liefert die Eingabe

`[read]` **Und die zweite Form, aus G-340:** eine Zusage, die einen
NAMEN sucht (`aria-label="Meal"`, `MEAL_TYPES`), **faellt beim
naechsten Umbau.** **Eine, die eine WIRKUNG misst, ueberlebt ihn.**

`[read]` **Die Probe fuer beide:** *,,Kann dieser Test rot werden,
ohne dass ich ihn anfasse?"* **Wenn nein, prueft er sich selbst.**

---

## 2 · G-328 — gezaehlt werden TAGE, nicht Eintraege

### Gemessen, dev, letzte 30 Tage (388 Posten, 125 Mahlzeiten)

    nach Eintraegen          nach Tagen
    Olivenoel        52      Olivenoel        30
    Ei (roh)         26      Ei (roh)         26
    Vollkornbrot     18      Vollkornbrot     16

`[cmd]` **Der Fall aus dem Auftrag ist real:** **Olivenoel hat 52
Eintraege an 30 Tagen** — 1,73 mal je Tag. **Nach Eintraegen
gezaehlt hiesse es *,,52 von 30 Tagen"*.**

`[read]` **Das ist keine Angabe, das ist ein Widerspruch.**

### Und warum es nie auffiel

`[cmd]` **Die *27* stammt aus `vorschlags-lage.ts`:** *,,Huehnerei
roh 27x in 30 Tagen"* — **eine EINTRAGSzahl.** `[cmd]` **E-56 schrieb
sie als *,,27 von 30 Tagen"*** — **eine TAGESzahl.**

`[cmd]` **Beim Ei stimmen beide:** 26 Eintraege an 26 Tagen (30
Tage), 76 an 76 (90 Tage). **Es isst nie zwei am Tag.**

`[read]` **Am Beispiel war der Unterschied unsichtbar** — er zeigt
sich erst am Olivenoel.

### Die Antwort

**Gezaehlt werden Tage mit mindestens einem Eintrag.**

`[read]` **Drei Gruende:** `[cmd]` **die Form *,,X von Y Tagen"* aus
E-56 verlangt es** — der Nenner sind Tage, also muss es der Zaehler
auch sein. `[read]` **Sieben Kaffees an einem Tag sind eine
Gewohnheit, nicht sieben.** `[read]` **Und der Nenner ist nicht 30,
sondern die Tage MIT dieser Mahlzeitart** — sonst waere ein
Fruehstueck benachteiligt, das jemand nur werktags isst.

`[cmd]` **Auf `dev` gemessen, je Mahlzeitart die haeufigste Position:**

    breakfast   Ei (roh)        26 von 30
    lunch       Olivenoel       26 von 30
    dinner      Olivenoel       26 von 30
    snack       Vollkornbrot    11 von 30

---

## 3 · G-279 — nicht gebaut, und warum

### Die Zaehlweise steht, der Leseweg fehlt

`[cmd]` **Gemessen: es gibt KEINE Funktion fuer Haeufigkeiten** —
weder `haeufig`, `frequent`, `often` noch `suggest` in `nutrition`.

`[cmd]` **Was der Browser sonst laden muesste:** **388 Posten ueber
120 Mahlzeiten und 30 Tage** — je Seitenaufruf.

`[cmd]` **Was eine Sicht liefern wuerde: 4 Zeilen.**

`[read]` **Das ist woertlich E-52:** *,,wenn dieselben Daten immer
zusammen gebraucht werden, entsteht eine Sicht in der Datenbank —
nicht eine Schleife im Browser."*

`[read]` **`supabase/` gehoert Codex.** **Deshalb melde ich, statt zu
bauen.**

### Und eine Produktfrage, die vorher gehoert

`[cmd]` **Die haeufigste POSITION je Mahlzeitart ist bei Mittag und
Abend: Olivenoel.** `[read]` **Das ist eine Zutat, keine Mahlzeit** —
als Abkuerzung *,,uebernimm Olivenoel"* nutzlos.

`[cmd]` **Die Alternative gemessen — die haeufigste
ZUSAMMENSETZUNG:**

    breakfast   2 von 30   Ei + Haferflocken + Kiwi
    dinner      2 von 30   Kartoffel + Olivenoel + Tomate + Ziege
    lunch       1 von 30   Brokkoli + Karotte + Olivenoel + ...
    snack       2 von 30   Dinkelbrot + Skyr

`[read]` **Zwei von dreissig ist kein Muster** — **als Abkuerzung
wertlos.**

`[read]` **Damit stehen sich zwei Lesarten gegenueber:** die eine
liefert eine hohe Zahl auf eine Zutat, die andere eine ehrliche
Mahlzeit mit einer Zahl, die nichts traegt. **Beide gemessen, keine
ueberzeugend.**

**MELDUNG — G-279 braucht vor dem Bau zweierlei:**

    1  eine Lesefunktion (Codex, E-52) — je Mahlzeitart die
       haeufigste Position, mit `tage` und `tage_gesamt`
    2  eine Entscheidung: Position oder Zusammensetzung?
       Die Messung sagt, dass keine der beiden ohne Weiteres traegt.

`[read]` **Ich habe die Kachel NICHT gebaut** — der Auftrag sagt:
*,,sonst melde, was noch fehlt."*

### Ein Nebenbefund zu `wieGestern`

`[cmd]` **`mahlzeiten.tsx:767`:** `if (!it.food_id) continue`

`[read]` **Ein manueller Posten aus G-340 hat keine `food_id`** —
**er wird beim Uebernehmen still uebersprungen.** `[read]` **Kein
Fehler von heute, aber seit G-340 erreichbar.** **Als Punkt gemeldet.**

---

## Waechter

`[cmd]` **Neu: `__tests__/zusagen-messen-den-bestand.test.ts`,
5 Waechter.**

    die Dateiprobe findet ihre Datei
    KEINE Wurzel faellt mehr auf *Sonstige* (alle 14 durchgeschickt)
    NT gehoert zu Protein, CHORL zu den Fettbegleitstoffen
    jede Wurzel landet auf einer Karte, die es GIBT
    der Rueckfall bleibt stehen — mit erfundenem Code bewiesen

`[read]` **Der vierte ist der eigentliche Gewinn:** **er haelt die
Karten gegen die Wurzeln.** `[cmd]` **Genau er hat den
`Fettbegleitstoffe`-Fehler gefunden**, den kein bestehender Test sah.

`[cmd]` **Drei bestehende nachgezogen** — Zusage unveraendert, nur
ihr Gegenstand:

    naehrstoff-anzeige       CHORL: 'Sonstige' -> 'Fettbegleitstoffe'
    karten-und-filtergruppen dasselbe, plus NT
    karten-und-filtergruppen elf Karten -> zwoelf

## Sabotageprobe: 8 Eingriffe, 8 Faelle

    faellt   NT faellt wieder in *Sonstige*
    faellt   NT wird zum Kind statt zur Karte
    faellt   die Karte faellt aus der Reihenfolge
    faellt   Fettbegleitstoffe rutscht ans Ende
    faellt   CHORL faellt wieder in *Sonstige*
    faellt   der Rueckfall wird entfernt
    faellt   *Sonstige* steht nicht mehr am Ende
    faellt   die Kartenzuordnung fasst die Hierarchie an

`[cmd]` **Nach dem Rueckbau keiner rot.**

`[read]` **Der siebte traf zwei Zusagen gleichzeitig** — die
Reihenfolge UND die Endstellung. **Beide zu Recht.**

## Bildschirmfotos

    backup/g343-vorher-nutrients.png   Karte *Sonstige · 1 Eintrag*,
                                       Fettbegleitstoffe als letzte
    backup/g343-nachher-nutrients.png  *Sonstige* weg,
                                       Fettbegleitstoffe hinter Fette

## Laeufe

    pnpm --filter @lumeos/web test      1393 gruen, 0 rot  (+5)
    npx tsc --noEmit                    keine Ausgabe
    pnpm --filter @lumeos/web lint      keine Warnung

`[cmd]` **`pnpm gate` nicht gelaufen** — er faellt an fremden
ungetrackten Migrationen (C-327a, C-385, Codex) mit INSERT/DELETE.

## Neue Befunde

    1  G-279 braucht eine Lesefunktion (Codex, E-52) UND eine
       Entscheidung: haeufigste Position oder Zusammensetzung.
       Beide Lesarten gemessen, keine traegt ohne Weiteres.

    2  `wieGestern` ueberspringt Posten ohne `food_id` — seit G-340
       erreichbar (manueller Posten).

    3  Die *27* aus `vorschlags-lage.ts` ist eine Eintragszahl,
       E-56 zitiert sie als Tageszahl. Beim Ei stimmen beide,
       am Olivenoel nicht (52 gegen 30).

## Nicht getan

    G-279 nicht gebaut — Leseweg fehlt, Entscheidung offen
    nichts in supabase/ geaendert
    nichts auf dev geschrieben (730 Mahlzeiten, 2.300 Posten
      unveraendert)
    nicht committet, nicht gestaged, nicht gepusht

## Abnahme

_(vom Orchestrator)_
