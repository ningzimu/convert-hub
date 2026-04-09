# Convert Hub

[![English README](https://img.shields.io/badge/README-English-green)](./README.md) [![Release Tag](https://img.shields.io/github/v/release/ningzimu/convert-hub?display_name=tag)](https://github.com/ningzimu/convert-hub/releases) [![GHCR](https://img.shields.io/badge/GHCR-ghcr.io%2Fningzimu%2Fconvert--hub-2ea44f?logo=docker)](https://github.com/ningzimu/convert-hub/pkgs/container/convert-hub)

Convert Hub 是一个单镜像、自托管的订阅转换工作台。  
你可以在一个页面中完成来源输入、模板选择、链接转换和短链生成。

## 项目能力

- 单一 Docker 镜像
- 单一 HTTP 入口
- 内置转换引擎
- 内置短链存储
- Studio 可视化界面

主要路由：

- `/` Studio 页面
- `/api/*` 转换引擎代理
- `/s/short` 短链创建 API
- `/s/:key` 短链跳转

## 快速开始（推荐：直接使用 GHCR 镜像）

```bash
git clone https://github.com/ningzimu/convert-hub.git
cd convert-hub
docker compose up -d
```

浏览器访问：`http://localhost:8090`

## 只用 Docker 运行（不使用 Compose）

```bash
docker run -d \
  --name convert-hub \
  -p 8090:8080 \
  -e REMOTE_CONFIG_URL= \
  -e ENGINE_READY_TIMEOUT_MS=180000 \
  -v convert-hub-data:/app/data \
  ghcr.io/ningzimu/convert-hub:latest
```

## 自己构建 Docker 镜像

本地构建：

```bash
docker build -t ghcr.io/ningzimu/convert-hub:local .
```

运行本地镜像：

```bash
docker run -d \
  --name convert-hub-local \
  -p 8090:8080 \
  -v convert-hub-data:/app/data \
  ghcr.io/ningzimu/convert-hub:local
```

配合 compose 使用本地镜像：

```bash
docker compose build
IMAGE_TAG=local docker compose up -d
```

## 运行配置

直接使用环境变量：

| 变量 | 说明 | 默认值 |
| --- | --- | --- |
| `WEB_PORT` | 对外端口，映射到容器 `8080` | `8090` |
| `REMOTE_CONFIG_URL` | UI 默认模板地址。留空时自动回退内置默认模板。 | 空 |
| `ENGINE_READY_TIMEOUT_MS` | 内置引擎冷启动等待时间（毫秒） | `180000` |
| `IMAGE_TAG` | Compose 拉取镜像标签（`ghcr.io/ningzimu/convert-hub:${IMAGE_TAG}`） | `latest` |

示例：

```bash
# Linux/macOS（当前终端会话有效）
export WEB_PORT=8090
export REMOTE_CONFIG_URL=
export ENGINE_READY_TIMEOUT_MS=180000
export IMAGE_TAG=latest
docker compose up -d
```

```bash
# 单次覆盖
WEB_PORT=8091 IMAGE_TAG=latest docker compose up -d
```

说明：

- `REMOTE_CONFIG_URL` 为空时，不会报错，会走后端内置默认模板。
- 数据持久化在 Docker volume `studio-data`（容器内 `/app/data`）。

## 页面使用流程

1. 打开 `/` 页面。
2. 输入一个或多个来源链接（支持换行或 `|` 分隔）。
3. 选择目标客户端格式。
4. 选择或填写规则模板 URL。
5. 按需配置高级参数。
6. 生成订阅链接。
7. 需要时再生成短链接。

## 仓库结构

```text
convert-hub/
├── Dockerfile
├── docker-compose.yml
├── backend/
├── frontend/
├── engine/
├── tests/
└── .github/workflows/
```

## 常见问题

- 容器已启动但页面没更新：
  - 执行 `docker compose up -d --build`
  - 浏览器强刷缓存（`Ctrl+F5` / `Cmd+Shift+R`）
- 引擎预热慢：
  - 调大环境变量 `ENGINE_READY_TIMEOUT_MS`

## 参考项目

- [tindy2013/subconverter](https://github.com/tindy2013/subconverter)
- [asdlokj1qpi23/subconverter](https://github.com/asdlokj1qpi23/subconverter)
- [youshandefeiyang/sub-web-modify](https://github.com/youshandefeiyang/sub-web-modify)
- [CareyWang/MyUrls](https://github.com/CareyWang/MyUrls)
