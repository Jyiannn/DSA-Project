# Builds the frontend and copies dist + the PHP API into XAMPP.
$ErrorActionPreference = 'Stop'
$dest = 'C:\xampp\htdocs\DSA-Project'

npm run build
if ($LASTEXITCODE -ne 0) { throw 'Vite build failed.' }

if (Test-Path $dest) { Remove-Item "$dest\*" -Recurse -Force }
New-Item -ItemType Directory -Force $dest | Out-Null

Copy-Item dist\* $dest -Recurse -Force
Copy-Item api $dest -Recurse -Force
Copy-Item api\.htaccess "$dest\api\.htaccess" -Force

Write-Host "Deployed to $dest -> http://localhost/DSA-Project/"
