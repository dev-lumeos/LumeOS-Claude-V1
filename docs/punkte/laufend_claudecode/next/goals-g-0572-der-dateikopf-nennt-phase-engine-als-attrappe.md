---
nr: G-572
typ: fehler
modul: goals
schwere: mittel
angelegt: 2026-10-01

braucht: []
kind_von: G-532

quellen:
  - docs/punkte/todos/goals-g-0532-der-bauplan-fuer-die-letzten-drei-reiter.md
  - docs/ssot/116-goals-anbindung.md

beruehrt:
  dateien:
    - apps/web/src/app/v2/goals/ansicht.tsx
---

# Der Dateikopf nennt Phase engine als Attrappe, und das ist seit Tagen falsch

## Der Befund

`[cmd]` **`apps/web/src/app/v2/goals/ansicht.tsx:38-41`:**

    // `[cmd]` Was hier bleibt, ist Attrappe: Timeline, Phase engine,
    // Cross-module, Physique ratios, Pose sessions — und der groessere
    // Teil des Adaptive-TDEE-Tabs.

`[cmd]` **In derselben Datei, Zeile 616**, steht der `ReferenzTrenner`
fuer *Phase engine* — also **nach** dem echten Teil. Darueber rendern
`PhaseEcht`, `PhaseBeginnen`, `PhaseBeenden`, `PhaseVorschlag`, der
Editor (G-539), die Zeitachse (G-544) und seit heute der
Einheitenschalter (G-565). **Der Reiter ist nicht Attrappe, er hat eine
Attrappe unter dem Trenner.**

`[read]` **Das ist die Fehlerklasse, die in den Projektregeln steht:**
ein `[cmd]` mit falscher Zahl ist schlimmer als ein `[annahme]`, weil
die Marke geglaubt wird. **Und dieser hier steht im Kopf der
Hauptansicht** — wer die Datei oeffnet, liest ihn als Erstes und haelt
den Reiter fuer leer. Genau diese Verwechslung hat die erste Fassung von
G-532 produziert, die siebte Fehlmessung jenes Tages.

`[cmd]` **Mitbetroffen, dieselbe Datei, Zeile 46-48:** *„Von den neun
Importen aus `daten.ts` sind seit GO-16 zwei uebrig: der Timeline-Tab
braucht sie, weil er weiter Attrappe ist."* — **zu pruefen, ob das noch
gilt**, nicht ungeprueft zu uebernehmen.

## Was zu tun ist

**A1 — den Kopf gegen die Datei halten, Reiter fuer Reiter.** Je Reiter
aus `REITER` (Zeile 131-134) messen, was oberhalb des Trenners rendert
und was darunter. **Die Liste im Kopf nennt danach nur, was WIRKLICH
Attrappe ist**, und sie nennt bei den gemischten Reitern beides.

**A2 — die Zahlen im Kopf mit ihrem Datum.** `[read]` **Ein Kopf ohne
Stichtag veraltet unsichtbar** — GO-16 war der 18.08., seither sind
sieben Punkte durch diese Datei gegangen. Jede Aussage traegt den Stand,
unter dem sie gemessen wurde.

**A3 — `116-goals-anbindung.md` ist die Quelle, nicht der Kopf.** Der
Kopf verweist dorthin und wiederholt sie nicht. `[read]` **Zwei Orte
fuer dieselbe Tatsache laufen auseinander** — das ist hier gerade
passiert.

**Nicht Teil:** der Umbau eines Reiters (das ist G-532 A2 und A3), und
`tab-phase.tsx` unter dem Trenner — die Referenz bleibt, solange
oberhalb etwas fehlt (E-68).

**Zu belegen:** je Reiter die gemessene Zeile · `pnpm gate` gruen mit
Testzahl · nichts committen.

---

## Auftrag — Kopf, 2026-10-02

    AUFTRAG FUER Claude Code - G-572: der Dateikopf gegen die Datei
                                     halten, Reiter fuer Reiter
    Bereich: apps/web/src/app/v2/goals/ansicht.tsx
             docs/ssot/116-goals-anbindung.md ist QUELLE, nicht
             Arbeitsbereich - lesen, nicht aendern
    Fremd:   supabase/ gehoert Codex (A-87, die Zeugenstaffel).
             nutrition/ liegt bei G-579, falls das noch laeuft.
             docs/ gehoert dem Orchestrator, auch diese Punktdatei:
             der Bericht kommt als Antwort, nicht als Anhang hier.
    Stand:   2026-10-02

**Zuerst lesen, vollstaendig:** diese Datei und
`docs/ssot/116-goals-anbindung.md`.

### Die Zeilennummern im Punkt sind ueberholt — hier die von heute

`[cmd]` **Gezaehlt am 2026-10-02 in `apps/web/src/app/v2/goals/ansicht.tsx`:**

    39   die Behauptung im Kopf: "Was hier bleibt, ist Attrappe:
         Timeline, Phase engine, Cross-module, Physique ratios,
         Pose sessions - und der groessere Teil des Adaptive-TDEE-Tabs"
    48   die zweite Behauptung: "Von den neun Importen aus daten.ts
         sind seit GO-16 zwei uebrig"
    580  ReferenzTrenner reiter="Phase engine"
    606  ReferenzTrenner reiter="Physique"
    633  ReferenzTrenner reiter="Timeline"
    107  die Attrappenmarke nach E-68 - Quelle UND Grund
    123  der Markentext: "Attrappe - <quelle> · wartet auf: <wartet>"

`[read]` **Der Punkt nannte 616 fuer den Phase-engine-Trenner, heute steht
er in 580** — sieben Punkte sind seit dem 30.09. durch diese Datei
gegangen, zuletzt G-555 und G-577. **Nimm die Zeilen von heute, nicht die
aus dem Punkt, und melde, wenn sie sich bis zu deinem Lauf noch
verschoben haben.**

`[cmd]` **Drei Trenner, nicht einer** — Phase engine, Physique, Timeline.
**Der Kopf nennt fuenf Bereiche plus den TDEE-Tab als Attrappe; die Datei
traegt drei Trenner.** Das ist der Widerspruch, den A1 aufloest.

### Was sich seit dem Punkt sonst geaendert hat

`[cmd]` **Zwei Punkte haben an genau dieser Klasse Schaden gefunden:**
G-577 (der Vermerk nannte `goals.body_measurements` und einen fehlenden
Schreibweg — **beide Haelften falsch**, zwei Monate lang) und G-578 (die
zweite Haelfte falsch). **Ein `[cmd]` mit falscher Zahl wird geglaubt —
hier steht er im Kopf der Hauptansicht.**

**Zusatz zu A2:** `[read]` **Der Stichtag ist nicht Dekoration.** Jede
Aussage im Kopf traegt das Datum, unter dem sie gemessen wurde, und die
Nummer des Punktes, der sie gemessen hat. **Dann sieht der naechste
Leser, wie alt sie ist, ohne sie nachzuzaehlen.**

**Zu belegen:** je Reiter die gemessene Zeile — oberhalb des Trenners und
darunter · die Attrappenzahl je Reiter vorher und nachher, sie darf nicht
sinken · `pnpm gate` gruen mit Testzahl · nichts committen.

`[read]` **Kein voller Kettenlauf, keine Datenbank** — dieser Punkt liest
eine Datei und zaehlt, was sie rendert.
