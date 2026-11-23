import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);

// Execute the shipped inline scripts against a small DOM and controllable clock.
// This verifies the real game functions without a browser or copied game logic.
function loadGame(path) {
    const elements = [];
    const ids = new Map();
    const selectors = new Map();
    function element(tag = 'div') {
        const classes = new Set();
        const item = {
            tagName: tag.toUpperCase(), style: {}, dataset: {}, children: [], events: new Map(), attributes: {},
            parentNode: null, disabled: false, textContent: '',
            get className() { return [...classes].join(' '); },
            set className(value) { classes.clear(); value.split(/\s+/).filter(Boolean).forEach(value => classes.add(value)); },
            classList: { add: (...values) => values.forEach(value => classes.add(value)), remove: value => classes.delete(value), contains: value => classes.has(value) },
            addEventListener(type, listener) { const listeners = this.events.get(type) || []; listeners.push(listener); this.events.set(type, listeners); },
            emit(type, event = {}) { for (const listener of this.events.get(type) || []) listener({ currentTarget: this, preventDefault() {}, ...event }); },
            setAttribute(name, value) { this.attributes[name] = String(value); },
            appendChild(child) { this.children.push(child); child.parentNode = this; return child; },
            removeChild(child) { assert.ok(this.children.includes(child)); this.children.splice(this.children.indexOf(child), 1); child.parentNode = null; },
            remove() { if (this.parentNode) this.parentNode.removeChild(this); },
            focus() { this.focused = true; },
            setPointerCapture() {},
            get clientWidth() { return 800; }, get clientHeight() { return 600; },
            get offsetWidth() { return this === ids.get('pen') ? 100 : 40; },
            get offsetHeight() { return this === ids.get('pen') ? 20 : 40; },
            get offsetLeft() { return parseFloat(this.style.left) || 0; },
            get offsetTop() { return this === ids.get('pen') ? 550 : parseFloat(this.style.top) || 0; },
            getBoundingClientRect() { return { left: this.offsetLeft, right: this.offsetLeft + this.offsetWidth, top: this.offsetTop, bottom: this.offsetTop + this.offsetHeight }; },
            set innerHTML(value) { this.children.forEach(child => { child.parentNode = null; }); this.children = []; this.html = value; },
            get innerHTML() { return this.html || ''; }
        };
        elements.push(item);
        return item;
    }
    const html = readFileSync(new URL(path, root), 'utf8');
    for (const [, id] of html.matchAll(/id="([^"]+)"/g)) ids.set(id, element());
    for (const selector of ['.game-container', '.game-over', '.game-over .restart-btn', '.victory-screen .restart-btn']) selectors.set(selector, element());
    const life = Array.from({ length: 3 }, () => element());
    const document = {
        events: new Map(),
        addEventListener: function(type, listener) { const listeners = this.events.get(type) || []; listeners.push(listener); this.events.set(type, listeners); },
        getElementById: id => { assert.ok(ids.has(id), `missing id ${id}`); return ids.get(id); },
        querySelector: selector => selectors.get(selector),
        querySelectorAll: selector => selector === '.life' ? life : elements.filter(item => item.parentNode && selector.split(',').some(part => item.classList.contains(part.trim().slice(1)))),
        createElement: element
    };
    const window = { events: new Map(), location: { href: '' }, addEventListener: document.addEventListener };
    const intervals = new Map(), timeouts = new Map(), frames = new Map();
    let nextId = 1;
    const alerts = [];
    const context = vm.createContext({
        document, window, navigator: { userAgent: 'iPhone' }, alert: message => alerts.push(message),
        setInterval: (callback, ms) => { const id = nextId++; intervals.set(id, { callback, ms }); return id; },
        clearInterval: id => intervals.delete(id),
        setTimeout: (callback, ms) => { const id = nextId++; timeouts.set(id, { callback, ms }); return id; },
        clearTimeout: id => timeouts.delete(id),
        requestAnimationFrame: callback => { const id = nextId++; frames.set(id, callback); return id; },
        cancelAnimationFrame: id => frames.delete(id)
    });
    for (const [, source] of html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)) vm.runInContext(source, context, { filename: path });
    return {
        run: source => vm.runInContext(source, context), ids, selectors, document, window, intervals, timeouts, frames, alerts,
        tick: ms => { for (const { callback, ms: delay } of [...intervals.values()]) if (delay === ms) callback(); },
        emitWindow: (type, event = {}) => { for (const callback of window.events.get(type) || []) callback(event); }
    };
}

function puzzle() { return loadGame('minigame/解谜/解谜.html'); }
function coins() { return loadGame('minigame/接金币.html'); }
function board(game, rows, cols, empty = []) {
    game.run(`config.rows = ${rows}; config.cols = ${cols}; createGameBoard(); tiles.forEach(tile => tile.classList.remove('matched'));`);
    for (const [row, col] of empty) game.run(`getTileAt(${row}, ${col}).classList.add('matched')`);
}

test('puzzle repairs a shuffled full board with no legal opening without changing symbol counts', () => {
    const game = puzzle();
    game.run('shuffleArray = array => { for (let i=0;i<array.length;i++) array[i]=i%12; }; initGame();');
    assert.equal(game.run('tiles.some((a,i)=>tiles.slice(i+1).some(b=>a.dataset.type===b.dataset.type && canConnect(a,b)))'), true);
    assert.deepEqual(JSON.parse(game.run('JSON.stringify(Array.from({length:12},(_,type)=>tiles.filter(tile=>Number(tile.dataset.type)===type).length))')), Array(12).fill(4));
});

test('puzzle preserves 48 original tiles, four of each of 12 types, and resets one 120-second timer', () => {
    const game = puzzle();
    game.run('initGame(); initGame();');
    assert.equal(game.run('tiles.length'), 48);
    assert.equal(game.run('tiles.every(tile => tile.tagName === "DIV" && tile.children[0].className.includes("fas "))'), true);
    assert.deepEqual(JSON.parse(game.run('JSON.stringify(Array.from({length:12},(_,type)=>tiles.filter(tile=>Number(tile.dataset.type)===type).length))')), Array(12).fill(4));
    assert.equal(game.intervals.size, 1);
    assert.equal(game.run('timeLeft'), 120);
    game.tick(1000);
    assert.equal(game.run('timeLeft'), 119);
});

test('puzzle permits straight, one-corner and two-corner paths only through cleared tiles', () => {
    const game = puzzle();
    board(game, 3, 3);
    assert.equal(game.run('canConnect(getTileAt(0,0),getTileAt(0,1))'), true);
    assert.equal(game.run('canConnect(getTileAt(0,0),getTileAt(1,1))'), false);
    assert.equal(game.run('isTwoCornerConnected(0,0,0,1)'), false);
    board(game, 3, 3, [[1, 0]]);
    assert.equal(game.run('isOneCornerConnected(0,0,1,1)'), true);
    board(game, 3, 3, [[2, 0], [2, 1], [2, 2], [1, 0], [1, 2]]);
    assert.equal(game.run('isTwoCornerConnected(0,0,0,2)'), true);
    game.run("getTileAt(2,2).classList.remove('matched')");
    assert.equal(game.run('isTwoCornerConnected(0,0,0,2)'), false);
    board(game, 3, 3, [[0, 1]]);
    assert.equal(game.run('canConnect(getTileAt(0,0),getTileAt(0,2))'), true);
});

test('puzzle preserves selection, +10 score, completion and success/skip story routes', () => {
    const game = puzzle();
    game.run('initGame()');
    game.ids.get('jumpBtn').emit('click');
    assert.equal(game.window.location.href, '../../主线/nanzhu/html/6.html');
    game.run('config.rows=1; config.cols=2; createGameBoard();');
    game.run('handleTileClick({currentTarget:tiles[0]});handleTileClick({currentTarget:tiles[0]});');
    assert.equal(game.run('selectedTile'), null);
    assert.equal(game.run('score'), 0);
    game.run('handleTileClick({currentTarget:tiles[0]});handleTileClick({currentTarget:tiles[1]});');
    assert.equal(game.run('score'), 10);
    assert.equal(game.run('gameSuccess'), true);
    assert.equal(game.run('gameActive'), false);
    assert.equal(game.intervals.size, 0);
    game.ids.get('jumpBtn').emit('click');
    assert.equal(game.window.location.href, '../../主线/nanzhu/html/end7.html');
});

test('puzzle rejects different symbols and ends on timeout with timer cleared', () => {
    const game = puzzle();
    game.run('initGame();tiles[0].dataset.type=0;tiles[1].dataset.type=1;handleTileClick({currentTarget:tiles[0]});handleTileClick({currentTarget:tiles[1]});timeLeft=1;');
    assert.equal(game.run('score'), 0);
    game.tick(1000);
    assert.equal(game.run('gameActive'), false);
    assert.equal(game.run('gameSuccess'), false);
    assert.equal(game.intervals.size, 0);
    assert.equal(game.alerts.at(-1), '时间到！游戏结束');
});

test('coins registers controls once, resets keys on blur/cancel and bounds movement', () => {
    const game = coins();
    game.run('initGame(); initGame(); initGame();');
    assert.equal(game.document.events.get('keydown').length, 1);
    assert.equal(game.document.events.get('keyup').length, 1);
    assert.equal(game.ids.get('leftBtn').events.get('touchstart').length, 1);
    assert.equal(game.intervals.size, 1);
    assert.equal(game.frames.size, 1);
    game.ids.get('leftBtn').emit('touchstart');
    assert.equal(game.run('keys.ArrowLeft'), true);
    game.ids.get('leftBtn').emit('touchcancel');
    assert.equal(game.run('keys.ArrowLeft'), false);
    game.ids.get('rightBtn').emit('touchstart');
    game.ids.get('rightBtn').emit('touchcancel');
    assert.equal(game.run('keys.ArrowRight'), false);
    game.run('keys.ArrowLeft=true;keys.ArrowRight=true;');
    game.emitWindow('blur');
    assert.equal(game.run('keys.ArrowLeft || keys.ArrowRight'), false);
    game.run('pen.style.left="0px";keys.ArrowLeft=true;movePen();');
    assert.equal(game.ids.get('pen').style.left, '0px');
    game.run('keys.ArrowLeft=false;keys.ArrowRight=true;pen.style.left="700px";movePen();');
    assert.equal(game.ids.get('pen').style.left, '700px');
});

function nextItem(game, random) {
    game.run(`Math.random = () => ${random};createItem();`);
    return game.selectors.get('.game-container').children.find(item => item.classList.contains('jin') || item.classList.contains('bomb'));
}

test('coins keeps +1, every 10 points speedup, 50-point victory and both story routes', () => {
    const game = coins();
    game.run('initGame();');
    game.ids.get('jumpBtn').emit('click');
    assert.equal(game.window.location.href, '../主线/nvzhu/html/2-1-1.html');
    for (let i = 0; i < 50; i++) {
        const item = nextItem(game, 0.8);
        item.style.left = '0px'; item.style.top = '510px';
        game.tick(16);
    }
    assert.equal(game.run('count'), 50);
    assert.equal(game.run('gameSpeed'), 10);
    assert.equal(game.run('lives'), 3);
    assert.equal(game.run('gameWon'), true);
    assert.equal(game.run('gameActive'), false);
    assert.equal(game.intervals.size, 0);
    assert.equal(game.frames.size, 0);
    game.ids.get('jumpBtn').emit('click');
    assert.equal(game.window.location.href, '../主线/nvzhu/html/end4.html');
    game.run('initGame();');
    assert.equal(game.run('count'), 0);
    assert.equal(game.run('lives'), 3);
    assert.equal(game.run('gameSpeed'), 5);
    assert.equal(game.run('gameWon'), false);
    assert.equal(game.timeouts.size, 0);
});

test('coins loses lives for missed coins and caught bombs, but not missed bombs', () => {
    const game = coins();
    game.run('initGame();');
    let item = nextItem(game, 0.2);
    item.style.top = '535px'; game.tick(16);
    assert.equal(game.run('lives'), 3);
    item = nextItem(game, 0.8);
    item.style.top = '535px'; game.tick(16);
    assert.equal(game.run('lives'), 2);
    for (let i = 0; i < 2; i++) {
        item = nextItem(game, 0.2);
        item.style.left = '0px'; item.style.top = '510px'; game.tick(16);
    }
    assert.equal(game.run('lives'), 0);
    assert.equal(game.run('gameWon'), false);
    assert.equal(game.run('gameActive'), false);
    assert.equal(game.intervals.size, 0);
    assert.equal(game.frames.size, 0);
    game.ids.get('jumpBtn').emit('click');
    assert.equal(game.window.location.href, '../主线/nvzhu/html/2-1-1.html');
});

test('both games release scheduled resources when navigating away', () => {
    const game = coins();
    game.run('initGame();createItem();removeEffectAfterDelay([]);keys.ArrowLeft=true;');
    assert.equal(game.intervals.size, 2);
    game.emitWindow('pagehide');
    assert.equal(game.intervals.size + game.timeouts.size + game.frames.size, 0);
    assert.equal(game.run('keys.ArrowLeft'), false);
    const other = puzzle();
    other.run('initGame();');
    other.emitWindow('pagehide');
    assert.equal(other.intervals.size, 0);
});
