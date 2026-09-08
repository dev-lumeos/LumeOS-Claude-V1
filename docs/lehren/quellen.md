# Die vier Quellen

Belege zu den Regeln in `CLAUDE.md`. **Wer eine Regel anwendet,
liest hier den Grund** ? die Regel allein sagt nicht, warum sie
entstanden ist.

## `00-QUELLEN.md` wird geoeffnet, nicht erinnert

`[cmd]` **`docs/spezifikation/00-QUELLEN.md`, 428 Zeilen** — **sie
sagt je Modul, was vor einem Auftrag zu lesen ist.**

**Ihr eigener Anlass, Tom 2026-08-20:** *,,Und das hast alles gegen
Spec, Docs, altes Repo und neues Design gegengeprueft?"* — **Nein,
mehrfach nicht.**

`[cmd]` **Am 2026-09-07 zweimal wieder:** **der Orchestrator
behauptete, es gebe keine Marketplace-Spec** (`docs/specs/
Marketplace/`, 12 Dateien) **und uebersah die HumanCoach-Spec**
(12 Dateien, 3.291 Zeilen).

`[read]` **Beide Male mit `git grep` nach Dateinamen gesucht,
statt das Verzeichnis zu oeffnen.**

### Die Regel

`[read]` **Vor jedem Punkt zu einem Modul:**

    1  docs/spezifikation/00-QUELLEN.md, Abschnitt des Moduls
    2  docs/specs/<Modul>/  -- das Verzeichnis, nicht die Suche
    3  die Mockups, die dort genannt sind
    4  referenz/lumeos-2026/ -- Struktur, und warum ersetzt

`[cmd]` **Kein Modul hat nur eine Mockup-Datei** — Nutrition drei,
Recovery fuenf, Coach acht.

`[read]` **Und *nicht gefunden* ist keine Aussage** — **es heisst
nur, dass die Suche nichts fand.**

## Vier Quellen, und das Mockup ist die vierte

**Tom, 2026-09-01:** *,,immer und immer wieder haluzinierst du dir
irgend einen scheiss zusammen obwohl strikt nach vorgaben zu arbeiten
hast und alle quellen checken sollst bevor einen auftrag vergibst."*

`[cmd]` **Anlass: der Plan-Reiter.** **`MealPlansView.js` liegt seit
Monaten im Fundus, 136 Zeilen, mit Layout, Kacheln, Reihenfolge und
Badges.** `[cmd]` **Nie gelesen.**

`[read]` **Stattdessen vier Kacheln aus dem Schema abgeleitet — eine
je Spaltengruppe.** **Planumfang, Lebenszyklus, Herkunft, Einhaltung.**
**Keine davon steht irgendwo.**

### Die Reihenfolge, vollstaendig

    SPEC_03   der Ablauf      was der Nutzer tut
    SPEC_10   die Bauteile    welche Komponente welchen Schritt
    Mockup    das Layout      welche Kachel wo, was zusammensteht
    Schema    die Daten       was gespeichert wird

`[read]` **Aus dem Schema folgt kein Layout.** **Wer eine Kachel je
Tabelle baut, baut die Datenbank ab, nicht das Produkt.**

### Wo die Mockups liegen

    docs/spezifikation/10-plattform/design-system/theme-v1
    docs/spezifikation/10-plattform/design-system/mockup-zwischenwurf
    referenz/lumeos-2026/src/.../components

`[cmd]` **Der zweite Ordner traegt 94 Dateien** — er wurde am 30.08.
aus `public/` dorthin verschoben (G-284), **und er ist die
vollstaendigste Layoutquelle.**

`[read]` **Vor jedem UI-Auftrag: gibt es ein Mockup fuer diesen
Reiter?** **Wenn ja, gehoert es in den Auftrag, mit Dateinamen.**

## Der Ablauf steht in SPEC_03, nicht in SPEC_10

**Tom, 2026-08-31:** *,,willkuerlich irgendwas geseeded und
aufgelistet wo keiner definieren, anlegen oder editieren kann. wie
soll das alles funktionieren?"*

`[cmd]` **Anlass: fuenf Punkte fuer Plan- und Rezeptkomponenten, alle
aus `SPEC_10_COMPONENTS.md` abgeleitet.** `[cmd]`
**`SPEC_03_USER_FLOWS.md` mit vierzehn Ablaeufen war nicht gelesen.**

`[read]` **Ergebnis: Bauteile ohne Bauplan.** Eine Karte, ein
Akkordeon, ein Formular — **einzeln richtig, zusammen kein Ablauf.**

### Was daraus entstand

    drei Unterreiter        stehen in keiner Spec
    "Neuer Plan"-Formular   aus dem Schema abgeleitet, erfunden
    Einkaufsliste           "aus einer Planwoche" - Flow 8 sagt
                            "aus einem Rezept"

### Die Reihenfolge

    SPEC_03   der Ablauf     was der Nutzer tut, Schritt fuer Schritt
    SPEC_10   die Bauteile   welche Komponente welchen Schritt traegt
    Schema    die Daten      was gespeichert wird

`[read]` **Von oben nach unten.** **Wer bei den Bauteilen anfaengt,
baut Teile, die zu keinem Ablauf gehoeren** — **und wer beim Schema
anfaengt, erfindet Formulare fuer Spalten.**

### Und die Gegenprobe vor jedem UI-Auftrag

**Welcher Flow ist das, und welcher Schritt darin?**

`[read]` **Wenn die Antwort *,,keiner"* lautet, ist der Auftrag
falsch gestellt** — **oder die Spec hat eine Luecke, und die gehoert
gemeldet, nicht ausgefuellt.**

## Eine Luecke in der Datenbank ist keine offene Frage

**Tom, 2026-08-30:** *,,da sind wir wieder am punkt angelangt wo du
mich sachen fragst wo ziemlich sicher in den specs, altem repo oder
vision oder neues design schon deklarationen hat die du nun zuerst
suchst."*

`[cmd]` **Anlass: drei Fragen zu Buddy, deren Antworten in vier
Dateien standen** — `docs/specs/BuddyandAICoach/` (136 KB),
`docs/specs/HumanCoach/` (97 KB), `AUTONOMY_ARCHITECTURE.md` (444
Zeilen), `coach-buddy-killer-feature.md` (1.591 Zeilen).

`[cmd]` **Die ersten beiden nennt `00-QUELLEN.md` beim Namen.**

`[read]` **Der Fehler war die Reihenfolge:** Datenbank gemessen, Luecke
gesehen, gefragt. **Richtig ist: Spec lesen, dann messen, dann
fragen.**

### Was eine Luecke in der Datenbank bedeutet

    nicht gebaut          haeufig, und meist spezifiziert
    nicht entschieden     selten, und dann steht es nirgends

`[read]` **Vor jeder Frage an Tom: steht es in einer Spec?** `[cmd]`
**Bei C-112 waren von elf Punkten drei gebaut, fuenf spezifiziert und
nur drei wirklich offen.**

## Der gebaute /v2/-Stand ist der Massstab

**Tom, 2026-08-28:** *,,theme-v1 ist das claude design von welchem wir
v2 abgeleitet haben. ssot findest selber im code, also ist theme-v1
nur noch eine ideen struktur falls uns in v2 was fehlt."*

`[read]` **Nicht: den Mockup gegen den gebauten Stand halten.**
**Sondern: den gebauten Stand messen.** `theme-v1` nachschlagen, wenn
etwas fehlt und die Frage ist, wie es gemeint war.

`[cmd]` **In G-249 hat die falsche Richtung Schaden angerichtet:**
eine zweite Ansicht wurde neben eine bestehende gebaut, **weil ich
den Entwurf fuer den Massstab hielt.** 1.009 Zeilen wieder entfernt.

### Zwei Routenbaeume, beide gewollt

`[cmd]` **`/v2/nutrition` und `/nutrition` existieren nebeneinander.**
Der alte traegt ein eigenes Template — Boundary-Karten, *,,TABS LAUT
SPEC"*, *,,READ-ONLY MOCK"*.

**Tom:** *,,da laeuft ein anderes template und das soll bleiben"*.

`[read]` **`/v2/` ist der Arbeitsort. Der alte Baum bleibt
unberuehrt.**

## Das Vorgaengerrepo ist die wichtigste Quelle

`referenz/lumeos-2026/` enthaelt das lauffaehige Vorgaengerprodukt.

**Tom, 2026-08-15:** *"Das alte Repo ist am Code gescheitert, weil es mit
jedem Feature gewachsen ist. All das Wissen, das aufgebaut wurde, liegt
darin. Was wir nun tun, ist systematisch den Endausbau dieses Repos neu
aufzubauen, diesmal richtig — also nutze diese Ressourcen."*

**Gescheitert ist die Struktur, nicht die Erkenntnis.** `[cmd]` 75
Migrationen, elf gebaute Module, 52 Seed-Dateien, eine Wissensbasis mit
86 KB, Mehrsprachigkeit bis Thai. Was dort steht, wurde einmal
durchdacht, gebaut und benutzt.

**Der Wegweiser: `docs/ssot/80-vorgaengerrepo-fundus.md`** — nach Thema
geordnet, mit Pfad. TDEE, Makros, Portionen, 1RM, Koerperfett, HRV,
Halbwertszeiten, Biomarker-Synonyme, Regelwerk, Testdaten.

**Vor jeder Einstufung als "fehlt" wird dort nachgesehen.** `[cmd]` An
einem einzigen Tag wurde dreimal etwas als offene Frage behandelt, das
fertig dort lag: die TDEE-Formeln, die Portionsgroessen, die
Einheiten-Umrechnung. Jedes Mal kam der Hinweis von Tom, nicht aus der
Arbeit.

**Lesen ja, schreiben nie.** `referenz/` traegt 22 Stashes und 19
ungepushte Commits — dort wird nichts veraendert.

### Es geht nicht ums Kopieren — und auch nicht ums Misstrauen

**Tom, 2026-08-15:** *"Es geht nicht darum, den Code dieses Repos zu
kopieren. Es geht darum, aus diesem ueber Monate gewachsenen Repo — wo
immer wieder neue Ideen reingebaut wurden und nochmal was Neues obendrauf
— ein Featureprodukt anzuschauen und richtig nachzubauen. Und dazu kann
man sehr wohl schon geloeste Sachen 1zu1 uebernehmen, mit den noetigen
Anpassungen."*

**Das alte Repo ist die vollstaendigste Anforderungsquelle, die es
gibt.** Wenn die Frage lautet, was ein Modul koennen muss, steht die
Antwort nicht in der Spec — sie steht in elf gebauten Modulen, die
jemand benutzt hat. `[cmd]` Die Specs sind KI-erzeugt und an einer Stelle
nachweislich eine Kopie des Brainstorms; das Design zeigt die
Oberflaeche; **nur das alte Repo zeigt, was das Produkt tatsaechlich
tat.**

**Geloeste Sachen werden uebernommen, nicht nachempfunden.** Wenn
`seed-portions.py` hundert Portionsdefinitionen fuehrt, werden die
uebernommen — angepasst wird die Zuordnung ans neue Schema, nicht die
30 g fuer eine Scheibe Brot.

**Angepasst wird, was sich geaendert hat**, und das ist bekannt:
`public.foods` mit UUID gegen `nutrition.foods` mit `bls_code`,
`daily_nutrition_aggregates` gegen `daily_summary`, andere Schemata,
andere Spaltennamen. Das ist Uebersetzungsarbeit, kein Nachbau.

**Gemessen wird trotzdem** — nicht aus Misstrauen, sondern weil eine
Uebernahme ohne Messung nicht belegt, dass sie angekommen ist. *Aus der
Existenz einer Sache folgt nicht ihre Funktion.*

---
