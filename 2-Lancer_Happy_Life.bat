@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
title Happy Life
echo ============================================
echo   Happy Life - Demarrage (aucune connexion
echo   internet necessaire)
echo ============================================
echo.

if not exist "node_modules" (
  echo [ERREUR] L'application n'est pas encore installee.
  echo Merci de double-cliquer d'abord sur "1-Installer.bat".
  echo.
  pause
  exit /b 1
)

if not exist ".next" (
  echo [ERREUR] L'application n'a pas encore ete preparee.
  echo Merci de double-cliquer d'abord sur "1-Installer.bat".
  echo.
  pause
  exit /b 1
)

echo Sur CET ordinateur, l'application s'ouvrira automatiquement sur :
echo   http://localhost:3000
echo.
echo Sur votre TELEPHONE (connecte au MEME Wi-Fi que ce PC), ouvrez le
echo navigateur et allez a l'une de ces adresses :
echo.
set FOUND=0
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
  set "IP=%%a"
  set "IP=!IP: =!"
  if not "!IP:~0,7!"=="169.254" (
    echo   http://!IP!:3000
    set FOUND=1
  )
)
if "!FOUND!"=="0" (
  echo   ^(Aucune adresse reseau locale detectee - verifiez votre Wi-Fi^)
)
echo.
echo Astuce : une fois la page ouverte sur votre telephone, vous pouvez
echo l'ajouter a votre ecran d'accueil pour l'ouvrir comme une vraie
echo application ^(voir LISEZ-MOI-DABORD.txt^).
echo.
echo Si Windows affiche une alerte "Pare-feu Windows Defender", cliquez
echo sur "Autoriser l'acces" pour que votre telephone puisse se connecter.
echo ============================================
echo.
echo Demarrage du serveur local...
start "" cmd /c "timeout /t 3 >nul && start http://localhost:3000"

call npm run start

pause
