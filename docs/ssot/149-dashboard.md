# 149 — Das Dashboard an die Module angeschlossen (G-100)

**Stand:** 2026-08-20 · **Modul:** Dashboard · **Auftrag:** G-100

---

## Vorbemerkung: eine Mockup-Datei, aber zwei Fallen

`[cmd]` **`module-dashboard.jsx` ist die einzige Vorlage** — 329 Zeilen,
`window.DashboardModule` am Ende, aufgerufen in `app.jsx:119`.

`[cmd]` **Gegengeprueft, weil G-98 daran gescheitert ist:** Drei
weitere Dateien nennen „Dashboard", keine davon ueberschreibt es —
`module-stubs-replacement.jsx:510` definiert `AdminDashboard` (das
Admin-Modul), `module-completeness.jsx:233` fuehrt es nur als
Listeneintrag.

`[read]` **Die zweite Falle lag woanders:** Der Auftrag nennt zwei
Zahlen, die heute nicht mehr stimmen. Beides unten belegt.

---

## Welche Kachel welche Quelle bekommt

`[cmd]` **Vier KPI-Kacheln und sieben Karten.** Gemessen am 2026-08-20
als `dev@lumeos.app`:

| Kachel | Quelle | Wert heute |
|---|---|---|
| **Recovery** | `recovery.scores.score` | **83,9** / 100 |
| **Training** | `training.workout_sessions.status` | **15** absolviert · 14 geplant |
| **Kalorien** | `nutrition.daily_summary.enercc` | **2.727** kcal · 14 Positionen |
| **Schlaf** | `recovery.checkins.sleep_hours` | **7,8 h** · Qualitaet 8/10 |
| **Makros · heute** | `daily_summary` + `goals.zielwerte_am` | 2.727/2.500 · 151/170 · 251/313 · 116/75 |
| **Recovery** (Karte) | `recovery.scores` mit Herkunftsspalten | 83,9 · Schnitt 7 Tage davor **80,7** |
| **Ziele** | `goals.user_goals` | 2 aktiv, 1 erreicht, mit Prioritaet |
| **Training** (Karte) | `workout_sessions` | Push 6 · 19.8. → Pull 6 · 25.8. · 17:30 |
| **Bestleistungen** | `training.workout_sets.is_pr` | 3 von **41** PRs |
| **Medical** | `lab_result_values` ueber `zaehleLagen` | **2** ausserhalb Labor, **5** nur ausserhalb Optimal |
| **Supplements** | `supplements.intake_logs` | **93,5 %** (116 genommen, 8 ausgelassen) |

`[read]` **Nichts davon ist neu gerechnet.** Wo ein Modul schon eine
Lesefunktion hat, laeuft sie — die Medical-Zahlen kommen ueber dieselbe
Kette wie das Medical-Modul (`ladeBefundwerte` → `zuReihen` →
`zaehleLagen`, G-84), die Tagesziele ueber `getZielwerteAm` wie im
Nutrition-Modul. **Eine zweite Leseroutine waere eine zweite Wahrheit.**

### Der Stichtag, nicht die juengste Zeile

`[cmd]` **Die Seeds reichen ±90 Tage in die Zukunft** (C-78):
`recovery.scores` laeuft bis **2026-11-06**, heute ist der **2026-08-20**.

`[read]` **Deshalb fragt jede Kachel nach dem Stichtag.** Wer die
juengste Zeile naehme, zeigte einen Wert aus dem November als „heute" —
`ladeScores()` tut genau das und war hier deshalb nicht brauchbar.

---

## Was echt wurde

`[cmd]` **Attrappen gerendert gezaehlt: 11 → 6.**

`[read]` **Die Marke ist der Fortschrittsbalken** (Tom, 2026-08-16).
Fuenf Kacheln haben ihre Quelle bekommen; die uebrigen sechs behalten
sie und sagen jetzt **an der Kachel selbst**, woran es haengt — vorher
stand dort einmal derselbe Satz fuer alle.

`[cmd]` **Die erfundenen Zahlen sind aus dem HTML verschwunden:**
„2,142 TSS", „1,847", „Streak 23d", „Sat · May 16" — **0 Treffer**.

**Zwei Dinge, die dabei sichtbar wurden:**

`[cmd]` **1. Die Herkunft gehoert an die Zahl.** `recovery.scores`
fuehrt `nutrition_source = fallback_c123_e9` und
`hrv_source = not_used_manual_mode`. Die Karte schreibt das aus:
*„Der Ernaehrungsanteil ist ein Rueckfallwert. HRV geht im manuellen
Modus nicht ein."* **Ohne diesen Satz saehe ein Rueckfallwert aus wie
eine Messung.**

`[cmd]` **2. Kein Balken ohne Ziel.** Die Makro-Kacheln zeigen eine
Quote nur, wenn `goals.zielwerte_am` fuer den Tag ein Ziel liefert.
Sonst steht „kein Ziel" statt eines Balkens — **ein Balken ohne
Bezugsgroesse behauptet einen Fortschritt, den niemand gemessen hat.**

---

## Was Attrappe bleibt und warum

`[cmd]` **Sechs Kacheln, jede mit eigener Begruendung an der Kachel.**

**1. Readiness (Komposit).** `[read]` **Das ist der Gesamtwert, den der
Auftrag zu melden verlangt.** Der Entwurf rechnet aus fuenf Anteilen
(Recovery · Sleep quality · Soreness · Nutrition · Stress) einen Wert
von 84 und schreibt daneben *„Push hard"* und *„green light for
tonight's Push B session"*.

`[cmd]` **Beides nicht gebaut:** `recovery.scores` fuehrt bereits einen
Gesamtwert mit **sieben** Anteilen und eigener Gewichtung (G-82),
darunter Trainingslast, die im Entwurf fehlt. **Zwei Gesamtwerte
nebeneinander waeren schlimmer als einer**, und die Gewichtung des
Entwurfs ist nirgends entschieden — sie stuende nur in dieser Datei.
Der gemessene Wert steht in der Recovery-Karte.

**2. Body battery.** `[cmd]` **Es gibt keine solche Groesse** — gegen
`information_schema` geprueft: keine Spalte mit `batter` oder
`body_energy` in irgendeinem Schema. Kurve und Grundlinie waeren beide
erfunden.

**3. Tonight.** `[cmd]` **Hier war meine erste Begruendung falsch.**
Ich schrieb, `workout_sessions` fuehre keines der Felder — **es fuehrt
die meisten**: `started_time`, `duration_minutes`, `location`,
`total_sets`, `total_volume_kg`, und alle sind auf allen 30 Sitzungen
gesetzt.

`[cmd]` **Beim Messen aufgefallen und korrigiert.** Was wirklich fehlt:
**Block, Woche und die Zuweisung durch einen Coach** (G-86), und
**`total_sets`/`total_volume_kg` stehen bei geplanten Sitzungen auf 0**
— die Spalten gibt es, gefuellt sind sie nur bei absolvierten.

`[read]` **Was belegt ist, ist jetzt angebunden** und steht in der
Training-Karte: Name, Datum, **Zeit (17:30), Dauer (75 min), Ort
(Gym)**.

**4. Today's flow.** `[cmd]` **Auch hier lag ich zuerst daneben.** Die
Uhrzeiten gibt es vollstaendig: `meals.meal_time` **725 von 725**,
`intake_logs.intake_time` **360 von 360**,
`workout_sessions.started_time` **30 von 30**.

`[read]` **Was fehlt, ist die DAUER je Ereignis.** Der Entwurf zeichnet
Balken mit Laenge; eine Mahlzeit und eine Einnahme haben keinen
Endzeitpunkt. **Eine geratene Balkenlaenge waere eine erfundene Zahl in
einer Zeitachse, die praezise aussieht.**

**5. Activity.** `[read]` **Waere baubar** — der Strom braucht nur
Zeitpunkt, Modul und einen Satz, keine Dauer. Es gibt aber keine
gemeinsame Ereignistabelle: sechs Abfragen je Seitenaufruf, nach Zeit
gemischt. **Eine eigene Entscheidung, keine Nebenwirkung dieses
Auftrags** (G-101).

**6. Der Rest des Entwurfs** bleibt in `entwurf.tsx` unveraendert
liegen — die vollstaendige Vorlage, an der sich der naechste Schritt
misst.

### Was bewusst nicht dazukam

`[cmd]` Wie im Auftrag verlangt: **kein Health score** (G-85), **keine
Volume landmarks** (C-105), **keine HR-Zonen**, **keine
Uebertrainings-Warnung** (braucht C-124). Keine dieser Groessen ist im
eigenen Modul belegt.

---

## Was die Konsolenfehler sind

`[cmd]` **Recovery hat 4, nicht 5** — gemessen am 2026-08-20 mit
`tools/schuss.mjs`. Das Dashboard hat 2, und die zwei sind in beiden
Modulen dieselben.

| Fehler | Wo | Was |
|---|---|---|
| 2× `Extra attributes from the server: data-mode` | **jede Seite** | Hydrationswarnung des Rahmens (`RootLayout`), nicht modulbezogen |
| 2× `<path> attribute d: Expected number` | nur Recovery | **die SVG-Pfade der Muskelkarte** |

`[cmd]` **Die zwei SVG-Fehler sind KEIN Encoding-Problem**, obwohl sie
so aussehen. Die Datei `packages/ui/src/koerperkarte-pfade.ts` enthaelt
**0 Ersatzzeichen (U+FFFD)** — das `?` in der Fehlermeldung ist die
Konsole, nicht die Datei.

`[cmd]` **Es sind abgeschnittene Pfaddaten.** Ein `C`-Befehl
(kubische Bezierkurve) braucht sechs Zahlen:

```
… C 89.50 823.53 109.24 767.88 A 0.37 0.36 …     ← nur 4, dann folgt A
… C 1039.32 221.19 C 1041.33 230.61 …            ← nur 2, dann folgt C
```

`[cmd]` **Unveraendert seit `3dae1a2`** („feat(ui): add the body map and
use it in recovery") — die Daten kamen so ins Repo.

`[read]` **Nicht behoben:** `packages/ui` ist in diesem Auftrag
gesperrt, und es sind zwei von hunderten Pfaden — die Karte zeichnet,
nur diese beiden Teilstuecke fehlen. **Als Befund aufgenommen (G-102).**

---

## Zwei Zahlen des Auftrags stimmen nicht mehr

`[cmd]` **1. Medical: „2 über dem Bereich, 4 ausserhalb des
Optimalbands".** Gemessen sind es **2 und 5**.

`[read]` **Das Dashboard stimmt mit dem Modul ueberein** — die
Medical-Seite selbst schreibt *„2 + 5 = 7 marker"*. Dieselbe Funktion,
dasselbe Ergebnis. Die 4 stammt aus G-84; seither sind Daten
dazugekommen.

`[cmd]` **2. Recovery: „5 Konsolenfehler".** Gemessen sind es **4** —
zwei davon die Hydrationswarnung, die jede Seite hat.

---

## Nachweis

`[cmd]` **`pnpm --filter @lumeos/web test`: 424 pass, 0 fail.**
Typecheck sauber. **`pnpm --filter @lumeos/web build` compiled
successfully** — `/v2/dashboard` waechst von 2 kB auf **4,47 kB**.

`[read]` **Das Gate als Ganzes bleibt rot an `apps/coach`** (Fable):
fehlt im Lockfile, kein `node_modules`. Nicht angefasst — der Auftrag
sagt das ausdruecklich.

`[cmd]` **Zeilenschutz als `test-user@lumeos.local`:** Recovery `—`,
Kalorien `—`, Schlaf `—`, Training 0/0, Bestleistungen „Keine
Bestleistung erfasst", Medical 0/0, Supplements `—`. **Keine einzige
fremde Zahl.**

`[cmd]` **Die Makro-ZIELE sieht `test-user` trotzdem** (2.978 / 157 /
402 / 83) — **das sind seine eigenen**, aus seinem Profil gerechnet
(`herkunft = formel`); `dev` bekommt 2.500 / 170 / 313 / 75. **Kein
Leck, sondern eine Formel, die fuer jedes Profil rechnet.**

`[cmd]` **Bildschirmfotos** ueber `tools/schuss.mjs`, headless: 1440 und
375 px, hell und dunkel. **Attrappen gerendert: 6** (vorher 11),
**2 Konsolenfehler** an jeder Breite.

---

## Der Dev-Server hing — und warum das hierher gehoert

`[cmd]` **Der Server auf 3200 kompilierte `/v2/dashboard` 20 Minuten
lang nicht neu** und lieferte den alten Entwurf, obwohl der Build sauber
durchlief.

`[cmd]` **Gepruefte Ursache zuerst, wie Tom es vorgibt:** kein fremdes
`.next`-Verzeichnis, und `.next-gate` (17:24) gegen `.next` (16:09) —
**der Build ging korrekt in das eigene Verzeichnis.** Der Watcher hing,
nicht die Trennung.

`[read]` **Nach Freigabe neu gestartet, in der Reihenfolge aus
CLAUDE.md:** beenden, starten. **`.next` wurde nicht geloescht.** Die
neue Seite stand beim ersten Aufruf.

---

## Geaenderte und neue Dateien

| Datei | Was |
|---|---|
| `apps/web/src/lib/dashboard/lesen.ts` | **neu** — ein Lesepfad ueber sechs Module, `Promise.allSettled` |
| `apps/web/src/app/v2/dashboard/dashboard-echt.tsx` | **neu** — die angebundenen Kacheln |
| `apps/web/src/app/v2/dashboard/entwurf-rest.tsx` | **neu** — die sechs mit Marke und je eigenem Grund |
| `apps/web/src/app/v2/dashboard/page.tsx` | laedt und teilt auf |

**Nicht angefasst:** `entwurf.tsx` (die Vorlage bleibt vollstaendig),
`packages/ui`, `apps/coach`, `supabase/`, die sieben Fachmodule.

---

## Neue Befunde

1. **G-101 — Der Aktivitaetsstrom waere baubar.** Zeitpunkte liegen in
   allen sechs Modulen vor; es fehlt eine gemeinsame Ereignistabelle.
   Sechs Abfragen je Seitenaufruf sind eine Entscheidung, keine
   Nebenwirkung.
2. **G-102 — Zwei SVG-Pfade der Muskelkarte sind abgeschnitten.**
   `koerperkarte-pfade.ts`, seit `3dae1a2`; zwei `C`-Befehle mit vier
   bzw. zwei Zahlen statt sechs. Zwei Konsolenfehler auf jeder
   Recovery-Seite.
3. **Der Tagesverlauf braucht eine Dauer je Ereignis** — Uhrzeiten
   liegen vollstaendig vor, Endzeitpunkte nicht.
4. **`total_sets` und `total_volume_kg` sind bei geplanten Sitzungen 0.**
   Wer sie fuer eine Vorschau braucht, braucht sie gefuellt oder eine
   Rechnung aus der Vorlage.
