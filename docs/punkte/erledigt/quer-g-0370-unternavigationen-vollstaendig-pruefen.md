---
nr: G-370
typ: befund
modul: quer
schwere: mittel
angelegt: 2026-09-07
braucht: []
kind_von: G-365
entscheidung: E-69
agent: claudecode
beauftragt: 2026-09-07
erledigt: 2026-09-07
commit: 259d7d0f
beruehrt:
  dateien:
    - apps/web/src/app/v2/medical/ansicht.tsx
zahlen:
  gemessen: 2026-09-07
  reiter: 85
  geprueft: 3
---

# G-370 — Unternavigationen vollstaendig pruefen

## Befund

Aus G-365, Claude Code, 2026-09-07, selbst offengelegt:

> *,,Der vollstaendige Unternavigations-Durchlauf ueber alle 85
> Reiter lief in eine Zeitgrenze. Geprueft sind die DREI gemeldeten
> Faelle."*

`[read]` **Das ist eine Luecke im Nachweis, keine Aussage ueber
Fehler** — **seine eigene Formulierung.**

## Die Klasse

`[cmd]` **Drei Faelle gefunden, alle gleich:** **die Referenz hing
in `ansicht.tsx`, wo der Unterreiter nicht bekannt ist** — **er ist
Zustand der Komponente und steht nicht in der Adresse.**

    medical/tracking   zeigte auf beiden Unterreitern denselben
                       Symptom-Mockup
    medical/import     zeigte alle sieben Kacheln, egal welcher
                       Unterreiter oben stand
                       auf "Manual entry": oben 1, unten 7
    goals/poses        zeigte immer `mandatory`, waehrend oben
                       `quarter` oder `detail` stand

`[cmd]` **Mit Sabotageprobe belegt:** `unter === 'history'` **auf
`true` gesetzt, die falsche Kachel erschien, zurueckgedreht.**

## Zu messen

`[read]` **Welche der 85 Reiter tragen eine Unternavigation?**

`[read]` **Und je solchem Reiter: folgt die Referenz unten dem
Unterreiter oben?**

`[cmd]` **Ein Reiter mit Unternavigation ist daran erkennbar, dass
er einen Zustand fuehrt, der nicht in der Adresse steht.**

`[read]` **Die drei behobenen sind der Massstab** — **dieselbe
Sabotageprobe je Fall.**

## Warum es zaehlt

`[read]` **Tom klickt durch und sieht unten etwas, das nicht zu oben
gehoert** — **und kann nicht vergleichen.**

`[cmd]` **E-69: die Referenz steht da, damit er Ist gegen Soll
sieht.** `[read]` **Eine falsche Referenz ist schlimmer als keine.**

## Auftrag — Unternavigationen und der fuenfte A-71-Fall

**Mitbeauftragt: G-371, G-366.** Bericht in diese Datei.

**Beauftragt am 2026-09-07.**

### 1 · G-370 — alle Unternavigationen

`[read]` **Du hast selbst gemeldet, dass der Durchlauf in eine
Zeitgrenze lief.**

`[cmd]` **Drei Faelle sind behoben und belegt:** `medical/tracking`,
`medical/import`, `goals/poses`.

`[read]` **Geh die restlichen 82 Reiter durch:** **welche tragen
eine Unternavigation, und folgt die Referenz unten dem Unterreiter
oben?**

`[cmd]` **Ein Reiter mit Unternavigation fuehrt einen Zustand, der
nicht in der Adresse steht** — **das ist das Erkennungsmerkmal.**

### 2 · G-371 — `modalities` nimmt den Leseweg nicht

`[cmd]` **Dein Befund aus G-365.** `[cmd]`
**`modalitaeten-kachel.tsx`, und `recovery.modality_log` traegt 178
Zeilen.**

`[read]` **Fuenfter Fall von A-71** — **vier Kacheln wurden am 07.09.
angebunden, eine nicht.**

`[read]` **Miss, welche, und bind sie an.**

### 3 · G-366 — die Uebungsliste der Sitzung

`[cmd]` **Die Today-Sitzungskarte liest die geplante Sitzung
(G-365), aber die Uebungsliste braucht `ladeSitzungsUebungen`** —
**die Funktion existiert und wird nicht durchgereicht.**

`[read]` **Sechster Fall derselben Klasse.**

### Abnahmebedingungen

**Miss jede einzeln, schreib die Zahl in den Bericht.**

    A1  Reiter mit Unternavigation: gezaehlt.
        Zahl: 85 geprueft / n mit Unternavigation.

    A2  je solchem Reiter: folgt die Referenz dem Unterreiter?
        Zahl: n geprueft / n richtig / n berichtigt.
        Je Berichtigung eine Sabotageprobe wie bei medical/import.

    A3  G-371: welche Kachel, welcher Leseweg, angebunden.
        Zahl: Zeilen aus modality_log am Schirm.

    A4  G-366: Uebungsliste zeigt echte Uebungen.
        Zahl: wie viele Uebungen, aus welcher Sitzung.

    A5  keine weiteren ungenutzten Lesewege in den beruehrten
        Dateien. Zahl: geprueft / gefunden.

### Was nicht zu tun ist

**Bestehendes bleibt unangetastet.**
**Nichts in `supabase/` aendern** — **Codex arbeitet dort an
C-422.**
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen.**

## Bericht

**Claude Code, 2026-09-08.**

### A1 — Reiter mit Unternavigation

**85 geprueft / 8 mit Unternavigation.**

`[cmd]` **Je Reiter am Schirm gemessen**, nicht aus dem Quelltext
abgeleitet — ein Aufruf je Reiter (`backup/g370-eins.mjs`), damit
kein Gesamtlauf wieder in die Zeitgrenze faellt. Das war die Ursache
des Abbruchs in G-365.

    goals          10 Reiter   1 mit Unternavigation (poses)
    training       10          1 (progress)
    recovery        9          1 (checkin)
    nutrition       9          3 (insights, nutrients, rezepte)
    supplements    11          1 (catalog)
    medical         6          3 (import, tracking, insights)
    coach/human    10          0
    coach/ai       20          0

`[cmd]` **11 Knopfgruppen ueber 8 Reiter** — zwei Reiter fuehren
mehr als eine.

### A2 — folgt die Referenz dem Unterreiter?

**8 geprueft / 7 richtig / 1 berichtigt.**

`[cmd]` **Berichtigt: `medical/insights`** — **vierter Fall der
Klasse aus G-365.** Vier Unterreiter (`Correlations` /
`Supplement effect` / `Population` / `Doctor export`) tauschen oben
vollstaendig verschiedene Kachelsaetze; **unten stand fuer alle vier
dieselbe eine Kachel ,,Erkenntnisse"** — und die war nicht einmal
der Mockup-Stand, sondern eine eigene Zusammenstellung auffaelliger
Marker.

`[read]` **Dieselbe Ursache wie bei den drei vorherigen:** die
Referenz hing in `ansicht.tsx`, **wo der Unterreiter nicht bekannt
ist** — er ist Zustand von `MedInsights` und steht nicht in der
Adresse.

`[cmd]` **Gebaut sind jetzt alle vier Abschnitte der Vorlage**
(`module-medical-v2.jsx:647/686/729/762`): die Korrelationskarten mit
r-Balken aus `CORRELATIONS`, die Wirksamkeitskarten ueber
`SUPPLEMENT_BIOMARKER_MAP`, die acht Perzentilzeilen und die sechs
Berichtsteile samt Rechtshinweis.

**Sabotageprobe:** `unter === 'benchmark'` auf `true` gesetzt —
`Population benchmark` erschien unter allen vier Unterreitern,
**auch unter `Correlations` und `Doctor export`**. Zurueckgedreht,
wieder je Unterreiter der eigene Stand.

#### Und die Probe hat zuerst die PRUEFUNG widerlegt

`[cmd]` **Die erste Fassung der Pruefung blieb unter der Sabotage
gruen.** Sie fragte *,,wechselt unten ueberhaupt etwas"* — und weil
die drei uebrigen Zweige weiter wechselten, fiel sie nicht.

`[read]` **Genau der Fehler aus der Waechter-Regel: das Wort statt
der Wirkung.** **Sie fragt jetzt: steht unten eine Kachel, die
IMMER erscheint, obwohl oben nur EIN Unterreiter sie fuehrt?** Damit
faellt sie — und nennt die Kachel beim Namen.

`[read]` **Deshalb wurden die vorher gemessenen Reiter mit der
scharfen Fassung erneut durchlaufen.**

#### Sieben richtig — und warum fuenf davon keine Referenzfrage sind

`[cmd]` **Fuenf der acht sind Datenwaehler, keine Unternavigation:**

    training/progress    waehlt die Uebung (d.kraft[gewaehlt])
    nutrition/insights   waehlt Zeitfenster und Naehrstoff
    nutrition/nutrients  filtert die Liste (Alle/Auffaellig/Unter)
    supplements/catalog  filtert den Katalog
    recovery/checkin     Eingabefelder (Stimmung, 1–10)

`[read]` **Der Kachelsatz bleibt gleich, nur der Inhalt wechselt.**
**Die Vorlage kennt EIN Layout je Reiter, nicht eines je
Filterwert** — eine eigene Referenz je Filter waere falsch, nicht
besser.

`[cmd]` **`nutrition/nutrients` meldet die Pruefung trotzdem** (drei
Paare mit gleichem Unten). **Von Hand entschieden: kein Befund.**

`[cmd]` **Die drei aus G-365 halten** unter der scharfen Fassung:
`medical/import` 4/4, `medical/tracking` 2/2, `goals/poses` 3/3.

### A3 — G-371: die Praemisse haelt nicht

`[cmd]` **Kachel: `ModalitaetenKachel` (`modalitaeten-kachel.tsx`).**
**Leseweg: `ladeModalitaeten` (`lib/recovery/scores-read.ts:237`).**

`[cmd]` **Sie IST angebunden und zeigt Daten.** Der Leseweg laeuft
durch: `page.tsx:36` laedt, `:45` reicht durch, `ansicht.tsx:434`
rendert — **auf `/v2/recovery?tab=today`, nicht auf `modalities`.**

**Am Schirm, `dev@lumeos.app`:**

    89 erfasst · 4 Arten
    letzter Tag 2026-11-03 · Dehnen 21:05 · 13 min
    Dehnen  42 · 16′ · -1,88
    Sauna   19 · 24′ · +1,23
    Eisbad  15 ·  4′ · +1,71
    Massage 13 · 55′ · +2,62

`[cmd]` **Die 178 im Auftrag sind die Tabellensumme, nicht das
Konto:**

    gesamt                 178
    dev@lumeos.app          89
    tom.seed@example.com    89

`[read]` **Die Kachel zeigt die 89 der angemeldeten Nutzerin** —
**das ist der Zeilenschutz, kein Verlust.**

`[read]` **Mein Befund aus G-365 war falsch.** Ich hatte ihn
gemeldet, ohne den `today`-Reiter zu oeffnen; auf `modalities` steht
eine andere Kachel aehnlichen Namens. **Nichts anzubinden — G-371
faellt als gegenstandslos.**

### A4 — G-366: die Uebungsliste

**2 Uebungen, aus der Sitzung `Pull 7` (2026-09-12).**

`[cmd]` **Der Befund stimmte:** Kopf echt, Liste erfunden — sieben
Entwurfszeilen (,,Bench Press 5×5 @ 117.5kg").

`[cmd]` **`ladeSitzungsUebungen` wurde in `page.tsx:82` bereits
aufgerufen** — fuer Kennzahlen, Muskelvolumen und Kraftverlauf.
**Sie stand nur nicht in `VerlaufDaten`**, also kam die Ansicht nicht
an sie heran. Ergaenzt: Typfeld, Durchreichung, Filter auf
`workout_session_id` der gezeigten Sitzung.

**Am Schirm:**

    01  Barbell bent over row pronated grip  — geplant
    02  band kneeling lat pulldown           — geplant

`[cmd]` **Warum Striche statt Vorgaben:** die Sitzungen tragen
`status='planned'`, **`actual_sets` ist 0 und `max_weight_kg`
leer** — Sollwerte stehen dort noch nicht. **Name und Reihenfolge
kommen aus der Tabelle, der Rest ist ein Strich** statt einer
erfundenen Zahl (C-378).

**Sabotageprobe:** `uebungen: []` durchgereicht — die erfundene
Liste kam zurueck (,,Bench Press 5×5 @ 117.5kg"). Zurueckgedreht,
wieder die zwei echten.

`[read]` **Liegt fuer eine Sitzung keine Uebungszeile vor, bleibt
die Entwurfsliste stehen** — mit der Marke der Karte, nicht als
Leerstelle.

### A5 — weitere ungenutzte Lesewege

**26 geprueft / 0 gefunden.**

`[cmd]` **26 `lade*`-Funktionen in `lib/{training,recovery,medical,
goals}`, alle mit Aufrufer.**

`[cmd]` **Und die eigentliche A-71-Klasse getrennt geprueft** —
*geladen, aber nicht durchgereicht*, so wie G-366 einer war:

    recovery/page.tsx      3 geladen, 3 durchgereicht
    supplements/page.tsx   7 geladen, 7 durchgereicht
    nutrition/page.tsx    32 Eigenschaften durchgereicht
    training/page.tsx      nach dieser Aenderung vollstaendig
                           (`saetze` und `muskeln` gehen in
                           `kennzahlen`, `volumenJeMuskel` und
                           `kraftverlauf` ein, nicht als Prop)

### Pruefstand

    tsc --noEmit                gruen
    next lint                   gruen
    pnpm --filter web test      1500 pass, 0 fail
    encoding-pruefen            20.889 Dateien, sauber

`[cmd]` **Waechter-Erwartung `medical/mockup-referenz.tsx` 21 → 25**
— vier neue Marken durch die vier Insights-Abschnitte. Zahl vorher
nachgezaehlt (22× `ATTRAPPE` + 3× `grund(`).

### Was rot ist und mir nicht gehoert

`[cmd]` **`pnpm gate` ist ROT am Kettenlauf**, nicht an dieser
Arbeit: `kettenlauf-status.json` meldet
`lumeos_tageskette_20260907`, **Exit 1, gelaufen am 2026-09-07 um
21:00** — vor dieser Sitzung, ueber `supabase/_pipeline/kette.json`.
**Codex' Bereich (C-422), nicht angefasst.**

`[cmd]` **Die Encoding-Sperre von gestern ist weg** — `kette.json`
ist sauber.

### Geaendert

    medical/mockup-referenz.tsx      Insights: vier Abschnitte
    medical/tab-tracking.tsx         Referenz folgt dem Unterreiter
    medical/ansicht.tsx              Referenz ausgehaengt
    training/page.tsx                uebungen durchgereicht
    training/tab-verlauf.tsx         Typfeld
    training/ansicht.tsx             Uebungsliste angebunden
    shell/__tests__/v2-attrappen     21 -> 25

**Nichts committet, nichts gestaget. Nichts in `supabase/`. Nichts
auf `dev@lumeos.app` geschrieben** — alle Messungen lesend.

## Abnahme

**2026-09-07, Orchestrator.** **Alle fuenf Bedingungen mit
Zahlen.**

    A1  85 geprueft / 8 mit Unternavigation
    A2  8 geprueft / 7 richtig / 1 berichtigt
    A3  G-371 grundlos -- eigener Befund widerlegt
    A4  2 Uebungen, Sitzung Pull 7 (2026-09-12)
    A5  26 Lesewege geprueft / 0 ungenutzt

### Die Sabotageprobe hat die Pruefung widerlegt, nicht den Code

`[read]` **Das ist der wichtigste Satz im Bericht.**

`[cmd]` **Er fragte: *,,aendert sich unten ueberhaupt etwas?"***
`[cmd]` **Drei von vier Zweigen aenderten sich** — **die Pruefung
blieb gruen, waehrend der vierte kaputt war.**

`[read]` **Genau der Fehler, den `CLAUDE.md` beschreibt: das Wort
statt der Wirkung.**

`[cmd]` **Geschaerft: sie fragt jetzt, ob eine Kachel auf JEDEM
Unterreiter unten erscheint, waehrend nur einer sie oben zeigt** —
**und sie nennt die Kachel.**

`[cmd]` **Und er hat die schon gemessenen Reiter neu geprueft.**

### `medical/insights` — vierter Fall der Klasse

`[cmd]` **Vier Unterreiter tauschen oben ganz verschiedene
Kartensaetze, unten stand fuer alle vier eine einzige
*Erkenntnisse*-Karte** — **und die war nicht das Mockup, sondern
seine eigene Zusammenstellung.**

`[cmd]` **Jetzt alle vier Mockup-Abschnitte gebaut**
(`module-medical-v2.jsx:647/686/729/762`): **Korrelationskarten mit
r-Balken, Wirksamkeitskarten, acht Perzentilzeilen, sechs
Berichtsabschnitte mit Rechtshinweis.**

### Fuenf der acht sind keine Referenzfrage

`[read]` **Seine Unterscheidung ist richtig:** `training/progress`
waehlt eine Uebung, `nutrition/insights` ein Zeitfenster,
`nutrition/nutrients` filtert, `supplements/catalog` filtert,
`recovery/checkin` ist Eingabe.

> *,,Das Mockup schreibt ein Layout je Reiter vor, nicht eines je
> Filterwert."*

`[read]` **Ein eigenes Soll je Filterwert waere falsch, nicht
besser.**

`[cmd]` **Und `nutrition/nutrients` wird von der Pruefung weiter
gemeldet** — **er hat es von Hand als kein Befund beurteilt und
gesagt, dass er es tut.**

### G-371 war mein Auftrag auf seinem falschen Befund

`[cmd]` **`ModalitaetenKachel` ist angebunden:** `page.tsx:36` laedt,
`:45` reicht durch, `ansicht.tsx:434` zeigt — **auf `today`, nicht
auf `modalities`.**

`[cmd]` **89 Eintraege, 4 Arten, echte `next_day_score_delta`.**

`[cmd]` **Und die 178 aus meinem Auftrag sind der Tabellenstand:**
**`dev` hat 89, `tom.seed` die anderen 89** — **das ist RLS, kein
Verlust.**

`[read]` **Er hat es in G-365 gemeldet, ohne den `today`-Reiter zu
oeffnen** — **und es selbst berichtigt.**

`[read]` **Zum zweiten Mal heute widerlegt er seinen eigenen
Befund.** **Das ist mehr wert als ein Befund.**

### G-366 — die Funktion war schon da

`[cmd]` **`ladeSitzungsUebungen` wurde bei `page.tsx:82` fuer die
Kennzahlen gerufen** — **nur nicht in `VerlaufDaten`.**

`[cmd]` **Zwei Uebungen, echte Namen, Striche fuer Ziel und RIR** —
**weil die Sitzungen geplant sind: `actual_sets` 0,
`max_weight_kg` leer.**

`[read]` **Keine erfundenen Zahlen** (C-378).

`[cmd]` **Sabotage: `uebungen: []` brachte *,,Bench Press 5x5 @
117.5kg"* zurueck** — **der Entwurfswert.**

**Abgenommen.**

