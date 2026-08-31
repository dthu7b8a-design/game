var op = 
{   "type":0,
    
    "nextpage":"./6.html",
    
    "steps":6,
    
    "name":["","","","","",""],
    
    "texts":["你们在边境小镇租了间临海木屋，每天清晨一起去渔港买最新鲜的海鱼和水果。",
        "你时常会跟随渔民出海打渔养家糊口。她会在你出门时织些帽子毛衣等补贴家用，过得和寻常人家没有任何区别，可她的针脚细密得像在修补什么，而你总是耿耿于怀时常望着海面发呆。",
        "日子过的很快，转眼间一年时间过去了......",
        "当时间变为2026年1月1日0点，一切都并没有重置，你才发现自己完完全全被眼前的这女人给骗了!",
        "各种情绪萦绕心头，一时不知该遗憾没能回去，还是愤怒于女人的背叛。",
        "时间并没有回到最初，而是继续流逝。正常的、平凡的升起了明天的太阳......"
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