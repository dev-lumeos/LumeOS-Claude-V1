# LUMEOS UI Mockup

> Interaktiver Design-Prototyp — alle 12 Module klickbar
> Status: **DRAFT V1** · Stand: 2026-04-27

---

## Öffnen

```
file:///D:/GitHub/LumeOS-Claude-V1/apps/web/public/mockup/index.html
```

Direkt in Chrome/Edge Adressleiste — kein Server, kein Build nötig.

Wenn LUMEOS Next.js (`apps/web`) läuft: `http://localhost:[port]/mockup/index.html`

---

## Design-Tokens ändern

**Alle Design-Entscheidungen in einer Datei:**

```
apps/web/public/mockup/tokens.css
```

Workflow:
1. `tokens.css` editieren (z.B. Farbe, Spacing, Gradient)
2. Browser-Reload
3. Mockup zeigt Ergebnis sofort

Beispiel:
```css
--brand-600: #0ea5e9;        /* Brand-Farbe testen    */
--sidebar-width: 280px;       /* Sidebar breiter        */
--surface-page: #f8f5f0;      /* Wärmerer Hintergrund   */
--gradient-nutrition: linear-gradient(135deg, #4ade80, #06b6d4);
```

---

## Module Status

| Modul | Gradient | Tabs ausgebaut |
|-------|----------|----------------|
| Dashboard | ✅ slate | Heute (voll) |
| Ernährung 🍽️ | ✅ green→teal | Tagebuch + Insights |
| Training 🏋️ | ✅ orange→red | Kalender + Progression |
| AI Coach 🤖 | ✅ blue→indigo | Chat (voll) |
| Ziele 🎯 | ✅ purple→pink | Übersicht (voll) |
| Supplements 💊 | ✅ teal→cyan | Heute (voll) |
| Recovery 😴 | ✅ blue→cyan | Übersicht + Schlafphasen |
| Medical 🩺 | 🔲 | Placeholder |
| Intelligence 🧠 | 🔲 | Placeholder |
| Analytics 📈 | 🔲 | Placeholder |
| Marketplace 🛒 | 🔲 | Placeholder |
| Admin ⚙️ | 🔲 | Placeholder |

---

## Datei-Struktur

```
apps/web/public/mockup/
  tokens.css    ← Single Source of Truth für alle Design-Tokens
  index.html    ← Mockup (linkt tokens.css, keine hardcoded Werte)
  README.md     ← Diese Datei
```

## Verhältnis zum echten Code

```
apps/web/public/mockup/    ← Dieser Prototyp (Design-Referenz)
apps/web/src/features/     ← Echte Module (werden hier aufgebaut)
apps/web/src/app/          ← Next.js Routes
docs/design-system/        ← Token-Spezifikationen (JSON)
```
