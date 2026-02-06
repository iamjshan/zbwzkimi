# 标准物质管理助手 - APK 构建 Dockerfile

FROM openjdk:17-jdk-slim

# 安装必要的工具
RUN apt-get update && apt-get install -y \
    curl \
    unzip \
    git \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# 设置 Android SDK
ENV ANDROID_HOME=/opt/android-sdk
ENV PATH=${PATH}:${ANDROID_HOME}/cmdline-tools/latest/bin:${ANDROID_HOME}/platform-tools:${ANDROID_HOME}/build-tools/33.0.0

# 下载并安装 Android SDK
RUN mkdir -p ${ANDROID_HOME} && \
    cd ${ANDROID_HOME} && \
    curl -o cmdline-tools.zip https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip && \
    unzip cmdline-tools.zip && \
    mkdir -p cmdline-tools/latest && \
    mv cmdline-tools/bin cmdline-tools/lib cmdline-tools/latest/ && \
    rm cmdline-tools.zip

# 接受许可证并安装必要的组件
RUN yes | sdkmanager --licenses && \
    sdkmanager "platforms;android-33" "build-tools;33.0.0" "platform-tools"

# 设置工作目录
WORKDIR /app

# 复制项目文件
COPY package*.json ./
COPY . .

# 安装依赖
RUN npm ci

# 构建 Web 应用
RUN npm run build

# 同步 Capacitor
RUN npx cap sync android

# 构建 APK
RUN cd android && ./gradlew assembleDebug

# 输出 APK
RUN mkdir -p /app/apk-output && \
    cp /app/android/app/build/outputs/apk/debug/app-debug.apk /app/apk-output/

# 设置输出卷
VOLUME ["/app/apk-output"]

CMD ["cp", "/app/android/app/build/outputs/apk/debug/app-debug.apk", "/app/apk-output/"]
