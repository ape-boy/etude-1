import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';

class MarkdownRenderer {
  constructor() {
    this.md = new MarkdownIt({
      html: true,
      breaks: true,
      linkify: true,
      typographer: true,
      highlight: this.highlightCode.bind(this)
    });

    this.setupCustomRules();
    this.setupAlerts();
  }

  highlightCode(str, lang) {
    const language = lang || 'text';
    const rawCode = str;
    
    if (lang && hljs.getLanguage(lang)) {
      try {
        const highlighted = hljs.highlight(str, { language: lang }).value;
        return `<div class="md-code-block">
          <div class="code-header">
            <span class="code-lang">${language}</span>
            <button class="copy-code-btn" onclick="copyCodeToClipboard(this)">Copy</button>
          </div>
          <pre class="hljs hljs-dark"><code class="language-${lang}">${highlighted}</code><span class="raw-code" style="display: none;">${this.escapeHtml(rawCode)}</span></pre>
        </div>`;
      } catch (err) {
      }
    }
    
    return `<div class="md-code-block">
      <div class="code-header">
        <span class="code-lang">${language}</span>
        <button class="copy-code-btn" onclick="copyCodeToClipboard(this)">Copy</button>
      </div>
      <pre class="hljs hljs-dark"><code>${this.escapeHtml(rawCode)}</code><span class="raw-code" style="display: none;">${this.escapeHtml(rawCode)}</span></pre>
    </div>`;
  }

  setupCustomRules() {
    this.md.renderer.rules.heading_open = (tokens, idx) => {
      const level = tokens[idx].markup.length;
      return `<h${level} class="md-heading md-h${level}">`;
    };

    this.md.renderer.rules.heading_close = (tokens, idx) => {
      const level = tokens[idx].markup.length;
      return `</h${level}>`;
    };

    this.md.renderer.rules.paragraph_open = () => '<p class="md-paragraph">';
    this.md.renderer.rules.paragraph_close = () => '</p>';

    this.md.renderer.rules.bullet_list_open = () => '<ul class="md-list md-list-unordered">';
    this.md.renderer.rules.bullet_list_close = () => '</ul>';
    
    this.md.renderer.rules.ordered_list_open = (tokens, idx) => {
      const start = tokens[idx].attrGet('start');
      const startAttr = start ? ` start="${start}"` : '';
      return `<ol class="md-list md-list-ordered"${startAttr}>`;
    };
    this.md.renderer.rules.ordered_list_close = () => '</ol>';

    this.md.renderer.rules.list_item_open = () => '<li class="md-list-item">';
    this.md.renderer.rules.list_item_close = () => '</li>';

    this.md.renderer.rules.blockquote_open = () => '<blockquote class="md-blockquote">';
    this.md.renderer.rules.blockquote_close = () => '</blockquote>';

    this.md.renderer.rules.table_open = () => '<div class="md-table-container"><table class="md-table">';
    this.md.renderer.rules.table_close = () => '</table></div>';
    this.md.renderer.rules.thead_open = () => '<thead class="md-table-head">';
    this.md.renderer.rules.thead_close = () => '</thead>';
    this.md.renderer.rules.tbody_open = () => '<tbody class="md-table-body">';
    this.md.renderer.rules.tbody_close = () => '</tbody>';
    this.md.renderer.rules.tr_open = () => '<tr class="md-table-row">';
    this.md.renderer.rules.tr_close = () => '</tr>';
    this.md.renderer.rules.th_open = () => '<th class="md-table-header">';
    this.md.renderer.rules.th_close = () => '</th>';
    this.md.renderer.rules.td_open = () => '<td class="md-table-cell">';
    this.md.renderer.rules.td_close = () => '</td>';

    this.md.renderer.rules.strong_open = () => '<strong class="md-strong">';
    this.md.renderer.rules.strong_close = () => '</strong>';
    this.md.renderer.rules.em_open = () => '<em class="md-em">';
    this.md.renderer.rules.em_close = () => '</em>';
    this.md.renderer.rules.code_inline = (tokens, idx) => {
      return `<code class="md-code-inline">${this.escapeHtml(tokens[idx].content)}</code>`;
    };

    const defaultLinkRenderer = this.md.renderer.rules.link_open || 
      ((tokens, idx, options, env, renderer) => renderer.renderToken(tokens, idx, options));
    
    this.md.renderer.rules.link_open = (tokens, idx, options, env, renderer) => {
      tokens[idx].attrSet('class', 'md-link');
      tokens[idx].attrSet('target', '_blank');
      tokens[idx].attrSet('rel', 'noopener noreferrer');
      return defaultLinkRenderer(tokens, idx, options, env, renderer);
    };

    this.md.renderer.rules.hr = () => '<hr class="md-hr">';
  }

  setupAlerts() {
    this.md.use((md) => {
      const alertRegex = /^>\s*\[!(NOTE|TIP|INFO|WARNING|CAUTION|IMPORTANT)\]\s*(.*?)$/i;
      
      md.block.ruler.before('blockquote', 'alert', (state, start, end, silent) => {
        const pos = state.bMarks[start] + state.tShift[start];
        const max = state.eMarks[start];
        const line = state.src.slice(pos, max);
        
        const match = line.match(alertRegex);
        if (!match) return false;
        
        if (silent) return true;
        
        const [, type, content] = match;
        const alertType = type.toLowerCase();
        const alertConfig = this.getAlertConfig(alertType);
        
        const token = state.push('alert', 'div', 1);
        token.attrSet('class', `md-alert md-alert-${alertConfig.class}`);
        token.markup = '>';
        
        const headerToken = state.push('alert_header', 'div', 1);
        headerToken.attrSet('class', 'md-alert-header');
        
        const iconToken = state.push('alert_icon', 'span', 1);
        iconToken.attrSet('class', 'md-alert-icon');
        iconToken.content = alertConfig.icon;
        state.push('alert_icon', 'span', -1);
        
        const titleToken = state.push('alert_title', 'span', 1);
        titleToken.attrSet('class', 'md-alert-title');
        titleToken.content = alertType.toUpperCase();
        state.push('alert_title', 'span', -1);
        
        state.push('alert_header', 'div', -1);
        
        if (content.trim()) {
          const contentToken = state.push('alert_content', 'div', 1);
          contentToken.attrSet('class', 'md-alert-content');
          contentToken.content = content.trim();
          state.push('alert_content', 'div', -1);
        }
        
        state.push('alert', 'div', -1);
        state.line = start + 1;
        return true;
      });

      md.renderer.rules.alert = (tokens, idx) => {
        const token = tokens[idx];
        if (token.nesting === 1) {
          return `<div${md.renderer.renderAttrs(token)}>`;
        } else {
          return '</div>';
        }
      };

      ['alert_header', 'alert_content'].forEach(type => {
        md.renderer.rules[type] = (tokens, idx) => {
          const token = tokens[idx];
          if (token.nesting === 1) {
            return `<div${md.renderer.renderAttrs(token)}>`;
          } else {
            return '</div>';
          }
        };
      });

      ['alert_icon', 'alert_title'].forEach(type => {
        md.renderer.rules[type] = (tokens, idx) => {
          const token = tokens[idx];
          if (token.nesting === 1) {
            return `<span${md.renderer.renderAttrs(token)}>${token.content || ''}`;
          } else {
            return '</span>';
          }
        };
      });
    });
  }

  getAlertConfig(type) {
    const configs = {
      note: { class: 'info', icon: 'ℹ️' },
      info: { class: 'info', icon: 'ℹ️' },
      tip: { class: 'success', icon: '✅' },
      warning: { class: 'warning', icon: '⚠️' },
      caution: { class: 'error', icon: '❌' },
      important: { class: 'warning', icon: '❗' }
    };
    return configs[type] || configs.info;
  }

  render(markdown) {
    if (!markdown || typeof markdown !== 'string') {
      return markdown || '';
    }

    try {
      const normalized = markdown
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .trim();

      const html = this.md.render(normalized);
      return `<div class="markdown-content">${html}</div>`;
    } catch (error) {
      return `<div class="markdown-content"><p class="md-paragraph">${this.escapeHtml(markdown)}</p></div>`;
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  static create() {
    return new MarkdownRenderer();
  }

  static render(markdown) {
    if (!this._instance) {
      this._instance = new MarkdownRenderer();
    }
    return this._instance.render(markdown);
  }
}

export default MarkdownRenderer;