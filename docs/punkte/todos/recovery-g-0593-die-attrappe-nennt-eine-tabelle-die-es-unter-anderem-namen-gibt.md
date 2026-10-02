---
nr: G-593
typ: befund
modul: recovery
schwere: mittel
angelegt: 2026-10-02

braucht: [G-590]

quellen:
  - docs/punkte/erledigt/quer-g-0585-die-inventur-der-ausfuhren-ohne-aufrufer.md

beruehrt:
  tabellen:
    - recovery.recovery_protocols
  dateien:
    - apps/web/src/app/v2/recovery/modale.tsx
---

# Die Attrappe nennt eine Tabelle, die es unter anderem Namen gibt

## Der Befund

`[cmd]` **`apps/web/src/app/v2/recovery/modale.tsx:1012-1013`
begruendet einen `InEntwicklungKnopf` so:**

    Protokolle brauchen eine Tabelle recovery.protocols - die gibt es
    nicht.

`[cmd]` **Gemessen 2026-10-02 in `information_schema.tables`, Schema
`recovery`:**

    recovery.protocols            existiert NICHT
    recovery.recovery_protocols   existiert, 12 Spalten

`[read]` **Die Begruendung ist woertlich richtig und sachlich
irrefuehrend.** Wer sie liest, hoert auf zu suchen — und eine Tabelle mit
zwoelf Spalten liegt daneben. **Das ist die Klasse aus G-577**, nur
diesmal nicht veraltet, sondern am Namen vorbei.

## Was ungemessen ist

`[annahme]` **Ob `recovery_protocols` das ist, was der Knopf braucht**,
ist nicht gemessen — zwoelf Spalten koennen ein Katalog vorgegebener
Protokolle sein (Herkunft: Kette) oder ein Protokoll je Nutzer. **Beides
fuehrt zu einem anderen Punkt.**

`[cmd]` **Zu messen, bevor etwas beauftragt wird:** die Spalten, ob eine
`user_id` dabei ist, die Zeilenzahl, die Herkunft im Kettenschritt, und
ob eine Oberflaeche sie heute liest. `[read]` **Erst danach ist zu sagen,
ob der Knopf gebaut werden kann oder ob die Begruendung nur praeziser
werden muss.**

`[read]` **Der zweite Attrappenknopf daneben bleibt unberuehrt:** HRV
nennt `recovery.hrv_readings`, und die existiert tatsaechlich nicht —
weder unter diesem noch unter einem aehnlichen Namen.

**Nicht Teil:** G-590 baut die drei Schreibwege und laesst diesen Knopf
ausdruecklich stehen.
