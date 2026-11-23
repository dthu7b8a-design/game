import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
const root = process.cwd();
const ignored = new Set(['.git', 'dist', 'node_modules', 'docs', 'tests']);
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => ignored.has(entry.name) ? [] : entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]);
}
const errors = [];
let scripts = 0, references = 0;
function checkReference(file, value) {
  value = value.trim();
  if (value.includes('${')) return;
  if (!value || /^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(value)) return;
  const clean = value.split(/[?#]/)[0];
  if (!clean) return;
  const target = path.resolve(path.dirname(file), decodeURIComponent(clean));
  references++;
  if (!fs.existsSync(target)) errors.push(`${path.relative(root, file)}: missing ${value}`);
}
for (const file of walk(root)) {
  if (!/\.(?:html|css|js)$/.test(file)) continue;
  const text = fs.readFileSync(file, 'utf8');
  if (file.endsWith('.js')) {
    try { new vm.Script(text, { filename: file }); scripts++; } catch (error) { errors.push(error.message); }
  }
  if (file.endsWith('.html')) {
    for (const match of text.matchAll(/\b(?:src|href)\s*=\s*["']([^"']*)["']/gi)) checkReference(file, match[1]);
    for (const match of text.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
      if (/\bsrc\s*=/.test(match[1]) || !match[2].trim() || /application\/(?:ld\+)?json/.test(match[1])) continue;
      try { new vm.Script(match[2], { filename: file }); scripts++; } catch (error) { errors.push(error.message); }
    }
  }
  if (!file.endsWith('.js')) for (const match of text.matchAll(/url\(\s*["']?([^\s)'";]+)["']?\s*\)/g)) checkReference(file, match[1]);
}
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log(`${scripts} scripts parsed; ${references} local asset references resolved.`);
