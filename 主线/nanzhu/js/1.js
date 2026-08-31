var op = 
{   "type":1,
    
    "steps":4,
    
    "name":["","","",""],
    
    "texts":["2025年1月24日，你收到了一封邮件，邮件内容如下：",
            "“今年是重置年，等到12月31号午夜，整个世界就会恢复成1月1号的样子。在这一年里发生的所有事都会一笔勾销。只有被神明选中的你拥有这一年的记忆。你想完成一幅怎样盛大的作品？”",
            "——落款：心血来潮的神明......",
            "此时你心里想：......"
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
}