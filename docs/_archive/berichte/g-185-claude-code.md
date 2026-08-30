# G-185 — Claude Code, 2026-08-25

Auftrag: `docs/auftraege/g-185-claude-code.md`

**Alle drei Punkte erledigt.** Dazu ein Befund, der beim Rueckbau
auffiel: **eine Beziehung laesst sich nicht loeschen, solange der
Audit-Trigger laeuft.**

Nicht committet, nicht gestaged, nicht gepusht.

---

## 1 · DER KOPF-KNOPF — er bleibt und fuehrt aufs echte Formular

`[cmd]` Er oeffnete `kontext.open({ typ: 'invite' })`, also das
Entwurfsmodal — waehrend seit C-225 daneben das Formular liegt, das in
`coach.relationships` schreibt.

**Entschieden: er bleibt und springt auf den Invites-Reiter.**

`[read]` **Begruendung:** *„Invite coach"* ist die Hauptaktion des
Moduls und steht an der auffaelligsten Stelle. Ihn zu entfernen hiesse,
den Weg zum Einladen nur noch im Fliesstext eines Reiters zu haben.

`[read]` **Der Auftrag warnt zu Recht, dass ein Sprung auf einen
anderen Reiter schlechter sein kann als kein Knopf — das gilt, wenn
das Ziel unklar ist.** Hier ist das Ziel das Formular selbst, der
Reiterwechsel ist sichtbar (`?tab=invites` in der Adresse), und der
Reiter heisst wie der Knopf.

`[cmd]` **Gemessen:** Klick → `?tab=invites`, **0 Dialoge im DOM**,
Formular vorhanden.

## 2 · DER INVITES-REITER LIEST `relationships`

### Die Zahl ist die der Zeilenrechte — die Falle aus C-241

`[cmd]` **Gesamtbestand: 4 `active`, 2 `invited`.** Das ist NICHT, was
der Reiter zeigt.

| Konto | invited (Client) | invited (Coach) | active |
|---|---|---|---|
| `test-user@lumeos.local` | **0** | **0** | **0** |
| `dev@lumeos.app` | 0 | 0 | 1 |

`[cmd]` **Beide `invited`-Zeilen gehoeren `sarah.seed@example.com`**
(angelegt 20.08. und 23.08.). **Der Reiter zeigt auf `test-user`
richtigerweise 0.**

### Der Leerzustand traegt das Formular

`[read]` **Fables Fund aus C-225:** bei 0 Beziehungen rendete nur der
Empty-Zweig, ohne Formular — **und genau dort entsteht die erste
Beziehung.** `InviteFormular` steht deshalb **ausserhalb des
Ternaers**, in beiden Zweigen.

`[cmd]` Am Bild: *„Für dieses Konto ist keine Einladung offen. Wer
einen Coach einladen möchte, trägt unten dessen Kennung ein."* — kein
Strich, keine Null, und darunter das Formular.

**Kein zweiter Schreibweg:** der Reiter benutzt `InviteFormular` aus
C-225 (nur exportiert, nicht kopiert). `[cmd]` Ein Waechter prueft,
dass `uebersicht-echt.tsx` **nicht selbst** `from('relationships')`
aufruft.

`[cmd]` **`created_at` musste in den Lesepfad** — `Beziehung` trug es
nicht. `started_at` taugt nicht: es wird erst beim Annehmen gesetzt und
ist bei `status='invited'` leer.

**Kein Name erfunden:** die gekuerzte Kennung (`d15fb34f…`), wie in
C-225 begruendet. Namensaufloesung ist C-268.

## 3 · `PENDING_INVITES` IST RAUS — die anderen beiden bleiben

`[cmd]` **Gemessen vor der Aenderung:**

| Konstante | in `ansicht.tsx` | ausserhalb | Urteil |
|---|---|---|---|
| `PENDING_INVITES` | 7 | **0** | **entfernt**, samt Deklaration |
| `COACHES` | 6 | **tab-rechte 5 · modale 3 · Waechter 2** | **bleibt** |
| `COACH_NOTES` | 5 | **daten.ts** (Deklaration) | **bleibt** |

`[read]` **`COACHES` und `COACH_NOTES` habe ich nicht mitgerissen** —
`tab-rechte.tsx` und `modale.tsx` haengen daran, und beide sind nicht
Gegenstand dieses Auftrags. **Gemeldet, wie verlangt.**

`[cmd]` **Der Typ `Invite` bleibt** — `modale.tsx` verwendet ihn.

`[cmd]` **Raus sind zwei markierte Kacheln:** die Karte *„Pending
invites"* (zaehlte die Konstante, trug einen zweiten Knopf ins
Entwurfsmodal) und die Tabelle des Reiters (erfundene Namen, dazu zwei
Zeilen fest im JSX — *Dr. R. Klein*, *Dr. P. Holzer*). **Der
Attrappen-Waechter: 9 → 7.**

---

## NACHWEIS

### Gegenprobe — angelegt, gezeigt, gezaehlt zurueckgebaut

| Schritt | relationships | invited |
|---|---|---|
| vorher | 6 | 2 |
| nach dem Anlegen | **7** | **3** |
| **nach dem Rueckbau** | **6** | **2** |

`[cmd]` **Reste: 0.** Alle drei Trigger wieder aktiv (`tgenabled = O`).

`[cmd]` **Am Bild mit der Einladung:** *„Offene Einladungen 1"*, Pille
*eingeladen*, die Notiz, *seit 2026-08-25*, gekuerzte Kennung — und das
Formular darunter.

### Negativprobe — drei Eingriffe, alle rot

| Eingriff | vorher | mit Fehler | zurueck |
|---|---|---|---|
| `PENDING_INVITES` wieder einbauen | 87/0 | **86/1** | 87/0 |
| Kopf-Knopf wieder ins Modal | 87/0 | **86/1** | 87/0 |
| Formular nur im gefuellten Zweig | 87/0 | **86/1** | 87/0 |

`[read]` **Der dritte ist der wichtigste** — er bewacht Fables Fund:
ohne ihn koennte das Formular unbemerkt in den gefuellten Zweig
rutschen, und der leere Fall waere wieder eine Sackgasse.

### Stand

`[cmd]` `tsc` **sauber** · Build **`Compiled successfully`** · Tests
**231 pass, 0 fail** · `serverimport` **50 Chunks, 0 Treffer**.

`[cmd]` **`pnpm gate` nicht gelaufen** — er ist am Kennungswaechter aus
C-267 rot, wegen dreier bewusst nicht korrigierter Konflikte. **Laut
Auftrag nicht meine Arbeit**; Codex baut die Ausnahmeliste.

**Bilder:** `g185-kopf.png` · `g185-invites-gefuellt.png` ·
`g185-invites-leer.png`

---

## GEAENDERT

| Datei | |
|---|---|
| `v2/coach/ansicht.tsx` | Kopf-Knopf, Reiterzahl, zwei Entwurfskacheln raus |
| `v2/coach/uebersicht-echt.tsx` | `EinladungenEcht` **neu**, `InviteFormular` exportiert |
| `v2/coach/daten.ts` | `PENDING_INVITES` entfernt |
| `lib/coach/rechte-read.ts` | `created_at` an `Beziehung` |
| `__tests__/v2-attrappen.test.ts` | 2 Waechter, Zahl 9 → 7 |

**Keine Tabelle angelegt, kein Name erfunden, kein zweiter
Schreibweg.** `supabase/_pipeline/` nicht angefasst.

## OFFEN — der Befund vom Rueckbau

1. **Eine Beziehung laesst sich nicht loeschen, solange
   `relationships_change_log` laeuft.** `[cmd]` Der AFTER-DELETE-Trigger
   schreibt die `relationship_id` ins Log, und der Fremdschluessel
   dorthin verbietet es:

       insert or update on table "relationship_change_log" violates
       foreign key constraint "..._relationship_id_fkey"
       Key (relationship_id)=(7f8d07bf-…) is not present in table
       "relationships".

   `[read]` **Das ist ein Schemafehler, kein Anzeigefehler** — mein
   Rueckbau ging nur mit kontrolliert abgeschaltetem Trigger (Muster
   aus C-225). **Solange das so ist, kann die Oberflaeche keine
   Einladung zuruecknehmen.** Ein `ON DELETE SET NULL` auf dem
   Fremdschluessel waere der naheliegende Weg — **gehoert Codex, nicht
   mir.**

2. **`COACHES` (12 Verwendungen) und `COACH_NOTES` (7)** stehen
   weiter — `tab-rechte.tsx`, `modale.tsx` und der Overview-Bereich
   haengen daran.

3. **Kein „Zuruecknehmen"-Knopf gebaut.** `[read]` Er waere ohne
   Punkt 1 nicht funktionsfaehig, und `nachrichten-schreiben.ts`
   fuehrt keinen Loeschweg — **einen zweiten Schreibweg zu bauen
   verbietet der Auftrag.**
