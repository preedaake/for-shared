/**
 * Word to MD - Client Application
 * Uses mammoth.js for DOCX parsing and turndown for HTML→Markdown
 */

// DOM Elements
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const resultSection = document.getElementById('result-section');
const filenameEl = document.getElementById('filename');
const markdownOutput = document.getElementById('markdown-output');
const loading = document.getElementById('loading');
const clearBtn = document.getElementById('clear-btn');
const copyBtn = document.getElementById('copy-btn');
const downloadBtn = document.getElementById('download-btn');

// Current file data
let currentFile = null;
let currentMarkdown = '';

// Initialize
document.addEventListener('DOMContentLoaded', init);

function init() {
  setupDropZone();
  setupFileInput();
  setupButtons();
}

// Drop Zone Handling
function setupDropZone() {
  // Click to upload
  dropZone.addEventListener('click', () => fileInput.click());

  // Prevent default drag behaviors
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults);
    document.body.addEventListener(eventName, preventDefaults);
  });

  // Visual feedback
  ['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => dropZone.classList.add('drag-over'));
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => dropZone.classList.remove('drag-over'));
  });

  // Handle dropped files
  dropZone.addEventListener('drop', handleDrop);
}

function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

function handleDrop(e) {
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    handleFile(files[0]);
  }
}

// File Input Handling
function setupFileInput() {
  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  });
}

// Button Handlers
function setupButtons() {
  clearBtn.addEventListener('click', clearResult);
  copyBtn.addEventListener('click', copyToClipboard);
  downloadBtn.addEventListener('click', downloadMarkdown);
}

// Main File Handler
async function handleFile(file) {
  const validExtensions = ['.docx', '.doc'];
  const ext = '.' + file.name.split('.').pop().toLowerCase();

  if (!validExtensions.includes(ext)) {
    showToast('กรุณาอัปโหลดไฟล์ .docx หรือ .doc เท่านั้น', 'error');
    return;
  }

  // Show loading
  loading.classList.remove('hidden');
  resultSection.classList.add('hidden');

  try {
    const arrayBuffer = await readFileAsArrayBuffer(file);
    const markdown = await convertToMarkdown(arrayBuffer);

    currentFile = file;
    currentMarkdown = markdown;

    // Display result
    filenameEl.textContent = file.name;
    markdownOutput.value = markdown;

    loading.classList.add('hidden');
    resultSection.classList.remove('hidden');

    showToast('แปลงไฟล์สำเร็จ!', 'success');
  } catch (error) {
    console.error('Conversion error:', error);
    loading.classList.add('hidden');
    showToast('เกิดข้อผิดพลาดในการแปลงไฟล์: ' + error.message, 'error');
  }
}

// File Reading
function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(new Error('อ่านไฟล์ไม่สำเร็จ'));
    reader.readAsArrayBuffer(file);
  });
}

// Convert DOCX to Markdown using mammoth.js
async function convertToMarkdown(arrayBuffer) {
  // Use mammoth.js to convert DOCX → raw text (preserves structure better)
  const result = await mammoth.convertToHtml({ arrayBuffer }, {
    styleMap: [
      "p[style-name:'Heading 1'] => h1:fresh",
      "p[style-name:'Heading 2'] => h2:fresh",
      "p[style-name:'Heading 3'] => h3:fresh",
      "p[style-name:'Heading 4'] => h4:fresh",
      "p[style-name:'Heading 5'] => h5:fresh",
      "p[style-name:'Heading 6'] => h6:fresh",
      "b => strong",
      "i => em"
    ],
    includeEmbeddedStyles: false,
    includeDefaultOptions: false
  });

  let html = result.value;

  // Pre-process HTML to preserve structure
  // Fix tables - wrap in proper markdown table format
  html = html.replace(/<table>/gi, '<table class="md-table">');
  html = html.replace(/<\/table>/gi, '</table>');

  // Clean up but preserve段落 spacing
  html = html.replace(/\n\n\n+/g, '\n\n');  // Max 2 newlines
  html = html.replace(/<p>\s*<\/p>/gi, '<p class="empty-paragraph"></p>');

  // Use simplified conversion - extract text directly from DOCX
  // This preserves original paragraph breaks better
  let markdown = '';

  // Create a temporary div to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  function processNode(node, inList = false, listType = '') {
    let result = '';

    if (node.nodeType === Node.TEXT_NODE) {
      var text = node.textContent.trim();
      return text ? text + ' ' : '';
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const tag = node.nodeName.toLowerCase();
      const children = Array.from(node.childNodes);

      switch(tag) {
        case 'h1':
          return '\n\n# ' + getTextContent(node) + '\n\n';
        case 'h2':
          return '\n\n## ' + getTextContent(node) + '\n\n';
        case 'h3':
          return '\n\n### ' + getTextContent(node) + '\n\n';
        case 'h4':
          return '\n\n#### ' + getTextContent(node) + '\n\n';
        case 'h5':
          return '\n\n##### ' + getTextContent(node) + '\n\n';
        case 'h6':
          return '\n\n###### ' + getTextContent(node) + '\n\n';
        case 'p':
          const content = getTextContent(node);
          if (node.classList.contains('empty-paragraph') || !content.trim()) {
            return '\n';
          }
          return '\n' + content + '\n';
        case 'br':
          return '  \n';
        case 'ul':
          return '\n' + children.map(c => processNode(c, true, 'ul')).join('');
        case 'ol':
          return '\n' + children.map((c, i) => processNode(c, true, 'ol')).join('');
        case 'li':
          const prefix = listType === 'ol' ? (Array.from(node.parentNode.children).indexOf(node) + 1) + '. ' : '- ';
          const itemContent = getTextContent(node);
          return prefix + itemContent + '\n';
        case 'table':
          return '\n' + convertTableToMarkdown(node) + '\n';
        case 'tr':
          return '|' + children.map(c => getTextContent(c)).join('|') + '|\n';
        case 'th':
          return getTextContent(node);
        case 'td':
          return getTextContent(node);
        case 'strong':
        case 'b':
          return '**' + getTextContent(node) + '**';
        case 'em':
        case 'i':
          return '*' + getTextContent(node) + '*';
        case 'del':
          return '~~' + getTextContent(node) + '~~';
        case 'code':
          return '`' + getTextContent(node) + '`';
        case 'pre':
          return '\n```\n' + getTextContent(node) + '\n```\n';
        case 'blockquote':
          const quote = getTextContent(node);
          return quote.split('\n').map(l => '> ' + l).join('\n') + '\n';
        case 'hr':
          return '\n---\n';
        case 'a':
          const href = node.getAttribute('href') || '';
          const text = getTextContent(node);
          return '[' + text + '](' + href + ')';
        case 'img':
          const src = node.getAttribute('src') || '';
          const alt = node.getAttribute('alt') || '';
          return '![' + alt + '](' + src + ')';
        default:
          return children.map(c => processNode(c, inList, listType)).join('');
      }
    }
    return '';
  }

  function getTextContent(node) {
    let result = '';
    node.childNodes.forEach(child => {
      if (child.nodeType === Node.TEXT_NODE) {
        result += child.textContent;
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const tag = child.nodeName.toLowerCase();
        if (tag === 'b' || tag === 'strong') {
          result += '**' + getTextContent(child) + '**';
        } else if (tag === 'i' || tag === 'em') {
          result += '*' + getTextContent(child) + '*';
        } else if (tag === 'br') {
          result += '  \n';
        } else if (tag === 'a') {
          const href = child.getAttribute('href') || '';
          result += '[' + getTextContent(child) + '](' + href + ')';
        } else if (tag === 'img') {
          const src = child.getAttribute('src') || '';
          const alt = child.getAttribute('alt') || '';
          result += '![' + alt + '](' + src + ')';
        } else {
          result += getTextContent(child);
        }
      }
    });
    return result.replace(/\s+/g, ' ').trim();
  }

  function convertTableToMarkdown(table) {
    const rows = table.querySelectorAll('tr');
    if (rows.length === 0) return '';

    let md = '';
    rows.forEach((row, rowIndex) => {
      const cells = row.querySelectorAll('th, td');
      let rowText = '|';

      cells.forEach(cell => {
        const colspan = parseInt(cell.getAttribute('colspan')) || 1;
        const text = getTextContent(cell).trim();
        rowText += ' ' + text + ' |'.repeat(colspan);
      });

      md += rowText + '\n';

      // Add separator after header row
      if (rowIndex === 0 && rows.length > 1) {
        const cols = rows[0].querySelectorAll('th, td').length;
        md += '|' + Array(cols).fill(' --- ').join('|') + '|\n';
      }
    });

    return md;
  }

  // Process all children
  tempDiv.childNodes.forEach(child => {
    markdown += processNode(child);
  });

  // Post-process: normalize line breaks
  markdown = markdown.replace(/\n{4,}/g, '\n\n\n');
  markdown = markdown.replace(/^\n+/, '');
  markdown = markdown.replace(/\n+$/, '');
  markdown = markdown.trim();

  return markdown;
}

// Clear Result
function clearResult() {
  currentFile = null;
  currentMarkdown = '';
  fileInput.value = '';
  resultSection.classList.add('hidden');
}

// Copy to Clipboard
async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(currentMarkdown);
    showToast('คัดลอกไปยังคลิปบอร์ดแล้ว!', 'success');
  } catch (error) {
    showToast('คัดลอกไม่สำเร็จ', 'error');
  }
}

// Download Markdown
function downloadMarkdown() {
  if (!currentFile || !currentMarkdown) return;

  const baseName = currentFile.name.replace(/\.(docx|doc)$/i, '');
  const filename = baseName + '.md';

  const blob = new Blob([currentMarkdown], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast('ดาวน์โหลด ' + filename + ' สำเร็จ!', 'success');
}

// Toast Notification
function showToast(message, type = 'default') {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.className = 'toast show ' + type;

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

/* ============================================
 * TurndownService - HTML to Markdown Converter
 * Based on: https://github.com/domchristie/turndown
 * ============================================ */

(function(root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.TurndownService = factory();
  }
}(this, function() {

  var turndownService = function(options) {
    if (!(this instanceof turndownService)) return new turndownService(options);

    var defaults = {
      headingStyle: 'setext',
      codeBlockStyle: 'fenced',
      bulletListMarker: '*',
      emDelimiter: '*',
      strongDelimiter: '**',
      linkStyle: 'inlined',
      maxBlankLines: 3
    };

    this.options = Object.assign({}, defaults, options);
    this.rules = [];

    // Add default rules
    this.addRule('paragraph', {
      filter: 'p',
      replacement: function(content) {
        return '\n' + content + '\n';
      }
    });

    this.addRule('heading', {
      filter: function(node) {
        return /^h[1-6]$/.test(node.nodeName);
      },
      replacement: function(content, node) {
        var style = turndownService.prototype.options.headingStyle;
        var anchor = node.id ? ' {#' + node.id + '}' : '';

        if (style === 'setext') {
          var level = parseInt(node.nodeName.charAt(1));
          var underline = level < 3 ? '=' : '-';
          var repeat = Math.max(0, 80 - content.length);
          return '\n\n' + content + anchor + '\n' + underline.repeat(repeat) + '\n\n';
        } else {
          var prefix = '#'.repeat(parseInt(node.nodeName.charAt(1)));
          return '\n\n' + prefix + ' ' + content + anchor + '\n\n';
        }
      }
    });

    this.addRule('strong', {
      filter: ['strong', 'b'],
      replacement: function(content) {
        var delimiter = turndownService.prototype.options.strongDelimiter;
        return delimiter + content + delimiter;
      }
    });

    this.addRule('emphasis', {
      filter: ['em', 'i'],
      replacement: function(content) {
        var delimiter = turndownService.prototype.options.emDelimiter;
        return delimiter + content + delimiter;
      }
    });

    this.addRule('lineBreak', {
      filter: 'br',
      replacement: function() {
        return '  \n';
      }
    });

    this.addRule('blockquote', {
      filter: 'blockquote',
      replacement: function(content) {
        var prefix = '> ';
        var lines = content.split('\n');
        return '\n' + lines.map(function(line) {
          return prefix + line;
        }).join('\n') + '\n\n';
      }
    });

    this.addRule('list', {
      filter: ['ul', 'ol'],
      replacement: function(content, node) {
        return '\n' + content + '\n';
      }
    });

    this.addRule('listItem', {
      filter: 'li',
      replacement: function(content, node) {
        var marker = turndownService.prototype.options.bulletListMarker;
        var parent = node.parentNode;
        var isOrdered = parent.nodeName === 'OL';
        var index = Array.prototype.indexOf.call(parent.childNodes, node) + 1;
        var prefix = isOrdered ? index + '. ' : marker + ' ';

        // Handle nested lists
        var nested = content.match(/^\n+/) || '';
        content = content.replace(/^\n+/, '');

        return nested + prefix + content.replace(/\n/g, '\n   ');
      }
    });

    this.addRule('code', {
      filter: function(node) {
        return node.nodeName === 'CODE' || node.nodeName === 'PRE';
      },
      replacement: function(content, node) {
        if (node.nodeName === 'PRE') {
          return '\n```\n' + content + '\n```\n';
        }
        return '`' + content + '`';
      }
    });

    this.addRule('horizontalRule', {
      filter: 'hr',
      replacement: function() {
        return '\n---\n\n';
      }
    });

    this.addRule('link', {
      filter: 'a',
      replacement: function(content, node) {
        var href = node.getAttribute('href') || '';
        var title = node.getAttribute('title') || '';
        var titlePart = title ? ' "' + title + '"' : '';

        if (turndownService.prototype.options.linkStyle === 'inlined') {
          return '[' + content + '](' + href + titlePart + ')';
        }
        return '[' + content + '][' + href + ']';
      }
    });

    this.addRule('image', {
      filter: 'img',
      replacement: function(content, node) {
        var alt = node.getAttribute('alt') || '';
        var src = node.getAttribute('src') || '';
        var title = node.getAttribute('title') || '';
        var titlePart = title ? ' "' + title + '"' : '';

        return '![' + alt + '](' + src + titlePart + ')';
      }
    });
  };

  turndownService.prototype.addRule = function(key, rule) {
    this.rules[key] = rule;
  };

  turndownService.prototype.turndown = function(html) {
    var self = this;
    var dom = parseHTML(html);

    // Process nodes
    return process(dom, []);
  };

  function parseHTML(html) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(html, 'text/html');
    return doc.body;
  }

  function process(node, ancestors) {
    var result = '';

    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent;
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      var ancestorsCopy = ancestors.slice();
      ancestorsCopy.push(node);

      var rule = getMatchingRule(node, ancestorsCopy);

      if (rule) {
        var children = '';
        node.childNodes.forEach(function(child) {
          children += process(child, ancestorsCopy);
        });

        var replacement = rule.replacement(children, node);

        if (typeof replacement === 'string') {
          return replacement;
        }
      }

      var childrenResult = '';
      node.childNodes.forEach(function(child) {
        childrenResult += process(child, ancestors);
      });

      return childrenResult;
    }

    return '';
  }

  function getMatchingRule(node, ancestors) {
    var rules = turndownService.prototype.rules;

    for (var key in rules) {
      var rule = rules[key];

      if (typeof rule.filter === 'function') {
        if (rule.filter(node)) {
          return rule;
        }
      } else if (typeof rule.filter === 'string') {
        if (node.nodeName === rule.filter.toUpperCase()) {
          return rule;
        }
      } else if (Array.isArray(rule.filter)) {
        if (rule.filter.indexOf(node.nodeName.toLowerCase()) !== -1 ||
            rule.filter.indexOf(node.nodeName) !== -1) {
          return rule;
        }
      }
    }

    return null;
  }

  return turndownService;
}));