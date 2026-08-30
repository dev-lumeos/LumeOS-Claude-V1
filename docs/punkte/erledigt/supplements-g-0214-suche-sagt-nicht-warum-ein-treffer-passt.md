---
nr: G-214
typ: befund
modul: supplements
schwere: mittel
angelegt: 2026-08-28
braucht: []
kind_von: G-186
entscheidung: null
agent: codex
beauftragt: 2026-08-30
erledigt: 2026-08-30
commit: 851fa077
beruehrt:
  dateien:
    - apps/web/src/lib/supplements/substanz-kategorien.ts
zahlen: null
---

# G-214 — die Katalogsuche sagt nicht, warum ein Treffer passt

## Befund

Aus G-186, Claude Code, 2026-08-28.

`[cmd]` **Die Suche nach *,,Resveratrol"* findet auch
*Pterostilbene* — ohne zu sagen warum.** Der Treffer entsteht ueber
einen Erklaertext, in dem der andere Stoff vorkommt.

`[read]` **Fuer den Nutzer sieht das aus wie ein Fehler.** Er sucht
einen Stoff und bekommt einen anderen, ohne Verbindung dazwischen.

`[read]` **Die Loesung ist gebaut und liegt daneben:** in G-210 wurde
fuer Handelsnamen genau das gemacht — *,,Scemblix ist ein Handelsname
von Asciminib - Novartis"*. **Der Treffer zeigt, warum er ein Treffer
ist.**

`[read]` **Hier fehlt dieselbe Zeile.** Und der Fall ist unangenehmer
als bei Handelsnamen: **eine Marke ist derselbe Stoff, ein
Erklaertext-Treffer ist ein anderer.** Wer das nicht sagt, laesst den
Nutzer glauben, Pterostilbene sei Resveratrol.

---

`[read]` **Vor dem Bau zu messen:** wie viele Treffer entstehen
ueberhaupt ueber Erklaertexte statt ueber Namen und Synonyme, und
wie oft fuehrt das zu einem fremden Stoff? **Wenn es Einzelfaelle
sind, reicht eine Begruendungszeile. Wenn es die Mehrheit ist, ist
die Suche falsch gewichtet.**

## Verwandt

**G-150** — *die Volltextsuche findet ueber Erklaertexte*. `[read]`
**Vermutlich derselbe Befund aus anderer Richtung; beide vor dem Bau
zusammenlegen oder abgrenzen.**

## Auftrag

**Mitbeauftragt mit C-205 am 2026-08-30.** Der Auftragstext
und der Bericht stehen dort.

## Neu gemessen, 2026-08-30

**Aus C-205, Codex.**

`[cmd]` **Pterostilbene trifft bei der Suche nach *Resveratrol* ueber
die Beschreibung, ohne sichtbaren Treffergrund.**

`[read]` **Der Treffer ist richtig — die beiden Stoffe gehoeren
zusammen.** **Fehlend ist die Auskunft, nicht die Trefferqualitaet.**

`[cmd]` **`unsupported_sort` meldet einen unbekannten Sortierwert,
nicht einen Treffergrund** — **meine Vermutung, die Auskunft sei
schon da, war falsch.**

## Was zu klaeren ist

`[read]` **Woher kaeme der Grund?** `[cmd]` **Die Suche kennt
Namensfeld, Beschreibung, Alias und Tag** — **welches getroffen hat,
weiss die Funktion, die Anzeige nicht.**

`[read]` **Und ob es eine eigene Ausgabespalte braucht oder ein
Zusatzfeld im JSON, ist eine Bauentscheidung** — **keine
Produktfrage.**

## Auftrag — der Treffergrund

**Beauftragt am 2026-08-30.**

### Das Ergebnis

`[read]` **Nach diesem Auftrag weiss die Anzeige, warum ein Treffer
kam** — **und kann es sagen.**

`[cmd]` **Der Fall aus deiner eigenen Messung:** Pterostilbene trifft
bei *Resveratrol* ueber die Beschreibung. **Der Treffer ist richtig,
die Auskunft fehlt.**

### Was zu bauen ist

`[cmd]` **Die Funktion weiss, welches Feld getroffen hat** — Name,
Beschreibung, Alias oder Tag. **Die Anzeige weiss es nicht.**

`[read]` **Ob das eine eigene Ausgabespalte wird oder ein Feld im
JSON, ist deine Entscheidung.**

`[read]` **Und eine Vorgabe aus dem Bestand:** `[cmd]` **`food_search`
liefert ein JSON-Dokument, keine Tabelle** — **`count(*)` darauf ist
immer 1.** `[read]` **Claude Code hat das am 30.08. gemeldet, nachdem
sein erster Lauf dreimal eine 1 ergab und wie eine Bestaetigung
aussah.** **Miss die Trefferzahl aus dem Dokument, nicht mit
`count(*)`.**

### Was nicht zu tun ist

**Keine Rangregel aendern** — nur die Auskunft.
**Keine Beschreibungen aendern.**
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    Treffergrund je Treffer   vorhanden, belegt an Pterostilbene
    Reihenfolge               unveraendert - Gegenprobe
    Laufzeit                  ms vorher / nachher
    Trefferzahl               aus dem Dokument gezaehlt, nicht
                              mit count(*)

## Bericht

**Nachgemessen am 2026-08-30.** Der konkrete Pterostilbene-Fall ist
echt, aber der Auftrag beschreibt nicht den gebauten Suchpfad. Daher
wurde keine Auskunftsspalte oder JSON-Antwort erfunden und `apps/`
wurde nicht angefasst.

| Nachweis | Ergebnis |
|---|---|
| `nutrition.food_search('Resveratrol', ...)` | JSON-Dokument mit `total = 0`, `result_count = 0`, `foods = []` |
| richtige Zaehlung des JSON | `result->>'total' = 0`, `jsonb_array_length(result->'foods') = 0`; `count(*)` um die Funktion ergibt trotzdem **1** SQL-Zeile |
| Pterostilbene | sichtbar im Supplement-Katalog; `supplement_user_texts.kurz_was_en` sagt, der Stoff sei mit Resveratrol verwandt |
| gebaute Katalogsuche | `apps/web/src/lib/supplements/substanz-kategorien.ts:trifftSuche()`; kein RPC, kein JSON-Dokument |
| heutiger Rueckgabewert | nur `boolean`: Name, die fuer die Liste zusammengesetzte Beschreibung und `zwecke` |
| Alias / Tag im gebauten Suchpfad | werden nicht abgefragt; die Behauptung im Auftrag trifft heute nicht zu |

### Der Fall und der Pfad

Die gespeicherte Katalogspalte `supplements.supplements.description_en`
von Pterostilbene traegt nur die allgemeine Schablone. Die in der
Oberflaeche durchsuchte Beschreibung kommt jedoch vorrangig aus
`supplement_user_texts.kurz_was_en`; dort steht *"related to
resveratrol"*. Deshalb liefert die clientseitige Suche Pterostilbene
bei `Resveratrol`.

Die Nutrition-Funktion `food_search` kann diesen Treffer nicht liefern:
sie sucht nur BLS-Lebensmittel und hat keine Verbindung zum
`supplements`-Schema. Der Aufruf zeigt zugleich die wichtige
Messregel: Die Funktion gibt **ein** JSON-Dokument zurueck. `count(*)`
zaehlt diese eine SQL-Zeile, nicht die Treffer; hier zeigen die Felder
des Dokuments korrekt null Treffer.

### Warum nicht gebaut wurde

Die reale Suchentscheidung liegt ausschliesslich in der
App-Funktion `trifftSuche()`. Sie prueft der Reihe nach `name`,
`description` und `zwecke` und gibt unmittelbar `true` oder `false`
zurueck. Es gibt keine Datenbankfunktion, deren JSON um einen
Treffergrund ergaenzt werden koennte, und die aktuelle Anzeige kann
kein neues Datenbankfeld lesen, ohne dass ihr Suchpfad ersetzt wird.

Damit widersprechen sich zwei Vorgaben:

1. Die Anzeige soll den konkreten Treffergrund erhalten.
2. `apps/` darf nicht geaendert werden.

Ohne mindestens eine Aenderung im bestehenden App-Suchpfad ist (1)
nicht erreichbar; eine neue, ungenutzte RPC-Funktion wuerde nur einen
zweiten Suchpfad schaffen und die Anzeige weiterhin nicht informieren.
Das waere keine Erfuellung von G-214.

### Vorliegende Bauwege fuer Tom

| Weg | Wirkung | Grenze |
|---|---|---|
| `trifftSuche()` auf einen Treffergrund statt `boolean` erweitern und ihn in der Kartenzeile anzeigen | kleinster Weg, bewahrt die heutige Reihenfolge exakt | braucht die ausdruecklich ausgeschlossene `apps/`-Aenderung |
| serverseitige Supplement-Katalogsuche mit JSON `items[].match_reason` bauen und die Ansicht darauf umstellen | ein auswertbarer Suchvertrag fuer Name, Beschreibung, Zweck, Alias und Tag | ebenfalls App-Umstellung; neue Rang- und Laufzeitgegenprobe erforderlich |

Die erste Variante ist die minimale und einzige, die den heute
wirklichen Pterostilbene-Pfad erklaert, ohne Rangregel zu veraendern.
Eine Entscheidung zur Aufhebung der `apps/`-Sperre ist deshalb vor dem
Bau erforderlich.

## Abnahme

**2026-08-30, Orchestrator. Nicht gebaut, und das ist richtig.**

### Der Auftrag beschrieb den falschen Suchpfad

`[cmd]` **`food_search('Resveratrol')` liefert `total = 0`** — sie
sucht BLS-Lebensmittel und hat **keine Verbindung zum
`supplements`-Schema.**

`[cmd]` **Die reale Suchentscheidung liegt in
`apps/web/src/lib/supplements/substanz-kategorien.ts:trifftSuche()`**
— **kein RPC, kein JSON, nur `boolean`.**

`[cmd]` **Und der Treffer erklaert sich:** die durchsuchte
Beschreibung kommt aus `supplement_user_texts.kurz_was_en`, **dort
steht *,,related to resveratrol"*.**

`[read]` **Meine Auftragsannahme — *,,die Funktion weiss, welches Feld
getroffen hat"* — war falsch.** **Es gibt keine Funktion; es gibt eine
App-Funktion mit einem Boolean.**

`[cmd]` **Auch *,,Alias oder Tag"* trifft nicht zu** — der gebaute
Suchpfad fragt sie gar nicht ab.

### Der Konflikt, den er benannt hat

`[read]` **Zwei Vorgaben widersprachen sich:** die Anzeige soll den
Grund bekommen, **und `apps/` darf er nicht anfassen.**

`[read]` **Er hat weder umgangen noch gebaut** — `[cmd]` **eine neue
RPC-Funktion waere ein zweiter Suchpfad gewesen, den niemand ruft.**

`[read]` **Und das ist keine Frage an Tom, sondern die Bereichsregel:**
`[cmd]` **`apps/web/src/app/v2/<modul>` gehoert einem UI-Agenten.**
**Der Punkt geht an Claude Code.**

### Und die Messregel, ein zweites Mal an einem Tag

`[cmd]` **`count(*)` um `food_search` ergibt 1, weil ein JSON-Dokument
zurueckkommt.** `[cmd]` **Richtig zaehlt `result->>'total'` oder
`jsonb_array_length(result->'foods')`.**

`[read]` **Claude Code hat es heute frueh gemeldet, Codex hat es
unabhaengig bestaetigt** — **und ich habe denselben Fehler am 29.08.
zweimal gemacht.**

**Abgenommen als vermessen.** Der Bau geht als **G-281** an Claude
Code.

