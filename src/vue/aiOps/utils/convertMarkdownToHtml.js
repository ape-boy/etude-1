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

      // Handle GitHub-style alerts (improved pattern matching)
      if (line.match(/^>\s*\[!/)) {
        const match = line.match(/^>\s*\[!(\w+)\](.*)$/);
        if (match) {
          if (inAlert) {
            html += '</div></div>';
          }
          alertType = match[1].toLowerCase();
          const remainingText = match[2].trim();
          
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
          
          html += `<div class="markdown-alert markdown-alert-${classType}">`;
          html += `<div class="markdown-alert-header">`;
          html += `<span class="markdown-alert-icon">${iconType}</span>`;
          html += `<span class="markdown-alert-title">${alertType.toUpperCase()}</span>`;
          html += `</div>`;
          html += `<div class="markdown-alert-content">`;
          
          if (remainingText) {
            html += this._parseInline(remainingText);
          }
          
          inAlert = true;
          continue;
        }
      }
      if (inAlert && line.match(/^>\s/)) {
        const text = line.replace(/^>\s*/, '').trim();
        if (text) {
          html += `${this._parseInline(text)}<br>`;
        }
        continue;
      } else if (inAlert && (!line.startsWith('>') || line.trim() === '')) {
        html += '</div></div>';
        inAlert = false;
        alertType = '';
        if (line.trim() === '') {
          continue;
        }
        // Re-process the current line by not continuing
      }

      // Handle headers
      if (line.startsWith('#')) {
        html += this._closeLists(listStack);
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
        html += this._adjustListStack(listStack, indentLevel, isUnordered ? 'ul' : 'ol');
        const item = isUnordered ? isUnordered[1] : isOrdered[1];
        html += `<li class="markdown-list-item">${this._parseInline(item.trim())}</li>`;
        continue;
      } else {
        html += this._closeLists(listStack);
      }

      // Handle blockquotes (only if not in alert)
      if (line.match(/^>\s/) && !inAlert && !line.match(/^>\s*\[!/)) {
        if (!inBlockquote) {
          html += '<blockquote class="markdown-blockquote">';
          inBlockquote = true;
        }
        const text = line.replace(/^>\s*/, '').trim();
        if (text) {
          html += `<p class="markdown-blockquote-p">${this._parseInline(text)}</p>`;
        }
        continue;
      } else if (inBlockquote && !line.match(/^>\s/)) {
        html += '</blockquote>';
        inBlockquote = false;
        if (line.trim() === '') {
          continue;
        }
        // Re-process the current line by not continuing
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
        html += this._closeLists(listStack);
        html += '<hr class="markdown-hr">';
        continue;
      }

      // Handle paragraphs
      if (line.trim()) {
        html += this._closeLists(listStack);
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
        html += this._closeLists(listStack);
        if (inBlockquote) {
          html += '</blockquote>';
          inBlockquote = false;
        }
      }
    }

    // Close all remaining open elements
    html += this._closeAll(paragraphBuffer, inCodeBlock, inAlert, listStack, inBlockquote, inTable, tableRows);

    return `<div class="markdown-content">${html}</div>`;
  }

  /**
   * Close all list elements
   * @private
   */
  _closeLists(listStack) {
    let closingHtml = '';
    while (listStack.length > 0) {
      closingHtml += `</${listStack.pop()}>`;
    }
    return closingHtml;
  }

  /**
   * Adjust list stack for nested lists
   * @private
   */
  _adjustListStack(listStack, level, type) {
    let adjustHtml = '';
    
    while (listStack.length > level) {
      adjustHtml += `</${listStack.pop()}>`;
    }
    
    if (listStack.length < level) {
      adjustHtml += `<${type} class="markdown-list">`;
      listStack.push(type);
    } else if (listStack.length === level && listStack[listStack.length - 1] !== type) {
      adjustHtml += `</${listStack.pop()}>`;
      adjustHtml += `<${type} class="markdown-list">`;
      listStack.push(type);
    }
    
    return adjustHtml;
  }

  /**
   * Close all remaining open elements
   * @private
   */
  _closeAll(paragraphBuffer, inCodeBlock, inAlert, listStack, inBlockquote, inTable, tableRows) {
    let closingHtml = '';
    
    if (paragraphBuffer.length > 0) {
      closingHtml += `<p class="markdown-paragraph">${paragraphBuffer.join('')}</p>`;
      paragraphBuffer.length = 0; // Clear the buffer
    }
    if (inCodeBlock) closingHtml += '</pre></div>';
    if (inAlert) closingHtml += '</div></div>';
    closingHtml += this._closeLists(listStack);
    if (inBlockquote) closingHtml += '</blockquote>';
    if (inTable) {
      closingHtml += this._processTable(tableRows);
    }
    
    return closingHtml;
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