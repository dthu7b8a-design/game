var op = 
{   "type":0,
    
    "nextpage":"./3-1-1.html",
    
    "steps":5,
    
    "name":["","","","",""],
    
    "texts":["就在你犹豫之时，整个车辆突然爆炸，爆炸气浪将你掀飞在路边花坛，碎玻璃如雨点般落下。",
            "当你从昏迷中醒来，警笛声已由远及近。",
            "警戒线内火光冲天，小轿车的残骸像被捏碎的火柴盒，",
            "车内泄漏的制冷剂带着甜腻的氯仿味，与突然破裂的香水瓶混合成诡异的芬芳。",
            "你闻到了熟悉的香味，即使多年未见，你仍然记得那就是你的初恋林晚星身上的味道......"
        ],
    
    "small":["","","","",""],

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
    if(press== 3)
    {
        var mus = document.getElementById("yinxiao2");
        mus.play();
        mus.loop = false;
        mus.preload = true;//音频预加载
        mus.volume = 1; 
    }
}