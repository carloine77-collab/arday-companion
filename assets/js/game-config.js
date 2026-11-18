window.ArdayGameConfig = {
  shopCatalog: {
 '食物食材':[['点心','🥐','buy-food','12'],['大米 ×1','🍚','buy-ingredient-rice','8'],['鸡蛋 ×1','🥚','buy-ingredient-egg','3'],['蔬菜 ×1','🥬','buy-ingredient-vegetable','6'],['番茄 ×1','🍅','buy-ingredient-tomato','4']],
 furnitureCategories:{
  '起居空间':{
   '沙发':[['沙发·亚麻燕麦','▰','buy-furniture-sofa-linen','1180',''],['沙发·雾蓝绒布','▰','buy-furniture-sofa-blue','1480',''],['沙发·复古高背','▰','buy-furniture-sofa','880','']],
   '电视':[['电视','▣','buy-furniture-television','1680','可观看电视节目，改善娱乐状态']],
   '唱片机':[['唱片机','♫','buy-furniture-record-player','980','播放唱片，适合安静地听音乐']],
   '餐桌':[['餐桌','▱','buy-furniture-dining-table','680','用餐与日常摆放'],['餐桌·浅橡木长桌','▱','buy-furniture-dining-table-oak','820','']]
  },
  '卧室':{
   '床':[['床·胡桃木软包','▰','buy-bedroom-bed','1600','卧室核心家具'],['床·浅橡木框架','▰','buy-bedroom-bed-oak','1780','']],
   '床头柜':[['床头柜','▤','buy-bedroom-nightstand','260','床边收纳']],
   '衣柜':[['衣柜','▥','buy-bedroom-wardrobe','980','双开门衣柜']]
  },
  '厨房':{
   '灶台':[['灶台·复古珐琅','▦','buy-kitchen-stove-enamel','980','复古珐琅'],['灶台·不锈钢','▦','buy-kitchen-stove-steel','720','不锈钢'],['灶台·奶油陶瓷','▦','buy-kitchen-stove-cream','1080','奶油陶瓷']],
   '橱柜':[['橱柜','▤','buy-kitchen-cabinets','1100','厨房地柜']],
   '吊柜':[['吊柜','▥','buy-kitchen-wall-cabinet','620','墙面收纳']],
   '冰箱':[['冰箱','▯','buy-kitchen-fridge','1500','双层冰箱']],
   '水槽':[['水槽','▱','buy-kitchen-sink','580','带龙头水槽']]
  },
  '书房':{
   '书桌':[['书桌·经典书桌','▱','buy-furniture-desk','480','阅读与工作桌'],['书桌·抽屉工作台','▱','buy-furniture-desk-drawer','620','']],
   '书架':[['书架·开放格架','▤','buy-furniture-bookshelf','520','多层书架'],['书架·玻璃门书柜','▤','buy-furniture-bookshelf-glass','760','']],
   '电脑':[['电脑','▣','buy-furniture-computer','1200','可自由摆放']]
  },
  '通用家具':{
   '地毯':[['地毯·波斯绛红','▤','buy-furniture-rug-persian','680','传统纹样'],['地毯·奶油棋盘','▤','buy-furniture-rug-checker','360','棋盘格'],['地毯·海盐蓝','▤','buy-furniture-rug-sea','520','蓝白条纹'],['地毯·卧室款','▧','buy-bedroom-rug','320','浅色卧室款']],
   '椅子':[['椅子·温莎木椅','▰','buy-furniture-chair','180',''],['椅子·软包扶手椅','▰','buy-furniture-dining-chair','220',''],['椅子·藤编餐椅','▰','buy-furniture-chair-rattan','240','']],
   '灯具':[['台灯·蘑菇','◉','buy-bedroom-lamp','180',''],['台灯·陶瓷折线','◉','buy-bedroom-lamp-ceramic','220',''],['壁灯·黄铜双臂','◉','buy-bedroom-wall-lamp','260',''],['壁灯·单臂','◉','buy-bedroom-wall-lamp-single','190',''],['吊灯·乳白玻璃','◉','buy-bedroom-ceiling-lamp','420',''],['吊灯·锥形金属','◉','buy-bedroom-ceiling-lamp-metal','360',''],['落地灯·纸罩','◉','buy-floor-lamp-paper','520','柔和漫射光'],['落地灯·黄铜弧形','◉','buy-floor-lamp-arc','680','弧形黄铜灯杆与暖光灯罩']],
   '绿植':[['棕榈树绿植','♧','buy-furniture-palm','150','室内观叶植物']],
   '壁画':[['壁画','▧','buy-furniture-art','180','墙面装饰']],
   '隔断':[['隔断','▥','buy-furniture-divider','360','空间分隔']],
   '摆件':[['捧花摆件','✿','buy-furniture-bouquet','120','花束摆件']]
  },
  '墙面与地面':{
   '墙纸':[['暖白石膏墙纸','▤','buy-wallpaper-warm-white','0','默认暖白墙面，全屋应用'],['深海蓝墙纸','▤','buy-wallpaper-deepblue','380','深海蓝，全屋应用'],['雾灰墙纸','▤','buy-wallpaper-mist','320','雾灰色，全屋应用']],
   '地板':[['石墨水泥地板','▧','buy-floor-concrete','460','当前房间'],['深色 terrazzo 地板','▧','buy-floor-terrazzo','520','当前房间']]
  }
 }

},
  characterStats: {
   personalityTraits: ['洞察人心','从容不羁','疏离矜贵','聪敏自持'],
   energy: {
    hourlyDecay: 0.45,
    sleepRecoveryPerHour: 13,
    minimumSleepHours: 1,
    maximumSleepHours: 8,
    activityEffects: {
     rest:10, eat:1, wash:-1, read:-2, chat:0, computerWork:-4,
     computerPlay:-3, watchTV:-2, listenRecords:-1, music:-1, walk:-5, game:-3, write:-3, work:-4,
     sitChair:5, food:0, tea:0, company:0
    }
   },
   needs: { hungerHourlyDecay:0.8, cleanHourlyDecay:0.25, funHourlyDecay:0.3 }
  },
  activityMeta: {
 rest:{title:'休息',playerSelectable:true,playerIcon:'☁',autonomous:true,autonomy:{need:'energy',threshold:62,weight:1.65},requires:'seat',menuLabel:'休息',location:'sofa',pose:'sit',anchor:'sofa',effect:{fun:1}},
 sleep:{title:'睡觉',autonomous:false,menuLabel:'睡觉',location:'bed',pose:'sleep',anchor:'bed',effect:{hunger:-1}},
 eat:{title:'吃东西',autonomous:false,menuLabel:'用餐',location:'table',pose:'sit',anchor:'table',effect:{hunger:18}},
 food:{title:'一起吃东西',autonomous:false,menuLabel:'一起吃东西',location:'table',pose:'sit',anchor:'table',effect:{hunger:20,fun:3}},
 wash:{title:'洗漱',autonomous:true,autonomy:{need:'clean',threshold:60,weight:1.35},requires:'sink',menuLabel:'洗漱',location:'window',pose:'walk',anchor:'default',effect:{clean:17}},
 read:{title:'阅读',playerSelectable:true,playerIcon:'📖',autonomous:true,autonomy:{need:'fun',threshold:58,weight:.9},requires:'readingSpot',menuLabel:'阅读',location:'desk',pose:'sit',anchor:'shelf',effect:{fun:8}},
 chat:{title:'聊天',playerSelectable:true,playerIcon:'💬',autonomous:true,autonomy:{need:'friend',threshold:48,weight:.42,base:1},requires:'seat',menuLabel:'聊天',location:'sofa',pose:'sit',anchor:'sofa',effect:{fun:3}},
 computerWork:{title:'使用电脑工作',autonomous:false,menuLabel:'电脑工作',location:'desk',pose:'sit',anchor:'desk',effect:{fun:-1}},
 computerPlay:{title:'用电脑玩游戏',playerSelectable:true,playerIcon:'▣',autonomous:true,autonomy:{need:'fun',threshold:54,weight:1.05},requires:'computer',menuLabel:'电脑游戏',location:'desk',pose:'sit',anchor:'desk',effect:{fun:9}},
 watchTV:{title:'看电视',playerSelectable:true,playerIcon:'▣',autonomous:true,autonomy:{need:'fun',threshold:66,weight:1.05},requires:'television',menuLabel:'看电视',location:'sofa',pose:'sit',anchor:'sofa',effect:{fun:14}},
 listenRecords:{title:'听唱片',playerSelectable:true,playerIcon:'♫',autonomous:true,autonomy:{need:'fun',threshold:62,weight:.95},requires:'recordPlayer',menuLabel:'听唱片',location:'sofa',pose:'sit',anchor:'sofa',effect:{fun:12}},
 music:{title:'听音乐',autonomous:true,autonomy:{need:'fun',threshold:64,weight:.9},menuLabel:'听音乐',location:'table',pose:'sit',anchor:'table',effect:{fun:10}},
 tea:{title:'一起喝茶',playerSelectable:true,autonomous:false,menuLabel:'一起喝茶',location:'table',pose:'sit',anchor:'table',effect:{fun:5,hunger:2}},
 walk:{title:'散步',playerSelectable:true,playerIcon:'🌿',autonomous:true,autonomy:{need:'fun',threshold:60,weight:.18,base:2},menuLabel:'外出',location:'outside',pose:'walk',anchor:'default',effect:{fun:9,clean:-1}},
 game:{title:'玩游戏',autonomous:false,menuLabel:'玩游戏',location:'rug',pose:'wave',anchor:'default',effect:{fun:11}},
 company:{title:'自由相处',autonomous:false,menuLabel:'自由相处',location:'sofa',pose:'sit',anchor:'sofa',effect:{fun:4}},
 sitChair:{title:'坐在椅子上',autonomous:false,menuLabel:'坐下',location:'chair',pose:'sit',anchor:'chair',effect:{fun:1}},

 write:{title:'写作 / 整理资料',autonomous:true,autonomy:{need:'fun',threshold:58,weight:.28,base:10},requires:'desk',menuLabel:'写作',location:'desk',pose:'sit',anchor:'desk',effect:{fun:5}},
 work:{title:'工作',autonomous:false,menuLabel:'工作',location:'desk',pose:'sit',anchor:'desk',effect:{fun:-1}}
},
  furnitureActivities: {
 sofa:{title:'沙发',activities:{rest:{anchor:'sofa'},chat:{anchor:'sofa'},watchTV:{anchor:'sofa'},listenRecords:{anchor:'sofa'}}},
 dining:{title:'餐桌',activities:{tea:{anchor:'table'},chat:{anchor:'table'}}},
 fridge:{title:'冰箱',action:'kitchen'},
 stove:{title:'灶台',action:'kitchen'},
 sink:{title:'水槽',activities:{wash:{anchor:'default'}}},
 bed:{title:'床',activities:{rest:{anchor:'bed'},read:{anchor:'bed'}}},
 chair:{title:'椅子',activities:{sitChair:{anchor:'chair'},read:{anchor:'chair'},chat:{anchor:'chair'}}},
 bookshelf:{title:'书架',activities:{read:{anchor:'shelf'}}},
 desk:{title:'书桌',activities:{read:{anchor:'desk'},write:{anchor:'desk'},computerPlay:{anchor:'desk'}}},
 computer:{title:'电脑',activities:{computerPlay:{anchor:'desk'},write:{anchor:'desk'}}},
 television:{title:'电视',activities:{watchTV:{anchor:'sofa'}}},
 recordPlayer:{title:'唱片机',activities:{listenRecords:{anchor:'sofa'}}},

 },
   recipes: {eggRice:{name:'蛋炒饭',ingredients:{rice:1,egg:1},hunger:30},tomatoEgg:{name:'番茄炒蛋',ingredients:{tomato:1,egg:2},hunger:28},vegetableSoup:{name:'蔬菜汤',ingredients:{vegetable:2},hunger:22}},
  ingredientNames: {rice:'大米',egg:'鸡蛋',vegetable:'蔬菜',tomato:'番茄'}
};
