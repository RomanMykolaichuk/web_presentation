$p='app.js'
$lines = [System.Collections.Generic.List[string]](Get-Content $p)
# Fix label line using single-quoted PS string
$lblIdx = ($lines | Select-String -SimpleMatch 'lbl.innerHTML =').LineNumber
if($lblIdx){
  $i = $lblIdx[0]-1
  if($i -ge 0 -and $i+1 -lt $lines.Count){
    $lines[$i+1] = '        ''<input id="toggle-slide-numbers" type="checkbox"> Номери слайдів'';'
  }
}
# Fix prompt line
$prIdx = ($lines | Select-String -SimpleMatch 'const val = prompt(').LineNumber
if($prIdx){
  $j = $prIdx[0]-1
  if($j -ge 0 -and $j+1 -lt $lines.Count){
    $lines[$j+1] = '      "Вкажіть URL/шлях до папки assets (можна відносний або абсолютний)",'
  }
}
Set-Content -Path $p -Value $lines -Encoding UTF8
