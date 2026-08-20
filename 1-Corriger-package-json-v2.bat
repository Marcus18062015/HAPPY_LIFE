@echo off
set LOG=%~dp0resultat-diagnostic.txt
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0corriger-package-json-v2.ps1" > "%LOG%" 2>&1
type "%LOG%"
echo.
echo ======================================================
echo Le texte ci-dessus a aussi ete enregistre dans le fichier :
echo %LOG%
echo Envoyez-moi ce fichier, ou copiez tout ce texte ici.
echo ======================================================
pause
