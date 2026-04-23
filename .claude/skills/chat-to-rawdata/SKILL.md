---
name: chat-to-rawdata
description: Converts raw conversation/brainstorm into structured raw data. Use when starting from unstructured input, notes, or ideas that need to be organized before spec creation.
---

# Skill: chat-to-rawdata

## Aufgabe

Nimm unstrukturierten Input (Chat, Brainstorm, Notizen) und erzeuge strukturierte Raw Data.

## Output Format

```yaml
rawdata_version: v1
session_date: {date}
input_type: chat|brainstorm|notes
raw_items:
  - id: item_001
    content: string
    type: requirement|constraint|decision|question|idea
    module: string
    priority: high|medium|low
open_questions:
  - string
decisions_made:
  - string
next_step: rawdata-to-spec
```

## Regeln

- Nichts erfinden — nur was gesagt wurde
- Widersprüche als open_question markieren
- Jede Aussage einem module zuordnen
- Bei Unklarheit: type: question

## Wann nutzen

- Nach einem Planning-Chat
- Nach Brainstorming-Session
- Wenn Ideen gesammelt aber noch nicht strukturiert
