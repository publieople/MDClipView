# MDClipView — Project Context for Claude Code

## Architecture
- **Desktop Shell**: Tauri v2 (Rust backend + WebView2 frontend)
- **Mobile Shell**: Tauri v2 Android
- **Frontend**: Vanilla JS + Vite (no framework)
- **Markdown**: marked.js + highlight.js
- **PWA**: manifest.json + Service Worker → GitHub Pages

## Project Structure
```
src/              # Frontend (Vite + Vanilla JS)
src-tauri/        # Rust backend
  src/main.rs     # App entry, plugins, setup
  src/tray.rs     # System tray
  src/commands.rs # Tauri commands
  src/config.rs   # Settings persistence
openspec/         # Comet/OpenSpec specs
docs/superpowers/ # Design docs + plans
```

## Key Commands
```bash
pnpm install           # Install deps
pnpm tauri dev         # Desktop dev server
pnpm tauri build       # Production build
pnpm tauri android dev # Android dev
pmpm tauri android build # Android APK
```

## Rust Conventions
- 2-space indent in TOML/JSON, 4-space in Rust
- `#[tauri::command]` functions in `commands.rs`
- Settings via `serde` + `serde_json`
- Error handling: `Result<T, String>` for commands

## JS Conventions
- 2-space indent
- No framework — vanilla DOM APIs
- `marked` configured with GFM + breaks
- `highlight.js` for code blocks

## Tauri Plugins Used
- `tauri-plugin-clipboard-manager`
- `tauri-plugin-global-shortcut`
- `tauri-plugin-single-instance`
- `tauri-plugin-autostart`

## Settings
- Stored at `{config_dir}/mdclipview/config.json`
- Fields: hotkey, theme, auto_start, window_width, window_height

## Comet State
- Change: `mdclipview-v1`
- Phase: `build`
- Tasks: `openspec/changes/mdclipview-v1/tasks.md`
