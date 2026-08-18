# Medical an die Daten gebunden (G-46, G-60)

**Stand:** 2026-08-18 · **Auftrag:** G-46 · **Zweig:** `dev`

Herkunftsmarker nach `docs/spezifikation/10-plattform/konventionen/`:
`[cmd]` gemessen · `[read]` gelesen · `[annahme]` angenommen.

**Zwei Teile, in dieser Reihenfolge entstanden:**

| Teil | Auftrag | Was darin steht |
|---|---|---|
| **I** | G-46 | Der Anschluss ans Schema: Lesepfad, Bereichsvorrang, Katalogsuche, die drei Zuordnungszustände. **Zwei der Kacheln, die er baute, gibt es nicht mehr** — siehe Teil II. |
| **II** | G-60 | Das Mockup bekommt die Daten: **eine** Liste in der Form der Attrappe, mit Panelfilter, Verlauf, Bereichsbalken und Popup. |

`[read]` **Teil I bleibt stehen, obwohl sein Ergebnis teils ersetzt
ist.** Seine Messungen (Suchzeiten, 410 Bereichstexte, `tom.seed` ohne
Passwort) gelten weiter, und der Grund, warum seine Anzeige falsch war,
steht nur dort nachvollziehbar.

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

---
---

# Teil II · Das Mockup an die Daten gebunden (G-60)

**Stand:** 2026-08-18 · **Auftrag:** G-60 · **Zweig:** `dev`

---

## Kurzfassung

`[cmd]` **Aus drei Listen wurde eine.** Verschwunden sind die
Flachliste aus G-46 (`befund-tabelle.tsx`, eine Zeile je Messung) und
die Entwurfstabelle mit ihren 48 erfundenen Markern. An ihrer Stelle
steht **die Form der Attrappe mit echten Daten**: 37 Marker aus 140
Werten und 5 Befunden, mit Panelfilter, Verlauf, Sparkline,
Bereichsbalken und Popup.

`[read]` **Der Fehler lag im Auftrag G-46, nicht in der Umsetzung.** Er
verlangte *„die Biomarker-Liste und den Befund"* — zwei Dinge, die im
Mockup so nicht vorkommen.

| | |
|---|---|
| Marken vorher / nachher `[cmd]` | 21 / **20** — die Entwurfstabelle ist geloescht, nicht angebunden |
| Kacheln ohne Marke `[cmd]` | **4** (Markerliste · Marker-Popup · Katalogsuche · Zuordnung) |
| Marker im Browser `[cmd]` | **37** aus 140 Werten, 5 Befunden, 2026-02-18 bis 2026-08-19 |
| Marken im Biomarkers-Tab `[cmd]` | **0** (vorher 1) |
| Konsolenfehler `[cmd]` | **0** (G-46 meldete 1) |
| `pnpm gate` `[cmd]` | 8 von 8 gruen · `v2-attrappen.test.ts` 63/63 · `reihe.test.ts` 5/5 |

---

## 1. Was das Mockup zeigt und woher es kommt

`[cmd]` Je Spalte der Attrappe
(`theme-v1/module-medical-v2.jsx:237-309`), gegen die laufende Instanz
geprueft:

| Spalte der Attrappe | Woher sie jetzt kommt | Beleg |
|---|---|---|
| **Biomarker** (Name) | `lab_result_values.marker_name_snapshot` | 37 Namen im Browser |
| **Kurzname** (`TT`, `Hb`) | `biomarker_aliases.canonical_name` | **24 von 35**, Abschnitt 2 |
| **Panelzuordnung** | `biomarker_catalog.loinc_class` | **4 statt 11 Gruppen**, Abschnitt 2 |
| **LOINC** | `lab_result_values.loinc_code` | 35 von 37 tragen einen |
| **Value** + Einheit | `value_numeric` · `unit_snapshot` | Glukose 102 mg/dL |
| **Lab · optimal · you** | `reference_low/high` + `biomarker_reference_ranges` (`range_type='optimal'`) | Balken, Abschnitt 3 |
| **Range** | `gueltigerBereich()` ueber `lab_result_values_read` | 70–99 bei Glukose |
| **Position** (Flag) | `lageImBereich()` | `In range` / `Above range` / `Below range` / `No range` |
| **Trend %** | erste gegen letzte Messung | Glukose **+15,9 %** (88 → 102) |
| **Sparkline** | die 4–5 Messwerte, alt → neu | 34 Marker tragen eine |
| **Popup** | `MarkerReihenModal` mit echter Kurve | 4 Messungen, Achse `02-18`…`08-18` |
| **Non-optimal only** | Lage gegen Labor- **und** Optimalband | **37 → 6 Zeilen** |
| **Panelfilter** | `loinc_class`, echt gezaehlt | `All 37 · CHEM 31 · HEM/BC 2 · Unmapped 2 · CHAL.ROUTINE 1 · DRUG/TOX 1` |

### Die Zahlen des Auftrags, im Browser wiedergefunden

`[cmd]` Der Auftrag nannte zwei Verlaeufe als Probe. Beide stehen so da:

| Marker | Verlauf laut Auftrag | Im Browser | Trend |
|---|---|---|---|
| Glukose | 88 → 94 → 99 → 102 | **identisch**, 2026-02-18 bis 2026-08-18 | `↑ +15,9 %` |
| HbA1c | 5,2 → 5,3 → 5,4 → 5,4 | **identisch** | `↑ +3,8 %` |

### Der Verlauf rechnet anders als die Attrappe — mit Grund

`[cmd]` Die Attrappe rechnet eine **lineare Regression ueber sechs
erfundene Punkte** und beschriftet sie `Q1 25`…`Q2 26`
(`calcBiomarkerTrend`, `daten.ts`). Die Daten fuehren **vier bis fuenf
echte Messungen** an ungleich verteilten Terminen (Feb, Apr, Jun, Aug,
Aug).

`[read]` **Genommen ist die ablesbare Aussage:** erste gegen letzte
Messung. *„Von 88 auf 102"* ist eine Beobachtung; eine Steigung je
Panel waere eine Interpolation zwischen Terminen, die keinen festen
Abstand haben. Die Zahl der Punkte steht im Titel (`Trend · 4
Messungen`), damit `+15,9 %` nicht wie ein Wert ueber sechs Quartale
aussieht.

`[cmd]` Bei weniger als zwei Messwerten steht `n<2` statt einer Zahl —
das betrifft drei Marker (Calcium und die zwei nicht zugeordneten).

---

## 2. Was die Daten nicht hergeben

**Gemeldet, nicht ersetzt.** `[read]` Der Auftrag: *„Wo die Attrappe
etwas zeigt, das die Daten nicht hergeben — sag es, erfinde nichts."*

### 2.1 Die elf Panels gibt es nicht — **der wichtigste Punkt**

`[cmd]` Die Attrappe fuehrt `All 48 · CBC 5 · Metabolic 4 · Lipid 5 ·
Liver 6 · Kidney 4 · Thyroid 4 · Hormone 10 · Inflammation 3 ·
Vitamins 6 · Screening 1`. **Eine Zuordnung „TSH → Thyroid, LDL →
Lipid" steht in den Daten nirgends.** Vier Stellen geprueft:

| Quelle | Was drinsteht | Taugt als Panel? |
|---|---|---|
| `biomarker_catalog.loinc_class` | CHEM · HEM/BC · CHAL.ROUTINE · DRUG/TOX | **nein** — 31 der 35 Marker sind CHEM |
| `biomarker_catalog.panel_type` | bei **11.421 von 11.676 leer**; sonst `Panel`/`Organizer` | **nein** — kein einziger benutzter Marker traegt einen |
| `biomarker_catalog.panels` (JSONB) | LOINC-Elternpanels, 4.137 Codes | **nein** — Kreatinin haengt in **33** davon, darunter `Rosetta lab Pnl Bld` und Tiermedizin-Panels |
| `biomarker_reference_ranges.curated_slug` | `total_testosterone`, `hba1c`, … | **nein** — Marker-Schluessel, keine Gruppe |

`[cmd]` **Auch das Vorgaengerrepo hat es nicht** — nachgesehen, wie die
Regel es verlangt: `migrations/20240115000015_create_medical_tables.sql:16`
fuehrt `category TEXT` mit den Werten `blood`, `urine`, `hormone`,
`vitamin`, `enzyme`. **Das ist Probenmaterial, keine klinische
Panelgruppe** — Cholesterin, Glukose und Kreatinin stehen dort alle
unter `blood`.

**Gebaut ist deshalb, was da ist:** der Filter laeuft ueber
`loinc_class` und zaehlt echt. **Erfunden ist nichts.**

`[annahme]` Wer die elf Panels will, braucht eine gepflegte Zuordnung
je Marker — 35 Zeilen fuer den Bestand, ~50 fuer einen ueblichen
Katalog. Das ist eine Produktentscheidung mit Schemafolge, keine
Anzeigefrage. **Tom entscheidet.**

### 2.2 Kurznamen fehlen bei 11 von 35 Markern

`[cmd]` Die Attrappe zeigt `TT`, `GLU`, `HbA1c`. Zwei Quellen geprueft:

- `biomarker_catalog.short_name` ist fuer **alle 11.676** gefuellt —
  aber es sind **LOINC-Kodierkuerzel, keine Anzeigenamen**:
  `2986-8` heisst dort `Testost SerPl-mCnc`, `718-7` heisst
  `Hgb Bld-mCnc`. Unbrauchbar als Spaltentext.
- `biomarker_aliases.canonical_name` traegt die lesbare Form
  (`Total Testosterone`, `HDL`, `hs-CRP`) — **fuer 24 der 35 Codes.**

`[cmd]` **Ohne Kurznamen bleiben elf:** ApoB · Free Testosterone ·
FSH · Glucose (fasting) · Hematocrit · IGF-1 · LDL Cholesterol ·
Magnesium (RBC) · Prolactin · Vitamin D (25-OH) · Zinc (serum).
Die Zeile zeigt dann nur Klasse und Datum. **Kein Platzhalter, kein
geratenes Kuerzel.**

### 2.3 `Health score 81` und `6 alerts` sind weiter Attrappe

`[cmd]` Beide stehen unveraendert in der Kopfzeile und stammen aus
`calcOverallHealthScore()` und `generateAlerts()` **ueber den
erfundenen 48-Marker-Katalog**.

`[read]` **Sie bleiben, und zwar aus zwei Gruenden.** Erstens fehlen
die Daten: der Wert wiegt fuenf Systeme (`liver`, `cardiovascular`,
`kidney`, `hormonal`, `metabolic`), und **die Systemzuordnung ist
dasselbe fehlende Stueck wie die Panels** (2.1). Zweitens waere ein
Gesundheitswert **genau die Bewertung, die diese Anzeige nicht
abgibt** — dieselbe Grenze wie bei C-49 und GO-14.

`[cmd]` Die dritte Zahl der Kopfzeile ist dagegen **echt geworden**:
`37 biomarkers` statt der 48 der Vorlage, und der Tabzaehler
`Biomarkers 37` ebenso.

### 2.4 Was aus der Attrappe bewusst herausfiel

| Weggelassen | Grund |
|---|---|
| **Evidenzgrad** `ev A+` / `ev A` | `[cmd]` Tom: *„Wir haben die Daten fuer diese Evidence nicht, also weg."* Ein Test haelt fest, dass er nicht zurueckkommt. |
| **`match_status` in der Liste** | `[cmd]` Tom: *„In der Liste ist er Testmaterial."* **Umgezogen in den Import-Tab**, Abschnitt 4. |
| `Clinical significance` (Popup) | `[cmd]` freier Erklaertext je Marker; die Datenbank fuehrt kein solches Feld. |
| `Recommended frequency` (Popup) | `[cmd]` nicht in der Datenbank. |
| `Linked across modules` (Popup) | `[cmd]` die Verknuepfung Supplement → Biomarker gibt es als Schema nicht. |
| **Roter Balkengrund** („outside lab range") | `[cmd]` Die Attrappe braucht dafuer `critical_low`/`critical_high`. **Diese Spalten hat `lab_result_values` nicht** — geprueft gegen `information_schema.columns` (27 Spalten). Der Grund bleibt neutral, sonst behauptete die Farbe eine Schwelle, die niemand gemessen hat. |

---

## 3. Was die Daten hergeben und das Mockup nicht zeigt

`[read]` Der Auftrag: *„Wenn eine Spalte in den Daten steht, die das
Mockup nicht zeigt und die dazugehoeren wuerde — melden, nicht
einbauen. Tom entscheidet."*

| Was die Daten fuehren | Was es leisten wuerde | Status |
|---|---|---|
| **`reference_source`** (`lab_report` / `catalog_fallback` / `none`) | `[cmd]` **138 der 140 Bereiche kommen vom Befund, 1 aus dem Katalog, 1 hat keinen.** Die Attrappe hat keine Spalte dafuer — G-46 hatte eine („Herkunft"). **Sie ist mit der Flachliste weggefallen.** Der Rueckfall ist damit heute unsichtbar. | **melden** |
| **`lab_name` je Befund** | `[cmd]` `LumeOS Testlabor` und `C-72 Testlabor`. Die Attrappe zeigt das Labor nur in der Import-Historie, nicht an der Zeile. | **melden** |
| **`fasting_status`** je Messung | `[cmd]` Die Attrappe zeigt `Fasting required` als **Empfehlung je Marker**; die Daten fuehren den **Zustand je Messung**. Nicht dasselbe — eine Umdeutung waere eine Erfindung. | **melden** |
| **`report_time`, `notes`, `frozen_at`** | Uhrzeit, Kontext, Einfrierzeitpunkt je Wert. | **melden** |
| **`value_operator`** (`<`, `>`, `<=`) | `[cmd]` Wird angezeigt, wo er nicht `=` ist — das war kein Zusatz, sondern noetig: ein `<0,1` als `0,1` zu zeigen waere falsch. | **eingebaut** |
| **Optimalband als Text** | `[cmd]` `<25 U/L`, `9.0–10.0 mg/dL`, aber auch **`Phase-dependent`** bei Estradiol und LH. Zerlegbare Formen werden zu Zahlen, der Rest bleibt Text. | **eingebaut** |

### Der Doppelbereich traegt heute — aber duenn

`[cmd]` Von den 35 zugeordneten Markern haben **24 ein Optimalband**,
11 nicht (ApoB, Free Testosterone, FSH, Glukose, Hematocrit, LDL,
Magnesium, Prolaktin, Vitamin D, Zink, IGF-1). Wo beide Baender
auseinanderfallen, sagt die Zeile es in einer zweiten Zeile:

> `In range` / `optimal: above range` — bei **ALT, Kreatinin,
> Homocystein, Insulin.**

`[cmd]` Die Einschraenkung aus G-46 gilt weiter: **von 464
Bereichszeilen tragen nur 54 Zahlen**, und die stehen auf
`do_not_import_without_source`. Der Katalogrueckfall liefert deshalb
**Text**, den `bereichAusText()` zerlegt.

---

## 4. `match_status` ist umgezogen

`[cmd]` **Neue Kachel `ImportZuordnung`** im Import-Tab, ohne
Attrappenmarke. Im Browser:

> **Zuordnung** — 138 von 140 Werten zugeordnet
> `138` Einem Katalogeintrag zugeordnet
> `1` Mehrdeutig — mehrere Kandidaten
> `1` Im Katalog nicht gefunden

Darunter die zwei offenen Faelle **einzeln, mit ihren Kandidaten**:

| Rohtext | Zustand | Kandidaten |
|---|---|---|
| `Unbekannter Marker X` (Konfidenz 0,00) | `unknown` | keine |
| `Glukose` (Konfidenz 0,50) | `ambiguous` | `2345-7 · 0,68` · `2339-0 · 0,68` · `5792-7 · 0,58` |

`[read]` **Welcher gilt, entscheidet ein Mensch, nicht die Anzeige.**

`[cmd]` **In der Markerliste sind sie trotzdem da** — mit ihrem
Rohtext, unter `Unmapped 2`, und ein Satz unter der Tabelle nennt sie:
*„2 von 37 Markern sind keinem Katalogeintrag zugeordnet."* Tom:
*„Sie bleiben in der Datenbank, verschwinden aus der Anzeige"* — aus
der **Zuordnungsanzeige** der Liste, nicht aus der Liste selbst. Ein
Wert, den niemand sieht, waere ein Datenverlust.

### Der Fallstrick, der dabei auffiel

`[cmd]` Die Faltung gruppiert nach `loinc_code`. **Beide offenen Faelle
haben keinen** — ohne Rueckfall auf den Namen lagen sie in einem
gemeinsamen `null`-Topf und erschienen als **ein** Marker mit zwei
Namen. Ein Test haelt den Rueckfall fest.

---

## 5. Der Katalog steht hinter der Suche

`[cmd]` Die 11.676 Zeilen sind **nicht mehr Dauerliste**. Unter der
Markerliste steht ein Knopf `Im Katalog suchen · 11.676 Marker`; die
Kachel klappt aus. `[read]` *„Wie die 7.140 Lebensmittel, wo das
Tagebuch vier Zeilen zeigt."*

`[cmd]` **Gebaut ist sie unveraendert** — die Messung aus G-46 gilt
weiter. Im Browser gegengeprueft: Suche nach **„eisen"** liefert 13
Treffer (`Iron [Mass/Vol]`, `Iron saturation …`) — der deutsche Begriff
findet die englischen LOINC-Eintraege ueber `german_long_name`.

---

## 6. Keine Bewertung — die Mockup-Begriffe geprueft

`[read]` Der Auftrag: *„Die Attrappe zeigt `Optimal`, `High`, `Low` —
das sind Lagebezeichnungen, keine Urteile, **solange sie sagen, wo** ein
Wert liegt. Pruef, ob die Mockup-Begriffe dasselbe leisten, und melde,
wenn nicht."*

**Geprueft. Sie leisten es nicht — zwei von ihnen.**

| Begriff der Attrappe | Sagt er, WO der Wert liegt? | Genommen |
|---|---|---|
| `High` / `Low` | **ja** | `Above range` / `Below range` |
| `Normal` | ja, im Laborband | `In range` |
| `Optimal` | **nein** | `In range` (+ Zusatz `optimal: …`) |
| `Critical low` / `Critical high` | **nein** — reines Urteil | faellt weg |

`[cmd]` **Warum `Optimal` nicht durchkommt:** es benennt keine Lage,
sondern spricht ein Guetesiegel aus. In der Attrappe steht es zudem in
**einer Reihe mit `Critical low`/`Critical high`** (`FLAG_META`,
`daten.ts:33-40`) — dieselbe Spalte, dieselbe Skala. Wer `Optimal`
uebernimmt, uebernimmt die Skala.

`[cmd]` **Die G-46-Loesung leistet dasselbe**, nur auf Englisch wie das
Mockup: `In range` · `Above range` · `Below range` · `No range`.
Der Doppelbereich kommt als zweite Zeile dazu — `optimal: above range`
— und sagt damit ebenfalls nur, **wo**.

`[cmd]` **Die Farbe folgt der Lage, nicht einer Bewertung**: innerhalb
`--pos`, ausserhalb `--warn`, ohne Bereich gedaempft. **Kein Rot.** Ein
Test prueft die vier Woerter als Wortgrenze in `marker-liste.tsx`,
`marker-modal.tsx`, `reihe.ts` und `befund.ts`.

---

## 7. Nachweis

### Angemeldet, beide Modi

`[cmd]` Als `dev@lumeos.app` im Browser, 1440 × 1000:

| | |
|---|---|
| Dunkel | Liste mit 37 Zeilen, Panelpillen, Balken, Sparklines |
| Hell | dieselbe Liste, Kontraste tragen |
| Popup (hell) | Glukose: 4 Messungen, Kurve `02-18`…`08-18`, `↑ +15,9 %` |
| Import-Tab | `Zuordnung · 138 von 140`, ohne Marke, neben markierten Kacheln |

`[cmd]` **G-58 beachtet:** gemessen ist gegen den **gerenderten**
Grund, nicht gegen den Kachelwert — die Liste traegt keine
`v2-attrappe`-Toenung mehr, also entfaellt die Verschiebung um 0,015
fuer sie.

### Die Marken

`[cmd]` Im Browser je Tab gezaehlt:

| Tab | Marken |
|---|---|
| Dashboard | 5 |
| **Biomarkers** | **0** — vorher 1 |
| Import | 4 — vorher 4, plus eine Kachel **ohne** |
| Tracking | 5 |
| Insights | 6 |
| **Summe** | **20** — vorher 21 |

`[cmd]` **Die eine verlorene Marke ist die Entwurfstabelle**, und sie
ist **geloescht, nicht angebunden**. Ihr Begruendungssatz lautete:
*„Die Tabelle zeigt Zeitreihe, Sparkline und Bereichsbalken —
`lab_result_values` fuehrt sechs Testwerte und keine Zeitreihe."*
**Das gilt nicht mehr.** Ihre Form traegt jetzt echte Daten.

`[cmd]` **Vier Kacheln ohne Marke:** Markerliste · Marker-Popup ·
Katalogsuche · Zuordnung.

### Filter, Verlauf, Zeilenschutz

| Nachweis | Ergebnis |
|---|---|
| Panelfilter zaehlt `[cmd]` | `All 37 · CHEM 31 · HEM/BC 2 · Unmapped 2 · CHAL.ROUTINE 1 · DRUG/TOX 1` — Summe 37 |
| Panelfilter filtert `[cmd]` | Klick auf `HEM/BC 2` → **2 Zeilen**: Hemoglobin, Hematocrit |
| `Non-optimal only` `[cmd]` | **37 → 6**: Glukose (roh), ALT, Kreatinin, Glukose, Homocystein, Insulin |
| Verlauf echt `[cmd]` | Glukose `↑ +15,9 %`, Popup zeigt 88 / 94 / 99 / 102 mit Datum |
| **Zeilenschutz** `[cmd]` | als `test-user@lumeos.local`: **`Biomarkers 0`**, 0 Tabellenzeilen, `0 marker · 0 lab reports` |

`[cmd]` **Der Zeilenschutz zusaetzlich an der Datenbank**, weil die
Anzeige nur zeigt, was ankommt — die Regel muss unten greifen:

| Rolle `authenticated`, `sub` = | `lab_result_values` | `lab_result_values_read(...)` |
|---|---|---|
| `dev@lumeos.app` | **140** | **140** |
| `test-user@lumeos.local` | **0** | **0** |
| `test-user` fragt **nach der Id von dev** | — | **0** |

**Der Quergriff ist der eigentliche Nachweis:** ein leeres Ergebnis
kann auch heissen, dass jemand keine eigenen Daten hat. Die dritte
Zeile zeigt, dass die Regel **fremde** Zeilen sperrt.

### Breiten

`[cmd]` Seitenueberlauf bei **375 · 768 · 1024 · 1440 px: keiner.**

`[cmd]` **Die Tabelle rollt in sich**, wie vorgesehen: bei 375 px
`v2-tbl-wrap` 647 px Inhalt in 293 px Sichtfenster, `overflow-x: auto`.
Der Seitenkoerper rollt nicht — der Querlauf aus G-46 (`v2-nav-item`)
tritt hier nicht mehr auf.

### Gate und Tests

| | |
|---|---|
| `pnpm gate` `[cmd]` | **8 von 8 gruen** |
| `v2-attrappen.test.ts` `[cmd]` | **63 von 63** (vorher 59) |
| `reihe.test.ts` `[cmd]` | **5 von 5** — neu |
| Konsolenfehler `[cmd]` | **0** (G-46 meldete 1) |

**Fuenf neue Pruefungen**, jede haelt eine Entscheidung dieses
Auftrags fest:

1. *„Medical zeigt EINE Liste, nicht drei"* — schlaegt an, wenn
   `befund-tabelle.tsx` zurueckkommt oder der Tab wieder eine eigene
   Tabelle bekommt.
2. *„die Marker-Liste traegt die Form der Attrappe"* — sieben Merkmale
   nach Namen; wer eine Spalte still weglaesst, faellt auf. Prueft
   zugleich, dass **kein Evidenzgrad** und **kein `match_status`** in
   der Liste stehen — und dass der `match_status` im Import-Tab ist.
3. *„der Verlauf rechnet ueber gemessene Punkte"* — keine erfundenen
   Quartalsbeschriftungen, Untergrenze n≥2, Nullfall abgefangen.
4. *„bewertet nicht, sie verortet"* — erweitert auf die drei neuen
   Dateien.
5. `reihe.test.ts` — die Faltung selbst: Gruppierung, Rueckfall auf den
   Namen, Trendrechnung, Balkenskala, offene Grenze.

### Eine Korrektur an einer eigenen Pruefung

`[cmd]` Die Regel *„filtert nicht nach LOINC"* schlug zuerst falsch an:
sie suchte den Text `filter(...loinc_code)` in der ganzen Datei und traf
`reihen.filter(r => !r.loinc_code).length` — das **zaehlt** die nicht
zugeordneten Marker fuer den Hinweis, es entfernt sie nicht. Die
Pruefung ist jetzt auf die Filterkette der angezeigten Liste begrenzt.

---

## 8. Was als Naechstes ansteht

1. **Die Panelzuordnung entscheiden** (2.1) — ohne sie bleibt der
   Filter bei vier LOINC-Klassen statt elf Panels, **und der
   `Health score` bleibt Attrappe**, weil er dieselbe Zuordnung
   braucht. Das ist der groesste offene Punkt dieses Moduls.
2. **Kurznamen fuer die acht fehlenden Marker** (2.2) —
   `biomarker_aliases` fuellen, kein Schemawechsel noetig.
3. **Entscheiden, ob `reference_source` zurueck in die Liste soll**
   (Abschnitt 3) — heute ist unsichtbar, dass ein Bereich ein
   Rueckfall ist.
4. **Die 410 Bereichszeilen mit Zahlen fuellen** — unveraendert aus
   G-46, `decision_status = needs_tom_decision`.
5. **Dashboard, Tracking, Insights** — 16 der 20 verbliebenen Marken.

---

## Nachweise (G-60)

| Behauptung | Beleg |
|---|---|
| 140 Werte, 5 Befunde, 37 Marker | `SELECT count(*)`, im Browser gegengezaehlt |
| Verlauf Glukose / HbA1c | `GROUP BY marker_name_snapshot` + Popup-Bildschirmfoto |
| Panels fehlen in 4 Quellen | `loinc_class` · `panel_type` · `panels` · `curated_slug`, je `GROUP BY` |
| Vorgaengerrepo hat keine Panels | `20240115000015_create_medical_tables.sql:16` — `category` = Probenmaterial |
| Kurzname fuer 24 von 35 | `LEFT JOIN biomarker_aliases … GROUP BY loinc_code` |
| `critical_*` gibt es nicht | `information_schema.columns`, 27 Spalten von `lab_result_values` |
| `reference_source` 138/1/1 | `SELECT reference_source, count(*) FROM lab_result_values_read(...)` |
| Panelfilter zaehlt und filtert | Browser: Klick auf `HEM/BC 2` → 2 Zeilen |
| `Non-optimal only` 37 → 6 | Browser, Zeilen gezaehlt |
| Zeilenschutz | `SET LOCAL ROLE authenticated` mit drei `sub`-Werten + Browser als test-user |
| Kein Seitenueberlauf 375–1440 | `scrollWidth > clientWidth` je Breite → nein |
| Tabellenroller 647 in 293 | `v2-tbl-wrap`, `getComputedStyle().overflowX` |
| Marken 20, Biomarkers 0 | Browser je Tab gezaehlt + `v2-attrappen.test.ts` |
| Gate, Tests | `pnpm gate` 8/8 · 63/63 · 5/5 · 0 Konsolenfehler |
