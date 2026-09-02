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

_(vom Orchestrator)_
