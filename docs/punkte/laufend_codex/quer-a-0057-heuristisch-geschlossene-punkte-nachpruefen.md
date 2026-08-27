---
nr: A-57
typ: blocker
modul: quer
schwere: hoch
angelegt: 2026-08-27
braucht: []
kind_von: null
entscheidung: null
beruehrt:
  dateien:
    - docs/todo/ERLEDIGT.md
    - docs/punkte/todos/supplements-c-0274-die-unsichtbaren-substanzen-zuordnen.md
zahlen:
  gemessen: 2026-08-27
  per_heuristik_geschlossen: 25
  davon_geprueft_falsch: 1
agent: codex
beauftragt: 2026-08-27
---

# A-57 — 24 Punkte wurden per Textheuristik geschlossen und sind ungeprueft

## Befund

`[cmd]` **Am 2026-08-27 habe ich 25 Punkte geschlossen** — 19 als
*erledigt*, 6 als *ueberholt* — **auf Basis eines Regex ueber die
Berichte von C-315 und G-212**, der in der Naehe einer Punktnummer
nach den Woertern *erledigt*, *ueberholt*, *teilweise*, *offen* oder
*unklar* sucht.

`[read]` **Ich habe die Punkte nicht gemessen und die Berichte nicht
gelesen.** Ich habe es damals so aufgeschrieben und als vertretbar
bezeichnet. **Es war es nicht.**

`[cmd]` **Codex hat den ersten Fehler in C-325 gefunden:** er sollte
`C-317` von `braucht: C-274` entkoppeln, weil ich behauptet hatte,
alle Vorbedingungen seien geschlossen. **Er hat gemessen — 83 von 184
unsichtbaren Substanzen ohne Zuordnung — und die Entkopplung
verweigert.**

`[read]` **Eine Stichprobe von einem hat einen Fehler ergeben.**
C-274 ist wiederhergestellt; **die uebrigen 24 sind ungeprueft.**

## Die 25

    erledigt    C-108 C-195 C-208 C-222 C-223 C-228 C-232 C-234
                C-242 C-244 C-284 C-301 G-78 G-138 G-170 G-172
                G-176 G-177 G-192
    ueberholt   C-116 C-196 C-221 C-274 G-178 G-209

`[cmd]` **C-274 ist bereits als falsch belegt und wiederhergestellt.**
`[cmd]` **G-138, G-176, G-178, G-209 sind unabhaengig belegt** — durch
Claude Codes Messungen in G-212 und meine eigene vor dem
G-176-Auftrag. **Sie bleiben geschlossen, aber pruef sie mit.**

## Auftrag

### Vorweg: die Zahlen sind Ausgangsvermutungen

`[read]` **Pruef sie zuerst. Weicht deine ab, gilt deine.** `[cmd]`
**Du hast heute sechsmal meine Zahl berichtigt** — und einmal meine
Anweisung verweigert, weil sie falsch war. **Das war der wertvollste
Beitrag des Tages.**

### Je Punkt eine Messung, nicht eine Textstelle

    zu Recht geschlossen    `[cmd]` was beweist es
    falsch geschlossen      `[cmd]` was fehlt heute noch
    unklar                  was gemessen werden muesste

`[read]` **Der Beleg muss aus der Datenbank oder dem Code kommen,
nicht aus einem Bericht.** `[read]` **Genau das war mein Fehler: ich
habe einen Bericht ueber einen Bericht gelesen.**

`[cmd]` **Die Belege stehen in `docs/berichte/c-315-codex.md` und
`docs/berichte/g-212-claude-code.md`** — **nimm sie als Hinweis,
woraufhin zu messen ist, nicht als Ergebnis.**

### Falsch Geschlossene wiederherstellen

**Muster:**
`docs/punkte/todos/supplements-c-0274-die-unsichtbaren-substanzen-zuordnen.md`

**Mit heutigen Zahlen und `zahlen.gemessen`**, nicht mit den alten aus
`ERLEDIGT.md`.

### Was nicht zu tun ist

**Nichts reparieren.** Ein wiederhergestellter Punkt bleibt offen.
**`ERLEDIGT.md` nicht aendern** — die falschen Eintraege bleiben als
Spur stehen; ich streiche sie bei der Abnahme.
`apps/` und `supabase/` nicht anfassen. Nicht committen, nicht
stagen, nicht pushen.

### Nachweis

    Punkte geprueft            25
    zu Recht geschlossen       Zahl, je mit `[cmd]`
    falsch geschlossen         Zahl, je einzeln benannt
    unklar                     Zahl
    wiederhergestellt          Zahl, mit Dateinamen
    Waechter                   gruen, Sollstand genannt

`[read]` **Und die Zahl, die zaehlt:** wie viele von 25 waren
falsch? **Wenn es bei einem bleibt, war die Abkuerzung teuer aber
nicht schaedlich. Wenn es fuenf sind, ist die Punktverwaltung heute
mit falschen Daten gestartet.**

### Regeln

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
**Lesend gegen live ist in Ordnung.**
**Nach jeder Aenderung `node tools/punkte-index.mjs --schreiben`.**

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
