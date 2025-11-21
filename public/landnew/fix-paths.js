const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'index.html');
let html = fs.readFileSync(htmlPath, 'utf-8');

console.log('Fixing asset paths...\n');

// Fix CSS links
html = html.replace(
  /href="((?:cdn\.|deepjudge-code|cdnjs|d3e54v|js\.)[^"]+)"/g,
  'href="/landnew/$1"'
);

// Fix JS scripts
html = html.replace(
  /src="((?:cdn\.|deepjudge-code|cdnjs|d3e54v|js\.)[^"]+)"/g,
  'src="/landnew/$1"'
);

// Fix logo to use Surbee logo
html = html.replace(
  /src="\/logo\.svg"/g,
  'src="/logo.svg"'
);

// Fix image paths
html = html.replace(
  /src="(cdn\.prod\.website-files\.com[^"]+)"/g,
  'src="/landnew/$1"'
);

fs.writeFileSync(htmlPath, html);
console.log('✅ Fixed all asset paths!');
console.log('Assets now load from /landnew/ prefix');
