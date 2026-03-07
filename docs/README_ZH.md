<div align="right">

[English](/README.md) | [中文](/docs/README_ZH.md)

</div>

<div align="center">

<img src="../client-web/public/logo.svg" alt="Motion" width="200" />

<br />
<br />

**Agent 友好的知识库编辑器。纯前端，数据完全由你掌控。**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](../LICENSE)
[![Stars](https://img.shields.io/github/stars/jiusanzhou/motion?style=flat&color=yellow)](https://github.com/jiusanzhou/motion/stargazers)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/jiusanzhou/motion/pulls)

---

</div>

## Motion 是什么？

Motion 是一个**纯前端**的 Notion 风格知识库编辑器，内置 AI Agent 接口。数据以普通 Markdown 存储在你的 GitHub 仓库中 — 无需后端，无需供应商锁定，数据不离开浏览器。

与云端工具相比，Motion 给你：
- **完全的数据所有权** — 你的 GitHub 仓库就是你的数据库
- **AI 原生架构** — 内置 MCP Server，任何 AI Agent 可通过 WebSocket 读写知识库
- **零基础设施** — 一键部署到 Vercel，或本地运行

## 截图预览

> 以下截图展示主编辑器、AI Chat 面板、知识图谱和版本历史。

| 编辑器 | AI Chat |
|--------|---------|
| ![Editor](assets/screenshot-editor.png) | ![AI Chat](assets/screenshot-ai-chat.png) |

| 知识图谱 | 版本历史 |
|----------|---------|
| ![Graph](assets/screenshot-graph.png) | ![History](assets/screenshot-history.png) |

<!-- 更新截图：在 1280×800 分辨率截图，保存到 docs/assets/ -->

## 为什么选 Motion？

| | Motion | Notion | Obsidian |
|--|--------|--------|----------|
| 数据所有权 | ✅ GitHub 仓库 | ❌ 云端 | ✅ 本地文件 |
| AI Agent 接入 | ✅ MCP WebSocket | ❌ | ❌ |
| 零后端 | ✅ | ❌ | ✅ |
| 多人协作 | ✅ 基于 Git | ✅ | ❌ |
| 自托管 | ✅ | ❌ | N/A |
| 免费 | ✅ | Freemium | Freemium |

## 特性

- 🧠 **Agent 友好的 MCP Server** — AI Agent 通过 WebSocket 连接，可列出、读取、写入、搜索和遍历知识图谱
- 🔒 **隐私优先** — OAuth Token 不离开浏览器；数据存储在你自己的 GitHub 仓库
- 📝 **Block 编辑器** — Notion 风格 BlockNote 编辑器：斜杠命令、拖拽块、Markdown 快捷方式
- 🔗 **双向链接** — `[[wiki-links]]` 语法 + 自动反向链接索引 + 力导向知识图谱
- 🏷️ **标签与 Frontmatter** — 结构化 YAML 元数据、标签云、语义化组织
- 🌗 **暗色模式** — 亮色 / 暗色 / 跟随系统，`Cmd+K` 命令面板
- 📂 **GitHub 存储** — 通过 Octokit 直接读写 GitHub 仓库，commit 即版本历史
- 🕰️ **版本历史** — 完整 commit 历史，支持差异预览和一键回滚
- 🔍 **全文搜索** — 基于 Fuse.js 的模糊搜索
- 📑 **多标签页编辑** — 标签切换、未保存提示、拖拽排序、快捷键支持
- 🗂️ **目录大纲** — 自动生成的 sticky TOC + 滚动位置高亮
- 📱 **PWA + 移动端** — 可安装、离线可用、响应式布局

## 架构

```
┌─────────────────────────────────────────────────────────┐
│                        浏览器                            │
│  ┌──────────┐  ┌───────────┐  ┌───────────────────┐    │
│  │ BlockNote │  │  Zustand   │  │  MCP Server (WS)  │◄───── AI Agent
│  │   编辑器   │  │   状态管理  │  │  读写文档          │    │
│  └────┬─────┘  └─────┬─────┘  └────────┬──────────┘    │
│       │              │                  │               │
│       └──────────────┼──────────────────┘               │
│                      │                                  │
│            ┌─────────▼──────────┐                       │
│            │  StorageProvider    │                       │
│            │  (可插拔存储)        │                       │
│            └─────────┬──────────┘                       │
│                      │                                  │
│            ┌─────────▼──────────┐                       │
│            │  IndexedDB 缓存     │                       │
│            └─────────┬──────────┘                       │
└──────────────────────┼──────────────────────────────────┘
                       │ HTTPS (Octokit)
              ┌────────▼────────┐
              │   GitHub API    │
              │  (仓库 / 文件)   │
              └─────────────────┘
```

## 快速开始

### 前置要求

- Node.js 20+
- pnpm 9+
- 一个 [GitHub OAuth App](https://github.com/settings/developers)

### 1. 克隆并安装

```bash
git clone https://github.com/jiusanzhou/motion.git
cd motion/client-web
pnpm install
```

### 2. 配置 GitHub OAuth

在 [github.com/settings/developers](https://github.com/settings/developers) 创建 OAuth App：

- **Homepage URL**：`http://localhost:3000`
- **Callback URL**：`http://localhost:3000/api/auth/callback/github`

然后创建环境变量文件：

```bash
cp .env.local.example .env.local
```

填写你的配置：

```env
GITHUB_CLIENT_ID=你的_client_id
GITHUB_CLIENT_SECRET=你的_client_secret
NEXTAUTH_SECRET=随机密钥   # 运行 openssl rand -base64 32 生成
NEXTAUTH_URL=http://localhost:3000
```

### 3. 启动

```bash
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000)，用 GitHub 登录，连接仓库，开始写作。

### 部署到 Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fjiusanzhou%2Fmotion&env=GITHUB_CLIENT_ID,GITHUB_CLIENT_SECRET,NEXTAUTH_SECRET,NEXTAUTH_URL)

## Agent / MCP 集成

Motion 在浏览器内运行 **MCP (Model Context Protocol) Server**，通过 WebSocket 对外提供服务：

```
ws://localhost:3000/mcp
```

AI Agent 可以：
- **列出**知识库中的所有文档
- **读取**文档内容（Markdown + Frontmatter）
- **创建 / 更新 / 删除**文档
- **搜索** — 按标签、全文、图谱遍历
- **查询**知识图谱（反向链接、关联页面）

浏览器变成了一个实时的知识 API，任何兼容 MCP 协议的 Agent 都可以直接连接。

## 存储后端

Motion 采用**可插拔的 StorageProvider** 接口，目前支持：

| 后端 | 状态 | 说明 |
|------|------|------|
| **GitHub** | ✅ 稳定 | 通过 Octokit 直接读写 GitHub 仓库中的 Markdown 文件 |
| **本地 / IndexedDB** | ✅ 缓存 | 离线优先的缓存层，支持增量同步 |
| **S3 / WebDAV** | 🗓️ 计划中 | 欢迎社区贡献 |

你的 GitHub 仓库**就是**你的数据库 — 标准的 Markdown 文件 + YAML Frontmatter，目录结构随你组织。

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Next.js 16、React 19 |
| 编辑器 | BlockNote |
| 状态管理 | Zustand |
| 样式 | Tailwind CSS 4 |
| 认证 | NextAuth（GitHub OAuth） |
| 存储 | Octokit（GitHub API） |
| 搜索 | Fuse.js |
| 图谱 | d3-force、react-force-graph-2d |
| WebSocket | ws（MCP 中继） |

## 路线图

查看 [ROADMAP.md](../ROADMAP.md) 了解完整的开发计划和进度。

## 参与贡献

欢迎贡献！请先开 Issue 讨论你想做的改动。

## 许可证

[MIT](../LICENSE)
