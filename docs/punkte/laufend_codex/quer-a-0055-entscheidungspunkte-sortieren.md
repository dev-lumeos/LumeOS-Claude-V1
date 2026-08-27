---
nr: A-55
typ: feature
modul: quer
schwere: hoch
angelegt: 2026-08-27
braucht: []
kind_von: A-54
entscheidung: null
beruehrt:
  dateien:
    - docs/punkte/00-LIESMICH.md
    - docs/entscheidungen/E-01-inn-form-fuehrt.md
zahlen:
  gemessen: 2026-08-27
  typ_entscheidung: 43
  davon_blockierend: 2
agent: codex
beauftragt: 2026-08-27
---

# A-55 — die 43 Entscheidungspunkte sortieren

## Befund

`[cmd]` **43 Punkte tragen `typ: entscheidung`.** `[cmd]` **Nur zwei
werden von anderen Punkten referenziert:** `G-122` (blockiert 3) und
`A-37` (blockiert 1).

`[read]` **Ich hatte behauptet, drei davon buendelten 25
Entscheidungen und muessten aufgebrochen werden.** `[cmd]` **Beim
Lesen faellt die Haelfte dieser Annahme:**

    C-123   ,,Von Tom entschieden am 2026-08-19."
            -> Neun GETROFFENE Entscheidungen, falsch abgelegt.
               Gehoert nach docs/entscheidungen/, nicht aufgebrochen.

    A-37    Die zwoelf ADRs EXISTIEREN in
            docs/specs/Nutrition/04_adrs/.
            -> Der Punkt ist ein Abgleich, keine offene Frage.
               Der eigentliche Befund ist die Abweichung bei
               `ADR_COACH_PERMISSIONS_V1`.

    C-207   Vier echte offene Fragen: Speicherweg, Datenschutz je
            Rechtsraum, Einwilligungsfuehrung, Vision-Modell.
            -> Aufbrechen.

    G-122   Fuenf Tabellen ohne Schreibweg. Nur ZWEI brauchen eine
            Entscheidung (eigene Uebung, eigener Messwert),
            drei sind reine Bauarbeit.

`[read]` **Ich habe vom Titel auf den Inhalt geschlossen, ohne zu
lesen.** Das ist der zwoelfte Ausschnittsfehler an diesem Tag — **und
der Grund, warum dieser Auftrag Lesen verlangt und nicht Zaehlen.**

## Auftrag

### Vorweg: die Zahlen sind Ausgangsvermutungen

`[read]` **Pruef sie zuerst. Weicht deine ab, gilt deine.** `[cmd]`
**Du hast heute viermal meine Zahl berichtigt** — 20 statt 31 Regeln,
43 statt 47 C-Punkte, 6.084 statt 6.600 Zeilen, 411 statt 412
Nutzertexte.

### Je Punkt eines von vier Urteilen

    bereits entschieden   -> ADR nach docs/entscheidungen/,
                             Punkt bekommt `entscheidung: E-xx`
    offen und einzeln     -> bleibt, `typ: entscheidung`
    offen und gebuendelt  -> aufbrechen, je Frage ein Punkt
    gar keine Entscheidung-> `typ` berichtigen (befund/feature/blocker)

`[read]` **Das vierte Urteil ist das haeufigste, das ich erwarte** —
und das, bei dem ich am ehesten falschliege. **Lies den Befundtext,
nicht die Ueberschrift.**

### Fuer bereits Entschiedenes: ADR anlegen

**Muster:** `docs/entscheidungen/E-01-inn-form-fuehrt.md`.
`[read]` **Frage, Entscheidung, warum sie traegt, was daraus folgt** —
und `getroffen`, `von`, `betrifft` im Frontmatter.

`[cmd]` **C-123 traegt neun Entscheidungen mit Datum und Urheber**
(*,,Von Tom entschieden am 2026-08-19"*), darunter E4 mit Toms
woertlicher Begruendung. `[read]` **Die woertlichen Zitate muessen
mitwandern** — sie sind der Grund, warum die Entscheidung
nachvollziehbar bleibt.

`[read]` **Nummerierung fortlaufend ab E-02.** **Nicht mit den
internen E1..E9 aus C-123 verwechseln** — die sind eine lokale
Zaehlung in einem Punkt, keine ADR-Nummern.

### Fuer A-37: nicht aufbrechen, verweisen

`[cmd]` **Die zwoelf ADRs liegen in
`docs/specs/Nutrition/04_adrs/`.** `[read]` **Sie werden nicht
kopiert** — der Punkt bekommt Verweise darauf, und **der eigentliche
Befund wird ein eigener Punkt:** `ADR_COACH_PERMISSIONS_V1` verlangt
Freigabe pro Modul **und Subfunktion**, gebaut ist nur pro Modul.

### Was nicht zu tun ist

**Keine Entscheidung treffen.** `[read]` **Auch keine, die
offensichtlich erscheint.** Was offen ist, bleibt offen und geht an
Tom.
**Keinen Punkt streichen.**
**`docs/specs/` nicht aendern** — dort stehen getroffene
Entscheidungen, sie werden pruefend gelesen.
**`tools/` nicht anfassen.**
`apps/` und `supabase/` nicht anfassen. Nicht committen, nicht
stagen, nicht pushen.

### Nachweis

    Punkte mit typ: entscheidung vorher    43
    bereits entschieden -> ADR             Zahl, je ADR-Nummer
    offen und einzeln                      Zahl
    aufgebrochen                           Zahl vorher / nachher
    typ berichtigt                         Zahl, je mit neuem typ
    Punkte mit typ: entscheidung nachher   Zahl
    Waechter                               gruen, Sollstand genannt

`[read]` **Und die Zahl, die zaehlt:** wie viele Fragen liegen danach
wirklich bei Tom? **Wenn aus 43 am Ende 15 echte Fragen werden, ist
das der Ertrag** — nicht die Zahl der angelegten ADRs.

### Regeln

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
**Markdown nur per `write_file` mit vollstaendigem Inhalt.**
**Nach jeder Aenderung `node tools/punkte-index.mjs --schreiben`** —
der Index wird nie von Hand gepflegt.
`[read]` **Der Sollstand im Waechter wandert mit deiner Arbeit.**
Nenn den Endstand im Bericht; **ich ziehe ihn nach.**

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Bericht

### Messung und Ergebnis

`[cmd]` Vorher und eigene Messung: **43** Punkte mit
`typ: entscheidung`. Danach sind es **32**. Die Zahl im Auftrag
stimmt damit; die Beispielannahme von 15 offenen Fragen nicht:
**24** klar abgegrenzte Fragen liegen jetzt bei Tom.

`[cmd]` Das Urteil je Ursprungspunkt:

- Bereits entschieden: **8**. C-123 bekam neun ADRs E-02 bis E-10;
  C-71 E-11, C-285 E-12, C-35 E-13, C-109 E-14, C-313 E-15,
  G-116 E-16; C-314 verweist auf E-01.
- Offen und einzeln: **18**. A-43, C-29, G-72, G-134, G-136, G-152,
  C-241, E-10, C-167, C-218, G-106, C-199, C-206, G-53, G-150,
  GO-24, E-07 und G-88 bleiben Entscheidungspunkte.
- Offen und gebuendelt: **2**, nicht nur C-207. C-207 wurde in
  C-319 bis C-322 (Speicherweg, Rechtsraum/Retention, Einwilligung,
  Vision-Modell) aufgeteilt. C-49 enthielt ebenfalls zwei
  ausdruecklich offene, voneinander unabhaengige Fragen und wurde in
  C-323 (Micro-Flags) und C-324 (Tages-Score) aufgeteilt.
- Gar keine Entscheidung: **15**. Zu `befund` wurden C-194, A-37,
  C-08, C-174, A-06, C-271, G-58, G-141, C-217, C-01 und C-287.
  Zu `feature` wurden G-07, G-122, G-188 und G-189.

`[cmd]` Fuer die Abweichung aus A-37 entstand C-318 als Befund:
die ADR verlangt Coach-Freigabe pro Modul und Subfunktion, gebaut ist
nur pro Modul. Die offene Produktfrage bleibt in A-43; C-318 ist
bewusst kein zweiter Entscheidungspunkt.

### ADRs

`[cmd]` Neu angelegt wurden E-02 bis E-16 unter
`docs/entscheidungen/`. Die neun lokalen E1 bis E9 aus C-123 sind
dabei sauber auf E-02 bis E-10 abgebildet. Toms woertliche
Begruendungen wurden in die ADRs uebernommen, insbesondere die
Mehrsignal-Regel fuer Arzt-Hinweise (E-05), die Trennung von
Permissions und Autonomy (E-11), Weg 3 dann Weg 2 (E-15) und
Bewertung mit 0 statt Filter (E-16).

A-37 kopiert die zwoelf bestehenden ADRs unter `docs/specs/` nicht.
G-141 bleibt ebenfalls Befund zu einem vorhandenen ADR. `docs/specs/`
blieb unveraendert.

### Nachweis

`[cmd]` Nach jeder Aenderungsgruppe lief
`node tools/punkte-index.mjs --schreiben`. Der abschliessende
`node tools/punkte-pruefen.mjs`-Lauf ist gruen: **55 Befunde, Soll
55**, ausschliesslich vorbestehende `kind_von`-Verweise. Keine
Entscheidung wurde getroffen, `tools/`, `apps/`, `supabase/`,
`TODO.md` und `ERLEDIGT.md` blieben unangetastet; nichts wurde
gestaged oder committed.

## Abnahme

_(vom Orchestrator)_
