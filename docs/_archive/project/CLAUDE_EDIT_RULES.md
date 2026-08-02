# Claude Edit Rules — Markdown Files

Stand: 29. April 2026
**Pflichtlektüre für jede neue Claude-Session.**

---

## Problem

In LUMEOS-Sessions hat es mehrfach Tabellen-Schäden in Markdown-Files gegeben:
Pipes verschwunden, mehrere Tabellen-Zeilen in eine Zeile zusammengezogen, URLs
in `<...>` Brackets, Zeichen wie `>` HTML-encoded.

**Ursache:** Claude's eigenes Edit-Tooling (`edit_block`, `str_replace`).
Keine externen Tools (IDE Auto-Format, Prettier, etc) sind involviert — das wurde
verifiziert.

---

## Pathologie

Die String-Replace-Semantik von `edit_block` und `str_replace` ist bei Markdown
brüchig weil:

1. **Pipes (`|`) sind aktive Syntax** aber sehen oft wie Inline-Zeichen aus
2. **Tabellen-Whitespace variiert** (`|---|` vs `| --- |` vs Tabs vs Spaces)
3. **Wenn `old_string` durch Whitespace-Drift nicht 1:1 matcht**, fällt das Tool
   in best-effort Modus → Pipes/Newlines können verloren gehen
4. **Bei Multi-Line Tabellen** kann der Matcher Zeilengrenzen falsch raten

Dieselben Tools sind auf TypeScript/JSON/YAML stabil — dort ist Whitespace
deterministisch.

---

## Regeln (gelten ab jetzt für ALLE Markdown-Edits)

### Regel 1 — Markdown nur via `write_file` (komplette Überschreibung)

```
NICHT: desktop-commander:edit_block auf .md
NICHT: str_replace auf .md
JA:    desktop-commander:write_file mit kompletten neuen Content
```

Begründung: `write_file` schreibt **exakt** den Content den Claude liefert. Keine
Interpretation, kein String-Matching, kein Whitespace-Guessing.

### Regel 2 — read-modify-write Workflow

Wenn nur ein Teil einer .md Datei geändert werden soll:

```
1. desktop-commander:read_file (kompletter Content)
2. Claude bereitet die kombinierte neue Version in der Antwort vor
3. desktop-commander:write_file (kompletter neuer Content)
```

NICHT: `edit_block` mit `old_string`/`new_string`.

### Regel 3 — Verifikation nach jedem Markdown-Write

```
1. git diff <file>
2. Prüfen: nur die gewollten Zeilen geändert?
3. Wenn unbeabsichtigte Änderungen sichtbar → git checkout + retry
```

### Regel 4 — Große Markdown-Files

Wenn die Datei zu groß für eine einzelne `write_file` ist (>~500 Zeilen):

```
1. read_file mit offset/length um die zu ändernde Sektion isoliert zu sehen
2. write_file mit mode=rewrite für ersten Chunk
3. write_file mit mode=append für weitere Chunks
```

NICHT: try-and-error mit `edit_block` auf großen Tabellen.

### Regel 5 — Andere Format-Typen sind OK

Für TypeScript, JSON, YAML, Python: `edit_block` und `str_replace` können
weiter normal genutzt werden. Whitespace ist dort deterministisch.

```
.ts  → edit_block ok
.json → edit_block ok
.yaml → edit_block ok (mit Vorsicht bei Indent-Sensitivität)
.py  → edit_block ok
.md  → NUR write_file
```

---

## Bekannte fehlerhafte Files (in der Vergangenheit beschädigt)

Diese liegen aktuell im Repo möglicherweise mit Schäden vor (frühere Claude-
Sessions):

- `docs/project/STACK_REFERENCE.md`
- `docs/reports/benchmark_spark_a_20260423.md`
- `docs/reports/benchmark_spark_b_20260423.md`
- `infra/vllm/spark-a/setup.md`
- `infra/vllm/spark-b/setup.md`

Wenn diese im Block 4 (Doku-Sweep) angefasst werden: **komplett neu schreiben**
via `write_file`, NICHT mit `edit_block` partial-fixen.

---

## Was Claude bei Verstoß gegen diese Regeln tun sollte

Wenn Claude in einer Session merkt dass `edit_block` auf einer .md Datei
verwendet werden soll:

1. **STOP**
2. Hinweis an den User: „Markdown-Edit über `edit_block` ist riskant — ich
   nutze stattdessen `write_file`."
3. Zur write_file-Variante wechseln

Wenn der User explizit `edit_block` auf .md verlangt: warnen, dann ausführen,
dann verifizieren mit `git diff`.

---

## Diese Datei ist Pflichtlektüre

Bei Start jeder neuen LUMEOS-Session:

```bash
cat docs/project/CLAUDE_EDIT_RULES.md
```

oder als erster Schritt im SESSION_ONBOARDING den Link anschauen.
