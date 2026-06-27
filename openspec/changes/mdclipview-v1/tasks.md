# Tasks: MDClipView v1

## Phase 1: 项目脚手架
- [ ] 安装开发依赖：Tauri CLI、xdotool、Rust targets
- [ ] `pnpm create tauri-app` 初始化项目，选用 vanilla JS + Vite 模板
- [ ] 安装 Tauri plugins：clipboard-manager, global-shortcut, single-instance, autostart
- [ ] 配置 `tauri.conf.json`：窗口大小 800×600、居中、无边框选项
- [ ] 配置 `capabilities/default.json`：所有插件权限
- [ ] 创建 `.gitignore`，提交初始 commit
- [ ] 创建 `CLAUDE.md`：项目上下文供 Claude Code 使用

## Phase 2: 桌面端核心
- [ ] 实现系统托盘：图标、右键菜单（显示/设置/退出）、左键切换窗口
- [ ] 注册全局热键 `Ctrl+Shift+M`，触发窗口显隐
- [ ] 实现剪贴板读取 Tauri command：`get_clipboard_text`
- [ ] 预览窗口：居中显示、Esc 隐藏到托盘、关闭按钮最小化到托盘
- [ ] 单实例：重复启动时聚焦已有窗口

## Phase 3: 前端渲染
- [ ] Vite 构建配置：开发服务器 + 生产打包
- [ ] Markdown 渲染：marked.js + highlight.js，深色主题 CSS
- [ ] 预览页面：左编辑 / 右预览分栏，或全预览模式
- [ ] 剪贴板粘贴按钮 + 自动读取（visibilitychange）
- [ ] 设置页面：热键显示、主题选择、开机自启开关
- [ ] 响应式布局：移动端竖向分栏

## Phase 4: Android 适配
- [ ] 初始化 Tauri Android target：`tauri android init`
- [ ] Android 剪贴板监听：`OnPrimaryClipChangedListener`
- [ ] 小窗模式适配：布局优化、大按钮
- [ ] APK 构建与签名

## Phase 5: PWA & 部署
- [ ] `manifest.json` + Service Worker（缓存 marked.js、highlight.js）
- [ ] GitHub Pages 部署配置
- [ ] PWA 图标：192px + 512px

## Phase 6: 打包发布
- [ ] Windows: `.msi` 安装包
- [ ] Android: Release APK
- [ ] GitHub Actions: 多平台构建矩阵
- [ ] README: 安装说明、使用指南、截图
