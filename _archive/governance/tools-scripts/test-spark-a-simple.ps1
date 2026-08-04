$body = Get-Content 'D:\GitHub\LumeOS-Claude-V1\tools\scripts\test-spark-a-simple.json' -Raw
$r = Invoke-RestMethod -Method POST -Uri 'http://192.168.0.128:8001/v1/chat/completions' -ContentType 'application/json' -Body $body
Write-Host "Spark A OK"
Write-Host $r.choices[0].message.content
Write-Host "prompt_tokens:" $r.usage.prompt_tokens
Write-Host "completion_tokens:" $r.usage.completion_tokens
