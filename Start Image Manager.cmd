@echo off
cd /d "%~dp0"
node scripts/build.mjs
if errorlevel 1 (
 pause
 exit /b
)
start "" http://127.0.0.1:4176/admin/
node scripts/image-admin.mjs
pause
