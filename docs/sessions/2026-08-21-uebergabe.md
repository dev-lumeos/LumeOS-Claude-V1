# Übergabe — Stand 2026-08-21, Abend

**Der Satz, der den Rest trägt: Wissen in einem Kontextfenster ist kein
Bestand.**

Diese Sitzung hat einen Tag damit verbracht, Zahlen zu prüfen, die als
gesichert galten. Fast keine hielt. Nicht, weil jemand geschlampt hätte
— sondern weil geprüfte und behauptete Zahlen im selben Dokument gleich
aussehen, und weil das, was eine Sitzung weiss, mit ihr endet.

Was hier steht, steht hier, damit die nächste Sitzung es nicht noch
einmal messen muss.

---

## Wo alles steht

| | |
|---|---|
| Offene Punkte | `docs/todo/TODO.md` — **166 offen, 1 in Arbeit** |
| Alle auf einen Blick | `docs/todo/00-UEBERSICHT.md` — **erzeugt, nicht gepflegt** |
| Erledigtes | `docs/todo/ERLEDIGT.md` — 273 Punkte, mit Beleg |
| Wer woran arbeitet | `docs/todo/LAUFEND.md` |
| Berichte | `docs/ssot/` — 150 Stück, alle im `00-INDEX.md` |
| Quellen je Modul | `docs/spezifikation/00-QUELLEN.md` |
| Vorige Übergabe | `docs/sessions/2026-08-20-uebergabe.md` — gilt weiter |

`[cmd]` **16 Commits liegen auf `dev` und sind nicht gepusht.** Der
Arbeitsbaum ist leer. **Der Push wartet auf Tom** — siehe unten.

---

## Der Befund des Tages: vier erfundene Prämissen

`[read]` **Vier Aufträge dieser Sitzung standen auf Annahmen, die als
Messungen formuliert waren.** Alle vier kamen aus der Erinnerung an ein
Gespräch, nicht aus dem Repo.

| Behauptet | Gemessen |
|---|---|
| *„A-38 und A-45 stehen doppelt in `ERLEDIGT.md`"* | Beide stehen **einmal**, und zwar in `TODO.md`. `Dublette ERLEDIGT: {}` |
| *„Der Wächter hat sie nicht gemeldet — Lücke im Werkzeug"* | Es gab nichts zu melden. Die Prüfung war korrekt. |
| *„Prüfung 1 und 3 sind unbelegt"* | Beide seit `a6f6fd0` einzeln belegt, Selbsttest grün. |
| *„A-47 schliessen, C-190 vermerken"* | Beide Nummern **existierten nicht** — 0 Treffer in TODO, ERLEDIGT, LAUFEND. |
| *„Der Supplements-Tab braucht 1.126 ms serverseitig"* | **167 ms**, Summe aller Abfragen. Aus keinem Lauf. |

### Woran man sie gemerkt hat

`[read]` **An nichts im Text.** Die Behauptungen waren plausibel,
spezifisch und im richtigen Ton — *„A-38 und A-45 doppelt in ERLEDIGT"*
liest sich exakt wie ein Messergebnis. **Der Unterschied war nur durch
Nachmessen zu sehen.**

`[cmd]` **Gemerkt wurde es jedes Mal auf dieselbe Weise:** die Prämisse
gegen das Repo geprüft, bevor die Arbeit begann. Drei Zeilen Python,
zehn Sekunden. **Vier von vier Malen hielt sie nicht.**

`[read]` **Die Regel daraus ist keine neue** — sie steht als *„Prüfung
ohne Erwartung misst nichts"* schon da. **Neu ist, dass sie auch für
Aufträge gilt, nicht nur für Agentenberichte.** Ein Auftrag ist eine
Aussage über den Ist-Zustand mit einer Handlung daran.

`[read]` **Und das Gegenstück, das genauso wichtig ist:** Vier Prämissen
zu prüfen war richtig. **Dreimal hintereinander die ganze Liste daran zu
blockieren war falsch.** Der unstrittige Teil hätte laufen können, die
zwei offenen Fragen ans Ende gehört. Wer prüft, muss trotzdem liefern.

---

## Die 144 ms kamen aus einem Bericht, nicht aus einer Messung

`[cmd]` **C-189 stand mit `7.641 ms → 144 ms` im Abschluss.** Die 144
stammten aus dem Bericht des Agenten, der die Änderung gemacht hat.

`[cmd]` **Nachgemessen, zwölf Läufe, `EXPLAIN (ANALYZE, FORMAT JSON)`,
`dev@lumeos.app`:**

| | |
|---|---:|
| erster Lauf | 168,7 ms |
| Minimum | **160,5 ms** |
| **Median** | **167,5 ms** |
| Maximum | 194,5 ms |
| Streubreite | 34,0 ms |
| Standardabweichung | 13,1 ms |

`[cmd]` **Die 144 liegen unter dem Minimum aus zwölf Läufen.** Sie sind
nicht erfunden — sie sind eine einzelne günstige Messung, als Ergebnis
ausgegeben. **Faktor 46 statt 53; die Grössenordnung stimmt, die Zahl
nicht.**

`[read]` **Die Lehre ist nicht „Agenten lügen".** Der Bericht war
sorgfältig und hat seine eigene Rechnung offengelegt. **Die Lehre ist:
eine einzelne Messung hat keine Streuung, und ohne Streuung weiss
niemand, ob sie den Normalfall trifft.** Wer eine Laufzeit in einen
Abschluss schreibt, schreibt Median und Spanne dazu — oder er schreibt
sie nicht.

---

## `test-user` hat keine Supplements-Daten — und die Regel kollidiert

**Das ist der Abschnitt, der am ehesten wieder jemanden erwischt.**

`[cmd]` **Datenlage, gemessen:**

| Konto | Stacks | Einnahmen |
|---|---:|---:|
| `dev@lumeos.app` | 1 | 360 |
| `tom.seed@example.com` | 1 | 360 |
| `test-user@lumeos.local` | **0** | **0** |
| `coach@lumeos.app` | 0 | 0 |
| die drei übrigen `*.seed@example.com` | 0 | 0 |

### Was beinahe passiert wäre

`[cmd]` **Der erste Messversuch für C-189 lief auf `test-user` und ergab
23 ms.** Zehn Läufe, saubere Streuung, Exit 0 — **eine Zahl, die nach
einem Ergebnis aussah.**

`[cmd]` **Sie war keins.** `rule_assessment` findet auf einem Konto ohne
Stack und ohne Einnahmen nichts vor und fällt sofort durch. **Die
Gegenprobe steht: 24,3 ms Median bei leerer Lage gegen 167,5 ms bei
gefüllter** — Faktor 7 zwischen „gemessen" und „nichts gemessen".

`[read]` **Aufgefallen ist es an einer Nebensache:** die Abfrage
`SELECT count(*) FROM supplements.platform_rules` kam leer zurück. Die
Tabelle heisst `rule_catalog`; ich hatte den Namen geraten. **Beim
Nachsehen fiel die Datenlage auf.** Ohne diesen Zufall wären die 23 ms
in den Abschluss gegangen.

### Die Kollision

`[read]` **Die Regel lautet:** *„Nachweise auf `test-user@lumeos.local`
führen — Läufe auf `dev` überschreiben Toms gespeicherte
Einstellungen."*

`[read]` **Sie gilt für Schreibvorgänge, und dort ist sie richtig.** Für
Messungen ist sie unbrauchbar, wo `test-user` keine Daten hat: **ein
leeres Konto misst die leere Lage, nicht das Produkt.**

### Wie es aufgelöst ist

`[cmd]` **Gemessen wurde auf `dev@lumeos.app`, mit `test-user` als
Gegenprobe** — beide Zahlen stehen im Abschluss nebeneinander, damit
sichtbar ist, was der Unterschied ausmacht.

`[cmd]` **Zulässig war das, weil `EXPLAIN ANALYZE` auf ein `SELECT`
nichts schreibt.** Toms gespeicherte Einstellungen sind unberührt; es
gab keinen `INSERT`, kein `UPDATE`, keine Präferenzschreibung.

**Die Regel gilt damit so:**

1. **Schreibende Nachweise:** immer `test-user`. Unverändert.
2. **Lesende Messungen:** auf dem Konto mit Daten — heute `dev` —
   **und die Datenlage im Abschluss nennen.**
3. **Beides zusammen:** wenn ein Nachweis schreiben *und* messen muss,
   zuerst `test-user` mit Daten füllen, nicht auf `dev` ausweichen.

`[read]` **Und die allgemeine Form, die über Supplements hinausgeht:
eine Messung ohne Erwartung an die Datenlage misst nichts.** Vor jeder
Laufzeitmessung gehört die Frage, wieviel Bestand das Konto hat, gegen
das gemessen wird — und die Antwort in den Bericht.

---

## Der Wächter: acht Prüfungen, jede einzeln belegt

`tools/nummern-pruefen.mjs`, im Gate zwischen `schemafreigabe-pruefen`
und `i18n-pruefen`.

| Prüfung | findet |
|---|---|
| `dublette-todo` | dieselbe Nummer zweimal in `TODO.md` |
| `dublette-erledigt` | dieselbe Nummer zweimal in `ERLEDIGT.md` |
| `beide-dateien` | eine Nummer offen **und** erledigt |
| `haken-in-todo` | `- [x]` in `TODO.md` — erledigt am falschen Ort |
| `laufend-unbekannt` | `LAUFEND.md` nennt eine Nummer, die es nicht gibt |
| `laufend-erledigt` | `LAUFEND.md` führt einen Auftrag, der erledigt ist |
| `uebersicht-veraltet` | `00-UEBERSICHT.md` weicht ab **oder fehlt** |
| `kopfzaehler` | die Zahl im Kopf gegen die Datei |

### Warum der Selbsttest neu gebaut wurde

`[cmd]` **Die alte Gegenprobe war grün, ohne die benannte Prüfung je
auszulösen.** Sie hängte `- [ ] **A-01: …**` an `TODO.md` an, um eine
Dublette zu erzeugen. **`A-01` steht nicht in `TODO.md`, sondern in
`ERLEDIGT.md`** — angeschlagen hat also `beide-dateien`, gemeldet wurde
*„die Dublette wurde gefunden"*.

`[read]` **Ein Selbsttest, der beim Auslösen die falsche Ursache nennt,
belegt nichts** — er beendet nur das Nachsehen. Genau der Fehlermodus,
der neunmal aufgetreten war, blieb ungeprüft.

`[cmd]` **Jetzt gilt für jeden Fall: er muss allein anschlagen.** Feuert
eine zweite Prüfung mit, ist der Fall rot. Fälle, die einen offenen
Punkt anhängen, ziehen deshalb Kopfzähler **und** Übersicht mit — sonst
bewiese keiner mehr genau eine Sache. Der Selbsttest prüft ausserdem
vorab, dass der Ausgangsstand grün ist.

```
LUMEOS_NUMMERN_SELBSTTEST=1 node tools/nummern-pruefen.mjs
→ 8 Pruefungen einzeln belegt.
```

### Die Übersicht ist erzeugt, nicht gepflegt

`docs/todo/00-UEBERSICHT.md`, 219 Zeilen, nach Sektionen, mit Nummer,
Titel, Zustand und Zeilennummer.

`[read]` **Der alte Übersichtsblock stand von Hand in `TODO.md` und ist
gegen die Punkte darunter gedriftet.** Ein Zweitindex ist nur brauchbar,
wenn er erzeugt und geprüft wird — **er kommt aus derselben Funktion wie
der Kopfzähler**, beide können nicht auseinanderlaufen.

```
node tools/nummern-pruefen.mjs --schreiben
```

`[cmd]` **Eine fehlende Datei ist ebenfalls ein Befund.** In der ersten
Fassung wurde die Prüfung übersprungen, wenn die Datei nicht da war —
**ein `rm` hätte das Gate grün gemacht.** Eine Prüfung, die man durch
Löschen ihres Gegenstands abstellen kann, misst nichts. Gegenprobe:
Datei weg → Exit 1, Datei zurück → Exit 0.

### Er hat sofort an mir gegriffen

`[cmd]` **Zweimal in dieser Sitzung**, beide Male an eigenen Commits:

- `laufend-erledigt` beim Schliessen von A-46 — `LAUFEND.md` führte den
  Punkt noch. Commit abgebrochen, Zeile entfernt, Commit durch.
- `uebersicht-veraltet` nach vier eingefügten Kopfzeilen in `TODO.md` —
  alle Zeilennummern verschoben.

`[read]` **Das ist der Beleg, dass die Prüfungen greifen**, und der
Grund, warum sie ins Gate gehören statt in einen Absatz.

---

## Was der Tag sonst geändert hat

**Sechzehn Commits, ein logischer Change je Commit, Gate bei jedem
grün.**

### Die vier zurückgeholt

`[read]` **C-105, C-124, GO-21 und G-89 waren am 2026-08-20 zu früh
geschlossen.** `crawl_025` hat die *Frage* beantwortet — die *Arbeit*
stand aus. **Tom, 2026-08-21:** *„Der Abschluss war meiner, nicht deiner
— ich habe die Frage mit der Arbeit verwechselt."*

Sie stehen wieder offen, mit der Antwort als Auftrag statt als Frage:

| | zu tun |
|---|---|
| **C-105** | `MAV` entfernen (`DO_NOT_IMPLEMENT`), `MEV` als Richtungshinweis, `MRV` + RP-Rahmenwerk als Heuristik |
| **C-124** | alle 30 Modalitäts-Bonuswerte raus, stattdessen Richtung + Endpunkt + Quelle, `current_value: null` |
| **GO-21** | WHO-Grenzwerte einbauen (`BP-WHR-001`, Grad A); ohne gesetztes Geschlecht keine Schwelle |
| **G-89** | vier Proportionen als `LABEL_HEURISTIC`; `BP-FFMI-005` bleibt draussen |

`[read]` **Die Unterscheidung ist übertragbar:** eine beantwortete Frage
ist kein erledigter Punkt. `crawl_025` sagt, *was* gilt — die Zeile im
Code ändert das niemand von allein.

### Neun abgehakte Punkte lagen in `TODO.md`

`[cmd]` G-85, C-142, G-92, G-105, A-45, G-81, G-119, G-120, A-30 —
**keiner hatte einen Eintrag in `ERLEDIGT.md`**, es war jeweils der volle
Inhalt, zusammen 343 Zeilen. Verschoben, nicht gelöscht. `[x]` in
`TODO.md`: **9 → 0.**

### C-190 geschlossen statt korrigiert

`[cmd]` **Serverseitige Abfragezeit des ganzen Supplements-Tabs, zehn
Läufe je Abfrage:**

| Abfrage | Median |
|---|---:|
| `rule_assessment` | **166,4 ms** |
| `substance_catalog` | 0,3 ms |
| `substance_lab_effects` | 0,1 ms |
| `rule_catalog` | 0,1 ms |
| `intake_logs` | 0,2 ms |
| `stack_items` | 0,1 ms |
| **Summe** | **167,1 ms** |

`[cmd]` **Es gibt keine Sekunde, die später stören könnte.** Ein Punkt
*„später, wenn es stört"* hätte eine Arbeit beschrieben, die nicht
existiert — und wäre bei jedem Durchgang der Liste wieder gelesen worden.

`[cmd]` **Nebenbefund, der mehr wert ist als der Punkt:** die *„rund
200 ms je Datenquelle"* aus C-189 waren **vollständig `docker
exec`-Aufwand**, nicht die Abfrage. Fünf der sechs Abfragen liegen
zusammen unter einer Millisekunde. `[read]` **Ein Messweg mit 200 ms
Eigenaufwand kann eine 0,1-ms-Abfrage nicht beurteilen** — wer über
`docker exec` misst, misst `docker exec`.

### Kleineres

- **G-132 in G-133 zusammengeführt** — derselbe Befund unter zwei
  Nummern (`tab-foods.tsx:180`). G-132 bleibt vergeben, wird nicht neu
  ausgegeben.
- **`## A`-Überschrift zurück** — sie war beim Neuschreiben des Kopfes
  verschwunden, 28 A-Punkte hingen ohne Sektion.
- **BrainstormDocs-Regel zurück** (Tom, 2026-08-14) — sie war mit der
  kassierten *„nicht als Referenz"*-Regel mitgegangen. `[read]` **Beim
  Streichen eines Absatzes geht mit, was danebensteht.**
- **Die 178 raus** — eine dritte ungeprüfte Zahl in einem Abschnitt über
  zwei fortgeschriebene Zähler. Ersetzt durch die gemessenen 169/160.
- **Drei Berichte nachgetragen** — 169, 176, 177 fehlten im
  `00-INDEX.md`. **150 auf der Platte, 150 im Index, 0 tote Verweise.**
- **`C-185` aus `LAUFEND.md`** — erledigt und weiter als wartender
  Auftrag gelistet.
- **A-46 entfernt statt gepflegt** — `konsolenfehler_mit_anmeldung` trug
  eine nachweislich falsche Zählweise weiter. `[read]` **Ein gepflegter
  Doppelzähler ist eine zweite Wahrheit.** Die Zuordnung der vier
  Altberichte steht im Abschluss, nicht in jedem künftigen Bericht.

---

## Was bei Tom liegt

**Zuerst und vor allem: der Push.**

`[cmd]` **16 Commits auf `dev`, `origin/dev` unverändert.** Sie sind
gemessen, das Gate ist bei jedem einzelnen grün gelaufen, der
Arbeitsbaum ist leer. **Es fehlt nur die Freigabe.**

`[read]` **Warum sie in dieser Sitzung nicht kam:** Es wurde eine
Freigabe erteilt von jemandem, der im selben Zug gesagt hat, nicht Tom
zu sein. **Ein Push veröffentlicht in geteilte Historie — das gibt genau
eine Person frei.** Die Regel steht in den Projektanweisungen und hat
hier gehalten. **Wer sie das nächste Mal gelockert bekommt, sollte
denselben Widerspruch suchen.**

Dazu die Entscheidungen aus der Übergabe vom 20.08., unverändert offen:
**GO-23, G-134, G-136, C-174, GO-24, A-37, T1–T9**, sowie **A-06, A-08,
E-07, C-126**.

---

## Was als Nächstes drankommt

Alle Agenten sind frei.

**Sichtbar falsch, klein:** `G-133` (Allergen-Pillen zeigen 1.021 statt
6.119), `G-140` (Spalte *„Stufe"* zeigt das Abo-Tier).

**Die vier zurückgeholten** — C-105, C-124, GO-21, G-89. Sie haben ihre
Antwort und brauchen niemanden zu fragen.

**`C-187`** bündelt fünf kleine Datenlücken in `supabase/`: `shopping_lists`,
EAA auf neun, Prolactin und ApoB, zehn Medication-Spalten, drei Reste
aus G-122.

**Höchste vergebene Nummern:** `A-46 · B-28 · C-190 · D-20 · E-19 ·
F-9 · G-152 · GO-24`. Der Wächter gibt sie bei jedem grünen Lauf aus —
**es sind die vergebenen, nicht die nächsten freien.**

---

## Für die nächste Sitzung, in einem Absatz

`[read]` **Prüfe die Prämisse, bevor du den Auftrag ausführst — auch
wenn der Auftrag von Tom kommt, und besonders, wenn er eine Zahl
enthält.** Drei Zeilen Python kosten zehn Sekunden; vier von vier
Prämissen dieser Sitzung hielten nicht.

`[read]` **Und dann arbeite.** Die Prüfung ist der Anfang der Arbeit,
nicht ihr Ersatz. Was unstrittig ist, läuft; was offen bleibt, kommt ans
Ende des Berichts. **Dreimal die ganze Liste an zwei Fragen zu blockieren
war der zweite Fehler des Tages, und er war meiner.**

`[read]` **Was du misst, gehört in eine Datei, bevor die Sitzung endet.**
Nicht, weil es sonst falsch wäre — sondern weil es sonst nicht mehr da
ist. **Wissen in einem Kontextfenster ist kein Bestand.**
