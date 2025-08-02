// Modern Utility Service with markdown-it integration
// Streamlined and optimized for AI ChatOps

import MarkdownRenderer from '../utils/markdownRenderer.js';

let markdownRenderer = null;

const utilService = {
  // ============================================
  // Modern Markdown Functions
  // ============================================

  getMarkdownRenderer() {
    if (!markdownRenderer) {
      markdownRenderer = MarkdownRenderer.create();
    }
    return markdownRenderer;
  },

  // Convert markdown to HTML using markdown-it
  markdownToHtml(markdown) {
    if (!markdown || typeof markdown !== 'string') return markdown;
    
    try {
      return this.getMarkdownRenderer().render(markdown);
    } catch (error) {
      console.error('Markdown conversion error:', error);
      return markdown;
    }
  },

  // ============================================
  // Content Type Detection and Processing
  // ============================================

  // Check if content is markdown format
  isMarkdown(content) {
    if (!content || typeof content !== 'string') return false;
    
    // Common markdown patterns
    const patterns = [
      /^#{1,6}\s/m,           // Headers
      /^\d+\.\s/m,            // Ordered lists  
      /^[\*\+\-]\s/m,         // Unordered lists
      /\*\*.+?\*\*/,          // Bold
      /`.+?`/,                // Inline code
      /```/,                  // Code blocks
      /^\>/m,                 // Blockquotes
      /\[.+?\]\(.+?\)/        // Links
    ];
    
    return patterns.some(pattern => pattern.test(content));
  },

  // Detect content type (html, markdown, or plain)
  detectContentType(content) {
    if (!content || typeof content !== 'string') return 'plain';
    
    // Check for markdown first (more specific)
    if (this.isMarkdown(content)) {
      return 'markdown';
    }
    
    // Then check for actual HTML tags (more restrictive)
    if (/<[a-zA-Z][^>]*>.*<\/[a-zA-Z][^>]*>/.test(content) || 
        /<[a-zA-Z][^>]*\/?>/.test(content)) {
      return 'html';
    }
    
    return 'plain';
  },

  // Format content for display
  formatContentMarkdown(content) {
    const normalized = content.replace(/\\n/g, '\n');
    const contentType = this.detectContentType(normalized);
    
    switch (contentType) {
      case 'markdown':
        return this.markdownToHtml(normalized);
      case 'html':
        return normalized;
      default:
        return normalized;
    }
  },

  // Convert HTML content to Markdown format for copying
  convertHtmlToMarkdown(content) {
    const contentType = this.detectContentType(content);
    
    switch (contentType) {
      case 'html':
        return this.htmlToMarkdown(content);
      case 'markdown':
        return content;
      case 'plain':
      default:
        return content;
    }
  },

  // ============================================
  // HTML to Text Conversion Functions
  // ============================================

  // Convert HTML content to markdown format
  htmlToMarkdown(htmlContent) {
    if (!htmlContent || typeof htmlContent !== 'string') {
      return htmlContent;
    }

    let markdown = htmlContent;

    markdown = markdown.replace(/<div class="markdown-table-container">(.*?)<\/div>/gs, (match, tableContent) => {
      const tableMatch = tableContent.match(/<table[^>]*class="markdown-table"[^>]*>(.*?)<\/table>/s);
      if (!tableMatch) return '';
      
      const table = tableMatch[1];
      let result = '\n';
      
      const headerMatch = table.match(/<thead>(.*?)<\/thead>/s);
      if (headerMatch) {
        const headers = headerMatch[1].match(/<th[^>]*>(.*?)<\/th>/gs);
        if (headers) {
          const headerText = headers.map(h => this.stripHtml(h.replace(/<th[^>]*>|<\/th>/g, '')).trim()).join(' | ');
          result += `| ${headerText} |\n`;
          result += `| ${headers.map(() => '---').join(' | ')} |\n`;
        }
      }
      
      const bodyMatch = table.match(/<tbody>(.*?)<\/tbody>/s);
      if (bodyMatch) {
        const rows = bodyMatch[1].match(/<tr[^>]*>(.*?)<\/tr>/gs);
        if (rows) {
          rows.forEach(row => {
            const cells = row.match(/<td[^>]*>(.*?)<\/td>/gs);
            if (cells) {
              const cellText = cells.map(c => this.stripHtml(c.replace(/<td[^>]*>|<\/td>/g, '')).trim()).join(' | ');
              result += `| ${cellText} |\n`;
            }
          });
        }
      }
      
      return result + '\n';
    });

    markdown = markdown.replace(/<h([1-6])[^>]*class="markdown-heading[^"]*"[^>]*>(.*?)<\/h[1-6]>/gs, (match, level, content) => {
      const text = this.stripHtml(content).trim();
      return '\n' + '#'.repeat(parseInt(level)) + ' ' + text + '\n\n';
    });

    markdown = markdown.replace(/<p[^>]*class="markdown-paragraph"[^>]*>(.*?)<\/p>/gs, (match, content) => {
      return this.stripHtml(content).trim() + '\n\n';
    });

    markdown = markdown.replace(/<strong[^>]*class="markdown-strong"[^>]*>(.*?)<\/strong>/gs, (match, content) => {
      return '**' + this.stripHtml(content).trim() + '**';
    });

    markdown = markdown.replace(/<code[^>]*class="markdown-inline-code"[^>]*>(.*?)<\/code>/gs, (match, content) => {
      return '`' + this.stripHtml(content).trim() + '`';
    });

    markdown = markdown.replace(/<div[^>]*class="markdown-code-block"[^>]*>(.*?)<\/div>/gs, (match, content) => {
      const langMatch = content.match(/<div[^>]*class="language-label"[^>]*>(.*?)<\/div>/);
      const codeMatch = content.match(/<pre><code>(.*?)<\/code><\/pre>/s);
      
      if (codeMatch) {
        const language = langMatch ? this.stripHtml(langMatch[1]).trim() : '';
        const code = this.stripHtml(codeMatch[1]);
        return '\n```' + language + '\n' + code + '\n```\n\n';
      }
      return '';
    });

    markdown = markdown.replace(/<ul[^>]*class="markdown-list"[^>]*>(.*?)<\/ul>/gs, (match, content) => {
      const items = content.match(/<li[^>]*class="markdown-list-item"[^>]*>(.*?)<\/li>/gs);
      if (items) {
        return '\n' + items.map(item => {
          const text = this.stripHtml(item.replace(/<li[^>]*>|<\/li>/g, '')).trim();
          return '- ' + text;
        }).join('\n') + '\n\n';
      }
      return '';
    });

    markdown = markdown.replace(/<div[^>]*class="markdown-alert[^"]*"[^>]*>(.*?)<\/div>/gs, (match, content) => {
      const text = this.stripHtml(content).replace(/^[^\w]*/, '').trim();
      return '\n> ' + text + '\n\n';
    });

    markdown = this.stripHtml(markdown);
    markdown = markdown.replace(/\n{3,}/g, '\n\n').trim();

    return markdown;
  },

  // Convert HTML content to plain text
  htmlToPlainText(htmlContent) {
    if (!htmlContent || typeof htmlContent !== 'string') {
      return htmlContent;
    }

    let text = htmlContent;

    text = text.replace(/<div class="markdown-table-container">(.*?)<\/div>/gs, (match, tableContent) => {
      const tableMatch = tableContent.match(/<table[^>]*>(.*?)<\/table>/s);
      if (!tableMatch) return '';
      
      const table = tableMatch[1];
      let result = '\n';
      
      const headerMatch = table.match(/<thead>(.*?)<\/thead>/s);
      if (headerMatch) {
        const headers = headerMatch[1].match(/<th[^>]*>(.*?)<\/th>/gs);
        if (headers) {
          result += headers.map(h => this.stripHtml(h.replace(/<th[^>]*>|<\/th>/g, '')).trim()).join('\t') + '\n';
        }
      }
      
      const bodyMatch = table.match(/<tbody>(.*?)<\/tbody>/s);
      if (bodyMatch) {
        const rows = bodyMatch[1].match(/<tr[^>]*>(.*?)<\/tr>/gs);
        if (rows) {
          rows.forEach(row => {
            const cells = row.match(/<td[^>]*>(.*?)<\/td>/gs);
            if (cells) {
              result += cells.map(c => this.stripHtml(c.replace(/<td[^>]*>|<\/td>/g, '')).trim()).join('\t') + '\n';
            }
          });
        }
      }
      
      return result;
    });

    text = text.replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gs, (match, content) => {
      return '\n' + this.stripHtml(content).trim() + '\n';
    });

    text = text.replace(/<p[^>]*>(.*?)<\/p>/gs, (match, content) => {
      return this.stripHtml(content).trim() + '\n';
    });

    text = text.replace(/<li[^>]*>(.*?)<\/li>/gs, (match, content) => {
      return '• ' + this.stripHtml(content).trim() + '\n';
    });

    text = text.replace(/<pre><code>(.*?)<\/code><\/pre>/gs, (match, content) => {
      return '\n' + this.stripHtml(content) + '\n';
    });

    text = this.stripHtml(text);
    text = text.replace(/\n{3,}/g, '\n\n').trim();

    return text;
  },

  stripHtml(html) {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '');
  },

  // ============================================
  // Data Conversion and Processing Functions
  // ============================================

  convertConversationsToMessages(conversations) {
    const messages = [];
    
    if (!Array.isArray(conversations)) {
      return messages;
    }

    conversations.forEach((conv, index) => {
      const userContent = conv.userQuery;
      if (userContent) {
        messages.push({
          id: `user-${index}-${Date.now()}`,
          type: 'user',
          content: userContent,
          timestamp: new Date(conv.createdDate || Date.now()).getTime(),
          isLoading: false
        });
      }

      const aiContent = conv.aiResponse || conv.aiQuery;
      if (aiContent) {
        messages.push({
          id: `ai-${index}-${Date.now()}`,
          type: 'ai',
          content: aiContent,
          timestamp: new Date(conv.createdDate || Date.now()).getTime() + 1,
          isLoading: false,
          conversationId: conv.conversationId || conv.id
        });
      }
    });

    return messages.sort((a, b) => a.timestamp - b.timestamp);
  },

  // Parse raw data into quick questions array
  parseQuickQuestions(rawData) {
    if (!rawData) return [];
    
    try {
      if (typeof rawData === 'string') {
        const cleanData = rawData.trim();
        
        // Try parsing JSON array format
        const jsonMatch = cleanData.match(/\[\s*"[^"]*"(?:\s*,\s*"[^"]*")*\s*\]/);
        if (jsonMatch) {
          const questions = JSON.parse(jsonMatch[0]);
          return Array.isArray(questions) ? questions.filter(q => q && q.trim()).slice(0, 5) : [];
        }
        
        // Parse line by line
        return cleanData.split(/\r?\n/)
          .map(line => line.trim())
          .filter(line => line && !line.match(/^[\[\]\r\n\s\-\*]*$/))
          .map(line => line.replace(/^[0-9]+\.?\s*/, '').replace(/^["'\-\*•]\s*|["'\-\*•]\s*$/g, ''))
          .filter(line => line.length > 5)
          .slice(0, 5);
      }
      
      // Handle array data
      if (Array.isArray(rawData)) {
        return rawData.filter(q => q && q.trim() && q.trim().length > 5).slice(0, 5);
      }
      
      // Handle object data
      if (rawData && typeof rawData === 'object') {
        const questions = rawData.questions || rawData.queries || rawData.data || [];
        return Array.isArray(questions) ? questions.filter(q => q && q.trim()).slice(0, 5) : [];
      }
      
      return [];
    } catch (error) {
      return [];
    }
  },


  // ============================================
  // Persona and Icon Management Functions
  // ============================================

  getPersonaIcon(personaCode, iconPath) {
    return this.getRandomPersonaIcon(personaCode);
  },

  getRandomPersonaIcon(personaCode) {
    const availableIcons = [
      'robot', 'brain', 'cpu', 'database', 'shield', 'terminal', 'code',
      'compass', 'briefcase', 'target', 'lightbulb', 'award', 'gem', 'rocket',
      'users', 'user', 'mail', 'phone', 'message-circle', 'heart',
      'palette', 'camera', 'music', 'book', 'edit', 'sparkles',
      'settings', 'home', 'star', 'info', 'wrench', 'grid'
    ];
    
    const seed = this.hashCode(personaCode || 'default');
    const index = Math.abs(seed) % availableIcons.length;
    
    return availableIcons[index];
  },

  hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash;
  },

};

export default utilService;