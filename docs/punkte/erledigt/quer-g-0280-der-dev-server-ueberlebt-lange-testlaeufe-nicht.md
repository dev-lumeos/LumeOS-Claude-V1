---
nr: G-280
typ: befund
modul: quer
schwere: mittel
angelegt: 2026-08-30
braucht: []
kind_von: G-277
entscheidung: null
agent: codex
beauftragt: 2026-08-30
erledigt: 2026-08-30
commit: OFFEN
beruehrt:
  dateien:
    - tools/server.py
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

### Noch einmal eingetreten, 2026-08-30

`[cmd]` **Waehrend A-29 die Schirmlaufzeit mass, starb der Server
zweimal** — `ERR_CONNECTION_REFUSED`. **Erst nach `server.py start`
und Wartezeit kamen die Zahlen zustande.**

`[cmd]` **Und die Zahlen sind der Grund, warum es zaehlt:** 11,7 s je
Schuss, **7,8 Minuten fuer alle Reiter gegen etwa eine Minute fuer den
ganzen uebrigen Gate.**

`[read]` **Claude Code hat daraus geschlossen, dass ein solcher Test
nicht in den Gate gehoert** — **richtig.** `[read]` **Aber der Grund
dafuer ist zur Haelfte dieser Punkt hier.**

### Toms Frage vom 2026-08-30

*,,wieso arbeiten die nicht auf einem eigenen port? und meiner wird
updated zb von dir wenn es aenderungen hat?"*

`[cmd]` **Eigene Ports gab es — sie waren die Ursache.** Die
Kopfzeile von `server.py` beschreibt es: **fuenf Instanzen auf 3200,
3201, 3205, 3207, 3310**, weil Next stumm ausweicht. **Jeder Edit
kompilierte fuenffach.**

`[read]` **Der Port war nie das Problem, der geteilte Quellbaum ist
es.**

`[read]` **Toms zweiter Teil ist die eigentliche Frage:** ein Server,
der ihm gehoert, geschuetzt wie Admin (3210) und Coach (3220).

`[cmd]` **Und der Mechanismus dagegen existiert:** `LUMEOS_DIST_DIR`
trennt heute das Gate vom Dev-Server — `.next-gate` gegen `.next`.

**Zu messen, bevor gebaut wird:** `[read]` **halbieren zwei
Dev-Server mit getrennten Bauordnern die Watcher-Kosten wirklich, oder
laeuft die Dateiueberwachung unabhaengig vom Bauordner doppelt?**
`[cmd]` **Der 22.08.-Befund nennt beides in einem Satz** — Watcher und
Kompilierung — **ohne sie zu trennen.**

`[read]` **Wenn die Trennung traegt: ein geschuetzter Port fuer Tom.**
**Wenn nicht: sagen warum, und der eine Port bleibt.**

## Zu G-280 im Einzelnen

**Beauftragt am 2026-08-30.**

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

**Nachgemessen am 2026-08-30.** Der Punktname bleibt falsch:
der Server stirbt nicht an langen Laeufen. Er wird durch einen
expliziten Neustart beendet. Ein geschuetzter zweiter Web-Port wurde
nicht gebaut, weil er die bereits belegte Mehrfach-Beobachtung des
gleichen Quellbaums erneut einfuehren wuerde.

| Nachweis | Ergebnis |
|---|---|
| Starts in `backup/dev-server.log` | **18**, davon **6** am 30.08. |
| enge Startfolgen am 30.08. | 18:28:41 → 18:30:35 (**1:54 min**) und 20:09:56 → 20:12:06 (**2:10 min**); das Log kennt aber keinen Aufrufer, daher keine personenbezogene Zuschreibung |
| Fehler vor den Starts | keiner im Log; jeweils neue `===== Start ... =====`-Marke nach dem Beenden |
| aktueller Web-Server | genau ein Next-Prozess auf **3200**, PID 623864, **1.212 MB** RSS, gestartet 20:12:08 |
| aktuelle Belastbarkeit | `/login` antwortete mit **200 in 229 ms** |
| Gegenprobe `server.py start` | 18 Starts vor/nachher und dieselbe PID: ein gesunder 3200er bleibt bereits stehen |
| C-209 heute | `nutrition.reference_assessment_window_flags(uuid,date,integer)` ist live; der Nachweisaufruf liefert **10** Zeilen |
| Pipeline-Live-Stand | keine Pipeline-Schritt-ID oder Ausfuehrhistorie in der laufenden DB; nur die allgemeine Supabase-Migrationshistorie existiert |

### G-280 / B-25 - ein zweiter Port trennt nicht die Watcher

`LUMEOS_DIST_DIR` trennt den **Ausgabeordner**: Gate und Dev-Server
schreiben nicht beide nach `.next`. Er trennt weder die Quelldateien
noch ihre Beobachtung. Zwei `next dev`-Prozesse haben getrennten
Prozessspeicher und getrennte Watcher; jeder beobachtet `apps/web`
und kompiliert einen Edit selbst. Die historische Folge von fuenf
Instanzen auf 3200, 3201, 3205, 3207 und 3310 hat genau diese
Mehrfachkompilierung bereits gezeigt.

Eine neue Parallelinstanz nur zum Nachmessen waere daher kein
harmloser Versuch, sondern das Wiederherstellen des bekannten Schadens:
zusatzliche Watcher und ein weiterer Compiler auf dem gemeinsamen
Quellbaum. Sie wurde nicht gestartet. Die Trennung **traegt nicht**
im verlangten Sinn; sie verhindert nur `.next`-Kollisionen.

Toms Arbeitsweise ist bereits mit dem einen Port erreichbar:
`http://127.0.0.1:3200` aktualisiert sich bei Aenderungen aus dem
gemeinsamen Quellbaum per Dev-Server. Der vorhandene Befehl
`python tools/server.py start` ist dabei nicht zerstoererisch. Nur
`neustart` beendet absichtlich den gesunden 3200er via
`taskkill /T /F`. Ein zweiter Port wuerde dieses Eigentumsproblem
nicht loesen, sondern die Watcher-Kosten verdoppeln.

Die Messung reicht noch **nicht** fuer eine Schwelle
„ausgehungert“: 1,5 GB und 1,6 s wurden einmal vor einem Neustart
beobachtet, der aktuelle, 1.212-MB-Prozess antwortet schnell. Es
fehlt ein Lauf ohne externe Neustarts mit Zeitreihe aus RSS,
Antwortzeit und Routenlast. Bis dahin waere eine harte Schwelle
selbst gesetzt.

### C-209 - Kette und laufende Datenbank haben keinen gemeinsamen Stand

Der konkrete Blocker von G-273 ist erledigt: die in der Kette
vorhandene Funktion `reference_assessment_window_flags` ist jetzt
live und liefert im Nachweisaufruf zehn Flag-Zeilen.

Das Grundproblem bleibt messbar: `supabase/_pipeline/kette.json`
ist ein lokales Manifest, aber kein Schritt schreibt seine ID,
Pruefsumme oder Ausfuehrzeit in die laufende Datenbank. Die vorhandene
`supabase_migrations.schema_migrations`-Historie kann nur
Migrationen bezeugen, nicht die Pipeline. Damit kann weder ein
Kettenschritt „noch nicht live“ melden noch die Live-Instanz sagen,
bis zu welchem Kettenschritt sie reicht.

Eine allgemeine Loesung braucht einen expliziten, transaktional mit
jedem Pipeline-Schritt fortgeschriebenen Ausfuehrnachweis plus
Nachweis- und Rückstandsanzeige. Das ist eine neue
Pipeline-Protokollierung, nicht die Reparatur eines einzelnen
fehlenden Objekts; sie wurde nicht nebenbei erfunden oder gebaut.

**Ergebnis:** Kein geschuetzter zweiter Web-Port. Der gesunde
gemeinsame 3200er wird bereits von `start` geschont; die
zerstoererische Handlung ist nur `neustart`. Der naechste
Bauauftrag kann entweder die Neustart-Autoritaet/Protokollierung oder
die allgemeine Pipeline-Live-Protokollierung entscheiden.

## Abnahme

**2026-08-30, Orchestrator.**

### Kein zweiter Port — und der Grund ist gemessen

`[cmd]` **Getrennte `distDir` verhindern nur `.next`-Kollisionen.**
`[cmd]` **Zwei `next dev`-Prozesse beobachten und kompilieren
denselben Quellbaum weiter doppelt.**

`[read]` **Damit ist Toms Frage beantwortet, und die Antwort ist
Nein** — **nicht weil es umstaendlich waere, sondern weil es nichts
loest.**

`[cmd]` **Und der wichtigere Teil: `server.py start` schont einen
gesunden Server bereits.** `[cmd]` **18 Starts vor und nach der
Gegenprobe unveraendert.**

`[read]` **Tom kann 3200 weiter benutzen, Aenderungen erscheinen
automatisch.** **Was ihn abschiesst, ist `neustart`, nicht `start`.**

### C-209 ist live behoben

`[cmd]` **`reference_assessment_window_flags` existiert und liefert 10
Zeilen.** `[read]` **Der konkrete Blocker, der am 30.08. G-273
aufgehalten hat, ist weg.**

`[read]` **Was offen bleibt, ist der allgemeine Nachweis:** `[cmd]`
**die Datenbank fuehrt keine Pipeline-Historie** — **es gibt keine
Stelle, die sagt, welche Kettenschritte live sind.**

`[read]` **Das ist ein groesserer Punkt als der behobene Fall.** **Als
C-361 angelegt.**

**Abgenommen.**

