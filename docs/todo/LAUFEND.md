# Laufende Auftraege

**Stand: 2026-10-01, 09:35**

| Agent | Nr | Inhalt | Stand |
|---|---|---|---|
| Claude Code | G-565 | die Einheit ist eine Nutzerwahl | **laeuft**, raus 01.10. |
| Codex | G-535 | sechs Funktionen lesen den alten Sitzungsnamen | **laeuft**, raus 01.10. |
| Claude Code | G-565 | die Einheit ist eine Nutzerwahl | **bereit** in `next/` |
| Claude Code | G-539 | der Phasen-Editor fehlt | **vorbereitet** in `next/` |
| Codex | G-514 | die Modulverrechnung — Bau abgenommen | **offen**: nicht live eingespielt |

## Was am 30.09. abgelegt wurde

    G-543  20992639   kcal/Tag = 11 x Rate x Gewicht, A5 -> G-558
    G-553  20992639   Ladefehler als eigener Zustand, Mockup sichtbar
    G-554  8553e5b2   Phasenziele anlegbar, sechs Arten ueber subtype
    G-556  89e71386   der Kettenlauf faellt nicht mehr am eigenen Check
    G-557  db2a7a21   subtype kommt an, sechs Arten unterscheidbar
    G-558  a0be641d   goal_phase_start nimmt den Strategiecode (Kette)
    G-544  82b3973b   Zeitachse und Ankerdatum, phase_am umgangen
    G-545  56cbc87f   Katalog: guards 17/17, exits 7, drei Prep-Stufen
    G-539  9ed19b12   Phasen-Editor als Override, Reiter aus dem Katalog
    G-559  f03dfbe8   phase_am liefert alle, phase_eines_ziels_am eine
    G-563  f0af9194   berechne_zielwerte bekommt ihr Ziel (Kette)
    G-564  6ae14c93   ladePhasen gibt eine Menge, ladeZielphase eine
    G-568  57b88381   die Zielwerte reichen ihr Ziel durch
    A-82   724cfd29   der Kettenwaechter liest das Staging
    A-84   724cfd29   der Pruefumfang haengt am Staging
    G-561  605a27d8   die Katalogwaechter pruefen Prozent, 6 Zeilen

`[cmd]` **Die Kette ist wieder gruen** — `kettenlauf-status.json`:
`passed`, Exit 0, 1401 s, 299 Schritte. Damit war das Repo nach zwei
Tagen wieder committierbar; drei Commits sind seither durch.

## Der Commit-Takt — gemessen 2026-10-01

`[cmd]` **Der Haken waehlt den Umfang am Staging** (A-84):

    nur docs/ im Commit     pnpm gate:docs     ~16 s
    eine Datei darueber     pnpm gate          ~60 s gecacht,
                                               184 s wenn Turbo neu baut

`[read]` **Der Orchestrator fuhr die Waechter doppelt** — vier- bis
fuenfmal einzeln vor dem Commit, dann noch einmal im Haken. **Das hoert
auf:** schreiben, committen, Logende lesen. Wird er rot, korrigieren.
Derselbe Aufwand, ohne den Vorlauf.

`[cmd]` **Ein Commit laeuft abgesetzt**, weil der Haken laenger braucht
als die Bruecke wartet: `subprocess.Popen` mit
`DETACHED_PROCESS|CREATE_NO_WINDOW`, Ausgabe nach `.git/ORCH_COMMIT.log`,
danach `git log` und das Logende lesen. **Ein Zeitablauf der Bruecke ist
kein gescheiterter Commit.**

`[cmd]` **Die drei Waechter, die am Dokument-Commit nicht haengen**, und
was sie kosten: `encoding-pruefen` 15,6 s ueber 21.692 Dateien,
`supplement-kennungen` 5,0 s, `supplement-kern-dubletten` 4,5 s,
`svgpfade` 3,7 s. **Vier Skripte, 29 von 43 Sekunden.**

---

## Die Einspielreihenfolge — frei seit 2026-10-01, 09:10

`[cmd]` **Zwei Datenbankaenderungen sind gebaut und NICHT live. Ihre
Anwendungsseite steht jetzt fuer beide:**

    G-559   phase_am liefert alle Phasen, phase_eines_ziels_am eine
            Anwendung: G-564  (6ae14c93)   FERTIG
    G-563   berechne_zielwerte(p_user_id, p_goal_id, p_stichtag)
            Anwendung: G-568  (57b88381)   FERTIG

`[read]` **Damit koennen beide zusammen eingespielt werden.** Die
Reihenfolge Anwendung-zuerst ist eingehalten.

`[cmd]` **Was bis dahin falsch ist, und zwar leise:**

    die Zeitachse zeigt "1 Phasen", wo zwei gelten
    die Zielwerte nehmen still eine von zwei Raten - gemessen -0,500,
    bei einem Nutzer, der auch ein Aufbauziel fuehrt. Der Unterschied
    betraegt 716 kcal/Tag (2306 gegen 3023 bei 81,4 kg).

`[read]` **Beides faellt niemandem auf**, weil keine Fehlermeldung
entsteht. **Nach dem Einspielen ist es sichtbar richtig** — die Achse
zaehlt die Tabelle, und ein Nutzer mit zwei offenen Phasen bekommt je
Ziel seine Zahl statt einer beliebigen.

`[cmd]` **Der Seed gehoert mit eingespielt:**
`testdaten-einspielen.ts:1149` gibt `test-user` zwei offene Phasen an
zwei Zielen — der Fall, der die ganze Kette beweist.

---

## Die Bauordnung — `docs/ssot/130-goals-bauordnung.md`

**Tom, 2026-09-29, 11:56:**

> subnav goals: user kann einzelne oder mehrere ziele setzen
> subnav phase engine: user kann seine goals planen, terminieren,
> editieren

`[read]` **Planen, terminieren, editieren sind Operationen auf Zielen**,
nicht auf einem eigenen Objekt. Sechs Ebenen:

    1  Ziele                mehrere, messbar, verknuepfte Module   G-537 ✓
    2  Strategiekatalog     17 ausgelieferte Definitionen          G-536 ✓
    3  Terminierung         Ziel + Strategie + Zeitfenster  G-538 ✓, G-544
    4  Editor               persoenlicher Override, 12 Reiter      G-539
    5  Vorlagen             eigene und geteilte                    G-540
    6  Automatik            Waechter, Wochenanpassung        G-520 ✓, G-543 ✓

`[cmd]` **Anlegen steht seit G-554**, aber die sechs Arten fallen beim
Speichern noch auf vier zusammen — G-557. **Die Strategie kommt in der
Phase noch nicht an** — G-558. Erst dann ist Ebene 3 eingeloest.

---

## Bereich je Agent

    supabase/_pipeline/, supabase/migrations/   Codex
    apps/web/src/app/v2/                       Claude Code
    apps/coach/src/                            Claude Code
    packages/ui, packages/scoring              Claude Code (mit Gegenprobe)
    docs/, tools/                              Orchestrator

## Was auf Tom wartet

    Tobias     G-542  ist die Rate pro Woche oder pro Monat
               G-548  moderate_cut 12 oder 20 Wochen (vorlaeufig 20)
               G-549  Protein und Fett in der Ladewoche
               Alle drei stehen in 00-FRAGEN.md.
    G-546      erfassen oder empfehlen: v2.0 fuehrt Peptide als
               Phasenparameter. Das ist eine Entscheidung ueber das
               Produkt, nicht ueber eine Tabelle.
    G-540      drei Entscheidungen zu Vorlagen: gehoeren geteilte
               Vorlagen mit Bewertung zu Goals oder zum Marketplace,
               nimmt "Share with coach" den Weg der Freigabeschicht,
               und wer pflegt die LumeOS-Vorlagen
    G-557 A2   `weight` und `custom` bleiben Vorschlag (`unsicher: true`)
               bis Tom entscheidet, ob sie eigene CHECK-Werte brauchen
    A-77       zwei Verzeichnisse mit Proben laufen in keinem Lauf —
               `tools/__tests__/` und `supabase/_pipeline/_validierung/`.
               Schwere heute auf hoch: der Schaden ist belegt.
    C-554 A3   der Registerumtrag fuer die 70 unregistrierten Dateien
    A-80       116 Wegwerf-Datenbanken. Die mit "_final" sind das
               Problem, nicht die Platte.
    A-79       backup/-Aufbewahrung, 3.958 MiB gegen ein Limit von 2.5 GiB
    A-78       Waechter auf Bezeichner-Ueberschneidung

## Neu angelegt, noch ohne Reihenfolge

    G-547   der persoenliche Boden unter der Katalograte
    G-550   Fett als g/kg Koerpergewicht statt als Prozentsatz
    G-551   das Cardio-Modul — Tom hat entschieden, dass es kommt,
            der Zeitpunkt ist offen
    G-552   Trainings- und Erholungsphase
    G-555   derselbe Ladefehler in medical und nutrition (Kind von G-553)

## Was ausdruecklich wartet

**Tom, 2026-09-29:** *„physique oder pose interessiert mich noch nicht,
wenn wir nicht mal in der lage sind grundlagen in der ui darzustellen."*

Damit warten: Physique-Verhaeltnisse, Pose-Sessions, C-494, G-139.

---

## Der Zyklus, wie er laeuft

`[cmd]` **`00-LIESMICH.md:444-463`, Toms Wortlaut vom 30.08.:**
*„du spielst nun jedesmal den vollen cycle durch ohne mein befehl"*.

    1  Bericht ueberfliegen - ist der vorbereitete Auftrag betroffen?
    2  falls ja: anpassen
    3  next/ eine Ebene hoeher - der Auftrag geht raus
    4  Bericht nachmessen, Abnahme schreiben
    5  neue Befunde als Punkte
    6  committen, Commit-Hash nachtragen, DANN nach erledigt/
    7  next/ wieder fuellen

**Fertig ist, wenn Schritt 7 steht.** Kein Schritt braucht eine
Aufforderung.

    todos/                    offen, kein Auftrag geschrieben
    laufend_<agent>/next/     Auftrag geschrieben, noch nicht raus
    laufend_<agent>/          laeuft
    erledigt/                 abgenommen, mit commit:

`[cmd]` **Ein vorbereiteter Auftrag traegt `agent:` und `beauftragt:`
noch nicht** — er bekommt sie beim Verschieben eine Ebene hoeher.
`tools/zyklus-pruefen.mjs` zaehlt das, Soll 0.

### Die Reihenfolge innerhalb von Schritt 3 — und sie war falsch

`[cmd]` **Datei zuerst, `LAUFEND` direkt dazu, DANN der Pfad an Tom.**

`[read]` Der Orchestrator hat es umgekehrt gemacht: Auftragstext in die
Antwort, Punktdatei danach. **Bei G-541 gar nicht** — Claude Code hat 25
Minuten an einer Nummer gebaut, die im System nicht existierte. Bei G-536
und G-537 kam die Datei eine Stunde spaeter.

**Tom, 2026-09-29, 15:08:** *„ist es verdammt nochmal so schwer nach
protokoll zu arbeiten dass die agenten eine optimale auftragsumgebung
haben?"*

Der Auftragstext in einer Antwort ist ab jetzt eine **Kopie** aus der
Datei, nicht das Original. **Wenn ein Auftrag rausgeht, existiert er.**

`[read]` **Der Umzug und die Uebergabe sind EINE Handlung.** Wer
verschiebt und nicht uebergibt, hat nichts beauftragt.

### Was Tom kopiert, ist ein ZEIGER — keine Zusammenfassung

**Tom, 2026-09-30, 12:59:** *„in dem was ich kopiere sind die facts nicht
drin was er lesen soll."*

`[cmd]` **Der Orchestrator hat die Auftragstexte als gekuerzte Fassung in
die Antwort geschrieben.** Tom kopiert diesen Block in den Agenten — und
damit bekommt der Agent die Kurzfassung, nicht die Zahlen, nicht die
Tabellen, nicht die Nachweispflichten. **Der Agent sieht nur, was Tom
einfuegt.**

`[read]` **Ab jetzt ist der Block in der Antwort kurz und schickt in die
Datei:** Pfad, die Anweisung sie VOLLSTAENDIG zu lesen, und nur die zwei
oder drei Saetze, die ohne Lesen falsch verstanden wuerden. **Alles
andere gehoert in die Datei, nicht in die Antwort.** Eine Auftragskopie,
die die Datei ersetzt, ersetzt sie schlecht.

`[read]` **Und die Datei muss von oben nach unten stimmen.** G-545 sagte
auf Zeile 60, die Quellen kaemen von Tom, und korrigierte das erst 200
Zeilen spaeter im Nachtrag. **Wer oben liest, hoert dort auf.** Ein
Nachtrag, der eine Aussage aufhebt, wird an der Aussage vermerkt.


## Zwei Regeln

`[cmd]` **Ein Auftrag, ein Bericht.** Ketten sind erlaubt, aber sie
melden EINMAL am Ende.

`[cmd]` **Nichts laeuft losgeloest im Hintergrund** — ausser
`tools/server.py start`, das ein Log schreibt.

---

## Lehren

`[cmd]` **Ein Muster ohne Gegenprobe zaehlt das Falsche, und das Muster
kann auch die FORM verfehlen.** Mein `git grep` suchte `1.0 kg` als Text
und fand nichts; die Schwellen stehen als Zahlen im Code
(`d.weightTrend < -1.0`). **Codex Angabe war exakt, mein Suchmuster
nicht.** Vorher dasselbe mit dem Vokabular des falschen Dokuments.

`[cmd]` **Ein Verweis auf einen Punkt, der im selben Zug geschlossen
wird, zeigt auf den alten Pfad.** Dreimal am 30.09. und 01.10.: der neue
Punkt nennt `laufend_<agent>/...`, die Abnahme verschiebt die Datei nach
`erledigt/`, und der Quellenwaechter faellt. **Regel: wer einen Punkt
abnimmt und im selben Zug darauf verweist, schreibt den
`erledigt/`-Pfad.** Der Waechter hat es jedes Mal gefangen — und jedes
Mal einen Commit-Anlauf gekostet.

`[cmd]` **Wo zwei Lesewege auf dieselbe Tatsache zeigen, widersprechen
sie sich irgendwann — und kein Test faellt dabei um.** Der Phasenkopf las
die Tabelle, die Bedienkacheln `phase_am` mit seinem LIMIT 1: „2 Phasen
laufen" und darunter „Beenden" fuer eine, auf einem Schirm. **Vierter
Fund am Bild bei gruener Messung in zwei Tagen.** Eine Tatsache, ein
Leseweg.

`[cmd]` **Eine Probe, die unerwartet rot wird, ist eine Messung.**
`Promise<Phase[] oder null>` sollte eine harmlose Kontrolle sein und ging
rot — zu Recht, denn `null` statt der leeren Liste zwaengt jeden
Konsumenten zurueck in die Form „eine oder keine". **Nicht die Probe
anpassen, bis sie schweigt.**

`[cmd]` **Nicht jedes `data[0]` ist ein Fehler.** Es ist einer, wenn die
Quelle eine Menge liefert. `ladeZielphase` behaelt es, weil
`phase_eines_ziels_am` ihr LIMIT 1 mit Absicht traegt — und von fuenf
gezaehlten Stellen war genau eine betroffen. **Die vier anderen wurden
mit Grund freigesprochen, nicht uebersehen.**

`[cmd]` **Ein `oder` in einer cmd-Zeile ist ein Rohrzeichen.** Ein
Python-Einzeiler mit `Phase[] | null` im Text brach mit „Das System kann
die angegebene Datei nicht finden" ab — die Shell las das Zeichen als
Umleitung. **Text mit Sonderzeichen geht ueber eine Datei, nicht ueber
die Kommandozeile.** Dieselbe Klasse wie das PowerShell-Quoting vom
29.09.

`[cmd]` **Wer einen Wert ERSETZEN laesst, verlangt den
Schluesselvergleich, nicht die Anzahl.** Mein Auftrag G-545 verlangte
,,vorher/nachher je Spalte: wie viele der 17 Zeilen tragen einen Wert".
G-545 hat `sub_phases` umgeschrieben und dabei `weeks` und `deficit`
entfernt — **vorher 1, nachher 1, anderer Inhalt.** Die Zaehlung war
gruen, der Ankerplan aus G-544 hat seither keine Quelle. **Claude Code
fand es am Bild, vier Gedankenstriche je Stufe.** Das ist G-562.

`[cmd]` **Der Vorcommit-Haken laeuft laenger als die Bruecke wartet.**
Ein `git commit` ueber `lauf()` bricht nach 60 s mit ,,did not respond",
waehrend der Commit weiterlaeuft — **die Fehlermeldung sieht aus wie ein
gescheiterter Commit.** Richtig: `subprocess.Popen` mit
`DETACHED_PROCESS|CREATE_NO_WINDOW`, Ausgabe in `.git/ORCH_COMMIT.log`,
danach `git log` und das Logende lesen.

`[cmd]` **Die Waechter arbeiten die Liste einzeln ab.** Drei Anlaeufe fuer
einen Commit: `quellen` (ein Verweis auf eine Datei, die noch in
`laufend_` liegt), dann `fragen` (ein neuer `typ: entscheidung` gehoert in
00-FRAGEN.md), dann `index`. **Vor dem Commit selbst durchlaufen:**
`punkte-index --schreiben`, `fragen-index --schreiben`,
`zyklus-pruefen`, `punkte-pruefen`.

`[cmd]` **`git mv` scheitert an untracked Dateien.** Ein frisch
geschriebener Punkt ist nicht im Index; `os.rename` verschiebt ihn, git
sieht ihn am neuen Ort.

`[cmd]` **`git grep` sieht keine untracked Dateien.** Die Suche nach dem
Waechter zu G-544 fand nichts, weil `g544-zeitachse.test.ts` noch nicht
im Index lag. **Die Arbeit eines Agenten ist untracked, bis der
Orchestrator sie stagt** — eine Suche mit `git grep` misst dort
systematisch null, und das sieht aus wie ein fehlender Waechter.
Fuer frische Arbeit `start_search` oder `os.path.getsize` nehmen.

`[cmd]` **Ein gefilterter Status ist kein Status.**
`git diff --cached --name-status -- apps/` filtert genau das weg, was
die Regel sehen will: drei docs-Dateien lagen aus einem frueheren
Versuch im Index und gingen in den G-544-Commit mit. Getrennt per
`reset --soft`. **Die Regel sagt ,,den vollstaendigen `git status`
lesen", und ein Pfadfilter hebt sie auf.**

`[cmd]` **`count(spalte)` zaehlt nicht-NULL, nicht Inhalt.** Beim
Nachzaehlen von G-545 ergab `count(guards), count(exits)` 17/17/17 —
ein leeres JSON ist nicht NULL. Richtig:
`count(*) FILTER (WHERE x IS NOT NULL AND x::text NOT IN ('[]','{}'))`.
**Das ist genau der Fehler, um den G-545 geht — er hat mich beim
Nachzaehlen desselben Punkts erwischt.**

`[cmd]` **Live repariert, Quelle nicht.** G-538/A1 verlangte den Nachzug
des Bestands — der Schritt, der Max' Phase *erzeugt*, stand nicht im
Auftrag. Der naechtliche Kettenlauf fiel zwei Tage lang am eigenen CHECK
und blockierte jeden Commit im Repo. **Wer eine Regel einfuehrt, prueft
sie gegen den SEED, nicht nur gegen den Bestand** — die Kette baut neu,
sie repariert nicht.

`[cmd]` **Eine Tabelle, die niemand schreibt, ist keine Zuordnung.**
G-554 hat die sechs Arten richtig auf `goal_type` und `subtype`
abgebildet; `git grep -cE "subtype|unterart"` findet 13 Treffer in
`ziel-arten.ts` und **null** im Schreibweg. Beim Speichern fallen die
sechs Knoepfe wieder auf vier zusammen. **Aus der Existenz einer Sache
folgt nicht ihre Funktion** — das steht so in den Projektregeln und gilt
auch fuer eine richtig gebaute Tabelle.

`[cmd]` **Eine Probe, die nur von Hand laeuft, ist keine Gegenprobe.**
`supabase/_pipeline/_validierung/` liegt in keinem Gate: keine
`package.json` nennt es, die Kette ruft genau ein Skript daraus auf, und
die G-536-Probe wirft ohne Umgebungsvariable. Der Schaden ist belegt —
zwei Rechnungstests erwarten seit G-543 die alte Semantik, und **nichts
wurde rot.** Im Bericht hiessen sie „dauerhaft". Das ist A-77, zweiter
Ort, Schwere hoch.

`[cmd]` **Ein `[cmd]` mit falscher Zahl ist schlimmer als ein
`[annahme]`.** `ziel-arten.ts:116` sagt `2 Zeilen im Seed`, gemessen sind
**4** — und der Bericht an Tom sagte 4. Nur `[cmd]` darf zur Regel
werden; eine falsche Zahl unter dieser Marke wird geglaubt.

`[cmd]` **Ein Waechter mit `if` davor ist abschaltbar.** Die Forderung
nach `berechnePace(` haengt an
`if (/PACE_TEXT|data-ziel-pace/.test(karten))`: wer die Markierung
umbenennt, schaltet die Pruefung stumm. Derselbe Agent hat genau diese
Blindheit an seinen eigenen zwei Waechtern gefunden und dort behoben.

`[cmd]` **`git status --short` lesen, nicht `--name-only`.** Der Index
trug G-554 noch in `next/`, der Arbeitsbaum in `laufend_` — `AD` im
vollen Status, unsichtbar in der Dateiliste. Ein Commit haette den
Auftrag an beiden Orten verewigt. **Dafuer steht die Regel da.**

`[cmd]` **Pythons Standardausgabe ist unter Windows cp1252.** Ein
Commit-Aufruf lief durch, und erst das `print` des Haken-Zeichens warf
`UnicodeEncodeError` — die Fehlermeldung sah aus wie ein
fehlgeschlagener Commit. **`set PYTHONIOENCODING=utf-8` vor jedem Aufruf,
der Werkzeugausgabe weitergibt.**

`[cmd]` **Der Orchestrator plante Speicherorte statt Artefakte.** E-1,
G-511, G-529, G-531, G-533 und G-520 haben alle geregelt, **wo eine Zahl
liegt**. Keiner hat geregelt, **was Tom sieht und tut**. Die Bauordnung
ist entlang der vier Verben geschnitten, nicht entlang der Tabellen.

`[cmd]` **Drei Quellen waren da und wurden nicht gelesen.**
`module-goals-editor.jsx` (569 Zeilen, der ganze Editor mit Date anchor
und PE_MODES), `00-umsetzungsplan.md` (nennt die Rangfolge der Quellen
seit dem 16.08.) und `PHASE_MODELS.md` (alle Baender als JSON). Vier
Auftraege standen auf Annahmen, die dort beantwortet waren.

`[cmd]` **Ein Muster ohne Gegenprobe zaehlt das Falsche — dreimal am
selben Tag.** `alias.spalte` als fehlendes Objekt. `export function` als
einzige Exportform. Und `profile:` auf `definitions.ts:287` als
Katalogeintrag, obwohl es der **Parameter von `isGoalAvailable`** ist:
`GOAL_DEFINITIONS` endet auf Zeile 263. Der Auftrag G-536 nannte darum 17
Definitionen; es sind 16.

`[cmd]` **Codex hat dem widersprochen und hatte recht.** Zum zweiten Mal:
vorher bei `goal_phases.tdee_herkunft`, wo der Auftrag die Spalte an die
falsche Tabelle haengte. **Ein Agent, der einem falschen Auftrag
widerspricht, hat recht behandelt zu werden.**

`[cmd]` **Ein laufender Suchlauf ist kein Ergebnis.** „Status: RUNNING,
Total results: 5" wurde als vollstaendig gelesen; der Aufrufer
`zielAnlegenAktion` stand in derselben Datei und fehlte in der Ausgabe.
**Wer zaehlt, wartet auf COMPLETED.**

`[cmd]` **PowerShell zerlegt `-ArgumentList` an Leerzeichen und
interpoliert in doppelten Anfuehrungszeichen.** Ein Commit mit sechs `-m`
wurde zu sechs Pfadangaben (`error: pathspec 'Claude' did not match`),
und `$$goals$$` wurde zu `goals`. **Commit-Nachrichten gehen als
BOM-freie Datei ueber `-F`, SQL-Literale ueber `chr(39)` aus Python.**

`[cmd]` **Ein Waechter, der nur eine Zahl meldet, zwingt zum Raten.**
Der Zwei-Wahrheiten-Waechter nennt jetzt die Posten und stellt die Frage.

`[cmd]` **`beruehrt.tabellen` ist eine Behauptung ueber die laufende
Datenbank, keine Inhaltsangabe.** Sechs gebaute, nicht eingespielte
Tabellen dort eingetragen ergab zehn neue Befunde.

`[cmd]` **Neun Waechter, nicht vier** — `punkte`, `zyklus`,
`sammelfragen`, `nummern`, `specs`, `quellen`, `encoding`, `fragen`,
`kettenlauf`. Drei von vier war schon kein Lauf.

`[cmd]` **`pnpm gate` gruen heisst nicht, dass das Gate gruen ist.** Die
18 Turborepo-Aufgaben und die neun Waechter im Vorcommit-Haken sind zwei
verschiedene Pruefungen. Ein Bericht nennt beide Zahlen.

`[cmd]` **Der Commit-Betreff ist kein Signal dafuer, was erledigt
wurde.** G-514s Code kam unter `goals(G-531)` herein, C-546 und C-551
unter `goals(G-523, G-529, G-526)`.

`[cmd]` **Eine leere Abnahme ist kein Zustand, sondern ein
Versaeumnis** — und ein abgenommener Punkt, der in `laufend_` liegen
bleibt, ist dasselbe eine Stufe spaeter. G-514 und G-531 hatten ihre
Abnahme seit `a856663d` und lagen trotzdem bis 15:15 falsch.

`[cmd]` **Waehrend ein Agent in einem Bereich schreibt, misst dort
niemand.** Ein Testlauf mitten in Claude Codes Schreibvorgang ergab ein
Phantom-`# fail 1`; zwoelf Minuten spaeter 2.112 von 2.112 gruen.

`[read]` **Zwei Fehler fand Claude Code am Bild, nicht am Test** — zwei
Raster uebereinander, eine Kachel mit drei Strichen. **Bei Oberflaeche
ist das Bild der Nachweis.**

`[read]` **Und derselbe Agent hat einen eigenen Messfehler richtig
behandelt:** sein erster Lauf meldete `gespeichert: false`, weil das
Modal nach 900 ms schliesst und der Blick bei 2500 kam. Er hat die
Datenbank geprueft, bevor er etwas meldete, und den Befund der **Probe**
zugeschrieben, nicht dem Bau. **Eine Probe, die nichts findet, hat nicht
bewiesen, dass nichts da ist.**

`[cmd]` **Eine Regel, die nirgends nachgezaehlt wird, wird zur
Empfehlung.** „Wegwerf-Datenbank, danach verwerfen" steht in den
Projektregeln; 116 Datenbanken stehen in `pg_database`. Das ist A-80.

`[cmd]` **Eine `[cmd]`-Zahl ohne ihren Befehl ist eine Behauptung.**
Claude Code hat es selbst gefunden: sein Bericht nannte 4 Zeilen, sein
Kommentar 2 — dieselbe Datei, dieselbe Stunde. Der Befehl steht jetzt
jeweils daneben. **Wer eine Zahl mit `[cmd]` markiert, schreibt den Aufruf
dazu, mit dem sie nachzaehlbar ist.**

`[cmd]` **Der Weg aus A-77 ist die Kette, nicht das Gate.** Eine
Datenbankprobe braucht eine Wegwerf-Datenbank; das Gate hat keine, der
Kettenlauf baut eine. Codex hat die G-558-Gegenprobe als Kettenschritt
eingetragen (301 statt 299 Schritte) — sie laeuft naechtlich, und
`pnpm gate` prueft den Status dieses Laufs. **An einem Beispiel
vorgemacht, statt sie „dauerhaft" zu nennen.**

`[cmd]` **`io.open(pfad, "w")` leert die Datei, bevor das Argument
gerechnet wird.** In `io.open(p,"w").write(re.sub(..., io.open(p).read()))`
wird zuerst der Schreibgriff erzeugt — die Datei ist dann leer, und der
Lesezugriff liefert nichts. Zwei Punktdateien standen auf 0 Bytes und
kamen nur ueber `git checkout` zurueck; die uncommittete Abnahme war weg.
**Lesen, Ergebnis in eine Variable, DANN schreiben — nie in einem
Ausdruck.**

---

## Ein Befund zu dieser Datei

`[read]` **Die Tabelle oben ist ableitbar.** `docs/punkte/00-INDEX.md`
kennt aus dem Frontmatter, welche Punkte wo liegen. Von Hand gepflegt
wird sie genau so alt wie beim letzten Mal. **Was NICHT ableitbar ist,
sind die Abschnitte darunter** — was auf Tom wartet, was ausdruecklich
wartet, die Regeln und die Lehren.
