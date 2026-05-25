# word-to-md

> Convert Word documents (.docx, .doc) to Markdown format in the browser or Node.js

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/node.js-18+-green.svg)
![npm](https://img.shields.io/badge/npm-mammoth-red.svg)

## Features

- 🎯 **Browser-based** - Convert DOCX to MD directly in the browser
- ⚡ **Fast** - Client-side conversion, no server needed
- 🎨 **Clean UI** - Drag-and-drop interface
- 📦 **CLI Tool** - Use via command line
- 🔧 **LangGraph Ready** - Import as Node.js module
- 📊 **Table Extraction** - Preserves tables with correct formatting
- 🖼️ **Image Handling** - Extracts and embeds images in output
- 🔄 **Format Preservation** - Maintains original document structure (headings, lists, styling)
- 🤖 **AI Agent Ready** - Designed for integration with AI agents and workflows

## Capabilities

### Format Preservation
- Headings (H1-H6) with proper hierarchy
- Bold, Italic, Underline styling
- Lists (ordered, unordered, nested)
- Block quotes and code blocks
- Paragraph spacing and indentation

### Advanced Features
- **Table Extraction**: Tables are converted to Markdown table syntax
- **Image Extraction**: Inline images are extracted and embedded as base64 or file references
- **Link Preservation**: Hyperlinks remain clickable in output
- **Complex Structures**: Handles merged cells, nested lists, and mixed content

## Quick Start

### Browser (Web App)

Simply open `public/index.html` in your browser:

```bash
cd public
python3 -m http.server 8080
# Visit http://localhost:8080
```

Or serve with any static server:

```bash
npx serve public
```

### CLI

```bash
# Install dependencies
npm install mammoth

# Convert file
node cli.js input.docx output.md
```

### Node.js / LangGraph

```javascript
const { convertWordToMd } = require('./tools/tool.js');

const result = await convertWordToMd('input.docx', 'output.md');
console.log(result);
// { success: true, output: '/path/to/output.md', preview: '...' }
```

## Installation

### Prerequisites

- Node.js 18+

### Install

```bash
git clone https://github.com/yourusername/word-to-md.git
cd word-to-md
npm install mammoth
```

## Project Structure

```
word-to-md/
├── skills/
│   └── SKILL.md         # LangGraph skill definition
├── tools/
│   ├── public/         # Browser web app
│   │   ├── css/style.css
│   │   ├── js/app.js
│   │   └── index.html
│   ├── tools/          # LangGraph tool package
│   │   ├── tool.js
│   │   ├── package.json
│   │   └── node_modules/
│   ├── node_modules/   # mammoth & dependencies
│   ├── cli.js          # CLI wrapper
│   ├── package.json
│   ├── package-lock.json
│   ├── README.md
│   └── SPEC.md         # Technical spec
└── {public/{css,js},src,dist,uploads,output}
```

## Directory Structure Details

| Path | Description |
|------|-------------|
| `skills/SKILL.md` | LangGraph skill configuration |
| `tools/public/` | Web UI for browser-based conversion |
| `tools/tools/` | Node.js module for LangGraph integration |
| `tools/node_modules/` | mammoth.js and dependencies |

## API

### `convertWordToMd(inputPath, outputPath?)`

Convert a DOCX file to Markdown.

| Parameter | Type | Description |
|-----------|------|-------------|
| inputPath | string | Path to input .docx/.doc file |
| outputPath | string | (Optional) Output path, default: `<input>.md` |

**Returns:**

```javascript
{
  success: boolean,
  output: string,   // Path to output file
  preview: string,  // First 500 chars
  error: string    // Error message (if failed)
}
```

## Supported Formats

| Input | Output |
|-------|--------|
| .docx | .md |
| .doc | (limited support) |

### Preserved Elements

| Element | Status |
|---------|--------|
| Headings (H1-H6) | ✅ |
| Bold, Italic, Underline | ✅ |
| Lists (ordered, unordered, nested) | ✅ |
| Tables | ✅ |
| Images (embedded extraction) | ✅ |
| Links | ✅ |
| Block quotes | ✅ |
| Code blocks | ✅ |
| Paragraph spacing | ✅ |

## Technologies

- [mammoth.js](https://github.com/microsoft/mammoth) - DOCX parsing
- Vanilla JS - No build tools required

## AI Agent Integration

This tool is designed for AI agents to:

```javascript
// Example: AI Agent workflow
const { convertWordToMd } = require('./tools/tool.js');

// Agent processes a document
const result = await agent.process(
  await convertWordToMd('report.docx', 'report.md')
);

// Result includes preview for quick analysis
console.log(result.preview);
```

### Use Cases
- **Document Analysis**: Convert documents for AI analysis
- **Content Extraction**: Pull structured data (tables, images) for processing
- **Knowledge Base**: Build knowledge bases from Word documents
- **Workflow Automation**: Automate document processing pipelines

## License

MIT © 2026

## Contributing

PRs welcome! Please open an issue first to discuss changes.