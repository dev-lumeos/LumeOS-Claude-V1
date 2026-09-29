# Laufende Auftraege

**Stand: 2026-09-29, 15:20**

| Agent | Nr | Inhalt | Stand |
|---|---|---|---|
| Codex | G-538 | Phasen haengen an keinem Ziel — die Terminierung | **laeuft**, raus 29.09., 14:55 |
| Claude Code | G-541 | das Vorschaupanel liest den Katalog | **laeuft**, raus 29.09., 14:35 |
| Codex | G-543 | die Rechnung nimmt den Faktor statt der Rate | **vorbereitet** in `next/` |
| Claude Code | G-544 | der Phase-Reiter zeigt keine Zeitachse | **vorbereitet** in `next/` |
| Codex | G-514 | die Modulverrechnung — Bau abgenommen | **offen**: nicht live eingespielt |
| Claude Code | G-534 | der Phase-Reiter ist kein Planungswerkzeug | **offen**: Abnahme mit G-541 |

## Was heute abgelegt wurde

    G-531  309db7e1   die Phase engine war unbedienbar
    G-533  46b73f6f   Zielrate der Bestandsphasen, CHECK convalidated
    G-536  46b73f6f   der Strategiekatalog, 17 Strategien live
    G-537  offen      abgenommen, Code liegt uncommittet in apps/

## Die Bauordnung — `docs/ssot/130-goals-bauordnung.md`

**Tom, 2026-09-29, 11:56:**

> subnav goals: user kann einzelne oder mehrere ziele setzen
> subnav phase engine: user kann seine goals planen, terminieren,
> editieren

`[read]` **Planen, terminieren, editieren sind Operationen auf Zielen**,
nicht auf einem eigenen Objekt. Sechs Ebenen:

    1  Ziele                mehrere, messbar, verknuepfte Module   G-537 ✓
    2  Strategiekatalog     17 ausgelieferte Definitionen          G-536 ✓
    3  Terminierung         Ziel + Strategie + Zeitfenster    G-538, G-544
    4  Editor               persoenlicher Override, 12 Reiter      G-539
    5  Vorlagen             eigene und geteilte                    G-540
    6  Automatik            Waechter, Wochenanpassung        G-520 ✓, G-543

---

## Bereich je Agent

    supabase/_pipeline/, supabase/migrations/   Codex
    apps/web/src/app/v2/                       Claude Code
    apps/coach/src/                            Claude Code
    packages/ui, packages/scoring              Claude Code (mit Gegenprobe)
    docs/, tools/                              Orchestrator

## Was auf Tom wartet

    G-542      zwei Zahlen vorlaeufig gesetzt, Tobias klaert am 30.09.:
               ist weight_change_target_percent pro Woche oder pro Monat,
               und moderate_cut 12 oder 20 Wochen. Steht in 00-FRAGEN.md.
    A-82       der Kettenwaechter prueft den Arbeitsbaum statt des
               Staging - waehrend ein Agent in supabase/ baut, kann
               niemand committen. Eine Zeile: git diff --cached.
    C-554 A3   der Registerumtrag fuer die 70 unregistrierten Dateien
    A-80       150 Wegwerf-Datenbanken, 207 GB. Die 49 mit "_final" sind
               das Problem, nicht die Platte (6.726 GB frei).
    A-79       backup/-Aufbewahrung, 3.958 MiB gegen ein Limit von 2.5 GiB
    A-78       Waechter auf Bezeichner-Ueberschneidung
    G-540      drei Entscheidungen zu Vorlagen: gehoeren geteilte
               Vorlagen mit Bewertung zu Goals oder zum Marketplace,
               nimmt "Share with coach" den Weg der Freigabeschicht,
               und wer pflegt die LumeOS-Vorlagen

`[cmd]` **G-521 A1 ist ohne Auftrag gefallen.** Die vier tragenden Zahlen
ohne Seitenbeleg stehen in drei Quellen: `definitions.ts`, `GOAL_PHASES`
und `PHASE_MODELS.md`. Sie gehoeren an den Katalogeintrag (G-536), nicht
in `phase_rate_rules` — die bleibt leer und wird zum Fallen vorgelegt.

## Was ausdruecklich wartet

**Tom, 2026-09-29:** *„physique oder pose interessiert mich noch nicht,
wenn wir nicht mal in der lage sind grundlagen in der ui darzustellen."*

Damit warten: Physique-Verhaeltnisse, Pose-Sessions, C-494, G-139.

## Neu angelegt, noch ohne Reihenfolge

    G-535   sechs Funktionen lesen den alten Sitzungsnamen
            request.jwt.claim.sub (Singular) - coach, medical, nutrition.
            Dieselbe Ursache, die die Phase engine unbedienbar machte.
    A-82    siehe oben

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

## Zwei Regeln

`[cmd]` **Ein Auftrag, ein Bericht.** Ketten sind erlaubt, aber sie
melden EINMAL am Ende.

`[cmd]` **Nichts laeuft losgeloest im Hintergrund** — ausser
`tools/server.py start`, das ein Log schreibt.

---

## Lehren

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
Das ist die sechste und siebte Fehlmessung derselben Art heute.

`[cmd]` **Ein Waechter, der nur eine Zahl meldet, zwingt zum Raten.**
Der Zwei-Wahrheiten-Waechter nennt jetzt die Posten und stellt die Frage.

`[cmd]` **`beruehrt.tabellen` ist eine Behauptung ueber die laufende
Datenbank, keine Inhaltsangabe.** Sechs gebaute, nicht eingespielte
Tabellen dort eingetragen ergab zehn neue Befunde.

`[cmd]` **Neun Waechter, nicht vier** — `punkte`, `zyklus`,
`sammelfragen`, `nummern`, `specs`, `quellen`, `encoding`, `fragen`,
`kettenlauf`. Drei von vier war schon kein Lauf.

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
Projektregeln; 150 Datenbanken stehen in `pg_database`. Das ist A-80.

---

## Ein Befund zu dieser Datei

`[read]` **Die Tabelle oben ist ableitbar.** `docs/punkte/00-INDEX.md`
kennt aus dem Frontmatter, welche Punkte wo liegen. Von Hand gepflegt
wird sie genau so alt wie beim letzten Mal. **Was NICHT ableitbar ist,
sind die Abschnitte darunter** — was auf Tom wartet, was ausdruecklich
wartet, die Regeln und die Lehren.
