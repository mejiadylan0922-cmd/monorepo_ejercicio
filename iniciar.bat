@echo off
echo abriendo proyecto en VS Code...
cd /d "%~dp0"
code.
exit
rem si vs no esta en la variable de entorno PATH, hay que colocar la ruta completa para que se ejecute.
