(function (root) {
    'use strict';
    const sessionKeys = ['userid', 'username', 'password', 'GameName', 'GameAddress', 'likability',
        'achi1', 'achi2', 'achi3', 'achi4', 'achi5', 'achi6', 'achi7', 'achi71', 'achi72', 'achi8'];

    function readUsers(storage) {
        const raw = storage.getItem('userArr');
        if (!raw || raw === 'undefined') return [];
        const users = JSON.parse(raw);
        if (!Array.isArray(users)) throw new Error('本地档案格式异常，请保留数据并检查备份。');
        return users;
    }

    function register(storage, username, password, confirmation) {
        username = username.trim();
        if (!username) return { error: '请输入账户名。', field: 'username' };
        if (!/^[a-zA-Z0-9]{6,10}$/.test(password)) return { error: '密码需要 6–10 位英文字母或数字。', field: 'password' };
        if (password !== confirmation) return { error: '两次输入的密码不一致。', field: 'confirmation' };
        const users = readUsers(storage);
        if (users.some(user => user && user.username === username)) return { error: '这个账户名已存在，请登录或换一个名称。', field: 'username' };
        users.push({ username, password, likability: 0 });
        storage.setItem('userArr', JSON.stringify(users));
        storage.setItem('username', username);
        storage.setItem('password', password);
        return { username };
    }

    function login(storage, username, password) {
        if (!username.trim()) return { error: '请输入账户名。', field: 'username' };
        if (!password) return { error: '请输入密码。', field: 'password' };
        const users = readUsers(storage);
        // 先精确匹配，以兼容旧档案中带空格的账户名。
        let index = users.findIndex(user => user && user.username === username);
        if (index < 0) index = users.findIndex(user => user && user.username === username.trim());
        if (index < 0 || users[index].password !== password) return { error: '账户名或密码不正确。', field: 'password' };
        const user = users[index];
        sessionKeys.forEach(key => storage.removeItem(key));
        storage.setItem('userid', String(index));
        ['username', 'password', 'GameName', 'GameAddress', 'likability', 'achi1', 'achi2', 'achi3',
            'achi4', 'achi5', 'achi6', 'achi7', 'achi8'].forEach(key => {
            if (user[key] !== undefined) storage.setItem(key, String(user[key]));
        });
        storage.setItem('achi71', '0');
        storage.setItem('achi72', '0');
        return { index, user };
    }

    function clearSession(storage) {
        sessionKeys.forEach(key => storage.removeItem(key));
    }

    function clearAppData(storage) {
        const keys = [];
        for (let i = 0; i < storage.length; i++) keys.push(storage.key(i));
        keys.forEach(key => {
            if (sessionKeys.includes(key) || ['userArr', 'bgmVolume', 'bgmPlaying', 'role2_unlocked', 'role3_unlocked'].includes(key)
                || /^saveData_\d+_role[123]$/.test(key) || /^unlockNotice_\d+_role[23]$/.test(key)) storage.removeItem(key);
        });
    }

    const api = { readUsers, register, login, clearSession, clearAppData };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    root.LocalAccounts = api;
    if (typeof document === 'undefined') return;
    document.addEventListener('DOMContentLoaded', () => {
        const form = document.getElementById('loginform');
        if (!form) return;
        const isRegister = form.dataset.mode === 'register';
        if (!isRegister) {
            const savedName = localStorage.getItem('username');
            form.elements.username.value = savedName && savedName !== 'undefined' ? savedName : '';
            form.elements.password.value = localStorage.getItem('password') || '';
        }
        form.addEventListener('submit', event => {
            event.preventDefault();
            try {
                const result = isRegister
                    ? register(localStorage, form.elements.username.value, form.elements.password.value, form.elements.confirmation.value)
                    : login(localStorage, form.elements.username.value, form.elements.password.value);
                if (result.error) {
                    alert(result.error);
                    form.elements[result.field].focus();
                    return;
                }
                if (isRegister) alert('注册成功！');
                location.href = isRegister ? 'login.html' : 'menu.html';
            } catch (error) {
                alert('本地档案无法读写，原始数据已保留。请检查浏览器存储设置或备份。');
            }
        });
    });
})(typeof globalThis !== 'undefined' ? globalThis : this);
