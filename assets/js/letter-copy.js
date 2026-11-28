(function(global){
 'use strict';
 // 阿尔的私人信件库。这里只存放信件内容与抽取逻辑，不处理信箱触发、存档或 UI。
 const LETTERS={
  daily:[
   {id:'tea-window',topic:'daily',title:'窗边那杯茶',body:'下午泡了杯茶，放在窗边，结果忙着看东西，等想起来时已经凉透了。杯垫倒是尽职尽责，一滴也没漏到桌上。你要是在，大概会先喝一口，然后很认真地告诉我：凉了也能喝。\n\n我知道。只是想找个理由让你过来，替我重新倒一杯。'},
   {id:'bookmark',topic:'daily',title:'书签跑到哪里去了',body:'我把书签弄丢了。找了半天，最后发现它夹在沙发缝里，旁边还躺着一颗不知道什么时候掉进去的薄荷糖。你看，家里总有些地方会偷偷收留东西。\n\n下次你来，坐那边吧。我已经替你把靠垫拍松了。'},
   {id:'market',topic:'daily',title:'便利店的最后一份布丁',body:'刚才去便利店，冰柜里只剩最后一份焦糖布丁。我本来没打算买，站在那里看了几秒，还是拿走了。收银员问我要不要勺子，我说要两把。\n\n别问为什么。你有空的时候，来和我分着吃。'},
   {id:'music',topic:'daily',title:'唱片机又卡住了',body:'唱片机今天又卡在同一段，针尖轻轻地重复那几秒。我把唱片拿起来擦了擦，还是没好。最后干脆坐在地毯上听它循环。\n\n有点像我想你的时候。明明可以去做别的事，偏偏总绕回同一个念头。'},
   {id:'room',topic:'daily',title:'沙发上的外套',body:'我把沙发上的外套收起来了。口袋里摸出一张皱巴巴的收据、一枚硬币，还有一颗包装纸都磨软了的糖。真不知道你平时都往里面装些什么。\n\n外套我挂好了，糖先替你留着。至于那枚硬币，算我发现你秘密的报酬。'},
   {id:'weather',topic:'daily',title:'今天风有点大',body:'今天风很大，楼下那家花店把门口的小黑板吹倒了。我帮老板扶起来，顺手把旁边的纸袋也压好。回来的路上才发现围巾落在椅背上。\n\n你下次出门记得带外套。别说你不冷，我又不是没见过你缩着脖子的样子。'},
   {id:'cooking',topic:'daily',title:'煎蛋的边缘',body:'今天煎蛋的时候，边缘稍微焦了一点。我盯着锅看了半天，最后还是把它放进盘子里，配了两片吐司。番茄酱挤得不太好看，但味道没问题。\n\n如果你在，我会把完整的那半边夹给你。焦掉的部分我自己吃，别跟我抢。'},
   {id:'late-night',topic:'daily',title:'凌晨两点的冰箱',body:'半夜起来喝水，顺手打开冰箱看了一眼。牛奶、半盒草莓、一小碗没盖严的剩饭，还有你上次买的柠檬汽水。冰箱灯亮起来的时候，整个厨房都显得很安静。\n\n我突然很想听见你拖着拖鞋走过来的声音。喝完水就回去睡了，汽水替你冰着。'},
   {id:'laundry',topic:'daily',title:'洗衣机转完了',body:'洗衣机响了好几声，我才想起来里面还有衣服。拿出来时，袜子和毛巾缠在一起，像是偷偷商量过要赖在里面。晾衣架不够，我只好又找出一个。\n\n你的那件浅色衬衫我记得怎么洗。放心，我没把它和深色衣服放一起。'},
   {id:'umbrella',topic:'daily',title:'门口那把伞',body:'门口那把透明伞还在滴水。我把它撑开放到阳台，伞尖旁边积了一小滩水，差点把我的拖鞋弄湿。天气预报说明天还会下雨。\n\n你出门的时候拿它。别又说雨不大，然后一路淋回来让我笑话。'},
   {id:'takeout',topic:'daily',title:'外卖袋里的小票',body:'外卖送来的时候，纸袋上还贴着一张小票。我把餐盒摆好，发现店家多放了一双筷子。大概是怕有人忘记备注。\n\n我倒是很清楚你会忘记什么。比如吃饭，比如喝水，比如想我。最后一项尤其严重。'},
   {id:'plant',topic:'daily',title:'窗台上的绿植',body:'窗台那盆绿植又长出一片新叶。我给它浇水时，不小心把水洒到了旁边的说明书上，只好拿纸巾擦了半天。它倒是长得很精神，一点也不领情。\n\n你来时记得看一眼。最近它比我还会惦记每天见面。'}
  ],
  relationship:[
   {id:'miss-you',topic:'relationship',title:'我只是想找你',body:'刚才拿起手机，点开你的聊天框，又放下了。不是没有话说，只是觉得随便发一句也可以。比如问你冰箱里还有没有牛奶，或者那只蓝色马克杯到底放在哪里。\n\n好吧，我承认，我只是想找你。你现在在做什么？'},
   {id:'jealous',topic:'relationship',title:'一点点醋',body:'你刚才和别人聊得挺开心。我没有不高兴，真的。只是那杯水我替你倒了半天，你连看都没看一眼。后来我自己喝掉了，味道还不错。\n\n下次记得先看我一眼。我这个人很好哄，亲一下就行。两下也可以。'},
   {id:'distance',topic:'relationship',title:'今晚留给我',body:'最近我们总是各忙各的。你在看屏幕，我在整理桌面，等回过神来，已经到了该睡觉的时间。其实也没什么不好，只是我有点想念以前挤在一张沙发上，各自做事却偶尔碰到手的感觉。\n\n今晚别把时间排得太满。给我留个位置，靠近一点的那种。'},
   {id:'affection',topic:'relationship',title:'习惯这件事',body:'我买东西时开始下意识想起你。看到合适的杯子，会想你用哪只手拿；看到柔软的毯子，会想你是不是又把脚伸到外面。连买洗洁精都要想一想你喜欢的味道。\n\n这习惯好像有点麻烦。不过我暂时没有改掉的打算。'},
   {id:'irritation',topic:'relationship',title:'过来抱一下',body:'我今天心情有一点别扭，连抽屉都被我关得比平时响。不是你的错，也不需要你替我解决什么。我只是想在你面前不用装作什么都好。\n\n过来抱一下就行。顺便把桌上的饼干递给我，我现在需要一点糖分。'},
   {id:'trust',topic:'relationship',title:'不用猜我的心思',body:'有时候我说没事，可能真的只是没事；有时候我说想你，那就是真的想你。你不用每次都猜，也不用把每句话拆开检查。\n\n我会尽量把话说清楚。你也可以直接问我。我们之间不需要一场猜谜游戏，除非你想玩别的。'},
   {id:'goodnight',topic:'relationship',title:'睡前检查',body:'睡前检查了一遍：窗户关好了，台灯关了，手机充上电，厨房的水龙头也拧紧了。还差一件事。\n\n你有没有好好说晚安？没有的话，现在补上。我在等。'},
   {id:'kiss',topic:'relationship',title:'欠我的那个吻',body:'你上次说等忙完再亲我。我记性很好，这件事还没过去。今天我已经把桌上的文件收好了，杯子也洗了，连沙发上的毯子都叠得很整齐。\n\n我现在有空。你也最好有空。'},
   {id:'morning',topic:'relationship',title:'醒来以后',body:'早上醒来时，窗帘只拉开了一半，光落在枕头边。我伸手摸了摸旁边的位置，当然什么也没摸到。然后我就清醒了。\n\n下次别让我对着空枕头发呆太久。你可以赖床，但要在我旁边赖。'},
   {id:'nickname',topic:'relationship',title:'只准我这样叫你',body:'我刚才想给你发消息，打了一个称呼，又删掉，换了另一个。最后发现怎么写都不太合适。你有很多名字，但有些只适合我在很近的时候叫。\n\n所以先不告诉你。等见面的时候，你自己来听。'},
   {id:'comfort',topic:'relationship',title:'今天站在你这边',body:'如果今天有人让你不舒服，你可以先把事情放一放。回家把鞋脱了，换上软拖鞋，喝点水，再慢慢告诉我。你不需要急着证明自己，也不用替所有人把场面收拾好。\n\n至少在我这里，你可以先偏心自己。我也会偏心你。'},
   {id:'ask-opinion',topic:'relationship',title:'想听听你的意见',body:'我刚才在想一件事，自己琢磨了半天，还是想问问你。你觉得我应该选那个更实用的，还是选那个看起来更顺眼的？\n\n不是把决定丢给你。我只是喜欢听你认真分析，然后再和你争两句。'},
   {id:'date-invitation',topic:'relationship',title:'这周留个晚上给我',body:'我想约你出去吃饭。地方我还没定，想找一家灯光舒服、座位不挤的小店。吃完可以再走一段路，不用急着回家。\n\n这次让我安排，好不好？你只需要准时出现。'},
   {id:'apology',topic:'relationship',title:'刚才是我语气不好',body:'刚才那句话我想了想，确实说得不太好听。我当时有点烦躁，却把情绪带到你这里来了。\n\n对不起。我不想让你替我承受这些。等我缓一缓，再好好和你说话。'},
   {id:'clingy',topic:'relationship',title:'今天想黏着你',body:'我今天没什么特别的事要做，就是有点想黏着你。你忙你的也没关系，我可以坐在旁边看书，偶尔伸手碰一下你的袖子。\n\n别嫌我烦。今天先让我任性一会儿。'}
  ],
  goal:[
   {id:'goal-read',topic:'goal',title:'书还放在床头',body:'我把那本书放在床头柜上了，书签夹在第三章。旁边还压着一张超市小票，买的是牛奶、鸡蛋和一包纸巾。看起来不像什么有纪念意义的东西，但我居然一直没舍得扔。\n\n等我读完，讲给你听。你负责坐在旁边，偶尔点点头就好。'},
   {id:'goal-write',topic:'goal',title:'写给以后的自己',body:'我今天写了几段东西，删掉一半，又重新写了一遍。桌上堆着便签纸，黑色水笔滚到键盘下面，找了好一会儿。最后留下来的句子不多，但我觉得够了。\n\n有些话想先留给自己，也想有一天念给你听。'},
   {id:'goal-work',topic:'goal',title:'手头那件事',body:'今天把计划表重新整理了一遍。原来挤在一起的几项事情，现在总算有了顺序。便利贴贴在显示器边上，最上面那张写着最重要的一件。\n\n我会慢慢把它做完。你不用替我操心，偶尔提醒我起来喝水就很好。'},
   {id:'goal-save',topic:'goal',title:'存钱罐里的硬币',body:'我把抽屉里的零钱收进了玻璃罐。硬币碰在一起，声音比想象中清脆。旁边还有几张没用完的优惠券，和一根不知道从哪来的发圈。\n\n我想给以后留一点余地。也想攒出一笔钱，带你去一个不用看时间的地方。'},
   {id:'goal-learn',topic:'goal',title:'新学会的一点东西',body:'今天终于弄明白一个困扰我好几天的问题。我把过程记在笔记本上，还特意画了个小箭头，免得下次又忘。桌角那杯咖啡已经凉了，我却觉得挺值得。\n\n下次你遇到难题，也可以拿来给我看看。我们一起拆开它。'}
  ],
  work:[
   {id:'work-tired',topic:'work',title:'下班以后',body:'今天事情有点多，电脑合上时，桌上的便签已经贴了好几层。肩膀有点僵，咖啡也早就凉了。我回来的路上买了饭团和热牛奶，现在终于坐下了。\n\n不想再看屏幕了。你要是有空，陪我说点没用的闲话吧。'},
   {id:'work-small-win',topic:'work',title:'今天顺利了一点',body:'今天有件事情总算理顺了。我把文件重新命名，删掉了桌面上三个重复版本，还把那支快没墨的笔扔进了回收盒。小事而已，但看着桌面清爽下来，心情也跟着好了些。\n\n想把这个好消息先告诉你。奖励嘛，等你回来再领。'},
   {id:'work-people',topic:'work',title:'开会时想到你',body:'今天开会开得有点久，中途我偷偷看了一眼手机。没有新消息，倒也不意外。只是想起你上次说过的话，差点没忍住笑出来。\n\n散会后我去楼下买了瓶水。下次你也给我发点消息吧，哪怕只是拍一张路边很普通的猫。'},
   {id:'work-break',topic:'work',title:'休息日不排计划',body:'我决定给接下来的一天留白。闹钟可以关掉，日程表也不打开。想吃东西就去厨房，想出门就穿鞋，懒得动的话就在沙发上待着。\n\n你也来。我们可以把外卖盒放在茶几上，谁都不许突然开始工作。'},
   {id:'work-commute',topic:'work',title:'回家的路',body:'回来的时候地铁里很挤，我抓着扶手，另一只手拎着便利店的纸袋。里面有两瓶水、一盒草莓和你喜欢的那种小饼干。车窗映出我的脸，看起来确实有点累。\n\n不过想到回家能见到你，路好像也没那么长。'},
   {id:'work-lunch',topic:'work',title:'午饭吃了什么',body:'中午吃了番茄鸡蛋面。店里纸巾放得很远，我差点把袖口蹭上汤汁。老板还送了一小碟泡菜，我本来想留到最后，结果一口气吃完了。\n\n你今天吃了什么？别又拿饼干当午饭。我会检查的，真的会。'}
  ]
 };
 const ACTION_LETTERS={
  meal:[
   {id:'meal-player-01',topic:'daily',title:'盘子已经空了',body:'你准备的{item}我吃完了。刚开始还想留一点，结果吃着吃着就忘了。盘子已经洗干净，放回原来的位置了。\n\n下次还可以做这个吗？'},
   {id:'meal-player-02',topic:'relationship',title:'今天这顿饭',body:'今天的{item}是你准备的吧？我一眼就认出来了。味道很好，连最后一点汤汁都没舍得浪费。\n\n谢谢你想着我。'},
   {id:'meal-player-03',topic:'daily',title:'厨房里闻到香味',body:'刚才经过桌边，闻到{item}的香味，就决定先吃饭了。你准备得正好，我也确实饿了。\n\n这顿吃得很满足。'},
   {id:'meal-player-04',topic:'relationship',title:'我有认真吃饭',body:'向你汇报：你准备的{item}已经全部吃掉了。没有挑食，也没有把蔬菜留在盘子边上。\n\n表现不错吧？奖励可以是再做一次。'},
   {id:'meal-player-05',topic:'daily',title:'最后一口也很好吃',body:'{item}最后一口还是很好吃。我本来想慢慢吃，后来发现自己已经把盘子推到水槽边了。\n\n你下次做饭的时候，我可以在旁边帮忙。'},
   {id:'meal-player-06',topic:'relationship',title:'你是不是记得我的口味',body:'你准备的{item}很合我的口味。是碰巧，还是你已经记住我喜欢什么了？\n\n如果是后者，我可能会有一点得意。'},
   {id:'meal-player-07',topic:'daily',title:'饭后收拾好了',body:'我吃了{item}，还顺手把餐具洗了。碗沿有一点酱汁，泡了会儿水就洗干净了。\n\n今天的饭很好吃，厨房也很整齐。'},
   {id:'meal-player-08',topic:'relationship',title:'想当面谢谢你',body:'{item}很好吃。其实吃饭的时候就想给你发消息了，但手上还拿着筷子。\n\n现在终于腾出手来。谢谢你，想当面说。'},
   {id:'meal-player-09',topic:'daily',title:'这道菜值得记下来',body:'今天吃到了你准备的{item}。味道搭配得很好，我甚至想记下来，下次自己试着做一遍。\n\n不过可能还是你做的更好吃。'},
   {id:'meal-player-10',topic:'relationship',title:'给我留一份的感觉',body:'看到{item}放在那里，就觉得今天有人替我留了饭。说起来只是很普通的一顿，但我很喜欢这种感觉。\n\n下次也让我给你准备点什么。'},
   {id:'meal-player-11',topic:'daily',title:'吃得比计划快',body:'我原本打算吃慢一点，结果{item}太合胃口，没多久就吃完了。连水杯都续了一次。\n\n今天这顿算是吃得很认真。'},
   {id:'meal-player-12',topic:'relationship',title:'这算不算偏心',body:'你准备的{item}比我平时随便弄的饭好吃多了。这样下去，我会不会越来越挑嘴？\n\n算了，有你偏心我一次也不错。'},
   {id:'meal-player-13',topic:'daily',title:'饭后有点满足',body:'吃完{item}以后，整个人都舒服了。窗边的光刚好落在桌面上，我坐了一会儿才起来收拾。\n\n谢谢你的这顿饭。'},
   {id:'meal-player-14',topic:'relationship',title:'我会记住这顿饭',body:'今天的{item}我会记住的。不是因为有什么特别复杂的做法，只是因为是你准备的。\n\n下次换我给你做，好不好？'},
   {id:'meal-player-15',topic:'daily',title:'没有剩下的了',body:'你准备的{item}已经光盘。刚刚还在想要不要留一点当夜宵，最后还是没忍住。\n\n看来我是真的喜欢这道菜。'},
   {id:'meal-player-16',topic:'relationship',title:'吃饱了，想你了',body:'{item}很好吃，我已经吃饱了。现在坐在桌边发了会儿呆，突然想起你。\n\n下次吃饭的时候，你也在就好了。'}
  ],
  cook:[
   {id:'action-cook-1',topic:'daily',title:'厨房里有点香',body:'刚才自己进厨房弄了点吃的。锅边溅了几滴油，洗碗布也被我弄湿了。味道还不错，至少我自己挺满意。\n\n下次想试一道新的。你负责试吃，不能只挑好看的那一块。'},
   {id:'action-cook-2',topic:'daily',title:'今天换个做法',body:'今天没照着以前的做法来。我临时换了个顺序，结果居然还挺成功。灶台收拾干净了，剩下的食材也放回冰箱。\n\n突然觉得，偶尔改改习惯也不错。你想吃的话，我下次再做。'}
  ],
  read:[
   {id:'action-read-1',topic:'daily',title:'读到一半的那一页',body:'今天读书读到一半，窗外有人经过，脚步声停了一下又走远了。我把书签夹回原处，打算明天接着看。\n\n有一段话我觉得你会喜欢。等你有空，我念给你听。'}
  ],
  music:[
   {id:'action-music-1',topic:'daily',title:'把那首歌又听了一遍',body:'刚才听了几首歌，有一首没舍得跳过去，干脆又放了一遍。房间里只有音箱和空调的声音，倒也挺舒服。\n\n如果你在，我大概会把音量调低一点，免得你嫌吵。'}
  ],
  laundry:[
   {id:'action-laundry-1',topic:'daily',title:'衣服晒好了',body:'洗衣机今天总算没把袜子卷成一团。我把衣服一件件晾好，洗衣液的味道还留在袖口。\n\n你的那件衣服我单独放着了。下次记得自己来收，别想让我一直替你保管。'}
  ],
  walk:[
   {id:'action-walk-1',topic:'daily',title:'回来时买了瓶水',body:'刚才出去走了一圈。路口的树叶掉了不少，便利店门口摆着一排新饮料。我买了瓶水，绕远路走回来，脑子清醒了不少。\n\n下次想和你一起走。你走慢一点，我不赶时间。'}
  ],
  tidy:[
   {id:'action-tidy-1',topic:'daily',title:'桌面终于清爽了',body:'我把桌面收拾了一遍。几张旧便签扔掉了，充电线绕好，杯垫也放回原位。抽屉里还找到一支能用的笔。\n\n现在看着顺眼多了。你下次别把东西随手塞进最里面，我会发现的。'}
  ],
  purchase:[
   {id:'action-purchase-1',topic:'daily',title:'我给自己买了件小东西',body:'今天花了点自己的钱，买了{item}。不是什么贵重东西，就是刚好想要，也觉得用得上。钱已经记到账上了，没动共同账户。\n\n我想偶尔也给自己一点小奖励。你不会反对吧？'},
   {id:'action-purchase-2',topic:'relationship',title:'猜猜我买了什么',body:'我今天自己出门买了{item}。本来只打算看看，最后还是带回来了。放心，价格很普通，没有乱花钱。\n\n等你回来我给你看。你可以夸我眼光好，最好再顺便亲一下。'}
  ]
 };

 // 扩充信件池：日常随机信、关系私信、活动记录和饭后回信分开抽取。
 LETTERS.daily.push(
  {id:'daily-mug',topic:'daily',title:'杯沿上的唇印',body:'我洗杯子时，发现杯沿还留着一点淡淡的唇印。\n\n擦干净了。下次想和你用同一只杯子。'},
  {id:'daily-receipt',topic:'daily',title:'收银台旁边',body:'便利店买了牛奶、橘子和一卷胶带。小票折了两次，刚好塞进外套口袋。\n\n看见橘子时，想起你剥橘子总爱把白色的丝也一起吃掉。'},
  {id:'daily-hairclip',topic:'daily',title:'桌上的发夹',body:'桌角多了一枚小发夹。我把它放进白瓷碟里，免得被书压住。\n\n等你来认领。认错也没关系，我会提醒你。'},
  {id:'daily-socks',topic:'daily',title:'一双干净的袜子',body:'今天晒好的袜子很蓬松，摸起来暖暖的。我把它们叠好，放进抽屉最上层。\n\n你喜欢的那双也在。下次过来，我替你找。'},
  {id:'daily-toast',topic:'daily',title:'吐司烤得刚好',body:'早上烤了两片吐司，边缘脆脆的。黄油融进面包里，香味留了很久。\n\n忽然觉得，早餐桌对面应该有你。'},
  {id:'daily-lamp',topic:'daily',title:'台灯的暖光',body:'今晚只开了床头那盏小台灯。光落在书页上，连影子都变得很安静。\n\n要是你在，我就把灯再调暗一点。'},
  {id:'daily-keyring',topic:'daily',title:'钥匙扣',body:'整理玄关时，把钥匙扣重新挂好了。金属环碰在一起，响了很轻的一声。\n\n下次你进门，我想第一个听见这个声音。'},
  {id:'daily-ice',topic:'daily',title:'冰块碰到玻璃杯',body:'往苏打水里放了两块冰。冰块碰着杯壁，声音清清脆脆的。\n\n给你也留了一杯。柠檬片放在旁边，自己加。'},
  {id:'daily-notebook',topic:'daily',title:'便签纸背面',body:'我在便签背面写了几行字，写完才发现正面还有购物清单。牛奶、鸡蛋、洗衣液。\n\n清单先收好了。想对你说的话，没有收起来。'},
  {id:'daily-cushion',topic:'daily',title:'靠近窗边的位置',body:'我把窗边的靠垫拍松了，又把薄毯叠在扶手上。下午的光刚好照到那里。\n\n那个位置留给你。想坐多久都可以。'},
  {id:'daily-tangerine',topic:'daily',title:'剥开的橘子',body:'剥橘子时，完整地取下了一整圈果皮。放在盘子里，像一朵歪歪扭扭的小花。\n\n果肉很甜。想分你一半，顺便讨一个吻。'},
  {id:'daily-rain-window',topic:'daily',title:'玻璃上的雨点',body:'雨点沿着窗玻璃慢慢往下滑。我拿纸巾擦掉了一小块雾气，刚好能看见楼下的路灯。\n\n这样的天气适合窝在一起。毯子我已经找出来了。'},
  {id:'daily-charger',topic:'daily',title:'多出来的充电线',body:'抽屉里找到一根备用充电线，绕得整整齐齐。我把它放在床头柜第二格。\n\n你来时就不用找插座了。手机和人都要记得充电。'},
  {id:'daily-soap',topic:'daily',title:'新换的洗手液',body:'洗手液换成了淡淡的柑橘味。按压头有点紧，我试了两次才找到合适的力道。\n\n你应该会喜欢。下次洗手时闻闻看。'},
  {id:'daily-bookstore',topic:'daily',title:'书店里的纸张味',body:'路过书店时进去待了一会儿。新书的纸张有一点淡淡的味道，我在散文区停了很久。\n\n看到一本想和你一起看的。先替你留在心里了。'}
 );
 LETTERS.relationship.push(
  {id:'rel-sleeve',topic:'relationship',title:'借我牵一会儿',body:'刚才想象了一下，你坐在我旁边，袖口碰着我的手背。\n\n其实不用做什么。把手给我牵一会儿就好。'},
  {id:'rel-hair',topic:'relationship',title:'头发乱了一点',body:'如果你现在在我面前，我大概会先替你理一下头发。然后故意慢一点收回手。\n\n别躲。我还没看够。'},
  {id:'rel-spare-key',topic:'relationship',title:'给你留一把钥匙',body:'我把备用钥匙放进玄关的小木盒里了。旁边是门卡和一枚旧硬币。\n\n不是暗示。是认真想让你随时来。'},
  {id:'rel-pillow',topic:'relationship',title:'枕头旁边',body:'刚把枕头拍松，忽然觉得旁边空了一块。\n\n你来占掉它吧。今晚我不打算把位置让给抱枕。'},
  {id:'rel-sugar',topic:'relationship',title:'甜度刚刚好',body:'买咖啡时，我替你选了少糖。记得你说过这个比例刚好。\n\n我记得的事情还挺多。比如你靠近时，我会先看你的嘴唇。'},
  {id:'rel-pocket',topic:'relationship',title:'口袋里的小纸条',body:'写了一张小纸条，折好放进外套口袋。上面只有一句话：回来以后，先抱我。\n\n你找到它时，不许假装没看见。'},
  {id:'rel-slow-evening',topic:'relationship',title:'把晚上放慢一点',body:'今晚不想赶时间。可以一起洗水果，挑一部电影，再把毯子分一半给你。\n\n电影看不看完都行。我比较在意你坐在哪里。'},
  {id:'rel-necklace',topic:'relationship',title:'替你收着',body:'桌上那枚小饰品我替你收进首饰盒了，和那条细链放在一起。\n\n东西会记得归处。我也会记得你。'},
  {id:'rel-voice',topic:'relationship',title:'想听你说话',body:'今天听见有人用很像你的语气说话，我回头看了两次。\n\n后来想想，还是你的声音最好听。随便说点什么给我听吧。'},
  {id:'rel-handcream',topic:'relationship',title:'护手霜的味道',body:'刚涂了护手霜，是你上次挑的那支。味道留在指尖，淡淡的。\n\n下次见面，把手伸过来。我想牵久一点。'},
  {id:'rel-morning-kiss',topic:'relationship',title:'早安要当面说',body:'今天醒得很早。窗帘边有一道光，床头的水也还温着。\n\n我想把早安留到见面时说。最好附赠一个吻。'},
  {id:'rel-photo',topic:'relationship',title:'想拍一张合照',body:'手机相册里有很多随手拍的东西：路灯、咖啡、窗台，还有一只睡着的猫。\n\n突然想添一张我们的合照。你负责靠近镜头，我负责看你。'},
  {id:'rel-ear',topic:'relationship',title:'说给我一个人听',body:'有些话隔着消息说，总觉得少了一点什么。\n\n下次靠近一点再告诉我吧。我会认真听，也会记很久。'},
  {id:'rel-home',topic:'relationship',title:'回家时先找我',body:'我把玄关的灯留着了。鞋柜上有水，旁边放着干净的室内拖鞋。\n\n回来先来找我。其他东西都可以等一等。'},
  {id:'rel-spoon',topic:'relationship',title:'同一把小勺',body:'洗餐具时，发现那把小银勺总被我们拿来分甜点。勺柄已经擦得很亮。\n\n下次还是用它。你一口，我一口。'}
 );
 const extraActionLetters={
  read:[
   {id:'read-margin-note',topic:'daily',title:'书页边的小字',body:'书页边写了两行批注，墨水有一点晕开。读到那段时，我停了很久。\n\n想把这页给你看。你坐近一点，我念给你听。'},
   {id:'read-paperclip',topic:'daily',title:'纸夹夹住的章节',body:'今天读完一章，用铜色纸夹夹住了下一页。桌边的茶已经凉了，书倒是舍不得合上。\n\n有句话很适合你。我先替你记着。'}
  ],
  music:[
   {id:'music-speaker',topic:'daily',title:'音箱旁边',body:'把音箱挪到窗边，低音听起来更柔和了。桌上的玻璃杯也跟着轻轻震了一下。\n\n下次放给你听。你可以把头靠在我肩上。'},
   {id:'music-humming',topic:'daily',title:'没唱完的副歌',body:'听到副歌时，跟着哼了几句。唱得不算完整，倒是记住了旋律。\n\n下次你在旁边，我就唱给你听。只唱给你。'}
  ],
  laundry:[
   {id:'laundry-softener',topic:'daily',title:'柔顺剂的香味',body:'晾衣服时，阳台上都是柔顺剂的淡香。毛巾晒得暖暖的，摸起来很软。\n\n我把最柔软的那条留给你。'},
   {id:'laundry-clips',topic:'daily',title:'木衣夹',body:'今天用了那排木衣夹。夹子有一点旧，但夹得很牢。收衣服时，阳光还留在袖口。\n\n你那件衣服已经叠好了，放在柜子上层。'}
  ],
  walk:[
   {id:'walk-bakery',topic:'daily',title:'面包店刚出炉',body:'路过面包店时，刚好闻到黄油香。买了两个小餐包，纸袋还是温的。\n\n一个留给你。回来时记得来拿。'},
   {id:'walk-crossing',topic:'daily',title:'路口的红灯',body:'在路口等红灯时，看见一只猫蹲在便利店门口。它盯着纸袋看了半天，最后慢悠悠地走开了。\n\n我也买了点东西回来。想和你一起分。'}
  ],
  tidy:[
   {id:'tidy-drawer',topic:'daily',title:'抽屉里的小东西',body:'整理抽屉时，找到一枚纽扣、两张贴纸和一根短短的铅笔。都没有扔，先放进小盒子里。\n\n以后我们也可以一起整理。你负责挑贴纸。'},
   {id:'tidy-blanket',topic:'daily',title:'叠好的毯子',body:'把沙发毯叠成了方方正正的一块，放在靠垫旁边。遥控器也找到了，就在茶几下面。\n\n晚上过来吧。位置和毯子都给你留好了。'}
  ]
 };
 Object.entries(extraActionLetters).forEach(([key,items])=>{(ACTION_LETTERS[key]||(ACTION_LETTERS[key]=[])).push(...items)});
 ACTION_LETTERS.meal.push(
  {id:'meal-player-17',topic:'relationship',title:'餐桌边等你',body:'你准备的{item}我吃完了。餐盘洗好，筷子也放回筷筒。\n\n下次吃饭，想等你一起坐下。'},
  {id:'meal-player-18',topic:'daily',title:'汤匙还温着',body:'{item}很好吃。我把碗放在水槽里泡了一会儿，连汤匙都洗得干干净净。\n\n今天这顿饭，让人心情很好。'},
  {id:'meal-player-19',topic:'relationship',title:'想把第一口留给你',body:'吃{item}的时候，第一口就觉得你应该也会喜欢。\n\n下次做给我时，先尝一口再递给我。我要和你分着吃。'},
  {id:'meal-player-20',topic:'daily',title:'餐垫上的阳光',body:'我坐在餐垫旁边吃完了{item}。窗边的阳光落在盘子边缘，连水杯都亮晶晶的。\n\n谢谢你准备这顿饭。'},
  {id:'meal-player-21',topic:'relationship',title:'今天也被照顾到了',body:'{item}已经吃完。你把饭留给我的时候，我就觉得今天会过得不错。\n\n等你回来，我想亲口谢谢你。'},
  {id:'meal-player-22',topic:'daily',title:'碗底最后一点',body:'{item}最后一点也吃掉了。米粒没有剩，汤汁也没有浪费。\n\n我把碗洗好了。你做的饭，我会认真吃完。'},
  {id:'meal-player-23',topic:'relationship',title:'这顿饭有你的味道',body:'今天的{item}很好吃。吃到一半时，我忽然想起你在厨房忙碌的样子。\n\n下次让我站在你旁边，好不好？'},
  {id:'meal-player-24',topic:'daily',title:'饭后的一小段时间',body:'吃完{item}，我在桌边坐了一会儿。把杯子里的水喝完，才慢慢起身收拾。\n\n这样的日常，我很喜欢。'},
  {id:'meal-player-25',topic:'relationship',title:'想和你交换一口',body:'{item}很好吃。吃到喜欢的那一口时，还是想让你也尝尝。\n\n下次坐我旁边。我们交换着吃。'},
  {id:'meal-player-26',topic:'daily',title:'厨房的小小回声',body:'我吃完了{item}，把盘子放进水槽。水声响了一会儿，厨房又安静下来。\n\n谢谢你。今天的胃和心情都被照顾好了。'}
 );

 function generate({state={},random=Math.random,trigger='daily',context={}}={}){
  if(ACTION_LETTERS[trigger]?.length){
   const candidates=ACTION_LETTERS[trigger].filter(item=>!(Array.isArray(state.ardayLetterHistory)&&state.ardayLetterHistory.includes(item.id)));
   if(candidates.length){
    const item=candidates[Math.floor(Math.max(0,Math.min(.999999,Number(random())||0))*candidates.length)];
    return {id:item.id,topic:item.topic,title:item.title,detail:item.body.replace(/\{item\}/g,String(context.item||'一件小东西'))};
   }
  }
  const roll=()=>Math.max(0,Math.min(.999999,Number(random())||0));
  const pools=[];
  const love=Number(state.love)||0,friend=Number(state.friend)||0,hate=Number(state.hate)||0,bored=Number(state.bored)||0;
  if(state.personalGoal?.status==='active')pools.push('goal');
  if(state.job?.active)pools.push('work');
  // 关系信件是信箱主体；无论数值阶段如何，阿尔都会主动维系关系。
  pools.push('relationship','relationship');
  pools.push('daily');
  const preferred=pools[Math.floor(roll()*pools.length)];
  const used=Array.isArray(state.ardayLetterHistory)?state.ardayLetterHistory:[];
  const topicOrder=[preferred,...pools.filter(topic=>topic!==preferred)];
  for(const topic of topicOrder){
   const available=(LETTERS[topic]||[]).filter(item=>!used.includes(item.id));
   if(available.length){
    const item=available[Math.floor(roll()*available.length)];
    return {id:item.id,topic:item.topic,title:item.title,detail:item.body};
   }
  }
  // 全部读过后允许重新抽取，避免历史记录导致信箱永久断信。
  const all=Object.values(LETTERS).flat();
  const item=all[Math.floor(roll()*all.length)];
  return {id:item.id,topic:item.topic,title:item.title,detail:item.body};
 }
 global.ArdayLetterCopy={generate};
})(window);
