---
nr: G-280
typ: befund
modul: quer
schwere: mittel
angelegt: 2026-08-30
braucht: []
kind_von: G-277
entscheidung: null
beruehrt:
  dateien: [tools/server.py]
zahlen:
  gemessen: 2026-08-30
  speicher_gb: 1.5
  login_ms: 1600
---

# G-280 — der Dev-Server ueberlebt lange Testlaeufe nicht

## Befund

Aus G-277, Claude Code, 2026-08-30.

`[cmd]` **Der Server musste waehrend eines Auftrags mehrfach neu
gestartet werden.** `[cmd]` **Vor dem Neustart: 1,5 GB Speicher,
`/login` in 1,6 Sekunden.**

`[cmd]` **G-205 kennt das Beenden von selbst.** `[read]` **Hier ist es
anders: er laeuft weiter und wird langsam.**

## Warum es zaehlt

`[read]` **Jede Messung gegen einen ausgehungerten Server ist
wertlos** — **und man sieht ihm nicht an, dass er es ist.**

`[cmd]` **Claude Code hat alle Zahlen des Auftrags gegen einen frisch
gestarteten Server gemessen und es dazugesagt.** `[read]` **Das ist
die richtige Handhabung, aber sie haengt daran, dass jemand daran
denkt.**

## Zu messen

**Ab wann wird er langsam, und woran liegt es?**

`[read]` **Kandidaten:** die Zahl der kompilierten Routen, offene
Datenbankverbindungen, der Speicher selbst. `[read]` **Und ob
`tools/server.py` einen Zustand melden kann, der *,,ausgehungert"*
heisst** — dann waere die Handhabung nicht mehr auf Aufmerksamkeit
angewiesen.

## Berichtigt, 2026-08-30 — die Beschreibung war falsch

**Tom:** *,,wieso schiesst immer irgendwas den server ab?"*

`[cmd]` **Nachgemessen in `backup/dev-server.log`: 18 Starts, sechs
davon heute.** `[cmd]` **Vor jedem der letzten vier steht kein Fehler,
kein Absturz, keine Meldung:**

    ? Ready in 1658ms
    ? Compiled /src/middleware in 90ms
    ? Compiled /login in 2.9s
    ===== Start 2026-08-30 20:09:56 =====

`[read]` **Er stuerzt nicht ab. Er wird beendet.**

`[cmd]` **`server.py neustart` ruft `aufraeumen(auch_3200=True)`, und
das fuehrt `taskkill /T /F` auf Port 3200 aus.**

`[read]` **Jeder Agent, der neu startet, schiesst den Server des
anderen ab.** `[cmd]` **Und `CLAUDE.md` sagt: *,,Zwei Agenten in
`apps/web` teilen sich die Browsersitzung"*** — **sie teilen sich auch
den Server.**

`[cmd]` **Der Speicher ist es nicht: 129 GB frei von 255.** `[cmd]`
**Die 1,5 GB sind fuer einen Dev-Server mit 4.243 kompilierten Modulen
normal.**

`[read]` **Der Punkt hiess *,,ueberlebt lange Testlaeufe nicht"*. Das
ist die falsche Beschreibung.** **Die richtige Frage ist: wie teilen
sich zwei Agenten einen Server, ohne sich gegenseitig abzuschiessen?**

## Auftrag — die Arbeitsumgebung sagt ihren Zustand

**Mitbeauftragt: B-25, C-209.**

`[read]` **Drei Befunde, ein Thema: die Umgebung sagt nicht, in
welchem Zustand sie ist.**

    G-280   der Server wird beendet, und niemand merkt es
    B-25    zwei Agenten teilen sich apps/web
    C-209   die Kette ist gruen, die Aenderung ist nicht live

`[cmd]` **Der dritte hat am 30.08. G-273 blockiert** —
`reference_assessment_window_flags` lag 78 Zeilen in der Kette und war
nie eingespielt. `[read]` **Claude Code hat es gefunden, weil er
gegen `pg_proc` geprueft hat, bevor er baute.** **Ohne diese Gewohnheit
haette er eine tote Funktion gerufen.**

## Zu G-280 im Einzelnen

`[read]` **Vorbereitet am 2026-08-30.**

### Das Ergebnis

`[read]` **Nach diesem Auftrag sagt `tools/server.py`, ob der Server
noch belastbar ist** — **statt dass jemand daran denken muss.**

### Warum es zaehlt

`[cmd]` **Claude Code musste ihn am 30.08. mehrfach neu starten.**
`[cmd]` **Vor dem Neustart: 1,5 GB, `/login` in 1,6 Sekunden.**

`[read]` **Jede Messung gegen einen ausgehungerten Server ist wertlos,
und man sieht ihm nicht an, dass er es ist.** `[read]` **Er hat alle
Zahlen gegen einen frischen gemessen und es dazugesagt** — **richtig,
aber es haengt an seiner Aufmerksamkeit.**

### Was zu messen ist

**Wie oft wird der Server beendet, waehrend ein anderer Agent ihn
braucht?**

`[cmd]` **Der Log traegt Zeitstempel je Start.** `[read]` **Halte sie
gegen die Auftragszeiten der beiden Agenten** — **wenn zwei Starts
dicht beieinander liegen, hat einer den anderen erwischt.**

**Und erst danach: ab wann wird er langsam, wenn er in Ruhe
gelassen wird?**

`[read]` **Kandidaten, ungeordnet:** Zahl der kompilierten Routen,
offene Datenbankverbindungen, Speicher, etwas anderes.

`[read]` **Und *,,unklar"* ist eine zulaessige Antwort**, wenn sie
sagt, was ausgeschlossen wurde. `[cmd]` **In G-252 waren fuenf
Kandidaten falsch und die Ursache stand auf keinem.**

### Was zu bauen ist, wenn die Messung es traegt

`[cmd]` **`tools/server.py` kennt `status`.**

`[read]` **Die kleinste nuetzliche Ergaenzung waere, dass `start`
einen laufenden gesunden Server erkennt und ihn stehen laesst**,
statt ihn zu beenden und neu zu starten.

`[cmd]` **`aufraeumen` unterscheidet heute nicht zwischen *,,Duplikat"*
und *,,laeuft und antwortet"*.**

`[read]` **Kein automatischer Neustart, und kein Sperrmechanismus, der
einen Agenten blockiert** — **die Frage ist nur, ob ein gesunder
Server ueberlebt.**

### Was nicht zu tun ist

**Kein `.next` loeschen, kein `next build` direkt.**
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    Starts im Log        wie viele, wie dicht beieinander
    gegenseitig           wie oft hat ein Agent den anderen
                          erwischt
    start bei gesundem    laesst er ihn stehen? gebaut
      Server
    Gegenprobe            ein toter Server wird weiter ersetzt
    Schwelle              ab wann wird er langsam, wenn niemand
                          ihn beendet

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
