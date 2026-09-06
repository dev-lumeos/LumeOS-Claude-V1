---
nr: G-352
typ: entscheidung
modul: quer
schwere: hoch
angelegt: 2026-09-07
braucht: []
kind_von: G-222
entscheidung: null
beruehrt:
  tabellen: [goals.user_goals]
zahlen:
  gemessen: 2026-09-07
  goal_type: 4
  difficulty_level: 5
  adr: 12
---

# G-352 — drei Zielskalen widersprechen sich

## Befund

Aus G-83, Claude Code, 2026-09-07.

`[cmd]` **Nachgemessen in `goals.user_goals`:**

    goal_type          body_composition, performance, health,
                       lifestyle                          -- 4
    difficulty_level   easy, moderate, challenging,
                       aggressive, unrealistic            -- 5

`[cmd]` **Der ADR nennt zwoelf Zielarten** — **sie passen zu keiner
der beiden Tabellen.**

`[cmd]` **11 Zeilen liegen im Bestand.**

## Warum es blockiert

`[read]` **Der Onboarding-Entwurf hat einen Schritt *Ziel
waehlen*.** `[read]` **Welche Skala er zeigt, ist nicht
entschieden.**

`[read]` **Und `goal_type` ist Pflicht** — **wer ein Ziel anlegt,
muss einen der vier Werte setzen.**

## Zu entscheiden

`[read]` **Welche Skala gilt?**

`[read]` **Die vier `goal_type`-Werte sind Kategorien** —
*Koerperzusammensetzung*, *Leistung*, *Gesundheit*, *Lebensstil*.

`[read]` **Die zwoelf des ADR sind vermutlich konkrete Ziele** —
*abnehmen*, *Muskeln aufbauen*, *Marathon*.

`[cmd]` **`subtype` steht daneben und ist optional** — **das koennte
der Ort fuer die zwoelf sein.**

`[read]` **Dann waeren es keine drei Skalen, sondern zwei Ebenen:**
**vier Kategorien, zwoelf Unterarten.**

`[read]` **Zu pruefen, bevor eine dritte entsteht.**
