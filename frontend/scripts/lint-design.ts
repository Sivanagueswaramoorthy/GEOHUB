import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SRC_DIR = path.resolve(__dirname, '../src');

// Allowed brand colors and derived neutrals (case-insensitive hex without #)
const ALLOWED_HEX = new Set([
  '051f20', // pine-950
  '0b2b26', // pine-900
  '163832', // pine-800
  '235347', // pine-700
  '8eb69b', // sage-400
  'daf1de', // mint-100
  'f6fbf7', // appBg
  'ffffff', // cardWhite
  'fff',    // cardWhite shorthand
  'f2b84b', // amber semantic
  'd9534f', // red semantic
]);

interface Violation {
  file: string;
  line: number;
  type: 'color' | 'font-size' | 'icon' | 'legacy-component';
  message: string;
  codeSnippet: string;
}

const violations: Violation[] = [];

// Directories/files to scan (Active UI views, auth features, and shared components)
const TARGET_DIRS = [
  path.join(SRC_DIR, 'views'),
  path.join(SRC_DIR, 'features/auth'),
  path.join(SRC_DIR, 'components/shared'),
  path.join(SRC_DIR, 'components/Header.tsx'),
  path.join(SRC_DIR, 'components/FloatingNav.tsx'),
  path.join(SRC_DIR, 'components/navigation'),
];

function getAllFiles(dirOrFile: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dirOrFile)) return fileList;
  const stat = fs.statSync(dirOrFile);
  if (!stat.isDirectory()) {
    if (/\.(tsx|ts|css)$/.test(dirOrFile) && !dirOrFile.includes('__tests__') && !dirOrFile.endsWith('.d.ts')) {
      fileList.push(dirOrFile);
    }
    return fileList;
  }

  const entries = fs.readdirSync(dirOrFile, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirOrFile, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== '__tests__' && entry.name !== 'node_modules') {
        getAllFiles(fullPath, fileList);
      }
    } else if (/\.(tsx|ts|css)$/.test(entry.name)) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

const filesToScan: string[] = [];
for (const target of TARGET_DIRS) {
  getAllFiles(target, filesToScan);
}

// Remove duplicates
const uniqueFiles = Array.from(new Set(filesToScan));

// Check each file
for (const file of uniqueFiles) {
  const relPath = path.relative(SRC_DIR, file).replace(/\\/g, '/');
  const content = fs.readFileSync(file, 'utf-8');
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) return;

    // 1. Check for legacy component imports (e.g. from components/common/* or components/Button, etc.)
    if (/from\s+['"][^'"]*components\/(common|Button|Chip|DataTable|DonutCard|FeedbackStates|Field|FilterPill|Icon|Image|InfoRow|MemberCard|ModuleTile|NextEventSpotlight|Overline|QuickActionsSheet|RoleBadge|SearchBar|SectionCard|ShortcutTile|StatTile|WeekStrip)['"]/.test(line)) {
      if (!relPath.startsWith('components/shared')) {
        violations.push({
          file: relPath,
          line: lineNum,
          type: 'legacy-component',
          message: 'Illegal import of legacy component; must use frontend/src/components/shared',
          codeSnippet: trimmed,
        });
      }
    }

    // 2. Check for non-Lucide icon imports
    if (/from\s+['"](react-icons|@heroicons|feather-icons|ionicons)['"]/.test(line)) {
      violations.push({
        file: relPath,
        line: lineNum,
        type: 'icon',
        message: 'Non-Lucide icon import found. Only lucide-react is allowed.',
        codeSnippet: trimmed,
      });
    }

    // 3. Check for font sizes under 12px (strictly < 12px hard floor)
    const fsMatches = line.matchAll(/fontSize:\s*['"]?(\d+(?:\.\d+)?)(?:px)?['"]?/g);
    for (const match of fsMatches) {
      const size = parseFloat(match[1]);
      if (size < 12) {
        violations.push({
          file: relPath,
          line: lineNum,
          type: 'font-size',
          message: `Font size under 12px hard floor detected (${size}px).`,
          codeSnippet: trimmed,
        });
      }
    }

    const twMatches = line.matchAll(/text-\[(\d+(?:\.\d+)?)(?:px)?\]/g);
    for (const match of twMatches) {
      const size = parseFloat(match[1]);
      if (size < 12) {
        violations.push({
          file: relPath,
          line: lineNum,
          type: 'font-size',
          message: `Tailwind font size under 12px hard floor detected (${size}px).`,
          codeSnippet: trimmed,
        });
      }
    }

    // 4. Check for hardcoded hex colors outside brand palette (Mascot.tsx has SVG vector clay illustrations)
    if (!relPath.endsWith('Mascot.tsx')) {
      const hexMatches = line.matchAll(/#([0-9a-fA-F]{3,8})\b/g);
      for (const match of hexMatches) {
        const hex = match[1].toLowerCase();
        const baseHex = hex.length === 8 ? hex.substring(0, 6) : hex;
        if (!ALLOWED_HEX.has(baseHex)) {
          violations.push({
            file: relPath,
            line: lineNum,
            type: 'color',
            message: `Hardcoded non-brand color #${match[1]} detected. Only brand palette tokens allowed.`,
            codeSnippet: trimmed,
          });
        }
      }
    }
  });
}

// Summary output
console.log('=====================================================');
console.log('       GeoHub UI Design Conformance Linter           ');
console.log('=====================================================');
console.log(`Scanned files: ${uniqueFiles.length}`);
console.log(`Total violations found: ${violations.length}`);
console.log('-----------------------------------------------------');

if (violations.length > 0) {
  console.error('\nFAIL: Design system violations detected:');
  violations.forEach((v) => {
    console.error(` [${v.type.toUpperCase()}] ${v.file}:${v.line} - ${v.message}`);
    console.error(`   > ${v.codeSnippet}`);
  });
  console.log('\nPlease fix these violations to satisfy Phase 6.1 design conformance gate.');
  process.exit(1);
} else {
  console.log('✓ PASS: Zero hardcoded non-brand colors.');
  console.log('✓ PASS: Zero font sizes under 12px (hard floor respected).');
  console.log('✓ PASS: Zero non-Lucide icon imports.');
  console.log('✓ PASS: Zero legacy component imports in audited screens.');
  console.log('Design conformance gate passed successfully!');
  process.exit(0);
}
