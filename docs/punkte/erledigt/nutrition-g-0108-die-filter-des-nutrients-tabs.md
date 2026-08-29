---
nr: G-108
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-08-20
braucht: []
kind_von: G-101
kinder: []
entscheidung: null
agent: claudecode
beauftragt: 2026-08-29
erledigt: 2026-08-29
commit: OFFEN
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/naehrstoff-ordnung-tab.tsx
zahlen: null
---

# G-108 - Die Filter des Nutrients-Tabs

## Befund

(neu 2026-08-20, aus
  G-101).

  `[cmd]` Der Entwurf zeigt `Today · 7d avg · 30d avg · 90d avg` und
  `All · Out of range · Deficient only`. **Die Ordnung steht seit
  G-101, die Filter fehlen.**

  `[read]` Die Zeitraeume haengen an derselben Frage wie G-107; „Out of
  range" braucht je Naehrstoff die persoenliche Referenz.

## Auftrag — die Filter im Nutrients-Reiter, drei Punkte

**Mitbeauftragt: G-116, G-250.** Bericht in diese Datei.

### Vorweg

`[read]` **Dieser Auftrag traegt keine Zahlen vom Orchestrator.**
**Nenn Nutzer und Zeitraum bei jeder Messung.**

`[read]` **G-116 und G-250 sind als `entscheidung` markiert.**
**Du entscheidest sie nicht — du misst und legst vor.** `[read]`
**Was gebaut werden kann, ohne dass eine Entscheidung fehlt, baust
du. Der Rest wird mit Zahlen vorgelegt.**

### 1 · G-108 — die Filter des Nutrients-Tabs

`[cmd]` **Der Reiter fuehrt seit G-249 die Ordnung mit Baum, Suche,
sieben Zeitfenstern und den Filtern `Alle` / `Auffaellig` /
`Unter Ziel`.** `[cmd]` **Dazu seit C-323 die Dauerregel.**

`[read]` **Miss zuerst, was der Punkt vom 20.08. noch behauptet, was
heute gilt** — er ist aelter als alles, was seither gebaut wurde.

`[cmd]` **Und ein gemessener Befund aus C-323 liegt vor:** der
`Auffaellig`-Filter liest `avg_per_logged_day`, einen Mittelwert.
**Konstant 79 Prozent und 45 Tage bei 40 neben 45 bei 118 sind heute
nicht unterscheidbar.**

### 2 · G-116 — generelle Ausschluesse

`[read]` **Der Punkt sagt, sie bewerten mit 0, statt zu filtern.**
`[read]` **Miss, was das heute bewirkt** — und ob *bewerten mit 0*
und *filtern* verschiedene Ergebnisse liefern.

`[read]` **Und die Frage dahinter ist dieselbe wie ueberall heute:**
ist eine Null ein gemessener Wert oder eine fehlende Aussage?

### 3 · G-250 — die vier Zustaende in der Ordnung

`[cmd]` **Die Ordnung bildet ihren Status aus `goals.nutrition_targets`,
die vier Zustaende stammen aus `daily_reference_assessment`.**

`[read]` **Beides zu mischen ergaebe zwei Wahrheiten in einer
Zeile** — *,,unter Ziel"* nach dem Goal und *,,gedeckt"* nach EFSA
koennen gleichzeitig gelten.

**Miss, wie oft sie auseinandergehen.** `[cmd]` **60 Naehrstoffe
haben ein persoenliches Ziel, 78 nur die Referenz — bei diesen 78
gibt es keinen Widerspruch.**

`[read]` **Dieselbe Frage wie in G-218:** dort ergab die Messung,
dass zwei Achsen innerhalb einer Stufe redundant sind, ueber den
Katalog aber nicht. **Wenn sie selten auseinandergehen, reicht eine
Achse mit Vermerk. Wenn oft, muessen beide sichtbar sein und die
Zeile muss sagen, welche sie meint.**

### Was nicht zu tun ist

**Keine zweite Ansicht neben eine bestehende.** `[cmd]` **Dreimal
passiert** — G-249, G-11, und in G-253 hast du es selbst verhindert.
**Keine Referenzwerte aendern, keine Tabelle anlegen** — Codex hat
den Datenbereich.
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    je Punkt ein Urteil          erledigt / gebaut / offen / ueberholt
    Filter heute                 was zeigt jeder, gemessen
    Auffaellig gegen Dauerregel  wie viele je Zeitraum, beide
    generelle Ausschluesse       0 gegen gefiltert, Ergebnis
                                 vorher / nachher
    zwei Wahrheiten              wie oft gehen sie auseinander
    Doppelung                    zeigt der Reiter etwas zweimal?
    Attrappen                    am Schirm gezaehlt (A-59)
    Bildschirmfoto je Zustand    `node tools/schuss.mjs`

### Regeln

`tools/lauf.py`, keine Konsolenfenster.
`[cmd]` **Der Dev-Server beendet sich von selbst** (G-205), und eine
Messung vor dem Neukompilieren zeigt alte Zahlen.
`[cmd]` **A-30, A-59, A-60.** `[cmd]` **Und `.limit()` hebt den
PostgREST-Deckel nicht auf.**

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Bericht

**Claude Code, 2026-08-29.** Alle Zahlen mit Nutzer und Zeitraum.

### Je Punkt ein Urteil

| Punkt | Urteil |
|---|---|
| **G-108** | **ueberholt im Wortlaut, ein Befund darunter ist neu und schwerer** |
| **G-116** | **bestaetigt und schaerfer als gemeldet** — 162 auf **0**, nicht auf 1 |
| **G-250** | **gemessen: selten** — eine von drei vergleichbaren Zeilen. **Entscheidung liegt vor, nicht getroffen** |

### 1 · G-108 — der Wortlaut ist ueberholt, der Kern nicht

`[cmd]` **Der Punkt vom 20.08. verlangt `Today · 7d · 30d · 90d` und
`All · Out of range · Deficient only`.** `[cmd]` **Beides steht seit
G-121/G-249:** sieben Fenster (1/7/14/30/45/60/90) und drei Filter
(`Alle` / `Auffaellig` / `Unter Ziel`), dazu Suche und Baum.

**Der Wortlaut ist also erledigt.** `[read]` **Aber die Messung hat
darunter etwas gefunden, das schlimmer ist als das, was der Punkt
beschrieb.**

`[cmd]` **Am Schirm gemessen, `dev@lumeos.app`, 2026-08-29:**

    Filter        7 Tage   30 Tage   90 Tage
    Alle              37        37        37     Zeilen
    Auffaellig        42        42        42
    Unter Ziel        34        34        34

`[cmd]` **In der Datenbank dieselbe Antwort, und schaerfer:** in allen
drei Fenstern **dieselben zwoelf Codes** — CA, CLD, F18:2CN6,
F18:3CN3, FD, MG, NA, NACL, NIA, VITA, VITD, WATER.

`[read]` **Der Fensterwaehler aendert die Werte, aber nicht die
Auswahl.** `[cmd]` Der Mittelwert ueber alle 138 Naehrstoffe
verschiebt sich sehr wohl (495,20 / 486,55 / 478,97), **nur wechselt
keine einzige Zeile dadurch die Seite ihrer Schwelle.**

`[read]` **Das ist der C-323-Befund in seiner staerksten Form.** Dort
war es eine Moeglichkeit (*,,79 Prozent konstant und 45/45 sind nicht
unterscheidbar"*); **hier ist gemessen, dass der Filter ueber drei
Zeitraeume identisch antwortet.**

### 2 · Was gebaut wurde — und was bewusst nicht

`[cmd]` **Gebaut: ein Satz, der sagt, was die Auswahl nicht zeigt.**
Er steht im Kopf des Reiters, **nur bei Fenstern ueber einem Tag**
(bei `Heute` gibt es keinen Schnitt), und behauptet keine Zahl.

`[cmd]` **Gegengeprobt am Schirm:** `fenster=1` **nein**, `fenster=7`
**ja**, `30` **ja**, `90` **ja**.

**NICHT gebaut: die Dauerregel angebunden** — obwohl sie fertig
dasteht. `[cmd]` **`flagVon` aus C-323 hat bis heute keinen
Aufrufer.**

`[read]` **Der Grund ist gemessen, nicht vermutet:**

    reference_assessment_window, 90 Tage      1.786 ms   (C-323)
    der Reiter heute, fenster=90, warm        5.906 ms
    zusammen                                 ~7,7 s

`[cmd]` **Und der Reiter ist heute schon langsam:** 2.920 ms bei 7
Tagen, 3.743 bei 30, **5.906 bei 90** (warm, angemeldet). `[read]`
**C-189 hat neun Sekunden als Defekt behandelt — das waere dieselbe
Groessenordnung.**

`[read]` **Also: der Reiter sagt, was seine Zahl bedeutet, statt eine
zweite teure Achse danebenzustellen.** **Das ist die Regel aus G-249,
G-11 und G-253** — keine zweite Ansicht neben eine bestehende.
`[cmd]` Gegengeprobt: **der Reiter rendert die Ordnung genau einmal**
(Test 12), **0 Attrappen, kein Kartentitel doppelt.**

**Was daraus folgt, gehoert Tom:** die Dauerachse ist gebaut und
kostet knapp zwei Sekunden. **Sie anzubinden lohnt sich erst, wenn
der Reiter selbst schneller ist** — das ist ein eigener Punkt, kein
Nebenbei.

### 3 · G-116 — bestaetigt, und schaerfer als der Befund

`[cmd]` **Gemessen an der laufenden `nutrition.food_search`,
`dev@lumeos.app`, 2026-08-29** — `total` mit und ohne Nutzer:

    Suchbegriff   ohne Nutzer   mit dev
    schokolade           162         0      <- der Punkt sagte 163 -> 1
    cola                 243        42
    wurst                206        42
    leber                110        46
    lamm                  86        35
    chips                 19         8
    (leer)             7.140     4.970

`[cmd]` **Schokolade faellt auf NULL, nicht auf eins.** `[read]`
**Der Punkt hat also recht, und die Lage ist schlechter als
notiert.**

`[cmd]` **Und es ist der generelle Ausschluss, nicht die Allergie:**
von den 100 geholten Schokolade-Treffern tragen **alle 100**
`ultra_processed`, aber nur **6** `contains_nuts`. dev traegt
`general_exclusions = {ultra_processed, no_offal, no_lamb}` und
`allergies = {tree_nuts}`.

`[read]` **Die Allergie duerfte hart filtern (G-67) — der generelle
Ausschluss nicht.**

`[cmd]` **Der Mechanismus steht im Quelltext von `food_search`:**

    WHEN fpi.preference = 'hard_exclude' THEN 'hard'
    WHEN fpi.strength   = 'strong_avoid' THEN 'strong'
    WHEN fpi.preference = 'disliked'     THEN 'soft'
    ...
    bool_or(constraint_level = 'hard')
      OR (bool_or(constraint_level = 'strong')
          AND COALESCE(p_normalized_query, '') = '') AS preference_excluded

`[cmd]` **Die Stufe existiert bereits, die es braucht:** `strong`
**filtert nur ohne Suchbegriff und bewertet mit** (-75 / -40 / -25 je
nach Rang). `[cmd]` **Der generelle Ausschluss bekommt aber `hard`** —
belegt durch die Zeilen `'hard'::text, 'general_tag'` und
`'hard'::text, 'general_preset'`.

`[read]` **Damit ist die Antwort auf die Frage des Auftrags
gemessen:** *bewerten mit 0* und *filtern* liefern verschiedene
Ergebnisse — **162 gegen 0.** Und **die Aenderung waere klein:**
`general_tag` und `general_preset` von `'hard'` auf `'strong'`,
**eine Stufe, die es schon gibt und die genau das tut, was Tom
beschrieben hat.**

`[read]` **Zur Frage dahinter — ist eine Null ein gemessener Wert
oder eine fehlende Aussage?** **Hier ist sie eine dritte Sache: eine
verschwiegene Aussage.** Der Treffer existiert, ist bewertet, und
wird nicht gezeigt. **Das ist kein Nullwert, sondern ein
unterdrueckter.**

**Nicht gebaut** — `food_search` gehoert Codex (G-107), und G-116 ist
als `entscheidung` markiert.

### 4 · G-250 — die Praemisse faellt, die Antwort ist „selten"

`[cmd]` **Der Punkt sagt: 60 Naehrstoffe haben ein persoenliches
Ziel, 78 nur die Referenz.** `[cmd]` **Gemessen sind es SECHS.**

`goals.nutrition_targets` fuehrt genau sechs Naehrstoffspalten —
`kcal`, `protein_g`, `carbs_g`, `fat_g`, `linoleic_acid_g`,
`alpha_linolenic_acid_g`. **`MAKRO_ZIEL` in
`naehrstoff-ordnung.ts:61` bildet genau diese sechs ab.**

`[read]` **Die 60 stimmen trotzdem — sie bedeuten nur etwas
anderes:** `mitReferenz` zaehlt jede Zeile mit Ziel ODER Obergrenze,
gleich welcher Herkunft. **Der Kopf des Reiters sagt es korrekt**
(*,,die Makros dein persoenliches …, die uebrigen die
wissenschaftliche Referenz"*). **Falsch war nur die Lesart im
Punkt.**

`[cmd]` **Die Kernmessung, `dev@lumeos.app`, 30 Tage bis
2026-08-29:**

    Code        Ziel     Wert   %Ziel   Achse A      %Ref   Achse B
    ENERCC    2500,0   2424,3    97,0   gedeckt         -   (kein pct)
    PROT625    170,0    164,5    96,8   gedeckt     192,7   gedeckt
    CHO        313,0    273,6    87,4   gedeckt         -   energy_share
    FAT         75,0     65,1    86,8   gedeckt         -   energy_share
    F18:2CN6    11,1      6,4    57,7   unter Ziel   46,1   unter Ziel
    F18:3CN3     1,4      1,2    85,7   gedeckt      51,6   unter Ziel  <-

`[cmd]` **Drei Zeilen tragen ueberhaupt beide Achsen. Von diesen geht
EINE auseinander:** `F18:3CN3` ist **gedeckt nach deinem Ziel (85,7 %)
und zu wenig nach EFSA (51,6 %)** — genau der Fall, den der Punkt
beschreibt.

`[read]` **Nach dem Massstab aus G-218 heisst das: selten.** **Eine
Achse mit Vermerk reicht** — und **der Vermerk steht bereits im Kopf
des Reiters.** `[read]` **Zwei Spalten fuer einen Fall von drei
waeren die zweite Ansicht, die dreimal wieder ausgebaut werden
musste.**

`[cmd]` **Vorgelegt, nicht entschieden:** `achsenGehenAuseinander`
und `achsenVermerk` stehen gebaut und geprueft in
`fenster-aussage.ts`. **Sie haengen bewusst noch an keiner Zeile** —
das ist Toms Entscheidung, und sie kostet dann einen Handgriff.

### 5 · Die Sabotagen — 7 von 7 fallen

Jede einzeln, Rueckbau bytegleich per SHA-256.

| # | Sabotage | faellt |
|---|---|---|
| 1 | der Hinweis erscheint auch bei einem einzelnen Tag | ja |
| 2 | der Hinweis wird immer gezeigt | ja |
| 3 | der Achsen-Widerspruch wird nie erkannt | ja |
| 4 | eine fehlende Achse gilt als Widerspruch | ja |
| 5 | die Achsenliste laeuft gegen `MAKRO_ZIEL` auseinander | ja |
| 6 | der Vermerk nennt die Herkunft der zweiten Zahl nicht | ja |
| 7 | der Reiter zeigt den Hinweis nicht mehr | ja |

`[cmd]` **Sabotage 7 ueberlebte im ersten Lauf.** Mein Test suchte
`mittelwertSatz(` im Quelltext — **die Bedingung durch `false` zu
ersetzen liess den Aufruf stehen, nur nie ausgefuehrt.** `[read]`
**Wort statt Wirkung, derselbe Fehler wie G-216/G-247/G-246.**
Verschaerft: geprueft wird jetzt die Bedingung selbst, mit ihrem
Argument.

`[cmd]` **Und Sabotage 5 ist der Waechter gegen ein Auseinanderlaufen
zweier Listen** — `ZWEI_ACHSEN_CODES` gegen `MAKRO_ZIEL` im Leseweg,
in beide Richtungen gezaehlt.

### 6 · Gate und Testlage

`[cmd]` **`pnpm gate`: 11 von 11 gruen**, `[serverimport]` 65
Client-Chunks / 0 Treffer. `[cmd]` **291 von 291 Nutrition-Tests
gruen**, davon 12 neue. `[cmd]` **Encoding sauber, Exit 0.**

`[cmd]` **Am Schirm, vorher/nachher identisch:** 0 Attrappen, keine
Doppelung, Filterzahlen unveraendert — **es kam eine Erklaerung dazu,
keine zweite Ansicht.**

**Bildschirmfotos:** `backup/g108-vorher.png`,
`g108-nachher-30.png` (Hinweis sichtbar),
`g108-nachher-heute.png` (Hinweis fehlt, wie beabsichtigt).

### 7 · Ein Nebenbefund

`[cmd]` **`FD` steht unter den zwoelf auffaelligen Codes** — der
Naehrstoff, dessen Detailtext laut C-336 zu Trockenmasse gehoert.
**Die Auffaelligkeit selbst ist echt** (der Messwert stimmt), **nur
der Text daneben nicht.** Bereits gemeldet, hier nur der Hinweis,
dass beide Befunde dieselbe Zeile treffen.

**Nichts auf `dev@lumeos.app` geschrieben — nur gelesen. Nicht
committet, nicht gestaget.**

## Abnahme

**2026-08-29, Orchestrator. Nachgemessen.**

### G-108 — der Wortlaut ist ueberholt, die Messung findet Schlimmeres

`[cmd]` **Der `Auffaellig`-Filter liefert bei 7, 30 und 90 Tagen
identische Ergebnisse** — 42 Zeilen am Schirm in allen dreien, in der
Datenbank dieselben zwoelf Codes.

`[read]` **Der Mittelwert verschiebt sich (495 / 487 / 479), aber
keine Zeile ueberschreitet je ihre Schwelle.** **Der Zeitraumwaehler
aendert die Zahlen, nicht die Auswahl.**

`[read]` **Das ist der C-323-Befund in seiner schaerfsten Form** —
und er war in G-108 nicht zu erwarten.

`[read]` **Gebaut ist ein Satz, keine zweite Ansicht:** der Reiter
sagt, was der Mittelwert verbirgt, **nur oberhalb eines Tages**, am
Schirm geprueft.

`[cmd]` **Die Dauerregel absichtlich nicht angebunden:** `flagVon`
aus C-323 ist fertig und ohne Aufrufer, **kostet aber 1.786 ms fuer
90 Tage — und der Reiter braucht schon 5.906 ms warm.** `[cmd]`
**Zusammen rund 7,7 s; C-189 hat neun Sekunden als Defekt
behandelt.**

`[read]` **Das ist die richtige Entscheidung:** eine Verbesserung, die
den Reiter unbenutzbar macht, ist keine.

### G-116 — bestaetigt, und die Ursache ist eine andere

`[cmd]` **`schokolade` 162 → 0, nicht 163 → 1.** `[cmd]` **Cola
243 → 42, `wurst` 206 → 42.**

`[cmd]` **Nachgemessen ueber die Tags: 162 Schokoladen-Treffer tragen
`ultra_processed`, 10 tragen `contains_nuts`.** `[read]` **Es ist
der generelle Ausschluss, nicht die Allergie** — seine
Ursachenzuweisung stimmt.

`[read]` **Mein eigener `food_search`-Aufruf lieferte 1 statt 162;
ich habe die Signatur falsch bedient.** **Seine Zahl steht, meine
nicht.**

`[read]` **Und die Antwort auf meine Frage im Auftrag ist praeziser
als die Frage:** *,,hier ist eine Null weder ein gemessener Wert noch
eine fehlende Aussage, sondern eine unterdrueckte — der Treffer
existiert, wird bewertet, und nicht gezeigt."*

`[cmd]` **Die Stufe, die Tom beschrieben hat, existiert bereits:**
starke Filter wirken nur ohne Suchbegriff und ranken sonst ab.
**Generelle Ausschluesse sind schlicht hart zugewiesen.**

### G-250 — die Praemisse faellt, die Antwort ist *selten*

`[cmd]` **`goals.nutrition_targets` hat genau sechs
Naehrstoffspalten:** `kcal`, `protein_g`, `carbs_g`, `fat_g`,
`linoleic_acid_g`, `alpha_linolenic_acid_g`.

`[read]` **Meine 60 im Auftrag war falsch** — die Zahl stimmt, aber
sie bedeutet etwas anderes: *irgendein Ziel oder eine Obergrenze*.
**Als Zahl richtig, als Behauptung falsch.**

`[cmd]` **Von den sechs tragen drei beide Achsen, und genau eine geht
auseinander:** `F18:3CN3` ist gegen das Goal gedeckt (85,7 %) und
gegen EFSA zu wenig (51,6 %).

`[read]` **Nach dem G-218-Massstab ist das *selten*** — eine Achse
mit Vermerk genuegt, **und der Vermerk steht bereits in der
Kopfzeile.**

`[read]` **Die Vergleichsfunktionen sind gebaut, getestet und
absichtlich an nichts gehaengt.** Toms Entscheidung.

### Die siebte Sabotage

`[read]` **Der Test suchte `mittelwertSatz(` im Quelltext** — die
Bedingung durch `false` zu ersetzen liess den Aufruf stehen.
**Wort statt Wirkung, das Muster aus G-216, G-247 und G-246 zum
vierten Mal**, jetzt auf die Bedingung mit ihrem Argument geprueft.

`[cmd]` 7/7 Sabotagen fallen, Gate 11/11, 291/291 Tests, 0 Attrappen,
keine Doppelung.

**Abgenommen.** Drei Folgepunkte: **G-260** (Dauerregel anbinden,
wenn der Reiter schneller ist), **C-347** (G-116 in `food_search`),
**G-261** (die Vergleichsfunktionen aus G-250).

