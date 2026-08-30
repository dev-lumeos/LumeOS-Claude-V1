# G-183 — Claude Code, 2026-08-25

Bericht: `docs/berichte/g-183-claude-code.md`

**Nachtrag zu G-182, Punkt 6.** Die Rechtslage bleibt Fliesstext,
obwohl die Schwelle erfuellt war.

**Tom, 2026-08-25:** *„wir wissen welche daten wie und wo angezeigt
werden sollen, das ist unabhaengig ob die daten von kimi schon
geliefert worden sind also umsetzen."*

---

## Warum ich widerspreche

`[cmd]` **54 von 290 `rechtslage_klartext_de` tragen einen
Doppelpunkt.** Deine eigene Messung ergab **40 %** — **innerhalb** der
Spanne von 30 bis 90 Prozent, die im Auftrag stand.

`[read]` **Dein Grund war, dass 82 von 136 Zeilen unveraendert
bleiben. Das ist kein Gegenargument, sondern das erwartete
Verhalten.** Der Auftrag sagt woertlich: *wo sie nicht greift, bleibt
der Absatz stehen, nicht zerhackt.*

`[read]` **Und es war Toms ausdrueckliches Beispiel** — der Anlass des
ganzen Punktes. Er hat den 6-OXO-Absatz zitiert und gesagt: *„so
schreibt und liest kein mensch."*

`[read]` **Bei `mythen_de` war deine Ablehnung richtig** — 6 % liegen
unter der Schwelle, und du hast stattdessen den belegten Fall geloest.
**Dieselbe Regel fuehrt hier zum anderen Ergebnis.**

## Was dort steht

`[cmd]` Zwei Beispiele aus dem Bestand:

    Nirgendwo zugelassen (Datenstand der Datenbank: August 2026).
    In den USA ist der Verkauf fuer die Anwendung am Menschen
    illegal; in Thailand traegt der Import von Forschungsware
    Zollrisiko. Die WADA verbietet Retatrutid als nicht zugelassene
    Substanz (Kategorie S0).

    Weltweit verschreibungspflichtiges Arzneimittel. In den USA ist
    die Verteilung zu nicht-medizinischen Zwecken eine Straftat
    (21 USC 333(e)); in Thailand nur ueber Krankenhaeuser.
    WADA-Kategorie S2: jederzeit verboten.

`[read]` **Beide sind bereits gegliedert** — durch Punkt und
Semikolon, mit wiederkehrenden Ortsmarken: *In den USA*, *in
Thailand*, *Die WADA*. **Die Struktur ist da, sie wird nur nicht
gezeigt.**

## WAS ZU TUN IST

**Die Aufschluesselung greift an Satzgrenzen und nach Semikolon**,
nicht an jedem Doppelpunkt.

`[read]` **Ein Doppelpunkt mitten im Satz darf nicht umbrechen** —
*„WADA-Kategorie S2: jederzeit verboten"* ist eine Zeile, keine zwei.

**Wo die Regel nicht greift, bleibt der Absatz stehen.** `[cmd]` Bei
236 von 290 ist das der Fall und richtig.

`[read]` **Wie du die Zeile setzt, entscheidest du** — ob mit
Ortsmarke links und Aussage rechts, oder als schlichte Aufzaehlung.
**Der Anlass war Lesbarkeit, nicht ein bestimmtes Layout.**

## Dasselbe gilt fuer zwei weitere Felder

`[cmd]` **`ueberwachung_de` und `nicht_im_blut_de`** tragen denselben
Satzbau — mehrere Aussagen in einem Absatz. **Miss sie mit derselben
Regel und wende sie an, wo sie greift.**

`[read]` **Nicht messen und dann doch bauen, wenn die Zahl klein ist.**
Unter 30 Prozent bleibt es Fliesstext, und du meldest die Zahl.

## WAS NICHT ZU TUN IST

**Keine Texte aendern.** Das ist Anzeige, nicht Inhalt.
**Nicht auf Kimis neue Texte warten** — die Anzeigelogik ist
unabhaengig davon, wann die Daten kommen.
**Keinen Absatz zerhacken**, der keine Struktur hat.

`supabase/_pipeline/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

## NACHWEIS

**Zahl der Felder, die die Regel trifft — vor und nach dem Bau.**
`[cmd]` Erwartung fuer `rechtslage_klartext_de`: rund 54 von 290.

**Gegenprobe an zwei namentlich genannten Substanzen:** eine mit
gegliedertem Text (Retatrutid oder 6-OXO) zeigt die Aufschluesselung,
eine ohne bleibt Absatz.

**Negativprobe:** *„WADA-Kategorie S2: jederzeit verboten"* darf
**nicht** in zwei Zeilen zerfallen. Bau den Fall als Test ein — er ist
der Grund, warum die Regel nicht an jedem Doppelpunkt greifen darf.

## REGELN

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
Nie `pnpm dev` — nur `python tools/server.py`.
`.next` nie loeschen, `next build` nie direkt aufrufen.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**
