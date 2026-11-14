// Turns the single-file Vite build into an artifact page body: the artifact host adds
// its own <!doctype>/<html>/<head>/<body> skeleton, so strip those wrappers.
import { readFileSync, writeFileSync } from 'node:fs';

// usage: node scripts/make-artifact.mjs [in=dist/index.html] [out=dist/zenith-meteor.html] [title]
const [IN = 'dist/index.html', OUT = 'dist/zenith-meteor.html', TITLE] = process.argv.slice(2);
const html = readFileSync(IN, 'utf8');
const head = html.match(/<head>([\s\S]*?)<\/head>/i)?.[1] ?? '';
const body = html.match(/<body>([\s\S]*?)<\/body>/i)?.[1] ?? '';
const keepHead = head
  .replace(/<meta charset[^>]*>\s*/i, '')
  .replace(/<meta name="viewport"[^>]*>\s*/i, '');
// Title first so it lands in the first 8KB the host scans.
const found = keepHead.match(/<title>[\s\S]*?<\/title>/i)?.[0] ?? '<title>Zenith Meteor</title>';
const title = TITLE ? `<title>${TITLE}</title>` : found;
const rest = keepHead.replace(found, '');
const out = `${title}\n${rest.trim()}\n${body.trim()}\n`;
writeFileSync(OUT, out);
console.log(`${OUT}  ${(out.length / 1024).toFixed(1)} KB`);
