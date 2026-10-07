@echo off
title Vetrina Merch
echo.
echo  ==============================
echo   Vetrina Merch - Emilgroup
echo  ==============================
echo.
echo  Avvio server locale (salva tutto su disco nella cartella "dati")...

REM Se la porta e' gia' in uso la libera
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":3460 "') do (
    taskkill /F /PID %%a >nul 2>&1
)

start "Server Vetrina" /MIN "C:\Users\valer\AppData\Local\Programs\Python\Python312\python.exe" "%~dp0server.py"

timeout /t 2 /nobreak >nul

echo  Apertura browser...
start "" "http://localhost:3460"

echo.
echo  Vetrina aperta su: http://localhost:3460
echo.
echo  Ogni modifica si salva da sola nella cartella "dati" (con le versioni
echo  precedenti in "dati\backup"). In alto nella vetrina vedi "Salvato".
echo  Non chiudere la finestra "Server Vetrina" finche' usi la vetrina.
echo.
pause
