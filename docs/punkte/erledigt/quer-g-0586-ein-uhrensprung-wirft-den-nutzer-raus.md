---
nr: G-586
typ: fehler
modul: quer
schwere: hoch
angelegt: 2026-10-02
agent: claudecode
beauftragt: 2026-10-02
erledigt: 2026-10-03
commit: adc9db69

braucht: [G-553]
kind_von: G-553

quellen:
  - docs/punkte/erledigt/goals-g-0553-ein-tokenfehler-sieht-aus-wie-ein-datenfehler.md
  - docs/punkte/erledigt/coach-g-0582-der-coach-alarm-hat-keinen-aufrufer.md

beruehrt:
  tabellen: []
  dateien:
    - packages/shared/src/supabase/session.ts
    - apps/web/src/lib/fehler/ladefehler.ts
---

# Ein Uhrensprung wirft den Nutzer raus, statt die Sitzung zu erneuern

## Auftrag — Kopf

    AUFTRAG FUER Claude Code - G-586: erst den Beweis, dann einmal
                                     erneuern
    Bereich: packages/shared/src/ (der Sitzungsweg)
             apps/web/src/lib/fehler/
    Fremd:   supabase/ gehoert Codex. Die Umgebung (Docker, Uhren)
             aenderst du NICHT - du belegst sie. docs/ gehoert dem
             Orchestrator, auch diese Punktdatei.
    Stand:   2026-10-02

## Der Befund — und was G-553 schon geklaert hat

`[cmd]` **Tom sieht es heute wieder**, 16:07, im Browser auf
`localhost:3200`:

    Sitzung abgelaufen
    Die Sitzung ist nicht mehr gueltig. Melde dich neu an.
    user_goals: JWT issued at future

`[cmd]` **G-553 hat die EINORDNUNG richtig gestellt** (erledigt
2026-09-30, `20992639`): `JWT issued at future` ist ein
**Sitzungsfehler**, nicht ein Datenfehler. **Die Meldung ist also
korrekt** — sie steht hier nicht zur Debatte.

`[read]` **Was G-553 NICHT behandelt hat: die Ursache und die Reaktion.**
Tom sieht denselben Satz zum wiederholten Mal. **Ein Fehler, der dreimal
auftritt, ist kein Einzelfall mehr.**

`[cmd]` **Der Satz kommt von PostgREST selbst**, wenn das `iat` des
Tokens hinter seiner Uhr liegt. **PostgREST hat dafuer keine Toleranz** —
keine Sekunde.

`[cmd]` **Vom Orchestrator gemessen, 2026-10-02 um 16:10, drei Proben:**

    Postgres minus Host = 837 ms
    Postgres minus Host = 755 ms
    Postgres minus Host = 753 ms

**Die Containeruhr laeuft dem Host voraus**, konsistent um gut 0,75 s.
`[annahme]` **Daraus folgt noch nichts** — das Token wird in einem
Container gepraegt und in einem Container geprueft, beide teilen dieselbe
Uhr. **Meine Vermutung ist ein Ruecksprung der Containeruhr nach
Standby**, aber niemand hat es belegt.

`[cmd]` **G-582 hat denselben Satz gesehen und als Umgebungsfehler
verworfen:** keine Uhrendrift im Messfenster, Token-`iat` 0,5 s in der
Vergangenheit, ein zweiter Besuch rendert vollstaendig. **Das war
richtig gemessen und es widerspricht Toms Fall nicht** — bei ihm bleibt
es stehen.

## Auftrag

**A1 — den Beweis einfangen, bevor etwas gebaut wird.** `[read]` **Ohne
diese drei Zahlen bleibt jede Erklaerung eine Vermutung:** beim Fehler
das `iat` und `exp` des Tokens, die Uhr des pruefenden Dienstes und die
Hostuhr, alle drei im selben Augenblick. **Wo das Protokoll hingehoert,
entscheidest du** — aber es muss ohne Debugger reproduzierbar sein, und
es darf **kein Token und kein Geheimnis** in ein Log schreiben: Zeiten,
keine Inhalte.

**A2 — einmal erneuern statt rausschmeissen.** `[read]` **Das ist der
Teil, der Tom heute hilft, und er ist unabhaengig von A1 richtig:** bei
`JWT issued at future` wird die Sitzung **einmal** erneuert und die
Abfrage wiederholt. **Erst wenn das auch faellt, kommt die
Anmeldeaufforderung.** `[cmd]` **Nicht die Einordnung aendern** — der
Fehler bleibt ein Sitzungsfehler (G-553), er wird nur anders behandelt.

**A3 — die Grenze benennen.** `[read]` **Eine Erneuerungsschleife ist
schlimmer als die Fehlermeldung.** Genau einmal, mit einem Beleg, dass
ein zweiter Fehlschlag durchfaellt — **Sabotage in beide Richtungen.**

**A4 — wenn A1 die Uhr belegt, sag was die Umgebung braucht**, und
aender sie nicht: Docker-Resync, harter Zeitgeber, oder eine Toleranz,
die PostgREST gar nicht kennt. `[read]` **Ein Satz Befund, kein Eingriff.**

**Nicht Teil:** die Einordnung der Meldung (G-553, erledigt), Auth-Umbau,
und die Uhr selbst.

**Zu belegen:** die drei Zeiten aus A1 bei einem echten Fehlerfall ·
die Erneuerung einmal ausgeloest und zurueckgelesen · der zweite
Fehlschlag faellt durch · Sabotage je Zusicherung in beide Richtungen ·
`pnpm gate` gruen mit Testzahl · nichts committen.

`[read]` **Kein Kettenlauf.** Und wenn du den Fehler nicht reproduzieren
kannst: **das ist ein Befund und keine Niederlage** — dann liefert A1 den
Weg, ihn beim naechsten Mal einzufangen, und A2 steht trotzdem.

---

## Abnahme — 2026-10-03, Commit `adc9db69`

`[read]` **Diese Abnahme hat der Orchestrator geschrieben, nicht der
Agent.** Der Stromausfall am 03.10. um 05:59 hat Claude Code den Kontext
genommen, bevor er berichten konnte. **Die Arbeit lag fertig und gruen im
Arbeitsbaum** — 19 neue Tests, die das Gate schon mitzaehlte (web 2550 →
2569). Abgenommen wurde am Diff und an eigenen Messungen, nicht an einem
Bericht.

### Der Auftrag wurde an einer Stelle widerlegt, und zwar gemessen

`[cmd]` **Der Auftrag sagte:** *„PostgREST hat dafuer keine Toleranz —
keine Sekunde."* **Gemessen sind es 30 Sekunden**, mit einem selbst
gepraegten Token gegen `/rest/v1/user_goals`:

    iat + 30 s  ->  200
    iat + 31 s  ->  401  JWT issued at future

`[read]` **Das aendert die Ursachenlage, nicht nur eine Zahl.** Die 753
bis 837 ms Versatz, die ich im Auftrag gemessen hatte, **koennen Toms
Fehler nicht erklaeren** — es braucht einen Ruecksprung von mehr als 30
Sekunden. **Meine Vermutung „Ruecksprung nach Standby" bleibt damit
plausibel und ist weiter unbelegt**, aber die Groessenordnung steht jetzt.

### A1 bis A4, je mit der Zahl, die sie traegt

`[cmd]` **A1** — `sprungbeleg()` und `sprungZeile()` halten `iat`, `exp`,
Vorsprung in Sekunden, Toleranz und den Erneuerungsausgang fest, mit
fester Marke `[uhrensprung]` zum Greppen. **Zeiten, keine Inhalte:** kein
Token, kein Geheimnis, keine Nutzerkennung. `jetzt` kommt als Parameter
herein statt aus `Date.now()` — deshalb ist die Funktion ohne laufende
Umgebung pruefbar.

`[cmd]` **A2** — zwei Messungen erklaeren, warum die Erneuerung
ueberhaupt greifen kann: **GoTrue prueft `iat` gar nicht** (`iat + 300 s`
→ `200`), deshalb sieht die Middleware den Fall nicht und der Fehler
entsteht erst an der Abfrage; und **`grant_type=refresh_token` traegt
kein `iat`**, faellt also an keiner Uhr. `[read]` **Verdrahtet ist es
einmal**, an `global.fetch` in `session.ts:createSessionClient`, **nicht
an 256 Aufrufstellen.**

`[cmd]` **A3** — der Merker `schonErneuert` lebt am Client, also eine
Anfrage lang; der zweite Uhrensprung faellt zur Anmeldeaufforderung
durch. **Die Einordnung bleibt Sitzungsfehler** (G-553 unberuehrt).

`[cmd]` **A4** — die Umgebung wurde NICHT angefasst, sondern benannt:
**zwischen den Diensten driftet nichts.** Postgres, Auth und Kong teilen
einen Kernel-Timer; die Kreuzmessung `auth → pg` (1790–2070 ms) liegt
innerhalb der Kontrollmessung `pg → pg` (2037–2327 ms). **Was driftet,
ist die Docker-VM gegen den Host** — und das trifft ein Token, das vor
dem Sprung gepraegt wurde.

### Zwei Feinheiten, die nur beim echten Messen auffallen

`[cmd]` **Der Antwortrumpf wird geklont.** Wer ihn liest, verbraucht ihn
— ohne `clone()` kaeme beim Aufrufer ein leerer Strom an.

`[cmd]` **Das frische Token muss in den `Authorization`-Kopf.** Gemessen
am 02.10.: die Erneuerung holte ein gueltiges Token, **die Wiederholung
kam trotzdem mit `401`**, weil sie das alte `init` erneut schickte.
Deshalb gibt der Erneuerer das **Token** zurueck, nicht `true`. `[read]`
**Im Betrieb waere das nicht aufgefallen**, weil `supabase-js` den Kopf
je Aufruf neu baut — in einem Aufrufer mit festen `headers` schon.

### Vom Orchestrator nachgefahren, nicht geglaubt

`[cmd]` **Sabotage in beide Richtungen**, am Kern von A3
(`if (schonErneuert)` → `if (false)`):

    1 Kontrollprobe            # pass 19  # fail 0
    2 mit Sabotage             # pass 18  # fail 1
    3 nach Wiederherstellung   # pass 19  # fail 0
    md5 vorher = md5 nachher   4c7d8ddd5c48a42e1f2fb7f31558d05e

`[cmd]` **`pnpm gate` gruen**, 18/18, web 2569 Tests, `[gate] gruen.` im
Vorcommit-Haken. Commit `adc9db69`, 3 Dateien, +658/−1.

### Was offen bleibt

`[read]` **A1 ist als WEG eingeloest, nicht als Vorfall.** Es gibt noch
kein Protokoll von einem echten Fehlerfall bei Tom — die Marke
`[uhrensprung]` steht bereit, und beim naechsten Mal faengt sie die drei
Zeiten ein. **Das ist genau die Form, die der Auftrag zugelassen hat:**
*„wenn du den Fehler nicht reproduzieren kannst, ist das ein Befund und
keine Niederlage."*

`[cmd]` **Und der Erfolgsfall ist noch nicht am Schirm belegt** — die
Erneuerung ist in Zusicherungen bewiesen, nicht an Toms Browser. **Wenn
die Meldung wieder auftritt, ist das die Probe**, und das Serverlog
traegt dann die Zeile.
