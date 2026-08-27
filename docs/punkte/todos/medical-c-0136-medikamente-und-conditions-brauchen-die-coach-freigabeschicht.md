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
