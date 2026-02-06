# APK 构建指南

## 标准物质管理助手 - Android APK 构建

### 方法一：使用 GitHub Actions（推荐）

1. **Fork 或上传代码到 GitHub 仓库**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/material-manager.git
   git push -u origin main
   ```

2. **触发构建**
   - 推送代码到 `main` 或 `master` 分支会自动触发构建
   - 或手动触发：进入 GitHub 仓库 -> Actions -> Build APK -> Run workflow

3. **下载 APK**
   - 构建完成后，进入 Actions 页面
   - 点击最新的 workflow 运行记录
   - 在 Artifacts 部分下载 `app-debug-apk` 或 `app-release-apk`

### 方法二：本地构建

#### 环境要求
- Node.js 18+
- Java JDK 17
- Android SDK
- Gradle 8.x

#### 步骤

1. **安装依赖**
   ```bash
   npm install
   ```

2. **构建 Web 应用**
   ```bash
   npm run build
   ```

3. **同步 Capacitor**
   ```bash
   npx cap sync android
   ```

4. **构建 APK**
   ```bash
   cd android
   ./gradlew assembleDebug
   ```

5. **APK 位置**
   - Debug: `android/app/build/outputs/apk/debug/app-debug.apk`
   - Release: `android/app/build/outputs/apk/release/app-release-unsigned.apk`

### 方法三：使用 Docker 构建

```bash
# 构建 Docker 镜像
docker build -t material-manager-build .

# 运行构建
docker run -v $(pwd)/apk-output:/app/apk-output material-manager-build
```

### 安装 APK

1. 将 APK 文件传输到 Android 设备
2. 在设备上启用"未知来源"安装
3. 点击 APK 文件进行安装

### 应用信息

- **包名**: `com.materialmanager.app`
- **应用名称**: 标准物质管理助手
- **最低 Android 版本**: Android 8.0 (API 26)
- **目标 Android 版本**: Android 13 (API 33)

### 功能特性

- ✅ 多用户登录/注册
- ✅ 人员管理系统
- ✅ 库存管理（入库/出库）
- ✅ 操作记录查询
- ✅ 数据导出（Excel/CSV）
- ✅ Supabase 数据同步
- ✅ 离线使用支持

### 注意事项

1. **网络权限**: 应用需要网络连接以同步数据到 Supabase
2. **存储权限**: 应用需要存储权限以导出数据和保存图片
3. **相机权限**: 应用需要相机权限以拍摄物料图片

### 技术支持

如有问题，请提交 Issue 或联系开发团队。
