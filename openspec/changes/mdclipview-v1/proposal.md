# Proposal: MDClipView v1

## 问题

使用 AI（Claude、DeepSeek 等）时，AI 输出的内容通常是 Markdown 格式。但渲染 Markdown 需要额外步骤——粘贴到 VSCode、打开在线预览网站。这些步骤打断工作流，尤其是在 QQ 群机器人或飞书等消息渠道收到 AI 输出时，根本没有地方渲染。

## 目标

构建一个**轻量级、跨平台的 Markdown 实时预览工具**：

- **桌面端（Windows）**：系统托盘常驻，热键唤起，自动读取剪贴板并渲染 Markdown
- **Android 端**：小窗模式下自动监听剪贴板变化，实时渲染
- **PWA 备用**：纯网页版，可在任何浏览器中使用

## 范围（v1）

### 包含
- Windows 桌面应用（Tauri v2）：系统托盘、全局热键、剪贴板自动读取、Markdown 渲染
- Android 应用（Tauri v2 mobile）：小窗模式、剪贴板监听
- PWA 部署（GitHub Pages）：离线可用、添加到桌面
- 深色主题、代码语法高亮
- 设置页面：热键自定义、主题切换、开机自启
- 单实例运行
- 三端共享同一套 HTML/CSS/JS 核心

### 不包含（后续版本）
- Mermaid 图表渲染
- 文件监听 / 实时重载
- 多标签页
- 导出 HTML/PDF
- Shizuku 集成（不需要——小窗前台监听已满足需求）
- macOS / iOS 支持
- Linux 桌面支持

## 技术栈

| 层 | 技术 |
|---|---|
| 桌面壳 | Tauri v2 (Rust + WebView2) |
| 移动壳 | Tauri v2 Android |
| 前端 | Vanilla JS + Vite |
| Markdown | marked.js |
| 代码高亮 | highlight.js |
| 样式 | 纯 CSS（深色主题） |
| 构建 | pnpm + cargo-tauri |
| CI/CD | GitHub Actions |
| PWA | manifest.json + Service Worker |

## 成功标准
- [ ] Windows 上热键唤起弹窗 <500ms
- [ ] Android 小窗模式下复制文本自动刷新 <1s
- [ ] PWA 首次加载 <3s，离线可用
- [ ] 代码审查通过（code-review-and-quality skill）
- [ ] 三端均通过功能验证
