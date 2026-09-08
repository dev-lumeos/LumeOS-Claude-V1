---
nr: C-136
typ: befund
modul: medical
schwere: mittel
angelegt: 2026-08-19
braucht: []
kind_von: C-130
kinder: []
entscheidung: null
agent: codex
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: cf1eae2a
beruehrt:
  tabellen: ["coach.client_permissions"]
  dateien: []
zahlen: null
---

# C-136 - Medikamente und Conditions brauchen die Coach-Freigabeschicht

## Befund

(neu 2026-08-19). Meldung aus C-130.

  `[cmd]` **Der C-130-Agent hat es gemeldet:** *„Medical nutzt hier wie
  `lab_result_values` RLS/GRANTs; **eine zusaetzliche
  Spaltenverschluesselung oder Coach-Freigabeschicht ist nicht
  gebaut.**"*

  `[read]` **Medikamente und Diagnosen sind sensibler als Laborwerte.**
  Wer HIV, Epilepsie oder eine Krebserkrankung eingetragen hat, hat
  etwas anderes preisgegeben als einen Cholesterinwert.

  `[cmd]` **Und die Freigabeschicht existiert seit C-119** —
  `coach.client_permissions` mit sieben Modulen und drei Stufen.
  **Sie greift auf diese Tabellen noch nicht.**

  **Zu klaeren:** `[cmd]` Reicht die Modulstufe *medical*, oder brauchen
  Medikamente und Conditions eine eigene? `[read]` **Ein Coach, der
  Blutwerte sehen darf, muss nicht die Diagnosen sehen.**

  `[cmd]` **Dazu:** Die Produktentscheidung aus dem Umsetzungsplan sagt
  *„Medizinische Daten verschluesselt gespeichert"* — **das ist bei
  `lab_result_values` bereits nicht umgesetzt**, hier also kein neuer
  Rueckstand, aber ein groesserer.

## Auftrag

**Mitbeauftragt mit C-433 am 2026-09-08.** Der Auftragstext
und der Bericht stehen dort.

## Abnahme

**2026-09-08, mit C-433 abgenommen: gemessen, drei Vorschlaege.**

`[cmd]` **`medical_visibility` steht mit `none | summary | full`,
DEFAULT `none`, 4 von 4 live auf `none`.**

`[cmd]` **Luecke: `appointments` und `health_events` haben keine
Coach-Policy.**

`[read]` **Und der wichtigste Vorschlag:** **Originaldateien nicht
implizit mit `full` teilen** ? **wer eine Zusammenfassung
freigibt, hat nicht den Scan freigegeben.**

`[read]` **Weiterverfolgt als C-434.**
