---
nr: A-89
typ: fehler
modul: quer
schwere: mittel
angelegt: 2026-10-01

braucht: []
kind_von: A-85

quellen:
  - docs/punkte/erledigt/quer-a-0085-der-zyklus-wird-geprueft-aber-nicht-ausgefuehrt.md

beruehrt:
  dateien:
    - tools/zyklus-fahren.mjs
    - tools/__tests__/a85-zyklus-fahren.test.mjs
---

# zyklus-fahren scheitert an EPERM, wenn ein Agent die Datei offen hat

## Der Befund

`[cmd]` **Am 2026-10-01 dreimal gemessen, beim Schreiben von Hand:**

    rename docs/punkte/laufend_codex/quer-a-0077-....md.neu
        -> ....md
    EPERM: operation not permitted

`[cmd]` **Zweimal an A-77s Punktdatei, einmal an `LAUFEND.md`** — beide
Male, waehrend eine Agentensitzung dieselbe Datei offen hatte. **Minuten
vorher lief derselbe Weg an derselben Datei durch.**

`[cmd]` **`appendFileSync` auf dieselbe Datei funktionierte** — gesperrt
ist das Umbenennen, nicht das Schreiben. Unter Windows haelt ein Prozess
eine Datei ohne `FILE_SHARE_DELETE` offen, und dann scheitert jedes
Ersetzen durch Umbenennen.

`[read]` **A-85s Werkzeug benutzt genau dieses Muster** — lesen,
Temporaerdatei, umbenennen. Es ist der richtige Schutz gegen den Fehler
vom 01.10. (leeren, dann lesen), **aber er scheitert hier auf eine Art,
die Spuren hinterlaesst:** die `.neu`-Datei bleibt liegen, und kein
Waechter kennt sie.

`[read]` **Und der Fall ist nicht selten, sondern der Normalfall** — der
Orchestrator schreibt Punktdateien, waehrend Agenten sie lesen. Genau
dafuer ist das Werkzeug gebaut.

## Was zu tun ist

**A1 — den Fehler fangen und benennen.** `EPERM` beim Umbenennen heisst
nicht „Schreibfehler", sondern „jemand hat die Datei offen". **Die
Meldung sagt, wer wahrscheinlich und was zu tun ist.**

**A2 — nichts liegen lassen.** Scheitert das Umbenennen, wird die
Temporaerdatei entfernt. `[read]` **Die Zieldatei bleibt unveraendert —
das ist richtig und bleibt so.**

**A3 — begrenzt wiederholen, dann aufgeben.** Eine kurze Wiederholung
loest den Normalfall (ein Leser schliesst die Datei). **Eine endlose
nicht.** Zahl und Abstand sind zu belegen, nicht zu waehlen.

**A4 — ein Waechter auf liegengebliebene `.neu`-Dateien** unter `docs/`
und `tools/`. `[read]` **Eine Datei, die kein Waechter kennt, bleibt
liegen** — und sie sieht aus wie eine Punktdatei.

**Nicht Teil:** das Schreibmuster selbst (richtig, bleibt) und die
Frage, ob Agenten Punktdateien offen halten duerfen — das tun sie, und
das Werkzeug hat damit zu rechnen.

**Zu belegen:** eine Probe, die eine Datei offen haelt und das Umbenennen
scheitern laesst · kein `.neu`-Rest danach · der Waechter in beide
Richtungen · `node --test "tools/__tests__/*.test.mjs"` mit Testzahl ·
nichts committen.

## Nachtrag 2026-10-01, 14:10 — es ist NICHT voruebergehend

`[cmd]` **Fuenfmal gemessen, auch nach 12 Sekunden Wartezeit:** das
Umbenennen auf `A-77`s Punktdatei und auf `LAUFEND.md` scheitert
reproduzierbar, waehrend es an zwei anderen Punktdateien in derselben
Minute durchlief.

`[cmd]` **Der Unterschied ist messbar und erklaert die Klasse:** die zwei
betroffenen Dateien hatte ich vorher **an derselben Stelle ueberschrieben**
(`writeFileSync` auf den bestehenden Pfad). Die zwei, die durchliefen,
waren vorher **durch Umbenennen ersetzt** worden.

`[read]` **Daraus die Erklaerung:** ein Prozess, der die Datei offen hat,
verliert seinen Griff, wenn sie durch Umbenennen ERSETZT wird — der alte
Inhalt haengt dann an einem geloeschten Eintrag. Wird sie dagegen an
derselben Stelle ueberschrieben, bleibt der Griff gueltig **und sperrt
jedes weitere Ersetzen durch Umbenennen.**

`[read]` **Damit ist A3 anders zu bauen als dort steht:** eine kurze
Wiederholung hilft NICHT, weil die Sperre nicht ablaeuft. **Der Ausweg
ist, die Zieldatei zu schreiben statt zu ersetzen** — Inhalt in die
Zieldatei schreiben (das geht, belegt), und beim Umzug am Ziel anlegen
und die Quelle loeschen. **Ob das Loeschen derselben Sperre unterliegt,
ist zu messen, bevor es gebaut wird** — eine Punktdatei, die an zwei
Orten liegt, ist schlimmer als eine, die liegen bleibt.

`[cmd]` **Und die Folge fuer heute ist belegt:** A-77 ist abgenommen,
committet (`1222ff7c`) und liegt weiter in `laufend_codex/`, weil der
Umzug nicht ging. **Drei neue Punkte mussten ihren Quellenpfad auf
`laufend_codex/` zeigen**, und sie zeigen falsch, sobald A-77 umzieht.
