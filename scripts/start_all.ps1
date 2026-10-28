Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  STARTING LEXICON MICROSERVICES & FRONTEND" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$root = (Get-Item $PSScriptRoot).Parent.FullName

# 1. Start Lexicon.Auth (:5001)
Write-Host "[1/4] Starting Lexicon.Auth Service on http://localhost:5001..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend\src\Lexicon.Auth'; Write-Host '--- LEXICON.AUTH SERVICE (Port 5001) ---' -ForegroundColor Magenta; dotnet run"

Start-Sleep -Seconds 2

# 2. Start Lexicon.Library (:5002)
Write-Host "[2/5] Starting Lexicon.Library Service on http://localhost:5002..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend\src\Lexicon.Library'; Write-Host '--- LEXICON.LIBRARY SERVICE (Port 5002) ---' -ForegroundColor Green; dotnet run"

Start-Sleep -Seconds 2

# 3. Start Lexicon.Ai (:5003)
Write-Host "[3/5] Starting Lexicon.Ai Service on http://localhost:5003..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend\src\Lexicon.Ai'; Write-Host '--- LEXICON.AI MEMORY PRACTICE SERVICE (Port 5003) ---' -ForegroundColor DarkYellow; dotnet run"

Start-Sleep -Seconds 2

# 4. Start Lexicon.Gateway (:5000)
Write-Host "[4/5] Starting Lexicon.Gateway (YARP) on http://localhost:5000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend\src\Lexicon.Gateway'; Write-Host '--- LEXICON.GATEWAY REVERSE PROXY (Port 5000) ---' -ForegroundColor Cyan; dotnet run"

Start-Sleep -Seconds 2

# 5. Start React Frontend (:5173)
Write-Host "[5/5] Starting Frontend on http://localhost:5173..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\frontend'; Write-Host '--- LEXICON REACT FRONTEND (Port 5173) ---' -ForegroundColor Blue; npm run dev"

Write-Host "`nAll 5 processes launched in independent terminal windows!" -ForegroundColor Green
Write-Host "Gateway:  http://localhost:5000" -ForegroundColor White
Write-Host "Auth:     http://localhost:5001" -ForegroundColor White
Write-Host "Library:  http://localhost:5002" -ForegroundColor White
Write-Host "AI Lab:   http://localhost:5003" -ForegroundColor White
Write-Host "Frontend: http://localhost:5173" -ForegroundColor White
