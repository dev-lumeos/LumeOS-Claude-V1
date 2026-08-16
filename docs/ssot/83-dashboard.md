# 83 — Dashboard (G-05)

Stand: 2026-08-16 · Anker: Zweig `dev` · Auftrag G-05
Herkunft: gebaut und geprüft in dieser Sitzung.
Rangfolge: Code > dieses Dokument > Rest.

Gebaut aus `theme-v1/module-dashboard.jsx`. Zwei Dateien:

| Datei | Rolle |
|---|---|
| `apps/web/src/app/v2/page.tsx` | Server-Komponente, liest fünf Quellen, jede in eigenem `try` |
| `apps/web/src/app/v2/dashboard.tsx` | reine Anzeige, kein I/O |

Entfallen ist `apps/web/src/app/v2/akzent-probe.tsx` — die Nachweisseite
aus G-01. Sie war verwaist, seit `page.tsx` das Dashboard trägt.

---

## Die Kernfrage: was echt ist und was nicht

Der Auftrag stellte zwei Möglichkeiten zur Wahl. **Gewählt ist (a): nur
zeigen, was es gibt.**

`[cmd]` Die Vorlage hat zwölf Kacheln — vier Kennzahlen (Recovery 82,
Trainingslast 2.142 TSS, Kalorien, Schlaf 7:42) und acht Karten
(Tagesablauf, Makros, Aktivität, Readiness-Ring, Body Battery, Tonight,
PR-Watch). `[cmd]` Drei davon haben heute eine Datenquelle. Die
Schemata `recovery`, `supplements` und `medical` existieren nicht;
`training` hat vier Tabellen, alle Stammdaten, keine einzige Sitzung.

Gegen (b) — alles zeigen, Attrappen kennzeichnen — spricht ein Punkt,
den man erst im Betrieb merkt: **eine Marke nimmt einer Zahl nicht ihre
Wirkung.** Wer morgens auf ein Dashboard sieht, liest die Zahlen, nicht
die Marken. G-03 hat aus demselben Grund entschieden, keinen gefüllten
Ring ohne Ziel zu zeigen; neun Attrappen sind dasselbe Problem neunmal.
Der Auftrag verbietet ausdrücklich, „eine Zahl zu zeigen, die aussieht
wie gemessen und erfunden ist" — eine `MOCK`-Marke daneben ändert nicht,
dass die Zahl erfunden ist.

Statt der neun fehlenden Kacheln steht **eine** Karte da: „Was dieses
Dashboard nicht zeigt", die je Kachel benennt, woran es hängt. Das ist
die Liste, die G-06 braucht.

`[read]` Das Dashboard rechnet nicht nach. Die C-48-Regeln stehen in der
Datenbank (`daily_reference_assessment`); die Oberfläche filtert und
zählt, sie leitet keine Prozentwerte her. `micro_flags` und Tagesscore
sind nicht gebaut — sie gehören zu C-49.

---

## Welche Kachel woher kommt

| Kachel | Herkunft | Attrappe? |
|---|---|---|
| Kopf „Mahlzeiten" | `nutrition.daily_summary.meal_count` / `item_count` | nein |
| Kopf „Referenz gedeckt" (bis 16.08. „Ziele erreicht", siehe Nachtrag) | `daily_reference_assessment`, gezählt über `reference_status='complete'` **und** `reference_pct IS NOT NULL` **und** `reference_direction='target'` | nein |
| Kopf „Über Grenze" | dieselbe Sicht, `reference_direction='upper_limit'` und `reference_pct > 100` | nein |
| „Makros heute", vier Ringe | Wert aus `daily_summary` (`enercc`, `prot625`, `cho`, `fat`), Ziel aus `goals.zielwerte_am` | nein |
| Hinweis „Schätzung ist keine Messung" | `herkunft` und `tdee` aus `zielwerte_am` | nein |
| „Nährstoffdeckung" | `daily_reference_assessment`, alle Zeilen | nein |
| „Energie, letzte sieben Tage" | `daily_summary` über sechs Vortage plus Stichtag | nein |
| Meter unter der Kurve | Schnitt der Kurve gegen `zielwerte_am(heute).kcal` | nein, **aber** siehe Vorbehalt unten |
| „Was dieses Dashboard nicht zeigt" | fest verdrahtete Liste, keine Datenquelle | keine Zahl, nur Text |

**Attrappe im Sinne von G-03 ist keine dieser Kacheln.** Es gibt auf
dieser Seite keine erfundene Zahl. Das ist die Folge der Entscheidung
oben — der Preis ist, dass die Seite dünner ist als die Vorlage.

**Nicht übernommen aus der Vorlage** (und was ein Modul liefern müsste,
damit die Kachel erscheint — die Liste für G-06):

| Kachel der Vorlage | Braucht |
|---|---|
| Recovery, Readiness, Body Battery | Schema `recovery` mit Checkins und HRV |
| Trainingslast, PR-Watch | Trainings-Sitzungen — `training` hat heute nur Stammdaten |
| Schlaf, Tonight | Schlafdaten, in keinem Schema |
| Supplement-Einnahme | Schema `supplements` |
| Tagesablauf mit Uhrzeiten | Uhrzeit je Mahlzeit — `meals` hat nur `entry_date` |

Ein Vorbehalt, der in der Oberfläche steht und hier wiederholt gehört:
der Meter vergleicht den **Siebentageschnitt** gegen das **heutige**
Ziel. Ältere Tage hatten möglicherweise ein anderes — `gueltig_ab` wirkt
vorwärts. Der Text unter dem Meter sagt das; ein Vergleich je Tag gegen
das je Tag gültige Ziel wäre richtiger und ist nicht gebaut.

---

## Was an den Szenariotagen auffiel

### Wie geprüft wurde — und was das nicht ist

`[cmd]` Die elf Tage aus `supabase/_pipeline/_testdaten/testdaten-register.json`
sind **nicht** im Browser besichtigt worden. Der Grund ist benannt statt
umgangen:

- Die Seed-Nutzer existieren nur in der Wegwerf-Datenbank `lumeos_g05`.
- `[cmd]` Die laufende Datenbank `postgres`, mit der die App spricht, hat
  **einen** Tag mit Daten (2026-08-16: 1 Mahlzeit, 2 Positionen,
  933,6 kcal) und **ein** Ziel (`gueltig_ab` 2026-08-16, 2977,8 kcal).
- Testdaten live einzuspielen erlaubt der Auftrag nur nach Absprache.
  Die habe ich nicht eingeholt, also ist es unterblieben.
  **Überholt seit 2026-08-16:** Tom hat die Regel aufgehoben — wer etwas
  zum Prüfen braucht, stellt es selbst her. Die Testdaten liegen jetzt
  live; siehe Nachtrag am Ende.

Geprüft wurde deshalb **zweigleisig**:

1. **Im Browser, angemeldet**, an vier Tagen der laufenden Datenbank —
   2026-08-16, 2026-08-15, 2026-08-08, 2026-08-02. Das deckt drei
   Zustände ab: Tag mit Daten und Ziel, Tag ohne Erfassung, Tag vor dem
   ersten `gueltig_ab`.
2. **Auf Datenebene** in `lumeos_g05`, an allen elf Registertagen, mit
   den Anzeigeregeln aus `dashboard.tsx` nachgebildet (Leerfall,
   `bewertbar`, `erreicht`, `ueberGrenze`, `profilFehlt`, `kcalVerlauf`).

`[annahme]` Zwischen 2 und dem tatsächlichen Bild im Browser liegt die
Annahme, dass die Komponente die Regeln so anwendet, wie sie
dastehen — belegt für die vier live geprüften Tage, für die übrigen
sieben nicht.

### Im Browser gesehen

| Tag | Kopfzahlen | Ringe | Hinweis |
|---|---|---|---|
| 2026-08-16 | `1` / `0/32` / `0` | 933,6 / 2.977,8 kcal → 31 %; 20,66 / 156,8 g → 13 %; 123,14 / 401,6 g → 31 %; 36,458 / 82,7 g → 44 % | „Ziele aus dem Profil geschätzt (TDEE 2707 kcal)"; „15 weitere tragen keinen Prozentwert" |
| 2026-08-15 | `0` / `—` / `—` | alle `—` | „Für diesen Tag ist nichts erfasst"; „Kein Tagesziel für diesen Tag" |
| 2026-08-08 | `0` / `—` / `—` | alle `—` | wie oben |
| 2026-08-02 | `0` / `—` / `—` | alle `—` | wie oben |

Drei Breiten (1600 / 1100 / 800 px) ohne Überlauf. `/nutrition` (die
alte Oberfläche) zeigt 0 `v2-`-Elemente und weiterhin `lume-shell` — sie
ist unverändert.

### Alle elf Registertage, auf Datenebene

| Fall | Tag | Was das Dashboard zeigt | Richtig? |
|---|---|---|---|
| Tag ohne Ziel | 08-02 | Ringe mit Wert, **ohne Prozent**; Hinweis „Kein Tagesziel für diesen Tag" | ja |
| Natrium über Referenz | 08-04 | Über Grenze **0**, Natrium zählt als *erreichtes Ziel* | **nein — siehe unten** |
| Vitamin A über UL | 08-05 | Über Grenze **1**, `VITA` bei 186 % | ja |
| Lückenhafte Nährwerte | 08-06 | 11 mit Prozent, **29 unvollständig**, Zeile „Summe ist eine Untergrenze" | ja |
| Kalorien unter Ziel | 08-07 | 972,3 / 2500 kcal | ja |
| Tag ohne Mahlzeit | 08-08 | Kopf `—`, Ringe leer, „Für diesen Tag ist nichts erfasst" | ja |
| Mikronährstoffmangel | 08-09 | 0 von 25 Zielen erreicht | ja, **aber flach — siehe unten** |
| Kalorien über Ziel | 08-10 | 3778,25 / 2200 kcal, Über Grenze 1 | ja |
| Leere Mahlzeiten | 08-11 | Mahlzeiten **4**, Ringe leer, „Mahlzeiten angelegt, aber nichts erfasst" | ja |
| Viele Positionen | 08-13 | 24 Positionen, Über Grenze 2 (`VITA` 105,9 %, `NIA` 109,4 %) | ja |
| Profil unvollständig | 08-16 | 33 Zeilen, **0 mit Prozent**, Karte „Profil unvollständig" | ja |

### Was nicht richtig dargestellt wird

**1. Natrium am 08-04 erscheint als erreichtes Ziel, nicht als
Überschreitung.** `[cmd]` Die Sicht liefert für `NA` und `NACL`
`reference_direction = 'target'` bei 128,8 %. Das Dashboard zählt nach
`reference_direction`, also landet der Wert unter „Ziele erreicht".
Für Salz ist das die falsche Leserichtung — 128,8 % einer
Zufuhrempfehlung für Natrium ist kein erreichtes Ziel.

Die Ursache liegt **nicht** in dieser Seite: die Referenzdaten führen
für Natrium AI/FORMULA statt eines UL; das Register hält das selbst
fest. Das Dashboard kann nicht unterscheiden, was die Referenzdaten
nicht unterscheiden. Eine Sonderregel „Natrium ist immer eine
Obergrenze" wäre genau die erfundene Bedeutung, die der Auftrag
verbietet. **Offen für C-49** — dort gehört entschieden, welcher
Nährstoff in welche Richtung zählt.

**2. Der Mangelfall am 08-09 sieht aus wie jeder andere schwache Tag.**
„0 von 25" ist richtig, sagt aber nicht, dass Eisen, Calcium und
Vitamin D unter 50 % liegen, während andere knapp darunter bleiben. Es
fehlt die Gewichtung — welcher Nährstoff wie stark zählt, sagt keine
Spec. **C-49**, absichtlich nicht gebaut.

**3. Über Grenze am 08-02 zeigt 3, der Registerfall heißt aber „Tag ohne
Ziel".** `[cmd]` `VITA` 176 %, `NIA` 188,4 %, `MG` 170,2 % überschreiten
ihre UL. Das ist keine Fehldarstellung — der Tag hat wirklich beides —,
aber der Kopf zeigt „Ziele erreicht 15/30" an einem Tag **ohne**
Tagesziel. Die beiden Begriffe meinen Verschiedenes: das *Tagesziel*
(Kalorien und Makros, aus `goals`) fehlt, die *Nährstoffreferenzen*
(aus `nutrient_reference_values`) gibt es trotzdem. Die Kopfzeile
unterscheidet das nicht — ein Benennungsmangel dieser Seite, nicht der
Daten.

**4. Der Verlauf am 08-04 und 08-05 stützt sich auf 3 bzw. 4 Tage.**
Die Kurve zeichnet, was da ist, und beschriftet mit „3 Tage mit
Eintrag". Tage ohne Eintrag fallen heraus statt als 0 zu erscheinen.
Das ist so gewollt, macht die Kurve aber am Anfang einer Erfassung
irreführend dicht — sieben nebeneinanderliegende Punkte suggerieren
sieben Tage.

---

## Nachweise

| Prüfung | Ergebnis |
|---|---|
| `pnpm gate` | `[cmd]` 8 von 8 Aufgaben grün |
| `pnpm test` | `[cmd]` 182 Tests, 182 bestanden, 0 fehlgeschlagen |
| Browser, vier Tage | `[cmd]` gerendert, siehe Tabelle oben |
| Drei Breiten | `[cmd]` 1600 / 1100 / 800 px, kein Überlauf |
| `/nutrition` | `[cmd]` 0 `v2-`-Elemente, `lume-shell` vorhanden — unverändert |
| Konsolenfehler | `[cmd]` 12 auf `/v2`, **alle 404** auf Vorablade-Anfragen (`/v2/recovery`, `/v2/goals`, `/v2/training`, `/v2/medical`, `/v2/supplements`, `/v2/coach`). Keine JS-Fehler. `[cmd]` `/v2/settings` — von G-05 nicht angefasst — erzeugt dieselben 10 Vorablade-404. Herkunft ist die Navigation aus G-02, nicht diese Seite. |

### Ein Fund am Rande: der Server war zwei Tage alt

`[cmd]` Die Browser-Prüfung lieferte zunächst eine leere Seite und
`Could not find the module "…akzent-probe.tsx#AkzentProbe" in the React
Client Manifest` — auch nachdem die Datei gelöscht war und die Quellen
keinen Verweis mehr enthielten.

Ursache: auf Port 3200 lief ein Node-Prozess **seit 14.08. 08:01**, also
zwei Tage älter als diese Arbeit. Er lieferte einen Build von vor allen
Änderungen aus. Jede Browser-Prüfung dieses Auftrags hätte gegen einen
veralteten Stand gemessen, ohne dass etwas auf den Grund hingewiesen
hätte — die Fehlermeldung zeigte auf die gelöschte Datei, nicht auf den
alten Prozess.

Zwei Dinge, die das Auffinden verzögert haben und beim nächsten Mal Zeit
sparen:

- `netstat | grep LISTENING` findet auf diesem System nichts. Windows
  ist deutsch, der Zustand heißt **`ABHÖREN`**. Der Port sah frei aus,
  obwohl er belegt war.
- `pnpm build` schreibt nach **`.next-gate`**, nicht nach `.next`
  (`apps/web/scripts/gate-build.js`, damit der Gate-Build nicht mit
  `next dev` kollidiert). `pnpm start` sucht ohne
  `LUMEOS_DIST_DIR=.next-gate` in `.next` und meldet „no production
  build", obwohl gerade erfolgreich gebaut wurde.

`[annahme]` Kein Beleg, dass frühere Aufträge dieser Sitzung davon
betroffen waren — geprüft wurde es nicht.


---

## Nachtrag 2026-08-16: startklar gemacht

`[cmd]` Drei Dinge erledigt, damit Tom unter seinem eigenen Konto etwas
sieht.

### 1. Dev-Server laeuft

`[cmd]` PID 30768, gestartet 18:20 Uhr. Beleg, dass er den **aktuellen**
Stand ausliefert: die Kopfzeile zeigt „REFERENZ GEDECKT" — die
Beschriftung aus Punkt 3, die es vorher nicht gab. Ein alter Prozess
koennte sie nicht kennen.

Der Port war noch von meinem eigenen Produktionsserver aus dieser
Sitzung belegt (17:58) — beendet, bevor der Dev-Server startete.

### 2. Toms Konto hat Daten

`[cmd]` Vorher: Profil vorhanden, **alle sechs Felder NULL**, 0
Mahlzeiten, 0 Ziele. Das war der Grund fuer die leeren Seiten.

**Entscheidung: den Seed NICHT umbiegen, sondern kopieren.** Der Grund
ist eine Zeile in `testdaten-einspielen.ts`:

    DELETE FROM auth.users WHERE id IN (${userIds});

Zeigte der Seed auf `dev@lumeos.app`, loeschte er bei jedem Lauf Toms
**echtes Anmeldekonto samt Passwort**. Dazu kommt: `testdaten-pruefen.ts`
und das Szenarienregister pruefen die drei festen Seed-UUIDs — andere
IDs braechen genau die Pruefung, die gruen sein soll.

Gebaut ist deshalb `supabase/_pipeline/_testdaten/eigenes-konto-fuellen.sql`:
kopiert Profil, Zielwerte, Mahlzeiten und Positionen von
`tom.seed@example.com` auf ein echtes Konto. Das `auth.users`-Konto wird
nie angefasst. `[cmd]` Wiederholbar geprueft — zweiter Lauf liefert
dieselben Zahlen, keine Dubletten.

| | vorher | nachher |
|---|---|---|
| Profilfelder gesetzt | 0 von 6 | 6 von 6 |
| Mahlzeiten | 0 | 172 |
| Positionen | 0 | 535 |
| Tage | 0 | 43 |
| Zielwerte | 0 | 1 |

Die eingefrorenen Naehrwerte werden unveraendert uebernommen (ADR-0003),
nicht neu gegen `food_nutrients` gerechnet. `gueltig_ab` bleibt wie in
der Vorlage — ein Ziel wirkt vorwaerts.

`[cmd]` Toms Passwort war unbekannt und der Magic-Link-Weg scheidet aus
(er liefert das Token als URL-Fragment, das der Server nicht sieht; die
App arbeitet mit Cookie-Sitzungen). Deshalb ist fuer `dev@lumeos.app`
ein Testpasswort gesetzt: **`LumeosDev2026`**. Aenderbar in den
Einstellungen.

### 3. „Ziele erreicht" heisst jetzt „Referenz gedeckt"

Der Befund aus dem Bericht oben, behoben. Zwei Aenderungen:

- **Beschriftung.** Das *Tagesziel* kommt aus `goals` und meint Kalorien
  und Makros; die Zahl daneben zaehlt *Naehrstoffe* gegen ihre
  Referenzwerte. Unter einem Namen las sich das am 02.08. als „Ziele
  erreicht 15/30" an einem Tag ganz ohne Tagesziel.
- **Nenner.** Gezaehlt werden nur noch Zeilen mit Richtung `target`.
  Bei einer Obergrenze ist „erreicht" keine sinnvolle Frage — dort hiesse
  es „ueberschritten", das Gegenteil. `[cmd]` Am 16.08. sinkt der Nenner
  dadurch von 32 auf 20.

Die Kachel-Frage aus G-05 (zwoelf Kacheln mit Attrappen gegen drei echte
plus Lueckenkarte) bleibt unberuehrt — die liegt bei Tom.

### Nachweise

| Pruefung | Ergebnis |
|---|---|
| Dev-Server | `[cmd]` PID 30768, Port 3200, liefert „REFERENZ GEDECKT" |
| Angemeldet als `dev@lumeos.app` | `[cmd]` Tagebuch 8 Positionen sichtbar, 0 Seitenfehler |
| Dashboard 16.08. | `[cmd]` Mahlzeiten 4, Referenz gedeckt 15/20, Ueber Grenze 3; Ringe 95 % / 98 % / 79 % / 94 % |
| Dashboard 05.08. | `[cmd]` 2/21, Ueber Grenze 1 (Vitamin A); Ringe 12 % / 6 % / 19 % / 1 % |
| Dashboard 13.08. | `[cmd]` 12/16, Ueber Grenze 2; Ringe 103 % / 76 % / 104 % / 98 % |
| `testdaten-pruefen.ts` live | `[cmd]` „OK: C-82 Testdaten stimmen." — 3/3/3, 512 Mahlzeiten, 1560 Positionen |
| `pnpm gate` | `[cmd]` 8 von 8, ungecacht |
| `pnpm test` | `[cmd]` 182 Tests, 182 bestanden, ungecacht |
| Sicherung | `[cmd]` `backup/schema/20260816_vor_testdaten_live.sql`, `--schema-only`, 439 KB |
