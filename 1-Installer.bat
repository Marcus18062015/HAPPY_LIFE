@echo off
chcp 65001 >nul
title Happy Life - Installation
echo ============================================
echo   Happy Life - Installation (a faire une seule fois)
echo ============================================
echo.
echo Cette etape a besoin d'une connexion internet UNE SEULE FOIS,
echo pour telecharger les composants necessaires. Ensuite,
echo l'application fonctionnera entierement hors ligne sur cet
echo ordinateur.
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [ERREUR] Node.js n'est pas installe sur cet ordinateur.
  echo.
  echo Merci d'installer Node.js version 22 ou plus recente depuis :
  echo   https://nodejs.org
  echo Puis relancez ce fichier.
  echo.
  pause
  exit /b 1
)

echo Verification de Node.js : OK
node --version
echo.

echo Etape 1/3 : telechargement des composants (npm install)...
call npm install
if errorlevel 1 goto erreur

echo.
echo Etape 2/3 : creation de la base de donnees de demonstration...
call npm run seed
if errorlevel 1 goto erreur

echo.
echo Etape 3/3 : preparation de l'application (npm run build)...
call npm run build
if errorlevel 1 goto erreur

echo.
echo ============================================
echo   Installation terminee avec succes !
echo   Vous pouvez maintenant double-cliquer sur
echo   "2-Lancer_Happy_Life.bat" pour demarrer
echo   l'application, sans connexion internet.
echo ============================================
echo.
pause
exit /b 0

:erreur
echo.
echo [ERREUR] Une etape a echoue. Verifiez le message ci-dessus.
pause
exit /b 1
