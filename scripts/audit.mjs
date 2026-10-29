import fs from 'fs';
import path from 'path';

const SRC_DIR = path.resolve('frontend/src');

function getAllFiles(dir, exts = ['.ts', '.tsx', '.css']) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '__tests__' && file !== '.git') {
        results = results.concat(getAllFiles(fullPath, exts));
      }
    } else {
      if (exts.includes(path.extname(file))) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

const allFiles = getAllFiles(SRC_DIR);
console.log(`Total source files to scan: ${allFiles.length}`);

const legacyReport = {
  hardcodedColors: [],
  inlineColorStyles: [],
  fontUnder12px: [],
  nonLucideIcons: [],
  foreignFonts: [],
  oldThemeRemnants: [], // emerald, slate, zinc, gray, etc.
  legacyComponentImports: [],
  duplicateComponents: []
};

// Check duplicate component files
const componentFiles = fs.readdirSync(path.join(SRC_DIR, 'components'), { withFileTypes: true });
const commonFiles = fs.existsSync(path.join(SRC_DIR, 'components/common')) ? fs.readdirSync(path.join(SRC_DIR, 'components/common')) : [];
const sharedFiles = fs.existsSync(path.join(SRC_DIR, 'components/shared')) ? fs.readdirSync(path.join(SRC_DIR, 'components/shared')) : [];

console.log('Shared components count:', sharedFiles.length);

const allowedTokensColors = new Set([
  '#051F20', '#0B2B26', '#163832', '#235347', '#8EB69B', '#DAF1DE',
  '#F6FBF7', '#FFFFFF', '#F2B84B', '#D9534F',
  // lowercase
  '#051f20', '#0b2b26', '#163832', '#235347', '#8eb69b', '#daf1de',
  '#f6fbf7', '#ffffff', '#f2b84b', '#d9534f',
  'transparent', 'inherit', 'currentColor'
]);

for (const filePath of allFiles) {
  const relPath = path.relative('e:/GEO HUB', filePath).replace(/\\/g, '/');
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;

    // Check non-brand hex colors (excluding tokens files)
    if (!relPath.includes('styles/tokens.') && !relPath.includes('tailwind.config')) {
      const hexMatches = line.match(/#[0-9a-fA-F]{3,8}\b/g);
      if (hexMatches) {
        for (const hex of hexMatches) {
          if (!allowedTokensColors.has(hex)) {
            legacyReport.hardcodedColors.push({ file: relPath, line: lineNum, text: hex, context: line.trim() });
          }
        }
      }

      // Check rgb / rgba / hsl
      const rgbMatches = line.match(/(rgba?|hsla?)\([^)]+\)/g);
      if (rgbMatches) {
        for (const match of rgbMatches) {
          // Allow standard tokens shadows or overlays
          if (!match.includes('5, 31, 32') && !match.includes('5,31,32') && 
              !match.includes('217, 83, 79') && !match.includes('242, 184, 75') &&
              !match.includes('255, 255, 255') && !match.includes('0, 0, 0, 0')) {
            legacyReport.hardcodedColors.push({ file: relPath, line: lineNum, text: match, context: line.trim() });
          }
        }
      }

      // Check inline color styles
      if (/style=\{.*(color|background|borderColor)\s*:/i.test(line)) {
        legacyReport.inlineColorStyles.push({ file: relPath, line: lineNum, context: line.trim() });
      }

      // Check old theme color classes (emerald, slate, zinc, gray, etc.)
      const oldClassMatches = line.match(/\b(bg|text|border)-(emerald|slate|zinc|gray|indigo|blue|sky|teal|purple|violet)-[0-9]{2,3}\b/g);
      if (oldClassMatches) {
        legacyReport.oldThemeRemnants.push({ file: relPath, line: lineNum, classes: oldClassMatches, context: line.trim() });
      }

      // Check font size under 12px
      const smallFontMatches = line.match(/(text-\[(10|11|9|8)px\]|fontSize:\s*['"]?(10|11|9|8)px['"]?|text-xs\s+.*text-\[11px\])/g);
      if (smallFontMatches) {
        legacyReport.fontUnder12px.push({ file: relPath, line: lineNum, text: smallFontMatches.join(', '), context: line.trim() });
      }

      // Check font families other than Plus Jakarta Sans / Inter
      if (/font-mono|font-serif|font-\[.*\]/i.test(line) && !line.includes('Plus Jakarta Sans') && !line.includes('Inter')) {
        legacyReport.foreignFonts.push({ file: relPath, line: lineNum, context: line.trim() });
      }

      // Check legacy component imports
      if (
        line.includes("from '../components/") ||
        line.includes("from '../../components/") ||
        line.includes("from '../../../components/")
      ) {
        if (!line.includes('/shared') && !line.includes('/navigation') && !line.includes("from '../components'") && !line.includes("from '../../components'")) {
          legacyReport.legacyComponentImports.push({ file: relPath, line: lineNum, context: line.trim() });
        }
      }
    }
  });
}

console.log('--- AUDIT STATS ---');
console.log('Hardcoded non-brand colors:', legacyReport.hardcodedColors.length);
console.log('Inline color styles:', legacyReport.inlineColorStyles.length);
console.log('Old theme class remnants (slate/emerald/etc.):', legacyReport.oldThemeRemnants.length);
console.log('Font sizes under 12px:', legacyReport.fontUnder12px.length);
console.log('Foreign fonts:', legacyReport.foreignFonts.length);
console.log('Legacy component imports:', legacyReport.legacyComponentImports.length);

fs.writeFileSync('scripts/audit-raw.json', JSON.stringify(legacyReport, null, 2));
