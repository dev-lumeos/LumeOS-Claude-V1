---
nr: C-336
typ: befund
modul: nutrition
schwere: hoch
angelegt: 2026-08-28
braucht: []
kind_von: G-246
entscheidung: null
agent: claudecode
beauftragt: 2026-08-29
erledigt: 2026-08-29
commit: OFFEN
beruehrt:
  tabellen: [nutrition.nutrient_details]
zahlen:
  gemessen: 2026-08-28
  detailzeilen: 110
  ul_ohne_excess: 2
---

# C-336 — FD traegt den Text eines anderen Naehrstoffs

## Befund

Aus G-246, Claude Code, 2026-08-28. **Vom Orchestrator nachgemessen.**

`[cmd]`

    nutrient_defs.name_de           Fluorid, Einheit ug
    nutrient_details.function_de    "Trockenmassegehalt eines
                                     Lebensmittels"

`[read]` **Im Vorgaengerrepo hiess `FD` *dry matter*.** Beim Import
ist die Zeile ueber den gleichlautenden Schluessel am falschen
Naehrstoff gelandet.

`[read]` **Dieselbe Klasse wie `CLD`/`CL` aus G-239 — nur mit
Wirkung:** wer auf Fluorid klickt, liest ueber Trockenmasse.

## Die eigentliche Frage

**Wenn ein Schluessel kollidieren konnte, wie viele andere sind es?**

`[cmd]` **110 Detailzeilen, alle ueber `nutrient_code` verknuepft.**
`[read]` **Kein Eintrag haengt in der Luft** (0 ohne
`nutrient_defs`-Gegenstueck) — **aber ein Text am falschen Code
faellt dabei nicht auf.** Die Verknuepfung ist formal richtig und
inhaltlich falsch.

`[read]` **Zu pruefen ist der Inhalt gegen den Namen**, nicht die
Fremdschluesselbeziehung. `[cmd]` Bei 110 Zeilen ist das lesbar.

## Nebenbefund aus demselben Auftrag

`[cmd]` **Zwei Naehrstoffe mit `UL` haben keinen
Ueberdosierungstext:** `FOLAC` (Folsaeure, UL 1.000 ug) und `FD`
(Fluorid, UL 10.000 ug).

`[read]` **Bei `FD` ist der Grund vermutlich derselbe** — die falsche
Zeile bringt auch kein `excess_de` mit.

## Auftrag — die Zuordnung pruefen, nicht die Texte

**Mitbeauftragt: G-255.**

### Vorweg

`[read]` **Dieser Auftrag traegt keine Zahlen vom Orchestrator.**
`[read]` **Und die Datei ist die Wahrheit** — lies die Punkte selbst.

### Zu tun

**Pruefen, ob weitere Detailtexte am falschen Naehrstoff haengen.**

`[cmd]` **`FD` heisst Fluorid und traegt *,,Trockenmassegehalt eines
Lebensmittels"*** — im Vorgaengerrepo hiess `FD` *dry matter*.

`[read]` **Die Verknuepfung ist formal richtig und inhaltlich
falsch** — kein Fremdschluessel faengt das. `[read]` **Die Frage ist:
wie viele andere sind es?**

`[cmd]` **110 Detailzeilen, alle ueber `nutrient_code` verknuepft, kein
Eintrag ohne Gegenstueck.** `[read]` **Bei 110 Zeilen ist ein Abgleich
von Inhalt gegen Namen lesbar.**

`[read]` **Und derselbe Verdacht gilt fuer die Codes selbst:** du
hast in G-239 gemessen, dass Mockup und Datenbank verschiedene
Codesysteme fuehren (`CLD` gegen `CL`). **Wo sonst ist beim Import
ein Schluessel kollidiert?**

### G-255 — die drei Attrappen-Konstanten

`[cmd]` **`USER_STACKS`, `STACK_TEMPLATES`, `FREQUENCY_OPTIONS` haben
keinen Renderer** — nur einen Test, der prueft, dass sie nicht leer
sind.

`[read]` **A-59 sagt loeschen, und in G-253 hast du sie stehen
lassen, weil das Stehenlassen in G-249 Toms ausdrueckliche
Entscheidung war.** `[read]` **Der Unterschied: in G-249 steckte
bestellte Arbeit darin, hier sind es Beispieldaten aus dem Entwurf.**

**Loeschen, wenn die Attrappenzahl am Schirm bei 0 bleibt.**

### Was nicht zu tun ist

**Keine Texte schreiben oder korrigieren** — was falsch zugeordnet
ist, wird gemeldet. `[read]` **Datenpflege gehoert Codex.**
**Keine Tabelle anlegen.**
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    Detailtexte gegen Namen      alle 110 geprueft
    falsch zugeordnet            je einzeln, mit beiden Bedeutungen
    Codekollisionen sonst        gemessen oder ausgeschlossen
    G-255                        geloescht, Attrappen am Schirm
                                 vorher / nachher

### Regeln

`tools/lauf.py`, keine Konsolenfenster. `[cmd]` A-30, A-59, A-60.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Bericht

**Claude Code, 2026-08-29.** Alle Zahlen mit Nutzer und Zeitraum.

### Die Kurzfassung

**Es sind zwei, nicht einer.** `[cmd]` **Alle 110 Detailzeilen
geprueft, auf zwei unabhaengigen Achsen** (Funktionssatz und
Lebensmittelquellen). **Genau zwei sind falsch zugeordnet: `FD` und
`CHORL`.**

**Und die Ursache ist gefunden, nicht vermutet.** `[cmd]` **Die
richtigen Texte fuer beide liegen in derselben Quelldatei** — unter
`F` und `CHOL`, zwei Schluesseln, die dieses Repo nicht fuehrt.
**Der Import verband ueber Schluesselgleichheit; die passenden
Eintraege fielen als „kein Treffer" heraus, die kollidierenden gingen
als exakter Treffer durch.**

`[read]` **Der zweite Fall ist schlimmer als der gemeldete:** bei `FD`
steht ein belangloser Text bei Fluorid. **Bei `CHORL` steht der
Chlorid-Text bei Cholesterin** — mit Mangelbild *,,gestoerte
Verdauung, metabolische Alkalose"* und den Quellen *,,Salz, Tomaten,
Oliven"*. **Das ist medizinisch irrefuehrend, nicht nur belanglos.**

### Die Nachweiszeilen

| Zeile | Ergebnis |
|---|---|
| Detailtexte gegen Namen | **alle 110 geprueft**, zweiachsig |
| falsch zugeordnet | **2** — `FD` und `CHORL`, je mit beiden Bedeutungen |
| Codekollisionen sonst | **gemessen und ausgeschlossen** — 107 gemeinsame Schluessel, 3 bewusst uebersetzt |
| G-255 | **geloescht**; Attrappen am Schirm **6 vorher / 6 nachher**, Stacks-Reiter **0 / 0** |

### 1 · Der gemeldete Fall stimmt

`[cmd]` **`FD` heisst hier Fluorid (µg) und traegt
*,,Trockenmassegehalt eines Lebensmittels"*.** `[cmd]` Die Quelle
steht in `source_path`:
`referenz/lumeos-2026/apps/app/modules/nutrition/data/nutrientDetails.ts`,
**Zeile 1121: `FD: { key: 'FD', function_en: 'Dry matter content of a
food' }`.**

`[cmd]` **Die Quellenliste bestaetigt es unabhaengig:**
*,,Getrocknete Fruechte, Getreide, Nuesse"* — **Trockenmasse, nicht
Fluorid.** Fluorid kaeme aus Tee und Wasser.

### 2 · Der zweite Fall, vorher nicht bekannt

`[cmd]` **`CHORL` heisst hier Cholesterin (mg)** und traegt:

    function_de     „Magensaeure, Elektrolythaushalt, Verdauung"
    deficiency_de   „Gestoerte Verdauung, metabolische Alkalose"
    top_sources_de  „Salz, Tomaten, Oliven, Meeresfruechte"

`[cmd]` **Das ist Chlorid.** Quelldatei Zeile 2430: `CHORL` mit genau
diesen Werten.

`[cmd]` **Und dieses Repo fuehrt Chlorid getrennt** — als `CLD`
(*,,Saeure-Basen-Balance"*, Quellen *,,Salz, Tomaten, Sellerie"*).
**Zwei Naehrstoffe, zwei Codes, ein Text am falschen.**

`[cmd]` **Beide tragen echte Werte:** auf `dev@lumeos.app` haben
`FD`, `CHORL` und `CLD` je **90 von 90 Tagen** einen Wert > 0
(2026-08-29, 90 Tage). **Wer heute auf Cholesterin klickt, liest ueber
Magensaeure.**

### 3 · Die Ursache — und warum kein Fremdschluessel sie faengt

`[cmd]` **Die Quelldatei fuehrt 114 Schluessel, dieses Repo 138 Codes,
107 sind gemeinsam.**

`[cmd]` **Sieben Schluessel gibt es nur im Vorgaengerrepo:**

    F        „Zahnschutz" / Mangel „Karies"      <- das RICHTIGE Fluorid
    CHOL     „Hormone, Zellmembranen"            <- das RICHTIGE Cholesterin
    SE       „Schilddruese, Antioxidant"         <- Selen, hier kein Code
    FIBTG    „Verdauung, Blutzucker, Saettigung" <- Ballaststoffe gesamt
    F18D2N6, F20D5N3, F22D6N3                    <- Fettsaeuren, siehe unten

`[cmd]` **Keiner davon wurde importiert** (`source_key` geprueft: 0
Treffer fuer `F`, `CHOL`, `SE`, `FIBTG`).

`[read]` **Damit ist der Hergang belegt:** der Import lief ueber
Schluesselgleichheit. **`F` fand keinen Partner und fiel weg; `FD`
fand einen und ging durch** — obwohl `FD` in beiden Repos
Verschiedenes bedeutet. **Dasselbe bei `CHOL` gegen `CHORL`.**

`[read]` **Ein Fremdschluessel kann das nicht fangen:** die Zeile
verweist auf einen existierenden Code. **Formal richtig, inhaltlich
falsch** — genau wie der Punkt sagt.

### 4 · Codekollisionen sonst — ausgeschlossen, nicht vermutet

`[cmd]` **Die drei abweichenden `source_key` sind bewusste
Uebersetzungen, keine Kollisionen:**

    F18:2CN6  <- F18D2N6    Linolsaeure      Text passt
    F20:5CN3  <- F20D5N3    EPA              Text passt
    F22:6CN3  <- F22D6N3    DHA              Text passt

`[read]` **Dieselbe Klasse wie `CLD`/`CL` aus G-239** — zwei
Codesysteme, hier aber **richtig** aufgeloest.

`[cmd]` **31 Codes gibt es nur hier** — 30 Fettsaeuren und
`OLSAC`. `[read]` **Sie haben keinen Detailtext, und das ist kein
Fehler:** die Quelldatei fuehrt sie nicht. **Kein Text ist etwas
anderes als ein falscher Text.**

`[cmd]` **Und `SE` ist der Gegenbeweis zur Sorglosigkeit:** Selen hat
in der Quelle einen Text, **dieses Repo fuehrt aber gar keinen
Selen-Code.** Der Text fiel weg, ohne Schaden anzurichten.

### 5 · Der Nebenbefund aus dem Punkt

`[cmd]` **Bestaetigt, aber die Deutung faellt:** `FD` und `FOLAC`
haben `excess_de = null` — **und mit ihnen 69 der 110 Zeilen.**

`[read]` **Ein fehlender Ueberdosierungstext ist hier der Normalfall,
kein Symptom.** Die Vermutung des Punktes (*,,bei `FD` ist der Grund
vermutlich derselbe"*) laesst sich damit weder bestaetigen noch
widerlegen: **`FD` hat keinen, weil 69 andere auch keinen haben.**

`[cmd]` **Bei `FOLAC` ist die Zuordnung ohnehin richtig** —
*,,Synthetische Form von Folat"*, Quellen *,,Angereicherte
Lebensmittel, Supplemente"*. **Dort fehlt der Text schlicht.**

### 6 · Was NICHT getan wurde

**Keine Texte korrigiert.** `[read]` Die Zuordnung zu berichtigen
hiesse, `nutrition.nutrient_details` zu schreiben — **Datenpflege, und
die gehoert Codex.** Der Auftrag sagt es ausdruecklich.

**Was ein Nachfolgeauftrag braucht, steht damit fest:** die richtigen
Texte muessen nicht geschrieben werden, **sie liegen unter `F` und
`CHOL` in der Quelldatei bereit.** Es ist ein Umhaengen, kein
Verfassen.

### 7 · Ein Waechter, damit der Befund nicht verschwindet

`detailtext-zuordnung.test.ts` — **fuenf Tests.** `[read]` Er prueft
die **Quelldatei**, nicht die Datenbank: er haelt fest, dass die
richtigen Texte existieren, dass sie unter anderen Schluesseln stehen
und dass die falschen unter den kollidierenden stehen. **Wer die
Zuordnung korrigiert, aendert die Liste; wer sie versehentlich
wiederherstellt, faellt darueber.**

### 8 · Die Sabotagen — 4 von 4 fallen

Jede einzeln, Rueckbau bytegleich per SHA-256.

| # | Sabotage | faellt |
|---|---|---|
| 1 | `FD` verweist auf sich selbst statt auf `F` | ja |
| 2 | `CHORL` bekommt den falschen Text als richtigen | ja |
| 3 | der gemeldete Fehltext passt nicht mehr zur Quelle | ja |
| 4 | eine noch benutzte Konstante wird geleert | ja |

**Drei ueberlebten im ersten Lauf, und zwei davon haben etwas
gefunden:**

`[cmd]` **Sabotage 1 und 2 ueberlebten**, weil die Pruefung
`includes` **ueber die ganze Datei** laufen liess: der falsche Text
steht ja auch darin. **Verschaerft auf den BLOCK des Schluessels**,
plus zwei `notEqual` — richtiger Schluessel darf nicht der
kollidierende sein, richtiger Text nicht der falsche.

`[read]` **Das ist derselbe Fehler wie in G-187 und G-197** — ein
unverankertes `includes` auf einem Text, statt eine begrenzte Stelle
zu pruefen.

`[cmd]` **Die dritte war mein Fehler im Sabotageentwurf:** ich hatte
eine *Zusicherung entfernt*, und das kann keinen Test rot machen.
**Ersetzt durch eine, die die Wirkung angreift** (die Konstante
leeren) — die faellt.

### 9 · G-255 — geloescht

`[cmd]` **Attrappen am Schirm, `dev@lumeos.app`, alle neun
Supplements-Reiter:**

    vorher    heute 0 · stack 0 · extended 6 · catalog 0 · stacks 0
              intelligence 0 · inventory 0 · injektionen 0 · compliance 0
    nachher   identisch, SUMME 6

`[read]` **Die Bedingung des Auftrags ist erfuellt:** der
Stacks-Reiter steht vorher wie nachher bei **0**. **Die sechs in
`extended` gehoeren nicht zu den drei Konstanten** und sind unberuehrt.

`[cmd]` **Geloescht:** `USER_STACKS`, `STACK_TEMPLATES`,
`FREQUENCY_OPTIONS` aus `spec-daten.ts`, dazu ihre drei
Herkunftszeilen im Kopf und die drei Zusicherungen in
`spec-daten.test.ts`. **Typecheck sauber** — nichts verwies darauf.

`[read]` **Ein Vermerk steht an ihrer Stelle**, mit Datum und Grund.
**Sonst erfindet sie der naechste neu**, weil der Kopf die Vorlage
weiter auflistet.

### 10 · Gate und Testlage

`[cmd]` **`pnpm gate`: 11 von 11 Aufgaben gruen**, `[serverimport]` 51
Client-Chunks / 0 Treffer. `[cmd]` **509 von 509 Tests gruen**
(Nutrition + Supplements), davon 5 neue. `[cmd]` **Encoding: 20.626
Dateien sauber, Exit 0.**

**Nichts auf `dev@lumeos.app` geschrieben — nur gelesen. Nicht
committet, nicht gestaget.**

## Abnahme

**2026-08-29, Orchestrator. Nachgemessen.**

`[cmd]` **Zwei Fehlzuordnungen, nicht eine. Alle 110 Detailzeilen auf
zwei Achsen geprueft.**

    FD      Fluorid       "Trockenmassegehalt eines Lebensmittels"
    CHORL   Cholesterin   "Magensaeure, Elektrolythaushalt,
                           Verdauung"
    CLD     Chlorid       "Saeure-Basen-Balance"          richtig

`[read]` **`CHORL` ist der schlimmere Fund und war nicht gemeldet:**
wer auf Cholesterin klickt, liest ueber Chlorid — Mangel *,,gestoerte
Verdauung, metabolische Alkalose"*, Quellen *,,Salz, Tomaten,
Oliven"*. `[read]` **Bei Fluorid und Trockenmasse merkt man den
Fehler; bei Cholesterin klingt er plausibel.**

`[cmd]` **Beide tragen auf `dev` an allen 90 Tagen echte Werte** —
der falsche Text steht live.

### Die Ursache ist bewiesen

`[cmd]` **Die Vorgaengerdatei hat 114 Schluessel, dieses Repo 138
Codes, 107 geteilt.** `[cmd]` **Die richtigen Texte liegen dort unter
`F` und `CHOL`** — zwei Schluessel, die wir nicht verwenden, **und
beide wurden nicht importiert.**

`[read]` **Der Import glich auf Schluesselgleichheit ab:** `F` fand
keinen Partner und fiel weg, **`FD` fand einen und ging durch,
obwohl er etwas anderes bedeutet.** `[read]` **Kein Fremdschluessel
faengt das** — die Zeile zeigt auf einen Code, den es gibt.

`[cmd]` **`nutrient_defs` ist unberuehrt und korrekt** — dort stehen
alle 138 BLS-Codes mit Name, Einheit, Gruppe und Formel. **Der Fehler
liegt allein in `nutrient_details`.**

### Keine weiteren Kollisionen

`[cmd]` **Die drei abweichenden `source_key` sind bewusste
Fettsaeure-Uebersetzungen** (`F18D2N6` → `F18:2CN6`) mit passenden
Texten — **die CLD/CL-Klasse aus G-239, hier richtig aufgeloest.**

`[cmd]` **Die 31 eigenen Codes haben gar keinen Detailtext** —
**kein Text unterscheidet sich nicht von einem falschen Text.**

### Eine Praemisse des Punktes faellt

`[cmd]` **`excess_de` fehlt bei 69 von 110** — der Normalfall.
`[read]` **Damit taugt es nicht als Hinweis auf `FD`, in keine
Richtung.** **Meine Nebenannahme im Punkt war falsch.**

### G-255

`[cmd]` **Geloescht.** Attrappen am Schirm ueber alle neun
Supplements-Reiter: **6 vorher, 6 nachher, Stacks-Reiter 0 in
beiden** — die Bedingung hielt. **Die verbleibenden 6 liegen in
`extended` und sind unbeteiligt.**

`[read]` **Und ein Vermerk markiert die Stelle**, damit sie nicht neu
erfunden werden.

### Drei Sabotagen ueberlebten, zwei zu Recht

`[read]` **Zwei waren schwache Waechter:** `includes` ueber die ganze
Datei, in der der falsche Text ebenfalls vorkommt — **dieselbe
unverankerte Suche wie in G-187 und G-197**, jetzt auf den Block des
Schluessels eingegrenzt.

`[read]` **Die dritte war eine schlecht gebaute Sabotage:** eine
Zusicherung zu entfernen kann keinen Test rot machen. **Ersetzt durch
eine, die die Wirkung angreift.**

**Abgenommen.** Die Reparatur geht als **C-346** an Codex — **die
richtigen Texte muessen nicht geschrieben werden, sie liegen in der
Quelldatei unter `F` und `CHOL`.**

