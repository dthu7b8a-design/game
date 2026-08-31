var op = 
{   "type":0,
    
    "nextpage":"./5-1-2.html",
    
    "steps":2,
    
    "name":["",""],
    
    "texts":["庭审当天，你在旁听席看到她儿子蜷缩在姥姥怀里，校服袖口露出淤青。",
        "当法官宣判“十五年有期徒刑”时，林晚星突然转头看向你，眼神里没有怨恨，只有一种解脱般的空洞。"/*bgm法官落槌*/
            ],
    
    "small":["",""],

    // "big":["none","none","none","none","none","none"],

    // "bigpos":["none","none","none","none","none","none"]
};
var press = 0;
function yinxiao()
{
    press++;
    if(press== 2)
    {
        var mus = document.getElementById("yinxiao1");
        mus.play();
        mus.loop = false;
        mus.preload = true;//音频预加载
        mus.volume = 1; 
    }
}