$body = Get-Content 'D:\GitHub\LumeOS-Claude-V1\tools\scripts\test-spark-a.json' -Raw
$r = Invoke-RestMethod -Method POST -Uri 'http://192.168.0.128:8001/v1/chat/completions' -ContentType 'application/json' -Body $body
$content = $r.choices[0].message.content
$tokens = $r.usage.completion_tokens
$ms = $r.usage.completion_tokens_details
Write-Host "=== Spark A Response ==="
Write-Host $content
Write-Host ""
Write-Host "Tokens: $tokens"
