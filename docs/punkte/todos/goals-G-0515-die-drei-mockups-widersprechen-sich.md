---
nr: G-515
typ: befund
modul: goals
schwere: mittel
angelegt: 2026-09-26

braucht: []
kind_von: G-510
entscheidung: E-70

beruehrt:
  dateien:
    - docs/spezifikation/10-plattform/design-system/theme-v1/module-goals.jsx
    - docs/spezifikation/10-plattform/design-system/theme-v1/module-goals-pro.jsx
    - docs/spezifikation/10-plattform/design-system/theme-v1/module-goals-editor.jsx
    - apps/web/src/app/v2/goals/daten.ts

zahlen:
  gemessen: 2026-09-26
  mockups: 3
  widersprueche: 28
  harte_zahlenkollisionen: 8
---

# G-515 - die drei Goals-Mockups widersprechen sich achtmal in Zahlen

## Warum dieser Punkt

`[read]` **G-475 und G-478 sind daran gescheitert, dass niemand ins
Mockup gesehen hat.** `[cmd]` **Hier ist hineingesehen worden — alle
drei Dateien, vollstaendig, 2.377 Zeilen.**

`[read]` **Der Befund ist nicht, dass sie sich widersprechen.**
**Der Befund ist, WELCHE Zahl gilt, wenn jemand die naechste Kachel
anbindet.**

## Die vierte Datei ist eine Kopie

`[cmd]` **`Theme claude design/module-goals*.jsx` ist byte-identisch
mit `theme-v1/`** — gleiche md5, gleiche Groesse, gleiche Zeilenzahl.
`[read]` **Keine zweite Fassung, nur ein kopierter Ordner.**

## Wie die drei zusammenhaengen

`[cmd]` **Strikt einseitig, kein Global wird doppelt gesetzt:**

    module-goals.jsx    setzt window.GoalsModule
                        ruft  5x window.Goals*View   -> pro
    module-goals-pro    setzt 5 Views
                        ruft  2x window.Phase*       -> editor
    module-goals-editor setzt PhaseEditorModal,
                              PhaseTemplateLibrary

`[read]` **Das bestaetigt, was `ansicht.tsx:13` annimmt:** ein
System, keine Alternativen. `[cmd]` **Der Kommentar dort stimmt.**

## Die acht harten Zahlenkollisionen

`[cmd]` **Gleiche Groesse, gleicher Stichtag, verschiedener Wert:**

    Groesse              Datei A            Datei B
    ------------------------------------------------------
    TDEE Mifflin x1,725  3.069  goals:556   2.732  pro:97
    Maintenance-kcal     3.100  goals:569   2.847  pro:96
    FFMI                 20,2   goals:553   22,3   pro:693
    Nutrition-Score      94     goals:243   88     pro:111
    Recovery-Score       78     goals:246   74     pro:113
    Anzahl Umfaenge      12     goals:123   13     pro:164
    Mandatory-Posen      8 (Label pro:810)  10 (Array pro:158)
    Kraft-Delta          +4,2 % pro:79      +1,2 % pro:675

`[read]` **Die ersten beiden sind die schlimmsten:** **beide Dateien
behaupten, Mifflin x 1,725 zu rechnen**, und kommen auf Zahlen, die
337 kcal auseinanderliegen.

## Was davon in unseren Code gelangt ist

`[cmd]` **Gemessen 2026-09-26:**

    2847 / 2732   daten.ts:313, mockup-referenz.tsx:606
                  -> BEIDE unter der Linie, Attrappe.  RICHTIG
    22.3          tab-physique.tsx:31
                  -> unter der Linie, Attrappe.        RICHTIG
    22.4          fehlende-kacheln.tsx:571
                  -> UEBER der Linie, ohne Marke.      FALSCH

`[cmd]` **Die 22,4 ist eine dritte Zahl** — sie steht in keinem der
drei Mockups. `[cmd]` **Behoben in G-512.**

`[read]` **Alles andere liegt korrekt unter der Trennlinie** — die
Widersprueche der Vorlage sind dort kein Mangel, sondern der
Vergleichsgegenstand (E-70).

## Die vier Widersprueche, die eine ENTSCHEIDUNG brauchen

`[read]` **Wer die naechste Goals-Kachel anbindet, stoesst darauf:**

**1 — `mini_cut` ist eine Sackgasse.**
`[cmd]` `pro.jsx:19` nennt es als Folgephase von `lean_bulk`,
`[cmd]` **`GOAL_PHASES` enthaelt es nicht**, `[cmd]` der Editor
bietet es im Auswahlfeld an (`editor.jsx:374`).
`[read]` **Unser CHECK kennt es** (9 Arten) — **das Mockup nicht.**

**2 — vier Uebergangssemantiken nebeneinander.**

    pro.jsx  next-Listen         gerichteter Graph
    pro.jsx:287                  jede Phase trotzdem „switchable"
    editor.jsx:185               drei Automatikstufen
    editor.jsx:395               EIN Schalter an/aus
    pro.jsx:12                   Guard erzwingt Wechsel

`[read]` **Welche gilt, ist nicht belegbar.**

**3 — 12 oder 13 Umfangsstellen, und ein anderes Delta.**
`[cmd]` `goals.jsx` rechnet Delta gegen den **aeltesten von sechs**
Eintraegen, `pro.jsx` gegen den **vorherigen** — **beide Kacheln
tragen denselben Untertitel** *,,last update May 14 · cm"*.
`[cmd]` **Beispiel Neck: −1,0 gegen −0,2.**
`[read]` **Unser `tab-koerper.tsx` fuehrt Unterarm links UND rechts
— also der 13er-Fassung folgend. Das ist entschieden.**

**4 — `CONTRIB_WEIGHTS` kennt einen einzigen Zieltyp.**
`[cmd]` `pro.jsx:117-119` hat nur `body_composition_gain`,
`[cmd]` das Modul fuehrt aber vier Zieltypen und bietet sechs an.
`[read]` **Vier von fuenf Zieltypen haben keinen Gewichtssatz** —
**das beruehrt G-514.**

## Was nur der Editor traegt

`[read]` **Der Editor ist nicht ,,noch ein Modal"** — er traegt
Sachen, die in den anderen beiden **gar nicht vorkommen:**

    PE_MODES            welche Felder je Phase editierbar sind
    Entwurfszustand     draft/dirty, „unsaved"-Pille
    Zwei-Ebenen-Modell  „personal override — defaults stay intact"
    Refeed-Planung      Multiplikator 1,8x, Wochentag, Schwelle 80 %
    Peak week           Wasser, Diuretika (mit „medical sign-off"),
                        Taper, Posing 2x/Tag
    Datumsanker         alles rechnet rueckwaerts vom Showtermin
    Guards als Regler   Zahl aus dem Text gezogen, Schieber daraus
    Exit-Semantik       „All are OR-combined" — steht NUR hier
    Vorlagenbibliothek  eigene + geteilte, mit Autor und Bewertung
    Coach-Schreibrecht  „Anders Lindqvist has write access"

`[cmd]` **Der letzte Punkt widerspricht `goals.jsx:881`**, wo Fotos
*,,never shared with coaches unless you explicitly add them"*
heissen. `[read]` **Zwei verschiedene Rechtemodelle in derselben
Vorlage.**

## Nicht zu tun

`[read]` **Die Mockup-Dateien werden NICHT berichtigt.** `[read]`
**Sie sind die Vorlage, kein Quelltext** — **wer sie glattzieht,
loescht den Vergleichsgegenstand.**

`[read]` **Dieser Punkt ist eine Karte, kein Auftrag.** `[read]`
**Er gehoert gelesen, bevor die naechste Goals-Kachel angebunden
wird.**
