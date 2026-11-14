// Turns the single-file Vite build into an artifact page body: the artifact host adds
// its own <!doctype>/<html>/<head>/<body> skeleton, so strip those wrappers.
import { readFileSync, writeFileSync } from 'node:fs';

const html = readFileSync('dist/index.html', 'utf8');
const head = html.match(/<head>([\s\S]*?)<\/head>/i)?.[1] ?? '';
const body = html.match(/<body>([\s\S]*?)<\/body>/i)?.[1] ?? '';
const keepHead = head
  .replace(/<meta charset[^>]*>\s*/i, '')
  .replace(/<meta name="viewport"[^>]*>\s*/i, '');
// Title first so it lands in the first 8KB the host scans.
const title = keepHead.match(/<title>[\s\S]*?<\/title>/i)?.[0] ?? '<title>Zenith Meteor</title>';
const rest = keepHead.replace(title, '');
const out = `${title}\n${rest.trim()}\n${body.trim()}\n`;
writeFileSync('dist/zenith-meteor.html', out);
console.log(`dist/zenith-meteor.html  ${(out.length / 1024).toFixed(1)} KB`);
