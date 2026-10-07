@echo off
title Vetrina Merch - Aggiorna foto
echo.
echo  Abbino le foto della cartella "foto" ai campioni del listino...
echo.
"C:\Users\valer\AppData\Local\Programs\Python\Python312\python.exe" "%~dp0build_data.py"
echo.
echo  Fatto. Ricarica la vetrina nel browser (F5).
echo.
pause
