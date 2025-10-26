(Get-Content renderers/quote.js -Raw) | % {  -replace '\r','\\r' -replace '\n','\\n' } | Write-Output
