var op = 
{   "type":0,
    
    "nextpage":"./2.html",
    
    "steps":2,
    
    "name":["",""],
    
    "texts":["你半信半疑的暂时接受了这个事实，紧接着神明又发来邮件：",
            "“2025年1月25日晚20点整，滨海大道与广顺路十字交叉路口将发生一起车祸。是一辆白色大众车，与一辆失控大货车相撞。如果不信的话，你可以验证一下。”"],
    
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