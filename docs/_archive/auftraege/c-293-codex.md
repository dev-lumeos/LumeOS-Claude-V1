# C-293 — Codex, 2026-08-27

Bericht: `docs/berichte/c-293-codex.md`

**Der Medikamentenkatalog hat 498 Wirkstoffe mit CAS, ATC,
Wirkmechanismus und Vorsichtsmassnahmen — und keinen Satz, den ein
Mensch lesen kann. Die Texte liegen auf Platte.**

---

## Vorweg: die Zahlen sind Ausgangsvermutungen

`[read]` **Pruef sie zuerst. Weicht deine ab, gilt deine — und du
nennst beide.** `[read]` **In C-292 hattest du recht und ich unrecht,
fuenfmal** — meine waren Bruttozeilen, deine die Werte mit Inhalt.
**Dieselbe Unterscheidung gilt hier wieder.**

## 1 · Die Quelle

`[cmd]` **`docs/kimi_research/supplement_performance_database/reports/
med_texts_ws/master_de_meds.jsonl`** — 498 Zeilen, 2,7 MB.

`[cmd]` **Alle 498 `entity_id` loesen auf
`medical.medication_active_substances` auf, 0 unbekannt.**

`[cmd]` **Sechzehn Felder je Record**, gemessene Fuellstaende:

    kurz_was_de                       0 leer   median 127 Zeichen
    wofuer_de                         0 leer   Liste
    wie_wirkt_de                      0 leer   median 281
    was_bringt_es_de                  0 leer   median 326
    zu_viel_de                        0 leer   median 296
    zu_wenig_de                      40 null   median 247
    wann_wie_de                       0 leer   median 280
    wer_nicht_de                      0 leer   Liste
    mythen_de                       115 null   median 200
    verschreibungspflicht_klartext_de 0 leer   median 218
    absetzen_de                       0 leer   median 255
    wechselwirkung_alltag_de          0 leer   median 296
    faq_de                            0 leer   2.313 Antworten, 3-6 je Wirkstoff

## 2 · Der Fallstrick: `null` ist hier vermutlich Absicht

`[cmd]` **Die 40 leeren `zu_wenig_de` sind `null`, nicht Leerstring** —
Sumatriptan, Nitroglycerin, Melatonin, Modafinil. `[annahme]`
**Bedarfsmedikamente haben kein *,,zu wenig"*.** Bei `mythen_de`
dasselbe Muster.

`[read]` **Das ist meine Vermutung und darf keine Annahme werden.**
**Pruef sie:** wenn die 40 und die 115 durchgaengig Bedarfs- oder
Kurzzeitmedikamente sind, ist `null` eine Aussage und gehoert als
solche gespeichert. **Wenn nicht, ist es eine Luecke und wird
gezaehlt.** `[read]` **Anders als bei Welle 1 gibt es hier kein
`missing_reason`-Feld** — die Begruendung fehlt, also muss sie
erschlossen und festgehalten werden.

## 3 · Die Zieltabellen gibt es noch nicht

`[cmd]` **`medical.medication_user_texts` und
`medical.medication_faq` existieren nicht.** Vorbild sind
`supplements.supplement_user_texts` und `supplements.supplement_faq`.

`[cmd]` **Neun der vierzehn Textfelder sind deckungsgleich** mit dem
Supplement-Muster: `kurz_was`, `wofuer`, `wie_wirkt`,
`was_bringt_es`, `zu_viel`, `zu_wenig`, `wann_wie`, `wer_nicht`,
`mythen`.

`[cmd]` **Vier sind medikamentenspezifisch und neu:**
`verschreibungspflicht_klartext`, `absetzen`,
`wechselwirkung_alltag` — dazu `faq` in eigener Tabelle.

`[cmd]` **Fuenf Supplement-Felder haben hier keine Entsprechung:**
`irreversibel`, `nicht_im_blut`, `rechtslage_klartext`, `reinheit`,
`ueberwachung`. `[read]` **Nicht mitschleppen, nur weil das Vorbild
sie hat** — ein leeres Feld in 498 Zeilen ist eine Behauptung, die
nicht eingeloest wird.

**Sprachsuffixe `_de`/`_en`/`_th` nach dem Muster der anderen Module.**
`[cmd]` **Kimi liefert nur `_de`** — `_en` und `_th` bleiben leer und
das ist richtig so.

## 4 · Die Content-QA machen wir selbst

`[read]` **Kimis QA-Kontingent ist erschoepft** (Tom, 2026-08-27).
Seine Variety-QA meldet 498/498 verschiedene `kurz_was_de` und
2.313/2.313 verschiedene FAQ-Antworten. `[read]` **Diese Zahlen
haetten wir ohnehin nachgemessen statt geglaubt** — der Ausfall
kostet uns also einen Prueflauf, den wir sowieso gemacht haetten.

**Zu messen, nicht zu glauben:**

    Verschiedenheit    kurz_was_de nach Namensbereinigung
                       FAQ-Antworten untereinander
    Kontamination      steht ein fremder Wirkstoffname im Text?
    Faktik-Stichprobe  20 Wirkstoffe gegen die Felder aus C-292
                       (mechanism_of_action, precautions, atc_code)
    Laengen            gegen die gemessenen Mediane oben

`[cmd]` **Ein Punkt, der auffaellt:** von 1.342 Quellenangaben sind
**193 als `verified: true` markiert, 1.149 nicht.** `[read]` **Nicht
als Mangel werten** — Kimi hat ehrlich unterschieden. **Aber die Zahl
gehoert in den Bericht**, und beim Faktik-Abgleich sind die
unverifizierten die interessanten.

---

## Zu tun

**Struktur und Daten getrennt**, nach dem Muster `286`/`286a` und
`292`. Struktur: zwei Tabellen mit RLS und Lesepolicy wie bei den
Supplement-Texten. Daten: 498 Textzeilen, 2.313 FAQ-Zeilen, additiv.

`sources` je Zeile mitfuehren, `verified` erhalten.
Mindestwerte in `schema-sollstand.json`.

## WAS NICHT ZU TUN IST

**Keine Texte umschreiben, kuerzen oder gluecklich machen.** `[read]`
**Wenn ein Text falsch ist, wird er gezaehlt und gemeldet, nicht
repariert** — eine stille Korrektur waere nicht nachweisbar.
**Keine `drug_class`-Tags anfassen** — das ist C-296, zehn falsche
Tags in 17 Wirkstoffen sind bekannt.
**Die elf alten Kettenschritte nicht umstellen** — C-295.
**Kein Schreibweg fuer `user_medications`** — C-285 ist offen.
`apps/` nicht anfassen. Nicht committen, nicht stagen, nicht pushen.

## NACHWEIS

    medication_user_texts Zeilen        Soll 498
    medication_faq Zeilen               Soll 2.313
    Wirkstoffe ohne Text                Soll 0
    zu_wenig_de null                    Zahl, und ob begruendbar
    mythen_de null                      Zahl, und ob begruendbar
    kurz_was_de verschieden             Zahl von 498
    FAQ-Antworten verschieden           Zahl von 2.313
    Kontaminationstreffer               Zahl, je einzeln benannt
    Faktik-Stichprobe                   20 geprueft, Abweichungen benannt
    verified-Quellen                    Zahl von 1.342
    frischer Kettenlauf                 gruen, gegen Live verglichen

`[read]` **Negativprobe:** den neuen Schritt im Manifest ueberspringen
— die Abschlusspruefung muss rot werden. **Das ist der Beleg, dass die
Mindestwerte greifen**, nicht die gruene Meldung des Normallaufs.

## REGELN

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
Wegwerf-Datenbank, nie gegen die laufende testen.
Vollsicherung vor jedem Live-Eingriff nach `backup/`.
Kimis Verzeichnis ist Datenquelle: **lesen, nicht committen.**

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**
