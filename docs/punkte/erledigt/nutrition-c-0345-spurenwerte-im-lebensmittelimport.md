---
nr: C-345
typ: befund
modul: nutrition
schwere: niedrig
angelegt: 2026-08-29
braucht: []
kind_von: C-343
entscheidung: null
agent: codex
beauftragt: 2026-08-31
erledigt: 2026-08-31
commit: OFFEN
beruehrt:
  tabellen: [nutrition.food_nutrients]
zahlen:
  gemessen: 2026-08-29
  quelle_zahlen: 871311
  db_zeilen: 869501
  quelle_spuren: 1800
---

# C-345 — Spurenwerte im Lebensmittelimport

## Befund

`[cmd]` **`BLS_4_0_Daten_2025_DE.xlsx` traegt 871.311 numerische
Werte, `nutrition.food_nutrients` 869.501 Zeilen.**

`[cmd]` **Und die Quelle fuehrt genau 1.800 Werte mit der
Datenherkunft *Spuren*.**

`[read]` **Ob die Spurenwerte bewusst weggelassen wurden, ist offen.**
**Die Antwort steht im Kettenschritt, der `food_nutrients`
befuellt** — nicht in der Quelldatei.

## Kein Auftrag

`[read]` **1.800 von 871.311 sind zwei Promille**, und *Spuren* heisst
laut BLS-Dokumentation ausdruecklich, dass kein gemessener Wert
vorliegt. **Wer den Punkt aufgreift, sieht zuerst im Kettenschritt
nach, ob es eine Entscheidung war.**

## Auftrag — die Datenherkunft wiederherstellen

**Mitbeauftragt: C-361.** Bericht in diese Datei.

**Beauftragt am 2026-08-30.**

### Warum dieser Punkt ploetzlich traegt

`[cmd]` **C-49 hat gemessen: `VITC` ist an 0 von 30 Tagen
vollstaendig, Vitamin A ebenso.** `[cmd]` **NRF9.3 ist damit nicht
rechenbar.**

`[cmd]` **Die Ursache: der BLS verzeichnet ein Nichtvorkommen als
FEHLEND, nicht als 0** — **und `value_complete` verlangt jeden
Posten.**

`[read]` **Am 2026-08-29 fehlte `VITC` bei Ei, Kabeljau, weissem Reis
und Ziegenfleisch.** **Alle enthalten tatsaechlich keins.**

### Und die Antwort liegt in der Quelle

`[cmd]` **Der BLS fuehrt *Logische Null* als eigene Datenherkunft:
18.566 Werte.** `[cmd]` **Er unterscheidet selbst zwischen *nicht
gemessen* und *enthaelt keins*.**

`[cmd]` **Dieser Punkt hat gemessen, dass der Import die
Unterscheidung verworfen hat** — **871.311 Zahlen in der Quelle,
869.501 Zeilen in `food_nutrients`, und `data_source` traegt einen
einzigen Wert.**

`[read]` **Damit ist C-360 vielleicht keine Entscheidung, sondern eine
Wiederherstellung.**

### Was zu messen ist

**Wie viele der fehlenden Posten tragen in der Quelle eine *Logische
Null*, und wie viele sind wirklich leer?**

`[cmd]` **Die Quelle liegt in
`docs/BrainstormDocs/Nutrition/BLS_4_0_Daten_2025_DE.xlsx`** — **je
Naehrstoff drei Spalten: Wert, Datenherkunft, Referenz.**

`[cmd]` **Und die vier Anzeigearten aus Kapitel 4.4:** numerischer
Wert, Spuren, `-` fuer fehlend, `<LOQ`/`<LOD`.

`[read]` **Miss zuerst, dann sag, ob eine Wiederherstellung C-360
beantwortet** — **oder ob eine Entscheidung uebrig bleibt.**

### 2 · C-361 — die Pipeline-Historie

`[cmd]` **Es gibt keine Stelle, die sagt, welche Kettenschritte live
sind.** `[cmd]` **`kette.json` fuehrt die Reihenfolge, nicht den
Zustand.**

`[read]` **Das hat am 30.08. G-273 blockiert** — 78 Zeilen lagen in
der Kette und waren nie eingespielt.

`[read]` **Eine Tabelle je Schritt mit Zeitpunkt und Pruefsumme ist
das uebliche Muster.** **Die Vorfrage: wer schreibt hinein — der
Schritt selbst oder der Lauf?**

### Was nicht zu tun ist

**Keine Nullen setzen, bevor die Herkunft belegt ist.**
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    fehlende Posten        wie viele mit "Logische Null"
    wirklich leer          wie viele
    Spuren                 die 1.800 aus diesem Punkt
    beantwortet es C-360   ja / nein, mit Begruendung
    Pipeline-Historie      Vorschlag, nicht gebaut

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `server.py neustart`, kein `start`, kein
`aufraeumen`.** `[read]` **Wenn eine Messung ihn braucht: melden,
nicht starten.**

`[cmd]` **Gemessen in G-280: 18 Starts, sechs an einem Tag, vor keinem
ein Fehler** — **`neustart` fuehrt `taskkill /T /F` auf Port 3200
aus, und Tom arbeitet dort mit.**

## Bericht

**Gemessen am 2026-08-31 auf `dev`; weder Werte noch Pipeline geaendert.**

| Punkt | Urteil | Nachweis |
|---|---|---|
| C-345 | **offen, Ursache eingegrenzt** | Von den 98 fehlenden VITC-Posten ist keiner eine Logische Null. |
| C-360 | **nicht durch Wiederherstellung beantwortet** | Der Rest sind 86 zensierte `<LOD`/`<LOQ`-Werte und 12 echte Luecken; beides ist nicht "enthaelt keins". |
| C-361 | **offen, Vorschlag vorgelegt** | Weder Datenbank noch Ausfuehrer fuehren den Zustand der 138 Kettenschritte. |

### C-345 - die 98 fehlenden VITC-Posten

Gezahlt wurde genau das C-360-Fenster: `dev@lumeos.app`, 2026-08-01 bis
2026-08-30. `daily_nutrient_summary_long` liefert dort 0 vollstaendige
VITC-Tage und **98** fehlende Posten, verteilt auf neun BLS-Lebensmittel.
Die jeweilige Wert-, Herkunfts- und Referenzspalte wurde direkt in
`BLS_4_0_Daten_2025_DE.xlsx` abgeglichen.

| BLS-Anzeige in der Quelle | fehlende Posten | Lebensmittel | Bedeutung |
|---|---:|---:|---|
| `Logische Null` | **0** | 0 | biologisch sicher 0; kommt im C-360-Fenster nicht vor |
| `<LOD` oder `<LOD or <LOQ` | **86** | 8 | nachgewiesen bzw. gemessen unter Nachweis-/Bestimmungsgrenze; keine Null |
| `-` | **12** | 1 | wirklich kein Wert |

Die zwoelf echten Luecken sind Ziegenfleisch. Die 86 zensierten Werte
betreffen Ei (26), polierten und unpolierten Reis (17), Thunfisch (12),
Kabeljau (12), Haferflocken (7), Skyr (6) und Lachs (6). Damit widerlegt
die Quelle die bisherige Kurzbegruendung, all diese Lebensmittel enthielten
"tatsaechlich keins": Sie bezeichnet acht der neun Faelle gerade nicht als
biologische Null.

Die Gesamtpruefung der Arbeitsmappe bestaetigt die Quellenkategorie:
7.140 Lebensmittel mal 138 Herkunftsspalten ergeben 985.320 Angaben,
darunter **18.566 `Logische Null`**, **1.800 `Spuren`** und 110.182 `-`.
Die Logische Null ist in der Datei zugleich ein numerischer Wert `0`; sie
faellt deshalb nicht unter die hier fehlenden, beim Einfrieren ausgelassenen
VITC-Posten. `food_nutrients.data_source` unterscheidet heute nur die zwei
Importwege (`bls_4_0_local_import`, `bls_4_0_xlsx_nachtrag`), nicht diese
BLS-Herkunft.

**Folge fuer C-360:** Eine Wiederherstellung der Herkunft waere richtig,
beantwortet C-360 aber fuer den konkreten NRF9.3-Blocker nicht. Sie wuerde
keinen der 98 Posten zu einer belegten Null machen. Ohne neue, explizite
Regel bleiben `<LOD`/`<LOQ` und `-` nach C-48 Regel 1 unvollstaendig. Eine
Produktentscheidung ist nur dann noch noetig, wenn LOD/LOQ bewusst anders
als fehlend behandelt werden sollen; Nullen zu setzen ist aus diesem Befund
nicht gedeckt.

### C-361 - Vorschlag, nicht gebaut

`supabase/_pipeline/kette.json` hat 138 Schritte. Die laufende Datenbank
hat keine Pipeline-Historientabelle; ihre `schema_migrations`-Tabellen
belegen nur Supabase-Migrationen. `kette-ausfuehren.ts` druckt je Schritt
ein `OK`, schreibt aber keine Historie und verweigert explizit die laufende
`postgres`-Datenbank: Es erzeugt eine Wegwerf-Datenbank und loescht sie bei
Erfolg wieder. Dieser Ausfuehrer kann daher keine Aussage ueber "live"
begrunden.

Vorschlag: Der **Live-Ausfuehrer/Deployer**, nicht der einzelne SQL- oder
TS-Schritt, schreibt nach jedem erfolgreich committeten Schritt eine
unveraenderliche Zeile. Der Einzelschritt kennt weder Manifest-Reihenfolge
noch Dateipruefsumme und wuerde bei direktem Aufruf eine irrefuehrende
Historie erzeugen.

Eine `pipeline_runs`-Kopfzeile und `pipeline_step_runs` mit `run_id`,
Manifest-Version, Schritt-ID, Pfad, SHA-256 des ausgefuehrten Inhalts,
Git-Revision, Zielinstanz, Start-/Endzeit und Ergebnis bilden die
notwendige Kette. Aufzeichnung erst nach Erfolg; ein Abbruch bleibt als
fehlgeschlagener Lauf sichtbar. Bis der **tatsaechliche Live-Ausfuehrer**
so schreibt, waere auch eine Tabelle im jetzigen Wegwerf-Runner nur ein
Testprotokoll und keine Antwort auf C-209/C-361.

## Abnahme

**2026-08-31, Orchestrator.**

### Der Befund widerlegt meine eigene Begruendung

`[cmd]` **Von 98 fehlenden VITC-Posten: 0 logische Nullen, 86
zensierte `<LOD`/`<LOQ`, 12 echte Luecken.**

`[read]` **Ich hatte in C-49 und C-360 geschrieben, Ei, Kabeljau und
weisser Reis enthielten *,,tatsaechlich keins"*.** `[cmd]` **Die
Quelle bezeichnet acht der neun Faelle gerade nicht als biologische
Null** — **sie sagt: gemessen, unterhalb der Grenze.**

`[cmd]` **Die zwoelf echten Luecken sind Ziegenfleisch.** `[cmd]`
**Die 86 zensierten: Ei 26, Reis 17, Thunfisch 12, Kabeljau 12,
Haferflocken 7, Skyr 6, Lachs 6.**

`[read]` **Und die Gesamtpruefung ordnet es ein:** `[cmd]` 985.320
Herkunftsangaben, davon 18.566 *Logische Null*, 1.800 *Spuren*,
110.182 `-`. **Die logische Null traegt in der Datei einen
numerischen Wert 0 und faellt deshalb gar nicht unter die fehlenden
Posten.**

### Die Wiederherstellung beantwortet C-360 nicht — der Standard schon

`[read]` Sein Urteil: *,,Eine Wiederherstellung der Herkunft waere
richtig, beantwortet C-360 aber nicht. Nullen zu setzen ist aus
diesem Befund nicht gedeckt."*

`[read]` **Richtig — und genau deshalb habe ich recherchiert statt
Tom zu fragen.**

**EFSA und WHO/IPCS fuehren fuer zensierte Werte eine
Substitutionsmethode:** Lower Bound setzt `<LOD`/`<LOQ` auf 0, Upper
Bound auf die Grenze, Middle Bound dazwischen. **Und die Leitlinie
nennt Naehrstoffe ausdruecklich als Anwendungsfall.**

`[cmd]` **Als E-38 entschieden: Lower Bound.** `[read]` **Weil der
BLS die Grenze nicht mitliefert** — MB und UB braeuchten den LOD-Wert,
**LB kommt ohne erfundene Zahl aus.**

`[read]` **C-345 ist damit die Voraussetzung, nicht die Antwort:**
ohne mitgefuehrte Herkunft weiss die Bilanz nicht, welche 86 Posten
zensiert sind.

### C-361 — Vorschlag, nicht gebaut

`[cmd]` **138 Kettenschritte, keine Historientabelle.** `[cmd]`
**Weder Datenbank noch Ausfuehrer fuehren den Zustand.**

`[read]` **Vorschlag vorgelegt: vom Live-Deployer geschriebene
Schritt-Historie.** **Nicht gebaut, wie beauftragt.**

**Abgenommen.** C-345 bleibt offen und wird konkret: **die Herkunft
mitfuehren, damit E-38 wirken kann.**



## Erneut beauftragt, 2026-08-31

**Mitbeauftragt mit C-343.** `[read]` **Die Messung steht; jetzt geht
es um die Wiederherstellung, damit E-38 wirken kann.**

**Umsetzung:** C-343 hat die Herkunft als
`nutrition.food_nutrients.bls_value_status` eingespielt und E-38
angewandt. Der Nachweis, die Statuszahlen und die Bilanz-Gegenprobe stehen
im [C-343-Bericht](nutrition-c-0343-vitamin-c-fehlt-an-180-von-181-tagen.md).

## Abnahme

**2026-08-31, mit C-343 abgenommen.** `[cmd]` **Die Herkunft steht in
`bls_value_status`, die 1.800 Spurenwerte tragen `NULL`.**
