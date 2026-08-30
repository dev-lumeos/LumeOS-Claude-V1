# C-300 — Codex, 2026-08-27

Bericht: `docs/berichte/c-300-codex.md`

**390 ms verschwinden im Rumpf von `rule_assessment`, sobald RLS
aktiv ist. Der Policy-Umbau aus C-299 hat sie nicht angefasst. Finde
heraus, wo sie liegen — und repariere nichts.**

---

## Vorweg: die Zahlen sind Ausgangsvermutungen

`[read]` **Pruef sie zuerst. Weicht deine ab, gilt deine — und du
nennst beide.**

## 1 · Was C-299 widerlegt hat

`[cmd]` **Vom Orchestrator nach deinem C-299-Umbau nachgemessen, je
drei Laeufe:**

    service_role     164,4 / 170,4 / 164,9 ms
    authenticated    559,6 / 567,7 / 581,9 ms
    shared hit       128.666    (vorher 128.655)

`[read]` **Die Pufferzahl hat sich um elf Bloecke von 128.000
bewegt.** Meine Deutung im C-299-Auftrag — die Differenz von 103.633
Bloecken seien rund 33.000 `hat_sicht`-Aufrufe — **ist damit
widerlegt. Waeren sie es gewesen, waeren sie jetzt weg.**

`[read]` **Die Rechnung ging auf und war trotzdem falsch.** Zwei
Zahlen, die zueinander passen, belegen keine Ursache. **Deshalb ist
dieser Auftrag eine Messung und kein Umbau.**

`[cmd]` **Was C-299 sehr wohl gebracht hat:** `intake_logs` isoliert
von 6,155 auf 0,240 ms, Faktor 25,6. **Der Nutzen ist real, er liegt
nur nicht dort, wo ich ihn vorhergesagt hatte.**

## 2 · Warum man es bisher nicht sieht

`[cmd]` **`EXPLAIN ANALYZE` auf die Funktion zeigt nur den Rahmen:**

    Function Scan on rule_assessment  (actual time=831.929..831.932
                                       rows=64 loops=1)

`[read]` **Eine Zeile fuer 830 ms.** Der Rumpf ist nicht sichtbar,
also ist bisher jede Aussage ueber seine Innereien geraten — meine
eingeschlossen.

`[cmd]` **Die Werkzeuge sind da, nur abgeschaltet:**

    shared_preload_libraries    enthaelt auto_explain und
                                pg_stat_statements
    pg_stat_statements.track    top          (superuser, kein Neustart)
    auto_explain.log_nested_statements  off  (superuser)
    auto_explain.log_analyze            off
    auto_explain.log_min_duration       10000

`[read]` **`track = top` erfasst nur das aeussere Statement** — genau
das, was wir schon kennen. **Alle vier sind zur Laufzeit setzbar, kein
Neustart noetig.**

## 3 · Zu tun

**Miss, welches Statement im Rumpf die Zeit frisst** — je einmal unter
`service_role` und unter `authenticated`, damit die Differenz je
Statement sichtbar wird.

`[read]` **Der Vergleich ist die Messung, nicht die Einzelzahl.** Eine
Liste teurer Statements unter `authenticated` sagt nichts; die Liste
**neben** derselben unter `service_role` sagt alles.

`[annahme]` **Meine Vermutung, ausdruecklich als solche:** RLS wirkt
als Optimierungsbarriere — Index-Only-Scans fallen weg,
Join-Reihenfolgen aendern sich, ein Hash Join wird zum Nested Loop.
**Das wuerde erklaeren, warum die Puffer gleich bleiben, egal wie
billig die Policy selbst ist.**

`[read]` **Das ist eine Vermutung und kein Suchauftrag.** Wenn du
etwas anderes findest, ist das andere das Ergebnis. **Wenn du meine
Vermutung bestaetigst, belege sie am Plan, nicht an der
Plausibilitaet.**

**Wenn ein einzelnes Statement heraussticht:** seinen Plan unter
beiden Rollen nebeneinander stellen und die Stelle benennen, an der
sie auseinanderlaufen.

## 4 · WAS NICHT ZU TUN IST

**Nichts reparieren.** `[read]` **Dies ist ein Messauftrag** — was du
findest, wird ein Punkt und dann ein eigener Auftrag. **Eine Messung,
die nebenbei umbaut, misst hinterher etwas anderes.**

**`rule_assessment` nicht anfassen**, weder Rumpf noch
`SECURITY INVOKER`.
**Keine Policy aendern** — die dreizehn verbliebenen `hat_sicht`-Formen
sind **C-305**.
**Die Laufzeiteinstellungen nach der Messung zuruecksetzen**, und im
Bericht sagen, dass du es getan hast.
`apps/` nicht anfassen. Nicht committen, nicht stagen, nicht pushen.

## NACHWEIS

    teuerste Statements service_role     Liste mit ms und Aufrufzahl
    teuerste Statements authenticated    dieselbe Liste
    Differenz je Statement               ms, absteigend
    Summe der Differenzen                gegen die 390 ms gehalten
    Plaene der Ausreisser                unter beiden Rollen
    Einstellungen zurueckgesetzt         belegt

`[read]` **Die Summe der Einzeldifferenzen muss die 390 ms ergeben.**
Bleibt ein Rest, **ist der Rest der Befund — nicht wegrunden.** `[cmd]`
**Genau das hat bei G-203 funktioniert:** Claude Code hat 270-360 ms
offen gelassen statt sie glattzurechnen, und deshalb reden wir heute
darueber.

## REGELN

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
**Messen im Klon, nicht gegen die laufende Datenbank** — mit
`dev@lumeos.app`-Daten, weil `test-user` den Effekt nicht zeigt (dort
kostet RLS +2 ms statt +390).
Vollsicherung nur noetig, wenn du doch etwas aenderst — **und dann
frag vorher.**

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**
