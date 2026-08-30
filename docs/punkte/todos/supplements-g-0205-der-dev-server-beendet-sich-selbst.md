---
nr: G-205
typ: messung
modul: supplements
schwere: mittel
angelegt: 2026-08-27
braucht: []
kind_von: null
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: ["docs/punkte/00-LIESMICH.md"]
zahlen: null
---

# G-205 - Der Dev-Server beendet sich selbst

## Befund

(neu 2026-08-27,
  **korrigiert**). Aus G-203, und aus G-200.

  `[read]` **Berichtigung meiner ersten Fassung.** Ich hatte die fuenf
  Starts am 27.08. als *,,Wiederholung"* gelesen und Claude Code
  unterstellt, er starte ohne Not neu. `[cmd]` **Das war falsch** —
  der Server geht von selbst aus, die Starts waren die Antwort
  darauf.

  `[cmd]` **Belegt am Log:** fuenf Starts (07:23, 07:25, 07:29, 07:33,
  07:35), **und nach dem letzten kein sechster** — trotzdem lauscht
  auf 3200 nichts mehr. **Das Log endet ohne Fehler**, letzte Zeile
  eine gewoehnliche Neuuebersetzung, dann `[?25h`: die Terminalfolge,
  die ein Prozess beim **Beenden** schreibt. Kein Absturz.

  `[cmd]` **Dieselbe Beobachtung in G-200** — PID 351936 verschwand
  ebenso spurlos. **Zweimal an zwei Tagen.**

  `[cmd]` **Claude Codes Messung dazu:** Tod nach 30-60 Sekunden,
  90 Sekunden ohne jeden Zugriff ueberlebt er; die Todesfaelle fallen
  mit `server.py status` und mit Neuuebersetzungen zusammen.

  `[annahme]` **Ein Ansatz, der zu pruefen waere:** `server.py start`
  setzt `DETACHED_PROCESS | CREATE_NO_WINDOW |
  CREATE_NEW_PROCESS_GROUP`, **aber nicht `CREATE_BREAKAWAY_FROM_JOB`.**
  Windows-Job-Objects reissen alle Prozesse mit, wenn der Job
  geschlossen wird — **`DETACHED_PROCESS` schuetzt davor nicht.** Wenn
  die Sitzung des Agenten in einem Job laeuft, erklaert das den Tod
  kurz nach Rueckkehr des Startbefehls. **Gemessen ist das nicht, es
  ist ein Pruefvorschlag.**

  `[read]` **Und die Messhygiene, die davon uebrig bleibt:** ein
  Neustart wirft den Uebersetzungsstand weg. `[cmd]`
  `/api/messung-g203` lief kalt dreimal mit 4.205 / 4.406 / 4.045 ms
  und warm dreimal mit **298 / 292 / 297** — **Faktor 14.**
  `/v2/supplements` brauchte kalt 8.050 ms. **Laufzeitmessungen
  brauchen einen warmen Server; der erste Lauf je Route wird
  verworfen.** Gehoert nach `docs/punkte/00-LIESMICH.md`.
