from pathlib import Path

lines = Path("apps/web/src/lib/supplements/stack-read.ts").read_text(
    encoding="utf-8",
    errors="replace",
).splitlines()

for i in range(1, min(len(lines), 460) + 1):
    if i <= 45 or 185 <= i <= 245 or 282 <= i <= 430:
        escaped = lines[i - 1].encode("unicode_escape").decode("ascii")
        print(f"{i}: {escaped}")
