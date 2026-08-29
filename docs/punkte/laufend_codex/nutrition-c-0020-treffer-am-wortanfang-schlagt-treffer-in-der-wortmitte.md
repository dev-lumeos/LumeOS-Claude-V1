---
nr: C-20
typ: feature
modul: nutrition
schwere: mittel
angelegt: 2026-08-14
braucht: []
kind_von: C-25
kinder: []
entscheidung: null
agent: codex
beauftragt: 2026-08-28
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# C-20 - Treffer am Wortanfang schlägt Treffer in der Wortmitte

## Befund

(neu 2026-08-14). **Der grösste verbliebene Hebel für die Relevanz.**

  `[cmd]` Gemessen an sechs Anfragen:

  | Anfrage | Platz 1 heute |
  |---|---|
  | `butter` | Limabohne (**Butter**bohne Mondbohne) |
  | `lachs` | Alaska-Pollack/Alaska-See**lachs** |
  | `kuerbis` | **Kürbis**kern |
  | `huhn` | Suppen**huhn**, Reb**huhn**, Perl**huhn** |

  Die Suche vergleicht mit `LIKE '%tok%'` — ein Treffer **innerhalb**
  eines längeren Wortes zählt genauso viel wie das ganze Wort. `[cmd]`
  Der `huhn`-Fall steht seit `41-…` fest: 31 Treffer, und das gesuchte
  Brustfilet war nicht dabei. *Eine Trefferzahl über null ist noch kein
  Fund.*

  Vorschlag: drei Stufen statt einer — ganzes Wort, Wortanfang,
  Wortmitte. Vor dem Bauen messen, nicht danach.

  ---

  `[cmd]` **Nachgemessen 2026-08-14 am Anker `7b5e631`** — der Punkt ist
  kleiner geworden, aber nicht weg. Von den vier Faellen der Tabelle ist
  einer geloest, drei stehen unveraendert:

  | Anfrage | Platz 1 heute |
  |---|---|
  | `huhn` | **Haehnchen Brustfilet, roh** — geloest |
  | `butter` | Buttermilchpulver |
  | `lachs` | Lachsrogen roh (Lachs roh steht auf 2) |
  | `kuerbis` | Kuerbiskern |

  Die Zubereitungsstufe aus C-25 hat die Wortmitte nicht angetastet —
  sie sortiert innerhalb der Treffermenge, das Problem liegt darin, dass
  ein Treffer *im* Wort so viel zaehlt wie das ganze Wort. Der Vorschlag
  von drei Stufen (ganzes Wort, Wortanfang, Wortmitte) steht unveraendert.

## Auftrag — die Suche, sechs Punkte

**Mitbeauftragt: C-338, C-102, C-117, C-121, C-192.** `[read]` **Ein
Thema — Relevanz und Kosten von `food_search`.** Bericht in diese
Datei, die anderen fuenf tragen einen Verweis.

### Vorweg

`[read]` **Dieser Auftrag traegt keine Zahlen vom Orchestrator.**
`[cmd]` **Seit heute Regel in `CLAUDE.md`:** am 28.08. sind fuenf
Auftragspraemissen gefallen, **weil ich gemessen und dann etwas
anderes behauptet habe.**

`[read]` **Alles, was unten steht, ist die Frage — nicht die
Antwort.** **Miss selbst, und nenn Nutzer und Zeitraum dazu.**

`[cmd]` **Und: ein Kettenschritt ist nicht live.** Das habe ich am
28.08. zweimal verwechselt.

### 1 · C-338 — die Sortierwerte einspielen

`[read]` **Der Kettenschritt aus G-245 traegt zehn Werte und die
`unsupported_sort`-Rueckmeldung. Miss, was die laufende Funktion
kennt**, und bring beides in Deckung.

`[cmd]` **Die Oberflaeche sortiert seit G-70 auf der geladenen Seite,
wenn die Datenbank die Achse nicht kann** — mit der Grenze als Satz
darunter. **Das ist die Rueckfallebene, kein Ersatz.**

### 2 · C-20 — Wortanfang vor Wortmitte

`[read]` **Der Punkt nennt es *,,den groessten verbliebenen Hebel fuer
die Relevanz"* und schlaegt drei Stufen vor: ganzes Wort, Wortanfang,
Wortmitte.** `[read]` **Er sagt auch: *,,vor dem Bauen messen, nicht
danach."***

**Miss die Beispiele aus dem Punkt nach** — sie sind vom 14.08. **Wenn
sie nicht mehr gelten, ist das der Befund.**

### 3 · C-102 und C-117 — die Rangfrage

`[read]` **Beide Punkte enden mit derselben offenen Entscheidung:**
*Trinkform vor Pulverform* als Regel, **oder Haeufigkeit statt
Dichte.** `[read]` **Keiner von beiden ist gesetzt.**

**Miss, was jeder Weg bewirkt**, und leg beides mit Zahlen vor.
`[read]` **Nicht entscheiden — das ist Toms Sache.** `[read]` **Und
wenn ein dritter Weg sichtbar wird: nennen.**

### 4 · C-121 und C-192 — die Kosten

`[read]` **Beide betreffen die Laufzeit, beide sind aelter als eine
Woche.** `[cmd]` C-192 traegt den Vermerk *,,Laeuft bei Codex"* —
**pruef, ob das noch stimmt.**

`[read]` **Und miss die Kosten deiner eigenen Aenderungen aus Teil 1
bis 3 mit** — eine bessere Relevanz, die dreimal so lange braucht,
ist ein Tausch und kein Fortschritt.

### Was nicht zu tun ist

**Keine Rangregel setzen** — C-102/C-117 sind eine Entscheidung.
**Keine Tags anlegen, keine Referenzwerte aendern.**
`apps/` nicht anfassen — Claude Code arbeitet dort.
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    je Punkt ein Urteil          erledigt / gebaut / offen / ueberholt
    Sortierwerte live            vorher / nachher
    unsupported_sort             wirkt es
    Trefferliste je Beispiel     vorher / nachher, mit der Anfrage
    Laufzeit                     ms je Anfrage, vorher / nachher
    Rangfrage                    zwei Wege mit Zahlen, nicht
                                 entschieden

`[read]` **Die letzte Zeile ist die, die nicht gebaut wird.**

### Regeln

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
**Wegwerf-Datenbank, nie gegen die laufende testen.**
**Vollsicherung vor jedem Live-Eingriff nach `backup/`.**
`[cmd]` **`.limit()` hebt den PostgREST-Deckel nicht auf** — 1.000
Zeilen serverseitig.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Nachtrag vom Orchestrator, 2026-08-28

**Der gebaute `/v2/`-Stand ist der Massstab, nicht der Mockup.**

**Tom:** *,,theme-v1 ist das claude design von welchem wir v2
abgeleitet haben ... also ist theme-v1 nur noch eine ideen struktur
falls uns in v2 was fehlt."*

`[read]` **Also nicht: den Mockup gegen den gebauten Stand halten.**
**Sondern: den gebauten Stand messen.** `theme-v1` **nur
nachschlagen, wenn etwas fehlt und die Frage ist, wie es gemeint
war.**

`[cmd]` **Und es gibt zwei Routenbaeume:** `/v2/nutrition` und
`/nutrition`. **Der alte traegt ein eigenes Template und bleibt** —
Tom: *,,da laeuft ein anderes template und das soll bleiben"*.
**Nicht anfassen.**

`[read]` **Mein Fehler in diesem Auftrag:** ich habe `theme-v1` als
*,,massgeblich"* bezeichnet. **Das war falsch.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
