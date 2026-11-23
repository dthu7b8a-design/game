import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const read = (file) => readFileSync(join(root, file), 'utf8');
const routes = ['nanzhu', 'nvzhu', 'zhangfu'];

function storage(initial = {}) {
    return Object.assign({}, initial, {
        getItem(key) { return this[key] ?? null; },
        setItem(key, value) { this[key] = String(value); }
    });
}

function scene(route, chapter) {
    const nodes = Object.fromEntries(['name', 'texts', 'small_pic', 'message'].map((id) => [id, {
        innerHTML: '', src: '', classList: { add() {}, remove() {} }
    }]));
    const shown = [];
    const navigations = [];
    const localStorage = storage({ userid: 'player' });
    const context = vm.createContext({
        document: { getElementById(id) { return nodes[id]; }, body: {} },
        window: {
            location: { href: `http://localhost/主线/${route}/html/${chapter}.html`, replace(url) { navigations.push(url); } },
            getComputedStyle() { return { backgroundImage: 'url("scene.png")' }; }
        },
        localStorage, console: { log() {}, error() {} }, setTimeout() {},
        $(selector) {
            return {
                hide() {}, fadeIn() { shown.push(selector); },
                fadeOut(duration, complete) { complete(); }
            };
        }
    });
    vm.runInContext(read(`主线/${route}/js/${chapter}.js`), context);
    vm.runInContext(read(`主线/${route}/op1.js`), context);
    vm.runInContext(read(`主线/${route}/op2.js`), context);
    return { context, nodes, shown, navigations, localStorage };
}

test('every ordinary scene preserves all dialogue and valid portrait resources', () => {
    let scenes = 0;
    for (const route of routes) {
        for (const filename of readdirSync(join(root, '主线', route, 'html'))) {
            const chapter = filename.replace('.html', '');
            if (chapter.startsWith('end') || (route === 'nvzhu' && chapter.startsWith('2-3'))) continue;
            const { context, nodes, navigations, shown } = scene(route, chapter);
            const { op } = context;
            assert.equal(nodes.texts.innerHTML, '', `${route}/${chapter}: preserve first-click start`);
            assert.equal(op.steps, op.texts.length, `${route}/${chapter}: missing dialogue`);
            assert.equal(op.name.length, op.steps);
            assert.equal(op.small.length, op.steps);
            for (let index = 0; index < op.steps; index++) {
                context.next_move();
                assert.equal(nodes.texts.innerHTML, op.texts[index]);
                assert.equal(nodes.name.innerHTML, op.name[index]);
                assert.ok(!nodes.small_pic.src.endsWith('/.png'));
                assert.ok(existsSync(join(root, nodes.small_pic.src.replace('../../../', ''))));
            }
            assert.deepEqual(navigations, []);
            context.next_move();
            if (op.type === 0) assert.deepEqual(navigations, [op.nextpage]);
            else assert.ok(shown.includes('#selection_box'));
            scenes++;
        }
    }
    assert.equal(scenes, 42);
});

test('SKIP keeps the existing final-line and branch/next-page behavior', () => {
    for (const [route, chapter] of [['nanzhu', '1'], ['nvzhu', '2-1'], ['zhangfu', '3']]) {
        const { context, nodes, shown, navigations } = scene(route, chapter);
        context.skipDialogue();
        assert.equal(nodes.texts.innerHTML, context.op.texts.at(-1));
        assert.equal(context.click, context.op.steps);
        if (context.op.type === 0) assert.deepEqual(navigations, [context.op.nextpage]);
        else assert.ok(shown.includes('#selection_box'));
    }
});

test('all three original engine paths retain the same corrected behavior', () => {
    for (const route of routes) assert.equal(read(`主线/${route}/op1.js`), read('主线/nanzhu/op1.js'));
});

test('SAVE retains user/role keys and the existing chapter-bookmark format', () => {
    for (const [index, route] of routes.entries()) {
        const { context, localStorage } = scene(route, route === 'nvzhu' ? '2' : '1');
        context.next_move();
        context.next_move();
        context.saveGame(`role${index + 1}`);
        const saved = JSON.parse(localStorage.getItem(`saveData_player_role${index + 1}`));
        assert.deepEqual(Object.keys(saved).sort(), ['background', 'firstLine', 'time', 'url']);
        assert.equal(saved.firstLine, context.op.texts[0]);
        assert.equal(saved.url, context.window.location.href);
        assert.ok(Number.isFinite(Date.parse(saved.time)));
        assert.equal(saved.background, 'url("scene.png")');
    }
});

function complete(route, ending, localStorage) {
    vm.runInNewContext(read(`主线/${route}/js/end${ending}.js`), {
        window: { localStorage }, console: { log() {} }
    });
    return JSON.parse(localStorage.userArr);
}

test('all 14 completion scripts persist their achievement and aggregate on the final completion', () => {
    for (const [route, role, count] of [['nanzhu', 'zhengyi', 7], ['nvzhu', 'linwanxing', 4], ['zhangfu', 'jiabaonan', 3]]) {
        for (let ending = 1; ending <= count; ending++) {
            const marks = Object.fromEntries(Array.from({ length: count + 1 }, (_, index) => [`achi${index + 1}`, index < count ? 1 : 0]));
            marks[`achi${ending}`] = 0;
            const localStorage = storage({ userid: 'player', userArr: JSON.stringify({ player: { [role]: marks }, other: { sentinel: true } }) });
            const saved = complete(route, ending, localStorage);
            assert.equal(saved.player[role][`achi${ending}`], 1);
            assert.equal(saved.player[role][`achi${count + 1}`], 1, `${route}/end${ending}: aggregate must survive reload`);
            assert.deepEqual(saved.other, { sentinel: true });
        }
    }
});

test('three female narrative endings never grant the coin achievement', () => {
    const localStorage = storage({ userid: 'player', userArr: JSON.stringify({ player: {} }) });
    for (const ending of [1, 2, 3]) complete('nvzhu', ending, localStorage);
    let role = JSON.parse(localStorage.userArr).player.linwanxing;
    assert.equal(role.achi4, 0);
    assert.equal(role.achi5, 0);
    complete('nvzhu', 4, localStorage);
    role = JSON.parse(localStorage.userArr).player.linwanxing;
    assert.equal(role.achi4, 1);
    assert.equal(role.achi5, 1);
});

function interlude(filename, failAudio = false) {
    const html = read(`主线/nvzhu/html/${filename}`);
    const timers = new Map();
    const nodes = {};
    let timerId = 0;
    function element(id) {
        const listeners = new Map();
        return {
            style: {}, textContent: '', innerHTML: '', currentTime: 0, disabled: false,
            hidden: new RegExp(`id="${id}"[^>]*\\bhidden\\b`).test(html),
            addEventListener(type, listener) { listeners.set(type, listener); },
            fire(type, event = {}) { listeners.get(type)?.(event); },
            play() { return id === 'bgm' && failAudio ? Promise.reject(new Error('audio unavailable')) : Promise.resolve(); }
        };
    }
    const body = element('body');
    const window = { location: {}, addEventListener() {} };
    const context = vm.createContext({
        document: {
            body, getElementById(id) { return nodes[id] ??= element(id); },
            addEventListener(type, listener) { listener(); }
        },
        window,
        setTimeout(listener) { timers.set(++timerId, listener); return timerId; },
        clearTimeout(id) { timers.delete(id); }
    });
    const script = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map((match) => match[1]).find((source) => source.trim());
    vm.runInContext(script, context);
    function tick() {
        const pending = [...timers.values()];
        timers.clear();
        for (const listener of pending) listener();
    }
    return { nodes, timers, context, window, tick, body };
}

test('monologue rejects repeated starts and normal completion still waits for audio', () => {
    const { nodes, timers, tick, window } = interlude('2-3.html');
    nodes['start-btn'].fire('click');
    const firstCharacter = nodes['typewriter-text'].innerHTML;
    nodes['start-btn'].fire('click');
    assert.equal(timers.size, 1);
    assert.equal(nodes['typewriter-text'].innerHTML, firstCharacter);
    while (timers.size) tick();
    assert.equal(window.location.href, undefined);
    nodes.bgm.fire('ended');
    assert.equal(window.location.href, '2-3-1.html');
});

test('failed audio enables retry on the original button without restarting or skipping prose', async () => {
    const { nodes, timers, tick, window } = interlude('2-3.html', true);
    nodes['start-btn'].fire('click');
    await Promise.resolve();
    assert.equal(nodes['start-btn'].disabled, false);
    assert.equal(nodes['start-btn'].textContent, '音频播放失败，点击重试');
    const firstCharacter = nodes['typewriter-text'].innerHTML;
    nodes['start-btn'].fire('click');
    await Promise.resolve();
    assert.equal(nodes['start-btn'].disabled, false);
    assert.equal(timers.size, 1);
    assert.equal(nodes['typewriter-text'].innerHTML, firstCharacter);
    while (timers.size) tick();
    assert.ok(nodes['typewriter-text'].innerHTML.endsWith('直到那一天....。'));
    assert.equal(window.location.href, undefined);
    nodes['start-btn'].fire('click');
    await Promise.resolve();
    assert.equal(timers.size, 0);
    assert.equal(window.location.href, undefined);
});

test('rapid clicks on the eight-line interlude cannot queue or overrun the prose', () => {
    const { nodes, timers, context, tick, window, body } = interlude('2-3-1.html');
    for (let index = 0; index < 10; index++) body.fire('click');
    assert.equal(timers.size, 1);
    tick();
    assert.equal(nodes.textContainer.textContent, '“原来这一切都是你在骗我”');
    assert.equal(vm.runInContext('index', context), 1);
    for (let index = 1; index < 8; index++) { body.fire('click'); tick(); }
    const finalLine = nodes.textContainer.textContent;
    for (let index = 0; index < 10; index++) body.fire('click');
    tick();
    assert.equal(vm.runInContext('index', context), 8);
    assert.equal(nodes.textContainer.textContent, finalLine);
    assert.equal(nodes.jumpBtn.style.display, 'block');
    nodes.jumpBtn.fire('click');
    assert.equal(window.location.href, './end3.html');
});


test('ending pages never overwrite a missing, damaged or unauthenticated account', () => {
    for (const route of routes) {
        for (const name of readdirSync(join(root, '主线', route, 'js')).filter(name => /^end\d+\.js$/.test(name))) {
            for (const initial of [{}, {userid:'0',userArr:'{broken'}, {userid:'4',userArr:'[]'}, {userid:'0',userArr:'null'}, {userArr:'[{"username":"keep"}]'}]) {
                const localStorage = storage(initial);
                const original = localStorage.userArr;
                vm.runInNewContext(read(`主线/${route}/js/${name}`), {window:{localStorage}});
                assert.equal(localStorage.userArr, original, `${route}/${name}`);
            }
        }
    }
});
