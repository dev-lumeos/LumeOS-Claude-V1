---
nr: G-372
typ: feature
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-353
entscheidung: E-72
agent: claudecode
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: 994de555
beruehrt:
  dateien:
    - apps/web/src/app/v2/supplements/tab-spec.tsx
zahlen:
  gemessen: 2026-09-08
  funktionen: 5
  knoepfe: 1
---

# G-372 — die Stack-Kachel kann nichts

## Befund

Tom, 2026-09-08:

> ist ja alles huebsch, aber was soll mir eine uebersicht bringen
> ohne funktionen? ich kann weder reinschauen, noch editieren, noch
> aktivieren

`[cmd]` **Gemessen: ein einziger Knopf in `tab-spec.tsx`.**
**Die Kachel zaehlt, mehr nicht.**

`[cmd]` **Und die Schreibwege stehen alle:**

    supplements.create_curated_stack_template
    supplements.publish_stack_template
    supplements.withdraw_stack_template
    supplements.decide_stack_curation_candidate
    supplements.refresh_stack_item_count

`[read]` **Fuenf Funktionen in der Datenbank, und die Oberflaeche
ruft keine davon.**

`[read]` **Dasselbe Muster wie bei den Einkaufslisten vor G-344:**
**der Leseweg steht, der Anschluss fehlt.**

## Auftrag

**Beauftragt am 2026-09-08.**

### Was die Kachel koennen muss

    reinschauen   welche Posten traegt eine Vorlage?
    uebernehmen   eine Vorlage wird mein Stack
    editieren     meinen Stack aendern
    aktivieren    welcher Stack gilt gerade?
    teilen        meinen Stack veroeffentlichen
    zuruecknehmen ihn wieder privat stellen

`[cmd]` **`stack_template_items` traegt 13 Spalten** — **die Posten
sind da.**

`[cmd]` **`publish_stack_template` und `withdraw_stack_template`
sind gebaut und getestet** (C-423).

`[read]` **Miss, was fuer *uebernehmen* und *aktivieren* fehlt** —
**und melde es, statt es in `supabase/` zu bauen.**

### Lies zuerst

`[cmd]` **`docs/spezifikation/00-QUELLEN.md`, Abschnitt
Supplements.** `[cmd]` **Dann `docs/specs/Supplements/`,
insbesondere `SPEC_10_COMPONENTS.md:81` — der `TemplateSelector`.**

`[cmd]` **Und die Mockups, die `00-QUELLEN.md` nennt.**

### Abnahmebedingungen

**Miss jede einzeln, schreib die Zahl in den Bericht.**

    A1  je Vorlage: die Posten sind sichtbar.
        Zahl: Vorlagen / davon mit Posten am Schirm.

    A2  eine Vorlage uebernommen. Zahl: user_stacks
        vorher/nachher, stack_items vorher/nachher.

    A3  einen Stack aktiviert. Zahl: aktive vorher/nachher.
        Und: was geschieht mit dem vorher aktiven?

    A4  veroeffentlichen und zuruecknehmen, beide Richtungen.
        Zahl: Kandidat pending -> withdrawn.

    A5  E-69: Referenz unter der Linie. Zahl: angebunden /
        Referenzen.

    A6  was fehlt, je Funktion die noch nicht geht.

### Was nicht zu tun ist

**Nichts in `supabase/` aendern** — **Codex arbeitet an coach.**
**Nachweise auf `test-user@lumeos.local`.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen.**

## Bericht

**Claude Code, 2026-09-08.** **Alle Nachweise auf
`test-user@lumeos.local`, im Browser, angemeldet.**

### Gelesen, bevor gebaut

`[cmd]` **`00-QUELLEN.md`, Abschnitt supplements:** vier
Mockupdateien, zwoelf Specs.

`[cmd]` **`SPEC_10_COMPONENTS.md:81`** — `TemplateSelector`,
*,,Template-Auswahl fuer neuen Stack (Goal-Based)"*, dazu
`StackCard`, `StackDetail`, `StackActivateModal`.

`[cmd]` **`SPEC_03_USER_FLOWS.md`, Flow 2** — der Ablauf, den die
Komponenten tragen:

    4  [Template uebernehmen] oder [Von Grund auf erstellen]
    6  [Stack aktivieren]
       ,,Dein bisheriger aktiver Stack wird pausiert."
       -> Aktueller Stack  is_active = false
       -> Neuer Stack      is_active = true

`[cmd]` **Und das Layout: `module-supplements-spec.jsx:508`**
(Stackliste mit `Activate`/`Edit`, aktive Zeile eingefaerbt) **und
`:539`** (Vorlagen mit Postenpillen und ,,Use template").

`[read]` **Die Reihenfolge hat sich gelohnt** — der Mockup zeigt
,,Activate" **nur an den inaktiven** Zeilen. Das steht in keiner
Spec, nur im Bild.

### A1 — Posten sichtbar

**5 Vorlagen / 5 mit Posten.**

`[cmd]` **Am Schirm:** je Vorlage eine Pillenreihe mit Name und
Dosis (*,,NAC 200 mg"*), dazu Herkunftsmarke, Ziel und Knopf.

`[cmd]` **Die Posten kommen aus `stack_template_items`** — 13
Spalten, wie der Auftrag sagt. **Die Substanznamen aus
`supplements.supplements`**, beide in JE EINER Abfrage, nicht einer
je Vorlage (die Falle aus C-189: 64 Aufrufe in einer Schleife,
7.641 ms).

### A2 — eine Vorlage uebernommen

**`user_stacks` 2 → 3, `stack_items` 2 → 3.**

`[cmd]` **Ueber den Knopf ,,Übernehmen" an
*Koerperkomposition Grundlagen*:**

    Koerperkomposition Grundlagen | template | custom | inaktiv | 1

`[read]` **Der neue Stack wird NICHT automatisch aktiv** — die Spec
trennt das (Schritt 4 gegen Schritt 6), und die Oberflaeche auch.

`[cmd]` **Die Posten werden KOPIERT, nicht verknuepft**, und dabei
uebersetzt: `stack_template_items.dose_amount` → `stack_items.dose`.

#### Und der erste Versuch ist gefallen — ein Befund

`[cmd]` **Die Uebernahme scheiterte zuerst an
`user_stacks_goal_check`.** **Zwei Vokabulare fuer dasselbe Feld:**

    stack_templates.goal   KEIN CHECK — freier Text
                           belegt: body_composition, health,
                           lifestyle, performance
    user_stacks.goal       CHECK auf SIEBEN Werte
                           muscle_building, fat_loss,
                           recovery_sleep, health, longevity,
                           performance, custom

`[read]` **Nur `health` und `performance` stehen in beiden.**

`[cmd]` **Geloest ohne `supabase/` anzufassen:** was nicht in der
erlaubten Liste steht, wird `custom`. `[read]` **Nicht geraten** —
`body_composition` koennte Aufbau ODER Diaet meinen, und das
entscheidet der Nutzer.

`[read]` **Gemeldet, nicht ausgeglichen:** ob die Listen
zusammengefuehrt werden, ist eine Schemafrage.

### A3 — einen Stack aktiviert

**aktive vorher 1 / nachher 1.**

`[cmd]` **Und der vorher aktive:**

    vorher    Nachweis-Stack                 t
              Koerperkomposition Grundlagen  f
    nachher   Nachweis-Stack                 f
              Koerperkomposition Grundlagen  t

`[read]` **Genau Flow 2:** *,,Dein bisheriger aktiver Stack wird
pausiert."*

`[cmd]` **`uq_user_stacks_one_active` ist ein partieller
Eindeutigkeitsindex** (`ON (user_id) WHERE is_active`). **Deshalb
erst abschalten, dann einschalten** — die andere Reihenfolge
kollidiert.

### A4 — veroeffentlichen und zuruecknehmen

**Kandidat `pending` → `withdrawn`, beide Richtungen belegt.**

    Teilen         Kandidaten 1 -> 2 (beide pending)
                   Vorlagen    5 -> 6
    Zuruecknehmen  Koerperkomposition Grundlagen: pending -> withdrawn

`[cmd]` **Die Knoepfe folgen dem Zustand:** der zurueckgenommene
Stack bietet wieder ,,Teilen", der geteilte ,,Zuruecknehmen", der
aktive kein ,,Aktivieren".

`[cmd]` **`geteilt` ist gemessen, nicht erfunden:** ein
`stack_curation_candidates`-Eintrag mit dieser `origin_stack_id` und
Status `pending` oder `approved`. **Ein Feld dafuer gibt es in
`user_stacks` nicht.**

### A5 — E-69: Referenz unter der Linie

**4 angebunden / 4 Referenzen.**

`[cmd]` **Vorher 4 / 3** — `Je Eintrag hinterlegt` stand ohne
Gegenstueck. **`module-supplements-spec.jsx:562` fuehrt sie** als
`Item customization`; ergaenzt.

    OBEN   Meine Stacks | Vorlagen | Einnahmefrequenz |
           Je Eintrag hinterlegt
    UNTEN  My stacks | System templates | Frequency options |
           Item customization

### A6 — was noch nicht geht

**2 von 6 Funktionen fehlen.**

    reinschauen    GEHT   Posten je Vorlage, A1
    uebernehmen    GEHT   A2
    aktivieren     GEHT   A3
    teilen         GEHT   A4
    zuruecknehmen  GEHT   A4
    editieren      FEHLT  siehe unten
    neuer Stack    FEHLT  einzige verbliebene Attrappe

**`editieren` — und es braucht KEINE Datenbankarbeit:**

`[cmd]` **Drei Schreibwege stehen bereits in
`lib/supplements/stack-write.ts`:** `ergaenzePosition`,
`entfernePosition`, `setzeBestand`. **Kein einziger Aufrufer in der
Oberflaeche** — gemessen.

`[read]` **Dasselbe Muster wie bei den Einkaufslisten vor G-344 und
wie bei dieser Kachel:** die Wege sind da, niemand ruft sie.

`[cmd]` **`neuer Stack` ist noch `InEntwicklungKnopf`** — die
einzige verbliebene Attrappe in der Kachel.

`[read]` **Beides ist Oberflaechenarbeit, keine Schemafrage.**

### Was NICHT in supabase/ gebaut wurde

`[cmd]` **Die fuenf Funktionen aus C-423 stehen** — gemessen ueber
`pg_proc`. **Keine davon aktiviert einen Stack oder uebernimmt eine
Vorlage.**

`[cmd]` **Sie werden dafuer auch nicht gebraucht:** `authenticated`
hat INSERT, SELECT, UPDATE, DELETE auf `user_stacks` und
`stack_items` — gemessen ueber `role_table_grants`. **Beides laeuft
ueber den Sitzungsclient wie jeder andere Schreibweg des Moduls.**

`[read]` **Gemeldet statt gebaut**, wie beauftragt: **die zwei
Ziel-Vokabulare** (oben, A2).

### Pruefstand

    tsc --noEmit                gruen
    next lint                   gruen
    encoding-pruefen            20.911 Dateien, sauber
    pnpm --filter web test      1502 pass, 1 fail — NICHT von mir

`[cmd]` **Der Fehlschlag ist `C-225/G-169` (,,Einladen fehlt")** und
liest `lib/coach/nachrichten-schreiben.ts`. **Die Datei ist
geaendert, zusammen mit `supabase/_pipeline/15_coach/` und den
Testdaten** — **Codex arbeitet dort an coach**, wie der Auftrag
sagt. `[read]` **Nicht angefasst.**

### Was unberuehrt blieb

`[cmd]` **`dev@lumeos.app`: 1 Stack, unveraendert.**
`[cmd]` **Alle Schreibvorgaenge auf `test-user`** — 3 Stacks,
3 Posten, 2 Kandidaten.

`[read]` **Die Nachweiszeilen stehen bewusst noch da** — sie sind
der Beleg, den Tom am Schirm ansehen kann (E-69, ,,wer einen Nachweis
fuehrt, laesst die Buehne stehen").

**Nichts in `supabase/`. Nicht committet, nicht gestaget.**

### Geaendert

    lib/supplements/stack-write.ts       aktiviereStack,
                                         uebernimmVorlage,
                                         zielFuerStack
    lib/supplements/substanz-read.ts     Posten je Vorlage, geteilt
    v2/supplements/stack-aktionen.ts     NEU, vier Serveraktionen
    v2/supplements/tab-spec.tsx          die Knoepfe
    v2/supplements/mockup-referenz.tsx   Item customization
    lib/supplements/__tests__/
      stack-lage.test.ts                 geteilt im Hilfsbauer

## Abnahme

**2026-09-08, Orchestrator.** **Sechs Bedingungen mit Zahlen.**

    A1  5 Vorlagen / 5 mit Posten, je eine Abfrage
    A2  user_stacks 2 -> 3, stack_items 2 -> 3
    A3  aktiv 1 -> 1, der vorherige t -> f
    A4  pending -> withdrawn, beide Richtungen
        Kandidat 1 -> 2, Vorlage 5 -> 6
    A5  4 angebunden / 4 Referenzen (war 4/3)
    A6  2 von 6 fehlen noch

### Die Quellen zuerst gelesen — und es hat sich gelohnt

`[cmd]` **`SPEC_03` Flow 2 gab die Aktivierungssemantik:** *,,your
previous stack is paused."*

`[cmd]` **Und `module-supplements-spec.jsx:508` gab, was keine Spec
sagt:** *,,Activate erscheint nur auf inaktiven Zeilen."*

`[read]` **Das steht nur im Bild** — **genau dafuer ist das Mockup
Referenzobjekt** (E-70).

### A3 — die Reihenfolge ist keine Kleinigkeit

`[cmd]` **`uq_user_stacks_one_active` ist ein partieller
eindeutiger Index** — **deaktivieren muss vor aktivieren
kommen.**

`[read]` **Wer es umdreht, bekommt einen Verstoss, und die
Fehlermeldung nennt nicht den Grund.**

### Der Fund, den er selbst als Lehre notiert

`[cmd]` **Nachgemessen:**

    stack_templates   body_composition, custom, health,
                      lifestyle, performance      KEIN CHECK
    user_stacks       muscle_building, fat_loss,
                      recovery_sleep, health, longevity,
                      performance, custom         CHECK

`[cmd]` **Drei gemeinsame Werte, fuenf ohne Gegenstueck.**

`[read]` **Das sind zwei Begriffssysteme, kein Tippfehler.**

`[read]` **Und es fiel erst beim Schreiben auf** — **vier Wochen
lang stand es nebeneinander.**

`[read]` **Seine Entscheidung, `custom` zu setzen statt zu raten,
ist richtig:** `body_composition` **koennte Aufbau oder Diaet
heissen** — **und das entscheidet der Nutzer.**

**Als C-427.**

### A6 — zwei fehlen, und eines davon ist wieder A-71

`[cmd]` **`ergaenzePosition`, `entfernePosition` und `setzeBestand`
stehen in `stack-write.ts` mit null UI-Aufrufern.**

`[read]` **Dasselbe Muster wie diese Kachel selbst und wie die
Einkaufslisten vor G-344** — **siebter Fall.**

`[cmd]` **`Neuer Stack` ist der letzte `InEntwicklungKnopf`.**

**Abgenommen.**

