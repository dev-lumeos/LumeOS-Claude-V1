---
nr: G-240
typ: befund
modul: supplements
schwere: hoch
angelegt: 2026-08-28
braucht: []
kind_von: null
entscheidung: null
agent: claudecode
beauftragt: 2026-08-28
erledigt: 2026-08-28
commit: OFFEN
beruehrt:
  dateien: [docs/spezifikation/00-MODULSTAND.md]
zahlen: null
---

# G-240 — der massgebliche Supplements-Mockup ist ungelesen

## Befund

**Aus der Modulstand-Erhebung vom 2026-08-28**,
`docs/spezifikation/00-MODULSTAND.md`.

`[cmd]` **226 KB in vier `.jsx`-Dateien** unter
`docs/spezifikation/10-plattform/design-system/theme-v1/`:
`module-supplements.jsx` (1.606 Zeilen, 6 Reiter), `-spec.jsx`
(1.082), `-modals.jsx` (704), `-injection.jsx` (524).

`[cmd]` **Der `.js`-Ordner `apps/web/public/mockup/features/supplements/`
enthaelt dagegen vier Spiegel-Stubs von zusammen 120 Zeilen** mit
hartkodiertem Beispiel-Stack. `[read]` **Er ist nicht die
Zielgestalt.**

`[read]` **Was zu tun ist:** den `.jsx`-Bestand gegen `v2/supplements/`
(24 Dateien) halten. **Sechs Reiter im Mockup — Today, Stack,
Database, Compliance, Interactions, Cost.** `[cmd]` **`Cost` kommt im
gebauten Stand nicht vor.**

## Auftrag

### Vorweg

`[read]` **Die Zahlen misst du.** `[cmd]` Seit dem 27.08. traegt ein
Auftrag keine Zahlen mehr vom Orchestrator.

`[read]` **Und der Mockup ist aus der Spec entstanden, mit Abgleich
zum alten Repo.** **Wenn du einen Unterschied findest, ist die erste
Frage, ob du richtig hingesehen hast** — nicht, ob jemand etwas
erfunden hat. `[cmd]` **Das hat dir in G-239 die Codesysteme
gerettet** (`CLD` gegen `CL`) und mir am 28.08. dreimal einen falschen
Befund erspart, als ich endlich nachgesehen habe.

### Die Quellen, in dieser Reihenfolge

    docs/spezifikation/10-plattform/design-system/theme-v1/
        module-supplements.jsx           1.606 Zeilen, 6 Reiter
        module-supplements-spec.jsx      1.082
        module-supplements-modals.jsx      704
        module-supplements-injection.jsx   524

    docs/specs/Supplements/              13 Dateien, SPEC_01-10
        plus SCHEMA_NEUAUFBAU.md
        plus "Injection Planner - Spec Change Request"

    apps/web/src/app/v2/supplements/     24 Dateien

`[cmd]` **NICHT `apps/web/public/mockup/features/supplements/`** —
das sind vier Spiegel-Stubs von zusammen 120 Zeilen mit hartkodiertem
Beispiel-Stack. **Ich habe sie am 28.08. fuer den Mockup gehalten und
drei Stunden verloren.**

### Zu tun

**Je Reiter ein Urteil.** `[cmd]` **Der Mockup fuehrt sechs:** Today ·
Stack · Database · Compliance · Interactions · Cost.

    stimmen sie ueberein         belegt
    im Mockup, nicht gebaut      benannt
    gebaut, nicht im Mockup      woher kommt es?
    widerspruechlich             beide Aussagen nennen, nicht
                                 aufloesen

`[cmd]` **`Cost` kommt im gebauten Stand nicht vor** — pruef das und
sag, was der Mockup dort zeigt.

`[read]` **Und der Injektionsplaner hat eine eigene Spec-Aenderung**
(*,,Spec Change Request"*, 17,9 KB). `[cmd]` Gebaut ist
`tab-injektionen.tsx` mit 27 KB. **Pruef, ob die Aenderung darin
angekommen ist.**

### Was nicht zu tun ist

**Nichts bauen.** `[read]` **Dies ist die Analyse vor dem Bau.** Was
du findest, wird ein Punkt und dann ein Auftrag.
**Keine Spec und keinen Mockup aendern.**
**Keinen Code aus dem Vorgaengerrepo uebernehmen** — Struktur ja,
Code nie.
**Kein Katalogausbau** — Tom, 27.08.: *,,Schluss mit
Katalogdetails."*
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    Reiter im Mockup             6, je benannt
    Reiter gebaut                Zahl
    vollstaendig                 Zahl
    fehlend                      je einzeln
    ueberzaehlig                 je einzeln, mit Herkunft
    widerspruechlich             je einzeln, beide Aussagen
    Injektionsplaner             Spec-Aenderung angekommen?
    Attrappen im Modul           Zahl

`[read]` **Und die Frage, die am Ende beantwortet sein muss:** was
kann gebaut werden, ohne dass eine Entscheidung fehlt? **Daraus wird
der Bauauftrag.**

### Regeln

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
**Lesend, ohne Schreibvorgaenge.**
`[cmd]` **Der Dev-Server beendet sich von selbst** (G-205), falls du
ihn fuer eine Sichtpruefung brauchst.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Bericht

**Der Mockup ist gelesen — und der gebaute Stand deckt ihn weit
besser ab, als der Auftrag annimmt.** **Zwei Zahlen im Auftrag
stimmen nicht**, und beide Male war die erste Frage, ob ich richtig
hingesehen habe. **Ich habe nachgesehen.**

### Zwei Berichtigungen zum Auftrag

**1 · Der Mockup fuehrt elf Reiter, nicht sechs.** `[cmd]`
`module-supplements.jsx:241-253`:

    today · stack · extended · catalog · stacks · intel
    inventory · injection · compliance · interactions · cost

`[read]` **Der Auftrag nennt sechs** — Today, Stack, Database,
Compliance, Interactions, Cost. **Die fehlenden fuenf sind nicht
vergessen, sondern liegen woanders:** `module-supplements.jsx`
rendert sieben Reiter selbst und delegiert fuenf an
`window.*`-Komponenten. `[cmd]` Die stehen in `-spec.jsx` (Catalog
252, Stacks 509, Intelligence 590, Interactions 703, Inventory 775)
und `-injection.jsx` (InjectionPlanner 92). **Wer nur die erste Datei
liest, sieht sechs.**

`[cmd]` **Und `database` ist der siebte im Dispatch** (Zeile 262),
steht aber nicht in der Reiterleiste — dort heisst er `catalog`.
**Beide zeigen im gebauten Stand dieselbe Komponente `SuppDatabase`.**

**2 · `Cost` IST gebaut.** `[cmd]` `ansicht.tsx:101` fuehrt den
Reiter, `:339` rendert `<SuppCost />`, und `tabs.tsx:899-905`
entscheidet `daten ? <CostEcht /> : <CostAttrappe />`. `[read]` **Der
Auftrag sagt *„Cost kommt im gebauten Stand nicht vor"* — das trifft
nicht zu.**

`[cmd]` **Was der Mockup dort zeigt** (259 Zeilen, der zweitgroesste
Reiter): *Cost · 12 months trend*, *Spend per supplement · this
month*, *Category split*, *If you removed…*, *Cost optimization ·
suggestions*, dazu die Kennzahlen *Monthly*, *Annual run-rate*, *Per
active day*.

`[cmd]` **Gebaut sind alle fuenf Karten** — dieselben Titel in
`tabs.tsx`. **Auf dem Schirm traegt der Reiter eine Attrappe**, und
zwar mit benanntem Grund: `[cmd]` *„Der Stack liest jetzt
`supplements.supplements`. Dort gibt es keine Quelle fuer
`cost_per_serving` und `serving_size`"* (C-250). `[read]` **Statt
einer 0-Euro-Rechnung steht der fehlende Messpfad da** — das ist die
richtige Entscheidung und kein Versaeumnis.

### Reiter fuer Reiter

`[cmd]` **Elf im Mockup, elf gebaut, alle elf mit derselben Kennung.**
Gemessen am 2026-08-28, Attrappen auf dem **gerenderten** Schirm
(A-24), angemeldet als `dev@lumeos.app`:

    Reiter          Attrappen  Karten  Urteil
    today                   0       7  stimmt ueberein
    stack                   0       2  stimmt ueberein
    extended                6       7  Karten da, Daten fehlen
    catalog                 0       2  stimmt ueberein
    stacks                  4       5  Karten da, Daten fehlen
    intel                   7       8  Karten da, Daten fehlen
    inventory               0       6  stimmt ueberein
    injection               6      11  Karten da, Daten fehlen
    compliance              0       4  stimmt ueberein (siehe unten)
    interactions            0       5  stimmt ueberein
    cost                    1       2  eine Karte, benannter Grund

`[cmd]` **Sechs von elf Reitern zeigen KEINE Attrappe** — today,
stack, catalog, inventory, compliance, interactions.

`[read]` **Kein Reiter ist „im Mockup, nicht gebaut". Kein Reiter ist
„gebaut, nicht im Mockup".** Die Zuordnung ist eins zu eins.

**Ein Befund zum Zaehlen selbst:** `[cmd]` im Quelltext stehen **89
Attrappenmarken**, auf dem Schirm sind es **24**. `[read]` **Der
Unterschied ist kein Widerspruch, sondern das Rueckfallmuster:**
`return daten ? <TodayEcht /> : <TodayAttrappe />`. **Die Marke steht
im Code fuer den Fall, dass nichts geladen wird** — mit den Daten von
`dev` greift sie nicht. **Wer im Quelltext zaehlt, ueberschaetzt den
Attrappenanteil um mehr als das Dreifache.**

`[cmd]` **`compliance` ist der Sonderfall:** 11 Marken im Quelltext,
0 auf dem Schirm — **seine Attrappen liegen in der Unteransicht
*Calendar*, und die Vorgabe ist *Heatmap*.** Wer umschaltet, sieht
sie.

### Was die echten Reiter tragen

`[cmd]` **Sechs Ladewege fuellen das Modul** (`page.tsx:77-84`):
`getStackDaten`, `getKatalog`, `ladeRegeln`, `ladeGate`,
`ladeSubstanzListe`, `ladeEigeneStacks`.

`[cmd]` **Datenlage auf dev, gemessen 2026-08-28:**

    supplements.supplements      596   Katalog
    supplements.stack_items       11   Stack
    supplements.intake_logs      360   Einnahmen
    supplements.rule_catalog      64   Regeln
    supplements.user_stacks        1   eigene Stacks

### Der Injektionsplaner: die Aenderung ist angekommen — die Daten nicht

`[cmd]` **Die Spec-Aenderung** (`Injection Planner · Spec Change
Request.md`, 17,4 KB, 14 Abschnitte, Status *„implemented in
prototype, not yet in spec"*) **fordert drei Entitaeten:**
`injection_sites`, `injection_logs`, `injection_schedule` (letzteres
abgeleitet, nicht gespeichert).

`[cmd]` **Gegen den gebauten Stand geprueft — nach der SACHE, nicht
nach dem Bezeichner. Alle zwoelf Forderungen sind da:**

    Orte als Referenzdaten     Volumengrenze je Ort
    Ruhefenster je Ort         Kuerzel fuer die Karte
    Koordinaten Koerperkarte   Vorder-/Rueckansicht
    Weg IM/SubQ                Injektionsprotokoll
    Plan der naechsten         Rotationsalgorithmus
    Nadelempfehlung            Ueberlastungswarnung

`[read]` **Und hier hat mich die Regel aus G-239 zum zweiten Mal
gerettet.** `[cmd]` **Mein erster Lauf meldete vier Fehlstellen** —
Volumengrenze, Ruhefenster, Kartenmarke, Koerperkoordinaten. **Alle
vier waren falsch:** der gebaute Stand fuehrt `maxMl` statt
`max_volume_ml`, `restDays` statt `rest_days`, `short` statt
`short_code`. **Dieselbe Sache, deutsche Bezeichner** — genau die
Klasse `CLD` gegen `CL`. **Wer nach dem Spec-Namen sucht, findet
nichts und meldet eine Luecke, die es nicht gibt.**

`[cmd]` **Was WIRKLICH fehlt, ist die Datenseite:** keine der drei
Tabellen existiert. Gesucht ueber `information_schema` nach
`%injection%` und `%injektion%` in **allen** Schemata — **null
Treffer.**

`[cmd]` **Der gebaute Reiter sagt das selbst**, in seiner
Attrappenmarke (`tab-injektionen.tsx:40`): *„Es gibt keine Tabelle
fuer Injektionen — weder Orte noch Protokoll noch Plan. Die Zahlen
stammen aus der Vorlage."*

`[cmd]` **Und `injektion-daten.ts` dokumentiert die Herkunft
sauber:** *„MECHANISCH UEBERNOMMEN, nicht abgetippt. Geaendert wurde
nur `const` → `export const`"*, mit Zeilenangabe je Liste
(`INJ_SITES` 5-21, `INJ_LOG` 25-36, `INJ_SCHEDULE` 49-57). **Es gibt
keinen Datenbankzugriff in dieser Datei.**

`[read]` **Urteil: die Aenderung ist vollstaendig in der Oberflaeche
angekommen und vollstaendig ohne Datengrundlage.** Der Reiter ist
eine getreue, ehrlich markierte Vorschau.

### Ein Widerspruch, beide Aussagen genannt

`[cmd]` **Der Auftrag nennt vier Dateigroessen** — 1.606 / 1.082 /
704 / 524 Zeilen. `[cmd]` **Gemessen sind es 1.605 / 1.081 / 703 /
523.** `[read]` **Jeweils genau eins weniger** — das ist die
Zaehlweise der letzten Zeile ohne Zeilenumbruch, kein inhaltlicher
Unterschied. **Ich loese es nicht auf, ich nenne beide Zahlen.**

`[cmd]` **Der Auftrag nennt 24 Dateien unter `v2/supplements/`,
gezaehlt sind 20** (davon 18 `.ts`/`.tsx`, dazu `supplements.css` und
das Testverzeichnis). `[read]` **Moeglich, dass die vier Testdateien
mitgezaehlt wurden** — `__tests__` enthaelt sie, ich habe den Ordner
als eins gezaehlt.

### Nachweisliste

    Reiter im Mockup        [cmd] 11, je benannt (nicht 6)
    Reiter gebaut           [cmd] 11
    vollstaendig            [cmd] 6 ohne Attrappe auf dem Schirm
    fehlend                 [cmd] 0 — kein Mockup-Reiter ohne Bau
    ueberzaehlig            [cmd] 0 — kein gebauter Reiter ohne Mockup
    widerspruechlich        [cmd] 2 Zaehlfragen, beide oben genannt
    Injektionsplaner        [cmd] Oberflaeche ja, Datenseite nein
    Attrappen im Modul      [cmd] 24 auf dem Schirm, 89 im Quelltext

### Was gebaut werden kann, ohne dass eine Entscheidung fehlt

`[read]` **Die Frage, die der Auftrag am Ende stellt.** Nach der
Messung zerfaellt der Rest in drei Gruppen:

**A · Datengrundlage fehlt, Entscheidung liegt vor** — baubar, sobald
Codex die Tabelle liefert:

    injection    3 Entitaeten, in der Spec-Aenderung vollstaendig
                 beschrieben (Spalten, Typen, Constraints). 6
                 Attrappenkarten warten darauf.
    cost         `cost_per_serving` und `serving_size` fehlen in
                 `supplements.supplements` (C-250 benennt es). 5
                 Karten sind gebaut.

**B · Datengrundlage da, Anbindung fehlt** — sofort baubar:

    stacks       4 Attrappen; `user_stacks` traegt 1 Zeile auf dev,
                 `ladeEigeneStacks` laedt sie bereits.
    compliance   Kalenderansicht mit 11 Marken im Quelltext;
                 `intake_logs` traegt 360 Zeilen.

**C · Entscheidung fehlt** — nicht baubar ohne Tom:

    intel        7 Attrappen: Gap analysis, Redundancy detection,
                 Training-aware timing. `[read]` **Das sind
                 Bewertungen**, und die Grenze aus C-108/F-02 lautet
                 *„Nennen ja, bewerten nein"*. **Ob und wie weit das
                 hier gilt, ist eine Produktentscheidung.**
    extended     6 Attrappen hinter dem Extended-Gate. `[read]` Wer
                 sie sieht und unter welcher Stufe, ist ebenfalls
                 nicht technisch zu klaeren.

`[read]` **Der naechste Bauauftrag liegt damit in Gruppe B** — dort
fehlt weder eine Tabelle noch eine Entscheidung.

### Abgrenzung der Zahlen

**Alle Zahlen sind von mir gemessen**, am 2026-08-28 gegen den
Bestand und den laufenden Dev-Server.

`[read]` **Abgrenzung bei „Attrappen":** zwei verschiedene Groessen,
beide genannt. **Auf dem Schirm** zaehlt `.v2-attrappe` im
gerenderten DOM (A-24) — das ist, was ein Nutzer sieht. **Im
Quelltext** zaehlt `attrappe=|InEntwicklungKnopf` — das schliesst
Rueckfallzweige ein, die mit Daten nie rendern.

`[read]` **Abgrenzung bei „Reiter":** gezaehlt aus der Reiterleiste
(`items={[...]}`), nicht aus dem Dispatch. **Der Dispatch fuehrt im
Mockup einen zwoelften Zweig (`database`), der in keiner Leiste
steht.**

`[read]` **Abgrenzung bei den Ladezeiten:** 2.819-3.304 ms je Reiter,
**nicht kalt/warm getrennt** — der Auftrag verlangt es hier nicht,
und die Reiter teilen sich eine Serverkomponente.

**Nichts gebaut, nichts geaendert, nicht committet.** Weder Spec noch
Mockup noch Code angefasst — nur gelesen.

## Abnahme

**2026-08-28, Orchestrator.**

`[cmd]` **Elf Reiter im Mockup, elf gebaut, eins zu eins.** Keiner
fehlt, keiner ist ueberzaehlig, sechs zeigen keine Attrappe.

### Zwei Auftragszahlen von mir waren falsch

`[cmd]` **Der Mockup fuehrt elf Reiter, nicht sechs.**
`module-supplements.jsx` rendert sieben selbst und delegiert fuenf an
`window.*`-Komponenten in `-spec.jsx` und `-injection.jsx`. **Wer nur
die erste Datei liest, sieht sechs** — genau das habe ich getan.

`[cmd]` **`Cost` ist gebaut** — `ansicht.tsx:101` fuehrt den Reiter,
`tabs.tsx:899` entscheidet `daten ? <CostEcht /> : <CostAttrappe />`.
**Alle fuenf Mockup-Karten existieren.** `[read]` **Und die eine
Attrappe hat einen benannten Grund:** `cost_per_serving` und
`serving_size` fehlen in `supplements.supplements` (C-250) — **statt
einer 0-Euro-Rechnung steht der fehlende Messpfad da.**

### Der Messbefund, der ueber dieses Modul hinausgeht

`[cmd]` **Im Quelltext stehen 89 Attrappenmarken, auf dem Schirm sind
es 24.**

`[read]` **Kein Widerspruch, sondern das Rueckfallmuster**
`daten ? <Echt /> : <Attrappe />` — **die Marke steht fuer den Fall,
dass nichts laedt.** `[read]` **Wer im Quelltext zaehlt, ueberschaetzt
den Attrappenanteil um mehr als das Dreifache.**

`[read]` **Das entwertet meine Attrappenzaehlung im Modulstand** und
gehoert dort vermerkt.

### Der Injektionsplaner

`[cmd]` **Alle zwoelf Forderungen der Spec-Aenderung sind in der
Oberflaeche angekommen** — **und vollstaendig ohne Datengrundlage:
keine der drei Tabellen existiert, in keinem Schema.** Der Reiter sagt
das in seiner Attrappenmarke selbst.

`[read]` **Und die G-239-Regel hat ein zweites Mal getragen:** der
erste Lauf meldete vier Fehlstellen — **alle vier falsch**, weil der
gebaute Stand `maxMl` statt `max_volume_ml`, `restDays` statt
`rest_days`, `short` statt `short_code` fuehrt. **Dieselbe Sache,
deutsche Bezeichner.**

### Die Bauliste

    sofort baubar     stacks (4 Attrappen, `user_stacks` wird
                      geladen) und die Kalenderansicht von
                      compliance (`intake_logs`, 360 Zeilen)
    wartet auf Codex  injection (3 Entitaeten) und cost (2 Spalten)
    wartet auf Tom    intel und extended - Gap analysis, Redundancy
                      detection und Training-aware timing sind
                      Bewertungen, und C-108/F-02 sagt
                      "Nennen ja, bewerten nein"

`[cmd]` **Zwei Zaehlfragen offen gelassen statt aufgeloest:** die vier
Dateigroessen liegen je eine Zeile niedriger (Zeilenumbruch am
Dateiende), und 20 gegen 24 Dateien unter `v2/supplements/` —
vermutlich wurden die Testdateien mitgezaehlt. `[read]` **Benannt,
nicht weggerechnet.**

**Abgenommen.**

