# G-191 — Claude Code, 2026-08-25

Bericht: `docs/berichte/g-191-claude-code.md`

**Die Mengen-Kachel zeigt eine Begruendung statt einer Menge.**

**Tom, 2026-08-25**, nach dem Durchklicken von Astaxanthin, GHK-Cu und
Drostanolon: *„woher kommen diese unterschiedlichen darstellungen?"*

---

## Es sind nicht drei Darstellungen, sondern ein Fehler in drei
## Ausprägungen

`[cmd]` `guideline_dose` ist ein **Objekt**, kein Text:

    {"value": null,
     "source_ids": [],
     "missing_reason": "No validated clinical guideline dose
                        (no position stand/clinical practice
                        guideline with a specific supplemental dose)",
     "provenance_type": "CLINICAL_GUIDELINE"}

**Die Kachel rendert das Objekt als Zeichenkette.** Deshalb steht dort
*„No validated clinical guideline dose"*, *„NO_RELIABLE_EVIDENCE"* und
*„TRIAL_EXPOSURE"* — **englische Statuscodes an der Stelle, wo eine
Menge stehen soll.**

`[cmd]` **Und es ist der Normalfall, nicht die Ausnahme:**

    guideline_dose gesamt              290
    davon mit echtem Wert               18
    davon nur mit missing_reason       272
    upper_limit mit echtem Wert          3

`[read]` **Die Kachel ist in 94 % der Faelle falsch gefuellt.**

`[cmd]` **Testosterone Enanthate sieht gut aus, weil das Feld dort
leer ist** — nicht weil es besser gepflegt waere. **Da steht nichts,
das falsch gerendert werden koennte.**

`[read]` **Die Ursache liegt in meinem C-270-Auftrag.** Ich habe
*„Kimis Dosis-Anreicherung importieren"* geschrieben, ohne zu sagen,
dass die Felder Objekte mit `value` und `missing_reason` sind. **Codex
hat das Objekt verlustfrei uebernommen — richtig. Die Anzeige liest es
als Text.**

Dasselbe bei `upper_limit`: *„UL concept applies to nutrients
(IOM/EFSA DRI framework); no regulatory UL exists for this compound ·
REGULATORY_UL"*.

## WAS ZU TUN IST

### 1 · Die Kachel liest `value`, nicht das Objekt

**Ist `value` null, entfaellt die Kachel.** `[read]` Das ist die
Regel aus §9, die ueberall sonst greift — **hier greift sie nicht, weil
das Feld technisch gefuellt ist.**

### 2 · `missing_reason` ist nicht wertlos

`[read]` *„Keine validierte Leitliniendosis"* ist eine Aussage: **es
gibt keine, nicht wir wissen es nicht.** Genau die Unterscheidung, an
der der ganze Katalog haengt.

**Sie gehoert als kleiner Hinweis dorthin, wo die Kachel staende** —
nicht als grosse Zahl, nicht als Statuscode.

`[cmd]` **Aber sie ist englisch.** Das ist der einzige Ort im Katalog,
wo Englisch durchschlaegt. `[read]` **Zwei Wege, deine Entscheidung
mit Begruendung:** eine Abbildung der wiederkehrenden Gruende auf
deutsche Saetze in der Anzeige, oder die deutschen Fassungen bei Kimi
nachfordern. `[cmd]` **Miss zuerst, wie viele verschiedene Gruende es
gibt** — bei 272 Zeilen sind es vermutlich weniger als zehn.

### 3 · Die Kachel braucht eine Breitenbegrenzung fuer Text

`[cmd]` `NO_RELIABLE_EVI...` laeuft ueber den Rand und drueckt das
Raster auseinander.

`[read]` **Das ist die `max-width`-Regel aus G-181**, die fuer
Zahlenkacheln nicht galt — **weil dort nie Text stand.** Jetzt steht
welcher, und die Regel fehlt.

### 4 · Dasselbe bei `upper_limit`

`[cmd]` **3 von 290 mit Wert.** Gleiche Behandlung.

`[read]` **Und pruef die uebrigen Felder derselben Herkunft:**
`studied_dose_ranges`, `official_label_dose`, `frequency`,
`duration_studied` sind aus demselben Import. **Miss, welche Objekte
sind und wie sie heute gerendert werden.**

## WAS NICHT ZU TUN IST

**Keine Texte aendern.** Das ist Anzeige, nicht Inhalt.
**Keinen Wert erfinden**, wo `value` null ist.
**Die Objekte nicht flachklopfen** — `source_ids` und
`provenance_type` gehoeren zur Belegkette und werden gebraucht.

`supabase/_pipeline/` nicht anfassen — Codex arbeitet dort.
Nicht committen, nicht stagen, nicht pushen.

## NACHWEIS

**Zahl der Kacheln, die heute einen Statuscode zeigen** — vor und nach
dem Bau. `[cmd]` Erwartung vorher: **272 bei `guideline_dose`, 287 bei
`upper_limit`.**

**Gegenprobe an vier namentlich genannten:** Astaxanthin (Grund statt
Menge) · GHK-Cu (`NO_RELIABLE_EVIDENCE`) · Drostanolon enanthate ·
**Testosterone Enanthate** — `[cmd]` das Feld ist dort leer und **darf
sich nicht aendern.**

**Negativprobe:** ein Objekt mit gefuelltem `value` auf null setzen —
die Kachel muss verschwinden und der Hinweis erscheinen.

`node tools/schuss.mjs`, `test-user@lumeos.local`, **bei 1280 und
1920** — die Breitenbegrenzung ist Teil des Nachweises.

## REGELN

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
Nie `pnpm dev` — nur `python tools/server.py`.
`.next` nie loeschen, `next build` nie direkt aufrufen.

`[cmd]` **Der Dev-Server laeuft auf PID 343416** — Tom sieht sich den
Katalog gerade an. **Neustart nur, wenn noetig, und dann melden.**

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**
