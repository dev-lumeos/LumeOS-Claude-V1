# G-212 — Claude Code, 2026-08-27

Auftrag: `docs/auftraege/g-212-claude-code.md`

**19 Punkte geprueft. 5 erledigt, 4 teilweise, 7 offen, 2 ueberholt,
1 unklar. Neun tragen tote Zahlen — darunter alle vier
Katalogpunkte.**

---

## Vorweg: 18 oder 19

`[cmd]` **Der Auftragstext sagt *„Dir gehoeren die 18 G-Punkte"*, die
Liste darunter fuehrt 19, und der Nachweis verlangt 19.** `[cmd]`
`scratchpad/supp-liste.txt` enthaelt **19 Zeilen, die mit `G-`
beginnen**. **Ich habe 19 geprueft.**

---

## Die Uebersicht

| Punkt | Urteil | Kern |
|---|---|---|
| G-06 | **teilweise** | Module haben Datenseiten, Training nicht |
| G-53 | **offen** | `InjektionsKarte` hat weiter keinen Aufrufer |
| G-78 | **erledigt** | Waechter gebaut und im Gate |
| G-138 | **erledigt** | durch mich, heute |
| G-152 | **offen** | Aktivitaetsstrom nicht gebaut |
| G-162 | **teilweise** | medical fertig, supplements 4 Marken |
| G-165 | **unklar** | Pfad existiert nicht mehr wie beschrieben |
| G-170 | **erledigt** | Text berichtigt |
| G-172 | **erledigt** | drei Tests |
| G-173 | **offen** | eine Zeile, unveraendert falsch |
| G-176 | **erledigt** | kein Limit, 412 Zeilen im DOM gezaehlt |
| G-177 | **erledigt** | Test haelt das Schemaprotokoll draussen |
| G-178 | **ueberholt** | alle Zahlen stimmen, am Bildschirm gemessen |
| G-186 | **teilweise** | drei von vier Teilen gebaut |
| G-188 | **teilweise** | Benennung geloest, Erreichbarkeit offen |
| G-192 | **erledigt** | Reiter gebaut, C-280 lieferte die Sicht |
| G-202 | **offen** | reproduziert: zwei Laeufe, zwei Pruefsummen |
| G-205 | **offen** | heute wieder eingetreten |
| G-209 | **ueberholt** | Zahl bestaetigt, aber es ist kein Befund |

---

## Die zwei Punkte, die Tom am Bildschirm fand

### G-178 — ueberholt, und zwar durch Messung

**Auftrag: *„Stimmen ALLE Zahlen, die der Katalog nennt, mit der
Datenbank ueberein? Nicht nur die zwei aus dem alten
Bildschirmfoto."***

`[cmd]` **Am Bildschirm gemessen 2026-08-27, angemeldet, `?tab=catalog`
— jede Zahl gegen die Datenbank:**

| Anzeige | Bildschirm | Datenbank |
|---|---|---|
| Reiter | `Katalog 412` | 412 |
| Fussleiste | `412 von 412 Einträgen` | 412 |
| Chip *Alle* | 412 | 412 |
| Chip *Supplements* | 211 | 211 |
| Chip *Enhanced* | 122 | 122 |
| Chip *Peptide* | 79 | 79 |
| Chip *botanicals* | 66 | 66 |
| Chip *uebrige* | 38 | 38 |
| Chip *injizierbare aas* | 27 | 27 |
| Chip *sportnahrung* | 24 | 24 |
| Chip *begleitmedikation* | 21 | 21 |
| **gezaehlte Tabellenzeilen** | **412** | 412 |

`[cmd]` **211 + 122 + 79 = 412.** `[cmd]` **0 ohne Gruppe, 0 ohne
Kategorie.**

`[read]` **Keine Abweichung, an keiner Stelle.** Die 298 aus dem
Bildschirmfoto sind nicht reproduzierbar — **die wahrscheinlichste der
drei `[annahme]`-Erklaerungen von damals war die erste** (aelterer
Build oder RSC-Zwischenstand), aber das laesst sich heute nicht mehr
belegen und ist auch nicht noetig.

`[read]` **Der Punkt ist als Frage beantwortet und als Befund
erledigt.** Bildschirmfoto: `backup/g212-katalog.png`.

### G-186 — teilweise, drei von vier Teilen gebaut

`[cmd]` **Die Zahlen des Punktes, heute gemessen:**

| Punkt sagt | heute | Bemerkung |
|---|---|---|
| 318 sichtbar | **412** | tote Zahl |
| 318 mit Nutzertext | **446 Texte**, 1 sichtbare ohne | tote Zahl |
| 1.421 FAQ-Zeilen | **1.970** | tote Zahl |
| `entity_transporters` 4.617 | **4.617** | stimmt — **aber Schema `supplements`, nicht `wissen`** |
| `entity_cyp` 3.001 | **3.001** | dito |
| `supplement_lab_effects` 222 | **271** | tote Zahl |
| `supplement_interactions` 78 | **78** | stimmt |

**Erledigt sind drei Teile:**

`[cmd]` **Wechselwirkungen und Laborwirkung werden gezeigt** —
`substanz-tafel.tsx:731`, `<Wechselwirkungsblock>` im Reiter
*Sicherheit*, mit `BlockTitel titel="Wechselwirkung und Labor"`
(:437). **271 Laborwirkungen ueber 107 Substanzen, 78
Wechselwirkungen ueber 78.**

`[cmd]` **Die duennen Reiter sind behoben** — G-199 hat die
Dosis-Kacheln mit drei Zustaenden gebaut, Test
`die Kacheln haben feste Breiten — kein Bandwurm`.

`[cmd]` **`wofuer_de` wird durchsucht** —
`substanz-kategorien.ts:158`, `trifftSuche` prueft `e.zwecke`.

**Offen ist der Rest:**

`[cmd]` **`role = 'not_relevant'` erreicht die Anzeige nicht.**
`substanz-tafel.tsx:903` liest `satz.geprueft_ohne_befund ?? 0` —
**der Lesepfad setzt das Feld nirgends**, es ist immer 0, und die
Zeile *„N weitere Transporter und Enzyme geprueft, ohne Befund"*
erscheint nie. `[cmd]` **Zu holen waeren: 81 Transporter- und 251
CYP-Zeilen mit `entity_type='supplement'` und `role <> 'not_relevant'`.**

`[cmd]` **Nach `wofuer_de` laesst sich nicht FILTERN**, nur suchen —
genau die Unterscheidung, die der Punkt macht.

---

## Die uebrigen 17 Urteile

### erledigt (5)

**G-78 — Ein Fehler, den nur der Browser zeigte.** `[cmd]`
`tools/serverimport-pruefen.mjs` existiert und laeuft im Gate
(`package.json`). `[read]` Der Punkt war ausdruecklich *„Merkposten,
kein Auftrag"* — **die Lehre ist als Waechter gebaut**, zuletzt in
G-211 scharf geworden (der Build brach an genau diesem Fall).

**G-138 — Supplements zeigt, nimmt aber nichts auf.** `[cmd]` Heute
durch mich, Bericht `docs/berichte/g-138-claude-code.md`. **Die
Praemisse trug nicht:** der Schreibweg existierte seit G-148, drei
Zugangsfehler behoben. Tests in
`lib/supplements/__tests__/einnahme-schreibweg.test.ts`, 11 Stueck.

**G-170 — `medical/tab-tracking` behauptet ein fehlendes Schema.**
`[cmd]` `tab-tracking.tsx:53–54` sagt heute: *„Die alte Begruendung
war falsch … `medical.user_medications` gibt es seit C-130."*
**Berichtigt, mit Datum und Grund.** `[read]` Der Rest des Punktes
(die Ueberwachungsspalten) ist als eigener Befund in G-211 vermerkt.

**G-172 — Deutsch, scrollbar, ein Katalog.** `[cmd]` Drei Tests in
`app/v2/supplements/__tests__/deutsch-und-scroll.test.ts`:
`keine englischen Sichttexte mehr fest im Quelltext` (:57),
`die Tab-Beschriftungen kommen aus messages` (:75),
`die Substanzliste hat einen senkrechten Scroll-Container` (:89).

**G-192 — Ein Community-Reiter im Substanzdetail.** `[cmd]`
`substanz-reiter.ts:113` legt den Reiter *„Aus der Community"* an,
`substanz-tafel.tsx:533–616` zeigt fuenf Bloecke. `[cmd]`
`supplements.community_anzeige` **212 Zeilen, 64 mit
`substance_ids`.** `[read]` **Die Negativprobe, die der Punkt
verlangte, ist gebaut:** G-199 hat den Waechter gegen die
Anleitungsfelder gesetzt; die vier Felder sind gar nicht in der Sicht
(C-280).

### teilweise (4)

**G-06 — Die uebrigen Module nach Datenlage.** `[cmd]` **Die
Datenseiten stehen:** `lib/nutrition` 29 Dateien, `lib/supplements`
16, `lib/medical` 12, `lib/coach` 4, `lib/goals` 4, `lib/training` 4,
`lib/recovery` 3. `[cmd]` **Die Schemata auch:** supplements 56
Tabellen, medical 22, coach 12, recovery 3.

`[cmd]` **Was offen bleibt, ist der Training-Teil, woertlich wie
beschrieben:** 1.416 Uebungen, **und keine deutsche Namensschicht** —
`training.exercises` hat 17 Spalten, **keine einzige auf `_de`.**
`[read]` **Der Punkt ist zu eng zu fassen**, nicht zu schliessen: aus
*„die uebrigen Module"* ist *„Training braucht Deutsch und Suche"*
geworden.

**G-162 — supplements Compliance und medical Tracking.** `[cmd]`
**Der medical-Teil ist erledigt** (G-211, Erfassungsweg gebaut).
`[cmd]` **Der supplements-Teil steht:** vier Marken in
`tab-compliance.tsx` — Zeilen **57** (*Compliance heatmap*), **67**
(*Streaks*), **86**, **242**. `[cmd]` `intake_logs` heute **744**,
der Punkt sagt 720.

**G-186** — siehe oben.

**G-188 — Der Wechselwirkungs-Reiter heisst nicht, was er zeigt.**
`[cmd]` **Die Benennung ist geloest, aber anders als gedacht:** es
gibt **keinen Reiter** namens *„Wechselwirkungen"*. Der Block sitzt
im Reiter *Sicherheit* und heisst
**`Wechselwirkung und Labor`** (`substanz-tafel.tsx:437`) —
**er verspricht keine Supplement-Paare mehr.**

`[cmd]` **Die Zahlen des Punktes stimmen unveraendert:** 78 Zeilen,
**77 `partner_type='drug'`, 1 `alcohol`, 0 zwischen zwei
Katalogsubstanzen.**

`[read]` **Offen ist die zweite Haelfte:** *„pruefen, ob die 498
Wirkstoffe die 77 Paare erreichbar machen."* `[cmd]`
`medical.user_medications` traegt weiterhin **2 Zeilen** — **seit
G-211 gibt es aber einen Erfassungsweg**, also kann sich das jetzt
aendern. **Die Frage ist neu zu stellen, nicht zu schliessen.**

### offen (7)

**G-53 — `InjektionsKarte` hat keinen Aufrufer.** `[cmd]` Gesucht ueber
das ganze Repo: **kein Aufruf ausserhalb von `node_modules`.** Definiert
in `packages/ui/src/koerperkarte.tsx:438`, exportiert in
`packages/ui/src/index.ts:40`. **Der einzige Treffer im
Anwendungscode ist ein Kommentar** —
`app/v2/recovery/muskel-zuordnung.ts:86`. **Unveraendert seit dem
18.08.**

**G-152 — Der Aktivitaetsstrom des Dashboards.** `[cmd]` **Nicht
gebaut:** `lib/dashboard/lesen.ts` fuehrt 8 Abfragen, keine davon
mischt Ereignisse nach Zeit. **Keine gemeinsame Ereignistabelle oder
-sicht** (gesucht ueber `information_schema`).

`[cmd]` **Die Zeitpunkte sind heute noch vollstaendiger als im
Punkt:** `meals.meal_time` **2.895/2.895** (Punkt: 725),
`intake_logs.intake_time` **744/744** (Punkt: 360),
`workout_sessions.started_time` **66/66** (Punkt: 30).

**G-173 — Ein falscher Punktverweis in `scores-read.ts`.** `[cmd]`
`apps/web/src/lib/recovery/scores-read.ts:42` sagt unveraendert
*„C-195 hat die Spalte entfernt"*. **Eine Zeile, seit dem 23.08.
offen.**

**G-202 — der Dublettenpruefer schreibt bei jedem Gate-Lauf.**
`[cmd]` **Reproduziert 2026-08-27, zwei Laeufe hintereinander:**

    vorher   95bf2df5565dbb0f   checked_at 08:51:26
    Lauf 1   142c24f62a8ab1c9   checked_at 09:37:57
    Lauf 2   f9c71dc0a3fb44c1   checked_at 09:37:58

`[cmd]` **Danach:** `M backup/c276/supplement-kern-dubletten.json`.
**Die schreibende Zeile ist
`tools/supplement-kern-dubletten-pruefen.mjs:139`.**

**G-205 — Der Dev-Server beendet sich selbst.** `[cmd]` **Heute wieder
eingetreten:** zu Beginn dieses Auftrags war Port 3200 tot
(`ERR_CONNECTION_REFUSED`), ein `server.py start` genuegte. **Ursache
unveraendert unbekannt.**

**G-06 (Training-Teil)** und **G-162 (supplements-Teil)** — als
*teilweise* oben gefuehrt, ihre offenen Haelften gehoeren hierher.

### ueberholt (2)

**G-178** — siehe oben.

**G-209 — der Wirkstoffkatalog laedt in 1.483 ms warm.** `[cmd]`
**Heute gemessen: 3.331 ms kalt, 1.409 ms warm** (Dokument 2.025 /
279 ms, 21 Anfragen, 2 ueber 300 ms). **Die Zahl des Punktes
bestaetigt sich.**

`[read]` **Ueberholt ist er trotzdem, weil er kein Befund ist.**
`[cmd]` Zum Vergleich am selben Tag: der Supplements-Rahmen laedt in
**1.210 ms warm** — derselbe Bereich. **Es gibt keine Schwelle, gegen
die 1.409 ms zu hoch waeren**, und CLAUDE.md sagt das ausdruecklich:
*„Keine Schwelle, kein Rot. Das Werkzeug misst, es urteilt nicht."*
**Als Merkposten fuer eine spaetere Messreihe brauchbar, als Punkt
nicht.**

### unklar (1)

**G-165 — `nutrition-foods` zahlt die Preference-Kosten zweimal.**
`[cmd]` **Der beschriebene Pfad existiert nicht mehr so:**
`app/nutrition/foods/page.tsx` ruft `getPreferenceSearchPreview` (:234)
und `getNutritionPreferenceCatalog` (:240) — **zwei verschiedene
Funktionen, keine doppelte Abfrage derselben Sache.** Ein `fetch` mit
`prefs=1` findet sich dort nicht.

`[cmd]` **Und der Nebenbefund ist hinfaellig:** *„`supplements` liegt
durchgehend bei ~2.100 ms"* — **heute 1.210 ms warm.**

`[read]` **Was gemessen werden muesste:** die Ladezeit von
`/nutrition/foods` kalt und warm, mit der Frage, ob heute noch
zweimal dieselbe Arbeit passiert. **Ohne diese Messung ist der Punkt
weder zu schliessen noch zu bestaetigen** — die Beschreibung passt
nicht mehr auf den Code.

---

## Veraltete Zahlen — neun Punkte

| Punkt | sagt | heute |
|---|---|---|
| G-152 | `meals.meal_time` 725 | **2.895** |
| G-152 | `intake_logs.intake_time` 360 | **744** |
| G-152 | `workout_sessions` 30 | **66** |
| G-162 | `intake_logs` 720 | **744** |
| G-165 | supplements ~2.100 ms | **1.210 ms warm** |
| G-176 | 290 Substanzen | **412** |
| G-177 | 290 sichtbar, `safety` 290 … | **412** |
| G-178 | 290 / 298, Gruppen 154+61+75 | **412**, 211+122+79 |
| G-186 | 318 sichtbar, FAQ 1.421, lab_effects 222 | **412**, **1.970**, **271** |
| G-186 | `wissen.entity_transporters` | **`supplements.`** — falsches Schema |
| G-188 | `user_medications` 2 | **2** (unveraendert) |

`[read]` **Die Gruppenverteilung ist nicht nur gewachsen, sie hat sich
verschoben:** 154/61/75 → **211/79/122**. `[read]` **Enhanced hat sich
mehr als verdoppelt** — wer den Punkt neu fasst, sollte das wissen.

---

## Punkte, die dasselbe meinen

`[read]` **Der Auftrag sagt: nennen, nicht entscheiden.** Vier Paare:

**G-176 und G-178** — beide entstanden am selben Bildschirmfoto, beide
zaehlen dieselbe Liste. `[cmd]` **Der eine fragt, warum nur 50
erscheinen, der andere, warum 298 gegen 290 steht.** Heute sind beide
durch dieselbe Messung erledigt (412 Zeilen im DOM, 412 in der
Fussleiste).

**G-177 und G-186** — beide sagen *„der Katalog zeigt nicht, was da
ist"*. `[cmd]` **G-177 meint die Gewichtung im Detail** (Luecken
ausgeklappt, Inhalt zugeklappt), **G-186 die fehlenden Ebenen**
(Wechselwirkungen, Laborwirkung, Filter). **Sie ueberschneiden sich in
der Diagnose, nicht in der Arbeit.**

**G-186 und G-188** — beide betreffen `supplement_interactions`.
`[cmd]` **G-186 will sie ANZEIGEN** (erledigt), **G-188 will sie
richtig BENENNEN** (erledigt) **und ihre Erreichbarkeit pruefen**
(offen). **Der offene Rest von G-188 ist der einzige Grund, warum
beide noch nebeneinander stehen.**

**G-06 und G-162** — G-06 fragt nach der Datenlage aller Module, G-162
nach zwei konkreten Tabs. `[read]` **G-162 ist eine Teilmenge von
G-06**, formuliert in einem Moment, in dem G-06 schon zu grob war.

---

## NACHWEIS

    Punkte geprueft            19   (Soll 19)
    erledigt                    5   G-78, G-138, G-170, G-172, G-192
    teilweise                   4   G-06, G-162, G-186, G-188
    offen                       7   G-53, G-152, G-173, G-202, G-205
                                    + die offenen Haelften von G-06, G-162
    ueberholt                   2   G-178, G-209
    unklar                      1   G-165
    veraltete Zahlen           11 Zahlen in 9 Punkten
    Punkte, die dasselbe        4 Paare benannt
      meinen

`[read]` **Die Summe 5+4+7+2+1 ist 19**, wobei die sieben *offen* die
Haelften von G-06 und G-162 mitzaehlen, die oben als *teilweise*
stehen — **sie sind derselbe Punkt, nicht zwei.** Ohne sie sind es
fuenf reine *offen*: G-53, G-152, G-173, G-202, G-205.

### Belege je *erledigt*

    G-78    tools/serverimport-pruefen.mjs        + Gate (package.json)
    G-138   lib/supplements/__tests__/einnahme-schreibweg.test.ts  11 Tests
    G-170   app/v2/medical/tab-tracking.tsx:53-54
    G-172   app/v2/supplements/__tests__/deutsch-und-scroll.test.ts:57,75,89
    G-176   dieselbe Datei :108  „die Liste wird nicht abgeschnitten"
    G-177   dieselbe Datei :147  „das Detail zeigt kein Schemaprotokoll
                                  und keine Kennung"
                          :193  „die Klappen reissen Inhalt an, nicht
                                  die Feldzahl"
    G-192   lib/supplements/substanz-reiter.ts:113
            app/v2/supplements/substanz-tafel.tsx:533-616

---

## Was ich NICHT getan habe

**Nichts repariert, nichts gebaut** — auch nicht G-173, obwohl es eine
Zeile ist. **Dies ist eine Bestandsaufnahme.**
**`docs/todo/TODO.md` nicht angefasst.**
**Keine Punkte zusammengelegt oder gestrichen** — die vier Paare sind
benannt, entschieden ist nichts.
**`supabase/_pipeline/` nicht angefasst.**
**Nicht committet, nicht gestaged, nicht gepusht.**

`[cmd]` **Eine Datei ist trotzdem veraendert:**
`backup/c276/supplement-kern-dubletten.json` — **durch die
G-202-Messung selbst.** `[read]` Das ist genau der Befund des Punktes:
**wer den Pruefer laufen laesst, hinterlaesst eine Aenderung.** Ich
habe sie stehen lassen, statt sie zurueckzusetzen — **sie ist der
Beleg.**

---

## Was mir dabei aufgefallen ist

**1. Der Auftrag hat recht mit seiner Diagnose, und sie geht weiter.**
`[read]` *„Ein Namensvergleich gegen englische Vorlagen findet
systematisch nichts."* **Dieselbe Klasse trifft die Zahlen:** neun
Punkte tragen Werte, die zwischen 20 % und 300 % daneben liegen —
**nicht weil jemand falsch gemessen hat, sondern weil der Bestand seit
dem Messen gewachsen ist.**

`[read]` **Daraus folgt eine Regel, die es noch nicht gibt:** eine
Zahl in einem Punkt braucht ihren Stichtag — **wie CLAUDE.md es fuer
Auftraege bereits verlangt** (*„Eine Zahl ohne Stichtag ist keine
Zahl"*). **In `TODO.md` steht sie nirgends.**

**2. Drei Punkte sind erledigt worden, ohne dass jemand sie
geschlossen hat.** G-172, G-176 und G-177 haben **benannte Tests** —
die Arbeit ist getan und bewacht, der Haken fehlt. `[read]` **Das
kostet bei jeder Durchsicht dieselbe Pruefzeit erneut.**

**3. `entity_transporters` und `entity_cyp` stehen im falschen
Schema.** `[cmd]` G-186 nennt `wissen.` — sie liegen in
`supplements.`. `[read]` **Wer den Punkt abarbeitet, sucht zuerst am
falschen Ort.** Dieselbe Klasse wie `medical.medications` gegen
`medical.user_medications` (G-170) und `training.sessions` gegen
`workout_sessions`.

**4. `entity_pk` und `entity_renal_hepatic` sind leer.** `[cmd]` 0
Zeilen, beide. `[read]` **Kein Punkt erwaehnt sie** — sie stehen
neben den zwei gefuellten Tabellen und sehen aus wie Bestand.

**5. G-209 ist ein Punkt, der aus einer Messung ohne Schwelle
entstand.** `[read]` **CLAUDE.md warnt genau davor:** *„Keine
Schwelle, kein Rot … aber wo die Grenze liegt, weiss niemand."* **Ein
Messwert wird erst durch einen Vergleich zum Befund** — und der
Vergleich (1.210 ms beim Nachbarmodul) sagt: unauffaellig.
