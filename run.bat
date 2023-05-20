@echo off
color 07

:main
cls
if exist ndls.exe del ndls.exe
g++ Main.cpp -o ndls.exe
if exist ndls.exe ndls.exe
pause
goto:main