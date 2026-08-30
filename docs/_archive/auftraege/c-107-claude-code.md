# C-107 + C-195 — Claude Code, 2026-08-23

Bericht: `docs/berichte/c-107-claude-code.md`

---

## KORREKTURBLOCK, nachgereicht 2026-08-23 — G-176 kommt zuerst

**Tom hat es am Bildschirm gefunden**, waehrend du liefst:

> *„supplement zeigt nur ‚50 von 290 Treffern — Suche verfeinern fuer
> mehr.'"*

`[cmd]` `apps/web/src/app/v2/supplements/substanz-detail.tsx:314`:

    return { gezeigt: menge.slice(0, 50), gesamt: menge.length }

`[cmd]` **Ein hartes Limit im Client**, nicht in der Datenbank — der
Lesepfad holt alle 290. Eingebracht von `d019b79` (C-229/G-172).

`[read]` **Es widerspricht dem Punkt, aus dem es stammt.** G-172
verlangte den Scroll-Container, **weil unten alles unerreichbar war.**
Der Container ist gebaut — und dann auf 50 begrenzt. Die Liste ist
wieder unerreichbar, nur an anderer Stelle.

`[read]` **Und die Aufforderung geht ins Leere:** wer nicht weiss, wie
die Substanz heisst, kann die Suche nicht verfeinern. **Ein Katalog ist
zum Blaettern da**, nicht zum Nachschlagen eines bekannten Namens.

**Zu tun, vor allem anderen in diesem Auftrag:** die 290 erreichbar
machen.

`[read]` **Wie, ist deine Entscheidung** — Nachladen beim Scrollen,
Blaettern, oder alle 290 mit virtualisierter Liste. **Miss zuerst, was
290 Zeilen im DOM tatsaechlich kosten**, statt das Limit blind zu
entfernen oder blind zu behalten. `[cmd]` Die Zahl vor und nach der
Aenderung gehoert in den Bericht.

**Nachweis:** die letzte Substanz der Liste muss erreichbar sein, ohne
etwas zu tippen. Nenn sie namentlich.

---

## ZWEITER KORREKTURBLOCK — G-177, und er wiegt schwerer

Tom hat das Detailfenster zu **Bromocriptine** geschickt. Es zeigt:
einen Satz Beschreibung, zwei Alias-Chips, **fuenf zugeklappte
Bloecke** — *Sicherheit 2 Felder · Rechtslage 5 Felder ·
Warnschwellen 2 Felder · Kennungen 5 Felder · Evidenz 7 Felder* — und
darunter, **aufgeklappt und laenger als alles andere zusammen**, den
Abschnitt *„OHNE QUELLE IM NEUEN KATALOG"*.

Der Nutzer liest dort:

> *„Die alte Breittabelle fuehrte `cyp` als jsonb. Im neuen Schema gibt
> es dafuer keine Spalte — auch nicht in `supplement_pharmacology`."*

**Das ist ein Bericht, kein Produkt.** Er gehoert nach
`docs/berichte/`. Die Begruendung, warum ein Feld im Schema fehlt,
interessiert den Orchestrator — **nicht den, der wissen will, was
Bromocriptine ist.**

`[read]` **Die Gewichtung ist genau verkehrt:** was da ist, ist
zugeklappt und auf Feldzahlen reduziert; was fehlt, ist ausgeklappt und
ausfuehrlich begruendet.

`[read]` **Es ist dieselbe Kritik wie zu C-229:** *„hat keine
informationen wie was ist das ueberhaupt, tonnen eintraege aber keine
beschreibung."* Der Katalog hat sie geloest, **das Detail nicht.**

`[cmd]` **Der Inhalt ist da und wird nur nicht gezeigt:**
`supplement_dosing` 566 · `pharmacology` 566 · `safety` 290 ·
`warnings` 290 · `wada` 290 · `quality` 237 · `regulatory` 1119 ·
`identifiers` 1226 · `organ_risks` 1450.

**Zu tun:** die Bloecke mit Inhalt aufgeklappt oder wenigstens
angerissen, statt mit *„N Felder"*. Der Luecken-Abschnitt zugeklappt,
gekuerzt oder ganz raus.

`[read]` **Was von den Luecken bleiben soll, ist eine Entscheidung, die
du begruendest:** dass eine Angabe fehlt, ist fuer den Nutzer relevant.
**Warum sie im Schema fehlt, nicht.**

`[read]` **`substanz-luecken.ts` bleibt trotzdem richtig** — die
Messung dahinter ist gut und war der halbe Ertrag von C-252. **Sie
gehoert nur nicht in dieser Ausfuehrlichkeit vor den Nutzer.**

**Nebenbefund:** unter dem Namen steht `sub_b38d752d32`, die technische
Kennung. Ob sie dorthin gehoert, entscheide und begruende.

### Was der Nutzer sehen will — gemessen, nicht geraten

**Tom, 2026-08-23:** *„das detail sieht erstens scheisse aus und
zweitens alles ausser was ein user wirklich sehen will."*

`[cmd]` **Ich habe alle 290 sichtbaren Substanzen durchgezaehlt.** Was
gefuellt ist:

| Angabe | von 290 |
|---|---:|
| Beschreibung | **290** |
| `evidence.overall_grade` | **290** |
| **`evidence.summary_en` — der Fliesstext** | **288** |
| `wada.wada_status` | **290** |
| `warnings.doctor_consult_flags` | 128 |
| `dosing.studied_dose_ranges` | 83 |

Was leer ist:

| Angabe | von 290 |
|---|---:|
| **`dosing.guideline_dose`** | **0** |
| `warnings.warning_en` | **0** |
| `dosing.status = 'unbekannt'` | 115 |
| `safety.status = 'unbekannt'` | 53 |

`[read]` **Damit ist der Befund schaerfer als „falsche Gewichtung".**
Der wichtigste Inhalt — **eine Evidenz-Zusammenfassung bei 288 von
290** — steckt zugeklappt hinter *„Evidenz · 7 Felder"*, waehrend der
Lueckenbericht ausgeklappt die Flaeche fuellt.

`[cmd]` **Und *„N Felder"* zaehlt Spalten, nicht Angaben.** Bromocriptine
(`sub_b30d752d32`): *„Sicherheit · 2 Felder"* — beide tragen
`unknown`, `status` ist `unbekannt`. **Die Zahl verspricht Inhalt, den
es nicht gibt.**

**Reihenfolge, die sich aus den Zahlen ergibt:**

1. Name, Gruppe, Kategorie
2. Beschreibung — **290/290**
3. **Evidenz: Grad UND Zusammenfassungstext, offen** — 290 und 288
4. **WADA-Status** — 290/290, bei Enhanced und Peptiden der Grund,
   warum jemand nachsieht
5. Dosis, wo vorhanden — 83/290; wo nicht, **ein Satz statt eines
   leeren Blocks**
6. Warnungen und Arzt-Flags — 128/290
7. Kennungen ganz unten, zugeklappt — CAS, PubChem, InChIKey liest
   niemand beim Einkaufen
8. Lueckenbericht raus

`[read]` **Das ist eine Reihenfolge, kein Entwurf.** Wie es aussieht,
ist deine Arbeit — Tom sagt, die jetzige Fassung sieht schlecht aus,
und das ist mit Zahlen nicht zu beheben.

`[read]` **Ein Block ohne Inhalt wird nicht als leerer Block gezeigt.**
Entweder er faellt weg, oder er sagt in einem Satz, dass die Angabe
fehlt — **nicht *„2 Felder"*, hinter denen zweimal `unknown` steht.**

**Nachweis:** Bromocriptine und eine gut gefuellte Substanz nebeneinander,
beide namentlich. Bei beiden muss ohne Klick erkennbar sein, was der
Stoff ist, wie gut er belegt ist und ob er auf der WADA-Liste steht.


**G-178 hat sich erledigt** — Tom, 2026-08-23: *„liste zeigt nun 290."*
Die 298 im Reiter waren ein alter Build im Browser. Nicht suchen.


---

## Der Katalog steht. Jetzt fehlt ihm der Inhalt.


Nach Schritt 4 liest die Oberflaeche `supplements.supplements` mit
`im_katalog`. `[cmd]` **290 Eintraege sichtbar, 276 verborgen.**

## WAS ICH GEMESSEN HABE — live, 2026-08-23

`[cmd]` Was am Eintrag haengt: `supplement_dosing` 566 ·
`supplement_pharmacology` 566 · `supplement_safety` 290 ·
`supplement_warnings` 290 · `supplement_wada` 290 ·
`supplement_quality` 237 · `supplement_lab_effects` 222 ·
`supplement_organ_risks` 1450 · `supplement_identifiers` 1226 ·
`supplement_regulatory` 1119 · `supplement_interactions` 78 ·
`supplement_monitoring` 46 · `supplement_nutrients` 17.

`[cmd]` **`supplement_evidence` traegt seit C-248 alle 290
Evidenzgrade** — vorher 259, weil der Import Grad `E` abwies.

`[read]` **Der Punkt C-107 fragt, was dem Katalog fehlt.** Er ist am
2026-08-19 geschrieben worden, gegen einen Bestand von 44 Zeilen.
**Lies ihn pruefend** — ein Teil davon ist durch den Neuaufbau
beantwortet, ein Teil nicht. **Was beantwortet ist, meldest du als
beantwortet, statt es nochmal zu bauen.**

`[read]` **C-195** wollte `substance_catalog` auf Kimi-Tiefe bringen.
`[cmd]` **Die Tabelle wird nach C-255 entfernt.** Der Punkt gilt jetzt
fuer `supplements.supplements` und seine Detailtabellen — **pruef, was
davon der Neuaufbau schon erfuellt.**

## WAS ZU TUN IST

1. **Erst messen, dann bauen.** Fuer C-107 und C-195: welcher Teil ist
   durch den Neuaufbau erledigt, welcher nicht? **Zahl je Teil.**

2. **Was offen bleibt, im Detail sichtbar machen** — die
   Detailtabellen tragen Inhalt, den die Oberflaeche heute nicht zeigt.
   **Welche, entscheidest du nach der Messung; begruende die Auswahl im
   Bericht.**

3. **Rueckfall-Logik nach C-254** — jedes Textfeld, nicht nur
   `name_de`. `[cmd]` `summary_de` 0/288, `metabolism_de` 0/290,
   `storage_de` 0/54.

4. **Wo ein Feld leer ist, steht ein Hinweis, keine Zahl.** `[cmd]`
   276 Eintraege tragen gar keinen Inhalt — sie sind ueber
   `im_katalog` ausgeblendet, aber die 290 sichtbaren haben je nach
   Feld ebenfalls Luecken.

## WAS NICHT ZU TUN IST

**`im_katalog` nicht umgehen.** Die 276 bleiben verborgen — das ist
Toms Entscheidung C aus C-243.

**Keine Salzform-Entscheidung** (C-244, offen bei Tom).
**Keine deutschen Texte erfinden** (C-254).

`supabase/_pipeline/` **nicht anfassen** — Codex entfernt dort gerade
die alten Kataloge (C-255).
`apps/web/src/app/v2/recovery` und `apps/coach/` **nicht anfassen** —
Fable.

Nicht committen, nicht stagen, nicht pushen.
Nichts in `docs/todo/` oder `docs/ssot/` schreiben.

## NACHWEIS — Erwartung VOR dem Lauf, beide Richtungen

**Je Teil, den du als erledigt meldest: die Zahl, die es belegt.**

**Gegenprobe:** ein Eintrag mit vollem Detail und einer mit Luecken —
beide namentlich, beide muessen richtig anzeigen.

**Negativprobe:** ein Detailfeld kappen; die Pruefung muss rot werden.
`[read]` **Zum dritten Mal derselbe Hinweis, weil es zweimal passiert
ist:** eine Pruefung, die mit ihrem Gegenstand verschwindet, misst
nichts.

`node tools/schuss.mjs` — nach G-175 auf `test-user@lumeos.local`.
Vorher auf `dev@lumeos.app` mit Vermerk.

## REGELN

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
Nie `pnpm dev` — nur `python tools/server.py`.
`.next` nie loeschen, `next build` nie direkt aufrufen.
Bauen ueber `pnpm --filter @lumeos/web build`.
Pruefschleifen als Skript-Datei, nicht als Shell-Einzeiler mit `$(...)`.
Repo-Text mit Sonderzeichen nicht ueber die Standardeingabe einer
interaktiven Sitzung schreiben.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**
