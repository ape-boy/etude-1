/**
 * convertMarkdownToHtml - Markdown to HTML converter using marked library
 * Provides reliable markdown parsing with custom CSS class injection
 */
import { marked } from 'marked';

class convertMarkdownToHtml {
  constructor() {
    // Configure marked with custom renderer
    this.renderer = new marked.Renderer();
    this._setupCustomRenderer();
    
    // Configure marked options
    marked.setOptions({
      renderer: this.renderer,
      gfm: true,
      breaks: true,
      pedantic: false,
      sanitize: false,
      smartLists: true,
      smartypants: false
    });
  }

  /**
   * Setup custom renderer to inject CSS classes
   * @private
   */
  _setupCustomRenderer() {
    // Headers
    this.renderer.heading = (text, level) => {
      return `<h${level} class="markdown-h${level} markdown-heading">${text}</h${level}>`;
    };

    // Paragraphs
    this.renderer.paragraph = (text) => {
      return `<p class="markdown-paragraph">${text}</p>`;
    };

    // Lists
    this.renderer.list = (body, ordered, start) => {
      const type = ordered ? 'ol' : 'ul';
      const startAttr = (ordered && start !== 1) ? ` start="${start}"` : '';
      return `<${type} class="markdown-list"${startAttr}>${body}</${type}>`;
    };

    this.renderer.listitem = (text) => {
      return `<li class="markdown-list-item">${text}</li>`;
    };

    // Code blocks
    this.renderer.code = (code, language) => {
      const lang = language || 'code';
      const escapedCode = this._escapeHtml(code);
      return `<div class="markdown-code-block">
        <div class="code-header">
          <span class="code-lang">${lang}</span>
          <button class="copy-code-btn">Copy</button>
        </div>
        <pre>${escapedCode}</pre>
      </div>`;
    };

    // Inline code
    this.renderer.codespan = (text) => {
      return `<code class="markdown-inline-code">${text}</code>`;
    };

    // Links
    this.renderer.link = (href, title, text) => {
      const titleAttr = title ? ` title="${title}"` : '';
      return `<a href="${href}" class="markdown-link" target="_blank" rel="noopener noreferrer"${titleAttr}>${text}</a>`;
    };

    // Strong (bold)
    this.renderer.strong = (text) => {
      return `<strong class="markdown-strong">${text}</strong>`;
    };

    // Emphasis (italic)
    this.renderer.em = (text) => {
      return `<em class="markdown-em">${text}</em>`;
    };

    // Blockquotes
    this.renderer.blockquote = (quote) => {
      return `<blockquote class="markdown-blockquote">
        <p class="markdown-blockquote-p">${quote.replace(/<\/?p>/g, '')}</p>
      </blockquote>`;
    };

    // Tables
    this.renderer.table = (header, body) => {
      return `<div class="markdown-table-container">
        <table class="markdown-table">
          <thead>${header}</thead>
          <tbody>${body}</tbody>
        </table>
      </div>`;
    };

    this.renderer.tablerow = (content) => {
      return `<tr>${content}</tr>`;
    };

    this.renderer.tablecell = (content, flags) => {
      const type = flags.header ? 'th' : 'td';
      const align = flags.align ? ` style="text-align: ${flags.align};"` : '';
      return `<${type}${align}>${content}</${type}>`;
    };

    // Horizontal rules
    this.renderer.hr = () => {
      return '<hr class="markdown-hr">';
    };
  }

  /**
   * Convert markdown string to HTML
   * @param {string} mdString - Markdown string to convert
   * @returns {string} - Converted HTML string
   */
  convert(mdString) {
    if (!mdString || typeof mdString !== 'string') {
      return mdString;
    }

    try {
      // Pre-process for GitHub-style alerts
      const processedMd = this._preprocessAlerts(mdString);
      
      // Convert using marked
      let html = marked.parse(processedMd);
      
      // Post-process to fix any remaining issues
      html = this._postProcess(html);
      
      return `<div class="markdown-content">${html}</div>`;
    } catch (error) {
      console.error('Markdown conversion error:', error);
      return `<div class="markdown-content"><p class="markdown-paragraph">${this._escapeHtml(mdString)}</p></div>`;
    }
  }

  /**
   * Pre-process GitHub-style alerts
   * @private
   */
  _preprocessAlerts(mdString) {
    return mdString.replace(/^>\s*\[!(.*?)\](.*?)$/gm, (match, type, content) => {
      const alertType = type.toLowerCase();
      let classType = '';
      let iconType = '';
      
      switch (alertType) {
        case 'note': case 'info': 
          classType = 'info'; 
          iconType = 'ℹ️'; 
          break;
        case 'tip': case 'success': case 'hint':
          classType = 'success'; 
          iconType = '✅'; 
          break;
        case 'warning': case 'warn':
          classType = 'warning'; 
          iconType = '⚠️'; 
          break;
        case 'caution': case 'error': case 'danger':
          classType = 'error'; 
          iconType = '❌'; 
          break;
        case 'important':
          classType = 'warning';
          iconType = '❗';
          break;
        default: 
          classType = 'info';
          iconType = 'ℹ️';
      }
      
      return `<div class="markdown-alert markdown-alert-${classType}">
        <div class="markdown-alert-header">
          <span class="markdown-alert-icon">${iconType}</span>
          <span class="markdown-alert-title">${alertType.toUpperCase()}</span>
        </div>
        <div class="markdown-alert-content">${content.trim()}</div>
      </div>`;
    });
  }

  /**
   * Post-process HTML to fix any issues
   * @private
   */
  _postProcess(html) {
    // Remove any double-wrapped paragraphs in blockquotes
    html = html.replace(/<p class="markdown-blockquote-p"><p>/g, '<p class="markdown-blockquote-p">');
    html = html.replace(/<\/p><\/p>/g, '</p>');
    
    return html;
  }

  /**
   * Escape HTML characters
   * @private
   */
  _escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /**
   * Static method for quick conversion without instantiation
   * @param {string} mdString - Markdown string to convert
   * @returns {string} - Converted HTML string
   */
  static convert(mdString) {
    const converter = new convertMarkdownToHtml();
    return converter.convert(mdString);
  }
}

export default convertMarkdownToHtml;