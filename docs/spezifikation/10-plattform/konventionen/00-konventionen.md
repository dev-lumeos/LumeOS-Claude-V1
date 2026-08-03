---
status:     entwurf
version:    0.1
stand:      2026-08-02
ankerhash:  b0441a9
quellen:    docs/ssot/ (Ist-Zustand); Erfahrungen 2026-08-01/02
abhaengig:  keine
---

# Plattform: Konventionen

Regeln, die überall gelten und deshalb nirgends wiederholt werden.

## 1. Sprache

Dokumentation auf Deutsch. Code, Bezeichner, Datenbankobjekte, Commit-Meldungen
auf Englisch. Nutzeroberfläche mehrsprachig — Deutsch, Englisch, Thai; das
Datenmodell führt Sprachvarianten als Spalten (`name_de`, `name_en`, `name_th`).

## 2. Dateien und Kodierung

UTF-8 ohne BOM. Ausnahme: PowerShell-Skripte mit Zeichen ausserhalb ASCII
brauchen ein BOM, sonst liest PowerShell 5.1 sie als ANSI und das
String-Quoting zerbricht.

Keine Emoji in ausführbaren Dateien. `[cmd]` Ein Hook im Repo hat monatelang
nicht geparst, weil zwei Emoji ausserhalb der BMP darin standen.

**Bei Verdacht auf beschädigte Zeichen entscheidet der Hex-Dump, nie die
Konsolenausgabe.** `[cmd]` Zweimal wurde korrektes UTF-8 fälschlich als
Schaden gemeldet, weil die Konsole in falscher Codepage lief.

## 3. Markdown

Vollständig schreiben, nie zeilenweise ändern — Teil-Edits zerstören Tabellen.

**Vor dem Schreiben die Datei einlesen.** `[cmd]` Eine aus dem Gedächtnis
rekonstruierte Datei fiel auf einen älteren Stand zurück und verlor vier
Abschnitte; gefunden wurde es nur durch Zählen der Einträge.

## 4. Herkunftsmarker

In `docs/ssot/` trägt jede Tatsachenbehauptung `[cmd]`, `[read]` oder
`[annahme]`. In `docs/spezifikation/` gilt das für Aussagen über den
Ist-Zustand; das Soll braucht keinen Marker.

Zusammenfassungen von Teilagenten sind kein Beleg. Was nicht selbst
ausgeführt oder gelesen wurde, ist `[annahme]`.

## 5. Benennung in der Datenbank

Kleinschreibung mit Unterstrich. Tabellen im Plural (`foods`,
`food_nutrients`), Spalten im Singular. Zeitstempel `created_at`,
`updated_at` mit Zeitzone. Schlüssel `id` als UUID.

Ein Schema je Fachbereich. Objekte immer qualifiziert ansprechen —
`nutrition.foods`, nie `foods`.

`[cmd]` Nährstoffcodes folgen dem BLS-Katalog in Grossschreibung
(`PROT625`, `ENERCC`) und sind keine Ausnahme von der Regel, sondern
Fremdschlüssel in eine externe Systematik.

## 6. Fehler und Status

Fehler tragen einen stabilen Code, eine Meldung für Menschen und optional
Details. Der Code ist Vertrag und ändert sich nicht; die Meldung darf sich
ändern und ist übersetzbar.

Keine internen Ausnahmetexte nach aussen. Keine Personendaten in
Protokollen — weder Namen noch E-Mail-Adressen noch Rohdatenzeilen.

## 7. Zeit, Zahlen, Einheiten

Zeitstempel in UTC speichern, in der Zeitzone der Nutzerin anzeigen. Datum
ohne Zeit nur, wo die Zeit fachlich keine Rolle spielt — ein Tagebucheintrag
gehört zu einem Kalendertag, nicht zu einem Zeitpunkt.

Nährwerte je 100 g, wie im BLS. Umrechnung auf Portionen geschieht bei der
Anzeige, nicht bei der Speicherung. Einheiten sind Anzeigeeinstellung, nie
Speicherformat.

## 8. Ports

Feste Bereiche, damit sieben Apps und neun Services nebeneinander laufen.

| Bereich | Vergabe |
|---|---|
| 3200–3290 | Apps, Zehnerabstand je App |
| 5100–5900 | Services, Hunderterabstand je Modul |
| 54321–54327 | Supabase lokal, von der CLI vergeben |

| App | Port |
|---|---|
| `web` | 3200 |
| `admin` | 3210 |
| `buddy` | 3220 |
| `coach` | 3230 |
| `marketplace` | 3240 |
| `gym` | 3250 |
| `supplier` | 3260 |

Der Zehnerabstand lässt Raum für Nebenprozesse je App (Storybook, Mock-Server).

**Warum nicht 3000 und nicht 3100:** `[cmd]` 3100 und 3180 sind von einer
Docker/WSL-Portweiterleitung belegt, 3000 von einer fremden Anwendung.

**Warum nicht der Standardport:** `[cmd]` Der Next.js-Standardport ist auf Toms Rechner von
einer fremden Anwendung belegt. Ein Standardport ist keine Vergabe — jede App
trägt ihren Port ausdrücklich in `package.json` (`next dev -p`).

`[read]` Die Service-Ports stammen aus den Altbestand-Specs: Nutrition 5100,
Training 5200, Supplements 5300, Recovery 5400, Buddy 5500, HumanCoach 5600,
Marketplace 5700, Medical 5800, Goals 5900. Sie gelten nur, falls die
Servicelayer-Entscheidung (TODO A-07) für Services ausfällt.

`[cmd]` Der Altbestand nennt für Admin den Port 4100 — fällt aus jedem Schema
und wird durch 3210 ersetzt.

---

## 9. Git

Ein logischer Change je Commit. Meldungen englisch, im Format
`typ(bereich): was` — `feat`, `fix`, `docs`, `chore`, `refactor`.

Nie ohne ausdrückliche Anweisung pushen. Commit-Hashes dienen als Anker
zwischen Sitzungen und gehören in Sitzungsberichte.

**Kein untracked Verzeichnis wird dem Namen nach gelöscht.** `[cmd]` Ein als
Müll geführter Ordner enthielt die einzige Quelle von 705.232 Datenzeilen.
Vor jeder Löschung inhaltliche Prüfung.

## 10. Arbeitsteilung zwischen Agenten

Eine Datei hat zu einem Zeitpunkt einen Zuständigen. Wer eine Aufgabe
delegiert, gibt die Datei ab — und liest sie neu ein, bevor er sie wieder
anfasst.

Paralleles Schreiben braucht getrennte Arbeitsbäume oder getrennte Pfade.
Die Berechtigungsschicht von Claude Code prüft einzelne Aufrufe, nicht
Gleichzeitigkeit.

Berichte über getane Arbeit werden geprüft, nicht geglaubt. Die Prüfung ist
ein Zähllauf über nachweisbare Merkmale — Anzahl Einträge, Zeilenzahlen,
Hashes — nicht das Lesen der Zusammenfassung.

## 11. Änderungen an der Datenbank

Nie gegen die laufende Datenbank testen. Jeder Versuch in einer
Wegwerf-Datenbank, danach verwerfen.

Vor jeder strukturellen Änderung eine Sicherung. Eine Sicherung, die nie
zurückgespielt wurde, ist eine Datei und kein Backup.

`[cmd]` `pg_restore` meldet fehlende Policies nur als Warnung und gilt
trotzdem als erfolgreich — der Vergleich nach dem Zurückspielen ist Pflicht.

## 12. Abnahmekriterien

- **AK-1:** Gegeben eine beliebige Datei im Repo, dann ist sie UTF-8 ohne
  BOM, ausser sie ist ein PowerShell-Skript mit Zeichen ausserhalb ASCII.
- **AK-2:** Gegeben eine Aussage über den Ist-Zustand in `docs/ssot/`, dann
  trägt sie einen Herkunftsmarker.
- **AK-3:** Gegeben ein Fehler verlässt das System, dann enthält er keine
  Personendaten und keinen internen Ausnahmetext.
- **AK-4:** Gegeben ein Zeitstempel in der Datenbank, dann ist er in UTC und
  trägt eine Zeitzone.

## 13. Offene Fragen

1. **Fehlercodes** — gemeinsamer Katalog über alle Module oder Präfix je
   Modul? Ein Katalog erzwingt Abstimmung, Präfixe erlauben Wildwuchs.
2. **Übersetzungen** — Spalten je Sprache skalieren nicht über drei Sprachen
   hinaus. Ab wann eine eigene Übersetzungstabelle?
3. **Protokollierung** — Format, Ablageort, Aufbewahrungsdauer. Offen, bis
   `10-plattform/ci-cd` steht.
