/**
 * word-to-md Tool for LangGraph
 * Converts DOCX/DOC files to Markdown format
 * 
 * Install: npm install mammoth
 * Run: node tool.js <input.docx> [output.md]
 */

const FS = require('fs');
const PATH = require('path');

/**
 * Word to MD Converter Tool
 * 
 * @param {string} inputPath - Path to input DOCX file
 * @param {string} outputPath - Optional output MD path (defaults to <input>.md)
 * @returns {object} - { success: boolean, output?: string, error?: string }
 */
async function convertWordToMd(inputPath, outputPath = null) {
  try {
    // Validate input
    if (!inputPath) {
      return { success: false, error: 'inputPath is required' };
    }
    
    // Resolve paths
    const input = PATH.resolve(inputPath);
    const output = outputPath ? PATH.resolve(outputPath) : input.replace(/\.(docx?|doc)$/i, '.md');
    
    // Check input exists
    if (!FS.existsSync(input)) {
      return { success: false, error: `File not found: ${input}` };
    }
    
    // Check file extension
    const ext = PATH.extname(input).toLowerCase();
    if (!['.docx', '.doc'].includes(ext)) {
      return { success: false, error: 'Only .docx and .doc files are supported' };
    }
    
    // Require mammoth
    let mammoth;
    try {
      mammoth = require('mammoth');
    } catch (e) {
      return { 
        success: false, 
        error: 'mammoth not installed. Run: npm install mammoth' 
      };
    }
    
    // Read and convert
    const buffer = FS.readFileSync(input);
    
    const result = await mammoth.convertToHtml({ buffer: buffer }, {
      styleMap: [
        "p[style-name:'Heading 1'] => h1:fresh",
        "p[style-name:'Heading 2'] => h2:fresh", 
        "p[style-name:'Heading 3'] => h3:fresh",
        "p[style-name:'Heading 4'] => h4:fresh",
        "p[style-name:'Heading 5'] => h5:fresh",
        "p[style-name:'Heading 6'] => h6:fresh",
        "b => strong",
        "i => em"
      ]
    });
    
    const html = result.value;
    let markdown = htmlToMarkdown(html);
    
    // Write output
    FS.writeFileSync(output, markdown, 'utf8');
    
    return { 
      success: true, 
      output: output,
      preview: markdown.substring(0, 500) + (markdown.length > 500 ? '\n...' : '')
    };
    
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Convert HTML to Markdown
 */
function htmlToMarkdown(html) {
  let md = html;
  
  // Headings
  md = md.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '\n# $1\n');
  md = md.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '\n## $1\n');
  md = md.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '\n### $1\n');
  md = md.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, '\n#### $1\n');
  md = md.replace(/<h5[^>]*>([\s\S]*?)<\/h5>/gi, '\n##### $1\n');
  md = md.replace(/<h6[^>]*>([\s\S]*?)<\/h6>/gi, '\n###### $1\n');
  
  // Bold/Italic
  md = md.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, '**$1**');
  md = md.replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, '**$1**');
  md = md.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, '*$1*');
  md = md.replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, '*$1*');
  
  // Paragraphs with spacing
  md = md.replace(/<p[^>]*class="empty-paragraph"[^>]*><\/p>/gi, '\n');
  md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '\n$1\n');
  
  // Line breaks
  md = md.replace(/<br\s*\/?>/gi, '  \n');
  md = md.replace(/<br\/>/gi, '  \n');
  
  // Unordered lists
  md = md.replace(/<ul[^>]*>/gi, '\n');
  md = md.replace(/<\/ul>/gi, '\n');
  md = md.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '- $1\n');
  
  // Ordered lists
  md = md.replace(/<ol[^>]*>/gi, '\n');
  md = md.replace(/<\/ol>/gi, '\n');
  
  // Links
  md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)');
  
  // Images
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, '![$2]($1)');
  md = md.replace(/<img[^>]*alt="([^"]*)"[^>]*src="([^"]*)"[^>]*\/?>/gi, '![$1]($2)');
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*\/?>/gi, '![]($1)');
  
  // Code blocks
  md = md.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, '\n```\n$1\n```\n');
  md = md.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, '`$1`');
  
  // Blockquotes
  md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (match, content) => {
    return content.split('\n').map(line => '> ' + line).join('\n');
  });
  
  // Horizontal rules
  md = md.replace(/<hr\s*\/?>/gi, '\n---\n');
  
  // Clean remaining tags
  md = md.replace(/<[\s\S]*?>/g, '');
  
  // Decode HTML entities
  md = md.replace(/&nbsp;/g, ' ');
  md = md.replace(/&amp;/g, '&');
  md = md.replace(/&lt;/g, '<');
  md = md.replace(/&gt;/g, '>');
  md = md.replace(/&quot;/g, '"');
  md = md.replace(/&#39;/g, "'");
  
  // Normalize whitespace
  md = md.replace(/\n{3,}/g, '\n\n');
  md = md.replace(/^[\s\n]+|[\s\n]+$/gm, '');
  md = md.trim();
  
  return md;
}

/**
 * Main entry point for CLI/tool
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('word-to-md tool');
    console.log('Usage: node tool.js <input.docx> [output.md]');
    console.log('');
    console.log('API:');
    console.log('  const { convertWordToMd } = require("./tool");');
    console.log('  const result = await convertWordToMd("file.docx", "output.md"));');
    process.exit(0);
  }
  
  const inputPath = args[0];
  const outputPath = args[1];
  
  console.log('Converting:', inputPath);
  
  const result = await convertWordToMd(inputPath, outputPath);
  
  if (result.success) {
    console.log('✓ Output:', result.output);
    console.log('\nPreview:');
    console.log(result.preview);
  } else {
    console.error('✗ Error:', result.error);
    process.exit(1);
  }
}

// Export functions
module.exports = {
  convertWordToMd,
  htmlToMarkdown
};

// Run if called directly
if (require.main === module) {
  main();
}