---
nr: C-398
typ: befund
modul: nutrition
schwere: hoch
angelegt: 2026-09-02
braucht: []
kind_von: G-294
entscheidung: E-61
agent: codex
beauftragt: 2026-09-02
erledigt: 2026-09-02
commit: 51531f39
beruehrt:
  tabellen: [nutrition.food_nutrients]
zahlen:
  gemessen: 2026-09-02
  missing: 1983
  score_complete_120: 44
  score_incomplete_120: 61
  score_no_data_120: 15
---

# C-398 -- `CAROTPAXB` fehlt an 1.983 Lebensmitteln

## Befund

`CAROTPAXB` fehlt im BLS weiterhin an 1.983 Lebensmitteln. Die
Komponente bleibt deshalb an vielen Tagen unvollstaendig. E-61
entscheidet jedoch nicht, diese Luecke zu verdecken, sondern die
vorhandenen drei Tageswerte getrennt in IE umzurechnen und zu
addieren.

    RETOL       x 3,3333
    CARTB       x 1,6667
    CAROTPAXB   x 0,8333
                  --------
                  Summe in IE

Ein Gesamtfaktor auf `VITA` wird nicht verwendet.

## Bericht vom 2026-09-02

### Umsetzung

`nutrition.vitamin_a_iu_daily` addiert jetzt vorhandene
Komponentensummen mit ihren drei E-34-Faktoren. Ein fehlender,
zensierter oder Spurwert traegt dabei 0 bei. Wenn alle drei
Komponentensummen fehlen, bleibt `total_iu` weiterhin `NULL`: Es wird
keine Tagesmenge erfunden.

`value_complete`, `incomplete_component_count` und der Status der
Vitamin-A-Funktion bleiben unveraendert ehrlich. `nrf93_daily`
verlangt fuer Vitamin A nun einen vorhandenen IE-Wert, nicht mehr drei
vollstaendige Komponenten. Damit ist nur die Score-Sperre gefallen;
die Vollstaendigkeit der drei Einzelwerte wurde nicht geaendert.

Die Aenderung steht ausschliesslich in den Kettenschritten
`05_user_tabellen/350_vitamin_a_components_magnesium_ul.sql` und
`05_user_tabellen/324_nrf93_daily_score.sql`, nicht in `migrations/`.

### Summe -- dev, Fenster 60 Tage bis 02.09.

| Komponente | Schnitt pro protokolliertem Tag | Faktor | IE-Anteil | vollstaendige Tage |
| --- | ---: | ---: | ---: | ---: |
| `RETOL` | 391,474 ug | 3,3333 | 1.305 IE | 60/60 |
| `CARTB` | 15.329,295 ug | 1,6667 | 25.549 IE | 18/60 |
| `CAROTPAXB` | 1.088,615 ug | 0,8333 | 907 IE | 0/60 |
| **Summe** |  |  | **27.761 IE** |  |

Die getrennte Rechnung aus den drei Tagesschnitten und der Mittelwert
der 60 einzelnen IE-Tage ergeben beide gerundet **27.761 IE**. Alle
60 Tage liefern nun einen IE-Wert. Die Vollstaendigkeitsangaben der
drei Zeilen sind dabei unveraendert.

### Gegenprobe -- Komponentenluecke blockiert nicht

Am 01.08. hat ein Testtag eine unvollstaendige `CAROTPAXB`-Komponente
(`incomplete_component_count = 1`, `value_complete = false`,
`status = incomplete`). Die Funktion liefert trotzdem die vorhandene
Summe von **10.717,335 IE**. Auf einem weiteren Tag ohne
`CAROTPAXB`- und `CARTB`-Tageswert, aber mit einem gespeicherten
`RETOL = 0`, liefert sie korrekt **0 IE** statt `NULL`.

Das ist E-38 in der Rechnung: fehlende Komponenten verhindern die
Summe nicht; sie werden nicht als unbekannte oder erfundene Mengen
behandelt.

### C-324 -- was nach E-61 noch fehlt

Im 120-Tage-Fenster bis 02.09. ist `VITA` an **0 Tagen** noch ein
unvollstaendiger NRF-Eingang. Scorefaehig sind dennoch nur **44 von
120 Tagen**:

| Status | Tage | Ursache |
| --- | ---: | --- |
| `complete` | 44 | alle zwoelf NRF-Eingaenge vorhanden |
| `incomplete` | 61 | `VITC` an 39, `FIBT` an 22 und `FE` an 1 Tag |
| `no_data` | 15 | keine Positionen; kein Null-Score |

E-61 hat also den Vitamin-A-Blocker vollstaendig entfernt, aber keine
anderen Nahrwertluecken und keine leeren Tage kaschiert. Ein Score an
120 von 120 Tagen waere im aktuellen Bestand unehrlich.

### Validierung

- `C-398/E-61: unvollstaendige Vitamin-A-Komponenten liefern ihre
  vorhandene IE-Summe` ist gruen.
- `C-398/E-61: eine unvollstaendige Vitamin-A-Komponente blockiert
  den NRF9.3-Score nicht` ist gruen.
- Der fruehere C-349-Teiltest mit festgeschriebenen 90-Tage-Zaehlern
  bleibt wegen zwischenzeitlich veraenderter Dev-Daten rot; er ist
  fachfremd und wurde nicht angepasst.

Keine Komponentenanzeige und kein Eintrag in `apps/` wurden geaendert.
Keine Daten wurden geloescht, nichts wurde gestagt, committed oder
gepusht.

## Abnahme

**2026-09-02, Orchestrator. Nachgemessen.**

### Der Score steht — zum ersten Mal

`[cmd]` **Selbst gemessen, `dev`, gestern:**

    Status    complete
    Score     662,3
    fehlt     nichts

`[cmd]` **Vorher: `incomplete` an 120 von 120 Tagen.**

### Und die Zerlegung zeigt beides

`[cmd]` **`{"code": "VITA", "unit": "IU", "amount": 54678.6633,
"status": "incomplete", "reference": 5000, "capped_ratio": 1}`**

`[read]` **Der Wert ist da, `status: incomplete` steht daneben** —
**genau wie beauftragt.**

`[read]` **Die Anzeige bleibt ehrlich, der Score wird nicht mehr
blockiert.** **Das war der Kern von E-61.**

### Die Gegenprobe ist die richtige

`[cmd]` **Ein Tag mit unvollstaendigem `CAROTPAXB`: 10.717,335 IE.**
`[cmd]` **Ein Tag ohne `CAROTPAXB`- und `CARTB`-Tageswert: 0 IE,
nicht NULL.**

`[read]` **Der zweite Fall ist der wichtige:** **null ist eine Zahl,
NULL ist keine.** `[read]` **Toms Satz, in einer Zeile belegt.**

`[cmd]` **Und beide Wege ergeben 27.761 IE fuer den
60-Tage-Schnitt** — **die Zahl aus E-61, unabhaengig
nachgerechnet.**

### C-324 — und die Zahl, die den Tag zusammenfasst

`[cmd]` **`VITA` blockiert keinen der 120 Tage mehr.**

`[cmd]` **Aber nur 44 von 120 Scores sind vollstaendig:**

    61 unvollstaendig   VITC (39), FIBT (22), FE (1)
    15 ohne Daten
    44 vollstaendig

`[read]` **Wir haben den ganzen Tag ueber `CAROTPAXB` gestritten** —
**und `VITC` fehlt an 39 Tagen, fast dreimal so oft.**

`[read]` **Tom, heute:** *,,wir kuemmern uns um sachen die sehr
wahrscheinlich ueber den schnitt keinen einfluss haben."* **Er hatte
recht, und jetzt steht die Zahl dazu.**

**Abgenommen.** **`VITC` und `FIBT` als C-402.**

