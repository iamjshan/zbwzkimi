#!/bin/bash

# 标准物质管理助手 - APK 构建脚本
# 使用方法: ./build-apk.sh

set -e

echo "=========================================="
echo "  标准物质管理助手 - APK 构建脚本"
echo "=========================================="
echo ""

# 检查必要的工具
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo "❌ 错误: 未找到 $1，请安装后再试"
        exit 1
    fi
    echo "✅ $1 已安装"
}

echo "🔍 检查环境..."
check_command node
check_command npm
check_command java

# 检查 Node.js 版本
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ 错误: Node.js 版本需要 18 或更高"
    exit 1
fi
echo "✅ Node.js 版本: $(node -v)"

# 检查 Java 版本
JAVA_VERSION=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2 | cut -d'.' -f1)
if [ "$JAVA_VERSION" -lt 17 ]; then
    echo "❌ 错误: Java 版本需要 17 或更高"
    exit 1
fi
echo "✅ Java 版本: $(java -version 2>&1 | head -n 1)"

echo ""
echo "📦 安装依赖..."
npm ci

echo ""
echo "🔨 构建 Web 应用..."
npm run build

echo ""
echo "📱 同步 Capacitor..."
npx cap sync android

echo ""
echo "🔧 检查 Android SDK..."
if [ -z "$ANDROID_HOME" ]; then
    echo "⚠️ 警告: ANDROID_HOME 未设置"
    echo "请设置 ANDROID_HOME 环境变量指向 Android SDK 目录"
    echo "例如: export ANDROID_HOME=/Users/username/Library/Android/sdk"
fi

echo ""
echo "🔨 构建 Debug APK..."
cd android

# 检查 gradlew 是否存在
if [ ! -f "./gradlew" ]; then
    echo "❌ 错误: 未找到 gradlew"
    exit 1
fi

# 使 gradlew 可执行
chmod +x gradlew

# 构建 APK
./gradlew assembleDebug

echo ""
echo "=========================================="
echo "  ✅ 构建成功!"
echo "=========================================="
echo ""
echo "📱 APK 文件位置:"
echo "   Debug: $(pwd)/app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "🚀 安装到设备:"
echo "   adb install $(pwd)/app/build/outputs/apk/debug/app-debug.apk"
echo ""
