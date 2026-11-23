import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

test('failed music playback never reports playing or persists a false success state', async () => {
  const nodes = new Map();
  const element = id => {
    if (!nodes.has(id)) nodes.set(id, { volume: .5, paused: true, events: {}, addEventListener(event, fn) { this.events[event] = fn; } });
    return nodes.get(id);
  };
  element('bgm').play = () => Promise.reject(new Error('media failed'));
  const saved = new Map();
  const document = { getElementById: element, addEventListener(event, fn) { fn(); } };
  const html = readFileSync(new URL('../music/music-controls.html', import.meta.url), 'utf8');
  const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  vm.runInNewContext(script, { document, window: { top: { document } }, console, localStorage: { getItem: key => saved.get(key), setItem: (key, value) => saved.set(key, value) } });
  element('play-pause-btn').events.click();
  await Promise.resolve(); await Promise.resolve();
  assert.equal(element('music-status').textContent, '播放失败，请重试');
  assert.equal(element('play-icon').className, 'fas fa-play');
  assert.equal(saved.get('bgmPlaying'), 'false');
});
