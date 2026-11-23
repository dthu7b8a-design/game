import fs from 'node:fs/promises';
import path from 'node:path';
const root = process.cwd();
const output = path.join(root, 'dist');
if (path.dirname(output) !== root || path.basename(output) !== 'dist') throw new Error('Unexpected output directory');
// Only the verified generated output directory is replaced.
await fs.rm(output, { recursive: true, force: true });
await fs.mkdir(output);
const entries = ['index.html', '素材', 'music', 'minigame', '注册and登陆', '主线', '成就界面', '玩法介绍', 'LICENSE'];
for (const entry of entries) await fs.cp(path.join(root, entry), path.join(output, entry), { recursive: true });
console.log('Static production files: dist/ (original routes and assets preserved)');
