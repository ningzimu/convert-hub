# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

自托管订阅转换工具，已经收束为单体产品形态：

- **backend/** — 统一应用服务，负责静态站点、短链、运行时配置和内部引擎代理
- **backend/engine-profile/** — 应用内置的引擎配置、模板和规则片段
- **frontend/** — Vue 2 Studio 前端
- **engine/** — C++ 转换引擎源码，构建时编译并打入最终镜像

统一入口：`/` → Studio、`/api/` → 内置引擎、`/s/short` 和 `/s/:key` → 内置短链能力。

## 常用命令

### Studio 前端 (frontend/)

```bash
cd frontend
yarn install        # 安装依赖
yarn serve          # 开发服务器
yarn build          # 生产构建
```

包管理器为 Yarn。无 test/lint 脚本。

### 整体部署

```bash
docker compose up -d --build  # 构建并启动单体应用
```

对外端口由 `.env` 的 `WEB_PORT`（默认 8090）控制，容器内部监听 8080。

## 架构要点

### Studio 架构 (frontend/)

- **单页面应用**：只有一个路由 `/`，对应 `views/Subconverter.vue`，包含所有业务逻辑
- **无全局状态管理**：所有状态在 `Subconverter.vue` 的 `data()` 中管理
- **UI 框架**：Element UI 2.x（中文语言包，size: small）
- **布局**：`el-row type="flex" justify="center"` + `el-col` 响应式栅格
- **插件模式**：Vue.prototype 扩展（axios、btoa/atob、clipboard、device）在 `src/plugins/` 注册，通过 `main.js` 引入
- **路径别名**：`@/` 指向 `src/`
- **主题切换**：通过 `<body>` className 切换 `light-mode`/`dark-mode`，状态存储在 localStorage（key: `localTheme`），自动检测顺序：localStorage → prefers-color-scheme → 时间段判断
- **CSS**：`src/assets/css/light.css` 和 `dark.css`，使用 CSS 变量 (`--bg`, `--text`, `--accent`, `--card-bg`, `--border`)
- **运行时配置**：`/config.js` 由统一应用服务动态输出并注入 `window.__CONFIG__`
- **环境变量**：构建时变量在 `frontend/.env`（`VUE_APP_*` 前缀），运行时由统一应用服务动态注入
- **后端地址**：使用相对路径（`/api`、`/s/short`），由同一个应用服务处理

### 引擎配置 (engine/)

- 内置运行时配置位于 `backend/engine-profile/`，构建时复制到 `/app/runtime/engine/`
- 配置文件：`pref.toml`
- 自定义节点过滤脚本：`myconfig/node_filter_script.js`
- 规则模板：`base/all_base.tpl`

### 应用服务 (backend/)

- 启动时拉起内置转换引擎子进程
- 透明代理 `/api/*` 到本地引擎端口
- 提供 `/config.js` 运行时配置注入
- 提供短链创建与跳转能力
- 使用本地 JSON 文件存储短链数据
