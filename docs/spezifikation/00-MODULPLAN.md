# Modulplan — Reihenfolge und Vorgehen

`[cmd]` **Stand:** 2026-08-18. 66 offen, 177 erledigt, 28 Commits vor
`origin/dev`.

**Tom, 2026-08-18:** *„Zuerst Grundlagen und danach jedes Modul
strukturiert bewerten: was braucht das Feature von wo — und daraus
ergibt sich dann die nächste TODO-Liste mit Reihenfolge."*

---

## Das Verfahren je Modul

Vier Schritte, in dieser Reihenfolge. **Kein Schritt wird übersprungen,
und keiner läuft parallel zum vorherigen.**

**1. Bestandsaufnahme** — Was zeigt das Mockup? Welche Tabs, Kacheln,
Filter, Popups? `[cmd]` `tools/vollstaendigkeit.mjs` zählt, die elf
Zählregeln in `theme-v1-umsetzung.md` sagen wie.

**2. Abgleich** — Was sagen `docs/specs/` und `referenz/lumeos-2026/`
dazu? **Vor jeder Einstufung als „fehlt" wird dort nachgesehen.**

**3. Datenlage** — Welche Tabellen und Spalten braucht das Modul, und
was davon existiert? **Fehlt etwas: erst Schema, dann Seeds, dann
Anbindung.**

**4. Anbindung** — Das Mockup bekommt echte Daten. `[read]` **Was es
zeigt, bleibt. Was nicht aus den Daten kommt, wird gemeldet, nicht
ersetzt.** Fehlt eine Spalte oder gehört etwas dazu: **erst mit Tom
reden.**

---

## Wo die Module stehen

| Modul | Mockup | Schema | Seeds | Angebunden |
|---|---|---|---|---|
| **Nutrition** | vollständig | 24 Tabellen, 7.140 Lebensmittel | 173 Mahlzeiten | **weitgehend** |
| **Medical** | vollständig | 5 Tabellen, 11.676 Marker | 140 Werte, 5 Befunde | **Liste + Import** |
| **Supplements** | vollständig | 6 Tabellen, 44 Katalog | 4 Einnahmen | **4 Tabs** |
| **Recovery** | vollständig | **1 Tabelle** | 36 Check-ins | Karte + Check-ins |
| **Goals** | vollständig | 6 Tabellen | 43 Messungen, 3 Meilensteine | **nichts** |
| **Training** | vollständig | 7 Tabellen, 1.416 Übungen | 9 Sitzungen, 60 Sätze | **nichts** |
| **Coach** | vollständig | **keins** | — | **nichts** |
| **Dashboard** | vollständig | liest aus allen | — | teilweise |

---

## Die Reihenfolge

### Stufe 0 — Grundlagen, vor allem anderen

**Diese drei blockieren mehrere Module gleichzeitig.**

`[cmd]` **C-83 — Übungskatalog anreichern.** *(läuft)* 1.878 Übungen in
der XLSX gegen 1.416 in der Datenbank; Muskeln als Fliesstext mit
deutschen und lateinischen Namen. **Blockiert: Training komplett.**

`[cmd]` **C-84 — Die elf Panels.** Existieren in keiner Quelle.
**Blockiert: Medical-Panelfilter und Health score.**

`[cmd]` **C-78 — Zusammenhängende Seeds.** `[read]` Solange Zufuhr und
Gewicht getrennt erzeugt werden, lässt sich **keine Formel prüfen** —
GO-11 hat 1.279 kcal Abstand gemessen, und niemand weiss, ob die Formel
oder die Daten schuld sind. **Blockiert: jede Bewertung.**

### Stufe 1 — Module mit Schema und Seeds, ohne Anbindung

**Reihenfolge nach Datenlage, nicht nach Vorliebe.**

**1. Training.** `[cmd]` Der grösste Bestand (1.416 Übungen, 95
Muskelgruppen, 6.588 Zuordnungen) und die grösste Lücke.
`[read]` **Zuerst der Exercises-Tab mit Suche und Filtern** — 1.416
Übungen ohne brauchbare Suche sind unbenutzbar. **Danach** Sitzungen und
Sätze. **Setzt C-83 voraus.**

**2. Goals.** `[cmd]` Sechs Tabellen, alles gerechnet — TDEE, Phasen,
Meilensteine, Körperfett nach Navy. **Nichts davon ist sichtbar.**
`[read]` Fünf Kacheln können ohne neue Tabelle echt werden (GO-13).

**3. Recovery.** `[cmd]` **Eine Tabelle.** Check-ins und Muskelkarte
sind angebunden, **alles andere braucht Schema** — Schlaf, HRV,
Modalitäten, Protokolle, Übertraining.

### Stufe 2 — Was Schema braucht

**Coach.** `[cmd]` Kein Schema, zwei vollständige Mockups.
`[read]` **Und eine Produktentscheidung davor:** C-71, die zwei Achsen
Sicht und Autonomie.

**Recovery-Rest.** Schlafdaten, HRV-Verlauf, Muskelzustände,
Protokolle — `[cmd]` `SPEC_06` nennt zehn Tabellen, eine existiert.

### Stufe 3 — Was auf allem aufsetzt

**Dashboard.** `[read]` Es liest aus allen Modulen. **Solange die
darunter Attrappe sind, ist jede Kachel eine Behauptung.**

**Buddy.** `[read]` *„Buddy IST das Produkt"* — er findet Zusammenhänge.
**An Daten ohne Zusammenhang findet er keine, und schlimmer: er findet
falsche.** Setzt C-78 voraus.

---

## Was quer liegt und nicht wartet

`[cmd]` **Die Suchqualität** (C-20 bis C-36, neun Punkte) liegt seit
Tagen. `[read]` Sie war einmal der Schwerpunkt — 13 % auf 84 % — und ist
es nicht mehr. **Bei den Übungen steht dieselbe Aufgabe erneut an**, und
diesmal ohne deutsche Namen.

`[cmd]` **Vier Entscheidungen liegen bei Tom:** G-59 (Modulkopf, zurückgestellt) ·
G-61 (`refillUrgent` als Schwelle) · GO-15 (`alpha 0.3`) · C-71
(Coach-Rechte).

---

## Warum diese Reihenfolge

`[read]` **Weil jedes Modul von unten nach oben fertig wird, statt dass
acht halb dastehen.** Bisher wurde nach Verfügbarkeit verteilt — das hat
acht Mockups gebracht und zwei Anbindungen.

`[cmd]` **Und weil die Grundlagen mehrere Module gleichzeitig
blockieren.** C-83 blockiert Training, C-84 blockiert Medical, C-78
blockiert jede Formel. **Wer sie überspringt, baut auf Sand und misst
Zahlen, die zu etwas anderem gehören.**
