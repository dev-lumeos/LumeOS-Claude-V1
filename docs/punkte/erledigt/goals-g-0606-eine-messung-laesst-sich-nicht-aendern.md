---
nr: G-606
typ: fehler
modul: goals
schwere: mittel
angelegt: 2026-10-05
agent: claudecode
beauftragt: 2026-10-05
erledigt: 2026-10-05
commit: f87e49bc

braucht: [G-602]
kind_von: G-588

quellen:
  - docs/punkte/erledigt/quer-g-0588-sechs-serveraktionen-ohne-aufrufer.md
  - docs/punkte/erledigt/goals-g-0591-zwei-goals-aktionen-ohne-aufrufer.md
  - docs/punkte/erledigt/goals-g-0602-die-reihenfolge-aktiver-ziele-wird-atomar-getauscht.md

beruehrt:
  tabellen: []
  dateien:
    - apps/web/src/app/v2/goals/koerpermass-aktionen.ts
    - apps/web/src/app/v2/goals/modale.tsx
    - apps/web/src/lib/goals/koerpermass-write.ts
---

# Eine Messung laesst sich nicht aendern

## Auftrag - Kopf

    AUFTRAG FUER Claude Code - G-606: Messung aendern bekommt eine Oberflaeche
    Bereich: apps/web/src/app/v2/goals, apps/web/src/lib/goals
    Fremd:   supabase/_pipeline/ (Codex). docs/ gehoert dem Orchestrator.
    Stand:   2026-10-05

## Befund

`[cmd]` `messungAendernAktion` (`v2/goals/koerpermass-aktionen.ts:41`) hat
keinen Aufrufer - die letzte der sechs Aktionen aus G-588. Tom am 02.10.:
*,ja auch die kriegen eine oberflaeche"*. `messungAnlegenAktion` hat ihren
Aufrufer in `modale.tsx:841`.

`[cmd]` Die Datenbankregel steht seit G-602 live: der Groessen-Snapshot
folgt dem Messdatum - wird das Datum einer Messung geaendert, holt die
Datenbank die Groesse zu diesem Datum neu. Die Oberflaeche rechnet das
NICHT selbst.

## Was zu tun ist

1. **Messen:** was tut `messungAendern` (`lib/goals/koerpermass-write.ts:191`)
   heute - welche Felder, welche Fehlercodes, was passiert mit
   `height_cm_snapshot` bei Datumsaenderung? Wo werden Messungen heute
   gelistet, und lebt diese Stelle (Aufrufer zaehlen, Lehre G-579)?
2. **Mockup:** die Referenz aus `docs/spezifikation/00-QUELLEN.md` fuer
   Goals/Koerpermasse nennen. Keine Seite ohne Mockup - fehlt eins,
   melden statt erfinden.
3. **Bauen:** je Messung ein Bearbeiten-Griff, der das bestehende
   Messungs-Modal im Aendern-Modus oeffnet (vorbefuellt), speichert ueber
   `messungAendernAktion`, Feldfehler am Feld.
4. **Nachweis am Schirm** auf `test-user@lumeos.local`: Wert aendern,
   neu laden, steht; Datum aendern, Groessen-Snapshot in der DB folgt;
   Ausgangsstand ueber die Oberflaeche wiederherstellen. Vorher-/Nachher-
   Bilder nach `backup/`.
5. Sabotage in beide Richtungen, Gate gruen mit Testzahl.

Kein Commit. Nichts auf `dev` testen.

## Abnahme - 2026-10-05, Commit `f87e49bc`

`[cmd]` **Diff:** 7 Dateien in `v2/goals` und `lib/goals`, neuer Test
`g606-messung-aendern.test.ts` (7 Faelle), Fremdtest `g422` nur in der
Schreibform angepasst. Gate gruen, web 2659, `[verdrahtung] gruen`.
`mockup-deckung.json` mitgeschrieben (38 Elemente zurueck, 54 fehlen).

`[read]` Am Schirm auf test-user: Gewicht aendern -> Snapshot bleibt
182; Datum aendern -> Snapshot folgt der Profilgroesse 183; Rueckbau
ueber die Oberflaeche auf den Ausgangsstand. Sabotage 7/7.

**Zwei Berichtigungen an meinem Auftrag:**
- `[cmd]` Der Trigger holt bei Datumsaenderung die **aktuelle**
  Profilgroesse, nicht ,die Groesse zu diesem Datum" - eine
  Groessenhistorie gibt es nicht. Fuer Erwachsene fachlich ausreichend.
- `[read]` Fuer den Bearbeiten-Griff gibt es kein Mockup; das Modal hat
  eins (`theme-v1/module-goals.jsx:828`). Gemeldet, an der Stelle vermerkt.

`[cmd]` **Geprueft und kein Fehler:** die Nebenwirkung auf das
Profilgewicht. `goals.refresh_profile_body_weight` nimmt immer die
NEUESTE Messung (`ORDER BY measurement_date DESC, measurement_time DESC`);
test-user hat genau eine (19.05.), deshalb folgte das Profil.
