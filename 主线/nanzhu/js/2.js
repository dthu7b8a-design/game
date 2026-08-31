var op = 
{   "type":0,
    
    "nextpage":"./3.html",
    
    "steps":6,
    
    "name":["","","","","",""],
    
    "texts":["当天周六，你和几个朋友一起出去吃饭，你故意将饭馆选在滨海大道附近。",
            "你和朋友吃饭时就一直心神不宁，频繁拿手机看时间。",
            "朋友打趣你是不是谈恋爱了，等着女朋友发消息。",
            "临近八点，你再也坐不住了，不停催促朋友们赶紧吃完离开，",
            "你们一行人嘻嘻哈哈的打趣你是不是去接女朋友，你矢口否认但他们仍不相信继续调侃你。",
            "你向他们提议一起在附近遛遛弯、吹吹海风。可当你刚走出餐馆，发现腕表指针正正巧落在20:00。"
        ],
    
    "small":["","","","","",""],

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