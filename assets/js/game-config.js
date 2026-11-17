window.ArdayGameConfig = {
  shopCatalog: {
 '食物食材':[['点心','🥐','buy-food','12'],['大米 ×1','🍚','buy-ingredient-rice','8'],['鸡蛋 ×1','🥚','buy-ingredient-egg','3'],['蔬菜 ×1','🥬','buy-ingredient-vegetable','6'],['番茄 ×1','🍅','buy-ingredient-tomato','4']],
 '家具':[['地毯','▤','buy-furniture-rug','260'],['沙发','▰','buy-furniture-sofa','880'],['壁画','▧','buy-furniture-art','180'],['隔断','▥','buy-furniture-divider','360'],['棕榈树绿植','♧','buy-furniture-palm','150'],['书架','▤','buy-furniture-bookshelf','520'],['书桌','▱','buy-furniture-desk','480'],['椅子','▰','buy-furniture-chair','180'],['电脑','▣','buy-furniture-computer','1200'],['餐桌','▱','buy-furniture-dining-table','680'],['餐桌椅','▰','buy-furniture-dining-chair','220'],['捧花摆件','✿','buy-furniture-bouquet','120']],
 '卧室家具':[['床','▰','buy-bedroom-bed','1600'],['床头柜','▤','buy-bedroom-nightstand','260'],['床头灯','◉','buy-bedroom-lamp','180'],['衣柜','▥','buy-bedroom-wardrobe','980'],['卧室地毯','▧','buy-bedroom-rug','320']],
 '厨房家具':[['橱柜','▤','buy-kitchen-cabinets','1100'],['吊柜','▥','buy-kitchen-wall-cabinet','620'],['冰箱','▯','buy-kitchen-fridge','1500'],['灶台','▦','buy-kitchen-stove','720'],['水槽','▱','buy-kitchen-sink','580']],
 '壁纸与地板':[['深海蓝墙纸','▤','buy-wallpaper-deepblue','380'],['雾灰墙纸','▤','buy-wallpaper-mist','320'],['石墨水泥地板','▧','buy-floor-concrete','460'],['深色 terrazzo 地板','▧','buy-floor-terrazzo','520']]
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
