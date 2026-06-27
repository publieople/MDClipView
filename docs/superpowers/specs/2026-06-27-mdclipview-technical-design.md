# MDClipView — Technical Design RFC

**Date**: 2026-06-27
**Status**: Draft
**Change**: mdclipview-v1

---

## 1. Executive Summary

MDClipView 是一个三端（Windows 桌面 / Android / PWA）共享核心的贴板 Markdown 实时预览器。Tauri v2 作为桌面和移动壳，Vanilla JS + Vite 负责渲染。

## 2. Tauri v2 Plugin Matrix

| Plugin | Cargo Crate | npm Package | Purpose |
|--------|------------|-------------|---------|
| clipboard-manager | `tauri-plugin-clipboard-manager` | `@tauri-apps/plugin-clipboard-manager` | 读写系统剪贴板 |
| global-shortcut | `tauri-plugin-global-shortcut` | `@tauri-apps/plugin-global-shortcut` | 全局热键注册 |
| single-instance | `tauri-plugin-single-instance` | — (Rust only) | 单实例运行 |
| autostart | `tauri-plugin-autostart` | `@tauri-apps/plugin-autostart` | 开机自启 |

All plugins are official Tauri v2 plugins. System tray uses Tauri's built-in `TrayIcon` API, no separate plugin needed.

## 3. Rust Backend Architecture

### 3.1 Module Breakdown

```
src-tauri/src/
├── main.rs          # App entry, plugin init, setup hook
├── tray.rs          # TrayIcon builder, menu events
├── commands.rs      # #[tauri::command] functions
├── config.rs        # Settings load/save (serde JSON)
└── lib.rs           # (if using lib pattern)
```

### 3.2 Tauri Commands

```rust
#[tauri::command]
fn get_clipboard_text(app: AppHandle) -> Result<String, String> {
    app.clipboard().read_text().map_err(|e| e.to_string())
}

#[tauri::command]
fn get_settings(app: AppHandle) -> Result<Settings, String> { ... }

#[tauri::command]
fn save_settings(app: AppHandle, settings: Settings) -> Result<(), String> { ... }

#[tauri::command]
fn get_autostart_status(app: AppHandle) -> Result<bool, String> { ... }

#[tauri::command]
fn set_autostart(app: AppHandle, enable: bool) -> Result<(), String> { ... }
```

### 3.3 Settings Schema

```rust
#[derive(Serialize, Deserialize, Clone)]
struct Settings {
    hotkey: String,            // "Ctrl+Shift+M"
    theme: String,             // "dark" | "light"
    auto_start: bool,
    window_width: f64,         // default 800
    window_height: f64,        // default 600
    auto_read_clipboard: bool, // default true
}
```

Stored at: `{config_dir}/mdclipview/config.json`

### 3.4 Tray Behavior

```rust
TrayIconBuilder::new()
    .icon(app.default_window_icon().unwrap().clone())
    .tooltip("MDClipView")
    .menu(&menu)
    .on_menu_event(|app, event| match event.id.as_ref() {
        "show" => { /* toggle window */ }
        "settings" => { /* open settings */ }
        "quit" => { app.exit(0); }
        _ => {}
    })
    .on_tray_icon_event(|tray, event| {
        if let TrayIconEvent::Click { .. } = event {
            // Toggle window visibility
        }
    })
    .build(app)?;
```

## 4. Frontend Architecture

### 4.1 File Structure

```
src/
├── index.html        # Main preview page
├── settings.html     # Settings page  
├── main.js           # Entry point, Tauri API integration
├── renderer.js       # Markdown → HTML rendering
├── style.css         # Global dark theme
├── sw.js             # Service Worker (PWA)
└── manifest.json     # PWA manifest
```

### 4.2 JS Module Responsibilities

**main.js**: Boot sequence, Tauri API calls, clipboard handling, window state
**renderer.js**: `marked` config, `highlight.js` config, `render(markdownText) → htmlString`

### 4.3 Clipboard Flow (Desktop)

```
Global hotkey event (Rust)
  → toggle_window()
    → if showing: WebviewWindow::show() + emit "window-shown"
    → main.js receives "window-shown"
      → invoke('get_clipboard_text')
        → render(markdownText)
```

### 4.4 Clipboard Flow (Android)

```
ClipboardManager.OnPrimaryClipChangedListener (Kotlin)
  → plugin.notify("clipboard-changed", text)
    → Rust receives event, forwards to JS
      → render(markdownText)
```

### 4.5 PWA Flow

```
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    navigator.clipboard.readText().then(render);
  }
});
```

## 5. Build Configuration

### 5.1 Vite Config

```javascript
// vite.config.js
export default {
  build: {
    target: 'es2020',
    outDir: 'dist',
  },
  server: {
    host: '127.0.0.1',
    port: 1420,
    strictPort: true,
  },
}
```

### 5.2 Tauri Config (tauri.conf.json)

```json
{
  "productName": "MDClipView",
  "identifier": "com.publieople.mdclipview",
  "app": {
    "windows": [{
      "title": "MDClipView",
      "width": 800,
      "height": 600,
      "center": true,
      "visible": false,
      "decorations": true,
      "resizable": true
    }],
    "withGlobalTauri": true
  },
  "bundle": {
    "active": true,
    "targets": "all",
    "icon": ["icons/icon.png"]
  }
}
```

### 5.3 Capabilities (default.json)

```json
{
  "identifier": "default",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "clipboard-manager:allow-read-text",
    "clipboard-manager:allow-write-text",
    "global-shortcut:allow-register",
    "global-shortcut:allow-unregister",
    "autostart:allow-enable",
    "autostart:allow-disable",
    "autostart:allow-is-enabled"
  ]
}
```

## 6. CSS Theme Variables

```css
:root {
  --bg-primary: #0d1117;
  --bg-secondary: #161b22;
  --border: #30363d;
  --text-primary: #c9d1d9;
  --text-secondary: #8b949e;
  --accent: #58a6ff;
  --accent-emphasis: #1f6feb;
  --danger: #f85149;
  --success: #3fb950;
  --radius: 8px;
}
```

GitHub dark theme inspired. Optimized for OLED (true black on mobile).

## 7. PWA Configuration

### manifest.json
```json
{
  "name": "MDClipView",
  "short_name": "MDClipView",
  "start_url": "/MDClipView/",
  "display": "standalone",
  "background_color": "#0d1117",
  "theme_color": "#0d1117",
  "icons": [
    { "src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### Service Worker Strategy
- Cache strategy: Cache First for CDN assets (marked.js, highlight.js)
- Network First for the app HTML
- Pre-cache: manifest, icons, core CSS/JS

## 8. CI/CD Pipeline

### GitHub Actions Matrix

```yaml
strategy:
  matrix:
    target:
      - os: windows-latest
        artifact: msi
      - os: ubuntu-latest  
        artifact: android-apk
```

### Build Steps
1. Checkout + setup Node/pnpm
2. Install Tauri system deps
3. `pnpm install && pnpm build` (frontend)
4. `cargo tauri build` (Rust + bundle)
5. Upload artifacts to release

## 9. Development Workflow

### Prerequisites
```bash
cargo install tauri-cli --locked
rustup target add x86_64-pc-windows-msvc  # or build on Windows
sudo pacman -S xdotool  # Arch/WSL
```

### Dev Commands
```bash
pnpm tauri dev       # Desktop dev with HMR
pnpm tauri build     # Production build
pnpm tauri android dev   # Android dev
pnpm tauri android build # Android APK
```

## 10. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Tauri v2 Android clipboard listener unreliable | Medium | High | Fallback to visibilitychange polling |
| Windows cross-compile from WSL fails | High | Medium | Build on Windows side or use CI |
| Android WebView renders marked.js differently | Low | Medium | Test on real device in Phase 4 |
| Single-instance plugin Linux/WSL vs Windows behavior differs | Low | Low | Conditional compilation in Rust |
