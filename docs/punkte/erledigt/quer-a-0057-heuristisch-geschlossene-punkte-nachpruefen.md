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
erledigt: 2026-08-28
commit: ce10df59
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

**Stand: 2026-08-28.** Die Ausgangsannahme war 25 heuristisch
Geschlossene mit einem bereits gefundenen Fehler. Meine Direktmessung
prueft alle 25: **23 zu Recht geschlossen, 2 falsch geschlossen,
0 unklar.** C-274 war bereits wiederhergestellt; A-57 stellt C-208
wieder her. Die Belege unten stammen aus Live-Datenbank, Quellcode oder
ausgefuehrten Tests, nicht aus den beiden Hinweisberichten.

| Punkt | Urteil | Direktmessung |
|---|---|---|
| C-108 | zu Recht erledigt | `[cmd]` `supplement_interactions`: 78 Zeilen, 0 mit anderem Schweregrad als `caution`. |
| C-195 | zu Recht erledigt | `[cmd]` 53 Tabellen im Schema `supplements`; `supplement_safety` 290, `supplement_pharmacology` 566, `supplement_dosing` 596 und `supplement_identifiers` 1.226 Zeilen. Die eigene Zahl 53 gilt, nicht die 56 aus dem Hinweisbericht. |
| C-208 | **falsch erledigt** | `[cmd]` 596 Supplements (412 sichtbar), 498 Wirkstoffe, 453 Formulierungen und 448 Produkte widerlegen die alte Importpraemisse; die noch offene C-129-Punktdatei traegt trotzdem unveraendert 237 / 56 / 124. Wiederhergestellt. |
| C-222 | zu Recht erledigt | `[cmd]` `supplement_monitoring` existiert mit 46 Zeilen. |
| C-223 | zu Recht erledigt | `[cmd]` `dose_ceiling` ist `jsonb`, nicht `numeric`; 290 Warnungen, 32 JSON-Objekte mit Schluessel `value`. |
| C-228 | zu Recht erledigt | `[cmd]` 3 Gruppen und 23 Kategorien; 0/412 sichtbare Eintraege ohne Gruppe oder Kategorie. |
| C-232 | zu Recht erledigt | `[cmd]` Das Schema `supplements` hat 53 Basistabellen und damit mehr als die geforderten 26. |
| C-234 | zu Recht erledigt | `[cmd]` `user_supplement_cycles.marketplace_product_id` hat 0 Spalten und `apps/web/src/app/v2/marketplace` 0 Verzeichnisse. Der verbleibende `TODO(C-234)`-Kommentar ist keine existierende Fremdreferenz. |
| C-242 | zu Recht erledigt | `[cmd]` 0 sichtbare Gruppen mit doppeltem nichtleerem `name_en`; 101 Eintraege sind ueber `parent_id` Unterformen. |
| C-244 | zu Recht erledigt | `[cmd]` Die 28 `lumeos_supplement_catalog`-Eintraege sind sichtbar; 33 Kimi-Substanzen haengen inzwischen mit `parent_id` an ihnen. Der fruehere 28-gegen-28-Schnitt ist damit nicht mehr unverbunden. |
| C-284 | zu Recht erledigt | `[cmd]` 498 Wirkstoffe, ATC 497, CAS 489, UNII 420, Pharmakologie und Vorsicht je 498, 498 Nutzertexte, 2.313 FAQs und 498 Reproduktionszeilen. |
| C-301 | zu Recht erledigt | `[cmd]` `intake_logs_coach_read` nutzt `user_id IN (SELECT client_id FROM coach.client_permissions ...)` mit Ablauf und `full`, kein `coach.hat_sicht()` im Policy-Ausdruck. |
| C-116 | zu Recht ueberholt | `[cmd]` Der Katalog hat 596 statt 320 Zeilen, 412 sichtbar. |
| C-196 | zu Recht ueberholt | `[cmd]` Der alte 290er-Importausschnitt ist durch 596 Katalogzeilen und die normalisierten Faktenbloecke `safety` 290, `pharmacology` 566, `dosing` 596, `identifiers` 1.226 ersetzt. |
| C-221 | zu Recht ueberholt | `[cmd]` `supplement_interactions` hat 78 Zeilen statt einer leeren toten Spec-Tabelle. |
| C-274 | **falsch ueberholt** | `[cmd]` 184 unsichtbare Eintraege, 101 mit `parent_id`, **83 ohne**. Bereits vor A-57 als Punktdatei wiederhergestellt. |
| G-78 | zu Recht erledigt | `[cmd]` `node tools/serverimport-pruefen.mjs`: 62 Client-Chunks, 0 Treffer; Gegenprobe 3 Server-Clients und 4 `cookies()`-Aufrufe. |
| G-138 | zu Recht erledigt | `[cmd]` Der fokussierte Testlauf pruefte die 11 G-138-Schreibwegstests: alle gruen, genau eine Datei schreibt `intake_logs`. |
| G-170 | zu Recht erledigt | `[cmd]` `medical.user_medications` existiert mit 2 Zeilen; `tab-tracking.tsx` kennzeichnet die Behauptung zu `medical.medications` explizit als alte falsche Begruendung. |
| G-172 | zu Recht erledigt | `[cmd]` Der fokussierte Testlauf bestaetigt deutsche Sichttexte, Message-basierte Tabnamen und den senkrechten Scroll-Container. |
| G-176 | zu Recht erledigt | `[cmd]` Der fokussierte Testlauf bestaetigt: kein `slice` auf der Trefferliste. |
| G-177 | zu Recht erledigt | `[cmd]` Der fokussierte Testlauf bestaetigt: Detail zeigt kein Schemaprotokoll und keine Kennung. |
| G-192 | zu Recht erledigt | `[cmd]` Der fokussierte Testlauf bestaetigt den Community-Reiter nur mit erlaubtem Inhalt und ohne Anleitungsfelder. |
| G-178 | zu Recht ueberholt | `[cmd]` Live: 412 sichtbare Eintraege, nicht 290/298; Gruppenverteilung `supplement` 211, `enhanced` 122, `peptide` 79. |
| G-209 | zu Recht ueberholt | `[cmd]` `rg` findet 0 Codevorkommen von `1.483`/`1483`; die isolierte alte Laufzeit hat weder Schwelle noch heutige Codebindung. |

### Wiederherstellung

`[cmd]` **1 neue Punktdatei:**
`docs/punkte/todos/supplements-c-0208-c-129-neu-fassen-der-import-ist-laengst-passiert.md`.
Sie folgt dem C-274-Muster, hat `zahlen.gemessen: 2026-08-28` und die
heutigen Werte 596 / 412 / 498 / 453 / 448. C-274 bleibt als die zweite
falsch geschlossene Datei bereits wiederhergestellt. `ERLEDIGT.md`
blieb unveraendert.

**Ergebnis:** Die Ausgangszahl "1 falsch" ist falsch; es sind **2/25**.
Davon wurde **1/2** bereits vor diesem Auftrag wiederhergestellt und
**1/2** in A-57. Keine Code-, Daten- oder Anwendungsdatei wurde geaendert.

`[cmd]` Nach der Wiederherstellung lief `node tools/punkte-index.mjs
--schreiben`; der Punkte-Waechter mit Sollstand steht im Nachweis.


## Abnahme

**2026-08-28, Orchestrator.**

`[cmd]` **23 von 25 Schliessungen waren korrekt, 2 falsch.**

    C-274   bereits wiederhergestellt (in C-325 gefunden)
    C-208   neu angelegt, mit Messdatum und heutigen Zahlen

`[cmd]` **C-208 nachgeprueft:** liegt in `todos/`, Frontmatter
vollstaendig, `gemessen: 2026-08-28`, vier Tabellen unter
`beruehrt`. **Sauber.**

`[cmd]` **C-234 bewusst geschlossen gelassen, und das stimmt:**
`marketplace_product_id` kommt in **0** Spalten vor, es gibt **0**
Marketplace-Schemata und **0** Marketplace-Tabellen. **Der
urspruengliche Befund verlangte genau das.**

### Was die Zahl bedeutet

`[read]` **Zwei von 25 klingt nach wenig.** `[cmd]` **Auf die 385
erledigten Punkte hochgerechnet waeren es rund 30** — und die
Punktverwaltung waere mit dreissig falschen Zustaenden gestartet.

`[read]` **Der Fehler war nicht die Trefferquote, sondern das
Verfahren:** ich habe einen Regex ueber Berichte laufen lassen und
das Ergebnis als Messung ausgegeben. **Eine Heuristik, die zu 92
Prozent stimmt, ist als Heuristik brauchbar und als Abnahme
wertlos.**

`[read]` **Und gefunden hat es keiner meiner Waechter**, sondern ein
Agent, der eine ausdrueckliche Anweisung verweigert hat.

**Abgenommen.**

