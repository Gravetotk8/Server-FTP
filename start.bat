@echo off
cd %USERPROFILE%\Desktop\Server-FTP

start cmd /k node ftpserver.js
timeout /t 5
start cmd /k ngrok http 1515
timeout /t 5
start python capture_ngrok.py
::timeout /t 10
::start cmd /k node capture_ngrok.js
