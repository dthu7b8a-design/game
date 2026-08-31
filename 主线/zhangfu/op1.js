var count = op.steps; // 总点击次数
var pagename = op.nextpage;
var page_type = op.type; // 场景类型：0为自动跳转，1为分支选择，2为结局决定
var click = 0; // 当前点击次数
var skipped = false; // 是否跳过
var immediateTransition = false; // 新增一个变量，表示是否应立即跳转

function next_text() {
    $("#texts").hide();
    $("#name").hide();
    document.getElementById("name").innerHTML = op.name[click];
    document.getElementById("texts").innerHTML = op.texts[click];
    $("#texts").fadeIn();
    $("#name").fadeIn();
}

function goto(apage) {
    $("body").fadeOut(1000, function () {
        window.location.replace(apage);
    });
}

function skipDialogue() {
    click = count - 1; // 跳到最后一个对话
    skipped = true; // 设置跳过标志
    next_move(); // 调用 next_move 来更新界面
    immediateTransition = true; // 设置立即跳转标志
    performTransition();
}

function next_move() {
    if (click < count) {
        next_text();
        next_small();
        click++;
    } else {
        if (immediateTransition) { // 检查是否应立即跳转
            immediateTransition = false; // 重置标志
            skipped = false; // 重置跳过标志
            performTransition(); // 执行跳转
        } else if (!skipped) {
            performTransition(); // 执行跳转
        }
    }
}

// 执行页面跳转或显示选择框的逻辑
function performTransition() {
    switch (page_type) {
        case 0:
            goto(pagename);
            break;
        case 1:
            $("#selection_box").fadeIn();
            break;
        case 2:
            $("#_selection_box").fadeIn();
            break;
    }
}
// 显示小立绘
function next_small() {
    if (click == 0) {
        if (op.small[click] != "none") {
            document.getElementById("small_pic").src="../../../素材/立绘/"+op.small[click]+".png";
            $("#small_pic").fadeIn();
        }
        else {
            document.getElementById("small_pic").src = "../../../素材/立绘/transparent.png";
        }
    }
    else {
        if (op.small[click - 1] != op.small[click]) {
            $("#small_pic").hide();
            if (op.small[click] == "none") {
                document.getElementById("small_pic").src = "../../../素材/立绘/transparent.png";
            }
            else {
                document.getElementById("small_pic").src = "../../../素材/立绘/"+op.small[click]+".png";
            }
            $("#small_pic").fadeIn();
        }
    }
    return;
}

function MusicPlayer() {//对话框音效
    var music = document.getElementById("music");
    music.play();
    music.loop = false;
    music.preload = true;//音频预加载
    music.volume = 1;
}

function next_sound(){
    if(op.yinxiao[click] != "none"){
     $("#sound").attr("src", op.yinxiao[click]);
    var sound =document.getElementById("sound");
    sound.play();
    sound.loop = false;
    sound.volume = 1;
     }
    }