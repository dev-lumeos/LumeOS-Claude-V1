---
nr: C-159
typ: feature
modul: quer
schwere: mittel
angelegt: 2026-08-20
braucht: []
kind_von: G-110
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# C-159 - Sieben Regelpfade zeigen auf Schemata, die es nicht gibt

## Befund

(neu 2026-08-20). **Die Landkarte dessen, was fehlt.** Befund
  aus G-110.

  `[cmd]` **Von zwoelf `missing_input`-Pfaden haengen sieben an Quellen
  ohne Tabelle:**

  | | |
  |---|---|
  | **kein Schema `sleep`** | Recovery-Entwurf: `sleep_data` zurueckgestellt bis Wearable-Import |
  | **kein `location`** | nirgends im Repo |
  | **keine Symptomtabelle** | G-84: *„fuer Symptome gibt es keine Tabelle im ganzen Schema"* |
  | **kein `training.high_impact`** | im Feldvertrag genannt, nicht gebaut |

  `[read]` **Das ist wertvoller als eine Liste fehlender Felder** — es
  sagt, **welche Module die Regel-Engine noch nicht erreicht.**

  `[cmd]` **Und es deckt sich mit F-06:** *„Die Arbeitsobjekte haben keine
  Tabelle."* **Dieselbe Luecke aus anderer Richtung gemessen.**

## Auftrag — drei Befunde an der Regelmaschine

**Mitbeauftragt: C-271, C-279.** Bericht in diese Datei.

**Beauftragt am 2026-09-02.**

### Warum diese drei zusammen

`[read]` **Alle drei betreffen `rule_catalog` und
`rule_assessment`** — **die Maschine, die aus Daten Aussagen macht.**

`[cmd]` **C-159: sieben Regelpfade zeigen auf Schemata, die es nicht
gibt.**
`[cmd]` **C-271: `rule_catalog` laedt immer, jeder Rueckfallzweig
daran haengt.**
`[cmd]` **C-279: das Kreuzprodukt in `rule_assessment` skaliert mit
den Zeilen.**

`[read]` **Der erste sagt, dass Regeln ins Leere zeigen** — **der
dritte, dass sie teuer werden, wenn sie es nicht taeten.**

### Was zu messen ist

`[read]` **C-159 zuerst:** **welche sieben, und zeigen sie heute noch
ins Leere?** `[cmd]` **Seit den Punkten sind Tabellen dazugekommen** —
`meal_slots`, `meal_plan_slots`, `injection_sites`,
`food_tags_kuriert`.

`[read]` **Dann C-279:** **wie gross ist das Kreuzprodukt heute?**
`[cmd]` **Miss mit den echten Zeilenzahlen, nicht mit einer
Schaetzung.**

`[read]` **Und C-271:** **was laedt immer, und was kostet es?**

### Was nicht zu tun ist

**Keine Regel loeschen** — messen, dann melden.
**Keine Datenlogik in `migrations/`.**
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `neustart`, kein `start`, kein `aufraeumen`.**

### Nachweis

    sieben Pfade   welche, und ob sie noch ins Leere zeigen
    Kreuzprodukt   Zeilen mal Zeilen, mit echten Zahlen
    rule_catalog   was laedt immer, in ms gemessen

## Bericht

**Gemessen am 2026-09-02, ausschliesslich lesend gegen die lokale
Live-Datenbank.** Keine Regel, Migration, `apps/`-Datei oder
Nutzerdaten wurden veraendert.

### C-159 — aus sieben historischen Pfaden werden heute fuenf

`[cmd]` **Die historische Zahl sieben ist im heutigen Katalog nicht
mehr als sieben Pfade reproduzierbar:** Er traegt nur sechs der
damaligen Quellgruppe. `sleep.tracked_nights` steht weiterhin im
Input-Status, aber nicht mehr in `rule_catalog`; zusammen ergibt sich
der nachvollziehbare heutige Abgleich:

    Pfad                         heutige Quelle       Regel heute
    sleep.sleep_latency_min      fehlt (kein sleep)   gap_sleep_onset
    sleep.quality_score          fehlt (kein sleep)   gap_stress_training_load
    sleep.tracked_nights         fehlt (kein sleep)   keine Katalogregel mehr
    location.low_sun             fehlt (kein location) gap_vitd_sun
    medical.symptoms             vorhanden            gap_joint_loading
    training.high_impact         fehlt                gap_joint_loading
    profile.indoor_dominant      fehlt                gap_vitd_sun

`[cmd]` **`medical.symptoms` ist seit dem alten Befund hinzugekommen.**
Damit zeigen von den noch im Katalog referenzierten sechs historischen
Pfaden heute **fuenf** ins Leere; der siebte, nicht mehr referenzierte
Schlafpfad aendert an keinem aktuellen Regelresultat etwas.

`[cmd]` **Die neuen Tabellen `nutrition.meal_slots`,
`nutrition.meal_plan_slots`, `medical.injection_sites` und
`nutrition.food_tags_kuriert` existieren alle.** Kein einziger der 64
Katalogeintraege referenziert einen davon. Sie schliessen daher keinen
der Regelpfade.

`[cmd]` **Auf `dev@lumeos.app` stehen die vier betroffenen Regeln
derzeit auf `unsupported_operator`, nicht auf `missing_input`.** Der
Katalog fuehrt die statischen fehlenden Pfade weiter, doch
`rule_assessment` prueft ununterstuetzte Operatoren zuerst. Der
Gesamtstand ist 23 `unsupported_operator`, 40 `not_fulfilled`, 1
`fulfilled`, 0 `missing_input`. Das aendert nichts an den fehlenden
Quellen, verdeckt sie aber im heutigen Ausgabepfad.

### C-279 — das historische Kreuzprodukt wird nicht mehr gebaut

`[cmd]` **Echte Bestandszahlen:** `supplements.rule_catalog` hat 64
Zeilen, `supplements.intake_logs` 744; davon 360 bei
`dev@lumeos.app` und 24 bei `test-user@lumeos.local`. Das historische
Produkt waere damit heute:

    dev          360 Einnahmen × 64 Regeln = 23.040
    test-user     24 Einnahmen × 64 Regeln =  1.536
    gesamter DB  744 Einnahmen × 64 Regeln = 47.616

`[cmd]` **Dieses Produkt existiert im heutigen
`supplements.rule_assessment` aber nicht:** Der Funktionskoerper
referenziert `intake_logs` nicht. Er liefert fuer beide Konten genau
64 Regelzeilen; sein vorhandenes `CROSS JOIN LATERAL` liest nur
Risikoflag-Schluessel eines Wirkstoffs, nicht Einnahmen gegen Regeln.

`[cmd]` **Gemessene Funktionszeit (je ein `EXPLAIN ANALYZE`):** dev
170,363 ms bei 360 Einnahmen, test-user 26,150 ms bei 24 Einnahmen.
Das ist ein weiterhin deutlicher Kontounterschied, aber kein Nachweis
des alten 64-mal-Einnahmen-Kreuzprodukts; die Ursache liegt im
aktuellen Funktionskoerper an anderer Stelle.

### C-271 — der kleine Katalog wird bei jedem eingeloggten Aufruf geladen

`[cmd]` **`ladeRegeln()` startet fuer jeden eingeloggten Aufruf immer
parallel** `rule_assessment(user, tag)` **und**
`SELECT rule_id, rule_kind FROM supplements.rule_catalog`. Die zweite
Abfrage startet auch dann, wenn die Auswertung anschliessend fehlschlaegt;
nur ohne angemeldeten Nutzer endet die Funktion vorher.

`[cmd]` **Der Kataloglesevorgang liefert 64 Zeilen.** Sieben warme
Servermessungen mittels `EXPLAIN ANALYZE` ergaben 0,112 bis 0,160 ms,
Median **0,117 ms** (nur PostgreSQL-Ausfuehrung, ohne HTTP/Next.js).
Der Katalog selbst ist damit nicht die gemessene 170-ms-Last der
Regelauswertung.

`[read]` **Der Rueckfallzweig aus C-271 ist inzwischen aus dem
ausfuehrbaren Interactions-Tab entfernt.** Fundstellen von
`regeln.length === 0` sind nur noch Kommentar oder Test; bei einem
Katalogfehler zeigt der Lesepfad einen Fehler statt einer nie
erreichbaren Ersatzansicht.

**Ergebnis:** Keine Regel geloescht. C-159 ist von sieben historischen
auf fuenf aktuell nicht aufloesbare Katalogpfade geschrumpft; C-279s
beschriebenes Einnahmen-Kreuzprodukt ist im aktuellen Funktionskoerper
nicht mehr vorhanden; C-271s Katalogabfrage bleibt absichtlich immer,
ist lokal aber mit 0,117 ms nicht der Engpass.

## Abnahme

**2026-09-02, Orchestrator.**

### C-159 — von sieben auf fuenf

`[cmd]` **Fuenf aktuell referenzierte Pfade zeigen weiter ins
Leere.** `[cmd]` **`medical.symptoms` existiert inzwischen.**

`[read]` **Der Punkt sagte sieben** — **einer ist gebaut worden,
einer war offenbar nie zutreffend.**

`[read]` **Das ist der Wert einer Nachmessung:** **eine alte Zahl
altert, ohne dass jemand es merkt.**

### C-279 — der Befund ist verschwunden

`[cmd]` **Das historische Einnahmen-mal-Regeln-Kreuzprodukt existiert
im aktuellen `rule_assessment` nicht mehr.**

`[cmd]` **Hypothetisch waeren es 23.040 Zeilen fuer `dev`.**

`[read]` **Er hat die Zahl trotzdem gerechnet** — **damit steht fest,
was vermieden wurde, nicht nur dass es vermieden wurde.**

### C-271 — gemessen und entkraeftet

`[cmd]` **`rule_catalog` laedt bei jedem eingeloggten Aufruf mit.**
`[cmd]` **64 Zeilen kosten lokal median 0,117 ms.**

`[read]` **Der Punkt behauptete einen Engpass** — **es ist keiner.**

`[read]` **Und der Beleg ist eine Zahl mit Median, nicht ein
Einzelwert** — **ein Ausreisser haette hier alles gesagt.**

**Abgenommen.** **Alle drei bleiben offen, zwei davon deutlich
kleiner.**

