# CLAUDE.md — LumeOS Runtime Instructions

## Rolle

Du bist Claude im LumeOS-Repo (`D:\GitHub\LumeOS-Claude-V1`).
Du arbeitest hier **direkt** mit Tom — kein Workorder-Workflow, keine
Governance-Pipeline. Du änderst Dateien nur, wenn Tom es explizit verlangt.

---

## Wo der Ist-Zustand steht

Diese Datei beschreibt **bewusst keinen Repo-Zustand.** Zustandssätze
veralten hier unbemerkt und wurden dann als Regel befolgt — zweimal
passiert („services/ ist leer"; „keine Writes, kein Auth").

| Frage | Ort |
|---|---|
| Was ist gebaut, was gilt? | `docs/ssot/00-INDEX.md` (Einstieg, Herkunftsmarker, Rangfolge: Code > ssot > Rest) |
| Was ist als Nächstes zu tun? | `docs/todo/TODO.md` |
| In welcher Reihenfolge, und warum? | `docs/spezifikation/00-MODULPLAN.md` |
| Was ist das Zielbild? | `docs/spezifikation/` (Rollen der Ordner, Statuskopf, Regeln: `00-INDEX.md`) |
| Was ist vom Altbestand schon ausgewertet? | `docs/spezifikation/00-KONSOLIDIERUNG.md` (Ablauf und Register) |
| Wie entsteht die Datenbank? | `supabase/README.md` (Baseline + Pipeline, Rollenteilung) |
| Wie starte ich, welche Gates gelten? | Root-`README.md` (u. a. `pnpm gate`, Hook-Aktivierung) |

---

## Wer committet

**Tom, 2026-08-16:** *„Du orchestrierst — dann machst du deinen Job
falsch. Die beiden arbeiten und du pruefst es; wenn ok, committest du,
und sicher nicht die Arbeiter."*

**Die Agenten committen nicht.** Sie bauen, pruefen ihr Ergebnis und
melden. Der Orchestrator liest den Bericht, prueft nach und committet.
Tom sieht an und pusht.

`[cmd]` Seit 2026-08-16 in `.claude/settings.json` gesperrt: `git add`,
`git commit`, `git stage`, `git rebase`, `git cherry-pick`,
`git revert` — zusaetzlich zu `git push`, `git reset --hard`,
`git clean`.

**Die Sperre greift nur bei Claude Code.** `[cmd]` `.claude/settings.json`
ist seine Konfiguration; Codex liest sie nicht — belegt am 2026-08-16:
Sperre um 20:51 gesetzt, Codex committete um 20:53.

**Bei Codex steht es deshalb im Auftragstext**, in jedem Auftrag:
*„Nicht committen, nicht stagen — melden."* Das ist schwaecher als eine
Sperre, aber Codex haelt sich an Textvorgaben.

## Der SSOT-Index wird vom Orchestrator gepflegt

`[cmd]` Am 2026-08-18 standen **16 von 86 Berichten nicht in
`docs/ssot/00-INDEX.md`** — alle von Codex.

`[read]` **Der Grund ist strukturell, kein Versaeumnis:** Claude Code
traegt die Indexzeile ein, weil es im Auftrag steht und er die Datei
ohnehin anfasst. **Codex arbeitet in `supabase/` und beruehrt
`docs/ssot/` nur fuer seinen eigenen Bericht.**

**Der Index ist laut dieser Datei der Einstieg** — ein Bericht, der
nicht darin steht, existiert fuer die naechste Sitzung nicht.

**Deshalb:** Der Orchestrator traegt ihn nach, wenn er den Bericht
committet. **Eine Zeile mit dem Befund, nicht mit dem Dateinamen** —
der steht schon in der ersten Spalte.

### Und seit 2026-08-22: der Bericht selbst gehoert auch dem Orchestrator

**Tom, 2026-08-22:** *„und der update von ssot ist auch dein job"*

**Agenten schreiben nichts in `docs/`.** Kein `TODO.md`, kein
`ERLEDIGT.md`, **und keinen SSOT-Bericht**. Der
Bericht geht als Text in den Chat; der Orchestrator prueft die
tragenden Zahlen selbst und schreibt daraus, was er geprueft hat.

`[read]` **Der Grund:** Ein SSOT-Bericht, den der Ausfuehrende selbst
verfasst, ist seine Selbstauskunft — genau die Zusammenfassung, die die
Pruefregel nicht lesen soll. `[cmd]` Bericht 178 sagt *„Kettenlauf: 87
Schritte, Exit 0"*, und das stimmt; es steht dort aber, weil Codex es
hingeschrieben hat, nicht weil es geprueft wurde.

**Was geprueft ist, traegt `[cmd]`. Was nur berichtet wurde, traegt
`[read]`.** Diese Unterscheidung kann nur treffen, wer selbst gemessen
hat.

`[cmd]` **Am 2026-08-22 hielt es sich noch niemand daran** — Fable und
Codex hatten `TODO.md`, `ERLEDIGT.md`, `00-UEBERSICHT.md` und
`00-INDEX.md` gleichzeitig offen, waehrend der Orchestrator dieselben
Dateien schreiben wollte. `[read]` **Die Regel stand in der
Bereichstabelle einer Uebersichtsdatei — der Agent liest keine Uebersicht,
er liest seinen Auftrag.** Deshalb steht sie ab jetzt in jedem Auftrag.

### Nachweisdateien in `backup/` gehoeren derselben Encoding-Regel

`[cmd]` **Am 2026-08-22 haben zwei Nachweisdateien jeden Commit im
gesamten Repo blockiert:** `backup/c192/final-nachweis.json` und
`-finaldb.json`, je sechsmal die Doppelkodierungsmarke (U+00E2 U+20AC)
und CRLF — Ausgabe eines Kettenlaufs durch eine Windows-Konsole.

`[cmd]` `encoding-pruefen.mjs` laeuft als **erster** Gate-Schritt ueber
alle 10.661 Dateien. Ein einziger Fund legt alles lahm, auch Commits,
die die Datei nicht anfassen.

`[read]` **Die Regel stand fuer Quelldateien** — fuer `backup/` galt sie
offenbar als nicht gemeint. **Sie gilt.** `encoding="utf-8",
newline="\n"`, auch fuer Messprotokolle.

Umkehrbar war es: von `cp1252` nach `utf-8` zurueckdrehen, mit zwei
Gegenproben — bleibt gueltiges JSON, keine Marken uebrig.


## `TODO.md` ist ein Befundregister, kein Arbeitsvorrat

**Tom, 2026-08-22:** *„undundundund kann ich stunden weiter machen und
du sagst hast nichts und das war nur ein modul"*

`[cmd]` **Der Orchestrator hatte gemeldet, es gebe keine Arbeit fuer
zwei freie Agenten.** Tom schickte daraufhin sieben Bildschirmfotos aus
**einem** Modul, auf denen jede Kachel *„Attrappe"* traegt.

`[read]` **Der Fehler war die Quelle, nicht die Suche.** In `TODO.md`
steht, was jemandem aufgefallen ist und aufgeschrieben wurde. **Ein
ganzes Modul mit Attrappen steht nicht drin, weil es niemand als Befund
notiert hat** — es ist ja kein Fehler, sondern unfertige Arbeit.

**Wer wissen will, was zu tun ist, sieht ins Produkt.** `TODO.md` sagt,
was schiefgegangen ist. `docs/spezifikation/00-MODULPLAN.md` sagt, was
gebaut werden soll. Die Liste allein sagt es nicht.

`[cmd]` **Der Beleg liegt unter `backup/bestand/00-toms-bildschirmfotos.md`**
— mit dem Bildinhalt als Text, damit ihn niemand ein zweites Mal
erfragen muss.

`[cmd]` **Und die Liste kann sogar das Gegenteil behaupten:** Recovery
zeigt auf jeder Kachel *„das Schema `recovery` gibt es noch nicht"*,
waehrend `recovery.checkins` 340 Zeilen hat, `recovery.scores` 340 und
`recovery.modality_log` 178 — und drei Lesefunktionen bereits darauf
zugreifen. **Der Banner war falsch, und er hat den Orchestrator
mitgetaeuscht.**

### Der Rohbericht gehoert ins Repo, der SSOT dem Orchestrator

**Tom, 2026-08-23:** *„diese berichte gehoeren sowieso protokolliert
ins repo."*

**Der Agent haengt seinen Bericht an die Punktdatei** — unter
`## Bericht`, roh und unbearbeitet. Der Orchestrator prueft ihn und
schreibt seine Abnahme darunter.

`[read]` **Berichtigt 2026-08-29 (A-61):** bis dahin lag er unter
`docs/berichte/`. **Auftrag, Bericht und Abnahme stehen jetzt in
derselben Datei.**

`[read]` **Das schaerft die Regel darueber, statt sie aufzuheben.** Ihr
Kern stimmt: der Agent schreibt nicht den SSOT — dort steht, was
**geprueft** ist. Sein Rohbericht ist etwas anderes: die
Selbstauskunft, **gegen die** geprueft wird. **Beides nebeneinander
zeigt, was behauptet wurde und was stimmte.**

`[cmd]` **Der Anlass war ein Verlust:** am 2026-08-23 kamen vier
Agentenberichte hintereinander als leerer Anhang an — in einem langen
Gespraech faellt Anhangsinhalt zuerst weg. Der Orchestrator hat C-235
abgenommen, indem er die 33 Zeilenzahlen selbst nachmass, ohne den
Bericht je gesehen zu haben.

`[read]` **Mit einer Datei im Repo waere das kein Problem gewesen** —
nachsehen statt raten. Und es bleibt nachlesbar, statt in einem Verlauf
zu verschwinden.

`docs/todo/` und `docs/ssot/` bleiben beim Orchestrator.

## `.limit()` hebt den PostgREST-Deckel nicht auf

`[cmd]` **G-249, 2026-08-28:** eine Sparkline zeigte 8 Punkte statt
90, kerzengerade. **Ursache: PostgREST deckelt serverseitig bei 1.000
Zeilen; `.limit(20000)` aendert daran nichts.** Bei 12.420
angefragten Zeilen kamen die ersten acht Tage fuer alle 138
Naehrstoffe.

`[read]` **Kein Fehler, keine Warnung — nur weniger Zeilen.**
**Behoben durch seitenweises Laden.**

`[read]` **Und der Kommentar an der Stelle zitierte bereits G-64,
waehrend der Code in dieselbe Falle lief.** **Eine Warnung im
Kommentar ist kein Waechter.**

## Ein Waechter prueft die Wirkung, nicht das Wort

`[cmd]` **Dreimal in Folge derselbe Fehler** — G-216, G-247, G-246:
ein Waechter suchte den Feldnamen im Quelltext, statt zu pruefen, ob
die Wirkung eintritt.

    G-216   verglich die Anzahl `.select(` mit der Anzahl
            Schreibzugriffe - ein Zugriff mit zwei `.select()` glich
            den Verlust bei einem anderen aus
    G-247   prueft, ob `setFilter` im Text steht, statt ob die Liste
            geschnitten wird
    G-246   sucht den Feldnamen, statt den Aufruf

`[read]` **Alle drei fielen erst durch die Sabotageprobe auf** — der
Waechter selbst blieb gruen, waehrend die Sache kaputt war.

`[read]` **Also: ein Waechter misst das Ergebnis.** Steht der Wert im
DOM? Ist die Liste kuerzer? Fehlt die Zeile in der Datenbank?
**Nicht: kommt das Wort im Quelltext vor.**

`[cmd]` **Und A-59 ist derselbe Fehler beim Zaehlen:** 89
Attrappenmarken im Quelltext gegen 24 auf dem Schirm.

## Jede Messung nennt Nutzer und Zeitraum

`[cmd]` **Am 28.08. haben zweimal zwei Beteiligte verschiedene Zahlen
fuer dieselbe Sache gemeldet** — Vitamin A bei 164 gegen 172 Prozent
(C-334), und 1.794 gegen 724 Tageszeilen (G-247).

`[read]` **Beide Male lag es nicht an den Daten**, sondern daran, dass
niemand angegeben hat, fuer wen und ueber welchen Zeitraum gemessen
wurde.

`[cmd]` **Fuenf Nutzer haben Tagesdaten** — `dev@lumeos.app`, drei
Seed-Konten mit je 180 Tagen, und `test-user@lumeos.local` mit einem.
**Eine Zahl ohne Nutzerangabe kann alles bedeuten.**

**Also: jede gemeldete Zahl nennt Nutzer und Zeitraum.** `[read]`
**Sonst ist sie nicht nachpruefbar — und eine Abweichung sieht aus
wie ein Defekt.**

## In `backup/` loescht niemand ausser Tom

**Tom, 2026-09-02:** *,,alles was aelter ist wird in einen /temp
ordner gelegt den ich entsorge. ich traue niemandem mehr von euch
betreffs loeschbefehlen."*

`[read]` **Kein Agent, kein Orchestrator.** **Was seine Frist
ueberschreitet, wird nach `backup/_temp/` verschoben.**

`[read]` **Ein Verschieben ist umkehrbar, ein Loeschen nicht** —
**und das Manifest haelt fest, was wohin ging** (C-216).

### Zwei Ordner sind Quellen, keine Sicherungen

`[cmd]` **Sechs Kettenschritte und `apps/web/.../evidenz/registry.ts`
lesen aus `backup/kimi-research/` und `backup/legacy-v2/`.**

`[read]` **Ein Raeumplan haette sie mitgenommen** — **der naechste
Kettenlauf waere gescheitert.**

`[cmd]` **`backup/quellen-NICHT-RAEUMEN.md` fuehrt die sieben
Fundstellen.**

### Und der Waechter erinnert

`[cmd]` **`tools/backup-wachstum.mjs` laeuft im Gate** — **er meldet
bei ueber 2,5 GiB oder sieben Tagen ohne Inventur.**

`[cmd]` **Am 02.09.: 5,97 auf 2,31 GiB** — **56 von 57
Vollsicherungen, von denen nie eine zurueckgespielt wurde.**

`[read]` **A-39 gilt weiter: nicht raeumen, solange Agenten
laufen.**

## Eine Pruefung muss in beide Richtungen belegt sein

`[read]` **Ein Waechter, der laeuft und nichts findet, ist von einem,
der nichts prueft, nicht zu unterscheiden** — **ausser man baut einen
Fehler ein.**

`[cmd]` **Am 01.09. waren acht Waechter gruen, waehrend `tsc` acht
Syntaxfehler meldete.** Ursache: ein JSX-Kommentar als erstes Element
nach `return (` — dort gilt er nicht.

`[cmd]` **Und am 02.09. fiel dieselbe Klasse zwoelfmal an einem Tag:**
**der Waechter prueft das Wort statt der Wirkung.**

    onAktivieren?: (id: string) => void
      der Name war da, die id wurde verworfen

    pruefeHerkunft == 4
      wocheKopieren ist der fuenfte

    posten.slice(0,0).map
      das Wort stand da, die Liste war leer

### Die Regel

**Vor jeder Validierung: einen Fehler einbauen und messen, dass sie
rot wird.**

`[read]` **Und die Frage dabei ist nicht *,,steht das Wort da"*,
sondern *,,was wuerde die Sabotage aendern, und faengt der Waechter
genau das"*.**

`[cmd]` **`nutrition-c380-seed-plan-variety.test.ts` ist das
Vorbild:** erst rot gegen die 84 Hammelfilet-Zeilen, danach gruen.

## Markdown nur ueber write_file

`[cmd]` **`edit_block` und `str_replace` zerstoeren Tabellen** —
Pipes gehen verloren, Zeilen verschmelzen.

**Vollstaendiger Inhalt, dann `git diff` zur Kontrolle.**

`[read]` **Und die Datei vorher einlesen, nicht aus dem Kontext
rekonstruieren.** `[cmd]` **Am 02.09. hat ein `UnicodeEncodeError`
`plan-lesen.ts` von 645 auf 119 Zeilen abgeschnitten** —
`io.open(...,"w")` leert die Datei sofort, der Fehler kam erst beim
Schreiben.

`[read]` **Wer ueber eine Nebendatei mit `os.replace` schreibt, hat
das Problem nicht.**

## Der Auftrag geht raus, bevor abgenommen wird

**Tom, 2026-09-02, dreimal an einem Tag:** *,,und wieder vergessen
den neuen auftrag zu geben."*

`[read]` **Der Zyklus hat eine feste Reihenfolge, und der zweite
Schritt wird uebersprungen, weil der Bericht interessanter ist als
die Verwaltung:**

    Bericht kommt
      1  Kurzcheck: ist ein vorbereiteter Auftrag betroffen?
      2  AUFTRAG RAUS -- der Agent wartet
      3  Abnahme mit eigener Messung
      4  Befunde als Punkte
      5  committen, getrennt nach Agentenbereich
      6  next/ fuellen

`[read]` **Schritt 2 kostet eine Minute, Schritt 3 zwanzig.**
**Wer zuerst abnimmt, laesst einen Agenten zwanzig Minuten
stillstehen.**

`[cmd]` **Seit A-68 misst ein Waechter es:** `punkte-pruefen.mjs`
meldet **ACHTUNG**, wenn ein Agent null laufende Punkte hat und
mindestens einen in `next/`.

`[read]` **Er steht im Punktelauf, den der Zyklus ohnehin macht.**

## Tom entscheidet, wann eine Attrappe faellt

**Tom, 2026-09-07:** *,,wenn etwas vollumfaenglich angebunden ist
nehme ich das ab und dann ist die attrappe obsolet weil erledigt.
und ich definiere wann was erledigt ist."*

    1  die Attrappe wird kopiert
    2  die Kopie wird angebunden und oben eingehaengt
    3  die Attrappe bleibt DARUNTER stehen
    4  Tom vergleicht Ist gegen Soll auf einem Schirm
    5  nimmt er ab, faellt die Attrappe

`[read]` **Kein Ersetzen, ein Danebenstellen.** **Oben das
Angebundene, unten das Mockup wie es gedacht war.**

`[cmd]` **Die Vorgabe fuer die Oberflaeche ist das Mockup** —
**nicht die Vorstellung des Agenten davon.**

`[read]` **Kein Agent entfernt eine Attrappe. Der Orchestrator auch
nicht.**

`[read]` **Bis zur Abnahme bleibt sie stehen, auch wenn daneben die
echte Sache schon funktioniert** (E-69).

`[read]` **Das kostet ein paar Tage doppelte Anzeige** — **und
verhindert, dass etwas still verschwindet.**

## Eine Attrappe bleibt sichtbar und sagt, worauf sie wartet

**Tom, 2026-09-07:** *,,nicht angebunden heisst es bleibt als
attrappe in der ui visible."*

`[read]` **Nicht anbindbar ist kein Grund zum Weglassen** — **es ist
ein Grund zum Kennzeichnen.**

**Die Form** (E-68):

    // Attrappe -- SPEC_08 Flow 3
    //   wartet auf: goal_phases-Schreibweg (G-357)

`[cmd]` **Gemessen 2026-09-07: 69 Vermerke in `v2/goals`, 62 ohne
Grund.**

`[read]` **Ein Vermerk ohne Grund wird zur Ausrede.** `[read]` **Ein
Vermerk mit falschem Grund wird beim naechsten Auftrag zitiert** —
`[cmd]` **dreimal an einem Tag passiert.**

## Die Kette gewinnt gegen die Live-Aenderung

**C-410, gemessen 2026-09-07.**

`[cmd]` **C-366 stellte drei Lesefunktionen live auf
`food_tags_effective` um.** `[cmd]` **C-405 liess die Kette neu
laufen** — **und `075_preference_search_application.sql` erzeugte
zwei davon aus dem alten Quelltext neu.**

`[read]` **Kein Mensch hat etwas zurueckgenommen.** **Ein
Kettenschritt hat eine spaetere Aenderung ueberschrieben.**

`[read]` **Wer eine Funktion aendert, aendert sie an der Quelle** —
**`supabase/_pipeline/`, nicht nur live.**

`[cmd]` **Und der Test, der es haette melden koennen, war rot und
nicht im Gate** — **ein Test, der niemanden erreicht, ist eine
Notiz.**

## Ein Bericht ist kein Nachweis

**Tom, 2026-09-02:** *,,da hat sich null komma nichts geaendert."*

`[cmd]` **Anlass: G-311 meldete *vier von vier Plaenen sichtbar, alle
Herkunfts-Badges belegt*.** `[cmd]` **Die Buehne lag auf
`test-user` und war nach dem Nachweis zurueckgebaut** — **der Beleg
existierte nicht mehr, als der Orchestrator abnahm.**

`[read]` **Zwei Fassungen des Fehlers, beide an einem Tag:**

    "vier von vier sichtbar"     die Buehne war weg
    Kacheltitel abgehakt         der Inhalt war ein anderer

`[read]` **Was zaehlt, ist der Zustand, den Tom sieht** —
`dev@lumeos.app`, im Browser, mit Daten.

### Drei Regeln daraus

**Wer einen Nachweis fuehrt, laesst die Buehne stehen** — oder der
Orchestrator legt Daten an, bevor er abnimmt.

**Wer eine Kachel abnimmt, vergleicht den Inhalt** — nicht den
Titel. `[cmd]` **Zeile der Vorlage gegen Zeile am Schirm, mit
Zeilennummer.**

**Und wer eine Komponente in einen Auftrag schreibt, prueft, dass es
sie gibt.** `[cmd]` **`RecipeDetail` und `MealPlansView.js` waren
beide erfunden** — die eine ein Kommentar, die andere die falsche
von zwei gleichnamigen Dateien.

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

## Suchen nach der Sache, nicht nach dem Wort

`[cmd]` **Am 2026-08-30 gesucht: *,,noch nicht entwickelt"*.**
`[cmd]` **Der Baustein heisst `InEntwicklungKnopf` und schreibt
*,,in Entwicklung"*** — **39 Aufrufer, quer durch alle v2-Module.**
**Nicht gefunden, und daraufhin behauptet, es gebe ihn nicht.**

`[read]` **Tom hat ihn mit einem Bildschirmfoto belegt.**

### Dasselbe Muster, das die Waechter betrifft

`[cmd]` **G-216, G-247, G-246, G-108: ein Waechter prueft das Wort
statt der Wirkung.** `[read]` **Hier sucht der Orchestrator das Wort
statt der Sache** — dieselbe Klasse, andere Rolle.

### Was stattdessen

**Nach der Wirkung suchen, nicht nach dem Wortlaut.**

    schlecht   grep "noch nicht entwickelt"
    besser     grep "Entwicklung|Platzhalter|nicht angebunden"
               oder: welche Datei rendert das Modal aus dem Bild?
               oder: was importiert die Datei, die den Knopf traegt?

`[read]` **Und wenn ein Bildschirmfoto vorliegt: von dort ausgehen.**
**Der Knopf im Bild hat einen Aufrufer, und der hat einen Import.**

## Die Datei ist die Wahrheit, nicht ihre Zusammenfassung

**Tom, 2026-08-29:** *,,wir arbeiten mit lokalen md dateien und nicht
mit deinen erinnerungen, deswegen bauen wir diese strukturen und
ssot"*.

`[read]` **Wer eine Frage vorlegt, einen Auftrag schreibt oder einen
Stand meldet, liest die Datei zuerst.** **Nicht: aus dem Kontext
rekonstruieren, was darin stand.**

### Was am 2026-08-29 daran haengengeblieben ist

`[cmd]` **G-254 heisst *,,sechs Kacheln brauchen eine
Entscheidung"*.** Ich habe Tom **eine** davon vorgelegt und seine
Antwort auf den ganzen Punkt geschrieben. **Fuenf Kacheln waeren
stillschweigend entschieden gewesen** — als seine Entscheidung, im
ADR. **Berichtigt: der eine Fall ist G-258, G-254 blieb offen.**

`[cmd]` **G-245/G-70:** beide Zahlen gemessen — live vier
Sortierwerte, im Kettenschritt zehn — **und die falsche in den
Auftrag geschrieben.**

`[cmd]` **Der Mockup-Massstab:** drei Stunden im falschen Ordner
gesucht. **`00-QUELLEN.md` nannte den richtigen seit dem 20.08.**

`[read]` **Alle drei entstanden beim Umformulieren, nicht beim
Messen.** **Die Datei lag jedes Mal daneben.**

### Was daraus folgt

**Eine Frage wird aus der Datei zitiert, nicht referiert.**
**Ein Punkt mit mehreren Fragen wird aufgeteilt, bevor er vorgelegt
wird** — eine Sammelfrage ist keine Frage.
**Ein Auftrag nennt die Punktdatei, und der Agent liest sie** — die
Chatnachricht ist der Anstoss, nicht die Vorgabe.

`[read]` **Und wenn Datei und Gedaechtnis auseinandergehen, gilt die
Datei** — ohne Nachdenken darueber, welche Fassung plausibler
klingt.

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

## Nur ein Agent fasst den Dev-Server an

**Tom, 2026-08-30:** *,,dann musst du deine auftraege so steuern dass
nicht beide agents neustarts generieren"*.

**Der UI-Agent darf. Codex nie.**

`[read]` **Der Grund ist der Bedarf, nicht die Rangfolge:** `[cmd]`
**Codex arbeitet in `supabase/_pipeline/` und braucht keinen
Browser.** `[cmd]` **Der UI-Agent braucht ihn fuer `schuss.mjs` —
Bildschirmfotos, Attrappenzahl, Ladezeit.**

### Was gemessen wurde

`[cmd]` **18 Starts im Log, sechs an einem Tag.** `[cmd]` **Vor keinem
ein Fehler** — `server.py neustart` fuehrt `taskkill /T /F` auf Port
3200 aus, **und beide Agenten teilen sich `apps/web`.**

`[cmd]` **Getrennte Ports loesen es nicht:** zwei `next dev`-Prozesse
beobachten und kompilieren denselben Quellbaum doppelt, **egal welcher
Bauordner** (G-280).

`[cmd]` **Aber `server.py start` schont einen gesunden Server
bereits** — **18 Starts vor und nach der Gegenprobe unveraendert.**

### Was in den Auftrag gehoert

**An Codex, in jeden Auftrag:**

    Der Dev-Server gehoert dir nicht. Kein `server.py neustart`,
    kein `start`, kein `aufraeumen`. Wenn eine Messung ihn braucht:
    melden, nicht starten.

**An den UI-Agenten:**

    Der Dev-Server gehoert dir. `server.py start` bevorzugen -- er
    laesst einen gesunden stehen. `neustart` nur, wenn `start` nicht
    reicht.

`[read]` **Und Tom benutzt 3200 mit** — **Aenderungen erscheinen dort
automatisch.** **Wer neu startet, unterbricht ihn.**

## Ein Bericht wird abgearbeitet, bevor der naechste Auftrag geht

**Tom, 2026-08-30:** *,,abarbeiten, ergaenzen, in erledigt ablegen"*.

**Tom, 2026-08-30, praezisiert:** *,,report kommt, kurzanalyse ob
folgeauftrag betroffen, allfaellige anpassung, auftrag raus und dann
berichte abarbeiten"*.

**Und derselbe Tag, als stehender Ablauf:** *,,du spielst nun
jedesmal den vollen cycle durch ohne mein befehl, sprich du bist
fertig wenn berichte kurzcheck, neue auftraege raus, berichte check
und abarbeiten, neue next drin sind"*.

`[read]` **Kommt ein Bericht, laeuft der Zyklus ohne Aufforderung.**
**Er ist erst zu Ende, wenn `next/` wieder gefuellt ist.**

    1  Bericht ueberfliegen: ist der vorbereitete Auftrag betroffen?
    2  falls ja: anpassen
    3  Auftrag aus laufend_<agent>/next/ eine Ebene hoeher, raus
    4  DANN abarbeiten:
         nachmessen, was der Bericht behauptet
         Abnahme in die Punktdatei
         Datei nach erledigt/
         neue Befunde als Punkte
         committen, Commit-Hash nachtragen

`[read]` **Der Agent wartet nicht, waehrend der Orchestrator
abnimmt.** `[cmd]` **Und weil der naechste Auftrag vorbereitet in
`next/` liegt, ist Schritt 3 ein Verschieben, kein Schreiben.**

`[read]` **Der Ordner bleibt trotzdem ehrlich:** ein fertig
gemeldeter Punkt liegt hoechstens Minuten in `laufend_*`, **nicht bis
zum naechsten Gespraech.**

### Wann der Zyklus zu Ende ist

    laufend_*/          nur was wirklich laeuft
    erledigt/           jeder Bericht abgenommen, mit Commit-Hash
    laufend_*/next/     je Agent ein Buendel vorbereitet
    Waechter            gruen
    neue Befunde        als Punkte angelegt

`[read]` **Fehlt eines davon, ist der Zyklus nicht fertig** — auch
wenn niemand nachfragt.

### Was keine Frage an Tom ist

**Tom, 2026-08-30:** *,,entscheidungen sind gefallen was soll denn
nun noch dazu sagen? umsetzen und ablegen oder was? ich sehe den
punkt nicht was du von mir willst?"*

`[cmd]` **Anlass: C-357.** Vier ADRs widersprachen neueren
E-Entscheidungen. `[read]` **Die Sachfragen waren entschieden** —
E-11, E-16, E-20, E-29, E-30, E-35. **Was fehlte, war ein Vermerk in
`docs/`, und `docs/` gehoert dem Orchestrator.**

`[read]` **Eine Aufraeumarbeit als Entscheidung vorzulegen kostet Tom
Zeit und bringt nichts.**

**Vor jeder Vorlage: ist die Sachfrage offen, oder nur ihre
Ausfuehrung?**

    Sachfrage offen      vorlegen
    nur Ausfuehrung      machen
    Ausfuehrung in docs/ immer machen

`[read]` **Und die Gegenprobe:** koennte ich die Frage selbst
beantworten, ohne etwas zu erfinden? **Dann ist es keine Frage.**

### Was den Zyklus unterbricht

`[read]` **Nur eines: wenn ein Bericht eine Entscheidung braucht, die
Tom gehoert.**

`[cmd]` **Beispiele vom 30.08.:** die zwei Magnesium-Obergrenzen
(C-350), der Katalog ohne deutsche Namen (C-352), Thai ohne Aliase
(C-177).

`[read]` **Dann laeuft der Zyklus trotzdem weiter** — der Punkt geht
nach `todos/` mit dem gemessenen Stand, **und die Frage wird
vorgelegt.** **Der Agent wartet nicht auf eine Entscheidung, die er
nicht braucht.**

### Warum

`[cmd]` **Am 30.08. lagen die Berichte zu C-163 und C-351 vor, und
der Orchestrator schrieb zuerst zwei neue Auftraege.** `[read]` **Tom
sah `laufend_codex/` mit sechs Dateien, von denen zwei laengst fertig
waren** — **derselbe Zustand, den die alte `LAUFEND.md` am 23.08.
erzeugt hat und der sie das Leben gekostet hat.**

`[read]` **Der Ordner ist die Wahrheit ueber den Zustand.** **Wer ihn
nicht raeumt, macht ihn zur Luege.**

## Der Auftrag beschreibt den Job, der Agent misst

**Tom, 2026-08-28:** *,,beschreib den job und lass die agents
messen"*.

`[read]` **Ein Auftrag traegt die Frage und die Messanweisung — keine
Zahl, keine Diagnose, keine Ursache vom Orchestrator.**

    falsch   "food_search kennt zehn Sortierwerte, bau sie ein"
    richtig  "miss, welche Sortierwerte die laufende Funktion kennt,
              und bring sie in die Oberflaeche"

    falsch   "die 6,4 Sekunden kommen von einer RPC-Schleife"
    richtig  "der Reiter laedt in 6,4 s - miss, woran es liegt"

### Warum

`[cmd]` **Am 28.08. sind fuenf Auftragspraemissen gefallen**, und die
Ursache war jedes Mal dieselbe: **gemessen und dann etwas anderes
behauptet.**

`[cmd]` **Der klarste Fall, G-245/G-70:** ich hatte beide Zahlen
gemessen — **live vier Sortierwerte, im Kettenschritt zehn** — und in
den Auftrag die falsche geschrieben. **Nicht falsch gemessen. Falsch
verwendet.**

`[cmd]` **Bei G-107:** die Ladezeit einer RPC-Schleife zugeschrieben,
**die ich nie gesucht habe.** Codex hat gemessen: **es gibt keine.**

`[read]` **Ein Kettenschritt ist nicht live.** Zweimal an einem Tag
verwechselt — bei C-331 in die andere Richtung.

## Die Abnahme misst nach, was der Bericht behauptet

`[read]` **Nicht was der Orchestrator vermutet.** **Der Bericht sagt,
was zu pruefen ist** — jede tragende Zahl darin wird gegen die
Datenbank oder den Code gehalten.

`[cmd]` **Das hat am 28.08. zweimal etwas gefunden, das sonst
durchgegangen waere:** 16 statt 12 Doppelzeilen in G-239, und
`nutrition_targets` liegt in `goals`, nicht in `nutrition`.

`[read]` **Der Unterschied zum Auftrag:** in der Abnahme wird eine
Zahl **verglichen**, im Auftrag wird eine **gesetzt.** **Das Setzen
geht schief, das Vergleichen nicht.**

`[cmd]` **Und ohne eigene Messung entsteht A-57:** 25 Punkte per
Textheuristik geschlossen, **mindestens zwei falsch** — gefunden von
einem Agenten, der eine Anweisung verweigert und selbst gemessen hat.

**Weicht die Zahl des Orchestrators ab, gilt die des Agenten**, bis
eine dritte Messung entscheidet.

## Der Orchestrator zaehlt nicht

**Tom, 2026-08-27:** *,,11 von 12 falsch sagt mir du kannst es einfach
nicht also lass es die tun die es koennen"*.

**Ein Auftrag traegt die Frage und die Messanweisung — keine Zahlen
vom Orchestrator.**

`[cmd]` **Am 27.08. lagen meine Zaehlungen elfmal daneben, jedes Mal
beim Abgrenzen einer Kategorie** — 27 statt 18 Attrappen (`git grep
-c` zaehlt Zeilen), 5 statt 7 Tabellen (ein Regex loest keine View
auf), 124 statt 380 Wirkstoffe, 31 statt 20 Regeln (Textsuchtreffer
fuer eine Kategorie gehalten), 3 statt 1 Schreibstelle, 47 statt 43
Punkte, 244 statt 221 Datumsangaben (`null` ist ein Zeichen).

`[read]` **Der Befund, der es entscheidet:** in jedem Fall haette der
Agent dieselbe Zahl gemessen, auch ohne meine. **Meine Zahl hat nie
etwas beigetragen — nur einen Umweg erzeugt.**

**Was der Orchestrator weiter prueft: ob das Ziel existiert und nicht
schon erledigt ist.** `[cmd]` Viermal hat das einen Auftrag gerettet
— G-207, G-211, G-138, G-176. `[read]` **Das ist eine Ja/Nein-Frage,
keine Zaehlung.**

**Formulierung:**

    frueher   ,,Es sind 31 Regeln, pruef das."
    jetzt     ,,Miss, wie viele Regeln ueber `drug_class` gehen -
               und sag mir, wie du abgegrenzt hast."

`[read]` **Die Abgrenzung mitzuverlangen ist der Kern** — genau dort
ging es bei mir jedes Mal schief.

**Die alte Regel bleibt gueltig, wo Zahlen unvermeidbar im Auftrag
stehen** (etwa aus einem fremden Bericht): dann sind sie
Ausgangsvermutungen, und die gemessene gilt.

## Zahlen im Auftrag sind Ausgangsvermutungen

**Tom, 2026-08-26:** *„mittlerweile in jedem bericht lese ich dass du
fehler machst, loese das oder sag im auftrag er soll selber messen wenn
du nicht faehig bist."*

`[read]` **Die Loesung ist nicht mehr Sorgfalt, sondern eine andere
Formulierung:**

    NICHT   "Erwartung: 292 Zeilen"
    SONDERN "Meine Messung ergab 292 -- pruef sie zuerst.
             Weicht deine ab, gilt deine, und du nennst beide."

`[read]` **Der Unterschied ist verfahrenstechnisch.** Eine
Erwartungszahl wird zum Sollwert: der Agent baut, bis sie erreicht ist.
**Eine Ausgangsvermutung wird geprueft — und wenn sie faellt, ist das
ein Befund und kein Streit.**

`[cmd]` **Neun Faelle in fuenf Tagen, alle derselben Art: die Abfrage
traf den falschen Ausschnitt.**

    C-275   im_katalog::text gegen 't' statt 'true'   -> 0 statt 317
    C-276   Dublettenprobe auf name_en statt Kern     -> 18 durch
    G-184   Kategorie als Code angenommen             -> 41 Werte
    G-191   upper_limit gegen 290 statt 412 Zeilen    -> 3 statt 13
    C-280   substance_class als einzige Zuordnung     -> auch IDs
    G-195   note_de 320 / rechtslage 136              -> 305 / 201
    G-196   Kontrast aus kaputter Messung             -> gab es nie
    C-284   raw->'pregnancy' is not null              -> 1 statt 498
    C-288   kanonische Datei statt Enrichment-Layer   -> ATC 56/419

`[read]` **In sieben von neun Faellen hat der Agent es gefunden, nicht
der Orchestrator.**

`[read]` **Wer eine Zahl nennt, nennt auch die Abfrage, mit der sie
entstand.** Dann ist nachpruefbar, ob sie den richtigen Ausschnitt
getroffen hat — **das war in allen neun Faellen das Problem, nicht die
Rechnung.**

**Und die Schwester dieser Regel, aus G-190:** `[read]` **jede
Leistungszahl nennt das Konto**, so wie jede Bestandszahl den Stichtag
nennt. `[cmd]` `ladeRegeln` braucht auf dev 926 ms, auf test-user
62 ms — **Faktor 15, weil dort 360 Einnahmen gegen 24 stehen.**

## Teilstring-Vergleiche brauchen Wortgrenzen

`[cmd]` **Zweimal derselbe Fehler, und beim zweiten Mal im Waechter
gegen ihn:**

    G-187   /daten\?\.wechselwirkungen/  traf ...wechselwirkungenX
    G-197   includes('community_anzeige') traf ...anzeigeX

`[read]` **Claude Codes Einordnung:** *„Das sagt, dass diese Klasse
nicht durch Aufmerksamkeit vermeidbar ist."*

**Wer einen Namen in einem Waechter sucht, sucht ihn mit Wortgrenze** —
`\b`, Zeichenklasse oder exakter Vergleich. **Nie `includes`, nie ein
unverankertes Muster.**

`[read]` **Und die Pointe:** ein Waechter gegen unverankerte Muster,
der selbst eines benutzt, ist die dritte Auflage desselben Fehlers.

## Eine Pruefung misst oft etwas anderes als gemeint

`[cmd]` **Sechs Faelle in drei Tagen**, alle nach demselben Muster: die
Pruefung war gruen, das Ergebnis falsch.

    G-186   der Waechter fand wofuer_de erst in der Abfrage,
            dann in der Abbildung, dann im eigenen Kommentar
    G-187   /daten\?\.wechselwirkungen/ traf auch ...X
    G-191   scrollWidth > clientWidth misst nur den eigenen Kasten --
            der Text brach darin um, erst die Tafel beschnitt ihn
    G-184   wadaNote={undefined} kam durch, weil der Name in der
            Typdeklaration weiterlebt
    G-196   Hintergrund von Weiss aus komponiert, oklch als RGB
            gelesen -- die Zahlen waren nicht unsicher, sondern falsch
    G-199   .from('community_anzeige') auf ...X, kein Test fiel um

`[read]` **Der letzte war teuer:** genau so ist G-192 haengen
geblieben — der Lesepfad gab still `null` zurueck, **und niemand
merkte es, bis Tom fragte, wo das Community-Zeug bleibt.**

**Die Lehre: bewach die Verdrahtung, nicht nur die Funktion.** `[cmd]`
`tools/verdrahtung-pruefen.mjs` (G-197) misst 89 verdrahtete Namen, 54
in keinem Test — **aber zwei bekannte Faelle fallen nicht, Ursache
offen (G-200). Die fuenf Einzelwaechter bleiben stehen.**

## Wegwerf-Datenbank zum Pruefen, laufende Instanz zum Abschliessen


`[cmd]` **Am 2026-08-22 lagen sechs Auftraege committet und nicht
eingespielt:** C-191, C-192, C-195, C-196, C-197, C-215. Live 31
Spalten, committet 63. Eine ganze Woche Arbeit war auf Toms Rechner
nie sichtbar.

`[read]` **Der Fehler war der des Orchestrators.** In jedem
Pipeline-Auftrag stand *„Wegwerf-Datenbank, danach verwerfen"* \u2014
richtig, aber **es stand nie ein Schritt danach.** Der Auftrag endete
beim gruenen Kettenlauf auf einer Datenbank, die anschliessend
geloescht wird. Codex hat jedes Mal genau das getan, was dastand.

`[read]` **Und die Pruefung war formal richtig, inhaltlich blind:**
gemessen wurde, dass *das Skript* 60 Spalten erzeugt. Im C-195-Abschluss
steht *„Live-Datenbank unberuehrt: 31 Spalten"* sogar als **Beleg fuer
saubere Arbeit**. Aufgefallen ist es Fable, als es etwas anzeigen
wollte.

**Deshalb: Ein Pipeline-Auftrag ist nicht fertig, wenn die Kette gruen
laeuft \u2014 sondern wenn die Aenderung dort ist, wo Tom sie sieht.** Der
Auftrag nennt beide Schritte oder er ist unvollstaendig geschrieben.

**Und vor dem Einspielen steht eine Sicherung, die zurueckgespielt
wurde.** `[cmd]` Ein Volldump mit `auth`-Schema, geprueft durch
Restore auf eine Wegwerf-Instanz, mit gezaehlten Zeilen UND Policies \u2014
`pg_restore` laesst Policies sonst still fallen. **Ein ungepruefter
Dump ist kein Backup:** der Vollrestore vom 2026-08-22 scheiterte an
einem Supabase-internen `graphql_public.graphql`-GRANT und lief erst
mit `--no-privileges` durch. Das findet nur, wer es einmal tut.

## Keine Terminalfenster — und der Orchestrator haelt sich selbst daran

**Tom, 2026-08-19:** *,Diese scheiss Terminalfenster poppen immer noch
ueberall auf."*

`[cmd]` **Die Regel stand seit dem 2026-08-18 hier** — `shell=False`,
`shlex.split`, `STARTF_USESHOWWINDOW`, `CREATE_NO_WINDOW`. **Der
Orchestrator hat sie selbst nicht befolgt** und in jedem Pruefskript
`subprocess.run(..., shell=True)` benutzt.

### Die Hilfsfunktion liegt bereit

`[cmd]` **`tools/lauf.py`** mit `lauf()`, `git()` und `psql()`.
**Benutzung:**

```python
import sys; sys.path.insert(0, r"D:\GitHub\LumeOS-Claude-V1\backup")
from _lauf import lauf, git, psql

print(git("status", "--short"))
print(psql("select count(*) from nutrition.foods;"))
print(lauf(["node", "--version"]))
```

`[cmd]` **Gegengeprobt am 2026-08-19** — drei Aufrufe, kein Fenster.

`[read]` **Kein `shell=True`, keine Zeichenkette an die Shell.** Wer
einen Befehl braucht, der nicht ueber `lauf()` geht, **erweitert die
Datei statt danebenzuschreiben.**

### Bildschirmfotos: `tools/schuss.mjs`, nicht gstack

**Tom, 2026-08-20:** *,Wieso haben die kein Playwright?"*

`[cmd]` **Sie haetten.** `@playwright/test` 1.41.2 steht in der
Wurzel-`package.json`, `chromium_headless_shell` liegt im Cache.
**Es wurde nie benutzt** — stattdessen startete ein Agent einen
Bun-Browser, der auf jedem Aufruf ein Fenster oeffnete.

`[cmd]` **`tools/schuss.mjs`** meldet sich selbst an, wartet auf
`networkidle` und liefert **Bild, Attrappenzahl, Konsolenfehler und
Laufzeit in einem Aufruf:**

```bash
node tools/schuss.mjs /v2/nutrition backup/x.png
node tools/schuss.mjs /v2/nutrition backup/x-375.png --breite 375 --dunkel
```

`[cmd]` **Gegengeprobt am 2026-08-20:** angemeldet, Titel `Tagebuch ·
LumeOS`, 288 KB Vollseite, **7 Attrappen, 2 Konsolenfehler** — **kein
Fenster.**

`[read]` **Damit faellt auch A-24 weg:** Die Markenzahl kommt aus der
gerenderten Seite, nicht aus Textmarken im Quelltext.

### Ein UI-Auftrag misst die Antwortzeit — angemeldet

`[cmd]` **Anlass C-189:** Der Supplements-Tab war seit C-133 **neun
Sekunden** langsam. **Fuenf Auftraege haben ihn angefasst, keiner hat
es gemessen.** Ursache war ein Aufruf in einer Schleife — 64 Mal
dieselbe Unterfunktion. **7.641 ms → 144 ms.**

`[read]` **Und zweimal falsch gemessen:** erst ohne Anmeldung (122 ms
gegen die Anmeldeseite), dann als Kaltstart abgetan. **Tom hat
widersprochen, und er hatte recht.**

`[cmd]` **Seit A-45 liefert `schuss.mjs` es mit, ohne Schalter:**

```
zeit.gesamt_ms      vom `goto` bis `networkidle`
zeit.dokument_ms    `responseEnd` der Hauptanfrage
zeit.langsamste     Anfragen ueber 300 ms, die drei groessten, mit URL
zeit.zweiter_lauf   dieselbe Seite noch einmal, gleiche Sitzung
```

**Zwei Laeufe, weil ein einzelner Wert nichts sagt.** `[read]` Der
erste Aufruf einer Route uebersetzt im Entwicklungsmodus. **Ist der
zweite genauso langsam, ist es kein Kaltstart.**

`[cmd]` **Gegengeprobt am 2026-08-21:** `?tab=catalog` **2.469 ms /
2.206 ms**, `?tab=nutrients` **2.034 ms / 1.833 ms** — beide Male ist
die langsamste Anfrage das Dokument selbst, und sie wird benannt.

`[read]` **Keine Schwelle, kein Rot.** Das Werkzeug misst, es urteilt
nicht: Eine Sekunde ist im Dev-Modus normal, neun nicht — **aber wo die
Grenze liegt, weiss niemand.**

**Bei Datenbankfunktionen gehoert `explain (analyze, buffers)` dazu**,
nicht nur *„laeuft in X ms"*. `[read]` **`temp read/written` verraet
ein Kreuzprodukt sofort.**

### Der Konsolenfehler-Zaehler hat bis A-45 die Anmeldung mitgezaehlt

`[cmd]` **Gemessen am 2026-08-21:** `/v2/medical?tab=dashboard` wirft
**eine** Meldung je Laden — die alte Fassung meldete **zwei**, weil sie
die der Anmeldeseite mitzaehlte.

`[read]` **Die „2 je Seite" aus G-105 und G-123 sind also eine der
Anmeldung plus eine der Seite.** `konsolenfehler` nennt jetzt nur die
der gemessenen Seite; **`konsolenfehler_mit_anmeldung` traegt die alte
Zahl weiter**, damit frueherer Berichte zuzuordnen bleiben.

## Der Dev-Server und das Gate teilen sich nichts — wenn man es laesst

**Tom, 2026-08-19:** *,Irgendeiner schiesst immer den Server ab, geht
das nicht ohne?"*

**Ja. Die Trennung existiert seit dem 2026-08-06 (B-18).**

`[cmd]` **`apps/web/next.config.js` liest `LUMEOS_DIST_DIR`.** Das Gate
setzt `.next-gate`, **der Dev-Server bleibt auf `.next`.** Beide
Verzeichnisse stehen nebeneinander, **keiner raeumt das des anderen
ab.**

`[cmd]` **Und die zweite Ursache ist auch geloest:** `turbo.json` setzt
`dependsOn: ["^build", "build"]` bei `typecheck` — **sonst liefen
Typecheck und Build desselben Pakets gleichzeitig.** *,6 von 6 Laeufen
gruen bei laufendem Dev-Server."*

### Was Agenten trotzdem taten

`[cmd]` **Der G-87-Agent rief `next build` direkt auf** — ohne die
Variable, **also in `.next`.** *,Mein `next build` hatte dem
Entwicklungsserver die Chunks weggeschrieben."*

`[cmd]` **Und der Orchestrator schrieb in drei Auftraegen
*,`.next` loeschen und neu starten"*** — **also genau das Verzeichnis
anfassen, das der Dev-Server benutzt.** Der Rat war falsch.

### Die Regeln

**Nie `.next` loeschen.** `[read]` Es ist die Notloesung, nicht der
erste Griff.

**Nie `next build` direkt aufrufen.** `[cmd]` Nur `pnpm gate` oder
`pnpm --filter @lumeos/web build` — **die setzen die Variable.**

**Wenn die Oberflaeche kaputt aussieht:** `[cmd]` **erst pruefen, ob
jemand die Trennung umgangen hat.** `[read]` Ein Build in `.next` ist
die wahrscheinlichere Ursache als ein kaputter Cache.

**Und wenn wirklich geraeumt werden muss:** `[cmd]` **Server beenden,
raeumen, neu starten — in dieser Reihenfolge.** Wer nur raeumt, bekommt
404 fuer jeden Chunk, **und die Anmeldung schickt die Zugangsdaten per
GET in die URL** (G-82).

### Ein Server, ein Startweg: `tools/server.py`

**Tom, 2026-08-22:** *,kann ja nicht sein dass ich jedesmal nach einem
Lauf probleme habe und 20 minuten verplaemper mit der suche was mit
next los ist"*

`[cmd]` **Der Befund dahinter, gemessen am 2026-08-22: FUENF
`next dev`-Instanzen liefen parallel gegen dieses Repo** (3200, 3201,
3205, 3207, 3310). Der Mechanismus: ein Agent startet `pnpm dev`,
Port 3200 ist besetzt, **Next weicht stumm auf den naechsten Port
aus** — niemand merkt es, jede Instanz haelt eigene Datei-Watcher,
jeder Edit kompiliert fuenffach, und der 3200er verhungert (1,5 GB
RSS, /login ohne Antwort).

**Deshalb, ohne Ausnahme:**

- **Nie `pnpm dev` oder `npx next dev` von Hand.** Der Ausweich-Port
  ist das Gift.
- `[cmd]` **`python tools/server.py status`** — wer laeuft wo, RAM,
  Antwortzeit, Duplikate.
- **`python tools/server.py start`** — startet NUR, wenn 3200 frei
  ist; weicht nie aus. **`neustart`** raeumt alle Repo-Instanzen (und
  Headless-Chromes aelter 15 min) und startet EINEN. **`aufraeumen`**
  laesst einen gesunden 3200er leben.
- **Admin (3210) und Coach (3220) fasst das Werkzeug nie an.**
- `[cmd]` Gegengeprobt am 2026-08-22: neustart raeumte die fuenf
  Instanzen, der frische Server stand in 6 s, /login antwortet seither
  in 0,1 s. Log: `backup/dev-server.log`.

### Wer arbeitet woran: der Ordnername

**Tom, 2026-08-20:** *,,Du hast es nicht mal mehr im Griff zu wissen,
welcher Agent noch laeuft."*

**Tom, 2026-08-29:** *,,laufend gibt es nicht mehr wir arbeiten nur
noch mit punkten"*.

`[cmd]` **Eine Punktdatei in `docs/punkte/laufend_codex/` oder
`laufend_claudecode/` ist ein laufender Auftrag.** **Der Zustand
steckt im Ordnernamen, nicht in einer Tabelle.**

`[read]` **Warum die Tabelle weg ist:** sie war handgepflegt und am
2026-08-23 dreimal falsch — sie fuehrte G-160, G-161 und C-235 als
laufend, obwohl alle drei fertig waren. `[cmd]` **Gefunden hat es ein
Waechter, nicht der Orchestrator.**

*Regeln, die berichtet statt erzwungen werden, brechen.*

**Wem welcher Bereich gehoert:**

    supabase/_pipeline/          Codex
    apps/web/src/app/v2/<modul>  je ein UI-Agent
    docs/                        Orchestrator

## Nach jedem Bericht: nachtragen, ungefragt

**Tom, 2026-08-19:** *,Und Todolisten, Docs und SSOT nachtragen — das
ist dein automatischer Job."*

`[cmd]` **Am 2026-08-19 fehlten vier Indexzeilen** — 123, 126, 128, 131.
**Gefunden hat sie ein Agent, nicht der Orchestrator.**

### Was nach jedem Bericht geschieht

**1. Pruefen, nicht glauben.** `[cmd]` Die tragenden Zahlen selbst
messen. **Ein Bericht ist eine Behauptung, bis der Befehl gelaufen ist.**

**2. Committen** — ein logischer Change, `git diff --cached
--name-only` vorher lesen.

**3. Den Punkt schliessen** in `docs/todo/TODO.md`, mit dem Abschluss
nach `ERLEDIGT.md`. `[read]` **Mit den gemessenen Zahlen, nicht mit der
Zusammenfassung.**

**4. Neue Befunde anlegen** — jeder Fund, den der Bericht nennt und der
nicht erledigt ist, **wird ein Punkt.** Sonst geht er verloren.

**5. Die Indexzeile setzen** in `docs/ssot/00-INDEX.md`. `[cmd]`
**Pruefen, ob alle Berichte drinstehen** — nicht nur der neue.

**6. Bei Bedarf `CLAUDE.md` und den Modulplan** — wenn eine Regel
entstanden ist oder sich der Stand verschoben hat.

`[read]` **Nichts davon ist eine Nachfrage wert.** Es geschieht, sobald
ein Bericht eintrifft.

### Die Nummer vergibt der Orchestrator

`[cmd]` **116 bis 119 waren doppelt belegt** (A-18), weil fuenf Agenten
gleichzeitig die naechste freie Zahl nahmen. **Seither steht die Nummer
im Auftrag.**

### Auftraege kommen als kopierbarer Block

**Tom, 2026-08-23:** *„zukuenftig gibts mir auftraege im chat
kopierbar"*

**Der Auftragstext steht in einem Codeblock**, nicht als formatiertes
Markdown mit Tabellen und Hervorhebungen. `[read]` **Der Grund ist der
Weg:** Tom kopiert ihn aus dem Chat in das Fenster des Agenten. Was als
Tabelle gesetzt ist, kommt dort als Zeichensalat an; was fett
ausgezeichnet ist, traegt Sternchen mitten im Satz.

**Nur der Auftrag gehoert in den Block.** Befund, Messung und
Begruendung stehen davor im Fliesstext — die liest Tom, nicht der
Agent.


## Vor jedem Auftrag: nachsehen, nicht annehmen

**Tom, 2026-08-19:** *,Nicht vergessen — immer Specs und das alte Repo
miteinbeziehen und nicht planlos in irgendeine Richtung gehen, und
allfaellig brainstormen mit mir."*

`[cmd]` **Zwei Auftraege sind am 2026-08-19 daran gescheitert.**

**G-79:** Der Auftrag fragte, ob `user_goals` Spalten fuer Prioritaet und
Status habe. `[read]` *,Die Frage war falsch gestellt — beide Spalten
gibt es schon, und `lesen.ts:223` sortiert laengst danach. **Es fehlte
nur der Weg, die Zahl zu setzen.**"

**G-82:** Der Auftrag nannte `score.ts` die Live-Vorschau. `[read]`
*,Die Live-Vorschau benutzte sie nie."* **`tab-checkin.tsx` rechnete mit
der Entwurfsformel — HRV aus der Attrappe, `0.88 * 10` als erfundene
Ernaehrung.** **Nach dem Umbau haette `score.ts` null Aufrufer gehabt.**

`[cmd]` **Dazu die falschen Zahlen:** ,erreicht, offen, verfehlt" bei
den Meilensteinen (alle drei `open`), ,Kreatin 30 Tage" (`stock_unit`
ist `g`, also 6), ,fuenf LOINC-Abweichungen, ein Auftrag von zwanzig
Minuten" (bei Glukose und Vitamin D messen die Codes nicht dasselbe).

### Wo sie liegen: `docs/spezifikation/00-QUELLEN.md`

`[cmd]` **Die Datei sagt je Modul, welche Mockup- und Spec-Dateien es
gibt** — mit Groesse. **49 Mockups (1.725 KB), 120 Specs (1.046 KB).**

`[read]` **Kein Modul hat nur eine Mockup-Datei.** Nutrition hat drei,
Recovery fuenf, Coach acht. **Zwei Auftraege sind daran gescheitert,
dass nur die erste gelesen wurde** (G-98, G-101).

### Die vier Quellen, in dieser Reihenfolge

**1. Der Code** — was existiert schon? `[cmd]` Spalten, Funktionen,
Aufrufer. **Ein `rg` kostet Sekunden.**

**2. Die Daten** — was steht drin? `[cmd]` Zahlen im Auftrag tragen
ihren Stichtag und sind **gemessen**, nicht aus einem alten Bericht
uebernommen.

**3. `docs/specs/`** — was war gedacht? `[read]` **Pruefend lesen:** Die
Fehlerliste (A-20) zaehlt sieben Funde.

**4. `referenz/lumeos-2026/`** — wie wurde es geloest? `[read]` Struktur
uebernehmen, Code nie. **Und nachsehen, warum es ersetzt wurde** — F-04
hat es beim Coach beantwortet: *,Der Klient hatte keine Stimme."*

### Und bei Unklarheit fragen

`[read]` **Ein Auftrag, der auf einer Annahme steht, kostet den Agenten
einen halben Durchgang** — er misst dann erst, was der Orchestrator
haette messen sollen.

`[cmd]` **Besser vorher brainstormen.** Toms Entscheidungen sind
schneller als eine falsche Richtung: Permissions gegen Autonomy, der
Erfahrungsgrad, `alpha = 1` — **alle drei kamen in einem Satz, und alle
drei haetten sonst falsch gebaut werden koennen.**

## Eine Zahl ohne Stichtag ist keine Zahl

**Tom, 2026-08-18:** *,Es geht nicht darum, was der User macht. Es geht
darum, dass wir Daten haben fuer die Entwicklung — und wenn diese Daten
heute stoppen, kann ich die naechsten Tage nicht entwickeln, ohne jeden
Tag neu zu seeden."*

`[cmd]` **Zwei Auftraege sind am 2026-08-18 daran gescheitert.** Der
Orchestrator nannte *„Koerperfett 10,31 %, FFMI 21,97"* und *„adaptiver
TDEE 3.143,2"* — **beides richtig, beides fuer den 2026-09-13.** Heute
liefert dieselbe Funktion 11,38 % und NULL.

**Die Zahlen waren nicht falsch, ihnen fehlte der Tag.**

`[read]` **In jedem Auftrag gehoert der Stichtag zur Zahl:** nicht
*„Koerperfett 10,31 %"*, sondern *„10,31 % am 13.9., heute 11,38 %"*.
**Sonst prueft der Agent gegen eine Zahl, die fuer einen anderen Tag
gilt** — und meldet einen Widerspruch, den es nicht gibt.

**Und die Seeds reichen bewusst in die Zukunft.** `[cmd]` Seit C-78
laufen sie ueber ±90 Tage, mit einem Startdatum als einzigem
Parameter. **Das ist kein Fehler in den Daten, sondern der Vorrat, aus
dem entwickelt wird.**

## Seeds gehoeren auf `dev@lumeos.app`

**Tom, 2026-08-18:** *,Wegwerf-DB ist mir scheissegal, wie und wo er
anlegt. Danach muessen Seeds in meinen Dev-Account, sonst sehe ich
nichts."*

`[cmd]` **Der Zustand, der dazu fuehrte:** Saemtliche Testdaten hingen
an `tom.seed@example.com` — 43 Koerpermessungen, 7 Umfaenge, 2
Laborbefunde, 6 Messwerte. **Toms Konto hatte davon nichts**, und
`tom.seed` hat kein Passwort (`encrypted_password IS NULL`), ist also
nicht anmeldbar.

**Damit war nichts im Browser sichtbar** — weder fuer Tom noch fuer
einen Agenten, der einen Nachweis fuehren sollte.

**Die Regel, in jedem Datenauftrag:**

> Testdaten laufen in der Wegwerf-Datenbank, wie und wo ist gleich.
> **Was danach live eingespielt wird, gehoert auf `dev@lumeos.app`.**

`[read]` Muster: `eigenes-konto-fuellen.sql` tut das fuer Nutrition
bereits. **Was fuer Mahlzeiten gilt, gilt fuer Messungen, Befunde,
Sitzungen und Check-ins genauso.**

`[cmd]` **Und der Zeilenschutz-Nachweis braucht zwei anmeldbare
Konten** — einen, der die Daten sieht, und einen, der sie nicht sieht.
Ein Konto ohne Passwort taugt fuer keines von beidem.

## Eine Sitzung statt tausend Fenster

**Tom, 2026-08-18:** *,Jedes Mal, wenn so ein Terminal aufpoppt, kann ich
nicht schreiben."*

`[cmd]` **Die Zahlen sagen, woran es lag:** 3.657 Aufrufe von
`start_process`, **19** von `interact_with_process`. **Jeder Aufruf
startet ein eigenes `powershell.exe` und reisst unter Windows den Fokus
weg.**

**Der richtige Weg:** einmal `start_process("python -i -q")`, danach
alles ueber `interact_with_process` in derselben Sitzung. **Kein neues
Fenster, und der Zustand bleibt** — Arbeitsverzeichnis, Importe,
Hilfsfunktionen.

`[read]` Mehrzeiliges geht nur ueber `exec("...")` mit `\n`; die REPL
bricht sonst an der ersten Leerzeile ab.

**Die Kette ist zweistufig — beide Stufen muessen zu sein.** `[cmd]`
`subprocess.run(shell=True)` startet je Aufruf ein `cmd.exe` aus
system32, auch innerhalb der Python-Sitzung. Das braucht:

```python
si = subprocess.STARTUPINFO()
si.dwFlags |= subprocess.STARTF_USESHOWWINDOW
si.wShowWindow = 0
def sh(c):
    return subprocess.run(c, shell=True, capture_output=True, text=True,
                          startupinfo=si,
                          creationflags=subprocess.CREATE_NO_WINDOW).stdout.strip()
```

`[read]` Ohne `CREATE_NO_WINDOW` poppt bei jedem `git`-Aufruf ein
Fenster auf — seltener als vorher, aber genauso stoerend.

**Und die eigenen Werkzeuge nutzen:** `read_file` statt `Get-Content`,
`list_directory` statt `Get-ChildItem`, `edit_block` statt einer
Ersetzung per Skript.

## Wer einen Namen sucht, sucht ihn mit Wortgrenze

`[cmd]` **Dreimal in fuenf Tagen hat derselbe Fehler eine Pruefung
gruen gehalten, die haette fallen muessen:**

    G-187  /daten\?\.wechselwirkungen/   traf auch ...wechselwirkungenX
    G-197  includes('community_anzeige')  traf auch community_anzeigeX
    G-201  includes(en)                   traefe auch note_en_alt

`[read]` **Der dritte Fall ist der, auf den es ankommt:** er stand im
Waechter **gegen** den ersten. Wer den Fehler kennt, macht ihn beim
naechsten Mal trotzdem — **das ist keine Frage der Aufmerksamkeit,
sondern eine Bauvorschrift.**

**Deshalb, ohne Ausnahme:**

- **Nie `includes` auf einer Zeichenkette**, wenn ein NAME gesucht
  wird. `[read]` Auf einem Feld ist es richtig (dort vergleicht es
  Elemente), auf einem Text luegt jeder laengere Name.
- **Nie ein unverankertes Muster** aus einem Namen bauen.
- **Stattdessen** eine der drei Formen:

```js
// 1. Zeichenklassen um den Namen (wirkt auch bei _ und Ziffern)
new RegExp(`(?<![a-z0-9_])${name}(?![a-z0-9_])`).test(text)

// 2. \b, wo der Name keine Unterstriche traegt
new RegExp(`\\b${name}\\b`).test(text)

// 3. exakter Vergleich, wo eine Liste vorliegt
liste.includes(name)   // Feld, nicht Zeichenkette — das ist in Ordnung
```

`[cmd]` **Gemessen am 2026-08-26 ueber alle 15 `tools/*-pruefen.mjs`:**
12 `includes`, davon **elf harmlos** (Schalter wie `--schreiben`,
Pfadteile wie `__tests__`, echte Felder) und **eines betroffen**
(`sprachrueckfall-pruefen.mjs:116`, behoben).

`[read]` **Ein Waechter dafuer waere Ueberbau** — bei einer Stelle
kostet er mehr, als er findet. **Die Regel steht hier, weil der
naechste Fall nicht in `tools/` entstehen wird, sondern in einem
Test.**

## Pruefungen als Skript, nicht als Shell-Einzeiler

**Tom, 2026-08-17:** *„So belanglosen Scheiss will ich nicht
beantworten."*

`[cmd]` Die Permission-Schicht von Claude Code prueft **Einzelmuster**.
Ein verketteter Befehl mit Kommandosubstitution — `$(grep … | tr …)`
— oder ein mehrzeiliges `python -c` in einer `&&`-Kette trifft kein
Muster, **auch wenn jeder Bestandteil erlaubt ist.** `grep`, `echo`,
`for`, `head`, `tr` stehen alle auf `allow`; die Nachfrage kommt
trotzdem.

**Das laesst sich mit einer Musterliste nicht loesen.** Deshalb steht in
jedem Auftrag an Claude Code:

> **Pruefschleifen als Skript**, nicht als Shell-Einzeiler mit `$(…)`.

`[read]` So arbeitet der Orchestrator selbst: eine `.py`-Datei
schreiben, ausfuehren, loeschen. Das laeuft ohne Nachfrage durch und ist
nebenbei lesbar und wiederholbar.

### Und zwar ohne Fenster

**Tom, 2026-08-18:** *,Wenn die Agents die Anweisung kriegen, mit
Skripten zu arbeiten, dann gehoert auch dazu: ohne Window."*

`[cmd]` **Jeder Shell-Aufruf reisst unter Windows den Fokus weg.** Am
2026-08-18 gemessen: **52 `cmd.exe`, 59 `conhost.exe`** gleichzeitig —
davon **15 unter `wslhost.exe`**, also aus Claude Code, der ueber WSL
laeuft.

**Das gehoert zur selben Regel:**

> **Pruefschleifen als Skript — und ohne Konsolenfenster.**

**In Python:**

```python
import subprocess, shlex
si = subprocess.STARTUPINFO()
si.dwFlags |= subprocess.STARTF_USESHOWWINDOW
si.wShowWindow = 0
def sh(c):
    return subprocess.run(shlex.split(c, posix=False), capture_output=True,
                          text=True, startupinfo=si,
                          creationflags=subprocess.CREATE_NO_WINDOW).stdout.strip()
```

`[cmd]` **`shell=True` genuegt nicht** — es startet auf Windows immer
ein `cmd.exe`, auch mit `CREATE_NO_WINDOW`. **`shlex.split` und
`shell=False` vermeiden den Prozess ganz.**

`[read]` **Und weniger ist besser als unsichtbar:** Der Orchestrator kam
auf **3.657 Prozessstarts gegen 19 Sitzungsaufrufe**. Eine offene
Sitzung (`start_process("python -i -q")`, danach
`interact_with_process`) ersetzt hunderte Einzelstarts — **und der
Zustand bleibt erhalten.**

## Der Modus ist `bypassPermissions` — gemessen, nicht angenommen

`[cmd]` Seit 2026-08-17 steht `defaultMode: "bypassPermissions"` in
`.claude/settings.json`. **Die Agenten laufen damit ohne Nachfragen
durch — auch nachts, auch wenn niemand davorsitzt.**

**Die Sperre haelt trotzdem.** `[cmd]` Am 2026-08-17 gemessen:
`git commit -m "test"` wurde blockiert, HEAD blieb auf `520d001`, nichts
gestaged. **`deny`-Regeln greifen auch unter `bypassPermissions`.**

`[read]` Die Recherche hatte zwei Aussagen gefunden, die sich
widersprachen. **Die Messung entscheidet, nicht die Mehrheit der
Quellen.** Geprueft ist genau eine Regel; dass die uebrigen 22 ebenso
greifen, folgt aus derselben Mechanik, **ist aber nicht einzeln
gemessen.**

**Was dabei nicht greift:** `[read]` MCP-Aufrufe genehmigen sich im
Bypass-Modus selbst. Falls Claude Code MCP-Server angebunden bekommt,
gehoeren sie ueber `mcp__servername` in `deny` oder `ask`.

**Der eigentliche Schutz ist ohnehin nicht die Allow-Liste:**
`protect-paths.ps1` laeuft als `PreToolUse`-Hook bei jedem Bash-Aufruf
und blockiert mit Exit-Code 2 — **in jedem Modus.**

**Warum:** Zwei Agenten teilen sich einen Git-Index. An einem Tag ist
das dreimal schiefgegangen — ein Commit mit sechs fremden Dateien, und
zwei Commits, bei denen der Inhalt des einen unter der Nachricht des
anderen landete. Die Regel *„git diff --cached --name-only vor jedem
Commit"* deckt das auf, verhindert es aber nicht: Zwischen dem Lesen und
dem Commit kann ein anderer Prozess stagen.

**Das ist kein Disziplinproblem, sondern ein geteilter Zustand.** Ein
Index, ein Committer.

---

## Schreibregeln

- Keine Codeänderung ohne explizite Freigabe.
- Keine Commits oder Pushes ohne Tom. Ein logischer Change pro Commit.
- Markdown nur mit vollständigem Inhalt schreiben, Datei vorher einlesen —
  Teil-Edits zerstören Tabellen, Rekonstruktion aus dem Gedächtnis hat
  schon Abschnitte verloren.
- **Markdown mit Sonderzeichen über das Datei-Werkzeug schreiben, nie über
  eine interaktive Python-Sitzung.** `[cmd]` Am 2026-08-23 hat der Weg über
  stdin einer PowerShell-Sitzung 78 doppelt kodierte Sequenzen in
  `TODO.md` und `ERLEDIGT.md` erzeugt und den Commit blockiert — dieselbe
  Sitzung schrieb die Uebersicht über das Datei-Werkzeug sauber. Der
  Python-Aufruf war korrekt (`encoding="utf-8"`); der Text kam bereits
  beschädigt an. Hergang: `docs/ssot/32-encoding-schaeden.md`.
- Aussagen über den Ist-Zustand tragen `[cmd]`, `[read]` oder `[annahme]` —
  Details in `docs/spezifikation/10-plattform/konventionen/`.
- Nie gegen die laufende Datenbank testen; Wegwerf-Datenbank, danach
  verwerfen. Strukturelle Live-Änderungen nur nach Freigabe.
- **`docs/specs/` und `docs/BrainstormDocs/` sind Datenquelle, nie
  Current Truth.** Sie beschreiben teils eine Vorgänger-Codebasis. Wer an
  einem Modul arbeitet, liest den zugehörigen Altbestand **mit** — er
  enthält getroffene Produktentscheidungen, die sonst zweimal getroffen
  werden. Verbindlich wird ein Inhalt erst, wenn er besprochen und nach
  `docs/spezifikation/` (Soll) oder `docs/ssot/` (Ist) übernommen ist.
  Ablauf und Stand: `docs/spezifikation/00-KONSOLIDIERUNG.md`.
- In `docs/specs/` wird nicht geschrieben — einzige Ausnahme ist ein
  Statusvermerk im Kopf, der auf das Konsolidierungsregister zeigt.
- Bei Unsicherheit: im Repo nachsehen, nicht raten.


---

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

## Altlasten

Die frühere Governance-Maschinerie ist archiviert (`_archive/governance/`,
Regeln im dortigen README) bzw. in ein eigenes Repo umgezogen.
**Die Wurzel ist seit 2026-08-06 (A-10) geräumt:** `COMMANDS.md`,
`SESSION_ONBOARDING.md`, `STACK_REFERENCE.md` und `CLAUDE.md.v1.bak`
liegen jetzt unter `_archive/governance/wurzel-altlast/` (mit README, das
je Datei nennt, warum). `project.profile.json` ist bereits früher
entfallen.
**`AGENTS.md` bleibt bewusst im Wurzelverzeichnis** — sie ist keine
Altlast mehr, sondern der Einstiegspunkt für Agenten-Werkzeuge
(lean-ctx-Block, Verweis auf `CLAUDE.md`); mehrere Werkzeuge lesen sie von
sich aus. Wenn Tom nach Governance fragt: das gehört ins Governance-Repo,
nicht hierher.

---

## gstack

- Für Browsing/Scraping/Headless-Aufgaben das gstack-`/browse`-Skill
  verwenden, **nicht** die `mcp__claude-in-chrome__*`-Tools.
- gstack-Skills, die auto-committen oder auto-pushen (`/ship`,
  `/land-and-deploy`), brauchen explizite Tom-Freigabe gemäss Schreibregeln.

## Befehle schreiben

Claude Code kann Befehle mit Schleifen, Befehlssubstitution oder
Variablenexpansion nicht statisch prüfen und fragt dann nach — unabhängig
von der Permission-Liste. Das kostet Tom bei jedem Zwischenschritt einen
Klick, ohne dass er entscheiden könnte, was er da freigibt.

Deshalb:

- **Kein `cd`-Präfix.** Die Sitzung läuft im Repo-Wurzelverzeichnis.
- **Keine Schleifen** (`for`, `while`) in Bash-Aufrufen.
- **Keine Befehlssubstitution** (`$(...)`, Backticks).
- **Keine Variablenexpansion** (`${PIPESTATUS[0]}`, `${x:-y}`, `$out`).
- **Keine Heredocs** für mehrzeilige Inhalte.

Stattdessen: mehrere einfache Befehle nacheinander, oder — wenn wirklich
Logik nötig ist — ein Skript als Datei anlegen und die Datei aufrufen.
Der Aufruf ist dann eine gerade Zeile und geht ohne Nachfrage durch.

Exit-Codes werden einzeln abgefragt, nicht über `PIPESTATUS` aus einer
Pipeline gezogen. Wiederholungsläufe werden als einzelne Aufrufe geschrieben,
nicht als Schleife.
