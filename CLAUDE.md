# CLAUDE.md — LumeOS Runtime Instructions

## Rolle

Du bist Claude im LumeOS-Repo (`D:\GitHub\LumeOS-Claude-V1`).
Du arbeitest hier **direkt** mit Tom — kein Workorder-Workflow, keine
Governance-Pipeline. Du änderst Dateien nur, wenn Tom es explizit verlangt.

---

## Wo der Ist-Zustand steht

Diese Datei beschreibt **bewusst keinen Repo-Zustand.** Zustandssätze
veralten hier unbemerkt und wurden dann als Regel befolgt — zweimal
passiert („services/ ist leer"; „keine Writes, kein Auth").

| Frage | Ort |
|---|---|
| Was ist gebaut, was gilt? | `docs/ssot/00-INDEX.md` (Einstieg, Herkunftsmarker, Rangfolge: Code > ssot > Rest) |
| Was ist als Nächstes zu tun? | `docs/todo/TODO.md` |
| Was ist das Zielbild? | `docs/spezifikation/` (Rollen der Ordner, Statuskopf, Regeln: `00-INDEX.md`) |
| Was ist vom Altbestand schon ausgewertet? | `docs/spezifikation/00-KONSOLIDIERUNG.md` (Ablauf und Register) |
| Wie entsteht die Datenbank? | `supabase/README.md` (Baseline + Pipeline, Rollenteilung) |
| Wie starte ich, welche Gates gelten? | Root-`README.md` (u. a. `pnpm gate`, Hook-Aktivierung) |

---

## Wer committet

**Tom, 2026-08-16:** *„Du orchestrierst — dann machst du deinen Job
falsch. Die beiden arbeiten und du pruefst es; wenn ok, committest du,
und sicher nicht die Arbeiter."*

**Die Agenten committen nicht.** Sie bauen, pruefen ihr Ergebnis und
melden. Der Orchestrator liest den Bericht, prueft nach und committet.
Tom sieht an und pusht.

`[cmd]` Seit 2026-08-16 in `.claude/settings.json` gesperrt: `git add`,
`git commit`, `git stage`, `git rebase`, `git cherry-pick`,
`git revert` — zusaetzlich zu `git push`, `git reset --hard`,
`git clean`.

**Die Sperre greift nur bei Claude Code.** `[cmd]` `.claude/settings.json`
ist seine Konfiguration; Codex liest sie nicht — belegt am 2026-08-16:
Sperre um 20:51 gesetzt, Codex committete um 20:53.

**Bei Codex steht es deshalb im Auftragstext**, in jedem Auftrag:
*„Nicht committen, nicht stagen — melden."* Das ist schwaecher als eine
Sperre, aber Codex haelt sich an Textvorgaben.

## Der SSOT-Index wird vom Orchestrator gepflegt

`[cmd]` Am 2026-08-18 standen **16 von 86 Berichten nicht in
`docs/ssot/00-INDEX.md`** — alle von Codex.

`[read]` **Der Grund ist strukturell, kein Versaeumnis:** Claude Code
traegt die Indexzeile ein, weil es im Auftrag steht und er die Datei
ohnehin anfasst. **Codex arbeitet in `supabase/` und beruehrt
`docs/ssot/` nur fuer seinen eigenen Bericht.**

**Der Index ist laut dieser Datei der Einstieg** — ein Bericht, der
nicht darin steht, existiert fuer die naechste Sitzung nicht.

**Deshalb:** Der Orchestrator traegt ihn nach, wenn er den Bericht
committet. **Eine Zeile mit dem Befund, nicht mit dem Dateinamen** —
der steht schon in der ersten Spalte.

## Seeds gehoeren auf `dev@lumeos.app`

**Tom, 2026-08-18:** *,Wegwerf-DB ist mir scheissegal, wie und wo er
anlegt. Danach muessen Seeds in meinen Dev-Account, sonst sehe ich
nichts."*

`[cmd]` **Der Zustand, der dazu fuehrte:** Saemtliche Testdaten hingen
an `tom.seed@example.com` — 43 Koerpermessungen, 7 Umfaenge, 2
Laborbefunde, 6 Messwerte. **Toms Konto hatte davon nichts**, und
`tom.seed` hat kein Passwort (`encrypted_password IS NULL`), ist also
nicht anmeldbar.

**Damit war nichts im Browser sichtbar** — weder fuer Tom noch fuer
einen Agenten, der einen Nachweis fuehren sollte.

**Die Regel, in jedem Datenauftrag:**

> Testdaten laufen in der Wegwerf-Datenbank, wie und wo ist gleich.
> **Was danach live eingespielt wird, gehoert auf `dev@lumeos.app`.**

`[read]` Muster: `eigenes-konto-fuellen.sql` tut das fuer Nutrition
bereits. **Was fuer Mahlzeiten gilt, gilt fuer Messungen, Befunde,
Sitzungen und Check-ins genauso.**

`[cmd]` **Und der Zeilenschutz-Nachweis braucht zwei anmeldbare
Konten** — einen, der die Daten sieht, und einen, der sie nicht sieht.
Ein Konto ohne Passwort taugt fuer keines von beidem.

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

## Schreibregeln

- Keine Codeänderung ohne explizite Freigabe.
- Keine Commits oder Pushes ohne Tom. Ein logischer Change pro Commit.
- Markdown nur mit vollständigem Inhalt schreiben, Datei vorher einlesen —
  Teil-Edits zerstören Tabellen, Rekonstruktion aus dem Gedächtnis hat
  schon Abschnitte verloren.
- Aussagen über den Ist-Zustand tragen `[cmd]`, `[read]` oder `[annahme]` —
  Details in `docs/spezifikation/10-plattform/konventionen/`.
- Nie gegen die laufende Datenbank testen; Wegwerf-Datenbank, danach
  verwerfen. Strukturelle Live-Änderungen nur nach Freigabe.
- **`docs/specs/` und `docs/BrainstormDocs/` sind Datenquelle, nie
  Current Truth.** Sie beschreiben teils eine Vorgänger-Codebasis. Wer an
  einem Modul arbeitet, liest den zugehörigen Altbestand **mit** — er
  enthält getroffene Produktentscheidungen, die sonst zweimal getroffen
  werden. Verbindlich wird ein Inhalt erst, wenn er besprochen und nach
  `docs/spezifikation/` (Soll) oder `docs/ssot/` (Ist) übernommen ist.
  Ablauf und Stand: `docs/spezifikation/00-KONSOLIDIERUNG.md`.
- In `docs/specs/` wird nicht geschrieben — einzige Ausnahme ist ein
  Statusvermerk im Kopf, der auf das Konsolidierungsregister zeigt.
- Bei Unsicherheit: im Repo nachsehen, nicht raten.


---

## Das Vorgaengerrepo ist die wichtigste Quelle

`referenz/lumeos-2026/` enthaelt das lauffaehige Vorgaengerprodukt.

**Tom, 2026-08-15:** *"Das alte Repo ist am Code gescheitert, weil es mit
jedem Feature gewachsen ist. All das Wissen, das aufgebaut wurde, liegt
darin. Was wir nun tun, ist systematisch den Endausbau dieses Repos neu
aufzubauen, diesmal richtig — also nutze diese Ressourcen."*

**Gescheitert ist die Struktur, nicht die Erkenntnis.** `[cmd]` 75
Migrationen, elf gebaute Module, 52 Seed-Dateien, eine Wissensbasis mit
86 KB, Mehrsprachigkeit bis Thai. Was dort steht, wurde einmal
durchdacht, gebaut und benutzt.

**Der Wegweiser: `docs/ssot/80-vorgaengerrepo-fundus.md`** — nach Thema
geordnet, mit Pfad. TDEE, Makros, Portionen, 1RM, Koerperfett, HRV,
Halbwertszeiten, Biomarker-Synonyme, Regelwerk, Testdaten.

**Vor jeder Einstufung als "fehlt" wird dort nachgesehen.** `[cmd]` An
einem einzigen Tag wurde dreimal etwas als offene Frage behandelt, das
fertig dort lag: die TDEE-Formeln, die Portionsgroessen, die
Einheiten-Umrechnung. Jedes Mal kam der Hinweis von Tom, nicht aus der
Arbeit.

**Lesen ja, schreiben nie.** `referenz/` traegt 22 Stashes und 19
ungepushte Commits — dort wird nichts veraendert.

### Es geht nicht ums Kopieren — und auch nicht ums Misstrauen

**Tom, 2026-08-15:** *"Es geht nicht darum, den Code dieses Repos zu
kopieren. Es geht darum, aus diesem ueber Monate gewachsenen Repo — wo
immer wieder neue Ideen reingebaut wurden und nochmal was Neues obendrauf
— ein Featureprodukt anzuschauen und richtig nachzubauen. Und dazu kann
man sehr wohl schon geloeste Sachen 1zu1 uebernehmen, mit den noetigen
Anpassungen."*

**Das alte Repo ist die vollstaendigste Anforderungsquelle, die es
gibt.** Wenn die Frage lautet, was ein Modul koennen muss, steht die
Antwort nicht in der Spec — sie steht in elf gebauten Modulen, die
jemand benutzt hat. `[cmd]` Die Specs sind KI-erzeugt und an einer Stelle
nachweislich eine Kopie des Brainstorms; das Design zeigt die
Oberflaeche; **nur das alte Repo zeigt, was das Produkt tatsaechlich
tat.**

**Geloeste Sachen werden uebernommen, nicht nachempfunden.** Wenn
`seed-portions.py` hundert Portionsdefinitionen fuehrt, werden die
uebernommen — angepasst wird die Zuordnung ans neue Schema, nicht die
30 g fuer eine Scheibe Brot.

**Angepasst wird, was sich geaendert hat**, und das ist bekannt:
`public.foods` mit UUID gegen `nutrition.foods` mit `bls_code`,
`daily_nutrition_aggregates` gegen `daily_summary`, andere Schemata,
andere Spaltennamen. Das ist Uebersetzungsarbeit, kein Nachbau.

**Gemessen wird trotzdem** — nicht aus Misstrauen, sondern weil eine
Uebernahme ohne Messung nicht belegt, dass sie angekommen ist. *Aus der
Existenz einer Sache folgt nicht ihre Funktion.*

---

## Altlasten

Die frühere Governance-Maschinerie ist archiviert (`_archive/governance/`,
Regeln im dortigen README) bzw. in ein eigenes Repo umgezogen.
**Die Wurzel ist seit 2026-08-06 (A-10) geräumt:** `COMMANDS.md`,
`SESSION_ONBOARDING.md`, `STACK_REFERENCE.md` und `CLAUDE.md.v1.bak`
liegen jetzt unter `_archive/governance/wurzel-altlast/` (mit README, das
je Datei nennt, warum). `project.profile.json` ist bereits früher
entfallen.
**`AGENTS.md` bleibt bewusst im Wurzelverzeichnis** — sie ist keine
Altlast mehr, sondern der Einstiegspunkt für Agenten-Werkzeuge
(lean-ctx-Block, Verweis auf `CLAUDE.md`); mehrere Werkzeuge lesen sie von
sich aus. Wenn Tom nach Governance fragt: das gehört ins Governance-Repo,
nicht hierher.

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
