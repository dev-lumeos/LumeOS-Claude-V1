---
status:     entwurf
version:    0.1
stand:      JJJJ-MM-TT
ankerhash:  <commit>
quellen:    docs/specs/<Modul>/<Datei>.md
abhaengig:  10-plattform/auth-sso, 10-plattform/datenzugriff
---

# Modul: <Name>

**App(s):** web · **Typ:** core | addon
**Aktivierung:** immer | bei <Bedingung>

## 1. Zweck

Wofür ist dieses Modul da, für wen, und was passiert ohne es.
Zwei bis drei Sätze. Keine Feature-Aufzählung.

## 2. Abgrenzung

Was gehört **nicht** hierher und wo liegt es stattdessen.

## 3. Entitäten

Je Entität: Name, Zweck, ob gespeichert oder abgeleitet.
Abgeleitete Objekte werden als solche gekennzeichnet — auch wenn sie
gespeichert werden.

## 4. Datenmodell

Anwendbares SQL. Schema, Tabellen, Constraints, Indizes.
RLS-Policies vollständig, nach dem Muster aus `10-plattform/datenzugriff`.
Muss gegen eine leere Datenbank laufen.

## 5. API

Je Endpunkt: Methode, Pfad, Eingabe, Ausgabe, Fehlerfälle, benötigte Rolle.
Typen ausgeschrieben.

## 6. Zustände und Übergänge

Nur wenn das Modul Zustände kennt. Sonst: „keine".

## 7. UI

Routen, Ansichten, Zustände (leer, ladend, Fehler, gefüllt).
Verweis auf `10-plattform/design-system`, keine eigenen Tokens.

## 8. Abnahmekriterien

Nummeriert, jedes einzeln prüfbar:

- **AK-1:** Gegeben <Zustand>, wenn <Aktion>, dann <beobachtbares Ergebnis>.
- **AK-2:** …

Jedes Kriterium muss ohne Interpretation entscheidbar sein.

## 9. Offene Fragen

Was noch entschieden werden muss, mit Verweis auf `90-entscheidungen/`.
Solange hier etwas steht, ist der Status nicht `freigegeben`.
