var op = 
{   "type":0,
    
    "nextpage":"./6-2-1.html",
    
    "steps":5,
    
    "name":["[郑义]","","[林晚星]","","[郑义]"],
    
    "texts":["自首吧，纠正你曾经的过错。放过自己也放过我吧。",
        "林晚星自首那天，港口的雾特别浓。她在警车上突然摇下车窗",
        "帮我转告儿子，妈妈不是坏人。",
        "你看着警车消失在雾中，默默说道",
        "我会等你的..."
            ],
    
    "small":["zynormal","","lwxsad","","zynormal"],

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