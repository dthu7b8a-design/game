var op = 
{   "type":1,
    
    "steps":4,
    
    "name":["","","",""],
    
    "texts":["望向对面的马路时，一辆出租车像是故意向你展示般，径直撞向在前面行驶的一辆白色大众。",
            "“嘭——”",
            "白色大众像被巨锤砸中的瓷娃娃，车身被出租车的车头楔入三分之一，车身如纸片般向上翻卷，原本圆润的车身被挤压成畸形的 “W” 形。",
            "你看到这一幕，顿时浑身发凉。"
        ],
    
    "small":["","","",""],

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
    if(press== 2)
    {
        var mus = document.getElementById("yinxiao2");
        mus.play();
        mus.loop = false;
        mus.preload = true;//音频预加载
        mus.volume = 1; 
    }
}