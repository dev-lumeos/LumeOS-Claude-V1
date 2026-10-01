---
nr: G-561
typ: fehler
modul: goals
schwere: hoch
angelegt: 2026-09-30
beauftragt: 2026-10-01
agent: codex

braucht: [G-542, G-545]
kind_von: G-545

quellen:
  - docs/punkte/erledigt/goals-g-0545-der-katalog-hat-die-form-nicht-den-inhalt.md
  - docs/ssot/131-fachwissen-phasen-und-rechenwege.md

beruehrt:
  tabellen:
    - goals.goal_strategies
  dateien:
    - supabase/_pipeline/11_goals/
---

# Sechs Waechter pruefen Kilogramm statt Prozent

## Der Befund

`[cmd]` **Codex hat es gemeldet statt still zu ueberschreiben:** sechs
aeltere Katalogzeilen tragen absolute kg-Waechter — vier Cut-Strategien,
`lean_bulk` und `reverse_diet`. **Und G-520 prueft ebenfalls absolut.**

`[read]` **Das ist fachlich nicht gleichwertig, und die Zahl zeigt es:**

    0,7 kg bei 60 kg  =  rund 1,2 %
    1,2 kg bei 100 kg =  rund 1,2 %

**Derselbe Vorgang, derselbe Anteil — der absolute Waechter behandelt
sie verschieden.** Bei einem leichten Nutzer greift er zu spaet, bei
einem schweren zu frueh.

`[read]` **G-542 hat die Einheit entschieden:** die Zielrate ist Prozent
Koerpergewicht pro Woche, vierfach belegt. **Ein Waechter, der in
Kilogramm prueft, misst gegen eine andere Groesse als die, die das Ziel
fuehrt.**

## Warum es hier nicht nebenbei mitgemacht wurde

`[read]` **Richtig so.** Die sechs Zeilen sind bestehende, hoeher
priorisierte Werte; ein Auftrag, der Leerstellen fuellt, darf gefuellte
Werte nicht umschreiben. **Das ist ein eigener Vorgang, weil er
bestehendes Verhalten aendert** — und weil G-520 mitbetroffen ist, also
nicht nur der Katalog, sondern ein laufender Waechter.

`[annahme]` **Die Umstellung braucht das Gewicht am Stichtag**, nicht
das aktuelle — sonst verschiebt sich die Schwelle mit jedem Wiegen.
Welches Gewicht gilt, ist die Frage, die der Auftrag stellen muss.

    AUFTRAG FUER Codex - G-561: die Waechter pruefen Kilogramm, wo das
                               Ziel in Prozent gefuehrt wird
    Bereich: supabase/_pipeline/11_goals/
             supabase/_pipeline/_validierung/
             supabase/_pipeline/kette.json
    Fremd:   apps/ gehoert Claude Code, der gerade an G-568 baut
             (zielwerte-read reicht das Ziel durch). Nichts dort
             anfassen; wenn eine Waechtermeldung ihren Text aendert,
             MELDE den neuen Text - die Oberflaeche zeigt ihn.
             docs/ gehoert dem Orchestrator, auch diese Punktdatei:
             der Bericht kommt als Antwort, nicht als Anhang hier.
    Stand:   2026-10-01

**Zuerst lesen, vollstaendig:** diese Datei,
`docs/entscheidungen/E-83-der-nutzer-waehlt-die-einheit.md` (von heute —
der Nutzer waehlt die Einheit, gespeichert wird die Rate) und
`docs/sessions/2026-09-30-uebergabe.md`.

## Auftrag

**A1 — zaehlen, nicht schaetzen.** Welche Katalogzeilen tragen einen
absoluten Waechter, und welcher Code prueft absolut? Der Bericht nennt
sechs Zeilen und G-520; **belege es und sag, wie du abgegrenzt hast.**
Ein Waechter kann in `guards`, in einer Funktion oder in einem
Kettenschritt stehen.

**A2 — die Bezugsgroesse, und welches Gewicht gilt.** Eine relative
Schwelle braucht ein Gewicht. **Das am Phasenbeginn, wie bei der Rate
(G-543)** — oder das zum Zeitpunkt der Pruefung? `[read]` Die Rate nimmt
den Phasenbeginn, damit das Ziel nicht mit jedem Wiegen wandert. **Ein
Waechter misst aber die Gegenwart.** Beides ist begruendbar; **melde,
welches du nimmst und warum, und mach es an einer Zahl sichtbar.**

**A3 — die Schwelle bleibt, der Bezug wird relativ.** Nicht die Strenge
aendern: 1,0 kg bei 83,74 kg sind 1,19 %/Woche. **Wer die Zahl mit
umstellt, aendert zwei Sachen gleichzeitig** — und dann ist nicht
messbar, welche gewirkt hat. Umgerechnet wird mit E-1.

**A4 — die Meldung an den Nutzer bleibt in der Einheit, die er
versteht.** E-83: der Nutzer waehlt. **Die Regel rechnet in Prozent, der
Text darf Kilogramm nennen** — aber dann die Zahl, die zu SEINEM Gewicht
gehoert, nicht eine pauschale. **Melde den Text woertlich**, Claude Code
zeigt ihn.

**A5 — gegen den Seed.** `test-user` traegt seit G-559 zwei offene
Phasen. **Ein Waechter, der nur gegen einen Nutzer mit einer Phase
geprueft wurde, hat den Normalfall nicht gesehen.** Rote Gegenprobe
zuerst: ein Wert knapp unter und knapp ueber der Schwelle, bei zwei
verschiedenen Koerpergewichten — **das ist der Punkt, an dem absolut und
relativ auseinanderlaufen.**

**Nicht Teil:** ob die Rate nach Erfahrungsstufe abgestuft wird (G-566,
bei Tobias). **Aber wenn sie es wird, muessen die Schwellen mitwandern —
sag im Bericht, ob dein Bau das aushaelt.**

**Zu belegen:** Nachweise auf `test-user@lumeos.local` · voller
Kettenlauf gruen mit Schrittzahl · rote Gegenprobe zuerst · welcher Lauf
die neue Probe aufruft · Wegwerf-DB verworfen mit Zaehler · kein
`db push` · nichts committen · die Waechtertexte woertlich.
