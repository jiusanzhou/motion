<div align="right">

[English](/README.md) | [中文](/docs/README_ZH.md)

</div>

<div align="center">

<img src="../client-web/public/logo.svg" alt="Motion" width="240" />

<br />

**Agent 友好的知识库编辑器。纯前端，数据完全由你掌控。**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](../LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/nicepkg/motion/pulls)

---

</div>

## Motion 是什么？

Motion 是一个**纯前端**的 Notion 风格知识库编辑器。数据不经过任何服务器，通过可插拔的存储后端持久化（首选 GitHub）。内置 MCP Server，AI Agent 可通过 WebSocket 直接读写你的知识库。

<!-- 截图占位 -->
<!-- ![Motion 截图](assets/screenshot.png) -->

## 特性

- 🧠 **Agent 友好** — 内置 MCP Server，AI Agent 通过 WebSocket 即可读写知识库
- 🔒 **隐私优先** — Token 不离开浏览器，数据完全在你的掌控之下
- 📝 **Block 编辑器** — Notion 风格的 BlockNote 编辑器，支持斜杠命令、拖拽排序、Markdown
- 🔗 **双向链接** — `[[wiki-links]]` 语法 + 力导向知识图谱
- 🏷️ **标签与元数据** — 结构化 Frontmatter、标签云、语义化组织
- 🌗 **暗色模式** — 亮色 / 暗色 / 跟随系统，Cmd+K 命令面板
- 📂 **GitHub 存储** — 通过 Octokit 直接读写 GitHub 仓库，仓库即数据库
- 🕰️ **版本历史** — 完整的 commit 历史，支持预览和回滚
- 🔍 **全文搜索** — 基于 Fuse.js 的模糊搜索
- 📑 **多标签页编辑** — 标签页切换、未保存提示、拖拽排序、快捷键支持

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
git clone https://github.com/nicepkg/motion.git
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

## 存储后端

Motion 采用**可插拔的 StorageProvider** 接口，目前支持：

| 后端 | 状态 | 说明 |
|------|------|------|
| **GitHub** | ✅ 稳定 | 通过 Octokit 直接读写 GitHub 仓库中的 Markdown 文件 |
| **本地 / IndexedDB** | ✅ 缓存 | 离线优先的缓存层，支持增量同步 |
| **S3 / WebDAV** | 🗓️ 计划中 | 欢迎社区贡献 |

你的 GitHub 仓库**就是**你的数据库 — 标准的 Markdown 文件 + YAML Frontmatter，目录结构随你组织。

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
