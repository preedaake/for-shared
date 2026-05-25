# word-to-md Skill

Convert DOCX/DOC files to Markdown format.

## Trigger

- "convert word to markdown"
- "แปลง word เป็น markdown"  
- "word to md"
- "docx to md"

## Tool Location

```
/home/node/shared/word-to-md/tools/tool.js
```

## API Usage

```javascript
const { convertWordToMd } = require('/home/node/shared/word-to-md/tools/tool.js');

// Convert file
const result = await convertWordToMd('input.docx', 'output.md');

// Result:
// { success: true, output: '/path/to/output.md', preview: '...' }
// or
// { success: false, error: 'error message' }
```

## CLI Usage

```bash
# From any container with mammoth installed
node /home/node/shared/word-to-md/tools/tool.js <input.docx> [output.md]

# Example
node /home/node/shared/word-to-md/tools/tool.js /home/node/shared/file.docx
# Output: /home/node/shared/file.md
```

## Requirements

Install mammoth npm package:
```bash
npm install mammoth
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| inputPath | string | (required) | Path to input DOCX file |
| outputPath | string | auto | Path to output MD file |

## Return Value

```javascript
{
  success: boolean,
  output?: string,      // Path to output MD file
  preview?: string,   // First 500 chars of markdown
  error?: string    // Error message if failed
}
```

## Examples

```javascript
// Convert single file
await convertWordToMd('/home/node/shared/document.docx');

// Convert with custom output
await convertWordToMd('/home/node/shared/document.docx', '/path/to/output.md');

// Batch convert
const files = ['doc1.docx', 'doc2.docx', 'doc3.docx'];
for (const f of files) {
  await convertWordToMd(f);
}
```

## Notes

- Requires Node.js with mammoth package
- Works with .docx format (Office Open XML)
- Legacy .doc (binary) not supported natively - may need additional tools
- HTML from mammoth is converted to Markdown via custom parser