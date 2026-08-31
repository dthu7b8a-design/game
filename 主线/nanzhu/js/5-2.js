var op = 
{   "type":0,
    
    "nextpage":"./5-2-1.html",
    
    "steps":2,
    
    "name":["",""],
    
    "texts":["帮林晚星处理完尸体的那个雨夜，你们在废弃码头烧掉沾满血污的衣物。",
        "火苗舔舐着她苍白的脸颊，你看着她手腕上新旧交叠的伤疤，没说什么，心中五味杂陈。"
            ],
    
    "small":["",""],

    // "big":["none","none","none","none","none","none"],

    // "bigpos":["none","none","none","none","none","none"]
};
var press = 0;
function yinxiao()
{
    press++;
    if(press== 1)
    {
        var mus = document.getElementById("yinxiao1");
        mus.play();
        mus.loop = false;
        mus.preload = true;//音频预加载
        mus.volume = 1; 
    }
}