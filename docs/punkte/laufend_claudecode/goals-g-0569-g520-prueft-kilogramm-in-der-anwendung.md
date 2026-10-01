---
nr: G-569
typ: fehler
modul: goals
schwere: hoch
angelegt: 2026-10-01
beauftragt: 2026-10-01
agent: claudecode

braucht: [G-561, G-565]
kind_von: G-561
entscheidung: E-83

quellen:
  - docs/punkte/erledigt/goals-g-0561-sechs-waechter-pruefen-kilogramm-statt-prozent.md
  - docs/punkte/erledigt/goals-g-0565-die-einheit-ist-eine-nutzerwahl.md
  - docs/entscheidungen/E-83-der-nutzer-waehlt-die-einheit.md

beruehrt:
  dateien:
    - apps/web/src/lib/goals/anpassung.ts
    - apps/web/src/lib/goals/uebergangswaechter.ts
    - apps/web/src/lib/goals/zielrate-einheit.ts
---

# G-520 prueft Kilogramm in der Anwendung

    AUFTRAG FUER Claude Code - G-569: G-520 prueft Kilogramm in der
                                     Anwendung, der Katalog Prozent
    Bereich: apps/web/src/lib/goals/anpassung.ts
             apps/web/src/lib/goals/uebergangswaechter.ts
             und was A1 dazu findet, innerhalb apps/
    Fremd:   supabase/ gehoert Codex, der gerade an G-535 baut (sechs
             Funktionen lesen den alten Sitzungsnamen). Die drei
             Waechtertexte von G-561 liegen hier woertlich bei - sie
             kommen nicht noch einmal von ihm.
             docs/ gehoert dem Orchestrator, auch diese Punktdatei:
             der Bericht kommt als Antwort, nicht als Anhang hier.
    Stand:   2026-10-01

**Zuerst lesen, vollstaendig:** diese Datei,
`docs/punkte/erledigt/goals-g-0561-sechs-waechter-pruefen-kilogramm-statt-prozent.md`
und `docs/entscheidungen/E-83-der-nutzer-waehlt-die-einheit.md`.


## Der Befund

`[cmd]` **Codex hat die Katalogseite umgestellt und die Anwendungsseite
gemeldet statt sie mitzunehmen** — `apps/` gehoert ihm nicht. Vom
Orchestrator nachgelesen, `anpassung.ts:217-222`:

    d.weightTrend > -0.1   &&  calorieAdherence > 85   ->  -100 kcal
    d.weightTrend < -1.0                              ->  +150 kcal

**Zwei Konstanten in Kilogramm je Woche**, dazu dieselbe Klasse in
`uebergangswaechter.ts:123`. `[cmd]` **Fuer `lean_bulk`: +0,75 und
+0,1 kg/Woche.**

`[read]` **Damit stehen jetzt zwei Maßstaebe nebeneinander:** der Katalog
prueft relativ (1,194 %), die Anwendung absolut (1,0 kg). **Bei 83,74 kg
ist das dieselbe Grenze — bei 60 kg nicht.** Dort greift der Katalog bei
0,716 kg und die Anwendung erst bei 1,0.

## Was Codex schon geliefert hat

`[cmd]` **Die Umrechnung, ohne Aenderung der Strenge:**

    1,00 kg  ->  1,194 %
    0,75 kg  ->  0,896 %
    0,10 kg  ->  0,119 %

`[cmd]` **Und die Bezugsgroesse ist entschieden** (G-561/A2, gegen die
Vorgabe des Orchestrators und mit Begruendung): **das letzte gueltige
Gewicht am Pruefstichtag**, nicht das am Phasenbeginn. Die Zielrate ist
die Absicht der Phase; der Waechter bewertet einen gegenwaertigen
Vorgang. **Fehlt am Stichtag ein Gewicht, ist das ein Hindernis** — kein
Rueckfall auf Profil- oder Startgewicht.

`[cmd]` **Die drei Waechtertexte liegen woertlich vor**, je in Prozent
und in Kilogramm. Sie stehen im Bericht zu G-561 und sind zu uebernehmen,
nicht neu zu formulieren.

## Was G-565 seit heute bereitstellt

`[cmd]` **Die Umrechnung ist gebaut und abgenommen** (`bdaea479`), in
`apps/web/src/lib/goals/zielrate-einheit.ts`:

    kcalAusRate(rate, gewichtKg)     rateAusKcal(kcal, gewichtKg)
    rundeWieDb(wert, stellen)        inEinheit / ausEinheit

**Benutzen, nicht neu schreiben.** `[cmd]` **Und `Math.round` ist dort
eine Falle, nicht nur Geschmack:** Postgres rundet die Haelfte von der
Null WEG, JavaScript nach oben — bei −2,5 % und 55,5 kg sind das
−1526,3 gegen −1526,2. Genau dieser Fehler stand bis heute in
`kcalDeltaAusRate`. **Wer in diesem Auftrag rundet, rundet durch
`rundeWieDb`.**

`[cmd]` **Die gewaehlte Einheit kommt aus
`public.user_display_preferences`** unter `goals.zielrate_einheit`,
geladen mit `ladeEinheit()` aus `lib/goals/einheit-speichern.ts` —
nicht aus der Phase (E-83).

## Auftrag

**A1 — zaehlen, wo absolut geprueft wird.** `anpassung.ts` und
`uebergangswaechter.ts` sind belegt; **miss, ob es weitere gibt**, und sag,
wie du abgegrenzt hast. Eine Schwelle kann als Zahl, als Konstante oder in
einem Text stehen. `[read]` **Ein Muster kann auch die FORM verfehlen:**
„1.0 kg" als Text findet die Schwelle nicht, sie steht als Zahl.

**A2 — relativ rechnen, mit dem Gewicht am Stichtag.** Die Umrechnung
liegt in `zielrate-einheit.ts` (siehe oben) — **benutzen, nicht neu
schreiben.** Fehlt das Gewicht, ist es ein Hindernis ueber
`hindernisSatz` (G-568), keine stille Null.

**A3 — die Strenge darf sich nicht verschieben.** Randprobe wie bei
Codex: bei 83,74 kg muss 1,000 kg greifen und 0,999 nicht; bei 60 kg
0,717 greifen und 0,716 nicht. **Zwei Gewichte, je zwei Werte** — das ist
die Stelle, an der absolut und relativ auseinanderlaufen.

**A4 — die Texte in beiden Einheiten**, nach E-83 und mit der Einheit, die
der Nutzer gewaehlt hat (G-565). Die Kilogrammfassung nennt die Grenze
**zu seinem Gewicht**, nicht eine pauschale Zahl.

**Nicht Teil:** der Katalog (G-561, erledigt) und die Frage, ob die Raten
nach Erfahrungsstufe abgestuft werden (G-566, bei Tobias).

`[read]` **Und ein Hinweis von Codex, der hierher gehoert:** werden die
Raten je Stufe abgestuft, **bewegen sich die Waechtergrenzen nicht
automatisch mit** — sie sind Text im Katalog und Konstanten hier. **Sag
im Bericht, ob dein Bau das aushaelt**, oder ob die Grenze dann aus der
Rate abgeleitet werden muss.

**Zu belegen:** Nachweise auf `test-user@lumeos.local` · die Randprobe mit
zwei Gewichten · Sabotage je Waechter in beide Richtungen · Bild je
Einheit · `pnpm gate` gruen mit Testzahl und der Aussage zu den neun
Waechtern · nichts committen.
