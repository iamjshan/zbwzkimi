@echo off
chcp 65001 >nul

REM 标准物质管理助手 - APK 构建脚本 (Windows)
REM 使用方法: 双击运行或在命令行中执行 build-apk.bat

echo ==========================================
echo   标准物质管理助手 - APK 构建脚本
echo ==========================================
echo.

REM 检查 Node.js
node -v >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 未找到 Node.js，请安装后再试
    pause
    exit /b 1
)
echo ✅ Node.js 已安装

REM 检查 Java
java -version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 未找到 Java，请安装后再试
    pause
    exit /b 1
)
echo ✅ Java 已安装

echo.
echo 📦 安装依赖...
call npm ci
if errorlevel 1 (
    echo ❌ 依赖安装失败
    pause
    exit /b 1
)

echo.
echo 🔨 构建 Web 应用...
call npm run build
if errorlevel 1 (
    echo ❌ Web 构建失败
    pause
    exit /b 1
)

echo.
echo 📱 同步 Capacitor...
call npx cap sync android
if errorlevel 1 (
    echo ❌ Capacitor 同步失败
    pause
    exit /b 1
)

echo.
echo 🔧 检查 Android SDK...
if "%ANDROID_HOME%"=="" (
    echo ⚠️ 警告: ANDROID_HOME 未设置
    echo 请设置 ANDROID_HOME 环境变量指向 Android SDK 目录
)

echo.
echo 🔨 构建 Debug APK...
cd android

if not exist "gradlew" (
    echo ❌ 错误: 未找到 gradlew
    pause
    exit /b 1
)

call gradlew.bat assembleDebug
if errorlevel 1 (
    echo ❌ APK 构建失败
    pause
    exit /b 1
)

echo.
echo ==========================================
echo   ✅ 构建成功!
echo ==========================================
echo.
echo 📱 APK 文件位置:
echo    Debug: %CD%\app\build\outputs\apk\debug\app-debug.apk
echo.
pause
