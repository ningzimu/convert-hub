# Convert Hub

[![中文文档](https://img.shields.io/badge/README-%E4%B8%AD%E6%96%87-blue)](./README.zh-CN.md) [![Release Tag](https://img.shields.io/github/v/release/ningzimu/convert-hub?display_name=tag)](https://github.com/ningzimu/convert-hub/releases) [![GHCR](https://img.shields.io/badge/GHCR-ghcr.io%2Fningzimu%2Fconvert--hub-2ea44f?logo=docker)](https://github.com/ningzimu/convert-hub/pkgs/container/convert-hub)

Convert Hub is a single-image, self-hosted subscription conversion workspace.  
You can input subscription URLs or single-node links, choose a template, generate conversion links, and create short links in one place.

## What You Get

- One container image
- One HTTP entrypoint
- One built-in conversion engine
- One built-in short-link store
- One Studio UI

HTTP routes:

- `/` Studio UI
- `/api/*` conversion engine proxy
- `/s/short` short-link creation API
- `/s/:key` short-link redirect

## Quick Start (Recommended: GHCR Image)

```bash
git clone https://github.com/ningzimu/convert-hub.git
cd convert-hub
docker compose up -d
```

Open `http://localhost:8090`.

## Run With Docker Only (No Compose)

```bash
docker run -d \
  --name convert-hub \
  -p 8090:8080 \
  -e REMOTE_CONFIG_URL= \
  -e ENGINE_READY_TIMEOUT_MS=180000 \
  -v convert-hub-data:/app/data \
  ghcr.io/ningzimu/convert-hub:latest
```

## Build the Image Yourself

Build locally:

```bash
docker build -t ghcr.io/ningzimu/convert-hub:local .
```

Run your local image:

```bash
docker run -d \
  --name convert-hub-local \
  -p 8090:8080 \
  -v convert-hub-data:/app/data \
  ghcr.io/ningzimu/convert-hub:local
```

Use compose with local build:

```bash
docker compose build
IMAGE_TAG=local docker compose up -d
```

## Runtime Configuration

Use environment variables directly:

| Variable | Description | Default |
| --- | --- | --- |
| `WEB_PORT` | Public port mapping to container `8080` | `8090` |
| `REMOTE_CONFIG_URL` | Default template URL injected into UI. Leave empty to use built-in fallback. | empty |
| `ENGINE_READY_TIMEOUT_MS` | Embedded engine cold-start timeout (ms) | `180000` |
| `IMAGE_TAG` | Compose image tag (`ghcr.io/ningzimu/convert-hub:${IMAGE_TAG}`) | `latest` |

Examples:

```bash
# Linux/macOS (temporary for current shell)
export WEB_PORT=8090
export REMOTE_CONFIG_URL=
export ENGINE_READY_TIMEOUT_MS=180000
export IMAGE_TAG=latest
docker compose up -d
```

```bash
# One-off override
WEB_PORT=8091 IMAGE_TAG=latest docker compose up -d
```

Notes:

- If `REMOTE_CONFIG_URL` is empty, backend falls back to built-in default template.
- Data is persisted in Docker volume `studio-data` (`/app/data`).

## How to Use the Studio

1. Open `/` in browser.
2. Paste one or more source URLs (newline or `|` separated).
3. Select output client target.
4. Select or input a remote template URL.
5. Configure advanced options if needed.
6. Click generate to get subscription URL.
7. Optionally create a short link.

## Project Layout

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

## Troubleshooting

- Container starts but UI not updated:
  - Run `docker compose up -d --build`
  - Hard refresh browser cache (`Ctrl+F5` / `Cmd+Shift+R`)
- Engine warmup too slow:
  - Increase `ENGINE_READY_TIMEOUT_MS` in your environment variables

## References

- [tindy2013/subconverter](https://github.com/tindy2013/subconverter)
- [asdlokj1qpi23/subconverter](https://github.com/asdlokj1qpi23/subconverter)
- [youshandefeiyang/sub-web-modify](https://github.com/youshandefeiyang/sub-web-modify)
- [CareyWang/MyUrls](https://github.com/CareyWang/MyUrls)
