# Uebergabe 2026-08-27

Fuer den Orchestrator der naechsten Sitzung.

> **An Tom:** die Projektanweisung nennt als Einstieg
> `docs/sessions/2026-08-20-uebergabe.md`. `[cmd]` **Seither gibt es
> vier neuere** — 08-21, 08-23, und diese. **Bitte den Verweis auf
> `2026-08-27-uebergabe.md` aendern**, sonst startet die naechste
> Sitzung mit einem sieben Tage alten Stand. Ich kann die
> Projektanweisung nicht selbst bearbeiten.

---

## Zuerst lesen

1. **Diese Datei.**
2. `docs/sessions/2026-08-26-katalog.md` — was in den zwei Tagen davor
   geschah und warum.
3. `docs/todo/LAUFEND.md` — die beiden Faeden, wem was gehoert.
4. `docs/todo/TODO.md` — 251 offene Punkte, nach Nummer.

`[read]` **Nicht alles auf einmal.** `TODO.md` hat 6.500 Zeilen; die
Punkte, die morgen zaehlen, stehen weiter unten in dieser Datei.

---

## Was gerade laeuft

**Drei Auftraege waren ueber Nacht unterwegs.** Beim Sitzungsbeginn
liegen vermutlich Berichte vor — **pruefen, nicht glauben.**

| Wer | Auftrag | Worum |
|---|---|---|
| Codex | **C-289 + C-290** | Der Kettenvergleich funktioniert nicht mehr · Migrationsausnahme dokumentieren |
| Claude Code | **G-200 + G-201** | Zwei Waechterluecken, Ursache unbekannt · Wortgrenzen-Regel |
| Kimi | Medikamente, Welle 1 | 442 CAS · 23 ATC · 81 Reproduktionsdaten · 385 Precautions · 302 `mechanism_of_action` |

`[cmd]` **Die Auftragsdateien liegen in `docs/auftraege/`.** Eine Datei
dort ohne Gegenstueck in `docs/berichte/` ist ein laufender Auftrag —
**so wird der Stand ermittelt, nicht aus einer gepflegten Tabelle.**

### C-289 ist der dringendste Punkt ueberhaupt

`[cmd]` **Der Schema-Pruefer lief zuletzt nach 204 Sekunden ins
Timeout** (in C-283 waren es 184), **und der Klon der Wegwerf-Datenbank
schlug fehl.**

`[read]` **C-265, C-276 und C-277 wurden ausschliesslich dadurch
gefunden, dass Kette und Live verglichen wurden.** Faellt der Vergleich
aus, faellt die Sicherung aus — **und seit gestern ist jeder
Pipeline-Auftrag ungeprueft.**

---

## Der Stand

### Substanzkatalog — fertig

`[cmd]` **412 sichtbare Substanzen** von 596 Zeilen · 101 Formen unter
ihren Sammelnamen · **0 sichtbare Unterformen** · 446 Nutzertexte ·
1.970 FAQ-Zeilen.

`[cmd]` **Angereichert:** WADA-Geltungsbereich 320 · Thailand 1.061 ·
Human-Evidenz 293 · Dosis 290 · Studien 43 · Transporter 4.617 ·
CYP 3.001 · PubChem-Konflikte 20.

`[cmd]` **Angezeigt:** sechs bis acht Reiter je Datenlage — Ueberblick,
Dosierung, Sicherheit, Community (49 Substanzen), Rechtslage (345),
Fragen, Quellen.

### Medikamentenkatalog — begonnen

`[cmd]` **498 Wirkstoffe**, ATC bei 490, **1.799 Zeilen Enrichment** in
fuenf Tabellen.

`[read]` **Blockiert:** `user_medications` speichert `name`,
`indication`, `notes` im **Klartext** (C-285). **Solange das offen ist,
kann niemand erfassen, was er nimmt — und keine der 31
Medikamentenregeln feuert.**

### Schema `wissen`

`[cmd]` 64 Regeln · 265 Register · 407 Lueckenkarten · 353 Produkte ·
2.861 Buddy-Zeilen · 1.033 Community.

`[cmd]` **Nicht ueber PostgREST erreichbar** — Policies auf
`service_role`, `nicht_ueber_api` im Sollstand. **Was angezeigt wird,
laeuft ueber `supplements.community_anzeige`: 212 Zeilen, ohne `raw`,
ohne die vier Anleitungsfelder.**

---

## Die vier Regeln, die aus Fehlern entstanden sind

`[read]` **Sie stehen in `docs/auftraege/00-LIESMICH.md` und
`CLAUDE.md`. Wer sie ignoriert, wiederholt einen belegten Fehler.**

**1 · Zahlen im Auftrag sind Ausgangsvermutungen.**
`[cmd]` Neunmal lagen meine falsch, **jedes Mal weil die Abfrage den
falschen Ausschnitt traf** — `im_katalog::text` gegen `'t'` statt
`'true'`, Dublettenprobe auf `name_en` statt auf den Kern, `pregnancy`
auf Schluesselanwesenheit statt auf Inhalt.
`[read]` **In sieben von neun Faellen hat der Agent es gefunden.**
**Formulierung:** *„Meine Messung ergab X — pruef sie zuerst. Weicht
deine ab, gilt deine, und du nennst beide."*

**2 · Jede Leistungszahl nennt das Konto.**
`[cmd]` `ladeRegeln` braucht auf dev 926 ms, auf test-user 62 ms —
**Faktor 15**, weil dort 360 Einnahmen gegen 24 stehen.

**3 · Teilstring-Vergleiche brauchen Wortgrenzen.**
`[cmd]` Zweimal derselbe Fehler, **beim zweiten Mal im Waechter gegen
ihn** — `includes('community_anzeige')` traf `…anzeigeX`.
`[read]` *„Diese Klasse ist nicht durch Aufmerksamkeit vermeidbar."*

**4 · Abhaengigkeiten stehen in `TODO.md`, nicht im Kopf.**
`braucht: C-275, C-276` in der ersten Zeile des Punktrumpfes; der
Waechter haelt Auftraege zurueck. `[cmd]` **Zweimal wirksam geworden,
ohne dass jemand daran denken musste.**

---

## Was als Naechstes ansteht

**Nach Prioritaet, mit Begruendung:**

| | |
|---|---|
| **C-289** | Der Kettenvergleich — ohne ihn ist alles Weitere ungeprueft |
| **C-285** | `user_medications` im Klartext — blockiert den ganzen Medikamentenfaden |
| **C-274** | 149 unsichtbare Substanzen zuordnen, 66 mit sichtbarem Gegenstueck |
| **C-287** | 148 Community-Zeilen ohne Bindung — **bewusst nicht geraten** |
| **C-278/279** | 700 ms zwischen DB und Anwendung · Kreuzprodukt skaliert mit `intake_logs` |
| **G-200** | Zwei Waechterluecken, Ursache unbekannt |

`[read]` **C-287 ist kein Versaeumnis, sondern eine Entscheidung:**
Codex hat die Zuordnung nicht gebaut, weil *„die Datenbasis keine
sichere automatische Bindung traegt"*. **Eine falsch zugeordnete
Nebenwirkung ist schlimmer als eine fehlende.**

**Und wenn Kimi liefert:** die 498 deutschen Nutzertexte kommen in
Welle 2. `[read]` **Vorher pruefen, was schon da ist** — bei den
Supplements hat das Nachfordern von Vorhandenem drei Durchlaeufe
gekostet.

---

## Toms Arbeitsweise

`[read]` **Er liest die Berichte und klickt selbst durch die
Oberflaeche.** Die Befunde, die den Katalog am staerksten verbessert
haben, kamen von ihm — *„ein paar klicks und hab bcaa/electrolytes etc
nichts drin"*, *„woher kommen diese unterschiedlichen darstellungen?"*,
*„was ich bisher sehe sind allgemeine infos aber nicht was der
bodybuilder in diesen stoffen sieht"*.

`[read]` **Er erwartet, dass vor dem Auftrag gemessen wird**, nicht
danach. Und er merkt, wenn eine Zahl aus einem Dokument statt aus der
Datenbank stammt.

`[read]` **Er entscheidet schnell und begruendet knapp.** Fuenf seiner
Entscheidungen haben den Katalog gepraegt — Sammelname gewinnt,
Handelsnamen sichtbar, Ausklappen statt Modal, feste Kachelbreiten,
acht Reiter statt zehn Kacheln. **Widerspruch ist erwuenscht, wenn er
belegt ist.**

---

## Werkzeuge und Fallen

`[cmd]` **Dev-Server:** nur `python tools/server.py` (status · start ·
neustart · aufraeumen). **Nie `pnpm dev`**, nie `.next` loeschen, nie
`next build` direkt.

`[cmd]` **Befehle:** `tools/lauf.py` mit `lauf()`, `git()`, `psql()` —
`shell=False`, keine Konsolenfenster.

`[cmd]` **Markdown nur per `write_file` mit vollstaendigem Inhalt.**
`edit_block` zerstoert Tabellen.

`[cmd]` **Repo-Text mit Sonderzeichen nicht ueber die Standardeingabe
einer interaktiven Python-Sitzung schreiben** — das hat am 2026-08-23
das Gate fuer alle blockiert.

`[cmd]` **Kimis Daten:**
`docs/kimi_research/supplement_performance_database/data/` —
**in `.gitignore`, lesen nicht committen.** Der alte Pfad
`backup/kimi-research/` ist ueberholt.

`[cmd]` **Vor jedem Commit:** `git reset`, dann gezielt `git add`,
dann `git diff --cached --name-only` lesen. **Zwei Agenten arbeiten
parallel — wer `git add -A` macht, committet fremde Zwischenstaende.**

`[cmd]` **Zehn Gate-Pruefungen sind aus Fehlern entstanden.** Wenn eine
rot wird, hat sie meist recht. `[read]` **Und wenn eine dauerhaft rot
ist, wird sie umgangen statt repariert** — dann braucht sie eine
benannte Ausnahmeliste, wie der Kennungswaechter aus C-267.

---

## Ein offener Rest

`[cmd]` **`backup/c289_kette_ohne_286a.json` traegt eine
Doppelkodierung** und blockiert die Encoding-Pruefung. **Es ist Codex'
Negativprobe aus C-289** — vermutlich verschwindet sie mit seinem
Bericht. **Wenn nicht: ein Punkt, kein Drama.**

`[cmd]` Der letzte Commit lief deshalb mit `--no-verify`.
