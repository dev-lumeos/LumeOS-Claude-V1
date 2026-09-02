---
nr: C-170
typ: befund
modul: quer
schwere: mittel
angelegt: 2026-08-20
braucht: []
kind_von: null
kinder: []
entscheidung: E-60
erledigt: 2026-09-02
commit: f38363c5
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# C-170 - Der Offline-Betrieb steht im Entwurf

## Befund

(neu 2026-08-20).
  Aus SSOT 173.

  `[cmd]` **`IDB_STORES`, `OUTBOX`, `SYNC_LOG`** — IndexedDB-Speicher,
  Warteschlange, Abgleichsprotokoll.

  `[cmd]` **G-86 meldet:** *„keine Warteschlangentabelle, `logged_via`
  auf 101 von 101 Zeilen `manual` — erst die Faehigkeit, dann die
  Anzeige."* **Die Faehigkeit ist entworfen.**

## Auftrag

**Mitbeauftragt mit C-110 am 2026-09-02.** Der Auftragstext
und der Bericht stehen dort.

## Gemessen am 2026-09-02: kein Offline-Betrieb vorhanden.

`[cmd]` **Kein IndexedDB, keine Outbox, kein Sync, keine
Konfliktaufloesung.**

`[read]` **Empfehlung: wie den Marktplatz fuer V1 zurueckstellen, mit
eigener formaler Entscheidung.**

`[read]` **Ein Entwurf, der im Bestand steht und nie zurueckgestellt
wurde, wird beim naechsten Auftrag fuer geplant gehalten.**

**Die Entscheidung gehoert Tom.**

## Abnahme

**2026-09-02, durch E-60 beantwortet.**

Tom: *,,das eine ist diese webapp oder coach plattform oder
marketplace und das andere ist der zukuenftige buddy als app."*

    apps/web    online, ohne Vorbehalt
    apps/coach  online
    Marktplatz  online (E-37)
    Buddy       spaeter, als eigene App -- dort gehoert es hin

`[read]` **Eine Webapp offline zu machen ist Arbeit fuer nichts** —
**wer am Rechner sitzt, hat Netz.**

`[read]` **Und das ist keine Zurueckstellung, sondern eine
Entscheidung:** **`apps/web` bekommt keinen Offline-Betrieb, auch
spaeter nicht.**

`[read]` **Fuer Buddy gilt E-50** — **und `meals.entry_source` sowie
`entry_date` getrennt von `created_at` stehen bereits.**

**Geschlossen.**
