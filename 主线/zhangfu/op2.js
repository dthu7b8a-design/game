function cundang() {
    var message = document.getElementById("message");
    message.classList.remove("visible", "hidden");
    message.classList.add("visible");
    setTimeout(function() {
    message.classList.add("hidden");
    }, 1000);
}
function saveGame(role) {
    console.log("saveGame function triggered");
    const userId = localStorage.getItem('userid'); // 获取当前用户ID
    if (!userId) {
        console.error("未找到用户ID，无法保存存档");
        return; // 确保用户已登录
    }

    const saveKey = `saveData_${userId}_${role}`; // 创建用户专属存档键名
    const currentUrl = window.location.href;
    const currentTime = new Date().toISOString();
    const backgroundImage = window.getComputedStyle(document.body).backgroundImage;
    const firstLineOfText = op.texts[0]; // 获取对话的第一句

    const saveData = {
        url: currentUrl,
        time: currentTime,
        background: backgroundImage,
        firstLine: firstLineOfText
    };

    localStorage.setItem(saveKey, JSON.stringify(saveData));
    console.log(`存档已保存: ${saveKey}`);
    cundang(); 
}
function bgmplay(){
    var _bgm = document.getElementById("bgm");
    _bgm.preload = true;
    if(_bgm.paused){
    _bgm.play()
    _bgm.loop = true
    }
}
