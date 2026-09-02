Was in `backup/` liegen darf
=============================

**A-70, 2026-09-02.** Tom: *,,ein sauberes backupsystem das sinn
macht und nicht ein wachsendes verzeichnis mit jedem alten muell
drin."*

`[cmd]` **Stand: 11.633 Dateien, 5,97 GiB.**

---

Niemand loescht hier etwas
--------------------------

Tom, 2026-09-02: *,,alles was aelter ist wird in einen /temp ordner
gelegt den ich entsorge. ich traue niemandem mehr von euch betreffs
loeschbefehlen."*

**Kein Agent und kein Orchestrator loescht in `backup/`.**

**Was seine Frist ueberschreitet, wird nach `_temp/` verschoben.**
**Tom entsorgt.**

`[read]` **Ein Verschieben ist umkehrbar, ein Loeschen nicht.**

---

Zuerst: hier liegen Datenquellen, keine Sicherungen
---------------------------------------------------

`[cmd]` **Gemessen am 2026-09-02: sechs Kettenschritte und
Produktcode lesen aus `backup/`:**

    132_substance_alias_bridge.ts    backup/kimi-research/
    133_kimi_rules.ts                backup/kimi-research/
    134_substance_catalog.ts         backup/kimi-research/
    142_kimi_wave1_pharmacology.ts   backup/kimi-research/
    146_medications_katalog.ts       backup/kimi-research/
    101_training_seed.sql            backup/legacy-v2/training/
    080_public_bereinigen.sql        backup/schema/
    apps/web/.../evidenz/registry.ts backup/kimi-research/

`[read]` **Waeren sie geraeumt worden, waere der naechste
Kettenlauf gescheitert.**

**`kimi-research/`, `legacy-v2/` und `schema/` sind Quellen.**
**Sie werden NIE geraeumt**, bis ein eigener Auftrag sie umzieht.

---

Die Ordner
----------

### `vollsicherung/`

**Datenbanksicherungen vor strukturellen Aenderungen.**

    muss     Zeitstempel, Punktnummer, `voll` im Namen
    bleibt   die letzten drei, plus die letzte je Monat
    danach   nach `_temp/`

`[cmd]` **Heute 57 Stueck, 3,9 GiB** — **davon wurde nie eine
zurueckgespielt.** `[cmd]` **Dreimal `c250` innerhalb von drei
Minuten.**

`[read]` **Sie liegen auf derselben Platte wie das Original** —
**gegen einen Plattenausfall schuetzen sie nicht.**

### `arbeitsstaende/`

**Zwischenstaende, die zu einem Punkt gehoeren.**

    muss     ein Unterordner je Punkt: `c276/`, `g-0329/`
    bleibt   solange der Punkt offen ist
    danach   mit der Abnahme nach `_temp/`

`[cmd]` **Heute liegen sie direkt unter `backup/`** — rund 30
c-Ordner.

### `nachweise/`

**Bildschirmfotos und Proben-Skripte aus Auftraegen.**

    muss     die Punktnummer im Namen: `g329-nachher.png`
    bleibt   bis zur Abnahme
    danach   nach `_temp/`

`[cmd]` **Heute 553 Dateien direkt unter `backup/`, 106 MiB.**

### `_manifests/`

**Das Gedaechtnis. Bleibt immer.**

`[cmd]` **`tools/backup-manifest.mjs` schreibt sie** (C-216).

`[read]` **Was nach `_temp/` geht, bleibt hier nachweisbar** —
**Groesse, Datum, Pfad.** `[read]` **Deshalb ist Verschieben
verantwortbar.**

### `_temp/`

**Zum Entsorgen durch Tom. Sonst niemand.**

---

Was hier nicht hingehoert
-------------------------

`[cmd]` **Doppelte Forschungsdaten.** `[read]`
**`backup/kimi-research/` haelt 10.030 Dateien,
`docs/kimi_research/` 8.506** — **zwei Fassungen, nicht identisch.**
`[read]` **Welche gilt, ist zu klaeren** (A-70) — **aber solange die
Kette aus `backup/` liest, bleibt sie dort.**

`[cmd]` **Rohdaten-Ausfuhren.** Der Vorabhaken lehnt Dateien ueber
10 MB ab.

`[cmd]` **Ungeklaerte Ablagen.** `[read]` **Wer etwas hierher legt,
legt es in einen der Ordner** — **oder schreibt vorher auf, warum
ein weiterer noetig ist.**

---

Woechentlich raeumen
--------------------

Tom, 2026-09-02: *,,setz dir fuer die ueberwachung einen reminder
dass wir das woechentlich raeumen."*

`[cmd]` **`pnpm gate` meldet den Stand** — **wenn `backup/` mehr als
2,5 GiB traegt oder seit sieben Tagen nicht geraeumt wurde.**

`[read]` **Der Orchestrator legt dann vor, was raus kann.** **Tom
entscheidet und entsorgt.**

### Was am 02.09. geraeumt wurde

    vorher    11.633 Dateien, 5,97 GiB
    nachher   11.581 Dateien, 2,31 GiB

`[cmd]` **56 von 57 Vollsicherungen** — **3,66 GiB.** `[cmd]` **Die
juengste bleibt:** `20260830_140937_c354_vor_live`, als `.sql` und
`.dump`.

`[read]` **Keine wurde je zurueckgespielt** — **und der Zustand
entsteht ohnehin aus `supabase/_pipeline/`.**

### Was als naechstes ansteht

    c262        658,7 MiB   Arbeitsstand, Punkt erledigt
    schema      211,6 MiB   276 Kettenlauf-Sicherungen
    c255        152,7 MiB   Arbeitsstand
    (direkt)    126,1 MiB   575 lose Dateien

`[cmd]` **In `schema` liegen `20260902045205`, `...211`, `...244`
innerhalb von 40 Sekunden** — **dieselbe Sache wie bei den
Vollsicherungen, nur kleiner.**

Wann geraeumt wird
------------------

`[cmd]` **A-39: nicht, solange Agenten laufen.** `[read]` **Jemand
koennte gerade hineinschreiben.**

`[read]` **Ein Raeumlauf braucht einen Zeitpunkt, an dem beide
Agenten stillstehen** — **und er verschiebt, er loescht nicht.**
