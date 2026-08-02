---
status:     entwurf
version:    0.1
stand:      JJJJ-MM-TT
ankerhash:  <commit>
quellen:    docs/specs/<...>
abhaengig:  10-plattform/auth-sso
---

# App: <Name>

**Domain:** <name>.lumeos.app · **Zielgruppe:** <wer>

## 1. Zweck und Abgrenzung

Wofür diese App existiert und warum sie eine eigene App ist
statt ein Modul in einer bestehenden.

## 2. Module

| Modul | Typ | Aktivierung |
|---|---|---|
| | core / addon | immer / bei <Bedingung> |

## 3. Rollen und Rechte

Je Rolle: wer sie hat, was sie darf, welche Daten sie sieht.
Verweis auf `10-plattform/auth-sso` für Session und Handoff.

## 4. Navigation

Struktur der Hauptnavigation. Welche Module wo erscheinen,
was bei fehlender Berechtigung passiert.

## 5. Grenzen zu anderen Apps

Was diese App **nicht** tut. Welche Übergaben es gibt (Deep Links,
Auth-Handoff) und in welche Richtung.

## 6. Abnahmekriterien

- **AK-1:** Gegeben <Zustand>, wenn <Aktion>, dann <Ergebnis>.

## 7. Offene Fragen
