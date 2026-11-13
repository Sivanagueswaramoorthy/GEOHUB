import fs from 'fs';

// 1. Update utilities.css
let utilCss = fs.readFileSync('frontend/src/styles/utilities.css', 'utf8');
const utilTarget = `.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}`;

const utilRepl = `.no-scrollbar,
.scrollbar-none,
[data-no-scrollbar] {
  -ms-overflow-style: none !important;
  scrollbar-width: none !important;
}

.no-scrollbar::-webkit-scrollbar,
.scrollbar-none::-webkit-scrollbar,
[data-no-scrollbar]::-webkit-scrollbar {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
}`;

if (utilCss.includes('.no-scrollbar {')) {
  utilCss = utilCss.replace(utilTarget, utilRepl);
  fs.writeFileSync('frontend/src/styles/utilities.css', utilCss, 'utf8');
  console.log('Updated utilities.css');
}

// 2. Also append universal scrollbar hiding to index.css
let indexCss = fs.readFileSync('frontend/src/index.css', 'utf8');
const extraScrollbarRules = `
/* Universal Scrollbar Concealment for Mobile-First Shell */
.no-scrollbar,
.scrollbar-none,
[data-no-scrollbar],
.overflow-x-auto {
  scrollbar-width: none !important;
  -ms-overflow-style: none !important;
}

.no-scrollbar::-webkit-scrollbar,
.scrollbar-none::-webkit-scrollbar,
[data-no-scrollbar]::-webkit-scrollbar,
.overflow-x-auto::-webkit-scrollbar {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
}
`;

if (!indexCss.includes('Universal Scrollbar Concealment')) {
  indexCss += extraScrollbarRules;
  fs.writeFileSync('frontend/src/index.css', indexCss, 'utf8');
  console.log('Updated index.css');
}

