$baseUrl = "http://localhost:5000"

$loginBody = @{
    usernameOrEmail = "demo"
    password = "Password123!"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
$token = $loginResponse.data.token
$headers = @{ Authorization = "Bearer $token" }

$past7 = (Get-Date).ToUniversalTime().AddDays(-7).ToString("yyyy-MM-ddTHH:mm:ssZ")
Write-Host "Querying items with fromDate >= $past7" -ForegroundColor Cyan

$wordsResult = Invoke-RestMethod -Uri "$baseUrl/api/library/words?fromDate=$past7" -Headers $headers
$phrasesResult = Invoke-RestMethod -Uri "$baseUrl/api/library/phrases?fromDate=$past7" -Headers $headers

Write-Host "`nWords Added This Week ($($wordsResult.data.items.Count)):" -ForegroundColor Yellow
foreach ($w in $wordsResult.data.items) {
    Write-Host "  * [WORD] $($w.term) - $($w.definition)" -ForegroundColor White
}

Write-Host "`nPhrases Added This Week ($($phrasesResult.data.items.Count)):" -ForegroundColor Yellow
foreach ($p in $phrasesResult.data.items) {
    Write-Host "  * [PHRASE] $($p.phraseText) - $($p.meaning)" -ForegroundColor White
}

$summaryResult = Invoke-RestMethod -Uri "$baseUrl/api/library/summary" -Headers $headers
Write-Host "`nSummary Stat Card Count: +$($summaryResult.data.wordsAddedThisWeek + $summaryResult.data.phrasesAddedThisWeek) ($($summaryResult.data.wordsAddedThisWeek) words + $($summaryResult.data.phrasesAddedThisWeek) phrases)" -ForegroundColor Green
