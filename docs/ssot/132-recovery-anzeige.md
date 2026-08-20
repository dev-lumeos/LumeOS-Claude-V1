# 132 — Die Score-Anzeige liest aus der Tabelle

**Auftrag:** G-82 · **Stand:** 2026-08-20 · **Modul:** Recovery
**Vorher:** [127](127-recovery-checkins.md) (G-76, Browserrechnung) ·
[128](128-recovery-scores.md) (C-125, die 170 Zeilen)

**Kurz:** Die Anzeige rechnet den Erholungswert nicht mehr selbst, sie
liest ihn aus `recovery.scores`. **Die beiden Rechnungen stimmten nicht
überein** — über fünf gemessene Tage zwischen −7,0 und +2,6. Die
Tabelle ist die bessere Zahl, weil sie die gemessene Trainingslast
benutzt, wo es eine gibt; `score.ts` verwarf sie auf 118 von 170 Tagen.
`recovery.modality_log` ist angebunden, 89 Zeilen in vier Arten, alle
mit Bonus 0 und dem Vermerk `pending_c124_e5`.

---

## Ob die zwei Rechnungen übereinstimmen

**Nein.** Fünf Tage, dieselben Check-ins, beide Rechnungen
nebeneinander (`tools/g82-vergleich.mjs`, nur lesend):

| Tag | Tabelle | `score.ts` | Abweichung |
|---|---:|---:|---:|
| 2026-06-05 | 43,0 | 36 | **−7,0** |
| 2026-07-15 | 83,8 | 83 | −0,8 |
| 2026-09-01 | 79,4 | 82 | **+2,6** |
| 2026-10-20 | 79,4 | 82 | **+2,6** |
| 2026-11-06 | 79,4 | 82 | **+2,6** |

`[cmd]` **Die eine Referenzzahl des Auftrags stimmt, die andere
nicht.** C-125 nennt für den 2026-06-05 den Wert **43,0** — der steht
so in der Tabelle. G-76 nennt für den 2026-11-06 **82**; **die Tabelle
sagt 79,4.** Die 82 war nie eine gespeicherte Zahl, sondern das, was
die Browserrechnung an dem Tag ergab.

### Woher der Unterschied kommt

`[cmd]` Nicht aus verschiedenen Gewichten — der stabile Kern
30/15/15/10/15/10/5 ist in beiden derselbe. Der Unterschied ist,
**wie viele Anteile mitzählen**:

- **`score.ts` rechnet fünf von sieben Anteilen.** Trainingslast
  („braucht ACWR") und Ernährung („nicht im Check-in") liefern
  bewusst `null` und werden aus der Basis herausgenommen. Normiert
  wird auf **75** statt 100.
- **Die Tabelle rechnet alle sieben.** Beide Lücken sind mit
  Rückfallwerten gefüllt: Ernährung fest auf **7,0**
  (`nutrition_source = 'fallback_c123_e9'` auf allen 170 Zeilen),
  Trainingslast aus dem echten ACWR, wo einer vorliegt.

Am 2026-11-06: Tabelle 79,42 von 100 (davon Trainingslast 10,5 und
Ernährung 7,0), `score.ts` 82 aus einer Basis von 75.

**Das Vorzeichen dreht sich, und das ist der Punkt.** Ernährung
schlägt mit 7,0 von 10 zu Buche, also unter dem Durchschnitt der
übrigen Anteile — das zieht die Tabelle nach unten. Die Trainingslast
zieht mal hoch, mal runter: `training_load_points` läuft über
22 verschiedene Werte von 0 bis 15,0. Am 2026-06-05 fielen beide
Effekte zusammen und ergaben −7,0.

### Warum die Tabelle die bessere Zahl ist

`[cmd]` **118 von 170 Tagen tragen einen gemessenen ACWR**
(`acwr_used IS NOT NULL`), 52 nicht. `score.ts` wirft diese 118
Messungen weg und normiert sie fort; die Tabelle rechnet mit ihnen.
Eine Zahl, die vorhandene Messwerte ignoriert, ist die schwächere.

Dazu kommt, was eine Browserrechnung grundsätzlich nicht kann: **Die
Tabelle ist ein Schnappschuss.** Sie trägt je Tag alle Einzelterme,
die benutzte Schlafdauer, den Soreness-Schnitt samt Zahl der
gemeldeten Muskeln, den ACWR und die Herkunft je Rückfall. Damit ist
nachvollziehbar, woraus die Zahl entstand. Eine Browserrechnung ist
bei jedem Neuladen eine neue.

`[read]` **Die Abweichung ist kein Fehler auf einer der beiden
Seiten.** Beide rechnen richtig, sie beantworten verschiedene Fragen:
`score.ts` fragt „was ergibt das, was erfasst wurde", die Tabelle
fragt „was ergibt der Tag, Lücken eingerechnet". Für die Anzeige ist
die zweite Frage die richtige — aber nur, solange dabeisteht, welche
Anteile gestützt sind und welche nicht.

---

## Was jetzt aus der Tabelle kommt

**Neu: `apps/web/src/lib/recovery/scores-read.ts`** — Lese-I/O für
beide Tabellen, ausschliesslich serverseitig, ohne Service-Client, die
Zeilenrechte greifen. `ladeScores(180)` und `ladeModalitaeten(120)`
laufen in `page.tsx` parallel neben `ladeCheckins()`; fällt eine aus,
bleiben die übrigen gültig.

**Die Kachel** (`score-kachel.tsx`) zeigt aus der Zeile:

- den Ring mit `score`, daneben `entry_date`, `mode` und
  `algorithm_version` (`manual_v1_c125` auf allen 170);
- vier Rohwerte: `sleep_hours_used`, `soreness_avg_used` mit
  `soreness_reported_count`, `acwr_used`, HRV aus dem Check-in;
- **alle sieben Anteile mit ihrem Gewicht**, jeder als Balken;
- **den Modalitätsbonus als eigene Zeile**, weil er nicht aus dem
  Check-in stammt;
- die Summe.

`[read]` **Rückfallwerte sind sichtbar, nicht versteckt.** Der Balken
eines Anteils mit `fallback`-Herkunft steht auf `opacity: 0.45`, und
daneben steht der Grund im Klartext statt des Codes: „Rückfallwert —
Ernährung steht nicht im Check-in (E9)", „im manual-Modus nicht
benutzt", „wartet auf C-124 (E5)". Fehlende Teile bleiben sichtbar
mit ihrem Grund, wie im Auftrag verlangt.

**Die Kopfzeile** zeigt `Score 79.4` statt `Score 82`. Die
Unterzeile nennt jetzt die Herkunft — „aus `recovery.scores` · manual
mode · 2026-11-06 · 170 Tage erfasst" — statt „x von 100
Gewichtspunkten gerechnet". `[read]` Die alte Formulierung passt
nicht mehr: die Tabelle rechnet **immer** alle 100, aber nicht immer
aus gemessenen Werten. Wie viel gestützt ist, sagt der
Rückfall-Hinweis an der Zeile, nicht eine Gesamtzahl.

**Zahl ja, Urteil nein — unverändert.** Kein Readiness-Text, keine
Stufe, kein Ratschlag. E3 bleibt offen.

**Neu: die Verlaufskurve** (`ScoreVerlauf`) über alle 170 Tage — der
eigentliche Grund, aus der Tabelle zu lesen. Im Browser wäre jeder Tag
ein eigener Abruf.

`[cmd]` **Die erste Fassung der Kurve log, und zwar nicht in den
Zahlen, sondern im Bild.** Sie spannte `min..max` auf die volle Höhe
und zeichnete in ein 100×100-Feld mit `preserveAspectRatio="none"`.
Gemessen liegt von 170 Tagen **genau einer** unter 60 (2026-06-05,
43,0), und es gibt **keine einzige Datumslücke** — die Kurve zeigte
trotzdem ein Dutzend Zacken bis auf die Achse. Ursache war die
Streckung: 170 Punkte quadratisch gerechnet und dann breit gezogen
macht aus jeder Delle eine Spitze. **Jetzt hat das Feld die Form, in
der es steht (600×90), und die Skala beginnt bei 0.** Eine Kurve,
deren Grundlinie das Minimum ist, behauptet einen Absturz, wo nur der
schlechteste Tag steht.

### Wie viele Kacheln die Marke verlieren

`[cmd]` Auf `Today` vorher vier markierte Kacheln, **jetzt drei**:
Muscle readiness, Pending actions, Overtraining watch. Die
Modalitäten-Kachel hat die Marke verloren. Der Score trug schon seit
G-76 keine.

`[cmd]` In `tab-checkin.tsx` vier vorher, **jetzt drei** — Begründung
im nächsten Abschnitt. Die Erwartung in
`src/components/shell/__tests__/v2-attrappen.test.ts:376` ist von 4
auf 3 gesenkt, mit Begründung an der Zeile. **Gegenprobe geführt:**
Marke wieder eingesetzt → Test rot mit „4 Kacheln gekennzeichnet,
erwartet 3"; zurückgenommen → 388 Tests grün.

---

## Was mit `score.ts` geschieht

**Sie bleibt — aber sie hatte nach dem Umbau null Aufrufer.** Der
Auftrag nennt als Zweck die Live-Vorschau während des Check-ins
(Kachel #7). `[cmd]` Gemessen: **diese Vorschau benutzte `score.ts`
nie.** `tab-checkin.tsx` rechnete mit einer eigenen Formel aus dem
Entwurf (module-recovery-v2.jsx:335-355) — und die war in vier Punkten
etwas anderes:

1. **eigene Gewichte** 15/15/25/10/10/15/10 statt des stabilen Kerns;
2. **ein HRV-Term** aus der Attrappe `CHECKIN`, nicht aus dem
   Formular;
3. **`0.88 * 10` als feste Ernährung** — eine erfundene Zahl;
4. **`readinessFor(total)`**, also Ring-Beschriftung, Titel und
   Ratschlag in Urteilssprache — genau das, was G-76 aus der Kachel
   entfernt hat.

**Die Vorschau rechnet jetzt mit `score.ts`.** Neu ist ein
Einstiegspunkt `vorschauScore(...)`, der die fünf Formularfelder
nimmt; `berechneScore` bleibt unverändert. Damit gelten dieselben
Gewichte wie überall, und was nicht im Formular steht, zählt nicht
mit, statt erfunden zu werden. Die Kachel nennt die Basis („75 von
100 Gewichtspunkten aus dem Formular") und sagt, welche Anteile
fehlen.

`[read]` **Die Vorschau ist bewusst nicht dieselbe Zahl wie die
gespeicherte, und das steht an der Kachel.** Sie rechnet aus dem
Formular, ohne Trainingslast und Ernährung; das Speichern füllt beide
aus anderen Quellen. Genau diese Differenz ist der Befund oben. Wer
die zwei Zahlen nebeneinanderlegt, muss das wissen — sonst sieht der
Unterschied wie ein Fehler aus.

**Ganz weg kann sie also nicht** — sie ist die einzige Rechnung, die
es gibt, solange noch getippt wird und keine Zeile existiert. Ihre
Rolle hat sich aber geändert: **von „die Zahl auf `Today`" zu „die
Zahl, während getippt wird".** Der Dateikopf sagt das jetzt.

**Offen und nicht entschieden:** ob das Speichern eines Check-ins die
Score-Zeile fortschreibt. `[cmd]` Der Speichern-Knopf öffnet
weiterhin `InEntwicklung`; die 170 Zeilen kommen aus dem C-125-Seed.
Das gehört zum Schreibpfad und war nicht Teil dieses Auftrags.

---

## Was die Modalitäten zeigen

`[cmd]` **89 Zeilen auf `dev@lumeos.app`**, vier Arten, mit den
Durchschnittsdauern:

| Art | Anzeige | Anzahl | Dauer im Mittel |
|---|---|---:|---:|
| `stretching` | Dehnen | 42 | 16 min |
| `sauna` | Sauna | 19 | 24 min |
| `cold_plunge` | Eisbad | 15 | 4 min |
| `massage` | Massage | 13 | 55 min |

Das deckt die Posten 20–25 des Entwurfs (Sauna, Massage, Eisbad,
Dehnen) vollständig ab.

**Neu: `modalitaeten-kachel.tsx`** — Kachel #4 des Entwurfs. Sie zeigt
den jüngsten Tag mit allen Einträgen (Uhrzeit, Dauer, Freitext, beide
Wirkungen, Bonus), darunter die Verteilung über alle Arten.

`[cmd]` **Der Bonus ist auf allen 89 Zeilen 0**, mit
`bonus_source = 'pending_c124_e5'` — passend zu `modality_bonus = 0`
auf allen 170 Score-Zeilen. **Nicht geändert, nur angezeigt**, wie
beauftragt. Die Kachel zeigt die 0, setzt eine Pille „Bonuswerte
offen" und sagt darunter, worauf sie wartet: die Bonuswerte je Art
sind E5 und liegen bei C-124. **Einen Wert zu erfinden wäre schlimmer
als eine ehrliche Null.**

`[cmd]` **Eine Skala war falsch angeschrieben, gemessen und
korrigiert:** Die Kachel schrieb `sofort 7/5`. Die 89 Zeilen liegen
zwischen 6 und 8, und
`supabase/_pipeline/12_recovery/121_recovery_scores_modalities.sql:216`
setzt `CHECK (immediate_effect BETWEEN 1 AND 10)`. Es ist eine
1–10-Skala. Korrigiert, und `next_day_effect` steht jetzt daneben —
die Tabelle führt es, die Kachel hatte es übergangen.

---

## Nachweise

`[cmd]` **Angemeldet als `dev@lumeos.app` im Browser**, eigener
Entwicklungsserver auf Port 3201 mit frisch geräumtem `.next`.
Screenshots hell und dunkel, vier Breiten: 1440, 1024, 768, 375 px.
Auf 375 px stapeln Score-Kachel, Zusammensetzung, Kurve und
Modalitäten sauber; kein Überlauf.

`[cmd]` **Tabelle gegen Browser, dieselben fünf Tage:** Die Kopfzeile
zeigt `Score 79.4` für den 2026-11-06 — der Tabellenwert, nicht die
82 aus G-76. Zusammensetzung im Browser: Schlafqualität 24,0/30 ·
Schlafdauer 15,0/15 · Gefühl 12,0/15 · Muskelkater 6,7/10 ·
Trainingslast 10,5/15 · Ernährung 7,0/10 (blass, mit Grund) ·
Stimmung 4,3/5 · Modalitätsbonus +0,0 · Summe 79,4. Kurve: „170 von
170 Tagen · 2026-05-21 bis 2026-11-06 · tiefster 43,0 · höchster
84,7".

`[cmd]` **Zeilenschutz mit zwei anmeldbaren Konten**
(`tools/g82-zeilenschutz.mjs`):

| Konto | `scores` | `modality_log` | `checkins` |
|---|---:|---:|---:|
| `dev@lumeos.app` | 170 | 89 | 170 |
| `test-user@lumeos.local` | **0** | **0** | **0** |

**Das ist eine Gegenprobe, keine fehlgeschlagene Anmeldung:** das
zweite Konto meldet sich erfolgreich an und sieht trotzdem nichts.

`[cmd]` **`pnpm gate` grün, 8 von 8 Aufgaben**, 388 Tests, 31
statische Seiten. `[read]` Zwischenzeitlich schlug der Build in
`apps/web/src/app/v2/medical/ansicht.tsx` fehl (`Cannot find name
'zaehleLagen'`, dann `'alerts'`) — **das war die laufende Arbeit eines
anderen Agenten an einer fremden Datei, nicht aus diesem Auftrag.**
Sie wurde nicht angefasst; nach dessen Korrektur läuft das Gate
durch. Ausserhalb von `medical/` gab es zu keinem Zeitpunkt einen
Typfehler.

`[cmd]` **Ein Fehlstart, der hierher gehört, weil er Zeit kostet:**
Nach dem Räumen von `apps/web/.next` lieferte der *fremde* Server auf
Port 3200 für jeden Chunk eine 404, die Anmeldeseite hydrierte nicht
und das Formular ging als GET ab — mit den Zugangsdaten in der URL.
Das sah nach einem Fehler im Anmeldepfad aus und war keiner: **ein
laufender Entwicklungsserver überlebt es nicht, wenn man ihm sein
`.next` unter den Füssen wegnimmt.** Wer das Verzeichnis räumt, startet
den Server neu — das ist die Ergänzung zur G-81-Regel.

## Was nicht angefasst wurde

- **Kein Schemawechsel.** Nur gelesen; `supabase/` gehört Codex.
- **Keine Übertrainingswarnung**, keine Readiness-Texte (E3).
- **Die Muskelkarte** bleibt, wie G-55 sie gebaut hat.
- **`packages/ui` nicht angefasst.**
- **E1 hält:** alle 170 Zeilen sind `mode = 'manual'`, alle tragen
  `hrv_source = 'not_used_manual_mode'`.

## Hilfsskripte

Nur lesend, unter `tools/`: `g82-vergleich.mjs` (die fünf Tage),
`g82-acwr.mjs` (ACWR-Abdeckung, Herkunftsverteilung),
`g82-skala.mjs` (Wertebereiche der Modalitäten),
`g82-verlauf.mjs` (Kurvenprüfung), `g82-zeilenschutz.mjs` (zwei
Konten), `g82-cache-weg.mjs` (`.next` räumen).
