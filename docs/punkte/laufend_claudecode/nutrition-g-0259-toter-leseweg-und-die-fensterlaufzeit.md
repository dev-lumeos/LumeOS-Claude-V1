---
nr: G-259
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-08-29
braucht: []
kind_von: C-323
entscheidung: null
agent: claudecode
beauftragt: 2026-08-29
beruehrt:
  dateien: [apps/web/src/lib/nutrition]
zahlen:
  gemessen: 2026-08-29
  fensterlaufzeit_90d_ms: 1786
  billiger_weg_ms: 195
---

# G-259 — toter Leseweg und die Fensterlaufzeit

## Zwei Befunde aus C-323

`[cmd]` **`getNaehrstoffZeitraum` hat keinen Aufrufer** — **und
traegt die G-249-Falle:** `.limit(20000)` fuer 12.420 Zeilen, ohne
seitenweises Laden. `[read]` **Heute harmlos, weil nichts sie
aufruft.** `[read]` **A-59 sagt loeschen:** Code ohne Aufrufer wird
beim naechsten Auftrag fuer gebaut gehalten — **und dieser traegt
zusaetzlich einen bekannten Defekt.**

`[cmd]` **`reference_assessment_window` kostet 1.786 ms fuer 90
Tage.** `[cmd]` **Die Kosten liegen in der Rechnung, nicht in der
Datenmenge** — Filtern spart nichts.

`[cmd]` **Ein billigerer Weg existiert bei 195 ms**, wuerde aber die
Referenzlogik nachrechnen. `[read]` **Beide Dateikoepfe verbieten
das** — es waere die zweite Wahrheit, die G-250 offenhaelt.

## Die Frage

`[read]` **Sind 1.786 ms fuer eine Flag-Ansicht vertretbar, oder
braucht es eine zaehlende Funktion in der Datenbank?**

`[read]` **Der Unterschied zum billigen Weg:** eine zaehlende
Funktion wuerde dieselbe Referenzlogik nutzen und nur weniger
zurueckgeben. **Das ist etwas anderes als sie nachzubauen.**

## Auftrag — die Ladezeit, drei Punkte

**Mitbeauftragt: G-252, G-260.** Bericht in diese Datei.

### Vorweg

`[read]` **Dieser Auftrag traegt keine Zahlen vom Orchestrator.**
`[cmd]` **Die Zahlen im Befundteil hast du selbst gemessen** — in
C-323 und G-108. **Pruef sie trotzdem nach; sie sind aelter als deine
letzte Aenderung am Reiter.**

`[read]` **Und eine Ursache habe ich schon einmal falsch benannt:**
`[cmd]` **G-252 existiert, weil ich die 6,4 Sekunden einer
RPC-Schleife zugeschrieben habe, die es nicht gibt.** Codex hat es in
G-107 gemessen. **Diesmal misst du zuerst.**

### 1 · G-252 — woran liegt die Ladezeit?

`[cmd]` **Der Reiter braucht 5.906 ms warm bei `fenster=90`.**

`[read]` **Kandidaten, ungeordnet und ungemessen** — das ist eine
Liste, keine Vermutung, die du bestaetigen sollst:

    die Menge der geladenen Zeilen (138 x 90)
    das seitenweise Laden seit G-249
    reference_assessment_window (1.786 ms fuer 90 Tage, C-323)
    die Baumberechnung im Browser
    etwas, das hier nicht steht

`[cmd]` **`nutrition.reference_assessment_window()` existiert seit
G-107** und koennte Teil der Antwort sein. `[read]` **Ob der Leseweg
sie ueberhaupt nutzt, ist Teil der Messung.**

### 2 · G-259 — der tote Leseweg

`[cmd]` **`getNaehrstoffZeitraum` hat keinen Aufrufer und traegt die
G-249-Falle:** `.limit(20000)` fuer 12.420 Zeilen, ohne seitenweises
Laden.

`[read]` **A-59 sagt loeschen** — Code ohne Aufrufer wird beim
naechsten Auftrag fuer gebaut gehalten, **und dieser traegt
zusaetzlich einen bekannten Defekt.**

`[read]` **Loeschen, wenn nichts darauf zeigt.** Der Typecheck
belegt es, wie in G-255.

### 3 · G-260 — die Dauerregel, wenn es traegt

`[cmd]` **`flagVon` aus C-323 ist fertig, getestet, ohne Aufrufer,
und kostet 1.786 ms fuer 90 Tage.**

`[read]` **Du hast sie in G-108 absichtlich nicht angebunden, weil
zusammen rund 7,7 s herauskamen und C-189 neun Sekunden als Defekt
behandelt hat.** **Das war richtig.**

`[read]` **Wenn der Reiter nach Teil 1 schneller ist: anbinden und
messen.** **Wenn nicht: nicht anbinden und sagen, was fehlt.**

`[cmd]` **Was sie behebt, ist gemessen:** der `Auffaellig`-Filter
liefert bei 7, 30 und 90 Tagen dieselben zwoelf Codes. **Der
Zeitraumwaehler aendert die Zahlen, nicht die Auswahl.**

### Was nicht zu tun ist

**Die Referenzlogik nicht nachrechnen.** `[cmd]` **Ein billigerer Weg
existiert bei 195 ms, wuerde sie aber nachbauen** — **beide
Dateikoepfe verbieten das**, und es waere die zweite Wahrheit, die
E-31 gerade zurueckgestellt hat.

`[read]` **Eine zaehlende Funktion, die dieselbe Logik nutzt und
weniger zurueckgibt, ist etwas anderes** — die waere zulaessig, aber
sie gehoert Codex.

**Keine zweite Ansicht neben eine bestehende.**
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    Ladezeit je Zeitfenster     ms, kalt und warm, vorher / nachher
    Ursache                     benannt und belegt, oder als
                                unklar gemeldet
    getNaehrstoffZeitraum       geloescht, Typecheck belegt es
    Dauerregel                  angebunden oder begruendet nicht
    Auffaellig je Zeitraum      aendert sich die Auswahl jetzt?
    Attrappen                   am Schirm gezaehlt (A-59)

`[read]` **Die zweite Zeile darf *unklar* lauten** — das ist besser
als eine plausible Erklaerung ohne Beleg. **Genau das hat Codex in
G-107 richtig gemacht.**

### Regeln

`tools/lauf.py`, keine Konsolenfenster.
`[cmd]` **Der Dev-Server beendet sich von selbst** (G-205) — in
G-108 hast du ihn richtig ueber `tools/server.py` neu gestartet.
`[cmd]` **Eine Messung vor dem Neukompilieren zeigt alte Zahlen.**
`[cmd]` **A-30, A-59, A-60.** `[cmd]` **`.limit()` hebt den
PostgREST-Deckel nicht auf.**

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
