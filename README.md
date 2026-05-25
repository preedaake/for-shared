# Shared Tools & Skills Repository

Welcome to our collection of useful tools and skills for the team! 🎉

This repository is dedicated to sharing best-in-class tools, skills, and utilities that can help the team work more efficiently.

---

## 📚 Available Tools

### 1. Word to Markdown (word-to-md)

Convert DOCX files to Markdown format with ease.

[![GitHub](https://img.shields.io/badge/GitHub-word--to--md-blue)](https://github.com/your-repo/word-to-md)

#### Features

- 🎯 **Browser-based** - Convert DOCX to MD directly in the browser
- ⚡ **Fast** - Client-side conversion, no server needed
- 🎨 **Clean UI** - Drag-and-drop interface
- 📦 **CLI Tool** - Use via command line
- 🔧 **LangGraph Ready** - Import as Node.js module
- 📊 **Table Extraction** - Preserves tables with correct formatting
- 🖼️ **Image Handling** - Extracts and embeds images in output
- 🔄 **Format Preservation** - Maintains original document structure (headings, lists, styling)
- 🤖 **AI Agent Ready** - Designed for integration with AI agents and workflows

#### Capabilities

##### Format Preservation

| Feature | Description |
|---------|-------------|
| Headings | H1-H6 with proper hierarchy |
| Text Styles | Bold, Italic, Underline |
| Lists | Ordered, unordered, nested |
| Blocks | Block quotes and code blocks |
| Spacing | Paragraph spacing and indentation |

##### Advanced Features

- **Table Extraction**: Tables are converted to Markdown table syntax
- **Image Extraction**: Inline images are extracted and embedded as base64 or file references
- **Link Preservation**: Hyperlinks remain clickable in output
- **Complex Structures**: Handles merged cells, nested lists, and mixed content

#### Quick Start

```bash
# Install via npm
npm install word-to-md

# CLI usage
npx word-to-md input.docx -o output.md

# Node.js module
import { convertDocxToMd } from 'word-to-md';
const markdown = await convertDocxToMd('document.docx');
```

---

## 🤝 Contributing

Have a tool or skill to share? Contributions are welcome!

1. Create a new folder for your tool
2. Add comprehensive documentation
3. Submit a pull request

---

## 📝 License

MIT License