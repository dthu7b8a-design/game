import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('original page style blocks and stylesheet rules are retained', () => {
  const baseline = JSON.parse(read('tests/fixtures/original-ui.json'));
  for (const [file, hash] of Object.entries(baseline)) {
    // This stylesheet has a targeted cascade repair for unlocked achievement cards.
    if (file === '成就界面/self/css/style.css') continue;
    const text = read(file);
    const styles = file.endsWith('.css') ? text : [...text.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map(match => match[1]).join('\n');
    assert.equal(createHash('sha256').update(styles.replace(/\r\n/g, '\n').trim()).digest('hex'), hash, file);
    assert.doesNotMatch(text, /design-system\.css|story-ui\.js|team\.css/, file);
  }
});

test('actual scene HTML loads the engine, save/audio helpers and jQuery; endings omit the dialogue engine', () => {
  let ordinary = 0, endings = 0;
  for (const route of ['nanzhu', 'nvzhu', 'zhangfu']) {
    const folder = `主线/${route}/html`;
    for (const name of fs.readdirSync(path.join(root, folder))) {
      const html = read(`${folder}/${name}`);
      assert.doesNotMatch(html, /onload="initGame\(/, name);
      const scripts = [...html.matchAll(/<script\b[^>]*src="([^"]+)"/g)].map(match => path.posix.normalize(`${folder}/${match[1]}`));
      if (name.startsWith('end')) {
        assert.ok(!scripts.some(file => file.endsWith('/op1.js')), name);
        endings++;
      } else if (!(route === 'nvzhu' && ['2-3.html', '2-3-1.html'].includes(name))) {
        for (const file of [`主线/${route}/op1.js`, `主线/${route}/op2.js`, `主线/${route}/jquery-3.6.0.js`]) assert.ok(scripts.includes(file), `${folder}/${name}: ${file}`);
        assert.ok(scripts.some(file => file === `主线/${route}/js/${name.replace('.html', '.js')}`));
        ordinary++;
      }
    }
  }
  assert.equal(ordinary, 42);
  assert.equal(endings, 14);
});

test('seven introduction pages and three navigation entries retain valid local references', () => {
  const introduction = path.join(root, '注册and登陆/introduction');
  const pages = folder => fs.readdirSync(folder, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(folder, entry.name);
    return entry.isDirectory() ? pages(file) : file.endsWith('.html') ? [file] : [];
  });
  assert.ok(fs.existsSync(introduction), 'introduction directory');
  const introductions = pages(introduction);
  assert.equal(introductions.length, 7);
  for (const file of introductions) {
    const html = fs.readFileSync(file, 'utf8');
    for (const [, reference] of html.matchAll(/(?:src|href)\s*=\s*["']([^"']*)["']/gi)) {
      if (!reference || /^(?:https?:|\/\/|#|data:|javascript:|mailto:)/i.test(reference)) continue;
      const target = path.resolve(path.dirname(file), decodeURI(reference.split(/[?#]/)[0]));
      assert.ok(fs.existsSync(target), `${path.relative(root, file)}: ${reference}`);
    }
  }
  for (const file of ['注册and登陆/menu.html', '成就界面/achievement/achievement.html', '玩法介绍/玩法介绍.html']) {
    const entry = [...read(file).matchAll(/href\s*=\s*["']([^"']*)["']/gi)]
      .map(match => match[1]).find(reference => /introduction\/intro\/intro\.html$/.test(reference));
    assert.ok(entry, `${file}: introduction navigation`);
    assert.ok(fs.existsSync(path.resolve(root, path.dirname(file), entry)), file);
  }
});
