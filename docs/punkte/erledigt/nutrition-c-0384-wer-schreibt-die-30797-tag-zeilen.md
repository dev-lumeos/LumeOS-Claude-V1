---
nr: C-384
typ: befund
modul: nutrition
schwere: hoch
angelegt: 2026-09-02
braucht: []
kind_von: G-229
entscheidung: E-55
agent: codex
beauftragt: 2026-09-02
erledigt: 2026-09-02
commit: 1ab6a431
beruehrt:
  tabellen: [nutrition.food_tags]
zahlen:
  gemessen: 2026-09-02
  zeilen: 30797
---

# C-384 — wer schreibt die 30.797 Tag-Zeilen?

## Befund

Aus E-55, 2026-09-02.

`[cmd]` **`nutrition.food_tags` traegt 30.797 Zeilen.**

`[cmd]` **`auto_tag_food` existiert nicht** — Codex hat es in C-366
gemessen, **`SPEC_06` nennt es als Trigger.**

`[read]` **Wer die Zeilen heute schreibt, ist ungemessen:** der
Import, ein Kettenschritt, oder etwas Drittes.

## Warum es vor E-55 gemessen wird

`[read]` **E-55 entscheidet: Kuration in einer zweiten Tabelle,
`food_tags_kuriert`.**

`[read]` **Sie schuetzt vor einem Schreiber** — **und wenn der
falsche gemeint ist, laeuft der echte weiter.**

`[cmd]` **Codex hat gemessen: der Import ersetzt 12 Tag-Codes ohne
Herkunftsunterscheidung.** `[read]` **Zwoelf von vierzehn** —
**welche zwei nicht, und warum?**

## Zu messen

    wer schreibt         Import, Kettenschritt, Trigger?
    wann                 bei jedem Lauf, oder einmalig?
    die zwei Ausnahmen   welche Tag-Codes fasst der Import nicht an
    E-22                 vierzehn Definitionen -- alle vom selben
                         Schreiber?

## Auftrag — der Schreibweg und drei alte Ergebnisse

**Mitbeauftragt: C-386, C-30.** Bericht in diese Datei.

**Beauftragt am 2026-09-02.**

### 1 · C-384 — wer schreibt die 30.797 Tag-Zeilen?

`[cmd]` **`auto_tag_food` existiert nicht** — du hast es in C-366
gemessen, **`SPEC_06` nennt es als Trigger.**

`[cmd]` **Und du hast gemessen: der Import ersetzt 12 Tag-Codes ohne
Herkunftsunterscheidung.** `[read]` **Zwoelf von vierzehn** —
**welche zwei nicht, und warum?**

`[read]` **E-55 entscheidet: Kuration in einer zweiten Tabelle,
`food_tags_kuriert`** — dasselbe Muster wie C-29 bei den
Anzeigenamen.

`[read]` **Sie schuetzt vor einem Schreiber.** **Wenn der falsche
gemeint ist, laeuft der echte weiter.**

### 2 · C-386 — sind die drei Reste aus C-35 eingeflossen?

`[cmd]` **C-35 haelt drei Erkenntnisse fest, die zwei verworfene
Modelle ueberlebt haben.** `[read]` **Sie stehen als Text, keine ist
gesichert.**

    Zubereitungsschluessel   "Banane roh" -> "Banane"
                             klingt nach name_display_de (C-29:
                             5.014 von 7.140 weichen ab)
    Vertreterregel           Gruppen ohne Vertreter 953 -> 0
                             klingt nach der Suchsortierung
                             (G-70, G-281)
    vier Erzeugnis-Zellen    Saft und Nektar trennen sich von der
                             Frucht (F201, F603, F310)
                             ungeprueft

`[read]` **Zu messen: eingeflossen oder verloren?**

`[cmd]` **Der dritte waere messbarer Zuwachs** — die Suche liegt bei
rund 84 Prozent auf dem Bodybuilder-Massstab.

### 3 · C-30 — Suche und Trefferliste auf Arten umstellen

`[read]` **Lies den Punkt und miss, ob er noch gilt.** `[cmd]`
**Seit G-281 traegt die Suche einen Treffergrund, seit C-355 einen
Herkunftsfilter.**

### Was nicht zu tun ist

**Keine Tabelle anlegen** — C-384 misst, E-55 baut spaeter.
**Keine Tags aendern.**
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `neustart`, kein `start`, kein `aufraeumen`.**

### Nachweis

    Schreiber            wer, wann, wie oft
    die zwei Ausnahmen   welche Codes, warum
    drei Reste           je eingeflossen oder verloren
    C-30                 gilt / ueberholt

## Bericht

**Gemessen am 02.09.2026 auf `dev` (Codex, nichts gebaut).**

### C-384 — mehrere Kettenschreiber, kein Trigger

`[cmd]` `nutrition.food_tags` hat **30.797** Zeilen ueber **14**
Definitionen. `auto_tag_food` existiert nicht, die Tabelle hat **0**
Trigger, `food_tags_kuriert` existiert noch nicht und `authenticated`
hat nur die Select-Policy, keine Schreibrechte.

`[cmd]` Der Schreibweg ist die Aufbaukette, nicht die Datenbank zur
Laufzeit:

| Schritt | Codes | Wirkung bei jedem vollen Kettenlauf |
| --- | --- | --- |
| 020 | `high_protein`, `low_carb`, `low_fat`, `high_fiber` | nur `INSERT ... ON CONFLICT DO NOTHING` |
| 027 | `whole_food`, `ultra_processed`, `vegan`, `vegetarian`, `contains_nuts`, `contains_gluten`, `contains_lactose`, `thai_food`, `halal`, `kosher` | loescht alle zehn und liest sie aus `daten/lebensmittel-tags.jsonl` neu ein |
| 032 | `halal`, `kosher` | loescht und berechnet genau diese zwei danach erneut aus Ausschluss-Presets |
| 221 | `high_fat`, `gluten_free` | liegt in der Kette, ist auf dev aber noch nicht eingespielt; wuerde zwei neue Definitionen und eigene Ersetzungen bringen |

`[cmd]` Die Angabe *„12 von 14“* ist damit nicht als Zahl
verschiedener Codes richtig: **027 ersetzt zehn verschiedene Codes;
032 zaehlt `halal` und `kosher` ein zweites Mal.** Diese zwei sind also
keine unangetasteten Ausnahmen, sondern die doppelt geschriebenen
Codes. Auf dev sind die **vier** Makro-Tags die nicht geloeschten
Definitionen. `thai_food` wird von 027 trotzdem ersetzt, hat aber
aktuell null Zuordnungen.

`[read]` E-55 bleibt begruendet: Die zweite Tabelle muss gegen alle
Kettenschreiber wirken. Sie darf insbesondere nicht annehmen, es gebe
nur einen Import. Keine Tabelle und keine Tags wurden angelegt bzw.
geaendert.

### C-386 — ein Rest uebernommen, zwei nur teilweise bzw. nicht

| Rest aus C-35 | Urteil | Messung |
| --- | --- | --- |
| Zubereitungsschluessel | **eingeflossen** | `F503100` steht als `Banane roh` in `name_de` und als `Banane` in `name_display_de`. Zubereitungen bleiben sonst sichtbar, etwa `Banane (getrocknet)`. |
| Vertreterregel | **teilweise eingeflossen** | Die Suche bevorzugt BLS-100/000 und nimmt danach `sort_weight`; ein Artenmodell oder Vertreterfeld gibt es nicht. Mit dem einzigen noch vorhandenen BLS-Praefix-Proxy haben 504 mehrzeilige Familien keine 100/000-Form; nur 101 haben ein eindeutiges hoechstes `sort_weight`, 403 bleiben am hoechsten Wert gebunden. Die alte Aussage 953 -> 0 ist daher weder nachweisbar noch erreicht. |
| Erzeugnis-Zellen | **nicht strukturell eingeflossen** | Fuer F201, F603 und F310 liegen Frucht, Saft und Nektar weiter alle in Kategorie `obst`; es gibt keine Zellen-/Arten-Spalte. Die generische Rangfolge stellt `Aprikose` (F201100) vor `Aprikosensaft` (F201600), aber der Saft steht noch als sechster von 24 flachen Treffern da. `processing_level` ist bei Saft/Nektar sogar `raw`. |

### C-30 — gilt weiter

`[cmd]` `nutrition.foods` hat keine Arten-/Vertreterspalte und
`food_search` liefert eine flache `foods`-Liste: die Aprikosenprobe
liefert 24 von 24 Zeilen, nicht eine Art mit Varianten.

`[cmd]` C-355 ist vorhanden, aber der Herkunftsfilter unterscheidet
nur `bls` und `custom`; er ist kein Artenmodell. Die aktuelle
`food_search`-Antwort fuehrt ebenfalls keinen `match_reason` mit.
G-281 betrifft den Supplement-Katalog und ist kein Nachweis fuer einen
Treffergrund in dieser Suche.

`[read]` C-30 ist somit nicht ueberholt. Er bleibt ein eigener
Gestaltungs- und Bauauftrag; seine Vorbedingung, die kuratierten
Anzeigenamen, ist dagegen erfuellt.

## Abnahme

**2026-09-02, Orchestrator.**

### Meine *,,12 von 14"* war falsch gelesen

`[cmd]` **027 ersetzt zehn verschiedene Codes, 032 zaehlt `halal`
und `kosher` ein zweites Mal.**

`[read]` **Die zwei sind also keine unangetasteten Ausnahmen,
sondern die doppelt geschriebenen.** `[cmd]` **Die vier
unangetasteten sind die Makro-Tags aus 020**, mit
`ON CONFLICT DO NOTHING`.

`[read]` **Ich hatte aus Codex' Zahl geschlossen, es gebe zwei
Codes, die der Import nicht anfasst** — **es sind zwei, die er
zweimal anfasst.**

### Und der Schreiber ist nicht einer, sondern die Kette

`[cmd]` **Kein Trigger, kein `auto_tag_food`, 0 Trigger an der
Tabelle.** `[cmd]` **`authenticated` hat nur eine Select-Policy.**

    020   vier Makro-Tags        nur INSERT, kein Loeschen
    027   zehn Codes             loescht alle und liest neu ein
    032   halal, kosher          loescht und rechnet neu
    221   high_fat, gluten_free  in der Kette, auf dev nicht
                                 eingespielt

`[read]` **Sein Schluss ist der wichtige:** *,,Die zweite Tabelle
muss gegen alle Kettenschreiber wirken. Sie darf insbesondere nicht
annehmen, es gebe nur einen Import."*

`[cmd]` **E-55 bleibt begruendet** — **aber der Umfang ist groesser
als gedacht.**

### C-386 — einer eingeflossen, zwei nicht

`[cmd]` **Zubereitungsschluessel: eingeflossen.** `F503100` steht als
*Banane roh* in `name_de` und als *Banane* in `name_display_de`.

`[cmd]` **Vertreterregel: teilweise.** **504 mehrzeilige Familien
haben keine 100/000-Form, nur 101 ein eindeutiges hoechstes
`sort_weight`, 403 bleiben gebunden.** `[read]` **Die alte Aussage
*953 auf 0* ist weder nachweisbar noch erreicht.**

`[cmd]` **Erzeugnis-Zellen: nicht eingeflossen.** **Frucht, Saft und
Nektar liegen alle in `obst`, `processing_level` bei Saft ist sogar
`raw`.**

`[read]` **Damit war die Sorge berechtigt:** **zwei von drei
Ergebnissen waeren verloren gegangen.**

### C-30 gilt weiter — und meine Begruendung war falsch

`[read]` **Ich schrieb: *,,seit G-281 traegt die Suche einen
Treffergrund"*.**

`[cmd]` **`food_search` fuehrt keinen `match_reason`.** `[cmd]`
**G-281 betrifft den Supplement-Katalog** — **eine andere Suche.**

`[cmd]` **Und der Herkunftsfilter aus C-355 unterscheidet nur `bls`
und `custom`** — **kein Artenmodell.**

`[cmd]` **Die Aprikosenprobe: 24 von 24 flachen Zeilen**, nicht eine
Art mit Varianten.

`[read]` **C-30 ist nicht ueberholt** — **seine Vorbedingung, die
kuratierten Anzeigenamen, ist dagegen erfuellt.**

**Abgenommen.** **Drei Befunde als C-387, C-388, C-389.**

