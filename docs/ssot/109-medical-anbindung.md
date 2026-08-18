# Medical an den Katalog angeschlossen (G-46)

**Stand:** 2026-08-18 · **Auftrag:** G-46 · **Zweig:** `dev`

Herkunftsmarker nach `docs/spezifikation/10-plattform/konventionen/`:
`[cmd]` gemessen · `[read]` gelesen · `[annahme]` angenommen.

---

## Kurzfassung

`[cmd]` **Zwei Kacheln haben ihre Attrappenmarke verloren**, 21 behalten
sie. Angebunden sind die Befundtabelle und die Katalogsuche — beide im
Tab „Biomarkers", beide mit echten Daten aus `medical.*`.

`[cmd]` **Die Suche antwortet in 353–382 ms** vom Tastendruck bis zu
stehenden Zeilen, einschliesslich 220 ms Entprellung — also rund
130–160 ms Arbeit für 11.676 Katalogzeilen.

**Ein Befund, der über diesen Auftrag hinausgeht:** `[cmd]`
`tom.seed@example.com` hat **kein Passwort** (`encrypted_password IS
NULL`). Alle Testdaten hängen an einem Konto, an dem sich niemand
anmelden kann. Abschnitt 4.

| | |
|---|---|
| Marken vorher / nachher `[cmd]` | 21 / 21 — **plus 2 neue Kacheln ohne Marke** |
| Befundwerte im Browser `[cmd]` | 6 aus 2 Berichten |
| Katalog `[cmd]` | 11.676 Marker, 25 je Seite |
| Konsolenfehler `[cmd]` | 1 (der geteilte Grundwert) |
| `pnpm gate` `[cmd]` | 8 von 8 grün |

---

## 1. Welche Kacheln echt wurden

`[cmd]` **Zwei.** Sie stehen in eigenen Dateien, damit die Trennung an
der Datei ablesbar ist und nicht nur am Kommentar:

| Kachel | Datei | Quelle |
|---|---|---|
| **Befundwerte** | `befund-tabelle.tsx` | `medical.lab_result_values_read()` + `lab_result_values` |
| **Biomarker-Katalog** | `katalog-suche.tsx` | `medical.biomarker_catalog` |

`[cmd]` Beide tragen **kein `attrappe`** mehr; ein Test hält das fest
(*„die angebundenen Medical-Kacheln tragen keine Marke mehr"*). Er ist
das Gegenstück zur Zählung: die zählt, was bleibt, er hält fest, was
geht.

### Die Zahl

`[cmd]` Vor G-46: 21 Marken (5 Rahmen · 8 Biomarker-Tab · 8 Tracking).
Nach G-46: **dieselben 21** — die zwei neuen Kacheln kamen als eigene
Karten dazu und waren nie markiert. **Keine bestehende Kachel hat ihre
Marke verloren**, weil keine bestehende Kachel angebunden wurde: die
Entwurfstabelle zeigt Zeitreihe, Sparkline und Bereichsbalken, und
dafür gibt es keine Daten (Abschnitt 3).

`[cmd]` Eine Nachbesserung an der Zählregel war nötig: sie suchte nur
`attrappe={ATTRAPPE}`. Die Entwurfstabelle trägt seit G-46 einen
eigenen Begründungssatz (`{ENTWURFSKATALOG}`), weil ihr Grund ein
anderer ist — „Schema da, Spalten leer" statt „kein Schema". Die alte
Regel zählte sie nicht mit und meldete 7 statt 8. Jetzt zählt sie jede
Marke der Form `attrappe={GROSSNAME}`; **an keinem anderen Modul
verschiebt sich dadurch etwas** (gegengeprüft).

### Was die Anzeige sagt — und was nicht

`[read]` Der Auftrag: *„Ob ein Wert gut ist, ist eine medizinische
Aussage. Die Anzeige sagt, wo er liegt — im Bereich, darüber, darunter
— nicht, was er bedeutet und schon gar nicht, was jemand tun soll."*

`[cmd]` Die Lagespalte kennt vier Wörter: **Im Bereich · Über dem
Bereich · Unter dem Bereich · Ohne Bereich.** Die Attrappe führte
`Optimal`, `Critical low` und `Critical high` (`daten.ts:33-40`) — das
sind Urteile, und sie kommen in den angebundenen Dateien nicht vor. Ein
Test prüft das als Wortgrenze.

`[cmd]` Auch die Farbe folgt der Lage, nicht einer Bewertung: innerhalb
`--pos`, ausserhalb `--warn`, ohne Bereich gedämpft. **Kein Rot** — Rot
hiesse „gefährlich", und das ist eine ärztliche Aussage.

`[annahme]` Dieselbe Grenze wie bei C-49 (Nutrition-Score) und GO-14
(Körperfett).

---

## 2. Wie Labor- und Katalogbereich zusammenspielen

### Die Vorrangregel steht in SQL, nicht in der Anzeige

`[cmd]` `medical.lab_result_values_read`
(`140_medical_schema.sql:201-283`) löst den Vorrang bereits:

```sql
COALESCE(v.lab_reference_low,  rr.min_value) AS reference_low,
COALESCE(v.lab_reference_high, rr.max_value) AS reference_high,
CASE
  WHEN v.lab_reference_low IS NOT NULL
    OR v.lab_reference_high IS NOT NULL
    OR v.lab_reference_text IS NOT NULL   THEN 'lab_report'
  WHEN rr.id IS NOT NULL                  THEN 'catalog_fallback'
  ELSE 'none'
END AS reference_source
```

**Der Lesepfad baut das nicht nach, er benutzt es.** Ein Test prüft,
dass in `lesen.ts` kein `COALESCE` steht — zwei Wahrheiten könnten
auseinanderlaufen, und die falsche wäre die sichtbare.

`[read]` Der Auftrag: *„Der Befundbereich gewinnt … und dass er ein
Rückfall ist, muss sichtbar sein."* Die Spalte **Herkunft** zeigt es:
`Befund` als Akzentpille, `Katalog` als schlichte Pille, `—` wenn es
keinen gibt.

### Der belegte Fall

`[cmd]` Angemeldet im Browser, gegen echte Zeilen:

| Marker | Wert | Bereich | Herkunft | Optimalband | Lage |
|---|---|---|---|---|---|
| Glucose `2345-7` | 102 mg/dL | **70–99** | **Befund** | **70–85** | Über dem Bereich |
| Hemoglobin `718-7` | 15.4 g/dL | 13.5–17.5 | Befund | 14.5–16.5 | Im Bereich |
| Calcium `17861-6` | 9.4 mg/dL | 8.5–10.5 | **Katalog** | 9–10 | Im Bereich |
| Unbekannter Marker X | 42 U/L | — | — | — | Ohne Bereich |

**Glukose ist der Doppelbereich:** Laborgrenze 70–99 aus dem Befund,
Optimalband 70–85 aus dem Katalog. Der Wert liegt über beiden — die
Anzeige nennt die Lage im Laborbereich und ergänzt das Optimalband nur,
**wenn beide auseinanderfallen.** Sonst stünde dieselbe Aussage zweimal.

**Calcium ist der Rückfall:** der Befund liefert keinen Bereich, der
Katalog `8.5–10.5 mg/dL`, und die Herkunftsspalte sagt `Katalog`.

### Der Bereichsbestand ist dünner, als die Zeilenzahl vermuten lässt

`[cmd]` **Das ist der wichtigste Messbefund dieses Auftrags.**
`medical.biomarker_reference_ranges` hat 464 Zeilen — aber:

| | Zeilen | mit Zahl | mit Text |
|---|---|---|---|
| `needs_tom_decision` | 410 | **0** | 410 |
| `do_not_import_without_source` | 54 | **54** | 0 |

`[cmd]` Die 54 Zeilen **mit** Zahlen sind genau die, die
`lab_result_values_read` ausschliesst
(`decision_status <> 'do_not_import_without_source'`, Zeile 267). Was
durchkommt, sind 410 Zeilen **ohne** Zahlen.

`[cmd]` **Kein einziger LOINC-Code hat heute Labor- und Optimalbereich
als Zahl.** Der Katalogrückfall liefert deshalb Text: `8.5–10.5 mg/dL`,
`<5.7%`, `70–85 mg/dL`.

**Was die Anzeige daraus macht:** `bereichAusText()` zerlegt die drei
Schreibweisen des Bestands (Spanne mit Halbgeviertstrich, `<x`, `>x`)
in Zahlen, damit die Lage überhaupt bestimmbar ist. `[annahme]` Was
sich nicht eindeutig zerlegen lässt, bleibt Text und wird als Text
gezeigt — **eine falsch geratene Grenze sähe aus wie eine gemessene.**

`[cmd]` Eine offene Grenze ist kein Ausschluss: `<5.7 %` sagt über die
Unterseite nichts, also gilt dort `im_bereich`, solange die Obergrenze
hält.

### Die drei Zustände — die Datenbank sagt es selbst

`[cmd]` **Nicht geraten:** `142_laborimport_matching.sql` hat der
Tabelle `match_status` und `match_candidates` gegeben, und eine
Prüfbedingung hält sie mit `loinc_code` zusammen:

```
match_status IN ('exact','manual_verified') AND loinc_code IS NOT NULL
OR match_status IN ('ambiguous','unknown')  AND loinc_code IS NULL
                                            AND needs_verification
```

| Zustand | belegt an | Anzeige |
|---|---|---|
| **Zugeordnet** | Hemoglobin, `exact`, `718-7` | Name + LOINC |
| **Mehrdeutig** | Glucose, `ambiguous`, 3 Kandidaten | Rohtext + Konfidenz + **die drei Kandidaten mit Konfidenz** (`2345-7 · 0.68`, `2339-0 · 0.68`, `5792-7 · 0.58`) |
| **Unbekannt** | Unbekannter Marker X, `unknown` | Rohtext + „im Katalog nicht gefunden" |

`[read]` Tom: *„Wenn Daten importiert werden und wir die nicht in der DB
haben, kommt nichts."* — **Der Marker steht da.** Ein Test prüft, dass
`zuordnung()` nie `null` liefert und die Anzeige nicht nach
`loinc_code` filtert; die Fusszeile sagt zusätzlich *„2 von 6 Werten
sind keinem Katalogeintrag zugeordnet … weggelassen wird keiner."*

`[cmd]` Bei Mehrdeutigkeit werden die Kandidaten **genannt, nicht
gewählt.** Welcher gilt, entscheidet ein Mensch.

### Die Suche sucht, sie lädt nicht

`[read]` Der Auftrag: *„Der Katalog ist die grösste Tabelle im Repo nach
`food_nutrients` — die Anzeige muss suchen, nicht laden."*

`[cmd]` Gemessen gegen die laufende Instanz:

| | SQL | Rundlauf im Browser |
|---|---|---|
| leere Suche (25 häufigste) | **0,05 ms** | — |
| „glucose" | 1,9 ms | **382 ms** |
| „eisen" (selten, Seq Scan) | 23,2 ms | **369 ms** |
| „vitamin d" | — | 360 ms |
| „ferritin" | — | 362 ms |
| „hemoglobin" | — | 353 ms |

`[cmd]` Der Rundlauf enthält 220 ms Entprellung — es bleiben rund
130–160 ms für Serveraktion, PostgREST, Postgres und Anzeige. Die
leere Suche läuft über `biomarker_catalog_rank_idx`.

`[cmd]` MUSTER ÜBERNOMMEN, NICHT ZWEITE LÖSUNG GEBAUT: `/v2/nutrition`
liest über `nutritionRpc()` — Session-Client auf ein Schema gerichtet,
serverseitig. Hier dasselbe mit `medical`. **Ein Unterschied:** Nutrition
hat eine Suchfunktion im Schema, `medical` nicht (nur
`biomarker_marker_candidates`, `import_lab_report_rows`,
`lab_result_values_read`) — und dieser Auftrag darf keine anlegen. Die
Suche läuft deshalb über PostgREST auf der Tabelle, mit demselben
Grundsatz: begrenzt, serverseitig, sortiert.

---

## 3. Was noch Attrappe bleibt und warum

`[cmd]` **21 Marken**, in drei Gruppen:

### Die Entwurfstabelle (1 Marke, im selben Tab)

Sie steht unter den echten Werten, hinter der Zwischenüberschrift
„Aus dem Entwurf · noch ohne Datenquelle".

**Warum sie bleibt:** sie zeigt **Zeitreihe, Sparkline und
Bereichsbalken** über 48 Marker. `[cmd]` `lab_result_values` führt sechs
Testwerte und **keine Zeitreihe** — die Spalten hätten nichts zu zeigen.
Sie zu löschen hiesse, eine gebaute Ansicht wegzuwerfen, bevor die
Daten da sind; sie unmarkiert zu lassen hiesse, erfundene Zahlen als
echte auszugeben.

### Der Rest des Moduls (20 Marken)

| Tab | Marken | Warum |
|---|---|---|
| Dashboard | 5 | Health Score, Systemwerte, Alarme — gerechnet aus den 48 Entwurfsmarkern. `[cmd]` Ein Score über sechs Testwerte wäre eine Zahl, die genauer aussieht als sie ist |
| Import | 7 | OCR-Auszug, Pipeline, Schwellen, Verlauf, Einheitenumrechnung. `[cmd]` `import_lab_report_rows` existiert, aber der Auftrag bindet **Liste und Befund** an, nicht den Import |
| Tracking | 8 | Symptome und Medikamente. `[cmd]` Dafür gibt es **keine Tabellen** — `medical` führt Katalog, Bereiche, Aliase, Berichte, Werte. Mehr nicht |

### Was das Schema hergäbe und dieser Auftrag nicht angefasst hat

`[cmd]` `medical.biomarker_aliases` (292 Zeilen, `alias_folded` mit
Index) ist ungenutzt. Die Katalogsuche sucht über vier Namensspalten;
über Aliase würde sie „Hb" und „Leukozyten" finden. **Nicht gebaut** —
der Auftrag nennt Liste und Befund, und `alias_folded LIKE 'hb%'`
misst 0,06 ms, wäre also billig nachzurüsten.

---

## 4. Was im Vorgängerrepo und im Bestand danebenliegt

### Der Befund, der über den Auftrag hinausgeht

`[cmd]` **`tom.seed@example.com` hat kein Passwort.**
`auth.users.encrypted_password IS NULL` — das Konto ist ein Seed-Konto,
kein Anmeldekonto. Die RLS-Regel auf `lab_result_values` lautet
`auth.uid() = user_id`; ohne Anmeldung kommt keine Zeile an.

**Das betrifft nicht nur Medical.** `[read]` Tom, 2026-08-18: *„Alle
Testdaten hängen an einem Konto, an dem sich niemand anmelden kann —
das betrifft nicht nur Medical, sondern auch die 43 Körpermessungen und
den Gewichtsverlauf."*

`[cmd]` Für Nutrition und Goals gibt es dafür bereits
`supabase/_pipeline/_testdaten/eigenes-konto-fuellen.sql` — es kopiert
tom.seeds Tage auf ein echtes Anmeldekonto. **Medical ist darin nicht
enthalten** (kein `medical` in der Datei).

`[annahme]` Der saubere Weg wäre, `eigenes-konto-fuellen.sql` um die
Medical-Tabellen zu erweitern. Das ist ein eigener Auftrag: die Datei
gehört zur Testdatenkette, und dieser Auftrag durfte weder Schema noch
Kette anfassen.

### Wie der Nachweis trotzdem geführt wurde

`[read]` Freigabe von Tom, 2026-08-18, Variante 1: kopieren, prüfen,
wegräumen — mit drei Auflagen.

`[cmd]` **Beide Skripte liegen im Repo**, nicht als Einzeiler:
`supabase/_pipeline/_testdaten/medical-nachweis-an.sql` und
`-aus.sql`. Wiederholbar, mit Zielkonto als Parameter.

`[cmd]` **Die Gegenprüfung zählt Zeilen, nicht Abwesenheit:**

```
1. Zielkonto test-user      — Soll 0 und 0 → 0 und 0
2. Quellkonto tom.seed      — Soll 2 und 6 → 2 und 6
3. Tabellen insgesamt       — Soll 2 und 6 → 2 und 6
```

Erst weil 2 und 3 übereinstimmen, ist belegt, dass nur die Kopien
verschwunden sind. **Eine Zählung auf null beim Zielkonto allein hätte
auch bedeuten können, dass zu viel gelöscht wurde.**

`[cmd]` **Der JWT-Fehler trat nicht auf.** Gemessen wurden auf jeder
Seite genau **1 Konsolenfehler** — `Extra attributes from the server:
data-mode` aus `RootLayout`, derselbe Grundwert wie auf `/v2/dashboard`.

### Ein Stolperstein beim Kopieren, der etwas über das Schema sagt

`[cmd]` Der erste Lauf scheiterte an
`lab_result_values_match_integrity_check`. Grund: `match_status`,
`match_candidates`, `match_source` und `raw_marker_name` stammen aus
`142_laborimport_matching.sql`, **nicht aus dem Grundschema** —
`140_medical_schema.sql` kennt sie nicht. Wer nur die Grundschemadatei
liest, übersieht vier Spalten, und der Vorgabewert `exact` bei leerem
`loinc_code` verletzt die Bedingung.

**Der Fehler war nützlich:** er hat gezeigt, dass `match_status` die
belastbare Auskunft über die drei Zustände ist. Die Anzeige liest jetzt
ihn statt `entry_confidence` zu deuten.

---

## 5. Was gebaut wurde

```
apps/web/src/lib/medical/
├── befund.ts              Lagerechnung, Bereichsvorrang, Zuordnung
│                          (rein, ohne Datenbank — deshalb prüfbar)
└── lesen.ts               Serverseitiger Lesepfad, Katalogsuche

apps/web/src/app/v2/medical/
├── page.tsx               lädt serverseitig, reicht durch  (geändert)
├── ansicht.tsx            nimmt `echt` entgegen            (geändert)
├── tab-biomarker.tsx      echt oben, Entwurf unten         (geändert)
├── befund-tabelle.tsx     ECHT — keine Marke               (neu)
├── katalog-suche.tsx      ECHT — keine Marke               (neu)
└── aktionen.ts            Serveraktion für die Suche       (neu)

supabase/_pipeline/_testdaten/
├── medical-nachweis-an.sql   Testwerte auf ein Anmeldekonto (neu)
└── medical-nachweis-aus.sql  … und wieder weg, mit Zählung  (neu)
```

`[cmd]` **Kein Schemaeingriff, keine Migration.** Die Nachweisskripte
enthalten nur `INSERT` und `DELETE` in bestehende Tabellen;
`auth.users` wird nie angefasst.

`[cmd]` `packages/ui/` ist nicht angefasst. **Nichts fehlte diesmal** —
die Anbindung braucht `Card`, `Pill` und `Icon`, alle vorhanden. Die
bekannten Lücken (`shield` dreimal, `file`, `Pill` ohne `dot`, kein
`Empty`, `v2-g-cols-5`) bleiben offen für G-43/G-50.

---

## 6. Die Prüfungen

`[cmd]` `pnpm gate` — **8 von 8 Aufgaben grün.**
`[cmd]` `v2-attrappen.test.ts` — **59 Tests, 59 grün**, davon sechs neu:

- die angebundenen Kacheln tragen keine Marke mehr
- die Anzeige bewertet nicht, sie verortet
- der Befundbereich schlägt den Katalogbereich
- der Katalog wird durchsucht, nicht geladen
- ein unbekannter Marker verschwindet nicht
- die Lagerechnung stimmt an den Rändern

`[cmd]` Im Browser, angemeldet als `test-user@lumeos.local`:
sechs Werte aus zwei Berichten · alle vier Fälle sichtbar · **1
Konsolenfehler** (Grundwert) · drei Breiten geprüft, kein Querlauf bei
1440 und 1100 · Hell und Dunkel geprüft.

`[cmd]` Der Querlauf bei 375 px kommt aus `v2-nav-item` — der
Seitenleiste, wie in G-40 und G-42 gemessen. Bestand, nicht durch G-46
entstanden. Die Tabelle selbst rollt in `v2-tbl-wrap`.

**Zwei Korrekturen an eigenen Prüfungen**, beide vor dem Bericht
gefunden:

`[cmd]` Der Test *„bewertet nicht"* meldete anfangs die
Spaltenüberschrift **Optimalband** als Verstoss. „Optimalband" ist kein
Urteil, sondern der Name des Bereichstyps aus dem Schema
(`range_type = 'optimal'`). Die Prüfung ist jetzt auf das allein
stehende Wort begrenzt.

`[cmd]` Die Markenzählung meldete 7 statt 8 — die Regel kannte nur
`{ATTRAPPE}`, nicht den eigenen Begründungssatz der Entwurfstabelle.

---

## 7. Was als Nächstes ansteht

1. **`eigenes-konto-fuellen.sql` um Medical erweitern** — dann braucht
   es die Nachweisskripte nicht mehr, und die 43 Körpermessungen und
   der Gewichtsverlauf werden gleich mit anmeldbar (Abschnitt 4).
2. **Die 410 Bereichszeilen mit Zahlen füllen** — `decision_status`
   steht auf `needs_tom_decision`, die Quellen sind benannt
   (ADA, WHO, Endocrine Society), die Zahlen fehlen. **Solange sie
   fehlen, ist der Doppelbereich Text und keine Zahl** (Abschnitt 2).
3. **Aliassuche nachrüsten** — 292 Zeilen, indexgestützt, 0,06 ms.
4. **Import, Tracking, Dashboard** — 20 der 21 verbliebenen Marken.

---

## Nachweise

| Behauptung | Beleg |
|---|---|
| 11.676 / 464 / 292 / 2 / 6 Zeilen | `SELECT count(*)` je Tabelle |
| 410 Bereiche ohne Zahl, 54 mit | Kreuztabelle `decision_status` × `count(min_value)` |
| Kein Code hat lab+optimal als Zahl | `GROUP BY loinc_code HAVING …` → 0 Zeilen |
| Vorrangregel steht in SQL | `140_medical_schema.sql:240-252` |
| `reference_source` live | `SELECT … FROM medical.lab_result_values_read(...)` |
| Glucose 102, Labor 70–99, Optimal 70–85 | Browsertabelle, Bildschirmfoto |
| Drei Zustände über `match_status` | `142_laborimport_matching.sql`, Prüfbedingung `lab_result_values_match_integrity_check` |
| Suchzeit 0,05 / 1,9 / 23,2 ms | `EXPLAIN ANALYZE` |
| Rundlauf 353–382 ms | Messung im Browser, Zeit im Browser gestoppt |
| tom.seed ohne Passwort | `SELECT encrypted_password IS NOT NULL` → `f` |
| Aufgeräumt: 0/0, 2/6, 2/6 | `medical-nachweis-aus.sql`, drei Zählungen |
| Gate, Tests | `pnpm gate` 8/8 · `v2-attrappen.test.ts` 59/59 |
