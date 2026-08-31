var op = 
{   "type":1,
    
    "steps":8,
    
    "name":["","","","[贾宝南]","","[林晚星]","",""],
    
    "texts":["台灯砸在林晚星额角的瞬间，碎裂声和她压抑的痛呼混在一起。你盯着她额头上渗出来的血，非但没慌，反而涌上一股扭曲的畸形欲望",
        "—— 你觉得这是 “让她清醒” 的代价，谁让她死活不信 “重置年” 能给全家带来好日子？",
        "她捂着头上的伤口，紧咬牙关，但仍用凌厉的目光盯着你，不出意料，她还是没有松口。",
        "为什么！为什么就不能相信我？我说了重置年后一定给你幸福！",
        "你揪住她的头发红着眼吼道。",
        "哪有什么重置年，醒醒吧贾宝南！别活在自己的幻想中了！",
        "气头上的你却什么都听不进去，只听到了她对你的不相信。四下环顾后，你又盯上了墙边的椅子，一把推开死死攥住椅腿的儿子，抄起椅子重重抡在林晚星身上。",
        "林晚星无力的趴在地上喘息着，眼中尽是恐惧。而此时你又拿起了断掉的椅腿"
    ],
    
    "small":["","","","jbnangry","","lwxsad","",""],

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
    if(press== 7)
    {
        var mus = document.getElementById("yinxiao2");
        mus.play();
        mus.loop = false;
        mus.preload = true;//音频预加载
        mus.volume = 1; 
    }
}