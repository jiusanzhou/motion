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
- [ ] Markdown 导入/导出 — 批量导入本地 md 文件
- [x] 图片支持 — 上传到 GitHub 仓库 assets/ 目录
- [x] 多标签页 — 标签切换 + 关闭 + 未保存指示
- [x] 响应式布局 — 移动端 sidebar overlay + 汉堡菜单

## Phase 3 · 知识库特性 ✅

从编辑器到知识管理。

- [x] 双向链接 `[[page]]` — wikilink 解析
- [x] 关系图谱 — react-force-graph-2d 力导向图
- [x] 标签系统 — frontmatter tags 聚合 + 标签云
- [x] 文档模板 — Blank / Daily Note / Meeting Notes / Project Doc
- [x] 目录大纲 — 右侧 TOC + IntersectionObserver 高亮（需修复滚动）
- [x] 版本历史 — GitHub commit 历史 + 预览 + 回滚
- [x] 多仓库切换 — workspace 下拉菜单

## Phase 4 · Agent-friendly ✅

核心差异化。

- [x] 结构化 Frontmatter 编辑面板 — tags/summary/published/access/links
- [x] Agent 元数据规范 — AgentMeta schema + 验证
- [x] MCP Server — WebSocket relay 架构，浏览器作为 MCP Server
- [x] Agent 视图模式 — JSON frontmatter + raw markdown 只读视图
- [ ] 语义索引 — 基于 embedding 的语义搜索
- [ ] Webhook/事件 — 文档变更通知
- [x] 权限标记 — 文档级 access control（public/private/agent）
- [x] 批量操作 API — batch/graph/tags 端点

## 额外完成

- [x] GitHub OAuth 登录（next-auth）
- [x] IndexedDB 本地缓存 — 增量更新 + 离线缓存
- [x] WebSocket relay — Agent 通过 WS 连接浏览器端 StorageProvider
- [x] MCP 状态面板 — Session ID + 连接数 + 请求日志

## 已知问题

- [ ] TOC 点击滚动定位不准
- [ ] 代码块中 JSON 转义显示问题（BlockNote markdown 解析）
- [ ] 全文搜索需要完善（目前只索引文件名，未索引内容）
- [ ] 双向链接在编辑器中的渲染（目前只有解析，未集成到 BlockNote）
