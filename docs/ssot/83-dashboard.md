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

> **ÜBERHOLT seit 2026-08-16.** Tom hat entschieden: **zwölf Kacheln,
> neun als Attrappe gekennzeichnet.** Der Abschnitt bleibt als Beleg,
> welche Begründung vorlag und woran sie scheiterte — der Denkfehler ist
> im zweiten Nachtrag benannt. Was heute gilt, steht dort.

Der Auftrag stellte zwei Möglichkeiten zur Wahl. **Gewählt war (a): nur
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

> **Überholt:** Die neun Kacheln sind seit dem zweiten Nachtrag da, als
> Attrappe gekennzeichnet. Die Tabelle unten steht weiterhin richtig —
> sie ist jetzt die Liste dessen, was jede Attrappe zum Verdrahten
> braucht, und steht so auch als `BRAUCHT` im Code.

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


---

## Nachtrag 2026-08-16 (2): nach der Vorlage gebaut

Die Kachelfrage aus G-05 ist von Tom entschieden — **zwoelf Kacheln, neun
als Attrappe gekennzeichnet.** Der Denkfehler in meiner Begruendung ist
benannt: *„eine Marke nimmt einer Zahl nicht ihre Wirkung"* ist ein
Argument ueber Endnutzer. Auf einem Stand, den nur Tom sieht, gibt es
diesen Endnutzer nicht — und wer die unfertigen Kacheln weglaesst, nimmt
genau die Anzeige weg, die das Design liefern soll.

Der Unterschied zum Ring ohne Ziel bleibt bestehen und ist gebaut:

| | |
|---|---|
| Ring ohne Ziel | eine Zahl, die aussieht wie gemessen, **ohne Kennzeichnung** — bleibt verboten |
| Attrappenkachel | eine Flaeche, die **sagt, dass sie noch nichts weiss** |

### Die Marke ist der Fortschrittsbalken

Gebaut als Requisite an `Card`: `attrappe={grund}`. Sie erzeugt drei
Dinge — die Marke „Attrappe" im Kopf, den gestrichelten Rahmen und den
Satz, **woran es haengt**. Verdrahten heisst: Requisite entfernen.

`[cmd]` Gegen das stille Verschwinden steht
`apps/web/src/components/shell/__tests__/v2-attrappen.test.ts` mit fuenf
Pruefungen: alle Vorlage-Kacheln vorhanden, Anzahl der Marken gleich der
Anzahl fehlender Quellen, sieben Tabs, drei Begleitkarten, und der
`Nutrition score` ohne erfundenen Wert. **Gegengeprobt:** eine Marke
entfernt → Test rot mit „9 Kacheln haben keine Datenquelle, aber 8 sind
gekennzeichnet"; danach zurueckgesetzt → gruen.

### Bildschirmfoto-Vergleich: Dashboard

`[cmd]` Vorlage `theme-v1/module-dashboard.jsx` gegen `/v2`.

| Vorlage | Umsetzung | Abweichung und Grund |
|---|---|---|
| Kopf „Today · Sat · May 16 · Streak 23d" | „Today", Datum als Pille | **Streak entfaellt** — es gibt keine Serienzaehlung. Waere eine erfundene Zahl im Kopf, wo keine Marke hinpasst. |
| KPI Recovery 82 | „—" + Attrappe | Schema `recovery` fehlt |
| KPI Training Load 2.142 TSS | „—" + Attrappe | keine Trainings-Sitzungen |
| KPI Calories 1.847 / 2.700 | **echt**, aus `daily_summary` + `zielwerte_am` | — |
| KPI Sleep 7:42 | „—" + Attrappe | keine Schlafdaten |
| Raster 1.4fr / 1fr | gleich | unter 1100 px gestapelt (`@media`) — der Entwurf hat null `@media`-Regeln, die Anpassung ist nach G-02 erlaubt |
| Today's flow (Zeitstrahl) | Attrappe | `meals` fuehrt nur `entry_date`, keine Uhrzeit |
| Macros · today | **echt** | — |
| Activity (Ereignisstrom) | Attrappe | keine Ereignisse mit Zeitstempel |
| Readiness (Ring + fuenf Balken) | Aufbau steht, Werte „—" + Attrappe | Ring auf 0, Balken leer — **keine erfundenen 82/84/78** |
| Body battery (Kurve) | Attrappe | dieselbe Quelle wie Readiness |
| Tonight (Push B, drei Felder) | Aufbau steht, „Keine Einheit geplant" + Attrappe | keine Trainingsplanung |
| PR watch (drei Lifts) | Attrappe | keine Trainings-Sitzungen |
| — | **zusaetzlich:** Naehrstoffdeckung, Energie letzte sieben Tage | Aus G-05 uebernommen. Die Vorlage hat sie nicht; sie tragen aber die C-48-Aussagen, ohne die das Dashboard nur eine einzige echte Zahl haette. **Das ist eine Abweichung nach oben und gehoert Tom zur Entscheidung.** |

### Bildschirmfoto-Vergleich: Nutrition

`[cmd]` Vorlage `theme-v1/module-nutrition.jsx` und
`uploads/pasted-1786754205537-0.png` gegen `/v2/nutrition`.

| Vorlage | Umsetzung | Abweichung und Grund |
|---|---|---|
| Kopf „Nutrition · Sat · May 16 · 138-nutrient tracking" | gleich, Datum als Pille | — |
| Herkunftszeile „BLS 4.0 · Max Rubner-Institut" | gleich | — |
| Aktionen: ‹ › Quick-add, Recalc macros, Find food, MealCam | **‹ › und „Lebensmittel suchen"** | Quick-add, Recalc und MealCam oeffnen Modale, die es nicht gibt. Ein Knopf ohne Ziel ist schlimmer als kein Knopf — **gemeldet, nicht gebaut.** |
| Sieben Tabs | gleich, gleiche Reihenfolge | Zaehler: Diary aus `meal_count`, Nutrients fest 138 (BLS-Naehrstoffe, keine Tagesgroesse) |
| Tab-Zustand in `useState` | in der Adresse (`?tab=`) | Die Tagesdaten laden serverseitig. Mit lokalem Zustand muesste entweder alles in den Browser (dann liest die Seite mit fremder Identitaet) oder jeder Tab braeuchte eine Route (dann waeren wir wieder bei den Untereintraegen). Nebenwirkung dafuer: ein Tab ist verlinkbar. |
| Sidebar-Untereintraege | **entfallen** | Die Vorlage hat keine. `[cmd]` Im Browser gezaehlt: 0. |
| Diary-Raster 1.5fr / 1fr | gleich | wie oben gestapelt unter 1100 px |
| links: Ring + Makrobalken, Mahlzeitenkarten | gleich, Mahlzeiten aus C-03 (mit Schreibweg) | — |
| rechts: Smart suggestions | Attrappe | keine Musterauswertung |
| rechts: Nutrition score `1`, Schwelle ok ≥ 80 | Ring auf **0**, Beschriftung **„—"**, Attrappe | `[read]` Auftrag: „Als Attrappe zeigen, keinen Wert erfinden." Die 1 aus dem Entwurf zu uebernehmen waere eine erfundene Messung. Gewichtung ist C-49. |
| rechts: Pending actions | Attrappe | Regeln ueber mehrere Module, Buddy ist Attrappe |
| rechts: Micronutrient snapshot | **echt** — „Deckung je Naehrstoff" | — |

**Abweichung ohne technischen Grund: keine.** Die drei oben (Streak,
Modalknoepfe, die zwei Zusatzkarten) sind benannt und liegen bei Tom.

### Was dabei aufgefallen ist

`[cmd]` Die Makroringe zeigten `2.371,95` in einem 84-px-Ring — die Zahl
stand ueber dem Rand. Behoben in `ProgressRing`: ab 10 ohne
Nachkommastelle, darunter eine (sonst wuerden 0,8 g Salz zu „1"). Die
genaue Zahl steht weiter in der Tagessumme.

### Nachweise

| Pruefung | Ergebnis |
|---|---|
| Angemeldet als `dev@lumeos.app` | `[cmd]` ja, nicht als test-user |
| Kacheln auf `/v2` | `[cmd]` 4 KPI + 8 Karten = **12 der Vorlage, 9 gekennzeichnet**, dazu 2 Zusatzkarten aus G-05 |
| Tabs auf `/v2/nutrition` | `[cmd]` `["Diary 4","Insights","Nutrients 138","Food DB","Meal plans","Preferences","Planner"]` |
| Sidebar-Untereintraege | `[cmd]` 0 |
| Jeder Tab einzeln | `[cmd]` insights/nutrients/plans/prefs/planner je 1 Attrappe, foods verlinkt die Suche |
| Szenariotage im Browser | `[cmd]` 16.08. (15/20, 3 ueber Grenze) · 05.08. (2/21, Vitamin A) · 13.08. (12/16, 2) · 02.08. (**ohne Tagesziel**: Ringe ohne Prozent) |
| Drei Breiten, beide Seiten | `[cmd]` 1600 / 1100 / 800 px, kein Ueberlauf |
| `/nutrition` unveraendert | `[cmd]` 0 `v2-`-Elemente, `lume-shell` vorhanden |
| Seitenfehler | `[cmd]` 0 |
| `pnpm gate` | `[cmd]` 8 von 8, ungecacht |
| `pnpm test` | `[cmd]` **188** Tests (183 + 5 neue), 0 fehlgeschlagen |


---

## Nachtrag 2026-08-16 (3): die Vorlage als Mockup uebernommen

`[read]` Tom: *„Wieso holen wir nicht einfach das ganze Template als
Mockup rein und binden dann an?"* — gemacht.

### Was uebernommen ist

| Vorlage | Ziel | Umfang |
|---|---|---|
| `module-dashboard.jsx` | `/v2/dashboard` | 12 Kacheln, alle Entwurfszahlen |
| `module-nutrition.jsx` (Diary) | `/v2/nutrition` | Kopf, 7 Tabs, Tagesstreifen, 7 Begleitkarten |
| `module-nutrition-nutrients.jsx` | Tab `Nutrients` | 79 Naehrstoffe, 8 Gruppen, Detailfenster |
| `shared.jsx` | `packages/ui` | `RadarChart` ergaenzt (fehlte als einziges) |

Die erfundenen Daten stehen unveraendert da: `1.847 kcal`,
`Recovery 82`, `2.142 TSS`, `Sleep 7:42`, `Readiness 84`, PR watch,
Tonight, `Pre-workout 68`, `Hydration 1.2 / 3.0 L`, das Netzdiagramm,
`Below threshold`. **Der Nutrition score steht auf `1`** — er kommt aus
der Formel der Vorlage (`module-nutrition-spec.jsx:38-42`,
protein 0.30 / calorie 0.25 / carbs 0.15 / fat 0.15 / fiber 0.15, mal
Stufenfaktor). Der leere Ring aus dem vorigen Durchgang ist
zurueckgenommen.

`[cmd]` Der Naehrstoffbaum ist mechanisch aus der Vorlage extrahiert
(Zeile 11-442 → `nutrient-baum.ts`), nicht abgetippt. Ein Test zaehlt
79 Eintraege und 8 Gruppen.

### Was angebunden ist

| Kachel | Quelle | Marke |
|---|---|---|
| Dashboard „Macros · today" | `daily_summary` + `goals.zielwerte_am` | **weg** |
| Diary-Tagesstreifen (Ring + 3 Balken) | dieselben | **weg** |
| Mahlzeitenkarten | `meals`, `meal_items` (C-03, mit Schreibweg) | **weg** |
| „Deckung je Naehrstoff" | `daily_reference_assessment` | **weg** |
| Suche (`Find food`) | `food_search`, `foods_portions` | **weg** |

Alle uebrigen behalten Marke und Entwurfszahlen.

**Hydration geprueft, nicht angebunden.** `[cmd]` `hydration.water_logs`
und `hydration_summary` existieren — aber es gibt keinen Schreibweg in
der Oberflaeche und keine gelesene Zeile. Die Kachel bliebe auf 0, was
schlechter waere als der Entwurf. Der `+250ml`-Knopf sagt das im Modal.

### Knoepfe ohne Ziel

`packages/ui/src/in-entwicklung.tsx` — **einmal**, wie verlangt. Modal im
Stil des Themes, `Escape` schliesst. Benutzt von: Week, Export, Log,
Filter, Mehr, All events, Start, Quick-add, Recalc macros, MealCam, den
Aktionsknoepfen der Vorschlaege und Pending actions, Export/Filter im
Naehrstoffbaum, „Why this?", „30-day trend", „Find foods rich in …".

### Bildschirmfoto-Vergleich: jede Abweichung

| Stelle | Vorlage | Umsetzung | Grund |
|---|---|---|---|
| Route Dashboard | eine Datei, `setActive` | `/v2/dashboard`, `/v2` leitet um | **technisch** — hier gibt es Routen |
| Tab-Zustand | `useState` | `?tab=` in der Adresse | **technisch** — die Tagesdaten laden serverseitig |
| Diary-Makrolabel | `width: 56` | `minWidth: 56` | **technisch** — „Kohlenhydrate" ist laenger als „Carbs" und lief in die Zahl |
| `btn-sm` | in vier Kacheln benutzt | Regel ergaenzt | **[cmd] die Vorlage definiert die Klasse nirgends** in `styles.css`. Werte aus dem Augenmass der Umgebung — die Vorlage ist hier unvollstaendig. |
| `@media` | keine | drei Haltepunkte | **technisch**, wie in G-02 vereinbart |
| Modul-Kopf Nutrition | `module-header module-hero-lite` | gleich | Der vorige Durchgang benutzte `ModuleHero` aus G-02 — ein anderer Kopf mit Medaillon. Er quetschte den Titelblock in eine schmale Spalte. **Behoben.** |
| Diary-Tagesstreifen | **ein** Kalorienring + **drei** lineare Balken | gleich | Der vorige Durchgang hatte vier Ringe. **Zurueckgenommen.** |
| Sprache | englisch | englisch belassen | Die uebernommenen Kacheln behalten ihre Beschriftung — wer sie eindeutscht, kann sie nicht mehr danebenlegen. Die angebundenen Teile (Tagessumme, Erfassen) sind weiter deutsch. |
| Dashboard-Kopf | Datum „Sat · May 16" | uebernommen | Entwurfsdatum, keine Anbindung |

**Ohne technischen Grund weicht nichts ab.**

### Was in der Vorlage auffiel

`[cmd]` `module-nutrition.jsx` fuehrt sieben Tabs, das
Bildschirmfoto `uploads/pasted-1786754205537-0.png` zeigt fuenf und
`117-nutrient tracking` statt 138. Das Foto ist aelter als die Datei —
gebaut ist nach der Datei.

### Nachweise

| Pruefung | Ergebnis |
|---|---|
| Angemeldet als `dev@lumeos.app` | `[cmd]` ja |
| `/v2/dashboard` | `[cmd]` 11 Kacheln + 4 KPI, 10 als Attrappe, „Macros · today" angebunden |
| `/v2/nutrition` Diary | `[cmd]` 13 Kacheln, 7 als Attrappe |
| `/v2/nutrition?tab=nutrients` | `[cmd]` 8 Gruppenkarten, „79 nutrients tracked", Kennzahlen 79/55/24/0 |
| Modal „in Entwicklung" | `[cmd]` oeffnet, schliesst mit Escape |
| Drei Breiten, drei Seiten | `[cmd]` 1600 / 1100 / 800 px, kein Ueberlauf |
| `/nutrition` unveraendert | `[cmd]` 0 `v2-`-Elemente, `lume-shell` vorhanden |
| Seitenfehler | `[cmd]` 0 |
| `pnpm gate` | `[cmd]` 8 von 8, ungecacht |
| `pnpm test` | `[cmd]` 189 Tests, 0 fehlgeschlagen |
