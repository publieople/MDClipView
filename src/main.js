import { renderMarkdown } from './renderer.js';

const editor = document.getElementById('editor');
const preview = document.getElementById('previewPane');
const statusText = document.getElementById('statusText');
const btnPaste = document.getElementById('btnPaste');
const btnClear = document.getElementById('btnClear');
const btnSettings = document.getElementById('btnSettings');

let renderTimer = null;
let lastContent = '';

// ── Render ──
function render() {
  const md = editor.value;
  if (!md.trim()) {
    preview.innerHTML = '<p class="placeholder">在左侧粘贴 Markdown<br>或点击 <strong>📋 粘贴</strong> 从剪贴板读取</p>';
  } else {
    preview.innerHTML = renderMarkdown(md);
  }
  saveLocal();
}

function saveLocal() {
  try { localStorage.setItem('mdclipview-content', editor.value); } catch (_) {}
}

function loadLocal() {
  const saved = localStorage.getItem('mdclipview-content');
  if (saved) { editor.value = saved; render(); }
}

// ── Clipboard ──
async function pasteFromClipboard() {
  try {
    // Try Tauri API first
    if (window.__TAURI__) {
      const { invoke } = window.__TAURI__.core;
      const text = await invoke('get_clipboard_text');
      if (text) { editor.value = text; render(); status('已从剪贴板粘贴'); return; }
    }
    // Fallback: browser clipboard API
    const text = await navigator.clipboard.readText();
    if (text) { editor.value = text; render(); status('已从剪贴板粘贴'); }
  } catch (e) {
    status('请手动 Ctrl+V 粘贴');
  }
}

function status(msg) {
  statusText.textContent = msg;
  setTimeout(() => { statusText.textContent = '就绪'; }, 2000);
}

// ── Events ──
editor.addEventListener('input', () => {
  clearTimeout(renderTimer);
  renderTimer = setTimeout(render, 200);
});

editor.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'Enter') { e.preventDefault(); render(); }
  if (e.ctrlKey && e.shiftKey && e.key === 'V') { e.preventDefault(); pasteFromClipboard(); }
});

btnPaste.addEventListener('click', pasteFromClipboard);
btnClear.addEventListener('click', () => { editor.value = ''; render(); status('已清空'); });
btnSettings.addEventListener('click', () => { window.location.href = '/settings.html'; });

// ── Tauri: auto-read clipboard when window shown ──
if (window.__TAURI__) {
  const { listen } = window.__TAURI__.event;
  listen('window-shown', () => { pasteFromClipboard(); });
}

// ── PWA: auto-read clipboard when page becomes visible ──
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && !window.__TAURI__) {
    pasteFromClipboard();
  }
});

// ── Init ──
loadLocal();

// ── Register Service Worker (PWA) ──
if ('serviceWorker' in navigator && !window.__TAURI__) {
  navigator.serviceWorker.register('/sw.js');
}

// ── Esc to hide (Tauri desktop) ──
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && window.__TAURI__) {
    const { getCurrentWindow } = window.__TAURI__.window;
    getCurrentWindow().hide();
  }
});
