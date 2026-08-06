# คัมภีร์พูดได้ — พระไตรปิฎก AI Launcher (PowerShell)
Set-Location -Path $PSScriptRoot

# Check and set PATH for Node.js if missing
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    if (Test-Path "C:\Program Files\nodejs\node.exe") {
        $env:PATH += ";C:\Program Files\nodejs"
    } elseif (Test-Path "$env:LOCALAPPDATA\Programs\node\node.exe") {
        $env:PATH += ";$env:LOCALAPPDATA\Programs\node"
    }
}

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] ไม่พบ Node.js ในระบบ! กรุณาติดตั้ง Node.js จาก https://nodejs.org/" -ForegroundColor Red
    Read-Host "กด Enter เพื่อปิด..."
    exit
}

Write-Host "`n  📜 คัมภีร์พูดได้ — พระไตรปิฎก AI" -ForegroundColor Yellow
Write-Host "  ================================" -ForegroundColor Yellow
Write-Host "  กำลังเริ่มต้นเซิร์ฟเวอร์ (http://localhost:8080)...`n" -ForegroundColor Green

# Open browser after 2 seconds
Start-Job -ScriptBlock { Start-Sleep -Seconds 2; Start-Process "http://localhost:8080" } | Out-Null

# Run Node server
node server.js
