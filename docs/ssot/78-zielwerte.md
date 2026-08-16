# GO-02 bis GO-04: Zielwerte

`[cmd]` Erhoben am 2026-08-16, Zweig `dev`. Setzt GO-01 voraus
(`636b12f`). Plan:
`docs/spezifikation/30-module/core/goals/00-umsetzungsplan.md`.

Gebaut: die Zuordnung als Datendatei, das Schema `goals` mit der
Zieltabelle, zwei Funktionen — und der Hinweis im Tagebuch, der sagt,
was fehlt.

---

## Was entstanden ist

| | |
|---|---|
| **GO-02** | `supabase/_pipeline/daten/zielrichtung-kalorienzuschlag.json` |
| **GO-03** | `goals.nutrition_targets`, Kettenschritt `110` |
| **GO-04** | `goals.berechne_zielwerte`, dazu `goals.zielwerte_am` |
| **Zusatz** | `Zielhinweis` im Tagebuch, `lib/profile/zielwerte-read.ts` |

`[cmd]` Kettenschritt `110` in `kette.json`,
`supabase/README.md` und `daten/schema-sollstand.json` nachgezogen.

---

## Wo ich dem Vorgänger nicht gefolgt bin

`[cmd]` Der Vorgänger hat **zwei** Implementierungen, und sie
widersprechen einander:

| | `calculateTDEE.ts` | `useTDEE.ts` |
|---|---|---|
| Aktivität aus | `trainingFrequency` (2–7) | `activity_level` (5 Werte) |
| Zuschlag | Prozent des TDEE (−25 %…+20 %) | absolute kcal (−500…+500) |
| Fett | 25 % der **Zielkalorien** ÷ 9 | Anteil des **Rests** nach Protein |
| Kohlenhydrate | Restgrösse | Anteil des Rests |
| Zielvokabular | 15 Kennungen | 4 Kennungen |

`[cmd]` Eine dritte Stelle (`api/goals/routes/nutrition-goals.ts`) führt
ein **viertes** Vokabular: `'lose' | 'maintain' | 'gain'`. **Die Frage,
die dieser Auftrag als GO-02 stellt, war im Vorgängerrepo also nicht
gelöst, sondern viermal verschieden beantwortet.**

### 1. Aktivität aus `activity_level`, nicht aus der Trainingsfrequenz

`calculateTDEE.ts` leitet den Faktor aus `trainingFrequency` ab.
`[cmd]` Diese Spalte existiert hier nicht; `profiles.activity_level`
existiert und trägt genau die fünf Werte, die `useTDEE.ts` und
`SCORING.md` als Multiplikatoren führen. Gefolgt bin ich `useTDEE.ts`.

`[read]` Die beiden sind ausserdem nicht deckungsgleich:
`calculateTDEE.ts` kennt kein `sedentary` — wer nicht trainiert,
bekommt dort über den Rückfall `|| 1.55` den Faktor für „mässig aktiv".
Das ist für jemanden mit Bürojob um 29 % zu hoch.

### 2. Prozent statt absoluter kcal

Beide Wege sind belegt; gewählt ist Prozent. `[read]` Ein festes
Defizit von 500 kcal ist bei einem TDEE von 1900 ein Viertel und bei
3400 ein Siebtel — dieselbe Zahl bedeutet für zwei Menschen etwas
völlig anderes. `PHASE_MODELS.md` gibt die Zielrate ohnehin relativ an
(*„0.5–0.75 % BW/week"*).

### 3. Fett als 25 % der Zielkalorien

`useTDEE.ts` verteilt den Rest nach Protein auf Kohlenhydrate und Fett.
`[read]` Bei hohem Protein und niedrigen Kalorien fällt der Fettanteil
dabei unter die Untergrenze, die `PHASE_MODELS.md` nennt (0,5 g/kg).
`calculateTDEE.ts` rechnet fest 25 % — das ist stabiler und bleibt in
allen geprüften Fällen über der Grenze.

### 4. Die Altersrechnung — ein echter Fehler

`[cmd]` `calculateTDEE.ts` rechnet:

```js
const age = new Date().getFullYear() - parseInt(data.birthDate.split('-')[0], 10);
```

**Der Geburtstag wird ignoriert.** Wer am 1. Dezember 1990 geboren ist,
gilt das ganze Jahr über als 36 statt 35.

`[cmd]` Nachgemessen, beide Fälle am 2026-08-16:

| Geburtsdatum | `age()` (hier) | Vorgänger |
|---|---:|---:|
| 1990-05-17 (Geburtstag vorbei) | 36 | 36 |
| 1990-12-01 (Geburtstag kommt) | **35** | **36** |

`[cmd]` Für den Dezember-Fall: 2.986 kcal hier gegen 2.978 beim
Vorgänger — 8 kcal Unterschied. Klein, aber die Richtung ist eindeutig.
Hier `age()`, das Monat und Tag berücksichtigt.

### 5. Kein Rücktritt auf Voreinstellungen

`[cmd]` Der Vorgänger fällt an drei Stellen zurück:
`activityMultipliers[frequency || 4] || 1.55`,
`goalModifiers[goal || 'maintain'] || 0`, und bei fehlenden Daten
liefert er `{tdee: 0, targetCalories: 0, ...}`.

**Hier gibt es keine Zahl, wenn eine Angabe fehlt.** `[read]` Eine 0 im
Kalorienziel ist keine Fehlermeldung, sondern eine Behauptung — und
`targetCalories: 0` würde in einem Ring als „0 von 0" erscheinen. Die
Funktion liefert stattdessen NULL plus ein `hindernis` und die Liste
der fehlenden Felder.

### 6. `health` bleibt offen

`[cmd]` `profiles.nutrition_goal` kennt sechs Werte. Fünf lassen sich
dem Vorgänger zuordnen; **`health` kommt weder in `goalModifiers` noch
in `Step4Goal.tsx` vor** — der Vorgänger kennt diese Zielrichtung
nicht.

`[read]` Der Auftrag sagt: *„wenn nicht, leg die Lücke vor statt sie zu
füllen."* Die Datei trägt für `health` `"kalorienfaktor": null` mit
Status `OFFEN`. Die Funktion liefert dann `zielrichtung_ohne_faktor` —
keine Zahlen. `[cmd]` Nachgemessen: mit `health` im Profil bleibt
`kcal` leer, `protein_g` steht (das hängt nur am Gewicht).

**0,0 wäre eine stille Entscheidung**, dass Gesundheit gleich Erhaltung
ist. Das mag stimmen; entschieden hat es niemand.

### 7. Zehn Phasen statt sechs Zielrichtungen — nicht abgebildet

`PHASE_MODELS.md` kennt neun Phasen, `user_goals.goal_type` vier
Klassen. Diese Datei bildet **nur** die sechs Werte ab, die es in
`profiles` gibt. `[read]` Wer hier neun Phasen einbaut, baut eine
Tabelle in eine Datei — Phasen haben einen Verlauf, Dauergrenzen und
Übergänge, und das ist GO-06/GO-07.

---

## GO-03: die Tabelle

`[read]` Entscheidung Tom: eigenes `goals`-Schema. Der Plan hatte das
Gegenteil vorgeschlagen; die Entscheidung hat den besseren Beleg —
`[cmd]` `nutrition_targets` stand in `schema-sollstand.json` bereits
unter `nicht_erwartet` mit dem Vermerk „gehoert zu Goals (C-06)", und
`055_water_logs.sql` hält dasselbe fest. Der Ort war zweimal notiert,
bevor die Tabelle existierte.

### Das Gültigkeitsdatum

`gueltig_ab` ist Teil des Primärschlüssels. `[cmd]` Nachgemessen an
zwei Zeilen (2.978 kcal ab 16.08., 2.200 kcal ab 01.09.):

| Stichtag | gelieferte Zielwerte |
|---|---|
| 20.08.2026 | 2.978 kcal |
| 15.09.2026 | 2.200 kcal |
| 01.08.2026 | **keine Zeile** |

Der dritte Fall ist der wichtige: vor dem ersten Ziel gibt es kein
Ziel — nicht das älteste als Näherung.

`[read]` Ohne das Datum zeigte das Tagebuch rückwirkend falsche
Deckungsgrade, sobald jemand die Phase wechselt. Dieselbe Frage hat
`meal_items` mit eingefrorenen Werten beantwortet (ADR-0003); hier ist
es ein Zeitraum statt eines Schnappschusses, weil ein Ziel bis auf
Weiteres gilt.

### Zeilenschutz

`[cmd]` Vier Policies je Operation, Muster aus `052`. Nachgemessen mit
zwei Sitzungen: eigene sieht 1 Zeile, fremde sieht **0**.

---

## GO-04: die Berechnung

Reine Funktion, `STABLE`, `SECURITY INVOKER`. **Sie schreibt nicht.**

`[cmd]` Zwei Profile, zwei Ergebnisse — dieselbe Funktion:

| | vollständiges Profil | leeres Profil |
|---|---|---|
| `bmr` | 1.746,5 | — |
| `tdee` | 2.707,1 | — |
| `kcal` | 2.977,8 | — |
| `protein_g` | 156,8 | — |
| `carbs_g` | 401,6 | — |
| `fat_g` | 82,7 | — |
| `hindernis` | — | `profil_unvollstaendig` |
| `fehlende_felder` | `{}` | alle sechs, namentlich |

### Warum Rechnen und Speichern getrennt sind

`[read]` Der Auftrag verlangt die Trennung und lässt die Begründung
offen. Sie ist: **eine Berechnung, die bei jedem Abruf schreibt, legte
bei jeder Profiländerung eine neue Zeile an** — auch beim Vertippen.
Mit `gueltig_ab` im Schlüssel entstünde für jeden Tag mit einer
Korrektur ein eigener Zielsatz, und der Verlauf wäre unlesbar.

`[annahme]` Der richtige Auslöser ist eine bewusste Handlung („Ziel
setzen"), nicht ein Seitenaufruf. Das ist GO-05.

Zwei Funktionen, zwei Fragen: `zielwerte_am` liest, was **gilt**;
`berechne_zielwerte` rechnet, was **gelten könnte**.

---

## Der fehlende Schritt: was das Tagebuch bei halbem Profil zeigt

Der Plan hatte ihn nicht; er ist beim Bauen von GO-01 aufgefallen.

Bis heute stand dort: *„Keine Ringe, weil es keine Zieltabelle gibt."*
Der Satz war richtig — und ist es seit GO-03 nicht mehr. Jetzt
unterscheidet `Zielhinweis` fünf Fälle:

| Fall | Anzeige |
|---|---|
| Zielwerte nicht abrufbar | „Am Profil liegt es nicht." |
| Ziele gelten | seit wann, woher, TDEE — **„Eine Schätzung ist keine Messung"** |
| Profil unvollständig | **welche** Felder fehlen, im Klartext, mit Verweis nach `/v2/settings` |
| Zielrichtung ohne Faktor | „Was fehlt, ist eine Entscheidung" |
| Vorschlag steht bereit | die Zahlen, plus „gesetzt ist es noch nicht" |

`[read]` Dieselbe Logik wie beim Ring ohne Ziel: Eine leere Anzeige,
die ihren Grund nennt, ist ehrlich. Eine, die schweigt, sieht aus wie
ein Fehler.

---

## Zwei Befunde

### 1. `goals` war über PostgREST nicht erreichbar

`[cmd]` Tabelle und Funktionen stehen, die Rechte stimmen, die
Funktion rechnet in psql — und die Oberfläche bekam nichts:

```
{"code":"PGRST106","message":"Invalid schema: goals",
 "hint":"Only the following schemas are exposed: public, graphql_public, nutrition"}
```

`[cmd]` `supabase/config.toml` führte `schemas = ["public",
"graphql_public", "nutrition"]`. Die Zeile ist um `goals` ergänzt.

**Sie greift noch nicht.** `[cmd]` Der laufende Container trägt
`PGRST_DB_SCHEMAS=public,graphql_public,nutrition`; die Umgebung wird
beim Erstellen gesetzt, ein `docker restart` ändert sie nicht.
Nötig ist `supabase stop` und `supabase start` — das nimmt den ganzen
lokalen Stack herunter, und das ist mehr, als dieser Auftrag erlaubt.
**Das gehört Tom.**

Bis dahin sagt die Oberfläche, dass die Zielwerte nicht abrufbar sind
und dass es nicht am Profil liegt.

`[annahme]` Ein eigenes Schema kostet also mehr als „eine Zeile" — es
kostet eine Zeile **und einen Neustart**. Das gehört in die
Entscheidung, wenn das nächste Schema ansteht.

### 2. Die Schemaprüfung sah nur `nutrition`

`[cmd]` `schema-vollstaendigkeit-pruefen.ts` fragt an **10 Stellen**
fest verdrahtet nach `nutrition`. Ein neues Schema wäre damit
strukturell ungeprüft: Tabelle, Zeilenschutz, Policies und Grants
hätten fehlen können, ohne dass ein Kettenlauf sich beschwert.

`[read]` Das ist dieselbe Fehlerklasse, die C-43 aufgedeckt hat — dort
fehlten Kettenschritte, hier fiele ein ganzes Schema aus dem Blickfeld.

`[cmd]` Nachgerüstet: `fremde_schemata` und `fremde_funktionen` im
Sollstand, geprüft werden dieselben vier Fragen wie für `nutrition`.
Zum Fehlschlagen gebracht — gegen die laufende Datenbank (ohne
Schritt 110) meldet sie:

```
· Tabelle: goals.nutrition_targets FEHLT — erzeugt von Schritt 110
· Funktion: goals.berechne_zielwerte FEHLT — Schritt 110
· Funktion: goals.zielwerte_am FEHLT — Schritt 110
```

Gegen eine Datenbank mit Schritt 110: `Fremde Tab. 1/1`,
`Fremde Fkt. 2/2`, `SCHEMA VOLLSTAENDIG`.

### 3. Nebenbefund: die Encoding-Prüfung hatte eine Lücke

`[cmd]` In einem frischen Commit stand ein **doppelt kodierter
Gedankenstrich** (`c3a2 e282ac e2809d`), und `tools/encoding-pruefen.mjs`
meldete „sauber".

Der Grund: Ein **Zweibyte**-Zeichen (`c3 bc` = ü) wird doppelt kodiert
zu `c383 c2bc` — Einleitung `c383`. Ein **Dreibyte**-Zeichen
(`e2 80 94` = Gedankenstrich) wird zu `c3a2 e282ac e28094` — Einleitung
`c3a2`. Die Prüfung kannte nur `c383` und `c382`, also nur Umlaute;
**alle typografischen Zeichen fielen durch.**

`[cmd]` Ergänzt (`c3a2`, dazu `0xe2` als Folgebyte), die beiden
Sequenzen repariert, zwei Tests dazu — einer für den Fund, einer gegen
Falschmeldungen bei echtem französischem `â`. Die Prüfung schlägt jetzt
an; vorher lief sie durch.

---

## Nachweis

`[cmd]` `pnpm gate`: **8 successful, 8 total**.
`[cmd]` Tests: **177 von 177** (vorher 175; zwei neue für die
Encoding-Lücke).

`[cmd]` Kettenlauf von leer über `kette-ausfuehren.ts`:
`KETTE OK: 36.9s`, `SCHEMA VOLLSTAENDIG`, darin
`Fremde Tab. 1/1` und `Fremde Fkt. 2/2`.

`[cmd]` `kette-readme-pruefen.ts`: `ok (42 Schritte dokumentiert)` — die 42. stammt aus einem parallelen Auftrag.

`[cmd]` Im Browser, angemeldet: drei Breiten ohne waagrechten Überlauf,
`/nutrition` mit **0** `v2-`-Elementen und **1** `.lume-shell`.
Konsolenmeldungen: drei, alle die bekannte `data-mode`-Warnung aus
`app/layout.tsx`.

---

## Was die Zahlen nicht sagen

**Ein berechnetes TDEE ist eine Ausgangsvermutung, keine Messung.**

`[read]` Die Formel von Mifflin und St Jeor ist eine Regression über
eine Stichprobe gesunder Erwachsener. Sie schätzt den Grundumsatz aus
vier Zahlen — Gewicht, Grösse, Alter, Geschlecht. Was sie **nicht**
kennt:

- **Körperzusammensetzung.** Zwei Menschen mit 78 kg und 182 cm
  bekommen denselben Wert, auch wenn einer 12 % und der andere 30 %
  Körperfett hat. Muskelmasse verbraucht mehr als Fettmasse.
- **Den individuellen Stoffwechsel.** Die Streuung der Formel liegt in
  der Literatur bei ±10 %; bei 2.700 kcal sind das ±270.
- **Alltagsbewegung.** Der Aktivitätsfaktor ist eine Stufe von fünf,
  keine Messung. Zwischen `moderate` (1,55) und `active` (1,725)
  liegen bei diesem Beispiel 300 kcal — die Wahl trifft die Nutzerin
  nach Gefühl.
- **Krankheit, Medikamente, Schilddrüse, Schwangerschaft.** `[cmd]`
  Schwangerschaft und Stillzeit stehen seit GO-01 im Profil, gehen aber
  in **keine** dieser Formeln ein.

`[read]` **Erst die adaptive Anpassung macht daraus einen belegten
Wert.** Sie rechnet rückwärts: aus tatsächlich gegessenen Kalorien und
tatsächlicher Gewichtsänderung ergibt sich, was der Körper wirklich
verbraucht hat. `[cmd]` Das ist GO-13 und braucht **zwei volle Wochen**
Gewichts- und Kaloriendaten; `meals` hat 0 Zeilen, und es gibt keinen
Schreibpfad (C-03).

Deshalb trägt jede Zeile in `nutrition_targets` eine `herkunft`
(`formel` oder `manuell`), und der Hinweis im Tagebuch sagt es im
Klartext: *„Eine Schätzung ist keine Messung."*

### Was ausserdem offen bleibt

- **`health` hat keinen Faktor** — vorgelegt, nicht gefüllt.
- **Die Makro-Regel ist eine von mehreren.** Protein 2 g/kg und Fett
  25 % sind aus dem Vorgänger übernommen, nicht hergeleitet. `[read]`
  `PHASE_MODELS.md` gibt Bereiche an (1,8–2,4 g/kg bei fat_loss); die
  festen Werte liegen darin, aber sie sind eine Wahl.
- **Kein Makro-Zyklus.** `RECOMP` bedeutet in der Spec +200 an
  Trainingstagen und −300 an Ruhetagen; hier ist es der Wochenschnitt.
  Ohne Trainingsplan ist mehr nicht machbar.
- **Keine Grenzen für die Dauer.** `PHASE_MODELS.md` begrenzt
  `fat_loss` auf 20 Wochen und verlangt Diätpausen. Das braucht Phasen
  mit Verlauf — GO-07.
