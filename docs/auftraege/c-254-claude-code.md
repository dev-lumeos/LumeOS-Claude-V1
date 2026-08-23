# C-254 — Claude Code, 2026-08-23

Bericht: `docs/berichte/c-254-claude-code.md`

**Der Fund ist deiner, aus C-252, ueber den Auftrag hinaus.** Er
aendert eine Regel, die bisher zu eng formuliert war.

---

## WAS DU GEMESSEN HAST, UND WAS DARAUS FOLGT

`[cmd]` `summary_de` **0/288** · `metabolism_de` **0/290** ·
`storage_de` **0/54** · `name_de` **0/566**. Nur die drei
handgepflegten Gruppenlabels tragen Deutsch.

`[cmd]` **`name_de` ist `NULL`, nicht Leerstring.**
`NULLIF(name_de,'')` allein greift also nicht; es braucht `COALESCE`
darum.

`[read]` **Die Regel stand bisher als** *„`name_de` ist leer, die
Anzeige faellt auf Englisch zurueck"*. **Richtig ist: jedes Textfeld
braucht die Rueckfall-Logik.** Sonst zeigt die Oberflaeche an anderer
Stelle eine Leerstelle, wo ein Text stehen muesste — und niemand sieht
es, weil niemand danach sucht.

## WAS ZU TUN IST

1. **Alle `*_de`-Lesestellen durchgehen**, nicht nur die aus C-252.
   `[cmd]` **Ausdruecklich auch `apps/web/src/lib/supplements/` und
   `v2/medical/page.tsx`** — der Stack-Pfad wurde am selben Tag von
   Codex umgestellt (C-250) und ist **nicht** gegen diese Regel
   geprueft. **Nicht annehmen, dass er sie erfuellt.**

2. **Erst messen, welche Stellen betroffen sind** — Zahl hinschreiben,
   bevor du korrigierst.

3. **Die Regel als Pruefung festhalten, nicht als Merksatz.** Eine
   `*_de`-Spalte, die ohne Rueckfall gelesen wird, muss das Gate rot
   machen.

   `[read]` **Warum das der Kern ist:** A-50 steht seit Wochen als
   Merksatz im Register und hat C-250 trotzdem nicht verhindert.
   **Notierte Regeln brechen.**

4. **Wenn du keinen Pruefzuschnitt findest, der die echten Faelle
   trifft ohne bei jedem Feld anzuschlagen: melden mit Begruendung.**
   Eine dauerhaft rote Pruefung wird umgangen, nicht repariert.

## WAS NICHT ZU TUN IST

**Keine deutschen Texte erfinden oder uebersetzen.** Die `_de`-Spalten
bleiben leer — das ist laut Spec so gewollt, bis uebersetzt wird. Es
geht ausschliesslich um den Rueckfall beim Lesen.

`supplement_catalog` und `substance_catalog` **nicht loeschen** —
Schritt 5, nach C-253 und C-254.

`supabase/_pipeline/` **nicht anfassen** — Codex und Fable.
`apps/web/src/app/v2/recovery` und `apps/coach/` **nicht anfassen**.

Nicht committen, nicht stagen, nicht pushen.
Nichts in `docs/todo/` oder `docs/ssot/` schreiben.

## NACHWEIS — Erwartung VOR dem Lauf, beide Richtungen

**Zahl der Stellen ohne Rueckfall, vor der Korrektur.** Erwartung
danach: 0.

**Gegenprobe:** eine Zeile mit gefuelltem `_de` und eine ohne — beide
muessen richtig anzeigen. Nenn beide namentlich.

**Negativprobe:** einen Rueckfall entfernen; die neue Pruefung muss rot
werden. `[read]` **Deine Negativprobe in G-157 war beim ersten Anlauf
blind**, weil die Erwartungszeile mit ihrem Gegenstand verschwand.
Dieselbe Falle.

## ZUM BROWSER-NACHWEIS

`[cmd]` **`test-user@lumeos.local` ist weiterhin nicht anmeldbar.**
Fable arbeitet an der Dauerloesung (G-175). **Dreh nicht am Hash.**

Bis dahin: Nachweis auf `dev@lumeos.app` **mit Vermerk im Bericht,
dass es das falsche Konto ist** — oder kontounabhaengig fuehren, wenn
das geht. Das ist der bessere Weg.

## REGELN

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
Nie `pnpm dev` oder `npx next dev` — nur `python tools/server.py`.
`.next` nie loeschen, `next build` nie direkt aufrufen.
Bauen ueber `pnpm --filter @lumeos/web build`.
Pruefschleifen als Skript-Datei, nicht als Shell-Einzeiler mit `$(...)`.
Repo-Text mit Sonderzeichen nicht ueber die Standardeingabe einer
interaktiven Sitzung schreiben.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**
