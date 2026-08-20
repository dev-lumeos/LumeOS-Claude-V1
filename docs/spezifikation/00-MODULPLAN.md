# Modulplan — Reihenfolge und Vorgehen

`[cmd]` **Stand:** 2026-08-19, 89 offen, 200 erledigt, 68
Kettenschritte, 92 Commits vor `origin/dev`.

**Tom, 2026-08-18:** *„Zuerst Grundlagen und danach jedes Modul
strukturiert bewerten: was braucht das Feature von wo — und daraus
ergibt sich dann die nächste TODO-Liste mit Reihenfolge."*

---

## Das Verfahren je Modul

Vier Schritte. **Kein Schritt wird übersprungen.**

**1. Bestandsaufnahme** — Was zeigt das Mockup? Tabs, Kacheln, Filter,
Popups.

**2. Abgleich** — Was sagen `docs/specs/` und `referenz/lumeos-2026/`?
`[cmd]` **Und: prüfend lesen.** Die Spec-Fehlerliste (A-20) zählt
inzwischen **sieben Funde** — Marker verwechselt, Formeln falsch, Skalen
invertiert, Zahlen erfunden.

**3. Datenlage** — Welche Tabellen und Spalten, was existiert?

**4. Anbindung** — Das Mockup bekommt echte Daten.

> **Das Mockup ist die Vorgabe. Was es zeigt, bleibt. Was nicht aus den
> Daten kommt, wird gemeldet, nicht ersetzt.**

`[read]` **Und wenn eine Spalte fehlt oder etwas dazugehört: erst mit
Tom reden, dann bauen.**

---

## Wo die Module stehen

| Modul | Schema | Bestand | Angebunden |
|---|---|---|---|
| **Nutrition** | 22 Tabellen | 7.140 Lebensmittel, **30.797 Tags**, 11 Presets | **Diary, Nutrients, Food DB, Preferences, Suche mit Vorlieben** |
| **Medical** | 5 Tabellen | 11.676 Marker, **560 Bereiche** | Markerliste, Import |
| **Training** | 7 Tabellen | 1.416 Übungen, 58 Geräte, 95 Muskelgruppen | **Exercises + 5 Sitzungs-Tabs** |
| **Goals** | 6 Tabellen, 11 Funktionen | 180 Messungen | **5 von 10 Tabs** |
| **Supplements** | 6 Tabellen | 44 Katalog | 4 Tabs |
| **Recovery** | **1 Tabelle** | 340 Check-ins | Muskelkarte, Check-ins |
| **Coach** | **keins** | — | **nichts** |
| **Marketplace** | **keins** | — | **nichts** |

---

## Stufe 0 — Grundlagen: erledigt

`[cmd]` **C-83** Übungskatalog · **C-84** Biomarker aus der Spec ·
**C-90** Gerätegruppen und Disziplin · **C-78 + C-97 + C-101 + C-103**
zusammenhängende Seeds über ±90 Tage mit Varianz · **C-99**
Kategorienbrücke.

`[read]` **Die Seeds sind der wichtigste Gewinn:** `adaptive_tdee`
rechnet `complete`, die Rückrechnung geht auf, und der Tageswechsel im
Diary zeigt etwas.

---

## Vier Entwürfe liegen vor

`[cmd]` Sie ersetzen das Entdecken beim Bauen:

| | |
|---|---|
| **Recovery** | 567 Zeilen — fünf neue Strukturen, **drei Formelfehler**, neun Entscheidungen |
| **Supplements** | 344 Zeilen — Katalog, Wechselwirkungen, Injektionen |
| **Buddy/Coach/Market** | 680 Zeilen — Rechtemodell, 16 Buddy-Tabellen, **acht Rechtsfragen** |
| **Coach-Recherche** | 477 Zeilen — Vorgängerrepo und Markt |
| **Substanzkatalog** | 320 Substanzen als Kandidat |

---

## Was jetzt gebaut werden kann

**Kleine Punkte, alle entschieden:**

`[cmd]` **GO-18** `progress_pct` per Trigger · **G-61** drei
Nachfüllstufen · **GO-15** Alpha auf 1,0 · **G-62** Rückfallfassungen
markieren · **C-62** Warnhinweis bei Allergenen · **G-59** Kopfzeile.

**Größere Blöcke:**

**C-71 + C-95** — **Permissions und Autonomy sind zwei verschiedene
Sachen.** Der Nutzer setzt, was der Coach sehen und ohne Bestätigung
ändern darf. Der Coach setzt den Level seines Athleten (fünf Stufen).
`[read]` **Blockiert Coach und Buddy.**

**C-113 + C-118** — Enhanced Mode: planen, protokollieren, warnen.
**Keine Empfehlung.** Dazu der Erfahrungsgrad (Beginner, Advanced, Pro,
Elite) in `profiles`.

**Recovery** nach dem Entwurf: Score → Modalitäten → Muskelkarte → HRV →
Protokolle → Übertraining.

**G-70** — sortierbare Spalten, Herkunfts-Filter, **Blätterfunktion**
(heute zeigt der Food-DB-Tab 50 von 279).

---

## Was wartet

`[cmd]` **C-116** — der Substanzkatalog, bis Kimi3 die vollständige
Supplement- und Medikamentenliste liefert.

`[cmd]` **G-72** — acht Spalten ohne Kachel, bis Meal plans kommt.

`[cmd]` **Marketplace** — *„braucht vorher den Anwalt."*

`[read]` **Und die Suchqualität** (C-20 bis C-36) liegt weiter. **C-117
zeigt, warum sie nicht erledigt ist:** `milch` findet Joghurt, weil die
Formel Nährstoffdichte belohnt. **Der Pulverabzug hat den ersten Fehler
behoben, nicht den zweiten.**

---

## Warum diese Reihenfolge

`[read]` **Jedes Modul wird von unten nach oben fertig, statt dass acht
halb dastehen.** In zwei Tagen mit Reihenfolge: **Nutrition fast
komplett, Training angebunden, Goals zur Hälfte, vier Entwürfe für den
Rest.**

`[cmd]` **Und die Grundlagen sind gefallen** — was jetzt gebaut wird,
steht auf gemessenen Daten statt auf Annahmen.
