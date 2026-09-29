---
nr: A-81
typ: befund
modul: quer
schwere: hoch
angelegt: 2026-09-29

braucht: []
quellen:
  - docs/punkte/00-LIESMICH.md
  - docs/punkte/00-INDEX.md

beruehrt:
  tabellen: []
  dateien:
    - docs/punkte/00-LIESMICH.md
    - docs/punkte/laufend_codex/next
    - docs/punkte/laufend_claudecode/next

zahlen:
  gemessen: 2026-09-29
  next_ordner: 2
  darin_vorbereitet: 0
  leer_seit_tagen: 30
  laufende_punkte_mit_auftragsteil: 0
  von_laufenden_punkten: 2
---

# A-81 - der Zyklus steht seit dem 30.08. geschrieben und laeuft nicht

## Der Befund

`[cmd]` **Gemessen 2026-09-29:**

    docs/punkte/laufend_codex/next/          existiert, nur .gitkeep
    docs/punkte/laufend_claudecode/next/     existiert, nur .gitkeep
    vorbereitete Auftraege darin                                  0
    laufende Punkte mit einem Auftragsteil in der Datei       0 von 2

`[cmd]` **`00-LIESMICH.md:405-463` beschreibt beides seit dem
2026-08-30**, auf Toms Vorschlag, mit seinem Wortlaut. **Dreissig Tage,
null Nutzung.**

## Was dort steht, und was ich stattdessen getan habe

`[cmd]` **`00-LIESMICH.md:22-41`, Der Weg eines Punktes, Schritt 2:**

> ,,Beauftragt — der Orchestrator reichert *dieselbe Datei* um den
> Auftragsteil an und verschiebt sie nach `laufend_<agent>/`. Tom
> bekommt die Anweisung mit dem Pfad zur Datei."

`[read]` **Drei Vorgaben in einem Satz, und ich habe alle drei
verletzt:**

    Vorgabe                          was ich tat
    ------------------------------   ------------------------------
    Auftragsteil in die Datei        Auftrag als Text im Gespraech
    verschieben BEIM Beauftragen     verschoben, NACHDEM er raus war
    Tom bekommt den PFAD             Tom bekam die Nummer

`[cmd]` **Und `00-LIESMICH.md:444-463`, Der Zyklus laeuft ohne
Aufforderung**, sieben Schritte, Toms Wortlaut vom 30.08.: *,,du
spielst nun jedesmal den vollen cycle durch ohne mein befehl"*.
**Schritt 7 ist ,,next/ wieder fuellen", und fertig ist, wenn Schritt 7
steht.**

`[read]` **Ich habe Schritt 7 nie gemacht** — und deshalb musste Tom am
28. und 29.09. mehrfach ,,beide agenten sind frei gib mir die naechsten
auftraege" schreiben. **Das ist die Aufforderung, die es laut Regel
nicht braucht.**

## Die Kollision war die Folge, nicht die Ursache

`[cmd]` **Am 28.09. ging G-522 um 18:03 raus, und der Orchestrator
verschob die Datei danach.** Der Agent schrieb seinen Bericht in den
Pfad, den er beim Lesen gesehen hatte; dort lag nichts mehr, und es
entstand eine zweite Datei ohne Frontmatter.

`[cmd]` **Am 29.09. um 08:00 derselbe Zug, dieselbe Reihenfolge** —
diesmal bei G-519 und G-514.

`[read]` **Eine erste Fassung dieses Punktes nannte als Ursache, dass
Agenten Punkte ueber den Pfad finden, und schlug ein Werkzeug vor, das
aus einer Nummer den Pfad gibt.** `[read]` **Das war die teure Antwort
auf das falsche Problem.** Die Regel sagt: erst verschieben, dann
beauftragen, und die Anweisung traegt den Pfad. **Dann gibt es keinen
veralteten Pfad, den jemand aufloesen muesste.**

## Was der Vierstufen-Zyklus loest, wenn man ihn fahrt

    todos/                    offen, kein Auftrag geschrieben
    laufend_<agent>/next/     Auftrag geschrieben, noch nicht raus
    laufend_<agent>/          laeuft
    erledigt/                 abgenommen

`[read]` **Toms Begruendung vom 30.08. steht daneben:** waehrend ein
Agent arbeitet, hat der Orchestrator Zeit, und die gehoert in den
naechsten Auftrag. **Und wenn der Bericht kommt, laesst sich der
vorbereitete Auftrag noch anpassen — oft aendert ein Bericht die
Praemisse des naechsten.**

`[cmd]` **Genau das ist am 29.09. eingetreten:** Codex' Bericht zu
C-554 hat die Praemisse von G-519 A5-A8 geaendert (die Ratenspalte ist
live, `phase_rate_rules` aber leer). **Haette ein vorbereiteter Auftrag
in `next/` gelegen, waere er angepasst worden statt neu geschrieben.**

## Nachweiszeilen

**A1** — **Ab sofort fahren, nicht bauen.** Die Reihenfolge je Auftrag:
Auftragsteil in die Punktdatei, Datei nach `laufend_<agent>/`, DANN
Tom die Anweisung mit dem Pfad. **Nichts davon braucht Werkzeug.**

**A2** — **Die zwei laufenden Punkte nachtraeglich vervollstaendigen:**
G-519 und G-514 bekommen ihren Auftragsteil in die Datei, damit Auftrag,
Bericht und Befund in einer Datei stehen, wie es die Regel verlangt.

**A3** — **`next/` fuellen, und zwar jetzt.** Das ist Schritt 7, und er
ist seit dreissig Tagen offen.

**A4** — **ERLEDIGT am 2026-09-29, und zwar gegen den Verdacht.**
Eine erste Fassung dieser Zeile hielt fuer moeglich, dass die in
`00-LIESMICH.md:430` beschriebene Zaehlung nie gebaut wurde — gemessen
war nur, dass der Waechter die Zeile bei 0 vorbereiteten Auftraegen
nicht ausgibt.

`[cmd]` **Mit zwei vorbereiteten Auftraegen meldet er sie:**
*,,[punkte] 2 vorbereitet, noch nicht raus: codex 1 | claudecode 1"*.

`[read]` **Die Beschreibung war richtig, der Verdacht falsch.** Ein
stummer Waechter bei Sollstand 0 ist kein fehlender Waechter — und
,,aus der Existenz folgt nicht die Funktion" gilt in beide Richtungen:
aus dem Schweigen folgt auch keine Abwesenheit. **Die Gegenprobe war,
den Zustand herzustellen, den er melden soll.**

**A5** — **`00-LIESMICH.md` bekommt den Kopf eines Auftrags und die
Reihenfolge an EINER Stelle.** Heute steht der Kopf bei Zeile 276, der
Weg bei Zeile 22 und der Zyklus bei Zeile 444. **Wer bei 276 anfaengt,
liest die Reihenfolge nicht.**


**A6** — **Die Schrittfolge des Zyklus ist selbst falsch, gemessen am
2026-09-29.** `00-LIESMICH.md:444` nennt Schritt 4 *,,Abnahme schreiben,
nach `erledigt/`"* und erst Schritt 6 *,,committen, Commit-Hash
nachtragen"*.

`[cmd]` **In dieser Reihenfolge geht es nicht:** G-519 nach `erledigt/`
verschoben, ohne `commit:`, machte `punkte-pruefen.mjs` rot — 26
Befunde, Soll 25. **Und weil der Waechter im Gate steht, blockiert das
rote Gate genau den Commit, der den Hash liefern soll.** Ein Zirkel.

`[read]` **Der Waechter hat recht:** `erledigt/` behauptet belegt UND
gelandet; ein Punkt dort ohne Hash behauptet mehr, als er hat.
**Also: Abnahme in Schritt 4, Umzug nach `erledigt/` in Schritt 6,
zusammen mit dem Hash.** `00-LIESMICH.md:444-463` ist entsprechend
nachzuziehen.

`[read]` **Und es ist kein Zufall, dass das erst heute auffiel:** der
Zyklus ist heute zum ersten Mal gefahren worden.

## Was dieser Punkt nicht ist

`[read]` **Keine Werkzeuglücke und kein Agentenfehler.** Die Regel war
da, vollstaendig, mit Toms Wortlaut und einer Begruendung. **Der
Orchestrator hat sie nicht gelesen und stattdessen einen eigenen Ablauf
gefahren, der bei jedem Auftrag dieselbe Kollision erzeugt.**

`[read]` **Und die Lehre ist unangenehmer als ein Befund:** vor jedem
Auftrag vier Quellen zu pruefen ist Regel — `00-LIESMICH.md` ist eine
davon und wurde uebersprungen, waehrend derselbe Orchestrator Waechter
baute, die genau solche Auslassungen finden sollen.
