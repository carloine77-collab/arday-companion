window.ArdayGameConfig = {
  shopCatalog: {
 '食物食材':[['点心','🥐','buy-food','12'],['大米 ×1','🍚','buy-ingredient-rice','8'],['鸡蛋 ×1','🥚','buy-ingredient-egg','3'],['蔬菜 ×1','🥬','buy-ingredient-vegetable','6'],['番茄 ×1','🍅','buy-ingredient-tomato','4']],
 furnitureCategories:{
  '起居空间':{
   '沙发':[['沙发·亚麻燕麦','▰','buy-furniture-sofa-linen','1180',''],['沙发·雾蓝绒布','▰','buy-furniture-sofa-blue','1480',''],['沙发·复古高背','▰','buy-furniture-sofa','880','']],
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
   '灯具':[['台灯·蘑菇','◉','buy-bedroom-lamp','180',''],['台灯·陶瓷折线','◉','buy-bedroom-lamp-ceramic','220',''],['壁灯·黄铜双臂','◉','buy-bedroom-wall-lamp','260',''],['壁灯·单臂','◉','buy-bedroom-wall-lamp-single','190',''],['吊灯·乳白玻璃','◉','buy-bedroom-ceiling-lamp','420',''],['吊灯·锥形金属','◉','buy-bedroom-ceiling-lamp-metal','360','']],
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
  activityMeta: {
 rest:{title:'休息',location:'sofa',pose:'sit',effect:{energy:10,fun:1}},
 sleep:{title:'睡觉',location:'bed',pose:'sleep',effect:{energy:13,hunger:-1}},
 eat:{title:'吃东西',location:'table',pose:'sit',effect:{hunger:18,energy:1}},
 food:{title:'一起吃东西',location:'table',pose:'sit',effect:{hunger:20,fun:3}},
 wash:{title:'洗漱',location:'window',pose:'walk',effect:{clean:17,energy:-1}},
 read:{title:'阅读',location:'desk',pose:'sit',effect:{fun:8,energy:-2}},
 chat:{title:'聊天',location:'sofa',pose:'sit',effect:{fun:3,energy:0}},
 computerWork:{title:'使用电脑工作',location:'desk',pose:'sit',effect:{energy:-4,fun:-1}},
 computerPlay:{title:'用电脑玩游戏',location:'desk',pose:'sit',effect:{fun:9,energy:-3}},
 bouquet:{title:'欣赏花束',location:'center',pose:'wave',effect:{fun:3}},
 music:{title:'听音乐',location:'table',pose:'sit',effect:{fun:10,energy:-1}},
 tea:{title:'一起喝茶',location:'table',pose:'sit',effect:{fun:4,hunger:2}},
 walk:{title:'散步',location:'outside',pose:'walk',effect:{fun:9,energy:-5,clean:-1}},
 game:{title:'玩游戏',location:'rug',pose:'wave',effect:{fun:11,energy:-3}},
 company:{title:'自由相处',location:'sofa',pose:'sit',effect:{fun:4}},
 sitChair:{title:'坐在椅子上',location:'chair',pose:'sit',effect:{energy:5,fun:1}},
 tidy:{title:'整理房间',location:'shelf',pose:'walk',effect:{clean:8,energy:-3}},
 write:{title:'写作 / 整理资料',location:'desk',pose:'sit',effect:{fun:5,energy:-3}},
 work:{title:'工作',location:'desk',pose:'sit',effect:{energy:-4,fun:-1}},
 cook:{title:'准备做饭',location:'kitchen',pose:'walk',effect:{energy:-2}},
 cookTogether:{title:'一起做饭',location:'kitchen',pose:'walk',effect:{energy:-2,fun:2}}
},
  recipes: {eggRice:{name:'蛋炒饭',ingredients:{rice:1,egg:1},hunger:30},tomatoEgg:{name:'番茄炒蛋',ingredients:{tomato:1,egg:2},hunger:28},vegetableSoup:{name:'蔬菜汤',ingredients:{vegetable:2},hunger:22}},
  ingredientNames: {rice:'大米',egg:'鸡蛋',vegetable:'蔬菜',tomato:'番茄'}
};
