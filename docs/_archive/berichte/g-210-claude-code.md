# G-210 — Claude Code, 2026-08-27

Auftrag: `docs/auftraege/g-210-claude-code.md`

**„Scemblix" findet jetzt Asciminib — und sagt dazu, warum.
„Concor" bleibt leer, aber nicht mehr stumm.**

---

## 1 · Die Zahlen — zwei Abweichungen, beide nennenswert

| | Auftrag | Gemessen |
|---|---|---|
| Produkte | 448 | **448** |
| verschiedene Marken | 428 | **428** |
| Scemblix-Zeilen | 2 | **2**, beide auf `drug_0642bd1e2f` Asciminib |
| Concor | 0 | **0** |
| Formulierungen | 453 | **453** |
| Wirkstoffe mit Formulierung | 390 | **390** |
| **Wirkstoffe mit Produkt** | **124** | **380** |
| **Produkte ohne saubere Kette** | „nicht alle" | **0** |

### Die 124 sind 380

`[cmd]` **Drei Wege, dieselbe Antwort:**

    distinct active_substance_id ueber den Join   380
    exists-Abfrage je Wirkstoff                   380
    Gegenprobe „ohne Produkt"                     118

**380 + 118 = 498.** Die Rechnung geht auf; **124 kann nicht stimmen.**

`[read]` **Der Unterschied ist gross genug, um die Einschaetzung zu
drehen:** bei 124 waere die Markensuche eine Randfunktion fuer ein
Viertel des Katalogs. **Bei 380 von 498 ist sie der Normalfall.**

### Und alle 448 Produkte haengen sauber

`[cmd]` **Der Auftrag vermutete Bruchstellen — es gibt keine, und es
kann keine geben:**

    formulation_id is null                          0
    formulation_id zeigt ins Leere                  0
    Formulierung ohne active_substance_id           0
    sauber aufloesbar                             448

`[cmd]` **Der Grund ist strukturell:** `formulation_id` ist
`NOT NULL` **und** traegt den Fremdschluessel
`medication_products_formulation_id_fkey` auf
`medication_formulations(id)`. `[cmd]` **Belegt durch zwei
Eingriffsversuche, die beide von der Datenbank abgewiesen wurden** —
`violates not-null constraint` und `violates foreign key constraint`.

`[read]` **Die Zahl ist 0 und kann heute keine andere sein.**

---

## 2 · Was gebaut ist

    apps/web/src/lib/medical/wirkstoff-marke.ts       Marken, Aufloesung,
                                                     Maerkte (serverfrei)
    apps/web/src/lib/medical/wirkstoff-read.ts        + 2 Abfragen
    apps/web/src/app/v2/medical/tab-wirkstoffe.tsx    Suche, Trefferzeile,
                                                     Leerergebnis
    apps/web/src/app/v2/medical/medical.css           + 2 Bauformen
    .../__tests__/wirkstoff-marke.test.ts             21 Tests

**Die Suche sieht jetzt fuenf Felder an:** Wirkstoffname, ATC-Code,
Einzeiler, Anwendungsgebiet — **und den Handelsnamen.**

`[cmd]` **Vier Abfragen statt zwei, alle nebeneinander im selben
`Promise.all`** (die Lehre aus G-190). `[cmd]` **Der Zuwachs ist
klein:** alle Marken und Hersteller zusammen wiegen **16 kB** gegen
83 kB Listenzeilen. **Sie kommen mit der Seite, nicht ueber eine
Route.**

`[read]` **Zwei Abfragen statt eines Joins:** PostgREST liesse die
Kette `products → formulations → substances` nur ueber eingebettete
Ressourcen laufen, und die Richtung ist hier umgekehrt. **Der Join
passiert in JavaScript ueber zwei Maps** — bei 448 und 453 Zeilen
billiger als eine verschachtelte Auswahl.

---

## 3 · Der Treffer zeigt, warum er ein Treffer ist

**Gemessen im Browser, angemeldet:**

    "Scemblix"   1 Zeile: Asciminib
                 ✓ Scemblix ist ein Handelsname von Asciminib
                   · Novartis · noch 1 Hersteller
    "scemblix"   dasselbe
    "SCEMBLIX"   dasselbe
    "Asciminib"  1 Zeile: Asciminib, ohne Markenzeile
    "Lipitor"    1 Zeile: Atorvastatin, ZWEI Begruendungen
    "Concor"     0 Zeilen, Erklaerungsblock

`[read]` **Die Begruendungszeile erscheint nur, wenn die Marke den
Treffer TRAEGT.** Ohne Suchwort traegt keine Marke einen Treffer —
und 428 Markenzeilen unter 498 Wirkstoffen waeren Rauschen. **Bei
„Asciminib" bleibt sie weg**, weil der Wirkstoffname selbst getroffen
hat.

### Ein Wirkstoff steht einmal — auch bei zwei Produkten

`[cmd]` **20 Marken haben zwei Produktzeilen** mit verschiedenen
Herstellerschreibweisen (Scemblix, Lipitor, Ozempic, Eliquis,
Glucophage, Norvasc, Plavix, Seroquel, Sprycel, Tasigna …).

`[read]` **Die Entdoppelung laeuft ueber den Markennamen, die Zaehlung
ueber den Hersteller:** aus zwei Zeilen wird eine Begruendung plus
*„noch 1 Hersteller"*. **Entdoppelt heisst nicht verschwiegen.**

`[cmd]` **Der Gegenfall ist Lipitor:** Atorvastatin traegt fuenf
Marken, zwei davon enthalten *Lipitor*. **Die Zeile steht trotzdem
einmal, mit beiden Namen als Beleg** — es sind zwei verschiedene
Marken, nicht zweimal dieselbe.

---

## 4 · Das Leerergebnis schweigt nicht

**Auftrag: *„Ein leeres Ergebnis ohne Erklaerung sieht aus wie ‚gibt
es nicht', und das ist bei Concor falsch."***

`[cmd]` **Und es ist noch praeziser falsch, als der Auftrag sagt:**
Bisoprolol steht nicht nur im Katalog — **es hat sogar ein Produkt.**
Das Produkt heisst `Bisoprolol fumarate` und traegt `{US}`. **Nicht
der Wirkstoff fehlt und nicht das Produkt, sondern der europaeische
Handelsname.**

`[cmd]` **Verschiedene Marken je Rechtsraum, gemessen 2026-08-27 ueber
`unnest(jurisdictions)`:**

    US 380 · CA 92 · TH 62 · UK 60 · AU 58 · EU 56 · DE 0

`[cmd]` **DE steht bei null**, geprueft mit `'DE' = any(jurisdictions)`
— kein einziges Produkt.

**Der Block sagt vier Dinge:** dass weder Wirkstoff noch Handelsname
passten; **dass das nicht heisst, dass es das Medikament nicht gibt**;
aus welchen Maerkten die 428 Namen stammen (mit `DE · 0` in
Warnfarbe); und den Bisoprolol-Fall als Beispiel — *Zebeta* in den
USA, *Cardicor* in Grossbritannien, *Concor* im deutschsprachigen
Raum.

`[read]` **Die Markenzahl wird aus den geladenen Daten gerechnet, nicht
hingeschrieben** — damit sie nicht veraltet, wenn C-308 Produkte
nachtraegt.

---

## 5 · Keine Marke ist erfunden

**Auftrag: *„Keine Marken erfinden, ableiten oder aus dem
Wirkstoffnamen erzeugen."***

`[read]` **Es gibt keinen Rueckfall.** Ein Wirkstoff ohne Produktzeile
hat eine leere Markenliste, und die bleibt leer. **Ein Test bewacht
diese Abwesenheit** (`aus dem Wirkstoffnamen wird KEINE Marke
abgeleitet`) — wer je einen Rueckfall einbaut, faellt auf.

`[cmd]` **Nebenbei gemessen, wie viel die Markensuche wirklich
bringt:** von 428 Marken **wiederholen 264 den Wirkstoffnamen**
(`Bisoprolol fumarate`, `AMLODIPINE 5MG TABLETS`) und haetten ohnehin
getroffen. **164 sind echte Handelsnamen**, die ihn NICHT enthalten —
Aldactone → Spironolactone, Bactrim → Trimethoprim-sulfamethoxazole,
Ativan → Lorazepam. **Zwei Rechenwege, dieselbe 164.**

`[read]` **Das sind 149 Wirkstoffe, die vorher nur unter ihrem
Freinamen erreichbar waren** — also unter dem Namen, den niemand auf
der Packung liest. **Das ist der Kern des Auftrags, in einer Zahl.**

---

## 6 · NACHWEIS

| | |
|---|---|
| Suche „Scemblix" | **findet Asciminib**, 1 Zeile |
| Suche „scemblix" / „SCEMBLIX" | **desgleichen**, Gross/Klein egal |
| Suche „Asciminib" | **findet ihn weiter**, ohne Markenzeile |
| Suche „Concor" | **leer, mit Erklaerung** (Block sichtbar) |
| Marken durchsuchbar | **428** (Soll 428) |
| Wirkstoffe je Treffer | **einmal**, auch bei zwei Produkten |
| Ladezeit | **1.807 ms kalt / 1.542 ms warm**, Server war warm |
| Bildschirmfoto | `backup/g210-scemblix.png`, `-concor.png`, `-wirkstoffe.png` |

`[cmd]` **Die Ladezeit ist unveraendert** — G-208 mass 1.874 / 1.483
mit zwei Abfragen, jetzt 1.807 / 1.542 mit vier. **Der Unterschied
liegt im Rauschen; die langsamste Anfrage ist beide Male das Dokument
selbst** (533 / 293 ms), 16 Anfragen, eine ueber 300 ms.

`[cmd]` **Attrappen im neuen Code: 0.** Konsolenfehler: **1** — die
bekannte `data-mode`-Hydrationswarnung des Rahmens.

### Gates

    Tests            692 pass / 0 fail   (21 davon G-210)
    Typecheck        gruen
    Build            31/31 Routen
    serverimport     51 Client-Chunks, 0 Treffer
    verdrahtung      kein unbewachter Zuwachs (42 → 44 bewachte Namen)
    encoding         20.189 Dateien sauber

---

## 7 · NEGATIVPROBE — und warum sie woanders laeuft

**Auftrag: *„einer Marke testweise die `formulation_id` entziehen —
der Treffer muss verschwinden oder sich als unaufloesbar zeigen, nicht
auf einen falschen Wirkstoff fallen."***

`[cmd]` **Am laufenden System liess sich das nicht herstellen.** Beide
Eingriffe wurden abgewiesen:

    formulation_id = null          -> violates not-null constraint
    formulation_id = 'gibtesnicht' -> violates foreign key constraint

`[read]` **Tom hat entschieden, den Fremdschluessel dafuer NICHT zu
loesen** — und die Entscheidung war richtig: der Waechter wohnt nicht
in der Datenbank, sondern im Code.

**Deshalb ist die Aufloesung aus dem Leseweg herausgeloest worden.**
`markenJeWirkstoff()` steht jetzt in `wirkstoff-marke.ts`, serverfrei
und ohne I/O — **dort ist der Fall konstruierbar.**

`[cmd]` **Vier Tests, alle gruen:**

    ohne `formulation_id`          -> Marke faellt weg, Grund
                                      `ohne_formulierung`
    unbekannte Formulierung        -> Marke faellt weg, Grund
                                      `formulierung_unbekannt`
    kaputte NEBEN heiler Zeile     -> Glivec erbt NICHT Asciminib
    heile Kette                    -> loest auf (Gegenprobe)

### Und die Sabotage zeigt, dass sie fallen koennen

`[cmd]` **Genau der verbotene Rueckfall eingebaut** —
`?? Array.from(karte.values())[0]` statt Abbruch:

    not ok - G-210 Negativprobe: eine unbekannte Formulierung faellt weg
    not ok - G-210 Negativprobe: sie faellt NICHT auf einen fremden Wirkstoff
    # pass 690  # fail 2

`[cmd]` **Rueckbau byteidentisch**, SHA-256 vorher und nachher
`7dbfbb97c625…608f`.

### Ein Waechter ohne moeglichen Ausloeser — der Befund

**Tom, 2026-08-27:** *„Wenn dir beim Testschreiben auffaellt, dass der
Waechter gegen einen Fall schuetzt, der strukturell nicht entstehen
kann: sag es."*

**Er kann heute nicht entstehen.** `NOT NULL` plus Fremdschluessel
schliessen beide Wege aus, und 0 von 448 sind betroffen.

`[read]` **Ich habe ihn trotzdem stehen lassen, und das ist eine
Entscheidung:** die Zusage ist eine Datenbankregel, kein Naturgesetz.
**Ein `ON DELETE SET NULL`, ein Import ueber den Service-Client oder
eine spaetere Lockerung genuegen** — und C-308 wird genau an diesen
Tabellen arbeiten. **Was er kostet, sind vier Zeilen; was er
verhindert, ist ein falscher Handelsname auf einem falschen
Medikament.**

`[read]` **Der ehrliche Teil:** damit ist er heute unbewiesen im
Betrieb. **Die Tests belegen sein Verhalten, nicht seine
Notwendigkeit.** Wenn C-305 die Fremdschluessel unangetastet laesst
und C-308 nichts lockert, bleibt er tote Vorsorge — dann ist es vier
Zeilen wert, und mehr nicht.

---

## 8 · Was NICHT getan wurde

**Keine Marken erfunden oder abgeleitet** — Abschnitt 5, per Test
bewacht.
**Keine Produktdaten nachgetragen** (C-308).
**Keine Tabelle angelegt**, `supabase/_pipeline/` nicht angefasst
(C-305).
**Kein Erfassungsweg** (C-302), `user_medications` nicht beruehrt.
**Kein Constraint geloest** — nach Toms Entscheidung.
**Nicht committet, nicht gestaged, nicht gepusht.**

---

## 9 · Was mir aufgefallen ist

**1. `Effexor XR` steht zweimal, verschieden geschrieben.** `[cmd]`
`Effexor XR` und `Effexor Xr` — **deshalb sind es 428 Marken, aber nur
427 nach Normalisierung.** `[read]` Fuer die Suche harmlos (sie
vergleicht klein), fuer eine spaetere Auswertung nicht. **Dieselbe
Klasse wie die `drug_class`-Fallverdopplung aus G-208.**

**2. 174 „Marken" sind woertlich der Wirkstoffname.** `[cmd]` Gezaehlt
ueber `lower(trim(brand_name)) = lower(trim(canonical_name))`. `[read]`
**Das ist kein Fehler, aber eine Erwartungsfalle:** *„428 Marken"*
klingt nach 428 Handelsnamen. **Es sind 164.**

**3. Keine Marke zeigt auf mehr als einen Wirkstoff.** `[cmd]`
Geprueft ueber `having count(distinct active_substance_id) > 1` — **0
Treffer.** `[read]` Das macht die Aufloesung eindeutig. **Es ist ein
Datenstand, keine Zusage:** `Aspirin` als Marke fuer ein
Kombinationspraeparat wuerde es sofort brechen, und dann braucht die
Trefferzeile eine Entscheidung, die sie heute nicht braucht.

**4. 10 Formulierungen haben kein Produkt.** `[cmd]` Von 453. `[read]`
Sie sind hier folgenlos — sie tragen nur keinen Handelsnamen bei.
**Fuer C-308 ist es die Liste, an der man anfangen koennte.**

**5. Der deutsche Markt ist die eigentliche Luecke.** `[cmd]` 324 von
448 Produkten sind rein US-Zeilen, **DE 0**. `[read]` **Die Suche kann
das nur benennen, nicht heilen.** Der Erklaerungsblock ist die
ehrlichste verfuegbare Antwort — **die richtige waere eine deutsche
Produktquelle, und die ist C-308.**
