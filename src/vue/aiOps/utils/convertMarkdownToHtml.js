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
    // Headers with enhanced styling
    this.renderer.heading = (text, level) => {
      return `<h${level} class="markdown-h${level} markdown-heading">${text}</h${level}>`;
    };

    // Paragraphs with proper spacing
    this.renderer.paragraph = (text) => {
      // Avoid wrapping list items in paragraphs
      if (text.includes('<li') || text.includes('</li>')) {
        return text;
      }
      return `<p class="markdown-paragraph">${text}</p>`;
    };

    // Enhanced Lists with proper CSS classes
    this.renderer.list = (body, ordered, start) => {
      const type = ordered ? 'ol' : 'ul';
      const startAttr = (ordered && start !== 1) ? ` start="${start}"` : '';
      // Remove any paragraph wrapping from list items
      const cleanBody = body.replace(/<p class="markdown-paragraph">([^<]*)<\/p>/g, '$1');
      return `<${type} class="markdown-list"${startAttr}>${cleanBody}</${type}>`;
    };

    this.renderer.listitem = (text, task, checked) => {
      // Clean up any unwanted paragraph wrapping
      const cleanText = text.replace(/<p class="markdown-paragraph">([^<]*)<\/p>/g, '$1');
      
      // Handle task lists if present
      if (task) {
        const checkedAttr = checked ? ' checked' : '';
        return `<li class="markdown-list-item markdown-task-item">
          <input type="checkbox" disabled${checkedAttr}> ${cleanText}
        </li>`;
      }
      
      return `<li class="markdown-list-item">${cleanText}</li>`;
    };

    // Enhanced Code blocks with better styling
    this.renderer.code = (code, language) => {
      const lang = language || 'code';
      const escapedCode = this._escapeHtml(code);
      return `<div class="markdown-code-block">
        <div class="code-header">
          <span class="code-lang">${lang}</span>
          <button class="copy-code-btn" onclick="this.textContent='Copied!'; setTimeout(() => this.textContent='Copy', 2000); navigator.clipboard.writeText(\`${escapedCode.replace(/`/g, '\\`')}\`)">Copy</button>
        </div>
        <pre>${escapedCode}</pre>
      </div>`;
    };

    // Enhanced Inline code with theme styling
    this.renderer.codespan = (text) => {
      return `<code class="markdown-inline-code">${text}</code>`;
    };

    // Enhanced Links with hover effects
    this.renderer.link = (href, title, text) => {
      const titleAttr = title ? ` title="${title}"` : '';
      return `<a href="${href}" class="markdown-link" target="_blank" rel="noopener noreferrer"${titleAttr}>${text}</a>`;
    };

    // Enhanced Strong (bold) styling
    this.renderer.strong = (text) => {
      return `<strong class="markdown-strong">${text}</strong>`;
    };

    // Enhanced Emphasis (italic) styling  
    this.renderer.em = (text) => {
      return `<em class="markdown-em">${text}</em>`;
    };

    // Enhanced Blockquotes with better formatting
    this.renderer.blockquote = (quote) => {
      // Clean up any paragraph wrapping and apply blockquote styling
      const cleanQuote = quote.replace(/<p class="markdown-paragraph">/g, '').replace(/<\/p>/g, '<br>');
      return `<blockquote class="markdown-blockquote">
        <p class="markdown-blockquote-p">${cleanQuote.replace(/<br>$/, '')}</p>
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