---
nr: G-107
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-08-20
braucht: []
kind_von: G-101
kinder: []
entscheidung: null
agent: codex
beauftragt: 2026-08-28
erledigt: 2026-08-28
commit: daf4f7a1
beruehrt:
  tabellen: [nutrition.nutrient_reference_values]
  dateien: [supabase/_pipeline/07_lesefunktionen]
zahlen: null
---

# G-107 - Der Mikronaehrstoff-Trend braucht eine Referenz je Tag

## Befund

(neu 2026-08-20, aus G-101).

  `[cmd]` **Die Werte liegen je Tag vor** — `daily_summary` fuehrt 28
  Mikronaehrstoffe als Spalten. Ein Trend waere rechenbar.

  `[cmd]` **Was fehlt, ist die Referenz je Tag.**
  `daily_reference_assessment` rechnet **einen Tag auf einmal**; ein
  Trend ueber 30 Tage braeuchte 30 Aufrufe je Seitenaufruf.

  `[read]` **Zwei Wege:** eine Sammelfunktion in der Datenbank (die
  bessere), oder die Referenz einmal holen und ueber den Zeitraum
  konstant halten (die billigere — sie unterschlaegt aber, dass sich
  Profilwerte aendern koennen).

## Auftrag

### Vorweg

`[read]` **Die Zahlen misst du, mit Nutzer und Zeitraum** (`CLAUDE.md`).
`[cmd]` **Fuenf Konten haben Tagesdaten** — `dev`, drei Seed-Konten
mit je rund 180 Tagen, `test-user` mit einem.

`[cmd]` **Und `.limit()` hebt den PostgREST-Deckel nicht auf** —
1.000 Zeilen serverseitig, egal was angefragt wird. **Das hat G-249
fast einen Fehlbefund gekostet.**

### Der Anlass ist frisch

`[cmd]` **Der Nutrients-Reiter laedt bei 90 Tagen in 6,4 s kalt /
5,8 s warm.** `[read]` **Weil der Leseweg die Bewertung Tag fuer Tag
holt** — `daily_reference_assessment` rechnet einen Tag auf einmal.

`[read]` **Claude Code hat es selbst benannt:** *,,eine Reihenfunktion
in der Datenbank waere schneller, das ist Codex' Bereich."*

### Zu tun

**Eine Sammelfunktion, die einen Zeitraum auf einmal bewertet.**

`[read]` **Der Punkt nennt zwei Wege und bevorzugt diesen.** Der
billigere — die Referenz einmal holen und konstant halten —
**unterschlaegt, dass sich Profilwerte aendern koennen.** `[cmd]`
`daily_reference_assessment` liefert `profile_age_years`,
`profile_biological_sex`, `profile_is_pregnant`,
`profile_is_lactating` je Zeile. **Eine Schwangerschaft aendert die
Referenz mitten im Zeitraum.**

**Erst mitteln, dann bewerten** — das ist E-24 und gilt weiter.
`[read]` **Nicht: dreissig Tagesbewertungen mitteln.** Ein
Prozentwert-Durchschnitt ist etwas anderes als die Bewertung des
Durchschnitts, sobald sich die Referenz aendert.

### Was zu messen ist

    Laufzeit je Zeitfenster    heute / 7 / 14 / 30 / 45 / 60 / 90
                              vorher und nachher
    Ergebnisgleichheit        die Sammelfunktion muss fuer einen
                              Tag dasselbe liefern wie heute
    Profilwechsel im Zeitraum kommt er vor? wie oft?

`[read]` **Die zweite Zeile ist der eigentliche Nachweis.** Eine
schnellere Funktion, die andere Zahlen liefert, ist keine
Verbesserung — **und G-249 hat gerade gezeigt, wie leicht sich Zahlen
unbemerkt verschieben.**

### Was nicht zu tun ist

**Keine Referenzwerte aendern.**
**Die Einzeltagsfunktion nicht entfernen** — sie traegt den
Tagesmodus.
`apps/` nicht anfassen — Claude Code arbeitet dort an G-70.
Nicht committen, nicht stagen, nicht pushen.

### Regeln

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
**Wegwerf-Datenbank, nie gegen die laufende testen.**
**Vollsicherung vor jedem Live-Eingriff nach `backup/`.**

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Bericht

### Ergebnis

`[cmd]` 2026-08-29: `nutrition.reference_assessment_window(user_id,
end_date, days)` ist als neue `STABLE`, `SECURITY INVOKER`-Funktion
gebaut. Sie ruft die bestehende Tagesbewertung fuer jedes Kalenderdatum
im Zeitfenster auf, gibt die geordnete Tagesreihe je
Naehrstoff/Referenzart als `daily_assessments` zurueck, mittelt Menge
und aufgeloeste Referenz getrennt und berechnet erst danach die drei
Prozentwerte. Damit bleibt `daily_reference_assessment()` die alleinige
Quelle fuer Profil-, Goals- und Referenzauswahl und der Tagesmodus
unveraendert.

`[cmd]` Fuer `dev@lumeos.app`, Ende 2026-08-29, 90 Tage liefert die
Sammelfunktion 154 Ergebniszeilen mit je 90 Tagespunkten. Die 90
Einzelaufrufe liefern dagegen 13.860 Zeilen. Das Ergebnis bleibt damit
deutlich unter dem PostgREST-Zeilenlimit von 1.000; `.limit()` wird
nicht als Umgehung verwendet.

### Pruefung der Ausgangsvermutungen

| Ausgangsvermutung | Messung | Urteil |
|---|---:|---|
| Fuenf Konten haben Tagesdaten | 5: `dev@lumeos.app`, `max.seed@example.com`, `sarah.seed@example.com`, `tom.seed@example.com`, `test-user@lumeos.local` | stimmt |
| Drei Seed-Konten haben rund 180 Tage, test-user einen | 180 / 181 / 181 Tage; test-user 1 Tag | stimmt, mit genauer Abgrenzung |
| Nutrients 90 Tage: 6,4 s kalt / 5,8 s warm wegen 90 Tages-RPCs | im aktuellen Arbeitsbaum holt `naehrstoff-ordnung.ts` `nutrient_summary_window()` und nur die Stichtagsfunktion; die behauptete Schleife steht dort nicht | nicht bestaetigt; keine Browsermessung ohne `apps/`-Aenderung |
| Schwangerschaft oder Stillzeit kann die Referenz im Zeitraum wechseln | 0 von 165 Referenzzeilen sind schwangerschafts- oder stillspezifisch; bei allen 5 Datenkonten 0 Zustandswechsel im 90-Tage-Fenster | die Funktion erhaelt den Zeitbezug, der heutige Katalog kann aber keinen abweichenden Referenzwert liefern |

`[cmd]` Die Tagesdaten reichen fuer die vier 180/181-Tage-Konten von
2026-05-20 bis 2026-11-16; fuer `test-user@lumeos.local` nur am
2026-08-16. Alle Laufzeitangaben dieses Berichts beziehen sich auf
`dev@lumeos.app`, Ende 2026-08-29, im Klon `lumeos_g107`.

### E-24 und Profilzeit

`[cmd]` Die Bereichszeile zeigt den Mittelwert der Tagesmengen und
berechnet `reference_pct`, `reference_pct_min` und `reference_pct_max`
erst daraus. Sie mittelt keine Tagesprozentwerte. `actual_value_min`
und `actual_value_max` bleiben fuer die Detailspanne erhalten.

`[cmd]` Transaktionsprobe im Klon, anschliessend `ROLLBACK`: ein
Schwangerschaftsbeginn am 2026-08-26 ergab im 7-Tage-Fenster 4
`profile_pregnant_day_count` bei 7 protokollierten Tagen. Die Tagesprobe
lieferte am 2026-08-25 `false`, am 2026-08-26 `true`. Das boolesche
Bereichsfeld bleibt dabei `false`, weil es bewusst nur "an jedem Tag"
bedeutet; der Tageszaehler bewahrt die Teilzeitinformation.

### Gleichheit und Laufzeit

`[cmd]` Einzeltag-Gleichheit, `dev@lumeos.app` am 2026-08-29: Tages-
und Sammelfunktion lieferten jeweils 154 Zeilen, 0 abweichende Zeilen.
Verglichen wurden Menge, Vollstaendigkeit, Referenzart/-werte/-basis,
alle drei Prozentwerte, Status, Profilfelder, Quelle, Locator und
Notiz; der einzige `daily_assessments`-Punkt wurde gegen dieselbe
Tageszeile verglichen.

`[cmd]` Laufzeit im Klon, zweiter Lauf (ms). "Vorher" misst die gleiche
fachliche Arbeit als je einen Datenbankaufruf pro Kalendertag;
"nachher" einen Aufruf der Sammelfunktion. Die Datenbankarbeit wird
nicht kuenstlich reduziert, deshalb ist sie aehnlich. Der Produktgewinn
ist ein RPC und 154 statt bis zu 13.860 Ergebniszeilen.

| Tage | vorher ms | nachher ms | Ergebniszeilen vorher/nachher |
|---:|---:|---:|---:|
| 1 | 21,925 | 23,066 | 154 / 154 |
| 7 | 136,349 | 136,728 | 1.078 / 154 |
| 14 | 276,321 | 254,749 | 2.156 / 154 |
| 30 | 569,298 | 549,218 | 4.620 / 154 |
| 45 | 943,382 | 875,500 | 6.930 / 154 |
| 60 | 1.097,570 | 1.264,463 | 9.240 / 154 |
| 90 | 1.616,058 | 1.863,539 | 13.860 / 154 |

### Struktur und Nachweis

`[cmd]` Neu: Migration
`20260829031601_g107_reference_assessment_window.sql`, Kettenschritt
`059c`, Schema-Sollstand und README. Die Migration aendert nur Struktur;
die Kette fuellt keine neue Tabelle.

`[cmd]` Frischer Kettenlauf: 132 Schritte, Exit 0. Danach
`schema-vollstaendigkeit-pruefen.ts`: 35/35 Funktionen und 37/37 Grants
vorhanden; die Migration liess sich im selben Klon erneut anwenden.
`migration-datenlogik-pruefen.mjs` ist gruen.

`[cmd]` RLS-Probe im Klon als `authenticated` mit dem JWT-Sub von
`dev@lumeos.app`: 154 Zeilen fuer den eigenen Tag. Kein
`SECURITY DEFINER`, kein Live-Schreibzugriff und keine Aenderung unter
`apps/`.

`[cmd]` `kette-readme-pruefen.ts` meldet weiterhin 41 vorbestehende
README/Kette-Abweichungen; Schritt 059c ist keine davon. `git diff
--check` ist gruen.

## Abnahme

**2026-08-28, Orchestrator. Nachgemessen, was der Bericht behauptet.**

`[cmd]` **`nutrition.reference_assessment_window()` existiert live.**
`[cmd]` **Einzeltag-Gleichheit: 154 = 154 Zeilen, 0 Abweichungen** —
der Nachweis, um den es ging.

### Meine Diagnose war falsch

`[cmd]` **Der App-Lesepfad enthaelt keine 90-Tage-RPC-Schleife.**
`[read]` **Ich habe die 6,4 Sekunden einer Ursache zugeschrieben, die
ich nie gesucht habe** — und sie als Anlass in den Auftrag
geschrieben.

`[cmd]` **Und meine Sorge um Profilwechsel war gegenstandslos:
0 von 165 Referenzzeilen sind schwangerschafts- oder
stillspezifisch.**

`[read]` **Die Funktion ist trotzdem richtig gebaut** — sie mittelt
Menge und tagesaktuelle Referenz getrennt und bewertet erst danach,
gemaess E-24. **Sie kann es, sobald es Daten gibt.**

`[read]` **Und der Befund *,,es gibt keine Schleife"* ist mehr wert
als die Funktion:** die Ladezeit hat eine andere Ursache, und die
ist jetzt offen statt falsch beantwortet. **Als G-252 angelegt.**

**Abgenommen.**

