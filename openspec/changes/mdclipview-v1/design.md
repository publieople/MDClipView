# Design: MDClipView v1

## Overview

MDClipView 是一个三端共享核心的轻量级 Markdown 预览器。Tauri v2 作为桌面和移动壳，Vanilla JS 负责渲染。

## Architecture

```
┌─────────────────────────────────────────────┐
│               Shared Core (HTML/CSS/JS)       │
│  ┌───────────────────────────────────────┐   │
│  │  index.html — Preview page            │   │
│  │  settings.html — Settings page        │   │
│  │  main.js — Logic + marked.js + hljs   │   │
│  │  style.css — Dark theme               │   │
│  │  manifest.json + sw.js — PWA          │   │
│  └───────────────────────────────────────┘   │
├─────────────────────────────────────────────┤
│           Platform Shells                     │
│  ┌──────────────┐  ┌──────────────────────┐ │
│  │  Windows      │  │  Android             │ │
│  │  WebView2     │  │  WebView (System)     │ │
│  │  Tray + HK    │  │  Clipboard Listener   │ │
│  │  Clipboard    │  │  Multi-window         │ │
│  └──────────────┘  └──────────────────────┘ │
└─────────────────────────────────────────────┘
```

## Key Decisions

### 1. Vanilla JS over React
- **Decision**: Use vanilla JS + Vite, no framework
- **Rationale**: The app is essentially one textarea + one preview div. Framework overhead (React ~40KB) is unjustified for this complexity level.

### 2. Frontend-side Markdown Rendering
- **Decision**: marked.js in the WebView, not pulldown-cmark in Rust
- **Rationale**: CSS theming is easier in the DOM. No Rust↔JS HTML serialization overhead. Android WebView gets the same experience.

### 3. Tauri Plugins (Desktop)
- `tauri-plugin-clipboard-manager` — read Windows clipboard
- `tauri-plugin-global-shortcut` — Ctrl+Shift+M hotkey
- `tauri-plugin-single-instance` — prevent duplicate processes
- `tauri-plugin-autostart` — optional startup launch
- System tray: Tauri's built-in `TrayIcon` API (no separate plugin needed)
- Window management: Tauri's built-in `WebviewWindow` API

### 4. Settings Persistence
- **Decision**: JSON file at `dirs::config_dir()/mdclipview/config.json`
- **Rationale**: Simple, human-readable, no database dependency. `serde` + `serde_json` for Rust-side R/W. Settings synced to frontend via Tauri commands.

### 5. Android Clipboard Monitoring
- **Decision**: `ClipboardManager.OnPrimaryClipChangedListener` in foreground
- **Rationale**: When the app runs in multi-window/split-screen, it's in the foreground. The listener fires on clipboard changes. No Shizuku needed.

### 6. PWA Strategy
- **Decision**: Same HTML deployed to GitHub Pages with manifest.json + Service Worker
- **Rationale**: Zero additional code. Service Worker caches marked.js + highlight.js for offline use. "Add to Home Screen" for standalone mode.

## Data Flow

```
User copies Markdown text
        │
        ▼
[Desktop] Global hotkey → toggle_window() → clipboard.readText() → render()
[Android] OnPrimaryClipChanged → clipboard.readText() → render()
[PWA]    visibilitychange → clipboard.readText() → render()
        │
        ▼
    marked.js parses → innerHTML in preview div
    highlight.js colors code blocks
```

## Window States (Desktop)

```
┌──────────┐  toggle  ┌──────────────┐
│  Hidden  │─────────→│   Visible     │
│ (tray)   │←─────────│  (centered,   │
│          │  toggle  │   800×600)    │
└──────────┘          └──────────────┘
     │                      │
     └── Right-click ──────→ Settings
     └── Left-click ───────→ Show/Hide
```

## Project Structure

```
MDClipView/
├── src/                       # Frontend (Vite + Vanilla JS)
│   ├── index.html
│   ├── settings.html
│   ├── main.js
│   ├── renderer.js
│   ├── style.css
│   ├── manifest.json
│   └── sw.js
├── src-tauri/                 # Rust backend
│   ├── src/
│   │   ├── main.rs
│   │   ├── tray.rs
│   │   ├── commands.rs
│   │   └── config.rs
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   ├── capabilities/
│   │   └── default.json
│   └── icons/
├── openspec/                  # Comet/OpenSpec
├── docs/superpowers/          # Design docs + plans
├── package.json
├── vite.config.js
├── CLAUDE.md
└── README.md
```
