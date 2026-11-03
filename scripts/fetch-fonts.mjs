/* Build-time helper: extract the latin woff2 files from the Google Fonts
 * CSS (gf.css) and download them into assets/fonts, then emit fonts.css.
 * Run once: node scripts/fetch-fonts.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const css = readFileSync(new URL('../gf.css', import.meta.url), 'utf8');
mkdirSync(new URL('../assets/fonts', import.meta.url), { recursive: true });

// Split into @font-face blocks; keep only the ones preceded by a "latin"
// subset comment (Google emits "/* latin */" before each latin block).
const blocks = css.split('@font-face').slice(1);
const lines = css.split('\n');

// Map each @font-face to the comment line immediately above it.
const faces = [];
const faceRegex = /font-family:\s*'([^']+)';[\s\S]*?font-weight:\s*(\d+)[\s\S]*?src:\s*url\((https:[^)]+\.woff2)\)/g;

// Walk line-by-line to know the subset of each block.
let currentSubset = '';
let buffer = '';
let inFace = false;
const collected = [];
for (const raw of lines) {
  const line = raw.trim();
  const m = line.match(/^\/\*\s*([a-z0-9-]+)\s*\*\/$/);
  if (m) currentSubset = m[1];
  if (line.startsWith('@font-face')) {
    inFace = true;
    buffer = '';
  }
  if (inFace) buffer += line + '\n';
  if (inFace && line.startsWith('}')) {
    inFace = false;
    if (currentSubset === 'latin') collected.push(buffer);
  }
}

const out = [];
const seen = new Set();
let i = 0;
for (const block of collected) {
  const fam = (block.match(/font-family:\s*'([^']+)'/) || [])[1];
  const wght = (block.match(/font-weight:\s*(\d+)/) || [])[1];
  const style = (block.match(/font-style:\s*(\w+)/) || [])[1] || 'normal';
  const url = (block.match(/url\((https:[^)]+\.woff2)\)/) || [])[1];
  if (!fam || !url) continue;
  const key = `${fam}-${wght}-${style}`;
  if (seen.has(key)) continue;
  seen.add(key);
  const slug = `${fam.toLowerCase().replace(/\s+/g, '')}-${wght}`;
  const file = `${slug}.woff2`;
  const res = await fetch(url);
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(new URL(`../assets/fonts/${file}`, import.meta.url), buf);
  out.push(
    `@font-face{font-family:'${fam}';font-style:${style};font-weight:${wght};font-display:swap;src:url('../assets/fonts/${file}') format('woff2');}`
  );
  console.log(`saved ${file} (${buf.length} bytes)`);
  i++;
}

writeFileSync(new URL('../src/fonts.css', import.meta.url), out.join('\n') + '\n');
console.log(`\nWrote src/fonts.css with ${i} faces.`);
