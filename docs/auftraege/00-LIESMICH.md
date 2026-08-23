# Auftraege — was verlangt wurde

**Angelegt 2026-08-23** auf Toms Vorgabe: *„ich moechte einfach die
history sauber haben und dazu gehoert auch der auftrag der verloren geht
wenn ich claude wechsle."*

## Wozu

`docs/berichte/` sagt, was der Agent gemeldet hat.
`docs/ssot/` sagt, was der Orchestrator geprueft hat.
**Hier steht, was verlangt wurde.** Erst zu dritt ist die Geschichte
vollstaendig.

`[cmd]` **Der Anlass ist ein Fall aus derselben Sitzung.** C-245 haelt
fest, dass eine Dublette auf dem Nachweiskonto aus dem *Auftragstext*
stammte und nicht aus der Umsetzung: dort stand *„mindestens zwei
Positionen mit gesetzter `supplement_id`"* statt *„umhaengen"*. Codex
hat gebaut, was dastand. **Belegbar war das nur, weil das Gespraech noch
offen war** — in der naechsten Sitzung waere es Behauptung gegen
Behauptung gewesen.

`[read]` Dazu derselbe Verlustgrund wie bei den Berichten: Anhangsinhalt
faellt in langen Gespraechen zuerst weg, und ein Auftrag ist laenger als
ein Bericht.

## Der Commit ist das „rausgegangen"

**Die Datei liegt ungestaged, solange sie ein Entwurf ist.**
**Sie wird committet, wenn Tom „laeuft" sagt.**

`[read]` **Das ersetzt eine Regel, die sich nicht erzwingen liess.**
Bisher galt: in `LAUFEND.md` eintragen, wenn der Auftrag rausgeht, nicht
wenn er geschrieben ist — `[cmd]` C-164 stand einmal falsch als laufend,
weil der Text erst am Abend rausging. Jetzt traegt der Commit den
Zeitstempel, und niemand pflegt ihn von Hand.

`[read]` **Nebenwirkung, die zaehlt:** der Agent liest die Fassung, die
freigegeben wurde, nicht einen Zwischenstand.

## Wer wo nachsieht

**Der Agent bekommt einen Einzeiler:** *lies
`docs/auftraege/<datei>` und arbeite ihn ab.*

**Der Orchestrator sieht in `docs/berichte/` nach, statt auf eine Kopie
zu warten.** `[cmd]` Am 2026-08-23 lag der C-243-Bericht bereits im
Repo, und Tom hat ihn trotzdem in den Chat kopiert, weil der
Orchestrator nicht von selbst nachsah. **Ein laufender Auftrag ist
Anlass genug, das Verzeichnis zu pruefen** — beim Sitzungseinstieg und
bei jedem weiteren Anlass.

`[read]` **Ein echter Poll ist das nicht.** Der Orchestrator laeuft nur,
wenn Tom schreibt. Was er kann, ist zuerst nachsehen statt zuerst
fragen; das reicht, damit Tom nichts mehr hin- und herkopiert.

## Regeln

**Der Orchestrator schreibt, der Agent liest.**

**Dateiname:** `c-245-codex.md`, `g-163-fable.md`. Kleinschreibung,
Bindestriche, wie in `docs/berichte/`.

**Eine Nummer, ein Auftrag, ein Punkt in `docs/todo/TODO.md`.**
`[cmd]` Eine Nummer im Auftrag ohne Punkt im Register ist verloren — so
ist C-186 verschwunden.

**Nachtraeglich wird hier nicht geglaettet.** Stellt sich heraus, dass
der Auftrag falsch war, bleibt er stehen; die Korrektur steht im Punkt
und im SSOT. **Ein nachgebesserter Auftrag verdeckt genau den Fehler,
den dieser Ordner sichtbar machen soll.**

**Encoding:** `utf-8`, `newline="\n"`, kein BOM.

## Was in jeden Auftrag gehoert

    WAS ICH GEMESSEN HABE   [cmd]-Zahlen mit Stichtag, gegen die der
                            Agent prueft
    WAS ZU TUN IST
    WAS NICHT ZU TUN IST    Bereiche anderer Agenten, offene
                            Entscheidungen
    NACHWEIS                Erwartung VOR dem Lauf, beide Richtungen
    BERICHT                 Zielpfad in docs/berichte/
    REGELN                  server.py, lauf.py, nicht committen

Bei Pipeline-Auftraegen zusaetzlich: Wegwerf-Datenbank, Sicherung,
Kettenlauf, **und live einspielen** mit Vollsicherung davor.

### `[cmd]` heisst gemessen, nicht abgeschrieben

**Tom, 2026-08-23:** *„wieso lieferst du falsche auftraege wenn alle
fakten hast?"*

`[cmd]` **Drei Zahlen in C-252 waren falsch** — 44 statt 33 Tabellen,
17 statt 15 Spalten, `name_de` ist `NULL` statt `''`. **Der
Orchestrator hatte sie aus der Spec abgeschrieben statt gezaehlt**,
obwohl in derselben Sitzung die Regel stand, die Spec pruefend zu
lesen.

`[cmd]` **Und G-149 stand im Auftrag mit verdrehter Richtung** — der
Punkt hatte es seit dem 2026-08-21 richtig: es bucht auf den letzten
protokollierten Tag, nicht auf heute. **Der Orchestrator hatte den
Punkt nicht aufgeschlagen und die Richtung aus dem Titel geraten.**

**Daraus zwei Regeln:**

**Die `[cmd]`-Zahlen im Auftrag stammen aus einem Befehl derselben
Runde**, nicht aus einem Dokument und nicht aus dem Gespraechsverlauf.
Was nicht gemessen ist, steht als `[annahme]` da — dann weiss der
Agent, dass er es pruefen muss.

**Wer einen Punkt beauftragt, liest den Punkt.** Der Titel im Register
ist eine Zeile; die Begruendung darunter traegt die Richtung.

`[read]` **Beides kostet zwei Minuten und hat zweimal Agentenzeit
gekostet.** Der Ordner hier macht es sichtbar: Auftrag und Bericht
stehen nebeneinander, und wo der Bericht widerspricht, ist der Auftrag
nachlesbar.


`[read]` **Melden, nicht entscheiden:** Wenn eine Vorgabe nicht aufgeht,
meldet der Agent es, statt sie passend zu machen. `[cmd]` Das hat
mehrfach Fehler des Orchestrators aufgedeckt — 1.185 statt 1.119,
„26 Tabellen" statt 33, 0,80 statt 0,85 bei WHR, und zuletzt Magnesium
und Vitamin D3 in C-243.

## Was hier fehlt

`[read]` **Alles vor dem 2026-08-23.** Rund 290 erledigte Punkte sind
ohne Auftragsdatei entstanden; was von ihnen geprueft wurde, steht in
`docs/todo/ERLEDIGT.md` und `docs/ssot/`. **Rueckwirkend rekonstruiert
werden sie nicht** — ein aus dem Gedaechtnis nachgeschriebener Auftrag
waere genau die Selbstauskunft, gegen die dieser Ordner gebaut ist.

`[cmd]` **Die ersten beiden Dateien sind `c-245-codex.md` und
`c-246-codex.md`.** Sie sind am 2026-08-23 rausgegangen und im Wortlaut
uebernommen, nicht nachgeschrieben. C-243 und alles davor liegt nur im
Gespraechsverlauf.
