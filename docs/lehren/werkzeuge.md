# Werkzeuge, Server, Gate

Belege zu den Regeln in `CLAUDE.md`. **Wer eine Regel anwendet,
liest hier den Grund** ? die Regel allein sagt nicht, warum sie
entstanden ist.

## Kein Befehl aus dem Gedaechtnis

**Tom, 2026-09-08:** *,,deine scheissraterei muessen wir abstellen
und zwar sofort und zu 100%. sowas gibt es nicht, wir entwickeln
hier."*

`[cmd]` **Am 2026-09-08 hat der Orchestrator
`python tools/server.py aufraeumen` genannt, um den Server zu
stoppen.** `[cmd]` **`aufraeumen` laesst Port 3200 absichtlich in
Ruhe** (`auch_3200=False`) — **es passierte nichts.**

`[cmd]` **Der richtige Befehl steht in derselben Datei:
`neustart`** (`auch_3200=True`).

`[read]` **Vier Zeilen lesen haetten gereicht.**

### Die Regel

`[read]` **Ein Befehl wird gelesen, bevor er genannt wird** —
**nicht aus dem Gedaechtnis, nicht nach dem Namen.**

`[read]` **Ein Werkzeug hat eine Datei. Die Datei sagt, was es
kann.**

`[cmd]` **Dieselbe Klasse wie die Auswahlliste in G-373**, die
Claude Code aus dem Gedaechtnis schrieb: **`night` stand drin, der
CHECK lehnte es ab.** `[read]` **Seine Lehre: *,,Eine Auswahlliste
ist ein Versprechen."***

`[read]` **Ein Befehl auch.**

## Der Dev-Server stirbt mit der Agentensitzung

**2026-09-08, gemessen.** `[cmd]` **Der Server ist ein Enkel von
`claude.exe`** — `claude.exe -> bash -> bash -> bash -> python`.

`[cmd]` **Windows raeumt beim Sitzungsende den ganzen Prozessbaum
ab.** `[cmd]` **`DETACHED_PROCESS | CREATE_NEW_PROCESS_GROUP` loest
nur die Konsole, nicht das Job Object.**

`[cmd]` **44 Startmarken im Log** — **jede Sitzung startete ihn neu.**

### Die Loesung: Tom startet ihn einmal selbst

    python tools/server.py start

`[read]` **In Toms eigener Konsole** — **dann lebt er in dessen
Baum und ueberlebt jede Agentensitzung.**

### Fuer Agenten

`[read]` **Wenn der Server nicht laeuft: NICHT suchen, sondern
sagen.**

`[read]` **Ein Neustart aus der Agentensitzung haelt bis zum
Sitzungsende** — **er ist eine Kruecke, keine Behebung.**

`[cmd]` **Und `.next/cache/webpack` ist eine andere Ursache** —
**dort steht `hasStartTime` im Log, hier endet es sauber.**

## Der Webpack-Cache kann den Server toeten

`[cmd]` **2026-09-08:** `Restoring pack from
.next/cache/webpack/client-development.pack.gz failed: TypeError:
Cannot read properties of undefined (reading 'hasStartTime')`

`[read]` **Der Server erreicht *Ready* und stirbt Sekunden spaeter
beim ersten Kompilieren.** `[read]` **`status` sagt *keiner
laeuft*, das Log zeigt einen erfolgreichen Start** — **beide haben
recht.**

`[cmd]` **Behebung: NUR `.next/cache/webpack` loeschen** — **103
Dateien, 0,18 GB.** `[cmd]` **Nicht `.next` selbst** (B-18/G-109).

`[read]` **Vorher pruefen, dass der Server steht** — **und dass
kein anderer Prozess `apps/web/.next` beruehrt.**

## Nur ein Agent fasst den Dev-Server an

**Tom, 2026-08-30:** *,,dann musst du deine auftraege so steuern dass
nicht beide agents neustarts generieren"*.

**Der UI-Agent darf. Codex nie.**

`[read]` **Der Grund ist der Bedarf, nicht die Rangfolge:** `[cmd]`
**Codex arbeitet in `supabase/_pipeline/` und braucht keinen
Browser.** `[cmd]` **Der UI-Agent braucht ihn fuer `schuss.mjs` —
Bildschirmfotos, Attrappenzahl, Ladezeit.**

### Was gemessen wurde

`[cmd]` **18 Starts im Log, sechs an einem Tag.** `[cmd]` **Vor keinem
ein Fehler** — `server.py neustart` fuehrt `taskkill /T /F` auf Port
3200 aus, **und beide Agenten teilen sich `apps/web`.**

`[cmd]` **Getrennte Ports loesen es nicht:** zwei `next dev`-Prozesse
beobachten und kompilieren denselben Quellbaum doppelt, **egal welcher
Bauordner** (G-280).

`[cmd]` **Aber `server.py start` schont einen gesunden Server
bereits** — **18 Starts vor und nach der Gegenprobe unveraendert.**

### Was in den Auftrag gehoert

**An Codex, in jeden Auftrag:**

    Der Dev-Server gehoert dir nicht. Kein `server.py neustart`,
    kein `start`, kein `aufraeumen`. Wenn eine Messung ihn braucht:
    melden, nicht starten.

**An den UI-Agenten:**

    Der Dev-Server gehoert dir. `server.py start` bevorzugen -- er
    laesst einen gesunden stehen. `neustart` nur, wenn `start` nicht
    reicht.

`[read]` **Und Tom benutzt 3200 mit** — **Aenderungen erscheinen dort
automatisch.** **Wer neu startet, unterbricht ihn.**

## Wegwerf-Datenbank zum Pruefen, laufende Instanz zum Abschliessen


`[cmd]` **Am 2026-08-22 lagen sechs Auftraege committet und nicht
eingespielt:** C-191, C-192, C-195, C-196, C-197, C-215. Live 31
Spalten, committet 63. Eine ganze Woche Arbeit war auf Toms Rechner
nie sichtbar.

`[read]` **Der Fehler war der des Orchestrators.** In jedem
Pipeline-Auftrag stand *„Wegwerf-Datenbank, danach verwerfen"* \u2014
richtig, aber **es stand nie ein Schritt danach.** Der Auftrag endete
beim gruenen Kettenlauf auf einer Datenbank, die anschliessend
geloescht wird. Codex hat jedes Mal genau das getan, was dastand.

`[read]` **Und die Pruefung war formal richtig, inhaltlich blind:**
gemessen wurde, dass *das Skript* 60 Spalten erzeugt. Im C-195-Abschluss
steht *„Live-Datenbank unberuehrt: 31 Spalten"* sogar als **Beleg fuer
saubere Arbeit**. Aufgefallen ist es Fable, als es etwas anzeigen
wollte.

**Deshalb: Ein Pipeline-Auftrag ist nicht fertig, wenn die Kette gruen
laeuft \u2014 sondern wenn die Aenderung dort ist, wo Tom sie sieht.** Der
Auftrag nennt beide Schritte oder er ist unvollstaendig geschrieben.

**Und vor dem Einspielen steht eine Sicherung, die zurueckgespielt
wurde.** `[cmd]` Ein Volldump mit `auth`-Schema, geprueft durch
Restore auf eine Wegwerf-Instanz, mit gezaehlten Zeilen UND Policies \u2014
`pg_restore` laesst Policies sonst still fallen. **Ein ungepruefter
Dump ist kein Backup:** der Vollrestore vom 2026-08-22 scheiterte an
einem Supabase-internen `graphql_public.graphql`-GRANT und lief erst
mit `--no-privileges` durch. Das findet nur, wer es einmal tut.

## Keine Terminalfenster — und der Orchestrator haelt sich selbst daran

**Tom, 2026-08-19:** *,Diese scheiss Terminalfenster poppen immer noch
ueberall auf."*

`[cmd]` **Die Regel stand seit dem 2026-08-18 hier** — `shell=False`,
`shlex.split`, `STARTF_USESHOWWINDOW`, `CREATE_NO_WINDOW`. **Der
Orchestrator hat sie selbst nicht befolgt** und in jedem Pruefskript
`subprocess.run(..., shell=True)` benutzt.

### Die Hilfsfunktion liegt bereit

`[cmd]` **`tools/lauf.py`** mit `lauf()`, `git()` und `psql()`.
**Benutzung:**

```python
import sys; sys.path.insert(0, r"D:\GitHub\LumeOS-Claude-V1\backup")
from _lauf import lauf, git, psql

print(git("status", "--short"))
print(psql("select count(*) from nutrition.foods;"))
print(lauf(["node", "--version"]))
```

`[cmd]` **Gegengeprobt am 2026-08-19** — drei Aufrufe, kein Fenster.

`[read]` **Kein `shell=True`, keine Zeichenkette an die Shell.** Wer
einen Befehl braucht, der nicht ueber `lauf()` geht, **erweitert die
Datei statt danebenzuschreiben.**

### Bildschirmfotos: `tools/schuss.mjs`, nicht gstack

**Tom, 2026-08-20:** *,Wieso haben die kein Playwright?"*

`[cmd]` **Sie haetten.** `@playwright/test` 1.41.2 steht in der
Wurzel-`package.json`, `chromium_headless_shell` liegt im Cache.
**Es wurde nie benutzt** — stattdessen startete ein Agent einen
Bun-Browser, der auf jedem Aufruf ein Fenster oeffnete.

`[cmd]` **`tools/schuss.mjs`** meldet sich selbst an, wartet auf
`networkidle` und liefert **Bild, Attrappenzahl, Konsolenfehler und
Laufzeit in einem Aufruf:**

```bash
node tools/schuss.mjs /v2/nutrition backup/x.png
node tools/schuss.mjs /v2/nutrition backup/x-375.png --breite 375 --dunkel
```

`[cmd]` **Gegengeprobt am 2026-08-20:** angemeldet, Titel `Tagebuch ·
LumeOS`, 288 KB Vollseite, **7 Attrappen, 2 Konsolenfehler** — **kein
Fenster.**

`[read]` **Damit faellt auch A-24 weg:** Die Markenzahl kommt aus der
gerenderten Seite, nicht aus Textmarken im Quelltext.

### Ein UI-Auftrag misst die Antwortzeit — angemeldet

`[cmd]` **Anlass C-189:** Der Supplements-Tab war seit C-133 **neun
Sekunden** langsam. **Fuenf Auftraege haben ihn angefasst, keiner hat
es gemessen.** Ursache war ein Aufruf in einer Schleife — 64 Mal
dieselbe Unterfunktion. **7.641 ms → 144 ms.**

`[read]` **Und zweimal falsch gemessen:** erst ohne Anmeldung (122 ms
gegen die Anmeldeseite), dann als Kaltstart abgetan. **Tom hat
widersprochen, und er hatte recht.**

`[cmd]` **Seit A-45 liefert `schuss.mjs` es mit, ohne Schalter:**

```
zeit.gesamt_ms      vom `goto` bis `networkidle`
zeit.dokument_ms    `responseEnd` der Hauptanfrage
zeit.langsamste     Anfragen ueber 300 ms, die drei groessten, mit URL
zeit.zweiter_lauf   dieselbe Seite noch einmal, gleiche Sitzung
```

**Zwei Laeufe, weil ein einzelner Wert nichts sagt.** `[read]` Der
erste Aufruf einer Route uebersetzt im Entwicklungsmodus. **Ist der
zweite genauso langsam, ist es kein Kaltstart.**

`[cmd]` **Gegengeprobt am 2026-08-21:** `?tab=catalog` **2.469 ms /
2.206 ms**, `?tab=nutrients` **2.034 ms / 1.833 ms** — beide Male ist
die langsamste Anfrage das Dokument selbst, und sie wird benannt.

`[read]` **Keine Schwelle, kein Rot.** Das Werkzeug misst, es urteilt
nicht: Eine Sekunde ist im Dev-Modus normal, neun nicht — **aber wo die
Grenze liegt, weiss niemand.**

**Bei Datenbankfunktionen gehoert `explain (analyze, buffers)` dazu**,
nicht nur *„laeuft in X ms"*. `[read]` **`temp read/written` verraet
ein Kreuzprodukt sofort.**

### Der Konsolenfehler-Zaehler hat bis A-45 die Anmeldung mitgezaehlt

`[cmd]` **Gemessen am 2026-08-21:** `/v2/medical?tab=dashboard` wirft
**eine** Meldung je Laden — die alte Fassung meldete **zwei**, weil sie
die der Anmeldeseite mitzaehlte.

`[read]` **Die „2 je Seite" aus G-105 und G-123 sind also eine der
Anmeldung plus eine der Seite.** `konsolenfehler` nennt jetzt nur die
der gemessenen Seite; **`konsolenfehler_mit_anmeldung` traegt die alte
Zahl weiter**, damit frueherer Berichte zuzuordnen bleiben.

## Der Dev-Server und das Gate teilen sich nichts — wenn man es laesst

**Tom, 2026-08-19:** *,Irgendeiner schiesst immer den Server ab, geht
das nicht ohne?"*

**Ja. Die Trennung existiert seit dem 2026-08-06 (B-18).**

`[cmd]` **`apps/web/next.config.js` liest `LUMEOS_DIST_DIR`.** Das Gate
setzt `.next-gate`, **der Dev-Server bleibt auf `.next`.** Beide
Verzeichnisse stehen nebeneinander, **keiner raeumt das des anderen
ab.**

`[cmd]` **Und die zweite Ursache ist auch geloest:** `turbo.json` setzt
`dependsOn: ["^build", "build"]` bei `typecheck` — **sonst liefen
Typecheck und Build desselben Pakets gleichzeitig.** *,6 von 6 Laeufen
gruen bei laufendem Dev-Server."*

### Was Agenten trotzdem taten

`[cmd]` **Der G-87-Agent rief `next build` direkt auf** — ohne die
Variable, **also in `.next`.** *,Mein `next build` hatte dem
Entwicklungsserver die Chunks weggeschrieben."*

`[cmd]` **Und der Orchestrator schrieb in drei Auftraegen
*,`.next` loeschen und neu starten"*** — **also genau das Verzeichnis
anfassen, das der Dev-Server benutzt.** Der Rat war falsch.

### Die Regeln

**Nie `.next` loeschen.** `[read]` Es ist die Notloesung, nicht der
erste Griff.

**Nie `next build` direkt aufrufen.** `[cmd]` Nur `pnpm gate` oder
`pnpm --filter @lumeos/web build` — **die setzen die Variable.**

**Wenn die Oberflaeche kaputt aussieht:** `[cmd]` **erst pruefen, ob
jemand die Trennung umgangen hat.** `[read]` Ein Build in `.next` ist
die wahrscheinlichere Ursache als ein kaputter Cache.

**Und wenn wirklich geraeumt werden muss:** `[cmd]` **Server beenden,
raeumen, neu starten — in dieser Reihenfolge.** Wer nur raeumt, bekommt
404 fuer jeden Chunk, **und die Anmeldung schickt die Zugangsdaten per
GET in die URL** (G-82).

### Ein Server, ein Startweg: `tools/server.py`

**Tom, 2026-08-22:** *,kann ja nicht sein dass ich jedesmal nach einem
Lauf probleme habe und 20 minuten verplaemper mit der suche was mit
next los ist"*

`[cmd]` **Der Befund dahinter, gemessen am 2026-08-22: FUENF
`next dev`-Instanzen liefen parallel gegen dieses Repo** (3200, 3201,
3205, 3207, 3310). Der Mechanismus: ein Agent startet `pnpm dev`,
Port 3200 ist besetzt, **Next weicht stumm auf den naechsten Port
aus** — niemand merkt es, jede Instanz haelt eigene Datei-Watcher,
jeder Edit kompiliert fuenffach, und der 3200er verhungert (1,5 GB
RSS, /login ohne Antwort).

**Deshalb, ohne Ausnahme:**

- **Nie `pnpm dev` oder `npx next dev` von Hand.** Der Ausweich-Port
  ist das Gift.
- `[cmd]` **`python tools/server.py status`** — wer laeuft wo, RAM,
  Antwortzeit, Duplikate.
- **`python tools/server.py start`** — startet NUR, wenn 3200 frei
  ist; weicht nie aus. **`neustart`** raeumt alle Repo-Instanzen (und
  Headless-Chromes aelter 15 min) und startet EINEN. **`aufraeumen`**
  laesst einen gesunden 3200er leben.
- **Admin (3210) und Coach (3220) fasst das Werkzeug nie an.**
- `[cmd]` Gegengeprobt am 2026-08-22: neustart raeumte die fuenf
  Instanzen, der frische Server stand in 6 s, /login antwortet seither
  in 0,1 s. Log: `backup/dev-server.log`.

### Wer arbeitet woran: der Ordnername

**Tom, 2026-08-20:** *,,Du hast es nicht mal mehr im Griff zu wissen,
welcher Agent noch laeuft."*

**Tom, 2026-08-29:** *,,laufend gibt es nicht mehr wir arbeiten nur
noch mit punkten"*.

`[cmd]` **Eine Punktdatei in `docs/punkte/laufend_codex/` oder
`laufend_claudecode/` ist ein laufender Auftrag.** **Der Zustand
steckt im Ordnernamen, nicht in einer Tabelle.**

`[read]` **Warum die Tabelle weg ist:** sie war handgepflegt und am
2026-08-23 dreimal falsch — sie fuehrte G-160, G-161 und C-235 als
laufend, obwohl alle drei fertig waren. `[cmd]` **Gefunden hat es ein
Waechter, nicht der Orchestrator.**

*Regeln, die berichtet statt erzwungen werden, brechen.*

**Wem welcher Bereich gehoert:**

    supabase/_pipeline/          Codex
    apps/web/src/app/v2/<modul>  je ein UI-Agent
    docs/                        Orchestrator

## Eine Sitzung statt tausend Fenster

**Tom, 2026-08-18:** *,Jedes Mal, wenn so ein Terminal aufpoppt, kann ich
nicht schreiben."*

`[cmd]` **Die Zahlen sagen, woran es lag:** 3.657 Aufrufe von
`start_process`, **19** von `interact_with_process`. **Jeder Aufruf
startet ein eigenes `powershell.exe` und reisst unter Windows den Fokus
weg.**

**Der richtige Weg:** einmal `start_process("python -i -q")`, danach
alles ueber `interact_with_process` in derselben Sitzung. **Kein neues
Fenster, und der Zustand bleibt** — Arbeitsverzeichnis, Importe,
Hilfsfunktionen.

`[read]` Mehrzeiliges geht nur ueber `exec("...")` mit `\n`; die REPL
bricht sonst an der ersten Leerzeile ab.

**Die Kette ist zweistufig — beide Stufen muessen zu sein.** `[cmd]`
`subprocess.run(shell=True)` startet je Aufruf ein `cmd.exe` aus
system32, auch innerhalb der Python-Sitzung. Das braucht:

```python
si = subprocess.STARTUPINFO()
si.dwFlags |= subprocess.STARTF_USESHOWWINDOW
si.wShowWindow = 0
def sh(c):
    return subprocess.run(c, shell=True, capture_output=True, text=True,
                          startupinfo=si,
                          creationflags=subprocess.CREATE_NO_WINDOW).stdout.strip()
```

`[read]` Ohne `CREATE_NO_WINDOW` poppt bei jedem `git`-Aufruf ein
Fenster auf — seltener als vorher, aber genauso stoerend.

**Und die eigenen Werkzeuge nutzen:** `read_file` statt `Get-Content`,
`list_directory` statt `Get-ChildItem`, `edit_block` statt einer
Ersetzung per Skript.

## Pruefungen als Skript, nicht als Shell-Einzeiler

**Tom, 2026-08-17:** *„So belanglosen Scheiss will ich nicht
beantworten."*

`[cmd]` Die Permission-Schicht von Claude Code prueft **Einzelmuster**.
Ein verketteter Befehl mit Kommandosubstitution — `$(grep … | tr …)`
— oder ein mehrzeiliges `python -c` in einer `&&`-Kette trifft kein
Muster, **auch wenn jeder Bestandteil erlaubt ist.** `grep`, `echo`,
`for`, `head`, `tr` stehen alle auf `allow`; die Nachfrage kommt
trotzdem.

**Das laesst sich mit einer Musterliste nicht loesen.** Deshalb steht in
jedem Auftrag an Claude Code:

> **Pruefschleifen als Skript**, nicht als Shell-Einzeiler mit `$(…)`.

`[read]` So arbeitet der Orchestrator selbst: eine `.py`-Datei
schreiben, ausfuehren, loeschen. Das laeuft ohne Nachfrage durch und ist
nebenbei lesbar und wiederholbar.

### Und zwar ohne Fenster

**Tom, 2026-08-18:** *,Wenn die Agents die Anweisung kriegen, mit
Skripten zu arbeiten, dann gehoert auch dazu: ohne Window."*

`[cmd]` **Jeder Shell-Aufruf reisst unter Windows den Fokus weg.** Am
2026-08-18 gemessen: **52 `cmd.exe`, 59 `conhost.exe`** gleichzeitig —
davon **15 unter `wslhost.exe`**, also aus Claude Code, der ueber WSL
laeuft.

**Das gehoert zur selben Regel:**

> **Pruefschleifen als Skript — und ohne Konsolenfenster.**

**In Python:**

```python
import subprocess, shlex
si = subprocess.STARTUPINFO()
si.dwFlags |= subprocess.STARTF_USESHOWWINDOW
si.wShowWindow = 0
def sh(c):
    return subprocess.run(shlex.split(c, posix=False), capture_output=True,
                          text=True, startupinfo=si,
                          creationflags=subprocess.CREATE_NO_WINDOW).stdout.strip()
```

`[cmd]` **`shell=True` genuegt nicht** — es startet auf Windows immer
ein `cmd.exe`, auch mit `CREATE_NO_WINDOW`. **`shlex.split` und
`shell=False` vermeiden den Prozess ganz.**

`[read]` **Und weniger ist besser als unsichtbar:** Der Orchestrator kam
auf **3.657 Prozessstarts gegen 19 Sitzungsaufrufe**. Eine offene
Sitzung (`start_process("python -i -q")`, danach
`interact_with_process`) ersetzt hunderte Einzelstarts — **und der
Zustand bleibt erhalten.**

## Der Modus ist `bypassPermissions` — gemessen, nicht angenommen

`[cmd]` Seit 2026-08-17 steht `defaultMode: "bypassPermissions"` in
`.claude/settings.json`. **Die Agenten laufen damit ohne Nachfragen
durch — auch nachts, auch wenn niemand davorsitzt.**

**Die Sperre haelt trotzdem.** `[cmd]` Am 2026-08-17 gemessen:
`git commit -m "test"` wurde blockiert, HEAD blieb auf `520d001`, nichts
gestaged. **`deny`-Regeln greifen auch unter `bypassPermissions`.**

`[read]` Die Recherche hatte zwei Aussagen gefunden, die sich
widersprachen. **Die Messung entscheidet, nicht die Mehrheit der
Quellen.** Geprueft ist genau eine Regel; dass die uebrigen 22 ebenso
greifen, folgt aus derselben Mechanik, **ist aber nicht einzeln
gemessen.**

**Was dabei nicht greift:** `[read]` MCP-Aufrufe genehmigen sich im
Bypass-Modus selbst. Falls Claude Code MCP-Server angebunden bekommt,
gehoeren sie ueber `mcp__servername` in `deny` oder `ask`.

**Der eigentliche Schutz ist ohnehin nicht die Allow-Liste:**
`protect-paths.ps1` laeuft als `PreToolUse`-Hook bei jedem Bash-Aufruf
und blockiert mit Exit-Code 2 — **in jedem Modus.**

**Warum:** Zwei Agenten teilen sich einen Git-Index. An einem Tag ist
das dreimal schiefgegangen — ein Commit mit sechs fremden Dateien, und
zwei Commits, bei denen der Inhalt des einen unter der Nachricht des
anderen landete. Die Regel *„git diff --cached --name-only vor jedem
Commit"* deckt das auf, verhindert es aber nicht: Zwischen dem Lesen und
dem Commit kann ein anderer Prozess stagen.

**Das ist kein Disziplinproblem, sondern ein geteilter Zustand.** Ein
Index, ein Committer.

---

## gstack

- Für Browsing/Scraping/Headless-Aufgaben das gstack-`/browse`-Skill
  verwenden, **nicht** die `mcp__claude-in-chrome__*`-Tools.
- gstack-Skills, die auto-committen oder auto-pushen (`/ship`,
  `/land-and-deploy`), brauchen explizite Tom-Freigabe gemäss Schreibregeln.

## Befehle schreiben

Claude Code kann Befehle mit Schleifen, Befehlssubstitution oder
Variablenexpansion nicht statisch prüfen und fragt dann nach — unabhängig
von der Permission-Liste. Das kostet Tom bei jedem Zwischenschritt einen
Klick, ohne dass er entscheiden könnte, was er da freigibt.

Deshalb:

- **Kein `cd`-Präfix.** Die Sitzung läuft im Repo-Wurzelverzeichnis.
- **Keine Schleifen** (`for`, `while`) in Bash-Aufrufen.
- **Keine Befehlssubstitution** (`$(...)`, Backticks).
- **Keine Variablenexpansion** (`${PIPESTATUS[0]}`, `${x:-y}`, `$out`).
- **Keine Heredocs** für mehrzeilige Inhalte.

Stattdessen: mehrere einfache Befehle nacheinander, oder — wenn wirklich
Logik nötig ist — ein Skript als Datei anlegen und die Datei aufrufen.
Der Aufruf ist dann eine gerade Zeile und geht ohne Nachfrage durch.

Exit-Codes werden einzeln abgefragt, nicht über `PIPESTATUS` aus einer
Pipeline gezogen. Wiederholungsläufe werden als einzelne Aufrufe geschrieben,
nicht als Schleife.

## Ein Auftrag, ein Bericht ? keine Ketten

Tom, 2026-09-08: *,,ich mag das nicht wenn was im hintergrund
laeuft, denn dann weiss ich nie ob es feststeckt."*

`[cmd]` **Gemeint sind KETTENAUFTRAEGE an Codex.**

`[cmd]` **Der Orchestrator hat heute zwei gegeben:**

    C-455 -> C-454 -> C-457 -> C-459
    C-464 -> C-465 -> C-460

`[read]` **Codex meldet nach jedem Teil und arbeitet dann
weiter.**

`[read]` **Tom sieht einen Zwischenstand und weiss nicht: laeuft
der naechste, oder steht er?**

`[cmd]` **Heute passiert: *,,C-464 ist abgeschlossen. C-465 ist
begonnen."*** ? **und dann Stille.**

Tom, 2026-09-08: *,,lass kettenauftraege komplett melden, wir
brauchen keine zwischenresultate."*

**Die Regel:**

    Eine Kette meldet EINMAL, am Ende.
    Kein Zwischenstand, kein "X ist fertig, Y beginnt".

`[read]` **Ketten bleiben erlaubt** ? **sie sparen Uebergaben.**

`[read]` **Aber ein Zwischenstand ist keine Information** ? **er
sagt nur, dass etwas laeuft, und das weiss Tom schon.**

**Was in den Auftrag gehoert:**

    Je Auftrag Sicherung, Vollkette, Punktelauf,
    eigener Bericht IN DER PUNKTDATEI.
    Am Ende EIN Bericht an Tom, ueber alle.
    Scheitert einer: STOP und melden -- dann ist der
    Zwischenstand die Nachricht.

`[read]` **Also: die Berichte je Punkt schreibt er weiter** ?
**sie stehen in den Dateien und ich lese sie beim Abnehmen.**

`[read]` **Nur die Meldung an Tom kommt einmal.**

## Und nichts laeuft losgeloest

`[cmd]` **Der Orchestrator hat den Coach-Server auf 3220
losgeloest gestartet** ? `DETACHED_PROCESS`, **Ausgabe nach
`DEVNULL`.**

`[read]` **Er ueberlebt die Sitzung** ? **und niemand sieht, ob er
steht oder haengt.**

**Die Regel:**

    Jeder Prozess laeuft im Vordergrund oder gar nicht.
    Wer eine Ausgabe hat, zeigt sie.
    Wer lange laeuft, meldet den Fortschritt.

`[read]` **Und wenn ein Lauf laenger dauert als das
Werkzeugfenster: melden und Tom entscheiden lassen** ? **nicht
loesloesen und hoffen.**

`[cmd]` **Ausnahme: `tools/server.py start`** ? **es startet den
Dev-Server bewusst als Dauerprozess, MIT Log
(`backup/dev-server.log`) und mit `status` zum Nachsehen.**

`[read]` **Der Unterschied: er ist gebaut, benannt und
nachpruefbar** ? **ein von Hand losgeloester `pnpm dev` ist es
nicht.**
