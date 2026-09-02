---
nr: C-394
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-09-02
braucht: []
kind_von: C-392
entscheidung: E-58
agent: codex
beauftragt: 2026-09-02
erledigt: 2026-09-02
commit: 13c12f6f
beruehrt:
  tabellen: [nutrition.meal_slots]
zahlen:
  gemessen: 2026-09-02
  dev: 5
  test_user: 0
---

# C-394 — `test-user` hat keine Slots

## Befund

Aus C-392, 2026-09-02.

`[cmd]` **Der Bericht sagt: *,,Beide Konten haben je fuenf gemessene
Slots."***

`[cmd]` **Nachgemessen: `dev@lumeos.app` fuenf, `test-user@lumeos.
local` null.**

    dev          Fruehstueck 07:30, Snack 10:14, Mittagessen 12:30,
                 Nachmittagssnack 16:00, Abendessen 19:30
    test-user    keine

## Zu klaeren

`[read]` **Warum bekam `test-user` keine?** `[cmd]` **Fehlt die
`food_preferences`-Zeile, oder gibt es keine Mahlzeiten, aus denen
sich Zeiten ableiten liessen?**

`[read]` **Und was zeigt G-332 einem Konto ohne Slots?** `[read]`
**Eine leere Liste waere richtig, wenn der Nutzer noch nichts
festgelegt hat** — **aber der Weg dorthin muss vorhanden sein.**

`[cmd]` **Nachweise werden auf `test-user` gefuehrt** — **ohne Slots
laesst sich G-332 dort nicht belegen.**

## Auftrag

**Mitbeauftragt: C-393, C-388, C-389.** Bericht in diese Datei.

`[read]` **Vorbereitet am 2026-09-02.**

### 1 · C-394 — warum `test-user` keine Slots hat

`[cmd]` **`dev` fuenf, `test-user` null.** `[read]` **Miss, woran es
liegt** — fehlende `food_preferences`-Zeile, keine Mahlzeiten, oder
etwas Drittes.

`[read]` **Nachweise werden auf `test-user` gefuehrt** — **ohne
Slots laesst sich G-332 dort nicht belegen.**

### 2 · C-393 — eine Pruefung erwartet eine Tabelle, die es nicht gibt

`[cmd]` **Die Schema-Vollstaendigkeit bleibt rot:**
`supplements.substance_group_memberships` **0 statt 8** — **und die
Tabelle existiert gar nicht.**

`[cmd]` **`supplements.supplement_groups` gibt es.**

`[read]` **Woher kommt die Sollzahl 8, und wer sollte die Zeilen
schreiben?** `[read]` **Solange die Pruefung rot bleibt, verdeckt sie
neue Fehler.**

### 3 · C-388 und C-389 — zwei Reste aus C-35

`[cmd]` **C-388: 504 mehrzeilige Familien ohne 100/000-Form, nur 101
mit eindeutigem hoechstem `sort_weight`, 403 gebunden.**

`[read]` **Der dritte Fall aus C-35 greift bei 101 von 504** —
**ein vierter fehlt, oder eine Kuration.**

`[cmd]` **C-389: Frucht, Saft und Nektar liegen alle in `obst`,
`processing_level` bei Saft ist `raw`.**

`[read]` **Ein Saft ist kein rohes Obst.** `[read]` **Und mit
`match_reason` aus C-391 laesst sich jetzt zeigen, warum ein Saft
oben steht.**

### Was nicht zu tun ist

`apps/` nicht anfassen. Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `neustart`, kein `start`, kein `aufraeumen`.**

### Nachweis

    test-user        warum keine Slots, mit Zahl
    C-393            woher die 8, wer sollte schreiben
    C-388            greift ein vierter Fall, oder Kuration
    C-389            processing_level bei Saft, mit match_reason

## Bericht

**Stand 2026-09-02 — gemessen, nichts gebaut.**

### C-394 — `test-user` ist kein versaeumter Slot-Seed

`test-user@lumeos.local` existiert, hat aber **keine** Zeile in
`nutrition.food_preferences`, **0 Meals** und damit **0 Zeiten** sowie
**0 Slots**. Das sind schon zwei Gruende, aus denen C-392 keine
Initialwerte ableiten konnte.

Der dritte ist im C-392-Kettenschritt explizit: `seed_accounts` waehlt
nur `dev@lumeos.app` und `tom.seed@example.com` aus. `test-user` kann
also auch mit einer spaeter angelegten Preference-Zeile nicht durch
diesen historischen Zwei-Konten-Seed fallen. Die Aussage aus C-392
lautete folglich zu weit: fuenf Slots tragen genau die zwei damaligen
Preference-Konten, nicht alle Testkonten.

Das ist kein Grund, Testdaten anzulegen. Fuer G-332 ist die leere Liste
der korrekte Ausgangszustand; der noch zu bauende Schreibweg muss nach
der Eingabe der Anzahl die Slots fuer den angemeldeten Nutzer anlegen.
Bis dahin kann G-332 auf `test-user` keinen bestehenden Slot anzeigen.

### C-393 — die Acht kommt aus einer Kimi-Regel, ihr Schreiber fehlt live

`supplements.substance_group_memberships` ist auf dev nicht leer,
sondern nicht vorhanden (`to_regclass = NULL`). Die
`supabase_migrations.schema_migrations` traegt nur die Baseline; die
C-327-Migration ist nicht eingespielt. Daher existiert auch keine live
installierte Gruppen-Regelauswertung, die die Tabelle lesen koennte.

Die Sollzahl 8 ist dennoch belegt: `rule_catalog.wr_chelation_timing`
nennt genau acht Stoff-Slugs. Kettenschritt `327` legt die fachliche
Brueckentabelle an; **327a** ist ihr alleiniger Schreiber und ersetzt
die Zeilen mit Quelle `kimi:warning_rules/wr_chelation_timing` aus
genau dieser Regel. `supplement_groups` ist dagegen die getrennte
Produktebene und kein Ersatz.

Der rote Sollwert ist damit richtig, aber derzeit ein stets roter
Fehler: 327 und 327a muessen in den dev-Stand eingespielt werden, erst
dann prueft die Acht neue Abweichungen statt das fehlende Schema erneut
zu melden.

### C-388 — es gibt einen technischen, aber keinen fachlichen vierten Fall

Die Messung bestaetigt 504 mehrzeilige BLS-Praefixfamilien ohne
`100`/`000`: 101 haben ein eindeutiges hoechstes `sort_weight`, 403
sind dort gebunden.

Die Suche hat nach `sort_weight` noch Namenslaenge, Anzeigename und
BLS-Code als Stichentscheid. Unter den 403 gebundenen Familien waere
der kuerzeste Rohname in 366 eindeutig, in 37 weiterhin gebunden. Das
ist jedoch **kein Vertretermodell**: Bei `B107` gewinnt etwa
*Vollkornbrot mit Quark* vor *... mit Buttermilch* nur wegen des
kuerzeren Namens. Beide sind unterschiedliche Erzeugnisse, keine
belegte Grundform.

Damit greift kein vierter fachlicher Fall. Die Suche ist deterministisch,
aber die fehlenden 403 Vertreter bleiben entweder eine neue, belegte
Regel oder Kuration; aus der heutigen Sortierung darf kein Vertreterfeld
abgeleitet werden.

### C-389 — Saft trifft als Name und bleibt faelschlich `raw`

Alle drei geprueften Familien liegen weiter in Kategorie `obst`:

| Familie | Frucht | Saft/Nektar | processing_level bei Saft/Nektar |
| --- | --- | --- | --- |
| F201 | Aprikose | Aprikosensaft | raw |
| F603 | Orange | Orangensaft, Orangennektar | raw, raw |
| F310 | Weintraube | Traubensaft | raw |

Die Suche nach `Aprikose` liefert 24 Treffer. `F201100` steht auf
Rang 1, *Aprikosensaft* auf Rang 6; beide haben `match_reason =
name_prefix`. Der Saft kommt also nicht wegen einer Kategorie- oder
Aliasentscheidung nach oben, sondern weil sein Name die Suchanfrage
beginnt. Seine `sort_weight` 510 bindet ihn zudem mit der geduensteten
Aprikose, waehrend die rohe Frucht 840 hat.

Die drei vorhandenen Felder behaupten damit gleichzeitig Frucht, roh
und Volltreffer. Eine Trennung von Saft/Nektar ist weiter nicht gebaut;
ohne Quelle oder Entscheidung wird sie hier nicht gesetzt.

Keine Tabellen, Tags, Suchrangregel oder Testdaten wurden geaendert;
`apps/`, Dev-Server, Stage und Commit blieben unberuehrt.

## Abnahme

**2026-09-02, Orchestrator.**

### `test-user` hat keine Slots, und das ist richtig

`[cmd]` **`test-user` hat keine Preferences, keine Meals und liegt
nicht im historischen Zwei-Konten-Seed.**

`[read]` **Null Slots sind damit erwartbar** — **kein Fehler im
Seed, sondern ein Konto ohne Grundlage.**

`[read]` **Aber es bleibt ein Problem fuer den Nachweis:** `[cmd]`
**Nachweise werden auf `test-user` gefuehrt** — **ohne Slots laesst
sich G-332 dort nicht belegen.** **Als G-334.**

### C-393 — die Sollzahl 8 hat eine Quelle

`[cmd]` **Sie stammt aus `wr_chelation_timing`.** `[cmd]` **327 und
327a sind der vorgesehene Tabellen- und Schreibweg** — **auf `dev`
nie eingespielt.**

`[read]` **Damit ist die rote Pruefung erklaerbar:** **sie erwartet
einen Kettenschritt, der nicht gelaufen ist.**

`[read]` **Zu entscheiden bleibt: einspielen oder die Erwartung
zuruecknehmen.** `[read]` **Solange sie rot bleibt, verdeckt sie neue
Fehler.**

### C-388 — es gibt keinen vierten Fall

`[cmd]` **Die 403 gebundenen Familien haben nur technische
Namens-Stichentscheide, keinen fachlichen vierten Vertreterfall.**

`[read]` **Das beantwortet die Frage negativ** — **eine Regel hilft
dort nicht, nur Kuration.**

### C-389 — belegt, mit Rang

`[cmd]` **Saft und Nektar bleiben in `obst` und `raw`.** `[cmd]`
**`Aprikosensaft` trifft bei *Aprikose* per `name_prefix` und steht
auf Rang 6.**

`[read]` **Der Treffergrund aus C-391 zeigt jetzt, warum** — **und
dass es kein Synonym- oder Aliasfehler ist, sondern der Name selbst.**

**Abgenommen.**
