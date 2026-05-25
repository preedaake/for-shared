# Word to MD - Document Converter Web Application

## Project Overview

- **Project Name:** word-to-md
- **Type:** Web Application (Browser-based file converter)
- **Core Functionality:** Convert DOCX/DOC files to Markdown format in the browser
- **Target Users:** Writers, developers, content creators who need to migrate Word docs to Markdown

---

## Technology Stack

### Core Libraries (Researched from GitHub)

| Library | Stars | Purpose |
|---------|-------|---------|
| [msaaddev/docx-to-markdown](https://github.com/msaaddev/docx-to-markdown) | 15⭐ | Direct DOCX → Markdown conversion |
| [jojomondag/FileToMarkdown](option) | 26⭐ | Multi-format support (DOCX, DOC, ODT, PDF, etc.) |

### Secondary Dependencies

- **mammoth.js** - Extract content from DOCX (https://github.com/microsoft/mammoth) - Very popular for DOCX parsing
- **turndown** - HTML to Markdown converter (https://github.com/domchristie/turndown)
- **jszip** - Handle DOCX as ZIP archive (built into mammoth)

### Frontend Stack

- **Vanilla HTML/CSS/JS** - Simple, no build step required
- **htmx** - Lightweight reactivity (optional)

---

## Architecture

```
word-to-md/
├── public/
│   ├── index.html      # Main UI
│   ├── css/style.css  # Styling
│   └── js/app.js      # Client logic
├── src/
│   └── converter.js  # Conversion logic
├── dist/
│   └── bundle.js    # Bundled output (future)
├── uploads/         # Temporary uploaded files
├── output/           # Converted Markdown files
└── server.js       # Node.js backend (if needed)
```

---

## Features

### Phase 1 (MVP - Browser-only)
1. File drag-and-drop or click-to-upload
2. DOCX → Markdown conversion in browser
3. Preview converted Markdown
4. Download as .md file
5. Copy to clipboard

### Phase 2 (Extended)
1. Support legacy .doc format (via antiword or external API)
2. Batch conversion (multiple files)
3. Table styling preservation
4. Image extraction and embedding

---

## UI Design

- Clean, minimal interface
- Drag-and-drop zone with visual feedback
- Split view: original preview ↔ Markdown preview
- Dark mode support

---

## Deployment

- Static site (can deploy to any static host)
- Or Node.js server for advanced features

---

## References

- Demo/Test: https://word-to-markdown.vercel.app (reference only)
- Mammoth.js: https://github.com/microsoft/mammoth
- Turndown: https://github.com/domchristie/turndown