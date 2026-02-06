# 标准物质管理助手

一个基于 React + Capacitor + Supabase 的实验室标准物质库存管理系统，支持多用户登录、人员管理、库存管理和数据同步。

## 功能特性

- 🔐 **多用户登录/注册** - 支持邮箱+密码认证
- 👥 **人员管理系统** - 管理员可添加、编辑、删除人员
- 📦 **库存管理** - 入库/出库、库存状态监控
- 📊 **数据统计** - 库存状态分布图表
- 📜 **操作记录** - 完整的入库/出库记录
- 📤 **数据导出** - 支持 Excel/CSV 格式导出
- ☁️ **云端同步** - Supabase 实时数据同步
- 📱 **离线支持** - 支持离线使用，联网后自动同步

## 技术栈

- **前端**: React 18 + TypeScript + Vite
- **UI框架**: Tailwind CSS + shadcn/ui
- **移动端**: Capacitor
- **数据库**: Supabase (PostgreSQL)
- **认证**: Supabase Auth
- **图表**: Recharts

## 快速开始

### 环境要求

- Node.js 18+
- npm 9+
- Java JDK 17+
- Android SDK (用于构建 APK)

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建 Web 应用

```bash
npm run build
```

## APK 构建

### 方法一：使用 GitHub Actions（推荐）

1. Fork 或上传代码到 GitHub 仓库
2. 推送代码到 `main` 分支会自动触发构建
3. 在 Actions 页面下载构建好的 APK

### 方法二：本地构建

**Linux/Mac:**
```bash
./build-apk.sh
```

**Windows:**
```bash
build-apk.bat
```

### 方法三：使用 Docker

```bash
docker build -t material-manager .
docker run -v $(pwd)/apk-output:/app/apk-output material-manager
```

## Supabase 配置

需要在 Supabase 中创建以下表：

### users 表
```sql
create table users (
  id uuid references auth.users primary key,
  email text unique not null,
  name text not null,
  role text default 'operator',
  created_at timestamp default now(),
  updated_at timestamp default now()
);
```

### materials 表
```sql
create table materials (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  code text not null,
  batch_number text,
  unique_id text unique not null,
  manufacturer text,
  concentration text,
  uncertainty text,
  storage_condition text,
  quantity integer default 1,
  expiry_date date not null,
  status text default 'normal',
  images jsonb default '[]',
  created_by uuid references users(id),
  created_at timestamp default now(),
  updated_at timestamp default now()
);
```

### records 表
```sql
create table records (
  id uuid default gen_random_uuid() primary key,
  type text not null,
  material_id uuid,
  material_name text not null,
  quantity integer not null,
  operator text not null,
  operator_id uuid references users(id),
  purpose text,
  note text,
  images jsonb default '[]',
  created_at timestamp default now()
);
```

## 项目结构

```
.
├── android/              # Android 原生项目
├── src/
│   ├── components/       # UI 组件
│   ├── hooks/            # 自定义 Hooks
│   ├── lib/              # 工具库
│   ├── pages/            # 页面组件
│   └── App.tsx           # 应用入口
├── capacitor.config.json # Capacitor 配置
├── package.json
└── vite.config.ts
```

## 用户角色

| 角色 | 权限 |
|------|------|
| admin | 完整权限：人员管理、库存管理、数据导出 |
| operator | 库存管理、查看记录，无人员管理权限 |

## 应用信息

- **包名**: `com.materialmanager.app`
- **应用名称**: 标准物质管理助手
- **最低 Android 版本**: Android 8.0 (API 26)
- **目标 Android 版本**: Android 13 (API 33)

## 许可证

MIT License
