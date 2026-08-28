---
nr: G-217
typ: feature
modul: training
schwere: mittel
angelegt: 2026-08-28
braucht: []
kind_von: G-216
agent: claudecode
beauftragt: 2026-08-28
erledigt: 2026-08-28
commit: 942e9259
entscheidung: null
beruehrt:
  dateien:
    - apps/web/src/lib/training/sitzung-write.ts
    - apps/web/src/app/v2/training
zahlen: null
---

# G-217 — der Trainings-Schreibweg hat keine Oberflaeche

## Befund

Aus G-216, 2026-08-28.

`[read]` **Der Schreibweg ist gebaut und geprueft** — Sitzung
anlegen, Uebung hinzufuegen, Saetze eintragen, abschliessen, mit
Waechter je Tabelle und Rueckbau. `[read]` **Es fehlt das Formular.**

`[cmd]` Der Bildschirm zeigt im Verlaufsreiter eine Attrappe *,,Add
to session"*, **die genau den fehlenden Weg markiert.**

`[read]` **Zweimal an einem Tag habe ich in einem Auftrag ein
Bildschirmfoto verlangt, wo ein Schreibweg gebaut wurde** — bei
G-122 und G-216. **Der Fehler ist meiner, nicht der der Arbeit:** ein
Schreibweg ist kein Bild.

## Was zu tun ist

**Das Formular auf den vorhandenen Schreibweg setzen.** `[read]` Der
Baum entsteht schrittweise — **jemand faengt an, traegt zwischendurch
ein, hoert auf.** Die Oberflaeche muss das aushalten, nicht nur den
abgeschlossenen Fall.

`[cmd]` **Der offene Zustand existiert im Schema** (`active` mit
`ended_time IS NULL`) **und ist im Bestand unbenutzt: 0 von 66.**
`[read]` **Er wird erst durch das Formular entstehen** — und dann
sofort haeufig.

## Auftrag

### Vorweg

`[read]` **Die Zahlen misst du.** `[cmd]` Seit dem 27.08. traegt ein
Auftrag keine Zahlen mehr vom Orchestrator. **Nenn die Abgrenzung
mit.**

### Zu tun

**Das Formular auf den Schreibweg aus G-216 setzen.**

`[read]` **Der Baum entsteht schrittweise** — jemand faengt an, traegt
zwischendurch ein, hoert auf. **Die Oberflaeche muss das aushalten,
nicht nur den abgeschlossenen Fall.**

`[cmd]` **Der offene Zustand existiert im Schema und ist im Bestand
unbenutzt** — `active` mit `ended_time IS NULL`, 0 von 66. `[read]`
**Er wird erst durch dieses Formular entstehen, und dann sofort
haeufig.** **Was passiert beim naechsten Aufruf, wenn eine Sitzung
offen ist?** Fortsetzen, verwerfen, fragen — **entscheide und
begruende.**

`[cmd]` **Die Attrappe *,,Add to session"* im Verlaufsreiter markiert
den Ort.**

### Was aus G-216 uebernommen gehoert

`[read]` **Die Naht ist gebaut** — `sitzung-write.ts`, drei Ebenen,
ein Waechter je Tabelle. **Das Formular ruft sie, es baut keine
zweite.**

`[cmd]` **`exercise_name` friert beim Schreiben ein** — live
gegengeprobt. **Das Formular darf den Namen nicht nachschlagen,
sondern muss ihn mitgeben.**

### Was nicht zu tun ist

**Keine eigene Uebung anlegen koennen** — E-17, die Tabelle gibt es
nicht.
**Kein Trainingsplan, keine Vorlagen.**
**Die `planned`-Sitzungen nicht berichtigen** — das ist C-330 und
gehoert in ein `CHECK`, nicht in ein Formular.
**Keine Tabelle anlegen** — Codex arbeitet an C-331.
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    Sitzung anlegen               ueber das Formular
    Uebung hinzufuegen            ueber das Formular
    Saetze eintragen              ueber das Formular
    unterbrechen und wiederkommen was passiert - belegt
    abschliessen                  Zustand unterscheidbar
    exercise_name eingefroren     Gegenprobe wie in G-216
    Attrappen im Modul            vorher / nachher
    Rueckbau                      gezaehlt, `dev` unberuehrt
    Bildschirmfoto je Zustand     `node tools/schuss.mjs`

`[read]` **Diesmal ist das Bildschirmfoto berechtigt** — zweimal
heute habe ich es verlangt, wo ein Schreibweg gebaut wurde. **Hier
gibt es etwas zu sehen.**

### Regeln

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
`[cmd]` **Der Dev-Server beendet sich von selbst** (G-205).
`[cmd]` **A-30:** kein Wert-Import aus dem Leseweg in eine
Browserdatei.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Bericht

**Das Formular steht auf der Naht aus G-216 und schreibt nichts
selbst.** Sechs Zustaende ueber die Oberflaeche durchgefahren, jeder
mit Bild.

### Die Entscheidung: fortsetzen, nicht fragen

**Auftrag: *„Was passiert beim naechsten Aufruf, wenn eine Sitzung
offen ist? Fortsetzen, verwerfen, fragen — entscheide und
begruende."***

**Entschieden: fortsetzen.** Die offene Sitzung wird geladen und
steht da, wo sie aufgehoert hat. **Verwerfen bleibt moeglich, aber
als Knopf, nicht als Frage.**

`[read]` **Gegen „fragen":** Ein Dialog beim Betreten bestraft den
Normalfall. Wer zwischen zwei Uebungen das Telefon weglegt und
wiederkommt, hat nichts zu entscheiden — er macht weiter. **Eine
Frage waere ein Hindernis genau dort, wo nichts unklar ist.**

`[read]` **Gegen „verwerfen":** Eine offene Sitzung enthaelt bereits
geschriebene Saetze. Sie beim naechsten Aufruf wegzuwerfen hiesse,
Messungen zu loeschen, die jemand eingetragen hat — **dieselbe Klasse
wie „Absetzen ist kein Loeschen" (G-211).**

**Die Grenze, die ich bewusst nicht ueberschritten habe:** `[read]`
eine offene Sitzung von **vorgestern** ist etwas anderes als eine von
heute — da hat jemand vergessen abzuschliessen. **Sie wird trotzdem
fortgesetzt und NICHT automatisch beendet:** wann sie geendet haette,
weiss niemand, und **eine erfundene `ended_time` waere schlimmer als
eine offene Sitzung.** Das Formular benennt das Alter und laesst die
Entscheidung beim Menschen.

`[cmd]` **Beide Faelle live belegt:**

    heute        „Laufendes Training von heute, 2 Sätze eingetragen."
    vorgestern   „Laufendes Training vom 2026-08-26, 2 Sätze
                  eingetragen — nicht abgeschlossen."  + Warnmarke

### Der Durchstich, sechs Zustaende

`[cmd]` Als `test-user@lumeos.local`, ueber `/v2/training?tab=today`
→ „Training erfassen":

    1  leer            „Kein laufendes Training."          g217-1-leer.png
    2  begonnen        0 Sätze, Abschliessen GESPERRT      g217-2-begonnen.png
    3  Uebung          Suche „Barbell squat", 3 Treffer    g217-3-uebung.png
    4  zwei Saetze     „1. 8 × 80 kg  2. 6 × 90 kg"        g217-4-saetze.png
    5  wiedergekommen  Uebung da, Saetze da, Zaehler 2     g217-5-fortgesetzt.png
    6  abgeschlossen   „Kein laufendes Training."          g217-6-abgeschlossen.png
    7  aeltere offen   Datum benannt, Warnmarke            g217-7-aeltere-offen.png

`[cmd]` **Zustand 5 ist der eigentliche Nachweis:** Modal mit Escape
geschlossen, **Seite neu geladen**, Formular wieder geoeffnet — die
Uebung stand da, beide Saetze standen da, der Kopf zaehlte 2. **Es
gibt keinen Entwurf, der beim Schliessen verloren geht**, weil jeder
Schritt sofort schreibt.

`[cmd]` **In der Datenbank danach:** `completed`, `ended_time
12:00:30`, `total_sets 2`, `total_reps 14`, `Barbell squat to grass`,
2 Saetze.

### Der Snapshot haelt auch ueber das Formular

`[cmd]` **Gegenprobe wie in G-216, diesmal an einer ueber die
Oberflaeche erfassten Zeile:**

    vorher     Katalog „Barbell squat to grass"          Protokoll gleich
    umbenannt  Katalog „… (G-217 umbenannt)"             Protokoll UNVERAENDERT
    zurueck    Katalog „Barbell squat to grass"          wieder gleich = t

`[cmd]` **Das Formular gibt den Namen nicht mit** — nur
`sitzung.id` und `u.id` gehen an die Aktion, **die Naht liest den
Namen aus dem Katalog und friert ihn ein.** `[read]` Wer ihn durch
den Browser reichte, koennte einen beliebigen Namen schreiben; **der
Snapshot muss aus der Quelle kommen.** Zwei Waechter pruefen das —
einer am Aufruf, einer an der Signatur der Aktion.

### Die Naht blieb eine

`[cmd]` **Der Waechter aus G-216 laeuft unveraendert gruen:** genau
eine Datei schreibt auf `workout_sessions`, `workout_exercises` und
`workout_sets` — `lib/training/sitzung-write.ts`.

`[cmd]` **Ein eigener Waechter prueft die Gegenrichtung:** das
Formular enthaelt **kein** `.insert|update|upsert|delete(` und
**kein** `createSessionClient`. Zwischen Formular und Naht liegt
`sitzung-aktionen.ts`, und die **entscheidet nichts** — sie reicht
durch und uebersetzt Fehler in Feldmeldungen (Muster aus G-211).

**Was ich neu gebaut habe und was schon da war:**

    neu   app/v2/training/sitzung-formular.tsx     das Formular
    neu   app/v2/training/sitzung-aktionen.ts      Serveraktionen
    neu   lib/training/stand-aus-sitzung.ts        die Entscheidung, serverfrei
    neu   lib/training/__tests__/stand-…test.ts    9 Tests
    erg.  lib/training/sitzungen-read.ts           2 Lesefunktionen
    ger.  app/v2/training/ansicht.tsx              Verdrahtung

`[read]` **Die zwei Lesefunktionen waren die Luecke:** es gab keinen
Weg, eine offene Sitzung zu FINDEN — `ladeOffeneSitzung` und
`ladeSitzungsInhalt` sind Lesen, also stehen sie im Leseweg und nicht
in der Naht.

### Was ich am Bestand geaendert habe, und warum

**Der Knopf hiess „Start Push B".** `[read]` Er versprach eine
Vorlage, die es nicht gibt (Vorlagen sind ausgeschlossen). **Jetzt
heisst er „Training erfassen"** — das ist, was er tut.

**`LiveWorkout` hat keinen Aufrufer mehr.** `[cmd]` Der Entwurf zeigte
fuenf fest verdrahtete Saetze an einer erfundenen Uebung; nichts davon
wurde gespeichert. **Ich habe ihn stehen lassen, nicht geloescht** —
er zeigt die Zielgestalt, die das Formular noch nicht hat: Pausenuhr,
PR-Marke, Zielvorgabe je Satz.

`[read]` **Und ich habe es im Code benannt**, statt es stillschweigend
tot herumstehen zu lassen. **Beim ersten Anlauf stand in meinem
Kommentar, der Entwurf sei „ueber den Spec-Reiter erreichbar" — das
war falsch**, `rg` zeigte null Referenzen. **Korrigiert, bevor es im
Repo stand.** Genau die Klasse aus G-186: ein Zweig, der etwas
vortaeuscht, das ihn ueberdauert.

### Nachweisliste

    Sitzung anlegen               [cmd] ueber das Formular, Zustand 2
    Uebung hinzufuegen            [cmd] ueber die Suche, Zustand 3
    Saetze eintragen              [cmd] zwei, Zustand 4
    unterbrechen und wiederkommen [cmd] Zustand 5 — alles da
    abschliessen                  [cmd] completed, Dauer gesetzt
    exercise_name eingefroren     [cmd] Gegenprobe gefahren, haelt
    Attrappen im Modul            [cmd] siehe unten
    Rueckbau                      [cmd] gezaehlt, dev unberuehrt
    Bildschirmfoto je Zustand     [cmd] sieben Bilder

### Waechter: sechs Sabotagen, sechs Ausfaelle

`[cmd]` Jede einzeln, Dateien danach byte-identisch (SHA-256):

    das Formular schreibt selbst              faellt
    der Name geht ans Anhaengen mit           faellt
    die Aktion nimmt einen Namen entgegen     faellt
    Wert-Import aus dem Leseweg (A-30)        faellt
    Datum ueber `Date` vergleichen            faellt
    ohne Saetze abschliessen erlauben         faellt

`[read]` **Der Datums-Waechter ist kein Ueberbau:**
`new Date('2026-08-28')` verschiebt eine `date`-Spalte je nach
Zeitzone um einen Tag — dann hiesse eine Sitzung von heute
„vorgestern". `standVon` vergleicht deshalb als Text, und der
Waechter verbietet `new Date(` in der Datei.

`[cmd]` **44 Tests gruen** im Trainingsmodul (9 neu, 35 bestehende),
Typecheck sauber, `serverimport-pruefen.mjs` 0 Treffer,
`encoding-pruefen.mjs` 20.532 Dateien sauber.

### Attrappen, vorher und nachher

`[cmd]` **Im neuen Code: 0.** Der einzige Treffer auf `placeholder`
ist das HTML-Attribut des Suchfelds, keine Attrappe.

`[cmd]` **Auf dem Bildschirm:**

    /v2/training?tab=history    1   unveraendert gegenueber G-216
    /v2/training?tab=today      2   „Library" und „Progress" im Kopf

`[read]` **Die 2 sind kein Rueckschritt und kein Vergleich zu G-216**
— dort wurde `?tab=history` gemessen. Die beiden Kopfknoepfe standen
vorher schon da und gehoeren nicht zum Zuschnitt.

`[cmd]` **Im Quelltext zaehlt `rg` unveraendert 14/28/22
`InEntwicklung` je Datei** — **weil ich den `LiveWorkout`-Entwurf
absichtlich stehen gelassen habe.** Die Zahl faellt erst, wenn die
Zielgestalt eingeloest ist.

### Rueckbau, gezaehlt

`[cmd]` **Angelegt: 1 Sitzung, 1 Uebung, 2 Saetze.** Alle geloescht,
der Baum ueber `CASCADE`.

    training.workout_sessions   66   vorher 66
    training.workout_exercises  132  vorher 132
    training.workout_sets       238  vorher 238
    Sitzungen mit status=active   0  vorher 0
    test-user Sitzungen           6  vorher 6
    dev Sitzungen                30  unveraendert
    Katalogname   „Barbell squat to grass"  zurueckgedreht

`[cmd]` **Verwerfen vorher gepruefet:** setzt `cancelled` und
**behaelt die 2 Saetze** — verwerfen ist kein Loeschen, wie
angekuendigt.

`[cmd]` **`dev@lumeos.app` unberuehrt.** Nicht committet, nicht
gestaged.

### Abgrenzung der Zahlen

**Alle Zahlen sind von mir gemessen**, am 2026-08-28 gegen die
laufende Datenbank und den laufenden Dev-Server.

`[cmd]` **Die Zahl des Auftrags stimmt:** `active` mit
`ended_time IS NULL` war 0 von 66 — nachgezaehlt vor dem Durchstich,
und nach dem Rueckbau wieder 0.

`[read]` **Abgrenzung bei „Attrappen":** gezaehlt wird, was
`schuss.mjs` auf der **gerenderten Seite** findet — nicht Textmarken
im Quelltext (A-24). **Die beiden Zahlen sagen Verschiedenes**, und
im Quelltext hat sich nichts geaendert, weil der Entwurf steht.

`[read]` **Abgrenzung bei „Schreibstellen":** Dateien mit
`from('<tabelle>')` **und** einem Schreibaufruf, Kommentare vorher
entfernt — dieselbe Regel wie G-122 und G-216. **Weiterhin 1.**

### Was fehlt

`[read]` **Der Entwurf zeigt drei Dinge, die das Formular nicht
hat:** Pausenuhr zwischen den Saetzen, PR-Marke am Satz, Zielvorgabe
(„5×5 @ 117,5 kg"). **Die Zielvorgabe braucht Vorlagen** — die sind
ausgeschlossen, also gehoert sie in einen eigenen Punkt. **Pausenuhr
und PR-Marke haengen an nichts, was fehlt**, und waeren ein kleiner
Folgepunkt.

`[read]` **Nicht gebaut, weil ausgeschlossen:** keine eigene Uebung
(E-17), kein Trainingsplan, keine Vorlagen, keine Berichtigung der
`planned`-Sitzungen (C-330), keine Tabelle (C-331).

## Abnahme

**2026-08-28, Orchestrator. Selbst gemessen.**

`[cmd]` **Bestand unveraendert:** 66 / 132 / 238, **0 offene
Sitzungen** — Rueckbau vollstaendig. `[cmd]` **Die Naht haelt:**
`.insert(` im Trainingsformular — **keine.**

### Die Entscheidung ist begruendet, nicht gewaehlt

`[read]` *,,Fortsetzen, nicht fragen. Ein Dialog beim Betreten
bestraft den Normalfall — wer zwischen zwei Uebungen das Telefon
weglegt, hat nichts zu entscheiden."*

`[read]` **Und verwerfen kam nicht in Frage, weil eine offene Sitzung
bereits geschriebene Saetze enthaelt** — *,,dieselbe Klasse wie
»Absetzen ist kein Loeschen«"*. **Er zitiert seine eigene Regel aus
G-211 und wendet sie auf einen anderen Fall an.**

`[read]` **Die Grenze ist die staerkere Haelfte:** eine offene Sitzung
von vorgestern wird ebenfalls fortgesetzt und **nicht automatisch
beendet** — *,,wann sie geendet haette, weiss niemand; eine erfundene
`ended_time` waere schlimmer als eine offene Sitzung."*

`[cmd]` **Genau der Fehler, den C-330 im Bestand beschreibt** — 28
`planned`-Sitzungen mit einer `ended_time`, die nie stattfand. **Er
hat ihn nicht wiederholt.**

### Zustand 5 ist der Nachweis

`[cmd]` Modal mit Escape zu, Seite neu geladen, Formular wieder auf —
**Uebung da, beide Saetze da, Zaehler auf 2.** `[read]` **Es gibt
keinen Entwurf, der beim Schliessen verlorengeht, weil jeder Schritt
sofort schreibt.**

### Ein Fehler, den er vor dem Repo abgefangen hat

`[read]` *,,Im ersten Anlauf schrieb ich in den Kommentar, er sei
»ueber den Spec-Reiter erreichbar«; `rg` zeigte null Referenzen.
Korrigiert, bevor es im Repo stand — die G-186-Klasse."*

### Meine zwei Rueckfragen waren Messfehler

`[cmd]` `git grep -c LiveWorkout` zeigte drei Treffer in
`ansicht.tsx`, `Start Push B` einen. **Beides sind Kommentare, die
die Aenderung erklaeren** — Zeile 159 traegt *,,Training erfassen"*,
Zeile 966 ist die Definition ohne Aufruf. `[read]` **Haette ich die
Trefferzeilen gelesen statt sie zu zaehlen, waere die Frage nicht
entstanden.**

### Zum toten Entwurf

`[read]` **`LiveWorkout` bleibt vorerst stehen** — er zeigt die
Zielgestalt (Pausenuhr, PR-Marke, Zielvorgabe), die das Formular nicht
hat. **Als Vorlage benannt, nicht als Attrappe getarnt.** Wenn die
Zielgestalt gebaut ist, faellt er.

**Abgenommen.**

