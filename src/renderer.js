import { marked } from 'marked';
import hljs from 'highlight.js';

// Configure marked v15+
marked.setOptions({
  gfm: true,
  breaks: true,
});

marked.use({
  renderer: {
    code({ text, lang }) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      const highlighted = hljs.highlight(text, { language }).value;
      return `<pre><code class="hljs language-${language}">${highlighted}</code></pre>`;
    },
  },
});

/**
 * Render Markdown string to HTML
 * @param {string} md - Raw markdown text
 * @returns {string} HTML string
 */
export function renderMarkdown(md) {
  try {
    return marked.parse(md);
  } catch (e) {
    return `<p class="error">渲染错误: ${e.message}</p>`;
  }
}
