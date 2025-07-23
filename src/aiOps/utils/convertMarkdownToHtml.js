/**
 * convertMarkdownToHtml - Markdown to HTML converter class
 * Provides comprehensive markdown parsing with support for:
 * - Headers, paragraphs, lists, tables
 * - Code blocks with syntax highlighting
 * - Blockquotes and alerts
 * - Inline formatting (bold, italic, links, code)
 */
class convertMarkdownToHtml {
  constructor() {
    // Class can be extended with configuration options if needed
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

    let html = '';
    const normalizedMd = mdString
      .replace(/^[ \t]+$/gm, '')
      .trim();
    const lines = normalizedMd.split('\n');
    
    // Parser state
    let inCodeBlock = false;
    let codeLang = '';
    let inTable = false;
    let tableRows = [];
    let inBlockquote = false;
    let inAlert = false;
    let alertType = '';
    let inList = false;
    let listStack = [];
    let paragraphBuffer = [];

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();
      let originalLine = lines[i];

      // Handle code blocks
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          html += '</pre></div>';
          inCodeBlock = false;
          codeLang = '';
        } else {
          codeLang = line.replace('```', '').trim();
          html += '<div class="markdown-code-block">';
          html += `<div class="code-header"><span class="code-lang">${codeLang || 'code'}</span><button class="copy-code-btn">Copy</button></div>`;
          html += '<pre>';
          inCodeBlock = true;
        }
        continue;
      }
      if (inCodeBlock) {
        html += this._escapeHtml(originalLine) + '\n';
        continue;
      }

      // Handle GitHub-style alerts
      if (line.startsWith('> [!')) {
        const match = line.match(/^> \[!(\w+)\]/);
        if (match) {
          if (inAlert) {
            html += '</div>';
          }
          alertType = match[1].toLowerCase();
          let classType = '';
          let iconType = '';
          switch (alertType) {
            case 'note': case 'info': 
              classType = 'info'; 
              iconType = 'ℹ️'; 
              break;
            case 'tip': case 'success': 
              classType = 'success'; 
              iconType = '✅'; 
              break;
            case 'warning': 
              classType = 'warning'; 
              iconType = '⚠️'; 
              break;
            case 'caution': case 'error': 
              classType = 'error'; 
              iconType = '❌'; 
              break;
            default: 
              classType = 'info';
              iconType = 'ℹ️';
          }
          html += `<div class="markdown-alert markdown-alert-${classType}">`;
          html += `<div class="markdown-alert-header">`;
          html += `<span class="markdown-alert-icon">${iconType}</span>`;
          html += `<span class="markdown-alert-title">${alertType.toUpperCase()}</span>`;
          html += `</div>`;
          
          const text = line.replace(/^> \[!\w+\]\s*/, '').trim();
          if (text) {
            html += `<div class="markdown-alert-content">${this._parseInline(text)}</div>`;
          } else {
            html += `<div class="markdown-alert-content">`;
          }
          inAlert = true;
          continue;
        }
      }
      if (inAlert && line.startsWith('> ')) {
        const text = line.replace(/^>\s*/, '').trim();
        if (text) {
          html += `${this._parseInline(text)}<br>`;
        }
        continue;
      } else if (inAlert && !line.startsWith('> ') && line.trim() !== '') {
        html += '</div></div>';
        inAlert = false;
        // Re-process the current line by not continuing
      } else if (inAlert && line.trim() === '') {
        html += '</div></div>';
        inAlert = false;
        continue;
      }

      // Handle headers
      if (line.startsWith('#')) {
        this._closeLists(html, listStack);
        const level = line.match(/^#+/)[0].length;
        const text = line.replace(/^#+\s*/, '').trim();
        html += `<h${level} class="markdown-h${level} markdown-heading">${this._parseInline(text)}</h${level}>`;
        continue;
      }

      // Handle lists
      const indentMatch = originalLine.match(/^(\s*)/);
      const indentLevel = indentMatch ? Math.floor(indentMatch[1].length / 2) : 0;
      const isUnordered = line.match(/^[-*+]\s+(.+)$/);
      const isOrdered = line.match(/^\d+\.\s+(.+)$/);
      
      if (isUnordered || isOrdered) {
        this._adjustListStack(html, listStack, indentLevel, isUnordered ? 'ul' : 'ol');
        const item = isUnordered ? isUnordered[1] : isOrdered[1];
        html += `<li class="markdown-list-item">${this._parseInline(item.trim())}</li>`;
        continue;
      } else {
        this._closeLists(html, listStack);
      }

      // Handle blockquotes
      if (line.match(/^>\s+/) && !inAlert) {
        if (!inBlockquote) {
          html += '<blockquote class="markdown-blockquote">';
          inBlockquote = true;
        }
        const text = line.replace(/^>\s*/, '').trim();
        html += `<p>${this._parseInline(text)}</p>`;
        continue;
      } else if (inBlockquote) {
        html += '</blockquote>';
        inBlockquote = false;
      }

      // Handle tables
      if (line.startsWith('|')) {
        if (!inTable) {
          inTable = true;
          tableRows = [];
        }
        tableRows.push(line);
        if (i + 1 >= lines.length || !lines[i + 1].trim().startsWith('|')) {
          html += this._processTable(tableRows);
          inTable = false;
          tableRows = [];
        }
        continue;
      }

      // Handle horizontal rules
      if (line.match(/^[-*]{3,}$/)) {
        this._closeLists(html, listStack);
        html += '<hr class="markdown-hr">';
        continue;
      }

      // Handle paragraphs
      if (line.trim()) {
        this._closeLists(html, listStack);
        const prevLineEndsWithTwoSpaces = i > 0 && lines[i-1].endsWith('  ');
        if (paragraphBuffer.length > 0 && prevLineEndsWithTwoSpaces) {
          paragraphBuffer.push('<br>' + this._parseInline(line));
        } else if (paragraphBuffer.length > 0) {
          paragraphBuffer.push(' ' + this._parseInline(line));
        } else {
          paragraphBuffer = [this._parseInline(line)];
        }
      } else {
        // Empty line - close all open blocks
        if (paragraphBuffer.length > 0) {
          html += `<p class="markdown-paragraph">${paragraphBuffer.join('')}</p>`;
          paragraphBuffer = [];
        }
        this._closeLists(html, listStack);
        if (inBlockquote) {
          html += '</blockquote>';
          inBlockquote = false;
        }
      }
    }

    // Close all remaining open elements
    this._closeAll(html, paragraphBuffer, inCodeBlock, inAlert, listStack, inBlockquote, inTable, tableRows);

    return `<div class="markdown-content">${html}</div>`;
  }

  /**
   * Close all list elements
   * @private
   */
  _closeLists(html, listStack) {
    while (listStack.length > 0) {
      html += `</${listStack.pop()}>`;
    }
  }

  /**
   * Adjust list stack for nested lists
   * @private
   */
  _adjustListStack(html, listStack, level, type) {
    while (listStack.length > level) {
      html += `</${listStack.pop()}>`;
    }
    if (listStack.length < level) {
      html += `<${type} class="markdown-list">`;
      listStack.push(type);
    } else if (listStack.length === level && listStack[listStack.length - 1] !== type) {
      html += `</${listStack.pop()}>`;
      html += `<${type} class="markdown-list">`;
      listStack.push(type);
    }
  }

  /**
   * Close all remaining open elements
   * @private
   */
  _closeAll(html, paragraphBuffer, inCodeBlock, inAlert, listStack, inBlockquote, inTable, tableRows) {
    if (paragraphBuffer.length > 0) {
      html += `<p class="markdown-paragraph">${paragraphBuffer.join('')}</p>`;
    }
    if (inCodeBlock) html += '</pre></div>';
    if (inAlert) html += '</div></div>';
    this._closeLists(html, listStack);
    if (inBlockquote) html += '</blockquote>';
    if (inTable) {
      html += this._processTable(tableRows);
    }
  }

  /**
   * Process markdown table
   * @private
   */
  _processTable(rows) {
    if (rows.length < 2) return '';

    let tableHtml = '<div class="markdown-table-container"><table class="markdown-table">';
    const headerLine = rows[0];
    const alignmentLine = rows[1];
    const dataLines = rows.slice(2);

    const headers = headerLine.split('|').map(cell => cell.trim()).slice(1, -1);
    const alignments = alignmentLine.split('|').map(cell => cell.trim()).slice(1, -1);

    tableHtml += '<thead><tr>';
    headers.forEach((header, index) => {
      const align = alignments[index] || '';
      let alignClass = '';
      if (align.startsWith(':') && align.endsWith(':')) {
        alignClass = ' style="text-align: center;"';
      } else if (align.endsWith(':')) {
        alignClass = ' style="text-align: right;"';
      } else {
        alignClass = ' style="text-align: left;"';
      }
      tableHtml += `<th${alignClass}>${this._parseInline(header)}</th>`;
    });
    tableHtml += '</tr></thead>';

    tableHtml += '<tbody>';
    dataLines.forEach(rowLine => {
      const cells = rowLine.split('|').map(cell => cell.trim()).slice(1, -1);
      tableHtml += '<tr>';
      cells.forEach((cell, index) => {
        const align = alignments[index] || '';
        let alignClass = '';
        if (align.startsWith(':') && align.endsWith(':')) {
          alignClass = ' style="text-align: center;"';
        } else if (align.endsWith(':')) {
          alignClass = ' style="text-align: right;"';
        } else {
          alignClass = ' style="text-align: left;"';
        }
        tableHtml += `<td${alignClass}>${this._parseInline(cell)}</td>`;
      });
      tableHtml += '</tr>';
    });
    tableHtml += '</tbody>';

    tableHtml += '</table></div>';
    return tableHtml;
  }

  /**
   * Parse inline markdown elements
   * @private
   */
  _parseInline(text) {
    if (!text || typeof text !== 'string') return text;
    
    let result = text;
    
    // Process in order: code (first to prevent interference), then bold, italic, links
    // 1. Inline code (protect from other formatting)
    result = result.replace(/`([^`]+)`/g, '<code class="markdown-inline-code">$1</code>');
    
    // 2. Bold text (non-greedy, no nested recursion)
    result = result.replace(/\*\*([^*]+(?:\*(?!\*)[^*]*)*)\*\*/g, '<strong class="markdown-strong">$1</strong>');
    
    // 3. Italic text (avoiding bold markers)
    result = result.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em class="markdown-em">$1</em>');
    
    // 4. Links
    result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="markdown-link" target="_blank" rel="noopener noreferrer">$1</a>');
    
    return result;
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