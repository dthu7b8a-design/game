var op = 
{   "type":1,
    
    "steps":11,
    
    "name":["","","","","","[贾宝南]","[林晚星]","[贾宝南]","","[林晚星]",""],
    
    "texts":["那个臭婆娘根本就不懂，本来你只想着教训她几次，乖乖把钱交给你让你拿去尝试发财的机会，但她却冥顽不灵。",
        "你跟她说了有关重置年的事她也不信，还说你有病，带回来几种药给你吃...几次下来你也懒得和她争辩，拳打脚踢带来的效果更快些。",
        "已经看这婆娘不顺眼好久了，反正新的一年一切都会重新开始，趁今年教训她也好。",
        "“咚咚咚”",/*bgm敲门*/
        "敲门声突然响起，开门站在门口的是林晚星——你的妻子，她眼中是掩饰不住的厌恶",
        "考虑的怎么样了?",
        "不可能！我不可能让你拿我们的房子去做抵押。",
        "你少管，我自有我的打算。",
        "林晚星眼中满是讥讽与不耐烦",
        "让开，我不想再说了，我是不可能让步的！",
        "你眉头紧锁，怒不可遏，呼吸变得沉重，抄起手边的台灯举了起来..."
    ],
    
    "small":["","","","","","jbnnormal","lwxangry","jbnnormal","","lwxangry",""],

    // "big":["none","none","none","none","none","none"],

    // "bigpos":["none","none","none","none","none","none"]
};
var press = 0;
function yinxiao()
{
    press++;
    if(press== 4)
    {
        var mus = document.getElementById("yinxiao1");
        mus.play();
        mus.loop = false;
        mus.preload = true;//音频预加载
        mus.volume = 1; 
    }
    if(press== 5)
    {
        var mus = document.getElementById("yinxiao2");
        mus.play();
        mus.loop = false;
        mus.preload = true;//音频预加载
        mus.volume = 1; 
    }
}