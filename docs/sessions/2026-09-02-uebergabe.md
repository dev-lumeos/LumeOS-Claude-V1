# Uebergabe 2026-09-02

**Stand:** `adff4a07` gepusht, Gate 15/15, Punktelauf gruen.
**Naechste Sitzung:** Sonntag. Tom ist bis Samstag in Bangkok.

---

## Wo wir stehen

    todos                212
    erledigt             263
    laufend_codex        leer
    laufend_claudecode   G-342 · G-333 · G-337  (Bericht steht aus)
    claudecode/next      G-340  Quick-Add
    Gate                 15/15

`[cmd]` **Der Baum ist sauber, alles gepusht.**

---

## Was heute entschieden wurde: E-45 bis E-63

Die vollstaendigen Texte stehen in `docs/entscheidungen/`.

    E-58   der Nutzer benennt seine Mahlzeiten
           meal_slots: position, name, planned_time,
           keine Obergrenze, kein `kind`
    E-59   der Plan bringt seine Struktur mit
           self_created nimmt die Slots als Vorlage, gelieferte
           tragen eigene
    E-60   die Webapp bleibt online, Buddy nicht
           kein Offline-Betrieb in apps/web -- auch spaeter nicht
    E-61   Vitamin A in IE aus den drei Tagesschnitten
           RETOL x 3,3333 + CARTB x 1,6667 + CAROTPAXB x 0,8333
    E-62   days_count ist die Laufzeit
    E-63   Sonstige faellt weg
           CHORL zu Fettbegleitstoffen, NT zu Protein

---

## Die drei Zahlen des Tages

### Der NRF9.3-Score laeuft

    morgens     0 von 120 Tagen
    nach E-61   44
    abends      65 complete, 40 incomplete, 15 no_data

`[read]` **Die IE-Funktion stieg bei jeder Komponentenluecke aus.**
Tom: *,,eine summe kann man bilden mit 0."*

`[cmd]` **Und `FIBT` war ein Backfill-Fehler bei zensiertem rohem
Lachs** — 37 Werte bekamen die E-38-Null.

`[cmd]` **`VITC` bleibt unvollstaendig** — echte BLS-Luecke bei
Ziegenfleisch, C-378 gilt.

### `backup/` von 5,97 auf 2,31 GiB

`[cmd]` **56 von 57 Vollsicherungen entsorgt.** `[cmd]` **Die
juengste bleibt:** `20260830_140937_c354_vor_live`.

**Die Regeln stehen in `backup/00-LIESMICH.md`:**

`[read]` **Kein Agent, kein Orchestrator loescht.** **Was seine Frist
ueberschreitet, geht nach `_temp/`. Tom entsorgt.**

`[cmd]` **`backup/quellen-NICHT-RAEUMEN.md`:** **sieben Fundstellen
lesen aus `backup/kimi-research/` und `backup/legacy-v2/`** — **ein
Raeumplan haette sie mitgenommen.**

`[cmd]` **`tools/backup-wachstum.mjs` laeuft im Gate** — meldet bei
ueber 2,5 GiB oder sieben Tagen ohne Inventur.

### `meal_slots` durch den ganzen Workflow

    C-392   die Tabelle, vier Policies, keine Obergrenze
    C-396   meal_plan_slots, Kopie beim Anlegen
    C-397   die drei gelieferten Plaene tragen je vier
    G-332   die Liste in Preferences links unten
    G-335   eine Namensquelle statt fuenf
    G-336   das Raster liest die Planstruktur

`[cmd]` **Und C-403: Cut traegt 4 Wochen/112 Eintraege, Lean 12
Wochen/336** — **der Seed ist idempotent.**

---

## Was auf dich wartet

### Entscheidungen

    G-222   Onboarding -- Inhalt festlegen. Die Daten stehen jetzt:
            meal_slots, food_preferences, vier Filtergruppen
    G-337   strong_avoid: CHECK-Wert ohne Schreibweg. Braucht ein
            Nutzer die Stufe je Lebensmittel?
    C-404   Aufbau-Wochenplan: 28 Tage beschrieben, 21 behauptet
    A-69    26 High-Severity-Abhaengigkeiten, darunter Next 14.2.35

### Vorbereitet, geht sofort raus

    G-340   Quick-Add bauen -- der einzige Zugang zu
            food_source = 'manual'. Alle 9.051 meal_items tragen
            heute 'bls'.
    C-405   Sonstige faellt weg (E-63)

---

## Die drei Fehler, die ich heute gemacht habe

`[read]` **Sie stehen hier, weil sie sich wiederholen werden.**

**1 · Dreimal eine Datei genannt, ohne sie zu oeffnen.**
`mikro-lage.ts` (G-136), `RecipeDetail` (G-311), `kopfknoepfe.tsx`
(G-339). `[read]` **Jedes Mal hat der Agent es berichtigt.**

**2 · `NULL` und `0` verwechselt, zweimal in einer Messung.**
`[cmd]` **C-399 stand auf zwei falschen Zahlen** — erst *,,kein
einziger Wert"*, dann *,,1.205 von 1.749"*. `[read]` **Beim zweiten
Mal kam das Gegenteil heraus, und ich merkte nicht, dass beide nicht
stimmen koennen.**

**3 · Dreimal den Auftrag vergessen, bevor ich abgenommen habe.**
`[cmd]` **Seit A-68 meldet `punkte-pruefen.mjs`:** *,,ACHTUNG: codex
hat nichts laufen, aber 3 Punkt(e) in next/."*

---

## Wie es weitergeht

`[read]` **Wenn Claude Code seinen G-342-Bericht liefert:** abnehmen,
**dann G-340 raus** — es liegt in `next/`.

`[read]` **Codex ist frei.** `[cmd]` **C-405 waere der naechste**
(E-63), **oder C-404.**

`[read]` **Und Tom hat heute gesagt, was zaehlt:** *,,wir kuemmern
uns um sachen die sehr wahrscheinlich ueber den schnitt keinen
einfluss haben."* `[cmd]` **Der ganze Tag ging um `CAROTPAXB`** —
**und `VITC` fehlte an dreimal so vielen Tagen.**
