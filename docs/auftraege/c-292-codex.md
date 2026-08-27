# C-292 — Codex, 2026-08-27

Bericht: `docs/berichte/c-292-codex.md`

**Kimis Welle 1 liegt auf Platte. Vier von fuenf Feldern gehen damit
auf 498 von 498.**

---

## Vorweg: die Zahlen sind Ausgangsvermutungen

`[read]` **Pruef sie zuerst. Weicht deine ab, gilt deine — und du
nennst beide.**

`[cmd]` **Meine Messung, 2026-08-27, aus den Dateien gezaehlt** — nicht
aus Kimis Bericht uebernommen:

| Datei in `data/evidence/` | Zeilen | Feld | leer |
|---|---:|---|---:|
| `medication_identifiers_enrichment.jsonl` | 465 | `cas` 442 · `atc` 23 | 9 · 2 |
| `medication_moa_enrichment.jsonl` | 302 | `mechanism_of_action` | 4 |
| `medication_precautions_enrichment.jsonl` | 385 | `precautions` | 4 |
| `medication_reproductive_enrichment_rest.jsonl` | 81 | Reproduktion | 0 |

`[cmd]` **465 Zeilen, 442 eindeutige `entity_id`** — 23 Wirkstoffe
tragen zwei Records (einen mit `cas`, einen mit `atc`). **Wer nach
Zeilen zaehlt, kommt auf 465 und irrt.**

## 1 · Was der Import bringt

`[cmd]` **Gemessen gegen den Live-Bestand, Ueberschneidung geprueft:**

| Feld | jetzt | Kimi | doppelt | danach |
|---|---:|---:|---:|---:|
| `cas_number` | 56 | 442 | 0 | **498 / 498** |
| `atc_code` | 490 | 23 | 15 | **498 / 498** |
| `mechanism_of_action` | 196 | 302 | 0 | **498 / 498** |
| Reproduktion | 417 | 81 | 0 | **498 / 498** |
| `precautions` | 12 | 385 | 0 | **397 / 498** |

`[cmd]` **Alle `entity_id` aus allen vier Dateien sind in
`medical.medication_active_substances` aufloesbar — 0 unbekannt.**

`[read]` **Kimi hat diesmal die Luecke geliefert, nicht den Bestand.**
Das Nachfordern von Vorhandenem, das bei den Supplements drei
Durchlaeufe gekostet hat, ist hier nicht passiert.

## 2 · Der Fallstrick: leer ist nicht gleich fehlend

`[cmd]` **Jede leere Zelle traegt eine Begruendung.** Beispiel aus
`medication_identifiers_enrichment.jsonl`:

    "cas": null
    "missing_reason": "MIXTURE_NO_SINGLE_CAS"
    "note": "Fixed-dose combination; Komponenten Buprenorphin
             52485-79-7, Naloxon 465-65-6"

`[cmd]` **Und der schwerste Fall:** in
`medication_reproductive_enrichment_rest.jsonl` ist `sex_specific` bei
**allen 81** ein leeres Objekt `{}` — die Aussage steht in
`missing_fertility_sex` (`NO_SEX_DIFFERENCE_IN_LABEL`).

`[read]` **Wer auf Schluesselanwesenheit prueft, zaehlt 81 Treffer und
importiert 81 leere Objekte.** Das ist derselbe Fehler wie bei
`pregnancy` in C-286, nur eine Ebene tiefer.

**Deshalb Vorgabe:** `missing_reason`, `note`,
`missing_pregnancy_lactation` und `missing_fertility_sex`
**mitfuehren**, und in jeder Zaehlung **auf Inhalt pruefen, nicht auf
Anwesenheit des Schluessels.**

## 3 · Der Pfad — hier bitte genau lesen

`[cmd]` **Die neuen Dateien liegen ausschliesslich unter**

    docs/kimi_research/supplement_performance_database/data/evidence/

`[cmd]` **Der Kettenschritt `286a` liest heute aus**
`backup/kimi-research/Kimi_Agent/.../data/evidence` — **dort gibt es
die vier neuen Dateien nicht.**

`[cmd]` **Gemessen:** elf Kettenschritte lesen aus dem alten Pfad,
sieben aus dem neuen. **Beide Verzeichnisse existieren, beide stehen
in `.gitignore`.** Von 2.892 gemeinsamen Dateien unterscheiden sich
drei — die Substanzdateien, im neuen Pfad groesser (das ist C-275).
**1.831 Dateien gibt es nur im alten, alle unter `metadata/`.**

`[read]` **Fuer diesen Auftrag heisst das nur:** der neue Schritt liest
aus `docs/kimi_research/`. **Die Vereinheitlichung der elf alten
Schritte ist C-295 und gehoert NICHT hier hinein.**

---

## Zu tun

**Ein neuer Kettenschritt, additiv, nach dem Muster von `286`/`286a`:**
Struktur getrennt von Daten, `depends_on` gesetzt, Mindestzeilen in der
Abschlusspruefung hinterlegt.

    cas_number              442 aus identifiers
    atc_code                 23 aus identifiers, nur wo heute leer
    mechanism_of_action     302, additiv nach pharmacology
    precautions             385
    Reproduktion             81 nach medication_reproductive_evidence

`[read]` **`atc_code` ist der einzige Fall mit Ueberschneidung** — 15
der 23 haben heute schon einen Wert. **Bestehende Werte nicht
ueberschreiben, es sei denn du kannst begruenden, warum Kimis Wert
besser ist. Dann nenn die 15 einzeln.**

`[cmd]` **Kimi meldet nebenbei 10 falsche `drug_class`-Tags im
Bestand**, dokumentiert als Notes in der MoA-Datei (Beispiel:
Olmesartan ist kein Thiazid). **Nicht stillschweigend korrigieren** —
zaehlen, auflisten, im Bericht nennen. Daraus wird ein eigener Punkt.

## WAS NICHT ZU TUN IST

**Die elf alten Kettenschritte nicht umstellen** — das ist C-295.
**Kein Schreibweg fuer `user_medications`** — C-285 ist offen.
**Die Nutzertexte aus Block D nicht anfassen** — das ist C-293.
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

## NACHWEIS

    cas_number gefuellt              gemessene Zahl, Soll 498
    atc_code gefuellt                gemessene Zahl, Soll 498
    mechanism_of_action gefuellt     gemessene Zahl, Soll 498
    Reproduktion Zeilen              gemessene Zahl, Soll 498
    precautions gefuellt             gemessene Zahl, Soll 397
    leere Werte mit missing_reason   Zahl, und keiner ohne
    frischer Kettenlauf              gruen, gegen Live verglichen

`[read]` **Negativprobe:** den neuen Schritt im Manifest ueberspringen
— die Abschlusspruefung muss rot werden. **Das ist der Beleg, dass die
Mindestzeilen greifen**, nicht die gruene Meldung des Normallaufs.

## REGELN

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
Wegwerf-Datenbank, nie gegen die laufende testen.
Vollsicherung vor jedem Live-Eingriff nach `backup/`.
Kimis Verzeichnis ist Datenquelle: **lesen, nicht committen.**

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**
