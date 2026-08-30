# C-266 — Codex, 2026-08-25

Bericht: `docs/berichte/c-266-codex.md`

**Zwei Loecher, die C-264 hinterlassen hat.** Beide betreffen genau
die Eintraege, die ein Nutzer zuerst oeffnet.

---

## 1 · Die fuenf Enhanced-Felder sind leer

`[cmd]` **Vom Orchestrator gemessen, live:**

    irreversibel_de          0 von 290
    ueberwachung_de          0 von 290
    reinheit_de              0 von 290
    nicht_im_blut_de         0 von 290
    rechtslage_klartext_de   0 von 290

`[cmd]` **Vorher waren es 136.** Claude Code hat es in G-179 gemeldet,
der Orchestrator hat es bestaetigt.

`[read]` **Das trifft die sicherheitsrelevantesten Felder ueberhaupt.**
Bei jedem SARM und jedem Peptid ist *„was nicht zurueckkommt"*
unsichtbar — die Aussage, dass die koerpereigene Hormonproduktion sich
bei einem Teil unvollstaendig erholt. Dasselbe gilt fuer die
Ueberwachungswerte und fuer den Hinweis, dass der Inhalt der Aufschrift
nicht entsprechen muss.

**Zu tun:** feststellen, ob Kimis Lieferung die Felder traegt und der
Import sie fallen liess, oder ob sie in der Quelle fehlen. `[cmd]` Die
Quelle liegt unter
`docs/kimi_research/supplement_performance_database/data/substances/substance_user_texts.jsonl`.

`[read]` **Erst messen, dann entscheiden.** Fehlen sie in der Quelle,
ist es ein Auftrag an Kimi und kein Importfehler — dann melden statt
fuellen.

## 2 · Die 28 Sammelnamen haben keinen Text

`[cmd]` **28 sichtbare Eintraege ohne Zeile in
`supplement_user_texts`, ausnahmslos aus `lumeos_supplement_catalog`:**

    Ashwagandha (KSM-66) . BCAAs . Biotin . Caffeine . Calcium
    Collagen . Curcumin/Turmeric . Electrolytes . Fiber/Psyllium Husk
    Folate (B9) . Glucosamine . Iron . Lion's Mane . Magnesium
    NAC . Probiotics . Spirulina . Tongkat Ali . Turkesterone
    Vitamin A . Vitamin B12 . Vitamin B6 . Vitamin C . Vitamin D3
    Vitamin E . Vitamin K2 (MK-7) . Whey Protein . Zinc

**Tom, 2026-08-25:** *„ein paar klicks und hab bcaa/electrolytes etc
nichts drin."*

`[read]` **Das ist die Folge von C-244**, nicht ein Importfehler. Tom
hat entschieden: **der Sammelname gewinnt.** Kimi hat aber die
Fachnamen beschrieben — *„Vitamin C (ascorbic acid)"* hat einen Text,
*„Vitamin C"* nicht. **Und der Nutzer klickt den Sammelnamen.**

`[read]` **Das sind die 28 meistgeoeffneten Eintraege des Katalogs.**
Magnesium, Vitamin C, Zink, Whey, BCAA — wer den Katalog aufmacht,
landet zuerst dort.

### Drei Wege, deine Entscheidung — mit Begruendung im Bericht

**a) Vererben.** Der Sammelname zeigt den Text seiner Vorzugsform.
`[read]` Billig, aber falsch, sobald die Formen sich unterscheiden:
Magnesiumoxid und -glycinat teilen nicht dieselbe Vertraeglichkeit.

**b) Zusammenfuehren.** Aus den Texten der Kinder einen Sammeltext
bilden. `[read]` Nur dort ehrlich, wo die Aussage fuer alle Formen
gilt.

**c) Melden und an Kimi geben.** 28 Sammeltexte nachfordern.
`[read]` **Das ist vermutlich der richtige Weg** — es sind wenige, sie
sind wichtig, und Kimi liefert mit Quellen.

`[read]` **Waehle nicht still.** Miss, wie viele der 28 ueberhaupt
Kinder mit Text haben — dann ist entscheidbar, ob a oder b traegt.
`[cmd]` 15 der 28 haben Unterformen, 13 haben keine.

## WAS NICHT ZU TUN IST

**Keine Texte erfinden.** Wenn die Quelle nichts hergibt: melden.
**Keinen Sammelnamen aus dem Katalog nehmen.** C-244 steht.
`apps/` nicht anfassen — Claude Code baut die Ansicht (G-180).
Nicht committen, nicht stagen, nicht pushen.

## NACHWEIS — Erwartung VOR dem Lauf

    Enhanced-Felder in der Quelle    Zahl je Feld, hinschreiben
    Enhanced-Felder nachher          Zahl je Feld
    Sammelnamen ohne Text            heute 28, nachher: Zahl nennen
    Sammelnamen mit Kindern, die Text haben   heute 15

**Gegenprobe an drei namentlich genannten Substanzen:** ein SARM mit
`irreversibel_de`, Magnesium als Sammelname, Electrolytes als
Sammelname ohne Kinder.

**Negativprobe:** ein Feld leeren, die Zaehlung muss es finden.

## PIPELINE

Kettenschritt hinter `141a_supplement_kimi_nutzertexte.ts`.
Wegwerf-Datenbank, Sicherung vorher, **und live einspielen** mit
Vollsicherung davor.

`[cmd]` **Bekannt und nicht deine Ursache:** die Wegwerf-Kette bleibt
am Schluss-Waechter rot wegen Medical-Abweichungen — als **C-265**
angelegt.

## REGELN

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
Nie `pnpm dev` — nur `python tools/server.py`.
`.next` nie loeschen, `next build` nie direkt aufrufen.
`docs/kimi_research/` steht in `.gitignore` — lesen, nicht committen.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**
