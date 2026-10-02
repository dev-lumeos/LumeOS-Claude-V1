---
nr: C-295
typ: feature
modul: quer
schwere: mittel
angelegt: 2026-08-27
commit: f4be19e2
erledigt: 2026-10-02
beauftragt: 2026-10-02
agent: codex
braucht: []
kind_von: null
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien:
    - supabase/_pipeline/13_supplements/134_substance_catalog.ts
    - supabase/_pipeline/14_medical/147_substance_lab_markers.ts
    - supabase/_pipeline/_validierung/quer-c295-ein-kimi-pfad.test.ts
zahlen: null
---

# C-295 - die Kette liest aus zwei Kimi-Pfaden

## Befund

(neu
  2026-08-27).

  `[cmd]` **Elf Kettenschritte lesen aus
  `backup/kimi-research/Kimi_Agent/...`, sieben aus
  `docs/kimi_research/...`.** Beide Verzeichnisse existieren, beide
  stehen in `.gitignore`.

  `[cmd]` **Gemessen:** 2.892 gemeinsame Dateien, davon drei
  verschieden — die Substanzdateien, im neuen Pfad groesser (das ist
  C-275). **1.831 Dateien gibt es nur im alten Pfad, alle unter
  `metadata/`**, also Crawl-Protokolle, keine Nutzdaten.

  `[read]` **Die Uebergabe nennt den alten Pfad „ueberholt".** Fuer
  die Nutzdaten stimmt das. **Fuer die Kette nicht** — wer das
  Verzeichnis loescht, bricht elf Schritte. **Kein untracked
  Verzeichnis wird dem Namen nach geloescht.**

  **Zu tun:** die elf Schritte auf den neuen Pfad umstellen, je Schritt
  mit gemessenem Vorher/Nachher der Zeilenzahl. **Nicht in einem
  Zug mit einem Import** — ein logischer Change.

---

## Auftrag — Kopf, 2026-10-02

    AUFTRAG FUER Codex - C-295: ein Kimi-Pfad, nicht zwei
    Bereich: supabase/_pipeline/13_supplements/
             supabase/_pipeline/14_medical/
             supabase/_pipeline/_validierung/
             supabase/_pipeline/daten/ (Manifest, siehe A4)
    Fremd:   apps/ gehoert Claude Code (G-585). docs/ gehoert dem
             Orchestrator, auch diese Punktdatei und supabase/README.md
             - melde, was dort zu aendern ist, aender es nicht.
    Stand:   2026-10-02

### Die Zahlen von heute, nicht die vom 27.08.

`[cmd]` **Gezaehlt am 2026-10-02 in `supabase/` und `tools/`:**

    backup/kimi-research   15 Dateien nennen den alten Pfad
      davon Kettenschritte  13_supplements/132, 133, 134, 142, 143,
                            144, 145 · 14_medical/146, 147, 286
      dazu                  _validierung/kimi-rule-input-audit.ts
                            daten/schema-sollstand.json
                            daten/grunddaten-dump.manifest.json
                            supabase/README.md
                            tools/evidenz-registry-generieren.py
    docs/kimi_research     11 Dateien nennen den neuen Pfad

`[read]` **Der Punkt sprach von elf alten und sieben neuen Schritten** —
das war der 27.08. **Zaehl selbst nach**, bevor du anfaengst, und nenne
die Zahl im Bericht.

`[cmd]` **`kette.json` selbst nennt keinen der beiden Pfade** — die Pfade
stehen in den Schritt-Dateien.

### Auftrag

**A1 — die Schritte auf den neuen Pfad umstellen**, je Schritt mit
gemessener Zeilenzahl vorher und nachher. `[read]` **Wo die Datei im
neuen Pfad groesser ist, ist das C-275 und kein Fehler** — melde die
Differenz, aender den Inhalt nicht.

**A2 — die drei Dateien, die nur Hinweise tragen** (`schema-sollstand`,
`kimi-rule-input-audit`, das Python-Werkzeug), **mitziehen oder melden,
warum nicht.**

**A3 — nichts loeschen.** `[read]` **`backup/kimi-research` bleibt
stehen**, auch wenn danach niemand mehr daraus liest: **kein untracked
Verzeichnis wird dem Namen nach geloescht**, und 1.831 Dateien liegen nur
dort. **Der Orchestrator legt vor, Tom entsorgt.**

**A4 — das Manifest ist betroffen, und du hast das Werkzeug dafuer
selbst gebaut.** `[cmd]` `daten/grunddaten-dump.manifest.json` nennt den
alten Pfad, und die umgestellten Schritte sind **datenproduzierend** —
der Herkunftshash wandert also. **Nimm `grunddaten-erneuern.ts rehash`
mit einem `--reason`, der diesen Punkt nennt** (A-94), und belege, dass
der Dump byteidentisch bleibt.

`[cmd]` **Der kurze Standardlauf steht heute nach dem Restore an C-391**
— der Dump fuehrt 16 Tagdefinitionen, erwartet werden 17. **Das ist
nicht dein Problem und du behebst es nicht:** wenn dein Nachweis daran
haengt, sag es und lass den Teil offen, bis der naechtliche Lauf einen
neuen Dump veroeffentlicht.

**Nicht Teil:** der Inhaltsunterschied der drei Substanzdateien (C-275),
das Raeumen von `backup/` (A-79, Toms Entscheidung) und `supabase/README.md`.

**Zu belegen:** die Zahl der Dateien je Pfad vorher und nachher · je
umgestelltem Schritt die Zeilenzahl der gelesenen Quelle vorher und
nachher · 0 Treffer auf `backup/kimi-research` in `supabase/_pipeline/`
am Ende, oder die Liste der begruendeten Ausnahmen · `rehash` mit Grund,
Dump byteidentisch · kein `db push` · nichts committen.

---

## Abnahme — 2026-10-02, Commit `f4be19e2`

`[cmd]` **Selbst nachgezählt:** `backup/kimi-research` kommt in
`supabase/_pipeline/` **null** Mal vor; der einzige Rest im Repo ist
`supabase/README.md`, und der gehört mir. 15 Dateien, +72/−21, plus die
neue Pfadprobe `_validierung/quer-c295-ein-kimi-pfad.test.ts`, in beiden
Kettenmodi verdrahtet.

`[cmd]` **Nichts gelöscht**, wie verlangt: alter Datenbaum 10.030
Dateien, neuer 8.419. **Der Orchestrator legt vor, Tom entsorgt.**

`[read]` **Die stärkste Zeile des Berichts ist die Byte-Gleichheit:** von
28 gelesenen Quelldateien sind **25 SHA-identisch**, verschieden sind
genau die drei aus C-275. **Damit ist belegt, dass der Pfadwechsel keine
Daten verändert hat** — und die drei Unterschiede sind bekannt und
gewollt (154→243, 61→79, 75→124; Substanzen 290 → 446).

`[cmd]` **Erster echter Gebrauch von `rehash`** aus A-94: zwei
Manifestquellen nachgezogen, Grund vermerkt, **Dump byteidentisch**
(`274438cb…`), Manifestprüfung grün mit 19 Quellen. **Das Werkzeug von
heute Mittag hat heute Nachmittag seine Aufgabe erfüllt.**

`[cmd]` **Zwei fachliche Folgen hat er gemeldet statt passend gemacht:**
148 Datensätze ohne C-230-Filter (Gruppen 297/90/185 statt 307/82/177)
und `Unbekannter effect_type: detection_marker` in Schritt 147. **Beides
hält den nächtlichen Vollimport rot, und damit A-91/A5.** Das ist C-556
und läuft bei ihm.

`[read]` **Der Abbruch bei 147 bleibt stehen** — er ist die Zusicherung,
die diesen Fund möglich gemacht hat. Ein Agent, der ihn entfernt hätte,
hätte den Lauf grün und den Katalog falsch gemacht.
