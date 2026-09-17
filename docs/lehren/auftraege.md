# Auftraege

## Keine Ursachenvermutung im Auftrag

Tom, 2026-09-08: *,,wie waers, wenn du das raten weglaesst und die
tokens sparst und einfach den agenten arbeiten laesst?"*

`[cmd]` **An einem Tag vier Auftraege mit einer vermuteten
Ursache ? alle vier widerlegt:**

    G-413  "ersterLauf blockiert den Filter"   falsch
           "start ist ungefiltert"             falsch
    G-421  "vier Reiter fehlen"                falsch,
           es waren Umbenennungen
    C-462  "vier Tabellen fehlen"              falsch,
           drei gab es unter anderem Namen

`[read]` **Der Agent misst die Vermutung, widerlegt sie, und
schreibt das in den Bericht** ? **Arbeit, die niemand
gebraucht hat.**

`[read]` **Und schlimmer: eine falsche Ursache im Auftrag lenkt.**
`[cmd]` **G-413 hat zuerst genau dort gemessen, wo ich gezeigt
habe** ? **die echte Ursache lag im Konto.**

### Was in einen Auftrag gehoert

    Was Tom sieht oder will   woertlich
    Wo die Vorlage steht      Pfad, Zeile
    Was gemessen IST          nur mit [cmd] und nur,
                              was ich selbst gemessen habe
    Was nicht angefasst wird  Bereiche, Dev-Server
    Abnahmebedingungen        was belegt sein muss

### Was NICHT hineingehoert

`[read]` **Die vermutete Ursache.**

`[read]` **Zeilennummern als *,,der Verdacht liegt hier"*** ?
**ein Hinweis, wo etwas STEHT, ist in Ordnung; ein Hinweis,
warum es falsch ist, nicht.**

`[read]` **Zahlen aus Werkzeugen, die ich nicht nachgemessen
habe** ? `vollstaendigkeit.mjs` **misst NAMEN, nicht Bestand.**

`[read]` **Und keine Loesung** ? **wer die Loesung in den Auftrag
schreibt, bekommt sie gebaut, auch wenn sie falsch ist.**

### Warum das gilt

`[read]` **Der Agent ist am Code, der Orchestrator ist es
nicht.**

`[cmd]` **Fuenfmal an einem Tag hat der Orchestrator einen Namen
geraten** ? `scores`, `lab_result_values`, `modality_log`,
`body`, `CompositionTab`.

`[read]` **Jedes Mal hat ein Agent es aufgefangen.**

`[read]` **Das ist die richtige Rollenverteilung ? aber sie
kostet einen Durchlauf, den man sparen kann.**

## Vor jedem Auftrag: die Punkte durchsuchen

Tom, 2026-09-08: *,,und wieso passiert sowas? beschaeftigungs-
therapie, weil du nicht sauber recherchierst?"*

`[cmd]` **C-469: der Auftrag verlangte 26 Formeln.**

`[cmd]` **21 existierten. Fuenf waren ENTSCHIEDEN:**

    ACWR, calcTrainingLoadScore
      -> C-181, abgenommen, acwr_decision = implement:no
    MODALITY_BONUS, MAX_DAILY_BONUS, calcModalityBonus
      -> C-167, die Werte sind unbelegte Entwurfswerte

`[read]` **Beide Punkte lagen im Repo. Beide hatte der
Orchestrator am selben Tag gelesen.**

`[cmd]` **Eine Suche nach `ACWR` haette C-181 gefunden** ? **zwei
Minuten gegen zwanzig Minuten Agentenzeit.**

### Dasselbe Muster, vier Mal an einem Tag

    C-462   vier Tabellen "fehlen"   drei unter anderem Namen
    G-421   vier Reiter "fehlen"     alles Umbenennungen
    C-468   "zwei Ebenen"            es sind vier
    C-469   26 Formeln "fehlen"      21 da, 5 entschieden

`[read]` **Immer dieselbe Quelle: ein Werkzeug zaehlt NAMEN, der
Orchestrator liest das Ergebnis als BESTAND.**

### Die Regel

    Vor jedem Auftrag: jeden genannten Namen in
    docs/punkte/ suchen.

    Ein Treffer in erledigt/ heisst: es gibt eine
    Entscheidung. Sie gilt.

    Ein Treffer in todos/ heisst: die Frage ist bekannt
    und offen. Sie gehoert in den Auftrag.

`[cmd]` **`git grep -l "<Name>" -- docs/punkte/`** ? **ein
Aufruf.**

`[read]` **Und wenn ein Werkzeug eine Zahl nennt: die Zahl
NICHT in den Auftrag schreiben, ohne zwei Stichproben davon
selbst geprueft zu haben.**

`[cmd]` **`vollstaendigkeit.mjs` misst Namen. `104-muskelkarte.md`
zaehlt Muskeln, nicht Pfade. `pg_stat_user_tables` ist
veraltet.**

`[read]` **Drei Werkzeuge, drei Fallen, alle an einem Tag
zugeschnappt.**

## Vor jedem Auftrag: `/clear` ja oder nein

Tom, 2026-09-08: *,,ok, von jetzt an sagst du mir vor dem auftrag,
ob ich /clear machen muss."*

**Die Ansage gehoert AN TOM, VOR den Auftragstext** ? **NICHT
in den Codeblock.**

`[cmd]` **2026-09-08 falsch gemacht:** **`/clear NEIN` stand als
erste Zeile IM Auftrag.**

`[read]` **Claude Code liest das als Anweisung an sich selbst** ?
**und weiss nicht, was er damit soll.**

**Richtig:**

    Orchestrator an Tom, vor dem Codeblock:
      "Kein /clear -- er kommt direkt aus G-423."
      oder
      "Mach /clear -- neues Modul."

    Im Codeblock steht NICHTS davon.

`[read]` **Der Auftrag enthaelt nur, was der Agent tun soll.**

### Wann NEIN

`[read]` **Der Auftrag liegt im selben Modul wie der vorige.**

`[read]` **Oder er baut auf einer Messung auf, die der Agent
gerade gemacht hat** ? **dann waere ein `/clear` teurer, weil er
sie wiederholen muesste.**

`[cmd]` **Beispiel: G-423 (Injektionskonfiguration) -> G-389
(Injektion erfassen)** ? **dieselben Tabellen, dieselben
Funktionen.**

### Wann JA

`[read]` **Der Gegenstand wechselt** ? **von Supplements nach
Coach, von der Datenbank in die Oberflaeche.**

`[read]` **Oder der Kontext ist lang und der neue Auftrag braucht
nichts davon.**

**Und dann gehoert der Wiedereinstieg mit in den Auftrag:**

    Lies zuerst docs/sessions/<datum>-uebergabe.md und
    docs/lehren/ -- besonders auftraege.md, messen.md
    und werkzeuge.md.

### Was ein `/clear` KOSTET

`[read]` **Der Agent verliert, was er selbst gelernt hat** ?
**nicht nur, was in den Punktdateien steht.**

`[cmd]` **2026-09-08, Claude Code an einem Tag:** **die
Konstanten-Falle (`'use client'` zieht `next/headers` mit), die
Bildpunkt-Messung statt Vermutung, die Gegenprobe in beide
Richtungen.**

`[read]` **Das steht in seinen Skill-Dateien** ? **aber der
Zusammenhang, in dem es galt, nicht.**

## Ein Waechter gehoert zum Auftrag, nicht danach

Tom, 2026-09-08: *,,ich muss nicht verstehen, dass wir immer und
immer wieder an waechtern rumbasteln. das ist part eines jeden
einzelnen jobs ? wenn ein waechter gebraucht wird, dass der
sauber laeuft und den auftrag damit abschliesst."*

`[cmd]` **Was heute passiert ist:**

    C-470  baut den Rechte-Waechter
           -> er meldet fuenf Abweichungen
    C-473  raeumt vier davon weg
           -> eine bleibt
    C-480  liegt bei Tom

`[cmd]` **Und `migration-datenlogik-pruefen.mjs` ist seit C-428
rot** ? **fuenfzehn Migrationen lang hat ihn niemand gruen
hinterlassen.**

**Die Regel:**

    Wer einen Waechter baut oder anfasst, laesst ihn GRUEN
    zurueck.

    Wer eine Abweichung findet, die er nicht beheben darf,
    traegt sie in den SOLLSTAND ein -- mit Grund.

    Ein Auftrag ist nicht fertig, solange sein Waechter rot
    ist.

`[read]` **Ein roter Waechter meldet nichts mehr** ? **wer ihn
laufen laesst, sieht ohnehin eine Liste und liest sie nicht.**

`[cmd]` **`punkte-pruefen.mjs` zeigt die richtige Bauform:**
**25 Befunde als Sollstand, gruen, und JEDER neue faellt auf.**

### Was das fuer den Auftragstext heisst

`[read]` **Die Abnahmebedingung heisst nicht mehr *,,der Waechter
laeuft"*.**

`[read]` **Sie heisst:** *,,der Waechter ist GRUEN, oder jede
rote Zeile steht mit Grund im Sollstand."*

`[read]` **Und wenn eine Abweichung Toms Entscheidung braucht:
melden UND in den Sollstand** ? **nicht rot liegenlassen, bis
jemand entscheidet.**

## Die Sprachregel gehoert in jeden Tabellenauftrag

Tom, 2026-09-08: *,,und wo sind unsere sprachregeln? db immer
de/en/th spalten anlegen und nur de und en einfuegen."*

`[cmd]` **Die Regel steht in
`docs/spezifikation/10-plattform/konventionen/00-konventionen.md`,
Abschnitt 1** ? **seit langem.**

`[cmd]` **Der Orchestrator hat sie in VIER Auftraegen nicht
genannt:** **C-468, C-479, C-484, C-485.**

`[cmd]` **Folge: `public.koerperflaechen` hat `name_de` und
`name_en`, kein `name_th`** ? **an drei Tagen dreimal
angefasst.**

`[cmd]` **Und im ganzen Schema:** `_de` 123, `_en` 101, `_th`
91.

**Die Regel:**

    Jeder Auftrag, der eine Tabelle mit Nutzertext baut,
    nennt die drei Spalten.

    de und en werden gefuellt, th bleibt leer.

    Eine leere Spalte ist eine sichtbare Luecke.
    Eine fehlende Spalte ist ein Umbau.

`[read]` **Und wo eine Tabelle KEINEN Nutzertext traegt: in den
Sollstand, mit Grund** ? **nicht stillschweigend weglassen.**

## Ein Etikett ist eine Aussage ueber die Quelle

Tom, 2026-09-08: *,,oben steht echte daten... das ist verarschend
gegenueber mich. ich rackere mich hier ab und mir wird irgendwas
serviert aus den haenden gezogen und als echte daten verkauft."*

`[cmd]` **`recovery`, Reiter *Muscle map*: die Kachel traegt
`echte Daten`.**

`[cmd]` **`motor.ts:135` traegt achtzehn FESTE Zeilen, im Code
selbst als `module-recovery-engine.jsx:135-154` ausgewiesen.**

`[read]` **Der Muskelkater kommt aus `checkins`, die Stunden und
Saetze aus dem Mockup** ? **ein gemischter Zustand, der sich als
echt ausgibt.**

### Warum der Waechter es nicht sah

`[cmd]` **Der Attrappenwaechter sucht `ATTRAPPE`-Marken in der
ANSICHT.**

`[read]` **Eine feste Tabelle im RECHENWEG traegt keine Marke** ?
**sie sieht aus wie Code.**

`[read]` **Und G-438 hat die Zahlen sogar noch VERTEILT** ?
**geliehene Werte an Kinder, mit Herkunftsangabe.**

`[read]` **Die Herkunft war `Wert von Triceps`** ? **nicht *,,aus
einer Mockup-Tabelle"*.**

### Die Regel

    Ein Etikett "echte Daten" ist eine Aussage ueber die
    QUELLE, nicht ueber die Ansicht.

    Wer es setzt, belegt den Weg von der Tabelle bis zur
    Zahl.

    Ist ein Teil des Wegs geschaetzt oder fest, sagt das
    Etikett es.

`[read]` **Und beim Abnehmen: nicht die Marke zaehlen, sondern
den Rechenweg lesen.**

`[cmd]` **Der Orchestrator hat G-433, G-435, G-436 und G-438
abgenommen, ohne zu fragen, woher `MUSCLE_STATE` kommt** ? **vier
Auftraege lang.**

## Der Auftrag beschreibt das ZIEL, nicht den Befund

Tom, 2026-09-08:

> ich bin es echt leid, immer und immer wieder deine auftraege
> korrigieren zu muessen

`[cmd]` **Zwei Belege vom selben Tag:**

    G-454   Kategorie und Form gebaut
            -- die Allergien vergessen, obwohl sie im
               SELBEN Filterkasten stehen
    C-496   nur die Makros gemappt
            -- Wirkstoffe und Hilfsstoffe nicht genannt,
               obwohl die Tafel sie zeigt

`[read]` **Beide Male: gefragt *,,was ist kaputt?"* statt
*,,was muss am Ende funktionieren?"*.**

### Die Regel

    Vor jedem Auftrag steht EIN Satz, was der Nutzer
    danach tun koennen muss.

`[read]` **Bei G-454 waere das gewesen:** *,,Tom filtert auf
Protein, Kapsel, ohne seine Allergene, und es ist schnell."*

`[read]` **Dann faellt auf, was fehlt** ? **die Allergien,
mehrere Marken, die Speicherung.**

`[read]` **Der Befund ist der ANLASS, nicht der Umfang.**

## Die Grenze: Filter gehoeren in die Datenbank

Tom, 2026-09-08:

> die filter gehoeren in supabase rein und nicht in die ui,
> die ui fuehrt nur aus

`[cmd]` **Gemessen, was daraus wurde:** **`tab-produkte.tsx`
filtert an drei Stellen selbst, die Oberflaeche holt Treffer
und wirft sie weg.**

`[read]` **Folge:** *,,er sucht sich dumm und daemlich fuer
resultate, das ist alles viel zu lahm"*.

### Die Regel

    Jeder Filter ist ein PARAMETER der Datenbankfunktion.
    Die Oberflaeche setzt ihn und zeigt das Ergebnis.
    Sie filtert nie selbst.

`[read]` **Und was der Nutzer einstellt, wird gespeichert** ?
**sonst faengt er nach jedem `Strg-F5` von vorn an.**

`[read]` **Das ist keine Auftragsfrage mehr** ? **es steht hier,
damit es nicht von der Tageslaune abhaengt.**

## Modul-Vorlieben sind keine zweite Wahrheit

Tom, 2026-09-08:

> jetzt sind wir wieder an dem punkt, wo ich vor tagen gesagt
> habe, jedes modul braucht seine preferences und du nein
> gesagt hast

`[read]` **Mein Argument war *,,zwei Orte, zwei Wahrheiten"*.**

`[read]` **Das gilt fuer DIESELBE Sache** ? **nicht fuer
modulspezifische Einstellungen, die es nur dort gibt.**

`[cmd]` **`nutrition.food_preferences` traegt `diet_type`,
`cooking_skill`, `prep_time_max_min`, `budget_level`** ? **die
gibt es in keinem anderen Modul.**

### Die Unterscheidung

    dieselbe Sache    -> EIN Ort, alle lesen ihn
                         (Allergien: public.user_allergies)
    modulspezifisch   -> je Modul eine Vorliebentabelle
                         (Kochzeit, Lieblingsmarken)

`[read]` **Und eine Flaeche darf eine fremde Wahrheit ZEIGEN
und aendern lassen** ? **`nutrition/preferences` tut das mit
den Allergien (G-455), ohne sie zu kopieren.**

`[read]` **Zeigen ist nicht Speichern.**

