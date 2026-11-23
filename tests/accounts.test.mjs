import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import accounts from '../注册and登陆/js/accounts.js';

function storage(initial = {}) {
    const values = new Map(Object.entries(initial));
    return {
        get length() { return values.size; },
        key(index) { return [...values.keys()][index] ?? null; },
        getItem(key) { return values.has(key) ? values.get(key) : null; },
        setItem(key, value) { values.set(key, String(value)); },
        removeItem(key) { values.delete(key); }
    };
}

test('空账户、非法密码和两次密码不一致均不写入档案', () => {
    const local = storage();
    for (const input of [['  ', 'abc123', 'abc123'], ['A', '', ''], ['A', 'abc123', 'abc124']]) {
        assert.ok(accounts.register(local, ...input).error);
        assert.equal(local.getItem('userArr'), null);
    }
});

test('注册保留旧用户结构与嵌套成就，拒绝重复账户', () => {
    const old = { username: 'old', password: 'legacy', zhengyi: { achi4: 1 }, custom: true };
    const local = storage({ userArr: JSON.stringify([old]) });
    assert.ok(accounts.register(local, 'old', 'abc123', 'abc123').error);
    assert.deepEqual(accounts.register(local, ' new ', 'abc123', 'abc123'), { username: 'new' });
    assert.deepEqual(JSON.parse(local.getItem('userArr')), [old, { username: 'new', password: 'abc123', likability: 0 }]);
});

test('失败登录不清除原会话或存档', () => {
    const local = storage({ userArr: '[{"username":"old","password":"x"}]', userid: '0', username: 'old', saveData_0_role1: 'save' });
    assert.ok(accounts.login(local, '', '').error);
    assert.ok(accounts.login(local, 'old', 'wrong').error);
    assert.equal(local.getItem('userid'), '0');
    assert.equal(local.getItem('username'), 'old');
    assert.equal(local.getItem('saveData_0_role1'), 'save');
});

test('旧短密码及带空格账户仍可登录，用户索引与各角色存档保持原样', () => {
    const local = storage({ userArr: '[{"username":"first","password":"x"},{"username":" old ","password":"x","GameName":"chapter"}]', achi6: '1', saveData_1_role2: 'save' });
    assert.equal(accounts.login(local, ' old ', 'x').index, 1);
    assert.equal(local.getItem('userid'), '1');
    assert.equal(local.getItem('GameName'), 'chapter');
    assert.equal(local.getItem('achi6'), null);
    assert.equal(local.getItem('saveData_1_role2'), 'save');
});

test('损坏档案不会在注册或登录时被覆盖', () => {
    const local = storage({ userArr: '{broken', userid: '0' });
    assert.throws(() => accounts.register(local, 'new', 'abc123', 'abc123'));
    assert.throws(() => accounts.login(local, 'new', 'abc123'));
    assert.equal(local.getItem('userArr'), '{broken');
    assert.equal(local.getItem('userid'), '0');
});

test('退出仅清会话；维护清理只删除本游戏已知记录', () => {
    const local = storage({ userid: '0', userArr: '[]', saveData_0_role1: 'save', unlockNotice_0_role2: 'true', anotherApp: 'keep' });
    accounts.clearSession(local);
    assert.equal(local.getItem('userid'), null);
    assert.equal(local.getItem('userArr'), '[]');
    assert.equal(local.getItem('saveData_0_role1'), 'save');
    accounts.clearAppData(local);
    assert.equal(local.getItem('userArr'), null);
    assert.equal(local.getItem('saveData_0_role1'), null);
    assert.equal(local.getItem('unlockNotice_0_role2'), null);
    assert.equal(local.getItem('anotherApp'), 'keep');
});

function renderMenu(initial) {
    const local = storage(initial);
    const nodes = new Map();
    function element(id) {
        if (!nodes.has(id)) {
            const attributes = new Map([['href', 'original-route']]);
            const classes = new Set();
            nodes.set(id, {
                id, attributes, classes, style: {}, events: {}, firstChild: { textContent: '' }, disabled: true,
                classList: { add: value => classes.add(value), remove: value => classes.delete(value) },
                setAttribute: (key, value) => attributes.set(key, value),
                removeAttribute: key => attributes.delete(key),
                addEventListener(name, handler) { this.events[name] = handler; },
                querySelector: selector => element(id + (selector === '.new-game-btn' ? '-start' : selector === 'h2' ? '-title' : '-close')),
                showModal() { this.open = true; },
                focus() {}
            });
        }
        return nodes.get(id);
    }
    let ready;
    const location = { href: 'http://localhost:4173/注册and登陆/menu.html' };
    vm.runInNewContext(fs.readFileSync(new URL('../注册and登陆/js/menu.js', import.meta.url), 'utf8'), {
        document: { addEventListener: (event, handler) => { if (event === 'DOMContentLoaded') ready = handler; }, getElementById: element, querySelector: element, querySelectorAll: () => [element('unlock-jiabaonan-modal'), element('unlock-linwanxing-modal')] },
        localStorage: local, LocalAccounts: accounts, URL, location, alert() {}
    });
    ready();
    return { local, element, location };
}

test('无当前账户或档案损坏时锁定所有开始入口且不写入记录', () => {
    for (const raw of ['[]', '{broken']) {
        const menu = renderMenu({ userArr: raw });
        for (const role of ['role1', 'role2', 'role3']) {
            const start = menu.element(role + '-archive-start');
            assert.equal(start.attributes.get('aria-disabled'), 'true');
            assert.equal(start.attributes.has('href'), false);
            assert.equal(menu.element(role + '-continue-text').classes.has('disabled'), true);
        }
        assert.equal(menu.local.getItem('userArr'), raw);
        assert.equal(menu.local.length, 1);
    }
});

test('解锁只依据当前用户成就，全局或他人提示标记不会跳过当前用户通知', () => {
    const users = [{ username: 'first' }, { username: 'second', zhengyi: { achi4: 1, achi5: 1, achi6: 1 } }];
    const menu = renderMenu({ userArr: JSON.stringify(users), userid: '1', role3_unlocked: 'true', unlockNotice_0_role3: 'true' });
    assert.equal(menu.element('role3-archive-start').classes.has('new-game-btn'), true);
    assert.equal(menu.element('role2-archive-start').attributes.get('aria-disabled'), 'true');
    assert.equal(menu.element('unlock-jiabaonan-modal').style.display, 'flex');
    assert.equal(menu.local.getItem('unlockNotice_1_role3'), null);
    menu.element('unlock-jiabaonan-modal-close').events.click();
    assert.equal(menu.local.getItem('unlockNotice_1_role3'), 'true');
});

test('继续游戏兼容旧file场景地址，拒绝其他角色地址并保留坏档案', () => {
    const valid = JSON.stringify({ url: 'file:///D:/old-game/主线/nanzhu/html/3.html', time: '2026-01-01', firstLine: '旧场景' });
    const invalid = JSON.stringify({ url: 'http://other/主线/nanzhu/html/1.html' });
    const menu = renderMenu({ userArr: '[{"username":"old"}]', userid: '0', saveData_0_role1: valid, saveData_0_role2: invalid });
    assert.equal(menu.element('role1-continue-text').classes.has('disabled'), false);
    menu.element('role1-continue-text').events.click();
    assert.equal(decodeURI(menu.location.href), 'http://localhost:4173/主线/nanzhu/html/3.html');
    assert.equal(menu.element('role2-continue-text').classes.has('disabled'), true);
    assert.equal(menu.local.getItem('saveData_0_role2'), invalid);
});
