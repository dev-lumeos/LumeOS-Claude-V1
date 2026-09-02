---
nr: C-385
typ: feature
modul: medical
schwere: hoch
angelegt: 2026-09-02
braucht: []
kind_von: C-109
entscheidung: E-57
agent: codex
beauftragt: 2026-09-02
erledigt: 2026-09-02
commit: f9db161b
beruehrt:
  tabellen: [medical.symptoms]
zahlen: null
---

# C-385 — das Datenmodell fuer Injektionsstellen

## Befund

Aus E-57, 2026-09-02. **Die Recherche aendert das Modell.**

`[cmd]` **Der urspruengliche Entwurf: `injection_sites` mit
`max_ml`, `rest_days`, Nadelstaerke je Ort.**

`[read]` **Zwei der drei Felder tragen nicht:**

    rest_days      es gibt keine validierte Zahl (E-57)
    Nadel je Ort   Gauge haengt an der Viskositaet,
                   Laenge an Route, Fettdicke und Koerperbau

## Was stattdessen gebraucht wird

    route                  IM oder SC
    site                   Deltoid, Vastus, Ventrogluteal, ...
    medication_viscosity   waessrig oder oelig
    gauge_range            aus der Viskositaet
    length_range           aus Route und Koerperbau
    body_size_modifier     BMI oder gemessene Fettdicke
    evidence_type          Leitlinie / Studie / Praxisregel

`[read]` **Und drei getrennte Eigenschaften statt einer Ruhezeit:**

    minimum_rest_days      IM: null, mit Begruendung
    rotation               IM: Pflicht, ohne Zahl
                           SC: mindestens 10 mm, Quadrant je Woche
    gewebezustand          Lipohypertrophie: 3-6 Monate aussetzen

`[read]` **Der dritte ist keine laengere Pause, sondern ein anderer
Zustand.**

## Die Nadeltabelle mit Vorschlag

Tom, 2026-09-02: *,,daraus machen wir eine table und schlagen die
groessen auch vor, die daten fuer die auswahl haben wir ja aus den
profilen."*

### Die Eingaben stehen, gemessen

`[cmd]` **`public.profiles`:** `biological_sex`, `height_cm`,
`body_weight_kg`.
`[cmd]` **`goals.body_measurements`:** `weight_kg`, `body_fat_pct`,
`height_cm_snapshot`, `bmi`.

`[read]` **Alle vier Groessen, die die Quellen brauchen** — **und
`body_fat_pct` ist genauer als BMI.**

`[cmd]` **Die Recherche sagt: *,,BMI ist nur ein Proxy. Die
tatsaechlich relevante Groesse ist die Distanz Haut zu Muskel am
konkreten Injektionsort."***

### Die Tabelle traegt die Quelle je Zeile

    CDC 2026            Deltoid, sechs Gewichtsklassen, 22-25G
    Cook 2006           Deltoid, BMI >35 bei Frauen: 32 mm
    Larkin 2018         Ventrogluteal, 32 / 38 mm nach Geschlecht
    Zaybak 2007         Ventrogluteal, Fettdicke 38-54 mm bei
                        BMI >= 25
    Open RN 2023        Vastus, 25-38 mm, Gauge nach Viskositaet
    FITTER Forward 2025 SC, Pen 4 mm, Spritze 6 mm
    Spratt 2017         SC-Testosteron, 25G x 16 mm, BMI 19-50
    FDA Xyosted 2019    SC-Testosteron, 27G x 12,7 mm, 0,5 ml

### Alle zutreffenden Varianten, der Nutzer waehlt

Tom, 2026-09-02: *,,wieso soll eine quelle gewinnen, zeig einfach
alle varianten mit quellen an dann waehlt der user."*

    Deltoid, 82 kg, BMI 26, maennlich

      25-38 mm, 22-25G     CDC 2026, Gewichtsklasse 70-118 kg
      25 mm                Cook 2006, Ultraschall, BMI <35

`[read]` **Keine Rangfolge.** `[cmd]` **C-108 und F-02: nennen ja,
bewerten nein.**

`[read]` **Und wo die Quellen auseinandergehen, sieht man es** —
`[cmd]` **bei Ventrogluteal misst Larkin die noetige Laenge, Zaybak
die Fettdicke.** `[read]` **Beide zeigen heisst: der Nutzer sieht,
dass 38 mm bei starker Adipositas nicht reichen.** **Eine Rangfolge
haette das verdeckt.**

### Welcher Koerperwert gilt

Tom: *,,der letzte natuerlich das zeigt den aktuellsten stand."*

`[cmd]` **`goals.body_measurements` ist eine Messreihe** — **der
juengste Eintrag, kein Durchschnitt.**

`[read]` **Und die Anzeige nennt sein Datum:** **wer vor drei Monaten
zuletzt gewogen hat, soll das sehen, bevor er danach eine
Nadellaenge waehlt.**

## Zu messen

`[read]` **Wie viele Zeilen traegt `body_measurements` je Nutzer,
und wie alt ist der juengste Eintrag?**

`[read]` **Und was geschieht, wenn keiner existiert?** `[cmd]`
**`public.profiles` traegt `body_weight_kg` und `height_cm`** —
**daraus liesse sich BMI rechnen, aber kein `body_fat_pct`.**

## Und die Grafik

`[cmd]` **Der Tab zeigt heute die einfache Silhouette der Vorlage**
(viewBox 100x120). `[cmd]` **Tom, 19.08.: die vollstaendige Figur wie
in `MuscleBodyMap_test.html`.**

`[cmd]` **`InjektionsKarte` in `packages/ui` hat keinen Aufrufer**,
weil die Vorlage sechs Felder je Ort fuehrt, die der Baustein nicht
hat (G-53). `[read]` **Beim Grafiktausch entscheidet sich, ob sie
bleibt.**

## Auftrag — das Datenmodell fuer Injektionsstellen

**Mitbeauftragt: C-393.** Bericht in diese Datei.

**Beauftragt am 2026-09-02.**

### Die Grundlage: E-57, 18 Quellen

`[read]` **Tom hat extern recherchiert.** **Das Ergebnis ist ein
belegtes Nein:** **fuer wiederholte IM-Injektionen gibt es keine
evidenzbasierte Ruhezeit in Tagen.**

`[cmd]` **Keine Leitlinie von WHO oder CDC, keine kontrollierte
Humanstudie.**

### 1 · Drei getrennte Eigenschaften statt einer Ruhezeit

    minimum_rest_days   IM: null, mit Begruendung
    rotation            IM: Pflicht, ohne Zahl
                        SC: mindestens 10 mm, Quadrant je Woche
                        (FITTER Forward 2025)
    gewebezustand       Lipohypertrophie: 3-6 Monate aussetzen

`[read]` **Der dritte ist keine laengere Pause, sondern ein anderer
Zustand.**

### 2 · Die Nadeltabelle mit Quelle je Zeile

`[read]` **Gauge haengt an der Viskositaet, Laenge an Route und
Koerperbau** — **nicht beides am Ort.**

    route
    site
    medication_viscosity
    gauge_range
    length_range
    body_size_modifier
    evidence_type          Leitlinie / Studie / Praxisregel

**Acht Quellen, je eine Zeile:**

    CDC 2026            Deltoid, sechs Gewichtsklassen, 22-25G
    Cook 2006           Deltoid, BMI >35 bei Frauen: 32 mm
    Larkin 2018         Ventrogluteal, 32 / 38 mm nach Geschlecht
    Zaybak 2007         Ventrogluteal, Fettdicke 38-54 mm bei BMI >=25
    Open RN 2023        Vastus, 25-38 mm, Gauge nach Viskositaet
    FITTER Forward 2025 SC, Pen 4 mm, Spritze 6 mm
    Spratt 2017         SC-Testosteron, 25G x 16 mm, BMI 19-50
    FDA Xyosted 2019    SC-Testosteron, 27G x 12,7 mm, 0,5 ml

`[read]` **Keine Rangfolge zwischen den Quellen** — Tom: *,,zeig
einfach alle varianten mit quellen an dann waehlt der user."*

`[cmd]` **Die vollstaendigen Angaben stehen in E-57.**

### 3 · Die Eingaben stehen schon

`[cmd]` **`public.profiles`:** `biological_sex`, `height_cm`,
`body_weight_kg`.
`[cmd]` **`goals.body_measurements`:** `weight_kg`, `body_fat_pct`,
`height_cm_snapshot`, `bmi`.

`[cmd]` **Der juengste Eintrag gilt** — Tom: *,,der letzte
natuerlich, das zeigt den aktuellsten stand."* **Kein Durchschnitt.**

`[read]` **Miss, wie viele Zeilen `body_measurements` je Nutzer
traegt und wie alt der juengste ist** — **und was geschieht, wenn
keiner existiert.**

### 4 · C-393 — die rote Pruefung

`[cmd]` **Du hast gemessen: die Sollzahl 8 stammt aus
`wr_chelation_timing`, Schritte 327/327a sind auf `dev` nie
eingespielt.**

`[read]` **Einspielen oder die Erwartung zuruecknehmen** —
**solange sie rot bleibt, verdeckt sie neue Fehler.**

### Was nicht zu tun ist

**Keine Ruhezeit in Tagen erfinden** — E-57.
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `neustart`, kein `start`, kein `aufraeumen`.**

### Nachweis

    Tabellen         live, RLS in beide Richtungen
    acht Quellen     je eine Zeile, evidence_type gesetzt
    Deltoid 82 kg    zwei Varianten, beide mit Quelle
    Ventrogluteal    Larkin und Zaybak beide sichtbar
    body_measurem.   Zeilen je Nutzer, juengster Eintrag
    C-393            eingespielt oder Erwartung zurueckgenommen

## Bericht

**Umgesetzt und lokal eingespielt, 2026-09-02.** `apps/` blieb unveraendert; kein Dev-Server, Stage, Commit oder Push.

### C-385

Live sind `medical.injection_sites`, `medical.injection_needle_recommendations`, `medical.injection_tissue_condition_guidance`, `medical.injection_logs` und `medical.injection_site_conditions`.

- IM und SC haben `minimum_rest_days = NULL` samt Begruendung. IM fordert Rotation ohne Tageszahl; SC nutzt stattdessen 10 mm Abstand und einen Quadranten je sieben Tage.
- Lipohypertrophie ist ein eigener Gewebezustand: 3--6 Monate aussetzen, keine verlaengerte Ruhezeit.
- Die Nadel-Tabelle hat exakt acht, nicht gerankte Quellenvarianten mit allen geforderten Feldern. Evidenztypen: CDC/FITTER `guideline`, Cook/Larkin/Zaybak/Spratt `study`, Open RN `practice_rule`, FDA Xyosted ehrlich `product_label`.
- `injection_body_measurement_context` zaehlt die ganze Messreihe und nimmt den juengsten Wert nach Datum, Uhrzeit, Anlagezeit und ID. Ohne Messreihe liefert sie Profilgewicht/-groesse und berechneten BMI, aber keinen Koerperfettwert. `injection_needle_suggestions` liefert alle passenden Quellen ohne Rangfolge.

| Pruefung | Ergebnis |
| --- | --- |
| RLS | Alle fuenf Tabellen: RLS an, `anon` ohne Zugriff. Referenzdaten nur lesbar fuer `authenticated`; Log und Gewebezustand haben eigene Owner-Policies fuer alle vier Operationen. Der Test belegt eigene sowie unsichtbare und nicht aenderbare Fremdzeilen. |
| Acht Quellen | 8/8, jede mit `evidence_type`. |
| Deltoid 82 kg | BMI 25,88: CDC 2026 (22--25G, 25--38 mm) und Cook 2006 (25 mm), beide sichtbar. |
| Ventrogluteal | Mit derselben Messung: Larkin 2018 und Zaybak 2007 gleichzeitig sichtbar. Zaybak bleibt als Fettdickenmessung, nicht als Nadellaenge, gekennzeichnet. |
| Koerpermessungen | `dev@lumeos.app` und `tom.seed@example.com`: je 181 Zeilen, juengster Wert 2026-11-16. Fuenf weitere Konten, einschliesslich `test-user@lumeos.local`, haben 0; dort greift der Profil-Fallback. |
| C-393 | C-327 und deploybare C-327a sind eingespielt und in der lokalen Historie angewandt. `wr_chelation_timing` ergibt jetzt 8/8 Mitgliedschaften. |

### Validierung

`pnpm exec tsx --test supabase/_pipeline/_validierung/medical-c385-injection-sites.test.ts`, `pnpm lint`, `pnpm typecheck` und `git diff --check` sind gruen.

### Security-Review

```yaml
security_review:
  status: passed
  issues: []
```

Geprueft: RLS, fehlende `anon`-Grants, Owner-Checks in `USING` und `WITH CHECK`, ausschliesslich `SECURITY INVOKER` sowie keine medizinischen Nutzdaten in Ausgaben oder Logs.

## Abnahme

**2026-09-02, Orchestrator. Nachgemessen.**

### Fuenf Tabellen, und keine erfundene Zahl

    injection_sites                      4 Zeilen, 10 Spalten
    injection_needle_recommendations     8 Zeilen, 12 Spalten
    injection_tissue_condition_guidance  1 Zeile
    injection_site_conditions           10 Spalten
    injection_logs                       6 Spalten

`[cmd]` **Alle vier Stellen tragen `minimum_rest_days = NULL`** —
**mit `minimum_rest_days_reason` daneben.**

    im  Deltoid            rest=NULL, rotation
    im  Vastus lateralis   rest=NULL, rotation
    im  Ventrogluteal      rest=NULL, rotation
    sc  Subkutan           rest=NULL, rotation, 10 mm, Quadrant 7 d

`[read]` **Das belegte Nein aus E-57 steht als Datensatz** — **nicht
als fehlender Wert, sondern als begruendetes NULL.**

`[cmd]` **Und SC traegt die einzige Zahl, die eine Quelle hat:** 10
mm Abstand, Quadrant je Woche (FITTER Forward 2025).

### Die acht Quellen, je eine Zeile

    cdc_2026             im deltoid      22-25G   25/25-38/38 mm   guideline
    cook_2006            im deltoid      -        25 mm, BMI>35: 32   study
    larkin_2018          im ventrogl.    -        32 mm; 38 mm     study
    zaybak_2007          im ventrogl.    -        SC-Dicke 38,2-53,8  study
    open_rn_2023         im vastus       20-25G; 18-21G  25-38 mm  practice_rule
    fitter_forward_2025  sc              -        Pen 4 / Spritze 6   guideline
    spratt_2017          sc              25G      16 mm            study
    fda_xyosted_2019     sc              27G      12,7 mm          product_label

`[read]` **`evidence_type` unterscheidet vier Klassen:** `guideline`,
`study`, `practice_rule`, `product_label`.

`[read]` **Damit ist die Forderung aus E-57 erfuellt:** *,,Trenne
klar zwischen durch Leitlinie belegt und verbreiteter
Praxisempfehlung."* `[cmd]` **Open RN steht als `practice_rule`,
nicht als Leitlinie.**

`[cmd]` **Und wo eine Quelle nichts sagt, steht *Nicht
angegeben*** — **kein geratener Wert.**

`[read]` **Zaybak ist das beste Beispiel:** *,,Keine Nadellaenge
angegeben; gemessene SC-Gewebedicke 38,2-53,8 mm."* **Die Studie misst
etwas anderes als eine Empfehlung, und die Zeile sagt es.**

### Der Gewebezustand ist getrennt

`[cmd]` **`lipohypertrophy: 3-6 Monate, guideline`** — **eine eigene
Tabelle, keine laengere Ruhezeit.**

`[read]` **Genau die Trennung, die E-57 verlangt.**

### C-393 — 8 von 8

`[cmd]` **`substance_group_memberships` traegt jetzt 8
Mitgliedschaften.**

`[cmd]` **Er hat C-327 mit einem deploybaren 327a ergaenzt** —
**statt die Erwartung zurueckzunehmen.**

`[read]` **Die rote Pruefung ist gruen, ohne dass jemand die
Sollzahl gesenkt hat.**

### Und eine Nebenkorrektur

`[cmd]` **Eine zweite Migration berichtigt die
Messwert-Kontextfunktion.**

`[read]` **Er hat sie beim Bauen gefunden** — **`body_measurements`
war der Zugriffsweg fuer `body_size_modifier`.**

**Abgenommen.**

