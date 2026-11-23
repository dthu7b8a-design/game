document.addEventListener('DOMContentLoaded', () => {
    let users = [];
    try { users = LocalAccounts.readUsers(localStorage); }
    catch (error) { alert('本地档案无法读取，原始数据已保留。'); }
    const userId = localStorage.getItem('userid');
    const user = userId !== null && /^\d+$/.test(userId) ? users[Number(userId)] : null;
    const unlocked = {
        role1: Boolean(user),
        role2: Boolean(user && Number((user.jiabaonan || {}).achi3) === 1),
        role3: Boolean(user && [4, 5, 6].every(number => Number((user.zhengyi || {})['achi' + number]) === 1))
    };
    const folders = { role1: 'nanzhu', role2: 'nvzhu', role3: 'zhangfu' };
    const notices = [];
    const buttons = {};
    Object.keys(folders).forEach(role => {
        const archive = document.getElementById(role + '-archive');
        const button = archive.querySelector('.new-game-btn');
        buttons[role] = button;
        if (!unlocked[role]) {
            button.classList.add('locked');
            button.classList.remove('new-game-btn');
            button.innerText = 'Locked';
            button.removeAttribute('href');
            button.setAttribute('aria-disabled', 'true');
            button.tabIndex = -1;
            button.style.pointerEvents = 'none';
            button.style.opacity = '0.6';
        } else {
            button.classList.remove('locked');
            button.classList.add('new-game-btn');
            button.innerText = '新游戏';
            if (role !== 'role1' && localStorage.getItem('unlockNotice_' + userId + '_' + role) !== 'true') notices.push(role);
        }
        const continueButton = document.getElementById(role + '-continue-text');
        continueButton.classList.add('disabled');
        continueButton.setAttribute('role', 'button');
        continueButton.setAttribute('aria-disabled', 'true');
        continueButton.tabIndex = -1;
        if (!user) return;
        const rawSave = localStorage.getItem('saveData_' + userId + '_' + role);
        if (!rawSave) return;
        try {
            const data = JSON.parse(rawSave);
            const pathname = decodeURI(new URL(data.url, location.href).pathname);
            const marker = '/主线/' + folders[role] + '/html/';
            const position = pathname.indexOf(marker);
            if (position < 0 || !/^[\w-]+\.html$/.test(pathname.slice(position + marker.length))) throw new Error('无效场景');
            const destination = new URL('../' + pathname.slice(position + 1), location.href);
            const resume = () => { location.href = destination.href; };
            const saveTime = document.getElementById(role + '-save-time');
            const preview = document.getElementById(role + '-dialogue');
            const noSave = document.getElementById(role + '-no-save');
            archive.style.background = 'rgba(0, 30, 60, 0.6)';
            const date = new Date(data.time);
            saveTime.innerText = Number.isNaN(date.getTime()) ? '已有场景存档' : '保存于：' + date.toLocaleString();
            continueButton.classList.remove('disabled');
            continueButton.setAttribute('aria-disabled', 'false');
            continueButton.tabIndex = 0;
            continueButton.addEventListener('click', resume);
            continueButton.addEventListener('keydown', event => {
                if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); resume(); }
            });
            saveTime.addEventListener('click', resume);
            if (typeof data.firstLine === 'string' && data.firstLine) {
                const end = data.firstLine.indexOf('。');
                preview.innerText = end < 0 ? data.firstLine : data.firstLine.slice(0, end) + '...';
                preview.style.display = 'block';
            }
            noSave.style.display = 'none';
        } catch (error) {
            document.getElementById(role + '-no-save').innerText = '存档无法读取，原始数据已保留';
        }
    });

    let currentRole;
    let currentModal;
    let previousFocus;
    function showNextNotice() {
        currentRole = notices.shift();
        if (!currentRole) return;
        currentModal = document.getElementById(currentRole === 'role3' ? 'unlock-jiabaonan-modal' : 'unlock-linwanxing-modal');
        previousFocus = document.activeElement;
        currentModal.setAttribute('role', 'dialog');
        currentModal.setAttribute('aria-modal', 'true');
        const heading = currentModal.querySelector('h2');
        heading.id = currentModal.id + '-title';
        currentModal.setAttribute('aria-labelledby', heading.id);
        currentModal.style.display = 'flex';
        currentModal.querySelector('.close-btn').focus();
    }
    function closeNotice() {
        if (!currentModal) return;
        currentModal.style.display = 'none';
        localStorage.setItem('unlockNotice_' + userId + '_' + currentRole, 'true');
        currentModal = null;
        if (notices.length) showNextNotice();
        else if (previousFocus && previousFocus.focus) previousFocus.focus();
        else buttons[currentRole].focus();
    }
    document.querySelectorAll('.modal').forEach(modal => {
        modal.querySelector('.close-btn').addEventListener('click', closeNotice);
        modal.addEventListener('click', event => { if (event.target === modal) closeNotice(); });
    });
    document.addEventListener('keydown', event => {
        if (!currentModal) return;
        if (event.key === 'Escape') { event.preventDefault(); closeNotice(); }
        if (event.key === 'Tab') { event.preventDefault(); currentModal.querySelector('.close-btn').focus(); }
    });
    showNextNotice();
});
