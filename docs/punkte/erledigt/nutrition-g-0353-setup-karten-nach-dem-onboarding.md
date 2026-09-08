---
nr: G-353
typ: feature
modul: nutrition
schwere: mittel
angelegt: 2026-09-07
braucht: []
kind_von: G-141
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: d8b7cc58
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/ansicht.tsx
zahlen:
  gemessen: 2026-09-07
---

# G-353 — Setup-Karten nach dem Onboarding

## Befund

Aus G-83, Claude Code, 2026-09-07, gemeldet damit es nicht
verlorengeht.

`[read]` **Der Onboarding-Entwurf ist dreistufig und
uebersprungbar** (G-222).

`[read]` **Wer ueberspringt, hat Vorgaben** — **aber keine
Einladung, sie zu ersetzen.**

`[cmd]` **G-141 beschreibt Karten, die nach dem Onboarding
erscheinen** — *,,leg deine Mahlzeiten fest"*, *,,waehle dein
Ziel"*.

`[read]` **Sie gehen verloren, wenn G-141 geschlossen wird** —
**deshalb ein eigener Punkt.**

## Was zu klaeren ist

`[read]` **Wann verschwindet eine Karte?** `[cmd]` **Wenn der
Nutzer die Sache erledigt** — **oder wenn er sie wegwischt?**

`[read]` **Und wie viele auf einmal:** **fuenf Karten sind ein
zweites Onboarding, das man nicht ueberspringen kann.**

`[read]` **Der Unterschied zum Onboarding ist die Freiwilligkeit** —
**eine Karte ist ein Angebot, ein Schritt ist ein Weg.**

## Auftrag — die vier fehlenden Schritte

**Mitbeauftragt: G-141, C-193.** Bericht in diese Datei.

**Beauftragt am 2026-09-07.**

### 1 · G-353 — die Setup-Karten

`[read]` **Du hast sie gemeldet, damit sie nicht verlorengehen** —
richtig.

`[read]` **Entwirf sie:** **wann erscheint eine, wann verschwindet
sie, wie viele auf einmal?**

`[read]` **Der Unterschied zum Onboarding ist die Freiwilligkeit** —
**eine Karte ist ein Angebot, ein Schritt ist ein Weg.**

`[cmd]` **Nicht bauen** — entwerfen.

### 2 · G-141 — was davon abgedeckt ist

`[cmd]` **Du hast gemessen: die drei Punkte sind Vorlage,
Entscheidung und Messung** — **keine Dubletten.**

`[read]` **Miss, was von G-141 nach G-353 uebrigbleibt** — **und
schliess ihn, wenn nichts.**

### 3 · Die vier fehlenden Schritte

`[cmd]` **Du hast sie benannt, und zwei blockieren wirklich.**

`[read]` **Schreib je Schritt auf, was ihn blockiert** — **und ob
die Blockade eine Entscheidung ist oder Arbeit.**

`[cmd]` **Bei den Zielen ist es eine Entscheidung** (G-352) — **vier
`goal_type`, fuenf `difficulty_level`, zwoelf im ADR.**

`[read]` **Mein Verdacht: es sind keine drei Skalen, sondern zwei
Ebenen.** `[cmd]` **`subtype` steht optional daneben** — **das
koennte der Ort fuer die zwoelf sein.** `[read]` **Miss es.**

### Was nicht zu tun ist

**Kein Onboarding bauen** — **die Entscheidung zu den Zielen fehlt.**
**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen.**

### Nachweis

    Setup-Karten   entworfen, mit Verschwindregel
    G-141          was uebrigbleibt / geschlossen
    vier Schritte  je Blockade: Entscheidung oder Arbeit
    subtype        traegt es die zwoelf? gemessen

## Bericht

**Claude Code, 2026-09-08. Gebaut und nachgewiesen.**
**Alle Nachweise auf `test-user@lumeos.local`.**

### A1 — wie viele Karten, unter welcher Bedingung

**2 Karten / 2 Bedingungen.**

    Rang  Karte                Bedingung
    1     Setz dir ein Ziel    goals.user_goals   = 0 Zeilen
    2     Wähl deine Phase    goals.goal_phases  = 0 Zeilen

`[cmd]` **Gemessen auf `test-user`, 2026-09-08 — warum genau
diese zwei und keine weiteren:**

    food_preferences   1 Zeile    Vorgabe steht  -> KEINE Karte
    meal_plan_slots    4 Zeilen   gesetzt        -> KEINE Karte
    user_goals         0 Zeilen   nur Nutzer     -> KARTE
    goal_phases        0 Zeilen   nur Nutzer     -> KARTE

`[read]` **Das ist Regel 1 des Entwurfs:** eine Karte haengt an der
LEERE, nicht am Konfigurationszustand. **Konfiguriert ist immer
alles** — jede `food_preferences`-Spalte hat eine Vorgabe (G-222).
**Eine Karte, die auf ,,unkonfiguriert" wartet, erschiene nie.**

`[cmd]` **Die dritte moegliche Karte ist bewusst NICHT gebaut:** der
Erfahrungsgrad. **Seine Skala ist nicht entschieden** (G-228/E-46)
— **eine Karte fuer etwas ohne Skala waere ein Angebot ohne Ziel.**

`[read]` **Und hoechstens EINE erscheint** (Regel 3). Der Leseweg
gibt genau eine zurueck oder `null`; die Ansicht zeigt, was er
liefert. **Fuenf Karten waeren ein zweites Onboarding, das man nicht
ueberspringen kann.**

### A2 — beide Richtungen, am Schirm

**2 von 2 Karten, je beide Richtungen belegt.**

`[cmd]` **Richtung 1 — leeres Konto, Karte erscheint:**

    /v2/nutrition?tab=diary
    ,,Setz dir ein Ziel"
    ,,Ohne Ziel rechnet LumeOS mit Standardwerten. Mit Ziel richten
      sich Kalorien und Makros danach."   [Ziel setzen]

`[cmd]` **Richtung 2 — ein Ziel angelegt** (`user_goals` 0 → 1):

    ,,Setz dir ein Ziel"    VERSCHWUNDEN
    ,,Wähl deine Phase"    ERSCHIENEN

`[read]` **Damit ist auch Regel 3 belegt:** **die zweite Karte rueckt
nach, nicht beide gleichzeitig.**

`[cmd]` **Und zurueck** (`user_goals` 1 → 0): **,,Setz dir ein
Ziel" steht wieder da.**

`[read]` **Das ist Regel 2, und zwar die Haelfte, die eine
Wegwisch-Spalte NICHT koennte:** **die Karte kommt zurueck, wenn der
Zustand zurueckkehrt.** **Wer sie wegwischt und sein Ziel spaeter
loescht, haette dieselbe leere Stelle und keine Einladung mehr.**

`[cmd]` **Buehne gezaehlt abgebaut:** 1 Zeile angelegt, 1 geloescht,
`title like 'G353%'` → **0 Reste.**

### Ein Befund nebenbei: die Vorgabe von `priority` ist unbrauchbar

`[cmd]` **Beim Anlegen der Buehne fiel `user_goals_check1`:**

    CHECK (status <> 'active' OR (priority >= 1 AND priority <= 3))

`[cmd]` **`priority` hat aber die Vorgabe 5.** `[read]` **Damit kann
kein aktives Ziel ueber die Vorgabe angelegt werden** — jeder
Schreibweg muss `priority` selbst setzen, sonst faellt der CHECK.

`[read]` **Gemeldet, nicht geaendert** — `supabase/` gehoert Codex.

### A3 — E-69: Referenz unter der Linie

**1 angebunden / 1 Referenz** — **und die Setup-Karte braucht
keine.**

`[cmd]` **Der Diary-Reiter traegt seine Linie und seine Referenz**
(aus frueherer Arbeit) — am Schirm gemessen: `Linie: true`.

`[cmd]` **Fuer die Setup-Karte selbst gibt es KEIN Mockup-
Gegenstueck:** weder `theme-v1/` noch `mockup-zwischenwurf/` kennt
sie; **sie steht nur im `ONBOARDING_ADR.md`.**

`[read]` **Ein Soll, das es nicht gibt, laesst sich nicht
danebenstellen** — **und eine Referenz auf eine Beschreibung waere
genau die Attrappe der Attrappe, die Tom abgelehnt hat.**

### A4 — E-72: keine nackte Null

**Vorlagenkachel: 1 Kachel / 1 mit Daten / 0 mit Leerhinweis.**

`[cmd]` **Vorher:** die Kachel zeigte *,,Fuer Vorlagen gibt es eine
Tabelle, aber noch keinen Inhalt"* — **obwohl fuenf Zeilen
dastehen.**

`[cmd]` **Die Ursache war kein fehlender Bestand, sondern eine fest
verdrahtete Null:** `vorlagenLageVon(0)`, aus der Zeit, als die
Tabelle leer war (G-253). **Die Kachel konnte nie etwas anderes
zeigen als ihren Leerhinweis.**

`[read]` **Die Lage kommt jetzt aus der Zahl** — faellt der Bestand
wieder auf null, greift derselbe Leerhinweis von selbst.

**Sabotageprobe:** `vorlagenLageVon(vorlagen.length)` zurueck auf
`vorlagenLageVon(0)` → der alte Falschtext war wieder da.
Zurueckgedreht → *,,4 kuratiert · 1 vom Nutzer"*.

**Setup-Karte: 1 Kachel / 1 mit Daten / 0 mit Leerhinweis.**
`[read]` **Ohne Karte rendert sie NICHTS** — kein Platzhalter,
keine leere Huelle. **Eine leere Setup-Karte waere selbst die nackte
Null, die E-72 verbietet.**

### A5 — Vorlagen je Herkunft, am Schirm

**4 kuratiert / 1 vom Nutzer.**

`[cmd]` **Der Bestand ist da** — C-423/C-424 sind eingespielt:

    Koerperkomposition Grundlagen   kuratiert   body_composition
    Performance Grundlagen          kuratiert   performance
    Gesundheit Grundlagen           kuratiert   health
    Lifestyle Grundlagen            kuratiert   lifestyle
    C423 Test-user teilen           vom Nutzer  health

`[cmd]` **Am Schirm, `/v2/supplements?tab=stacks`:** Kopfzeile
*,,4 kuratiert · 1 vom Nutzer"*, je Zeile Name, Herkunftsmarke,
Ziel und Beschreibung.

`[cmd]` **Die Zeilenrechte entscheiden ueber die Sichtbarkeit, nicht
der Leseweg:**
`source <> 'user' OR is_public OR owner_id = auth.uid()`.

### Was gebaut wurde

    lib/nutrition/setup-karten.ts        NEU  der Leseweg
    v2/nutrition/setup-karte.tsx         NEU  die Karte
    v2/nutrition/page.tsx                     laedt und reicht durch
    v2/nutrition/ansicht.tsx                  zeigt sie im Diary
    lib/supplements/substanz-read.ts          ladeStackVorlagen
    v2/supplements/{page,ansicht,kontext}      durchgereicht
    v2/supplements/tab-spec.tsx               Kachel angebunden

`[cmd]` **Der Leseweg fragt nur, OB etwas leer ist** — zwei
Zaehlabfragen mit `head: true`, keine Zeilen. **`ladeZiele` waere
der falsche Weg: sie ruft je Ziel eine RPC auf.**

`[read]` **Und ein Lesefehler erzeugt KEINE Karte** — wer bei einem
Fehler einlaedt, laedt vielleicht zum Anlegen von etwas ein, das
schon da ist.

### Pruefstand

    tsc --noEmit                gruen
    next lint                   gruen
    encoding-pruefen            20.904 Dateien, sauber
    pnpm --filter web test      1500 pass, 2 fail — NICHT von mir

`[cmd]` **Die zwei Fehlschlaege liegen in
`lib/coach/__tests__/rechte-schreiben.test.ts`** (G-324, C-269).
**Die Datei ist ungetrackt und wurde um 09:08 geschrieben, meine um
09:01** — **Codex arbeitet dort gerade.** `[read]` **Nicht
angefasst.**

### Was unberuehrt blieb

`[cmd]` **`dev@lumeos.app`: 5 Ziele, unveraendert.**
`[cmd]` **`test-user`: 0 Ziele — Buehne abgebaut, keine Reste.**

**Nichts in `supabase/`. Nicht committet, nicht gestaget.**

## Abnahme

**2026-09-08, Orchestrator.** **Alle fuenf mit Zahlen.**

    A1  2 Karten / 2 Bedingungen
    A2  2 von 2, je beide Richtungen, Buehne rueckstandsfrei
    A3  1 angebunden / 1 Referenz -- die Karte selbst hat kein
        Mockup-Gegenstueck
    A4  Vorlagen 1/1/0, Setup-Karte 1/1/0
    A5  4 kuratiert / 1 vom Nutzer, am Schirm

### A4 ist der wichtigste Fund

`[cmd]` **Die Vorlagenkachel zeigte *,,noch keinen Inhalt"*,
obwohl fuenf Zeilen dastanden.**

`[cmd]` **Die Ursache war eine fest verdrahtete Null:**
`vorlagenLageVon(0)` — **aus der Zeit, als die Tabelle leer war.**

`[read]` **Das ist A-71 in neuer Form:** **nicht ein ungenutzter
Leseweg, sondern einer, der eine Konstante liest statt der
Wirklichkeit.**

`[read]` **Und die Kachel konnte nie etwas anderes zeigen** — **kein
Bestand haette daran je etwas geaendert.**

`[cmd]` **Sabotageprobe: zurueck auf `vorlagenLageVon(0)` brachte
den Falschtext wieder.**

### Warum genau zwei Karten

`[cmd]` **Gemessen, warum keine dritte:**

    food_preferences   1 Zeile    Vorgabe steht  -> keine Karte
    meal_plan_slots    4 Zeilen   gesetzt        -> keine Karte
    user_goals         0 Zeilen   nur Nutzer     -> KARTE
    goal_phases        0 Zeilen   nur Nutzer     -> KARTE

`[read]` **Und der Satz dahinter ist die Begruendung fuer die ganze
Machart:** *,,Konfiguriert ist immer alles — eine Karte, die auf
*unkonfiguriert* wartet, erschiene nie."*

`[cmd]` **Die dritte moegliche Karte ist bewusst nicht gebaut:**
**der Erfahrungsgrad, dessen Skala nicht entschieden ist**
(G-228/E-46).

`[read]` **Eine Karte fuer etwas ohne Skala waere ein Angebot ohne
Ziel.**

### A2 belegt, warum die Leere richtig ist

`[cmd]` **Ziel angelegt: Karte 1 verschwindet, Karte 2 rueckt
nach.** `[cmd]` **Ziel geloescht: Karte 1 steht wieder da.**

`[read]` **Das ist die Haelfte, die eine Wegwisch-Spalte nicht
koennte** — **wer wegwischt und sein Ziel spaeter loescht, haette
dieselbe leere Stelle und keine Einladung mehr.**

### A3 — kein Soll, also keine Referenz

`[cmd]` **Weder `theme-v1/` noch `mockup-zwischenwurf/` kennt die
Setup-Karte** — **sie steht nur im ADR.**

`[read]` **Und sein Satz trifft es:** *,,eine Referenz auf eine
Beschreibung waere genau die Attrappe der Attrappe."*

### Ein Befund nebenbei, und er ist echt

`[cmd]` **Selbst nachgemessen:**

    user_goals_priority_check   priority 1 bis 10
    user_goals_check1           active verlangt 1 bis 3
    Vorgabe                     5

`[read]` **Ein aktives Ziel laesst sich ueber die Vorgabe nicht
anlegen** — **jeder Schreibweg muss `priority` selbst setzen.**

`[read]` **Gemeldet, nicht geaendert** — `supabase/` gehoert Codex.
**Als C-425.**

**Abgenommen.**

