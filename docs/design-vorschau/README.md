# Designvorschau

Eigenständige HTML-Seiten, ohne Build im Browser zu öffnen. Alle ziehen die
Farbwerte beim Erzeugen aus `apps/web/src/app/globals.css` — sie zeigen also
keine Kopie, sondern das, was die App hat.

**Nach Änderungen an `globals.css`:**

```
node docs/design-vorschau/build.mjs
node docs/design-vorschau/build-varianten.mjs
node docs/design-vorschau/build-altbestand.mjs
```

---

## Referenz

| Datei | Inhalt |
|---|---|
| `tokens.html` | Alle Tokens als Proben, Dunkel und Hell, mit Vermerk welche im Hellmodus abweichen |
| `altbestand.html` | Das Konzept vom 2026-04-27, rekonstruiert aus `docs/design-system/tokens/*.json`. **Historisch** — beschreibt den Vorgängercode |

## Fünf Richtungen

Recherchiert 2026-08-04, Grundlage in
`docs/spezifikation/10-plattform/design-system/00-diskussionsstand.md`.

| Datei | Richtung | Kern |
|---|---|---|
| `variante-a-instrumententafel.html` | WHOOP-Linie | Verdichtung statt Anzeige. Eine Zahl, drei Stufen: Überblick, Verlauf, Detail |
| `variante-b-bento.html` | Bento | Kachelfläche kommuniziert Priorität. Layoutsprache, mit A oder C kombinierbar |
| `variante-c-glas.html` | Liquid Glass | Glas trennt Ebenen ohne zusätzliche Farben — nur für Navigation und Dialoge, nie hinter Zahlen |
| `variante-d-narrativ.html` | Datennarrativ | Der Wochenrückblick als Erzählung in vier Kapiteln. Scrollen. Für Buddy |
| `variante-e-klinik.html` | Ruhige Klinik | Körperkarte und Referenzbereiche. Startet im Hellmodus. Für Medizin |

---

## Was diese Seiten nicht sind

Keine Entscheidung und keine Spezifikation. Sie machen fünf Richtungen
vergleichbar, damit die Designsitzung an Beispielen entscheidet statt an
Beschreibungen.

Was daraus wird, ist TODO A-06.

## Regeln, die in allen Varianten eingehalten sind

- **Kein Datenwert steht auf Unschärfe.** In `variante-c` haben die Karten
  einen Glasrand, aber eine deckende Fläche. Glasmorphismus scheitert, sobald
  der Kontrast unter WCAG AA fällt.
- **`prefers-reduced-motion` wird ausgewertet.** Alle Animationen werden auf
  praktisch null gesetzt, wenn das System es verlangt.
- **Bewegung teilt einen Zustand mit**, sie schmückt nicht: der Ring füllt sich
  auf den erreichten Wert, die Marke setzt sich in den Referenzbereich, die
  Kacheln erscheinen in der Reihenfolge ihrer Wichtigkeit.
- **Keine erfundenen Tokens.** Was nicht in `globals.css` steht, kommt aus
  `color-mix()` auf vorhandenen Werten.
