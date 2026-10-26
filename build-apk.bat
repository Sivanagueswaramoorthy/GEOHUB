@echo off
setlocal enabledelayedexpansion

echo ==============================================
echo   Green Eco Organization - GeoHub APK Builder
echo ==============================================
echo.

:: 1. Build Frontend
echo [1/3] Building fresh frontend bundle...
cd /d "%~dp0frontend"
call npm run build
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Frontend build failed.
    pause
    exit /b %ERRORLEVEL%
)

:: 2. Sync Assets to Android
echo.
echo [2/3] Synchronizing assets to Android project...
cd /d "%~dp0"
powershell -NoProfile -Command "Remove-Item -Path 'android\app\src\main\assets\*' -Recurse -Force -ErrorAction SilentlyContinue; Copy-Item -Path 'frontend\dist\*' -Destination 'android\app\src\main\assets\' -Recurse -Force"

:: 3. Build APK with Gradle
echo.
echo [3/3] Compiling Android APK with Gradle...
cd /d "%~dp0android"
set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
set "PATH=%JAVA_HOME%\bin;%PATH%"

call gradlew.bat assembleRelease assembleDebug
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Gradle APK build failed.
    pause
    exit /b %ERRORLEVEL%
)

:: Copy output to root
cd /d "%~dp0"
copy /y "android\app\build\outputs\apk\release\app-release.apk" "geohub-app.apk" >nul
copy /y "android\app\build\outputs\apk\release\app-release.apk" "geohub-app-release.apk" >nul
copy /y "android\app\build\outputs\apk\debug\app-debug.apk" "geohub-app-debug.apk" >nul

echo.
echo ==============================================
echo   BUILD SUCCESSFUL!
echo   Output APKs:
echo   - geohub-app.apk (Release, ready to install)
echo   - geohub-app-debug.apk (Debug, with DevLogs)
echo ==============================================
echo.
pause
