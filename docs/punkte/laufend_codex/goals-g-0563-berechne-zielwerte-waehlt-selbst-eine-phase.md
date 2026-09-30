---
nr: G-563
typ: fehler
modul: goals
schwere: hoch
angelegt: 2026-09-30
beauftragt: 2026-09-30
agent: codex

braucht: [G-538, G-543, G-559]
kind_von: G-559

quellen:
  - docs/punkte/erledigt/goals-g-0559-phase-am-deckelt-auf-eine-phase.md

beruehrt:
  funktionen:
    - goals.berechne_zielwerte
  dateien:
    - supabase/_pipeline/11_goals/
---

# `berechne_zielwerte` wählt selbst eine Phase aus

## Der Befund

`[cmd]` **Codex hat es beim Abgrenzen von G-559/A1 gefunden und
gemeldet:** `goals.berechne_zielwerte()` ruft `phase_am` **nicht** auf —
**sie wiederholt die nutzerweite Auswahl mit `LIMIT 1` selbst.**

`[read]` **Damit hat G-559 die Hälfte des Problems behoben.** Die
Funktion, die alle fragen, ist geteilt; die Funktion, die die Zielwerte
rechnet, trägt denselben Deckel weiter im eigenen Rumpf.

`[cmd]` **Der Schreibweg ist abgesichert:** der Trigger wirft bei
Mehrdeutigkeit
*„nutrition_targets: mehrere aktive Phasen am Gueltigkeitstag;
Zielbezug fehlt"*. `[read]` **Die direkte Vorschau kann aber weiterhin
eine Phase wählen** — und eine Vorschau, die stillschweigend eine von
zwei Phasen nimmt, zeigt Zielwerte, die zu einem Ziel gehören, das der
Nutzer nicht angesehen hat.

`[read]` **Das ist die gefährlichere Hälfte:** ein geworfener Fehler ist
sichtbar, eine stille Auswahl nicht.

## Was zu klären ist

`[read]` **Die Frage ist dieselbe wie in G-559/A2, eine Ebene tiefer:**
rechnet `berechne_zielwerte` für einen NUTZER oder für ein ZIEL? Seit
G-538 laufen mehrere Ziele parallel, und Zielwerte gehören zu einer
Phase, nicht zu einem Konto.

`[annahme]` **Wahrscheinlich braucht die Funktion `goal_id`** und damit
denselben Schnitt, den `phase_eines_ziels_am` schon hat. **Wer die
Funktion aufruft, ist zu messen, nicht zu vermuten** — und je Aufrufer
zu sagen, ob er ein Ziel kennt oder nur einen Nutzer.

## Auftrag

    AUFTRAG FUER Codex - G-563: berechne_zielwerte waehlt still eine
                               von mehreren Phasen
    Bereich: supabase/_pipeline/11_goals/
             supabase/_pipeline/_validierung/
             supabase/_pipeline/kette.json
    Fremd:   apps/ gehoert Claude Code, der gerade an G-564 baut
             (ladePhase auf Mehrzahl) - nichts dort anfassen. Wenn die
             Funktion einen neuen Parameter bekommt, MELDE die
             Signatur; er baut darauf auf.
             docs/ gehoert dem Orchestrator, auch diese Punktdatei:
             der Bericht kommt als Antwort, nicht als Anhang hier.
    Stand:   2026-09-30

**Zuerst lesen, vollstaendig:** diese Datei und deine eigene Abnahme in
`docs/punkte/erledigt/goals-g-0559-phase-am-deckelt-auf-eine-phase.md`
— dort steht, wie A1 dieselbe Frage eine Ebene hoeher beantwortet hat.

**A1 — wer ruft `berechne_zielwerte`, und kennt der Aufrufer ein Ziel?**
Messen, nicht schaetzen, und die Abgrenzung mitsagen: Kettenschritte,
Trigger, Sichten, Regeln, die Anwendung. **Je Aufrufer die Frage: liegt
ihm eine `goal_id` vor oder nur ein Nutzer?** Das entscheidet A2, nicht
der Geschmack.

**A2 — den Schnitt setzen, mit dem Beleg aus A1.** Derselbe Schnitt, den
G-559 schon hat, liegt nahe (`goal_id` als Parameter), **ist aber erst
belegt, wenn A1 zeigt, dass jeder Aufrufer eines kennt.** Findet sich ein
Aufrufer ohne Ziel, ist das die interessante Stelle — **melden, was er
eigentlich meint**, statt ihm ein Ziel zu erfinden.

**A3 — die Vorschau darf nicht stiller sein als der Schreibweg.** Der
Trigger wirft bei Mehrdeutigkeit
(*„nutrition_targets: mehrere aktive Phasen am Gueltigkeitstag"*), die
direkte Vorschau waehlt weiter. **Beide Wege muessen dasselbe sagen** —
entweder beide werfen, oder beide nennen das Ziel, zu dem die Zahl
gehoert. Eine Zahl ohne ihr Ziel ist bei mehreren Phasen keine Aussage.

**A4 — gegen den Seed, nicht den Bestand.** `test-user` traegt seit G-559
zwei offene Phasen an zwei Zielen. **Das ist der Fall, der diesen Punkt
beweist** — eine Probe gegen einen Nutzer mit einer Phase misst nichts.
Rote Gegenprobe zuerst.

**Nicht Teil:** `ladePhase` und die Anzeige (G-564, bei Claude Code), und
das Einspielen von G-559 (bei Tom).

**Zu belegen:** Nachweise auf `test-user@lumeos.local` · voller
Kettenlauf gruen mit Schrittzahl · rote Gegenprobe zuerst · welcher Lauf
die neue Probe aufruft · Wegwerf-DB verworfen mit Zaehler · kein
`db push` · nichts committen · **wenn die Signatur sich aendert, die
neue Signatur woertlich im Bericht.**
