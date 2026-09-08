# Rolle und Ablauf

Belege zu den Regeln in `CLAUDE.md`. **Wer eine Regel anwendet,
liest hier den Grund** ? die Regel allein sagt nicht, warum sie
entstanden ist.

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
| In welcher Reihenfolge, und warum? | `docs/spezifikation/00-MODULPLAN.md` |
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

## Der Auftrag geht raus, bevor abgenommen wird

**Tom, 2026-09-02, dreimal an einem Tag:** *,,und wieder vergessen
den neuen auftrag zu geben."*

`[read]` **Der Zyklus hat eine feste Reihenfolge, und der zweite
Schritt wird uebersprungen, weil der Bericht interessanter ist als
die Verwaltung:**

    Bericht kommt
      1  Kurzcheck: ist ein vorbereiteter Auftrag betroffen?
      2  AUFTRAG RAUS -- der Agent wartet
      3  Abnahme mit eigener Messung
      4  Befunde als Punkte
      5  committen, getrennt nach Agentenbereich
      6  next/ fuellen

`[read]` **Schritt 2 kostet eine Minute, Schritt 3 zwanzig.**
**Wer zuerst abnimmt, laesst einen Agenten zwanzig Minuten
stillstehen.**

`[cmd]` **Seit A-68 misst ein Waechter es:** `punkte-pruefen.mjs`
meldet **ACHTUNG**, wenn ein Agent null laufende Punkte hat und
mindestens einen in `next/`.

`[read]` **Er steht im Punktelauf, den der Zyklus ohnehin macht.**

## Ein Bericht wird abgearbeitet, bevor der naechste Auftrag geht

**Tom, 2026-08-30:** *,,abarbeiten, ergaenzen, in erledigt ablegen"*.

**Tom, 2026-08-30, praezisiert:** *,,report kommt, kurzanalyse ob
folgeauftrag betroffen, allfaellige anpassung, auftrag raus und dann
berichte abarbeiten"*.

**Und derselbe Tag, als stehender Ablauf:** *,,du spielst nun
jedesmal den vollen cycle durch ohne mein befehl, sprich du bist
fertig wenn berichte kurzcheck, neue auftraege raus, berichte check
und abarbeiten, neue next drin sind"*.

`[read]` **Kommt ein Bericht, laeuft der Zyklus ohne Aufforderung.**
**Er ist erst zu Ende, wenn `next/` wieder gefuellt ist.**

    1  Bericht ueberfliegen: ist der vorbereitete Auftrag betroffen?
    2  falls ja: anpassen
    3  Auftrag aus laufend_<agent>/next/ eine Ebene hoeher, raus
    4  DANN abarbeiten:
         nachmessen, was der Bericht behauptet
         Abnahme in die Punktdatei
         Datei nach erledigt/
         neue Befunde als Punkte
         committen, Commit-Hash nachtragen

`[read]` **Der Agent wartet nicht, waehrend der Orchestrator
abnimmt.** `[cmd]` **Und weil der naechste Auftrag vorbereitet in
`next/` liegt, ist Schritt 3 ein Verschieben, kein Schreiben.**

`[read]` **Der Ordner bleibt trotzdem ehrlich:** ein fertig
gemeldeter Punkt liegt hoechstens Minuten in `laufend_*`, **nicht bis
zum naechsten Gespraech.**

### Wann der Zyklus zu Ende ist

    laufend_*/          nur was wirklich laeuft
    erledigt/           jeder Bericht abgenommen, mit Commit-Hash
    laufend_*/next/     je Agent ein Buendel vorbereitet
    Waechter            gruen
    neue Befunde        als Punkte angelegt

`[read]` **Fehlt eines davon, ist der Zyklus nicht fertig** — auch
wenn niemand nachfragt.

### Was keine Frage an Tom ist

**Tom, 2026-08-30:** *,,entscheidungen sind gefallen was soll denn
nun noch dazu sagen? umsetzen und ablegen oder was? ich sehe den
punkt nicht was du von mir willst?"*

`[cmd]` **Anlass: C-357.** Vier ADRs widersprachen neueren
E-Entscheidungen. `[read]` **Die Sachfragen waren entschieden** —
E-11, E-16, E-20, E-29, E-30, E-35. **Was fehlte, war ein Vermerk in
`docs/`, und `docs/` gehoert dem Orchestrator.**

`[read]` **Eine Aufraeumarbeit als Entscheidung vorzulegen kostet Tom
Zeit und bringt nichts.**

**Vor jeder Vorlage: ist die Sachfrage offen, oder nur ihre
Ausfuehrung?**

    Sachfrage offen      vorlegen
    nur Ausfuehrung      machen
    Ausfuehrung in docs/ immer machen

`[read]` **Und die Gegenprobe:** koennte ich die Frage selbst
beantworten, ohne etwas zu erfinden? **Dann ist es keine Frage.**

### Was den Zyklus unterbricht

`[read]` **Nur eines: wenn ein Bericht eine Entscheidung braucht, die
Tom gehoert.**

`[cmd]` **Beispiele vom 30.08.:** die zwei Magnesium-Obergrenzen
(C-350), der Katalog ohne deutsche Namen (C-352), Thai ohne Aliase
(C-177).

`[read]` **Dann laeuft der Zyklus trotzdem weiter** — der Punkt geht
nach `todos/` mit dem gemessenen Stand, **und die Frage wird
vorgelegt.** **Der Agent wartet nicht auf eine Entscheidung, die er
nicht braucht.**

### Warum

`[cmd]` **Am 30.08. lagen die Berichte zu C-163 und C-351 vor, und
der Orchestrator schrieb zuerst zwei neue Auftraege.** `[read]` **Tom
sah `laufend_codex/` mit sechs Dateien, von denen zwei laengst fertig
waren** — **derselbe Zustand, den die alte `LAUFEND.md` am 23.08.
erzeugt hat und der sie das Leben gekostet hat.**

`[read]` **Der Ordner ist die Wahrheit ueber den Zustand.** **Wer ihn
nicht raeumt, macht ihn zur Luege.**

## Der Auftrag beschreibt den Job, der Agent misst

**Tom, 2026-08-28:** *,,beschreib den job und lass die agents
messen"*.

`[read]` **Ein Auftrag traegt die Frage und die Messanweisung — keine
Zahl, keine Diagnose, keine Ursache vom Orchestrator.**

    falsch   "food_search kennt zehn Sortierwerte, bau sie ein"
    richtig  "miss, welche Sortierwerte die laufende Funktion kennt,
              und bring sie in die Oberflaeche"

    falsch   "die 6,4 Sekunden kommen von einer RPC-Schleife"
    richtig  "der Reiter laedt in 6,4 s - miss, woran es liegt"

### Warum

`[cmd]` **Am 28.08. sind fuenf Auftragspraemissen gefallen**, und die
Ursache war jedes Mal dieselbe: **gemessen und dann etwas anderes
behauptet.**

`[cmd]` **Der klarste Fall, G-245/G-70:** ich hatte beide Zahlen
gemessen — **live vier Sortierwerte, im Kettenschritt zehn** — und in
den Auftrag die falsche geschrieben. **Nicht falsch gemessen. Falsch
verwendet.**

`[cmd]` **Bei G-107:** die Ladezeit einer RPC-Schleife zugeschrieben,
**die ich nie gesucht habe.** Codex hat gemessen: **es gibt keine.**

`[read]` **Ein Kettenschritt ist nicht live.** Zweimal an einem Tag
verwechselt — bei C-331 in die andere Richtung.

## Die Abnahme misst nach, was der Bericht behauptet

`[read]` **Nicht was der Orchestrator vermutet.** **Der Bericht sagt,
was zu pruefen ist** — jede tragende Zahl darin wird gegen die
Datenbank oder den Code gehalten.

`[cmd]` **Das hat am 28.08. zweimal etwas gefunden, das sonst
durchgegangen waere:** 16 statt 12 Doppelzeilen in G-239, und
`nutrition_targets` liegt in `goals`, nicht in `nutrition`.

`[read]` **Der Unterschied zum Auftrag:** in der Abnahme wird eine
Zahl **verglichen**, im Auftrag wird eine **gesetzt.** **Das Setzen
geht schief, das Vergleichen nicht.**

`[cmd]` **Und ohne eigene Messung entsteht A-57:** 25 Punkte per
Textheuristik geschlossen, **mindestens zwei falsch** — gefunden von
einem Agenten, der eine Anweisung verweigert und selbst gemessen hat.

**Weicht die Zahl des Orchestrators ab, gilt die des Agenten**, bis
eine dritte Messung entscheidet.

## Der Orchestrator zaehlt nicht

**Tom, 2026-08-27:** *,,11 von 12 falsch sagt mir du kannst es einfach
nicht also lass es die tun die es koennen"*.

**Ein Auftrag traegt die Frage und die Messanweisung — keine Zahlen
vom Orchestrator.**

`[cmd]` **Am 27.08. lagen meine Zaehlungen elfmal daneben, jedes Mal
beim Abgrenzen einer Kategorie** — 27 statt 18 Attrappen (`git grep
-c` zaehlt Zeilen), 5 statt 7 Tabellen (ein Regex loest keine View
auf), 124 statt 380 Wirkstoffe, 31 statt 20 Regeln (Textsuchtreffer
fuer eine Kategorie gehalten), 3 statt 1 Schreibstelle, 47 statt 43
Punkte, 244 statt 221 Datumsangaben (`null` ist ein Zeichen).

`[read]` **Der Befund, der es entscheidet:** in jedem Fall haette der
Agent dieselbe Zahl gemessen, auch ohne meine. **Meine Zahl hat nie
etwas beigetragen — nur einen Umweg erzeugt.**

**Was der Orchestrator weiter prueft: ob das Ziel existiert und nicht
schon erledigt ist.** `[cmd]` Viermal hat das einen Auftrag gerettet
— G-207, G-211, G-138, G-176. `[read]` **Das ist eine Ja/Nein-Frage,
keine Zaehlung.**

**Formulierung:**

    frueher   ,,Es sind 31 Regeln, pruef das."
    jetzt     ,,Miss, wie viele Regeln ueber `drug_class` gehen -
               und sag mir, wie du abgegrenzt hast."

`[read]` **Die Abgrenzung mitzuverlangen ist der Kern** — genau dort
ging es bei mir jedes Mal schief.

**Die alte Regel bleibt gueltig, wo Zahlen unvermeidbar im Auftrag
stehen** (etwa aus einem fremden Bericht): dann sind sie
Ausgangsvermutungen, und die gemessene gilt.

## Nach jedem Bericht: nachtragen, ungefragt

**Tom, 2026-08-19:** *,Und Todolisten, Docs und SSOT nachtragen — das
ist dein automatischer Job."*

`[cmd]` **Am 2026-08-19 fehlten vier Indexzeilen** — 123, 126, 128, 131.
**Gefunden hat sie ein Agent, nicht der Orchestrator.**

### Was nach jedem Bericht geschieht

**1. Pruefen, nicht glauben.** `[cmd]` Die tragenden Zahlen selbst
messen. **Ein Bericht ist eine Behauptung, bis der Befehl gelaufen ist.**

**2. Committen** — ein logischer Change, `git diff --cached
--name-only` vorher lesen.

**3. Den Punkt schliessen** in `docs/todo/TODO.md`, mit dem Abschluss
nach `ERLEDIGT.md`. `[read]` **Mit den gemessenen Zahlen, nicht mit der
Zusammenfassung.**

**4. Neue Befunde anlegen** — jeder Fund, den der Bericht nennt und der
nicht erledigt ist, **wird ein Punkt.** Sonst geht er verloren.

**5. Die Indexzeile setzen** in `docs/ssot/00-INDEX.md`. `[cmd]`
**Pruefen, ob alle Berichte drinstehen** — nicht nur der neue.

**6. Bei Bedarf `CLAUDE.md` und den Modulplan** — wenn eine Regel
entstanden ist oder sich der Stand verschoben hat.

`[read]` **Nichts davon ist eine Nachfrage wert.** Es geschieht, sobald
ein Bericht eintrifft.

### Die Nummer vergibt der Orchestrator

`[cmd]` **116 bis 119 waren doppelt belegt** (A-18), weil fuenf Agenten
gleichzeitig die naechste freie Zahl nahmen. **Seither steht die Nummer
im Auftrag.**

### Auftraege kommen als kopierbarer Block

**Tom, 2026-08-23:** *„zukuenftig gibts mir auftraege im chat
kopierbar"*

**Der Auftragstext steht in einem Codeblock**, nicht als formatiertes
Markdown mit Tabellen und Hervorhebungen. `[read]` **Der Grund ist der
Weg:** Tom kopiert ihn aus dem Chat in das Fenster des Agenten. Was als
Tabelle gesetzt ist, kommt dort als Zeichensalat an; was fett
ausgezeichnet ist, traegt Sternchen mitten im Satz.

**Nur der Auftrag gehoert in den Block.** Befund, Messung und
Begruendung stehen davor im Fliesstext — die liest Tom, nicht der
Agent.

## Vor jedem Auftrag: nachsehen, nicht annehmen

**Tom, 2026-08-19:** *,Nicht vergessen — immer Specs und das alte Repo
miteinbeziehen und nicht planlos in irgendeine Richtung gehen, und
allfaellig brainstormen mit mir."*

`[cmd]` **Zwei Auftraege sind am 2026-08-19 daran gescheitert.**

**G-79:** Der Auftrag fragte, ob `user_goals` Spalten fuer Prioritaet und
Status habe. `[read]` *,Die Frage war falsch gestellt — beide Spalten
gibt es schon, und `lesen.ts:223` sortiert laengst danach. **Es fehlte
nur der Weg, die Zahl zu setzen.**"

**G-82:** Der Auftrag nannte `score.ts` die Live-Vorschau. `[read]`
*,Die Live-Vorschau benutzte sie nie."* **`tab-checkin.tsx` rechnete mit
der Entwurfsformel — HRV aus der Attrappe, `0.88 * 10` als erfundene
Ernaehrung.** **Nach dem Umbau haette `score.ts` null Aufrufer gehabt.**

`[cmd]` **Dazu die falschen Zahlen:** ,erreicht, offen, verfehlt" bei
den Meilensteinen (alle drei `open`), ,Kreatin 30 Tage" (`stock_unit`
ist `g`, also 6), ,fuenf LOINC-Abweichungen, ein Auftrag von zwanzig
Minuten" (bei Glukose und Vitamin D messen die Codes nicht dasselbe).

### Wo sie liegen: `docs/spezifikation/00-QUELLEN.md`

`[cmd]` **Die Datei sagt je Modul, welche Mockup- und Spec-Dateien es
gibt** — mit Groesse. **49 Mockups (1.725 KB), 120 Specs (1.046 KB).**

`[read]` **Kein Modul hat nur eine Mockup-Datei.** Nutrition hat drei,
Recovery fuenf, Coach acht. **Zwei Auftraege sind daran gescheitert,
dass nur die erste gelesen wurde** (G-98, G-101).

### Die vier Quellen, in dieser Reihenfolge

**1. Der Code** — was existiert schon? `[cmd]` Spalten, Funktionen,
Aufrufer. **Ein `rg` kostet Sekunden.**

**2. Die Daten** — was steht drin? `[cmd]` Zahlen im Auftrag tragen
ihren Stichtag und sind **gemessen**, nicht aus einem alten Bericht
uebernommen.

**3. `docs/specs/`** — was war gedacht? `[read]` **Pruefend lesen:** Die
Fehlerliste (A-20) zaehlt sieben Funde.

**4. `referenz/lumeos-2026/`** — wie wurde es geloest? `[read]` Struktur
uebernehmen, Code nie. **Und nachsehen, warum es ersetzt wurde** — F-04
hat es beim Coach beantwortet: *,Der Klient hatte keine Stimme."*

### Und bei Unklarheit fragen

`[read]` **Ein Auftrag, der auf einer Annahme steht, kostet den Agenten
einen halben Durchgang** — er misst dann erst, was der Orchestrator
haette messen sollen.

`[cmd]` **Besser vorher brainstormen.** Toms Entscheidungen sind
schneller als eine falsche Richtung: Permissions gegen Autonomy, der
Erfahrungsgrad, `alpha = 1` — **alle drei kamen in einem Satz, und alle
drei haetten sonst falsch gebaut werden koennen.**

## `docs/ssot/` ist die Wahrheit, nicht `docs/punkte/`

**Tom, 2026-09-08:** *,,du hast die struktur vorbereitet, du hast
definiert was ssot ist, du hast punkte neu fuehren wollen ? aber am
ende ist ssot die einzige single source of truth."*

`[cmd]` **Gemessen 2026-09-08:** **letzter Commit in `docs/ssot/`
am 27.08., seither 112 Commits in `supabase/` und `apps/`.**

`[cmd]` **171 Dateien, die meisten vom 17. bis 19.08.**

`[read]` **Der Orchestrator hat die Struktur gebaut, die Rangfolge
hineingeschrieben ? und dann nur die Punkte gepflegt.**

### Warum es passierte

`[read]` **Die Punkte sind taeglich noetig:** **ein Auftrag muss
raus, ein Bericht abgenommen, ein Befund festgehalten.**

`[read]` **Die SSOT ist es nicht** ? **niemand fragt sie waehrend
der Arbeit, und kein Waechter prueft ihr Alter.**

`[cmd]` **`punkte-pruefen.mjs` misst 25 Befunde und den
Kettenlauf.** `[cmd]` **Nicht, ob die SSOT den Stand kennt.**

### Die Regel

`[read]` **Tagsueber: Punkte.** `[read]` **Zum Abschluss:
nachtragen.**

`[read]` **Was gebaut wurde, gehoert in `docs/ssot/`** ? **je Modul,
mit Datum und Commit.**

`[read]` **Ein Punkt sagt *,,C-419 ist abgenommen"*.** `[read]`
**Die SSOT sagt *,,das Wallet hat 13 Tabellen"*.** `[read]` **Das
Zweite ueberlebt den Punkt.**

