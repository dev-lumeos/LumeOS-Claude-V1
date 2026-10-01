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

erledigt: 2026-10-01
commit: 605a27d8
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

## Abnahme 2026-10-01 — `605a27d8`

`[cmd]` **Alle sechs Umrechnungen selbst nachgerechnet:**

    1,00 kg / 83,74 kg  =  1,1942 %      ->  1,194
    0,50 kg / 83,74 kg  =  0,5971 %      ->  0,597
    0,75 kg / 83,74 kg  =  0,8957 %      ->  0,896
    0,10 kg / 83,74 kg  =  0,1194 %      ->  0,119
    1,194 % von  60 kg  =  0,7164 kg
    1,194 % von 100 kg  =  1,1940 kg

`[cmd]` **Im Seed nachgezaehlt:** `1.194` fuenfmal, `0.597` einmal — die
sechs Zeilen. **`kg/Woche` steht dort kein einziges Mal mehr.** Kette 308
Schritte, `561_relative_weight_guards_probe` registriert.

## Was diese Abnahme mitnimmt

`[read]` **A2 ist gegen meine Vorgabe entschieden, und er hat recht.**
Mein Auftrag legte das Gewicht am Phasenbeginn nahe, weil die Rate es so
haelt. **Seine vier Gruende tragen besser:** die Zielrate beschreibt die
unveraenderliche Absicht der Phase, der Waechter bewertet einen
**gegenwaertigen Vorgang**; ein spaeter eingetragenes Gewicht darf nicht
rueckwirkend in eine fruehere Pruefung einfliessen; und fehlt am Stichtag
ein Gewicht, ist das ein **Hindernis**, kein Rueckfall auf das
Profilgewicht. **Ein Agent, der einem Auftrag widerspricht und es
begruendet, hat recht behandelt zu werden** — das ist das dritte Mal.

`[cmd]` **A3 ist mit der Randprobe belegt, und das ist die Stelle, auf
die es ankam:** 60 kg / 0,716 greift nicht, 0,717 greift. 100 kg / 1,193
greift nicht, 1,195 greift. **Die Strenge ist dieselbe, nur der Bezug ist
anders** — wer die Zahl mit umgestellt haette, haette zwei Sachen
gleichzeitig geaendert.

`[read]` **A4 ist mehr als verlangt:** die drei Waechtertexte liegen in
beiden Einheiten vor, und die Kilogrammfassung nennt die Grenze **zum
Gewicht des Nutzers**, nicht eine pauschale Zahl. **Damit kann Claude
Code sie uebernehmen, statt sie neu zu formulieren.**

`[cmd]` **Und der Hinweis zu G-566 ist der wertvollste Satz des
Berichts:** werden die Raten nach Erfahrungsstufe abgestuft, **bewegen
sich die Waechtergrenzen nicht mit** — sie sind Text im Katalog und
Konstanten in G-520. **Das ist eine Folge, die in G-566 noch nicht
stand**, und sie steht jetzt dort.

## Mein Fehler bei dieser Abnahme

`[cmd]` **Ich habe nach dem falschen Muster gesucht.** Mein `git grep`
suchte `1.0 kg` als TEXT und fand nichts — die Schwellen stehen als
ZAHLEN im Code (`d.weightTrend < -1.0`). **Seine Angabe war exakt, mein
Suchmuster nicht.** Dieselbe Klasse wie am 30.09., als ich das Vokabular
des falschen Dokuments suchte: **ein Muster ohne Gegenprobe zaehlt das
Falsche.** Nachgelesen hat es bestaetigt, `anpassung.ts:217-222`.

## Was offen bleibt

`[cmd]` **G-520 prueft weiter absolut in `apps/`** —
`anpassung.ts:218` und `uebergangswaechter.ts:123`. **Das ist G-569 und
liegt vorbereitet in `next/` bei Claude Code**, nach G-565, weil es die
Anzeigeeinheit von dort braucht.

`[read]` **Bis dahin stehen zwei Maßstaebe nebeneinander:** der Katalog
relativ, die Anwendung absolut. **Bei 83,74 kg ist das dieselbe Grenze,
bei 60 kg nicht** — dort greift der Katalog bei 0,716 kg und die
Anwendung erst bei 1,0.
