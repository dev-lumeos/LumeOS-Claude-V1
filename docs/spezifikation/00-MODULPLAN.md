# Modulplan — Reihenfolge und Vorgehen

`[cmd]` **Stand:** 2026-08-18, 75 offen, 182 erledigt, 64
Kettenschritte, 44 Commits vor `origin/dev`.

**Tom, 2026-08-18:** *„Zuerst Grundlagen und danach jedes Modul
strukturiert bewerten: was braucht das Feature von wo — und daraus
ergibt sich dann die nächste TODO-Liste mit Reihenfolge."*

---

## Das Verfahren je Modul

Vier Schritte, in dieser Reihenfolge. **Kein Schritt wird übersprungen.**

**1. Bestandsaufnahme** — Was zeigt das Mockup? Tabs, Kacheln, Filter,
Popups. `[cmd]` `tools/vollstaendigkeit.mjs` zählt, die Zählregeln in
`theme-v1-umsetzung.md` sagen wie.

**2. Abgleich** — Was sagen `docs/specs/` und `referenz/lumeos-2026/`?
**Vor jeder Einstufung als „fehlt" wird dort nachgesehen.**

**3. Datenlage** — Welche Tabellen und Spalten braucht das Modul, was
existiert? **Fehlt etwas: erst Schema, dann Seeds, dann Anbindung.**

**4. Anbindung** — Das Mockup bekommt echte Daten.

> **Das Mockup ist die Vorgabe. Was es zeigt, bleibt. Was nicht aus den
> Daten kommt, wird gemeldet, nicht ersetzt.**

`[read]` **Und wenn eine Spalte fehlt oder etwas dazugehört: erst mit
Tom reden, dann bauen.** — Diese Regel ist am 2026-08-18 entstanden,
nachdem G-46 drei Listen gebaut hatte, wo eine hingehörte.

---

## Wo die Module stehen

| Modul | Mockup | Schema | Seeds | Angebunden |
|---|---|---|---|---|
| **Nutrition** | vollständig | 22 Tabellen, 7.140 Lebensmittel | 173 Mahlzeiten | Diary, Nutrients |
| **Medical** | vollständig | 5 Tabellen, 11.676 Marker, 560 Bereiche | 140 Werte, 5 Befunde | **Markerliste, Import** |
| **Supplements** | vollständig | 6 Tabellen, 44 Katalog | 4 Einnahmen | **4 Tabs** |
| **Goals** | vollständig | 6 Tabellen, 11 Funktionen | 43 Messungen | **5 von 10 Tabs** |
| **Recovery** | vollständig | **1 Tabelle** | 36 Check-ins | Muskelkarte, Check-ins |
| **Training** | vollständig | 7 Tabellen, 1.416 Übungen | 9 Sitzungen, 60 Sätze | *läuft (G-64)* |
| **Coach** | vollständig | **keins** | — | **nichts** |
| **Dashboard** | vollständig | liest aus allen | — | teilweise |

---

## Stufe 0 — Grundlagen

**Erledigt am 2026-08-18:**

`[cmd]` **C-83** — Übungskatalog angereichert, 1.407 Zeilen.
`[cmd]` **C-90** — 58 Geräte gruppiert, Disziplin auf allen 1.416.
`[cmd]` **C-84** — Biomarker aus der Spec, 560 Referenzbereiche.

**Offen:**

`[cmd]` **C-78 — Zusammenhängende Seeds.** `[read]` **Der wichtigste
verbleibende Grundlagenpunkt.** Solange Zufuhr und Gewicht getrennt
erzeugt werden, lässt sich **keine Formel prüfen** — GO-11 hat 1.279
kcal Abstand gemessen, GO-16 stolperte über 26 Messungen in der Zukunft
und 13 von 14 Zufuhrtagen. **Blockiert jede Bewertung und Buddy.**

`[cmd]` **C-89** — 26 Körpermessungen liegen in der Zukunft. Teilmenge
von C-78, aber sofort behebbar.

---

## Stufe 1 — Anbindung

**Nutrition** hat am 2026-08-18 eine eigene Kette bekommen:

**C-93** Ausschluss-Presets → **G-65** Preferences-Tab → **G-66**
Food-DB mit Filtern → **G-67** Daumen in Liste und Detail → **C-94**
Suche wendet die Vorlieben an.

`[read]` **G-67 ist der Punkt, der den Rest trägt:** Der Assistent
verlangt Vorarbeit, der Daumen verlangt nichts — **bei 7.140
Lebensmitteln ist das der einzige Weg, der skaliert.**

**Training:** G-64 läuft. Danach Sitzungen und Sätze.

**Goals:** fünf Tabs stehen. Offen: GO-17 (Meilenstein-Kachel), GO-18
(zwei Wahrheiten am selben Ziel), GO-19 (was die Daten hergeben und das
Mockup nicht zeigt).

**Recovery:** `[cmd]` **Eine Tabelle.** Alles ausser Check-ins und
Muskelkarte braucht Schema — Schlaf, HRV, Modalitäten, Protokolle,
Übertraining. `SPEC_06` nennt zehn Tabellen.

---

## Stufe 2 — Was Schema braucht

**Coach.** `[cmd]` Kein Schema, zwei vollständige Mockups. `[read]`
**Und eine Produktentscheidung davor:** C-71, die zwei Achsen Sicht und
Autonomie. `[cmd]` Die Vorlage sitzt im Vorgängerrepo in
`SettingsView.tsx` — **der Nutzer verwaltet je Coach, was der sehen
darf, von seiner Seite aus.**

**Recovery-Rest**, **C-75** (BSS und Voice, Neubau).

---

## Stufe 3 — Was auf allem aufsetzt

**Dashboard** — liest aus allen Modulen. `[read]` Solange die darunter
Attrappe sind, ist jede Kachel eine Behauptung.

**Buddy** — *„Buddy IST das Produkt"*. `[read]` Er findet
Zusammenhänge. **An Daten ohne Zusammenhang findet er keine, und
schlimmer: er findet falsche.** Setzt C-78 voraus.

---

## Was quer liegt

`[cmd]` **Die Suchqualität** (C-20 bis C-36, neun Punkte) liegt seit
Tagen. `[read]` **Bei den Übungen steht dieselbe Aufgabe erneut an** —
`bench` findet 78, `squat` 120, **aber `ohp` findet 0 und `rdl` findet
1.** Abkürzungen, nicht Wörter.

`[cmd]` **Fünf Entscheidungen liegen bei Tom:** G-59 (Modulkopf,
zurückgestellt) · G-61 (`refillUrgent` als Schwelle) · GO-15 (`alpha
0.3`) · GO-17 (Meilenstein-Kachel) · C-71 (Coach-Rechte).

---

## Warum diese Reihenfolge

`[read]` **Jedes Modul wird von unten nach oben fertig, statt dass acht
halb dastehen.** Bisher wurde nach Verfügbarkeit verteilt — das hat acht
Mockups gebracht und zwei Anbindungen; **an einem Tag mit Reihenfolge
wurden es sechs.**

`[cmd]` **Und die Grundlagen blockieren mehrere Module gleichzeitig.**
Drei sind gefallen, **C-78 steht noch** — und ohne ihn misst jede Formel
Zahlen, die zu etwas anderem gehören.
