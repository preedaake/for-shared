#!/usr/bin/env node
/**
 * word-to-md CLI - Convert Word documents to Markdown
 * Usage: node cli.js <input.docx> [output.md]
 */

const FS = require('fs');
const PATH = require('path');

// Simplified mammoth browser usage
async function convertDocxToMarkdown(buffer) {
  // Since we're in Node.js, we need mammoth as npm package
  // For now, return placeholder if not installed
  
  const mammoth = require('mammoth');
  
  const result = await mammoth.convertToHtml({ buffer: buffer }, {
    styleMap: [
      "p[style-name:'Heading 1'] => h1:fresh",
      "p[style-name:'Heading 2'] => h2:fresh",
      "p[style-name:'Heading 3'] => h3:fresh"
    ]
  });
  
  return convertHtmlToMarkdown(result.value);
}

function convertHtmlToMarkdown(html) {
  // Simple HTML to Markdown converter
  let md = html;
  
  // Headings
  md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '\n# $1\n');
  md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '\n## $1\n');
  md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '\n### $1\n');
  md = md.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '\n#### $1\n');
  md = md.replace(/<h5[^>]*>(.*?)<\/h5>/gi, '\n##### $1\n');
  md = md.replace(/<h6[^>]*>(.*?)<\/h6>/gi, '\n###### $1\n');
  
  // Bold/Italic
  md = md.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
  md = md.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
  md = md.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
  md = md.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');
  
  // Paragraphs and line breaks
  md = md.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');
  md = md.replace(/<br\s*\/?>/gi, '  \n');
  
  // Lists
  md = md.replace(/<ul[^>]*>/gi, '\n');
  md = md.replace(/<\/ul>/gi, '\n');
  md = md.replace(/<ol[^>]*>/gi, '\n');
  md = md.replace(/<\/ol>/gi, '\n');
  md = md.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');
  
  // Links
  md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');
  
  // Clean up
  md = md.replace(/<[^>]+>/g, '');
  md = md.replace(/&nbsp;/g, ' ');
  md = md.replace(/&amp;/g, '&');
  md = md.replace(/&lt;/g, '<');
  md = md.replace(/&gt;/g, '>');
  md = md.replace(/\n{3,}/g, '\n\n');
  md = md.trim();
  
  return md;
}

// CLI Main
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node cli.js <input.docx> [output.md]');
    console.log('       node cli.js --help');
    process.exit(1);
  }
  
  if (args[0] === '--help') {
    console.log('word-to-md CLI');
    console.log('Usage: node cli.js <input.docx> [output.md]');
    console.log('');
    console.log('Options:');
    console.log('  <input.docx>    Input DOCX file');
    console.log('  [output.md]   Output MD file (optional, default: <input>.md');
    process.exit(0);
  }
  
  const inputPath = args[0];
  const outputPath = args[1] || inputPath.replace(/\.(docx?|doc)$/i, '.md');
  
  if (!FS.existsSync(inputPath)) {
    console.error('Error: File not found:', inputPath);
    process.exit(1);
  }
  
  console.log('Converting:', inputPath);
  
  try {
    const buffer = FS.readFileSync(inputPath);
    const markdown = await convertDocxToMarkdown(buffer);
    
    FS.writeFileSync(outputPath, markdown, 'utf8');
    console.log('Output:', outputPath);
    console.log('Done!');
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

// Export for module use
module.exports = { convertDocxToMarkdown };

// Run if called directly
if (require.main === module) {
  main().catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
}