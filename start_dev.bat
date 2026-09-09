@echo off
:: Forwarding launcher alias for start.bat
call "%~dp0start.bat" %*
exit /b %ERRORLEVEL%
