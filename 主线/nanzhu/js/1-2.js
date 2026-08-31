var op = 
{   "type":0,
    
    "nextpage":"./end1.html",
    
    "steps":5,
    
    "name":["","","","",""],
    
    "texts":["你毫不留情的点击删除键，将手机扔在床头柜，手机屏幕表面映出天花板泛黄的水渍 —— 就像过去三十年人生里无数个被忽略的细节。",
            "凌晨三点，厨房水龙头滴滴答答，你突然想起上周漏缴的水费通知单。",
            "第二天清晨，手机里的垃圾短信隐匿在角落。",
            "当你第 7 次拉黑骚扰电话时，楼下传来邻居争吵声 —— 王太太又在抱怨丈夫把烟灰撒在在沙发上。",/*争吵*/
            "阳光透过窗帘缝隙照在台历上，2025 年 1 月 24 日被红笔圈出，旁边歪歪扭扭写着“交电费”。",
            ],
    
    "small":["","","","",""],

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