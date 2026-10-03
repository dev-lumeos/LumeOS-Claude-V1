---
nr: G-590
typ: fehler
modul: recovery
schwere: hoch
angelegt: 2026-10-02
agent: claudecode
beauftragt: 2026-10-03
erledigt: 2026-10-03
commit: b1c4c540

braucht: [G-588, G-122]
kind_von: G-588

quellen:
  - docs/punkte/todos/quer-g-0588-sechs-serveraktionen-ohne-aufrufer.md
  - docs/punkte/erledigt/quer-g-0585-die-inventur-der-ausfuhren-ohne-aufrufer.md
  - docs/punkte/erledigt/goals-g-0577-die-umfangserfassung-hat-keinen-schreibweg.md

beruehrt:
  tabellen:
    - recovery.checkins
    - recovery.modality_log
  dateien:
    - apps/web/src/app/v2/recovery/tab-checkin.tsx
    - apps/web/src/app/v2/recovery/modale.tsx
    - apps/web/src/app/v2/recovery/erfassen-aktionen.ts
---

# Der Check-in ist der einzige Pflichtgriff — und er schreibt nicht

## Auftrag — Kopf

    AUFTRAG FUER Claude Code - G-590: drei Serveraktionen bekommen
                                     ihren Aufrufer
    Bereich: apps/web/src/app/v2/recovery/
             apps/web/src/lib/recovery/
    Fremd:   supabase/ gehoert Codex - er arbeitet gerade an A-95 und
             spielt dabei LIVE ein. docs/ gehoert dem Orchestrator,
             auch diese Punktdatei.
    Stand:   2026-10-03

## Stand 2026-10-03 — lies das zuerst, du faengst ohne Kontext an

`[cmd]` **In der Nacht zum 03.10. war Stromausfall** (Halt 05:59:22,
System oben 07:38:19). **Dein vorheriger Auftrag G-586 ist fertig und
abgenommen** — Commit `adc9db69`, der erneuernde `fetch` in
`packages/shared/src/supabase/uhrensprung.ts`, 19 Proben gruen. **Du
hast ihn gebaut, konntest aber nicht mehr berichten; der Orchestrator hat
ihn am Diff abgenommen und die Sabotage nachgefahren.** Nichts daran ist
offen, und `packages/shared/src/supabase/` ist wieder frei.

`[cmd]` **Der Arbeitsbaum ist sauber** — nur `backup/g577-535-vorher.sql`
und `-nachher.sql` liegen untracked da, die gehoeren Tom.

`[cmd]` **Umgebung ist oben:** alle neun Supabase-Container healthy, Web
3200 (`/login` 5,8 s) und Coach 3220 laufen. `pnpm gate` gruen, 18/18,
**web 2569 Tests** — das ist dein Ausgangsstand.

`[read]` **Codex arbeitet parallel an A-95 und spielt dabei LIVE in die
Datenbank ein** (Toms Freigabe): `nutrition.micronutrient_snapshot`,
`goals.goal_contributions`, und er entfernt eine alte
`berechne_zielwerte`-Fassung. **Recovery ist davon nicht betroffen** —
aber wenn dir eine Abfrage mit `PGRST202` oder einem fehlenden Objekt
antwortet, ist das sein Lauf und nicht dein Fehler. **Melde es, warte es
ab, rate nicht.**

## Der Befund

`[cmd]` **Aus der Inventur G-585, von Tom entschieden (G-588):** sechs
Serveraktionen haben keinen Aufrufer, **alle sechs bekommen eine
Oberflaeche.** `[cmd]` **Drei davon liegen in Recovery**, in einer
Datei:

    apps/web/src/app/v2/recovery/erfassen-aktionen.ts:44  checkinAktion
    ...                                              :52  modalitaetAnlegenAktion
    ...                                              :62  modalitaetAendernAktion

`[read]` **Berichtigung zu G-588:** der Punkt zaehlte vier Aktionen fuer
Recovery und nannte `messungAendernAktion` mit. **Gemessen liegt die in
Goals** (`apps/web/src/app/v2/goals/koerpermass-aktionen.ts:41`) und
gehoert zu G-591. **Recovery traegt drei, nicht vier.**

### Der Weg ist vollstaendig gebaut — bis auf den letzten Griff

`[cmd]` **`apps/web/src/lib/recovery/checkin-write.ts` ist die eine
Schreibstelle** (G-122, 286 Zeilen): `checkinSchreiben`,
`modalitaetAnlegen`, `modalitaetAendern`, Fehlerklasse
`RecoverySchreibFehler` mit vier Codes, Pruefregeln in
`checkin-regeln.ts`. **Die Serveraktionen wickeln sie und uebersetzen
Fehler in Feldfehler.** Es fehlt genau einer: der Aufruf aus dem
Formular.

`[cmd]` **Beide Tabellen liegen live, gemessen 2026-10-02:**

    recovery.checkins       29 Spalten   370 Zeilen   RLS an, 5 Policies
                            UNIQUE (user_id, entry_date)
    recovery.modality_log   17 Spalten   178 Zeilen   RLS an, 5 Policies
                            kein eindeutiger Schluessel je Tag

`[read]` **Daraus folgt die Form, nicht aus einer Annahme:** ein
Check-in je Nutzer und Tag — also `upsert`, und ein zweiter Besuch am
selben Tag aendert den Eintrag statt einen zweiten anzulegen. Eine
Anwendung dagegen darf mehrfach am Tag vorkommen — `insert`.
**`checkin-write.ts` macht das schon so.**

### Zwei Begruendungen am Schirm, die beide nicht mehr stimmen

`[cmd]` **`tab-checkin.tsx:13-14`, im Dateikopf:**

    Der Speichern-Knopf oeffnet `InEntwicklung` - es gibt keine
    Tabelle, in die er schreiben koennte.

**Falsch:** `recovery.checkins` traegt 370 Zeilen. `[cmd]` Und
`tab-checkin.tsx:16` sagt `[cmd] ALLES IST ATTRAPPE` fuer einen Tab, den
die Vorlage selbst *„the one required interaction"* nennt.

`[cmd]` **`modale.tsx:453`, am Log-Knopf:**

    `recovery.modality_log` gibt es (17 Spalten, 178 Zeilen live) und
    die Kachel liest sie. Was fehlt, ist der Schreibweg.

**Der Schreibweg existiert seit G-122.** `[read]` **Das ist dieselbe
Klasse wie der Vermerk in G-577** — eine Begruendung, die stimmte, als
sie geschrieben wurde, und die seither verhindert, dass jemand
nachsieht. Dort stand sie zwei Monate.

## Auftrag

**A1 — erst messen, was die Schreibstelle tut, dann den Griff bauen.**
`[read]` **Bei G-577, G-578, G-579 und G-582 hat genau das viermal einen
falschen Aufrufer verhindert** — eine Funktion legte den Datensatz selbst
an, eine setzte zwei gekoppelte Spalten, eine entdoppelte innerhalb 24
Stunden. `[cmd]` **Zu messen:** die Pflichtfelder aus `checkin-regeln.ts`
gegen die CHECKs der beiden Tabellen, die vier Fehlercodes, und was beim
zweiten Check-in am selben Tag passiert. **Nicht aus dem Formular
ableiten, sondern aus Regel und Schema.**

**A2 — der Check-in-Knopf schreibt.** `[cmd]` Der
`InEntwicklungKnopf` in `tab-checkin.tsx` wird der echte Speicherknopf
ueber `checkinAktion`. `[read]` **Die Vorschau links rechnet schon live
mit** (`vorschauScore`, G-82) — die bleibt, sie ist nicht die Attrappe.
**Was gespeichert wird, ist der Zustand des Formulars, nicht der
Vorschauwert.**

**A3 — der Log-Knopf schreibt**, ueber `modalitaetAnlegenAktion`
(`modale.tsx:452`). `[cmd]` **Und `modalitaetAendernAktion` braucht
seinen Ort:** such ihn, statt ihn zu erfinden — `modalitaeten-kachel.tsx`
liest die Tabelle, aber ob dort ein Bearbeiten-Griff vorgesehen ist, ist
zu messen. `[read]` **Wenn es keinen gibt, ist das ein Befund und kein
Grund, einen zu bauen** — dann melde, wo er hingehoerte, und lass die
Aktion mit einer Nummer am Export stehen.

**A4 — die Stelle muss leben.** `[cmd]` **Bei G-579 sah
`MealPlanActivationModal` wie der richtige Ort aus und war seit G-319
toter Code.** **Vor dem Einbau die Aufrufer der Zielstelle zaehlen**,
ohne Kommentare, und die Zahl in den Bericht.

**A5 — die beiden falschen Begruendungen richtigstellen**, nicht
loeschen: der Dateikopf von `tab-checkin.tsx` (die Tabelle gibt es, 370
Zeilen) und `[cmd] ALLES IST ATTRAPPE`, das nach A2 nicht mehr gilt.
`[read]` **Ein Vermerk, der eine Aussage aufhebt, wird an der Aussage
vermerkt** — nicht 200 Zeilen spaeter.

**A6 — was ausdruecklich STEHEN bleibt**, und zwar begruendet gemessen:

    modale.tsx:327   HRV        recovery.hrv_readings existiert nicht
    modale.tsx:1012  Protokolle recovery.protocols existiert nicht

`[cmd]` **Beide Tabellennamen sind live nicht vorhanden** (0 in
`information_schema.tables`). **Diese zwei Knoepfe bleiben Attrappe** —
sie gehoeren nicht zu diesem Punkt. `[read]` **Zum Protokoll-Knopf gibt
es allerdings einen Nebenfund (G-593): `recovery.recovery_protocols`
existiert mit 12 Spalten.** **Nicht hier aufloesen** — nur nicht
behaupten, es gaebe nichts.

**Nicht Teil:** `messungAendernAktion` und `prioritaetenSpeichern`
(G-591), `getHydrationSummary` (G-592), HRV und Protokolle (A6), die
uebrigen 50 toten Ausfuhren und die 328 ueberzaehligen (G-589).

**Zu belegen:** die gemessenen Pflichtfelder und Fehlercodes aus A1 ·
die Aufruferzahl der Zielstelle vor dem Einbau, ohne Kommentare · ein
Check-in durch die echte Oberflaeche geschrieben und zurueckgelesen, auf
`test-user@lumeos.local` · der zweite Check-in am selben Tag aendert,
statt zu doppeln, mit Zeilenzahl vorher/nachher · eine Anwendung
geschrieben, Zeilenzahl in `modality_log` vorher/nachher · Bilder vorher
und nachher, Attrappenzahl je Reiter vorher/nachher, keine
Konsolenfehler · Sabotage je Zusicherung in beide Richtungen, **je
Fundstelle gezaehlt, nicht gesucht** (die Klasse aus G-578, G-581 und
G-583) · `pnpm gate` gruen mit Testzahl · Testzeilen danach entfernt,
Bestand wieder 370 und 178 · nichts committen.

`[read]` **Zum Zeitpunkt:** Codex spielt unter A-95 live ein, darunter
`nutrition.micronutrient_snapshot` und `goals.goal_contributions`.
**Recovery ist davon nicht betroffen** — aber wenn dir eine Abfrage
unterwegs mit `PGRST202` oder einem fehlenden Objekt antwortet, ist das
sein Lauf und nicht dein Fehler. **Melde es, warte es ab, rate nicht.**

---

## Fortsetzung — 2026-10-03, 11:05. Du faengst erneut ohne Kontext an

`[read]` **Du hast diesen Auftrag heute schon zu ueber neun Zehnteln
erledigt und beim Browsernachweis angehalten, weil der Web-Server auf
3200 nicht lief. Der laeuft jetzt. Fang NICHT von vorn an.**

### Was fertig ist und nicht wiederholt werden darf

`[cmd]` **Dein Arbeitsstand liegt unverändert im Arbeitsbaum**, gemessen
um 11:04:

    M  apps/web/src/app/v2/recovery/ansicht.tsx
    M  apps/web/src/app/v2/recovery/erfassen-aktionen.ts
    M  apps/web/src/app/v2/recovery/modale.tsx
    M  apps/web/src/app/v2/recovery/tab-checkin.tsx
    M  apps/web/src/components/shell/__tests__/v2-attrappen.test.ts
    M  apps/web/src/lib/recovery/checkin-regeln.ts
    M  apps/web/src/lib/recovery/checkin-write.ts
    ?? apps/web/src/app/v2/recovery/__tests__/g590-aufrufer.test.ts

`[cmd]` **Nichts davon ist committet** — das macht der Orchestrator nach
deinem Bericht. **`pnpm gate` war gruen bei 2575 Tests** (vorher 2569),
**9 Sabotagen rot und wiederhergestellt.** A1 bis A6 sind eingelöst:
Check-in-Knopf und Log-Knopf schreiben, die zwei falschen Begruendungen
sind an Ort und Stelle berichtigt, `modalitaetAendernAktion` ist als
Befund am Export vermerkt (kein Ort dafuer, nichts gebaut), und HRV plus
die zwei Protokollknoepfe bleiben Attrappe mit einem Test darauf.

### Was noch offen ist — genau das und nichts anderes

`[cmd]` **Dein Skript steht bereit: `tools/_g590-schreiben.mjs`.** Offen
sind die fuenf Nachweise, die du selbst benannt hast:

    1  ein Check-in durch die Oberflaeche geschrieben und zurueckgelesen
    2  der zweite Check-in am selben Tag: aendert, statt zu doppeln,
       mit Zeilenzahl vorher und nachher
    3  eine Anwendung geschrieben, Zeilenzahl vorher und nachher
    4  Bilder vorher und nachher, Attrappen je Reiter, Konsolenfehler
    5  die Testzeilen danach entfernen

`[cmd]` **Der Bestand, auf den du aufräumst, gemessen um 11:05:**

    recovery.checkins       370   davon test-user 30
    recovery.modality_log   178

`[cmd]` **Der Server laeuft: PID 46852 auf 3200, antwortet in 0,1 s.**
Coach 3220 laeuft ebenfalls (PID 74132).

### Wenn 3200 wieder stirbt — und das ist moeglich

`[read]` **Er ist heute zweimal gestorben, und die Ursache ist NICHT
geklaert.** `[cmd]` Beide Male stand `[?25h` am Ende von
`backup/dev-server.log` — ein geordnetes Beenden, kein Absturz, kein
OOM. `[annahme]` Die Todeszeitpunkte fallen mit Code-Commits des
Orchestrators zusammen (die fahren `pnpm gate` mit Build); die reinen
docs-Commits hat er ueberlebt. **Zwei Faelle sind eine Korrelation, keine
Ursache.**

`[cmd]` **Der Orchestrator macht ab jetzt keinen Code-Commit, solange du
3200 brauchst.**

`[read]` **Wenn er trotzdem stirbt: starte ihn NICHT selbst.** Ein
`server.py start` aus deiner Sitzung stirbt mit ihr — genau das ist dir
heute früh passiert. **Melde es, dann startet Tom oder der Orchestrator
ihn abgekoppelt** (über den WMI-Dienst, Skript
`.git/server-start-abgekoppelt.ps1`).

### Zwei Dinge, die NICHT zu diesem Auftrag gehoeren

`[cmd]` **Codex arbeitet parallel an C-557** in
`supabase/_pipeline/13_supplements/` und `_validierung/`. **Finger weg von
`supabase/`.** Die zwei untracked Dateien `backup/a95-*.sql` sind seine
Nachweise aus A-95.

`[read]` **Deine Frage nach dem Score ist offen und bleibt offen:** ob
ein gespeicherter Check-in den Score neu rechnen soll, entscheidet Tom.
`[cmd]` **Du hast richtig gehandelt** — die Aufschrift
*„· recalculates score"* war falsch (kein Trigger, kein Aufrufer von
`refresh_scores_for_user`), du hast sie entfernt und vermerkt. **Bau
nichts dazu**, auch nicht vorsorglich.

**Zu belegen bleibt:** die fuenf Nachweise oben · Bestand am Ende wieder
370 und 178 · `pnpm gate` gruen mit Testzahl · nichts committen.

---

## Abnahme — 2026-10-03, Commit `b1c4c540`

`[cmd]` **Vom Orchestrator nachgemessen, nicht geglaubt** — Bestand nach
dem Lauf, je Nutzer:

    recovery.checkins       370   davon test-user 30
    recovery.modality_log   178   davon test-user  0
    Zeilen vom 03.10. bei test-user:  0

**Exakt der Ausgangsstand.** Das Aufraeumen war gezielt per `id`, nicht
pauschal — und es ist vollstaendig.

`[cmd]` **Die neun Bilder liegen in `backup/`**, je 273 bis 342 kB.
**Und sie belegen sich gegenseitig:** `g590-vorher-modalities.png` und
`-nachher-modalities.png` sind byte-gleich gross (317.013), ebenso
`today` (318.508) — genau die zwei Reiter, die er als unveraendert
meldet (23 → 23, 21 → 21). **Nur `checkin` unterscheidet sich** (342.089
→ 339.582), und dort sinkt die Attrappenzahl 14 → 13.

`[cmd]` **`recalculates score` steht noch zweimal in `apps/`, und beide
sind richtig:** `mockup-referenz.tsx:941` unter der Trennlinie (gewollt)
und `tab-checkin.tsx:261` als sein eigener Entfernungsvermerk. **Am
Knopf steht es nicht mehr.**

`[cmd]` **Sabotage vom Orchestrator**, an der Zusage *„eine 0 heisst kein
Kater und wird nicht abgelegt"* (`checkin-regeln.ts`, `v > 0` → `v >= 0`):

    1 Kontrollprobe            # pass 6  # fail 0
    2 mit Sabotage             # pass 5  # fail 1
    3 nach Wiederherstellung   # pass 6  # fail 0
    md5 vorher = md5 nachher   139855630affcd7c8e3aa41e65fdad14

`[read]` **Die Proben sind nicht Textsuche, sondern Verhalten:**
`checkinZusatz` und `pruefeCheckin` werden direkt aufgerufen und gegen die
CHECKs der Tabelle gehalten. **Das ist die Form, die G-583 verlangt hat.**

### Was er gefunden hat, ohne dass es im Auftrag stand

`[cmd]` **Vier Felder, die das Formular fuehrte und der Schreibweg nie
sendete:** Muskelkater, Alkohol, Koffein, Bildschirmzeit. **Jetzt gesendet,
mit Regeln aus den CHECKs** (zwei davon ganzzahlig, alle `>= 0`).

`[cmd]` **Und drei, die beim zweiten Speichern geleert worden waeren:**
Energie, Motivation, Notiz sind jetzt optional — fehlen sie, bleibt die
Spalte beim `upsert` unberuehrt. `[read]` **Das haette der Auftrag nicht
gefangen**, und es ist genau die Klasse, die ein `upsert` gefaehrlich
macht.

`[cmd]` **`· recalculates score` am Knopf war eine Zusage ohne Grundlage:**
kein Trigger, und kein Aufrufer von `refresh_scores_for_user` in `apps/`.
**Entfernt und vermerkt, nicht gebaut.** `[read]` **Die Frage, ob ein
gespeicherter Check-in den Score neu rechnen soll, gehoert Tom** und ist
offen.

### A3 — der Befund statt des Baus

`[cmd]` **`modalitaetAendernAktion` hat keinen Ort.** Die Vorlage traegt
keinen Bearbeiten-Griff, die Modalitaeten-Kachel zeigt die Zeilen ohne
Griff, und der einzige vorgesehene Aenderungsweg — *„Rate now"* im
Effectiveness log — setzt `next_day_effect`, das die Aktion nicht
schreibt, waehrend `ladeModalitaeten` keine `id` liest. **Nichts gebaut,
Nummer am Export.** `[read]` **Genau so war A3 gemeint:** *„wenn es
keinen gibt, ist das ein Befund und kein Grund, einen zu bauen."*

### Belege

`[cmd]` `pnpm gate` gruen, 18/18, **web 2575 Tests** (vorher 2569), 9
Sabotagen des Agenten rot und wiederhergestellt, dazu die eine des
Orchestrators. Commit `b1c4c540`, 8 Dateien, +346/−45. Konsolenfehler
unveraendert einer je Seitenaufruf (`data-mode` aus `RootLayout`, nicht
aus Recovery).

`[cmd]` **A6 steht:** HRV und die zwei Protokollknoepfe bleiben Attrappe,
mit einem Test auf genau diese drei. **G-593 bleibt davon unberuehrt.**

`[read]` **Offen aus diesem Punkt:** Toms Entscheidung zum Score, und
`modalitaetAendernAktion` wartet auf einen Ort — beides kein Baurest,
sondern benannte Befunde.
