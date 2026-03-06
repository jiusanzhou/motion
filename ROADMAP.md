# Motion Roadmap

> 纯前端 Agent-friendly 知识库编辑器，数据存 GitHub，界面 Notion 风格。

## Phase 1 · 基础可用 ✅

让它真正能当编辑器用。

- [x] Cmd+S 保存 — 快捷键保存到 GitHub，Header 显示保存状态
- [x] 自动保存 — debounce 3s 无操作自动保存
- [x] 新建/删除/重命名文件 — Sidebar 右键菜单 + 新建文件对话框
- [x] 新建文件夹 — 支持目录层级组织
- [x] 编辑器宽度可调 — 4 档切换，偏好存 localStorage
- [x] 未保存提示 — 切换文件/关闭页面时提醒未保存内容
- [x] 错误处理 — Toast 通知 + 冲突检测（sha 不匹配）

## Phase 2 · 体验提升 ✅

像 Notion 一样舒服。

- [x] 暗色主题 — 跟随系统 + 手动切换（Light/Dark/System）
- [x] 文件搜索 — Cmd+K 命令面板，搜索文件名 + 执行命令
- [x] 全文搜索 — fuse.js 前端索引（文件名索引，按需全文）
- [x] 拖拽排序 — @dnd-kit 文件树拖拽移动
- [x] 面包屑导航 — 可点击路径导航
- [x] 图片支持 — 上传到 GitHub 仓库 assets/ 目录
- [x] 多标签页 — 标签切换 + 关闭 + 未保存指示
- [x] 响应式布局 — 移动端 sidebar overlay + 汉堡菜单
- [x] PWA 支持 — 离线访问 + 添加到主屏幕

## Phase 3 · 知识库特性 ✅

从编辑器到知识管理。

- [x] 双向链接 `[[page]]` — wikilink 解析
- [x] 关系图谱 — react-force-graph-2d 力导向图
- [x] 标签系统 — frontmatter tags 聚合 + 标签云
- [x] 文档模板 — Blank / Daily Note / Meeting Notes / Project Doc
- [x] 目录大纲 — 右侧 TOC sticky 定位 + 滚动高亮
- [x] 版本历史 — GitHub commit 历史 + 预览 + 回滚
- [x] 多仓库切换 — workspace 下拉菜单

## Phase 4 · Agent-friendly ✅

核心差异化。

- [x] 结构化 Frontmatter 编辑面板 — tags/summary/published/access/links
- [x] Agent 元数据规范 — AgentMeta schema + 验证
- [x] MCP Server — WebSocket relay 架构，浏览器作为 MCP Server
- [x] MCP Server Bridge — Claude Desktop 集成（stdio ↔ WebSocket）
- [x] Agent 视图模式 — JSON frontmatter + raw markdown 只读视图
- [x] 权限标记 — 文档级 access control（public/private/agent）
- [x] 批量操作 API — batch/graph/tags 端点
- [x] MCP 状态面板 — Session ID + 连接数 + 请求日志

## Phase 5 · AI 辅助写作 ✅

AI 原生编辑体验。

- [x] AI Settings — API Key / Base URL / Model 配置，支持 Bearer / x-api-key / 自定义 Header
- [x] 行内 AI 助手 — 选中文字浮动菜单：改写 / 续写 / 总结 / 翻译 / 解释
- [x] AI Chat 面板 — 右侧可折叠对话面板（Cmd+Shift+A），可复制内容插入文档
- [x] Streaming 响应 — 所有 AI 功能支持流式输出

---

## Phase 6 · 内容增强 🚧

让编辑器更强大。

- [ ] Markdown 批量导入/导出 — 拖拽文件夹导入，一键导出为 zip
- [ ] 数据库视图 — Notion-style 表格 / 看板 / 日历 / Gallery
- [ ] 嵌入式内容 — YouTube / Twitter / Figma / CodeSandbox 嵌入块
- [ ] Excalidraw 白板 — 内嵌画板，存为 SVG/JSON
- [ ] 数学公式 — LaTeX/KaTeX 公式块
- [ ] 代码块增强 — 语法高亮主题、WASM 运行（JS/Python）

## Phase 7 · AI 深化 🗓️

AI 不只是工具，是协作者。

- [ ] 语义搜索 — 本地 embedding（transformers.js）或 API，相似文档推荐
- [ ] AI 自动标签/摘要 — 保存时自动生成 tags + summary 写入 frontmatter
- [ ] RAG 对话 — Chat 面板自动检索相关文档作为上下文
- [ ] AI 自动补全 — 光标停顿 1.5s 后 Tab 补全（类似 Copilot）
- [ ] MCP 生产部署 — WebSocket relay 部署到 Cloudflare Worker

## Phase 8 · 协作与发布 🗓️

从个人工具到团队平台。

- [ ] 实时协作 — Yjs CRDT + WebRTC P2P 协同编辑
- [ ] 文档发布 — 一键发布为公开网页（静态站点生成）
- [ ] 评论/批注 — 行内评论 + 讨论线程
- [ ] 权限管理 — 团队成员角色 + 文档级权限

## Phase 9 · 基础设施 🗓️

可扩展性和稳定性。

- [ ] 多存储后端 — S3 / WebDAV / 本地文件系统
- [ ] 离线优先 — IndexedDB 完整离线编辑 + 上线自动同步 + 冲突解决
- [ ] 插件系统 — 第三方扩展编辑器功能
- [ ] 国际化 i18n — 中英文 UI 切换
- [ ] Webhook/事件 — 文档变更通知回调

## 已知问题

- [ ] 代码块中 JSON 转义显示问题（BlockNote markdown 解析）
- [ ] 全文搜索需完善（目前按需索引内容）
- [ ] 双向链接编辑器内渲染（目前仅解析，未集成 BlockNote 自定义 inline content）
- [ ] Vercel 不支持 WebSocket — MCP relay 仅本地可用
