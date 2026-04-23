$body = Get-Content 'D:\GitHub\LumeOS-Claude-V1\tools\scripts\test-vllm.json' -Raw
$r = Invoke-RestMethod -Method POST -Uri 'http://192.168.0.128:8000/v1/chat/completions' -ContentType 'application/json' -Body $body
Write-Host "DGX Response:" $r.choices[0].message.content
