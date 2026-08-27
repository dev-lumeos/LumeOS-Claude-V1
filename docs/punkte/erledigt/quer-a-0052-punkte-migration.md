---
nr: A-52
typ: feature
modul: quer
schwere: hoch
angelegt: 2026-08-27
braucht: []
kind_von: null
kinder: []
entscheidung: null
beruehrt:
  dateien:
    - docs/todo/TODO.md
    - docs/todo/ERLEDIGT.md
    - docs/punkte/00-LIESMICH.md
zahlen:
  gemessen: 2026-08-27
  offene_punkte: 244
  erledigte_punkte: 385
  zeilen_todo_md: 6600
agent: codex
beauftragt: 2026-08-27
erledigt: 2026-08-27
commit: OFFEN
---

# A-52 — die 244 offenen Punkte in das neue Modell ueberfuehren

## Befund

`[cmd]` **`docs/todo/TODO.md` hat rund 6.600 Zeilen und fuehrt 244
offene Punkte**, `ERLEDIGT.md` 385 erledigte. **Beziehungen zwischen
Punkten stehen als Prosa im Fliesstext**, Zahlen ohne Stichtag, Orte
ohne Pruefung.

`[cmd]` **Am 27.08. sind vier Auftraege an ihrer eigenen Praemisse
gescheitert:**

    G-186 nannte `wissen.entity_transporters`
          -> die Tabellen liegen in `supplements.`
    G-170 nannte `medical.medications`
          -> gibt es nicht
    G-176 sprach von 290 Substanzen
          -> es sind 412
    G-138 verglich Vorlagennamen mit Codenamen
          -> `LogDoseModal` heisst hier `LogDoseFenster`

`[read]` **Das neue Modell steht in
`docs/punkte/00-LIESMICH.md`.** Lies es zuerst und vollstaendig — es
ist die Vorgabe, nicht dieser Auftrag.

## Auftrag

### Vorweg: die Zahlen sind Ausgangsvermutungen

`[read]` **Pruef sie zuerst. Weicht deine ab, gilt deine — und du
nennst beide.** `[cmd]` **Meine Zaehlungen lagen heute siebenmal
daneben, jedes Mal beim Abgrenzen einer Kategorie.** Zuletzt hast du
selbst 43 statt meiner 47 C-Punkte gezaehlt.

### Zu tun

**Je offener Punkt aus `TODO.md` eine Datei in
`docs/punkte/todos/`**, benannt nach dem Muster im LIESMICH:
`<modul>-<reihe>-<nummer vierstellig>-<kurztitel>.md`.

**Frontmatter befuellen, Rumpf als `## Befund` uebernehmen.** Der
vorhandene Text wandert unveraendert — **nicht kuerzen, nicht
umschreiben, nicht gluecklich machen.**

**Was abgeleitet werden darf:**

    nr, typ, schwere        aus Text und Formulierung
    modul                   aus Inhalt; unklar -> `quer`
    angelegt                aus `(neu JJJJ-MM-TT)` im Kopf
    braucht                 aus `braucht: X-000`
    kinder / kind_von       aus ausdruecklichen Verweisen im Text

**Was NICHT abgeleitet werden darf:**

`[read]` **`beruehrt` nur fuellen, wo ein Tabellen- oder Dateiname
woertlich im Punkttext steht.** **Nicht erschliessen, nicht raten.**
Was fehlt, bleibt leer — **ein leeres Feld ist ehrlich, ein
geratenes schickt den naechsten Auftrag ins Leere.**

**`zahlen` nur uebernehmen, wenn im Text ein Messdatum steht.** Sonst
`zahlen: null`. `[read]` **Eine Zahl ohne Stichtag ist der Fehler,
der heute vier Auftraege gekostet hat** — sie in die neue Struktur zu
retten hiesse, ihn mitzunehmen.

**Am Ende:** `docs/todo/TODO.md` und `docs/todo/ERLEDIGT.md`
**unveraendert stehen lassen.** `[read]` **Sie sind die Sicherung.**
Erst wenn der Index steht und stimmt, wird ueber ihr Schicksal
entschieden.

### Was nicht zu tun ist

**Keinen Punkt zusammenlegen, streichen oder umformulieren.**
`[read]` Zwei Punkte, die dasselbe meinen, **sind selbst ein
Befund** — nenn sie im Bericht, entscheide nicht.
**Keine Nummern neu vergeben.**
**`ERLEDIGT.md` nicht aufteilen** — die 385 bleiben, wo sie sind.
**Keinen Index bauen** — das ist der naechste Auftrag.
`apps/` und `supabase/` nicht anfassen. Nicht committen, nicht
stagen, nicht pushen.

### Nachweis

    Dateien in todos/            Zahl, Soll 244
    Punkte in TODO.md            Zahl, gegengezaehlt
    ohne modul (-> quer)         Zahl
    mit braucht                  Zahl
    mit kinder / kind_von        Zahl
    mit beruehrt                 Zahl, und woraus jeweils
    mit zahlen                   Zahl, alle mit Stichtag
    doppelte Nummern             Soll 0
    doppelte Dateinamen          Soll 0

`[read]` **Gegenprobe:** jede Nummer aus `TODO.md` muss genau einmal
in `todos/` liegen, und jede Datei in `todos/` muss eine Nummer aus
`TODO.md` tragen. **Beide Richtungen zaehlen, nicht nur eine.**

### Regeln

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
**Markdown nur per `write_file` mit vollstaendigem Inhalt** —
`edit_block` zerstoert Tabellen.
`[read]` **Und der Fehler, den ich heute selbst gemacht habe:**
Repo-Text mit Sonderzeichen nicht ueber die Standardeingabe einer
interaktiven Python-Sitzung schreiben — **das hat fuenf
Doppelkodierungen in `TODO.md` erzeugt und das Gate blockiert.**

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Bericht

### Durchgefuehrt

`[cmd]` Aus den nummerierten offenen Kopfzeilen in `docs/todo/TODO.md` wurden **244** eigenstaendige Punktdateien in `docs/punkte/todos/` erzeugt. Der jeweilige alte Rumpf steht unveraendert unter `## Befund`; keine Nummer, kein Punkt und kein Text wurden zusammengelegt, gestrichen oder umformuliert. Ein Index wurde nicht angelegt.

`[cmd]` `beruehrt` enthaelt ausschliesslich woertliche Tabellen- und Dateinamen aus dem jeweiligen Befund. Nicht explizit genannte Orte bleiben leer. `zahlen` ist bei **239** Punkten `null`; bei **5** Punkten wurden nur Zahlen mit Messdatum strukturiert uebernommen.

### Messung

| Nachweis | Auftrag | Eigene Messung |
|---|---:|---:|
| offene Punkte in `TODO.md` | 244 | **244** |
| Zeilen in `TODO.md` | rund 6.600 | **6.083** |
| erledigte Punkte in `ERLEDIGT.md` | 385 | **384** streng als `- [x] **REIHE-NR:` gezaehlte Kopfzeilen |
| Dateien in `docs/punkte/todos/` | 244 | **244** |
| Modul unklar, daher `quer` | - | **140** |
| mit `braucht` | - | **3** |
| mit `kind_von` | - | **121** |
| mit `kinder` | - | **1** |
| mit `beruehrt.tabellen` | - | **41** |
| mit `beruehrt.dateien` | - | **82** |
| mit `zahlen` und Stichtag | - | **5** |
| doppelte Nummern | 0 | **0** |
| doppelte Dateinamen | 0 | **0** |

Die Abweichung bei `ERLEDIGT.md` ist eine Frage der Abgrenzung: Der strenge Kopfzeilen-Zaehler findet 384 `**REIHE-NR:`-Eintraege; die Datei enthaelt daneben anders formatierte und gebuendelte Abschluesse. `ERLEDIGT.md` wurde deshalb unveraendert gelassen.

`[cmd]` Gegenprobe in beide Richtungen: 244 Nummern in `TODO.md` gegen 244 Frontmatter-Nummern in `todos/`; keine fehlende oder zusaetzliche Nummer. Alle 244 erzeugten Dateien wurden zudem als valides UTF-8 mit Frontmatter, H1 und `## Befund` gelesen; 0 Fehler. `git diff -- docs/todo/TODO.md docs/todo/ERLEDIGT.md` war leer.

`[cmd]` Der vorhandene globale `tools/encoding-pruefen.mjs`-Lauf erreichte das feste Zeitlimit von `tools/lauf.py`; die gezielte UTF-8- und Aufbaupruefung der 244 neu erzeugten Dateien lief vollstaendig gruen.

Eine Titelgleichheitspruefung fand keine identischen Titel. Semantisch aehnliche Punkte wurden bewusst weder bewertet noch zusammengefuehrt; das waere keine textgestuetzte Migration.


## Abnahme

**2026-08-27, Orchestrator. Gegen `TODO.md` geprueft, nicht gegen den
Bericht.**

`[cmd]` **Beide Richtungen gezaehlt:**

    Nummern in TODO.md      244, eindeutig
    Dateien in todos/       244, eindeutig
    nur in TODO.md          keine
    nur in todos/           keine
    doppelte nr             keine
    Pflichtfelder           244 / 244 / 244 / 244
    Frontmatter-Fehler      0

`[cmd]` **`zahlen` bei 5 Punkten, davon 0 ohne Stichtag.**
`[cmd]` **`beruehrt` bei 41 von 244** — nur wo es woertlich im Text
stand. **Beide Vorgaben haben gegriffen.**

### Drei Berichtigungen an mir

`[cmd]` **6.084 Zeilen, nicht rund 6.600.** `[read]` Ich hatte die
Zahl aus einer frueheren Messung uebernommen, nach der 25 Punkte
geschlossen wurden — **eine Zahl ohne Stichtag, im Auftrag zur
Abschaffung von Zahlen ohne Stichtag.**

`[cmd]` **Kleinschreibung im Dateinamen.** Mein erster Prueflauf
meldete 244 Namensfehler, bis ich merkte, dass mein Test
Grossbuchstaben erwartete. `[read]` **Ich uebernehme die Schreibweise
und ziehe das Modell nach** — durchgaengig kleine Dateinamen sind
robuster zwischen Windows und Linux, und sie war ueber 244 Dateien
konsistent.

`[cmd]` **221 mit Datum, 23 mit `angelegt: null`** — nicht 244, wie
ich gemeldet hatte. Mein Regex pruefte auf *irgendein Zeichen*, und
`null` ist eins. `[read]` **Von Claude Codes Waechter gefunden.**

### Drei Befunde, die daraus entstehen

`[cmd]` **140 von 244 tragen `modul: quer`** — 57 Prozent ohne Modul.
**Als A-54 beauftragt.**

`[cmd]` **43 Punkte tragen `typ: entscheidung`.** `[read]` **Sie
warten nicht auf Arbeit, sondern auf eine Entscheidung** und gehoeren
nach `docs/entscheidungen/` und vor Tom, nicht in eine Aufgabenliste.

`[cmd]` **3 mit `braucht`, 1 mit `kinder`** bei 244 Punkten.
`[annahme]` **Abhaengigkeiten stehen vermutlich als Prosa da, wo ein
Regex sie nicht findet** — gemessen ist das nicht.

**Abgenommen.**

