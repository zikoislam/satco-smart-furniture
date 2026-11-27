const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      processDir(fullPath);
    } else if (entry.name === 'page.tsx' || entry.name === 'route.ts') {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (!content.includes("dynamic = 'force-dynamic'")) {
        const trimmed = content.trimStart();
        if (trimmed.startsWith("'use client'") || trimmed.startsWith('"use client"')) {
          // Put export const dynamic after 'use client';
          const match = content.match(/^(\s*['"]use client['"];?\r?\n)/);
          if (match) {
            content = match[0] + "export const dynamic = 'force-dynamic';\n" + content.slice(match[0].length);
          } else {
            content = "export const dynamic = 'force-dynamic';\n" + content;
          }
        } else {
          content = "export const dynamic = 'force-dynamic';\n" + content;
        }
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Updated:', path.relative(process.cwd(), fullPath));
      } else {
        console.log('Already dynamic:', path.relative(process.cwd(), fullPath));
      }
    }
  }
}

const targetDir = path.join(process.cwd(), 'src', 'app');
processDir(targetDir);
console.log('Successfully applied force-dynamic across all pages and API routes.');
