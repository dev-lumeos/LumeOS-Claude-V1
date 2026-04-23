cd D:\GitHub\LumeOS-Claude-V1
$dirs = Get-ChildItem -Directory
foreach ($d in $dirs) {
  $count = (Get-ChildItem $d.FullName -Recurse -File).Count
  Write-Host "$count`t$($d.Name)"
}
