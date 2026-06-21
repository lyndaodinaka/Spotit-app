$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$androidDir = Join-Path $root "android"
$javaHome = "C:\Program Files\Android\Android Studio\jbr"
$keyStore = Join-Path $root "spotit-upload-key.jks"
$keyProperties = Join-Path $androidDir "key.properties"
$passwordNote = Join-Path $root "SPOTIT_UPLOAD_KEY_PASSWORD_DO_NOT_SHARE.txt"

Write-Host ""
Write-Host "Spotit Google Play Android App Bundle Builder" -ForegroundColor Cyan
Write-Host "This will create the signed .aab file needed for Google Play." -ForegroundColor Cyan
Write-Host ""

if (!(Test-Path $androidDir)) {
  throw "Android project folder was not found: $androidDir"
}

if (!(Test-Path (Join-Path $javaHome "bin\java.exe"))) {
  throw "Android Studio Java was not found. Open Android Studio once and complete setup, then run this again."
}

$env:JAVA_HOME = $javaHome
$env:Path = "$javaHome\bin;$env:Path"

if (!(Test-Path $keyStore)) {
  Write-Host "Create a private upload key for Spotit." -ForegroundColor Yellow
  Write-Host "Choose a password you will keep safely. You will need it for future app updates." -ForegroundColor Yellow
  $securePassword = Read-Host "Enter new Spotit upload key password" -AsSecureString
  $plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword))

  if ([string]::IsNullOrWhiteSpace($plainPassword) -or $plainPassword.Length -lt 8) {
    throw "Password must be at least 8 characters."
  }

  & (Join-Path $javaHome "bin\keytool.exe") `
    -genkeypair `
    -v `
    -keystore $keyStore `
    -storepass $plainPassword `
    -keypass $plainPassword `
    -alias "spotit" `
    -keyalg RSA `
    -keysize 2048 `
    -validity 9125 `
    -dname "CN=Lynda Chidi, OU=Spotit, O=Medholic, L=London, ST=London, C=GB" `
    -noprompt

  @"
Spotit Android upload key password
Keep this private. Do not share publicly or commit to GitHub.

Key file:
$keyStore

Alias:
spotit

Password:
$plainPassword
"@ | Set-Content -Path $passwordNote -Encoding UTF8
} else {
  Write-Host "Existing Spotit upload key found." -ForegroundColor Green
  $securePassword = Read-Host "Enter existing Spotit upload key password" -AsSecureString
  $plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword))
}

@"
storeFile=../spotit-upload-key.jks
storePassword=$plainPassword
keyAlias=spotit
keyPassword=$plainPassword
"@ | Set-Content -Path $keyProperties -Encoding UTF8

Write-Host ""
Write-Host "Building Spotit release bundle. This can take several minutes the first time." -ForegroundColor Cyan
Set-Location $androidDir
.\gradlew.bat bundleRelease

$bundlePath = Join-Path $androidDir "app\build\outputs\bundle\release\app-release.aab"
Write-Host ""
if (Test-Path $bundlePath) {
  Write-Host "SUCCESS: Google Play bundle created:" -ForegroundColor Green
  Write-Host $bundlePath -ForegroundColor Green
} else {
  Write-Host "Build finished, but the bundle was not found at the expected path:" -ForegroundColor Yellow
  Write-Host $bundlePath -ForegroundColor Yellow
}

Write-Host ""
Read-Host "Press Enter to close"
