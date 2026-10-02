---
nr: G-571
typ: fehler
modul: quer
schwere: mittel
angelegt: 2026-10-01
commit: fd2a086c
erledigt: 2026-10-02

braucht: [G-535]
kind_von: G-535

quellen:
  - docs/punkte/erledigt/quer-g-0535-sechs-funktionen-lesen-den-alten-sitzungsnamen.md

beruehrt:
  dateien:
    - apps/web/src/app/v2/medical/katalog-suche.tsx
    - apps/web/src/lib/fehler/ladefehler.ts
---

# Sechs Schreibwege existieren in der Datenbank und werden von nichts benutzt

## Der Befund

`[cmd]` **Bei der Abnahme von G-535 selbst gezaehlt**, ueber `apps/` und
`packages/`, ohne Testdateien:

    coach.raise_alert                     0 Aufrufer
    goals.body_circumference_write        0 Aufrufer
    medical.import_lab_report_rows        0 Aufrufer
    medical.start_lab_report_ocr          0 Aufrufer
    medical.store_lab_report_ocr_result   0 Aufrufer
    nutrition.meal_plan_set_next_plan     0 Aufrufer

`[cmd]` **Ein einziger Treffer im ganzen Produkt, und das ist ein
Kommentar:** `apps/web/src/app/v2/medical/katalog-suche.tsx:20`. `[cmd]`
**Codex hat zusaetzlich Spec, Mockup und Vorgaengerrepo abgesucht** —
auch dort kein lebender Aufrufer.

`[read]` **Das sind keine Hilfsfunktionen, das sind Funktionen fuer
Dinge, die ein Nutzer tun soll:** einen Koerperumfang eintragen, einen
Laborbericht einlesen, die Auswertung speichern, den naechsten
Ernaehrungsplan setzen, einen Coach-Hinweis ausloesen. **Jede ist
gebaut, geprueft und unerreichbar** — und keine der bisherigen Messungen
hat das gemeldet, weil jede nur gefragt hat, ob die Funktion richtig ist.

`[read]` **Aus der Existenz einer Sache folgt nicht ihre Funktion** — das
steht so in den Projektregeln, und hier trifft es sechs Funktionen auf
einmal.

## Was daran entschieden werden muss

`[read]` **Die Frage ist nicht, wer die Aufrufe schreibt, sondern ob sie
gewollt sind.** Zwei Moeglichkeiten, und sie fuehren zu verschiedener
Arbeit:

1. **Der Weg ist geplant und fehlt nur** — dann gehoert je Funktion ein
   Punkt mit der Oberflaeche, an der er haengt (Umfangserfassung,
   Laborimport, Mahlzeitenplan, Coach-Hinweise).
2. **Der Weg ist aufgegeben** — dann ist die Funktion toter Bestand und
   gehoert benannt, nicht gepflegt. Sie steht sonst in jedem kuenftigen
   Waechterlauf mit und kostet bei jeder Aenderung Aufmerksamkeit.

`[annahme]` **Die erste Moeglichkeit ist wahrscheinlicher** — alle fuenf
Fachbereiche stehen in der Spec. Aber das ist eine Vermutung, und eine
Zuordnung je Funktion steht nirgends.

## Die neue Meldung hat keinen Ort

`[cmd]` **G-535 hat eine Meldung hinzugefuegt, die die Oberflaeche nicht
kennt:** `medical import: user mismatch` mit `P0001`. Gezaehlt in
`apps/web/src/lib`: **null Treffer auf `P0001` und null auf
`user mismatch`.**

`[cmd]` **Und die Zuordnung von Fehlercodes zu Texten liegt unter
`goals/`**, nicht querliegend: `apps/web/src/lib/fehler/ladefehler.ts`
kennt `Fehlerart = 'sitzung' | 'daten'` und nennt im Kommentar
PostgREST-Codes. **Ein medical-Fehler hat dort keinen Platz, ohne dass
die Datei aus `goals/` heraus wandert** — dasselbe, was G-555 fuer
medical und nutrition schon festhaelt.

`[read]` **Wer den Aufrufer fuer `import_lab_report_rows` baut, braucht
also zuerst einen Ort fuer die Meldung** — sonst zeigt die Oberflaeche
einen rohen Postgres-Fehler. **Die Reihenfolge ist G-555, dann der
Aufrufer.**

**Nicht Teil:** die sechs Funktionen selbst (G-535, erledigt und
geprueft).

**Zu belegen:** je Funktion die Oberflaeche, an der sie haengt, oder die
Aussage, dass sie aufgegeben ist · die Zaehlung der Aufrufer vorher und
nachher · der Ort fuer die neue Meldung, wenn der medical-Weg dabei ist.

---

## Entschieden — 2026-10-01

**Tom:** alle vier Bereiche bekommen eine Oberflaeche. Damit ist Weg 1
aus dem Abschnitt oben gewaehlt — **die Wege sind geplant, keiner ist
aufgegeben:**

    goals.body_circumference_write        Umfangserfassung
    medical.import_lab_report_rows        Laborimport
    medical.start_lab_report_ocr          (zusammen mit dem Import)
    medical.store_lab_report_ocr_result   (zusammen mit dem Import)
    nutrition.meal_plan_set_next_plan     Plansprung
    coach.raise_alert                     Alarm im Coach-Portal

`[read]` **Damit ist dieser Punkt kein Entscheidungspunkt mehr, sondern
eine Liste von vier Auftraegen** — je Bereich einer, in verschiedenen
Modulen. Sie gehoeren nicht in einen Auftrag: `goals`, `medical`,
`nutrition` und `coach` sind vier Oberflaechen mit vier Lesepfaden.

`[cmd]` **Der Laborimport bringt drei Funktionen mit einem Weg** — Import
plus zwei OCR-Funktionen. Dort haengt auch die neue Meldung
`medical import: user mismatch` (`P0001`), die heute nirgends behandelt
wird.

`[read]` **Und die Reihenfolge ist nicht beliebig:** die Zuordnung von
Fehlercodes zu Texten liegt unter `goals/`
(`apps/web/src/lib/fehler/ladefehler.ts`), nicht querliegend. **G-555
raeumt das**, und der medical-Weg braucht es. Die anderen drei nicht.

---

## Geschlossen — 2026-10-02

`[cmd]` **Alle sechs Funktionen haben genau einen Aufrufer**, je mit
Bild, Schirmnachweis und Wächter:

    body_circumference_write      G-577  a640e7af
    import_lab_report_rows        G-578  31ebb74e
    start_lab_report_ocr          G-578  31ebb74e
    store_lab_report_ocr_result   G-578  31ebb74e
    meal_plan_set_next_plan       G-579  d8008745
    raise_alert                   G-582  fd2a086c

`[read]` **Die Entscheidung von Tom am 2026-10-01 war richtig:** keine
der sechs war aufgegeben, alle vier Bereiche haben jetzt eine
Oberfläche. **Fünf Tage Arbeit an Funktionen, die niemand erreichen
konnte, sind damit nutzbar.**

`[cmd]` **Zwei Dinge bleiben, beide als Befund gemeldet und nicht
verdeckt:** `store_lab_report_ocr_result` hat einen Weg, **aber keine
Quelle** — es gibt nichts, das ein Erkennungsergebnis erzeugt (G-578).
Und der `alertGenerator`, der Coach-Alarme selbst auslösen würde, ist
nicht gebaut; Alarme entstehen von Hand (G-582).

`[read]` **Die Lehre, die über diesen Punkt hinausgeht, steht dreimal in
den Abnahmen:** in G-578, G-579 und G-582 arbeitete die Datenbankfunktion
**anders, als eine Annahme erwartet hätte** — sie legte den Bericht selbst
an, sie setzte zwei gekoppelte Spalten in einem Zug, sie entdoppelte
innerhalb 24 Stunden. **Dreimal hat „erst `pg_proc`, dann schreiben"
einen falschen Aufrufer verhindert.** Das steht seit G-579 in jedem
Auftrag dieser Klasse.
