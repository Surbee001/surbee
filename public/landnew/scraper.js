const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname);
const downloaded = new Set();

function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function downloadFile(url, filePath) {
  return new Promise((resolve) => {
    if (downloaded.has(url)) {
      return resolve();
    }

    console.log(`Downloading: ${url}`);
    downloaded.add(url);
    ensureDir(filePath);

    const protocol = url.startsWith('https') ? https : http;
    const request = protocol.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    }, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        return downloadFile(redirectUrl, filePath).then(resolve);
      }

      if (response.statusCode !== 200) {
        console.error(`Failed: ${url} (${response.statusCode})`);
        return resolve();
      }

      const fileStream = fs.createWriteStream(filePath);
      response.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`✓ Saved: ${path.basename(filePath)}`);
        resolve();
      });
      fileStream.on('error', () => resolve());
    });

    request.on('error', () => resolve());
    request.setTimeout(30000, () => {
      request.abort();
      resolve();
    });
  });
}

function resolveUrl(url) {
  if (!url || url.startsWith('data:') || url.startsWith('#') || url.startsWith('javascript:')) {
    return null;
  }

  // Already absolute
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // Protocol-relative
  if (url.startsWith('//')) {
    return 'https:' + url;
  }

  // Relative URLs - prepend https://
  return 'https://' + url;
}

function urlToFilePath(url) {
  try {
    // Remove protocol
    let cleanUrl = url.replace(/^https?:\/\//, '');
    // Remove query parameters
    cleanUrl = cleanUrl.split('?')[0];
    return path.join(outputDir, cleanUrl);
  } catch (e) {
    return null;
  }
}

async function scrape() {
  console.log('Downloading assets...\n');

  const htmlPath = path.join(outputDir, 'index.html');
  const html = fs.readFileSync(htmlPath, 'utf-8');

  // Extract all resource URLs
  const urls = new Set();

  // CSS
  const cssRegex = /<link[^>]+href=["']([^"']+\.css[^"']*)["']/gi;
  let match;
  while ((match = cssRegex.exec(html))) urls.add(match[1]);

  // JS
  const jsRegex = /<script[^>]+src=["']([^"']+)["']/gi;
  while ((match = jsRegex.exec(html))) urls.add(match[1]);

  // Images
  const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
  while ((match = imgRegex.exec(html))) urls.add(match[1]);

  // SVG in src attributes
  const svgRegex = /src=["']([^"']+\.svg[^"']*)["']/gi;
  while ((match = svgRegex.exec(html))) urls.add(match[1]);

  console.log(`Found ${urls.size} resources to download\n`);

  for (const url of urls) {
    const resolved = resolveUrl(url);
    if (resolved) {
      const filePath = urlToFilePath(resolved);
      if (filePath) {
        await downloadFile(resolved, filePath);
      }
    }
  }

  console.log(`\n✅ Complete! Downloaded ${downloaded.size} files`);
}

scrape().catch(console.error);
