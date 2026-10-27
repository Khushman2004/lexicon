Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  VALIDATING LEXICON DATA ACCESS SECURITY GATES" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

$baseUrl = "http://localhost:5000"

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Path,
        [string]$Method = "GET",
        [string]$Token = $null,
        [int]$ExpectedStatus
    )

    $headers = @{}
    if ($Token) {
        $headers["Authorization"] = "Bearer $Token"
    }

    $status = 0
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl$Path" -Method $Method -Headers $headers -UseBasicParsing
        $status = [int]$response.StatusCode
    } catch [System.Net.WebException] {
        if ($_.Exception.Response) {
            $status = [int]$_.Exception.Response.StatusCode
        } else {
            Write-Host "Error: $($_.Exception.Message)"
        }
    } catch {
        Write-Host "Generic Error: $($_.Exception.Message)"
    }

    $pass = ($status -eq $ExpectedStatus)
    $color = if ($pass) { "Green" } else { "Red" }
    $result = if ($pass) { "PASS" } else { "FAIL" }

    Write-Host "[$result] $Name - Expected: $ExpectedStatus | Actual: $status" -ForegroundColor $color
    return $pass
}

Write-Host "`n--- 1. UNAUTHENTICATED ACCESS ATTEMPTS (MUST RETURN 401) ---" -ForegroundColor Yellow

$allPassed = $true
$allPassed = (Test-Endpoint -Name "Personal Words" -Path "/api/library/words" -ExpectedStatus 401) -and $allPassed
$allPassed = (Test-Endpoint -Name "Personal Phrases" -Path "/api/library/phrases" -ExpectedStatus 401) -and $allPassed
$allPassed = (Test-Endpoint -Name "Personal Library Summary" -Path "/api/library/summary" -ExpectedStatus 401) -and $allPassed
$allPassed = (Test-Endpoint -Name "Network Community Users" -Path "/api/auth/users" -ExpectedStatus 401) -and $allPassed
$allPassed = (Test-Endpoint -Name "Network User Profile" -Path "/api/auth/users/22222222-2222-2222-2222-222222222222" -ExpectedStatus 401) -and $allPassed

Write-Host "`n--- 2. AUTHENTICATION & TOKEN ACQUISITION ---" -ForegroundColor Yellow

$loginBody = @{
    usernameOrEmail = "demo"
    password = "Password123!"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
if ($loginResponse.success -and $loginResponse.data.token) {
    Write-Host "[PASS] Login succeeded! JWT token acquired." -ForegroundColor Green
    $token = $loginResponse.data.token
} else {
    Write-Host "[FAIL] Login failed! Unable to acquire token." -ForegroundColor Red
    exit 1
}

Write-Host "`n--- 3. AUTHENTICATED ACCESS ATTEMPTS (MUST RETURN 200) ---" -ForegroundColor Yellow

$allPassed = (Test-Endpoint -Name "Personal Words (with token)" -Path "/api/library/words" -Token $token -ExpectedStatus 200) -and $allPassed
$allPassed = (Test-Endpoint -Name "Personal Phrases (with token)" -Path "/api/library/phrases" -Token $token -ExpectedStatus 200) -and $allPassed
$allPassed = (Test-Endpoint -Name "Personal Summary (with token)" -Path "/api/library/summary" -Token $token -ExpectedStatus 200) -and $allPassed
$allPassed = (Test-Endpoint -Name "Network Community Users (with token)" -Path "/api/auth/users" -Token $token -ExpectedStatus 200) -and $allPassed

Write-Host "`n============================================================" -ForegroundColor Cyan
if ($allPassed) {
    Write-Host "  ALL SECURITY CHECKS PASSED: ZERO DATA LEAKS ANONYMOUSLY" -ForegroundColor Green
} else {
    Write-Host "  SOME SECURITY CHECKS FAILED! REVIEW RESULTS ABOVE" -ForegroundColor Red
}
Write-Host "============================================================" -ForegroundColor Cyan
