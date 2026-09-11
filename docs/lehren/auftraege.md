# Auftraege

## Keine Ursachenvermutung im Auftrag

Tom, 2026-09-08: *,,wie waers, wenn du das raten weglaesst und die
tokens sparst und einfach den agenten arbeiten laesst?"*

`[cmd]` **An einem Tag vier Auftraege mit einer vermuteten
Ursache ? alle vier widerlegt:**

    G-413  "ersterLauf blockiert den Filter"   falsch
           "start ist ungefiltert"             falsch
    G-421  "vier Reiter fehlen"                falsch,
           es waren Umbenennungen
    C-462  "vier Tabellen fehlen"              falsch,
           drei gab es unter anderem Namen

`[read]` **Der Agent misst die Vermutung, widerlegt sie, und
schreibt das in den Bericht** ? **Arbeit, die niemand
gebraucht hat.**

`[read]` **Und schlimmer: eine falsche Ursache im Auftrag lenkt.**
`[cmd]` **G-413 hat zuerst genau dort gemessen, wo ich gezeigt
habe** ? **die echte Ursache lag im Konto.**

### Was in einen Auftrag gehoert

    Was Tom sieht oder will   woertlich
    Wo die Vorlage steht      Pfad, Zeile
    Was gemessen IST          nur mit [cmd] und nur,
                              was ich selbst gemessen habe
    Was nicht angefasst wird  Bereiche, Dev-Server
    Abnahmebedingungen        was belegt sein muss

### Was NICHT hineingehoert

`[read]` **Die vermutete Ursache.**

`[read]` **Zeilennummern als *,,der Verdacht liegt hier"*** ?
**ein Hinweis, wo etwas STEHT, ist in Ordnung; ein Hinweis,
warum es falsch ist, nicht.**

`[read]` **Zahlen aus Werkzeugen, die ich nicht nachgemessen
habe** ? `vollstaendigkeit.mjs` **misst NAMEN, nicht Bestand.**

`[read]` **Und keine Loesung** ? **wer die Loesung in den Auftrag
schreibt, bekommt sie gebaut, auch wenn sie falsch ist.**

### Warum das gilt

`[read]` **Der Agent ist am Code, der Orchestrator ist es
nicht.**

`[cmd]` **Fuenfmal an einem Tag hat der Orchestrator einen Namen
geraten** ? `scores`, `lab_result_values`, `modality_log`,
`body`, `CompositionTab`.

`[read]` **Jedes Mal hat ein Agent es aufgefangen.**

`[read]` **Das ist die richtige Rollenverteilung ? aber sie
kostet einen Durchlauf, den man sparen kann.**

