# One-command setup: ensure Apache + MySQL, align the DB schema, build the frontend,
# and serve it from this folder at http://localhost/DSA-Project/
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
$mysql = 'C:\xampp\mysql\bin\mysql.exe'

function Wait-Port([int] $port) {
    for ($i = 0; $i -lt 40; $i++) {
        if (Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue) { return }
        Start-Sleep -Milliseconds 500
    }
    throw "Port $port never opened. Start XAMPP manually."
}

if (-not (Get-NetTCPConnection -LocalPort 3306 -State Listen -ErrorAction SilentlyContinue)) {
    Start-Process 'C:\xampp\mysql\bin\mysqld.exe' -ArgumentList '--defaults-file=C:\xampp\mysql\bin\my.ini','--standalone' -WindowStyle Hidden
}
if (-not (Get-NetTCPConnection -LocalPort 80 -State Listen -ErrorAction SilentlyContinue)) {
    Start-Process 'C:\xampp\apache\bin\httpd.exe' -ArgumentList '-d','C:/xampp/apache' -WindowStyle Hidden
}
Wait-Port 3306
Wait-Port 80

# Only re-import when the DB is missing or still on the old schema (it wipes parking data).
$aligned = & $mysql -u root -N -e "SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='parkganern_parking' AND TABLE_NAME='parking_spaces' AND COLUMN_NAME='zone'" 2>$null
if ($aligned -ne '1') {
    Write-Host 'Importing api\schema.sql (this resets parking data)...'
    $import = Start-Process -FilePath $mysql -ArgumentList '-u','root' -RedirectStandardInput "$PSScriptRoot\api\schema.sql" -Wait -PassThru -NoNewWindow
    if ($import.ExitCode -ne 0) { throw 'Schema import failed.' }
}

if (-not (Test-Path node_modules)) { npm ci }
# postbuild installs the production shell and assets into this Apache doc root.
npm run build
if ($LASTEXITCODE -ne 0) { throw 'Vite build failed.' }

Write-Host 'Ready -> http://localhost/DSA-Project/  (demo / password123)'
